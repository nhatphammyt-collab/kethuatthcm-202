# 🧪 HƯỚNG DẪN TESTING MINIGAME

## 📋 Checklist Testing

### ✅ Phase 1: Basic Functionality
- [ ] Tạo phòng thành công (Admin)
- [ ] Join phòng thành công (Player)
- [ ] Hiển thị danh sách players trong lobby
- [ ] Start game thành công
- [ ] Game timer hoạt động đúng

### ✅ Phase 2: Quiz System
- [ ] Mở Quiz Modal khi click "Tìm lượt lắc"
- [ ] Hiển thị câu hỏi và 4 đáp án
- [ ] Timer 10 giây hoạt động đúng
- [ ] Trả lời đúng → +1 lượt lắc (hoặc +2 nếu có quiz_bonus)
- [ ] Trả lời sai → không nhận lượt lắc
- [ ] Không thể đóng modal bằng "X" (đã xóa)

### ✅ Phase 3: Dice Roll System
- [ ] Click "Lắc xúc xắc" → Random 1-6
- [ ] Nhân vật di chuyển đúng tọa độ
- [ ] Animation "bouncing" mượt mà
- [ ] Loop từ tile 23 về tile 0 hoạt động đúng
- [ ] Điểm số cộng đúng (1 điểm/ô)
- [ ] Lượt lắc giảm sau mỗi lần lắc

### ✅ Phase 4: Reward System
- [ ] Dừng ở ô reward → Hiện modal nhận phần thưởng
- [ ] Nhận phần thưởng thành công
- [ ] Số lượng phần thưởng giảm đúng
- [ ] Hiển thị notification khi có người nhận phần thưởng
- [ ] Không thể nhận phần thưởng đã hết

### ✅ Phase 5: Event System
- [ ] Event tự động trigger đúng thời gian
- [ ] Event notification hiển thị đúng
- [ ] Event timer hiển thị đúng (không đè lên Game timer)
- [ ] **dice_double**: Lần lắc tiếp theo x2 (kéo dài 75s)
- [ ] **score_double**: Điểm x2 (chỉ áp dụng điểm kiếm được trong event)
- [ ] **quiz_bonus**: Trả lời đúng +2 lượt
- [ ] **free_dice**: +1 lượt miễn phí
- [ ] **penalty_wrong**: Trả lời sai -5 điểm
- [ ] **lose_dice**: -1 lượt lắc
- [ ] **no_score**: Di chuyển không cộng điểm
- [ ] **low_dice_penalty**: Lắc < 5 trừ 3 điểm

### ✅ Phase 6: Game Flow
- [ ] Game tự động kết thúc sau 10 phút
- [ ] Leaderboard update real-time
- [ ] Navigate đến GameEnd khi game kết thúc
- [ ] Top 3 hiển thị đúng với animation
- [ ] Full leaderboard hiển thị đúng

### ✅ Phase 7: UI/UX
- [ ] Toast notifications hoạt động đúng
- [ ] Loading states hiển thị đúng
- [ ] Error handling hoạt động đúng
- [ ] Responsive design trên mobile/tablet/desktop
- [ ] Timers không bị đè lên nhau

### ✅ Phase 8: Performance
- [ ] Không có lag khi nhiều players
- [ ] Animation mượt mà
- [ ] Real-time sync hoạt động tốt

## 🎮 Test Scenarios

### Scenario 1: Single Player Test
1. Tạo phòng (Admin)
2. Join phòng (Player)
3. Start game
4. Trả lời quiz → Nhận lượt lắc
5. Lắc xúc xắc → Di chuyển
6. Dừng ở reward tile → Nhận phần thưởng
7. Chờ game kết thúc → Xem leaderboard

### Scenario 2: Multi-Player Test (2-8 players)
1. Tạo phòng (Admin)
2. Nhiều players join
3. Start game
4. Tất cả players lắc xúc xắc
5. Kiểm tra real-time sync
6. Kiểm tra leaderboard update

### Scenario 3: Event Test
1. Start game
2. Chờ event trigger
3. Test từng event type
4. Kiểm tra event effects
5. Kiểm tra event timer

### Scenario 4: Edge Cases
1. Hết lượt lắc → Không thể lắc
2. Hết phần thưởng → Không thể nhận
3. Game đã kết thúc → Không thể lắc
4. Loop từ 23 về 0 → Di chuyển đúng

## 🐛 Known Issues
- (Chưa có)

## 📝 Notes
- Test trên nhiều browsers: Chrome, Firefox, Safari, Edge
- Test trên mobile và desktop
- Test với nhiều players cùng lúc
- Test real-time sync giữa nhiều browsers

