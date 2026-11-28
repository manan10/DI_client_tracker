import React from "react";
import { Landmark, Zap, RefreshCw, ArrowDownRight } from "lucide-react";

const formatINR = (num) => new Intl.NumberFormat("en-IN").format(num || 0);

const AnalyticsHero = ({ data, loading, onRefresh, isRefreshing }) => {
  const physical = (data?.walletWise?.filter((w) => !w.isVirtual) || []).sort(
    (a, b) => b.monthSpend - a.monthSpend
  );

  const digital = (data?.walletWise?.filter((w) => w.isVirtual) || []).sort(
    (a, b) => b.monthSpend - a.monthSpend
  );

  const totalSpend = data?.aggregated?.monthNetSpend || 0;
  const hasSpend = Number(totalSpend) > 0;

  return (
    <div
      className={`w-full min-w-0 transition-opacity duration-300 ${
        loading ? "opacity-40 blur-xs pointer-events-none" : "opacity-100"
      }`}
    >
      {/* 1. TOP METRICS STRIP: De-boxed Editorial Summary */}
      <div className="-mx-4 sm:mx-0 sm:w-full rounded-none sm:rounded-2xl bg-white dark:bg-[#1A1C20] border-y border-x-0 sm:border border-stone-200/80 dark:border-white/[0.07] sm:shadow-2xs px-4 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          {/* Main Total Spent Metric */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
                Total Spent This Month
              </span>
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-[#68C19D] hover:text-emerald-800 dark:hover:text-[#86D4B4] transition-colors disabled:opacity-50 cursor-pointer outline-none"
              >
                <RefreshCw
                  size={12}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
              </button>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span
                style={{ fontFamily: "'Lora', serif" }}
                className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-stone-400 dark:text-stone-500"
              >
                ₹
              </span>
              <span
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                className={`text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight leading-none tabular-nums truncate ${
                  hasSpend
                    ? "text-stone-950 dark:text-stone-50"
                    : "text-stone-400 dark:text-stone-500"
                }`}
              >
                {formatINR(totalSpend)}
              </span>
            </div>
          </div>

          {/* Sub-Metric Columns */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-11 pt-4 lg:pt-0 border-t lg:border-t-0 border-stone-200/80 dark:border-white/[0.07]">
            {/* Cash in Hand */}
            <div className="flex flex-col min-w-0 pl-3.5 border-l-2 border-emerald-700/75 dark:border-[#4EA885]">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400 mb-1">
                Cash in Hand
              </span>
              <div className="flex items-baseline gap-1">
                <span
                  style={{ fontFamily: "'Lora', serif" }}
                  className="text-base sm:text-lg font-semibold text-emerald-700/65 dark:text-[#68C19D]/65"
                >
                  ₹
                </span>
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-[#68C19D] tabular-nums tracking-tight leading-none"
                >
                  {formatINR(data?.aggregated?.totalCashBalance)}
                </span>
              </div>
            </div>

            <div className="h-10 w-px bg-stone-200 dark:bg-white/[0.08] hidden sm:block" />

            {/* Spent This Year */}
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400 mb-1">
                Spent This Year (YTD)
              </span>
              <div className="flex items-baseline gap-1">
                <span
                  style={{ fontFamily: "'Lora', serif" }}
                  className="text-base sm:text-lg font-semibold text-stone-400 dark:text-stone-500"
                >
                  ₹
                </span>
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="text-2xl sm:text-3xl font-bold text-stone-950 dark:text-stone-50 tabular-nums tracking-tight leading-none"
                >
                  {formatINR(data?.aggregated?.yearNetSpend)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. WALLETS BREAKDOWN: Editorial Ledger Sheets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 lg:gap-11 2xl:gap-14 pt-8">
        {/* Cash Wallets */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-200/90 dark:border-white/[0.07] mb-3.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1 h-3.5 rounded-full bg-emerald-700 dark:bg-[#4EA885] shrink-0" />
              <Landmark
                size={13}
                className="text-emerald-700 dark:text-[#68C19D] shrink-0"
              />
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-stone-800 dark:text-stone-100 truncate">
                Cash Accounts
              </h3>
            </div>
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-white/[0.06] text-stone-700 dark:text-stone-200 shrink-0"
            >
              {physical.length} accounts
            </span>
          </div>

          <div className="-mx-4 sm:mx-0 sm:w-full rounded-none sm:rounded-2xl bg-white dark:bg-[#1A1C20] border-y border-x-0 sm:border border-stone-200/80 dark:border-white/[0.07] sm:shadow-2xs overflow-hidden divide-y divide-stone-100 dark:divide-white/[0.05]">
            {physical.length === 0 ? (
              <div className="py-10 text-center text-xs font-medium text-stone-500 dark:text-stone-400">
                No cash spent this month.
              </div>
            ) : (
              physical.map((w, i) => (
                <div
                  key={w._id || i}
                  className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-stone-50/80 dark:hover:bg-white/[0.025] transition-colors"
                >
                  <div className="flex flex-col min-w-0">
                    <span
                      style={{ fontFamily: "'Lora', serif" }}
                      className="text-sm font-bold text-stone-950 dark:text-stone-50 truncate tracking-tight"
                    >
                      {w.name}
                    </span>
                    <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 capitalize mt-0.5">
                      {w.user || "Personal"}
                    </span>
                  </div>

                  <div
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    className="text-right flex items-baseline gap-3 shrink-0"
                  >
                    <span className="text-sm font-bold text-stone-950 dark:text-stone-50 tabular-nums tracking-tight">
                      ₹{formatINR(w.monthSpend)}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-[#68C19D] w-13 text-right tabular-nums flex items-center justify-end gap-0.5">
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
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-200/90 dark:border-white/[0.07] mb-3.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1 h-3.5 rounded-full bg-emerald-700 dark:bg-[#4EA885] shrink-0" />
              <Zap
                size={13}
                className="text-emerald-700 dark:text-[#68C19D] shrink-0"
              />
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-stone-800 dark:text-stone-100 truncate">
                Digital &amp; Bank Channels
              </h3>
            </div>
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-white/[0.06] text-stone-700 dark:text-stone-200 shrink-0"
            >
              {digital.length} accounts
            </span>
          </div>

          <div className="-mx-4 sm:mx-0 sm:w-full rounded-none sm:rounded-2xl bg-white dark:bg-[#1A1C20] border-y border-x-0 sm:border border-stone-200/80 dark:border-white/[0.07] sm:shadow-2xs overflow-hidden divide-y divide-stone-100 dark:divide-white/[0.05]">
            {digital.length === 0 ? (
              <div className="py-10 text-center text-xs font-medium text-stone-500 dark:text-stone-400">
                No online or bank spending this month.
              </div>
            ) : (
              digital.map((w, i) => (
                <div
                  key={w._id || i}
                  className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-stone-50/80 dark:hover:bg-white/[0.025] transition-colors"
                >
                  <div className="flex flex-col min-w-0">
                    <span
                      style={{ fontFamily: "'Lora', serif" }}
                      className="text-sm font-bold text-stone-950 dark:text-stone-50 truncate tracking-tight"
                    >
                      {w.name}
                    </span>
                    <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 capitalize mt-0.5">
                      {w.user || "Personal"}
                    </span>
                  </div>

                  <div
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    className="text-right flex items-baseline gap-3 shrink-0"
                  >
                    <span className="text-sm font-bold text-stone-950 dark:text-stone-50 tabular-nums tracking-tight">
                      ₹{formatINR(w.monthSpend)}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-[#68C19D] w-13 text-right tabular-nums flex items-center justify-end gap-0.5">
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
