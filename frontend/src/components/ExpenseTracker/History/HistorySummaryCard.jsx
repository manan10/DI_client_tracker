import React from "react";
import { Wallet } from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.abs(amount || 0)
  );
};

const HistorySummaryCard = ({
  currentWalletObj,
  selectedMonthName,
  selectedYear,
  selectionSummary,
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-teal-500/10 via-slate-50 to-indigo-500/10 dark:from-teal-500/15 dark:via-[#0B1120] dark:to-indigo-500/15 border-2 border-teal-200/80 dark:border-teal-500/30 shadow-2xs flex flex-col gap-3.5">
      {/* Card Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-teal-200/60 dark:border-white/10 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-md bg-teal-600 text-white shadow-2xs">
            <Wallet size={14} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-teal-950 dark:text-teal-200 truncate">
            {currentWalletObj?.walletName} Overview • {selectedMonthName} {selectedYear}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-500/20 px-2 py-0.5 rounded-md border border-teal-300 dark:border-teal-500/30">
            {selectionSummary.isVirtualWallet ? "Online Channel" : "Physical Vault"}
          </span>
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-300 dark:border-indigo-500/30">
            {selectionSummary.txCount} Logged Entries
          </span>
        </div>
      </div>

      {/* 4-Column Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Metric 1: Reserve Balance */}
        <div className="flex flex-col p-2.5 rounded-lg bg-white/90 dark:bg-[#0B1120] border border-teal-200/80 dark:border-teal-500/30">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            Reserve Balance
          </span>
          <span className="text-base sm:text-lg font-mono font-[1000] text-teal-700 dark:text-teal-300 tabular-nums mt-0.5">
            {selectionSummary.isVirtualWallet
              ? "LIVE SYNC"
              : `₹${formatINR(selectionSummary.currentBalance)}`}
          </span>
          <span className="text-[8px] font-mono text-slate-400 truncate mt-0.5">
            {currentWalletObj?.isGeneralPool ? "Total liquid vault cash" : "Account balance"}
          </span>
        </div>

        {/* Metric 2: Scoped Outflow */}
        <div className="flex flex-col p-2.5 rounded-lg bg-white/90 dark:bg-[#0B1120] border border-rose-200/80 dark:border-rose-500/30">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            Scoped Outflow
          </span>
          <span className="text-base sm:text-lg font-mono font-[1000] text-rose-600 dark:text-rose-400 tabular-nums mt-0.5">
            ₹{formatINR(selectionSummary.periodSpent)}
          </span>
          <span className="text-[8px] font-mono text-slate-400 truncate mt-0.5">
            Money spent from channel
          </span>
        </div>

        {/* Metric 3: Scoped Inflow */}
        <div className="flex flex-col p-2.5 rounded-lg bg-white/90 dark:bg-[#0B1120] border border-emerald-200/80 dark:border-emerald-500/30">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Scoped Inflow
          </span>
          <span className="text-base sm:text-lg font-mono font-[1000] text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
            ₹{formatINR(selectionSummary.periodTopUp)}
          </span>
          <span className="text-[8px] font-mono text-slate-400 truncate mt-0.5">
            Funds deposited to channel
          </span>
        </div>

        {/* Metric 4: Net Shift */}
        <div className="flex flex-col p-2.5 rounded-lg bg-white/90 dark:bg-[#0B1120] border border-indigo-200/80 dark:border-indigo-500/30">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
            Net Period Shift
          </span>
          <span
            className={`text-base sm:text-lg font-mono font-[1000] tabular-nums mt-0.5 ${
              selectionSummary.netDelta >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {selectionSummary.netDelta >= 0 ? "+" : "-"}₹{formatINR(selectionSummary.netDelta)}
          </span>
          <span className="text-[8px] font-mono text-slate-400 truncate mt-0.5">
            {selectionSummary.netDelta >= 0 ? "Surplus flow" : "Deficit shift"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HistorySummaryCard;