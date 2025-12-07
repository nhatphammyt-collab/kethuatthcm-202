import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { subscribeToRoom, subscribeToEvents, getRoomById, rollDice, claimReward, triggerEvent, endActiveEvent, loadQuestionsToCache } from '../../services/firebase/gameService';
import { isRewardTile, getRewardTypeByTile, getRewardImagePath } from '../../utils/gameHelpers';
import { useEventManager } from '../../hooks/useEventManager';
import { useToast } from '../../components/minigame/ErrorToast';
import type { Room, Player, EventType } from '../../types/game';
import { ALL_EVENT_TYPES } from '../../types/game';
import PlayerToken from '../../components/minigame/PlayerToken';
import SimpleDiceRoll from '../../components/minigame/SimpleDiceRoll';
import GameDetailsModal from '../../components/minigame/GameDetailsModal';
import QuizModal from '../../components/minigame/QuizModal';
import RewardNotification from '../../components/minigame/RewardNotification';
import EventNotification from '../../components/minigame/EventNotification';
import EventTimer from '../../components/minigame/EventTimer';
import EventEffectsIndicator from '../../components/minigame/EventEffectsIndicator';
import GameTimer from '../../components/minigame/GameTimer';
import { ArrowLeft, Info, BookOpen, Zap, X } from 'lucide-react';

const PLAYER_COLORS = [
  '#FFD700', // Gold
  '#1E90FF', // Blue
  '#FF6347', // Red
  '#32CD32', // Green
  '#FF1493', // Pink
  '#9370DB', // Purple
  '#00CED1', // Cyan
  '#FF8C00', // Orange
];

// Tọa độ các ô trên map (0-23) - percentage based
// Path: Snake pattern từ 0-23
// Lưu ý: Ô 24 và ô 0 là cùng một ô (START/END), nên chỉ có 24 ô thực sự (0-23)
// Có thể điều chỉnh sau khi test với map thực tế
const TILE_POSITIONS: Array<{ x: number; y: number }> = [
  { x: 49.6244635193133, y: 70.76124567474048 }, // 0 - START/END (ô này)
  { x: 43.541666666666664, y: 82.54172015404365 }, // 1
  { x: 37.447916666666664, y: 88.57509627727856 }, // 2
  { x: 31.614583333333336, y: 79.84595635430038 }, // 3
  { x: 25.052083333333336, y: 74.19768934531452 }, // 4
  { x: 31.25, y: 66.2387676508344 }, // 5 - Pepsi (Reward)
  { x: 25.624999999999996, y: 59.306803594351734 }, // 6
  { x: 19.635416666666668, y: 50.96277278562259 }, // 7
  { x: 13.385416666666666, y: 42.87548138639281 }, // 8
  { x: 19.895833333333332, y: 32.47753530166881 }, // 9 - Kẹo (Reward)
  { x: 25.729166666666664, y: 24.646983311938385 }, // 10 - Row 3
  { x: 31.71875, y: 34.27471116816431 }, // 11
  { x: 38.02083333333333, y: 42.3620025673941 }, // 12
  { x: 43.854166666666664, y: 33.24775353016688 }, // 13
  { x: 50.416666666666664, y: 23.748395378690628 }, // 14 - Quà bí ẩn (Reward)
  { x: 55.93749999999999, y: 34.65982028241335 }, // 15 - Row 4
  { x: 61.66666666666667, y: 42.747111681643126 }, // 16
  { x: 68.17708333333333, y: 51.34788189987163 }, // 17
  { x: 74.42708333333333, y: 54.81386392811296 }, // 18
  { x: 80.15625, y: 60.46213093709885 }, // 19 - Bánh snack (Reward)
  { x: 73.90625, y: 74.19768934531452 }, // 20 - Row 5
  { x: 67.5, y: 80.87291399229781 }, // 21
  { x: 61.875, y: 87.67650834403081 }, // 22
  { x: 55.989583333333336, y: 84.46726572528883 }, // 23
  // Ô 24 = Ô 0 (cùng tọa độ), không cần thêm vào array
];

export default function GameBoard() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { role, adminId, playerId } = location.state || {};

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [activeEvent, setActiveEvent] = useState<Room['events']['activeEvent'] | null>(null); // ⚡ HYBRID: Event state riêng
  const [showDetails, setShowDetails] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [pendingRewardType, setPendingRewardType] = useState<'mysteryGiftBox' | 'pepsi' | 'cheetos' | 'candies' | null>(null);
  const [showEventNotification, setShowEventNotification] = useState(false);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [showEventPanel, setShowEventPanel] = useState(false);
  const [lastDiceResult, setLastDiceResult] = useState<number | null>(null);
  const [diceCooldownRemaining, setDiceCooldownRemaining] = useState<number>(0);
  const previousEventTypeRef = useRef<string | null>(null);
  const { showToast, ToastContainer } = useToast();
  
  // ⚡ BATCH QUIZ UPDATES: Queue để gộp nhiều quiz answers
  interface QuizUpdate {
    playerId: string;
    isCorrect: boolean;
    currentDiceRolls: number;
    currentScore: number;
  }
  const quizUpdateQueue = useRef<QuizUpdate[]>([]);
  const quizUpdateTimer = useRef<NodeJS.Timeout | null>(null);
  
  const isAdmin = role === 'admin' && adminId === room?.adminId;
  
  // ⚡ BATCH QUIZ UPDATES: Batch update function (moved before useEffect to avoid initialization error)
  const batchQuizUpdates = useCallback(async () => {
    if (quizUpdateQueue.current.length === 0) return;
    
    if (!roomId) return;

    try {
      const { doc, getDoc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../config/firebase');
      
      const roomRef = doc(db, 'rooms', roomId);
      
      // ⚡ AN TOÀN: Đọc lại room từ Firebase để có event state MỚI NHẤT
      // Tránh race condition khi event thay đổi trong lúc queue
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) {
        console.error('[BatchQuiz] Room not found');
        quizUpdateQueue.current = [];
        return;
      }
      
      const currentRoom = roomSnap.data() as Room;
      const currentEventType = currentRoom.events?.activeEvent?.type;
      const isQuizBonus = currentEventType === 'quiz_bonus';
      const isPenaltyWrong = currentEventType === 'penalty_wrong';
      
      // ⚡ Gộp tất cả updates vào 1 write
      const updates: Record<string, any> = {};
      
      quizUpdateQueue.current.forEach((update) => {
        if (update.isCorrect) {
          // Quiz đúng: +1 lượt (hoặc +2 nếu có quiz_bonus event)
          const diceRollsToAdd = isQuizBonus ? 2 : 1;
          const currentDiceRolls = update.currentDiceRolls || 0;
          updates[`players.${update.playerId}.diceRolls`] = currentDiceRolls + diceRollsToAdd;
        } else {
          // Quiz sai: -5 điểm nếu có penalty_wrong event
          if (isPenaltyWrong) {
            const newScore = Math.max(0, (update.currentScore || 0) - 5);
            updates[`players.${update.playerId}.score`] = newScore;
          }
        }
      });
      
      // ⚡ Ghi Firebase 1 lần cho tất cả updates
      if (Object.keys(updates).length > 0) {
        await updateDoc(roomRef, updates);
        console.log(`[BatchQuiz] ✅ Batch updated ${quizUpdateQueue.current.length} quiz answers`);
      }
      
      // Xóa hàng đợi
      quizUpdateQueue.current = [];
    } catch (error) {
      console.error('[BatchQuiz] Error batch updating quiz answers:', error);
      showToast('Lỗi khi cập nhật kết quả. Vui lòng thử lại.', 'error');
      // Xóa hàng đợi để tránh retry vô hạn
      quizUpdateQueue.current = [];
    }
  }, [roomId, showToast]);
  
  // Event Manager hook (only for admin) - handles game end timer, leaderboard updates, and auto event ending
  useEventManager({ 
    room, 
    adminId, 
    isAdmin: isAdmin || false 
  });

  useEffect(() => {
    if (!roomId) {
      navigate('/minigame');
      return;
    }

    // ⚡ TỐI ƯU: Preload questions cache khi vào game
    // Chỉ fetch Firebase 1 lần, các lần quiz sau lấy từ cache!
    loadQuestionsToCache().catch(console.error);

    // ⚡ HYBRID OPTIMIZATION: Real-time cho events (tất cả players)
    // Events cần real-time để quiz answers check đúng
    // ⚠️ LƯU Ý: onSnapshot vẫn đọc toàn bộ document mỗi lần có thay đổi
    // Nhưng cần thiết để đảm bảo quiz logic chính xác
    let eventUnsubscribe: (() => void) | null = null;
    eventUnsubscribe = subscribeToEvents(roomId, (eventData) => {
      // ⚡ TỐI ƯU: Dừng listener nếu game đã ended
      if (room?.status === 'finished' && eventUnsubscribe) {
        eventUnsubscribe();
        eventUnsubscribe = null;
        return;
      }
      
      setActiveEvent(eventData);
      
      // Check for new event
      if (eventData?.type) {
        const currentEventType = eventData.type;
        if (currentEventType !== previousEventTypeRef.current) {
          previousEventTypeRef.current = currentEventType;
          setShowEventNotification(true);
        }
      } else {
        previousEventTypeRef.current = null;
      }
    });

    // ⚡ HYBRID: Admin dùng real-time, Players dùng polling
    let fullUnsubscribe: (() => void) | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    if (isAdmin) {
      // Admin: Real-time cho tất cả (cần để trigger events)
      fullUnsubscribe = subscribeToRoom(roomId, (roomData) => {
        setRoom(roomData);
        setLoading(false);

        // Set room data (không merge với activeEvent để tránh dependency loop)
        setRoom(roomData);

        // Get current player data
        if (roomData && playerId && roomData.players[playerId]) {
          setCurrentPlayer(roomData.players[playerId]);
        }

      // If game ended, navigate to end screen
      if (roomData?.status === 'finished') {
        navigate(`/minigame/end/${roomId}`, { 
          state: { role, adminId, playerId } 
        });
      }
    });
    } else {
      // Players: Polling mỗi 10 giây cho updates thông thường (tối ưu Firebase reads)
      // Giảm từ 3s xuống 10s: 3 players × 30 polls/5min = 90 reads thay vì 300 reads
      const pollRoom = async () => {
        try {
          const roomData = await getRoomById(roomId);
          if (roomData) {
            setLoading(false);
            
            // ⚡ TỐI ƯU: Dừng polling ngay khi game ended để tránh reads không cần thiết
            if (roomData.status === 'finished') {
              if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
              }
              navigate(`/minigame/end/${roomId}`, { 
                state: { role, adminId, playerId } 
              });
              return;
            }
            
            // Set room data (activeEvent được quản lý riêng bởi subscribeToEvents)
            setRoom(roomData);

            // Get current player data
            if (roomData.players[playerId]) {
              setCurrentPlayer(roomData.players[playerId]);
            }
          }
        } catch (error) {
          console.error('[GameBoard] Error polling room:', error);
        }
      };

      // Poll ngay lập tức
      pollRoom();
      // ⚡ TỐI ƯU: Poll mỗi 10 giây thay vì 3 giây (giảm 70% reads)
      pollInterval = setInterval(pollRoom, 10000);
    }

    return () => {
      // ⚡ TỐI ƯU: Cleanup tất cả listeners và intervals để tránh memory leak và duplicate reads
      if (eventUnsubscribe) {
        eventUnsubscribe();
      }
      if (fullUnsubscribe) {
        fullUnsubscribe();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      // ⚡ BATCH QUIZ: Cleanup - batch update trước khi unmount
      if (quizUpdateTimer.current) {
        clearTimeout(quizUpdateTimer.current);
        quizUpdateTimer.current = null;
      }
      // Batch update ngay nếu còn items trong queue
      if (quizUpdateQueue.current.length > 0) {
        batchQuizUpdates();
      }
    };
    // ⚠️ QUAN TRỌNG: KHÔNG thêm activeEvent vào dependencies!
    // Nếu thêm activeEvent, mỗi lần event thay đổi sẽ recreate listeners → reads tăng vọt!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, navigate, role, adminId, playerId, isAdmin]);

  // ⚡ Cooldown timer cho dice rolls (7 giây)
  useEffect(() => {
    if (!room || !currentPlayer || !currentPlayer.lastDiceRollTime) {
      setDiceCooldownRemaining(0);
      return;
    }
    
    const diceCooldown = room.settings.diceCooldown || 7;
    
    const updateCooldown = () => {
      let lastRollTime: Date;
      if (currentPlayer.lastDiceRollTime.toDate) {
        lastRollTime = currentPlayer.lastDiceRollTime.toDate();
      } else if (currentPlayer.lastDiceRollTime instanceof Date) {
        lastRollTime = currentPlayer.lastDiceRollTime;
      } else {
        lastRollTime = new Date(currentPlayer.lastDiceRollTime);
      }
      
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - lastRollTime.getTime()) / 1000);
      const remaining = Math.max(0, diceCooldown - elapsedSeconds);
      setDiceCooldownRemaining(remaining);
    };
    
    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    
    return () => clearInterval(interval);
  }, [room, currentPlayer]);

  // Memoize players array and available rolls (MUST be before early returns)
  // Filter players to show only current player's group (4 players per group, based on join order)
  // Note: Admin is excluded from grouping (only regular players are grouped)
  const players = useMemo(() => {
    if (!room || !room.players || !playerId) return [];
    
    const allPlayers = Object.entries(room.players);
    
    // Exclude admin from grouping (if admin is also a player)
    const regularPlayers = allPlayers.filter(([pid]) => pid !== room.adminId);
    
    // Sort by playerId to get deterministic order (based on join order)
    // Note: playerId is usually generated in order, so this gives us join order
    const sortedPlayerIds = regularPlayers.map(([pid]) => pid).sort();
    
    // Find current player's index (only among regular players, excluding admin)
    const currentPlayerIndex = sortedPlayerIds.indexOf(playerId);
    if (currentPlayerIndex === -1) return [];
    
    // Calculate group (4 players per group)
    const groupIndex = Math.floor(currentPlayerIndex / 4);
    const groupStart = groupIndex * 4;
    const groupEnd = Math.min(groupStart + 4, sortedPlayerIds.length);
    const groupPlayerIds = sortedPlayerIds.slice(groupStart, groupEnd);
    
    // Filter to show only players in the same group
    return regularPlayers.filter(([pid]) => groupPlayerIds.includes(pid));
  }, [room?.players, room?.adminId, playerId]);

  const availableRolls = useMemo(() => {
    return currentPlayer 
      ? (currentPlayer.diceRolls || 0) + (currentPlayer.freeDiceRolls || 0)
      : 0;
  }, [currentPlayer]);

  // Get player color - memoized
  const getPlayerColor = useCallback((index: number) => {
    return PLAYER_COLORS[index % PLAYER_COLORS.length];
  }, []);

  // Handle dice roll - memoized
  const handleDiceRoll = useCallback(async () => {
    if (!roomId || !playerId || !currentPlayer) {
      showToast('Lỗi: Không tìm thấy thông tin người chơi', 'error');
      return;
    }
    
    // Check if player has dice rolls available
    const totalRolls = (currentPlayer.diceRolls || 0) + (currentPlayer.freeDiceRolls || 0);
    if (totalRolls <= 0) {
      showToast('Bạn không còn lượt lắc! Hãy trả lời câu hỏi để nhận thêm lượt.', 'warning');
      return;
    }
    
    // ⚡ Check dice cooldown
    if (diceCooldownRemaining > 0) {
      showToast(`⏱️ Bạn phải chờ ${diceCooldownRemaining} giây nữa mới được lắc tiếp!`, 'warning');
      return;
    }
    
    // Check if game is playing
    if (room?.status !== 'playing') {
      showToast('Game chưa bắt đầu hoặc đã kết thúc!', 'warning');
      return;
    }
    
    setIsRollingDice(true);
    
    try {
      // Roll dice and update position in Firebase
      const diceResult = await rollDice(roomId, playerId);
      
      if (diceResult === null) {
        showToast('Lỗi khi lắc xúc xắc. Vui lòng thử lại.', 'error');
        return;
      }
      
      // Update last dice result to display in UI
      setLastDiceResult(diceResult);
      
      // Check if player landed on reward tile
      if (room && currentPlayer) {
        const newPosition = (currentPlayer.position + diceResult) % 24;
        if (isRewardTile(newPosition, room.settings.boardConfig.rewardTiles)) {
          const rewardType = getRewardTypeByTile(newPosition);
          if (rewardType) {
            // Wait a bit for animation to complete, then show reward claim
            setTimeout(() => {
              setPendingRewardType(rewardType);
              setShowRewardModal(true);
            }, 1500);
          }
        }
      }
    } catch (error: any) {
      console.error('Error rolling dice:', error);
      // ⚡ Handle cooldown error
      if (error?.message?.startsWith('COOLDOWN_')) {
        const seconds = error.message.split('_')[1];
        showToast(`⏱️ Bạn phải chờ ${seconds} giây nữa mới được lắc tiếp!`, 'warning');
      } else {
        showToast('Lỗi khi lắc xúc xắc. Vui lòng thử lại.', 'error');
      }
    } finally {
      setIsRollingDice(false);
    }
  }, [roomId, playerId, currentPlayer, room, diceCooldownRemaining, showToast]);

  // Handle quiz button - memoized
  const handleQuiz = useCallback(() => {
    setShowQuiz(true);
  }, []);

  // Handle quiz answer - memoized
  // ⚡ BATCH QUIZ: Queue thay vì write ngay
  const handleQuizAnswer = useCallback(async (isCorrect: boolean) => {
    if (!roomId || !playerId || !currentPlayer || !room) return;

    // ⚡ Lưu vào hàng đợi (chưa ghi Firebase)
    quizUpdateQueue.current.push({
      playerId,
      isCorrect,
      currentDiceRolls: currentPlayer.diceRolls || 0,
      currentScore: currentPlayer.score || 0,
    });
    
    // ⚡ Debounce: Đợi 500ms, sau đó batch update
    // Nếu có timer cũ, clear nó và tạo timer mới
    if (quizUpdateTimer.current) {
      clearTimeout(quizUpdateTimer.current);
    }
    
    quizUpdateTimer.current = setTimeout(() => {
      batchQuizUpdates();
      quizUpdateTimer.current = null;
    }, 500); // 500ms debounce
    
  }, [roomId, playerId, currentPlayer, room, batchQuizUpdates]);

  // Handle event trigger (admin only)
  const handleTriggerEvent = useCallback(async (eventType: EventType) => {
    if (!roomId || !adminId || !isAdmin) {
      showToast('Chỉ admin mới có thể kích hoạt event!', 'error');
      return;
    }

    if (!room || room.status !== 'playing') {
      showToast('Game chưa bắt đầu hoặc đã kết thúc!', 'warning');
      return;
    }

    // Check if there's an active event (must be a valid EventType string, not null/undefined/empty)
    // ⚡ HYBRID: Dùng activeEvent từ state (real-time)
    const activeEventType = activeEvent?.type;
    const hasActiveEvent = activeEventType && 
                          typeof activeEventType === 'string' && 
                          activeEventType.trim() !== '' &&
                          ALL_EVENT_TYPES.includes(activeEventType as EventType);
    
    if (hasActiveEvent) {
      showToast('Đang có event đang diễn ra! Hãy kết thúc event hiện tại trước.', 'warning');
      return;
    }

    // Check if event is still available (in remainingEvents)
    const isAvailable = room.events?.remainingEvents?.includes(eventType);
    if (!isAvailable) {
      showToast('Event này đã được sử dụng!', 'warning');
      return;
    }

    try {
      const success = await triggerEvent(roomId, eventType, adminId);
      if (success) {
        showToast(`✅ Đã kích hoạt event: ${eventType}`, 'success');
      } else {
        showToast('Không thể kích hoạt event. Event có thể đã được sử dụng hoặc không hợp lệ.', 'error');
      }
    } catch (error) {
      console.error('Error triggering event:', error);
      showToast('Lỗi khi kích hoạt event. Vui lòng thử lại.', 'error');
    }
  }, [roomId, adminId, isAdmin, room, activeEvent, showToast]);

  // Handle end active event (admin only)
  const handleEndEvent = useCallback(async () => {
    if (!roomId || !adminId || !isAdmin) {
      showToast('Chỉ admin mới có thể kết thúc event!', 'error');
      return;
    }

    // ⚡ HYBRID: Dùng activeEvent từ state (real-time)
    if (!activeEvent?.type) {
      showToast('Không có event nào đang diễn ra!', 'warning');
      return;
    }

    try {
      const success = await endActiveEvent(roomId, adminId);
      if (success) {
        showToast('✅ Đã kết thúc event', 'success');
        // Room data will be updated via Firestore subscription
        // No need to manually update state
      } else {
        showToast('Không thể kết thúc event. Vui lòng thử lại.', 'error');
      }
    } catch (error) {
      console.error('Error ending event:', error);
      showToast('Lỗi khi kết thúc event. Vui lòng thử lại.', 'error');
    }
  }, [roomId, adminId, isAdmin, activeEvent, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/40">
        <div className="text-white text-xl">Đang tải game...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/40">
        <div className="text-white text-xl">Không tìm thấy phòng</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background - Map */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/map.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar - Simple */}
        <div className="bg-black/50 backdrop-blur-md border-b-2 border-[#FFD700] p-2 md:p-3">
          <div className="container mx-auto flex items-center justify-between gap-2">
            <button
              onClick={() => navigate('/minigame')}
              className="flex items-center gap-1 md:gap-2 bg-[#FFD700] text-[#b30000] px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold hover:scale-105 transition-transform text-sm md:text-base"
            >
              <ArrowLeft size={18} />
              Thoát
            </button>

            <div className="text-center">
              <div className="text-[#FFD700] font-bold">
                {room.roomCode}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDetails(true)}
                className="flex items-center gap-1 md:gap-2 bg-white/20 text-white px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors text-sm md:text-base"
              >
                <Info size={18} />
                Chi tiết
              </button>
              
              {/* Event Management Button (Admin Only) */}
              {isAdmin && (
                <button
                  onClick={() => setShowEventPanel(!showEventPanel)}
                  className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold transition-all text-sm md:text-base ${
                    showEventPanel
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                >
                  <Zap size={18} />
                  {showEventPanel ? 'Ẩn Event' : 'Event'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Game Board - Full screen map with players */}
        <div className="flex-1 relative">
          {/* Map background */}
          <div className="absolute inset-0">
            <img
              src="/map.png"
              alt="Game Board"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Player tokens positioned on map */}
          <div className="absolute inset-0">
            {players.map(([pid, player], index) => {
              // Ô 24 = Ô 0 (cùng tọa độ)
              const actualPosition = player.position % 24;
              const tilePos = TILE_POSITIONS[actualPosition] || TILE_POSITIONS[0];
              return (
                <PlayerToken
                  key={pid}
                  player={player}
                  playerId={pid}
                  playerName={player.name}
                  color={getPlayerColor(index)}
                  isCurrentPlayer={pid === playerId}
                  currentTilePosition={tilePos}
                  tilePositions={TILE_POSITIONS}
                  totalTiles={24}
                />
              );
            })}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="bg-black/70 backdrop-blur-md border-t-2 border-[#FFD700] p-4">
          <div className="container mx-auto flex items-center justify-center gap-4 md:gap-6 flex-wrap">
            {/* Quiz Button */}
            <button
              onClick={handleQuiz}
              disabled={!currentPlayer}
              className="flex items-center gap-2 md:gap-3 bg-gradient-to-r from-[#1E90FF] to-[#4169E1] text-white px-4 md:px-8 py-2 md:py-4 rounded-xl font-bold text-sm md:text-lg hover:scale-105 hover:shadow-2xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BookOpen size={24} />
              TÌM LƯỢT LẮC
            </button>

            {/* Dice Roll */}
            <SimpleDiceRoll
              onRoll={handleDiceRoll}
              disabled={!currentPlayer || availableRolls <= 0 || room?.status !== 'playing' || isRollingDice || diceCooldownRemaining > 0}
              availableRolls={availableRolls}
              lastDiceResult={lastDiceResult}
              cooldownRemaining={diceCooldownRemaining}
            />
          </div>
        </div>

        {/* Player Score - Top Right Corner */}
        {currentPlayer && (
          <div className="fixed top-16 md:top-20 right-2 md:right-4 bg-[#FFD700]/90 backdrop-blur-md rounded-xl p-3 md:p-4 border-2 border-[#b30000] shadow-2xl z-30">
            <div className="text-center">
              <div className="text-[#b30000] font-bold text-sm mb-1">
                {currentPlayer.name}
              </div>
              <div className="text-[#b30000] font-black text-2xl md:text-3xl">
                {currentPlayer.score}
              </div>
              <div className="text-[#b30000] text-xs font-semibold">
                ĐIỂM
              </div>
              {/* Event Effects Indicator */}
              <div className="mt-2">
                <EventEffectsIndicator player={currentPlayer} />
              </div>
            </div>
          </div>
        )}

        {/* Game Details Modal */}
        <GameDetailsModal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          room={room}
          currentPlayerId={playerId}
        />

        {/* Quiz Modal */}
        <QuizModal
          isOpen={showQuiz}
          onClose={() => setShowQuiz(false)}
          onAnswer={handleQuizAnswer}
          roomId={roomId}
          playerId={playerId}
        />

        {/* Reward Claim Modal */}
        {showRewardModal && pendingRewardType && (
          <RewardClaimModal
            isOpen={showRewardModal}
            onClose={() => {
              setShowRewardModal(false);
              setPendingRewardType(null);
            }}
            rewardType={pendingRewardType}
            roomId={roomId || ''}
            playerId={playerId || ''}
            playerName={currentPlayer?.name || ''}
          />
        )}

        {/* Reward Notification (for all players) */}
        <RewardNotification
          room={room}
          currentPlayerId={playerId}
        />

        {/* Event Notification */}
        <EventNotification
          eventType={activeEvent?.type || null}
          isOpen={showEventNotification}
          onClose={() => setShowEventNotification(false)}
          duration={activeEvent?.duration || 0}
        />

        {/* Event Timer */}
        {room?.startedAt && (
          <EventTimer
            activeEvent={activeEvent || { type: null, startedAt: null, duration: 0, data: {} }}
            gameStartedAt={room?.startedAt?.toDate?.() || new Date(room?.startedAt || Date.now())}
          />
        )}

        {/* Game Timer */}
        <GameTimer room={room} />
        
        {/* Event Management Panel (Admin Only) */}
        {isAdmin && showEventPanel && (
          <div className="fixed bottom-20 left-4 bg-black/90 backdrop-blur-md border-2 border-purple-500 rounded-xl p-4 z-50 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Zap size={20} />
                QUẢN LÝ EVENT
              </h3>
              <button
                onClick={() => setShowEventPanel(false)}
                className="text-white hover:text-purple-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Current Active Event */}
            {activeEvent?.type && (
              <div className="mb-4 p-3 bg-purple-500/20 rounded-lg border border-purple-500">
                <div className="text-white font-semibold mb-2">Event đang active:</div>
                <div className="text-purple-300 font-bold">{activeEvent.type}</div>
                {activeEvent.duration > 0 && (
                  <div className="text-purple-200 text-sm mt-1">
                    Duration: {activeEvent.duration}s
                  </div>
                )}
                <button
                  onClick={handleEndEvent}
                  className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Kết thúc Event
                </button>
              </div>
            )}

            {/* Event Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {ALL_EVENT_TYPES.map((eventType) => {
                // ⚡ HYBRID: Dùng activeEvent từ state (real-time) thay vì room.events?.activeEvent
                // activeEvent state được cập nhật bởi subscribeToEvents callback (real-time)
                const activeEventType = activeEvent?.type;
                
                // Check if there's actually an active event
                // Firestore may return null, undefined, empty string, or a valid EventType
                const hasActiveEvent = activeEventType !== null && 
                                      activeEventType !== undefined && 
                                      activeEventType !== '' &&
                                      typeof activeEventType === 'string' &&
                                      ALL_EVENT_TYPES.includes(activeEventType as EventType);
                
                const isActive = activeEventType === eventType;
                const isUsed = !room.events?.remainingEvents?.includes(eventType);
                
                // Only disable if:
                // 1. This event is currently active
                // 2. This event has been used (not in remainingEvents)
                // 3. There's another event active (not this one)
                const isDisabled = isActive || isUsed || (hasActiveEvent && !isActive);
                
                return (
                  <button
                    key={eventType}
                    onClick={() => handleTriggerEvent(eventType)}
                    disabled={isDisabled}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white cursor-not-allowed opacity-50'
                        : isUsed
                        ? 'bg-gray-600 text-white cursor-not-allowed opacity-50'
                        : hasActiveEvent && !isActive
                        ? 'bg-gray-500 text-white cursor-not-allowed opacity-50'
                        : 'bg-purple-500 text-white hover:bg-purple-600 hover:scale-105'
                    }`}
                    title={
                      isActive
                        ? 'Event đang active'
                        : isUsed
                        ? 'Event đã được sử dụng'
                        : hasActiveEvent && !isActive
                        ? 'Có event khác đang diễn ra'
                        : `Kích hoạt ${eventType}`
                    }
                  >
                    {eventType.replace('_', ' ').toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* Event Effects Info */}
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <div className="text-white text-xs">
                <div className="font-semibold mb-1">Event Effects (20s):</div>
                <div className="space-y-1 text-gray-300">
                  <div>• dice_double: Lần lắc tiếp theo x2</div>
                  <div>• score_double: Mỗi ô +2 điểm</div>
                  <div>• quiz_bonus: Trả lời đúng +2 lượt</div>
                  <div>• free_dice: +1 lượt miễn phí (tức thì)</div>
                  <div>• penalty_wrong: Trả lời sai -5 điểm</div>
                  <div>• lose_dice: -1 lượt lắc (tức thì)</div>
                  <div>• no_score: Di chuyển không cộng điểm</div>
                  <div>• low_dice_penalty: Lắc &lt; 5 thì -3 điểm</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Toast Container */}
        <ToastContainer />
      </div>
    </div>
  );
}

// Reward Claim Modal Component
interface RewardClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardType: 'mysteryGiftBox' | 'pepsi' | 'cheetos' | 'candies';
  roomId: string;
  playerId: string;
  playerName: string;
}

function RewardClaimModal({ isOpen, onClose, rewardType, roomId, playerId }: RewardClaimModalProps) {
  const [claiming, setClaiming] = useState(false);
  const { showToast } = useToast();

  const handleClaim = async () => {
    // Validate inputs
    if (!roomId || !playerId) {
      showToast('Lỗi: Thiếu thông tin phòng hoặc người chơi', 'error');
      return;
    }

    setClaiming(true);
    try {
      const result = await claimReward(roomId, playerId, rewardType);
      
      if (result.success) {
        // Use message from service (includes unlock time info if applicable)
        showToast(result.message || 'Chúc mừng! Bạn đã nhận phần thưởng!', 'success');
        // Show success message briefly, then close
        setTimeout(() => {
          try {
            onClose();
          } catch (err) {
            console.error('Error closing modal:', err);
          }
        }, 1500);
      } else {
        // Show error message from service (includes unlock time info for MysteryBox)
        showToast(result.message || 'Không thể nhận phần thưởng. Vui lòng thử lại.', 'error');
        setTimeout(() => {
          try {
            onClose();
          } catch (err) {
            console.error('Error closing modal:', err);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      showToast('Lỗi khi nhận phần thưởng. Vui lòng thử lại.', 'error');
      setTimeout(() => {
        try {
          onClose();
        } catch (err) {
          console.error('Error closing modal:', err);
        }
      }, 2000);
    } finally {
      setClaiming(false);
    }
  };

  const handleClose = () => {
    try {
      onClose();
    } catch (error) {
      console.error('Error closing modal:', error);
    }
  };

  if (!isOpen) return null;

  const rewardNames: Record<string, string> = {
    mysteryGiftBox: 'Hộp quà bí ẩn',
    pepsi: 'Pepsi',
    cheetos: 'Bánh snack',
    candies: 'Kẹo',
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-2xl p-8 max-w-md w-full mx-4 border-2 border-[#FFD700]">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-[#FFD700] mb-4">PHẦN THƯỞNG!</h2>
          
          <img
            src={getRewardImagePath(rewardType)}
            alt={rewardNames[rewardType]}
            className="w-32 h-32 object-contain mb-4"
          />
          
          <p className="text-white text-lg mb-6">
            Bạn đã dừng ở ô phần thưởng!
          </p>
          
          <p className="text-[#FFD700] text-xl font-bold mb-6">
            {rewardNames[rewardType]}
          </p>

          <div className="flex gap-4">
            <button
              onClick={handleClose}
              disabled={claiming}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50"
            >
              Bỏ qua
            </button>
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="px-6 py-2 bg-[#FFD700] text-[#b30000] rounded-lg font-semibold hover:scale-105 disabled:opacity-50"
            >
              {claiming ? 'Đang nhận...' : 'Nhận ngay!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
