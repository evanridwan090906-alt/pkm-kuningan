import { Minus, Plus } from 'lucide-react';

export default function QuantityInput({ value, onChange }) {
  const increment = () => onChange(Number(value || 0) + 1);
  const decrement = () => {
    const newVal = Number(value || 0) - 1;
    if (newVal >= 1) onChange(newVal);
  };

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={decrement}
        className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all active:scale-90"
      >
        <Minus size={20} />
      </button>
      
      <input
        type="number"
        min="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 h-12 text-center bg-white border-2 border-gray-100 focus:border-blue-500 rounded-xl outline-none font-black text-xl text-blue-600 transition-all"
        placeholder="0"
      />

      <button
        type="button"
        onClick={increment}
        className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-90"
      >
        <Plus size={20} />
      </button>
    </div>
  );
}
