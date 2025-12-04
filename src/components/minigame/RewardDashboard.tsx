import { getRewardImagePath } from '../../utils/gameHelpers';
import type { Room } from '../../types/game';
import { Gift, AlertCircle } from 'lucide-react';

interface RewardDashboardProps {
  room: Room;
}

export default function RewardDashboard({ room }: RewardDashboardProps) {
  const rewards = room.rewards;

  const rewardItems = [
    {
      type: 'mysteryGiftBox' as const,
      name: 'Hộp quà bí ẩn',
      reward: rewards.mysteryGiftBox,
    },
    {
      type: 'pepsi' as const,
      name: 'Pepsi',
      reward: rewards.pepsi,
    },
    {
      type: 'cheetos' as const,
      name: 'Cheetos',
      reward: rewards.cheetos,
    },
    {
      type: 'candies' as const,
      name: 'Kẹo',
      reward: rewards.candies,
    },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-[#FFD700]">
      <div className="flex items-center gap-2 mb-6">
        <Gift className="text-[#FFD700]" size={24} />
        <h3 className="text-xl font-bold text-white">PHẦN THƯỞNG</h3>
      </div>

      <div className="space-y-4">
        {rewardItems.map((item) => {
          const remaining = item.reward.total - item.reward.claimed;
          const isOutOfStock = remaining === 0;

          return (
            <div
              key={item.type}
              className={`bg-white/10 rounded-lg p-4 border-2 transition-all ${
                isOutOfStock
                  ? 'border-red-500/50 opacity-60'
                  : 'border-[#FFD700]/50 hover:border-[#FFD700]'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Reward image */}
                <div className="w-12 h-12 flex-shrink-0">
                  <img
                    src={getRewardImagePath(item.type)}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Reward info */}
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm mb-1">
                    {item.name}
                  </div>
                  <div className="flex items-center gap-2">
                    {isOutOfStock ? (
                      <>
                        <AlertCircle className="text-red-400" size={16} />
                        <span className="text-red-300 text-xs font-bold">
                          Đã hết
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[#FFD700] font-bold text-lg">
                          {remaining}
                        </span>
                        <span className="text-gray-300 text-xs">
                          / {item.reward.total}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Claimed by list */}
              {item.reward.claimedBy.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <div className="text-xs text-gray-300">
                    Đã nhận: {item.reward.claimedBy.length} người
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total remaining */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="text-center">
          <div className="text-gray-300 text-sm mb-1">Tổng còn lại</div>
          <div className="text-[#FFD700] font-bold text-2xl">
            {rewardItems.reduce((sum, item) => {
              return sum + (item.reward.total - item.reward.claimed);
            }, 0)}
          </div>
        </div>
      </div>
    </div>
  );
}

