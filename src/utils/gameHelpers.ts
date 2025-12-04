// Helper functions for game logic

/**
 * Generate a random 6-character room code
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Calculate event trigger times based on game duration and total events
 * Events are randomly distributed but ensure:
 * - Each event lasts 75 seconds
 * - Events don't overlap
 * - Events are spread throughout the game duration
 * - Minimum gap between events (e.g., 5 seconds)
 */
export function calculateEventTimes(gameDuration: number, totalEvents: number): number[] {
  const eventDuration = 75; // Each event lasts 75 seconds
  const minGap = 10; // Minimum gap between events (seconds) - increased to prevent overlap
  const firstEventMinDelay = 30; // Minimum delay before first event (seconds)
  const events: number[] = [];
  
  // Calculate total time needed for all events
  const totalEventTime = totalEvents * eventDuration;
  const totalGapTime = (totalEvents - 1) * minGap;
  const totalNeededTime = totalEventTime + totalGapTime;
  
  // Calculate available time for random distribution
  const availableTime = gameDuration - totalNeededTime - firstEventMinDelay;
  
  if (availableTime < 0) {
    // Not enough time - use minimal gaps
    const adjustedGap = Math.max(5, Math.floor((gameDuration - totalEventTime - firstEventMinDelay) / (totalEvents - 1)));
    let currentTime = firstEventMinDelay;
    
    for (let i = 0; i < totalEvents; i++) {
      events.push(currentTime);
      currentTime += eventDuration + adjustedGap;
      
      // Ensure last event ends before game ends
      if (currentTime + eventDuration > gameDuration) {
        currentTime = Math.max(firstEventMinDelay, gameDuration - eventDuration);
        events[events.length - 1] = currentTime;
        break;
      }
    }
  } else {
    // We have enough time - distribute events randomly with gaps
    // Start first event after minimum delay, with some randomness
    const randomStart = Math.floor(Math.random() * Math.min(availableTime / 2, 60));
    let currentTime = firstEventMinDelay + randomStart;
    
    for (let i = 0; i < totalEvents; i++) {
      events.push(currentTime);
      
      if (i < totalEvents - 1) {
        // Calculate next event time with random gap
        const baseGap = minGap;
        const randomGap = Math.floor(Math.random() * 30); // Random gap 0-30 seconds
        const nextEventTime = currentTime + eventDuration + baseGap + randomGap;
        
        // Ensure next event doesn't exceed game duration
        if (nextEventTime + eventDuration > gameDuration) {
          // Place remaining events evenly in remaining time
          const remainingEvents = totalEvents - i - 1;
          if (remainingEvents > 0) {
            const remainingTime = gameDuration - (currentTime + eventDuration);
            const evenGap = Math.max(minGap, Math.floor(remainingTime / (remainingEvents + 1)));
            currentTime = currentTime + eventDuration + evenGap;
          } else {
            break;
          }
        } else {
          currentTime = nextEventTime;
        }
      }
    }
  }
  
  // Sort events to ensure chronological order
  events.sort((a, b) => a - b);
  
  // Final validation: ensure no overlap
  for (let i = 0; i < events.length - 1; i++) {
    if (events[i] + eventDuration > events[i + 1]) {
      // Adjust next event to start after current event ends + gap
      events[i + 1] = events[i] + eventDuration + minGap;
    }
  }
  
  // Ensure all events end before game ends
  events.forEach((eventTime, index) => {
    if (eventTime + eventDuration > gameDuration) {
      events[index] = Math.max(firstEventMinDelay, gameDuration - eventDuration);
    }
  });
  
  return events;
}

/**
 * Shuffle array randomly (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculate tile coordinates for board
 * Position 0-24 → x, y coordinates (percentage based for responsive)
 * Path: Linear from 0 to 24 (left-right, then right-left, etc. - snake pattern)
 * This function is now a fallback - actual positions come from TILE_POSITIONS array
 */
export function calculateTilePosition(position: number, totalTiles: number = 25): { x: number; y: number } {
  const tilesPerRow = 5;
  const row = Math.floor(position / tilesPerRow);
  const col = position % tilesPerRow;
  
  // Snake pattern: even rows go left-right, odd rows go right-left
  const adjustedCol = row % 2 === 0 ? col : tilesPerRow - 1 - col;
  
  // Convert to percentage (0-100) for responsive positioning
  const padding = 15;
  const availableWidth = 100 - (padding * 2);
  const availableHeight = 100 - (padding * 2);
  
  const x = padding + (adjustedCol / (tilesPerRow - 1)) * availableWidth;
  const y = padding + (row / (Math.ceil(totalTiles / tilesPerRow) - 1)) * availableHeight;
  
  return { x, y };
}

/**
 * Format time in seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get reward image path by reward type
 */
export function getRewardImagePath(rewardType: 'mysteryGiftBox' | 'pepsi' | 'cheetos' | 'candies'): string {
  const imageMap: Record<string, string> = {
    mysteryGiftBox: '/mysterybox.png',
    pepsi: '/Drinks.png',
    cheetos: '/Snacks.png',
    candies: '/Candy.png',
  };
  return imageMap[rewardType] || '/mysterybox.png';
}

/**
 * Get reward type by tile position
 * Mapping: 5=Pepsi, 9=Kẹo, 14=Quà bí ẩn, 19=Bánh snack
 */
export function getRewardTypeByTile(tilePosition: number): 'mysteryGiftBox' | 'pepsi' | 'cheetos' | 'candies' | null {
  const rewardMap: Record<number, 'mysteryGiftBox' | 'pepsi' | 'cheetos' | 'candies'> = {
    5: 'pepsi',        // Ô 5: Pepsi
    9: 'candies',      // Ô 9: Kẹo
    14: 'mysteryGiftBox', // Ô 14: Quà bí ẩn
    19: 'cheetos',     // Ô 19: Bánh snack
  };
  return rewardMap[tilePosition] || null;
}

/**
 * Check if a tile is a reward tile
 */
export function isRewardTile(tilePosition: number, rewardTiles: number[]): boolean {
  return rewardTiles.includes(tilePosition);
}

