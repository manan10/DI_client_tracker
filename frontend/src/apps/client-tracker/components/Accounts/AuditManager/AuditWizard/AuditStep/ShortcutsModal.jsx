import React from 'react';
import { X } from 'lucide-react';

const ShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Keyboard Hotkeys</span>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
            <X size={14} />
          </button>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
            <span>Verify & Advance</span>
            <span className="font-mono font-bold text-emerald-600">Space / Enter</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
            <span>Navigate Items</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">← (Prev) / → (Skip)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
            <span>Map Target Ledger</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">L</kbd>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
            <span>Toggle Flags (Sale/Comm/Man)</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">S / C / M</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
            <span>Switch Receipts / Payments</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">1 / 2</span>
          </div>
        </div>

        <button 
          type="button"
          onClick={onClose} 
          className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold uppercase cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default ShortcutsModal;