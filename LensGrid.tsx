
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
    <div className="relative w-full border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col h-[65vh]">
       {/* 
         We use a fixed height container (h-[65vh]) with overflow-auto.
         This ensures the table has its own scroll context, allowing 
         sticky headers (top) and sticky columns (left) to work simultaneously.
       */}
      <div className="flex-1 overflow-auto custom-scrollbar rounded-xl">
        <table className="border-collapse text-xs min-w-max">
          <thead className="bg-slate-100">
            <tr>
              {/* Corner Cell: Sticky Top & Left */}
              <th className="sticky left-0 top-0 z-30 bg-slate-100 border border-slate-300 p-2 text-slate-700 min-w-[80px] font-bold shadow-[2px_2px_5px_-2px_rgba(0,0,0,0.1)] outline outline-1 outline-slate-300">
                SPH \ CYL
              </th>
              {/* Top Header Row: Sticky Top */}
              {cylinders.map(cyl => (
                <th 
                  key={cyl} 
                  className="sticky top-0 z-20 bg-slate-100 border border-slate-300 p-2 text-slate-700 font-bold min-w-[60px] outline outline-1 outline-slate-300"
                >
                  {cyl}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spheres.map(sph => (
              <tr key={sph} className="hover:bg-blue-50/30 transition-colors">
                {/* Left Column: Sticky Left */}
                <td className="sticky left-0 z-10 bg-slate-50 border border-slate-300 p-2 font-bold text-slate-700 text-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] outline outline-1 outline-slate-300">
                  {sph}
                </td>
                {/* Data Cells */}
                {cylinders.map(cyl => {
                  const key = `${sph}|${cyl}`;
                  const quantity = data[key];
                  const hasQuantity = quantity && quantity > 0;
                  
                  return (
                    <td
                      key={cyl}
                      onClick={() => onCellClick(sph, cyl)}
                      className={`border border-slate-200 p-0 text-center cursor-pointer select-none transition-all duration-200 outline outline-1 outline-slate-200 ${
                        hasQuantity 
                          ? 'bg-emerald-500 text-white font-extrabold' 
                          : 'text-slate-400 hover:bg-blue-100'
                      }`}
                    >
                      <div className="w-full h-full min-h-[36px] flex items-center justify-center p-1">
                         {hasQuantity ? quantity : '—'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LensGrid;
