import { Dice1, TrendingUp, Ban } from 'lucide-react';
import type { Player } from '../../types/game';

interface EventEffectsIndicatorProps {
  player: Player;
}

export default function EventEffectsIndicator({ player }: EventEffectsIndicatorProps) {
  const { eventEffects } = player;
  const hasEffects = eventEffects.diceDouble || eventEffects.scoreDouble || eventEffects.noScore;

  if (!hasEffects) return null;

  return (
    <div className="flex items-center gap-2">
      {eventEffects.diceDouble && (
        <div className="bg-yellow-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold">
          <Dice1 size={14} />
          <span>X2</span>
        </div>
      )}
      {eventEffects.scoreDouble && (
        <div className="bg-green-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold">
          <TrendingUp size={14} />
          <span>Điểm X2</span>
        </div>
      )}
      {eventEffects.noScore && (
        <div className="bg-gray-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold">
          <Ban size={14} />
          <span>Không điểm</span>
        </div>
      )}
    </div>
  );
}

