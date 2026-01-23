
import React, { useState, useEffect, useRef } from 'react';

interface QuantityModalProps {
  sphere: string;
  cylinder: string;
  currentValue: number;
  onConfirm: (quantity: number) => void;
  onCancel: () => void;
}

const QuantityModal: React.FC<QuantityModalProps> = ({ sphere, cylinder, currentValue, onConfirm, onCancel }) => {
  const [value, setValue] = useState(currentValue === 0 ? '' : currentValue.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(value, 10);
    onConfirm(isNaN(num) ? 0 : num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-50 p-4 border-b border-slate-100">
          <h3 className="text-center text-slate-500 font-bold uppercase text-xs tracking-widest">Input Quantity</h3>
          <p className="text-center font-black text-slate-800 text-lg">
            SPH {sphere} / CYL {cylinder}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
            className="w-full text-center text-4xl font-black py-4 border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
          />
          
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="py-3 font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuantityModal;
