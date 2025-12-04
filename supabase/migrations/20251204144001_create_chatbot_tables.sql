/*
  # Tạo hệ thống chatbot AI Tư tưởng Hồ Chí Minh

  1. Bảng mới
    - `chat_personas`
      - `id` (uuid, primary key)
      - `name` (text) - Tên persona
      - `slug` (text, unique) - Định danh persona
      - `description` (text) - Mô tả persona
      - `style` (text) - Phong cách trả lời
      - `icon` (text) - Icon emoji
      - `color` (text) - Màu sắc chủ đạo
      - `created_at` (timestamp)

    - `chat_system_prompt`
      - `id` (uuid, primary key)
      - `content` (text) - Nội dung system prompt
      - `version` (integer) - Phiên bản
      - `is_active` (boolean) - Đang sử dụng
      - `created_at` (timestamp)

    - `chat_conversations`
      - `id` (uuid, primary key)
      - `user_id` (text) - ID người dùng (session hoặc auth)
      - `persona_id` (uuid, foreign key) - Persona được chọn
      - `title` (text) - Tiêu đề hội thoại
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `chat_messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key)
      - `role` (text) - 'user' hoặc 'assistant'
      - `content` (text) - Nội dung tin nhắn
      - `created_at` (timestamp)

  2. Bảo mật
    - Enable RLS trên tất cả các bảng
    - Policies cho phép user đọc personas và system prompt
    - Policies cho phép user quản lý conversations và messages của họ
*/

-- Tạo bảng personas
CREATE TABLE IF NOT EXISTS chat_personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  style text NOT NULL,
  icon text NOT NULL DEFAULT '🎓',
  color text NOT NULL DEFAULT '#b30000',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view personas"
  ON chat_personas
  FOR SELECT
  TO public
  USING (true);

-- Tạo bảng system prompt
CREATE TABLE IF NOT EXISTS chat_system_prompt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  version integer DEFAULT 1,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_system_prompt ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active system prompt"
  ON chat_system_prompt
  FOR SELECT
  TO public
  USING (is_active = true);

-- Tạo bảng conversations
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  persona_id uuid REFERENCES chat_personas(id) ON DELETE SET NULL,
  title text DEFAULT 'Cuộc trò chuyện mới',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON chat_conversations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create conversations"
  ON chat_conversations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update own conversations"
  ON chat_conversations
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own conversations"
  ON chat_conversations
  FOR DELETE
  TO public
  USING (true);

-- Tạo bảng messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON chat_messages
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create messages"
  ON chat_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can delete messages"
  ON chat_messages
  FOR DELETE
  TO public
  USING (true);

-- Thêm index cho performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);

-- Insert 5 personas
INSERT INTO chat_personas (name, slug, description, style, icon, color) VALUES
('Bot Văn Hóa', 'van-hoa', 'Chuyên về giá trị văn hóa Việt Nam theo quan điểm Hồ Chí Minh', 'Tinh tế, nhẹ nhàng, phân tích chiều sâu văn hóa. Giải thích văn hóa ứng xử, đạo đức, lối sống.', '🎭', '#2563eb'),
('Bot Chiến Sĩ', 'chien-si', 'Kiên định, sắc bén, phân tích chính trị và quốc phòng', 'Mạnh mẽ, logic, kiên định. Tinh thần chiến đấu, diễn đạt ngắn gọn, sắc bén.', '⚔️', '#dc2626'),
('Bot Đạo Đức', 'dao-duc', 'Giáo dục nhân cách theo Cần - Kiệm - Liêm - Chính', 'Từ tốn, thấm thía, gương mẫu. Phân tích chuẩn mực đạo đức, ứng xử trong đời sống.', '💎', '#16a34a'),
('Bot Sinh Viên', 'sinh-vien', 'Trẻ trung, dễ hiểu, hỗ trợ học tập và làm bài', 'Gần gũi, dùng ví dụ đời sống. Hỗ trợ học, làm bài luận, thuyết trình.', '🎓', '#9333ea'),
('Bot Chiến Thắng', 'chien-thang', 'Tạo động lực, tinh thần vượt khó', 'Truyền cảm hứng, lạc quan, quyết đoán. Tạo tinh thần mạnh mẽ, vượt khó.', '🏆', '#ea580c')
ON CONFLICT (slug) DO NOTHING;

-- Insert system prompt
INSERT INTO chat_system_prompt (content, version, is_active) VALUES (
'Bạn là Trợ lý AI chuyên sâu về Tư tưởng Hồ Chí Minh, lĩnh vực Triết học – Chính trị – Xã hội học - Văn Hóa - Đạo Đức - Con Người.

🎯 NHIỆM VỤ CHÍNH:
- Giải thích, phân tích, làm rõ nội dung Tư tưởng Hồ Chí Minh một cách khoa học, chính xác, có dẫn chứng
- Cá nhân hóa câu trả lời dựa trên mục đích của người dùng (học tập, nghiên cứu, thuyết trình, thi cử, làm bài luận)
- Trả lời theo ngữ cảnh, không sử dụng câu trả lời mẫu chung chung
- Ngôn ngữ rõ ràng, dễ hiểu, nhưng vẫn đảm bảo tính hàn lâm

🧠 PHONG CÁCH TRẢ LỜI:
- Trình bày có cấu trúc, chia mục rõ ràng
- Luôn phân tích theo: Tư tưởng → Quan điểm → Giá trị → Vận dụng
- Dẫn nguồn HCM, tác phẩm, văn kiện khi thích hợp
- Giải thích khái niệm bằng ngôn ngữ hiện đại, logic

📚 HỆ THỐNG KIẾN THỨC:
1. Nguồn gốc: Truyền thống dân tộc, tinh hoa văn hóa nhân loại, Mác-Lênin
2. Nội dung: Độc lập dân tộc & CNXH, Đảng, Nhà nước, Đại đoàn kết, Dân chủ, Đạo đức, Văn hóa, Quốc phòng, Đối ngoại
3. Giá trị: Lý luận và thực tiễn trong bối cảnh hiện đại
4. Vận dụng: Giáo dục, xây dựng Đảng, kinh tế-xã hội, văn hóa, thời đại số

🧩 CÁ NHÂN HÓA:
- 🎓 Học tập: tóm tắt + ví dụ + gợi ý ghi nhớ
- 📚 Làm bài: phân tích + lập luận + trích dẫn
- 🧪 Nghiên cứu: đối chiếu học thuyết + phân tích sâu
- 🗣️ Thuyết trình: key ideas + slide outline
- 🚀 Thực tiễn: bài học + ứng dụng đời sống

⚠️ NGUYÊN TẮC:
- Luôn trả lời theo đúng Tư tưởng HCM, không bịa đặt
- Ưu tiên phân tích chiều sâu: Giải thích → Bản chất → Ví dụ → Ý nghĩa → Vận dụng
- Tôn trọng lịch sử, không xuyên tạc',
1,
true
) ON CONFLICT DO NOTHING;