/**
 * Simple test to verify script execution
 */

console.log('🚀 Test script is running...\n');

// Test 1: Basic calculation
console.log('Test 1: Position calculation');
const pos = (23 + 1) % 24;
console.log(`✅ Position: 23 + 1 = ${pos} (should be 0)`);
assert(pos === 0, 'Position loop works');

// Test 2: Score calculation
console.log('\nTest 2: Score calculation');
const score = 10 + 5;
console.log(`✅ Score: 10 + 5 = ${score}`);
assert(score === 15, 'Score calculation works');

// Test 3: Dice roll range
console.log('\nTest 3: Dice roll range');
const dice = Math.floor(Math.random() * 6) + 1;
console.log(`✅ Dice roll: ${dice}`);
assert(dice >= 1 && dice <= 6, 'Dice roll in range [1, 6]');

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
  } else {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
}

console.log('\n🎉 All simple tests passed!');
process.exit(0);

