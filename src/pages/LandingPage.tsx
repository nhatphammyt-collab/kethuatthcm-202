import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { balladLyrics } from '../data/lyrics';
import VietnamFlagLogo from '../components/VietnamFlagLogo';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [currentLyric, setCurrentLyric] = useState<string>("");
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [clickCount, setClickCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

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

    // Observer for timeline section to show bubble
    const timelineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShowBubble(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in-section').forEach((el) => {
      observer.observe(el);
    });

    if (timelineRef.current) {
      timelineObserver.observe(timelineRef.current);
    }

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      timelineObserver.disconnect();
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      // Handle double click to skip to quiz
      setClickCount(prev => prev + 1);
      
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
      
      clickTimerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 300); // Reset after 300ms
      
      // Double click detected - skip to quiz
      if (clickCount === 1) {
        if (audioRef.current.paused) {
          setHasClicked(true);
          setShowBubble(true);
          setShowQuiz(true);
          setClickCount(0);
          return;
        }
      }
      
      if (isPlaying) {
        // Pause music and hide bubble
        audioRef.current.pause();
        setIsPlaying(false);
        setShowBubble(false);
        setShowQuiz(false);
      } else {
        if (!hasClicked) {
          // First click - show hint message
          setHasClicked(true);
          setShowBubble(true);
          // Wait a bit before playing
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play();
              setIsPlaying(true);
            }
          }, 1500);
        } else {
          // Already clicked before, just play
          audioRef.current.play();
          setIsPlaying(true);
          setShowBubble(true);
        }
      }
    }
  };

  const handleMusicEnded = () => {
    setIsPlaying(false);
    setCurrentLyric("");
    setShowQuiz(true); // Show quiz when music ends
    setShowBubble(true); // Keep bubble visible
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const correctAnswer = "the ballad of ho chi minh";
    const userAnswer = quizAnswer.trim().toLowerCase();
    
    if (userAnswer === correctAnswer) {
      // Correct answer!
      setShowBubble(true);
      setCurrentLyric("🎉 Chính xác! Đó là 'The Ballad of Ho Chi Minh'");
      setShowQuiz(false);
      setQuizAnswer("");
      
      // Hide success message after 3s
      setTimeout(() => {
        setShowBubble(false);
        setCurrentLyric("");
        setHasClicked(false);
      }, 3000);
    } else {
      // Wrong answer - reset everything
      setShowQuiz(false);
      setShowBubble(false);
      setHasClicked(false);
      setQuizAnswer("");
      setCurrentLyric("");
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && isPlaying) {
      const currentTime = audioRef.current.currentTime;
      
      // Tìm lyric phù hợp với thời gian hiện tại
      const lyric = balladLyrics
        .filter(l => l.time <= currentTime)
        .pop();
      
      if (lyric) {
        setCurrentLyric(lyric.text);
      }
    }
  };

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
          <header className="top-nav">
            <div className="brand logo-row cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <VietnamFlagLogo size={40} className="header-flag" />
              <div className="text-left">
                <div className="text-[#FFD700] font-bold text-sm">TƯ TƯỞNG</div>
                <div className="text-white font-bold text-base">HỒ CHÍ MINH</div>
              </div>
            </div>

            <nav className="nav-pill hidden md:flex">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`nav-item ${location.pathname === '/' ? 'nav-item--active' : ''}`}
              >
                Trang Chủ
              </a>
              <a
                href="/presentation"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/presentation');
                }}
                className={`nav-item ${location.pathname === '/presentation' ? 'nav-item--active' : ''}`}
              >
                Trình Chiếu
              </a>
              <a
                href="/memory-gallery"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/memory-gallery');
                }}
                className={`nav-item ${location.pathname === '/memory-gallery' ? 'nav-item--active' : ''}`}
              >
                Thư Viện Kỷ Niệm
              </a>
              <a
                href="/minigame"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/minigame');
                }}
                className={`nav-item ${location.pathname === '/minigame' ? 'nav-item--active' : ''}`}
              >
                Minigame
              </a>
            </nav>
          </header>
        </div>
      </nav>

      <div className="relative z-10">
        <header className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="glass-card max-w-4xl mx-auto animate-fade-in">
            <div className="logo-row justify-center mb-8">
              <VietnamFlagLogo size={56} className="hero-flag" />
              <div className="text-left">
                <div className="text-[#FFD700] font-bold text-lg">TƯ TƯỞNG</div>
                <div className="text-white font-bold text-2xl">HỒ CHÍ MINH</div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl" style={{textShadow: '3px 3px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'}}>
              SINH VIÊN TRÊN <span className="whitespace-nowrap">"MẶT TRẬN VĂN HÓA"</span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-[#FFD700] mb-8 drop-shadow-xl" style={{textShadow: '2px 2px 6px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.6)'}}>
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
                <div className="glass-card hover:glow transition-all duration-500">
                  <h3 className="text-3xl font-bold text-[#FFD700] mb-6" style={{textShadow: '2px 2px 6px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.6)'}}>
                    {section.title}
                  </h3>
                  <p className="text-lg text-gray-100 leading-relaxed mb-6" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>
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

        <section className="container mx-auto px-6 py-20" ref={timelineRef}>
          <div className="glass-card mb-20 fade-in-section">
            {/* Title with Singing Character */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex-1 flex justify-start">
                <div className="relative ml-4">
                  <img
                    src={isPlaying ? "/singer2.png" : "/singer1.png"}
                    alt="Singer"
                    className="w-40 h-40 object-contain cursor-pointer hover:scale-110 transition-transform duration-300 drop-shadow-2xl"
                    onClick={toggleMusic}
                    title={isPlaying ? "Click để dừng nhạc" : "Click để phát nhạc"}
                  />
                  {isPlaying && (
                    <div className="absolute -top-2 -right-2">
                      <div className="relative">
                        <span className="flex h-6 w-6">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD700] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-6 w-6 bg-[#FFD700] items-center justify-center">
                            <span className="text-xs">🎵</span>
                          </span>
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Speech bubble */}
                  {showBubble && (
                    <div className="absolute -top-6 left-full ml-2 bg-white text-gray-800 px-5 py-3 rounded-2xl shadow-xl w-72 animate-fade-in z-10">
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white"></div>
                      
                      {showQuiz ? (
                        // Quiz mode
                        <form onSubmit={handleQuizSubmit} className="space-y-2">
                          <p className="text-sm font-medium mb-2">
                            🎵 Bạn biết đây là bài hát gì không?
                          </p>
                          <input
                            type="text"
                            value={quizAnswer}
                            onChange={(e) => setQuizAnswer(e.target.value)}
                            placeholder="Bài hát này là: "
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="w-full px-3 py-2 text-sm bg-[#FFD700] text-[#b30000] font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                          >
                            Trả lời
                          </button>
                        </form>
                      ) : (
                        // Normal mode
                        <p className="text-sm font-medium leading-relaxed">
                          {!hasClicked 
                            ? "🎤 Bạn có muốn nghe bài hát về Bác không?"
                            : isPlaying && currentLyric
                              ? currentLyric
                              : currentLyric || "🎵 Bạn hãy đoán xem đây là bài gì nhé!"}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <audio
                  ref={audioRef}
                  src="/song.mp3"
                  onEnded={handleMusicEnded}
                  onTimeUpdate={handleTimeUpdate}
                />
              </div>
              <h2 className="text-3xl font-bold text-[#FFD700] text-center flex-1 whitespace-nowrap" style={{textShadow: '2px 2px 6px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.6)'}}>
                Dòng Thời Gian Cuộc Đời Chủ Tịch Hồ Chí Minh
              </h2>
              <div className="flex-1"></div>
            </div>

            {/* Chủ tịch HCM image */}
            <div className="flex justify-center mb-12">
              <img
                src="/chutichhcm.jpg"
                alt="Chủ tịch Hồ Chí Minh"
                className="w-64 h-64 object-cover rounded-full shadow-2xl border-4 border-[#FFD700]"
              />
            </div>

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

          <div className="glass-card mb-20 fade-in-section">
            <h2 className="text-4xl font-bold text-[#FFD700] text-center mb-12" style={{textShadow: '2px 2px 6px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.6)'}}>
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

          <div className="glass-card mb-20 fade-in-section">
            <h2 className="text-4xl font-bold text-[#FFD700] text-center mb-12" style={{textShadow: '2px 2px 6px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.6)'}}>
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

          <div className="glass-card mb-20 fade-in-section">
            <h2 className="text-4xl font-bold text-[#FFD700] text-center mb-8" style={{textShadow: '2px 2px 6px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.6)'}}>
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
