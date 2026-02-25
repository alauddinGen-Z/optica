
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
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = parseInt(value, 10);
    onConfirm(isNaN(num) ? 0 : num);
  };

  const handleKeyPress = (key: string) => {
    if (value === '0') {
      setValue(key);
    } else if (value.length < 4) { // reasonable max length for quantity
      setValue(prev => prev + key);
    }
  };

  const handleBackspace = () => {
    setValue(prev => prev.length > 1 ? prev.slice(0, -1) : '');
  };

  const handleClear = () => {
    setValue('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative bg-white w-full sm:max-w-xs rounded-t-3xl sm:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in duration-300">
        <div className="bg-slate-50 p-4 border-b border-slate-100 relative">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden"></div>
          <h3 className="text-center text-slate-500 font-bold uppercase text-xs tracking-widest">Input Quantity</h3>
          <p className="text-center font-black text-slate-800 text-lg">
            SPH {sphere} / CYL {cylinder}
          </p>
        </div>

        <div className="p-4 md:p-6 space-y-4">

          {/* Display Output */}
          <div className="w-full text-center text-4xl font-black py-4 border-2 border-slate-200 bg-white rounded-2xl text-slate-800 h-[76px] flex items-center justify-center select-none shadow-inner">
            {value || <span className="text-slate-300">0</span>}
          </div>

          {/* Custom Dialpad */}
          <div className="grid grid-cols-3 gap-3 select-none">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num.toString())}
                className="bg-slate-50 hover:bg-blue-50 active:bg-blue-100 text-slate-700 py-4 sm:py-3 rounded-2xl text-2xl font-black transition-colors border border-slate-200 shadow-sm active:scale-95"
              >
                {num}
              </button>
            ))}

            {/* Bottom Row */}
            <button
              type="button"
              onClick={handleClear}
              className="bg-red-50 hover:bg-red-100 text-red-500 py-4 sm:py-3 rounded-2xl text-sm font-bold transition-colors border border-red-100 shadow-sm active:scale-95"
            >
              CLR
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="bg-slate-50 hover:bg-blue-50 active:bg-blue-100 text-slate-700 py-4 sm:py-3 rounded-2xl text-2xl font-black transition-colors border border-slate-200 shadow-sm active:scale-95"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="bg-slate-50 hover:bg-slate-200 text-slate-600 py-4 sm:py-3 rounded-2xl flex items-center justify-center transition-colors border border-slate-200 shadow-sm active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" /><path d="m18 9-6 6" /><path d="m12 9 6 6" /></svg>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6 sm:mt-4 pt-4 sm:pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="py-4 sm:py-3 font-bold text-slate-500 bg-slate-100 rounded-2xl sm:rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="py-4 sm:py-3 font-bold text-white bg-blue-600 rounded-2xl sm:rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantityModal;
