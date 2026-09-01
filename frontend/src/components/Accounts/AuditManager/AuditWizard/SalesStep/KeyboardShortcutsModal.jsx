import React from 'react';
import { Keyboard, X } from 'lucide-react';

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { label: "Navigate Vouchers", keys: ["↑", "↓", "or", "J", "K"] },
    { label: "Verify & Advance", keys: ["Enter", "Space"] },
    { label: "Toggle Voucher Accordion List", keys: ["A"] },
    { label: "Override Target Ledger", keys: ["L"] },
    { label: "Set Invoice Billing Date", keys: ["D"] },
    { label: "Toggle CGST / SGST / IGST", keys: ["C", "S", "I"] },
    { label: "Dismiss Dialogs", keys: ["Esc"] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-5 space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Keyboard size={16} className="text-indigo-500" />
            <h3 className="text-sm font-black uppercase tracking-wider">Sales Keyboard Shortcuts</h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5 last:border-none">
              <span className="text-slate-500 dark:text-slate-400">{s.label}</span>
              <div className="flex items-center gap-1 font-mono">
                {s.keys.map((k, kIdx) => (
                  <span key={kIdx}>
                    {k === "or" ? (
                      <span className="text-slate-400 text-[10px] px-0.5">or</span>
                    ) : (
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10">
                        {k}
                      </kbd>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button 
          type="button"
          onClick={onClose}
          className="cursor-pointer w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors hover:bg-slate-800"
        >
          Got It
        </button>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;