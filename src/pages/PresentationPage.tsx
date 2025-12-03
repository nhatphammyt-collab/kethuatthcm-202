import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Shield, MessageCircle, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PresentationPage() {
  const navigate = useNavigate();
  const [soldierPosition, setSoldierPosition] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [activeChatBot, setActiveChatBot] = useState<number | null>(null);

  const culturalBotMessages: { [key: number]: string[] } = {
    1: [
      '🎓 Xin chào! Tôi là trợ lý văn hóa của Bác Hồ.',
      '📚 Bạn muốn hiểu thêm về chính sách văn hóa thực dân?',
      '💡 Tại sao văn hóa được gọi là "mặt trận"?',
      '🌟 Hỏi tôi bất cứ điều gì về phần này!'
    ],
    2: [
      '⚠️ Giặc nội xâm là kẻ thù vô hình!',
      '🔍 4 nhóm giặc: Tham ô, Lười biếng, Phù hoa, Nô lệ',
      '💭 Bạn nhận ra giặc nào trong bản thân mình?',
      '🤔 Đặt câu hỏi để hiểu rõ hơn nhé!'
    ],
    3: [
      '⚔️ Vũ khí chống giặc: Phò chính trừ tà!',
      '✨ Cần - Kiệm - Liêm - Chính',
      '🏗️ Xây dựng đời sống mới từ hôm nay',
      '💬 Cần giải thích thêm không?'
    ],
    4: [
      '🎯 Sinh viên hành động như thế nào?',
      '💼 Thái độ chuyên nghiệp trong học tập',
      '🌐 Giữ bản lĩnh trên không gian mạng',
      '🇻🇳 Hòa nhập nhưng không hòa tan!'
    ],
    5: [
      '🎖️ Mỗi sinh viên là một chiến sĩ!',
      '💪 Chiến thắng bản thân mỗi ngày',
      '🌱 Từng quyết định nhỏ đều quan trọng',
      '🔥 Sẵn sàng chiến đấu chưa?'
    ]
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in-section').forEach((el) => {
      observer.observe(el);
    });

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage = scrollPosition / (documentHeight - windowHeight);
      setSoldierPosition(scrollPercentage * 100);

      const sections = document.querySelectorAll('.fade-in-section');
      const viewportMiddle = window.scrollY + window.innerHeight / 2;

      sections.forEach((section, index) => {
        const element = section as HTMLElement;
        if (element.offsetTop <= viewportMiddle && element.offsetTop + element.offsetHeight > viewportMiddle) {
          if (index !== currentSection) {
            setCurrentSection(index);
            setIsJumping(true);
            setTimeout(() => setIsJumping(false), 600);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentSection]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/ganhnuoc.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.5
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/15 to-amber-50/30"></div>
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <div className="absolute top-20 left-10 text-6xl animate-float">🥁</div>
          <div className="absolute top-40 right-20 text-5xl animate-float-delay-1">🌸</div>
          <div className="absolute top-[60%] left-[15%] text-7xl animate-float-delay-2">⭐</div>
          <div className="absolute top-[30%] right-[10%] text-6xl animate-float">🏛️</div>
          <div className="absolute bottom-40 left-[20%] text-5xl animate-float-delay-1">🇻🇳</div>
          <div className="absolute bottom-60 right-[25%] text-6xl animate-float-delay-2">📚</div>
        </div>
      </div>
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
        <div className={`soldier-character ${isJumping ? 'soldier-jump' : ''}`} style={{ transform: `translateY(${soldierPosition * 2}px)` }}>
          <div className="relative">
            <div className="w-24 h-32 bg-gradient-to-b from-[#2d5016] to-[#1a3d0f] rounded-lg relative overflow-hidden shadow-2xl">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#d4a574] rounded-full"></div>
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-3 bg-[#b30000] rounded-full"></div>
              <div className="absolute top-14 left-1/2 -translate-x-1/2 w-16 h-12 bg-[#2d5016] rounded-lg"></div>
              <div className="absolute top-14 left-1/2 -translate-x-1/2">
                <Shield size={20} className="text-[#FFD700]" />
              </div>
              <div className="absolute bottom-0 left-2 w-8 h-10 bg-[#1a3d0f] rounded-b-lg"></div>
              <div className="absolute bottom-0 right-2 w-8 h-10 bg-[#1a3d0f] rounded-b-lg"></div>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-[#b30000] text-lg font-bold">⭐</span>
            </div>
          </div>
        </div>
      </div>
      <nav className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-md shadow-xl z-50 border-b-4 border-[#FFD700]">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-[#FFD700] text-[#b30000] px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
          >
            <ArrowLeft size={20} />
            Trang Chủ
          </button>
          <div className="flex items-center gap-3">
            <BookOpen className="text-[#b30000]" size={28} />
            <span className="text-[#b30000] font-bold text-xl hidden md:block">Nội Dung Trình Chiếu</span>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 min-h-screen relative z-10">
        <div className="container mx-auto px-6 max-w-5xl relative">
          <div className="bg-gradient-to-r from-[#b30000]/80 to-[#8b0000]/80 p-12 rounded-3xl shadow-2xl mb-12 text-center border-4 border-[#FFD700] backdrop-blur-md hover:shadow-[0_20px_60px_rgba(179,0,0,0.4)] transition-all duration-300">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
              BÀI THUYẾT TRÌNH
            </h1>
            <h2 className="text-2xl md:text-3xl text-[#FFD700] font-bold drop-shadow-md" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>
              SINH VIÊN TRÊN "MẶT TRẬN VĂN HÓA" – CUỘC CHIẾN CHỐNG "GIẶC NỘI XÂM"
            </h2>
          </div>

          <div className="bg-white/75 backdrop-blur-md p-8 rounded-2xl shadow-2xl mb-12 border-4 border-[#FFD700] hover:shadow-[0_20px_60px_rgba(255,215,0,0.3)] transition-all duration-300">
            <h3 className="text-3xl font-black text-[#b30000] mb-6 flex items-center gap-2 drop-shadow-md">
              <BookOpen size={32} />
              MỤC LỤC
            </h3>
            <nav className="space-y-3">
              <button onClick={() => scrollToSection('section1')} className="block w-full text-left px-5 py-4 bg-gradient-to-r from-white to-gray-50 rounded-lg hover:bg-gradient-to-r hover:from-[#FFD700]/20 hover:to-[#FFD700]/10 hover:translate-x-2 transition-all shadow-md border-2 border-gray-200 hover:border-[#FFD700] hover:shadow-lg">
                <span className="font-bold text-[#b30000] text-lg">Phần 1:</span> <span className="text-gray-900 font-semibold">Dẫn Nhập – Từ Bối Cảnh Lịch Sử Đến Nhiệm Vụ Thời Đại</span>
              </button>
              <button onClick={() => scrollToSection('section2')} className="block w-full text-left px-5 py-4 bg-gradient-to-r from-white to-gray-50 rounded-lg hover:bg-gradient-to-r hover:from-[#FFD700]/20 hover:to-[#FFD700]/10 hover:translate-x-2 transition-all shadow-md border-2 border-gray-200 hover:border-[#FFD700] hover:shadow-lg">
                <span className="font-bold text-[#b30000] text-lg">Phần 2:</span> <span className="text-gray-900 font-semibold">Nhận Diện "Kẻ Thù" – Giặc Nội Xâm Là Ai?</span>
              </button>
              <button onClick={() => scrollToSection('section3')} className="block w-full text-left px-5 py-4 bg-gradient-to-r from-white to-gray-50 rounded-lg hover:bg-gradient-to-r hover:from-[#FFD700]/20 hover:to-[#FFD700]/10 hover:translate-x-2 transition-all shadow-md border-2 border-gray-200 hover:border-[#FFD700] hover:shadow-lg">
                <span className="font-bold text-[#b30000] text-lg">Phần 3:</span> <span className="text-gray-900 font-semibold">Vũ Khí Chiến Đấu – "Phò Chính Trừ Tà" & Đời Sống Mới</span>
              </button>
              <button onClick={() => scrollToSection('section4')} className="block w-full text-left px-5 py-4 bg-gradient-to-r from-white to-gray-50 rounded-lg hover:bg-gradient-to-r hover:from-[#FFD700]/20 hover:to-[#FFD700]/10 hover:translate-x-2 transition-all shadow-md border-2 border-gray-200 hover:border-[#FFD700] hover:shadow-lg">
                <span className="font-bold text-[#b30000] text-lg">Phần 4:</span> <span className="text-gray-900 font-semibold">Vận Dụng Thực Tiễn – Hành Động Của Sinh Viên</span>
              </button>
              <button onClick={() => scrollToSection('section5')} className="block w-full text-left px-5 py-4 bg-gradient-to-r from-white to-gray-50 rounded-lg hover:bg-gradient-to-r hover:from-[#FFD700]/20 hover:to-[#FFD700]/10 hover:translate-x-2 transition-all shadow-md border-2 border-gray-200 hover:border-[#FFD700] hover:shadow-lg">
                <span className="font-bold text-[#b30000] text-lg">Phần 5:</span> <span className="text-gray-900 font-semibold">Kết Luận – Mỗi Sinh Viên Là Một Chiến Sĩ</span>
              </button>
              <button onClick={() => scrollToSection('section6')} className="block w-full text-left px-5 py-4 bg-gradient-to-r from-white to-gray-50 rounded-lg hover:bg-gradient-to-r hover:from-[#FFD700]/20 hover:to-[#FFD700]/10 hover:translate-x-2 transition-all shadow-md border-2 border-gray-200 hover:border-[#FFD700] hover:shadow-lg">
                <span className="font-bold text-[#b30000] text-lg">Phần 6:</span> <span className="text-gray-900 font-semibold">Tài Liệu Tham Khảo & Trích Dẫn</span>
              </button>
            </nav>
          </div>

          <article className="prose prose-lg max-w-none">
            <section id="section1" className="fade-in-section mb-16 relative">
              <div className="absolute top-0 hidden xl:block" style={{right: '-200px'}}>
                <div className="sticky top-24">
                  <button
                    onClick={() => setActiveChatBot(activeChatBot === 1 ? null : 1)}
                    className="cultural-bot-button group relative"
                  >
                    <div className="w-32 h-40 bg-gradient-to-b from-[#FFD700] via-[#FFA500] to-[#FF8C00] rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105 relative overflow-hidden">
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#8B4513] rounded-full border-4 border-[#654321]"></div>
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-3 bg-[#b30000] rounded-full"></div>
                      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-2xl">📖</div>
                      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-20 h-16 bg-[#FFD700] rounded-lg flex items-center justify-center">
                        <BookOpen size={24} className="text-[#b30000]" />
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 text-center text-xs font-bold text-[#8B4513]">VĂN HÓA</div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#b30000] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <MessageCircle size={20} className="text-white" />
                    </div>
                  </button>
                  {activeChatBot === 1 && (
                    <div className="mt-4 w-64 bg-white rounded-2xl shadow-2xl p-4 border-4 border-[#FFD700] animate-fade-in">
                      <div className="flex justify-between items-center mb-3 pb-3 border-b-2 border-[#FFD700]">
                        <h4 className="font-bold text-[#b30000] flex items-center gap-2">
                          <BookOpen size={16} />
                          Trợ Lý Văn Hóa
                        </h4>
                        <button onClick={() => setActiveChatBot(null)} className="text-gray-500 hover:text-[#b30000]">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="space-y-2 text-sm text-black font-semibold">
                        {culturalBotMessages[1].map((msg, i) => (
                          <div key={i} className="bg-[#FFD700]/10 p-2 rounded-lg hover:bg-[#FFD700]/20 transition-colors">
                            {msg}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFD700]/85 via-[#FFA500]/85 to-[#FF6347]/85 p-8 shadow-2xl backdrop-blur-md hover:shadow-[0_20px_60px_rgba(255,165,0,0.4)] transition-all duration-300">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-2 left-4 text-6xl">📚</div>
                  <div className="absolute bottom-2 right-4 text-6xl">🗺️</div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl">🇻🇳</div>
                </div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="text-6xl">📖</div>
                  <div>
                    <div className="text-base font-bold text-[#FFD700] mb-2 tracking-wider" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>PHẦN 1</div>
                    <h2 className="text-3xl font-bold text-white" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.9), 0 0 20px rgba(255,215,0,0.5)'}}>
                      DẪN NHẬP – TỪ BỐI CẢNH LỊCH SỬ ĐẾN NHIỆM VỤ THỜI ĐẠI
                    </h2>
                  </div>
                </div>
              </div>

              <div className="mb-6 relative">
                <img
                  src="/ho-chi-minh-reading-book-studying-marxism-leninism.jpg"
                  alt="Bác Hồ nghiên cứu"
                  className="w-full max-w-md float-right ml-6 mb-4 rounded-xl shadow-lg"
                />
              </div>
              <p className="text-black leading-relaxed mb-4 font-semibold text-lg">
                <strong>Kính thưa thầy/cô và các bạn,</strong>
              </p>
              <p className="text-gray-900 leading-relaxed mb-4 font-medium text-base">
                Để hiểu rõ vì sao Chủ tịch Hồ Chí Minh khẳng định văn hóa là một "mặt trận" và người làm văn hóa là "chiến sĩ", chúng ta cần đặt nó trong bối cảnh lịch sử đầy biến động cuối thế kỷ XIX – đầu thế kỷ XX.
              </p>
              <p className="text-gray-900 leading-relaxed mb-4 font-medium text-base">
                Lúc bấy giờ, sau khi xâm lược Việt Nam, thực dân Pháp không chỉ dùng quân sự để thống trị mà còn thi hành nhiều chính sách cực kỳ thâm độc về văn hóa:
              </p>
              <div className="space-y-4 mb-4">
                <div className="flex gap-3 items-start bg-red-50/50 backdrop-blur-sm p-4 rounded-lg border-l-4 border-red-600">
                  <div className="text-3xl flex-shrink-0">🚫</div>
                  <div>
                    <strong className="text-red-700">Chính sách ngu dân:</strong>
                    <p className="text-black font-semibold mt-1">hạn chế mở trường, không cho dân ta học cao, chỉ đào tạo một tầng lớp tay sai phục vụ chính quyền thực dân.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start bg-orange-50/50 backdrop-blur-sm p-4 rounded-lg border-l-4 border-orange-600">
                  <div className="text-3xl flex-shrink-0">🎭</div>
                  <div>
                    <strong className="text-orange-700">Chính sách đồng hóa:</strong>
                    <p className="text-black font-semibold mt-1">truyền bá lối sống, tư tưởng, thói quen, thị hiếu của văn hóa Pháp với mục đích làm "nhạt nhòa" bản sắc Việt.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start bg-amber-50/50 backdrop-blur-sm p-4 rounded-lg border-l-4 border-amber-600">
                  <div className="text-3xl flex-shrink-0">⚠️</div>
                  <div>
                    <strong className="text-amber-700">Chính sách chia rẽ tinh thần dân tộc:</strong>
                    <p className="text-black font-semibold mt-1">xuyên tạc lịch sử, thay đổi chương trình giáo dục, hạ thấp giá trị của tổ tiên ta.</p>
                  </div>
                </div>
              </div>
              <p className="text-black font-semibold leading-relaxed mb-4">
                <strong>Thực dân không chỉ muốn chiếm đất mà còn muốn chiếm luôn linh hồn và trí tuệ dân tộc.</strong>
              </p>
              <p className="text-black font-semibold leading-relaxed mb-4">
                Chính vì vậy, Hồ Chí Minh nhìn rất rõ:
              </p>
              <p className="text-black font-semibold leading-relaxed ml-6 mb-2">
                → Nếu văn hóa không đứng lên, dân tộc sẽ suy yếu từ bên trong.
              </p>
              <p className="text-black font-semibold leading-relaxed ml-6 mb-4">
                → Nếu tinh thần bị nô dịch, thì độc lập chính trị cũng chỉ là hình thức.
              </p>
              <div className="bg-[#FFD700]/10 border-l-4 border-[#FFD700] p-6 rounded-r-lg mb-4">
                <p className="text-black font-semibold italic">
                  Bác nói: <strong>"Văn hóa nghệ thuật cũng là một mặt trận. Anh chị em là chiến sĩ trên mặt trận ấy."</strong>
                </p>
              </div>
              <p className="text-black font-semibold leading-relaxed mb-6">
                Ngày nay, chúng ta không còn đối mặt với súng đạn, nhưng vẫn đang đứng trên mặt trận văn hóa mới, nơi kẻ thù không phải quân xâm lược mà là những thói hư tật xấu âm thầm gặm nhấm con người. Cuộc chiến này lặng lẽ hơn, nhưng hậu quả của nó cũng nặng nề không kém.
              </p>

              <div className="flex justify-between items-center mt-8 pt-6 border-t-2 border-[#FFD700]">
                <button
                  onClick={scrollToTop}
                  className="flex items-center gap-2 px-6 py-3 bg-[#FFD700] text-[#b30000] rounded-full font-semibold hover:scale-105 hover:shadow-lg transition-all"
                >
                  <ChevronUp size={20} />
                  Về Đầu Trang
                </button>
                <button
                  onClick={() => scrollToSection('section2')}
                  className="flex items-center gap-2 px-6 py-3 bg-[#b30000] text-white rounded-full font-semibold hover:scale-105 hover:shadow-lg transition-all"
                >
                  Phần Tiếp Theo
                  <ChevronDown size={20} />
                </button>
              </div>
            </section>

            <section id="section2" className="fade-in-section mb-16 relative">
              <div className="absolute top-0 hidden xl:block" style={{right: '-200px'}}>
                <div className="sticky top-24">
                  <button
                    onClick={() => setActiveChatBot(activeChatBot === 2 ? null : 2)}
                    className="cultural-bot-button group relative"
                  >
                    <div className="w-32 h-40 bg-gradient-to-b from-[#DC143C] via-[#b30000] to-[#8B0000] rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105 relative overflow-hidden">
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#8B4513] rounded-full border-4 border-[#654321]"></div>
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-3 bg-white rounded-full"></div>
                      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-2xl">⚔️</div>
                      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-20 h-16 bg-[#FFD700] rounded-lg flex items-center justify-center">
                        <Shield size={24} className="text-[#b30000]" />
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 text-center text-xs font-bold text-white">CHIẾN SĨ</div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <MessageCircle size={20} className="text-[#b30000]" />
                    </div>
                  </button>
                  {activeChatBot === 2 && (
                    <div className="mt-4 w-64 bg-white rounded-2xl shadow-2xl p-4 border-4 border-[#b30000] animate-fade-in">
                      <div className="flex justify-between items-center mb-3 pb-3 border-b-2 border-[#b30000]">
                        <h4 className="font-bold text-[#b30000] flex items-center gap-2">
                          <Shield size={16} />
                          Trợ Lý Chiến Sĩ
                        </h4>
                        <button onClick={() => setActiveChatBot(null)} className="text-gray-500 hover:text-[#b30000]">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="space-y-2 text-sm text-black font-semibold">
                        {culturalBotMessages[2].map((msg, i) => (
                          <div key={i} className="bg-[#b30000]/10 p-2 rounded-lg hover:bg-[#b30000]/20 transition-colors">
                            {msg}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#DC143C]/85 via-[#b30000]/85 to-[#8B0000]/85 p-8 shadow-2xl backdrop-blur-md hover:shadow-[0_20px_60px_rgba(179,0,0,0.4)] transition-all duration-300">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-2 left-4 text-6xl">⚔️</div>
                  <div className="absolute bottom-2 right-4 text-6xl">🛡️</div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl">⚠️</div>
                </div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="text-6xl">🎯</div>
                  <div>
                    <div className="text-base font-bold text-[#FFD700] mb-2 tracking-wider" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>PHẦN 2</div>
                    <h2 className="text-3xl font-bold text-white" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.9), 0 0 20px rgba(255,215,0,0.5)'}}>
                      NHẬN DIỆN "KẺ THÙ" – GIẶC NỘI XÂM LÀ AI?
                    </h2>
                  </div>
                </div>
              </div>
              <p className="text-black font-semibold leading-relaxed mb-4">
                Giặc nội xâm, theo tư tưởng Hồ Chí Minh, là những thói xấu trong chính con người Việt Nam, từ đó phá hoại phẩm chất đạo đức và làm suy yếu sức mạnh dân tộc.
              </p>
              <p className="text-black font-semibold leading-relaxed mb-4">
                <strong>Đây là thứ kẻ thù "vô hình", không nhìn thấy bằng mắt thường nhưng tồn tại trong mỗi suy nghĩ, hành vi hàng ngày.</strong>
              </p>
              <p className="text-black font-semibold leading-relaxed mb-6">
                Bác chỉ rõ bốn nhóm "giặc nội xâm" nguy hiểm:
              </p>

              <div className="space-y-6 mb-6">
                <div className="bg-gradient-to-r from-red-50/80 via-red-50/60 to-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border-l-8 border-red-600 relative overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="absolute top-4 right-4 text-6xl opacity-10">💰</div>
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">💰</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#b30000] mb-3">1. Tham ô – lãng phí – tệ nạn mùa nào cũng có</h3>
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🚨</span>
                          <p className="text-black font-semibold"><strong>Tham ô</strong> làm mất niềm tin của nhân dân.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">💸</span>
                          <p className="text-black font-semibold"><strong>Lãng phí</strong> làm thất thoát của công, của dân, của nước.</p>
                        </div>
                      </div>
                      <p className="text-black font-semibold mt-3 bg-white/90 p-3 rounded-lg">
                        Đáng sợ hơn, tham ô "mọc rễ" từ những hành vi rất nhỏ: gian lận trong lớp, chấm công hộ, sử dụng tiền quỹ sai mục đích, tiêu xài hoang phí đồng tiền của cha mẹ.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50/80 via-orange-50/60 to-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border-l-8 border-orange-600 relative overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="absolute top-4 right-4 text-6xl opacity-10">😴</div>
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">😴</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-orange-700 mb-3">2. Lười biếng – quan liêu – bệnh mãn tính của nhiều thế hệ</h3>
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">⏰</span>
                          <p className="text-black font-semibold">Lười làm việc, lười học, lười suy nghĩ → dẫn đến phụ thuộc, thụ động, trì trệ.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📄</span>
                          <p className="text-black font-semibold">Quan liêu là thói làm việc hình thức, xa rời thực tế, thiếu trách nhiệm.</p>
                        </div>
                      </div>
                      <p className="text-black font-semibold mt-3 bg-white/90 p-3 rounded-lg">
                        <strong>Một người trẻ lười biếng hôm nay → một cán bộ quan liêu ngày mai.</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50/80 via-purple-50/60 to-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border-l-8 border-purple-600 relative overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="absolute top-4 right-4 text-6xl opacity-10">💎</div>
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">💎</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-purple-700 mb-3">3. Phù hoa – xa xỉ</h3>
                      <p className="text-gray-900 font-medium mb-3">Đây là căn bệnh phổ biến nhất trong giới trẻ:</p>
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2"><span className="text-xl">📱</span><p className="text-black font-semibold">sống ảo, khoe của</p></div>
                        <div className="flex items-center gap-2"><span className="text-xl">🎭</span><p className="text-black font-semibold">chạy theo trend độc hại</p></div>
                        <div className="flex items-center gap-2"><span className="text-xl">✨</span><p className="text-black font-semibold">coi trọng hình thức hơn năng lực</p></div>
                        <div className="flex items-center gap-2"><span className="text-xl">🎪</span><p className="text-black font-semibold">"sống sang chảnh ảo" nhưng bên trong rỗng</p></div>
                      </div>
                      <p className="text-black font-semibold mt-3 bg-white/90 p-3 rounded-lg">
                        <strong>Hậu quả:</strong> Con người đánh mất giá trị thật, trở thành "nô lệ" của mạng xã hội.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-100/80 via-gray-100/60 to-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border-l-8 border-gray-600 relative overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="absolute top-4 right-4 text-6xl opacity-10">⛓️</div>
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">⛓️</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 font-semibold mb-3">4. Tâm lý nô lệ – sự tha hóa nguy hiểm nhất</h3>
                      <p className="text-gray-900 font-medium mb-3">
                        <strong>"Tự ti – sính ngoại – mất gốc"</strong>
                      </p>
                      <p className="text-gray-900 font-medium ml-6 mb-2">
                        → Nghe tiếng Việt thì ngại, nhưng nói tiếng nước ngoài sai vẫn tự hào.
                      </p>
                      <p className="text-gray-900 font-medium ml-6 mb-3">
                        → Thích đi theo trào lưu phương Tây mù quáng nhưng lại thờ ơ văn hóa dân tộc.
                      </p>
                      <p className="text-black font-semibold bg-white/90 p-3 rounded-lg">
                        Hoặc ngược lại: bảo thủ, cực đoan, từ chối cái mới cũng là tâm lý nô lệ tinh thần.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50/50 backdrop-blur-sm border-2 border-[#FFD700] p-6 rounded-xl">
                <h3 className="text-xl font-bold text-[#b30000] mb-4">⇒ Liên hệ thực tế sinh viên – "Chiến trường" sát nhất</h3>
                <ul className="list-disc list-inside space-y-2 text-black font-semibold">
                  <li><strong>Lãng phí:</strong> thời gian trôi qua trên game, mạng xã hội, "lướt TikTok cả ngày".</li>
                  <li><strong>Tham ô học thuật:</strong> đạo văn, nhờ bạn làm hộ bài nhóm, quay cóp thi cử.</li>
                  <li><strong>Lười biếng:</strong> trì hoãn, deadline dí mới làm.</li>
                  <li><strong>Phù phiếm:</strong> sống ảo, thích được công nhận qua "like" và "view".</li>
                </ul>
                <p className="text-gray-900 font-medium mt-4 font-semibold">
                  → Đây chính là những mầm bệnh âm thầm hủy hoại tương lai người trẻ.
                </p>
              </div>
            </section>

            <section id="section3" className="fade-in-section mb-16 relative">
              <div className="absolute top-0 hidden xl:block" style={{right: '-200px'}}>
                <div className="sticky top-24">
                  <button
                    onClick={() => setActiveChatBot(activeChatBot === 3 ? null : 3)}
                    className="cultural-bot-button group relative"
                  >
                    <div className="w-32 h-40 bg-gradient-to-b from-[#32CD32] via-[#228B22] to-[#006400] rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105 relative overflow-hidden">
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#8B4513] rounded-full border-4 border-[#654321]"></div>
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-3 bg-[#b30000] rounded-full"></div>
                      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-2xl">✨</div>
                      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-20 h-16 bg-[#FFD700] rounded-lg flex items-center justify-center text-2xl">
                        ⚖️
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 text-center text-xs font-bold text-white">CHÍNH TRỪ TÀ</div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <MessageCircle size={20} className="text-[#006400]" />
                    </div>
                  </button>
                  {activeChatBot === 3 && (
                    <div className="mt-4 w-64 bg-white rounded-2xl shadow-2xl p-4 border-4 border-[#228B22] animate-fade-in">
                      <div className="flex justify-between items-center mb-3 pb-3 border-b-2 border-[#228B22]">
                        <h4 className="font-bold text-[#006400] flex items-center gap-2">
                          ⚖️ Trợ Lý Đạo Đức
                        </h4>
                        <button onClick={() => setActiveChatBot(null)} className="text-gray-500 hover:text-[#006400]">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="space-y-2 text-sm text-black font-semibold">
                        {culturalBotMessages[3].map((msg, i) => (
                          <div key={i} className="bg-[#228B22]/10 p-2 rounded-lg hover:bg-[#228B22]/20 transition-colors">
                            {msg}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#32CD32]/85 via-[#228B22]/85 to-[#006400]/85 p-8 shadow-2xl backdrop-blur-md hover:shadow-[0_20px_60px_rgba(34,139,34,0.4)] transition-all duration-300">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-2 left-4 text-6xl">⚖️</div>
                  <div className="absolute bottom-2 right-4 text-6xl">🕯️</div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl">✨</div>
                </div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="text-6xl">⚔️</div>
                  <div>
                    <div className="text-base font-bold text-[#FFD700] mb-2 tracking-wider" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>PHẦN 3</div>
                    <h2 className="text-3xl font-bold text-white" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.9), 0 0 20px rgba(255,215,0,0.5)'}}>
                      VŨ KHÍ CHIẾN ĐẤU – "PHÒ CHÍNH TRỪ TÀ" & ĐỜI SỐNG MỚI
                    </h2>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-black text-[#8b0000] mb-4">1. "PHÒ CHÍNH TRỪ TÀ" – giá trị cốt lõi của mặt trận văn hóa</h3>

              <div className="bg-red-50/80 backdrop-blur-sm p-6 rounded-xl mb-6 shadow-lg">
                <h4 className="text-xl font-bold text-[#b30000] mb-3">TRỪ TÀ: chống lại cái xấu</h4>
                <p className="text-gray-900 font-medium mb-3">Sinh viên cần:</p>
                <ul className="list-disc list-inside space-y-2 text-black font-semibold">
                  <li>chống gian lận</li>
                  <li>chống lười biếng</li>
                  <li>chống vô kỷ luật</li>
                  <li>chống vô cảm trong tập thể</li>
                  <li>chống nói xấu, công kích cá nhân trên mạng</li>
                </ul>
                <p className="text-gray-900 font-medium mt-3 italic">
                  "Tà" không phải chỉ là tội ác lớn, đôi khi chỉ là sự cẩu thả, thói quen xấu, tâm lý ỷ lại.
                </p>
              </div>

              <div className="bg-yellow-50/70 backdrop-blur-sm p-6 rounded-xl mb-6 shadow-lg">
                <h4 className="text-xl font-bold text-[#b30000] mb-3">PHÒ CHÍNH: xây dựng cái đẹp</h4>
                <ul className="list-disc list-inside space-y-2 text-black font-semibold">
                  <li>Biểu dương người tốt</li>
                  <li>Lan tỏa hành động tử tế</li>
                  <li>Tôn vinh sự nỗ lực</li>
                  <li>Khuyến khích tinh thần cống hiến, sẻ chia</li>
                </ul>
                <div className="bg-[#FFD700]/20 border-l-4 border-[#FFD700] p-4 mt-4 rounded-r">
                  <p className="text-black font-semibold italic">
                    Bác dặn: <strong>"Muốn diệt cái xấu phải xây cái tốt."</strong>
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-black text-[#8b0000] mb-4">2. "ĐỜI SỐNG MỚI": CẦN – KIỆM – LIÊM – CHÍNH</h3>
              <p className="text-gray-900 font-medium mb-6">
                Đây là vũ khí đạo đức mạnh nhất chống lại giặc nội xâm.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/75 backdrop-blur-sm border-2 border-[#FFD700] p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <h4 className="text-xl font-bold text-[#b30000] mb-2">• CẦN</h4>
                  <p className="text-black font-semibold">
                    Nỗ lực, chủ động, sáng tạo → không đợi người nhắc.
                  </p>
                </div>
                <div className="bg-white/75 backdrop-blur-sm border-2 border-[#FFD700] p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <h4 className="text-xl font-bold text-[#b30000] mb-2">• KIỆM</h4>
                  <p className="text-black font-semibold">
                    Không hoang phí thời gian, tiền bạc, công sức → biết đủ, biết quý trọng.
                  </p>
                </div>
                <div className="bg-white/75 backdrop-blur-sm border-2 border-[#FFD700] p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <h4 className="text-xl font-bold text-[#b30000] mb-2">• LIÊM</h4>
                  <p className="text-black font-semibold">
                    Không gian dối, không tham lam → trung thực trong học tập, công việc.
                  </p>
                </div>
                <div className="bg-white/75 backdrop-blur-sm border-2 border-[#FFD700] p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <h4 className="text-xl font-bold text-[#b30000] mb-2">• CHÍNH</h4>
                  <p className="text-black font-semibold">
                    Sống thẳng thắn, công bằng → dám nói đúng, làm đúng.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#b30000] to-[#8b0000] text-white p-6 rounded-xl text-center">
                <p className="text-xl font-semibold">
                  Nếu mỗi sinh viên thực hành 4 phẩm chất này → giặc nội xâm sẽ suy yếu.
                </p>
              </div>
            </section>

            <section id="section4" className="fade-in-section mb-16 relative">
              <div className="absolute top-0 hidden xl:block" style={{right: '-200px'}}>
                <div className="sticky top-24">
                  <button
                    onClick={() => setActiveChatBot(activeChatBot === 4 ? null : 4)}
                    className="cultural-bot-button group relative"
                  >
                    <div className="w-32 h-40 bg-gradient-to-b from-[#4169E1] via-[#1E90FF] to-[#0000CD] rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105 relative overflow-hidden">
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#8B4513] rounded-full border-4 border-[#654321]"></div>
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-3 bg-[#b30000] rounded-full"></div>
                      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-2xl">🎓</div>
                      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-20 h-16 bg-[#FFD700] rounded-lg flex items-center justify-center text-2xl">
                        💼
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 text-center text-xs font-bold text-white">SINH VIÊN</div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <MessageCircle size={20} className="text-[#0000CD]" />
                    </div>
                  </button>
                  {activeChatBot === 4 && (
                    <div className="mt-4 w-64 bg-white rounded-2xl shadow-2xl p-4 border-4 border-[#1E90FF] animate-fade-in">
                      <div className="flex justify-between items-center mb-3 pb-3 border-b-2 border-[#1E90FF]">
                        <h4 className="font-bold text-[#0000CD] flex items-center gap-2">
                          🎓 Trợ Lý Sinh Viên
                        </h4>
                        <button onClick={() => setActiveChatBot(null)} className="text-gray-500 hover:text-[#0000CD]">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="space-y-2 text-sm text-black font-semibold">
                        {culturalBotMessages[4].map((msg, i) => (
                          <div key={i} className="bg-[#1E90FF]/10 p-2 rounded-lg hover:bg-[#1E90FF]/20 transition-colors">
                            {msg}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-[#FFD700] to-[#b30000] rounded-full mb-8"></div>
              <h2 className="text-3xl font-bold text-[#b30000] mb-6" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.2)'}}>
                PHẦN 4: VẬN DỤNG THỰC TIỄN – HÀNH ĐỘNG CỦA SINH VIÊN
              </h2>
              <p className="text-black font-semibold leading-relaxed mb-6">
                Để không chỉ hiểu mà còn thực hành, sinh viên cần hành động rõ ràng:
              </p>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50/80 via-blue-50/60 to-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                  <h3 className="text-xl font-bold text-[#b30000] mb-3">1. Rèn luyện Professionalism – thái độ chuyên nghiệp</h3>
                  <ul className="list-disc list-inside space-y-2 text-black font-semibold">
                    <li>đúng giờ</li>
                    <li>tôn trọng lời nói, lời hứa</li>
                    <li>hoàn thành công việc đúng hạn</li>
                    <li>giữ chữ tín, trách nhiệm</li>
                  </ul>
                  <p className="text-gray-900 font-medium mt-3 font-semibold">
                    → Đây là cách triệt tiêu lười biếng và bệnh đối phó.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50/80 via-green-50/60 to-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border-l-4 border-green-500">
                  <h3 className="text-xl font-bold text-[#b30000] mb-3">2. Bản lĩnh trên không gian mạng</h3>
                  <ul className="list-disc list-inside space-y-2 text-black font-semibold">
                    <li>tỉnh táo trước tin giả</li>
                    <li>không theo trend độc hại</li>
                    <li>không phát tán nội dung xấu</li>
                    <li>lan tỏa giá trị tích cực</li>
                  </ul>
                  <p className="text-gray-900 font-medium mt-3 font-semibold">
                    Không gian mạng là mặt trận nóng nhất của sinh viên thời nay.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-yellow-50/80 via-yellow-50/60 to-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
                  <h3 className="text-xl font-bold text-[#b30000] mb-3">3. Giữ bản sắc văn hóa Việt trong hội nhập</h3>
                  <ul className="list-disc list-inside space-y-2 text-black font-semibold">
                    <li>học ngoại ngữ nhưng trân trọng tiếng Việt</li>
                    <li>học công nghệ nhưng hiểu lịch sử</li>
                    <li>hội nhập nhưng giữ đạo lý sống Việt Nam</li>
                  </ul>
                  <div className="bg-[#FFD700]/20 border-l-4 border-[#FFD700] p-4 mt-4 rounded-r">
                    <p className="text-black font-semibold italic">
                      <strong>"Hòa nhập nhưng không hòa tan"</strong> chính là chuẩn mực của công dân toàn cầu có bản sắc.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="section5" className="fade-in-section mb-16 relative">
              <div className="absolute top-0 hidden xl:block" style={{right: '-200px'}}>
                <div className="sticky top-24">
                  <button
                    onClick={() => setActiveChatBot(activeChatBot === 5 ? null : 5)}
                    className="cultural-bot-button group relative"
                  >
                    <div className="w-32 h-40 bg-gradient-to-b from-[#FFD700] via-[#FFA500] to-[#FF6347] rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105 relative overflow-hidden border-4 border-[#b30000]">
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#8B4513] rounded-full border-4 border-[#654321]"></div>
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-3 bg-[#b30000] rounded-full"></div>
                      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-2xl">🏆</div>
                      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-20 h-16 bg-[#b30000] rounded-lg flex items-center justify-center text-2xl">
                        💪
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 text-center text-xs font-bold text-white bg-[#b30000] py-1 rounded">CHIẾN THẮNG</div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#b30000] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <MessageCircle size={20} className="text-white" />
                    </div>
                  </button>
                  {activeChatBot === 5 && (
                    <div className="mt-4 w-64 bg-white rounded-2xl shadow-2xl p-4 border-4 border-[#FFD700] animate-fade-in">
                      <div className="flex justify-between items-center mb-3 pb-3 border-b-2 border-[#FFD700]">
                        <h4 className="font-bold text-[#b30000] flex items-center gap-2">
                          🏆 Trợ Lý Chiến Thắng
                        </h4>
                        <button onClick={() => setActiveChatBot(null)} className="text-gray-500 hover:text-[#b30000]">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="space-y-2 text-sm text-black font-semibold">
                        {culturalBotMessages[5].map((msg, i) => (
                          <div key={i} className="bg-[#FFD700]/20 p-2 rounded-lg hover:bg-[#FFD700]/30 transition-colors">
                            {msg}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-[#FFD700] to-[#b30000] rounded-full mb-8"></div>
              <h2 className="text-3xl font-bold text-[#b30000] mb-6" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.2)'}}>
                PHẦN 5: KẾT LUẬN – MỖI SINH VIÊN LÀ MỘT CHIẾN SĨ
              </h2>
              <div className="bg-[#FFD700]/10 border-l-4 border-[#FFD700] p-6 rounded-r-lg mb-6">
                <p className="text-black font-semibold text-lg italic">
                  Hồ Chí Minh khẳng định: <strong>"Văn hoá soi đường cho quốc dân đi."</strong>
                </p>
              </div>
              <p className="text-black font-semibold leading-relaxed mb-4">
                Vì vậy, mỗi sinh viên không chỉ là người thụ hưởng văn hóa mà phải là người xây dựng, bảo vệ, lan tỏa văn hóa.
              </p>
              <p className="text-black font-semibold leading-relaxed mb-4">
                Cuộc chiến chống giặc nội xâm:
              </p>
              <ul className="list-disc list-inside space-y-2 text-black font-semibold mb-6 ml-6">
                <li>không có tiếng súng,</li>
                <li>nhưng diễn ra mỗi ngày,</li>
                <li>trong từng quyết định nhỏ,</li>
                <li>từng hành động, từng suy nghĩ của mỗi người.</li>
              </ul>
              <div className="bg-gradient-to-r from-[#b30000] to-[#8b0000] text-white p-8 rounded-2xl text-center shadow-2xl">
                <p className="text-2xl font-black mb-2">
                  Chiến thắng giặc nội xâm chính là chiến thắng bản thân,
                </p>
                <p className="text-xl">
                  và đó là chiến thắng khó nhất nhưng ý nghĩa nhất.
                </p>
              </div>
            </section>

            <section id="section6" className="fade-in-section mb-16">
              <div className="h-1 bg-gradient-to-r from-[#FFD700] to-[#b30000] rounded-full mb-8"></div>
              <h2 className="text-3xl font-bold text-[#b30000] mb-6" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.2)'}}>
                PHẦN 6: TÀI LIỆU THAM KHẢO & TRÍCH DẪN
              </h2>

              <h3 className="text-2xl font-black text-[#8b0000] mb-4">
                Tài liệu tham khảo
              </h3>
              <p className="text-gray-900 font-semibold mb-6 italic text-base">
                Nguồn tư liệu và trích dẫn sử dụng trong bài trình chiếu
              </p>

              <div className="bg-gray-50/50 backdrop-blur-sm p-6 rounded-xl mb-8">
                <ol className="list-decimal list-inside space-y-3 text-gray-900 font-medium">
                  <li>Hồ Chí Minh toàn tập — Tập 5, 10, 12 — Nhà xuất bản Chính trị quốc gia, Hà Nội</li>
                  <li>Tư tưởng Hồ Chí Minh về văn hóa — Viện nghiên cứu tư tưởng Hồ Chí Minh</li>
                  <li>Văn kiện Đại hội XIII của Đảng — nội dung về văn hóa, con người Việt Nam</li>
                  <li>Giáo trình Tư tưởng Hồ Chí Minh — Nhà xuất bản Chính trị quốc gia</li>
                </ol>
              </div>

              <h3 className="text-2xl font-semibold text-[#8b0000] mb-4">
                Kết luận
              </h3>
              <div className="bg-green-50 p-6 rounded-xl mb-8 border-l-4 border-green-500">
                <p className="text-black font-semibold leading-relaxed mb-4">
                  Bài thuyết trình đã làm rõ tầm quan trọng của 'mặt trận văn hóa' trong tư tưởng Hồ Chí Minh và vai trò của sinh viên trong cuộc chiến chống 'giặc nội xâm' thời đại mới.
                </p>
                <p className="text-gray-900 font-medium font-semibold mb-3">Những điểm chính:</p>
                <ul className="list-disc list-inside space-y-2 text-black font-semibold">
                  <li>Văn hóa là nền tảng tinh thần của dân tộc</li>
                  <li>Giặc nội xâm là thách thức hiện thực với mỗi sinh viên</li>
                  <li>'Phò chính trừ tà' là phương châm hành động</li>
                  <li>Cần – Kiệm – Liêm – Chính là phẩm chất cần rèn luyện</li>
                  <li>Mỗi sinh viên là chiến sĩ trên mặt trận văn hóa</li>
                </ul>
                <p className="text-[#b30000] font-bold text-xl mt-4 text-center">
                  Chiến thắng bản thân chính là chiến thắng vĩ đại nhất!
                </p>
              </div>

              <h3 className="text-2xl font-semibold text-[#8b0000] mb-4">
                Trích dẫn
              </h3>
              <div className="space-y-4">
                <div className="bg-white border-l-4 border-[#FFD700] p-6 rounded-r-xl shadow-md">
                  <p className="text-gray-900 font-semibold italic text-lg">
                    "Văn hoá soi đường cho quốc dân đi."
                  </p>
                  <p className="text-[#b30000] font-semibold mt-2">— Hồ Chí Minh</p>
                </div>

                <div className="bg-white border-l-4 border-[#FFD700] p-6 rounded-r-xl shadow-md">
                  <p className="text-gray-900 font-semibold italic text-lg">
                    "Văn hóa nghệ thuật cũng là một mặt trận. Anh chị em là chiến sĩ trên mặt trận ấy."
                  </p>
                  <p className="text-[#b30000] font-semibold mt-2">— Hồ Chí Minh</p>
                </div>

                <div className="bg-white border-l-4 border-[#FFD700] p-6 rounded-r-xl shadow-md">
                  <p className="text-gray-900 font-semibold italic text-lg">
                    "Muốn diệt cái xấu phải xây cái tốt."
                  </p>
                  <p className="text-[#b30000] font-semibold mt-2">— Hồ Chí Minh</p>
                </div>

                <div className="bg-white border-l-4 border-[#FFD700] p-6 rounded-r-xl shadow-md">
                  <p className="text-gray-900 font-semibold italic text-lg">
                    "Vì lợi ích mười năm thì phải trồng cây, vì lợi ích trăm năm thì phải trồng người."
                  </p>
                  <p className="text-[#b30000] font-semibold mt-2">— Hồ Chí Minh</p>
                </div>
              </div>
            </section>
          </article>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => navigate('/minigame')}
          className="cta-button-floating"
        >
          CHUYỂN SANG MINI GAME
        </button>
      </div>
    </div>
  );
}
