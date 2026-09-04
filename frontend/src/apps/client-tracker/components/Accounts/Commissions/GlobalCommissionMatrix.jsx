import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronRight, Building2, TrendingUp } from 'lucide-react';

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR',
  }).format(amount || 0);
};

const formatShortMonth = (periodStr) => {
  if (!periodStr) return '';
  const parts = periodStr.split('-');
  if (parts.length < 2) return periodStr;
  const monthNum = parseInt(parts[1], 10);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[monthNum - 1] || parts[1];
  return `${monthName} '${parts[0].slice(-2)}`;
};

// Refined, subtle semantic color tokens for each ARN column
const ARN_PALETTES = [
  {
    badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    headerBg: 'bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04]',
  },
  {
    badge: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    text: 'text-blue-700 dark:text-blue-400',
    headerBg: 'bg-blue-500/[0.02] dark:bg-blue-500/[0.04]',
  },
  {
    badge: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20',
    text: 'text-cyan-700 dark:text-cyan-400',
    headerBg: 'bg-cyan-500/[0.02] dark:bg-cyan-500/[0.04]',
  },
  {
    badge: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
    headerBg: 'bg-amber-500/[0.02] dark:bg-amber-500/[0.04]',
  },
  {
    badge: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
    text: 'text-indigo-700 dark:text-indigo-400',
    headerBg: 'bg-indigo-500/[0.02] dark:bg-indigo-500/[0.04]',
  },
  {
    badge: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    text: 'text-rose-700 dark:text-rose-400',
    headerBg: 'bg-rose-500/[0.02] dark:bg-rose-500/[0.04]',
  }
];

const GlobalCommissionMatrix = ({ data }) => {
  const [expandedMonth, setExpandedMonth] = useState(null);
  const monthlyAggregates = data?.monthlyAggregates || [];
  const uniqueARNs = data?.uniqueARNs || [];
  const arnNicknameMap = data?.arnNicknameMap || {};

  const arnTotals = uniqueARNs.reduce((acc, arnId) => {
    acc[arnId] = monthlyAggregates.reduce(
      (sum, m) => sum + (m.arnBreakdown?.find((b) => b.arnId === arnId)?.amount || 0),
      0
    );
    return acc;
  }, {});

  const grandTotalAllARNs = Object.values(arnTotals).reduce((a, b) => a + b, 0);

  if (monthlyAggregates.length === 0) {
    return (
      <div className="w-full p-10 border border-dashed border-slate-200 dark:border-white/10 rounded-xl flex flex-col items-center justify-center text-center bg-white dark:bg-[#0B1120]">
        <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 mb-3">
          <Calendar size={18} />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          No Monthly Entries Logged
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
          No monthly commission records found for this fiscal cycle. Select an ARN workspace to log records.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      
      {/* ========================================================= */}
      {/* 1. MOBILE VIEW: CLEAN STACKED CARDS (< lg)               */}
      {/* ========================================================= */}
      <div className="lg:hidden space-y-3">
        {/* Mobile Grand Total Summary Header */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Full Year Consolidated
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <Building2 size={12} /> {uniqueARNs.length} ARNs
            </span>
          </div>

          <div className="py-3">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              {formatINR(grandTotalAllARNs)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
            {uniqueARNs.map((arnId, idx) => {
              const theme = ARN_PALETTES[idx % ARN_PALETTES.length];
              return (
                <div key={arnId} className="p-3 rounded-lg bg-slate-50/70 dark:bg-white/2 border border-slate-200/70 dark:border-white/5 min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate uppercase">
                    {arnNicknameMap[arnId] || arnId}
                  </p>
                  <p className={`text-sm font-bold font-mono mt-0.5 tabular-nums ${theme.text}`}>
                    {formatINR(arnTotals[arnId])}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Monthly Accordion Cards */}
        <div className="space-y-2">
          {monthlyAggregates.map((month) => {
            const isExpanded = expandedMonth === month._id;
            return (
              <div
                key={month._id}
                className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setExpandedMonth(isExpanded ? null : month._id)}
                  className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-slate-50/60 dark:hover:bg-white/2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <Calendar size={16} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm text-slate-900 dark:text-white font-mono block">
                        {month._id}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block">
                        {formatShortMonth(month._id)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold font-mono text-sm sm:text-base text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatINR(month.total)}
                    </span>
                    <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-white/5 space-y-2 bg-slate-50/50 dark:bg-white/1">
                    {uniqueARNs.map((arnId, idx) => {
                      const amt = month.arnBreakdown?.find((b) => b.arnId === arnId)?.amount || 0;
                      const theme = ARN_PALETTES[idx % ARN_PALETTES.length];
                      return (
                        <div 
                          key={arnId} 
                          className="flex justify-between items-center p-2.5 rounded-lg bg-white dark:bg-[#0E1626] border border-slate-200/70 dark:border-white/5"
                        >
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase truncate max-w-42.5">
                            {arnNicknameMap[arnId] || arnId}
                          </span>
                          <span className={`font-mono text-xs font-bold ${amt > 0 ? theme.text : 'text-slate-300 dark:text-slate-600'}`}>
                            {amt > 0 ? formatINR(amt) : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. DESKTOP VIEW: REFINED LEDGER TABLE (>= lg)              */}
      {/* ========================================================= */}
      <div className="hidden lg:block w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl shadow-xs overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              {/* TOP MASTER TOTALS SUMMARY ROW */}
              <tr className="bg-slate-50/80 dark:bg-white/2 border-b border-slate-200 dark:border-white/10">
                <th className="px-6 py-4.5 sticky left-0 bg-slate-50 dark:bg-[#0B1120] z-20 w-52 border-r border-slate-200 dark:border-white/10">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Fiscal Totals
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                      Full Year Yield
                    </span>
                  </div>
                </th>

                {uniqueARNs.map((arnId, idx) => {
                  const theme = ARN_PALETTES[idx % ARN_PALETTES.length];
                  return (
                    <th key={arnId} className={`px-5 py-4.5 text-right border-r border-slate-100 dark:border-white/5 ${theme.headerBg}`}>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border truncate max-w-35 ${theme.badge}`}>
                          {arnNicknameMap[arnId] || arnId}
                        </span>
                        <span className="text-sm sm:text-base font-black font-mono tabular-nums text-slate-900 dark:text-white">
                          {formatINR(arnTotals[arnId])}
                        </span>
                      </div>
                    </th>
                  );
                })}

                <th className="px-6 py-4.5 text-right bg-emerald-500/5 dark:bg-emerald-500/10 border-l border-slate-200 dark:border-white/10 w-56">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Consolidated Total
                    </span>
                    <span className="text-base sm:text-lg font-[1000] font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                      {formatINR(grandTotalAllARNs)}
                    </span>
                  </div>
                </th>
              </tr>

              {/* COLUMN LABELS */}
              <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0B1120]">
                <th className="px-6 py-2.5 sticky left-0 bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-white/10 z-10">
                  Accounting Cycle
                </th>
                {uniqueARNs.map((arnId) => (
                  <th key={arnId} className="px-5 py-2.5 text-right truncate border-r border-slate-100 dark:border-white/5">
                    {arnNicknameMap[arnId] || arnId}
                  </th>
                ))}
                <th className="px-6 py-2.5 text-right border-l border-slate-200 dark:border-white/10">
                  Cycle Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
              {monthlyAggregates.map((monthRow) => (
                <tr
                  key={monthRow._id}
                  className="even:bg-slate-50/50 dark:even:bg-white/1 hover:bg-slate-100/60 dark:hover:bg-white/2 transition-colors group"
                >
                  {/* Sticky Month Identifier Column */}
                  <td className="px-6 py-3.5 sticky left-0 bg-white dark:bg-[#0B1120] group-hover:bg-slate-50 dark:group-hover:bg-[#0E1527] z-10 border-r border-slate-200 dark:border-white/10 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold font-mono text-slate-900 dark:text-white text-xs sm:text-sm">
                        {monthRow._id}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                        ({formatShortMonth(monthRow._id)})
                      </span>
                    </div>
                  </td>

                  {/* Individual ARN Payout Amounts */}
                  {uniqueARNs.map((arnId, idx) => {
                    const amount = monthRow.arnBreakdown?.find((b) => b.arnId === arnId)?.amount || 0;
                    const theme = ARN_PALETTES[idx % ARN_PALETTES.length];
                    return (
                      <td
                        key={arnId}
                        className="px-5 py-3.5 text-right font-mono tabular-nums border-r border-slate-100 dark:border-white/5"
                      >
                        {amount > 0 ? (
                          <span className={`font-bold text-xs sm:text-sm ${theme.text}`}>
                            {formatINR(amount)}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 font-normal select-none text-xs">
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}

                  {/* Monthly Cycle Total */}
                  <td className="px-6 py-3.5 text-right font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm border-l border-slate-200 dark:border-white/10 bg-emerald-50/30 dark:bg-emerald-500/5">
                    {formatINR(monthRow.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default GlobalCommissionMatrix;