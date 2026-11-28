import React from "react";
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Scale,
  Smartphone,
  Briefcase,
} from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.abs(amount || 0)
  );
};

const HistorySummaryCard = ({
  currentWalletObj,
  selectedMonthName,
  selectionSummary,
}) => {
  const isSurplus = selectionSummary.netDelta >= 0;
  const isAllWallets = currentWalletObj?.isGeneralPool;
  const isVirtual = selectionSummary.isVirtualWallet;

  return (
    <div className="-mx-4 sm:mx-0 sm:w-full rounded-none sm:rounded-2xl bg-white dark:bg-[#1A1C20] border-y border-x-0 sm:border border-stone-200/80 dark:border-white/[0.07] sm:shadow-2xs overflow-hidden">
      <div className="px-4 py-4.5 sm:px-6 sm:py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* LEFT: Active Account Identity & Current Reserve */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-700/10 dark:bg-[#4EA885]/15 text-emerald-700 dark:text-[#68C19D]">
            {isAllWallets ? (
              <Briefcase size={18} strokeWidth={2.2} />
            ) : isVirtual ? (
              <Smartphone size={18} strokeWidth={2.2} />
            ) : (
              <Wallet size={18} strokeWidth={2.2} />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                style={{ fontFamily: "'Lora', serif" }}
                className="text-base sm:text-lg font-bold tracking-tight text-stone-950 dark:text-stone-50 truncate"
              >
                {currentWalletObj?.walletName}
              </span>
              <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 dark:bg-white/[0.06] text-stone-600 dark:text-stone-300 shrink-0">
                {isVirtual
                  ? "Digital Channel"
                  : isAllWallets
                  ? "Consolidated"
                  : "Cash Wallet"}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Current Balance:
              </span>
              <span
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                className="text-sm sm:text-base font-bold text-emerald-700 dark:text-[#68C19D] tabular-nums"
              >
                {isVirtual
                  ? "Digital Sync"
                  : `₹${formatINR(selectionSummary.currentBalance)}`}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Period Flow Metrics (Outflow -> Inflow -> Net Shift) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-4 sm:gap-7 pt-3.5 lg:pt-0 border-t lg:border-t-0 border-stone-100 dark:border-white/[0.06]">
          {/* Outflow Metric */}
          <div className="flex flex-col min-w-22.5">
            <div className="flex items-center gap-1 text-rose-700 dark:text-[#F09BA3]">
              <ArrowDownRight size={13} strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-[0.1em]">
                Spent
              </span>
            </div>
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-base sm:text-lg font-bold text-rose-700 dark:text-[#F09BA3] tabular-nums mt-0.5"
            >
              ₹{formatINR(selectionSummary.periodSpent)}
            </span>
            <span className="text-[10.5px] font-medium text-stone-500 dark:text-stone-400 truncate">
              {selectedMonthName} debits
            </span>
          </div>

          <div className="w-px h-9 bg-stone-200 dark:bg-white/[0.08] shrink-0" />

          {/* Inflow Metric */}
          <div className="flex flex-col min-w-22.5">
            <div className="flex items-center gap-1 text-emerald-700 dark:text-[#68C19D]">
              <ArrowUpRight size={13} strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-[0.1em]">
                Top-Ups
              </span>
            </div>
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-base sm:text-lg font-bold text-emerald-700 dark:text-[#68C19D] tabular-nums mt-0.5"
            >
              ₹{formatINR(selectionSummary.periodTopUp)}
            </span>
            <span className="text-[10.5px] font-medium text-stone-500 dark:text-stone-400 truncate">
              {selectedMonthName} deposits
            </span>
          </div>

          <div className="w-px h-9 bg-stone-200 dark:bg-white/[0.08] shrink-0" />

          {/* Net Period Shift */}
          <div className="flex flex-col min-w-25">
            <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400">
              <Scale size={13} strokeWidth={2.2} />
              <span className="text-[10px] font-bold uppercase tracking-[0.1em]">
                Net Delta
              </span>
            </div>
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className={`text-base sm:text-lg font-bold tabular-nums mt-0.5 ${
                isSurplus
                  ? "text-emerald-700 dark:text-[#68C19D]"
                  : "text-amber-700 dark:text-amber-400"
              }`}
            >
              {isSurplus ? "+" : "-"}₹{formatINR(selectionSummary.netDelta)}
            </span>
            <span
              className={`text-[10.5px] font-semibold ${
                isSurplus
                  ? "text-emerald-700/80 dark:text-[#68C19D]/80"
                  : "text-amber-700/80 dark:text-amber-400/80"
              }`}
            >
              {isSurplus ? "Surplus" : "Deficit"} ({selectionSummary.txCount} txs)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorySummaryCard;
