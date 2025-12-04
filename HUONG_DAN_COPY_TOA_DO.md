# 📋 Hướng dẫn Copy Tọa độ vào GameBoard

## 🎯 Mục tiêu
Copy tọa độ đã điều chỉnh từ **TestGameBoard** vào **GameBoard.tsx** để sử dụng trong game thật.

---

## 📝 Các bước thực hiện

### Bước 1: Kiểm tra tọa độ trong Test Page
1. Mở trang test: `http://localhost:5173/minigame/test`
2. Test kỹ animation và di chuyển nhân vật:
   - Dùng slider để test từng vị trí (0-24)
   - Lắc xúc xắc và xem nhân vật di chuyển
   - Đảm bảo nhân vật đứng đúng vị trí trên map
3. Nếu cần điều chỉnh thêm:
   - Click "Click để lấy tọa độ" hoặc "Điều chỉnh Tọa độ"
   - Điều chỉnh cho đến khi hài lòng

### Bước 2: Copy tọa độ
1. Trong trang test, click nút **"Copy vào GameBoard"** (màu tím)
2. Nút sẽ chuyển sang màu xanh với text "Đã Copy!"
3. Code đã được copy vào clipboard

### Bước 3: Mở file GameBoard.tsx
1. Mở file: `src/pages/minigame/GameBoard.tsx`
2. Tìm dòng có `const TILE_POSITIONS` (khoảng dòng 24-55)
3. **XÓA** toàn bộ array cũ từ dòng 24 đến dòng 55

### Bước 4: Paste code mới
1. Paste code đã copy vào vị trí vừa xóa
2. Đảm bảo code có format đúng:
```typescript
// Tọa độ các ô trên map (0-24) - percentage based
// Path: Snake pattern từ 0-24
const TILE_POSITIONS: Array<{ x: number; y: number }> = [
  { x: 12, y: 80 }, // 0
  { x: 25, y: 80 }, // 1
  // ... các dòng khác
];
```

### Bước 5: Lưu và test lại
1. Lưu file `GameBoard.tsx`
2. Test trong game thật:
   - Tạo phòng mới hoặc join phòng
   - Vào game board
   - Kiểm tra nhân vật có đứng đúng vị trí không
   - Test di chuyển bằng dice roll (sẽ implement sau)

---

## ✅ Checklist Test

Trước khi chuyển sang Phase 3, đảm bảo:

- [ ] Tọa độ đã được copy vào `GameBoard.tsx`
- [ ] File đã được lưu
- [ ] Test nhân vật đứng đúng vị trí ở tile 0 (START)
- [ ] Test nhân vật đứng đúng vị trí ở tile 24 (END)
- [ ] Test một vài vị trí giữa (ví dụ: 5, 10, 15, 20)
- [ ] Animation nhảy của nhân vật mượt mà
- [ ] Không có lỗi console trong browser
- [ ] Không có lỗi TypeScript khi build

---

## 🔍 Kiểm tra nhanh

### Test trong TestGameBoard:
```bash
# Chạy dev server
npm run dev

# Mở: http://localhost:5173/minigame/test
# Test slider và dice roll
```

### Test trong GameBoard thật:
```bash
# Tạo phòng hoặc join phòng
# Vào: /minigame/game/{roomId}
# Kiểm tra nhân vật có đứng đúng không
```

---

## ⚠️ Lưu ý

1. **Luôn test kỹ** trước khi chuyển sang Phase 3
2. **Backup code cũ** nếu cần (git commit)
3. **Kiểm tra format** - đảm bảo code paste đúng cú pháp TypeScript
4. **Test trên nhiều kích thước màn hình** nếu có thể

---

## 🆘 Nếu gặp lỗi

### Lỗi TypeScript:
- Kiểm tra dấu phẩy, ngoặc nhọn
- Đảm bảo tất cả 25 tiles (0-24) đều có

### Nhân vật không đúng vị trí:
- Quay lại TestGameBoard để điều chỉnh lại
- Copy lại và paste vào GameBoard.tsx

### Animation không mượt:
- Kiểm tra tọa độ có quá gần nhau không
- Điều chỉnh timing trong `PlayerToken.tsx` nếu cần

---

## 📌 Sau khi hoàn thành

Khi đã test kỹ và hài lòng với tọa độ:
1. Commit code (nếu muốn)
2. Báo cho tôi biết để tiếp tục Phase 3

