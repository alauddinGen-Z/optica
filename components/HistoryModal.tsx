import React, { useState, useMemo } from 'react';
import { InvoiceHistory } from '../types';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    histories: InvoiceHistory[];
    currentHistoryId: string | null;
    onLoad: (historyId: string) => void;
    onDelete: (historyId: string) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
    isOpen,
    onClose,
    histories,
    currentHistoryId,
    onLoad,
    onDelete
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredHistories = useMemo(() => {
        const sorted = [...histories].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        if (!searchTerm.trim()) return sorted;
        const lowerTerm = searchTerm.toLowerCase();
        return sorted.filter(h =>
            h.name.toLowerCase().includes(lowerTerm) ||
            (h.orderInfo.clientName || '').toLowerCase().includes(lowerTerm) ||
            (h.orderInfo.lensType || '').toLowerCase().includes(lowerTerm)
        );
    }, [histories, searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm flex items-end justify-center">
            <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] w-full max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">

                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="px-5 pb-4 pt-2 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Invoice History</h3>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Search Bar */}
                    {histories.length > 0 && (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-base transition-all"
                                placeholder="Search invoices..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 pb-8 overscroll-contain">
                    {histories.length === 0 ? (
                        <div className="text-center py-16 px-6">
                            <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-bold text-slate-700 mb-1">No saved invoices</h4>
                            <p className="text-slate-500 text-sm">Invoices you create will appear here.</p>
                        </div>
                    ) : filteredHistories.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">
                            <p className="text-base">No invoices matching "{searchTerm}"</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredHistories.map(h => {
                                const isCurrent = h.id === currentHistoryId;
                                const totalLenses = Object.values(h.gridData).reduce((a, b) => a + b, 0);

                                const updateDate = new Date(h.updatedAt);
                                const isToday = updateDate.toDateString() === new Date().toDateString();
                                const timeString = updateDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                const dateString = isToday ? `Today ${timeString}` : updateDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

                                return (
                                    <div
                                        key={h.id}
                                        className={`p-4 rounded-2xl bg-white border-2 ${isCurrent ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100'} transition-all active:scale-[0.98]`}
                                    >
                                        {/* Top Row: Name + Lens Count */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1 min-w-0 pr-3">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h4 className="font-black text-slate-800 text-base truncate leading-tight">{h.name}</h4>
                                                    {isCurrent && <span className="text-[9px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">Active</span>}
                                                </div>
                                                <div className="text-sm text-slate-500 flex items-center gap-1.5 truncate">
                                                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                    <span className="truncate">{h.orderInfo.clientName || 'No client'}</span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 bg-blue-50 px-3 py-1.5 rounded-xl">
                                                <div className="text-xl font-black text-blue-600 leading-none">{totalLenses}</div>
                                                <div className="text-[9px] font-bold text-blue-400 uppercase tracking-wide mt-0.5">pcs</div>
                                            </div>
                                        </div>

                                        {/* Meta Row */}
                                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-3">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium truncate max-w-[120px]">{h.orderInfo.lensType || 'No type'}</span>
                                            <span>·</span>
                                            <span>{dateString}</span>
                                        </div>

                                        {/* Action Buttons - Full Width for easy tapping */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onLoad(h.id)}
                                                disabled={isCurrent}
                                                className="flex-1 h-12 font-bold text-sm bg-slate-800 text-white disabled:opacity-40 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-xl transition-all active:scale-95 shadow-sm"
                                            >
                                                {isCurrent ? '✓ Loaded' : 'Load Session'}
                                            </button>
                                            <button
                                                onClick={() => onDelete(h.id)}
                                                title="Delete"
                                                className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-95"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
