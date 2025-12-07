// Firebase service functions for tour operations
// Optimized for minimal reads/writes

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  runTransaction,
  writeBatch,
  limit,
  orderBy
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { Tour, TourPlayer, TourMessage, TourReaction, TourRole } from '../../types/tour';

// Collections
const TOURS_COLLECTION = 'tours';
const TOUR_MESSAGES_COLLECTION = 'messages';
const TOUR_REACTIONS_COLLECTION = 'reactions';

// Cache để giảm reads
let cachedTour: Tour | null = null;
let tourUnsubscribe: (() => void) | null = null;

/**
 * Generate random tour code
 */
function generateTourCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Create a new tour room
 */
export async function createTour(driverId: string, driverName: string, maxPlayers: number = 50): Promise<string> {
  try {
    const tourCode = generateTourCode();
    const tourId = doc(collection(db, TOURS_COLLECTION)).id;

    console.log('[createTour] Creating tour with:', { tourId, tourCode, driverId, driverName });

    const tourData: Omit<Tour, 'tourId'> = {
      tourCode,
      driverId,
      status: 'waiting',
      currentLocation: null,
      maxPlayers,
      createdAt: new Date(),
      startedAt: null,
      players: {
        [driverId]: {
          playerId: driverId,
          name: driverName,
          role: 'driver',
          joinedAt: new Date(),
          isReady: true,
          reactions: {},
          messages: {},
        }
      }
    };

    await setDoc(doc(db, TOURS_COLLECTION, tourId), {
      ...tourData,
      createdAt: serverTimestamp(),
      startedAt: null,
    });

    console.log('[createTour] Tour created successfully:', tourId);
    return tourId;
  } catch (error) {
    console.error('[createTour] Error creating tour:', error);
    throw error; // Re-throw to be caught by caller
  }
}

/**
 * Join tour as passenger
 */
export async function joinTour(tourCode: string, playerId: string, playerName: string): Promise<string | null> {
  try {
    // Find tour by code
    const toursRef = collection(db, TOURS_COLLECTION);
    const q = query(toursRef, where('tourCode', '==', tourCode.toUpperCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Tour không tồn tại');
    }

    const tourDoc = snapshot.docs[0];
    const tourData = tourDoc.data() as Tour;
    const tourId = tourDoc.id;

    // Check if tour is full
    const currentPlayers = Object.keys(tourData.players || {}).length;
    if (currentPlayers >= tourData.maxPlayers) {
      throw new Error('Tour đã đầy');
    }

    // Check if already joined
    if (tourData.players?.[playerId]) {
      return tourId;
    }

    // Add player using transaction
    await runTransaction(db, async (transaction) => {
      const tourRef = doc(db, TOURS_COLLECTION, tourId);
      const tourSnap = await transaction.get(tourRef);
      
      if (!tourSnap.exists()) {
        throw new Error('Tour không tồn tại');
      }

      const currentData = tourSnap.data() as Tour;
      const currentPlayers = Object.keys(currentData.players || {}).length;
      
      if (currentPlayers >= currentData.maxPlayers) {
        throw new Error('Tour đã đầy');
      }

      const newPlayer: TourPlayer = {
        playerId,
        name: playerName,
        role: 'passenger',
        joinedAt: new Date(),
        isReady: false,
        reactions: {},
        messages: {},
      };

      transaction.update(tourRef, {
        [`players.${playerId}`]: {
          ...newPlayer,
          joinedAt: serverTimestamp(),
        }
      });
    });

    return tourId;
  } catch (error) {
    console.error('Error joining tour:', error);
    return null;
  }
}

/**
 * Subscribe to tour updates (optimized - only critical fields)
 */
export function subscribeToTour(
  tourId: string,
  callback: (tour: Tour | null) => void
): () => void {
  // Unsubscribe previous if exists
  if (tourUnsubscribe) {
    tourUnsubscribe();
  }

  const tourRef = doc(db, TOURS_COLLECTION, tourId);
  
  tourUnsubscribe = onSnapshot(
    tourRef,
    (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        cachedTour = {
          tourId: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          startedAt: data.startedAt?.toDate() || null,
        } as Tour;
        callback(cachedTour);
      } else {
        cachedTour = null;
        callback(null);
      }
    },
    (error) => {
      console.error('Error subscribing to tour:', error);
      callback(null);
    }
  );

  return tourUnsubscribe;
}

/**
 * Get tour by ID (one-time read)
 */
export async function getTourById(tourId: string): Promise<Tour | null> {
  if (cachedTour?.tourId === tourId) {
    return cachedTour;
  }

  try {
    const tourRef = doc(db, TOURS_COLLECTION, tourId);
    const docSnap = await getDoc(tourRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        tourId: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        startedAt: data.startedAt?.toDate() || null,
      } as Tour;
    }
    return null;
  } catch (error) {
    console.error('Error getting tour:', error);
    return null;
  }
}

/**
 * Start tour (driver only)
 */
export async function startTour(tourId: string, driverId: string): Promise<boolean> {
  try {
    const tourRef = doc(db, TOURS_COLLECTION, tourId);
    const tourSnap = await getDoc(tourRef);
    
    if (!tourSnap.exists()) {
      return false;
    }

    const tour = tourSnap.data() as Tour;
    if (tour.driverId !== driverId) {
      return false;
    }

    await updateDoc(tourRef, {
      status: 'traveling',
      startedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Error starting tour:', error);
    return false;
  }
}

/**
 * Move to location (driver only)
 */
export async function moveToLocation(tourId: string, driverId: string, locationId: number): Promise<boolean> {
  try {
    const tourRef = doc(db, TOURS_COLLECTION, tourId);
    const tourSnap = await getDoc(tourRef);
    
    if (!tourSnap.exists()) {
      return false;
    }

    const tour = tourSnap.data() as Tour;
    if (tour.driverId !== driverId) {
      return false;
    }

    await updateDoc(tourRef, {
      currentLocation: locationId,
      status: 'arrived',
    });

    return true;
  } catch (error) {
    console.error('Error moving to location:', error);
    return false;
  }
}

/**
 * Set player ready status
 */
export async function setPlayerReady(tourId: string, playerId: string, isReady: boolean): Promise<boolean> {
  try {
    const tourRef = doc(db, TOURS_COLLECTION, tourId);
    await updateDoc(tourRef, {
      [`players.${playerId}.isReady`]: isReady,
    });
    return true;
  } catch (error) {
    console.error('Error setting player ready:', error);
    return false;
  }
}

/**
 * Send message (with limit check - max 10 messages total per player)
 */
export async function sendTourMessage(
  tourId: string,
  playerId: string,
  playerName: string,
  locationId: number,
  text: string
): Promise<boolean> {
  try {
    // Check total message count
    const tour = await getTourById(tourId);
    if (!tour) return false;

    const player = tour.players[playerId];
    if (!player) return false;

    // Count total messages sent
    const totalMessages = Object.keys(player.messages || {}).length;
    if (totalMessages >= 10) {
      // Already reached max messages
      return false;
    }

    // Use transaction to ensure atomicity
    await runTransaction(db, async (transaction) => {
      const tourRef = doc(db, TOURS_COLLECTION, tourId);
      const tourSnap = await transaction.get(tourRef);
      
      if (!tourSnap.exists()) return;

      const tourData = tourSnap.data() as Tour;
      const playerData = tourData.players[playerId];
      
      // Check limit again in transaction
      const currentTotal = Object.keys(playerData?.messages || {}).length;
      if (currentTotal >= 10) {
        throw new Error('Đã đạt giới hạn 10 bình luận');
      }

      // Add message to messages collection
      const messageRef = doc(collection(db, TOURS_COLLECTION, tourId, TOUR_MESSAGES_COLLECTION));
      transaction.set(messageRef, {
        playerId,
        playerName,
        locationId,
        text,
        timestamp: serverTimestamp(),
      });

      // Update player's messages record (use timestamp as key to allow multiple per location)
      const messageKey = `${locationId}_${Date.now()}`;
      transaction.update(tourRef, {
        [`players.${playerId}.messages.${messageKey}`]: text,
      });
    });

    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}

/**
 * Send reaction (with limit check - max 10 reactions total per player)
 */
export async function sendTourReaction(
  tourId: string,
  playerId: string,
  playerName: string,
  locationId: number,
  emoji: string
): Promise<boolean> {
  try {
    // Check total reaction count
    const tour = await getTourById(tourId);
    if (!tour) return false;

    const player = tour.players[playerId];
    if (!player) return false;

    // Count total reactions sent
    const totalReactions = Object.keys(player.reactions || {}).length;
    if (totalReactions >= 10) {
      // Already reached max reactions
      return false;
    }

    // Use transaction to ensure atomicity
    await runTransaction(db, async (transaction) => {
      const tourRef = doc(db, TOURS_COLLECTION, tourId);
      const tourSnap = await transaction.get(tourRef);
      
      if (!tourSnap.exists()) return;

      const tourData = tourSnap.data() as Tour;
      const playerData = tourData.players[playerId];
      
      // Check limit again in transaction
      const currentTotal = Object.keys(playerData?.reactions || {}).length;
      if (currentTotal >= 10) {
        throw new Error('Đã đạt giới hạn 10 cảm xúc');
      }

      // Add reaction to reactions collection
      const reactionRef = doc(collection(db, TOURS_COLLECTION, tourId, TOUR_REACTIONS_COLLECTION));
      transaction.set(reactionRef, {
        playerId,
        playerName,
        locationId,
        emoji,
        timestamp: serverTimestamp(),
      });

      // Update player's reactions record (use timestamp as key to allow multiple per location)
      const reactionKey = `${locationId}_${Date.now()}`;
      transaction.update(tourRef, {
        [`players.${playerId}.reactions.${reactionKey}`]: emoji,
      });
    });

    return true;
  } catch (error) {
    console.error('Error sending reaction:', error);
    return false;
  }
}

/**
 * Get messages for a location (polling - not real-time to save reads)
 */
export async function getLocationMessages(tourId: string, locationId: number): Promise<TourMessage[]> {
  try {
    console.log('[getLocationMessages] Fetching messages for tour:', tourId, 'location:', locationId);
    const messagesRef = collection(db, TOURS_COLLECTION, tourId, TOUR_MESSAGES_COLLECTION);

    // Simple query without orderBy to avoid index requirement
    const q = query(
      messagesRef,
      where('locationId', '==', locationId),
      limit(50)
    );

    const snapshot = await getDocs(q);
    console.log('[getLocationMessages] Found', snapshot.docs.length, 'messages');

    // Sort client-side instead
    const messages = snapshot.docs.map(doc => ({
      messageId: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as TourMessage[];

    // Sort by timestamp descending (newest first)
    return messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error('[getLocationMessages] Error getting messages:', error);
    return [];
  }
}

/**
 * Get reactions for a location (polling - not real-time to save reads)
 */
export async function getLocationReactions(tourId: string, locationId: number): Promise<TourReaction[]> {
  try {
    console.log('[getLocationReactions] Fetching reactions for tour:', tourId, 'location:', locationId);
    const reactionsRef = collection(db, TOURS_COLLECTION, tourId, TOUR_REACTIONS_COLLECTION);

    // Simple query without orderBy to avoid index requirement
    const q = query(
      reactionsRef,
      where('locationId', '==', locationId)
    );

    const snapshot = await getDocs(q);
    console.log('[getLocationReactions] Found', snapshot.docs.length, 'reactions');

    // Sort client-side instead
    const reactions = snapshot.docs.map(doc => ({
      reactionId: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as TourReaction[];

    // Sort by timestamp descending (newest first)
    return reactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error('[getLocationReactions] Error getting reactions:', error);
    return [];
  }
}

