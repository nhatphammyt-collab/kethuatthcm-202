export type TourRole = 'passenger' | 'driver';

export type TourStatus = 'waiting' | 'traveling' | 'arrived' | 'finished';

export interface TourPlayer {
  playerId: string;
  name: string;
  role: TourRole;
  joinedAt: Date;
  isReady: boolean;
  reactions: {
    [key: string]: string; // emoji - keys are strings like "locationId_timestamp"
  };
  messages: {
    [key: string]: string; // message text - keys are strings like "locationId_timestamp"
  };
}

export interface Tour {
  tourId: string;
  tourCode: string;
  driverId: string;
  status: TourStatus;
  currentLocation: number | null; // location ID
  maxPlayers: number;
  createdAt: Date;
  startedAt: Date | null;
  players: {
    [playerId: string]: TourPlayer;
  };
}

export interface TourMessage {
  messageId: string;
  playerId: string;
  playerName: string;
  locationId: number;
  text: string;
  timestamp: Date;
}

export interface TourReaction {
  reactionId: string;
  playerId: string;
  playerName: string;
  locationId: number;
  emoji: string;
  timestamp: Date;
}

