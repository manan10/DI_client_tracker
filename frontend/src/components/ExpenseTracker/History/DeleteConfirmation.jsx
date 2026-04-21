import React from "react";
import { AlertTriangle, X, CornerDownRight } from "lucide-react";

const DeleteConfirmation = ({ target, onClose, onConfirm }) => {
  if (!target) return null;

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#020617] rounded-4xl border border-slate-100 dark:border-slate-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Warning Accent Bar */}
        <div className="h-1.5 w-full bg-rose-500" />

        <div className="p-8 sm:p-10 text-left">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <AlertTriangle size={24} strokeWidth={2.5} />
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Title & Description */}
          <div className="space-y-3 mb-10">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none italic">
              Void Transaction
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              You are about to remove this entry from the permanent ledger. This action will trigger a balance reconciliation.
            </p>
          </div>

          {/* Audit Details Box */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 mb-8 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Entry Description</span>
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                -₹{target.amount?.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase truncate">
              {target.description || target.category?.label}
            </p>
            
            <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center gap-2">
              <CornerDownRight size={12} className="text-emerald-500" />
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                Refund to: <span className="text-emerald-500">{target.sourceWallet?.walletName}</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              Abort
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-rose-500 rounded-xl shadow-lg shadow-rose-500/20 hover:bg-rose-600 active:scale-95 transition-all cursor-pointer"
            >
              Confirm Void
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;