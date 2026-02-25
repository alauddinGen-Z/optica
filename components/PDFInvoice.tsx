
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
  const HEADER_HEIGHT_MM = 50;
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

    let fontSize = '9px';
    if (colCount > 30) fontSize = '5px';
    else if (colCount > 20) fontSize = '6px';
    else if (colCount > 14) fontSize = '7px';
    else if (colCount > 10) fontSize = '8px';

    return {
      fontSize,
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

  const InvoiceHeader = () => {
    let range1 = 0; // 0.00 to 2.00
    let range2 = 0; // 2.25 to 4.00
    let range3 = 0; // 4.25 to 6.00

    Object.entries(gridData).forEach(([key, qty]) => {
      const parts = key.split('|');
      if (parts.length === 2) {
        const cylStr = parts[1];
        const cyl = Math.abs(parseFloat(cylStr));

        if (cyl >= 0 && cyl <= 2.00) range1 += qty;
        else if (cyl > 2.00 && cyl <= 4.00) range2 += qty;
        else if (cyl > 4.00 && cyl <= 6.00) range3 += qty;
      }
    });

    const totalQty = range1 + range2 + range3;

    return (
      <div className="flex flex-row justify-between items-stretch mb-4 pb-4 border-b-[2px] min-h-[45mm]" style={{ borderColor: THEME.primary }}>
        {/* Left Side: Client Info & Title */}
        <div className="w-[35%] flex flex-col justify-start">
          <div className="mb-4">
            <h1 className="text-2xl font-black uppercase tracking-tight leading-tight mb-0.5" style={{ color: THEME.primary }}>
              Sales Invoice
            </h1>
            <p className="text-[10px] font-medium" style={{ color: THEME.textMuted }}>Precision Optical Order</p>
          </div>

          <div className="text-[10px] leading-snug">
            <div className="mb-1">
              <span className="font-bold uppercase mr-2" style={{ color: THEME.secondary }}>Bill To:</span>
            </div>
            <p className="font-bold text-sm leading-tight mb-1" style={{ color: THEME.textMain, wordWrap: 'break-word' }}>{info.clientName || '________________'}</p>
            <p className="w-full" style={{ color: THEME.textMuted, wordWrap: 'break-word' }}>{info.clientAddress || '________________________________'}</p>
          </div>
        </div>

        {/* Center Side: Quantities Statistics */}
        <div className="w-[30%] flex flex-col justify-center text-[8px] px-4 border-l" style={{ borderColor: THEME.border }}>
          <h3 className="font-bold mb-2 uppercase text-[9px] tracking-wider" style={{ color: THEME.primary }}>Quantities (CYL)</h3>
          <div className="flex justify-between items-center mb-1"><span style={{ color: THEME.textMuted }}>0.00 to ±2.00:</span> <span className="font-bold">{range1}</span></div>
          <div className="flex justify-between items-center mb-1"><span style={{ color: THEME.textMuted }}>±2.25 to ±4.00:</span> <span className="font-bold">{range2}</span></div>
          <div className="flex justify-between items-center mb-1"><span style={{ color: THEME.textMuted }}>±4.25 to ±6.00:</span> <span className="font-bold">{range3}</span></div>
          <div className="flex justify-between items-center mt-2 pt-1 border-t" style={{ borderColor: THEME.border }}><span className="font-bold" style={{ color: THEME.secondary }}>Total:</span> <span className="font-bold text-[10px]">{totalQty}</span></div>
        </div>

        {/* Right Side: Order Info & Lens Type */}
        <div className="w-[35%] flex flex-col items-end text-right pl-2">
          <div className="px-4 py-1.5 w-full max-w-[160px] rounded-bl-lg rounded-tr-sm shadow-sm mb-4" style={{ backgroundColor: THEME.primary, color: THEME.white }}>
            <h2 className="text-[10px] font-bold uppercase text-center tracking-widest leading-none">Order Details</h2>
          </div>

          <div className="flex flex-col gap-1.5 text-[9px] w-full max-w-[160px] items-end">
            <div className="flex justify-between w-full border-b pb-1" style={{ borderColor: THEME.border }}>
              <span className="font-bold" style={{ color: THEME.textMuted }}>Invoice ID:</span>
              <span className="font-bold font-mono" style={{ color: THEME.textMain }}>{info.orderId}</span>
            </div>
            <div className="flex justify-between w-full border-b pb-1" style={{ borderColor: THEME.border }}>
              <span className="font-bold" style={{ color: THEME.textMuted }}>Date:</span>
              <span className="font-bold" style={{ color: THEME.textMain }}>{info.date}</span>
            </div>
          </div>

          <div className="mt-4 w-full flex flex-col items-end">
            <span className="block text-[7px] font-bold text-right uppercase tracking-wider mb-1" style={{ color: THEME.textMuted }}>Product Type</span>
            <span className="block text-sm font-black leading-tight uppercase text-right" style={{ color: THEME.secondary, wordWrap: 'break-word', maxWidth: '100%' }}>
              {info.lensType || 'Standard Lens'}
            </span>
          </div>
        </div>
      </div>
    );
  };

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
                    <th className="p-0 relative font-bold" style={{ borderRight: '1px solid rgba(255,255,255,0.2)', width: '35px', minWidth: '35px' }}>
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                        <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                      </svg>
                      <div className="absolute top-[2px] right-[3px] text-[5px] leading-tight z-10 tracking-widest text-white/90">CYL</div>
                      <div className="absolute bottom-[2px] left-[3px] text-[5px] leading-tight z-10 tracking-widest text-white/90">SPH</div>
                    </th>

                    {cylinders.map(cyl => (
                      <th key={cyl} className="p-0 font-bold text-center tracking-tighter" style={{ borderRight: '1px solid rgba(255,255,255,0.15)', fontSize: styles.fontSize }}>
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
                        className="p-0 font-bold text-center shrink-0 tracking-tighter"
                        style={{
                          width: '35px',
                          minWidth: '35px',
                          height: styles.rowHeight,
                          backgroundColor: THEME.sphBg,
                          color: THEME.primary,
                          borderRight: `1px solid ${THEME.primary}`, // Distinct separator for SPH column
                          borderBottom: `1px solid ${THEME.border}`,
                          fontSize: styles.fontSize
                        }}
                      >
                        <div className="flex items-center justify-center w-full h-full leading-none">{sph}</div>
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
                              color: THEME.textMain,
                              fontSize: styles.fontSize
                            }}
                          >
                            <div className={`w-full h-full flex items-center justify-center tracking-tighter leading-none ${val ? 'font-black' : ''}`} style={{ color: val ? THEME.primary : 'inherit' }}>
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
