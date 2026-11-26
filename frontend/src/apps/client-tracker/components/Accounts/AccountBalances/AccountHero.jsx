import React from "react";
import { ArrowUpRight, ArrowDownRight, X, Plus, Activity } from "lucide-react";

const AccountHero = ({
  currentTotal = 0,
  growth = 0,
  latestDate,
  isEntryOpen,
  setIsEntryOpen,
  editingId,
}) => {
  const isPositive = growth >= 0;

  const displayTotal = currentTotal / 100000;
  const displayGrowth = Math.abs(growth) / 100000;

  const formatValue = (val) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formattedDate = latestDate
    ? new Date(latestDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="w-full pb-8 border-b border-slate-200 dark:border-slate-800/80 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
      {/* Left: Liquidity Core */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-200/70 dark:border-sky-500/20">
            <Activity size={12} strokeWidth={2.5} />
            Net Liquidity
          </span>
          {formattedDate && (
            <>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                As of {formattedDate}
              </span>
            </>
          )}
        </div>

        <div className="flex items-baseline gap-2.5">
          <h2 className="sora-font text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums leading-none">
            ₹{formatValue(displayTotal)}
          </h2>
          <span className="sora-font text-sm sm:text-base font-medium text-sky-600 dark:text-sky-300">
            Lakhs
          </span>
        </div>

        <div className="flex items-center gap-2.5 pt-0.5">
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold tabular-nums border ${
              isPositive
                ? "bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/25"
                : "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/25"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={14} strokeWidth={2.5} />
            ) : (
              <ArrowDownRight size={14} strokeWidth={2.5} />
            )}
            <span>
              {isPositive ? "+" : "-"}₹{formatValue(displayGrowth)}L
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            vs. previous snapshot
          </span>
        </div>
      </div>

      {/* Right: Primary Command Action */}
      <div className="w-full lg:w-auto shrink-0">
        <button
          onClick={setIsEntryOpen}
          className={`w-full lg:w-auto px-5 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 outline-none cursor-pointer select-none ${
            isEntryOpen
              ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 border border-slate-700"
              : "bg-sky-600 hover:bg-sky-500 text-white shadow-xs active:scale-[0.99]"
          }`}
        >
          {isEntryOpen ? (
            <X size={15} strokeWidth={2.5} />
          ) : (
            <Plus size={15} strokeWidth={2.5} />
          )}
          <span>
            {editingId
              ? "Cancel Edit"
              : isEntryOpen
                ? "Close Panel"
                : "Record Balances"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default AccountHero;