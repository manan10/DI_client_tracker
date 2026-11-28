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

  const originalAmount = Number(
    expenseData._originalAmount !== undefined
      ? expenseData._originalAmount
      : expenseAmount
  );

  const balanceDelta = isEditMode
    ? originalAmount - expenseAmount
    : -expenseAmount;

  const projectedBalance = isEditMode
    ? currentBalance + balanceDelta
    : currentBalance - expenseAmount;

  const isOverdrawn = !isVirtual && projectedBalance < 0;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-150 text-left">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1">
        <button
          type="button"
          onClick={onPrev}
          disabled={loading}
          className="p-1.5 -ml-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-white/[0.06] transition-colors outline-none rounded-lg disabled:opacity-50 cursor-pointer"
          title="Back to Categories"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex flex-col min-w-0">
          <h2
            style={{ fontFamily: "'Lora', serif" }}
            className="text-lg font-bold tracking-tight text-stone-950 dark:text-stone-50 leading-tight"
          >
            {isEditMode ? "Review Modification" : "Review Expense"}
          </h2>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.12em] mt-0.5">
            {isEditMode
              ? "Confirm transaction updates"
              : "Verify details before committing"}
          </p>
        </div>
      </div>

      {/* Main Receipt Summary Card */}
      <div className="p-4 sm:p-5 bg-[#FAF9F6] dark:bg-[#16181C] rounded-2xl border border-stone-200/80 dark:border-white/[0.07] space-y-3.5">
        {/* Top: Category Hierarchy & Outflow Amount */}
        <div className="flex justify-between items-start pb-3.5 border-b border-stone-200/80 dark:border-white/[0.07] gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-stone-400 block">
              Classification
            </span>

            <p
              style={{ fontFamily: "'Lora', serif" }}
              className="text-base font-bold tracking-tight text-stone-950 dark:text-stone-50 truncate"
            >
              {currentCategoryMeta?.subLabel || "Misc Expense"}
            </p>

            {currentCategoryMeta?.parentLabel && (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-white/[0.06] text-stone-700 dark:text-stone-200">
                <Layers
                  size={11}
                  className="text-emerald-700 dark:text-[#68C19D]"
                />
                <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-44">
                  {currentCategoryMeta.parentLabel}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end shrink-0">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-rose-700 dark:text-[#F09BA3]">
              {isEditMode ? "Updated Total" : "Debit Outflow"}
            </span>
            <p
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-rose-700 dark:text-[#F09BA3]"
            >
              <span
                style={{ fontFamily: "'Lora', serif" }}
                className="font-semibold mr-0.5"
              >
                ₹
              </span>
              {expenseAmount.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Middle: Account Details & Balance Pipeline */}
        <div className="space-y-2.5 pt-1 text-xs">
          <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">
              Channel
            </span>
            <div className="flex items-center gap-1.5 font-semibold text-stone-900 dark:text-stone-100">
              {isVirtual ? (
                <Globe
                  size={13}
                  className="text-emerald-700 dark:text-[#68C19D]"
                />
              ) : (
                <Wallet
                  size={13}
                  className="text-emerald-700 dark:text-[#68C19D]"
                />
              )}
              <span style={{ fontFamily: "'Lora', serif" }} className="font-bold">
                {currentWallet?.walletName || "Direct"}
              </span>
              <span className="text-[9.5px] font-bold uppercase px-1.5 py-0.2 rounded bg-stone-200/70 dark:bg-white/[0.06] text-stone-600 dark:text-stone-300">
                {isVirtual ? "Digital" : "Cash"}
              </span>
            </div>
          </div>

          {/* Balance Shift Section */}
          {!isVirtual ? (
            <div className="flex items-center justify-between text-stone-600 dark:text-stone-400 pt-2 border-t border-stone-200/70 dark:border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">
                {isEditMode ? "Net Balance Shift" : "Balance Shift"}
              </span>

              {isEditMode ? (
                balanceDelta === 0 ? (
                  <div
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300"
                  >
                    <span className="tabular-nums">
                      ₹{currentBalance.toLocaleString("en-IN")}
                    </span>
                    <span
                      style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                      className="text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-stone-200/70 dark:bg-white/[0.06] text-stone-500"
                    >
                      Unchanged
                    </span>
                  </div>
                ) : (
                  <div
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    className="flex items-center gap-2 font-bold text-xs sm:text-sm"
                  >
                    <span className="text-stone-400 line-through tabular-nums">
                      ₹{currentBalance.toLocaleString("en-IN")}
                    </span>
                    <ArrowRight size={12} className="text-stone-400" />
                    <span
                      className={`tabular-nums ${
                        isOverdrawn
                          ? "text-rose-700 dark:text-[#F09BA3] font-bold"
                          : balanceDelta > 0
                          ? "text-emerald-700 dark:text-[#68C19D]"
                          : "text-rose-700 dark:text-[#F09BA3]"
                      }`}
                    >
                      ₹{projectedBalance.toLocaleString("en-IN")}
                    </span>
                    <span
                      className={`text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        balanceDelta > 0
                          ? "bg-emerald-700/12 text-emerald-800 dark:bg-[#4EA885]/20 dark:text-[#86D4B4]"
                          : "bg-rose-700/10 text-rose-700 dark:bg-[#E88D96]/20 dark:text-[#F09BA3]"
                      }`}
                    >
                      {balanceDelta > 0
                        ? `+₹${balanceDelta.toLocaleString("en-IN")}`
                        : `-₹${Math.abs(balanceDelta).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                )
              ) : (
                <div
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="flex items-center gap-2 font-bold text-xs sm:text-sm"
                >
                  <span className="text-stone-500 line-through tabular-nums">
                    ₹{currentBalance.toLocaleString("en-IN")}
                  </span>
                  <ArrowRight size={12} className="text-stone-400" />
                  <span
                    className={`tabular-nums ${
                      isOverdrawn
                        ? "text-rose-700 dark:text-[#F09BA3] font-bold"
                        : "text-emerald-700 dark:text-[#68C19D]"
                    }`}
                  >
                    ₹{projectedBalance.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between text-stone-600 dark:text-stone-400 pt-2 border-t border-stone-200/70 dark:border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">
                Balance Status
              </span>
              <span className="text-[10px] font-bold text-emerald-800 dark:text-[#86D4B4] uppercase bg-emerald-700/10 dark:bg-[#4EA885]/18 px-2 py-0.5 rounded-md">
                Digital Channel
              </span>
            </div>
          )}
        </div>

        {/* Overdrawn Balance Warning Alert */}
        {isOverdrawn && (
          <div className="flex items-start gap-2 p-2.5 bg-amber-700/[0.08] dark:bg-amber-400/12 border border-amber-700/20 dark:border-amber-400/25 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
            <AlertTriangle
              size={14}
              className="shrink-0 mt-0.5 text-amber-700 dark:text-amber-400"
            />
            <span className="leading-snug text-[11px] font-medium">
              This modification exceeds the current available cash balance by{" "}
              <strong
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                className="font-bold"
              >
                ₹{Math.abs(projectedBalance).toLocaleString("en-IN")}
              </strong>
              .
            </span>
          </div>
        )}
      </div>

      {/* Comments / Description Input */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-[0.12em]">
          Comments / Remarks
        </label>
        <textarea
          rows="2"
          placeholder="Add transaction remarks or receipt details..."
          className="w-full bg-white dark:bg-[#16181C] p-3 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 outline-none border border-stone-200/90 dark:border-white/[0.08] focus:ring-2 focus:ring-emerald-700/15 dark:focus:ring-[#4EA885]/20 focus:border-emerald-700 dark:focus:border-[#4EA885] transition-all no-scrollbar placeholder:text-stone-400 dark:placeholder:text-stone-500"
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
      <div className="pt-1">
        <button
          type="button"
          onClick={handleFinalSubmit}
          disabled={loading}
          className="w-full text-white dark:text-[#121315] h-12 rounded-xl font-bold uppercase text-xs tracking-wider shadow-2xs active:scale-[0.98] flex items-center justify-center gap-2 transition-all disabled:opacity-50 outline-none bg-emerald-700 hover:bg-emerald-800 dark:bg-[#4EA885] dark:hover:bg-[#68C19D] cursor-pointer"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white dark:border-stone-900/30 dark:border-t-stone-900" />
          ) : (
            <>
              {isEditMode ? (
                <>
                  Update Expense <RefreshCw size={15} strokeWidth={2.5} />
                </>
              ) : (
                <>
                  Confirm &amp; Save Expense <Check size={16} strokeWidth={3} />
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
