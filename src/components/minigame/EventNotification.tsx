import { useEffect, useState } from 'react';
import { Zap, Gift, X, Clock, AlertTriangle, TrendingDown, Ban, Dice1 } from 'lucide-react';
import type { EventType } from '../../types/game';

interface EventNotificationProps {
  eventType: EventType | null;
  isOpen: boolean;
  onClose?: () => void;
  duration?: number; // Duration in seconds
}

const EVENT_CONFIG: Record<EventType, { 
  name: string; 
  description: string; 
  icon: any; 
  color: string;
  bgGradient: string;
}> = {
  dice_double: {
    name: 'XÚC XẮC X2',
    description: 'Lần lắc tiếp theo sẽ nhân đôi kết quả!',
    icon: Dice1,
    color: '#FFD700',
    bgGradient: 'from-yellow-500 via-orange-500 to-red-500',
  },
  score_double: {
    name: 'ĐIỂM X2',
    description: 'Mỗi ô đi được cộng gấp đôi điểm!',
    icon: TrendingDown,
    color: '#00FF00',
    bgGradient: 'from-green-500 via-emerald-500 to-teal-500',
  },
  quiz_bonus: {
    name: 'QUIZ BONUS',
    description: 'Trả lời đúng nhận 2 lượt lắc thay vì 1!',
    icon: Gift,
    color: '#FF69B4',
    bgGradient: 'from-pink-500 via-rose-500 to-red-500',
  },
  free_dice: {
    name: 'LƯỢT LẮC MIỄN PHÍ',
    description: 'Tất cả người chơi nhận 1 lượt lắc miễn phí!',
    icon: Zap,
    color: '#00CED1',
    bgGradient: 'from-cyan-500 via-blue-500 to-indigo-500',
  },
  penalty_wrong: {
    name: 'GIẶC NỘI XÂM',
    description: 'Trả lời sai sẽ bị trừ 5 điểm!',
    icon: AlertTriangle,
    color: '#FF4500',
    bgGradient: 'from-red-600 via-orange-600 to-yellow-600',
  },
  lose_dice: {
    name: 'MẤT LƯỢT LẮC',
    description: 'Tất cả người chơi mất 1 lượt lắc!',
    icon: X,
    color: '#DC143C',
    bgGradient: 'from-red-700 via-rose-700 to-pink-700',
  },
  no_score: {
    name: 'KHÔNG ĐIỂM',
    description: 'Di chuyển không cộng điểm trong thời gian này!',
    icon: Ban,
    color: '#808080',
    bgGradient: 'from-gray-600 via-slate-600 to-zinc-600',
  },
  low_dice_penalty: {
    name: 'PHẠT XÚC XẮC THẤP',
    description: 'Lắc được < 5 sẽ bị trừ 3 điểm!',
    icon: Dice1,
    color: '#8B4513',
    bgGradient: 'from-amber-700 via-orange-700 to-red-700',
  },
};

export default function EventNotification({ 
  eventType, 
  isOpen, 
  onClose,
  duration 
}: EventNotificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen && eventType) {
      setShow(true);
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        setShow(false);
        if (onClose) onClose();
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isOpen, eventType, onClose]);

  if (!show || !eventType) return null;

  const config = EVENT_CONFIG[eventType];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
      <div
        className={`bg-gradient-to-br ${config.bgGradient} rounded-2xl p-8 max-w-md w-full mx-4 border-4 border-white shadow-2xl pointer-events-auto animate-bounce-in`}
      >
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="mb-4 relative">
            <div className="absolute inset-0 bg-white/30 rounded-full blur-xl"></div>
            <Icon className="relative w-20 h-20 text-white animate-pulse" />
          </div>

          {/* Title */}
          <h2 className="text-4xl font-black text-white mb-2 drop-shadow-lg">
            {config.name}
          </h2>

          {/* Description */}
          <p className="text-xl font-bold text-white mb-4 drop-shadow-md">
            {config.description}
          </p>

          {/* Duration Timer */}
          {duration && duration > 0 && (
            <div className="flex items-center gap-2 text-white/90 font-semibold mb-4">
              <Clock size={20} />
              <span>Kéo dài: {duration}s</span>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={() => {
              setShow(false);
              if (onClose) onClose();
            }}
            className="mt-4 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-semibold transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

