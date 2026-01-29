
import React from 'react';
import { OrderInfo, GridData } from '../types';

interface PDFInvoiceProps {
  info: OrderInfo;
  gridData: GridData;
  spheres: string[];
  cylinders: string[];
}

const PDFInvoice: React.FC<PDFInvoiceProps> = ({ info, gridData, spheres, cylinders }) => {
  // Constants for A4 Page Layout (in mm)
  const PAGE_HEIGHT_MM = 297;
  const MARGIN_MM = 15;
  const HEADER_HEIGHT_MM = 45;
  const FOOTER_HEIGHT_MM = 15;
  const TABLE_HEADER_HEIGHT_MM = 8;
  
  // Calculate available height for the table body per page
  const AVAILABLE_BODY_HEIGHT_MM = PAGE_HEIGHT_MM - (2 * MARGIN_MM) - HEADER_HEIGHT_MM - FOOTER_HEIGHT_MM - TABLE_HEADER_HEIGHT_MM;

  const getVal = (s: string) => Math.abs(parseFloat(s));
  const MIN_ROW_HEIGHT_MM = 5.5;
  const MAX_ROWS_PER_PAGE = Math.floor(AVAILABLE_BODY_HEIGHT_MM / MIN_ROW_HEIGHT_MM);
  
  const pages: string[][] = [];

  const splitIndex = spheres.findIndex(s => getVal(s) > 10.00);
  
  if (splitIndex !== -1 && splitIndex <= MAX_ROWS_PER_PAGE) {
     pages.push(spheres.slice(0, splitIndex));
     const remaining = spheres.slice(splitIndex);
     if (remaining.length > 0) {
        for (let i = 0; i < remaining.length; i += MAX_ROWS_PER_PAGE) {
           pages.push(remaining.slice(i, i + MAX_ROWS_PER_PAGE));
        }
     }
  } else {
     for (let i = 0; i < spheres.length; i += MAX_ROWS_PER_PAGE) {
        pages.push(spheres.slice(i, i + MAX_ROWS_PER_PAGE));
     }
  }

  const getPageStyles = (rowCount: number, colCount: number) => {
    let calculatedRowHeight = AVAILABLE_BODY_HEIGHT_MM / Math.max(rowCount, 10); 
    calculatedRowHeight = Math.min(Math.max(calculatedRowHeight, MIN_ROW_HEIGHT_MM), 9); 

    return {
      fontSize: colCount > 14 ? '7px' : colCount > 10 ? '8px' : '9px',
      rowHeight: `${calculatedRowHeight}mm`,
    };
  };

  // Aesthetic Theme Colors
  const THEME = {
    primary: '#1e3a8a',    // Deep Royal Blue (blue-900)
    secondary: '#2563eb',  // Bright Blue (blue-600)
    accent: '#eff6ff',     // Light Blue Background (blue-50)
    border: '#cbd5e1',     // Slate Border (slate-300)
    textMain: '#0f172a',   // Dark Slate (slate-900)
    textMuted: '#64748b',  // Muted Slate (slate-500)
    sphBg: '#f8fafc',      // Very light slate for SPH column
    white: '#ffffff',
  };

  const InvoiceHeader = () => (
    <div className="flex flex-row justify-between items-start mb-4 pb-4 border-b-[2px] h-[40mm]" style={{ borderColor: THEME.primary }}>
      {/* Left Side: Client Info & Title */}
      <div className="w-[55%] flex flex-col justify-between h-full">
         <div>
            <h1 className="text-2xl font-black uppercase tracking-tight leading-none mb-1" style={{ color: THEME.primary }}>
              Sales Invoice
            </h1>
            <p className="text-[10px] font-medium" style={{ color: THEME.textMuted }}>Precision Optical Order</p>
         </div>
         
         <div className="text-[10px] leading-snug mt-2">
            <div className="mb-1">
              <span className="font-bold uppercase mr-2" style={{ color: THEME.secondary }}>Bill To:</span>
            </div>
            <p className="font-bold text-lg leading-none mb-1" style={{ color: THEME.textMain }}>{info.clientName || '________________'}</p>
            <p className="w-3/4" style={{ color: THEME.textMuted }}>{info.clientAddress || '________________'}</p>
         </div>
      </div>

      {/* Right Side: Order Info & Lens Type */}
      <div className="w-[45%] flex flex-col items-end justify-between h-full text-right">
         <div className="px-4 py-1.5 min-w-[140px] rounded-bl-lg shadow-sm" style={{ backgroundColor: THEME.primary, color: THEME.white }}>
            <h2 className="text-xs font-bold uppercase text-center tracking-widest">Order Details</h2>
         </div>

         <div className="flex flex-col gap-1 text-[10px] w-full items-end mt-2">
            <div className="flex justify-between w-[160px] border-b pb-0.5" style={{ borderColor: THEME.border }}>
               <span className="font-bold" style={{ color: THEME.textMuted }}>Invoice ID:</span>
               <span className="font-bold font-mono" style={{ color: THEME.textMain }}>{info.orderId}</span>
            </div>
            <div className="flex justify-between w-[160px] border-b pb-0.5" style={{ borderColor: THEME.border }}>
               <span className="font-bold" style={{ color: THEME.textMuted }}>Date:</span>
               <span className="font-bold" style={{ color: THEME.textMain }}>{info.date}</span>
            </div>
         </div>

         <div className="mt-auto pt-2">
           <span className="block text-[8px] font-bold uppercase tracking-widest mb-0.5" style={{ color: THEME.textMuted }}>Product / Lens Type</span>
           <span className="block text-xl font-black leading-none uppercase" style={{ color: THEME.secondary }}>
             {info.lensType || 'Standard Lens'}
           </span>
         </div>
      </div>
    </div>
  );

  return (
    <div className="pdf-wrapper">
      {pages.map((pageRows, pageIndex) => {
        const styles = getPageStyles(pageRows.length, cylinders.length);
        
        return (
          <div 
            key={pageIndex}
            className="invoice-page box-border relative" 
            style={{ 
              width: '210mm',
              height: '297mm',
              padding: `${MARGIN_MM}mm`,
              backgroundColor: '#ffffff',
              fontFamily: 'Inter, sans-serif', 
            }}
          >
            <InvoiceHeader />
            
            {/* Table Container */}
            <div className="w-full">
              <table 
                className="w-full border-collapse" 
                style={{ 
                  tableLayout: 'fixed',
                  fontSize: styles.fontSize,
                  border: `2px solid ${THEME.primary}`
                }}
              >
                <thead>
                  <tr style={{ height: `${TABLE_HEADER_HEIGHT_MM}mm`, backgroundColor: THEME.primary, color: THEME.white }} className="print-color-adjust-exact">
                    {/* Header: SPH/CYL Split with SVG for sharp diagonal */}
                    <th className="p-0 w-[50px] relative overflow-hidden" style={{ borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                         <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                      </svg>
                      <span className="absolute top-[2px] right-[2px] text-[7px] font-bold z-10">CYL</span>
                      <span className="absolute bottom-[2px] left-[2px] text-[7px] font-bold z-10">SPH</span>
                    </th>
                    
                    {cylinders.map(cyl => (
                      <th key={cyl} className="p-0 font-bold text-center" style={{ borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                        {cyl}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((sph, rowIndex) => (
                    <tr 
                      key={sph} 
                      style={{ height: styles.rowHeight }}
                    >
                      {/* SPH Row Header */}
                      <td 
                        className="p-0 font-bold text-center"
                        style={{ 
                          height: styles.rowHeight,
                          backgroundColor: THEME.sphBg,
                          color: THEME.primary,
                          borderRight: `2px solid ${THEME.primary}`, // Distinct separator for SPH column
                          borderBottom: `1px solid ${THEME.border}`
                        }}
                      >
                        {sph}
                      </td>
                      
                      {/* Data Cells */}
                      {cylinders.map((cyl, colIndex) => {
                        const key = `${sph}|${cyl}`;
                        const val = gridData[key];
                        // Striped rows for readability
                        const cellBg = rowIndex % 2 !== 0 ? THEME.accent : THEME.white;
                        
                        return (
                          <td 
                            key={cyl} 
                            className="p-0 text-center"
                            style={{ 
                              height: styles.rowHeight,
                              backgroundColor: cellBg,
                              borderRight: `1px solid ${THEME.border}`,
                              borderBottom: `1px solid ${THEME.border}`,
                              color: THEME.textMain
                            }}
                          >
                            <div className={`w-full h-full flex items-center justify-center ${val ? 'font-black' : ''}`} style={{ color: val ? THEME.primary : 'inherit' }}>
                               {val ? val : ''}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="absolute bottom-[15mm] left-[15mm] right-[15mm] flex justify-between items-end border-t pt-2" style={{ borderColor: THEME.border }}>
               <div className="text-[9px]" style={{ color: THEME.textMuted }}>
                  <p>Generated by LensOrder Pro</p>
               </div>
               <div className="text-[9px] font-bold px-3 py-1 rounded" style={{ backgroundColor: THEME.accent, color: THEME.primary }}>
                 Page {pageIndex + 1} of {pages.length}
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PDFInvoice;
