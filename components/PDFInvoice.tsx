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
  const HEADER_HEIGHT_MM = 40; 
  const FOOTER_HEIGHT_MM = 25; 
  const TABLE_HEADER_HEIGHT_MM = 8;
  
  // Calculate available height for the table body per page
  const AVAILABLE_BODY_HEIGHT_MM = PAGE_HEIGHT_MM - (2 * MARGIN_MM) - HEADER_HEIGHT_MM - FOOTER_HEIGHT_MM - TABLE_HEADER_HEIGHT_MM;

  // Pagination Logic
  const getVal = (s: string) => Math.abs(parseFloat(s));

  // Minimum row height in mm.
  const MIN_ROW_HEIGHT_MM = 5;

  // Calculate max rows based on the safe minimum height
  const MAX_ROWS_PER_PAGE = Math.floor(AVAILABLE_BODY_HEIGHT_MM / MIN_ROW_HEIGHT_MM);
  
  const pages: string[][] = [];

  // Identify the split point index for 10.00
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

  // Helper to calculate styles for a specific page
  const getPageStyles = (rowCount: number, colCount: number) => {
    let calculatedRowHeight = AVAILABLE_BODY_HEIGHT_MM / Math.max(rowCount, 10); 
    calculatedRowHeight = Math.min(Math.max(calculatedRowHeight, MIN_ROW_HEIGHT_MM), 8); 

    return {
      fontSize: colCount > 14 ? '7px' : colCount > 10 ? '8px' : '9px',
      rowHeight: `${calculatedRowHeight}mm`,
    };
  };

  const InvoiceHeader = () => (
    <div className="mb-2 border-b-2 border-slate-800 pb-1" style={{ height: `${HEADER_HEIGHT_MM - 4}mm` }}>
      {/* Top Center: Lens Type Value Only (Big & Bold) */}
      <div className="flex justify-center items-center h-[14mm]">
          {info.lensType && (
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 leading-none pb-1 text-center">
              {info.lensType}
            </h1>
          )}
      </div>

      {/* Bottom Area: Info & Meta */}
      <div className="flex justify-between items-end h-[16mm] pb-1">
        <div className="w-[60%]">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Sales Invoice</h2>
          <div className="text-[9px] text-slate-600 leading-tight">
             <p><span className="font-bold text-slate-800">Client:</span> {info.clientName}</p>
             <p><span className="font-bold text-slate-800">Address:</span> {info.clientAddress}</p>
          </div>
        </div>
        <div className="w-[40%] text-right text-[9px] leading-tight">
           <div className="inline-block bg-slate-50 px-2 py-1 rounded border border-slate-100">
             <p><span className="font-bold text-slate-700">ID:</span> {info.orderId}</p>
             <p><span className="font-bold text-slate-700">Date:</span> {info.date}</p>
           </div>
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

  // Diagonal header cell using SVG
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

  // Robust centering component
  const CenterContent = ({ children, bold }: { children: React.ReactNode, bold?: boolean }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      fontWeight: bold ? 'bold' : 'normal',
      textAlign: 'center',
      lineHeight: '1', // Reset line height to avoid offset
    }}>
      <span>{children}</span>
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
              color: '#0f172a' 
            }}
          >
            <InvoiceHeader />
            
            <table 
              className="w-full border-collapse" 
              style={{ 
                tableLayout: 'fixed',
                fontSize: styles.fontSize,
                border: '1px solid #334155'
              }}
            >
              <thead>
                <tr style={{ height: `${TABLE_HEADER_HEIGHT_MM}mm` }} className="bg-slate-200 text-slate-800">
                  <th className="border border-slate-600 p-0 w-[50px] relative">
                    <DiagonalHeader />
                  </th>
                  {cylinders.map(cyl => (
                    <th key={cyl} className="border border-slate-600 p-0 font-bold bg-slate-200">
                      <CenterContent bold>{cyl}</CenterContent>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((sph, rowIndex) => (
                  <tr 
                    key={sph} 
                    style={{ height: styles.rowHeight }}
                    className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                  >
                    <td 
                      className="border border-slate-600 p-0 font-bold bg-slate-100 text-slate-900"
                      style={{ height: styles.rowHeight }}
                    >
                      <CenterContent bold>{sph}</CenterContent>
                    </td>
                    {cylinders.map(cyl => {
                      const key = `${sph}|${cyl}`;
                      const val = gridData[key];
                      return (
                        <td 
                          key={cyl} 
                          className="border border-slate-400 p-0 text-slate-800"
                          style={{ height: styles.rowHeight }}
                        >
                          <CenterContent bold={!!val}>
                             {val ? val : ''}
                          </CenterContent>
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