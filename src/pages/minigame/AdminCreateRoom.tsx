import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../../services/firebase/gameService';
import { DEFAULT_SETTINGS } from '../../types/game';

export default function AdminCreateRoom() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    maxPlayers: DEFAULT_SETTINGS.maxPlayers,
    totalQuestions: DEFAULT_SETTINGS.totalQuestions,
    gameDuration: DEFAULT_SETTINGS.gameDuration, // 10 phút = 600 giây
  });

  const handleCreateRoom = async () => {
    setLoading(true);
    setError(null);

    try {
      // Generate a simple admin ID (in production, use auth)
      const adminId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const roomId = await createRoom(adminId, {
        maxPlayers: settings.maxPlayers,
        totalQuestions: settings.totalQuestions,
        gameDuration: settings.gameDuration,
      });

      if (roomId) {
        // Navigate to lobby with admin role
        navigate(`/minigame/lobby/${roomId}`, { 
          state: { 
            role: 'admin', 
            adminId,
            roomId 
          } 
        });
      } else {
        setError('Không thể tạo phòng. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Có lỗi xảy ra khi tạo phòng.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    return `${mins} phút`;
  };

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
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="glassmorphism-card p-8 rounded-3xl">
            <h1 className="text-4xl font-bold text-white mb-2 text-center">
              TẠO PHÒNG GAME
            </h1>
            <p className="text-gray-200 text-center mb-8">
              Cấu hình phòng chơi cho lớp học
            </p>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Số người chơi tối đa
                </label>
                <input
                  type="number"
                  min="2"
                  max="100"
                  value={settings.maxPlayers}
                  onChange={(e) => setSettings({
                    ...settings,
                    maxPlayers: parseInt(e.target.value) || 2
                  })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Số câu hỏi
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={settings.totalQuestions}
                  onChange={(e) => setSettings({
                    ...settings,
                    totalQuestions: parseInt(e.target.value) || 5
                  })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Thời gian game: {formatDuration(settings.gameDuration)}
                </label>
                <input
                  type="range"
                  min="300"
                  max="900"
                  step="60"
                  value={settings.gameDuration}
                  onChange={(e) => setSettings({
                    ...settings,
                    gameDuration: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-300 mt-1">
                  <span>5 phút</span>
                  <span>15 phút</span>
                </div>
              </div>

              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full bg-[#FFD700] text-[#b30000] px-8 py-4 rounded-xl font-bold text-xl hover:scale-105 hover:shadow-2xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang tạo phòng...' : 'TẠO PHÒNG'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

