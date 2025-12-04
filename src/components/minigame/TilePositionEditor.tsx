// Component để điều chỉnh tọa độ tiles
import { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';

interface TilePosition {
  x: number;
  y: number;
}

interface TilePositionEditorProps {
  positions: TilePosition[];
  onSave: (positions: TilePosition[]) => void;
  onClose: () => void;
}

export default function TilePositionEditor({ positions, onSave, onClose }: TilePositionEditorProps) {
  const [editedPositions, setEditedPositions] = useState<TilePosition[]>(positions);

  const handlePositionChange = (index: number, field: 'x' | 'y', value: number) => {
    const newPositions = [...editedPositions];
    newPositions[index] = {
      ...newPositions[index],
      [field]: Math.max(0, Math.min(100, value)),
    };
    setEditedPositions(newPositions);
  };

  const handleReset = () => {
    setEditedPositions(positions);
  };

  const handleSave = () => {
    onSave(editedPositions);
    onClose();
  };

  const copyToClipboard = () => {
    const code = `const TILE_POSITIONS: Array<{ x: number; y: number }> = [\n${editedPositions.map((pos, i) => `  { x: ${pos.x}, y: ${pos.y} }, // ${i}`).join('\n')}\n];`;
    navigator.clipboard.writeText(code);
    alert('Đã copy code vào clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Điều chỉnh Tọa độ Tiles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {editedPositions.map((pos, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="font-semibold mb-2">Tile {index}</div>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-gray-600">X (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={pos.x}
                    onChange={(e) => handlePositionChange(index, 'x', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Y (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={pos.y}
                    onChange={(e) => handlePositionChange(index, 'y', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            <Save size={18} />
            Lưu
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            <RotateCcw size={18} />
            Reset
          </button>
          <button
            onClick={copyToClipboard}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Copy Code
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

