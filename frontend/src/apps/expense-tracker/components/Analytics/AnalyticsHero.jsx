import React from "react";
import { Landmark, Zap, RefreshCw, ArrowDownRight } from "lucide-react";

const formatINR = (num) => new Intl.NumberFormat("en-IN").format(num || 0);

const AnalyticsHero = ({ data, loading, onRefresh, isRefreshing }) => {
  const physical = (data?.walletWise?.filter((w) => !w.isVirtual) || []).sort(
    (a, b) => b.monthSpend - a.monthSpend,
  );

  const digital = (data?.walletWise?.filter((w) => w.isVirtual) || []).sort(
    (a, b) => b.monthSpend - a.monthSpend,
  );

  const totalSpend = data?.aggregated?.monthNetSpend || 0;

  return (
    <div
      className={`w-full min-w-0 font-sans transition-opacity duration-300 ${
        loading ? "opacity-40 blur-xs pointer-events-none" : "opacity-100"
      }`}
    >
      {/* 1. TOP METRICS STRIP: Clean, borderless overview */}
      <div className="pb-8 border-b border-slate-200 dark:border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          
          {/* Main Total Spent Metric */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Spent This Month
              </span>
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors disabled:opacity-50 cursor-pointer outline-none ml-2"
              >
                <RefreshCw
                  size={12}
                  className={isRefreshing ? "animate-spin text-emerald-600" : ""}
                />
                <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
              </button>
            </div>
            
            {/* Even, modern numeral display */}
            <div className="flex items-baseline gap-1 text-slate-900 dark:text-white">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold text-emerald-700 dark:text-emerald-400">
                ₹
              </span>
              <span className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight tabular-nums truncate">
                {formatINR(totalSpend)}
              </span>
            </div>
          </div>

          {/* Sub-Metric Columns */}
          <div className="flex flex-wrap items-center gap-8 sm:gap-14 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-white/5">
            {/* Cash in Hand */}
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Cash in Hand
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-sans font-bold text-emerald-700 dark:text-emerald-400">₹</span>
                <span className="text-2xl sm:text-3xl font-sans font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {formatINR(data?.aggregated?.totalCashBalance)}
                </span>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

            {/* Spent This Year */}
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Spent This Year (YTD)
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-sans font-bold text-indigo-600 dark:text-indigo-400">₹</span>
                <span className="text-2xl sm:text-3xl font-sans font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {formatINR(data?.aggregated?.yearNetSpend)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. WALLETS BREAKDOWN: Continuous ledger format */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 pt-8">
        
        {/* Cash Wallets */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <Landmark size={14} />
              </div>
              <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Cash Accounts
              </h3>
            </div>
            <span className="text-xs font-sans font-semibold text-emerald-700 dark:text-emerald-400">
              {physical.length} accounts
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {physical.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 italic">
                No cash spent this month.
              </div>
            ) : (
              physical.map((w, i) => (
                <div
                  key={w._id || i}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-white/[0.02] px-1 rounded-md transition-colors"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-sans font-bold text-slate-900 dark:text-white truncate">
                      {w.name}
                    </span>
                    <span className="text-[11px] font-sans font-medium text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                      {w.user || "Personal"}
                    </span>
                  </div>

                  <div className="text-right flex items-baseline gap-3 shrink-0">
                    <span className="text-sm font-sans font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                      ₹{formatINR(w.monthSpend)}
                    </span>
                    <span className="text-[11px] font-sans font-semibold text-emerald-700 dark:text-emerald-400 w-12 text-right tabular-nums flex items-center justify-end gap-0.5">
                      <ArrowDownRight size={11} className="shrink-0" />
                      {((w.monthSpend / (totalSpend || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Digital & Bank Wallets */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Zap size={14} />
              </div>
              <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Bank & Online Wallets
              </h3>
            </div>
            <span className="text-xs font-sans font-semibold text-indigo-600 dark:text-indigo-400">
              {digital.length} accounts
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {digital.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 italic">
                No online or bank spending this month.
              </div>
            ) : (
              digital.map((w, i) => (
                <div
                  key={w._id || i}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-white/[0.02] px-1 rounded-md transition-colors"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-sans font-bold text-slate-900 dark:text-white truncate">
                      {w.name}
                    </span>
                    <span className="text-[11px] font-sans font-medium text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                      {w.user || "Personal"}
                    </span>
                  </div>

                  <div className="text-right flex items-baseline gap-3 shrink-0">
                    <span className="text-sm font-sans font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                      ₹{formatINR(w.monthSpend)}
                    </span>
                    <span className="text-[11px] font-sans font-semibold text-indigo-600 dark:text-indigo-400 w-12 text-right tabular-nums flex items-center justify-end gap-0.5">
                      <ArrowDownRight size={11} className="shrink-0" />
                      {((w.monthSpend / (totalSpend || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsHero;