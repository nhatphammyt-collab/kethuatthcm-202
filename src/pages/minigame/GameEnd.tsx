import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { subscribeToRoom } from '../../services/firebase/gameService';
import type { Room, LeaderboardEntry } from '../../types/game';
import { Trophy, Medal, Award, Home, RotateCw } from 'lucide-react';

export default function GameEnd() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { role, adminId, playerId } = location.state || {};

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<Array<{ playerId: string; entry: LeaderboardEntry }>>([]);

  useEffect(() => {
    if (!roomId) {
      navigate('/minigame');
      return;
    }

    // Subscribe to room changes for real-time updates
    const unsubscribe = subscribeToRoom(roomId, (roomData) => {
      if (!roomData) {
        navigate('/minigame');
        return;
      }

      setRoom(roomData);
      setLoading(false);

      // Convert leaderboard to array and sort
      const leaderboardEntries = Object.entries(roomData.leaderboard || {})
        .map(([playerId, entry]) => ({ playerId, entry }))
        .sort((a, b) => {
          // Sort by score (descending), then by position (descending)
          if (b.entry.score !== a.entry.score) {
            return b.entry.score - a.entry.score;
          }
          return b.entry.position - a.entry.position;
        });

      setLeaderboard(leaderboardEntries);
    });

    return () => unsubscribe();
  }, [roomId, navigate]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-12 h-12 text-yellow-400" />;
      case 1:
        return <Medal className="w-10 h-10 text-gray-300" />;
      case 2:
        return <Award className="w-10 h-10 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'from-yellow-400 via-yellow-500 to-yellow-600';
      case 1:
        return 'from-gray-300 via-gray-400 to-gray-500';
      case 2:
        return 'from-amber-500 via-amber-600 to-amber-700';
      default:
        return 'from-blue-500 via-blue-600 to-blue-700';
    }
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="text-white text-xl">Đang tải kết quả...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="text-white text-xl">Không tìm thấy phòng</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">
            🎉 GAME KẾT THÚC! 🎉
          </h1>
          <p className="text-2xl text-white/90 font-semibold">
            Phòng: <span className="text-[#FFD700] font-bold">{room.roomCode}</span>
          </p>
        </div>

        {/* Top 3 Podium */}
        {top3.length > 0 && (
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white text-center mb-8 drop-shadow-lg">
              TOP 3 NGƯỜI CHƠI XUẤT SẮC
            </h2>
            <div className="flex items-end justify-center gap-6 max-w-4xl mx-auto">
              {/* 2nd Place */}
              {top3[1] && (
                <div className="flex-1 max-w-[280px] animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 rounded-2xl p-6 shadow-2xl border-4 border-white transform hover:scale-105 transition-transform">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4">{getRankIcon(1)}</div>
                      <div className="text-5xl font-black text-white mb-2">2</div>
                      <div className="text-2xl font-bold text-white mb-2">{top3[1].entry.name}</div>
                      <div className="text-xl text-white/90 mb-1">Điểm: <span className="font-bold">{top3[1].entry.score}</span></div>
                      <div className="text-lg text-white/80">Vị trí: {top3[1].entry.position}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {top3[0] && (
                <div className="flex-1 max-w-[320px] animate-slide-up" style={{ animationDelay: '0s' }}>
                  <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl p-8 shadow-2xl border-4 border-white transform hover:scale-105 transition-transform relative">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-black text-sm">
                        🏆 VÔ ĐỊCH
                      </div>
                    </div>
                    <div className="flex flex-col items-center text-center mt-4">
                      <div className="mb-4">{getRankIcon(0)}</div>
                      <div className="text-6xl font-black text-white mb-2">1</div>
                      <div className="text-3xl font-bold text-white mb-2">{top3[0].entry.name}</div>
                      <div className="text-2xl text-white/90 mb-1">Điểm: <span className="font-bold">{top3[0].entry.score}</span></div>
                      <div className="text-xl text-white/80">Vị trí: {top3[0].entry.position}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <div className="flex-1 max-w-[280px] animate-slide-up" style={{ animationDelay: '0.4s' }}>
                  <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-2xl p-6 shadow-2xl border-4 border-white transform hover:scale-105 transition-transform">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4">{getRankIcon(2)}</div>
                      <div className="text-5xl font-black text-white mb-2">3</div>
                      <div className="text-2xl font-bold text-white mb-2">{top3[2].entry.name}</div>
                      <div className="text-xl text-white/90 mb-1">Điểm: <span className="font-bold">{top3[2].entry.score}</span></div>
                      <div className="text-lg text-white/80">Vị trí: {top3[2].entry.position}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-6 drop-shadow-lg">
              BẢNG XẾP HẠNG ĐẦY ĐỦ
            </h2>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-white/20">
              <div className="space-y-3">
                {leaderboard.map((item, index) => {
                  const isTop3 = index < 3;
                  const isCurrentPlayer = item.playerId === playerId;
                  
                  return (
                    <div
                      key={item.playerId}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        isTop3
                          ? `bg-gradient-to-r ${getRankColor(index)} text-white`
                          : isCurrentPlayer
                          ? 'bg-[#FFD700]/30 border-2 border-[#FFD700] text-white'
                          : 'bg-white/5 text-white hover:bg-white/10'
                      } ${isCurrentPlayer ? 'ring-4 ring-[#FFD700] ring-opacity-50' : ''}`}
                    >
                      <div className="w-12 text-center">
                        {isTop3 ? (
                          <div className="text-3xl font-black">{index + 1}</div>
                        ) : (
                          <div className="text-xl font-bold text-white/80">{index + 1}</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg">{item.entry.name}</div>
                        {isCurrentPlayer && (
                          <div className="text-xs text-[#FFD700] font-semibold">(Bạn)</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">Điểm: {item.entry.score}</div>
                        <div className="text-sm text-white/70">Vị trí: {item.entry.position}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-6">
          <button
            onClick={() => navigate('/minigame')}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 hover:shadow-2xl transition-all shadow-lg"
          >
            <Home size={24} />
            Về Trang Chủ
          </button>
          {role === 'admin' && adminId === room.adminId && (
            <button
              onClick={() => navigate('/minigame/create')}
              className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 hover:shadow-2xl transition-all shadow-lg"
            >
              <RotateCw size={24} />
              Tạo Phòng Mới
            </button>
          )}
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

