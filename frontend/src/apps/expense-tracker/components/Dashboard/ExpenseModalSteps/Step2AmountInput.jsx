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
      <div className="flex items-center gap-2.5 mb-2">
        <button
          type="button"
          onClick={onPrev}
          className="p-1.5 -ml-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-white/[0.06] transition-colors outline-none rounded-lg cursor-pointer"
          title="Back to Wallet Selection"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex flex-col min-w-0">
          <h2
            style={{ fontFamily: "'Lora', serif" }}
            className="text-lg font-bold tracking-tight text-stone-950 dark:text-stone-50 leading-tight"
          >
            Expense Amount
          </h2>
          <p className="text-[10.5px] font-bold text-emerald-700 dark:text-[#68C19D] uppercase tracking-wider truncate mt-0.5">
            From: {currentWallet?.walletName}
          </p>
        </div>
      </div>

      <div className="relative border-b border-stone-200 dark:border-white/[0.09] focus-within:border-emerald-700 dark:focus-within:border-[#4EA885] transition-colors pt-2">
        <span
          style={{ fontFamily: "'Lora', serif" }}
          className="absolute left-0 bottom-3 text-2xl font-bold text-stone-400 dark:text-stone-500"
        >
          ₹
        </span>
        <input
          ref={amountInputRef}
          type="text"
          inputMode="numeric"
          placeholder="0"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="w-full bg-transparent pb-3 pl-7 text-3xl sm:text-4xl font-bold tabular-nums text-stone-950 dark:text-stone-50 outline-none placeholder:text-stone-300 dark:placeholder:text-stone-700"
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
            } else if (
              e.key === "Backspace" &&
              !expenseData.amount &&
              !isEditMode
            ) {
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
          className="w-full h-12 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-950 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-30 transition-all shadow-2xs outline-none cursor-pointer"
        >
          {isEditMode ? "Update Details" : "Proceed"}{" "}
          <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
