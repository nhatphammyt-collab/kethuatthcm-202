import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { subscribeToRoom, startGame, getRoomById } from '../../services/firebase/gameService';
import type { Room } from '../../types/game';
import { ArrowLeft, Users, Play, BookOpen, ChevronDown, ChevronUp, Dice6, Zap, Gift } from 'lucide-react';

export default function LobbyRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { role, adminId, playerId } = location.state || {};

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate('/minigame');
      return;
    }

    // Subscribe to room changes
    const unsubscribe = subscribeToRoom(roomId, (roomData) => {
      setRoom(roomData);
      setLoading(false);

      // If game started, navigate to game board
      if (roomData?.status === 'playing') {
        navigate(`/minigame/game/${roomId}`, { 
          state: { role, adminId, playerId } 
        });
      }
    });

    return () => unsubscribe();
  }, [roomId, navigate, role, adminId, playerId]);

  const handleStartGame = async () => {
    if (!roomId || !adminId || role !== 'admin') return;

    setStarting(true);
    const success = await startGame(roomId, adminId);
    
    if (!success) {
      alert('Không thể bắt đầu game. Vui lòng thử lại.');
      setStarting(false);
    }
    // Navigation will happen automatically via useEffect
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/40">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/40">
        <div className="text-white text-xl">Không tìm thấy phòng</div>
      </div>
    );
  }

  const players = Object.entries(room.players || {});
  const isAdmin = role === 'admin' && adminId === room.adminId;

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
        <button
          onClick={() => navigate('/minigame')}
          className="mb-6 flex items-center gap-2 bg-[#FFD700] text-[#b30000] px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="glassmorphism-card p-8 rounded-3xl mb-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                PHÒNG CHỜ
              </h1>
              <div className="bg-[#FFD700]/20 border-2 border-[#FFD700] rounded-xl p-4 inline-block">
                <p className="text-[#FFD700] font-bold text-2xl tracking-widest">
                  {room.roomCode}
                </p>
                <p className="text-white text-sm mt-2">Mã phòng</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-8">
              <Users className="text-[#FFD700]" size={32} />
              <div className="text-white">
                <span className="text-3xl font-bold">{players.length}</span>
                <span className="text-gray-300"> / {room.settings.maxPlayers}</span>
              </div>
            </div>

            {/* Hướng Dẫn Chơi Game */}
            <div className="bg-white/10 rounded-xl p-6 mb-6">
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="w-full flex items-center justify-between text-left"
              >
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen size={24} />
                  Hướng Dẫn Chơi Game
                </h2>
                {showGuide ? <ChevronUp className="text-white" size={24} /> : <ChevronDown className="text-white" size={24} />}
              </button>

              {showGuide && (
                <div className="mt-6 space-y-6 animate-fade-in">
                  {/* Lắc Xúc Xắc */}
                  <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-5 border border-blue-400/30">
                    <div className="flex items-center gap-3 mb-3">
                      <Dice6 className="text-blue-300" size={28} />
                      <h3 className="text-lg font-bold text-white">🎲 Lắc Xúc Xắc</h3>
                    </div>
                    <ul className="text-white/90 space-y-2 text-sm ml-11">
                      <li>• Mỗi lần lắc xúc xắc sẽ di chuyển nhân vật từ 1-6 ô</li>
                      <li>• Điểm số = số ô đã di chuyển</li>
                      <li>• Hoàn thành 1 vòng (24 ô) sẽ quay về ô xuất phát</li>
                      <li>• Để có lượt lắc, bạn cần trả lời đúng câu hỏi Quiz</li>
                      <li>• Trả lời đúng: +1 lượt lắc (hoặc +2 nếu có Event Quiz Bonus)</li>
                    </ul>
                  </div>

                  {/* Quiz */}
                  <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-5 border border-green-400/30">
                    <div className="flex items-center gap-3 mb-3">
                      <BookOpen className="text-green-300" size={28} />
                      <h3 className="text-lg font-bold text-white">📚 Câu Hỏi Quiz</h3>
                    </div>
                    <ul className="text-white/90 space-y-2 text-sm ml-11">
                      <li>• Click nút "TÌM LƯỢT LẮC" để trả lời câu hỏi</li>
                      <li>• Trả lời đúng: Nhận thêm lượt lắc để tiếp tục chơi</li>
                      <li>• Trả lời sai: Không nhận lượt lắc (có thể bị trừ điểm nếu có Event)</li>
                      <li>• Event "Quiz Bonus": Trả lời đúng nhận x2 lượt lắc</li>
                      <li>• Event "Penalty Wrong": Trả lời sai bị trừ 5 điểm</li>
                    </ul>
                  </div>

                  {/* Events */}
                  <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl p-5 border border-purple-400/30">
                    <div className="flex items-center gap-3 mb-3">
                      <Zap className="text-purple-300" size={28} />
                      <h3 className="text-lg font-bold text-white">⚡ Events (Sự Kiện)</h3>
                    </div>
                    <ul className="text-white/90 space-y-2 text-sm ml-11">
                      <li>• <strong>Dice Double:</strong> Lần lắc tiếp theo x2 điểm</li>
                      <li>• <strong>Score Double:</strong> Mỗi ô di chuyển +2 điểm (20 giây)</li>
                      <li>• <strong>Quiz Bonus:</strong> Trả lời đúng +2 lượt lắc (20 giây)</li>
                      <li>• <strong>Free Dice:</strong> Tất cả người chơi +1 lượt lắc miễn phí</li>
                      <li>• <strong>Lose Dice:</strong> Tất cả người chơi -1 lượt lắc</li>
                      <li>• <strong>No Score:</strong> Di chuyển không cộng điểm (20 giây)</li>
                      <li>• <strong>Penalty Wrong:</strong> Trả lời sai -5 điểm (20 giây)</li>
                      <li>• <strong>Low Dice Penalty:</strong> Lắc &lt; 5 thì -3 điểm (20 giây)</li>
                    </ul>
                  </div>

                  {/* Phần Thưởng */}
                  <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl p-5 border border-yellow-400/30">
                    <div className="flex items-center gap-3 mb-3">
                      <Gift className="text-yellow-300" size={28} />
                      <h3 className="text-lg font-bold text-white">🎁 Phần Thưởng</h3>
                    </div>
                    <ul className="text-white/90 space-y-2 text-sm ml-11">
                      <li>• Khi dừng ở các ô phần thưởng (ô 5, 9, 14, 19), bạn có thể nhận quà</li>
                      <li>• <strong>Mỗi người chỉ được nhận tối đa 2 phần thưởng</strong> (bao gồm cả MysteryBox)</li>
                      <li>• Phần thưởng sẽ mở dần theo thời gian:</li>
                      <li className="ml-4 mt-2">
                        <div className="space-y-1">
                          <div>• <strong>Pepsi:</strong> Mở sau 0s, 1.5 phút, 3 phút</div>
                          <div>• <strong>Bánh snack:</strong> Mở sau 30s, 2 phút, 3.5 phút</div>
                          <div>• <strong>Kẹo:</strong> Mở sau 0s, 1 phút, 2.5 phút, 4 phút</div>
                          <div>• <strong>Hộp quà bí ẩn:</strong> Mở sau 1 phút, 2.5 phút, 4 phút</div>
                        </div>
                      </li>
                      <li className="mt-2">• Nếu phần thưởng chưa mở, bạn sẽ thấy thông báo thời gian còn lại</li>
                      <li>• Hãy cân nhắc kỹ trước khi nhận quà để tối ưu cơ hội!</li>
                    </ul>
                  </div>

                  {/* Mục Tiêu */}
                  <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-xl p-5 border border-red-400/30">
                    <h3 className="text-lg font-bold text-white mb-3">🏆 Mục Tiêu</h3>
                    <ul className="text-white/90 space-y-2 text-sm">
                      <li>• Di chuyển nhiều ô nhất để có điểm cao nhất</li>
                      <li>• Trả lời đúng nhiều câu hỏi để có nhiều lượt lắc</li>
                      <li>• Tận dụng Events để tăng điểm hoặc lượt lắc</li>
                      <li>• Nhận phần thưởng đúng thời điểm để không lãng phí cơ hội</li>
                      <li>• <strong>Game kéo dài 5 phút</strong>, người có điểm cao nhất sẽ thắng!</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white/10 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users size={24} />
                Danh sách người chơi
              </h2>
              {players.length === 0 ? (
                <p className="text-gray-300 text-center py-8">
                  Chưa có người chơi nào...
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {players.map(([playerId, player]) => (
                    <div
                      key={playerId}
                      className="bg-white/10 rounded-lg p-3 text-white text-center"
                    >
                      <div className="font-semibold">{player.name}</div>
                      {playerId === adminId && (
                        <div className="text-xs text-[#FFD700] mt-1">👑 Admin</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isAdmin && (
              <button
                onClick={handleStartGame}
                disabled={starting || players.length < 2}
                className="w-full bg-[#FFD700] text-[#b30000] px-8 py-4 rounded-xl font-bold text-xl hover:scale-105 hover:shadow-2xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <Play size={24} />
                {starting ? 'Đang bắt đầu...' : 'BẮT ĐẦU GAME'}
              </button>
            )}

            {!isAdmin && (
              <div className="text-center text-white">
                <p className="text-lg mb-2">Đang chờ admin bắt đầu game...</p>
                <div className="inline-block animate-spin">⏳</div>
              </div>
            )}

            {isAdmin && players.length < 2 && (
              <p className="text-center text-yellow-300 mt-4">
                Cần ít nhất 2 người chơi để bắt đầu
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

