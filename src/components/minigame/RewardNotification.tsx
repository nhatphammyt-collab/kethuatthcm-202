import { useEffect, useState, useRef } from 'react';
import { Gift, CheckCircle2 } from 'lucide-react';
import { getRewardImagePath } from '../../utils/gameHelpers';
import type { Room } from '../../types/game';

interface RewardNotificationProps {
  room: Room | null;
  currentPlayerId?: string;
  onClose?: () => void;
}

export default function RewardNotification({ room, currentPlayerId, onClose }: RewardNotificationProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [rewardInfo, setRewardInfo] = useState<{
    playerName: string;
    rewardType: 'mysteryGiftBox' | 'pepsi' | 'cheetos' | 'candies';
    rewardName: string;
  } | null>(null);
  const previousClaimedByRef = useRef<Record<string, number>>({});

  // Watch for new reward claims
  useEffect(() => {
    if (!room) return;

    const rewards = room.rewards || {};
    const rewardTypes: Array<'mysteryGiftBox' | 'pepsi' | 'cheetos' | 'candies'> = [
      'mysteryGiftBox',
      'pepsi',
      'cheetos',
      'candies',
    ];

    rewardTypes.forEach((type) => {
      const reward = rewards[type];
      if (reward?.claimedBy && reward.claimedBy.length > 0) {
        const currentClaimedCount = reward.claimedBy.length;
        const previousClaimedCount = previousClaimedByRef.current[type] || 0;

        // Only show notification if there's a new claim
        if (currentClaimedCount > previousClaimedCount) {
          const lastClaimedBy = reward.claimedBy[reward.claimedBy.length - 1];
          const claimedPlayer = room.players?.[lastClaimedBy];

          if (claimedPlayer) {
            const rewardName = getRewardName(type);
            setRewardInfo({
              playerName: claimedPlayer.name,
              rewardType: type,
              rewardName,
            });
            setShowNotification(true);

            // Auto close after 5 seconds
            setTimeout(() => {
              setShowNotification(false);
              if (onClose) onClose();
            }, 5000);
          }
        }

        // Update ref
        previousClaimedByRef.current[type] = currentClaimedCount;
      } else {
        previousClaimedByRef.current[type] = 0;
      }
    });
  }, [room, onClose]);

  if (!showNotification || !rewardInfo) return null;

  const isCurrentPlayer = rewardInfo.playerName === room?.players?.[currentPlayerId]?.name;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
      <div
        className={`bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF6347] rounded-2xl p-8 max-w-md w-full mx-4 border-4 border-white shadow-2xl pointer-events-auto animate-bounce-in ${
          isCurrentPlayer ? 'scale-110' : 'scale-100'
        }`}
      >
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="mb-4 relative">
            <div className="absolute inset-0 bg-white/30 rounded-full blur-xl"></div>
            <Gift className="relative w-20 h-20 text-white animate-pulse" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-black text-white mb-2 drop-shadow-lg">
            {isCurrentPlayer ? '🎉 CHÚC MỪNG!' : '🎁 PHẦN THƯỞNG ĐÃ ĐƯỢC NHẬN'}
          </h2>

          {/* Player Name */}
          <div className="text-xl font-bold text-white mb-4 drop-shadow-md">
            {rewardInfo.playerName}
          </div>

          {/* Reward Image */}
          <div className="mb-4">
            <img
              src={getRewardImagePath(rewardInfo.rewardType)}
              alt={rewardInfo.rewardName}
              className="w-32 h-32 object-contain drop-shadow-2xl animate-bounce"
            />
          </div>

          {/* Reward Name */}
          <div className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
            {rewardInfo.rewardName}
          </div>

          {/* Status */}
          {isCurrentPlayer ? (
            <div className="flex items-center gap-2 text-green-200 font-semibold">
              <CheckCircle2 size={20} />
              <span>Bạn đã nhận phần thưởng này!</span>
            </div>
          ) : (
            <div className="text-white/80 text-sm">
              Phần thưởng đã được nhận bởi {rewardInfo.playerName}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={() => {
              setShowNotification(false);
              if (onClose) onClose();
            }}
            className="mt-6 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-semibold transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to get reward name in Vietnamese
 */
function getRewardName(rewardType: 'mysteryGiftBox' | 'pepsi' | 'cheetos' | 'candies'): string {
  const names: Record<string, string> = {
    mysteryGiftBox: 'Hộp quà bí ẩn',
    pepsi: 'Pepsi',
    cheetos: 'Bánh snack',
    candies: 'Kẹo',
  };
  return names[rewardType] || rewardType;
}
