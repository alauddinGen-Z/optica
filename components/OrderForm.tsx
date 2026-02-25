
import React from 'react';
import { OrderInfo } from '../types';

interface OrderFormProps {
  info: OrderInfo;
  onChange: (field: keyof OrderInfo, val: string) => void;
  savedClientNames: string[];
  savedLensTypes: string[];
}

const OrderForm: React.FC<OrderFormProps> = ({ info, onChange, savedClientNames, savedLensTypes }) => {
  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Order ID</label>
          <input
            type="text"
            value={info.orderId}
            onChange={(e) => onChange('orderId', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
          <input
            type="date"
            value={info.date}
            onChange={(e) => onChange('date', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Lens Type / Product Name</label>
        <input
          type="text"
          list="lens-type-options"
          placeholder='e.g., "1.56 Blue Cut" or "1.61 HMC"'
          value={info.lensType}
          onChange={(e) => onChange('lensType', e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
        />
        {savedLensTypes && savedLensTypes.length > 0 && (
          <datalist id="lens-type-options">
            {savedLensTypes.map((type, idx) => (
              <option key={idx} value={type} />
            ))}
          </datalist>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Client Name</label>
          <input
            type="text"
            list="client-name-options"
            value={info.clientName}
            onChange={(e) => onChange('clientName', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
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
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Client Address</label>
          <input
            type="text"
            value={info.clientAddress}
            onChange={(e) => onChange('clientAddress', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
          />
        </div>
      </div>
    </section>
  );
};

export default OrderForm;
