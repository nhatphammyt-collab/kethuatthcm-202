# 📊 PHÂN TÍCH FIREBASE USAGE - 26 PLAYERS / 5 PHÚT

## 🎮 Giả định Gameplay

**Thông số:**
- **Số players:** 26
- **Thời gian game:** 5 phút (300 giây)
- **Dice rolls/player:** ~15 lần (ước tính)
- **Quiz/player:** ~7-8 lần (ước tính)
- **Events:** 8 events trong game
- **Rewards:** Tối đa 26 players × 2 = 52 claims (có giới hạn total)
- **Leaderboard update:** Mỗi 30 giây = 10 lần

---

## 📈 CHI TIẾT TỪNG LOẠI OPERATION

### 1. **Room Subscription (onSnapshot)**
- **Setup:** 26 players × 1 listener = 26 listeners
- **Reads:** Mỗi khi room document thay đổi, tất cả 26 listeners nhận update = 26 reads/write
- **Lưu ý:** onSnapshot listener không tính là read riêng, chỉ tính khi document thay đổi

### 2. **Questions Cache** ⚡ TỐI ƯU
- **Load cache:** 1 lần khi game bắt đầu = ~100 reads (ước tính số câu hỏi)
- **Lấy câu hỏi:** Tất cả từ cache, **KHÔNG gọi Firebase** = 0 reads
- **Tiết kiệm:** ~195 quiz × 100 reads = **19,500 reads** (đã tối ưu!)

### 3. **Dice Rolls** ⚡ ĐÃ BỎ LOGS
- **Số lượng:** 26 players × 15 rolls = **390 rolls**
- **Writes:** 390 writes (update player position, score, diceRolls)
- **Reads từ listeners:** 390 writes × 26 listeners = **10,140 reads**
- **Tiết kiệm:** Đã bỏ dice logs = **390 writes** (đã tối ưu!)

### 4. **Quiz Questions** ⚡ TỪ CACHE
- **Số lượng:** 26 players × 7.5 quiz = **195 quiz**
- **Reads:** 0 (tất cả từ cache)
- **Writes:** 0 (không cần log)

### 5. **Leaderboard Updates** ⚡ GIẢM TẦN SUẤT
- **Số lần:** 10 lần (mỗi 30s trong 5 phút)
- **Reads:** 10 reads (getRoomById) + 10 writes × 26 listeners = **270 reads**
- **Writes:** 10 writes
- **Tiết kiệm:** Từ 5s → 30s = **giảm 100 writes + 2,600 reads** (đã tối ưu!)

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

## 📊 TỔNG KẾT FIREBASE USAGE

### **READS:**
| Loại | Số lượng |
|------|----------|
| Questions cache load | 100 |
| Dice rolls (listeners) | 10,140 |
| Leaderboard updates | 270 |
| Events (listeners) | 416 |
| Rewards (listeners) | 1,352 |
| Game start/end (listeners) | 52 |
| Player join (listeners) | 676 |
| **TỔNG READS** | **~13,000** |

### **WRITES:**
| Loại | Số lượng |
|------|----------|
| Dice rolls | 390 |
| Leaderboard updates | 10 |
| Events | 16 |
| Rewards | 52 |
| Game start/end | 2 |
| Player join | 26 |
| Room creation | 1 |
| **TỔNG WRITES** | **~500** |

---

## ✅ SO SÁNH VỚI GIỚI HẠN FIREBASE

### **Giới hạn Firebase Free Plan:**
- **Reads:** 50,000/ngày
- **Writes:** 20,000/ngày

### **Usage với 26 players/5 phút:**
- **Reads:** ~13,000/game
- **Writes:** ~500/game

### **Số game có thể chơi/ngày:**
- **Theo Reads:** 50,000 ÷ 13,000 = **~3.8 games** (≈ 4 games)
- **Theo Writes:** 20,000 ÷ 500 = **40 games**

### **Kết luận:** 
✅ **Giới hạn bởi READS** - có thể chơi **~4 games/ngày** với 26 players mỗi game

---

## 🎯 TỐI ƯU ĐÃ ÁP DỤNG

### **1. Questions Cache:**
- **Trước:** ~195 quiz × 100 reads = 19,500 reads
- **Sau:** 100 reads (load 1 lần)
- **Tiết kiệm:** 19,400 reads ✅

### **2. Bỏ Dice Logs:**
- **Trước:** 390 dice logs = 390 writes
- **Sau:** 0 writes
- **Tiết kiệm:** 390 writes ✅

### **3. Bỏ Leaderboard Update sau mỗi Roll:**
- **Trước:** 390 rolls × 1 update = 390 writes + 10,140 reads
- **Sau:** 0 (chỉ update định kỳ)
- **Tiết kiệm:** 390 writes + 10,140 reads ✅

### **4. Giảm Leaderboard Interval:**
- **Trước:** 5s interval = 60 updates/game = 60 writes + 1,560 reads
- **Sau:** 30s interval = 10 updates/game = 10 writes + 260 reads
- **Tiết kiệm:** 50 writes + 1,300 reads ✅

### **5. Giảm Game Duration:**
- **Trước:** 10 phút
- **Sau:** 5 phút
- **Tiết kiệm:** ~50% operations ✅

### **6. Giảm Event Duration:**
- **Trước:** 75s
- **Sau:** 20s
- **Ảnh hưởng:** Events kết thúc nhanh hơn, ít writes hơn ✅

---

## 💡 KHUYẾN NGHỊ

### **Nếu muốn tăng số game/ngày:**

1. **Giảm số players/game:**
   - 13 players: ~6,500 reads/game → ~7 games/ngày
   - 10 players: ~5,000 reads/game → ~10 games/ngày

2. **Tăng interval leaderboard:**
   - 30s → 60s: Giảm 5 writes + 130 reads/game

3. **Batch updates:**
   - Gộp nhiều player updates vào 1 write (phức tạp hơn)

4. **Giảm số dice rolls:**
   - Giảm số lượt lắc ban đầu hoặc tăng độ khó quiz

---

## 📝 LƯU Ý

- **onSnapshot listeners:** Mỗi write vào room document sẽ trigger tất cả listeners
- **Real-time sync:** Cần thiết cho multiplayer, nhưng tốn reads
- **Cache questions:** Đã tối ưu tối đa, không thể giảm thêm
- **Dice logs:** Đã bỏ hoàn toàn, không còn tối ưu thêm được

---

**Cập nhật:** Sau khi giảm event duration xuống 20s, số writes giảm nhẹ do events kết thúc nhanh hơn.

