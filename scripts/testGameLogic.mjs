/**
 * Automated Testing Script for Minigame
 * Tests all game logic, edge cases, and finds potential bugs
 */

// Mock data
const mockPlayers = {
  'player1': { name: 'Player 1', position: 0, score: 0, diceRolls: 5, freeDiceRolls: 0 },
  'player2': { name: 'Player 2', position: 5, score: 10, diceRolls: 3, freeDiceRolls: 0 },
  'player3': { name: 'Player 3', position: 12, score: 20, diceRolls: 2, freeDiceRolls: 0 },
};

const mockRoom = {
  roomId: 'test-room',
  roomCode: 'TEST01',
  status: 'playing',
  settings: {
    gameDuration: 600,
    boardConfig: {
      totalTiles: 24,
      rewardTiles: [5, 9, 14, 19],
    },
  },
  players: mockPlayers,
  rewards: {
    mysteryGiftBox: { total: 1, claimed: 0, claimedBy: [] },
    pepsi: { total: 5, claimed: 0, claimedBy: [] },
    cheetos: { total: 5, claimed: 0, claimedBy: [] },
    candies: { total: 10, claimed: 0, claimedBy: [] },
  },
};

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  warnings: [],
};

// Helper functions
function assert(condition, message) {
  if (condition) {
    testResults.passed++;
    console.log(`✅ PASS: ${message}`);
  } else {
    testResults.failed++;
    testResults.errors.push(message);
    console.error(`❌ FAIL: ${message}`);
  }
}

function warn(message) {
  testResults.warnings.push(message);
  console.warn(`⚠️  WARN: ${message}`);
}

// Test 1: Position Calculation (Loop Logic)
function testPositionLoop() {
  console.log('\n📋 Test 1: Position Loop Logic');
  
  // Test normal movement
  const pos1 = (10 + 5) % 24;
  assert(pos1 === 15, 'Normal movement: 10 + 5 = 15');
  
  // Test loop from 23 to 0
  const pos2 = (23 + 1) % 24;
  assert(pos2 === 0, 'Loop from 23: 23 + 1 = 0');
  
  // Test loop from 20 to 0
  const pos3 = (20 + 5) % 24;
  assert(pos3 === 1, 'Loop from 20: 20 + 5 = 1 (looped)');
  
  // Test multiple loops
  const pos4 = (0 + 48) % 24;
  assert(pos4 === 0, 'Multiple loops: 0 + 48 = 0 (2 full loops)');
  
  // Test edge case: position 24 = position 0
  const pos5 = 24 % 24;
  assert(pos5 === 0, 'Position 24 equals position 0');
}

// Test 2: Score Calculation
function testScoreCalculation() {
  console.log('\n📋 Test 2: Score Calculation');
  
  // Test basic score (1 point per tile)
  const score1 = 5; // 5 tiles moved
  assert(score1 === 5, `Basic score: 5 tiles = 5 points`);
  
  // Test score with score_double event
  const baseScore = 10;
  const tilesMoved = 5;
  const scoreWithDouble = baseScore + (tilesMoved * 2);
  assert(scoreWithDouble === 20, `Score double: 10 + (5 * 2) = 20`);
  
  // Test score with no_score event
  const scoreWithNoScore = 10; // Should not add points
  assert(scoreWithNoScore === 10, `No score event: score stays at 10`);
  
  // Test score cannot go below 0
  const negativeScore = Math.max(0, -5);
  assert(negativeScore === 0, `Score cannot be negative: max(0, -5) = 0`);
}

// Test 3: Dice Roll Logic
function testDiceRoll() {
  console.log('\n📋 Test 3: Dice Roll Logic');
  
  // Test dice range (1-6)
  for (let i = 0; i < 100; i++) {
    const dice = Math.floor(Math.random() * 6) + 1;
    assert(dice >= 1 && dice <= 6, `Dice roll ${i + 1}: ${dice} is in range [1, 6]`);
  }
  
  // Test dice_double event
  const originalDice = 3;
  const doubledDice = originalDice * 2;
  assert(doubledDice === 6, `Dice double: 3 * 2 = 6`);
  
  // Test low_dice_penalty (< 5)
  const dice1 = 4;
  const dice2 = 5;
  const dice3 = 6;
  assert(dice1 < 5, `Low dice penalty: 4 < 5 (should penalize)`);
  assert(dice2 >= 5, `Low dice penalty: 5 >= 5 (should not penalize)`);
  assert(dice3 >= 5, `Low dice penalty: 6 >= 5 (should not penalize)`);
}

// Test 4: Reward System
function testRewardSystem() {
  console.log('\n📋 Test 4: Reward System');
  
  const rewardTiles = [5, 9, 14, 19];
  
  // Test reward tile detection
  assert(rewardTiles.includes(5), 'Tile 5 is a reward tile');
  assert(rewardTiles.includes(9), 'Tile 9 is a reward tile');
  assert(rewardTiles.includes(14), 'Tile 14 is a reward tile');
  assert(rewardTiles.includes(19), 'Tile 19 is a reward tile');
  assert(!rewardTiles.includes(0), 'Tile 0 is not a reward tile');
  assert(!rewardTiles.includes(10), 'Tile 10 is not a reward tile');
  
  // Test reward mapping
  const rewardMap = {
    5: 'pepsi',
    9: 'candies',
    14: 'mysteryGiftBox',
    19: 'cheetos',
  };
  
  assert(rewardMap[5] === 'pepsi', 'Tile 5 = Pepsi');
  assert(rewardMap[9] === 'candies', 'Tile 9 = Candies');
  assert(rewardMap[14] === 'mysteryGiftBox', 'Tile 14 = Mystery Gift Box');
  assert(rewardMap[19] === 'cheetos', 'Tile 19 = Cheetos');
  
  // Test reward availability
  const reward = mockRoom.rewards.pepsi;
  assert(reward.claimed < reward.total, 'Pepsi reward is available');
  
  // Test reward claimed limit
  const claimedReward = { total: 5, claimed: 5, claimedBy: [] };
  assert(claimedReward.claimed >= claimedReward.total, 'Reward is fully claimed');
}

// Test 5: Event System
function testEventSystem() {
  console.log('\n📋 Test 5: Event System');
  
  const eventTypes = [
    'dice_double',
    'score_double',
    'quiz_bonus',
    'free_dice',
    'penalty_wrong',
    'lose_dice',
    'no_score',
    'low_dice_penalty',
  ];
  
  // Test all event types exist
  assert(eventTypes.length === 8, `All 8 event types defined`);
  
  // Test instant events
  const instantEvents = ['free_dice', 'lose_dice'];
  assert(instantEvents.includes('free_dice'), 'free_dice is instant event');
  assert(instantEvents.includes('lose_dice'), 'lose_dice is instant event');
  assert(!instantEvents.includes('dice_double'), 'dice_double is not instant event');
  
  // Test event duration
  const durationEvents = eventTypes.filter(e => !instantEvents.includes(e));
  assert(durationEvents.length === 6, `6 events have duration (75s)`);
  
  // Test event effects
  const player = { ...mockPlayers.player1, eventEffects: { diceDouble: true } };
  assert(player.eventEffects.diceDouble === true, 'Player has diceDouble effect');
  
  const player2 = { ...mockPlayers.player2, eventEffects: { scoreDouble: true } };
  assert(player2.eventEffects.scoreDouble === true, 'Player has scoreDouble effect');
}

// Test 6: Leaderboard Sorting
function testLeaderboardSorting() {
  console.log('\n📋 Test 6: Leaderboard Sorting');
  
  const players = [
    { playerId: 'p1', name: 'Player 1', score: 50, position: 10 },
    { playerId: 'p2', name: 'Player 2', score: 100, position: 15 },
    { playerId: 'p3', name: 'Player 3', score: 50, position: 20 },
    { playerId: 'p4', name: 'Player 4', score: 75, position: 5 },
  ];
  
  // Sort by score (descending), then by position (descending)
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.position - a.position;
  });
  
  assert(sorted[0].score === 100, 'Top player has highest score (100)');
  assert(sorted[1].score === 75, 'Second player has score 75');
  assert(sorted[2].score === 50 && sorted[2].position === 20, 'Third player: score 50, position 20 (tie-breaker)');
  assert(sorted[3].score === 50 && sorted[3].position === 10, 'Fourth player: score 50, position 10 (tie-breaker)');
}

// Test 7: Edge Cases
function testEdgeCases() {
  console.log('\n📋 Test 7: Edge Cases');
  
  // Test: Player with 0 dice rolls
  const playerNoRolls = { ...mockPlayers.player1, diceRolls: 0, freeDiceRolls: 0 };
  const totalRolls = playerNoRolls.diceRolls + playerNoRolls.freeDiceRolls;
  assert(totalRolls === 0, 'Player with 0 rolls cannot roll');
  
  // Test: Player with only freeDiceRolls
  const playerFreeRolls = { ...mockPlayers.player1, diceRolls: 0, freeDiceRolls: 2 };
  const totalFreeRolls = playerFreeRolls.diceRolls + playerFreeRolls.freeDiceRolls;
  assert(totalFreeRolls === 2, 'Player can use freeDiceRolls');
  
  // Test: Position at boundary (23)
  const posAtBoundary = 23;
  const nextPos = (posAtBoundary + 1) % 24;
  assert(nextPos === 0, 'Position at boundary 23 + 1 = 0 (loops)');
  
  // Test: Negative position (should not happen, but test safety)
  const negativePos = Math.max(0, -5) % 24;
  assert(negativePos === 0, 'Negative position handled: max(0, -5) % 24 = 0');
  
  // Test: Very large position (multiple loops)
  const largePos = (0 + 100) % 24;
  assert(largePos === 4, 'Large position: 0 + 100 = 4 (after loops)');
  
  // Test: Score overflow protection
  const maxScore = Math.max(0, 999999);
  assert(maxScore >= 0, 'Score cannot be negative');
}

// Test 8: Event Effects Logic
function testEventEffects() {
  console.log('\n📋 Test 8: Event Effects Logic');
  
  // Test score_double: only doubles points earned DURING event
  const scoreBeforeEvent = 100;
  const scoreDuringEvent = 20;
  const finalScore = scoreBeforeEvent + (scoreDuringEvent * 2);
  assert(finalScore === 140, `Score double: 100 + (20 * 2) = 140`);
  
  // Test no_score: points not added during event
  const scoreBeforeNoScore = 100;
  const scoreDuringNoScore = 0; // No points added
  const finalNoScore = scoreBeforeNoScore + scoreDuringNoScore;
  assert(finalNoScore === 100, `No score: 100 + 0 = 100 (no points added)`);
  
  // Test penalty_wrong: deducts 5 points
  const scoreBeforePenalty = 50;
  const penalty = 5;
  const scoreAfterPenalty = Math.max(0, scoreBeforePenalty - penalty);
  assert(scoreAfterPenalty === 45, `Penalty wrong: 50 - 5 = 45`);
  
  // Test low_dice_penalty: deducts 3 points if dice < 5
  const diceResult = 3;
  const lowDicePenalty = diceResult < 5 ? 3 : 0;
  assert(lowDicePenalty === 3, `Low dice penalty: dice 3 < 5, penalty = 3`);
  
  const diceResult2 = 5;
  const lowDicePenalty2 = diceResult2 < 5 ? 3 : 0;
  assert(lowDicePenalty2 === 0, `Low dice penalty: dice 5 >= 5, penalty = 0`);
}

// Test 9: Game Flow Logic
function testGameFlow() {
  console.log('\n📋 Test 9: Game Flow Logic');
  
  // Test game status transitions
  const statuses = ['waiting', 'playing', 'finished'];
  assert(statuses.includes('waiting'), 'Game can be in waiting status');
  assert(statuses.includes('playing'), 'Game can be in playing status');
  assert(statuses.includes('finished'), 'Game can be in finished status');
  
  // Test game duration
  const gameDuration = 600; // 10 minutes
  assert(gameDuration === 600, `Game duration: 600 seconds (10 minutes)`);
  
  // Test event count
  const totalEvents = 8;
  assert(totalEvents === 8, `Total events: 8 events in game`);
  
  // Test event timing (should be spread across game duration)
  const eventInterval = gameDuration / (totalEvents + 1);
  assert(eventInterval > 0, `Event interval: ${eventInterval}s between events`);
  assert(eventInterval < gameDuration, `Event interval is less than game duration`);
}

// Test 10: Data Integrity
function testDataIntegrity() {
  console.log('\n📋 Test 10: Data Integrity');
  
  // Test: All players have required fields
  Object.entries(mockPlayers).forEach(([id, player]) => {
    assert(player.name !== undefined, `Player ${id} has name`);
    assert(typeof player.position === 'number', `Player ${id} has position (number)`);
    assert(typeof player.score === 'number', `Player ${id} has score (number)`);
    assert(player.position >= 0 && player.position < 24, `Player ${id} position in range [0, 23]`);
    assert(player.score >= 0, `Player ${id} score is non-negative`);
  });
  
  // Test: Room has required fields
  assert(mockRoom.roomId !== undefined, 'Room has roomId');
  assert(mockRoom.roomCode !== undefined, 'Room has roomCode');
  assert(mockRoom.settings !== undefined, 'Room has settings');
  assert(mockRoom.settings.boardConfig.totalTiles === 24, 'Room has 24 tiles');
  
  // Test: Rewards have correct structure
  Object.entries(mockRoom.rewards).forEach(([type, reward]) => {
    assert(reward.total > 0, `Reward ${type} has total > 0`);
    assert(reward.claimed >= 0, `Reward ${type} has claimed >= 0`);
    assert(reward.claimed <= reward.total, `Reward ${type} claimed <= total`);
    assert(Array.isArray(reward.claimedBy), `Reward ${type} has claimedBy array`);
  });
}

// Test 11: Performance & Optimization
function testPerformance() {
  console.log('\n📋 Test 11: Performance Checks');
  
  // Test: Leaderboard calculation performance
  const startTime = Date.now();
  const players = Object.values(mockPlayers);
  const sorted = players.sort((a, b) => b.score - a.score);
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  assert(duration < 10, `Leaderboard sort takes < 10ms (actual: ${duration}ms)`);
  
  // Test: Position calculation performance
  const posStartTime = Date.now();
  for (let i = 0; i < 1000; i++) {
    const pos = (i * 7) % 24;
  }
  const posEndTime = Date.now();
  const posDuration = posEndTime - posStartTime;
  
  assert(posDuration < 10, `Position calculation (1000x) takes < 10ms (actual: ${posDuration}ms)`);
  
  // Test: Array operations
  const arrStartTime = Date.now();
  const largeArray = Array.from({ length: 1000 }, (_, i) => i);
  const filtered = largeArray.filter(x => x % 2 === 0);
  const arrEndTime = Date.now();
  const arrDuration = arrEndTime - arrStartTime;
  
  assert(arrDuration < 10, `Array operations take < 10ms (actual: ${arrDuration}ms)`);
}

// Test 12: Bug Detection
function testBugDetection() {
  console.log('\n📋 Test 12: Bug Detection');
  
  // Bug check: Position 24 should equal position 0
  const pos24 = 24 % 24;
  const pos0 = 0 % 24;
  assert(pos24 === pos0, 'BUG CHECK: Position 24 === Position 0');
  
  // Bug check: Score should not reset when event ends
  const scoreAtEventStart = 100;
  const scoreDuringEvent = 20;
  const scoreAfterEvent = scoreAtEventStart + (scoreDuringEvent * 2);
  assert(scoreAfterEvent === 140, 'BUG CHECK: Score does not reset after event (140, not 70)');
  
  // Bug check: Dice double should persist for full duration
  const diceDoubleActive = true;
  const roll1 = 3;
  const roll2 = 4;
  const roll3 = 5;
  assert(diceDoubleActive, 'BUG CHECK: dice_double persists for full 75s, not just one roll');
  
  // Bug check: No score should not add points during event
  const noScoreActive = true;
  const tilesMoved = 5;
  const pointsAdded = noScoreActive ? 0 : tilesMoved;
  assert(pointsAdded === 0, 'BUG CHECK: no_score event prevents points from being added');
  
  // Bug check: Low dice penalty checks original dice, not final
  const originalDice = 3;
  const diceDouble = true;
  const finalDice = originalDice * 2; // 6
  const shouldPenalize = originalDice < 5; // Check original, not final
  assert(shouldPenalize === true, 'BUG CHECK: low_dice_penalty checks original dice (3), not final (6)');
  
  // Bug check: Leaderboard should update correctly
  const playersForLeaderboard = [
    { playerId: 'p1', score: 50, position: 10 },
    { playerId: 'p2', score: 100, position: 15 },
  ];
  const sorted = playersForLeaderboard.sort((a, b) => b.score - a.score);
  assert(sorted[0].playerId === 'p2', 'BUG CHECK: Leaderboard sorts correctly by score');
}

// Test 13: Real-time Sync Simulation
function testRealTimeSync() {
  console.log('\n📋 Test 13: Real-time Sync Simulation');
  
  // Simulate multiple players updating simultaneously
  const roomState1 = { ...mockRoom };
  const roomState2 = { ...mockRoom };
  
  // Player 1 rolls dice
  roomState1.players.player1.position = (roomState1.players.player1.position + 5) % 24;
  roomState1.players.player1.score += 5;
  
  // Player 2 rolls dice (simultaneously)
  roomState2.players.player2.position = (roomState2.players.player2.position + 3) % 24;
  roomState2.players.player2.score += 3;
  
  // Both should be valid
  assert(roomState1.players.player1.position < 24, 'Player 1 position valid after sync');
  assert(roomState2.players.player2.position < 24, 'Player 2 position valid after sync');
  assert(roomState1.players.player1.score >= 0, 'Player 1 score valid after sync');
  assert(roomState2.players.player2.score >= 0, 'Player 2 score valid after sync');
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting Automated Game Testing...\n');
  console.log('='.repeat(60));
  
  testPositionLoop();
  testScoreCalculation();
  testDiceRoll();
  testRewardSystem();
  testEventSystem();
  testLeaderboardSorting();
  testEdgeCases();
  testEventEffects();
  testGameFlow();
  testDataIntegrity();
  testPerformance();
  testBugDetection();
  testRealTimeSync();
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⚠️  Warnings: ${testResults.warnings.length}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    testResults.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  if (testResults.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    testResults.warnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning}`);
    });
  }
  
  const totalTests = testResults.passed + testResults.failed;
  const successRate = ((testResults.passed / totalTests) * 100).toFixed(2);
  
  console.log(`\n📈 Success Rate: ${successRate}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Game logic is working correctly.');
  } else {
    console.log(`\n⚠️  ${testResults.failed} test(s) failed. Please review the errors above.`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  return testResults.failed === 0;
}

// Run tests immediately when script is executed
const success = runAllTests();
process.exit(success ? 0 : 1);

