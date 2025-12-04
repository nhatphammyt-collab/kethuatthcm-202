import { useNavigate } from 'react-router-dom';
import { GraduationCap, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = document.querySelectorAll('.content-section');
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach((section, index) => {
        const element = section as HTMLElement;
        if (element.offsetTop <= scrollPosition && element.offsetTop + element.offsetHeight > scrollPosition) {
          setActiveSection(index);
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.fade-in-section').forEach((el) => {
      observer.observe(el);
    });

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const sections = [
    {
      title: 'Từ Bối Cảnh Lịch Sử Đến Nhiệm Vụ',
      content: 'Sau khi xâm lược Việt Nam, thực dân Pháp không chỉ dùng quân sự mà còn thi hành các chính sách văn hóa độc hại: ngu dân, đồng hóa, chia rẽ tinh thần dân tộc. Hồ Chí Minh nhận ra: nếu văn hóa không đứng lên, dân tộc sẽ suy yếu từ bên trong.',
      align: 'left',
      image: '/hinhbac1.jpg'
    },
    {
      title: 'Giặc Nội Xâm Là Ai?',
      content: 'Giặc nội xâm là những thói xấu trong chính con người Việt Nam: tham ô - lãng phí, lười biếng - quan liêu, phù hoa - xa xỉ, và tâm lý nô lệ. Đây là kẻ thù vô hình nhưng cực kỳ nguy hiểm, phá hoại từ bên trong.',
      align: 'right',
      image: '/sddefault.jpg'
    },
    {
      title: 'Vũ Khí: Phò Chính Trừ Tà & Đời Sống Mới',
      content: 'Trừ tà - chống lại cái xấu. Phò chính - xây dựng cái đẹp. Đời sống mới được xây dựng trên nền tảng: Cần - Kiệm - Liêm - Chính. Bác dạy: "Muốn diệt cái xấu phải xây cái tốt."',
      align: 'left',
      image: '/cankiemliemchinh.jpg'
    },
    {
      title: 'Kết Luận – Mỗi Sinh Viên Là Một Chiến Sĩ',
      content: 'Cuộc chiến chống giặc nội xâm diễn ra mỗi ngày, trong từng quyết định nhỏ, từng hành động, từng suy nghĩ. Chiến thắng giặc nội xâm chính là chiến thắng bản thân - chiến thắng khó nhất nhưng ý nghĩa nhất.',
      align: 'right',
      image: '/sinhvien.jpg'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#b30000] via-[#8b0000] to-[#6b0000]"></div>
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/bo-sung-phat-trien-hoan-thien-chu-nghia-mac-lenin-tu-tuong-ho-chi-minh-trong-dieu-kien-moi.jpg')`,
            backgroundBlendMode: 'overlay'
          }}
        ></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23FFD700' fill-opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#b30000]/95 backdrop-blur-md shadow-2xl' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img
                src="/image copy copy copy copy copy.png"
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
              <div className="text-left">
                <div className="text-[#FFD700] font-bold text-sm">TƯ TƯỞNG</div>
                <div className="text-white font-bold text-base">HỒ CHÍ MINH</div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-white hover:text-[#FFD700] font-medium transition-colors duration-200"
              >
                Trang Chủ
              </button>
              <button
                onClick={() => navigate('/presentation')}
                className="text-white hover:text-[#FFD700] font-medium transition-colors duration-200"
              >
                Trình Chiếu
              </button>
              <button
                onClick={() => navigate('/memory-gallery')}
                className="text-white hover:text-[#FFD700] font-medium transition-colors duration-200"
              >
                Thư Viện Kỷ Niệm
              </button>
              <button
                onClick={() => navigate('/minigame')}
                className="text-white hover:text-[#FFD700] font-medium transition-colors duration-200"
              >
                Minigame
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10">
        <header className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="glassmorphism-hero max-w-4xl mx-auto p-12 rounded-3xl animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-20 h-20 bg-[#FFD700] rounded-full flex items-center justify-center shadow-2xl">
                <Star size={48} className="text-[#b30000] fill-[#b30000]" />
              </div>
              <div className="text-left">
                <div className="text-[#FFD700] font-bold text-lg">TƯ TƯỞNG</div>
                <div className="text-white font-bold text-2xl">HỒ CHÍ MINH</div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
              SINH VIÊN TRÊN <span className="whitespace-nowrap">"MẶT TRẬN VĂN HÓA"</span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-[#FFD700] mb-8 drop-shadow-xl">
              CUỘC CHIẾN CHỐNG <span className="whitespace-nowrap">"GIẶC NỘI XÂM"</span>
            </h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 text-sm md:text-base">
              <p className="text-[#FFD700] font-bold mb-2">NHÓM 10</p>
              <p className="text-gray-100 mb-1"><strong>Thành viên:</strong> Hồ Lê Bình, Nguyễn Văn Cường, Nguyễn Hoàng Quân,</p>
              <p className="text-gray-100 mb-3">Nguyễn Trần Gia Bảo, Phạm Minh Nhật, Nguyễn Hoàng Minh</p>
              <p className="text-gray-200 text-sm mb-1"><strong>Lớp:</strong> 3W_HCM202_04</p>
              <p className="text-gray-200 text-sm mb-1"><strong>Môn:</strong> HCM202 - Tư tưởng Hồ Chí Minh</p>
              <p className="text-gray-200 text-sm"><strong>Chương 6:</strong> Tư Tưởng Hồ Chí Minh Về Văn Hóa, Đạo Đức, Con Người</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/presentation')}
                className="cta-button"
              >
                XEM NỘI DUNG TRÌNH CHIẾU
              </button>
              <button
                onClick={() => navigate('/memory-gallery')}
                className="cta-button"
              >
                THƯ VIỆN KỶ NIỆM
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-20">
          {sections.map((section, index) => (
            <section
              key={index}
              className={`content-section fade-in-section mb-32 flex flex-col md:flex-row items-center gap-12 ${
                section.align === 'right' ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="flex-1">
                <div className="glassmorphism-card p-8 rounded-2xl hover:glow transition-all duration-500">
                  <h3 className="text-3xl font-bold text-[#FFD700] mb-6">
                    {section.title}
                  </h3>
                  <p className="text-lg text-gray-100 leading-relaxed mb-6">
                    {section.content}
                  </p>
                  <div 
                    className="rounded-xl overflow-hidden shadow-2xl bg-gray-900/20 relative flex items-center justify-center"
                    style={{ aspectRatio: '4/3' }}
                  >
                    <img
                      src={section.image}
                      alt={section.title}
                      className="absolute inset-0 w-full h-full object-contain object-center hover:scale-105 transition-transform duration-500"
                      style={{ 
                        objectFit: 'contain',
                        objectPosition: 'center'
                      }}
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="relative">
                  <div className={`teaching-assistant ${activeSection === index ? 'bounce' : ''}`}>
                    <div
                      className="w-48 h-48 bg-[#FFD700] rounded-full flex items-center justify-center shadow-2xl"
                    >
                      <GraduationCap size={96} className="text-[#b30000]" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </main>

        <section className="container mx-auto px-6 py-20">
          <div className="glassmorphism-card p-12 rounded-3xl mb-20 fade-in-section">
            <h2 className="text-4xl font-bold text-[#FFD700] text-center mb-12">
              Dòng Thời Gian Cuộc Đời Bác Hồ
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-all duration-300">
                <div className="text-[#FFD700] font-bold text-3xl mb-3">1890</div>
                <h4 className="text-white font-semibold text-xl mb-2">Ra Đời</h4>
                <p className="text-gray-200">Sinh ngày 19/5 tại làng Kim Liên, Nghệ An</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-all duration-300">
                <div className="text-[#FFD700] font-bold text-3xl mb-3">1911</div>
                <h4 className="text-white font-semibold text-xl mb-2">Ra Đi Tìm Đường Cứu Nước</h4>
                <p className="text-gray-200">Lên tàu Đô đốc Latouche Tréville, bắt đầu hành trình 30 năm phiêu bạt</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-all duration-300">
                <div className="text-[#FFD700] font-bold text-3xl mb-3">1930</div>
                <h4 className="text-white font-semibold text-xl mb-2">Thành Lập Đảng</h4>
                <p className="text-gray-200">Chủ trì hội nghị thành lập Đảng Cộng sản Việt Nam</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-all duration-300">
                <div className="text-[#FFD700] font-bold text-3xl mb-3">1945</div>
                <h4 className="text-white font-semibold text-xl mb-2">Tuyên Ngôn Độc Lập</h4>
                <p className="text-gray-200">Đọc Tuyên ngôn độc lập, khai sinh nước Việt Nam Dân chủ Cộng hòa</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-all duration-300">
                <div className="text-[#FFD700] font-bold text-3xl mb-3">1954</div>
                <h4 className="text-white font-semibold text-xl mb-2">Chiến Thắng Điện Biên Phủ</h4>
                <p className="text-gray-200">Lãnh đạo nhân dân đánh bại thực dân Pháp</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-all duration-300">
                <div className="text-[#FFD700] font-bold text-3xl mb-3">1969</div>
                <h4 className="text-white font-semibold text-xl mb-2">Vĩnh Biệt</h4>
                <p className="text-gray-200">Đi vào lịch sử dân tộc, để lại di sản vô giá</p>
              </div>
            </div>
          </div>

          <div className="glassmorphism-card p-12 rounded-3xl mb-20 fade-in-section">
            <h2 className="text-4xl font-bold text-[#FFD700] text-center mb-12">
              Những Câu Nói Bất Hủ
            </h2>
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm p-8 rounded-xl border-l-4 border-[#FFD700]">
                <p className="text-white text-2xl italic mb-4">"Không có gì quý hơn độc lập, tự do"</p>
                <p className="text-gray-300">- Chủ tịch Hồ Chí Minh</p>
              </div>
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm p-8 rounded-xl border-l-4 border-[#FFD700]">
                <p className="text-white text-2xl italic mb-4">"Đoàn kết, đoàn kết, đại đoàn kết. Thành công, thành công, đại thành công"</p>
                <p className="text-gray-300">- Chủ tịch Hồ Chí Minh</p>
              </div>
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm p-8 rounded-xl border-l-4 border-[#FFD700]">
                <p className="text-white text-2xl italic mb-4">"Văn hóa soi đường cho quốc dân đi"</p>
                <p className="text-gray-300">- Chủ tịch Hồ Chí Minh</p>
              </div>
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm p-8 rounded-xl border-l-4 border-[#FFD700]">
                <p className="text-white text-2xl italic mb-4">"Dĩ bất biến, ứng vạn biến"</p>
                <p className="text-gray-300">- Chủ tịch Hồ Chí Minh</p>
              </div>
            </div>
          </div>

          <div className="glassmorphism-card p-12 rounded-3xl mb-20 fade-in-section">
            <h2 className="text-4xl font-bold text-[#FFD700] text-center mb-12">
              Di Sản & Giá Trị Vĩnh Hằng
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl hover:glow transition-all duration-300">
                <div className="text-5xl mb-4 text-center">🏛️</div>
                <h4 className="text-[#FFD700] font-bold text-2xl mb-4 text-center">Tư Tưởng Chính Trị</h4>
                <p className="text-gray-200 leading-relaxed">
                  Tư tưởng Hồ Chí Minh là kết tinh của chủ nghĩa Mác-Lênin với thực tiễn cách mạng Việt Nam,
                  tạo nền tảng lý luận cho sự nghiệp giải phóng dân tộc và xây dựng đất nước.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl hover:glow transition-all duration-300">
                <div className="text-5xl mb-4 text-center">❤️</div>
                <h4 className="text-[#FFD700] font-bold text-2xl mb-4 text-center">Đạo Đức Cách Mạng</h4>
                <p className="text-gray-200 leading-relaxed">
                  Cần - Kiệm - Liêm - Chính - Chí công vô tư. Những giá trị đạo đức này đã trở thành chuẩn mực
                  cho mọi thế hệ cán bộ, đảng viên và nhân dân Việt Nam.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl hover:glow transition-all duration-300">
                <div className="text-5xl mb-4 text-center">🎓</div>
                <h4 className="text-[#FFD700] font-bold text-2xl mb-4 text-center">Giáo Dục & Văn Hóa</h4>
                <p className="text-gray-200 leading-relaxed">
                  Văn hóa phải soi đường cho quốc dân đi. Giáo dục là quốc sách hàng đầu.
                  Bác luôn coi trọng việc xây dựng nền văn hóa và con người mới.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl hover:glow transition-all duration-300">
                <div className="text-5xl mb-4 text-center">🌏</div>
                <h4 className="text-[#FFD700] font-bold text-2xl mb-4 text-center">Hòa Bình & Đoàn Kết</h4>
                <p className="text-gray-200 leading-relaxed">
                  Tinh thần đại đoàn kết dân tộc, đoàn kết quốc tế. Bác Hồ không chỉ là
                  lãnh tụ của dân tộc Việt Nam mà còn là biểu tượng của phong trào giải phóng dân tộc thế giới.
                </p>
              </div>
            </div>
          </div>

          <div className="glassmorphism-card p-12 rounded-3xl mb-20 fade-in-section">
            <h2 className="text-4xl font-bold text-[#FFD700] text-center mb-8">
              Thông Điệp Dành Cho Sinh Viên
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/5 backdrop-blur-sm p-10 rounded-2xl border-2 border-[#FFD700]/30">
                <p className="text-white text-xl leading-relaxed mb-6">
                  Các bạn sinh viên hôm nay là những người sẽ xây dựng tương lai của đất nước.
                  Hãy học tập tư tưởng Hồ Chí Minh không chỉ qua lý thuyết mà qua hành động:
                </p>
                <ul className="space-y-4 text-gray-200 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-[#FFD700] font-bold text-2xl">✓</span>
                    <span>Học tập chăm chỉ, rèn luyện đạo đức, sống có ích cho xã hội</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#FFD700] font-bold text-2xl">✓</span>
                    <span>Giữ vững bản lĩnh trước mọi giặc nội xâm trong thời đại mới</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#FFD700] font-bold text-2xl">✓</span>
                    <span>Yêu nước, yêu chủ nghĩa xã hội, đoàn kết và sáng tạo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#FFD700] font-bold text-2xl">✓</span>
                    <span>Kết hợp tri thức hiện đại với truyền thống dân tộc</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <footer className="relative z-10 border-t-4 border-[#FFD700] bg-black/30 backdrop-blur-md">
          <div className="container mx-auto px-6 py-12">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="/image copy copy copy copy copy.png"
                    alt="Logo"
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <div className="text-[#FFD700] font-bold">TƯ TƯỞNG</div>
                    <div className="text-white font-bold">HỒ CHÍ MINH</div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Trang web giáo dục về tư tưởng Hồ Chí Minh, được xây dựng bởi sinh viên
                  với mục đích học tập và chia sẻ kiến thức.
                </p>
              </div>
              <div>
                <h4 className="text-[#FFD700] font-bold text-lg mb-4">Thông Tin Nhóm</h4>
                <div className="text-gray-300 text-sm space-y-2">
                  <p><strong>Nhóm:</strong> Nhóm 10</p>
                  <p><strong>Lớp:</strong> 3W_HCM202_04</p>
                  <p><strong>Môn học:</strong> HCM202 - Tư tưởng Hồ Chí Minh</p>
                  <p><strong>Chủ đề:</strong> Chương 6 - Tư Tưởng Hồ Chí Minh Về Văn Hóa, Đạo Đức, Con Người</p>
                </div>
              </div>
              <div>
                <h4 className="text-[#FFD700] font-bold text-lg mb-4">Liên Kết</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/presentation')}
                    className="block text-gray-300 hover:text-[#FFD700] transition-colors duration-200"
                  >
                    → Trình Chiếu
                  </button>
                  <button
                    onClick={() => navigate('/memory-gallery')}
                    className="block text-gray-300 hover:text-[#FFD700] transition-colors duration-200"
                  >
                    → Thư Viện Kỷ Niệm
                  </button>
                  <button
                    onClick={() => navigate('/minigame')}
                    className="block text-gray-300 hover:text-[#FFD700] transition-colors duration-200"
                  >
                    → Minigame
                  </button>
                </div>
              </div>
            </div>
            <div className="border-t border-white/20 pt-6 text-center">
              <p className="text-gray-400 text-sm">
                © Fall 2025 - Nhóm 10 - Lớp 3W_HCM202_04. Được tạo ra với sự tôn trọng và ngưỡng mộ Chủ tịch Hồ Chí Minh.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Website mang tính chất học tập và nghiên cứu
              </p>
            </div>
          </div>
        </footer>
      </div>

      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
        <button
          onClick={() => navigate('/presentation')}
          className="cta-button-floating"
        >
          XEM NỘI DUNG TRÌNH CHIẾU
        </button>
        <button
          onClick={() => navigate('/memory-gallery')}
          className="cta-button-floating"
        >
          THƯ VIỆN KỶ NIỆM
        </button>
      </div>
    </div>
  );
}
