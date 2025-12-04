/**
 * Test helper function to verify MysteryBox unlock logic
 * This can be called from browser console to test the unlock times
 */

export function testMysteryBoxUnlock(elapsedSeconds: number, unlockTimes: number[] = [90, 300, 480]) {
  console.log('=== Test MysteryBox Unlock Logic ===');
  console.log('Unlock Times:', unlockTimes);
  console.log('Elapsed Time:', elapsedSeconds, 'seconds');
  console.log('Elapsed Time:', Math.floor(elapsedSeconds / 60), 'minutes', elapsedSeconds % 60, 'seconds');
  
  // Calculate unlocked count
  const unlockedCount = unlockTimes.filter(unlockTime => elapsedSeconds >= unlockTime).length;
  console.log('Unlocked Count:', unlockedCount);
  
  // Show which boxes are unlocked
  unlockTimes.forEach((time, index) => {
    const isUnlocked = elapsedSeconds >= time;
    const timeStr = `${Math.floor(time / 60)} phút ${time % 60} giây`;
    console.log(`Box ${index + 1} (${timeStr}): ${isUnlocked ? '✅ UNLOCKED' : '🔒 LOCKED'}`);
  });
  
  // Test claim scenarios
  console.log('\n=== Claim Scenarios ===');
  for (let claimed = 0; claimed <= unlockedCount; claimed++) {
    const canClaim = claimed < unlockedCount;
    console.log(`Claimed: ${claimed}, Can Claim: ${canClaim ? '✅ YES' : '❌ NO'}`);
    
    if (!canClaim && claimed < unlockTimes.length) {
      const nextUnlockTime = unlockTimes.find(time => elapsedSeconds < time);
      if (nextUnlockTime) {
        const secondsLeft = nextUnlockTime - elapsedSeconds;
        const minutesLeft = Math.floor(secondsLeft / 60);
        const remainingSeconds = secondsLeft % 60;
        console.log(`  → Next unlock in: ${minutesLeft} phút ${remainingSeconds} giây`);
      }
    }
  }
  
  return {
    elapsedSeconds,
    unlockTimes,
    unlockedCount,
    canClaim: (claimed: number) => claimed < unlockedCount,
  };
}

// Example usage in browser console:
// import { testMysteryBoxUnlock } from './utils/testMysteryBoxUnlock';
// testMysteryBoxUnlock(0);    // Game start
// testMysteryBoxUnlock(90);   // 1 min 30 sec
// testMysteryBoxUnlock(150);  // 2 min 30 sec
// testMysteryBoxUnlock(300);  // 5 min
// testMysteryBoxUnlock(480);  // 8 min
// testMysteryBoxUnlock(600);  // 10 min

