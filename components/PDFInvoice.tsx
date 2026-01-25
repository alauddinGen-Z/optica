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
  // A4 is 210mm x 297mm
  const PAGE_HEIGHT_MM = 297;
  const MARGIN_MM = 12;
  const HEADER_HEIGHT_MM = 35; // Height of invoice info header
  const FOOTER_HEIGHT_MM = 25; // Height of signature area
  const TABLE_HEADER_HEIGHT_MM = 8;
  
  // Calculate available height for the table body per page
  const AVAILABLE_BODY_HEIGHT_MM = PAGE_HEIGHT_MM - (2 * MARGIN_MM) - HEADER_HEIGHT_MM - FOOTER_HEIGHT_MM - TABLE_HEADER_HEIGHT_MM;

  // Pagination Logic
  // We determine how many rows can fit comfortably.
  // We split based on the logical optical break (usually at 10.00), but we ensure we don't overflow.
  
  // Helper to get numeric value
  const getVal = (s: string) => Math.abs(parseFloat(s));

  // Split data into pages. 
  // Strategy: Try to break at 10.00 if possible, otherwise fill page max capacity.
  // Assuming a minimum readable row height of 4.5mm.
  const MAX_ROWS_PER_PAGE = Math.floor(AVAILABLE_BODY_HEIGHT_MM / 4.5);
  
  const pages: string[][] = [];
  let currentPageRows: string[] = [];

  // Identify the split point index for 10.00
  const splitIndex = spheres.findIndex(s => getVal(s) > 10.00);
  
  if (splitIndex !== -1 && splitIndex <= MAX_ROWS_PER_PAGE) {
     // If the 10.00 split fits on page 1, use that as the natural break
     pages.push(spheres.slice(0, splitIndex));
     
     // Put the rest on subsequent pages
     const remaining = spheres.slice(splitIndex);
     if (remaining.length > 0) {
        // Chunk the remaining if they exceed one page (unlikely for standard ranges, but good for safety)
        for (let i = 0; i < remaining.length; i += MAX_ROWS_PER_PAGE) {
           pages.push(remaining.slice(i, i + MAX_ROWS_PER_PAGE));
        }
     }
  } else {
     // Just chunk linearly if natural split doesn't apply or fits badly
     for (let i = 0; i < spheres.length; i += MAX_ROWS_PER_PAGE) {
        pages.push(spheres.slice(i, i + MAX_ROWS_PER_PAGE));
     }
  }

  // Helper to calculate styles for a specific page
  const getPageStyles = (rowCount: number, colCount: number) => {
    // Distribute available height among rows, but cap max height for aesthetics
    let calculatedRowHeight = AVAILABLE_BODY_HEIGHT_MM / Math.max(rowCount, 10); // Don't stretch too much if few rows
    // Clamp row height
    calculatedRowHeight = Math.min(Math.max(calculatedRowHeight, 4.5), 8); 

    return {
      fontSize: colCount > 14 ? '8px' : colCount > 10 ? '9px' : '10px',
      rowHeight: `${calculatedRowHeight}mm`,
      cellPadding: '0',
    };
  };

  const InvoiceHeader = () => (
    <div className="mb-2 border-b-2 border-slate-800 pb-2 flex justify-between items-start" style={{ height: `${HEADER_HEIGHT_MM - 4}mm` }}>
      <div className="w-[60%]">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-1">Sales Invoice</h1>
        <div className="text-[10px] text-slate-600 leading-tight space-y-0.5">
           <p><span className="font-bold text-slate-800">Client:</span> {info.clientName}</p>
           <p><span className="font-bold text-slate-800">Address:</span> {info.clientAddress}</p>
        </div>
      </div>
      <div className="w-[40%] text-right text-[10px] leading-tight space-y-0.5">
        <div className="bg-slate-100 p-2 rounded border border-slate-200 inline-block text-left min-w-[120px]">
          <p><span className="font-bold text-slate-700">Order ID:</span> {info.orderId}</p>
          <p><span className="font-bold text-slate-700">Date:</span> {info.date}</p>
          <p className="mt-1 pt-1 border-t border-slate-300">
             <span className="font-bold text-slate-700">Lens:</span> {info.lensType}
          </p>
        </div>
      </div>
    </div>
  );

  const InvoiceFooter = () => (
    <div className="absolute bottom-[12mm] left-[12mm] right-[12mm] flex justify-between text-[10px] text-slate-600">
        <div className="text-center w-40">
          <div className="h-8 border-b border-slate-400 mb-1"></div>
          <p className="font-bold uppercase tracking-wider text-[8px]">Authorized Signature</p>
        </div>
        <div className="text-center w-40">
          <div className="h-8 border-b border-slate-400 mb-1"></div>
          <p className="font-bold uppercase tracking-wider text-[8px]">Customer Acknowledgment</p>
        </div>
      </div>
  );

  const CellContent = ({ children, bold = false }: { children?: React.ReactNode, bold?: boolean }) => (
    <div 
      style={{ 
        display: 'flex', 
        width: '100%', 
        height: '100%', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontWeight: bold ? 'bold' : 'normal',
        textAlign: 'center',
        // Force wrap prevention for numbers
        whiteSpace: 'nowrap',
        overflow: 'hidden'
      }}
    >
      {children}
    </div>
  );

  // Diagonal header cell using SVG line instead of CSS gradient to prevent html2canvas errors
  const DiagonalHeader = () => (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative'
    }}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <line x1="0" y1="100" x2="100" y2="0" stroke="#94a3b8" strokeWidth="1" />
      </svg>
      <span style={{ position: 'absolute', bottom: '1px', left: '2px', fontSize: '7px', fontWeight: 'bold', lineHeight: 1 }}>SPH</span>
      <span style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '7px', fontWeight: 'bold', lineHeight: 1 }}>CYL</span>
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
              fontFamily: 'Inter, sans-serif', // Use cleaner sans-serif font
              color: '#0f172a' // slate-900
            }}
          >
            <InvoiceHeader />
            
            <table 
              className="w-full border-collapse" 
              style={{ 
                tableLayout: 'fixed',
                fontSize: styles.fontSize,
                border: '1px solid #334155' // slate-700
              }}
            >
              <thead>
                <tr style={{ height: `${TABLE_HEADER_HEIGHT_MM}mm` }} className="bg-slate-200 text-slate-800">
                  <th className="border border-slate-600 p-0 w-[50px]">
                    <DiagonalHeader />
                  </th>
                  {cylinders.map(cyl => (
                    <th key={cyl} className="border border-slate-600 p-0 font-bold bg-slate-200">
                      <CellContent bold>{cyl}</CellContent>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((sph, rowIndex) => (
                  <tr 
                    key={sph} 
                    style={{ height: styles.rowHeight }}
                    // Zebra striping: Odd rows get a very light gray background
                    className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                  >
                    <td className="border border-slate-600 p-0 font-bold bg-slate-100 text-slate-900">
                      <CellContent bold>{sph}</CellContent>
                    </td>
                    {cylinders.map(cyl => {
                      const key = `${sph}|${cyl}`;
                      const val = gridData[key];
                      return (
                        <td key={cyl} className="border border-slate-400 p-0 text-slate-800">
                           {/* Add extra weight if there is a value */}
                          <CellContent bold={!!val}>{val || ''}</CellContent>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            
            <InvoiceFooter />
            
            {/* Page Number */}
            <div className="absolute bottom-[6mm] right-[12mm] text-[8px] text-slate-400">
              Page {pageIndex + 1} of {pages.length}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PDFInvoice;