# CLAUDE.md

This file provides guidance to an AI assistant (claude.ai/code) when working with code in this repository.

## Project Overview

This project contains **TWO main systems** built with React, TypeScript, Vite, and Firebase Firestore:

### 1. **Minigame System** - Educational Board Game
A multiplayer board game where players join game rooms, roll dice to move around a 24-tile board, answer trivia questions to earn dice rolls, compete for rewards, and experience dynamic game events. Designed for educational content about Ho Chi Minh ideology and Vietnamese culture.

**Key Features:**
- Real-time multiplayer game rooms (up to 50 players)
- Firebase Firestore for real-time state synchronization
- Hybrid optimization strategy (real-time events + polling) to minimize Firebase reads
- Admin-controlled game flow with manual event triggers
- Dynamic rewards with progressive time-based unlocking
- 8 different game events (dice double, score double, penalties, bonuses)
- Timed 5-minute gameplay sessions with automatic game end
- Leaderboard and scoring system

### 2. **Memory Gallery Tour System** - Virtual Tour with Photos
A guided virtual tour system where a "driver" (tour guide) controls navigation through 11 locations on a map, and all "passengers" follow along in real-time, viewing photos and interacting via chat and reactions.

**Key Features:**
- Real-time synchronized navigation (driver controls, passengers follow)
- Interactive map with 11 historical locations (Địa Đạo Củ Chi)
- Photo galleries with zoom functionality (up to 300%)
- Animated character guide that moves between locations
- Chat system (max 10 messages per person)
- Reaction system (max 10 reactions per person)
- Polling optimization (5s interval) to save Firebase reads
- Room-based multiplayer (up to 50 passengers per tour)

## Technology Stack

- **Frontend:** React 18, TypeScript, Vite
- **Routing:** React Router v7
- **Styling:** TailwindCSS
- **Backend:** Firebase Firestore (serverless)
- **Icons:** Lucide React
- **Testing:** Custom Node.js test scripts (`.mjs`)

## Development Commands

### Start Development Server
```bash
npm run dev
```
Starts Vite dev server at `http://localhost:5173`

### Build for Production
```bash
npm run build
```
Creates optimized production build in `dist/`

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally

### Linting
```bash
npm run lint
```
Runs ESLint on the codebase

### Type Checking
```bash
npm run typecheck
```
Runs TypeScript compiler in check mode without emitting files

### Testing
```bash
npm run test:game          # Test game logic
npm run test:integration   # Test Firebase integration
npm run test:all           # Run all tests
```

## Architecture

### Firebase Optimization Strategy

**Critical Performance Concern:** Firebase Firestore has strict read/write limits on the free tier. The project implements a **hybrid optimization** to handle 29+ players in a 5-minute game:

- **Real-time subscriptions** for critical data:
  - Events subscription (`subscribeToEvents`) - All players listen to events
  - Admin full room subscription - Only admin gets real-time updates

- **Polling** for non-critical data:
  - Players poll room state every 3 seconds instead of real-time subscription
  - Reduces reads by ~87% (39,000 → 4,867 reads/game)

- **Caching:**
  - Questions are loaded once into memory cache at game start
  - Eliminates ~150,000 potential reads per game

- **Batch operations:**
  - Quiz answers are batched (500ms window) to reduce write operations

See `FIREBASE_USAGE_HYBRID_29PLAYERS.md` for detailed analysis.

### Code Structure

```
src/
├── pages/               # Route pages
│   ├── LandingPage.tsx           # Home page
│   ├── PresentationPage.tsx      # Content presentation
│   ├── MinigamePage.tsx          # Game selection
│   ├── MemoryGalleryPage.tsx     # Tour entry point
│   ├── minigame/                 # MINIGAME pages
│   │   ├── AdminCreateRoom.tsx   # Admin creates game room
│   │   ├── PlayerJoinRoom.tsx    # Players join with room code
│   │   ├── LobbyRoom.tsx         # Pre-game lobby
│   │   ├── GameBoard.tsx         # Main game interface (1037 lines)
│   │   ├── TestGameBoard.tsx     # Testing interface
│   │   └── GameEnd.tsx           # Post-game results
│   └── tour/                     # TOUR pages
│       ├── TourLobbyPage.tsx     # Tour lobby (passengers join)
│       ├── TourTravelPage.tsx    # Active tour with map
│       └── TourTestPage.tsx      # Testing interface
│
├── components/          # Reusable components
│   ├── minigame/                 # Game-specific components
│   │   ├── TileComponent.tsx    # Board tile rendering
│   │   ├── PlayerToken.tsx      # Player avatar on board
│   │   ├── DiceRoll.tsx         # Dice rolling UI
│   │   ├── QuizModal.tsx        # Quiz question modal
│   │   ├── EventNotification.tsx # Event popup
│   │   ├── RewardDashboard.tsx  # Reward status display
│   │   └── GameTimer.tsx        # Countdown timer
│   ├── tour/                     # Tour-specific components
│   │   ├── RoleSelection.tsx    # Driver/Passenger selection
│   │   ├── TourLobby.tsx        # Lobby UI
│   │   ├── TourChat.tsx         # Chat with polling (5s)
│   │   ├── TourReactions.tsx    # Reactions with polling (5s)
│   │   ├── MockTourChat.tsx     # Mock for testing
│   │   └── MockTourReactions.tsx # Mock for testing
│   ├── map-gallery/
│   │   └── MapGallery.tsx       # Interactive map with zoom (480 lines)
│   └── presentation/             # Content presentation components
│
├── services/firebase/
│   ├── gameService.ts            # Minigame Firebase ops (1000+ lines)
│   │   - Room management (create, join, get by code/ID)
│   │   - Game flow (start, end)
│   │   - Player actions (roll dice, answer quiz)
│   │   - Reward claiming with time-based unlocking
│   │   - Event triggering and ending
│   │   - Leaderboard updates
│   │   - Real-time subscriptions
│   └── tourService.ts            # Tour Firebase ops (458 lines)
│       - Tour management (create, join)
│       - Tour flow (start, move to location)
│       - Chat & Reactions (with limits)
│       - Real-time subscriptions
│
├── types/
│   ├── game.ts                   # Minigame TypeScript types
│   │   - Room, Player, Question, GameLog
│   │   - EventType, RoomStatus, Rewards
│   │   - DEFAULT_SETTINGS, DEFAULT_REWARDS
│   └── tour.ts                   # Tour TypeScript types
│       - Tour, TourPlayer, TourMessage, TourReaction
│       - TourRole, TourStatus
│
├── hooks/
│   └── useEventManager.ts        # Game timer management hook
│       - Auto-end game after 5 minutes
│       - Auto-end events after duration
│       - Leaderboard periodic updates (30s)
│
├── utils/
│   └── gameHelpers.ts            # Utility functions
│       - generateRoomCode()
│       - shuffleArray()
│       - calculateEventTimes()
│
├── config/
│   └── firebase.ts               # Firebase initialization
│
└── data/
    └── lyrics.ts                 # Content data
```

### Game Flow

1. **Room Creation** (`AdminCreateRoom.tsx`)
   - Admin creates room → generates 6-character room code
   - Room stored in `rooms` collection with default settings

2. **Player Join** (`PlayerJoinRoom.tsx`)
   - Players enter room code → join room
   - Transaction checks: room full, game started, duplicate names

3. **Lobby** (`LobbyRoom.tsx`)
   - Players wait, admin sees player list
   - Admin starts game → triggers `startGame()`

4. **Gameplay** (`GameBoard.tsx`)
   - Players answer quiz to earn dice rolls (1 roll per correct answer)
   - Roll dice (1-6) to move on 24-tile circular board
   - Land on reward tiles (5, 9, 14, 19) to claim rewards
   - Admin manually triggers 8 different events during game
   - Events auto-end after 20 seconds (or instant for some)
   - Game auto-ends after 5 minutes

5. **Game End** (`GameEnd.tsx`)
   - Final leaderboard displayed
   - Players see rewards claimed

### Key Firebase Operations

**Important:** Most Firebase logic is in `src/services/firebase/gameService.ts`. When making changes to game logic, always check this file first.

**Quiz Answer Logic:** Quiz answers are handled in `GameBoard.tsx` (lines 85-155, 488-512) using a batch queue system, NOT in gameService.

- **Real-time subscriptions:**
  - `subscribeToRoom()` - Full room updates (admin only)
  - `subscribeToEvents()` - Event updates only (all players)

- **Player actions:**
  - `rollDice()` - Atomic transaction with cooldown check (7s), applies event effects
  - Quiz answers - Handled in `GameBoard.tsx` with batching (500ms queue)
  - `claimReward()` - Transaction with time-based unlock checks and per-player limits (max 2 rewards)

- **Admin actions:**
  - `triggerEvent()` - Applies event effects to all players, instant or 20s duration
  - `endActiveEvent()` - Resets event effects, moves to history
  - `startGame()` / `endGame()`

- **Optimizations:**
  - `loadQuestionsToCache()` - Load all questions once at game start (called in `GameBoard.tsx` line 172)
  - `getRandomQuestionFromCache()` - Get questions from memory (no Firebase read)
  - Polling instead of subscriptions for players (3s interval)
  - Batch quiz answer updates (500ms debounce window with queue system)

### Game Events

8 event types defined in `types/game.ts`:
1. **dice_double** - Next dice roll × 2
2. **score_double** - Score × 2 for movement
3. **quiz_bonus** - Correct quiz answer gives +2 dice rolls
4. **free_dice** - All players get +1 free roll
5. **penalty_wrong** - Wrong quiz answer -5 points
6. **lose_dice** - All players lose 1 dice roll
7. **no_score** - Movement doesn't add score
8. **low_dice_penalty** - Roll < 5 loses 3 points

Events are shuffled at room creation and stored in `events.remainingEvents`.

### Reward System

4 reward types with progressive time-based unlocking:
- **Mystery Gift Box** (tile 14): 3 total, unlock at 1min, 2.5min, 4min
- **Pepsi** (tile 5): 8 total, unlock at 0s, 1.5min, 3min
- **Cheetos** (tile 19): 8 total, unlock at 30s, 2min, 3.5min
- **Candies** (tile 9): 15 total, unlock at 0s, 1min, 2.5min, 4min

Each player can claim max 2 rewards total (including Mystery Box).

### Important Implementation Details

1. **Dice Cooldown:** Players must wait 7 seconds between dice rolls (stored in `player.lastDiceRollTime`)
   - Client-side countdown timer updates every second (`GameBoard.tsx` lines 284-313)
   - Server-side validation in `rollDice()` throws `COOLDOWN_X` error

2. **Position Tracking:** Two position fields:
   - `position` (0-23): Visual position on board (modulo 24)
   - `absolutePosition`: Total tiles moved (for path animation)

3. **Dice Roll Priority:** Use `freeDiceRolls` first, then `diceRolls`

4. **Event Effects Lifecycle:**
   - Applied when event triggers (in `triggerEvent()`)
   - Active during event duration
   - Reset when event ends (in `endActiveEvent()`)
   - `diceDouble` persists through event duration (20s), can be used multiple times

5. **Timestamp Handling:** Firebase timestamps need conversion:
   ```typescript
   const date = timestamp?.toDate?.() || new Date(timestamp)
   ```

6. **Transactions:** Use `runTransaction()` for atomic operations:
   - `rollDice()` - Prevent race conditions
   - `joinRoom()` - Check room capacity atomically
   - `claimReward()` - Prevent duplicate claims

7. **Player Grouping:** GameBoard shows only 4 players at a time per group (`GameBoard.tsx` lines 318-342)
   - Prevents UI clutter with 50 players
   - Players grouped by join order
   - Admin excluded from grouping

8. **Quiz Batch System:** (`GameBoard.tsx` lines 85-155)
   - Queue: `quizUpdateQueue.current` stores pending updates
   - Debounce: 500ms timer before batch write
   - Safety: Re-reads room state to check current event before applying effects
   - Cleanup: Flushes queue on component unmount

9. **Hybrid State Management:**
   - Admin: Real-time subscription via `subscribeToRoom()` (line 197)
   - Players: Polling with `getRoomById()` every 3s (line 226-261)
   - Events: Real-time for all via `subscribeToEvents()` (line 176)
   - Local state merged with Firebase state for consistent UX

## Common Tasks

### Adding a New Event Type

1. Add event type to `EventType` union in `src/types/game.ts`
2. Add to `ALL_EVENT_TYPES` array
3. Implement logic in `triggerEvent()` switch statement in `gameService.ts`
4. Add cleanup logic in `endActiveEvent()` if needed
5. Update UI in `EventNotification.tsx` for display

### Modifying Game Settings

Edit defaults in `src/types/game.ts`:
- `DEFAULT_SETTINGS` - Game duration, max players, cooldowns
- `DEFAULT_REWARDS` - Reward quantities and unlock times

### Adding New Reward Type

1. Add type to `Rewards` interface in `src/types/game.ts`
2. Add default config to `DEFAULT_REWARDS`
3. Update `getRewardName()` in `gameService.ts`
4. Add tile to board config in `DEFAULT_SETTINGS.boardConfig.rewardTiles`
5. Update reward UI in `RewardDashboard.tsx`

### Firebase Optimization Considerations

When adding new features:
- **Avoid real-time subscriptions** for non-critical data
- **Use transactions** for any operation that could race
- **Batch writes** when possible (see quiz answer batching)
- **Cache reads** in memory when data doesn't change often
- **Test Firebase usage** with scripts in `scripts/` directory
- Review impact on read/write counts (see `.md` analysis files)

## Routing Structure

**Minigame Routes:**
- `/minigame` - Game selection
- `/minigame/create` - Admin create room
- `/minigame/join` - Player join room
- `/minigame/lobby/:roomId` - Pre-game lobby
- `/minigame/game/:roomId` - Active game
- `/minigame/end/:roomId` - Post-game results
- `/minigame/test` - Testing interface

**Tour Routes:**
- `/memory-gallery` - Tour entry (role selection)
- `/memory-gallery/tour/:tourId` - Tour lobby
- `/memory-gallery/tour/:tourId/travel` - Active tour
- `/memory-gallery/test` - Testing interface (no Firebase)

**Other Routes:**
- `/` - Landing page
- `/presentation` - Content presentation

---

# 🗺️ MEMORY GALLERY TOUR SYSTEM

## Overview

The Tour System is a guided virtual experience where one "driver" (tour guide) controls navigation through 11 historical locations, and all "passengers" follow in real-time.

## Tour Flow

1. **Role Selection** (`MemoryGalleryPage.tsx` → `RoleSelection.tsx`)
   - Choose role: Driver or Passenger
   - Enter name
   - Driver: Creates tour → gets tour code
   - Passenger: Enters tour code → joins tour

2. **Tour Lobby** (`TourLobbyPage.tsx` → `TourLobby.tsx`)
   - Shows all passengers
   - Passengers mark ready
   - Driver starts tour when all ready

3. **Active Tour** (`TourTravelPage.tsx`)
   - Driver clicks location markers → All passengers follow
   - Character moves to location
   - Gallery modal auto-opens for everyone
   - Passengers can chat & react

4. **Tour End**
   - Driver can navigate between locations freely
   - No explicit end screen

## Key Components

### **MapGallery.tsx** (480 lines) - Core component
**Location:** `src/components/map-gallery/MapGallery.tsx`

**Features:**
- Interactive map with 11 location markers
- Animated character (chibi guerrilla) moves between locations
- Photo galleries with zoom functionality (50% → 300%)
- Driver-only navigation (passengers can only view)
- Character stays at location after modal closes

**Important Props:**
```typescript
interface MapGalleryProps {
  tourId?: string              // Tour mode vs standalone
  currentLocationId?: number   // Current location (synced via Firebase)
  isDriver?: boolean           // Driver can move, passengers can't
  onLocationChange?: (locationId: number) => void
  reactionsComponent?: React.ReactNode  // For livestream-style overlay
  chatComponent?: React.ReactNode
}
```

**Zoom Feature** (lines 234-250, 392-476):
- Click any image → Fullscreen zoom view
- +/- buttons to zoom (0.5x to 3x in 0.5x steps)
- Shows zoom percentage
- Click outside or X to close

**Character Behavior:**
- Starts at location 11 (Đại Học FPT)
- Moves when driver clicks (optimistic for driver, Firebase sync for passengers)
- **Does NOT return** to start position after closing modal (lines 229-232)

**Sync Logic** (lines 172-191):
```typescript
// When driver clicks location:
if (tourId && isDriver && onLocationChange) {
  onLocationChange(location.id)  // → Firebase update
  return  // Wait for Firebase to trigger movement
}

// When Firebase updates currentLocationId:
useEffect(() => {
  if (tourId && currentLocationId !== undefined && currentLocationId !== null) {
    const location = LOCATIONS.find((l) => l.id === currentLocationId)
    if (location) {
      setGuidePosition({ top: location.top, left: location.left + 6 })
      setTimeout(() => setSelectedLocation(location), 1500)  // Auto-open modal
    }
  }
}, [tourId, currentLocationId])
```

### **TourChat.tsx** (122 lines)
**Location:** `src/components/tour/TourChat.tsx`

- **Limit:** 10 messages per person (total across all locations)
- **Polling:** Every 5 seconds (lines 22-32)
- **Manual reload:** After sending message (lines 54-55) for instant feedback
- **Count display:** Shows X/10 messages sent

**Firebase Operations:**
- Send: `sendTourMessage()` → Transaction (1 write + 1 read)
- Poll: `getLocationMessages()` → Query subcollection (1 read)

### **TourReactions.tsx** (142 lines)
**Location:** `src/components/tour/TourReactions.tsx`

- **Limit:** 10 reactions per person (total across all locations)
- **Polling:** Every 5 seconds (lines 34-51)
- **Manual reload:** After sending reaction (lines 74-75)
- **5 emoji options:** ❤️ 😊 👍 ⭐ 🔥

**Firebase Operations:**
- Send: `sendTourReaction()` → Transaction (1 write + 1 read)
- Poll: `getLocationReactions()` → Query subcollection (1 read)

## Tour Firebase Operations

**Location:** `src/services/firebase/tourService.ts` (458 lines)

### **Key Functions:**

**Tour Management:**
- `createTour()` - Create tour with code (1 write)
- `joinTour()` - Join with code, transaction check capacity (1 write + 1 read)
- `startTour()` - Change status to 'traveling' (1 write)
- `moveToLocation()` - Driver only, updates currentLocation (1 write)

**Subscriptions:**
- `subscribeToTour()` - Real-time tour updates (onSnapshot)
- Used by ALL participants for currentLocation sync

**Messages & Reactions:**
- `sendTourMessage()` - Transaction with 10-message limit check (2 writes + 1 read)
- `sendTourReaction()` - Transaction with 10-reaction limit check (2 writes + 1 read)
- `getLocationMessages()` - Query, last 50 messages (1 read)
- `getLocationReactions()` - Query (1 read)

### **Optimization Decisions:**

**Why Polling instead of Real-time for Chat/Reactions?**

With 30 people and full usage (10 messages + 10 reactions each):
```
REAL-TIME approach:
- Every message/reaction broadcasts to all 30 people
- 30 × 10 messages = 300 messages × 30 = 9,000 reads
- 30 × 10 reactions = 300 reactions × 30 = 9,000 reads
- Total: 18,000 reads just for chat/reactions

POLLING approach (5s interval, 5 minutes):
- 30 people × 60 polls = 1,800 reads (messages)
- 30 people × 60 polls = 1,800 reads (reactions)
- Total: 3,600 reads

SAVINGS: 18,000 - 3,600 = 14,400 reads saved (80%)
```

**Trade-off:** 5-second delay for chat/reactions (acceptable for tour experience)

## 11 Tour Locations

Defined in `MapGallery.tsx` (lines 6-143):

1. **Khu Hành Chính** (13%, 45%)
2. **Nhà Hàng Bến Dược** (22%, 30%)
3. **Đền Bến Dược** (35%, 35%)
4. **Quầy Lưu Niệm** (32%, 62%) - Has actual images
5. **Khu Tham Quan Địa Đạo** (48%, 70%) - Has actual images
6. **Hồ Bơi** (52%, 28%)
7. **Khu Tái Hiện Vùng Giải Phóng** (62%, 45%)
8. **Hồ Mô Phỏng Biển Đông** (78%, 32%)
9. **Khu Bắn Súng** (88%, 25%)
10. **Khu Truyền Thống Sài Gòn** (76%, 70%) - Has actual images
11. **Đại Học FPT** (85%, 5%) - Starting location, has FPT logo

Each location has a `gallery` array with:
```typescript
{
  title: string,    // Image title
  note: string,     // Image description
  image?: string    // Optional image path (many are placeholders)
}
```

## Important Implementation Details

1. **Driver vs Passenger Permissions:**
   - Only driver can click markers to move
   - Passengers can only view current location
   - Both see same character position and modal

2. **Modal Auto-Open Behavior:**
   - When driver clicks location → Firebase updates `currentLocation`
   - ALL participants receive update via `subscribeToTour()`
   - Modal automatically opens for EVERYONE after 1.5s animation
   - This is INTENTIONAL design - forced guided experience

3. **Character Position Persistence:**
   - After closing modal, character STAYS at that location
   - Does NOT return to starting position
   - This allows driver to review previous locations easily

4. **Zoom Feature:**
   - Each participant controls their own zoom independently
   - Driver zooming does NOT affect passengers
   - This is "Phương án A" - individual viewing experience

5. **Chat/Reaction Limits:**
   - Stored in `players[playerId].messages` and `.reactions` objects
   - Keys: `${locationId}_${timestamp}` for uniqueness
   - Allows multiple messages/reactions per location
   - UI shows total count across all locations

6. **Test Mode** (`/memory-gallery/test`):
   - Works WITHOUT Firebase (no tourId prop)
   - All interactions local-only
   - Good for testing map/zoom without consuming Firebase quota

## Tour Type Definitions

**Location:** `src/types/tour.ts`

```typescript
export type TourRole = 'passenger' | 'driver'
export type TourStatus = 'waiting' | 'traveling' | 'arrived' | 'finished'

export interface Tour {
  tourId: string
  tourCode: string
  driverId: string
  status: TourStatus
  currentLocation: number | null  // 1-11 or null
  maxPlayers: number             // Default 50
  createdAt: Date
  startedAt: Date | null
  players: {
    [playerId: string]: TourPlayer
  }
}

export interface TourPlayer {
  playerId: string
  name: string
  role: TourRole
  joinedAt: Date
  isReady: boolean
  reactions: { [locationId: number]: string }  // emoji
  messages: { [locationId: number]: string }   // text
}
```

## Common Tour Tasks

### Adding a New Location

1. Add to `LOCATIONS` array in `MapGallery.tsx`
2. Update the map image if needed (`/public/map.jpg`)
3. Add images to `/public/` folder
4. Update location descriptions

### Changing Chat/Reaction Limits

1. Update checks in `tourService.ts`:
   - `sendTourMessage()` line 309: Change `>= 10` to new limit
   - `sendTourReaction()` line 374: Change `>= 10` to new limit
2. Update UI text in `TourChat.tsx` and `TourReactions.tsx`

### Adjusting Polling Interval

1. `TourChat.tsx` line 29: Change `5000` (5 seconds)
2. `TourReactions.tsx` line 48: Change `5000` (5 seconds)

**Note:** Increasing interval saves Firebase reads but increases delay

---

## Firebase Security Notes

**WARNING:** Firebase config with API keys is committed in `src/config/firebase.ts`. This is acceptable for Firebase client SDKs as security is handled by Firestore security rules, not API key secrecy. However, ensure proper Firestore security rules are configured in Firebase Console.

## Testing

The project uses custom Node.js test scripts (not Jest/Vitest):
- `scripts/testGameLogic.mjs` - Tests game logic functions
- `scripts/testGameIntegration.mjs` - Tests Firebase integration
- Other scripts for importing questions to Firestore

## Path Aliases

Vite is configured with path alias:
```typescript
import { something } from '@/components/...'
// Resolves to: src/components/...
```

## Git Workflow

Based on recent commits, the project is actively developed:
- Main branch: `main`
- Recent changes: Minigame duration changes (10min → 5min), UI updates, chatbot removal
- Uncommitted changes include Firebase optimization documentation and Vietnam flag logo

## Development Notes

- Game duration recently changed from 10 minutes to 5 minutes for Firebase optimization
- Hybrid real-time + polling strategy implemented to handle 29+ players
- Focus on minimizing Firebase reads/writes due to free tier limits
- Admin has special privileges and different subscription patterns than players
- Quiz system requires answering questions to earn dice rolls (encourages engagement)
- Rewards have progressive unlocking to maintain engagement throughout 5-minute game

---

# 📊 FIREBASE COST ANALYSIS

## Firebase Free Tier Limits

```
Writes:  20,000/day
Reads:   50,000/day
Storage: 1GB
```

## Minigame System (30 người, 5 phút)

### **Writes: ~1,489/game**
```
Room creation:             1 write
Player join (30):         30 writes
Game start/end:            2 writes
Dice rolls (30×38):    1,140 writes
Quiz answers (batch):   ~230 writes (batched from 1,140)
Events (8×2):             16 writes
Rewards (30×2):           60 writes
Leaderboard (10):         10 writes
```

### **Reads: ~5,209/game**
```
Questions cache:           100 reads (1 time load)
Events subscription:       480 reads (30 listeners × 16 changes)
Admin subscription:      1,489 reads (1 listener × all writes)
Players polling:         2,900 reads (29 × 100 polls @ 3s)
Batch quiz checks:         230 reads (check event before write)
Leaderboard:                10 reads (getRoomById)
```

### **Capacity:**
```
✅ ~9-10 games/day (limited by reads: 50,000 ÷ 5,209)
✅ Writes: 1,489 × 10 = 14,890 (well under 20,000)
```

---

## Tour System (30 người, 5 phút)

### **Writes: ~936/game**
```
Tour creation:              1 write
Player join (30):          30 writes
Tour start:                 1 write
Location moves (~6):        6 writes
Messages (30×10):         300 writes (2 per message: doc + player record)
Reactions (30×10):        300 writes (2 per reaction: doc + player record)
```

### **Reads: ~4,710/game**
```
Tour subscription:         210 reads (30 × ~7 location moves)
Messages - transaction:    300 reads (check limit before send)
Reactions - transaction:   300 reads (check limit before send)
Messages - polling:      1,800 reads (30 × 60 polls @ 5s)
Reactions - polling:     1,800 reads (30 × 60 polls @ 5s)
Messages - reload:         300 reads (instant feedback after send)
```

### **Capacity:**
```
✅ ~10-11 tours/day (limited by reads: 50,000 ÷ 4,710)
✅ Writes: 936 × 11 = 10,296 (well under 20,000)
```

---

## Key Optimizations Applied

### **Minigame:**
1. ✅ **Questions Cache** - Saves ~150,000 reads/game (load once, use from memory)
2. ✅ **Quiz Batching** - Reduces 1,140 writes → 230 writes (81% reduction)
3. ✅ **Hybrid Strategy** - Events real-time (critical), room polling (non-critical)
4. ✅ **Player Polling** - 29 players poll @ 3s instead of real-time (87% read reduction)

### **Tour:**
1. ✅ **Chat/Reaction Polling** - 5s interval instead of real-time (80% read reduction)
2. ✅ **Location Real-time Only** - Only currentLocation uses real-time, not chat/reactions
3. ✅ **Message/Reaction Limits** - 10 each per person (prevents abuse)
4. ✅ **Transaction Writes** - Combines doc + player record update in 1 transaction

---

## Comparison: Which System Uses More?

| Metric | Minigame | Tour | Winner |
|--------|----------|------|--------|
| **Writes/game** | 1,489 | 936 | Tour (37% less) |
| **Reads/game** | 5,209 | 4,710 | Tour (10% less) |
| **Max games/day** | ~9-10 | ~10-11 | Tour |
| **Complexity** | High (dice, quiz, events) | Medium (nav, chat, reactions) | Tour (simpler) |

**Winner:** Tour System is more Firebase-efficient

**Reason:** Minigame has more game logic (dice rolls, quiz answers, events) while Tour is mostly navigation + chat/reactions with strict limits.

---

## Daily Capacity Scenarios

### **Scenario 1: Only Minigames**
- 10 games × 1,489 writes = 14,890 writes ✅
- 10 games × 5,209 reads = 52,090 reads ❌ (exceeds 50,000)
- **Max: 9 games/day**

### **Scenario 2: Only Tours**
- 11 tours × 936 writes = 10,296 writes ✅
- 11 tours × 4,710 reads = 51,810 reads ❌ (slightly exceeds 50,000)
- **Max: 10 tours/day**

### **Scenario 3: Mixed Usage**
Example: 5 minigames + 5 tours
- Writes: (5×1,489) + (5×936) = 12,125 ✅
- Reads: (5×5,209) + (5×4,710) = 49,595 ✅
- **Possible: 5 of each/day**

---

## Firebase Best Practices Used

✅ **Caching** - Questions loaded once per game session
✅ **Batching** - Quiz answers batched to reduce writes
✅ **Polling over Real-time** - For non-critical data (polling 3-5s)
✅ **Transactions** - For atomic operations (dice rolls, rewards, join room)
✅ **Rate Limiting** - Cooldowns (7s dice), limits (10 messages/reactions)
✅ **Subcollections** - Messages/reactions in separate collections for efficient queries
✅ **Field Limits** - Quiz answers stored as object keys, not arrays (more efficient updates)

---

## Monitoring Firebase Usage

### **During Development:**
1. Check Firebase Console → Usage tab
2. Look for anomalies (sudden spikes)
3. Review `FIREBASE_USAGE_HYBRID_29PLAYERS.md` for detailed analysis

### **Red Flags:**
- ⚠️ Approaching 50,000 reads/day
- ⚠️ Multiple games running simultaneously (compounds usage)
- ⚠️ Real-time subscriptions not unsubscribing (memory leaks)

### **If Hitting Limits:**
1. Increase polling intervals (3s → 5s for minigame, 5s → 10s for tour)
2. Reduce message/reaction limits (10 → 5)
3. Decrease leaderboard update frequency (30s → 1 min)
4. Consider Firebase Blaze plan (pay-as-you-go)
