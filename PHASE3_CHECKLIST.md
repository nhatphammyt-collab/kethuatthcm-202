# 📋 PHASE 3 CHECKLIST - MINIGAME IMPLEMENTATION

## ✅ ĐÃ HOÀN THÀNH (Phase 1 & 2)

### Phase 1: Setup & Lobby ✅
- ✅ Bước 1: Setup Firebase & Types
- ✅ Bước 2: Admin - Tạo Phòng (AdminCreateRoom.tsx)
- ✅ Bước 3: Player - Tham Gia Phòng (PlayerJoinRoom.tsx)
- ✅ Bước 4: Lobby Room (LobbyRoom.tsx)

### Phase 2: Game Board UI ✅
- ✅ Bước 5: Game Board - UI (GameBoard.tsx với map background)
- ✅ Bước 6: Player Token & Movement (PlayerToken.tsx với animation mượt mà)
- ✅ SimpleDiceRoll component (UI đã có)
- ✅ GameDetailsModal component (hiển thị rewards và leaderboard)
- ✅ Tọa độ tiles đã được setup (TILE_POSITIONS)

---

## 🎯 TỔNG QUAN PHASE 3

Phase 3 tập trung vào việc implement các tính năng game logic chính:
- Quiz System (hệ thống câu hỏi)
- Dice Roll System (hệ thống lắc xúc xắc) - **Kết nối với Firebase**
- Reward System (hệ thống phần thưởng)
- Event System (hệ thống sự kiện)
- Game Flow Logic (luồng chơi)
- Leaderboard & Game End (bảng xếp hạng và kết thúc game)

---

## ✅ BƯỚC 7: QUIZ SYSTEM (3-4 giờ)

### Component & UI
- [ ] Component `QuestionCard` - Hiển thị câu hỏi và 4 đáp án
- [ ] Component `QuizModal` - Modal popup khi click "TÌM LƯỢT LẮC"
- [ ] Loading state khi đang tải câu hỏi
- [ ] Animation khi trả lời đúng/sai

### Logic & Firebase
- ✅ Hàm `getRandomQuestion()` trong `gameService.ts` - **Đã có** (dòng 247-268)
- [ ] Hàm `answerQuestion()` trong `gameService.ts` - Xử lý khi player trả lời (cần implement)
- [ ] Update `room.currentQuestion` trong Firestore
- [ ] Track `answeredBy` để tránh trả lời lại
- [ ] Khi trả lời đúng → +1 lượt lắc (`diceRolls += 1`)
- [ ] Khi trả lời sai → Hiển thị thông báo, không có lượt lắc

### Integration
- [ ] Kết nối nút "TÌM LƯỢT LẮC" với QuizModal
- [ ] Disable nút khi đã trả lời câu hỏi hiện tại
- [ ] Real-time sync: Tất cả players thấy câu hỏi mới cùng lúc

---

## ✅ BƯỚC 8: DICE ROLL SYSTEM (2-3 giờ)

### Component & UI
- ✅ Component `SimpleDiceRoll` - **Đã có** (UI hoàn chỉnh)
- ✅ Animation lắc xúc xắc - **Đã có**
- ✅ Hiển thị số lượt còn lại - **Đã có**
- ✅ Animation di chuyển nhân vật - **Đã có** (mượt mà qua từng ô)

### Logic & Firebase
- [ ] Hàm `rollDice()` trong `gameService.ts` - Random 1-6
- [ ] Hàm `updatePlayerPosition()` trong `gameService.ts` - Cập nhật vị trí player
- [ ] Xử lý loop: Khi position >= 24 → về 0
- [ ] Update `player.position` trong Firestore
- [ ] Update `player.score` (cộng điểm khi di chuyển)
- [ ] Update `player.diceRolls` (giảm số lượt sau khi lắc)
- [ ] Xử lý Event `dice_double`: Nhân đôi kết quả nếu có

### Integration
- [ ] Kết nối `SimpleDiceRoll` với `handleDiceRoll` trong `GameBoard.tsx` - **Cần kết nối với Firebase**
- [ ] Disable nút khi `diceRolls <= 0` và `freeDiceRolls <= 0` - **UI đã có, cần logic**
- ✅ Animation di chuyển nhân vật - **Đã có** (PlayerToken với path animation)
- [ ] Check reward tile sau khi di chuyển - **Cần implement**

---

## ✅ BƯỚC 9: REWARD SYSTEM (3-4 giờ)

### Component & UI
- [ ] Component `RewardNotification` - Popup thông báo khi nhận reward (giống FCO jackpot)
- [ ] Update `GameDetailsModal` - Hiển thị số lượng reward còn lại real-time
- [ ] Hiển thị danh sách người đã nhận reward
- [ ] Animation khi reward được claim

### Logic & Firebase
- [ ] Hàm `claimReward()` trong `gameService.ts` - Claim reward khi dừng ở reward tile
- [ ] Check reward tile: Sử dụng `getRewardTypeByTile()` và `isRewardTile()`
- [ ] Atomic operation: Check `rewards[type].claimed < rewards[type].total` trước khi claim
- [ ] Update `rewards[type].claimed` và `rewards[type].claimedBy` trong Firestore
- [ ] Xử lý khi hết reward: Hiển thị "Đã có người nhận"
- [ ] Log reward claim vào `gameLogs`

### Integration
- [ ] Tự động check reward tile sau khi di chuyển
- [ ] Hiển thị notification cho tất cả players khi có người nhận
- [ ] Update `GameDetailsModal` real-time khi reward thay đổi

---

## ✅ BƯỚC 10: EVENT SYSTEM (5-6 giờ)

### Component & UI
- [ ] Component `EventNotification` - Popup/toast lớn hiển thị event mới
- [ ] Component `EventTimer` - Badge đếm ngược thời gian event
- [ ] Component `EventEffectsIndicator` - Icon hiển thị effects đang active
- [ ] Hiển thị event history (optional)

### Logic & Firebase
- [ ] Hàm `triggerEvent()` trong `gameService.ts` - Trigger event tại thời gian đã định
- [ ] Hàm `calculateEventTimes()` - Đã có trong `gameHelpers.ts`
- [ ] Timer system: Check thời gian và trigger events tự động
- [ ] Update `room.events.activeEvent` trong Firestore
- [ ] Update `room.events.eventHistory` khi event kết thúc
- [ ] Shuffle events: Random thứ tự 8 events khi game start

### Event Types Implementation

#### Event 1: Dice × 2
- [ ] Set `players[playerId].eventEffects.diceDouble = true`
- [ ] Lần lắc tiếp theo nhân đôi kết quả (1-6 → 2-12)
- [ ] Reset về `false` sau khi lắc xong

#### Event 2: Score × 2
- [ ] Set `players[playerId].eventEffects.scoreDouble = true` cho tất cả players
- [ ] Mỗi ô đi được cộng +2 điểm thay vì +1
- [ ] Duration: ~75 giây hoặc đến khi event tiếp theo

#### Event 3: Quiz Bonus
- [ ] Trả lời đúng quiz → nhận +2 lượt lắc (thay vì +1)
- [ ] Update logic trong `answerQuestion()`
- [ ] Duration: ~75 giây

#### Event 4: Free Dice
- [ ] Tất cả players: `freeDiceRolls += 1`
- [ ] Hiển thị số lượt miễn phí trên UI
- [ ] Cho phép dùng lượt miễn phí không cần trả lời quiz
- [ ] Instant event (không có duration)

#### Event 5: "Giặc nội xâm" Penalty
- [ ] Ai trả lời sai quiz → `score -= 5` (không xuống dưới 0)
- [ ] Hiển thị animation penalty khi trả lời sai
- [ ] Duration: ~75 giây

#### Event 6: Lose Dice
- [ ] Tất cả players: `diceRolls = Math.max(0, diceRolls - 1)`
- [ ] Hiển thị thông báo "Mất 1 lượt lắc"
- [ ] Instant event (không có duration)

#### Event 7: No Score
- [ ] Set `players[playerId].eventEffects.noScore = true` cho tất cả
- [ ] Di chuyển không cộng điểm trong thời gian này
- [ ] Duration: ~75 giây

#### Event 8: Low Dice Penalty
- [ ] Check mỗi lần lắc xúc sắc
- [ ] Nếu kết quả < 3 → `score -= 1` (không xuống dưới 0)
- [ ] Duration: ~75 giây

### Event Management
- [ ] Event queue: Quản lý thứ tự events (random nhưng đảm bảo đủ 8)
- [ ] Event cleanup: Reset effects khi event kết thúc
- [ ] Real-time sync: Tất cả players thấy event cùng lúc
- [ ] Handle edge cases: Nhiều events có thể active cùng lúc (theo design thì không)

---

## ✅ BƯỚC 11: GAME FLOW LOGIC (4-5 giờ)

### Component
- [ ] Component `GameController` - Quản lý luồng chơi tổng thể
- [ ] Component `GameTimer` - Đếm ngược thời gian game (10 phút)

### Logic & Firebase
- [ ] Turn-based system (lượt chơi) - Optional, có thể bỏ nếu không cần
- [ ] Luồng chơi: Trả lời câu hỏi → Lắc xúc sắc → Di chuyển → Check phần thưởng
- [ ] Xử lý khi hết câu hỏi: Lấy câu hỏi mới hoặc kết thúc game
- [ ] Xử lý khi hết thời gian: Tự động kết thúc game
- [ ] Update `room.leaderboard` real-time sau mỗi lần di chuyển
- [ ] Sort players theo score (số ô đã đi)

### Integration
- [ ] Kết nối tất cả components với GameController
- [ ] Real-time sync leaderboard
- [ ] Auto-end game khi hết thời gian

---

## ✅ BƯỚC 12: LEADERBOARD & GAME END (2-3 giờ)

### Component & UI
- [ ] Component `Leaderboard` - Hiển thị real-time (có thể dùng trong GameDetailsModal)
- [ ] Component `GameEnd` - Màn hình kết thúc game
- [ ] Hiển thị Top 3 với animation
- [ ] Hiển thị tất cả players với score và position
- [ ] Nút "Chơi lại" hoặc "Về trang chủ"

### Logic & Firebase
- [ ] Hàm `endGame()` trong `gameService.ts` - Kết thúc game
- [ ] Update `room.status = 'finished'` và `room.endedAt` trong Firestore
- [ ] Tính toán và lưu final leaderboard
- [ ] Sort players theo score (descending)

### Integration
- [ ] Navigate đến GameEnd khi game kết thúc
- [ ] Hiển thị leaderboard trong GameDetailsModal (real-time)
- [ ] Animation khi hiển thị Top 3

---

## ✅ BƯỚC 13: POLISH & TESTING (3-4 giờ)

### UI/UX
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states cho tất cả actions
- [ ] Error handling và error messages
- [ ] Animation smooth cho tất cả interactions
- [ ] Sound effects (optional)

### Testing
- [ ] Test với nhiều players cùng lúc (2-8 players)
- [ ] Test tất cả 8 events
- [ ] Test reward system với nhiều players
- [ ] Test loop logic (từ 23 về 0)
- [ ] Test edge cases (hết reward, hết câu hỏi, etc.)
- [ ] Test real-time sync giữa nhiều browsers

### Performance
- [ ] Optimize Firestore queries
- [ ] Debounce cho các update thường xuyên
- [ ] Lazy load components nếu cần
- [ ] Memoize calculations

---

## 📝 NOTES

### Thứ tự ưu tiên implement:
1. **Quiz System** (Bước 7) - Cần để có lượt lắc
2. **Dice Roll System** (Bước 8) - Cần để di chuyển
3. **Reward System** (Bước 9) - Cần để có phần thưởng
4. **Game Flow Logic** (Bước 11) - Cần để game chạy được
5. **Leaderboard & Game End** (Bước 12) - Cần để kết thúc game
6. **Event System** (Bước 10) - Có thể làm sau, nhưng nên làm sớm để test
7. **Polish & Testing** (Bước 13) - Làm cuối cùng

### Dependencies cần thêm (optional):
```json
{
  "framer-motion": "^10.x", // Cho animations
  "zustand": "^4.x" // State management (optional)
}
```

### Files đã có sẵn (Phase 1-2):
- ✅ `src/pages/minigame/AdminCreateRoom.tsx`
- ✅ `src/pages/minigame/PlayerJoinRoom.tsx`
- ✅ `src/pages/minigame/LobbyRoom.tsx`
- ✅ `src/pages/minigame/GameBoard.tsx` (UI đã có, cần kết nối logic)
- ✅ `src/components/minigame/PlayerToken.tsx` (Animation mượt mà đã có)
- ✅ `src/components/minigame/SimpleDiceRoll.tsx` (UI đã có)
- ✅ `src/components/minigame/GameDetailsModal.tsx` (UI đã có)
- ✅ `src/services/firebase/gameService.ts` (Có một số hàm cơ bản)
- ✅ `src/types/game.ts` (Types đã đầy đủ)
- ✅ `src/utils/gameHelpers.ts` (Có helper functions cơ bản)

### Files cần tạo mới (Phase 3):
- [ ] `src/components/minigame/QuestionCard.tsx`
- [ ] `src/components/minigame/QuizModal.tsx`
- [ ] `src/components/minigame/RewardNotification.tsx`
- [ ] `src/components/minigame/EventNotification.tsx`
- [ ] `src/components/minigame/EventTimer.tsx`
- [ ] `src/components/minigame/EventEffectsIndicator.tsx`
- [ ] `src/components/minigame/GameController.tsx`
- [ ] `src/components/minigame/GameTimer.tsx`
- [ ] `src/components/minigame/Leaderboard.tsx` (hoặc dùng trong GameDetailsModal)
- [ ] `src/pages/minigame/GameEnd.tsx`

### Files cần update (Phase 3):
- [ ] `src/pages/minigame/GameBoard.tsx` - Kết nối tất cả logic (quiz, dice, reward, events)
- [ ] `src/services/firebase/gameService.ts` - Thêm các hàm: `rollDice()`, `updatePlayerPosition()`, `answerQuestion()`, `claimReward()`, `triggerEvent()`, `endGame()`
- [ ] `src/utils/gameHelpers.ts` - Có thể cần thêm helper functions cho events

---

## 🎯 MỤC TIÊU PHASE 3

Sau khi hoàn thành Phase 3, game sẽ có đầy đủ tính năng:
- ✅ Players có thể trả lời câu hỏi để lấy lượt lắc
- ✅ Players có thể lắc xúc sắc và di chuyển
- ✅ Players có thể nhận phần thưởng khi dừng ở reward tile
- ✅ Game có 8 events ngẫu nhiên trong 10 phút
- ✅ Game có leaderboard real-time
- ✅ Game tự động kết thúc sau 10 phút
- ✅ Hiển thị Top 3 khi game kết thúc

---

**Tổng thời gian ước tính: 20-25 giờ làm việc**

