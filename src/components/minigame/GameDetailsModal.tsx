import { X, Gift, Trophy } from 'lucide-react';
import RewardDashboard from './RewardDashboard';
import type { Room } from '../../types/game';

interface GameDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  currentPlayerId?: string;
}

export default function GameDetailsModal({ isOpen, onClose, room, currentPlayerId }: GameDetailsModalProps) {
  if (!isOpen) return null;

  // Get sorted leaderboard
  const leaderboard = Object.entries(room.leaderboard || {})
    .map(([pid, entry]) => ({
      playerId: pid,
      ...entry,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#FFD700]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">CHI TIẾT GAME</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-[#FFD700] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Rewards Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Gift className="text-[#FFD700]" size={24} />
              <h3 className="text-xl font-bold text-white">PHẦN THƯỞNG</h3>
            </div>
            <RewardDashboard room={room} />
          </div>

          {/* Leaderboard Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="text-[#FFD700]" size={24} />
              <h3 className="text-xl font-bold text-white">BẢNG XẾP HẠNG</h3>
            </div>
            <div className="bg-white/10 rounded-xl p-4 space-y-2">
              {leaderboard.length === 0 ? (
                <p className="text-gray-300 text-center py-4">Chưa có dữ liệu</p>
              ) : (
                leaderboard.map((entry, index) => (
                  <div
                    key={entry.playerId}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      entry.playerId === currentPlayerId
                        ? 'bg-[#FFD700]/20 border-2 border-[#FFD700]'
                        : 'bg-white/5'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? 'bg-[#FFD700] text-[#b30000]'
                          : index === 1
                          ? 'bg-gray-300 text-gray-800'
                          : index === 2
                          ? 'bg-orange-400 text-white'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold">{entry.name}</div>
                      <div className="text-gray-300 text-sm">
                        Điểm: {entry.score} • Vị trí: {entry.position}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

