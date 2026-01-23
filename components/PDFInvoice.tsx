
import React from 'react';
import { OrderInfo, GridData } from '../types';

interface PDFInvoiceProps {
  info: OrderInfo;
  gridData: GridData;
  spheres: string[];
  cylinders: string[];
}

const PDFInvoice: React.FC<PDFInvoiceProps> = ({ info, gridData, spheres, cylinders }) => {
  // Filter spheres based on absolute value for pagination
  // Page 1: 0.00 to 10.00 (inclusive)
  const page1Spheres = spheres.filter(s => Math.abs(parseFloat(s)) <= 10.00);
  // Page 2: > 10.00
  const page2Spheres = spheres.filter(s => Math.abs(parseFloat(s)) > 10.00);

  const InvoiceHeader = () => (
    <div className="mb-4 border-b-2 border-black pb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
      <div className="text-center">
        <h1 className="text-3xl font-bold uppercase m-0 leading-tight tracking-wider">Sales Invoice</h1>
      </div>
      <div className="mt-6 flex justify-between text-[12px] leading-snug">
        <div className="w-[60%]">
          <p className="m-0"><strong>Client Name:</strong> {info.clientName || '__________________________'}</p>
          <p className="m-0"><strong>Address:</strong> {info.clientAddress || '__________________________'}</p>
        </div>
        <div className="w-[40%] text-right">
          <p className="m-0"><strong>Order ID:</strong> {info.orderId}</p>
          <p className="m-0"><strong>Date:</strong> {info.date}</p>
          <p className="m-0"><strong>Lens Type:</strong> <span className="underline font-bold">{info.lensType || '________________'}</span></p>
        </div>
      </div>
    </div>
  );

  const TablePage = ({ pageSpheres }: { pageSpheres: string[] }) => (
    <div 
      className="invoice-page bg-white p-[15mm] box-border relative" 
      style={{ 
        width: '210mm',
        height: '297mm',
        fontFamily: 'Times New Roman, serif',
        backgroundColor: '#ffffff'
      }}
    >
      <InvoiceHeader />
      <table className="w-full border-collapse border border-black text-[11px]" style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ height: '18px' }} className="bg-gray-50">
            <th className="border border-black p-0 text-center font-bold" style={{ width: '60px' }}>SPH \ CYL</th>
            {cylinders.map(cyl => (
              <th key={cyl} className="border border-black p-0 text-center font-bold">{cyl}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageSpheres.map(sph => (
            <tr key={sph} style={{ height: '18px' }}>
              <td className="border border-black p-0 text-center font-bold bg-gray-50">{sph}</td>
              {cylinders.map(cyl => {
                const key = `${sph}|${cyl}`;
                const val = gridData[key];
                return (
                  <td key={cyl} className="border border-black p-0 text-center font-medium">
                    {val || ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="absolute bottom-[20mm] left-[15mm] right-[15mm] flex justify-between text-[11px]">
        <div className="text-center w-40">
          <p className="mb-12">Authorized Signature</p>
          <div className="border-t border-black pt-1 font-bold">Company Stamp</div>
        </div>
        <div className="text-center w-40">
          <p className="mb-12">Customer Acknowledgment</p>
          <div className="border-t border-black pt-1 font-bold">Date & Signature</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pdf-wrapper" style={{ backgroundColor: '#ffffff' }}>
      <TablePage pageSpheres={page1Spheres} />
      {page2Spheres.length > 0 && <TablePage pageSpheres={page2Spheres} />}
    </div>
  );
};

export default PDFInvoice;
