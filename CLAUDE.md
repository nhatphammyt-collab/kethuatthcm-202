# CLAUDE.md

This file provides guidance to an AI assistant (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **multiplayer educational board game** built with React, TypeScript, Vite, and Firebase Firestore. Players join game rooms, roll dice to move around a 24-tile board, answer trivia questions to earn dice rolls, compete for rewards, and experience dynamic game events. The game is designed for educational content about Ho Chi Minh ideology and Vietnamese culture.

**Key Features:**
- Real-time multiplayer game rooms (up to 50 players)
- Firebase Firestore for real-time state synchronization
- Hybrid optimization strategy (real-time events + polling) to minimize Firebase reads
- Admin-controlled game flow with manual event triggers
- Dynamic rewards with progressive time-based unlocking
- 8 different game events (dice double, score double, penalties, bonuses)
- Timed 5-minute gameplay sessions with automatic game end
- Leaderboard and scoring system
- Landing page and presentation content pages

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
│   ├── MemoryGalleryPage.tsx     # Photo gallery
│   └── minigame/                 # Game flow pages
│       ├── AdminCreateRoom.tsx   # Admin creates room
│       ├── PlayerJoinRoom.tsx    # Players join with room code
│       ├── LobbyRoom.tsx         # Pre-game lobby
│       ├── GameBoard.tsx         # Main game interface
│       ├── TestGameBoard.tsx     # Testing interface
│       └── GameEnd.tsx           # Post-game results
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
│   └── presentation/             # Content presentation components
│
├── services/firebase/
│   └── gameService.ts            # All Firebase operations (1000+ lines)
│       - Room management (create, join, get by code/ID)
│       - Game flow (start, end)
│       - Player actions (roll dice, answer quiz)
│       - Reward claiming with time-based unlocking
│       - Event triggering and ending
│       - Leaderboard updates
│       - Real-time subscriptions
│
├── types/
│   └── game.ts                   # TypeScript interfaces and types
│       - Room, Player, Question, GameLog
│       - EventType, RoomStatus, Rewards
│       - DEFAULT_SETTINGS, DEFAULT_REWARDS
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

- **Real-time subscriptions:**
  - `subscribeToRoom()` - Full room updates (admin only)
  - `subscribeToEvents()` - Event updates only (all players)

- **Player actions:**
  - `rollDice()` - Atomic transaction with cooldown check (7s), applies event effects
  - `answerQuestion()` - Not in gameService, handled in GameBoard with batching
  - `claimReward()` - Transaction with time-based unlock checks and per-player limits (max 2 rewards)

- **Admin actions:**
  - `triggerEvent()` - Applies event effects to all players, instant or 20s duration
  - `endActiveEvent()` - Resets event effects, moves to history
  - `startGame()` / `endGame()`

- **Optimizations:**
  - `loadQuestionsToCache()` - Load all questions once at game start
  - `getRandomQuestionFromCache()` - Get questions from memory (no Firebase read)
  - Polling instead of subscriptions for players
  - Batch quiz answer updates (500ms window)

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

- `/` - Landing page
- `/presentation` - Content presentation
- `/minigame` - Game selection
- `/minigame/create` - Admin create room
- `/minigame/join` - Player join room
- `/minigame/lobby/:roomId` - Pre-game lobby
- `/minigame/game/:roomId` - Active game
- `/minigame/end/:roomId` - Post-game results
- `/minigame/test` - Testing interface
- `/memory-gallery` - Photo gallery

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
