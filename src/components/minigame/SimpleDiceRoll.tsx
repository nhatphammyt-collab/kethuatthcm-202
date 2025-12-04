import { useState } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

interface SimpleDiceRollProps {
  onRoll: () => void | Promise<void>; // Callback khi click lắc (Firebase sẽ xử lý)
  disabled?: boolean;
  availableRolls: number; // Số lượt lắc còn lại
  lastDiceResult?: number | null; // Kết quả dice roll cuối cùng từ Firebase
}

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export default function SimpleDiceRoll({ onRoll, disabled = false, availableRolls, lastDiceResult = null }: SimpleDiceRollProps) {
  const [rolling, setRolling] = useState(false);
  const [currentValue, setCurrentValue] = useState(1);

  const handleRoll = async () => {
    if (disabled || availableRolls <= 0 || rolling) return;

    setRolling(true);
    setCurrentValue(1);

    // Animate dice rolling
    const rollInterval = setInterval(() => {
      setCurrentValue(Math.floor(Math.random() * 6) + 1);
    }, 100);

    // Call Firebase roll function (result will come from Firebase)
    try {
      await onRoll();
    } catch (error) {
      console.error('Error rolling dice:', error);
    }

    // Stop animation after 1 second
    setTimeout(() => {
      clearInterval(rollInterval);
      setRolling(false);
      // Keep the last dice result if available, otherwise reset to 1
      // The result will be updated via lastDiceResult prop from parent
    }, 1000);
  };

  // Use lastDiceResult if available and not rolling, otherwise use currentValue
  const displayValue = rolling ? currentValue : (lastDiceResult || currentValue);
  // Clamp displayValue to valid dice range (1-6) for icon selection
  const diceValue = Math.max(1, Math.min(6, displayValue));
  const DiceIcon = DICE_ICONS[diceValue - 1];

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleRoll}
        disabled={disabled || availableRolls <= 0 || rolling}
        className={`relative w-20 h-20 rounded-xl shadow-2xl transition-all flex items-center justify-center ${
          disabled || availableRolls <= 0 || rolling
            ? 'bg-gray-500 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] hover:scale-110 active:scale-95 cursor-pointer'
        }`}
      >
        <DiceIcon
          size={56}
          className={`text-white ${rolling ? 'animate-spin' : ''}`}
        />
        {rolling && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full bg-white/20 rounded-xl animate-pulse"></div>
          </div>
        )}
      </button>

      <div className="text-center">
        <div className="text-white font-bold text-lg">
          {rolling ? 'Đang lắc...' : (lastDiceResult || '-')}
        </div>
        <div className="text-[#FFD700] text-sm font-semibold mt-1">
          Còn {availableRolls} lượt
        </div>
      </div>
    </div>
  );
}

