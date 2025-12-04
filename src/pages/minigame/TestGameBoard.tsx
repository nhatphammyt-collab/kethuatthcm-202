// Test page for dice roll and animation
import { useState, useRef } from 'react';
import PlayerToken from '../../components/minigame/PlayerToken';
import SimpleDiceRoll from '../../components/minigame/SimpleDiceRoll';
import TilePositionEditor from '../../components/minigame/TilePositionEditor';
import TestChecklist from '../../components/minigame/TestChecklist';
import GameDetailsModal from '../../components/minigame/GameDetailsModal';
import QuizModal from '../../components/minigame/QuizModal';
import RewardNotification from '../../components/minigame/RewardNotification';
import EventNotification from '../../components/minigame/EventNotification';
import EventTimer from '../../components/minigame/EventTimer';
import EventEffectsIndicator from '../../components/minigame/EventEffectsIndicator';
import GameTimer from '../../components/minigame/GameTimer';
import { useToast } from '../../components/minigame/ErrorToast';
import { isRewardTile, getRewardTypeByTile, getRewardImagePath } from '../../utils/gameHelpers';
import type { Player, Room, EventType, ActiveEvent } from '../../types/game';
import { ALL_EVENT_TYPES } from '../../types/game';
import { Settings, MousePointer2, X, Copy, Check, ListChecks, RefreshCw, BookOpen, Info, Zap, Trophy, Award } from 'lucide-react';

// Player colors - đồng bộ với GameBoard.tsx
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

// Tọa độ test - đồng bộ với GameBoard.tsx
// Tọa độ các ô trên map (0-23) - percentage based
// Path: Snake pattern từ 0-23
// Lưu ý: Ô 24 và ô 0 là cùng một ô (START/END), nên chỉ có 24 ô thực sự (0-23)
// Nếu đã cập nhật GameBoard.tsx, hãy copy tọa độ từ đó vào đây
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

export default function TestGameBoard() {
  const [playerPosition, setPlayerPosition] = useState(0);
  const [playerAbsolutePosition, setPlayerAbsolutePosition] = useState(0); // Absolute position (không modulo) để tính path đúng
  const [availableRolls, setAvailableRolls] = useState(999); // 999 lượt để test kỹ
  const [diceHistory, setDiceHistory] = useState<number[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [tilePositions, setTilePositions] = useState(TILE_POSITIONS);
  const [clickMode, setClickMode] = useState(false);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [clickedPosition, setClickedPosition] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false); // Panel test controls
  const [showQuiz, setShowQuiz] = useState(false); // Quiz modal
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [pendingRewardType, setPendingRewardType] = useState<'mysteryGiftBox' | 'pepsi' | 'cheetos' | 'candies' | null>(null);
  const [claimedRewards, setClaimedRewards] = useState<Record<string, boolean>>({}); // Track claimed rewards
  const [activeEvent, setActiveEvent] = useState<ActiveEvent>({ type: null, startedAt: null, duration: 0, data: {} });
  const [showEventNotification, setShowEventNotification] = useState(false);
  const [showEventPanel, setShowEventPanel] = useState(false);
  const [penaltyPoints, setPenaltyPoints] = useState<number>(0); // Tổng điểm bị trừ từ penalty_wrong
  const [lowDicePenaltyPoints, setLowDicePenaltyPoints] = useState<number>(0); // Tổng điểm bị trừ từ low_dice_penalty
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null); // Thời gian bắt đầu game (để test timer)
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting'); // Game status
  const [showGameEnd, setShowGameEnd] = useState(false); // Toggle để hiển thị GameEnd view
  const [isRollingDice, setIsRollingDice] = useState(false); // Loading state cho dice roll
  const { showToast, ToastContainer } = useToast();
  const eventEndTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameEndTimerRef = useRef<NodeJS.Timeout | null>(null);
  const leaderboardUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreAtEventStartRef = useRef<number>(0); // Điểm tại thời điểm event bắt đầu (hoặc điểm cơ sở sau event)
  const diceHistoryAtEventStartRef = useRef<number>(0); // Số lần lắc tại thời điểm event bắt đầu (hoặc sau event)
  const hasActiveScoreEventRef = useRef<boolean>(false); // Track xem có event score đang active không
  const mapRef = useRef<HTMLDivElement>(null);

  // Get player color - đồng bộ với GameBoard.tsx
  const getPlayerColor = (index: number) => {
    return PLAYER_COLORS[index % PLAYER_COLORS.length];
  };

  // Mock player data - đồng bộ với GameBoard.tsx
  // Calculate total score (số lần đã đi qua các ô, bao gồm cả loop)
  const totalScore = diceHistory.reduce((sum, roll) => sum + roll, 0);
  
  // Apply event effects to score calculation
  // Score Double: Chỉ x2 điểm kiếm được TRONG thời gian event, không x2 điểm cũ
  let finalScore = totalScore;
  
  if (activeEvent.type === 'no_score') {
    // No Score: Không cộng điểm trong thời gian event
    // Khi event đang active, điểm = điểm trước event (không cộng điểm trong event)
    const scoreBeforeEvent = scoreAtEventStartRef.current;
    // Điểm = điểm trước event (không cộng điểm trong event)
    finalScore = scoreBeforeEvent;
  } else if (activeEvent.type === 'score_double') {
    // Score Double: Điểm = điểm trước event + (điểm trong event * 2)
    const scoreBeforeEvent = scoreAtEventStartRef.current;
    const diceCountBeforeEvent = diceHistoryAtEventStartRef.current;
    const scoreDuringEvent = diceHistory.slice(diceCountBeforeEvent).reduce((sum, roll) => sum + roll, 0);
    finalScore = scoreBeforeEvent + (scoreDuringEvent * 2);
  } else if (hasActiveScoreEventRef.current) {
    // Event đã kết thúc, nhưng đã từng có event score
    // scoreAtEventStartRef đã được cập nhật = điểm cuối cùng (đã tính multiplier)
    // diceHistoryAtEventStartRef đã được cập nhật = số lần lắc cuối cùng
    // Chỉ cần cộng thêm điểm mới sau khi event kết thúc
    const baseScore = scoreAtEventStartRef.current;
    const diceCountAtEventEnd = diceHistoryAtEventStartRef.current;
    const scoreAfterEvent = diceHistory.slice(diceCountAtEventEnd).reduce((sum, roll) => sum + roll, 0);
    finalScore = baseScore + scoreAfterEvent;
  } else {
    // Chưa có event score nào, tính điểm bình thường
    finalScore = totalScore;
  }
  
  // Trừ penalty points (từ penalty_wrong và low_dice_penalty events)
  finalScore = Math.max(0, finalScore - penaltyPoints - lowDicePenaltyPoints);
  
  const mockPlayer: Player = {
    name: 'Test Player',
    position: playerAbsolutePosition, // Sử dụng absolute position để PlayerToken tính path đúng
    score: finalScore, // Score với event effects
    diceRolls: 999 - availableRolls,
    freeDiceRolls: 0,
    bonusMultiplier: 1,
    joinedAt: new Date(),
    eventEffects: {
      diceDouble: activeEvent.type === 'dice_double',
      scoreDouble: activeEvent.type === 'score_double',
      noScore: activeEvent.type === 'no_score',
    },
  };

  // Generate mock players với scores và positions khác nhau để test leaderboard
  // Phải đặt sau khi mockPlayer được định nghĩa
  const generateMockPlayers = (): Record<string, Player> => {
    const mockPlayersData: Record<string, Player> = {
      'test-player': mockPlayer, // Current player
      'player-1': {
        name: 'Nguyễn Văn A',
        position: 18,
        score: 156,
        diceRolls: 5,
        freeDiceRolls: 0,
        bonusMultiplier: 1,
        joinedAt: new Date(),
        eventEffects: {},
      },
      'player-2': {
        name: 'Trần Thị B',
        position: 12,
        score: 203,
        diceRolls: 8,
        freeDiceRolls: 0,
        bonusMultiplier: 1,
        joinedAt: new Date(),
        eventEffects: {},
      },
      'player-3': {
        name: 'Lê Văn C',
        position: 22,
        score: 98,
        diceRolls: 3,
        freeDiceRolls: 0,
        bonusMultiplier: 1,
        joinedAt: new Date(),
        eventEffects: {},
      },
      'player-4': {
        name: 'Phạm Thị D',
        position: 7,
        score: 234,
        diceRolls: 10,
        freeDiceRolls: 0,
        bonusMultiplier: 1,
        joinedAt: new Date(),
        eventEffects: {},
      },
      'player-5': {
        name: 'Hoàng Văn E',
        position: 15,
        score: 187,
        diceRolls: 6,
        freeDiceRolls: 0,
        bonusMultiplier: 1,
        joinedAt: new Date(),
        eventEffects: {},
      },
      'player-6': {
        name: 'Vũ Thị F',
        position: 3,
        score: 145,
        diceRolls: 4,
        freeDiceRolls: 0,
        bonusMultiplier: 1,
        joinedAt: new Date(),
        eventEffects: {},
      },
    };
    return mockPlayersData;
  };
  
  const mockPlayers = generateMockPlayers();

  // Update leaderboard function (mock)
  const updateLeaderboard = () => {
    // Sort players by score (descending), then by position (descending)
    const playersArray = Object.entries(mockRoom.players || {}).map(([playerId, player]) => ({
      playerId,
      name: player.name,
      score: player.score || 0,
      position: player.position || 0,
    }));

    playersArray.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.position - a.position;
    });

    // Update leaderboard (in real app, this would update Firestore)
    console.log('📊 Leaderboard updated:', playersArray.map(p => `${p.name}: ${p.score} điểm`));
  };

  // Mock room data để test GameDetailsModal - tính toán động dựa trên claimedRewards
  const mockRoom: Room = {
    roomId: 'test-room',
    roomCode: 'TEST01',
    adminId: 'test-admin',
    status: gameStatus === 'playing' ? 'playing' : gameStatus === 'finished' ? 'finished' : 'waiting',
    createdAt: new Date(),
    startedAt: gameStartTime,
    endedAt: gameStatus === 'finished' ? new Date() : null,
    settings: {
      maxPlayers: 8,
      totalQuestions: 50,
      gameDuration: 600,
      totalEvents: 8,
      boardConfig: {
        totalTiles: 24,
        rewardTiles: [5, 9, 14, 19], // 5=Pepsi, 9=Kẹo, 14=Quà bí ẩn, 19=Bánh snack
      },
    },
    events: {
      activeEvent: activeEvent,
      eventHistory: [],
      remainingEvents: ALL_EVENT_TYPES.filter(e => e !== activeEvent.type),
    },
    rewards: {
      mysteryGiftBox: { 
        total: 3, 
        claimed: claimedRewards.mysteryGiftBox ? 1 : 0, 
        claimedBy: claimedRewards.mysteryGiftBox ? ['test-player'] : [],
        unlockTimes: [90, 300, 480] // Box 1: sau 1 phút 30 giây, Box 2: sau 5 phút, Box 3: sau 8 phút
      },
      pepsi: { 
        total: 8, 
        claimed: claimedRewards.pepsi ? 1 : 0, 
        claimedBy: claimedRewards.pepsi ? ['test-player'] : [],
        unlockTimes: [0, 180, 360] // 2-3-3: Sau 0s (2 rewards), 3 phút (5 rewards), 6 phút (8 rewards)
      },
      cheetos: { 
        total: 8, 
        claimed: claimedRewards.cheetos ? 1 : 0, 
        claimedBy: claimedRewards.cheetos ? ['test-player'] : [],
        unlockTimes: [60, 240, 420] // 2-3-3: Sau 1 phút (2 rewards), 4 phút (5 rewards), 7 phút (8 rewards)
      },
      candies: { 
        total: 15, 
        claimed: claimedRewards.candies ? 1 : 0, 
        claimedBy: claimedRewards.candies ? ['test-player'] : [],
        unlockTimes: [0, 120, 300, 480] // 5-5-5-0: Sau 0s (5 rewards), 2 phút (10 rewards), 5 phút (15 rewards), 8 phút (15 rewards)
      },
    },
    players: mockPlayers,
    currentQuestion: {
      questionId: null,
      question: null,
      options: null,
      correctAnswer: null,
      answeredBy: [],
    },
    leaderboard: Object.entries(mockPlayers).reduce((acc, [playerId, player]) => {
      acc[playerId] = {
        name: player.name,
        score: player.score,
        position: player.position,
      };
      return acc;
    }, {} as Record<string, { name: string; score: number; position: number }>),
  };

  const handleDiceRoll = async () => {
    if (availableRolls <= 0) {
      showToast('Bạn không còn lượt lắc! Hãy trả lời câu hỏi để nhận thêm lượt.', 'warning');
      return;
    }
    
    if (gameStatus !== 'playing') {
      showToast('Game chưa bắt đầu hoặc đã kết thúc!', 'warning');
      return;
    }
    
    setIsRollingDice(true);
    
    try {
      // Simulate dice roll (1-6)
      const originalResult = Math.floor(Math.random() * 6) + 1;
      let result = originalResult;
      
      // Apply dice_double event (không reset event, event kéo dài 75s)
      if (activeEvent.type === 'dice_double') {
        result = originalResult * 2;
        // Không reset event, để event kéo dài 75 giây
      }
      
      // Apply low_dice_penalty event (check original dice result, not final result)
      if (activeEvent.type === 'low_dice_penalty' && originalResult < 5) {
        setLowDicePenaltyPoints((prev) => prev + 3);
        showToast(`⚠️ Lắc được ${originalResult} < 5! Bị trừ 3 điểm (Low Dice Penalty!)`, 'warning');
      }
      
      setDiceHistory((prev) => [...prev, result]);
      
      // Move player forward - loop back to 0 if exceeds 23
      // Ô 24 = Ô 0 (cùng một ô), nên chỉ có 24 ô thực sự (0-23)
      const nextAbsolutePosition = playerAbsolutePosition + result;
      const newPosition = nextAbsolutePosition % 24; // 24 tiles (0-23), loop back to 0
      
      // Show notification if looping back to start
      if (nextAbsolutePosition >= 24) {
        // Player has looped back to start
        showToast(`🎉 Đã hoàn thành 1 vòng! Quay về ô ${newPosition}`, 'success');
      }
      
      // Update both absolute position (for path calculation) and modulo position (for display)
      setPlayerAbsolutePosition(nextAbsolutePosition);
      setPlayerPosition(newPosition);
      
      // Decrease available rolls
      setAvailableRolls((prev) => Math.max(0, prev - 1));
      
      // Update leaderboard after dice roll (async, like in production)
      setTimeout(() => {
        updateLeaderboard();
      }, 100);

      // Check if player landed on reward tile (sau khi animation hoàn thành)
      setTimeout(() => {
        const rewardTiles = [5, 9, 14, 19]; // 5=Pepsi, 9=Kẹo, 14=Quà bí ẩn, 19=Bánh snack
        if (isRewardTile(newPosition, rewardTiles)) {
          const rewardType = getRewardTypeByTile(newPosition);
          if (rewardType) {
            // Use functional update to get latest claimedRewards
            setClaimedRewards((prev) => {
              if (!prev[rewardType]) {
                setPendingRewardType(rewardType);
                setShowRewardModal(true);
              }
              return prev;
            });
          }
        }
      }, 1500);
    } catch (error) {
      console.error('Error rolling dice:', error);
      showToast('Lỗi khi lắc xúc xắc. Vui lòng thử lại.', 'error');
    } finally {
      setIsRollingDice(false);
    }
  };

  // Handle quiz answer - khi trả lời đúng thì +1 lượt lắc (hoặc +2 nếu có quiz_bonus)
  const handleQuizAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      const bonus = activeEvent.type === 'quiz_bonus' ? 2 : 1;
      setAvailableRolls((prev) => prev + bonus);
      showToast(`✅ Trả lời đúng! Nhận được ${bonus} lượt lắc${bonus > 1 ? ' (Quiz Bonus!)' : ''}`, 'success');
    } else {
      // Apply penalty_wrong event
      if (activeEvent.type === 'penalty_wrong') {
        // Trừ 5 điểm khi trả lời sai
        setPenaltyPoints((prev) => prev + 5);
        showToast('❌ Trả lời sai! Bị trừ 5 điểm (Giặc nội xâm!)', 'error');
      } else {
        showToast('❌ Trả lời sai! Không nhận được lượt lắc', 'warning');
      }
    }
  };

  const handleStartGame = () => {
    setGameStartTime(new Date());
    setGameStatus('playing');
    showToast('🎮 Game started! Timer begins...', 'success');
    
    // Schedule game end after 600 seconds (10 minutes)
    if (gameEndTimerRef.current) {
      clearTimeout(gameEndTimerRef.current);
    }
    gameEndTimerRef.current = setTimeout(() => {
      handleEndGame();
    }, 600 * 1000);
    
    // Update leaderboard periodically (every 5 seconds)
    if (leaderboardUpdateTimerRef.current) {
      clearInterval(leaderboardUpdateTimerRef.current);
    }
    leaderboardUpdateTimerRef.current = setInterval(() => {
      updateLeaderboard();
    }, 5000);
  };

  const handleEndGame = () => {
    setGameStatus('finished');
    updateLeaderboard(); // Final leaderboard update
    showToast('🏁 Game ended! Final leaderboard updated.', 'success');
    
    if (gameEndTimerRef.current) {
      clearTimeout(gameEndTimerRef.current);
      gameEndTimerRef.current = null;
    }
    
    if (leaderboardUpdateTimerRef.current) {
      clearInterval(leaderboardUpdateTimerRef.current);
      leaderboardUpdateTimerRef.current = null;
    }
  };

  const handleReset = () => {
    setPlayerPosition(0);
    setPlayerAbsolutePosition(0);
    setAvailableRolls(999); // Reset về 999 lượt
    setDiceHistory([]);
    setClaimedRewards({});
    setShowRewardModal(false);
    setPendingRewardType(null);
    setActiveEvent({ type: null, startedAt: null, duration: 0, data: {} });
    setPenaltyPoints(0); // Reset penalty points
    setLowDicePenaltyPoints(0); // Reset low dice penalty points
    setGameStartTime(null);
    setGameStatus('waiting');
    scoreAtEventStartRef.current = 0;
    diceHistoryAtEventStartRef.current = 0;
    hasActiveScoreEventRef.current = false;
    if (eventEndTimerRef.current) {
      clearTimeout(eventEndTimerRef.current);
      eventEndTimerRef.current = null;
    }
    if (gameEndTimerRef.current) {
      clearTimeout(gameEndTimerRef.current);
      gameEndTimerRef.current = null;
    }
    if (leaderboardUpdateTimerRef.current) {
      clearInterval(leaderboardUpdateTimerRef.current);
      leaderboardUpdateTimerRef.current = null;
    }
  };

  // Handle event trigger (for testing)
  const handleTriggerEvent = (eventType: EventType) => {
    const instantEvents: EventType[] = ['free_dice', 'lose_dice'];
    const duration = instantEvents.includes(eventType) ? 0 : 75;
    
    // Lưu điểm và số lần lắc tại thời điểm event bắt đầu (cho score_double và no_score)
    if (eventType === 'score_double' || eventType === 'no_score') {
      const currentScore = diceHistory.reduce((sum, roll) => sum + roll, 0);
      scoreAtEventStartRef.current = currentScore;
      diceHistoryAtEventStartRef.current = diceHistory.length;
      hasActiveScoreEventRef.current = true;
    }
    
    setActiveEvent({
      type: eventType,
      startedAt: new Date(),
      duration,
      data: {},
    });
    
    setShowEventNotification(true);
    
    // Apply instant event effects
    if (eventType === 'free_dice') {
      setAvailableRolls((prev) => prev + 1);
    } else if (eventType === 'lose_dice') {
      setAvailableRolls((prev) => Math.max(0, prev - 1));
    }
    
    // Auto end event after duration (if not instant)
    if (duration > 0) {
      if (eventEndTimerRef.current) {
        clearTimeout(eventEndTimerRef.current);
      }
      eventEndTimerRef.current = setTimeout(() => {
        // Khi event kết thúc, cập nhật điểm cơ sở để không bị reset
        if (eventType === 'score_double') {
          // Tính lại điểm sau event: điểm cũ + (điểm trong event * 2)
          const scoreBeforeEvent = scoreAtEventStartRef.current;
          const diceCountBeforeEvent = diceHistoryAtEventStartRef.current;
          const scoreDuringEvent = diceHistory.slice(diceCountBeforeEvent).reduce((sum, roll) => sum + roll, 0);
          const finalScoreAfterEvent = scoreBeforeEvent + (scoreDuringEvent * 2);
          // Cập nhật điểm cơ sở = điểm cuối cùng (đã tính x2)
          scoreAtEventStartRef.current = finalScoreAfterEvent;
          diceHistoryAtEventStartRef.current = diceHistory.length;
        } else if (eventType === 'no_score') {
          // Tính lại điểm sau event: điểm cũ (bỏ qua điểm trong event)
          const scoreBeforeEvent = scoreAtEventStartRef.current;
          // Điểm = điểm trước event (không cộng điểm trong event)
          // Cập nhật diceHistoryAtEventStartRef để tính điểm mới sau event
          scoreAtEventStartRef.current = scoreBeforeEvent; // Giữ nguyên điểm (không cộng điểm trong event)
          diceHistoryAtEventStartRef.current = diceHistory.length; // Cập nhật để tính điểm mới sau event
        }
        
        setActiveEvent({ type: null, startedAt: null, duration: 0, data: {} });
      }, duration * 1000);
    }
  };

  // Clear event
  const handleClearEvent = () => {
    // Khi clear event, cập nhật điểm cơ sở tương tự như khi event tự kết thúc
    if (activeEvent.type === 'score_double') {
      const scoreBeforeEvent = scoreAtEventStartRef.current;
      const diceCountBeforeEvent = diceHistoryAtEventStartRef.current;
      const scoreDuringEvent = diceHistory.slice(diceCountBeforeEvent).reduce((sum, roll) => sum + roll, 0);
      const finalScoreAfterEvent = scoreBeforeEvent + (scoreDuringEvent * 2);
      scoreAtEventStartRef.current = finalScoreAfterEvent;
      diceHistoryAtEventStartRef.current = diceHistory.length;
    } else if (activeEvent.type === 'no_score') {
      const scoreBeforeEvent = scoreAtEventStartRef.current;
      // Điểm = điểm trước event (không cộng điểm trong event)
      scoreAtEventStartRef.current = scoreBeforeEvent;
      diceHistoryAtEventStartRef.current = diceHistory.length;
    }
    
    setActiveEvent({ type: null, startedAt: null, duration: 0, data: {} });
    if (eventEndTimerRef.current) {
      clearTimeout(eventEndTimerRef.current);
      eventEndTimerRef.current = null;
    }
  };

  // Handle reward claim with unlock time check (same logic as production)
  const handleClaimReward = (rewardType: 'mysteryGiftBox' | 'pepsi' | 'cheetos' | 'candies') => {
    // Check total reward limit per player (max 2 rewards total, including MysteryBox)
    // This allows players to compete for regular rewards while waiting for MysteryBox unlock
    const allRewardTypes: Array<'mysteryGiftBox' | 'pepsi' | 'cheetos' | 'candies'> = ['mysteryGiftBox', 'pepsi', 'cheetos', 'candies'];
    
    // Count how many rewards (all types) this player has claimed
    let playerClaimedCount = 0;
    allRewardTypes.forEach(type => {
      if (claimedRewards[type]) {
        playerClaimedCount++;
      }
    });
    
    // Limit: max 2 rewards total per player (including MysteryBox)
    if (playerClaimedCount >= 2) {
      showToast('Bạn đã nhận đủ 2 phần thưởng rồi! Hãy để cơ hội cho người khác nhé! 🎁', 'warning');
      return;
    }
    
    // Check unlock time logic for all rewards (same as production)
    const reward = mockRoom.rewards[rewardType];
    if (reward.unlockTimes && reward.unlockTimes.length > 0) {
      if (!gameStartTime) {
        showToast('Game chưa bắt đầu!', 'error');
        return;
      }
      
      const unlockTimes = reward.unlockTimes || [];
      
      // Calculate elapsed time since game started (in seconds)
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - gameStartTime.getTime()) / 1000);
      
      // Check how many rewards are unlocked based on elapsed time
      const unlockedCount = unlockTimes.filter(unlockTime => elapsedSeconds >= unlockTime).length;
      
      // Check if already claimed (player can only claim once per reward type)
      const alreadyClaimed = claimedRewards[rewardType];
      if (alreadyClaimed) {
        showToast('Bạn đã nhận phần thưởng này rồi!', 'warning');
        return;
      }
      
      // Only allow claiming if there are unlocked rewards available
      // Note: reward.claimed is the number of rewards already claimed by ALL players
      // unlockedCount is the number of rewards unlocked at this time
      // We can claim if: reward.claimed < unlockedCount (there are still unlocked rewards available)
      if (reward.claimed >= unlockedCount) {
        const nextUnlockTime = unlockTimes.find(time => elapsedSeconds < time);
        if (nextUnlockTime) {
          const secondsLeft = nextUnlockTime - elapsedSeconds;
          const minutesLeft = Math.floor(secondsLeft / 60);
          const remainingSeconds = secondsLeft % 60;
          
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
          
          const rewardNames: Record<string, string> = {
            mysteryGiftBox: 'Hộp quà bí ẩn',
            pepsi: 'Pepsi',
            cheetos: 'Bánh snack',
            candies: 'Kẹo',
          };
          const rewardName = rewardNames[rewardType] || rewardType;
          
          showToast(`${rewardName} tiếp theo sẽ mở sau ${timeMessage} nữa!`, 'warning');
          return;
        } else {
          const rewardNames: Record<string, string> = {
            mysteryGiftBox: 'Hộp quà bí ẩn',
            pepsi: 'Pepsi',
            cheetos: 'Bánh snack',
            candies: 'Kẹo',
          };
          const rewardName = rewardNames[rewardType] || rewardType;
          showToast(`Tất cả ${rewardName} đã được mở!`, 'warning');
          return;
        }
      }
      
      // Log for debugging
      console.log('[TestGameBoard] Reward unlock check:', {
        rewardType,
        elapsedSeconds,
        unlockedCount,
        claimed: reward.claimed,
        canClaim: reward.claimed < unlockedCount,
      });
    }
    
    setClaimedRewards((prev) => ({
      ...prev,
      [rewardType]: true,
    }));
    setShowRewardModal(false);
    setPendingRewardType(null);
    const rewardNames: Record<string, string> = {
      mysteryGiftBox: 'Hộp quà bí ẩn',
      pepsi: 'Pepsi',
      cheetos: 'Bánh snack',
      candies: 'Kẹo',
    };
    showToast(`✅ Đã nhận phần thưởng: ${rewardNames[rewardType]}!`, 'success');
  };

  const handlePositionChange = (newPos: number) => {
    const clampedPos = Math.max(0, Math.min(23, newPos)); // Max là 23, không phải 24
    setPlayerPosition(clampedPos);
    setPlayerAbsolutePosition(clampedPos); // Set absolute position = modulo position khi dùng slider
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!clickMode || !mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setClickedPosition({ x, y });

    // If a tile is selected, update its position
    if (selectedTile !== null) {
      const newPositions = [...tilePositions];
      newPositions[selectedTile] = { x, y };
      setTilePositions(newPositions);
      setSelectedTile(null);
      setClickMode(false);
    }
  };

  const handleTileSelect = (tileIndex: number) => {
    setSelectedTile(tileIndex);
    setClickMode(true);
  };

  const cancelClickMode = () => {
    setClickMode(false);
    setSelectedTile(null);
    setClickedPosition(null);
  };

  const copyToGameBoard = () => {
    // Format code để dễ paste vào GameBoard.tsx
    const code = `// Tọa độ các ô trên map (0-23) - percentage based
// Path: Snake pattern từ 0-23
// Lưu ý: Ô 24 và ô 0 là cùng một ô (START/END), nên chỉ có 24 ô thực sự (0-23)
// Có thể điều chỉnh sau khi test với map thực tế
const TILE_POSITIONS: Array<{ x: number; y: number }> = [
${tilePositions.map((pos, i) => {
  // Format với comment rõ ràng
  if (i === 0) return `  { x: ${pos.x}, y: ${pos.y} }, // 0 - START/END`;
  if (i % 5 === 0) {
    // Mỗi 5 tiles là một row mới
    const row = Math.floor(i / 5) + 1;
    return `  { x: ${pos.x}, y: ${pos.y} }, // ${i} - Row ${row}`;
  }
  return `  { x: ${pos.x}, y: ${pos.y} }, // ${i}`;
}).join('\n')}
];`;
    
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
    
    // Hiển thị thông báo chi tiết
    showToast('✅ Đã copy tọa độ vào clipboard! Mở file GameBoard.tsx và paste vào.', 'success');
  };

  // Đồng bộ tọa độ từ GameBoard.tsx (reset về giá trị ban đầu)
  const syncFromGameBoard = () => {
    if (confirm('Bạn có chắc muốn đồng bộ tọa độ từ GameBoard.tsx?\nTất cả thay đổi trong TestGameBoard sẽ bị mất.')) {
      setTilePositions([...TILE_POSITIONS]);
      setPlayerPosition(0);
      showToast('✅ Đã đồng bộ tọa độ từ GameBoard.tsx!', 'success');
    }
  };

  // Ô 24 = Ô 0 (cùng tọa độ)
  const actualPosition = playerPosition % 24;
  const tilePos = tilePositions[actualPosition] || tilePositions[0];

  // Nếu showGameEnd, hiển thị GameEnd view với mock data
  if (showGameEnd) {
    // Create a mock room with finished status for GameEnd
    const mockRoomForEnd: Room = {
      ...mockRoom,
      status: 'finished',
      endedAt: new Date(),
      leaderboard: Object.entries(mockPlayers).reduce((acc, [playerId, player]) => {
        acc[playerId] = {
          name: player.name,
          score: player.score,
          position: player.position,
        };
        return acc;
      }, {} as Record<string, { name: string; score: number; position: number }>),
    };
    
    // Convert leaderboard to array and sort
    const leaderboardEntries = Object.entries(mockRoomForEnd.leaderboard || {})
      .map(([playerId, entry]) => ({ playerId, entry }))
      .sort((a, b) => {
        if (b.entry.score !== a.entry.score) {
          return b.entry.score - a.entry.score;
        }
        return b.entry.position - a.entry.position;
      });
    
    const top3 = leaderboardEntries.slice(0, 3);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        </div>

        {/* Back button */}
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setShowGameEnd(false)}
            className="bg-yellow-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-yellow-600 shadow-2xl flex items-center gap-2"
          >
            ← Về Game Board
          </button>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">
              🎉 GAME KẾT THÚC! 🎉
            </h1>
            <p className="text-2xl text-white/90 font-semibold">
              Phòng: <span className="text-[#FFD700] font-bold">{mockRoomForEnd.roomCode}</span>
            </p>
          </div>

          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-white text-center mb-8 drop-shadow-lg">
                TOP 3 NGƯỜI CHƠI XUẤT SẮC
              </h2>
              <div className="flex items-end justify-center gap-6 max-w-4xl mx-auto">
                {/* 2nd Place */}
                {top3[1] && (
                  <div className="flex-1 max-w-[280px] animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 rounded-2xl p-6 shadow-2xl border-4 border-white transform hover:scale-105 transition-transform">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-4"><Trophy className="w-10 h-10 text-gray-300" /></div>
                        <div className="text-5xl font-black text-white mb-2">2</div>
                        <div className="text-2xl font-bold text-white mb-2">{top3[1].entry.name}</div>
                        <div className="text-xl text-white/90 mb-1">Điểm: <span className="font-bold">{top3[1].entry.score}</span></div>
                        <div className="text-lg text-white/80">Vị trí: {top3[1].entry.position}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {top3[0] && (
                  <div className="flex-1 max-w-[320px] animate-slide-up" style={{ animationDelay: '0s' }}>
                    <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl p-8 shadow-2xl border-4 border-white transform hover:scale-105 transition-transform relative">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-black text-sm">
                          🏆 VÔ ĐỊCH
                        </div>
                      </div>
                      <div className="flex flex-col items-center text-center mt-4">
                        <div className="mb-4"><Trophy className="w-12 h-12 text-yellow-400" /></div>
                        <div className="text-6xl font-black text-white mb-2">1</div>
                        <div className="text-3xl font-bold text-white mb-2">{top3[0].entry.name}</div>
                        <div className="text-2xl text-white/90 mb-1">Điểm: <span className="font-bold">{top3[0].entry.score}</span></div>
                        <div className="text-xl text-white/80">Vị trí: {top3[0].entry.position}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                  <div className="flex-1 max-w-[280px] animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-2xl p-6 shadow-2xl border-4 border-white transform hover:scale-105 transition-transform">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-4"><Award className="w-10 h-10 text-amber-600" /></div>
                        <div className="text-5xl font-black text-white mb-2">3</div>
                        <div className="text-2xl font-bold text-white mb-2">{top3[2].entry.name}</div>
                        <div className="text-xl text-white/90 mb-1">Điểm: <span className="font-bold">{top3[2].entry.score}</span></div>
                        <div className="text-lg text-white/80">Vị trí: {top3[2].entry.position}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Full Leaderboard */}
          {leaderboardEntries.length > 0 && (
            <div className="max-w-4xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-white text-center mb-6 drop-shadow-lg">
                BẢNG XẾP HẠNG ĐẦY ĐỦ
              </h2>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-white/20">
                <div className="space-y-3">
                  {leaderboardEntries.map((item, index) => {
                    const isTop3 = index < 3;
                    const isCurrentPlayer = item.playerId === 'test-player';
                    const getRankColor = (idx: number) => {
                      if (idx === 0) return 'from-yellow-400 via-yellow-500 to-yellow-600';
                      if (idx === 1) return 'from-gray-300 via-gray-400 to-gray-500';
                      if (idx === 2) return 'from-amber-500 via-amber-600 to-amber-700';
                      return 'from-blue-500 via-blue-600 to-blue-700';
                    };
                    
                    return (
                      <div
                        key={item.playerId}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                          isTop3
                            ? `bg-gradient-to-r ${getRankColor(index)} text-white`
                            : isCurrentPlayer
                            ? 'bg-[#FFD700]/30 border-2 border-[#FFD700] text-white'
                            : 'bg-white/5 text-white hover:bg-white/10'
                        } ${isCurrentPlayer ? 'ring-4 ring-[#FFD700] ring-opacity-50' : ''}`}
                      >
                        <div className="w-12 text-center">
                          {isTop3 ? (
                            <div className="text-3xl font-black">{index + 1}</div>
                          ) : (
                            <div className="text-xl font-bold text-white/80">{index + 1}</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-lg">{item.entry.name}</div>
                          {isCurrentPlayer && (
                            <div className="text-xs text-[#FFD700] font-semibold">(Bạn)</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">Điểm: {item.entry.score}</div>
                          <div className="text-sm text-white/70">Vị trí: {item.entry.position}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CSS Animation */}
        <style>{`
          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slide-up {
            animation: slide-up 0.6s ease-out forwards;
            opacity: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-400 to-purple-600">
      {/* Map background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/map.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-md border-b-2 border-[#FFD700] p-2 md:p-4">
          <div className="container mx-auto flex items-center justify-between gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-white">TEST GAME BOARD</h1>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowDetails(true)}
                className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors"
              >
                <Info size={18} />
                Chi tiết
              </button>
              <button
                onClick={() => setShowEditor(true)}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                <Settings size={18} />
                Điều chỉnh Tọa độ
              </button>
              {clickMode ? (
                <button
                  onClick={cancelClickMode}
                  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                >
                  <X size={18} />
                  Hủy chế độ Click
                </button>
              ) : (
                <button
                  onClick={() => setClickMode(true)}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  <MousePointer2 size={18} />
                  Click để lấy tọa độ
                </button>
              )}
              <button
                onClick={copyToGameBoard}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Đã Copy!' : 'Copy vào GameBoard'}
              </button>
              <button
                onClick={syncFromGameBoard}
                className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
                title="Đồng bộ tọa độ từ GameBoard.tsx (reset về giá trị ban đầu)"
              >
                <RefreshCw size={18} />
                Đồng bộ từ GameBoard
              </button>
              <button
                onClick={() => setShowChecklist(!showChecklist)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  showChecklist
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                <ListChecks size={18} />
                {showChecklist ? 'Ẩn Checklist' : 'Hiện Checklist'}
              </button>
              <button
                onClick={gameStatus === 'playing' ? handleEndGame : handleStartGame}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  gameStatus === 'playing'
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {gameStatus === 'playing' ? 'Kết thúc Game' : 'Bắt đầu Game'}
              </button>
              <button
                onClick={handleReset}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Reset
              </button>
              <button
                onClick={() => setShowTestPanel(!showTestPanel)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  showTestPanel
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {showTestPanel ? 'Ẩn Test Panel' : 'Hiện Test Panel'}
              </button>
              <button
                onClick={() => setShowEventPanel(!showEventPanel)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  showEventPanel
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                <Zap size={18} />
                {showEventPanel ? 'Ẩn Event Panel' : 'Hiện Event Panel'}
              </button>
              <button
                onClick={() => setShowGameEnd(!showGameEnd)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  showGameEnd
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
              >
                <Trophy size={18} />
                {showGameEnd ? 'Về Game Board' : 'Xem Game End'}
              </button>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div 
          className="flex-1 relative"
          ref={mapRef}
          onClick={handleMapClick}
          style={{ cursor: clickMode ? 'crosshair' : 'default' }}
        >
          {/* Click mode overlay */}
          {clickMode && (
            <div className="absolute inset-0 bg-blue-500/10 border-4 border-blue-500 border-dashed z-50 pointer-events-none">
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg font-bold">
                {selectedTile !== null 
                  ? `Click vào vị trí cho Tile ${selectedTile}`
                  : 'Chọn tile để gán tọa độ (bên dưới)'}
              </div>
            </div>
          )}

          {/* Map */}
          <div className="absolute inset-0">
            <img
              src="/map.png"
              alt="Game Board"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Clicked position marker */}
          {clickedPosition && (
            <div
              className="absolute w-6 h-6 bg-blue-500 rounded-full border-4 border-white z-50 pointer-events-none"
              style={{
                left: `${clickedPosition.x}%`,
                top: `${clickedPosition.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                ({clickedPosition.x.toFixed(1)}%, {clickedPosition.y.toFixed(1)}%)
              </div>
            </div>
          )}

          {/* Player Token - đồng bộ với GameBoard.tsx */}
          <PlayerToken
            player={mockPlayer}
            playerId="test-player"
            playerName="Test Player"
            color={getPlayerColor(0)}
            isCurrentPlayer={true}
            currentTilePosition={tilePos}
            tilePositions={tilePositions}
            totalTiles={24}
          />

          {/* Tile markers for debugging */}
          {tilePositions.map((pos, index) => {
            // Ô 24 = Ô 0 (cùng tọa độ)
            const isCurrentPosition = (index === playerPosition) || (playerPosition === 24 && index === 0);
            return (
              <div
                key={index}
                className={`absolute rounded-full border-2 transition-all ${
                  isCurrentPosition
                    ? 'bg-green-500 border-green-700 w-6 h-6'
                    : selectedTile === index
                    ? 'bg-yellow-500 border-yellow-700 w-8 h-8 ring-4 ring-yellow-300'
                    : 'bg-red-500/50 border-red-700 w-4 h-4'
                } ${clickMode ? 'cursor-pointer hover:scale-125' : ''}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: selectedTile === index ? 20 : 10,
                }}
                title={`Tile ${index}${index === 0 ? ' (START/END)' : ''} - Click để chọn`}
                onClick={(e) => {
                  if (clickMode) {
                    e.stopPropagation();
                    handleTileSelect(index);
                  }
                }}
              >
                {clickMode && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
                    {index}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Controls - đồng bộ với GameBoard.tsx */}
        <div className="bg-black/70 backdrop-blur-md border-t-2 border-[#FFD700] p-4">
          <div className="container mx-auto flex items-center justify-center gap-4 md:gap-6 flex-wrap">
            {/* Quiz Button */}
            <button
              onClick={() => setShowQuiz(true)}
              className="flex items-center gap-2 md:gap-3 bg-gradient-to-r from-[#1E90FF] to-[#4169E1] text-white px-4 md:px-8 py-2 md:py-4 rounded-xl font-bold text-sm md:text-lg hover:scale-105 hover:shadow-2xl transition-all shadow-lg"
            >
              <BookOpen size={24} />
              TÌM LƯỢT LẮC
            </button>

            {/* Dice Roll */}
            <SimpleDiceRoll
              onRoll={handleDiceRoll}
              disabled={availableRolls <= 0 || gameStatus !== 'playing' || isRollingDice}
              availableRolls={availableRolls}
            />
          </div>
        </div>

        {/* Test Panel - Collapsible panel cho test controls */}
        {showTestPanel && (
          <div className="bg-black/80 backdrop-blur-md border-t-2 border-blue-500 p-4 max-h-[50vh] overflow-y-auto">
            <div className="container mx-auto">
              {/* Tile selector for click mode */}
              {clickMode && (
                <div className="mb-4 bg-white/10 rounded-xl p-4">
                  <div className="text-white font-semibold mb-3 text-center">
                    Chọn tile để gán tọa độ (click vào marker trên map hoặc chọn bên dưới):
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Array.from({ length: 24 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => handleTileSelect(i)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                          selectedTile === i
                            ? 'bg-yellow-500 text-black scale-110'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Test Controls - chỉ hiện khi không có click mode */}
              {!clickMode && (
                <div className="flex items-center justify-center gap-8 mb-4 flex-wrap">
                  {/* Position Control */}
                  <div className="bg-white/10 rounded-xl p-4">
                    <label className="block text-white font-semibold mb-2">
                      Vị trí: {playerPosition}/23
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="23"
                      value={playerPosition}
                      onChange={(e) => handlePositionChange(parseInt(e.target.value))}
                      className="w-48"
                    />
                    <div className="flex justify-between text-xs text-gray-300 mt-1">
                      <span>0</span>
                      <span>23</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="bg-white/10 rounded-xl p-4 text-white min-w-[200px]">
                    <div className="text-sm mb-2">
                      <strong>Điểm:</strong> {mockPlayer.score}
                    </div>
                    <div className="text-sm mb-2">
                      <strong>Vị trí:</strong> {playerPosition}/23
                    </div>
                    <div className="text-sm mb-2">
                      <strong>Tọa độ:</strong>
                      <div className="text-xs mt-1">
                        X: {tilePos.x.toFixed(1)}%
                      </div>
                      <div className="text-xs">
                        Y: {tilePos.y.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-sm mt-2 pt-2 border-t border-white/20">
                      <strong>Lượt còn:</strong> {availableRolls.toLocaleString()}
                    </div>
                    <div className="text-xs mt-1 text-gray-300">
                      Đã lắc: {diceHistory.length} lần
                    </div>
                  </div>
                  
                  {/* Reward Unlock Test Panel */}
                  {gameStartTime && (
                    <div className="bg-purple-500/20 rounded-xl p-4 text-white min-w-[280px] border border-purple-500">
                      <div className="text-sm font-bold mb-2 text-purple-300">
                        🔓 Reward Unlock Status
                      </div>
                      {(() => {
                        const now = new Date();
                        const elapsedSeconds = Math.floor((now.getTime() - gameStartTime.getTime()) / 1000);
                        
                        const rewardTypes: Array<'mysteryGiftBox' | 'pepsi' | 'cheetos' | 'candies'> = ['mysteryGiftBox', 'pepsi', 'cheetos', 'candies'];
                        const rewardNames: Record<string, string> = {
                          mysteryGiftBox: 'MysteryBox',
                          pepsi: 'Pepsi',
                          cheetos: 'Cheetos',
                          candies: 'Candies',
                        };
                        
                        return (
                          <>
                            <div className="text-xs mb-3 pb-2 border-b border-purple-400/30">
                              <strong>Thời gian:</strong> {Math.floor(elapsedSeconds / 60)} phút {elapsedSeconds % 60} giây
                            </div>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                              {rewardTypes.map(rewardType => {
                                const reward = mockRoom.rewards[rewardType];
                                const unlockTimes = reward.unlockTimes || [];
                                const unlockedCount = unlockTimes.filter(time => elapsedSeconds >= time).length;
                                const claimed = reward.claimed;
                                const canClaim = !claimedRewards[rewardType] && claimed < unlockedCount;
                                
                                return (
                                  <div key={rewardType} className="text-xs bg-purple-500/10 rounded p-2">
                                    <div className="font-semibold text-purple-200 mb-1">
                                      {rewardNames[rewardType]}
                                    </div>
                                    <div className="text-gray-300">
                                      <div>Unlocked: {unlockedCount}/{unlockTimes.length}</div>
                                      <div>Claimed: {claimed}/{reward.total}</div>
                                      <div className={canClaim ? 'text-green-400' : 'text-red-400'}>
                                        {canClaim ? '✅ Can Claim' : '❌ Cannot Claim'}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Dice History */}
              {diceHistory.length > 0 && (
                <div className="mt-4 bg-white/10 rounded-xl p-4">
                  <div className="text-white font-semibold mb-2">Lịch sử lắc:</div>
                  <div className="flex gap-2 flex-wrap">
                    {diceHistory.map((result, index) => (
                      <div
                        key={index}
                        className="bg-[#FFD700] text-[#b30000] w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Test Checklist */}
              {showChecklist && (
                <div className="mt-4">
                  <TestChecklist
                    onComplete={() => {
                      setShowChecklist(false);
                      showToast('✅ Bạn đã sẵn sàng! Copy tọa độ vào GameBoard.tsx.', 'success');
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Player Score - Top Right Corner - đồng bộ với GameBoard.tsx */}
        <div className="fixed top-16 md:top-20 right-2 md:right-4 bg-[#FFD700]/90 backdrop-blur-md rounded-xl p-3 md:p-4 border-2 border-[#b30000] shadow-2xl z-30">
          <div className="text-center">
            <div className="text-[#b30000] font-bold text-sm mb-1">
              {mockPlayer.name}
            </div>
            <div className="text-[#b30000] font-black text-2xl md:text-3xl">
              {mockPlayer.score}
            </div>
            <div className="text-[#b30000] text-xs font-semibold">
              ĐIỂM
            </div>
            {/* Event Effects Indicator */}
            <div className="mt-2">
              <EventEffectsIndicator player={mockPlayer} />
            </div>
          </div>
        </div>
      </div>

      {/* Game Details Modal - đồng bộ với GameBoard.tsx */}
      <GameDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        room={mockRoom}
        currentPlayerId="test-player"
      />

      {/* Quiz Modal */}
      <QuizModal
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        onAnswer={handleQuizAnswer}
      />

      {/* Reward Claim Modal */}
      {showRewardModal && pendingRewardType && (
        <RewardClaimModal
          isOpen={showRewardModal}
          onClose={() => {
            setShowRewardModal(false);
            setPendingRewardType(null);
          }}
          onClaim={() => handleClaimReward(pendingRewardType)}
          rewardType={pendingRewardType}
        />
      )}

      {/* Reward Notification */}
      <RewardNotification
        room={mockRoom}
        currentPlayerId="test-player"
      />

      {/* Event Notification */}
      <EventNotification
        eventType={activeEvent.type}
        isOpen={showEventNotification}
        onClose={() => setShowEventNotification(false)}
        duration={activeEvent.duration}
      />

      {/* Event Timer */}
      {activeEvent.type && activeEvent.duration > 0 && (
        <EventTimer
          activeEvent={activeEvent}
          gameStartedAt={new Date()}
        />
      )}

      {/* Game Timer */}
      <GameTimer room={mockRoom} />
      
      {/* Toast Container */}
      <ToastContainer />

      {/* Event Management Panel */}
      {showEventPanel && (
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
          {activeEvent.type && (
            <div className="mb-4 p-3 bg-purple-500/20 rounded-lg border border-purple-500">
              <div className="text-white font-semibold mb-2">Event đang active:</div>
              <div className="text-purple-300 font-bold">{activeEvent.type}</div>
              {activeEvent.duration > 0 && (
                <div className="text-purple-200 text-sm mt-1">
                  Duration: {activeEvent.duration}s
                </div>
              )}
              <button
                onClick={handleClearEvent}
                className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Clear Event
              </button>
            </div>
          )}

          {/* Event Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {ALL_EVENT_TYPES.map((eventType) => (
              <button
                key={eventType}
                onClick={() => handleTriggerEvent(eventType)}
                disabled={activeEvent.type === eventType}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeEvent.type === eventType
                    ? 'bg-purple-600 text-white cursor-not-allowed opacity-50'
                    : 'bg-purple-500 text-white hover:bg-purple-600 hover:scale-105'
                }`}
              >
                {eventType.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          {/* Event Effects Info */}
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <div className="text-white text-xs">
              <div className="font-semibold mb-1">Event Effects:</div>
              <div className="space-y-1 text-gray-300">
                <div>• dice_double: Lần lắc tiếp theo x2</div>
                <div>• score_double: Mỗi ô +2 điểm</div>
                <div>• quiz_bonus: Trả lời đúng +2 lượt</div>
                <div>• free_dice: +1 lượt miễn phí</div>
                <div>• penalty_wrong: Trả lời sai -5 điểm</div>
                <div>• lose_dice: -1 lượt lắc</div>
                <div>• no_score: Di chuyển không cộng điểm</div>
                <div>• low_dice_penalty: Lắc &lt; 5 thì -3 điểm</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tile Position Editor */}
      {showEditor && (
        <TilePositionEditor
          positions={tilePositions}
          onSave={(newPositions) => {
            setTilePositions(newPositions);
            // Reset position to 0 when positions change
            setPlayerPosition(0);
          }}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}

// Reward Claim Modal Component (for test)
interface RewardClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim: () => void;
  rewardType: 'mysteryGiftBox' | 'pepsi' | 'cheetos' | 'candies';
}

function RewardClaimModal({ isOpen, onClose, onClaim, rewardType }: RewardClaimModalProps) {
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
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600"
            >
              Bỏ qua
            </button>
            <button
              onClick={() => {
                onClaim();
                onClose();
              }}
              className="px-6 py-2 bg-[#FFD700] text-[#b30000] rounded-lg font-semibold hover:scale-105"
            >
              Nhận ngay!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

