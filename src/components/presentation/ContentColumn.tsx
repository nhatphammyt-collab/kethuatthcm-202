import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

const sections = [
  {
    id: "dan-nhap",
    title: "PHẦN 1: DẪN NHẬP",
    subtitle: "Từ bối cảnh lịch sử đến nhiệm vụ",
    color: "from-orange-600 to-orange-700",
    image: "/images/34808-bac-ho.jpg",
    content: {
      intro:
        'Năm 1945, khi nước Việt Nam Dân chủ Cộng hòa vừa ra đời, Chủ tịch Hồ Chí Minh đã xác định ba thứ "giặc" cần phải đánh bại:',
      bullets: [
        { bold: "Giặc đói", text: "nghèo đói, thiếu thốn vật chất" },
        { bold: "Giặc dốt", text: "mù chữ, thiếu kiến thức" },
        { bold: "Giặc ngoại xâm", text: "kẻ thù xâm lược từ bên ngoài" },
      ],
      quote: { text: "Một dân tộc dốt là một dân tộc yếu.", author: "Hồ Chí Minh" },
    },
  },
  {
    id: "giac-noi-xam",
    title: "PHẦN 2: GIẶC NỘI XÂM LÀ AI?",
    color: "from-[#b30000] to-[#8b0000]",
    image: "/images/923542a037796dd3ff869b46fe23fd57bh-1.jpg",
    content: {
      intro:
        '"Giặc nội xâm" là những thói hư tật xấu, những căn bệnh tinh thần tồn tại trong mỗi con người và trong xã hội:',
      numbered: [
        { bold: "Chủ nghĩa cá nhân:", text: "Ích kỷ, chỉ nghĩ đến bản thân, không quan tâm đến tập thể" },
        { bold: "Tham ô, lãng phí:", text: "Tham nhũng, sử dụng tài sản công không đúng mục đích" },
        { bold: "Quan liêu:", text: "Xa rời quần chúng, không lắng nghe ý kiến nhân dân" },
        { bold: "Lười biếng, dối trá:", text: "Không chịu học tập, làm việc qua loa" },
      ],
      quote: {
        text: "Chủ nghĩa cá nhân là một thứ rất gian giảo, xảo quyệt; nó khéo dỗ dành người ta đi xuống dốc.",
        author: "Hồ Chí Minh",
      },
    },
  },
  {
    id: "vu-khi",
    title: "PHẦN 3: VŨ KHÍ",
    subtitle: "Phò chính trừ tà & Đời sống mới",
    color: "from-green-700 to-green-800",
    image: "/images/pho-chinh-tru-ta.jpg",
    content: {
      sections: [
        {
          title: "PHÒ CHÍNH TRỪ TÀ",
          icon: "⚔️",
          items: [
            "Đề cao những giá trị đạo đức tốt đẹp",
            "Phê phán, loại bỏ những thói hư tật xấu",
            "Xây dựng con người mới xã hội chủ nghĩa",
          ],
        },
        {
          title: "ĐỜI SỐNG MỚI",
          icon: "🌟",
          items: [
            { bold: "Cần:", text: "Siêng năng, chăm chỉ trong công việc" },
            { bold: "Kiệm:", text: "Tiết kiệm, không lãng phí" },
            { bold: "Liêm:", text: "Trong sạch, không tham ô" },
            { bold: "Chính:", text: "Chính trực, ngay thẳng" },
          ],
        },
      ],
    },
  },
  {
    id: "van-dung",
    title: "PHẦN 4: VẬN DỤNG THỰC TIỄN",
    color: "from-blue-700 to-blue-800",
    image: "/images/images.jpg",
    content: {
      intro: 'Sinh viên ngày nay có thể vận dụng tư tưởng Hồ Chí Minh để chống "giặc nội xâm" bằng cách:',
      checklist: [
        { bold: "Học tập nghiêm túc:", text: "Không gian lận, không đạo văn, rèn luyện kỹ năng thực sự" },
        { bold: "Sống có trách nhiệm:", text: "Với bản thân, gia đình và xã hội" },
        { bold: "Tham gia hoạt động cộng đồng:", text: "Tình nguyện, giúp đỡ người khó khăn" },
        { bold: "Tự rèn luyện đạo đức:", text: "Trung thực, khiêm tốn, cầu tiến" },
      ],
    },
  },
  {
    id: "ket-luan",
    title: "PHẦN 5: KẾT LUẬN",
    color: "from-[#b30000] to-[#8b0000]",
    image: "/vietnam-youth-future-hope-patriotic.jpg",
    content: {
      text: 'Cuộc chiến chống "giặc nội xâm" là cuộc chiến lâu dài, không có tiếng súng nhưng vô cùng quyết liệt. Đó là cuộc chiến với chính bản thân mình.',
      quote: { text: "Chiến thắng bản thân là chiến thắng vẻ vang nhất.", author: "Hồ Chí Minh" },
      outro:
        "Mỗi sinh viên hãy là một chiến sĩ trên mặt trận văn hóa, góp phần xây dựng một Việt Nam giàu mạnh, văn minh.",
    },
  },
]

const tocItems = [
  { part: "Phần 1:", title: "Dẫn Nhập – Từ Bối Cảnh Lịch Sử Đến Nhiệm Vụ Thời Đại" },
  { part: "Phần 2:", title: 'Nhận Diện "Kẻ Thù" – Giặc Nội Xâm Là Ai?' },
  { part: "Phần 3:", title: 'Vũ Khí Chiến Đấu – "Phò Chính Trừ Tà" & Đời Sống Mới' },
  { part: "Phần 4:", title: "Vận Dụng Thực Tiễn – Hành Động Của Sinh Viên" },
  { part: "Phần 5:", title: "Kết Luận – Mỗi Sinh Viên Là Một Chiến Sĩ" },
  { part: "Phần 6:", title: "Tài Liệu Tham Khảo & Trích Dẫn" },
]

export function ContentColumn() {
  const columnRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add visible class to glass-card elements with animate-on-scroll
            const glassCards = entry.target.querySelectorAll(".glass-card.animate-on-scroll")
            glassCards.forEach((card) => card.classList.add("visible"))
            // Also handle content-item animations
            entry.target.classList.add("animate-in", "fade-in", "slide-in-from-bottom-4")
            entry.target.classList.remove("opacity-0", "translate-y-4")
          }
        })
      },
      { threshold: 0.15 },
    )

    const cards = columnRef.current?.querySelectorAll(".content-item, .glass-card.animate-on-scroll")
    cards?.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={columnRef} className="presentation-page">
      {/* Hero Title Card */}
      <div className="content-item opacity-0 translate-y-4 transition-all duration-500 section-block">
        <div className="glass-card hero-title-card">
          <h1 className="heading-title text-3xl md:text-4xl font-bold text-[#FFD700] mb-3 tracking-wide drop-shadow-lg">
            BÀI THUYẾT TRÌNH
          </h1>
          <p className="heading-subtitle text-lg md:text-xl text-white font-medium leading-relaxed">
            SINH VIÊN TRÊN "MẶT TRẬN VĂN HÓA" – CUỘC CHIẾN CHỐNG "GIẶC NỘI XÂM"
          </p>
        </div>
      </div>

      {/* TOC Card */}
      <div className="content-item opacity-0 translate-y-4 transition-all duration-500 delay-100 section-block">
        <div className="glass-card toc-card">
          <h2 className="heading-title toc-title text-xl md:text-2xl font-bold text-[#c41e3a] flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            MỤC LỤC
          </h2>
          <div className="toc-list">
            {tocItems.map((item, i) => (
              <div key={i} className="toc-item">
                <span className="text-[#c41e3a] font-bold">{item.part}</span>{" "}
                <span className="text-gray-800">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sections 1-4 with 2-column grid layout */}
      {sections.slice(0, 4).map((section, index) => (
        <div
          key={section.id}
          className="content-item opacity-0 translate-y-4 transition-all duration-500 section-block"
          style={{ transitionDelay: `${(index + 2) * 100}ms` }}
        >
          <div className="section-grid">
            {/* Image Card */}
            <div className="glass-card p-0 overflow-hidden">
              <div className="relative h-full min-h-[300px] rounded-2xl overflow-hidden">
                <img 
                  src={section.image || "/placeholder.svg"} 
                  alt={section.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-r ${section.color}`}>
                  <h3 className="heading-title text-lg font-bold text-white">{section.title}</h3>
                  {section.subtitle && <p className="text-sm text-white/80">{section.subtitle}</p>}
                </div>
              </div>
            </div>

            {/* Content Card */}
            <div className="glass-card">
              <div className="space-y-4 text-white">
                {section.content.intro && <p className="leading-relaxed">{section.content.intro}</p>}

                {section.content.text && <p className="leading-relaxed text-lg">{section.content.text}</p>}

                {section.content.bullets && (
                  <ul className="space-y-2 ml-4">
                    {section.content.bullets.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-[#FFD700] font-bold">•</span>
                        <span>
                          <strong className="text-[#FFD700]">{item.bold}</strong> - {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.content.numbered && (
                  <ul className="space-y-3 ml-4">
                    {section.content.numbered.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#FFD700] text-[#b30000] flex items-center justify-center text-sm font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span>
                          <strong className="text-[#FFD700]">{item.bold}</strong> {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.content.checklist && (
                  <ul className="space-y-3 ml-4">
                    {section.content.checklist.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded bg-[#FFD700] text-[#b30000] flex items-center justify-center text-sm font-bold shrink-0">
                          ✓
                        </span>
                        <span>
                          <strong className="text-[#FFD700]">{item.bold}</strong> {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.content.sections && (
                  <div className="space-y-6">
                    {section.content.sections.map((sub, i) => (
                      <div key={i}>
                        <h4 className="text-lg font-bold text-[#FFD700] mb-3 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center text-sm">
                            {sub.icon}
                          </span>
                          {sub.title}
                        </h4>
                        <ul className="space-y-2 ml-10">
                          {sub.items.map((subItem, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <span className="text-[#FFD700]">★</span>
                              {typeof subItem === "string" ? (
                                <span>{subItem}</span>
                              ) : (
                                <span>
                                  <strong className="text-[#FFD700]">{subItem.bold}</strong> {subItem.text}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {section.content.quote && (
                  <div className="quote-block mt-4">
                    <p className="italic text-white/90">"{section.content.quote.text}"</p>
                    <p className="text-right text-sm text-[#FFD700] mt-2">— {section.content.quote.author}</p>
                  </div>
                )}

                {section.content.outro && <p className="leading-relaxed mt-4">{section.content.outro}</p>}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Section 5 (Kết Luận) - Full width */}
      {sections.slice(4, 5).map((section, index) => (
        <div
          key={section.id}
          className="content-item opacity-0 translate-y-4 transition-all duration-500 section-block"
          style={{ transitionDelay: `${(4 + 2) * 100}ms` }}
        >
          <div className="section-grid">
            <div className="glass-card p-0 overflow-hidden">
              <div className="relative h-full min-h-[300px] rounded-2xl overflow-hidden">
                <img 
                  src={section.image || "/placeholder.svg"} 
                  alt={section.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-r ${section.color}`}>
                  <h3 className="heading-title text-lg font-bold text-white">{section.title}</h3>
                </div>
              </div>
            </div>
            <div className="glass-card">
              <div className="space-y-4 text-white">
                {section.content.text && <p className="leading-relaxed text-lg">{section.content.text}</p>}
                {section.content.quote && (
                  <div className="quote-block mt-4">
                    <p className="italic text-white/90">"{section.content.quote.text}"</p>
                    <p className="text-right text-sm text-[#FFD700] mt-2">— {section.content.quote.author}</p>
                  </div>
                )}
                {section.content.outro && <p className="leading-relaxed mt-4">{section.content.outro}</p>}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* TÀI LIỆU THAM KHẢO */}
      <div className="content-item opacity-0 translate-y-4 transition-all duration-500 section-block">
        <div className="glass-card">
          <h2 className="heading-title text-2xl font-bold text-[#FFD700] mb-6 text-center">TÀI LIỆU THAM KHẢO</h2>
          <ul className="space-y-2 text-white/80 text-sm max-w-2xl mx-auto">
            {[
              "Hồ Chí Minh toàn tập, NXB Chính trị Quốc gia",
              "Giáo trình Tư tưởng Hồ Chí Minh, Bộ Giáo dục và Đào tạo",
              "Đời sống mới - Hồ Chí Minh (1947)",
              "Sửa đổi lối làm việc - Hồ Chí Minh (1947)",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#FFD700]">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
