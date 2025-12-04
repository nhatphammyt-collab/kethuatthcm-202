import { useEffect, useRef } from 'react';
import { endActiveEvent, endGame, updateLeaderboard } from '../services/firebase/gameService';
import type { Room } from '../types/game';

interface UseEventManagerProps {
  room: Room | null;
  adminId: string | undefined;
  isAdmin: boolean;
}

/**
 * Hook to manage game timers and automatic event ending
 * Note: Event triggering is now manual via admin panel
 */
export function useEventManager({ room, adminId, isAdmin }: UseEventManagerProps) {
  const gameEndTimerRef = useRef<NodeJS.Timeout | null>(null);
  const leaderboardUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const eventEndTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!room || !isAdmin || !adminId || room.status !== 'playing' || !room.startedAt) {
      // Clear all timers if game not started
      if (gameEndTimerRef.current) {
        clearTimeout(gameEndTimerRef.current);
        gameEndTimerRef.current = null;
      }
      if (leaderboardUpdateTimerRef.current) {
        clearInterval(leaderboardUpdateTimerRef.current);
        leaderboardUpdateTimerRef.current = null;
      }
      if (eventEndTimerRef.current) {
        clearTimeout(eventEndTimerRef.current);
        eventEndTimerRef.current = null;
      }
      return;
    }

    // Get game start time
    const startedAt = room.startedAt?.toDate?.() || new Date(room.startedAt);
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
    const gameDuration = room.settings.gameDuration || 600;
    const timeRemaining = gameDuration - elapsed;
    
    // Clear existing timers
    if (gameEndTimerRef.current) {
      clearTimeout(gameEndTimerRef.current);
      gameEndTimerRef.current = null;
    }
    
    if (leaderboardUpdateTimerRef.current) {
      clearInterval(leaderboardUpdateTimerRef.current);
      leaderboardUpdateTimerRef.current = null;
    }

    if (eventEndTimerRef.current) {
      clearTimeout(eventEndTimerRef.current);
      eventEndTimerRef.current = null;
    }
    
    // Check if there's an active event that should end automatically
    if (room.events.activeEvent.type && room.events.activeEvent.startedAt) {
      try {
        let eventStartedAt: Date;
        if (room.events.activeEvent.startedAt?.toDate) {
          eventStartedAt = room.events.activeEvent.startedAt.toDate();
        } else if (room.events.activeEvent.startedAt?.seconds) {
          eventStartedAt = new Date(room.events.activeEvent.startedAt.seconds * 1000);
        } else {
          eventStartedAt = new Date(room.events.activeEvent.startedAt);
        }
        
        const eventElapsed = Math.floor((now.getTime() - eventStartedAt.getTime()) / 1000);
        const eventDuration = room.events.activeEvent.duration || 75;
        
        if (eventDuration > 0 && eventElapsed < eventDuration) {
          // Schedule automatic event end
          const timeUntilEnd = (eventDuration - eventElapsed) * 1000;
          eventEndTimerRef.current = setTimeout(() => {
            endActiveEvent(room.roomId, adminId).catch(console.error);
          }, timeUntilEnd);
        } else if (eventElapsed >= eventDuration) {
          // Event should end immediately
          endActiveEvent(room.roomId, adminId).catch(console.error);
        }
      } catch (error) {
        console.error('Error checking active event:', error);
      }
    }
    
    // Schedule game end
    if (timeRemaining > 0) {
      gameEndTimerRef.current = setTimeout(() => {
        endGame(room.roomId, adminId).catch(console.error);
      }, timeRemaining * 1000);
    } else if (timeRemaining <= 0 && timeRemaining > -5) {
      // Game should have ended already (within 5 seconds tolerance)
      endGame(room.roomId, adminId).catch(console.error);
    }
    
    // Update leaderboard periodically (every 5 seconds)
    leaderboardUpdateTimerRef.current = setInterval(() => {
      updateLeaderboard(room.roomId).catch(console.error);
    }, 5000);
    
    return () => {
      if (gameEndTimerRef.current) {
        clearTimeout(gameEndTimerRef.current);
        gameEndTimerRef.current = null;
      }
      
      if (leaderboardUpdateTimerRef.current) {
        clearInterval(leaderboardUpdateTimerRef.current);
        leaderboardUpdateTimerRef.current = null;
      }

      if (eventEndTimerRef.current) {
        clearTimeout(eventEndTimerRef.current);
        eventEndTimerRef.current = null;
      }
    };
  }, [room, adminId, isAdmin]);
}

