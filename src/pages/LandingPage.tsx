import { useNavigate } from 'react-router-dom';
import { GraduationCap, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
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
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
              SINH VIÊN TRÊN "MẶT TRẬN VĂN HÓA"
            </h1>
            <h2 className="text-3xl md:text-5xl font-semibold text-[#FFD700] mb-8 drop-shadow-xl">
              CUỘC CHIẾN CHỐNG "GIẶC NỘI XÂM"
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
                      className="w-48 h-48 bg-[#FFD700] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-2xl"
                      onClick={() => setShowChat(true)}
                    >
                      <GraduationCap size={96} className="text-[#b30000]" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </main>
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

      {showChat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowChat(false)}>
          <div className="glassmorphism-card max-w-md w-full p-8 rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <GraduationCap size={32} className="text-[#FFD700]" />
                <h3 className="text-xl font-bold text-white">Trợ Lý Giảng Dạy</h3>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-300 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-white">
                  Xin chào! Tôi là trợ lý ảo của bài trình chiếu. Bạn có câu hỏi gì về nội dung không?
                </p>
              </div>
              <div className="bg-[#FFD700]/20 p-4 rounded-lg">
                <p className="text-gray-200 text-sm italic">
                  💡 Gợi ý: Bấm vào các phần để tìm hiểu thêm về giặc nội xâm và vai trò của sinh viên!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
