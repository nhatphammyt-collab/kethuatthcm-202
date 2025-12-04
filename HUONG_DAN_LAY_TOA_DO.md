# Hướng dẫn lấy tọa độ tiles trên map

## Cách sử dụng tính năng "Click để lấy tọa độ"

### Bước 1: Mở trang test
1. Chạy dev server: `npm run dev`
2. Truy cập: `http://localhost:5173/minigame/test`

### Bước 2: Bật chế độ Click
1. Click nút **"Click để lấy tọa độ"** (màu xanh lá) ở header
2. Map sẽ hiển thị overlay màu xanh với border đứt nét
3. Con trỏ chuột sẽ chuyển thành dấu thập (crosshair)

### Bước 3: Chọn tile cần gán tọa độ
Có 2 cách:

**Cách 1: Click vào marker trên map**
- Tìm marker (chấm đỏ) của tile bạn muốn điều chỉnh
- Click vào marker đó
- Marker sẽ chuyển sang màu vàng và lớn hơn

**Cách 2: Chọn từ danh sách**
- Ở phần controls phía dưới, có 25 nút đánh số từ 0-24
- Click vào nút số của tile bạn muốn điều chỉnh
- Nút sẽ chuyển sang màu vàng

### Bước 4: Click vào vị trí trên map
1. Sau khi chọn tile, bạn sẽ thấy thông báo: "Click vào vị trí cho Tile X"
2. Di chuyển chuột đến vị trí trên map mà bạn muốn đặt tile đó
3. Click vào vị trí đó
4. Tọa độ sẽ tự động được gán cho tile đã chọn
5. Marker sẽ di chuyển đến vị trí mới

### Bước 5: Lặp lại cho các tile khác
- Tiếp tục chọn tile khác và click vào vị trí tương ứng
- Hoặc click nút "Hủy chế độ Click" để tắt

### Bước 6: Copy code và cập nhật
1. Sau khi điều chỉnh xong tất cả tiles, click **"Điều chỉnh Tọa độ"**
2. Trong editor, click **"Copy Code"**
3. Mở file `src/pages/minigame/GameBoard.tsx`
4. Tìm dòng `const TILE_POSITIONS` (khoảng dòng 24)
5. Thay thế toàn bộ array bằng code đã copy
6. Lưu file

## Mẹo sử dụng

- **Xem tọa độ hiện tại**: Khi click vào map, sẽ hiển thị marker xanh với tọa độ (X%, Y%)
- **Tile hiện tại**: Marker màu xanh lá là tile mà nhân vật đang đứng
- **Tile đã chọn**: Marker màu vàng với ring là tile đang được chọn để gán tọa độ
- **Test ngay**: Dùng slider "Vị trí" để test xem nhân vật có đứng đúng vị trí không

## Lưu ý

- Tọa độ được tính theo phần trăm (0-100%)
- X = 0% là bên trái, X = 100% là bên phải
- Y = 0% là phía trên, Y = 100% là phía dưới
- Nên click vào trung tâm của ô/tile trên map để có vị trí chính xác nhất

