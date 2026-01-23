
import React from 'react';
import { GridData } from '../types';

interface LensGridProps {
  spheres: string[];
  cylinders: string[];
  data: GridData;
  onCellClick: (sphere: string, cylinder: string) => void;
}

const LensGrid: React.FC<LensGridProps> = ({ spheres, cylinders, data, onCellClick }) => {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-slate-100">
            <th className="sticky left-0 z-10 bg-slate-100 border border-slate-200 p-2 text-slate-600 min-w-[80px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
              SPH \ CYL
            </th>
            {cylinders.map(cyl => (
              <th key={cyl} className="border border-slate-200 p-2 text-slate-600 min-w-[60px]">{cyl}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {spheres.map(sph => (
            <tr key={sph} className="hover:bg-slate-50 transition-colors">
              <td className="sticky left-0 z-10 bg-white border border-slate-200 p-2 font-bold text-slate-700 text-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                {sph}
              </td>
              {cylinders.map(cyl => {
                const key = `${sph}|${cyl}`;
                const quantity = data[key];
                const hasQuantity = quantity && quantity > 0;
                
                return (
                  <td
                    key={cyl}
                    onClick={() => onCellClick(sph, cyl)}
                    className={`border border-slate-200 p-2 text-center cursor-pointer select-none transition-all duration-200 active:opacity-70 ${
                      hasQuantity 
                        ? 'bg-emerald-500 text-white font-extrabold scale-[0.98] shadow-inner' 
                        : 'text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {hasQuantity ? quantity : '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LensGrid;
