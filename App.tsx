
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { OrderInfo, GridData, InvoiceHistory } from './types';
import { SPHERES, CYLINDERS } from './constants';
import OrderForm from './components/OrderForm';
import LensGrid from './components/LensGrid';
import PDFInvoice from './components/PDFInvoice';
import QuantityModal from './components/QuantityModal';
import HistoryModal from './components/HistoryModal';
import NamePromptModal from './components/NamePromptModal';

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

  // History State
  const [histories, setHistories] = useState<InvoiceHistory[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isNamePromptOpen, setIsNamePromptOpen] = useState(false);

  // Saved Data for Auto-complete
  const [savedClientNames, setSavedClientNames] = useState<string[]>([]);
  const [savedLensTypes, setSavedLensTypes] = useState<string[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState('');

  // Initial Load & Auto-Save Setup
  useEffect(() => {
    const loadedHistories = localStorage.getItem('invoice_histories');
    const loadedNames = localStorage.getItem('saved_client_names');
    const loadedTypes = localStorage.getItem('saved_lens_types');

    if (loadedNames) setSavedClientNames(JSON.parse(loadedNames));
    if (loadedTypes) setSavedLensTypes(JSON.parse(loadedTypes));

    if (loadedHistories) {
      const parsed: InvoiceHistory[] = JSON.parse(loadedHistories);
      setHistories(parsed);

      const activeId = localStorage.getItem('active_history_id');
      if (activeId && parsed.find(h => h.id === activeId)) {
        // Load the last active session
        const activeItem = parsed.find(h => h.id === activeId)!;
        setOrderInfo(activeItem.orderInfo);
        setGridData(activeItem.gridData);
        setSigns(activeItem.signs);
        setCurrentHistoryId(activeId);
      } else if (parsed.length > 0) {
        // Load the most recent session
        const recentItem = parsed.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
        setOrderInfo(recentItem.orderInfo);
        setGridData(recentItem.gridData);
        setSigns(recentItem.signs);
        setCurrentHistoryId(recentItem.id);
        localStorage.setItem('active_history_id', recentItem.id);
      } else {
        setIsNamePromptOpen(true);
      }
    } else {
      setIsNamePromptOpen(true);
    }
  }, []);

  // Auto-Save Effect
  useEffect(() => {
    if (!currentHistoryId) return;

    setHistories(prev => {
      const updated = prev.map(h => {
        if (h.id === currentHistoryId) {
          return {
            ...h,
            orderInfo,
            gridData,
            signs,
            updatedAt: new Date().toISOString()
          };
        }
        return h;
      });
      localStorage.setItem('invoice_histories', JSON.stringify(updated));
      return updated;
    });

  }, [orderInfo, gridData, signs, currentHistoryId]);

  // Saved Values Auto-Save Update Effect (for Client Names and Lens Types)
  useEffect(() => {
    if (orderInfo.clientName && orderInfo.clientName.trim()) {
      setSavedClientNames(prev => {
        const name = orderInfo.clientName.trim();
        if (!prev.includes(name)) {
          const newNames = [...prev, name];
          localStorage.setItem('saved_client_names', JSON.stringify(newNames));
          return newNames;
        }
        return prev;
      });
    }

    if (orderInfo.lensType && orderInfo.lensType.trim()) {
      setSavedLensTypes(prev => {
        const type = orderInfo.lensType.trim();
        if (!prev.includes(type)) {
          const newTypes = [...prev, type];
          localStorage.setItem('saved_lens_types', JSON.stringify(newTypes));
          return newTypes;
        }
        return prev;
      });
    }
  }, [orderInfo.clientName, orderInfo.lensType]);

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

  const handleStartNewSession = (name: string) => {
    const newSession: InvoiceHistory = {
      id: crypto.randomUUID(),
      name,
      orderInfo: {
        orderId: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
        lensType: '',
        clientName: '',
        clientAddress: ''
      },
      gridData: {},
      signs: { sph: '-', cyl: '-' },
      updatedAt: new Date().toISOString()
    };

    setHistories(prev => {
      const next = [...prev, newSession];
      localStorage.setItem('invoice_histories', JSON.stringify(next));
      return next;
    });

    setOrderInfo(newSession.orderInfo);
    setGridData(newSession.gridData);
    setSigns(newSession.signs);
    setCurrentHistoryId(newSession.id);
    localStorage.setItem('active_history_id', newSession.id);
    setIsNamePromptOpen(false);
  };

  const loadHistoryItem = (id: string) => {
    const item = histories.find(h => h.id === id);
    if (item) {
      setOrderInfo(item.orderInfo);
      setGridData(item.gridData);
      setSigns(item.signs);
      setCurrentHistoryId(item.id);
      localStorage.setItem('active_history_id', item.id);
      setIsHistoryModalOpen(false);
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistories(prev => {
      const next = prev.filter(h => h.id !== id);
      localStorage.setItem('invoice_histories', JSON.stringify(next));

      // If deleted active session, reset or load another
      if (id === currentHistoryId) {
        if (next.length > 0) {
          loadHistoryItem(next[0].id);
        } else {
          setCurrentHistoryId(null);
          localStorage.removeItem('active_history_id');
          setIsHistoryModalOpen(false);
          setIsNamePromptOpen(true);
        }
      }
      return next;
    });
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
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-32 flex flex-col">
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-[500] bg-slate-900/95 backdrop-blur-lg flex flex-col items-center justify-center text-white text-center p-6">
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

      <header className="bg-blue-600 text-white p-3 md:p-6 shadow-md sticky top-0 z-40">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl md:text-2xl font-black tracking-tight truncate">LensOrder Pro</h1>
            </div>
            {currentHistoryId ? (
              <div className="text-blue-100 text-[10px] uppercase font-bold truncate">
                <span className="bg-blue-800 px-1.5 py-0.5 rounded-sm mr-1">Active</span>
                {histories.find(h => h.id === currentHistoryId)?.name}
              </div>
            ) : (
              <p className="text-blue-200 text-[10px] md:text-xs font-medium truncate">Precision Optical Ordering</p>
            )}
          </div>
          <div className="flex gap-1.5 md:gap-2 shrink-0">
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="bg-blue-700/50 hover:bg-blue-700 p-2 md:px-4 md:py-2.5 rounded-full font-bold transition-all flex items-center justify-center border border-blue-500/30"
              aria-label="History"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden md:inline ml-2 text-sm">History</span>
            </button>
            <button
              onClick={() => setIsNamePromptOpen(true)}
              className="bg-white/10 hover:bg-white/20 p-2 md:px-4 md:py-2.5 rounded-full font-bold transition-all flex items-center justify-center border border-blue-300/30"
              aria-label="New Invoice"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden md:inline ml-2 text-sm">New</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto p-3 md:p-6 mt-2 md:mt-8 space-y-4 md:space-y-8 flex-1 pb-24 md:pb-6">

        {/* Top Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-slate-200/60">
          <div className="col-span-1 md:col-span-8">
            <h2 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 md:mb-4 border-b pb-1 md:pb-2">Client Details</h2>
            <OrderForm info={orderInfo} onChange={updateOrderInfo} savedClientNames={savedClientNames} savedLensTypes={savedLensTypes} />
          </div>
          <div className="col-span-1 md:col-span-4 bg-slate-50/50 p-3 md:p-4 rounded-xl border border-slate-100 flex flex-col justify-center mt-2 md:mt-0">
            <h2 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 md:mb-4 border-b pb-1 md:pb-2">Sign Configuration</h2>
            <div className="flex gap-3 md:gap-4">
              {/* Sphere Toggle */}
              <div className="flex-1">
                <label className="block text-[11px] md:text-xs font-semibold text-slate-500 mb-1.5 md:mb-2">Sphere (SPH)</label>
                <div className="flex bg-slate-200/70 rounded-lg p-1">
                  <button
                    className={`flex-1 py-1.5 md:py-2 font-black text-lg md:text-xl leading-none rounded-md transition-all ${signs.sph === '-' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    onClick={() => setSigns(prev => ({ ...prev, sph: '-' }))}
                  >-</button>
                  <button
                    className={`flex-1 py-1.5 md:py-2 font-black text-lg md:text-xl leading-none rounded-md transition-all ${signs.sph === '+' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    onClick={() => setSigns(prev => ({ ...prev, sph: '+' }))}
                  >+</button>
                </div>
              </div>
              {/* Cylinder Toggle */}
              <div className="flex-1">
                <label className="block text-[11px] md:text-xs font-semibold text-slate-500 mb-1.5 md:mb-2">Cylinder (CYL)</label>
                <div className="flex bg-slate-200/70 rounded-lg p-1">
                  <button
                    className={`flex-1 py-1.5 md:py-2 font-black text-lg md:text-xl leading-none rounded-md transition-all ${signs.cyl === '-' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    onClick={() => setSigns(prev => ({ ...prev, cyl: '-' }))}
                  >-</button>
                  <button
                    className={`flex-1 py-1.5 md:py-2 font-black text-lg md:text-xl leading-none rounded-md transition-all ${signs.cyl === '+' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    onClick={() => setSigns(prev => ({ ...prev, cyl: '+' }))}
                  >+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Matrix Area - Horizontally scrollable on mobile */}
        <div className="bg-white px-0 py-4 md:p-8 rounded-2xl md:shadow-sm md:border border-slate-200/60 w-full flex flex-col mx-auto -ml-3 w-[calc(100vw-8px)] md:w-full md:ml-0 overflow-hidden">
          <div className="flex justify-between items-center mb-4 md:mb-6 px-4 md:px-0">
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">Lens Matrix Selection</h2>
              <p className="text-slate-500 text-xs md:text-sm mt-0.5 md:mt-1">Tap a cell to edit. Signs: SPH [{signs.sph}], CYL [{signs.cyl}]</p>
            </div>
          </div>

          <div className="w-full relative shadow-inner">
            <LensGrid
              spheres={currentSpheres}
              cylinders={currentCylinders}
              data={gridData}
              onCellClick={handleCellClick}
            />
          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar for Mobile Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-30 pb-[env(safe-area-inset-bottom,1rem)]">
        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="w-full bg-blue-600 text-white h-14 rounded-2xl font-black text-lg shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-transform"
        >
          <span>{isGenerating ? 'Rendering...' : 'Download Invoice'}</span>
          {!isGenerating && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
        </button>
      </div>

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

      {/* Floating Action Button - Mobile optimized (sticks to bottom right) */}
      <div className="fixed bottom-6 right-6 md:auto md:fixed md:bottom-8 md:right-8 z-50"></div>
      {activeCell && (
        <QuantityModal
          sphere={activeCell.sphere}
          cylinder={activeCell.cylinder}
          currentValue={gridData[`${activeCell.sphere}|${activeCell.cylinder}`] || 0}
          onConfirm={handleQuantityConfirm}
          onCancel={() => setActiveCell(null)}
        />
      )}

      <NamePromptModal
        isOpen={isNamePromptOpen}
        onConfirm={handleStartNewSession}
        onCancel={histories.length > 0 ? () => setIsNamePromptOpen(false) : undefined}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        histories={histories}
        currentHistoryId={currentHistoryId}
        onLoad={loadHistoryItem}
        onDelete={deleteHistoryItem}
      />
    </div>
  );
};

export default App;
