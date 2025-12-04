import { getRewardImagePath } from '../../utils/gameHelpers';
import type { Room } from '../../types/game';

interface TileComponentProps {
  position: number;
  isReward: boolean;
  rewardType?: 'mysteryGiftBox' | 'pepsi' | 'cheetos' | 'candies';
  room?: Room;
  playersOnTile: string[]; // Array of playerIds on this tile
}

export default function TileComponent({ 
  position, 
  isReward, 
  rewardType,
  playersOnTile 
}: TileComponentProps) {
  const isStart = position === 0;
  const isEnd = position === 24;

  return (
    <div
      className={`relative tile-${position} transition-all duration-300 ${
        isStart ? 'tile-start' : isEnd ? 'tile-end' : isReward ? 'tile-reward' : 'tile-normal'
      }`}
      style={{
        width: '80px',
        height: '80px',
      }}
    >
      {/* Tile base */}
      <div
        className={`w-full h-full rounded-lg border-2 flex items-center justify-center ${
          isStart
            ? 'bg-green-500/80 border-green-300'
            : isEnd
            ? 'bg-red-500/80 border-red-300'
            : isReward
            ? 'bg-yellow-500/80 border-yellow-300 animate-pulse'
            : 'bg-brown-500/80 border-brown-300'
        }`}
      >
        {/* Tile number */}
        <span className="text-white font-bold text-sm absolute top-1 left-1">
          {position + 1}
        </span>

        {/* Reward icon */}
        {isReward && rewardType && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={getRewardImagePath(rewardType)}
              alt={rewardType}
              className="w-12 h-12 object-contain"
            />
          </div>
        )}

        {/* Start/End markers */}
        {isStart && (
          <div className="text-white font-bold text-xs">START</div>
        )}
        {isEnd && (
          <div className="text-white font-bold text-xs">END</div>
        )}

        {/* Players on this tile */}
        {playersOnTile.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">
            {playersOnTile.length}
          </div>
        )}
      </div>
    </div>
  );
}

