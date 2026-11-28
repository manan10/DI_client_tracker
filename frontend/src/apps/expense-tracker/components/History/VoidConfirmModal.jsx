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
    <div
      style={{ fontFamily: "'Nunito Sans', sans-serif" }}
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-[#1A1C20] rounded-2xl border border-stone-200/90 dark:border-white/[0.08] shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 p-6 text-left">
        <div className="w-10 h-10 rounded-xl bg-rose-700/[0.09] dark:bg-[#E88D96]/15 text-rose-700 dark:text-[#F09BA3] flex items-center justify-center mb-3.5">
          <AlertTriangle size={20} strokeWidth={2.2} />
        </div>

        <h3
          style={{ fontFamily: "'Lora', serif" }}
          className="text-lg font-bold tracking-tight text-stone-950 dark:text-stone-50 mb-1"
        >
          Void Transaction
        </h3>
        <p className="text-xs font-medium text-stone-500 dark:text-stone-400 leading-relaxed mb-4">
          Are you sure you want to delete this record? This action reverses the
          entry and reconciles connected wallet balances.
        </p>

        <div className="p-3.5 bg-[#FAF9F6] dark:bg-[#16181C] border border-stone-200/80 dark:border-white/[0.07] rounded-xl mb-5">
          <div className="flex justify-between items-baseline mb-1 gap-2">
            <span
              style={{ fontFamily: "'Lora', serif" }}
              className="text-sm font-bold tracking-tight text-stone-950 dark:text-stone-50 truncate"
            >
              {target.subCategory || target.category?.label || "Transaction"}
            </span>
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-sm font-bold text-rose-700 dark:text-[#F09BA3] tabular-nums shrink-0"
            >
              ₹{formatINR(target.amount)}
            </span>
          </div>
          <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 truncate">
            Account: {target.sourceWallet?.walletName || "Direct Spend"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="h-10.5 rounded-xl font-bold uppercase text-xs tracking-wider bg-stone-100 hover:bg-stone-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-stone-700 dark:text-stone-200 transition-colors cursor-pointer outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10.5 rounded-xl font-bold uppercase text-xs tracking-wider bg-rose-700 hover:bg-rose-800 text-white shadow-2xs transition-colors cursor-pointer outline-none"
          >
            Confirm Void
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoidConfirmModal;
