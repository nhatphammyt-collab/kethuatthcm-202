// Game Types and Interfaces

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export type EventType = 
  | 'dice_double'        // Event 1: Lắc x2
  | 'score_double'       // Event 2: Điểm x2
  | 'quiz_bonus'         // Event 3: Quiz đúng +2 lượt
  | 'free_dice'          // Event 4: +1 lượt miễn phí
  | 'penalty_wrong'      // Event 5: Trả lời sai -5 điểm
  | 'lose_dice'          // Event 6: Mất 1 lượt
  | 'no_score'           // Event 7: Di chuyển không cộng điểm
  | 'low_dice_penalty';  // Event 8: Lắc < 5 trừ 3 điểm

export interface GameSettings {
  maxPlayers: number;
  totalQuestions: number;
  gameDuration: number; // Thời gian game (giây) - mặc định 600 (10 phút)
  totalEvents: number; // Tổng số events - mặc định 8
  diceCooldown: number; // ⚡ Thời gian chờ giữa các lần lắc xúc xắc (giây) - mặc định 7
  boardConfig: {
    totalTiles: number;
    rewardTiles: number[]; // [5, 10, 15, 20] - các ô có phần thưởng
  };
}

export interface Reward {
  total: number;
  claimed: number;
  claimedBy: string[]; // Danh sách playerId đã nhận
  unlockTimes?: number[]; // Thời gian unlock từng phần thưởng (giây) - áp dụng cho tất cả reward types
  // Ví dụ: [0, 180, 360] = Unlock 1 phần sau 0s, unlock thêm sau 3 phút, unlock thêm sau 6 phút
  // Số lượng unlock = số unlockTimes <= elapsedSeconds
}

export interface Rewards {
  mysteryGiftBox: Reward;
  pepsi: Reward;
  cheetos: Reward;
  candies: Reward;
}

export interface Player {
  name: string;
  position: number; // Vị trí hiện tại trên bàn cờ (0-23, modulo 24)
  absolutePosition: number; // Vị trí tuyệt đối (không modulo) để tính path animation đúng
  score: number; // Số ô đã đi
  diceRolls: number; // Số lần đã lắc xúc sắc
  freeDiceRolls: number; // Số lượt lắc miễn phí (từ events)
  bonusMultiplier: number; // Hệ số nhân điểm (từ events)
  joinedAt: any; // Firestore timestamp
  lastDiceRollTime?: any; // ⚡ Firestore timestamp của lần lắc xúc xắc cuối cùng
  eventEffects: {
    diceDouble: boolean; // Event 1: Lần lắc tiếp theo x2
    scoreDouble: boolean; // Event 2: Mỗi ô đi được +2 điểm
    noScore: boolean; // Event 7: Di chuyển không cộng điểm
  };
}

export interface ActiveEvent {
  type: EventType | null;
  startedAt: any | null; // Firestore timestamp
  duration: number; // Thời gian sự kiện kéo dài (giây)
  data: any; // Dữ liệu bổ sung cho từng loại event
}

export interface EventHistoryItem {
  type: EventType;
  startedAt: any; // Firestore timestamp
  endedAt: any; // Firestore timestamp
  data: any;
}

export interface RoomEvents {
  activeEvent: ActiveEvent;
  eventHistory: EventHistoryItem[];
  remainingEvents: EventType[]; // Danh sách events chưa diễn ra
}

export interface CurrentQuestion {
  questionId: string | null;
  question: string | null;
  options: string[] | null;
  correctAnswer: number | null;
  answeredBy: string[]; // Danh sách playerId đã trả lời
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  position: number;
}

export interface Room {
  roomId: string; // Document ID
  roomCode: string; // Mã phòng 6 ký tự
  adminId: string;
  status: RoomStatus;
  createdAt: any; // Firestore timestamp
  startedAt: any | null; // Firestore timestamp
  endedAt: any | null; // Firestore timestamp
  settings: GameSettings;
  rewards: Rewards;
  players: Record<string, Player>; // { [playerId]: Player }
  currentQuestion: CurrentQuestion;
  leaderboard: Record<string, LeaderboardEntry>; // { [playerId]: LeaderboardEntry }
  events: RoomEvents;
}

export interface Question {
  questionId: string; // Document ID
  question: string;
  options: string[]; // 4 lựa chọn
  correctAnswer: number; // 0-3
  category: string; // "Tư tưởng HCM", "Văn hóa", etc.
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: any; // Firestore timestamp
}

export interface GameLog {
  logId: string; // Document ID
  roomId: string;
  playerId: string;
  action: 'join' | 'answer' | 'dice' | 'move' | 'reward' | 'event';
  data: any;
  timestamp: any; // Firestore timestamp
}

// Default values
// ⚡ TỐI ƯU FIREBASE: Giảm game từ 10 phút xuống 5 phút
// Tiết kiệm ~50% Firebase reads/writes!
export const DEFAULT_SETTINGS: GameSettings = {
  maxPlayers: 50,
  totalQuestions: 20,
  gameDuration: 300, // ⚡ 5 phút thay vì 10 phút
  totalEvents: 8,
  diceCooldown: 7, // ⚡ Cooldown 7 giây giữa các lần lắc xúc xắc
  boardConfig: {
    totalTiles: 24, // 24 ô thực sự (0-23), ô 24 = ô 0 (cùng một ô)
    rewardTiles: [5, 9, 14, 19], // Các ô có phần thưởng: 5=Pepsi, 9=Kẹo, 14=Quà bí ẩn, 19=Bánh snack
  },
};

// ⚡ TỐI ƯU: Điều chỉnh unlockTimes cho phù hợp 5 phút
// Giữ nguyên tỷ lệ unlock so với tổng thời gian game
export const DEFAULT_REWARDS: Rewards = {
  mysteryGiftBox: { 
    total: 3, 
    claimed: 0, 
    claimedBy: [],
    // Box 1: 1 phút, Box 2: 2.5 phút, Box 3: 4 phút
    unlockTimes: [60, 150, 240]
  },
  pepsi: { 
    total: 8, 
    claimed: 0, 
    claimedBy: [],
    // Unlock: 0s, 1.5 phút, 3 phút
    unlockTimes: [0, 90, 180]
  },
  cheetos: { 
    total: 8, 
    claimed: 0, 
    claimedBy: [],
    // Unlock: 30s, 2 phút, 3.5 phút
    unlockTimes: [30, 120, 210]
  },
  candies: { 
    total: 15, 
    claimed: 0, 
    claimedBy: [],
    // Unlock: 0s, 1 phút, 2.5 phút, 4 phút
    unlockTimes: [0, 60, 150, 240]
  },
};

export const ALL_EVENT_TYPES: EventType[] = [
  'dice_double',
  'score_double',
  'quiz_bonus',
  'free_dice',
  'penalty_wrong',
  'lose_dice',
  'no_score',
  'low_dice_penalty',
];

