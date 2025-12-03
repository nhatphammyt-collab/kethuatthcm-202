import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gamepad2 } from 'lucide-react';

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
            <h2 className="text-2xl md:text-3xl text-[#FFD700] font-semibold mb-8">
              KIỂM TRA KIẾN THỨC TƯ TƯỞNG HỒ CHÍ MINH
            </h2>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl mb-8">
              <p className="text-xl text-gray-100 italic">
                Nội dung mini game sẽ được bổ sung sau.
              </p>
            </div>

            <button
              className="bg-[#FFD700] text-[#b30000] px-12 py-4 rounded-xl font-bold text-xl hover:scale-105 hover:shadow-2xl transition-all shadow-lg"
              disabled
            >
              BẮT ĐẦU MINI GAME
            </button>

            <p className="text-gray-300 mt-6 text-sm">
              (Chức năng đang được phát triển)
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
