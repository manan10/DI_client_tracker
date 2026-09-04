import React from 'react';
import { Users, Clock, TrendingUp, Sparkles, Building2 } from 'lucide-react';

const GlobalStatsGrid = ({ data, loading }) => {
  const stats = data?.currentFYStats || {};
  const arnConcentration = data?.arnConcentration || [];
  
  const fyTotal = stats.totalFY || 0;
  const monthsRecorded = stats.monthCount || 0;
  const activeARNs = arnConcentration.length;
  
  const formatINR = (num) => new Intl.NumberFormat('en-IN', { 
    maximumFractionDigits: 0 
  }).format(Math.round(num || 0));

  const avgMonthly = monthsRecorded > 0 ? fyTotal / monthsRecorded : 0;

  return (
    <div className="relative w-full bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/10 rounded-xl shadow-sm overflow-hidden transition-all duration-300">
      
      {/* Dynamic Top Ambient Strip */}
      <div className="h-0.5 w-full bg-linear-to-r from-emerald-500 via-teal-400 to-indigo-500 opacity-80" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/75 dark:bg-[#0B1120]/80 backdrop-blur-[1px] z-20 flex items-center justify-center">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg shadow-sm">
            <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Reconciling...
            </span>
          </div>
        </div>
      )}

      {/* High-Density 4-Column Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-white/10">
        
        {/* 1. Total Commission Hero Metric */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-linear-to-br from-emerald-500/5 via-transparent to-transparent dark:from-emerald-500/8 dark:to-transparent">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 truncate">
                Total Accrued Payout
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">₹</span>
              <span className="text-2xl sm:text-3xl font-[1000] font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
                {formatINR(fyTotal)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
              FY {data?.selectedFY || ''} Consolidated Gross
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-2xs">
            <Sparkles size={18} strokeWidth={2.2} />
          </div>
        </div>

        {/* 2. Active ARN Entities */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-linear-to-br from-indigo-500/3 via-transparent to-transparent dark:from-indigo-500/5 dark:to-transparent">
          <div className="min-w-0 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
              Active Family ARNs
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-[1000] font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
                {activeARNs}
              </span>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                Licenses
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
              Reporting Portfolios
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/60 dark:border-indigo-500/20 shadow-2xs">
            <Building2 size={18} strokeWidth={2.2} />
          </div>
        </div>

        {/* 3. Logged Accounting Cycles */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-linear-to-br from-cyan-500/3 via-transparent to-transparent dark:from-cyan-500/5 dark:to-transparent">
          <div className="min-w-0 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
              Logged Months
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-[1000] font-mono text-cyan-600 dark:text-cyan-400 tabular-nums tracking-tight">
                {monthsRecorded}
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                / 12 Cycles
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
              Audit Periods Reconciled
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-200/60 dark:border-cyan-500/20 shadow-2xs">
            <Clock size={18} strokeWidth={2.2} />
          </div>
        </div>

        {/* 4. Monthly Average Run-Rate */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-linear-to-br from-amber-500/3 via-transparent to-transparent dark:from-amber-500/5 dark:to-transparent">
          <div className="min-w-0 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
              Monthly Run-Rate
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 font-mono">₹</span>
              <span className="text-2xl sm:text-3xl font-[1000] font-mono text-slate-900 dark:text-white tabular-nums tracking-tight truncate">
                {formatINR(avgMonthly)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
              Average Yield / Month
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-500/20 shadow-2xs">
            <TrendingUp size={18} strokeWidth={2.2} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default GlobalStatsGrid;