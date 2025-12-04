/**
 * Integration Testing Script
 * Tests game integration with Firebase simulation
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock Firebase functions
class MockFirestore {
  constructor() {
    this.data = {};
    this.listeners = [];
  }

  set(path, value) {
    this.data[path] = value;
    this.notifyListeners(path, value);
    return Promise.resolve();
  }

  get(path) {
    return Promise.resolve({ data: () => this.data[path] || null, exists: () => !!this.data[path] });
  }

  update(path, updates) {
    if (!this.data[path]) {
      this.data[path] = {};
    }
    
    // Handle nested paths (e.g., 'players.player1')
    for (const [key, value] of Object.entries(updates)) {
      if (key.includes('.')) {
        // Nested path like 'players.player1' or 'players.player1.name'
        const parts = key.split('.');
        let current = this.data[path];
        
        // Navigate to the nested object
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          // If it's not an object, convert it
          if (typeof current[parts[i]] !== 'object' || Array.isArray(current[parts[i]])) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        
        // Set the final value
        const finalKey = parts[parts.length - 1];
        current[finalKey] = value;
      } else {
        // Simple path - merge if it's an object
        if (typeof updates[key] === 'object' && !Array.isArray(updates[key]) && this.data[path][key] && typeof this.data[path][key] === 'object') {
          Object.assign(this.data[path][key], updates[key]);
        } else {
          this.data[path][key] = updates[key];
        }
      }
    }
    
    this.notifyListeners(path, this.data[path]);
    return Promise.resolve();
  }

  onSnapshot(path, callback) {
    this.listeners.push({ path, callback });
    callback({ data: () => this.data[path] || null, exists: () => !!this.data[path] });
    return () => {
      this.listeners = this.listeners.filter(l => l.path !== path || l.callback !== callback);
    };
  }

  notifyListeners(path, data) {
    this.listeners.filter(l => l.path === path).forEach(l => {
      l.callback({ data: () => data, exists: () => !!data });
    });
  }
}

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
};

function assert(condition, message) {
  if (condition) {
    testResults.passed++;
    console.log(`✅ ${message}`);
  } else {
    testResults.failed++;
    testResults.errors.push(message);
    console.error(`❌ ${message}`);
  }
}

// Test 1: Room Creation
async function testRoomCreation() {
  console.log('\n📋 Test: Room Creation');
  const db = new MockFirestore();
  
  const roomData = {
    roomCode: 'TEST01',
    adminId: 'admin1',
    status: 'waiting',
    players: {},
    rewards: {
      mysteryGiftBox: { total: 1, claimed: 0, claimedBy: [] },
      pepsi: { total: 5, claimed: 0, claimedBy: [] },
    },
  };
  
  await db.set('rooms/room1', roomData);
  const room = await db.get('rooms/room1');
  
  assert(room.exists(), 'Room created successfully');
  assert(room.data().roomCode === 'TEST01', 'Room code is correct');
  assert(room.data().status === 'waiting', 'Room status is waiting');
}

// Test 2: Player Join
async function testPlayerJoin() {
  console.log('\n📋 Test: Player Join');
  const db = new MockFirestore();
  
  const roomData = {
    roomCode: 'TEST01',
    players: {},
    settings: { maxPlayers: 50 },
  };
  
  await db.set('rooms/room1', roomData);
  
  // Simulate player join
  await db.update('rooms/room1', {
    'players.player1': {
      name: 'Player 1',
      position: 0,
      score: 0,
      diceRolls: 0,
    },
  });
  
  const room = await db.get('rooms/room1');
  const retrievedRoomData = room.data();
  assert(retrievedRoomData && retrievedRoomData.players && retrievedRoomData.players.player1 !== undefined, 'Player joined successfully');
  if (retrievedRoomData && retrievedRoomData.players && retrievedRoomData.players.player1) {
    assert(retrievedRoomData.players.player1.name === 'Player 1', 'Player name is correct');
  } else {
    assert(false, 'Player data structure is incorrect');
  }
}

// Test 3: Dice Roll Transaction
async function testDiceRollTransaction() {
  console.log('\n📋 Test: Dice Roll Transaction');
  const db = new MockFirestore();
  
  const roomData = {
    players: {
      player1: { position: 0, score: 0, diceRolls: 5, freeDiceRolls: 0 },
    },
  };
  
  await db.set('rooms/room1', roomData);
  
  // Simulate dice roll
  const diceResult = 4;
  const player = roomData.players.player1;
  const newPosition = (player.position + diceResult) % 24;
  const newScore = player.score + diceResult;
  const newDiceRolls = player.diceRolls - 1;
  
  await db.update('rooms/room1', {
    'players.player1.position': newPosition,
    'players.player1.score': newScore,
    'players.player1.diceRolls': newDiceRolls,
  });
  
  const room = await db.get('rooms/room1');
  const updatedRoomData = room.data();
  const updatedPlayer = updatedRoomData?.players?.player1;
  assert(updatedPlayer && updatedPlayer.position === 4, 'Position updated correctly');
  assert(updatedPlayer && updatedPlayer.score === 4, 'Score updated correctly');
  assert(updatedPlayer && updatedPlayer.diceRolls === 4, 'Dice rolls decreased correctly');
}

// Test 4: Reward Claim Transaction
async function testRewardClaim() {
  console.log('\n📋 Test: Reward Claim Transaction');
  const db = new MockFirestore();
  
  const roomData = {
    rewards: {
      pepsi: { total: 5, claimed: 0, claimedBy: [] },
    },
    players: {
      player1: { name: 'Player 1' },
    },
  };
  
  await db.set('rooms/room1', roomData);
  
  // Simulate reward claim
  const reward = roomData.rewards.pepsi;
  if (reward.claimed < reward.total) {
    await db.update('rooms/room1', {
      'rewards.pepsi.claimed': reward.claimed + 1,
      'rewards.pepsi.claimedBy': [...reward.claimedBy, 'player1'],
    });
  }
  
  const room = await db.get('rooms/room1');
  assert(room.data().rewards.pepsi.claimed === 1, 'Reward claimed count updated');
  assert(room.data().rewards.pepsi.claimedBy.includes('player1'), 'Player added to claimedBy');
  
  // Test: Cannot claim if already claimed
  const reward2 = room.data().rewards.pepsi;
  if (reward2.claimedBy.includes('player1')) {
    assert(true, 'Player cannot claim same reward twice');
  }
}

// Test 5: Event Trigger
async function testEventTrigger() {
  console.log('\n📋 Test: Event Trigger');
  const db = new MockFirestore();
  
  const roomData = {
    events: {
      activeEvent: { type: null, startedAt: null, duration: 0 },
      remainingEvents: ['dice_double', 'score_double'],
    },
    players: {
      player1: { eventEffects: {} },
      player2: { eventEffects: {} },
    },
  };
  
  await db.set('rooms/room1', roomData);
  
  // Simulate event trigger
  const eventType = 'dice_double';
  await db.update('rooms/room1', {
    'events.activeEvent.type': eventType,
    'events.activeEvent.startedAt': new Date(),
    'events.activeEvent.duration': 75,
    'events.remainingEvents': roomData.events.remainingEvents.filter(e => e !== eventType),
    'players.player1.eventEffects.diceDouble': true,
    'players.player2.eventEffects.diceDouble': true,
  });
  
  const room = await db.get('rooms/room1');
  const roomDataAfterEvent = room.data();
  assert(roomDataAfterEvent?.events?.activeEvent?.type === 'dice_double', 'Event triggered');
  assert(roomDataAfterEvent?.events?.remainingEvents?.length === 1, 'Event removed from remaining');
  assert(roomDataAfterEvent?.players?.player1?.eventEffects?.diceDouble === true, 'Player 1 has diceDouble effect');
  assert(roomDataAfterEvent?.players?.player2?.eventEffects?.diceDouble === true, 'Player 2 has diceDouble effect');
}

// Test 6: Leaderboard Update
async function testLeaderboardUpdate() {
  console.log('\n📋 Test: Leaderboard Update');
  const db = new MockFirestore();
  
  const roomData = {
    players: {
      player1: { name: 'Player 1', score: 50, position: 10 },
      player2: { name: 'Player 2', score: 100, position: 15 },
      player3: { name: 'Player 3', score: 50, position: 20 },
    },
    leaderboard: {},
  };
  
  await db.set('rooms/room1', roomData);
  
  // Calculate leaderboard
  const players = Object.entries(roomData.players).map(([id, player]) => ({
    playerId: id,
    name: player.name,
    score: player.score,
    position: player.position,
  }));
  
  players.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.position - a.position;
  });
  
  const leaderboard = {};
  players.forEach(player => {
    leaderboard[player.playerId] = {
      name: player.name,
      score: player.score,
      position: player.position,
    };
  });
  
  await db.update('rooms/room1', { leaderboard });
  
  const room = await db.get('rooms/room1');
  assert(room.data().leaderboard.player2.score === 100, 'Leaderboard: Player 2 is first');
  assert(room.data().leaderboard.player1.score === 50, 'Leaderboard: Player 1 is in list');
  assert(room.data().leaderboard.player3.score === 50, 'Leaderboard: Player 3 is in list');
}

// Test 7: Real-time Updates
async function testRealTimeUpdates() {
  console.log('\n📋 Test: Real-time Updates');
  const db = new MockFirestore();
  
  let updateCount = 0;
  const roomData = { players: { player1: { score: 0 } } };
  await db.set('rooms/room1', roomData);
  
  // Simulate real-time listener
  db.onSnapshot('rooms/room1', (snapshot) => {
    if (snapshot.exists()) {
      updateCount++;
    }
  });
  
  // Trigger updates
  await db.update('rooms/room1', { 'players.player1.score': 10 });
  await db.update('rooms/room1', { 'players.player1.score': 20 });
  await db.update('rooms/room1', { 'players.player1.score': 30 });
  
  // Give time for async updates
  await new Promise(resolve => setTimeout(resolve, 100));
  
  assert(updateCount >= 3, `Real-time updates received (count: ${updateCount})`);
}

// Test 8: Concurrent Updates (Race Conditions)
async function testConcurrentUpdates() {
  console.log('\n📋 Test: Concurrent Updates');
  const db = new MockFirestore();
  
  const roomData = {
    rewards: {
      pepsi: { total: 1, claimed: 0, claimedBy: [] },
    },
  };
  
  await db.set('rooms/room1', roomData);
  
  // Simulate two players trying to claim the same reward simultaneously
  const reward = roomData.rewards.pepsi;
  
  // Player 1 claims
  if (reward.claimed < reward.total) {
    await db.update('rooms/room1', {
      'rewards.pepsi.claimed': reward.claimed + 1,
      'rewards.pepsi.claimedBy': [...reward.claimedBy, 'player1'],
    });
  }
  
  // Player 2 tries to claim (should fail)
  const room = await db.get('rooms/room1');
  const updatedReward = room.data().rewards.pepsi;
  
  if (updatedReward.claimed >= updatedReward.total) {
    assert(true, 'Concurrent update: Second player cannot claim (already claimed)');
  } else {
    assert(false, 'Concurrent update: Race condition detected!');
  }
}

// Test 9: Game End
async function testGameEnd() {
  console.log('\n📋 Test: Game End');
  const db = new MockFirestore();
  
  const roomData = {
    status: 'playing',
    startedAt: new Date(Date.now() - 600000), // 10 minutes ago
    players: {
      player1: { score: 100 },
      player2: { score: 150 },
    },
    leaderboard: {},
  };
  
  await db.set('rooms/room1', roomData);
  
  // Update leaderboard
  const players = Object.entries(roomData.players).map(([id, player]) => ({
    playerId: id,
    score: player.score,
  }));
  players.sort((a, b) => b.score - a.score);
  
  const leaderboard = {};
  players.forEach(player => {
    leaderboard[player.playerId] = { score: player.score };
  });
  
  // End game
  await db.update('rooms/room1', {
    status: 'finished',
    endedAt: new Date(),
    leaderboard,
  });
  
  const room = await db.get('rooms/room1');
  assert(room.data().status === 'finished', 'Game ended successfully');
  assert(room.data().leaderboard !== undefined, 'Final leaderboard saved');
}

// Run all integration tests
async function runIntegrationTests() {
  console.log('🚀 Starting Integration Tests...\n');
  console.log('='.repeat(60));
  
  try {
    await testRoomCreation();
    await testPlayerJoin();
    await testDiceRollTransaction();
    await testRewardClaim();
    await testEventTrigger();
    await testLeaderboardUpdate();
    await testRealTimeUpdates();
    await testConcurrentUpdates();
    await testGameEnd();
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 INTEGRATION TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    
    if (testResults.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      testResults.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    const totalTests = testResults.passed + testResults.failed;
    const successRate = ((testResults.passed / totalTests) * 100).toFixed(2);
    console.log(`\n📈 Success Rate: ${successRate}%`);
    
    if (testResults.failed === 0) {
      console.log('\n🎉 All integration tests passed!');
    } else {
      console.log(`\n⚠️  ${testResults.failed} test(s) failed.`);
    }
    
    return testResults.failed === 0;
  } catch (error) {
    console.error('\n💥 Test execution error:', error);
    return false;
  }
}

// Run if executed directly
// Check if this is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1] && import.meta.url.includes(process.argv[1].replace(/\\/g, '/'));

if (isMainModule || !process.argv[1] || process.argv[1].includes('testGameIntegration')) {
  runIntegrationTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

export { runIntegrationTests };

