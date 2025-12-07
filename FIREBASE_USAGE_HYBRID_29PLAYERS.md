# 📊 PHÂN TÍCH FIREBASE USAGE - HYBRID OPTIMIZATION (29 PLAYERS / 5 PHÚT)

## ✅ ĐÃ TRIỂN KHAI: Hybrid Events + Polling

### **Cách hoạt động:**
1. **Events:** Real-time cho TẤT CẢ players (cần để quiz answers check đúng)
2. **Updates khác:** 
   - Admin: Real-time (cần để trigger events)
   - Players: Polling mỗi 3 giây (tiết kiệm reads)

### **An toàn với Events:**
- ✅ Events real-time → Quiz answers luôn check đúng
- ✅ Admin real-time → Trigger events không bị ảnh hưởng
- ✅ Polling chỉ cho updates thông thường (position, score)

---

## 🎮 Giả định Gameplay (29 Players / 5 Phút)

**Thông số:**
- **Số players:** 29
- **Thời gian game:** 5 phút (300 giây)
- **Dice rolls/player:** ~38 lần (tối đa với cooldown 7s)
- **Quiz/player:** ~38 quiz (1 quiz/roll để có lượt lắc)
- **Events:** 8 events trong game
- **Rewards:** Tối đa 29 players × 2 = 58 claims
- **Leaderboard update:** Mỗi 30 giây = 10 lần

---

## 📈 CHI TIẾT TỪNG LOẠI OPERATION (SAU HYBRID)

### 1. **Events Subscription (Real-time - TẤT CẢ players)**
- **Setup:** 29 players × 1 event listener = 29 listeners
- **Reads:** Mỗi khi event thay đổi, tất cả 29 listeners nhận update
- **Số event changes:** 8 events × 2 (trigger + end) = 16 changes
- **Reads:** 16 changes × 29 listeners = **464 reads**

### 2. **Room Subscription (Real-time - CHỈ admin)**
- **Setup:** 1 admin × 1 full listener = 1 listener
- **Reads:** Mỗi khi room document thay đổi, 1 listener nhận update
- **Số writes:** 988 dice + 198 quiz + 10 leaderboard + 16 events + 58 rewards + 2 start/end = **1,272 writes**
- **Reads:** 1,272 writes × 1 listener = **1,272 reads**

### 3. **Room Polling (Players - 28 players)**
- **Setup:** 28 players × polling mỗi 3 giây
- **Số polls:** 28 players × (300s ÷ 3s) = 28 × 100 = **2,800 polls**
- **Reads:** 2,800 polls × 1 read/poll = **2,800 reads**

### 4. **Questions Cache** ⚡ TỐI ƯU
- **Load cache:** 1 lần khi game bắt đầu = ~100 reads
- **Lấy câu hỏi:** Tất cả từ cache, **KHÔNG gọi Firebase** = 0 reads

### 5. **Dice Rolls** ⚡ ĐÃ BỎ LOGS
- **Số lượng:** 29 players × 38 rolls = **1,102 rolls**
- **Writes:** 1,102 writes
- **Reads từ listeners:** 
  - Admin real-time: 1,102 writes × 1 listener = **1,102 reads**
  - Players polling: 0 (đã tính trong polling)

### 6. **Quiz Answers** ⚡ BATCH UPDATES
- **Số lượng:** 29 players × 38 quiz = **1,102 quiz**
- **Sau batch:** 
  - Giả sử trung bình 5 quiz/batch (trong 500ms)
  - Số batch: 1,102 ÷ 5 = **~221 batches**
  - Mỗi batch: 1 write + 1 read (đọc room để check event)
  - **Writes:** ~221 writes
  - **Reads:** ~221 reads (để check event)
  - **Reads từ listeners:**
    - Admin real-time: 221 writes × 1 listener = **221 reads**
    - Players polling: 0 (đã tính trong polling)

### 7. **Leaderboard Updates** ⚡ GIẢM TẦN SUẤT
- **Số lần:** 10 lần (mỗi 30s trong 5 phút)
- **Writes:** 10 writes
- **Reads:** 
  - getRoomById: 10 reads
  - Admin real-time: 10 writes × 1 listener = **10 reads**
  - Players polling: 0 (đã tính trong polling)

### 8. **Events**
- **Số lượng:** 8 events × 2 operations (trigger + end) = **16 operations**
- **Writes:** 16 writes
- **Reads từ listeners:**
  - Event listeners: 16 writes × 29 listeners = **464 reads** (đã tính ở trên)
  - Admin real-time: 16 writes × 1 listener = **16 reads**

### 9. **Rewards (Claims)**
- **Số lượng:** Tối đa 58 claims (29 players × 2 rewards)
- **Writes:** 58 writes
- **Reads từ listeners:**
  - Admin real-time: 58 writes × 1 listener = **58 reads**
  - Players polling: 0 (đã tính trong polling)

### 10. **Game Start/End**
- **Writes:** 2 writes (start + end)
- **Reads từ listeners:**
  - Admin real-time: 2 writes × 1 listener = **2 reads**
  - Players polling: 0 (đã tính trong polling)

### 11. **Player Join**
- **Writes:** 29 writes (mỗi player join)
- **Reads từ listeners:**
  - Admin real-time: 29 writes × 1 listener = **29 reads**
  - Players polling: 0 (đã tính trong polling)

### 12. **Room Creation**
- **Writes:** 1 write
- **Reads:** 0 (chưa có listeners)

---

## 📊 TỔNG KẾT FIREBASE USAGE (SAU HYBRID)

### **READS:**
| Loại | Số lượng |
|------|----------|
| Events subscription (real-time) | 464 |
| Admin room subscription (real-time) | 1,272 |
| Players polling (3s interval) | 2,800 |
| Questions cache load | 100 |
| Batch quiz reads (check event) | 221 |
| Leaderboard getRoomById | 10 |
| **TỔNG READS** | **~4,867** |

### **WRITES:**
| Loại | Số lượng |
|------|----------|
| Dice rolls | 1,102 |
| Quiz answers (batched) | ~221 |
| Leaderboard updates | 10 |
| Events | 16 |
| Rewards | 58 |
| Game start/end | 2 |
| Player join | 29 |
| Room creation | 1 |
| **TỔNG WRITES** | **~1,439** |

---

## ✅ SO SÁNH TRƯỚC VÀ SAU HYBRID

### **TRƯỚC HYBRID (29 players):**
- **Reads:** ~39,000/game (ước tính: 29 × 1,344 reads từ listeners)
- **Writes:** ~1,439/game
- **Số game/ngày:** 50,000 ÷ 39,000 = **~1.28 games** (≈ 1 game)

### **SAU HYBRID:**
- **Reads:** ~4,867/game
- **Writes:** ~1,439/game
- **Số game/ngày:** 
  - Theo Reads: 50,000 ÷ 4,867 = **~10.3 games** (≈ 10 games)
  - Theo Writes: 20,000 ÷ 1,439 = **~13.9 games**

### **Kết luận:** 
✅ **Giảm 87.5% reads!** - Có thể chơi **~10 games/ngày** với 29 players mỗi game

---

## 🎯 PHÂN TÍCH CHI TIẾT

### **Tại sao Reads giảm nhiều?**

**Trước:**
- 29 listeners × 1,272 writes = **36,888 reads** (từ room subscription)

**Sau:**
- 1 listener (admin) × 1,272 writes = **1,272 reads**
- 28 players × 100 polls = **2,800 reads**
- 29 listeners × 16 event changes = **464 reads**
- **Tổng:** ~4,536 reads (giảm 88%)

### **Breakdown Reads:**
- **Polling:** 2,800 reads (58%) - Chấp nhận được
- **Admin real-time:** 1,272 reads (26%) - Cần thiết
- **Events real-time:** 464 reads (10%) - Cần thiết cho quiz
- **Batch quiz reads:** 221 reads (5%) - Cần thiết để check event
- **Khác:** 10 reads (0.2%)

---

## 💡 TÁC ĐỘNG ĐẾN UX

### **An toàn (không ảnh hưởng logic):**
- ✅ Events real-time → Quiz answers luôn check đúng
- ✅ Admin real-time → Trigger events không bị ảnh hưởng
- ✅ Dice rolls của mình: Tức thì (local state)

### **Chấp nhận được (trễ nhẹ):**
- 🟡 Vị trí players: Trễ 0-3s (không ảnh hưởng gameplay)
- 🟡 Điểm số: Trễ 0-3s (không ảnh hưởng gameplay)
- 🟡 Leaderboard: Trễ 0-3s (không ảnh hưởng gameplay)

### **Không ảnh hưởng:**
- ✅ Events: Real-time → Không trễ
- ✅ Quiz answers: Check event từ real-time → Đúng
- ✅ Dice rolls của mình: Tức thì

---

## 📈 SO SÁNH VỚI CÁC PHƯƠNG ÁN

| Phương án | Reads/game | Giảm | Số game/ngày | UX Impact |
|-----------|------------|------|--------------|-----------|
| **Không tối ưu** | ~39,000 | 0% | ~1 game | Real-time |
| **Batch Quiz only** | ~39,000 | 0% | ~1 game | Real-time |
| **Hybrid Events+Polling** | ~4,867 | **87.5%** | **~10 games** | Trễ 3s updates |
| **Polling thuần** | ~2,800 | 93% | ~18 games | Trễ 3s, có thể lỗi event |

---

## ✅ KẾT LUẬN

### **Hybrid Events + Polling:**
- ✅ Giảm **87.5% reads** (39,000 → 4,867)
- ✅ An toàn với events (real-time)
- ✅ Tăng **10x** số game/ngày (1 → 10 games)
- ✅ Trễ 3s chấp nhận được cho updates thông thường
- ✅ Không ảnh hưởng logic game

### **Với 29 players:**
- **Reads:** ~4,867/game
- **Writes:** ~1,439/game
- **Số game/ngày:** ~10 games
- **Giới hạn:** Vẫn bởi READS, nhưng đã tối ưu tối đa

---

**Cập nhật:** Sau khi triển khai Hybrid Events + Polling optimization với 29 players.

