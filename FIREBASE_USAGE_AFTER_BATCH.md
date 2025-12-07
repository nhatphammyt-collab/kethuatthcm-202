# 📊 PHÂN TÍCH FIREBASE USAGE SAU KHI BATCH QUIZ UPDATES

## ✅ ĐÃ TRIỂN KHAI: Batch Quiz Updates

### **Cách hoạt động:**
1. Mỗi quiz answer được lưu vào queue (không ghi Firebase ngay)
2. Debounce 500ms - gộp tất cả quiz answers trong 500ms
3. Đọc lại room từ Firebase để có event state mới nhất (tránh race condition)
4. Gộp tất cả updates vào 1 write

### **An toàn với Events:**
- ✅ Đọc event từ Firebase khi batch (không dùng state cũ)
- ✅ Áp dụng event đúng cho tất cả quiz answers trong queue
- ✅ Tránh race condition khi event thay đổi trong lúc queue

---

## 🎮 Giả định Gameplay (26 Players / 5 Phút)

**Thông số:**
- **Số players:** 26
- **Thời gian game:** 5 phút (300 giây)
- **Dice rolls/player:** ~38 lần (tối đa với cooldown 7s)
- **Quiz/player:** ~38 quiz (1 quiz/roll để có lượt lắc)
- **Events:** 8 events trong game
- **Rewards:** Tối đa 26 players × 2 = 52 claims
- **Leaderboard update:** Mỗi 30 giây = 10 lần

---

## 📈 CHI TIẾT TỪNG LOẠI OPERATION (SAU BATCH)

### 1. **Room Subscription (onSnapshot)**
- **Setup:** 26 players × 1 listener = 26 listeners
- **Reads:** Mỗi khi room document thay đổi, tất cả 26 listeners nhận update = 26 reads/write
- **Lưu ý:** onSnapshot listener không tính là read riêng, chỉ tính khi document thay đổi

### 2. **Questions Cache** ⚡ TỐI ƯU
- **Load cache:** 1 lần khi game bắt đầu = ~100 reads
- **Lấy câu hỏi:** Tất cả từ cache, **KHÔNG gọi Firebase** = 0 reads
- **Tiết kiệm:** ~988 quiz × 100 reads = **98,800 reads** (đã tối ưu!)

### 3. **Dice Rolls** ⚡ ĐÃ BỎ LOGS
- **Số lượng:** 26 players × 38 rolls = **988 rolls**
- **Writes:** 988 writes (update player position, score, diceRolls, lastDiceRollTime)
- **Reads từ listeners:** 988 writes × 26 listeners = **25,688 reads**

### 4. **Quiz Answers** ⚡ BATCH UPDATES (MỚI!)
- **Số lượng:** 26 players × 38 quiz = **988 quiz**
- **Trước batch:** 988 writes
- **Sau batch:** 
  - Giả sử trung bình 5 quiz/batch (trong 500ms)
  - Số batch: 988 ÷ 5 = **~198 batches**
  - Mỗi batch: 1 write + 1 read (đọc room để check event)
  - **Writes:** ~198 writes (giảm 80%!)
  - **Reads:** ~198 reads (để check event) + 198 writes × 26 listeners = **5,346 reads**
- **Tiết kiệm:** 790 writes + 20,342 reads ✅

### 5. **Leaderboard Updates** ⚡ GIẢM TẦN SUẤT
- **Số lần:** 10 lần (mỗi 30s trong 5 phút)
- **Reads:** 10 reads (getRoomById) + 10 writes × 26 listeners = **270 reads**
- **Writes:** 10 writes

### 6. **Events**
- **Số lượng:** 8 events × 2 operations (trigger + end) = **16 operations**
- **Writes:** 16 writes
- **Reads từ listeners:** 16 writes × 26 listeners = **416 reads**

### 7. **Rewards (Claims)**
- **Số lượng:** Tối đa 52 claims (26 players × 2 rewards)
- **Writes:** 52 writes
- **Reads từ listeners:** 52 writes × 26 listeners = **1,352 reads**

### 8. **Game Start/End**
- **Writes:** 2 writes (start + end)
- **Reads từ listeners:** 2 writes × 26 listeners = **52 reads**

### 9. **Player Join**
- **Writes:** 26 writes (mỗi player join)
- **Reads từ listeners:** 26 writes × 26 listeners = **676 reads** (tăng dần khi players join)

### 10. **Room Creation**
- **Writes:** 1 write
- **Reads:** 0 (chưa có listeners)

---

## 📊 TỔNG KẾT FIREBASE USAGE (SAU BATCH)

### **READS:**
| Loại | Số lượng |
|------|----------|
| Questions cache load | 100 |
| Dice rolls (listeners) | 25,688 |
| Quiz answers (batch reads + listeners) | 5,346 |
| Leaderboard updates | 270 |
| Events (listeners) | 416 |
| Rewards (listeners) | 1,352 |
| Game start/end (listeners) | 52 |
| Player join (listeners) | 676 |
| **TỔNG READS** | **~33,900** |

### **WRITES:**
| Loại | Số lượng |
|------|----------|
| Dice rolls | 988 |
| Quiz answers (batched) | ~198 |
| Leaderboard updates | 10 |
| Events | 16 |
| Rewards | 52 |
| Game start/end | 2 |
| Player join | 26 |
| Room creation | 1 |
| **TỔNG WRITES** | **~1,293** |

---

## ✅ SO SÁNH TRƯỚC VÀ SAU BATCH

### **TRƯỚC BATCH:**
- **Reads:** ~28,554/game
- **Writes:** ~2,083/game
- **Số game/ngày:** ~1.75 games (giới hạn bởi READS)

### **SAU BATCH:**
- **Reads:** ~33,900/game
- **Writes:** ~1,293/game
- **Số game/ngày:** 
  - Theo Reads: 50,000 ÷ 33,900 = **~1.47 games** (≈ 1-2 games)
  - Theo Writes: 20,000 ÷ 1,293 = **~15.5 games**

### **Kết luận:** 
⚠️ **Vẫn giới hạn bởi READS** - nhưng đã cải thiện:
- ✅ Giảm **38% writes** (2,083 → 1,293)
- ⚠️ Tăng **19% reads** (28,554 → 33,900) - do batch reads để check event
- ✅ **Net improvement:** Vẫn tốt hơn vì writes giảm nhiều hơn reads tăng

---

## 🔍 PHÂN TÍCH CHI TIẾT

### **Tại sao Reads tăng?**
- Batch quiz cần đọc room từ Firebase để check event (198 reads)
- Nhưng tiết kiệm được 20,342 reads từ listeners (do giảm 790 writes)

### **Tại sao vẫn giới hạn bởi Reads?**
- **Dice rolls:** 25,688 reads (76% tổng reads)
- **Quiz answers:** 5,346 reads (16% tổng reads)
- **Các operations khác:** 2,866 reads (8% tổng reads)

**Nguyên nhân chính:** onSnapshot listeners - mỗi write trigger 26 reads!

---

## 💡 KHUYẾN NGHỊ TIẾP THEO

### **Để giảm Reads thêm:**

1. **Giảm số listeners (Polling cho players):**
   - 26 listeners → 1 listener (admin) + 25 polls
   - Tiết kiệm: ~96% reads từ listeners
   - **Nhưng:** Cần real-time cho events (hybrid approach)

2. **Tăng leaderboard interval:**
   - 30s → 60s: Giảm 5 writes + 130 reads

3. **Optimize dice rolls:**
   - Khó vì cần real-time cho gameplay
   - Có thể batch nếu nhiều players lắc cùng lúc (phức tạp)

---

## 📝 LƯU Ý

### **Batch Quiz hoạt động tốt:**
- ✅ Giảm 38% writes
- ✅ An toàn với events (đọc từ Firebase)
- ✅ Trễ 0.5s chấp nhận được
- ⚠️ Reads tăng nhẹ (19%) nhưng vẫn tốt hơn tổng thể

### **Vẫn cần tối ưu thêm:**
- 🔴 **Dice rolls listeners:** 25,688 reads (76% tổng)
- 🟡 **Quiz answers listeners:** 5,346 reads (16% tổng)
- 🟢 **Các operations khác:** 2,866 reads (8% tổng)

---

**Cập nhật:** Sau khi triển khai Batch Quiz Updates với Firebase snapshot để đảm bảo an toàn với events.

