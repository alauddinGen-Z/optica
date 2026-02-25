
import React, { useState } from 'react';
import { OrderInfo } from '../types';

interface OrderFormProps {
  info: OrderInfo;
  onChange: (field: keyof OrderInfo, val: string) => void;
  savedClientNames: string[];
  savedLensTypes: string[];
  onDeleteLensType?: (type: string) => void;
  onEditLensType?: (oldType: string, newType: string) => void;
  onAddLensType?: (type: string) => void;
  onAddClientName?: (name: string) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ info, onChange, savedClientNames, savedLensTypes, onDeleteLensType, onEditLensType, onAddLensType, onAddClientName }) => {
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleSelectType = (type: string) => {
    onChange('lensType', type);
  };

  const startEdit = (type: string) => {
    setEditingType(type);
    setEditValue(type);
  };

  const confirmEdit = () => {
    if (editingType && editValue.trim() && editValue.trim() !== editingType) {
      onEditLensType?.(editingType, editValue.trim());
      // If the current lens type was the one being edited, update it
      if (info.lensType === editingType) {
        onChange('lensType', editValue.trim());
      }
    }
    setEditingType(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingType(null);
    setEditValue('');
  };

  return (
    <section className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div>
          <label className="block text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Order ID</label>
          <input
            type="text"
            value={info.orderId}
            onChange={(e) => onChange('orderId', e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
          />
        </div>
        <div>
          <label className="block text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
          <input
            type="date"
            value={info.date}
            onChange={(e) => onChange('date', e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
          />
        </div>
      </div>

      {/* Lens Type with Saved Chips */}
      <div>
        <label className="block text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Lens Type / Product Name</label>
        <div className="relative">
          <input
            type="text"
            placeholder='Type a new lens type...'
            value={info.lensType}
            onChange={(e) => onChange('lensType', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddLensType?.(info.lensType);
              }
            }}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
          />
          {info.lensType.trim() && !savedLensTypes.includes(info.lensType.trim()) && (
            <button
              onClick={() => onAddLensType?.(info.lensType)}
              className="absolute right-2 top-2 bottom-2 bg-blue-100 text-blue-700 px-4 rounded-lg font-bold text-sm hover:bg-blue-200 transition-colors active:scale-95 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Save
            </button>
          )}
        </div>

        {/* Saved Lens Type Chips */}
        {savedLensTypes && savedLensTypes.length > 0 && (
          <div className="mt-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Saved Types — tap to select:</p>
            <div className="flex flex-wrap gap-2">
              {savedLensTypes.map((type, idx) => {
                const isActive = info.lensType === type;
                const isEditing = editingType === type;

                if (isEditing) {
                  return (
                    <div key={idx} className="flex items-center gap-1 bg-blue-50 border-2 border-blue-400 rounded-xl px-2 py-1 animate-in fade-in duration-150">
                      <input
                        autoFocus
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') cancelEdit(); }}
                        className="border-none outline-none bg-transparent text-sm font-semibold text-blue-700 w-28 py-0.5"
                      />
                      <button onClick={confirmEdit} className="p-1 text-green-600 hover:bg-green-100 rounded-lg active:scale-90" title="Save">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      </button>
                      <button onClick={cancelEdit} className="p-1 text-slate-400 hover:bg-slate-200 rounded-lg active:scale-90" title="Cancel">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  );
                }

                return (
                  <div key={idx} className={`group flex items-center gap-1 rounded-xl border-2 transition-all ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300'}`}>
                    <button
                      onClick={() => handleSelectType(type)}
                      className="pl-3 pr-1 py-2 text-sm font-semibold truncate max-w-[140px]"
                    >
                      {type}
                    </button>
                    <button
                      onClick={() => startEdit(type)}
                      className={`p-1.5 rounded-lg transition-colors ${isActive ? 'text-blue-200 hover:text-white hover:bg-blue-500' : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'}`}
                      title="Edit"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button
                      onClick={() => onDeleteLensType?.(type)}
                      className={`p-1.5 pr-2 rounded-lg transition-colors ${isActive ? 'text-blue-200 hover:text-white hover:bg-red-500' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
                      title="Delete"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div>
          <label className="block text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Client Name</label>
          <input
            type="text"
            list="client-name-options"
            value={info.clientName}
            onChange={(e) => onChange('clientName', e.target.value)}
            onBlur={(e) => onAddClientName?.(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
          />
          {savedClientNames && savedClientNames.length > 0 && (
            <datalist id="client-name-options">
              {savedClientNames.map((name, idx) => (
                <option key={idx} value={name} />
              ))}
            </datalist>
          )}
        </div>
        <div>
          <label className="block text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Client Address</label>
          <input
            type="text"
            value={info.clientAddress}
            onChange={(e) => onChange('clientAddress', e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
          />
        </div>
      </div>
    </section>
  );
};

export default OrderForm;
