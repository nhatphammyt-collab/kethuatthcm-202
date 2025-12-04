import { useState, useEffect } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

interface DiceRollProps {
  onRoll: (result: number) => void;
  disabled?: boolean;
  canRoll?: boolean; // Whether player has dice rolls available
}

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export default function DiceRoll({ onRoll, disabled = false, canRoll = true }: DiceRollProps) {
  const [rolling, setRolling] = useState(false);
  const [currentValue, setCurrentValue] = useState(1);
  const [rollAnimation, setRollAnimation] = useState(0);

  const handleRoll = () => {
    if (disabled || !canRoll || rolling) return;

    setRolling(true);
    setRollAnimation(0);

    // Animate dice rolling
    const rollInterval = setInterval(() => {
      setCurrentValue(Math.floor(Math.random() * 6) + 1);
      setRollAnimation((prev) => prev + 1);
    }, 100);

    // Stop after 1 second and get final result
    setTimeout(() => {
      clearInterval(rollInterval);
      const finalValue = Math.floor(Math.random() * 6) + 1;
      setCurrentValue(finalValue);
      setRolling(false);
      onRoll(finalValue);
    }, 1000);
  };

  const DiceIcon = DICE_ICONS[currentValue - 1];

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleRoll}
        disabled={disabled || !canRoll || rolling}
        className={`relative w-24 h-24 rounded-xl shadow-2xl transition-all ${
          disabled || !canRoll || rolling
            ? 'bg-gray-500 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] hover:scale-110 active:scale-95 cursor-pointer'
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <DiceIcon
            size={64}
            className={`text-white ${
              rolling ? 'animate-spin' : ''
            }`}
          />
        </div>
        {rolling && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full bg-white/20 rounded-xl animate-pulse"></div>
          </div>
        )}
      </button>

      {rolling && (
        <div className="text-white font-bold text-lg animate-pulse">
          Đang lắc...
        </div>
      )}

      {!canRoll && !rolling && (
        <div className="text-yellow-300 text-sm text-center">
          Bạn cần trả lời đúng câu hỏi để lắc xúc sắc
        </div>
      )}

      {canRoll && !rolling && (
        <div className="text-white text-sm text-center">
          Kết quả: {currentValue}
        </div>
      )}
    </div>
  );
}

