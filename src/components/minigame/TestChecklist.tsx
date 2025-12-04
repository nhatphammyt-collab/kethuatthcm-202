// Component hiển thị checklist test
import { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface TestChecklistProps {
  onComplete: () => void;
}

export default function TestChecklist({ onComplete }: TestChecklistProps) {
  const [checked, setChecked] = useState({
    positions: false,
    animation: false,
    diceRoll: false,
    allTiles: false,
    gameBoard: false,
  });

  const allChecked = Object.values(checked).every(v => v);

  const toggleCheck = (key: keyof typeof checked) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border-2 border-[#FFD700]">
      <h3 className="text-xl font-bold text-white mb-4">✅ Checklist Test Tọa độ</h3>
      
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            onClick={() => toggleCheck('positions')}
            className="text-2xl"
          >
            {checked.positions ? (
              <CheckCircle2 className="text-green-500" />
            ) : (
              <Circle className="text-gray-400" />
            )}
          </button>
          <span className="text-white">Đã test tất cả vị trí (0-24) bằng slider</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <button
            onClick={() => toggleCheck('animation')}
            className="text-2xl"
          >
            {checked.animation ? (
              <CheckCircle2 className="text-green-500" />
            ) : (
              <Circle className="text-gray-400" />
            )}
          </button>
          <span className="text-white">Animation nhảy của nhân vật mượt mà</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <button
            onClick={() => toggleCheck('diceRoll')}
            className="text-2xl"
          >
            {checked.diceRoll ? (
              <CheckCircle2 className="text-green-500" />
            ) : (
              <Circle className="text-gray-400" />
            )}
          </button>
          <span className="text-white">Đã test lắc xúc xắc và di chuyển nhân vật</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <button
            onClick={() => toggleCheck('allTiles')}
            className="text-2xl"
          >
            {checked.allTiles ? (
              <CheckCircle2 className="text-green-500" />
            ) : (
              <Circle className="text-gray-400" />
            )}
          </button>
          <span className="text-white">Nhân vật đứng đúng vị trí ở tất cả tiles</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <button
            onClick={() => toggleCheck('gameBoard')}
            className="text-2xl"
          >
            {checked.gameBoard ? (
              <CheckCircle2 className="text-green-500" />
            ) : (
              <Circle className="text-gray-400" />
            )}
          </button>
          <span className="text-white">Đã copy tọa độ vào GameBoard.tsx và test trong game thật</span>
        </label>
      </div>

      {allChecked && (
        <div className="mt-4 p-4 bg-green-500/20 rounded-lg border border-green-500">
          <p className="text-green-300 font-semibold mb-2">
            ✅ Tất cả test đã hoàn thành!
          </p>
          <button
            onClick={onComplete}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold"
          >
            Sẵn sàng cho Phase 3
          </button>
        </div>
      )}
    </div>
  );
}

