import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import type { ActiveEvent } from '../../types/game';

interface EventTimerProps {
  activeEvent: ActiveEvent;
  gameStartedAt: Date | null;
}

export default function EventTimer({ activeEvent, gameStartedAt }: EventTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!activeEvent.type || !activeEvent.startedAt || !gameStartedAt) {
      setTimeLeft(0);
      return;
    }

    // Calculate time left
    const updateTimer = () => {
      try {
        let startedAt: Date;
        if (activeEvent.startedAt?.toDate) {
          // Firestore Timestamp
          startedAt = activeEvent.startedAt.toDate();
        } else if (activeEvent.startedAt?.seconds) {
          // Firestore Timestamp object
          startedAt = new Date(activeEvent.startedAt.seconds * 1000);
        } else {
          // Plain date
          startedAt = new Date(activeEvent.startedAt);
        }
        
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
        const remaining = Math.max(0, activeEvent.duration - elapsed);
        setTimeLeft(remaining);
      } catch (error) {
        console.error('Error calculating event timer:', error);
        setTimeLeft(0);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeEvent, gameStartedAt]);

  if (!activeEvent.type || timeLeft <= 0) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-20 md:top-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-2xl z-40 flex items-center gap-2 border-2 border-white">
      <Clock size={18} className="md:w-5 md:h-5" />
      <span className="font-bold text-base md:text-lg">{formatTime(timeLeft)}</span>
      <span className="text-xs md:text-sm opacity-90 hidden sm:inline">Event đang diễn ra</span>
    </div>
  );
}

