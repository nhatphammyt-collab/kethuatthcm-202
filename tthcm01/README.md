## Kế thừa tư tưởng HCM 03 – Web Presentation & Mini Game

**Kế thừa tư tưởng Hồ Chí Minh về văn hóa, đạo đức, con người** – trang web trình chiếu nội dung bài thuyết trình và mini game trắc nghiệm dành cho sinh viên.

### 🚀 Công nghệ sử dụng

- **React 18 + TypeScript**
- **Vite** (dev server & build)
- **Tailwind CSS** (UI)
- **React Router** (điều hướng giữa các trang)
- **Lucide React** (icon)

### 📂 Cấu trúc chính

- `src/App.tsx` – định nghĩa router và các tuyến trang
- `src/pages/LandingPage.tsx` – trang giới thiệu chủ đề, hero section
- `src/pages/PresentationPage.tsx` – nội dung chi tiết bài trình chiếu
- `src/pages/MinigamePage.tsx` – mini game trắc nghiệm kiểm tra kiến thức
- `src/index.css` – cấu hình Tailwind, custom utilities/components

### 🧑‍💻 Chạy dự án

Yêu cầu: **Node.js 18+**

```bash
npm install
npm run dev
```

Sau đó mở trình duyệt tại địa chỉ mà Vite hiển thị (mặc định là `http://localhost:5173`).

### 🏗 Build sản phẩm

```bash
npm run build
npm run preview
```

### ✅ Kiểm tra code

```bash
npm run lint
npm run typecheck
```

### 📖 Nội dung

Website tập trung thể hiện:

- Vai trò của sinh viên trên **mặt trận văn hóa**
- Khái niệm **“giặc nội xâm”** và các biểu hiện trong đời sống hiện nay
- Phương châm **“phò chính trừ tà”**, bộ giá trị **Cần – Kiệm – Liêm – Chính**
- Vận dụng thực tiễn trong học tập, rèn luyện và môi trường số
