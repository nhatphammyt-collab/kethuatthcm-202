// Firebase service functions for game operations

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { Room, Question, GameLog, Player, EventType } from '../../types/game';
import { DEFAULT_SETTINGS, DEFAULT_REWARDS, ALL_EVENT_TYPES } from '../../types/game';
import { generateRoomCode, shuffleArray, calculateEventTimes } from '../../utils/gameHelpers';

// Collections
const ROOMS_COLLECTION = 'rooms';
const QUESTIONS_COLLECTION = 'questions';
const GAME_LOGS_COLLECTION = 'gameLogs';

// ============================================
// QUESTIONS CACHE - Tối ưu Firebase reads
// ============================================
let cachedQuestions: Question[] = [];
let questionsLastFetched: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút cache

/**
 * Load questions to cache (gọi 1 lần khi game bắt đầu)
 * Tiết kiệm ~150,000 reads/game!
 */
export async function loadQuestionsToCache(): Promise<void> {
  const now = Date.now();
  // Skip nếu cache vẫn còn hiệu lực
  if (cachedQuestions.length > 0 && (now - questionsLastFetched) < CACHE_DURATION) {
    console.log('[Cache] Questions cache còn hiệu lực, bỏ qua fetch');
    return;
  }
  
  try {
    console.log('[Cache] Loading questions từ Firebase...');
    const questionsRef = collection(db, QUESTIONS_COLLECTION);
    const snapshot = await getDocs(questionsRef);
    
    cachedQuestions = snapshot.docs.map((doc) => ({
      questionId: doc.id,
      ...doc.data(),
    })) as Question[];
    
    questionsLastFetched = now;
    console.log(`[Cache] ✅ Đã load ${cachedQuestions.length} câu hỏi vào cache`);
  } catch (error) {
    console.error('[Cache] ❌ Lỗi khi load questions:', error);
  }
}

/**
 * Get random question từ cache (KHÔNG gọi Firebase!)
 */
export function getRandomQuestionFromCache(): Question | null {
  if (cachedQuestions.length === 0) {
    console.warn('[Cache] Cache trống! Gọi loadQuestionsToCache() trước.');
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * cachedQuestions.length);
  return cachedQuestions[randomIndex];
}

/**
 * Check xem cache đã được load chưa
 */
export function isQuestionsCacheLoaded(): boolean {
  return cachedQuestions.length > 0;
}

/**
 * Create a new game room
 */
export async function createRoom(adminId: string, settings?: Partial<Room['settings']>): Promise<string> {
  const roomCode = generateRoomCode();
  const roomId = doc(collection(db, ROOMS_COLLECTION)).id;
  
  // Shuffle events
  const shuffledEvents = shuffleArray([...ALL_EVENT_TYPES]);
  const eventTimes = calculateEventTimes(
    settings?.gameDuration || DEFAULT_SETTINGS.gameDuration,
    settings?.totalEvents || DEFAULT_SETTINGS.totalEvents
  );
  
  const roomData: Omit<Room, 'roomId'> = {
    roomCode,
    adminId,
    status: 'waiting',
    createdAt: serverTimestamp(),
    startedAt: null,
    endedAt: null,
    settings: {
      ...DEFAULT_SETTINGS,
      ...settings,
    },
    rewards: { ...DEFAULT_REWARDS },
    players: {},
    currentQuestion: {
      questionId: null,
      question: null,
      options: null,
      correctAnswer: null,
      answeredBy: [],
    },
    leaderboard: {},
    events: {
      activeEvent: {
        type: null,
        startedAt: null,
        duration: 0,
        data: {},
      },
      eventHistory: [],
      remainingEvents: shuffledEvents,
    },
  };
  
  await setDoc(doc(db, ROOMS_COLLECTION, roomId), roomData);
  
  // Log room creation
  await logGameAction(roomId, adminId, 'join', { action: 'create_room', roomCode });
  
  return roomId;
}

/**
 * Get room by room code
 */
export async function getRoomByCode(roomCode: string): Promise<Room | null> {
  const q = query(collection(db, ROOMS_COLLECTION), where('roomCode', '==', roomCode));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const doc = querySnapshot.docs[0];
  return { roomId: doc.id, ...doc.data() } as Room;
}

/**
 * Get room by room ID
 */
export async function getRoomById(roomId: string): Promise<Room | null> {
  const docRef = doc(db, ROOMS_COLLECTION, roomId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { roomId: docSnap.id, ...docSnap.data() } as Room;
}

/**
 * Join room as a player
 */
export async function joinRoom(roomId: string, playerId: string, playerName: string): Promise<boolean> {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    
    await runTransaction(db, async (transaction) => {
      const roomSnap = await transaction.get(roomRef);
      
      if (!roomSnap.exists()) {
        throw new Error('Room not found');
      }
      
      const room = roomSnap.data() as Room;
      
      // Check if room is full
      const currentPlayers = Object.keys(room.players || {}).length;
      if (currentPlayers >= room.settings.maxPlayers) {
        throw new Error('Room is full');
      }
      
      // Check if room is still waiting
      if (room.status !== 'waiting') {
        throw new Error('Game has already started');
      }
      
      // Check if player name already exists
      const existingPlayer = Object.values(room.players || {}).find(
        (p) => p.name.toLowerCase() === playerName.toLowerCase()
      );
      if (existingPlayer) {
        throw new Error('Player name already taken');
      }
      
      // Add player
      const newPlayer: Player = {
        name: playerName,
        position: 0,
        absolutePosition: 0, // Track absolute position for animation
        score: 0,
        diceRolls: 0,
        freeDiceRolls: 0,
        bonusMultiplier: 1,
        joinedAt: serverTimestamp(),
        eventEffects: {
          diceDouble: false,
          scoreDouble: false,
          noScore: false,
        },
      };
      
      transaction.update(roomRef, {
        [`players.${playerId}`]: newPlayer,
      });
    });
    
    // Log join action
    await logGameAction(roomId, playerId, 'join', { playerName });
    
    return true;
  } catch (error) {
    console.error('Error joining room:', error);
    return false;
  }
}

/**
 * Start game (admin only)
 */
export async function startGame(roomId: string, adminId: string): Promise<boolean> {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const room = await getRoomById(roomId);
    
    if (!room || room.adminId !== adminId) {
      return false;
    }
    
    if (room.status !== 'waiting') {
      return false;
    }
    
    await updateDoc(roomRef, {
      status: 'playing',
      startedAt: serverTimestamp(),
    });
    
    await logGameAction(roomId, adminId, 'event', { action: 'game_started' });
    
    return true;
  } catch (error) {
    console.error('Error starting game:', error);
    return false;
  }
}

/**
 * Subscribe to room changes (real-time)
 */
export function subscribeToRoom(
  roomId: string,
  callback: (room: Room | null) => void
): () => void {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      callback({ roomId: doc.id, ...doc.data() } as Room);
    } else {
      callback(null);
    }
  });
}

/**
 * ⚡ HYBRID OPTIMIZATION: Subscribe chỉ events (real-time)
 * Giảm reads bằng cách chỉ subscribe events thay vì toàn bộ room
 */
export function subscribeToEvents(
  roomId: string,
  callback: (activeEvent: Room['events']['activeEvent'] | null) => void
): () => void {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      const roomData = doc.data() as Room;
      callback(roomData.events?.activeEvent || null);
    } else {
      callback(null);
    }
  });
}

/**
 * Log game action
 */
export async function logGameAction(
  roomId: string,
  playerId: string,
  action: GameLog['action'],
  data: any
): Promise<void> {
  const logRef = doc(collection(db, GAME_LOGS_COLLECTION));
  await setDoc(logRef, {
    roomId,
    playerId,
    action,
    data,
    timestamp: serverTimestamp(),
  });
}

/**
 * Get random question - Sử dụng cache thay vì fetch từ Firebase mỗi lần
 * Nếu cache trống, tự động load từ Firebase (fallback)
 */
export async function getRandomQuestion(): Promise<Question | null> {
  try {
    // Đảm bảo cache đã được load
    if (!isQuestionsCacheLoaded()) {
      await loadQuestionsToCache();
    }
    
    // Lấy từ cache (không gọi Firebase!)
    return getRandomQuestionFromCache();
  } catch (error) {
    console.error('Error getting random question:', error);
    return null;
  }
}

/**
 * Roll dice and update player position
 */
export async function rollDice(roomId: string, playerId: string): Promise<number | null> {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    
    return await runTransaction(db, async (transaction) => {
      const roomSnap = await transaction.get(roomRef);
      
      if (!roomSnap.exists()) {
        throw new Error('Room not found');
      }
      
      const room = roomSnap.data() as Room;
      const player = room.players?.[playerId];
      
      if (!player) {
        throw new Error('Player not found');
      }
      
      // Check if player has dice rolls available
      const totalRolls = (player.diceRolls || 0) + (player.freeDiceRolls || 0);
      if (totalRolls <= 0) {
        throw new Error('No dice rolls available');
      }
      
      // ⚡ Check dice cooldown (7 giây)
      const diceCooldown = room.settings.diceCooldown || 7;
      if (player.lastDiceRollTime) {
        let lastRollTime: Date;
        if (player.lastDiceRollTime.toDate) {
          lastRollTime = player.lastDiceRollTime.toDate();
        } else if (player.lastDiceRollTime instanceof Date) {
          lastRollTime = player.lastDiceRollTime;
        } else {
          lastRollTime = new Date(player.lastDiceRollTime);
        }
        
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - lastRollTime.getTime()) / 1000);
        const remainingCooldown = diceCooldown - elapsedSeconds;
        
        if (remainingCooldown > 0) {
          throw new Error(`COOLDOWN_${remainingCooldown}`);
        }
      }
      
      // Roll dice (1-6)
      const diceResult = Math.floor(Math.random() * 6) + 1;
      
      // Apply dice double event if active
      const finalDiceResult = player.eventEffects?.diceDouble 
        ? diceResult * 2 
        : diceResult;
      
      // Calculate new position (loop at 24)
      // Use absolutePosition if available, otherwise calculate from position
      const currentAbsolute = player.absolutePosition ?? (player.position + (Math.floor((player.position || 0) / 24) * 24));
      const newAbsolutePosition = currentAbsolute + finalDiceResult;
      const newPosition = newAbsolutePosition % 24;
      
      // Calculate score (1 point per tile moved)
      const tilesMoved = finalDiceResult;
      const scoreMultiplier = player.eventEffects?.scoreDouble ? 2 : 1;
      let scoreBonus = player.eventEffects?.noScore ? 0 : tilesMoved * scoreMultiplier;
      
      // Check for low_dice_penalty event (check original diceResult, not finalDiceResult)
      if (room.events?.activeEvent?.type === 'low_dice_penalty' && diceResult < 5) {
        scoreBonus = Math.max(0, scoreBonus - 3);
      }
      
      const newScore = Math.max(0, (player.score || 0) + scoreBonus);
      
      // Update dice rolls (use freeDiceRolls first, then diceRolls)
      let newDiceRolls = player.diceRolls || 0;
      let newFreeDiceRolls = player.freeDiceRolls || 0;
      
      if (newFreeDiceRolls > 0) {
        newFreeDiceRolls -= 1;
      } else if (newDiceRolls > 0) {
        newDiceRolls -= 1;
      }
      
      // Không reset diceDouble, để event kéo dài 45 giây (đã giảm từ 75s)
      // diceDouble sẽ được reset khi event kết thúc trong endActiveEvent
      const eventEffects = {
        ...player.eventEffects,
        // diceDouble giữ nguyên để có thể dùng nhiều lần trong 75s
      };
      
      // Update player in Firestore
      transaction.update(roomRef, {
        [`players.${playerId}.position`]: newPosition,
        [`players.${playerId}.absolutePosition`]: newAbsolutePosition,
        [`players.${playerId}.score`]: newScore,
        [`players.${playerId}.diceRolls`]: newDiceRolls,
        [`players.${playerId}.freeDiceRolls`]: newFreeDiceRolls,
        [`players.${playerId}.eventEffects`]: eventEffects,
        [`players.${playerId}.lastDiceRollTime`]: serverTimestamp(), // ⚡ Update cooldown timer
      });
      
      // ⚡ TỐI ƯU: Bỏ leaderboard update sau mỗi roll
      // useEventManager đã handle việc update leaderboard định kỳ (30s)
      // Tiết kiệm ~1,500 writes/game!
      
      // ⚡ TỐI ƯU: Bỏ dice logs
      // Không cần log mỗi lần roll, tiết kiệm ~1,500 writes/game!
      // Chỉ giữ logs quan trọng: join, reward, event
      
      return finalDiceResult;
    });
  } catch (error: any) {
    // ⚡ Handle cooldown error - pass through để UI hiển thị
    if (error?.message?.startsWith('COOLDOWN_')) {
      throw error; // Re-throw để GameBoard có thể catch và hiển thị
    }
    console.error('Error rolling dice:', error);
    return null;
  }
}

/**
 * Update player position (for manual updates if needed)
 */
export async function updatePlayerPosition(
  roomId: string,
  playerId: string,
  newPosition: number,
  scoreBonus: number = 0
): Promise<boolean> {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    
    await runTransaction(db, async (transaction) => {
      const roomSnap = await transaction.get(roomRef);
      
      if (!roomSnap.exists()) {
        throw new Error('Room not found');
      }
      
      const room = roomSnap.data() as Room;
      const player = room.players?.[playerId];
      
      if (!player) {
        throw new Error('Player not found');
      }
      
      const scoreMultiplier = player.eventEffects?.scoreDouble ? 2 : 1;
      const finalScoreBonus = player.eventEffects?.noScore ? 0 : scoreBonus * scoreMultiplier;
      const newScore = Math.max(0, (player.score || 0) + finalScoreBonus);
      
      transaction.update(roomRef, {
        [`players.${playerId}.position`]: newPosition % 24,
        [`players.${playerId}.score`]: newScore,
      });
    });
    
    return true;
  } catch (error) {
    console.error('Error updating player position:', error);
    return false;
  }
}

/**
 * Claim reward when player lands on reward tile
 */
export async function claimReward(
  roomId: string,
  playerId: string,
  rewardType: 'mysteryGiftBox' | 'pepsi' | 'cheetos' | 'candies'
): Promise<{ success: boolean; message: string }> {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    
    return await runTransaction(db, async (transaction) => {
      const roomSnap = await transaction.get(roomRef);
      
      if (!roomSnap.exists()) {
        throw new Error('Room not found');
      }
      
      const room = roomSnap.data() as Room;
      const player = room.players?.[playerId];
      
      if (!player) {
        throw new Error('Player not found');
      }
      
      const reward = room.rewards?.[rewardType];
      
      if (!reward) {
        throw new Error('Reward type not found');
      }
      
      // Check if reward is still available
      if (reward.claimed >= reward.total) {
        return {
          success: false,
          message: 'Phần thưởng này đã hết!',
        };
      }
      
      // Check if player already claimed this reward type
      if (reward.claimedBy?.includes(playerId)) {
        return {
          success: false,
          message: 'Bạn đã nhận phần thưởng này rồi!',
        };
      }
      
      // Check total reward limit per player (max 2 rewards total, including MysteryBox)
      // This allows players to compete for regular rewards while waiting for MysteryBox unlock
      const allRewards = room.rewards || {};
      const allRewardTypes: Array<'mysteryGiftBox' | 'pepsi' | 'cheetos' | 'candies'> = ['mysteryGiftBox', 'pepsi', 'cheetos', 'candies'];
      
      // Count how many rewards (all types) this player has claimed
      let playerClaimedCount = 0;
      allRewardTypes.forEach(type => {
        if (allRewards[type]?.claimedBy?.includes(playerId)) {
          playerClaimedCount++;
        }
      });
      
      // Limit: max 2 rewards total per player (including MysteryBox)
      if (playerClaimedCount >= 2) {
        console.log('[claimReward] Player reward limit reached:', {
          playerId,
          playerClaimedCount,
          rewardType,
        });
        return {
          success: false,
          message: 'Bạn đã nhận đủ 2 phần thưởng rồi! Hãy để cơ hội cho người khác nhé! 🎁',
        };
      }
      
      // Check time-based unlock for all rewards with unlockTimes (progressive unlock)
      // Applies to MysteryBox, Pepsi, Cheetos, and Candies
      if (reward.unlockTimes && reward.unlockTimes.length > 0) {
        if (!room.startedAt) {
          console.warn('[claimReward] Unlock check: Game chưa bắt đầu', { rewardType });
          return {
            success: false,
            message: 'Game chưa bắt đầu!',
          };
        }
        
        // Calculate elapsed time since game started (in seconds)
        // Handle both Firestore Timestamp and Date objects
        let startedAt: Date;
        if (room.startedAt.toDate) {
          startedAt = room.startedAt.toDate();
        } else if (room.startedAt instanceof Date) {
          startedAt = room.startedAt;
        } else {
          startedAt = new Date(room.startedAt);
        }
        
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
        
        // Check how many rewards are unlocked based on elapsed time
        // unlockedCount = số unlockTimes <= elapsedSeconds
        const unlockedCount = reward.unlockTimes.filter(unlockTime => elapsedSeconds >= unlockTime).length;
        
        // Debug logging for verification
        console.log('[claimReward] Unlock check:', {
          rewardType,
          unlockTimes: reward.unlockTimes,
          elapsedSeconds,
          unlockedCount,
          claimed: reward.claimed,
          total: reward.total,
          canClaim: reward.claimed < unlockedCount,
        });
        
        // Only allow claiming if there are unlocked rewards available
        if (reward.claimed >= unlockedCount) {
          const nextUnlockTime = reward.unlockTimes.find(time => elapsedSeconds < time);
          if (nextUnlockTime) {
            const secondsLeft = nextUnlockTime - elapsedSeconds;
            const minutesLeft = Math.floor(secondsLeft / 60);
            const remainingSeconds = secondsLeft % 60;
            
            // Format message: "X phút Y giây" hoặc chỉ "X phút" nếu < 1 phút
            let timeMessage = '';
            if (minutesLeft > 0) {
              if (remainingSeconds > 0) {
                timeMessage = `${minutesLeft} phút ${remainingSeconds} giây`;
              } else {
                timeMessage = `${minutesLeft} phút`;
              }
            } else {
              timeMessage = `${remainingSeconds} giây`;
            }
            
            const rewardName = getRewardName(rewardType);
            
            console.log('[claimReward] Reward locked:', {
              rewardType,
              rewardName,
              nextUnlockTime,
              secondsLeft,
              timeMessage,
            });
            
            return {
              success: false,
              message: `${rewardName} tiếp theo sẽ mở sau ${timeMessage} nữa!`,
            };
          } else {
            // All rewards of this type have been unlocked, but all are claimed
            const rewardName = getRewardName(rewardType);
            console.log('[claimReward] All rewards unlocked and claimed:', { rewardType, rewardName });
            return {
              success: false,
              message: `Tất cả ${rewardName} đã được mở!`,
            };
          }
        }
        
        console.log('[claimReward] Cho phép claim:', {
          rewardType,
          unlockedCount,
          claimed: reward.claimed,
        });
      }
      
      // Claim reward atomically
      const newClaimed = reward.claimed + 1;
      const newClaimedBy = [...(reward.claimedBy || []), playerId];
      
      transaction.update(roomRef, {
        [`rewards.${rewardType}.claimed`]: newClaimed,
        [`rewards.${rewardType}.claimedBy`]: newClaimedBy,
      });
      
      // Log reward claim
      await logGameAction(roomId, playerId, 'reward', {
        rewardType,
        rewardName: getRewardName(rewardType),
      });
      
      return {
        success: true,
        message: `Chúc mừng! Bạn đã nhận ${getRewardName(rewardType)}!`,
      };
    });
  } catch (error) {
    console.error('Error claiming reward:', error);
    return {
      success: false,
      message: 'Lỗi khi nhận phần thưởng. Vui lòng thử lại.',
    };
  }
}

/**
 * Helper function to get reward name in Vietnamese
 */
function getRewardName(rewardType: 'mysteryGiftBox' | 'pepsi' | 'cheetos' | 'candies'): string {
  const names: Record<string, string> = {
    mysteryGiftBox: 'Hộp quà bí ẩn',
    pepsi: 'Pepsi',
    cheetos: 'Bánh snack',
    candies: 'Kẹo',
  };
  return names[rewardType] || rewardType;
}

/**
 * Trigger an event in the game
 */
export async function triggerEvent(
  roomId: string,
  eventType: EventType,
  adminId: string
): Promise<boolean> {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const room = await getRoomById(roomId);
    
    if (!room || room.adminId !== adminId) {
      return false;
    }
    
    if (room.status !== 'playing') {
      return false;
    }
    
    // Check if event is in remaining events
    if (!room.events.remainingEvents.includes(eventType)) {
      return false;
    }
    
    // ⚡ TỐI ƯU: Giảm event duration xuống 20s cho game 5 phút
    // Event ngắn hơn, tempo game nhanh hơn, tăng tính cạnh tranh
    const instantEvents: EventType[] = ['free_dice', 'lose_dice'];
    const duration = instantEvents.includes(eventType) ? 0 : 20;
    
    // Remove event from remaining events
    const remainingEvents = room.events.remainingEvents.filter(e => e !== eventType);
    
    // Apply event effects to all players
    const playersUpdate: Record<string, any> = {};
    const playerIds = Object.keys(room.players || {});
    
    switch (eventType) {
      case 'dice_double':
        // Set diceDouble for all players (will be consumed on next roll)
        playerIds.forEach(pid => {
          playersUpdate[`players.${pid}.eventEffects.diceDouble`] = true;
        });
        break;
        
      case 'score_double':
        // Set scoreDouble for all players
        playerIds.forEach(pid => {
          playersUpdate[`players.${pid}.eventEffects.scoreDouble`] = true;
        });
        break;
        
      case 'free_dice':
        // Give all players 1 free dice roll
        playerIds.forEach(pid => {
          const currentFree = room.players[pid].freeDiceRolls || 0;
          playersUpdate[`players.${pid}.freeDiceRolls`] = currentFree + 1;
        });
        break;
        
      case 'lose_dice':
        // Remove 1 dice roll from all players
        // Priority: Remove freeDiceRolls first, then diceRolls (same logic as rollDice)
        playerIds.forEach(pid => {
          const player = room.players[pid];
          const currentDice = player.diceRolls || 0;
          const currentFree = player.freeDiceRolls || 0;
          
          // Remove freeDiceRolls first, then diceRolls
          if (currentFree > 0) {
            playersUpdate[`players.${pid}.freeDiceRolls`] = currentFree - 1;
            // Keep diceRolls unchanged
            playersUpdate[`players.${pid}.diceRolls`] = currentDice;
          } else if (currentDice > 0) {
            playersUpdate[`players.${pid}.diceRolls`] = currentDice - 1;
            // Keep freeDiceRolls unchanged
            playersUpdate[`players.${pid}.freeDiceRolls`] = currentFree;
          } else {
            // No dice rolls to remove, keep both at 0
            playersUpdate[`players.${pid}.diceRolls`] = 0;
            playersUpdate[`players.${pid}.freeDiceRolls`] = 0;
          }
        });
        break;
        
      case 'no_score':
        // Set noScore for all players
        playerIds.forEach(pid => {
          playersUpdate[`players.${pid}.eventEffects.noScore`] = true;
        });
        break;
        
      case 'penalty_wrong':
      case 'low_dice_penalty':
      case 'quiz_bonus':
        // These events are handled in their respective functions (answerQuestion, rollDice)
        // No direct player updates needed here
        break;
    }
    
    // For instant events (duration = 0), immediately end them after applying effects
    if (duration === 0) {
      // CRITICAL FIX: For instant events, use Timestamp.now() for both startedAt and endedAt
      // Cannot use serverTimestamp() in arrays, and instant events don't need server timestamp
      const eventHistory = room.events.eventHistory || [];
      const now = Timestamp.now();
      
      const historyEntry = {
        type: eventType,
        startedAt: now, // Use Timestamp.now() instead of serverTimestamp()
        endedAt: now,   // Instant events end immediately
        data: {},
      };
      
      // Create new eventHistory array
      const newEventHistory = [...eventHistory];
      newEventHistory.push(historyEntry);
      
      await updateDoc(roomRef, {
        'events.activeEvent': {
          type: null,
          startedAt: null,
          duration: 0,
          data: {},
        },
        'events.remainingEvents': remainingEvents,
        'events.eventHistory': newEventHistory,
        ...playersUpdate,
      });
    } else {
      // For duration events, set active event normally with serverTimestamp()
      const activeEvent = {
        type: eventType,
        startedAt: serverTimestamp(),
        duration,
        data: {},
      };
      
      await updateDoc(roomRef, {
        'events.activeEvent': activeEvent,
        'events.remainingEvents': remainingEvents,
        ...playersUpdate,
      });
    }
    
    // Log event
    await logGameAction(roomId, adminId, 'event', { 
      action: 'event_triggered', 
      eventType 
    });
    
    return true;
  } catch (error) {
    console.error('Error triggering event:', error);
    return false;
  }
}

/**
 * End current active event and move it to history
 */
export async function endActiveEvent(roomId: string, adminId: string): Promise<boolean> {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    
    // Use transaction to ensure atomicity and prevent race conditions
    return await runTransaction(db, async (transaction) => {
      const roomSnap = await transaction.get(roomRef);
      
      if (!roomSnap.exists()) {
        throw new Error('Room not found');
      }
      
      const room = { roomId: roomSnap.id, ...roomSnap.data() } as Room;
      
      // Validate admin
      if (room.adminId !== adminId) {
        throw new Error('Only admin can end events');
      }
      
      // Check if there's an active event
      if (!room.events?.activeEvent?.type) {
        throw new Error('No active event to end');
      }
      
      const activeEvent = room.events.activeEvent;
      const eventHistory = room.events.eventHistory || [];
      
      // CRITICAL FIX: Cannot use serverTimestamp() inside arrays in transactions
      // Solution: Use Timestamp.now() for client-side timestamp, or update history after transaction
      // We'll use Timestamp.now() for now, which is close enough to server time
      const endedAtTimestamp = Timestamp.now();
      const historyEntry = {
        type: activeEvent.type,
        startedAt: activeEvent.startedAt,
        endedAt: endedAtTimestamp,
        data: activeEvent.data,
      };
      
      // Create new array - push entry AFTER creating it (not in spread)
      const newEventHistory = [...eventHistory];
      newEventHistory.push(historyEntry);
      
      // Reset player event effects khi event kết thúc
      const playersUpdate: Record<string, any> = {};
      const playerIds = Object.keys(room.players || {});
      
      playerIds.forEach(pid => {
        playersUpdate[`players.${pid}.eventEffects.scoreDouble`] = false;
        playersUpdate[`players.${pid}.eventEffects.noScore`] = false;
        playersUpdate[`players.${pid}.eventEffects.diceDouble`] = false; // Reset diceDouble khi event kết thúc
      });
      
      // Update room - set activeEvent to default empty state
      // Firestore handles null, but we need to ensure the object structure is correct
      transaction.update(roomRef, {
        'events.activeEvent': {
          type: null,
          startedAt: null,
          duration: 0,
          data: {},
        },
        'events.eventHistory': newEventHistory,
        ...playersUpdate,
      });
      
      return true;
    });
  } catch (error) {
    console.error('Error ending active event:', error);
    return false;
  }
}

/**
 * Update leaderboard based on current player scores
 */
export async function updateLeaderboard(roomId: string): Promise<boolean> {
  try {
    const room = await getRoomById(roomId);
    if (!room || room.status !== 'playing') {
      return false;
    }

    const players = room.players || {};
    const leaderboard: Record<string, { name: string; score: number; position: number }> = {};

    // Convert players to array and sort by score (descending)
    const playersArray = Object.entries(players).map(([playerId, player]) => ({
      playerId,
      name: player.name,
      score: player.score || 0,
      position: player.position || 0,
    }));

    playersArray.sort((a, b) => {
      // Sort by score (descending), then by position (descending) if scores are equal
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.position - a.position;
    });

    // Build leaderboard object
    playersArray.forEach((player, index) => {
      leaderboard[player.playerId] = {
        name: player.name,
        score: player.score,
        position: player.position,
      };
    });

    // Update leaderboard in Firestore
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    await updateDoc(roomRef, {
      leaderboard,
    });

    return true;
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    return false;
  }
}

/**
 * End game and calculate final leaderboard
 */
export async function endGame(roomId: string, adminId: string): Promise<boolean> {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const room = await getRoomById(roomId);

    if (!room || room.adminId !== adminId) {
      return false;
    }

    if (room.status !== 'playing') {
      return false;
    }

    // Update leaderboard one final time
    await updateLeaderboard(roomId);

    // Get updated room data
    const updatedRoom = await getRoomById(roomId);
    if (!updatedRoom) {
      return false;
    }

    // End the game
    await updateDoc(roomRef, {
      status: 'finished',
      endedAt: serverTimestamp(),
    });

    // Log game end
    await logGameAction(roomId, adminId, 'event', {
      action: 'game_ended',
    });

    return true;
  } catch (error) {
    console.error('Error ending game:', error);
    return false;
  }
}

