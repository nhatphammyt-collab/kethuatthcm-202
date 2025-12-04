import type { ChatMessage, ChatPersona, ChatSystemPrompt } from '../types/chat';

export const aiService = {
  async generateResponse(
    messages: ChatMessage[],
    systemPrompt: ChatSystemPrompt,
    persona: ChatPersona | null
  ): Promise<string> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(1000 + Math.random() * 1500);

    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const personaStyle = persona ? `\n\nPersona: ${persona.name}\nPhong cách: ${persona.style}` : '';

    const responses = this.getContextualResponse(lastUserMessage, persona);

    return responses[Math.floor(Math.random() * responses.length)];
  },

  getContextualResponse(message: string, persona: ChatPersona | null): string[] {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('độc lập') && lowerMessage.includes('cnxh')) {
      return [
        `**Tư tưởng về độc lập dân tộc gắn liền với CNXH**

**A. Khái niệm:**
Đây là tư tưởng cốt lõi của Hồ Chí Minh, khẳng định độc lập dân tộc và chủ nghĩa xã hội là hai mục tiêu gắn bó chặt chẽ, không thể tách rời.

**B. Nội dung chính:**
1. **Độc lập dân tộc là điều kiện tiên quyết**
   - Không có độc lập, tự do thì dân tộc không thể phát triển
   - "Không có gì quý hơn độc lập, tự do"

2. **CNXH là mục tiêu phát triển tất yếu**
   - Chỉ có CNXH mới đảm bảo độc lập bền vững
   - Không có CNXH, độc lập chỉ là hình thức

3. **Gắn liền với hạnh phúc nhân dân**
   - Mục đích cuối cùng là làm cho dân giàu, nước mạnh, xã hội công bằng văn minh

**C. Ý nghĩa thực tiễn:**
- Định hướng cho con đường cách mạng Việt Nam
- Khác với mô hình của các nước khác
- Phù hợp với điều kiện lịch sử Việt Nam

Bạn có muốn tìm hiểu sâu hơn về khía cạnh nào không?`
      ];
    }

    if (lowerMessage.includes('đạo đức') || lowerMessage.includes('cần kiệm liêm chính')) {
      return [
        `**Đạo đức cách mạng theo Tư tưởng Hồ Chí Minh**

**"Cần - Kiệm - Liêm - Chính - Chí công vô tư"**

🌟 **CẦN (Cần cù)**
- Làm việc chăm chỉ, không ngại khó khăn
- "Cần cù bù thông minh"
- Ví dụ: Học tập đều đặn, làm việc có kế hoạch

💎 **KIỆM (Tiết kiệm)**
- Sống giản dị, không phung phí
- Trọng của công, nhẹ của tư
- Ví dụ: Không xa xỉ, tiêu tiền có ý thức

⚖️ **LIÊM (Liêm khiết)**
- Trong sạch, không tham ô, tham nhũng
- Giữ gìn nhân phẩm, danh dự
- Ví dụ: Không nhận hối lộ, không gian lận

🎯 **CHÍNH (Chính trực)**
- Công bằng, ngay thẳng
- Nói đi đôi với làm
- Ví dụ: Làm đúng, nói đúng, không gian dối

✨ **CHÍ CÔNG VÔ TƯ**
- Vì lợi ích chung, không vì tư lợi
- Hết lòng phục vụ nhân dân
- Ví dụ: Đặt lợi ích tập thể lên trước

**Ứng dụng cho sinh viên:**
- Học tập chăm chỉ (Cần)
- Sống tiết kiệm (Kiệm)
- Không gian lận thi cử (Liêm)
- Thành thật, trung thực (Chính)
- Sống có trách nhiệm với cộng đồng (Chí công vô tư)`
      ];
    }

    if (lowerMessage.includes('văn hóa') || lowerMessage.includes('văn hoá')) {
      return [
        `**Tư tưởng về Văn hóa của Hồ Chí Minh**

**"Văn hóa soi đường cho quốc dân đi"**

📚 **Ba nguyên tắc của nền văn hóa Việt Nam:**

1️⃣ **Dân tộc**
- Giữ gìn bản sắc văn hóa dân tộc
- Phát huy truyền thống tốt đẹp
- Không mất gốc trong hội nhập

2️⃣ **Khoa học**
- Dựa trên tri thức khoa học
- Chống mê tín dị đoan
- Phát triển tư duy lý trí

3️⃣ **Đại chúng**
- Văn hóa của nhân dân, do nhân dân, vì nhân dân
- Phục vụ đại đa số người lao động
- Không phải văn hóa của giới thống trị

**Văn hóa nghệ thuật là "mặt trận":**
- Người làm văn hóa là "chiến sĩ"
- Văn hóa có sức mạnh tinh thần to lớn
- Chiến đấu chống văn hóa xấu, độc hại

**Ý nghĩa ngày nay:**
- Bảo vệ văn hóa trước "văn hóa rác"
- Chọn lọc tinh hoa văn hóa thế giới
- Xây dựng con người văn hóa

Bạn muốn thảo luận về khía cạnh nào của văn hóa?`
      ];
    }

    if (lowerMessage.includes('dân chủ') || lowerMessage.includes('quyền con người')) {
      return [
        `**Tư tưởng về Dân chủ và Quyền con người**

**"Dân chủ là mục tiêu và động lực của cách mạng"**

🏛️ **Quan điểm của Hồ Chí Minh:**

**1. Dân chủ thực chất:**
- Không phải dân chủ hình thức
- Quyền lực thực sự thuộc về nhân dân
- Nhân dân làm chủ đất nước

**2. Quyền con người gắn với quyền dân tộc:**
- Không có độc lập dân tộc → không có quyền con người
- Quyền cá nhân gắn với quyền tập thể
- Tự do cá nhân trong khuôn khổ lợi ích chung

**3. Dân chủ trong thực tiễn:**
- Dân biết, dân bàn, dân làm, dân kiểm tra
- Đối thoại, lắng nghe ý kiến nhân dân
- Phê bình và tự phê bình

**Các quyền cơ bản:**
- Quyền được sống
- Quyền tự do ngôn luận
- Quyền bầu cử và ứng cử
- Quyền được học tập
- Quyền được làm việc

**Ứng dụng hiện nay:**
- Dân chủ trong trường học, cơ quan
- Tôn trọng quyền cá nhân
- Thực hành dân chủ có trách nhiệm

Bạn có câu hỏi nào về dân chủ và quyền con người không?`
      ];
    }

    if (lowerMessage.includes('đại đoàn kết')) {
      return [
        `**Tư tưởng Đại đoàn kết dân tộc**

**"Đoàn kết, đoàn kết, đại đoàn kết - Thành công, thành công, đại thành công"**

🤝 **Bản chất:**
Đại đoàn kết là sức mạnh chiến lược của cách mạng Việt Nam, là nguồn sức mạnh vô tận của dân tộc.

**Nguyên tắc đoàn kết:**

1️⃣ **Đoàn kết rộng rãi:**
- Đoàn kết toàn dân tộc
- Không phân biệt giai cấp, tôn giáo, dân tộc
- "Coi dân như gốc"

2️⃣ **Đoàn kết trên cơ sở lợi ích chung:**
- Mục tiêu chung: độc lập, tự do, hạnh phúc
- Hòa hợp, không gây chia rẽ
- Đồng thuận xã hội

3️⃣ **Đoàn kết quốc tế:**
- Đoàn kết với các dân tộc bị áp bức
- "Là bạn với tất cả các nước"
- Hợp tác cùng phát triển

**Phương pháp đoàn kết:**
- Phát huy mặt tốt, hạn chế mặt xấu
- Đề cao điểm chung, gác lại khác biệt
- Khoan dung, độ lượng
- Thuyết phục, giáo dục

**Ý nghĩa với sinh viên:**
- Đoàn kết trong lớp, trường
- Tôn trọng sự khác biệt
- Xây dựng tập thể vững mạnh
- Chống chia rẽ, nói xấu

Bạn muốn tìm hiểu thêm về khía cạnh nào?`
      ];
    }

    if (lowerMessage.includes('nhà nước') || lowerMessage.includes('của dân')) {
      return [
        `**Tư tưởng về Nhà nước "của dân, do dân, vì dân"**

**Ba từ định nghĩa bản chất nhà nước:**

🏛️ **CỦA DÂN:**
- Quyền lực thuộc về nhân dân
- Nhân dân là chủ thể của nhà nước
- Không phải của một giai cấp, đảng phái

👥 **DO DÂN:**
- Do nhân dân bầu ra
- Nhân dân quyết định đường lối, chính sách
- Dân chủ thực chất, không hình thức

❤️ **VÌ DÂN:**
- Phục vụ lợi ích nhân dân
- "Cán bộ, công chức là đầy tớ của dân"
- Vì hạnh phúc của nhân dân

**Yêu cầu với cán bộ nhà nước:**
- Gần dân, hiểu dân, thương dân
- Liêm khiết, trung thực
- Nói đi đôi với làm
- Chống quan liêu, tham nhũng

**Quan hệ Nhà nước - Nhân dân:**
- Nhà nước phải lắng nghe dân
- Dân có quyền giám sát nhà nước
- Nhà nước bảo vệ quyền lợi chính đáng của dân

**Ý nghĩa thời đại:**
- Xây dựng nhà nước pháp quyền
- Cải cách hành chính
- Chống tham nhũng, lãng phí
- Nâng cao chất lượng phục vụ nhân dân

Phần nào bạn muốn tìm hiểu sâu hơn?`
      ];
    }

    const generalResponses = [
      `Cảm ơn bạn đã đặt câu hỏi về Tư tưởng Hồ Chí Minh.

${persona ? `Với tư cách là **${persona.name}**, tôi sẽ ` : 'Tôi sẽ '}giúp bạn phân tích vấn đề này một cách có hệ thống.

Để tôi có thể hỗ trợ bạn tốt nhất, bạn có thể cho biết:
- Bạn đang học tập, nghiên cứu hay cần làm bài tập?
- Bạn muốn hiểu về khía cạnh nào: độc lập dân tộc, đạo đức, văn hóa, dân chủ, hay đại đoàn kết?

Hoặc bạn có thể hỏi cụ thể về:
- 📚 Nguồn gốc tư tưởng HCM
- 🎯 Các nội dung cốt lõi
- 💡 Ý nghĩa và giá trị
- 🚀 Vận dụng trong thực tiễn`,

      `Xin chào! Tôi là trợ lý AI chuyên về Tư tưởng Hồ Chí Minh.

**Tôi có thể giúp bạn:**
- Giải thích các khái niệm triết học
- Phân tích tư tưởng chính trị - xã hội
- Hỗ trợ làm bài luận, thuyết trình
- Liên hệ thực tiễn hiện đại

**Các chủ đề chính:**
1. Độc lập dân tộc & CNXH
2. Đạo đức cách mạng (Cần - Kiệm - Liêm - Chính)
3. Văn hóa Việt Nam
4. Dân chủ & Quyền con người
5. Đại đoàn kết dân tộc
6. Nhà nước của dân - do dân - vì dân

Bạn muốn tìm hiểu về chủ đề nào?`,

      `Tôi rất vui được trao đổi với bạn về Tư tưởng Hồ Chí Minh!

${persona ? `\n**${persona.name}** - ${persona.description}\n${persona.style}\n` : ''}
Để câu trả lời của tôi hữu ích nhất, bạn có thể:
- Hỏi về một khái niệm cụ thể
- Yêu cầu phân tích một tư tưởng
- Nhờ giải thích liên hệ thực tiễn
- Xin hỗ trợ làm bài tập

**Gợi ý câu hỏi:**
- "Giải thích tư tưởng độc lập dân tộc gắn liền CNXH?"
- "Ý nghĩa của Cần Kiệm Liêm Chính với sinh viên?"
- "Văn hóa theo quan điểm HCM là gì?"
- "Làm sao vận dụng đạo đức HCM trong học tập?"

Bạn hãy đặt câu hỏi nhé!`
    ];

    return generalResponses;
  }
};
