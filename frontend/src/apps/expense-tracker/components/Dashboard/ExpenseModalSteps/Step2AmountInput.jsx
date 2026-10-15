import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const Step2AmountInput = ({
  isEditMode,
  currentWallet,
  expenseData,
  amountInputRef,
  formatDisplayAmount,
  handleAmountChange,
  onPrev,
  onNext,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-150">
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={onPrev}
          className="p-1 -ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md cursor-pointer"
          title="Back to Wallet Selection"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex flex-col min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
            Expense Amount
          </h2>
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest truncate">
            From wallet: {currentWallet?.walletName}
          </p>
        </div>
      </div>

      <div className="relative border-b border-slate-200 dark:border-white/10 focus-within:border-emerald-500 transition-colors pt-2">
        <span className="absolute left-0 bottom-3 text-2xl font-bold text-slate-400 dark:text-slate-600">
          ₹
        </span>
        <input
          ref={amountInputRef}
          type="text"
          inputMode="numeric"
          placeholder="0"
          className="w-full bg-transparent pb-3 pl-8 text-3xl sm:text-4xl font-bold tabular-nums text-slate-900 dark:text-white outline-none placeholder:text-slate-200 dark:placeholder:text-slate-800"
          value={formatDisplayAmount(expenseData.amount)}
          onChange={handleAmountChange}
          onWheel={(e) => e.target.blur()}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
            } else if (
              e.key === "Enter" &&
              expenseData.amount &&
              Number(expenseData.amount) > 0
            ) {
              e.preventDefault();
              onNext();
            } else if (e.key === "Backspace" && !expenseData.amount && !isEditMode) {
              onPrev();
            }
          }}
        />
      </div>

      <div className="pt-2">
        <button
          type="button"
          disabled={!expenseData.amount || Number(expenseData.amount) <= 0}
          onClick={onNext}
          className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-30 transition-all shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
        >
          {isEditMode ? "Update Details" : "Proceed"}{" "}
          <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};