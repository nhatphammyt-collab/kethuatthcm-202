import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoomByCode, joinRoom } from '../../services/firebase/gameService';

export default function PlayerJoinRoom() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinRoom = async () => {
    if (!roomCode.trim() || !playerName.trim()) {
      setError('Vui lòng nhập đầy đủ mã phòng và tên của bạn');
      return;
    }

    if (playerName.length < 2 || playerName.length > 20) {
      setError('Tên phải từ 2-20 ký tự');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find room by code
      const room = await getRoomByCode(roomCode.toUpperCase().trim());

      if (!room) {
        setError('Không tìm thấy phòng với mã này');
        setLoading(false);
        return;
      }

      // Check if room is still waiting
      if (room.status !== 'waiting') {
        setError('Phòng đã bắt đầu game');
        setLoading(false);
        return;
      }

      // Generate player ID
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Join room
      const success = await joinRoom(room.roomId, playerId, playerName.trim());

      if (success) {
        // Navigate to lobby
        navigate(`/minigame/lobby/${room.roomId}`, {
          state: {
            role: 'player',
            playerId,
            playerName: playerName.trim(),
          },
        });
      } else {
        setError('Không thể tham gia phòng. Có thể phòng đã đầy hoặc tên đã được sử dụng.');
      }
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Có lỗi xảy ra khi tham gia phòng.');
    } finally {
      setLoading(false);
    }
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
        <div className="max-w-md mx-auto">
          <div className="glassmorphism-card p-8 rounded-3xl">
            <h1 className="text-4xl font-bold text-white mb-2 text-center">
              THAM GIA PHÒNG
            </h1>
            <p className="text-gray-200 text-center mb-8">
              Nhập mã phòng và tên của bạn
            </p>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Mã phòng (6 ký tự)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-center text-2xl font-bold tracking-widest"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Tên của bạn
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                />
                <p className="text-gray-300 text-sm mt-1">2-20 ký tự</p>
              </div>

              <button
                onClick={handleJoinRoom}
                disabled={loading}
                className="w-full bg-[#FFD700] text-[#b30000] px-8 py-4 rounded-xl font-bold text-xl hover:scale-105 hover:shadow-2xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang tham gia...' : 'THAM GIA'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

