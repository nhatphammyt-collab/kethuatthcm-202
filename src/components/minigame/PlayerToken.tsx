import { useEffect, useState, useRef, memo } from 'react';
import type { Player } from '../../types/game';

interface PlayerTokenProps {
  player: Player;
  playerId: string;
  playerName: string;
  color: string; // Color for this player
  isCurrentPlayer?: boolean;
  currentTilePosition: { x: number; y: number }; // Current tile coordinates (percentage)
  tilePositions: Array<{ x: number; y: number }>; // All tile positions for path calculation
  totalTiles?: number; // Total number of tiles (default 24)
}

function PlayerToken({ 
  player, 
  playerId, 
  playerName, 
  color,
  isCurrentPlayer = false,
  currentTilePosition,
  tilePositions,
  totalTiles = 24
}: PlayerTokenProps) {
  const [displayCoords, setDisplayCoords] = useState(currentTilePosition);
  const [isMoving, setIsMoving] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const previousPositionRef = useRef(player.position);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Use absolutePosition if available, otherwise fallback to position
    const currentAbsolute = player.absolutePosition ?? player.position;
    const currentPosition = currentAbsolute % totalTiles;
    const previousAbsolute = previousPositionRef.current;
    const previousPosition = previousAbsolute % totalTiles;
    
    // Only animate if position actually changed
    if (currentPosition === previousPosition && currentAbsolute === previousAbsolute) {
      return;
    }

    // Calculate path: handle looping (e.g., from 23 to 0)
    let path: number[] = [];
    
    // Check if it's a loop: previousPosition > currentPosition AND currentAbsolute > previousAbsolute
    // This means we went from a high tile (e.g., 23) to a low tile (e.g., 0) by moving forward
    const isLoop = previousPosition > currentPosition && currentAbsolute > previousAbsolute;
    
    if (isLoop) {
      // It's a forward loop: go from previousPosition to totalTiles-1, then 0 to currentPosition
      // First, go from previousPosition to the last tile (totalTiles - 1)
      for (let i = previousPosition; i < totalTiles; i++) {
        path.push(i);
      }
      // Then, go from 0 to currentPosition
      // Note: tile 0 and tile totalTiles are the same physical tile, but we need to show the path through 0
      for (let i = 0; i <= currentPosition; i++) {
        path.push(i);
      }
    } else if (currentAbsolute > previousAbsolute) {
      // Normal forward movement (no loop)
      for (let i = previousPosition; i <= currentPosition; i++) {
        path.push(i);
      }
    } else if (currentAbsolute < previousAbsolute) {
      // Backward movement (shouldn't happen in normal gameplay, but handle it)
      for (let i = previousPosition; i >= currentPosition; i--) {
        path.push(i);
      }
    } else {
      // Same absolute position (shouldn't happen, but handle it)
      previousPositionRef.current = currentAbsolute;
      return;
    }

    // Remove first position (current position) - we're already there
    if (path.length > 1) {
      path = path.slice(1);
    }

    if (path.length === 0) {
      previousPositionRef.current = currentAbsolute;
      return;
    }

    setIsMoving(true);
    
    // Animate through each tile in the path
    let currentPathIndex = 0;
    const stepDuration = 350; // 350ms per tile for smoother animation
    const jumpDuration = 150; // 150ms for jump animation
    
    const animateStep = () => {
      if (currentPathIndex >= path.length) {
        // Animation complete
        setIsMoving(false);
        setIsJumping(false);
        previousPositionRef.current = currentAbsolute;
        return;
      }

      const targetTileIndex = path[currentPathIndex];
      const targetCoords = tilePositions[targetTileIndex] || tilePositions[0];
      
      // Jump animation
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), jumpDuration);
      
      // Smooth transition to next tile
      setDisplayCoords(targetCoords);
      
      currentPathIndex++;
      
      // Schedule next step
      setTimeout(() => {
        animationFrameRef.current = requestAnimationFrame(animateStep);
      }, stepDuration);
    };

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animateStep);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [player.position, tilePositions, totalTiles]);

  // Update display coords when not moving (for initial render or external position changes)
  useEffect(() => {
    if (!isMoving) {
      setDisplayCoords(currentTilePosition);
      const currentAbsolute = player.absolutePosition ?? player.position;
      previousPositionRef.current = currentAbsolute;
    }
  }, [currentTilePosition, isMoving, player.position, player.absolutePosition]);

  return (
    <div
      className="player-token"
      style={{
        position: 'absolute',
        left: `${displayCoords.x}%`,
        top: `${displayCoords.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isCurrentPlayer ? 20 : 10 + (player.position % totalTiles),
        transition: isMoving ? 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1), top 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        transformOrigin: 'center center',
      }}
    >
      {/* Character image with jump animation */}
      <div 
        className="relative"
        style={{
          transform: isJumping ? 'translateY(-15px) scale(1.1)' : 'translateY(0) scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        }}
      >
        <img
          src="/Character.png"
          alt={playerName}
          className="w-16 h-16 object-contain drop-shadow-lg"
          style={{
            filter: `drop-shadow(0 0 8px ${color})`,
          }}
        />
        
        {/* Player name label */}
        <div
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded text-xs font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {playerName}
        </div>

        {/* Score badge */}
        <div className="absolute -top-2 -right-2 bg-[#FFD700] rounded-full w-6 h-6 flex items-center justify-center text-[#b30000] text-xs font-bold">
          {player.score}
        </div>
      </div>
    </div>
  );
}

// Memoize PlayerToken to prevent unnecessary re-renders
export default memo(PlayerToken);
