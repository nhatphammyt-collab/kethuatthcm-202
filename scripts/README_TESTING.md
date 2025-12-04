# 🧪 Hướng Dẫn Testing Minigame

## 📋 Tổng Quan

Project có 2 loại testing scripts:
1. **Game Logic Testing** (`testGameLogic.js`) - Test game logic, edge cases, bug detection
2. **Integration Testing** (`testGameIntegration.mjs`) - Test integration với Firebase simulation

## 🚀 Cách Chạy Tests

### 1. Test Game Logic
```bash
npm run test:game
```

Hoặc chạy trực tiếp:
```bash
node scripts/testGameLogic.js
```

### 2. Test Integration
```bash
npm run test:integration
```

Hoặc chạy trực tiếp:
```bash
node scripts/testGameIntegration.mjs
```

### 3. Chạy Tất Cả Tests
```bash
npm run test:all
```

## 📊 Test Coverage

### Game Logic Tests (`testGameLogic.js`)

#### ✅ Test 1: Position Loop Logic
- Normal movement (10 + 5 = 15)
- Loop from 23 to 0
- Multiple loops
- Position 24 = Position 0

#### ✅ Test 2: Score Calculation
- Basic score (1 point per tile)
- Score with `score_double` event
- Score with `no_score` event
- Score cannot go below 0

#### ✅ Test 3: Dice Roll Logic
- Dice range (1-6)
- `dice_double` event
- `low_dice_penalty` logic

#### ✅ Test 4: Reward System
- Reward tile detection
- Reward mapping (tile → reward type)
- Reward availability check
- Reward claimed limit

#### ✅ Test 5: Event System
- All 8 event types exist
- Instant events vs duration events
- Event effects on players

#### ✅ Test 6: Leaderboard Sorting
- Sort by score (descending)
- Tie-breaker by position (descending)

#### ✅ Test 7: Edge Cases
- Player with 0 dice rolls
- Position at boundary (23)
- Negative position handling
- Very large position (multiple loops)

#### ✅ Test 8: Event Effects Logic
- `score_double`: Only doubles points earned DURING event
- `no_score`: Points not added during event
- `penalty_wrong`: Deducts 5 points
- `low_dice_penalty`: Deducts 3 points if dice < 5

#### ✅ Test 9: Game Flow Logic
- Game status transitions
- Game duration (600s = 10 minutes)
- Event count (8 events)
- Event timing

#### ✅ Test 10: Data Integrity
- All players have required fields
- Room has required fields
- Rewards have correct structure

#### ✅ Test 11: Performance Checks
- Leaderboard calculation < 10ms
- Position calculation < 10ms
- Array operations < 10ms

#### ✅ Test 12: Bug Detection
- Position 24 === Position 0
- Score does not reset after event
- `dice_double` persists for full duration
- `no_score` prevents points from being added
- `low_dice_penalty` checks original dice, not final

#### ✅ Test 13: Real-time Sync Simulation
- Multiple players updating simultaneously
- Position and score validation after sync

### Integration Tests (`testGameIntegration.mjs`)

#### ✅ Test 1: Room Creation
- Room created successfully
- Room code is correct
- Room status is waiting

#### ✅ Test 2: Player Join
- Player joined successfully
- Player name is correct

#### ✅ Test 3: Dice Roll Transaction
- Position updated correctly
- Score updated correctly
- Dice rolls decreased correctly

#### ✅ Test 4: Reward Claim Transaction
- Reward claimed count updated
- Player added to claimedBy
- Cannot claim same reward twice

#### ✅ Test 5: Event Trigger
- Event triggered
- Event removed from remaining
- Players have event effects

#### ✅ Test 6: Leaderboard Update
- Leaderboard sorted correctly
- Top player is correct

#### ✅ Test 7: Real-time Updates
- Real-time listeners receive updates

#### ✅ Test 8: Concurrent Updates
- Race condition handling
- Second player cannot claim if already claimed

#### ✅ Test 9: Game End
- Game ended successfully
- Final leaderboard saved

## 🐛 Bug Detection

Scripts tự động kiểm tra các bugs tiềm ẩn:

1. **Position Loop Bug**: Đảm bảo position 24 = position 0
2. **Score Reset Bug**: Score không bị reset khi event kết thúc
3. **Dice Double Duration Bug**: `dice_double` kéo dài 75s, không chỉ 1 lần lắc
4. **No Score Bug**: `no_score` ngăn không cho cộng điểm
5. **Low Dice Penalty Bug**: Kiểm tra original dice, không phải final dice

## 📈 Kết Quả

Sau khi chạy tests, bạn sẽ thấy:
- ✅ Số lượng tests passed
- ❌ Số lượng tests failed
- ⚠️ Warnings (nếu có)
- 📊 Success rate percentage

## 🔧 Troubleshooting

### Lỗi: "Cannot find module"
```bash
# Đảm bảo bạn đang ở root directory của project
cd C:\Users\ADMIN\Desktop\kethuatthcm-202

# Chạy lại test
npm run test:game
```

### Lỗi: "SyntaxError"
- Kiểm tra Node.js version (cần >= 14)
- Đảm bảo file có đúng extension (.js hoặc .mjs)

## 📝 Notes

- Tests chạy offline, không cần Firebase connection
- Tests sử dụng mock data để simulate game state
- Integration tests sử dụng MockFirestore để simulate Firebase

## 🎯 Next Steps

Sau khi tests pass:
1. Test thủ công trên browser
2. Test với nhiều players
3. Test real-time sync
4. Test trên mobile devices
5. Performance testing với nhiều players

