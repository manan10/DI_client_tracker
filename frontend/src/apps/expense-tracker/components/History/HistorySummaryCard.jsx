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
    <div className="w-full bg-white dark:bg-[#0B1120] border-2 border-slate-200/90 dark:border-white/10 rounded-xl shadow-xs overflow-hidden">
      {/* Top Accent Strip */}
      <div className="h-1 w-full bg-linear-to-r from-teal-500 via-indigo-500 to-emerald-500" />

      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        
        {/* LEFT: Active Account Identity & Current Reserve */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border-2 shadow-xs ${
              isAllWallets
                ? "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-white/10"
                : isVirtual
                ? "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30"
                : "bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/30"
            }`}
          >
            {isAllWallets ? (
              <Briefcase size={20} strokeWidth={2.5} />
            ) : isVirtual ? (
              <Smartphone size={20} strokeWidth={2.5} />
            ) : (
              <Wallet size={20} strokeWidth={2.5} />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                {currentWalletObj?.walletName}
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 shrink-0">
                {isVirtual ? "Online Node" : isAllWallets ? "Consolidated" : "Cash Vault"}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Current Balance:
              </span>
              <span className="text-sm sm:text-base font-mono font-[1000] text-teal-600 dark:text-teal-400 tabular-nums">
                {isVirtual ? "Live Synced" : `₹${formatINR(selectionSummary.currentBalance)}`}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Period Flow Metrics (Outflow -> Inflow -> Net Shift) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-3 sm:gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-white/5">
          
          {/* Outflow Metric */}
          <div className="flex flex-col min-w-22.5">
            <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <ArrowDownRight size={13} strokeWidth={2.5} />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                Wallet Spend
              </span>
            </div>
            <span className="text-base sm:text-lg font-mono font-[1000] text-rose-600 dark:text-rose-400 tabular-nums mt-0.5">
              ₹{formatINR(selectionSummary.periodSpent)}
            </span>
            <span className="text-[9px] font-mono text-slate-400 truncate">
              {selectedMonthName} debits
            </span>
          </div>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 shrink-0" />

          {/* Inflow Metric */}
          <div className="flex flex-col min-w-22.5">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight size={13} strokeWidth={2.5} />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                Wallet Top-Ups
              </span>
            </div>
            <span className="text-base sm:text-lg font-mono font-[1000] text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              ₹{formatINR(selectionSummary.periodTopUp)}
            </span>
            <span className="text-[9px] font-mono text-slate-400 truncate">
              {selectedMonthName} deposits
            </span>
          </div>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 shrink-0" />

          {/* Net Period Shift */}
          <div className="flex flex-col min-w-25">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Scale size={13} strokeWidth={2.5} />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                Net Difference
              </span>
            </div>
            <span
              className={`text-base sm:text-lg font-mono font-[1000] tabular-nums mt-0.5 ${
                isSurplus
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {isSurplus ? "+" : "-"}₹{formatINR(selectionSummary.netDelta)}
            </span>
            <span
              className={`text-[9px] font-mono font-bold uppercase ${
                isSurplus ? "text-emerald-600/80" : "text-amber-600/80"
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