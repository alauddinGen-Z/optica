import React, { useState } from 'react';

interface NamePromptModalProps {
    onConfirm: (name: string) => void;
    onCancel?: () => void;
    isOpen: boolean;
}

const NamePromptModal: React.FC<NamePromptModalProps> = ({ onConfirm, onCancel, isOpen }) => {
    const [name, setName] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onConfirm(name.trim());
            setName('');
        }
    };

    return (
        <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm flex items-end justify-center">
            <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] w-full overflow-hidden animate-in slide-in-from-bottom duration-300">
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                </div>

                <div className="px-5 pb-8 pt-2">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1">New Invoice</h3>
                    <p className="text-sm text-slate-500 mb-5">
                        Give this invoice a name so you can find it later.
                    </p>
                    <form onSubmit={handleSubmit}>
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g., John Doe - Mar 15"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border-2 border-slate-200 rounded-2xl px-4 py-4 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none mb-5 bg-slate-50 transition-all"
                        />
                        <div className="flex gap-3">
                            {onCancel && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="flex-1 h-14 rounded-2xl font-bold text-base text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors active:scale-95"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={!name.trim()}
                                className="flex-1 h-14 rounded-2xl font-bold text-base bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-blue-600/20"
                            >
                                Start Session
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NamePromptModal;
