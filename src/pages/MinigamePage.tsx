import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gamepad2, Crown, Users } from 'lucide-react';

export default function MinigamePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/image.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="relative z-10">
        <nav className="container mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/presentation')}
            className="flex items-center gap-2 bg-[#FFD700] text-[#b30000] px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
          >
            <ArrowLeft size={20} />
            Quay lại trang tài liệu
          </button>
        </nav>

        <main className="container mx-auto px-6 py-20 flex items-center justify-center min-h-[80vh]">
          <div className="glassmorphism-card max-w-2xl w-full p-12 rounded-3xl text-center animate-fade-in">
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 bg-[#FFD700] rounded-full flex items-center justify-center shadow-2xl">
                <Gamepad2 size={64} className="text-[#b30000]" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              MINI GAME
            </h1>
            <h2 className="text-2xl md:text-3xl text-[#FFD700] font-semibold mb-8 leading-snug">
              <span className="block">KIỂM TRA KIẾN THỨC</span>
              <span className="block text-2xl md:text-[2.2rem] tracking-wide">
                TƯ TƯỞNG HỒ CHÍ MINH
              </span>
            </h2>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl mb-8">
              <p className="text-xl text-gray-100 mb-6">
                Chọn vai trò của bạn
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/minigame/create')}
                  className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#b30000] px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 hover:shadow-2xl transition-all shadow-lg flex items-center justify-center gap-3"
                >
                  <Crown size={24} />
                  TẠO PHÒNG
                </button>
                
                <button
                  onClick={() => navigate('/minigame/join')}
                  className="flex-1 bg-gradient-to-r from-[#1E90FF] to-[#4169E1] text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 hover:shadow-2xl transition-all shadow-lg flex items-center justify-center gap-3"
                >
                  <Users size={24} />
                  THAM GIA PHÒNG
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
