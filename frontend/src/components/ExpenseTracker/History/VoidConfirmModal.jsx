import React from "react";
import { AlertTriangle } from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.abs(amount || 0)
  );
};

const VoidConfirmModal = ({ target, onClose, onConfirm }) => {
  if (!target) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-[#0B1120] rounded-xl border-2 border-rose-500/30 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 p-5 text-left">
        <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 border border-rose-200 dark:border-rose-500/20 shadow-xs">
          <AlertTriangle size={20} strokeWidth={2.5} />
        </div>

        <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
          Void Transaction
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
          Are you sure you want to delete this record? This action reverses the entry and reconciles connected balances.
        </p>

        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-lg mb-4">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs font-black text-slate-900 dark:text-white truncate">
              {target.subCategory || target.category?.label || "Transaction"}
            </span>
            <span className="text-sm font-mono font-[1000] text-rose-600 dark:text-rose-400">
              ₹{formatINR(target.amount)}
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 truncate">
            Wallet: {target.sourceWallet?.walletName}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg font-bold uppercase text-xs tracking-wider bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 rounded-lg font-bold uppercase text-xs tracking-wider bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer outline-none"
          >
            Confirm Void
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoidConfirmModal;