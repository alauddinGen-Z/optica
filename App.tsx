
import React, { useState, useCallback, useMemo } from 'react';
import { OrderInfo, GridData } from './types';
import { SPHERES, CYLINDERS } from './constants';
import OrderForm from './components/OrderForm';
import LensGrid from './components/LensGrid';
import PDFInvoice from './components/PDFInvoice';
import QuantityModal from './components/QuantityModal';

// Using the global browser instances provided in index.html
declare var jspdf: any;
declare var html2canvas: any;

const App: React.FC = () => {
  const [orderInfo, setOrderInfo] = useState<OrderInfo>({
    orderId: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    lensType: '',
    clientName: '',
    clientAddress: ''
  });

  const [gridData, setGridData] = useState<GridData>({});
  const [activeCell, setActiveCell] = useState<{ sphere: string, cylinder: string } | null>(null);
  const [signs, setSigns] = useState<{ sph: '-' | '+', cyl: '-' | '+' }>({ sph: '-', cyl: '-' });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState('');

  // Transform constants based on selected sign
  const currentSpheres = useMemo(() => {
    return SPHERES.map(s => {
      if (s === "0.00") return s;
      const val = Math.abs(parseFloat(s));
      return signs.sph === '+' ? `+${val.toFixed(2)}` : `-${val.toFixed(2)}`;
    });
  }, [signs.sph]);

  const currentCylinders = useMemo(() => {
    return CYLINDERS.map(c => {
      if (c === "0.00") return c;
      const val = Math.abs(parseFloat(c));
      return signs.cyl === '+' ? `+${val.toFixed(2)}` : `-${val.toFixed(2)}`;
    });
  }, [signs.cyl]);

  // Determine which sphere rows should be printed
  const printableSpheres = useMemo(() => {
    let lastIndexWithData = 0;

    currentSpheres.forEach((sph, index) => {
      // Check if this row (sphere) has any quantity > 0 in any column (cylinder)
      const rowHasData = currentCylinders.some(cyl => {
        const key = `${sph}|${cyl}`;
        return gridData[key] && gridData[key] > 0;
      });

      if (rowHasData) {
        lastIndexWithData = index;
      }
    });

    return currentSpheres.slice(0, lastIndexWithData + 1);
  }, [currentSpheres, currentCylinders, gridData]);

  // Determine which cylinder columns should be printed
  const printableCylinders = useMemo(() => {
    let lastIndexWithData = 0;

    currentCylinders.forEach((cyl, index) => {
      // Check if this column (cylinder) has any quantity > 0 in any row (sphere)
      const colHasData = currentSpheres.some(sph => {
        const key = `${sph}|${cyl}`;
        return gridData[key] && gridData[key] > 0;
      });

      if (colHasData) {
        lastIndexWithData = index;
      }
    });

    // Ensure at least one column is shown if grid is empty, or trim to last data
    return currentCylinders.slice(0, lastIndexWithData + 1);
  }, [currentCylinders, currentSpheres, gridData]);

  const handleCellClick = useCallback((sphere: string, cylinder: string) => {
    setActiveCell({ sphere, cylinder });
  }, []);

  const handleQuantityConfirm = (quantity: number) => {
    if (!activeCell) return;
    const key = `${activeCell.sphere}|${activeCell.cylinder}`;
    
    setGridData(prev => {
      const newData = { ...prev };
      if (quantity <= 0) {
        delete newData[key];
      } else {
        newData[key] = quantity;
      }
      return newData;
    });
    setActiveCell(null);
  };

  const updateOrderInfo = (field: keyof OrderInfo, val: string) => {
    setOrderInfo(prev => ({ ...prev, [field]: val }));
  };

  const generatePDF = async () => {
    const sourceContainer = document.getElementById('pdf-render-target');
    if (!sourceContainer) {
      alert("Error: PDF template not found.");
      return;
    }

    setIsGenerating(true);
    setGenProgress('Initializing engine...');

    try {
      // Find all invoice pages in the hidden React render tree
      const pageElements = sourceContainer.querySelectorAll('.invoice-page');
      
      if (pageElements.length === 0) {
        throw new Error("No pages found to capture. Check if grid data exists.");
      }

      const jsPDFConstructor = (window as any).jspdf?.jsPDF || (window as any).jspdf || jspdf?.jsPDF;
      if (!jsPDFConstructor) {
        throw new Error("jsPDF library not found. Please check your internet connection.");
      }

      const pdf = new jsPDFConstructor('p', 'mm', 'a4');

      for (let i = 0; i < pageElements.length; i++) {
        setGenProgress(`Capturing Page ${i + 1} of ${pageElements.length}...`);
        
        const originalPage = pageElements[i] as HTMLElement;
        
        // Clone with explicit white background to avoid dark mode issues
        const clonedPage = originalPage.cloneNode(true) as HTMLElement;
        clonedPage.style.position = 'fixed';
        clonedPage.style.top = '0';
        clonedPage.style.left = '0';
        clonedPage.style.zIndex = '-50';
        clonedPage.style.width = '210mm';
        clonedPage.style.height = '297mm';
        clonedPage.style.visibility = 'visible'; 
        clonedPage.style.backgroundColor = '#ffffff';
        
        document.body.appendChild(clonedPage);

        // Wait slightly for DOM to settle styles
        await new Promise(r => setTimeout(r, 150));

        const canvas = await html2canvas(clonedPage, {
          scale: 3, // Higher scale for crisper text
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 794, 
          height: 1123,
          windowWidth: 1200, 
        });

        document.body.removeChild(clonedPage);

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      setGenProgress('Downloading file...');
      const fileName = `${orderInfo.orderId.replace('#', '')}_Invoice.pdf`;
      
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('PDF Generation Error:', error);
      alert(`Download failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
      setGenProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-lg flex flex-col items-center justify-center text-white text-center p-6">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-3xl font-black mb-3 tracking-tight">Generating PDF</h2>
          <div className="px-4 py-2 bg-blue-600/20 rounded-full border border-blue-500/30">
            <p className="text-blue-400 font-mono font-bold uppercase text-sm animate-pulse">{genProgress}</p>
          </div>
          <p className="mt-8 text-slate-400 text-sm max-w-xs leading-relaxed">
            Please wait while we render the high-precision lens grid...
          </p>
        </div>
      )}

      <header className="bg-blue-600 text-white p-6 shadow-lg sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight">LensOrder Pro</h1>
            <p className="text-blue-100 text-xs font-medium">Precision Optical Ordering System</p>
          </div>
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="bg-white text-blue-600 px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>Download Invoice</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6 mt-4">
        <OrderForm info={orderInfo} onChange={updateOrderInfo} />
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
                <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Lens Matrix Selection</h2>
                <div className="text-xs text-slate-400 font-medium">
                  Tap cell to edit quantity
                </div>
             </div>

             {/* Sign Toggles */}
             <div className="flex gap-4">
                {/* Sphere Toggle */}
                <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-500 px-2 uppercase">SPH</span>
                  <div className="flex bg-slate-100 rounded-md p-0.5">
                    <button 
                      onClick={() => setSigns(s => ({...s, sph: '-'}))}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${signs.sph === '-' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      -
                    </button>
                    <button 
                      onClick={() => setSigns(s => ({...s, sph: '+'}))}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${signs.sph === '+' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Cyl Toggle */}
                <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-500 px-2 uppercase">CYL</span>
                  <div className="flex bg-slate-100 rounded-md p-0.5">
                    <button 
                      onClick={() => setSigns(s => ({...s, cyl: '-'}))}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${signs.cyl === '-' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      -
                    </button>
                    <button 
                      onClick={() => setSigns(s => ({...s, cyl: '+'}))}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${signs.cyl === '+' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      +
                    </button>
                  </div>
                </div>
             </div>
          </div>
          
          <LensGrid 
            spheres={currentSpheres} 
            cylinders={currentCylinders} 
            data={gridData} 
            onCellClick={handleCellClick} 
          />
        </div>
      </main>

      {/* Hidden React Render Target */}
      <div id="hidden-pdf-mount">
         <div id="pdf-render-target">
            <PDFInvoice 
              info={orderInfo} 
              gridData={gridData} 
              spheres={printableSpheres} 
              cylinders={printableCylinders} 
            />
         </div>
      </div>

      {/* Modals */}
      {activeCell && (
        <QuantityModal
          sphere={activeCell.sphere}
          cylinder={activeCell.cylinder}
          currentValue={gridData[`${activeCell.sphere}|${activeCell.cylinder}`] || 0}
          onConfirm={handleQuantityConfirm}
          onCancel={() => setActiveCell(null)}
        />
      )}
    </div>
  );
};

export default App;
