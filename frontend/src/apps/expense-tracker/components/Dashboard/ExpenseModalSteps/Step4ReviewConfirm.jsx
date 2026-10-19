import React from "react";
import {
  ArrowLeft,
  Globe,
  Wallet,
  Check,
  AlertTriangle,
  ArrowRight,
  Layers,
  RefreshCw,
} from "lucide-react";

export const Step4ReviewConfirm = ({
  isEditMode,
  currentCategoryMeta,
  currentWallet,
  expenseData,
  setExpenseData,
  handleFinalSubmit,
  loading,
  onPrev,
}) => {
  const expenseAmount = Number(expenseData.amount || 0);
  const currentBalance = Number(currentWallet?.balance || 0);
  const isVirtual = Boolean(currentWallet?.isVirtual);

  // In edit mode, determine the baseline original amount
  // (falls back to initial amount snapshot if passed, otherwise expenseAmount)
  const originalAmount = Number(
    expenseData._originalAmount !== undefined
      ? expenseData._originalAmount
      : expenseAmount,
  );

  // Delta math:
  // In CREATE mode: wallet decreases by expenseAmount
  // In EDIT mode: wallet changes by (originalAmount - newExpenseAmount)
  const balanceDelta = isEditMode
    ? originalAmount - expenseAmount
    : -expenseAmount;

  const projectedBalance = isEditMode
    ? currentBalance + balanceDelta
    : currentBalance - expenseAmount;

  const isOverdrawn = !isVirtual && projectedBalance < 0;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-150 text-left font-sans">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <button
          type="button"
          onClick={onPrev}
          disabled={loading}
          className="p-1 -ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md disabled:opacity-50 cursor-pointer font-sans"
          title="Back to Categories"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex flex-col min-w-0">
          <h2 className="font-serif text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
            {isEditMode ? (
              <>
                Review <span className="italic font-normal text-emerald-600 dark:text-emerald-400">Modification</span>
              </>
            ) : (
              <>
                Review <span className="italic font-normal text-emerald-600 dark:text-emerald-400">Expense</span>
              </>
            )}
          </h2>
          <p className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {isEditMode ? "Confirm transaction updates" : "Verify details before committing"}
          </p>
        </div>
      </div>

      {/* Main Receipt Summary Card */}
      <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/10 space-y-3.5 font-sans">
        {/* Top: Category Hierarchy & Outflow Amount */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-200 dark:border-white/10 gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <span className="font-sans text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
              Classification
            </span>

            {/* Sub-Category */}
            <p className="font-serif text-sm sm:text-base font-semibold tracking-tight text-slate-900 dark:text-white truncate">
              {currentCategoryMeta?.subLabel || "Misc Expense"}
            </p>

            {/* Parent Category Badge */}
            {currentCategoryMeta?.parentLabel && (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-white/10">
                <Layers size={11} className="text-emerald-500" />
                <span className="font-sans text-[10px] font-bold uppercase tracking-wider truncate max-w-44">
                  {currentCategoryMeta.parentLabel}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end shrink-0">
            <span className="font-sans text-[9px] font-bold uppercase tracking-wider text-rose-500">
              {isEditMode ? "Updated Total" : "Debit Outflow"}
            </span>
            <p className="font-sans text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-rose-600 dark:text-rose-400">
              <span className="font-serif italic font-normal mr-0.5">₹</span>
              {expenseAmount.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Middle: Account Details & Balance Pipeline */}
        <div className="space-y-2 pt-1 font-sans text-xs">
          {/* Account Channel */}
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Channel
            </span>
            <div className="flex items-center gap-1.5 font-sans font-semibold text-slate-900 dark:text-white">
              {isVirtual ? (
                <Globe size={13} className="text-indigo-500" />
              ) : (
                <Wallet size={13} className="text-emerald-500" />
              )}
              <span>{currentWallet?.walletName || "Direct"}</span>
              <span className="font-sans text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-sm bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {isVirtual ? "Digital" : "Cash"}
              </span>
            </div>
          </div>

          {/* Balance Shift Section */}
          {!isVirtual ? (
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-white/5">
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isEditMode ? "Net Balance Shift" : "Balance Shift"}
              </span>

              {isEditMode ? (
                balanceDelta === 0 ? (
                  /* No amount change in edit mode */
                  <div className="flex items-center gap-1.5 font-sans text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="tabular-nums">
                      <span className="font-serif italic font-normal mr-0.5">₹</span>
                      {currentBalance.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[9px] font-sans font-bold uppercase px-1.5 py-0.5 rounded-sm bg-slate-200 dark:bg-slate-800 text-slate-500">
                      Unchanged
                    </span>
                  </div>
                ) : (
                  /* Dynamic delta adjustment */
                  <div className="flex items-center gap-2 font-sans font-bold text-xs sm:text-sm">
                    <span className="text-slate-400 line-through tabular-nums">
                      <span className="font-serif italic font-normal mr-0.5">₹</span>
                      {currentBalance.toLocaleString("en-IN")}
                    </span>
                    <ArrowRight size={12} className="text-slate-400" />
                    <span
                      className={`tabular-nums ${
                        isOverdrawn
                          ? "text-rose-600 dark:text-rose-400 font-black"
                          : balanceDelta > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      <span className="font-serif italic font-normal mr-0.5">₹</span>
                      {projectedBalance.toLocaleString("en-IN")}
                    </span>
                    <span
                      className={`text-[9px] font-sans font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                        balanceDelta > 0
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                      }`}
                    >
                      {balanceDelta > 0
                        ? `+₹${balanceDelta.toLocaleString("en-IN")}`
                        : `-₹${Math.abs(balanceDelta).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                )
              ) : (
                /* Standard Create Mode Shift */
                <div className="flex items-center gap-2 font-sans font-bold text-xs sm:text-sm">
                  <span className="text-slate-500 line-through tabular-nums">
                    <span className="font-serif italic font-normal mr-0.5">₹</span>
                    {currentBalance.toLocaleString("en-IN")}
                  </span>
                  <ArrowRight size={12} className="text-slate-400" />
                  <span
                    className={`tabular-nums ${
                      isOverdrawn
                        ? "text-rose-600 dark:text-rose-400 font-black"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    <span className="font-serif italic font-normal mr-0.5">₹</span>
                    {projectedBalance.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-white/5">
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Balance Status
              </span>
              <span className="font-sans text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/20">
                Live Gateway Sync
              </span>
            </div>
          )}
        </div>

        {/* Overdrawn Balance Warning Alert */}
        {isOverdrawn && (
          <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg text-amber-800 dark:text-amber-300 text-xs font-sans">
            <AlertTriangle
              size={14}
              className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400"
            />
            <span className="leading-snug text-[11px] font-medium font-sans">
              This modification exceeds the current available cash balance by{" "}
              <strong className="font-bold">
                <span className="font-serif italic font-normal mr-0.5">₹</span>
                {Math.abs(projectedBalance).toLocaleString("en-IN")}
              </strong>.
            </span>
          </div>
        )}
      </div>

      {/* Comments / Description Input */}
      <div className="space-y-1.5 pt-1 font-sans">
        <label className="font-sans text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Comments / Remarks
        </label>
        <textarea
          rows="2"
          placeholder="Add transaction remarks or receipt details..."
          className="w-full bg-white dark:bg-[#0B1120] p-3 rounded-lg font-sans text-xs sm:text-sm text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-white/10 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all no-scrollbar placeholder:text-slate-400 dark:placeholder:text-slate-600"
          value={expenseData.description || ""}
          onChange={(e) =>
            setExpenseData((prev) => ({ ...prev, description: e.target.value }))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleFinalSubmit(e);
            } else if (e.key === "Backspace" && !expenseData.description) {
              onPrev();
            }
          }}
        />
      </div>

      {/* Final Submit Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleFinalSubmit}
          disabled={loading}
          className="w-full text-white h-12 rounded-lg font-sans font-bold uppercase text-xs tracking-wider shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 transition-all disabled:opacity-50 outline-none bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-600 dark:focus-visible:ring-offset-[#0B1120] cursor-pointer"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
          ) : (
            <>
              {isEditMode ? (
                <>
                  Update Expense <RefreshCw size={15} strokeWidth={2.5} />
                </>
              ) : (
                <>
                  Confirm & Save Expense <Check size={16} strokeWidth={3} />
                </>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Step4ReviewConfirm;