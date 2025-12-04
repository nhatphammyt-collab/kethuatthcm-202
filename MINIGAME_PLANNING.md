# 🎮 MINIGAME PLANNING - "LẦN THEO CHÂN BÁC"

## 📊 ĐÁNH GIÁ TÍNH KHẢ THI: ✅ HOÀN TOÀN KHẢ THI

---

## 🗂️ CẤU TRÚC FIREBASE FIRESTORE

### 1. Collection: `rooms`
```typescript
{
  roomId: string (document ID),
  roomCode: string, // Mã phòng 6 ký tự
  adminId: string,
  status: 'waiting' | 'playing' | 'finished',
  createdAt: timestamp,
  startedAt: timestamp | null,
  endedAt: timestamp | null,
  settings: {
    maxPlayers: number,
    totalQuestions: number,
    gameDuration: number, // Thời gian game (giây) - mặc định 600 (10 phút)
    totalEvents: number, // Tổng số events - mặc định 8
    boardConfig: {
      totalTiles: number,
      rewardTiles: number[] // [5, 10, 15, 20] - các ô có phần thưởng
    }
  },
  events: {
    activeEvent: {
      type: string | null, // 'dice_double' | 'score_double' | 'quiz_bonus' | 'free_dice' | 'penalty_wrong' | 'lose_dice' | 'no_score' | 'low_dice_penalty'
      startedAt: timestamp | null,
      duration: number, // Thời gian sự kiện kéo dài (giây)
      data: any // Dữ liệu bổ sung cho từng loại event
    },
    eventHistory: Array<{
      type: string,
      startedAt: timestamp,
      endedAt: timestamp,
      data: any
    }>,
    remainingEvents: string[] // Danh sách events chưa diễn ra
  },
  rewards: {
    mysteryGiftBox: { total: 1, claimed: 0, claimedBy: [] }, // Hộp quà bí ẩn
    pepsi: { total: 5, claimed: 0, claimedBy: [] },
    cheetos: { total: 5, claimed: 0, claimedBy: [] },
    candies: { total: 10, claimed: 0, claimedBy: [] }
  },
  players: {
    [playerId]: {
      name: string,
      position: number, // Vị trí hiện tại trên bàn cờ (0-24)
      score: number, // Số ô đã đi
      diceRolls: number, // Số lần đã lắc xúc sắc
      freeDiceRolls: number, // Số lượt lắc miễn phí (từ events)
      bonusMultiplier: number, // Hệ số nhân điểm (từ events)
      joinedAt: timestamp,
      eventEffects: {
        // Các hiệu ứng đang active từ events
        diceDouble: boolean, // Event 1: Lần lắc tiếp theo x2
        scoreDouble: boolean, // Event 2: Mỗi ô đi được +2 điểm
        noScore: boolean, // Event 7: Di chuyển không cộng điểm
      }
    }
  },
  currentQuestion: {
    questionId: string | null,
    question: string | null,
    options: string[] | null,
    correctAnswer: number | null,
    answeredBy: string[] // Danh sách playerId đã trả lời
  },
  leaderboard: {
    [playerId]: {
      name: string,
      score: number,
      position: number
    }
  }
}
```

### 2. Collection: `questions`
```typescript
{
  questionId: string (document ID),
  question: string,
  options: string[], // 4 lựa chọn
  correctAnswer: number, // 0-3
  category: string, // "Tư tưởng HCM", "Văn hóa", etc.
  difficulty: 'easy' | 'medium' | 'hard',
  createdAt: timestamp
}
```

### 3. Collection: `gameLogs`
```typescript
{
  logId: string (document ID),
  roomId: string,
  playerId: string,
  action: 'join' | 'answer' | 'dice' | 'move' | 'reward',
  data: any,
  timestamp: timestamp
}
```

---

## 🎯 CÁC COMPONENT CẦN TẠO

### Phase 1: Setup & Lobby
1. **AdminCreateRoom.tsx** - Admin tạo phòng
2. **PlayerJoinRoom.tsx** - Người chơi nhập mã và tên
3. **LobbyRoom.tsx** - Phòng chờ hiển thị danh sách người chơi
4. **RoomCodeDisplay.tsx** - Hiển thị mã phòng

### Phase 2: Game Board
5. **GameBoard.tsx** - Bàn cờ chính (isometric)
6. **PlayerToken.tsx** - Nhân vật di chuyển
7. **DiceRoll.tsx** - Component lắc xúc sắc
8. **RewardDashboard.tsx** - Dashboard phần thưởng bên phải
9. **TileComponent.tsx** - Component cho mỗi ô trên bàn cờ

### Phase 3: Quiz System
10. **QuestionCard.tsx** - Hiển thị câu hỏi
11. **AnswerOptions.tsx** - 4 lựa chọn
12. **AnswerResult.tsx** - Kết quả sau khi trả lời

### Phase 4: Event System
13. **EventSystem.tsx** - Hệ thống quản lý sự kiện toàn phòng
14. **EventNotification.tsx** - Hiển thị thông báo sự kiện
15. **EventTimer.tsx** - Timer đếm ngược cho sự kiện
16. **EventEffects.tsx** - Xử lý hiệu ứng của từng sự kiện

### Phase 5: Game Flow
17. **GameController.tsx** - Điều khiển luồng game
18. **TurnIndicator.tsx** - Hiển thị lượt của ai
19. **Leaderboard.tsx** - Bảng xếp hạng
20. **GameEnd.tsx** - Màn hình kết thúc với Top 3

---

## 📋 PLANNING CHI TIẾT TỪNG BƯỚC

### **BƯỚC 1: Setup Firebase & Types** (1-2 giờ)
- [ ] Tạo types/interfaces cho Room, Player, Question
- [ ] Tạo Firebase service functions (createRoom, joinRoom, etc.)
- [ ] Setup Firestore rules (security)
- [ ] Tạo helper functions (generateRoomCode, etc.)

### **BƯỚC 2: Admin - Tạo Phòng** (2-3 giờ)
- [ ] Component AdminCreateRoom
- [ ] Form tạo phòng (có thể set số câu hỏi, số người chơi tối đa)
- [ ] Generate mã phòng 6 ký tự (unique)
- [ ] Tạo room document trong Firestore
- [ ] Navigate đến LobbyRoom với role admin

### **BƯỚC 3: Player - Tham Gia Phòng** (2-3 giờ)
- [ ] Component PlayerJoinRoom
- [ ] Input mã phòng và tên
- [ ] Validate mã phòng tồn tại
- [ ] Thêm player vào room.players
- [ ] Navigate đến LobbyRoom với role player

### **BƯỚC 4: Lobby Room** (2-3 giờ)
- [ ] Component LobbyRoom
- [ ] Real-time listener cho room document
- [ ] Hiển thị danh sách players
- [ ] Admin có nút "Bắt đầu game"
- [ ] Khi admin bắt đầu → update room.status = 'playing'

### **BƯỚC 5: Game Board - UI** (4-5 giờ)
- [ ] Component GameBoard với isometric view
- [ ] Render 25 tiles theo tọa độ
- [ ] Component TileComponent (normal, reward, start, end)
- [ ] Hiển thị map game từ hình ảnh bạn cung cấp
- [ ] CSS cho isometric perspective

### **BƯỚC 6: Player Token & Movement** (3-4 giờ)
- [ ] Component PlayerToken với hình nhân vật
- [ ] Animation di chuyển từ tile này sang tile khác
- [ ] Tính toán tọa độ dựa trên position (0-24)
- [ ] Hiển thị tên player dưới token
- [ ] Màu sắc khác nhau cho mỗi player

### **BƯỚC 7: Quiz System** (3-4 giờ)
- [ ] Component QuestionCard
- [ ] Lấy câu hỏi ngẫu nhiên từ collection questions
- [ ] Component AnswerOptions (4 buttons)
- [ ] Xử lý khi player chọn đáp án
- [ ] Update currentQuestion trong room
- [ ] Component AnswerResult (đúng/sai)

### **BƯỚC 8: Dice Roll System** (2-3 giờ)
- [ ] Component DiceRoll với animation
- [ ] Random số 1-6
- [ ] Chỉ cho phép lắc khi đã trả lời đúng câu hỏi
- [ ] Update player position sau khi lắc
- [ ] Animation di chuyển token

### **BƯỚC 9: Reward System** (3-4 giờ)
- [ ] Component RewardDashboard (bên phải màn hình)
- [ ] Real-time hiển thị số lượng phần thưởng còn lại
- [ ] Khi player dừng ở ô phần thưởng:
  - Check xem còn phần thưởng không
  - Nếu còn → player nhận, update rewards.claimed
  - Nếu hết → hiển thị "Đã có người nhận"
- [ ] Animation thông báo khi có người nhận (giống FCO jackpot)
- [ ] Hiển thị danh sách người đã nhận

### **BƯỚC 10: Event System - Sự Kiện Toàn Phòng** (5-6 giờ)
- [ ] Component EventSystem
- [ ] Timer system: Tính toán thời gian trigger events (chia đều trong 10 phút)
- [ ] Random event selector: Chọn ngẫu nhiên từ 8 events chưa diễn ra
- [ ] Component EventNotification (popup/toast hiển thị event)
- [ ] Component EventTimer (đếm ngược thời gian event)
- [ ] Logic xử lý từng loại event:

  **Event 1: Dice × 2**
  - [ ] Set `players[playerId].eventEffects.diceDouble = true`
  - [ ] Lần lắc tiếp theo nhân đôi kết quả
  - [ ] Sau khi lắc xong → reset về false

  **Event 2: Score × 2**
  - [ ] Set `players[playerId].eventEffects.scoreDouble = true` cho tất cả players
  - [ ] Mỗi ô đi được cộng +2 điểm thay vì +1
  - [ ] Duration: ~75 giây hoặc đến khi event tiếp theo

  **Event 3: Quiz Bonus**
  - [ ] Trả lời đúng quiz → nhận +2 lượt lắc (thay vì +1)
  - [ ] Update logic trong QuestionCard component
  - [ ] Duration: ~75 giây (hoặc đến khi event tiếp theo)

  **Event 4: Free Dice**
  - [ ] Tất cả players: `freeDiceRolls += 1`
  - [ ] Hiển thị số lượt miễn phí trên UI
  - [ ] Cho phép dùng lượt miễn phí không cần trả lời quiz

  **Event 5: "Giặc nội xâm" Penalty**
  - [ ] Ai trả lời sai quiz → `score -= 5` (không xuống dưới 0)
  - [ ] Hiển thị animation penalty khi trả lời sai
  - [ ] Duration: ~75 giây (hoặc đến khi event tiếp theo)

  **Event 6: Lose Dice**
  - [ ] Tất cả players: `diceRolls = Math.max(0, diceRolls - 1)`
  - [ ] Hiển thị thông báo "Mất 1 lượt lắc"
  - [ ] Instant event (không có duration)

  **Event 7: No Score**
  - [ ] Set `players[playerId].eventEffects.noScore = true` cho tất cả
  - [ ] Di chuyển không cộng điểm trong thời gian này
  - [ ] Duration: ~75 giây (hoặc đến khi event tiếp theo)

  **Event 8: Low Dice Penalty**
  - [ ] Check mỗi lần lắc xúc sắc
  - [ ] Nếu kết quả < 3 → `score -= 1` (không xuống dưới 0)
  - [ ] Duration: ~75 giây (hoặc đến khi event tiếp theo)

- [ ] Event queue: Quản lý thứ tự events (random nhưng đảm bảo đủ 8)
- [ ] Event cleanup: Reset effects khi event kết thúc
- [ ] Real-time sync: Tất cả players thấy event cùng lúc

### **BƯỚC 11: Game Flow Logic** (4-5 giờ)
- [ ] Component GameController
- [ ] Turn-based system (lượt chơi)
- [ ] Luồng: Trả lời câu hỏi → Lắc xúc sắc → Di chuyển → Check phần thưởng
- [ ] Xử lý khi hết câu hỏi hoặc đạt tile cuối
- [ ] Update leaderboard real-time

### **BƯỚC 12: Leaderboard & Game End** (2-3 giờ)
- [ ] Component Leaderboard (hiển thị real-time)
- [ ] Sort players theo score (số ô đã đi)
- [ ] Component GameEnd
- [ ] Hiển thị Top 3 với animation
- [ ] Nút "Chơi lại" hoặc "Về trang chủ"

### **BƯỚC 13: Polish & Testing** (3-4 giờ)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states
- [ ] Error handling
- [ ] Sound effects (optional)
- [ ] Animation smooth
- [ ] Test với nhiều players cùng lúc

---

## 🎨 DESIGN CONSIDERATIONS

### Isometric Board
- Sử dụng CSS transform: `rotateX(60deg) rotateY(-45deg)` hoặc SVG
- Tọa độ tile: tính toán từ position (0-24) → x, y, z
- Animation di chuyển: smooth transition giữa các tiles

### Real-time Updates
- Sử dụng `onSnapshot` của Firestore cho real-time
- Optimize: chỉ listen những field cần thiết
- Debounce cho các update thường xuyên

### Performance
- Lazy load components
- Memoize calculations
- Virtual scrolling nếu có nhiều players

---

## 🔧 TECHNICAL STACK

- **Frontend**: React + TypeScript + Tailwind CSS
- **State Management**: React Context hoặc Zustand (optional)
- **Real-time**: Firebase Firestore `onSnapshot`
- **Animations**: CSS transitions + Framer Motion (optional)
- **Routing**: React Router (đã có)

---

## 📦 DEPENDENCIES CẦN THÊM

```json
{
  "framer-motion": "^10.x", // Cho animations (optional)
  "zustand": "^4.x" // State management (optional)
}
```

---

## ⚠️ CHALLENGES & SOLUTIONS

### Challenge 1: Real-time Sync
**Solution**: Sử dụng Firestore `onSnapshot` với proper cleanup

### Challenge 2: Turn-based Logic
**Solution**: Queue system trong room document, mỗi player có turn order

### Challenge 3: Reward Distribution
**Solution**: Atomic operations trong Firestore, check trước khi claim

### Challenge 4: Isometric Rendering
**Solution**: CSS transforms hoặc canvas/SVG library

### Challenge 5: Event Timing & Synchronization
**Problem**: Đảm bảo tất cả players thấy event cùng lúc
**Solution**: 
- Sử dụng `startedAt` timestamp trong Firestore
- Client tính toán thời gian còn lại dựa trên server time
- Fallback: Nếu client time lệch → sync với server

### Challenge 6: Event Effects Stacking
**Problem**: Nhiều events có thể active cùng lúc (theo design thì không, nhưng cần handle edge cases)
**Solution**: 
- Priority system: Event mới override event cũ nếu conflict
- Clear documentation về event interactions
- Test cases cho mọi combination

### Challenge 7: Random Event Order
**Problem**: Đảm bảo đủ 8 events, không trùng lặp
**Solution**: 
- Shuffle array 8 events khi game start
- Store trong `remainingEvents`
- Remove sau mỗi event trigger

---

## 🎯 CHI TIẾT EVENT SYSTEM

### Event Types & Logic

```typescript
type EventType = 
  | 'dice_double'        // Event 1: Lắc x2
  | 'score_double'       // Event 2: Điểm x2
  | 'quiz_bonus'         // Event 3: Quiz đúng +2 lượt
  | 'free_dice'          // Event 4: +1 lượt miễn phí
  | 'penalty_wrong'      // Event 5: Trả lời sai -5 điểm
  | 'lose_dice'          // Event 6: Mất 1 lượt
  | 'no_score'           // Event 7: Di chuyển không cộng điểm
  | 'low_dice_penalty';  // Event 8: Lắc < 3 trừ 1 điểm
```

### Event Timing Logic

```typescript
// Game duration: 10 phút = 600 giây
// Total events: 8
// Event interval: ~75 giây (600 / 8 = 75)
// Event times: [75s, 150s, 225s, 300s, 375s, 450s, 525s, 570s]
// (Event cuối cùng sớm hơn 30s để tránh trùng với game end)

const calculateEventTimes = (gameDuration: number, totalEvents: number) => {
  // Chia đều thời gian cho 8 events
  const interval = Math.floor(gameDuration / (totalEvents + 1)); // +1 để có khoảng cách đều
  const events = [];
  
  for (let i = 1; i <= totalEvents; i++) {
    const eventTime = interval * i;
    // Event cuối cùng sớm hơn 30s so với game end
    if (i === totalEvents) {
      events.push(Math.max(eventTime - 30, interval * (totalEvents - 1) + 30));
    } else {
      events.push(eventTime);
    }
  }
  
  return events;
};

// Ví dụ với gameDuration = 600, totalEvents = 8:
// interval = 600 / 9 = 66.67 ≈ 67
// Events: [67s, 134s, 201s, 268s, 335s, 402s, 469s, 570s]
```

**Cân bằng thời gian:**
- **Game duration**: 10 phút = 600 giây
- **Total events**: 8 events
- **Event interval**: ~67-75 giây (chia đều)
- **8 events** được phân bố đều trong suốt game
- **Event cuối cùng**: Trigger tại 570s (30s trước khi game end)

**Bảng thời gian events (ví dụ):**
| Event # | Thời gian trigger | Khoảng cách |
|---------|-------------------|-------------|
| 1       | 67s (1:07)        | -           |
| 2       | 134s (2:14)       | 67s         |
| 3       | 201s (3:21)       | 67s         |
| 4       | 268s (4:28)       | 67s         |
| 5       | 335s (5:35)       | 67s         |
| 6       | 402s (6:42)       | 67s         |
| 7       | 469s (7:49)       | 67s         |
| 8       | 570s (9:30)       | 101s*       |

*Event cuối cùng cách event trước đó lâu hơn để đảm bảo có đủ thời gian trước khi game end.

**Lưu ý:**
- Thời gian có thể điều chỉnh trong `settings.gameDuration` và `settings.totalEvents`
- Events được shuffle random nhưng vẫn trigger đúng thời gian trên
- Mỗi event có duration ~75 giây hoặc đến khi event tiếp theo trigger

### Event Implementation Flow

1. **Game Start**: 
   - Khởi tạo `remainingEvents` với 8 events
   - Shuffle random
   - Set timer cho event đầu tiên

2. **Event Trigger**:
   - Khi đến thời gian → chọn event đầu tiên trong `remainingEvents`
   - Remove khỏi `remainingEvents`
   - Update `activeEvent` trong Firestore
   - Hiển thị notification cho tất cả players

3. **Event Active**:
   - Apply effects cho tất cả players
   - Timer đếm ngược (~75 giây hoặc đến event tiếp theo)
   - Real-time sync qua Firestore

4. **Event End**:
   - Cleanup effects
   - Set `activeEvent = null`
   - Trigger event tiếp theo (nếu còn)

### Event UI Components

- **EventNotification**: Popup/toast lớn hiển thị event mới
- **EventTimer**: Badge hiển thị thời gian còn lại
- **EventEffectsIndicator**: Icon hiển thị effects đang active
- **EventHistory**: Sidebar hiển thị lịch sử events (optional)

---

## 🚀 ESTIMATED TIME: 40-50 giờ làm việc (đã bao gồm Event System)

---

## 📝 NEXT STEPS

1. Bạn cung cấp hình ảnh Map game và nhân vật
2. Tôi sẽ bắt đầu implement từ Bước 1
3. Test từng phase trước khi chuyển sang phase tiếp theo

