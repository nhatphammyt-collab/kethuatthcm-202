import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import type { Room } from '../../types/game';

interface GameTimerProps {
  room: Room | null;
}

export default function GameTimer({ room }: GameTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!room || !room.startedAt || room.status !== 'playing') {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const startedAt = room.startedAt?.toDate?.() || new Date(room.startedAt);
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
      const gameDuration = room.settings.gameDuration || 600; // 10 phút = 600 giây
      const remaining = Math.max(0, gameDuration - elapsed);
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [room]);

  if (!room || !room.startedAt || room.status !== 'playing' || timeLeft <= 0) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 60; // Cảnh báo khi còn 1 phút

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-40 ${
        isLowTime
          ? 'bg-gradient-to-r from-red-600 to-red-800 animate-pulse'
          : 'bg-gradient-to-r from-blue-600 to-purple-600'
      } backdrop-blur-md rounded-xl px-4 md:px-6 py-2 md:py-3 border-2 border-white shadow-2xl`}
    >
      <div className="flex items-center gap-2 md:gap-3">
        <Clock
          size={20}
          className={`md:w-6 md:h-6 ${isLowTime ? 'text-white animate-spin' : 'text-white'}`}
        />
        <div className="text-white font-black text-xl md:text-2xl tracking-wider">
          {formatTime(timeLeft)}
        </div>
        {isLowTime && (
          <div className="text-white text-xs md:text-sm font-bold animate-pulse">
            ⚠️ SẮP HẾT THỜI GIAN!
          </div>
        )}
      </div>
    </div>
  );
}

