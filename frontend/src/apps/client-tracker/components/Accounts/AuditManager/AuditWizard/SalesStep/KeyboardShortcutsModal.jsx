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
      <div className="bg-white dark:bg-[#161B26] w-full max-w-md rounded-lg shadow-2xl border border-slate-200 dark:border-slate-800/80 p-5 space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Keyboard size={16} className="text-sky-500 dark:text-sky-400" />
            <h3 className="sora-font text-sm font-bold uppercase tracking-wider">Sales Keyboard Shortcuts</h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="cursor-pointer p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-none">
              <span className="text-slate-500 dark:text-slate-400">{s.label}</span>
              <div className="flex items-center gap-1 font-mono">
                {s.keys.map((k, kIdx) => (
                  <span key={kIdx}>
                    {k === "or" ? (
                      <span className="text-slate-400 text-[10px] px-0.5">or</span>
                    ) : (
                      <kbd className="px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-[#1C2230] text-[10px] font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80">
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
          className="cursor-pointer w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          Got It
        </button>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;