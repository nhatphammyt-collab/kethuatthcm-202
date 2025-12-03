import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

const MemoryGalleryPage = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [showMascot, setShowMascot] = useState(false);

  const memoryImages = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    src: `/memories/memory-${i + 1}.jpg`,
    caption: `Kỷ niệm ${i + 1} - Hành trình học tập và trưởng thành`
  }));

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowMascot(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (isAutoPlay && lightboxOpen) {
      interval = window.setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % memoryImages.length);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlay, lightboxOpen, memoryImages.length]);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setIsAutoPlay(false);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + memoryImages.length) % memoryImages.length);
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % memoryImages.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8DC] via-[#FAEBD7] to-[#FFE4B5] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <div className="absolute top-10 left-10 text-9xl">🥁</div>
        <div className="absolute top-40 right-20 text-8xl">🪷</div>
        <div className="absolute bottom-40 left-32 text-7xl">⭐</div>
        <div className="absolute top-60 right-40 text-9xl">🥁</div>
        <div className="absolute bottom-20 right-60 text-8xl">🪷</div>
        <div className="absolute top-1/3 left-1/4 text-7xl">⭐</div>
      </div>

      {showMascot && (
        <div className="hidden xl:block fixed right-8 top-1/3 z-20 animate-fade-in">
          <div className="w-32 h-40 bg-gradient-to-b from-[#FFD700] via-[#FFA500] to-[#FF6347] rounded-2xl shadow-2xl relative overflow-hidden border-4 border-[#b30000]">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#8B4513] rounded-full border-4 border-[#654321]"></div>
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-3 bg-[#b30000] rounded-full"></div>
            <div className="absolute top-12 left-1/2 -translate-x-1/2 text-2xl">📷</div>
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-20 h-16 bg-[#b30000] rounded-lg flex items-center justify-center text-2xl">
              📸
            </div>
            <div className="absolute bottom-2 left-2 right-2 text-center text-xs font-bold text-white bg-[#b30000] py-1 rounded">PHÓ VIÊN</div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-[#FFD700]/90 via-[#FFA500]/90 to-[#FF6347]/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-4 border-[#b30000] mb-8">
            <h1 className="text-5xl font-black text-white mb-4" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.8), 0 0 20px rgba(255,215,0,0.5)'}}>
              THƯ VIỆN KỶ NIỆM
            </h1>
            <p className="text-xl text-white font-semibold" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.6)'}}>
              Nơi lưu giữ hình ảnh của bài thuyết trình & hành trình học tập
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {memoryImages.map((image, index) => (
            <div
              key={image.id}
              onClick={() => openLightbox(index)}
              className="group cursor-pointer bg-white/40 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-[#FFD700] shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 flex items-center justify-center overflow-hidden">
                <img
                  src={image.src}
                  alt={image.caption}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const placeholder = document.createElement('div');
                      placeholder.className = 'w-full h-full flex flex-col items-center justify-center text-[#b30000]';
                      placeholder.innerHTML = `<svg class="w-24 h-24 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" stroke-width="2"/><polyline points="21 15 16 10 5 21" stroke-width="2"/></svg><span class="text-sm font-semibold">Hình ảnh ${index + 1}</span>`;
                      parent.appendChild(placeholder);
                    }
                  }}
                />
              </div>
              <div className="p-4 bg-white/60 backdrop-blur-sm">
                <p className="text-sm font-semibold text-[#b30000] text-center">
                  {image.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 backdrop-blur-sm border-2 border-[#FFD700] rounded-2xl p-6 mb-8 text-center">
          <p className="text-gray-900 font-semibold mb-4">
            💡 Bạn có thể thay thế các hình này bằng ảnh cá nhân trong thư mục <code className="bg-white/60 px-2 py-1 rounded text-[#b30000]">/public/memories/</code>
          </p>
          <button
            onClick={() => {
              openLightbox(0);
              setIsAutoPlay(true);
            }}
            className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#b30000] font-bold px-8 py-3 rounded-full hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <Play size={20} />
            <span>Xem Dạng Trình Chiếu</span>
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#b30000] font-bold px-8 py-4 rounded-full hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] transition-all duration-300 hover:scale-105 animate-bounce-slow"
          >
            Quay lại trang chủ
          </Link>
          <Link
            to="/presentation"
            className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#b30000] font-bold px-8 py-4 rounded-full hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] transition-all duration-300 hover:scale-105 animate-bounce-slow"
          >
            Quay lại trình chiếu
          </Link>
          <Link
            to="/minigame"
            className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#b30000] font-bold px-8 py-4 rounded-full hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] transition-all duration-300 hover:scale-105 animate-bounce-slow"
          >
            Sang Mini Game
          </Link>
        </div>
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-[#FFD700] transition-colors z-10"
          >
            <X size={40} />
          </button>

          <button
            onClick={goToPrevious}
            className="absolute left-4 text-white hover:text-[#FFD700] transition-colors z-10"
          >
            <ChevronLeft size={60} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 text-white hover:text-[#FFD700] transition-colors z-10"
          >
            <ChevronRight size={60} />
          </button>

          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#FFD700]/20 backdrop-blur-sm text-white hover:bg-[#FFD700]/40 transition-colors px-6 py-3 rounded-full flex items-center gap-2"
          >
            {isAutoPlay ? (
              <>
                <Pause size={20} />
                <span>Tạm dừng</span>
              </>
            ) : (
              <>
                <Play size={20} />
                <span>Tự động</span>
              </>
            )}
          </button>

          <div className="max-w-5xl max-h-[80vh] flex flex-col items-center">
            <img
              src={memoryImages[currentImageIndex].src}
              alt={memoryImages[currentImageIndex].caption}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const placeholder = document.createElement('div');
                  placeholder.className = 'w-96 h-96 flex flex-col items-center justify-center text-white bg-gray-800 rounded-lg';
                  placeholder.innerHTML = `<svg class="w-32 h-32 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" stroke-width="2"/><polyline points="21 15 16 10 5 21" stroke-width="2"/></svg><span class="text-lg font-semibold">Hình ảnh ${currentImageIndex + 1}</span>`;
                  parent.appendChild(placeholder);
                }
              }}
            />
            <p className="mt-4 text-white text-xl font-semibold text-center">
              {memoryImages[currentImageIndex].caption}
            </p>
            <p className="text-[#FFD700] text-sm mt-2">
              {currentImageIndex + 1} / {memoryImages.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryGalleryPage;
