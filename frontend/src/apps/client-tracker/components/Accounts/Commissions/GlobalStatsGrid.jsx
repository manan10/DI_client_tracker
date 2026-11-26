import React from "react";
import { Clock, TrendingUp, Sparkles, Building2 } from "lucide-react";

const GlobalStatsGrid = ({ data, loading }) => {
  const stats = data?.currentFYStats || {};
  const arnConcentration = data?.arnConcentration || [];

  const fyTotal = stats.totalFY || 0;
  const monthsRecorded = stats.monthCount || 0;
  const activeARNs = arnConcentration.length;

  const formatINR = (num) =>
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(Math.round(num || 0));

  const avgMonthly = monthsRecorded > 0 ? fyTotal / monthsRecorded : 0;

  return (
    <div className="relative w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg overflow-hidden transition-all duration-300">
      {/* Top Sky-Cyan Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-sky-600 via-cyan-400 to-transparent" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/75 dark:bg-[#161B26]/80 backdrop-blur-[1px] z-20 flex items-center justify-center">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 rounded-md">
            <div className="w-3.5 h-3.5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Updating...
            </span>
          </div>
        </div>
      )}

      {/* 4-Column Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-slate-800/80">
        {/* 1. Total Commission */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-sky-50/30 dark:bg-sky-500/[0.03]">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300 truncate">
                Total Commission
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-sky-600 dark:text-sky-400 font-mono">
                ₹
              </span>
              <span className="sora-font text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                {formatINR(fyTotal)}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              FY {data?.selectedFY || ""} total across all ARNs
            </p>
          </div>

          <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-200/70 dark:border-sky-500/20">
            <Sparkles size={18} strokeWidth={2} />
          </div>
        </div>

        {/* 2. Active ARNs */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
              Active ARNs
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="sora-font text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                {activeARNs}
              </span>
              <span className="text-xs font-semibold text-sky-600 dark:text-sky-300">
                Entities
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Active family ARN licenses
            </p>
          </div>

          <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-200/70 dark:border-sky-500/20">
            <Building2 size={18} strokeWidth={2} />
          </div>
        </div>

        {/* 3. Logged Months */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
              Logged Months
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="sora-font text-2xl sm:text-3xl font-bold text-cyan-700 dark:text-cyan-300 tabular-nums tracking-tight">
                {monthsRecorded}
              </span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 font-mono">
                / 12 months
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Months recorded this FY
            </p>
          </div>

          <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-200/70 dark:border-cyan-500/20">
            <Clock size={18} strokeWidth={2} />
          </div>
        </div>

        {/* 4. Monthly Average */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
              Monthly Average
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
                ₹
              </span>
              <span className="sora-font text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight truncate">
                {formatINR(avgMonthly)}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Average payout per month
            </p>
          </div>

          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/70 dark:border-amber-500/20">
            <TrendingUp size={18} strokeWidth={2} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalStatsGrid;