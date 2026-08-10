import React from "react";
import { AlertTriangle, X, CornerDownRight } from "lucide-react";

const DeleteConfirmation = ({ target, onClose, onConfirm }) => {
  if (!target) return null;

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4 sm:p-6">
      {/* Cinematic Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 dark:bg-[#020617]/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Modal Container: Strict Geometry */}
      <div className="relative w-full max-w-[92%] sm:max-w-md bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Warning Accent Bar */}
        <div className="h-1.5 w-full bg-rose-500" />

        <div className="p-5 sm:p-8 text-left">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-5 sm:mb-6">
            <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-500 shrink-0">
              <AlertTriangle size={20} strokeWidth={2.5} />
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors active:scale-95 outline-none"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5 mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Void Transaction
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This action will permanently remove the entry and trigger a balance reconciliation across all connected nodes.
            </p>
          </div>

          {/* Audit Details Box */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-200 dark:border-white/5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ledger Entry</span>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                -₹{target.amount?.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {target.description || target.category?.label}
            </p>
            
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center gap-2">
              <CornerDownRight size={12} className="text-emerald-500 shrink-0" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
                Refund to: <span className="text-emerald-600 dark:text-emerald-400">{target.sourceWallet?.walletName}</span>
              </p>
            </div>
          </div>

          {/* Actions: Strict heights for consistent touch targets */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onClose}
              className="h-11 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all outline-none"
            >
              Abort
            </button>
            <button 
              onClick={onConfirm}
              className="h-11 text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 rounded-lg shadow-sm active:scale-[0.98] transition-all outline-none"
            >
              Confirm
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;