import React, { useState } from "react";
import { Calendar, ChevronDown, ChevronRight, Building2 } from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(amount || 0);
};

const formatShortMonth = (periodStr) => {
  if (!periodStr) return "";
  const parts = periodStr.split("-");
  if (parts.length < 2) return periodStr;
  const monthNum = parseInt(parts[1], 10);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthName = months[monthNum - 1] || parts[1];
  return `${monthName} '${parts[0].slice(-2)}`;
};

const ARN_PALETTES = [
  {
    badge:
      "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-500/25",
    text: "text-sky-700 dark:text-sky-300",
    headerBg: "bg-sky-500/[0.02] dark:bg-sky-500/[0.03]",
  },
  {
    badge:
      "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-500/25",
    text: "text-cyan-700 dark:text-cyan-300",
    headerBg: "bg-cyan-500/[0.02] dark:bg-cyan-500/[0.03]",
  },
  {
    badge:
      "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-500/25",
    text: "text-blue-700 dark:text-blue-300",
    headerBg: "bg-blue-500/[0.02] dark:bg-blue-500/[0.03]",
  },
  {
    badge:
      "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-500/25",
    text: "text-indigo-700 dark:text-indigo-300",
    headerBg: "bg-indigo-500/[0.02] dark:bg-indigo-500/[0.03]",
  },
  {
    badge:
      "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-500/25",
    text: "text-amber-700 dark:text-amber-300",
    headerBg: "bg-amber-500/[0.02] dark:bg-amber-500/[0.03]",
  },
  {
    badge:
      "bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-200/80 dark:border-teal-500/25",
    text: "text-teal-700 dark:text-teal-300",
    headerBg: "bg-teal-500/[0.02] dark:bg-teal-500/[0.03]",
  },
];

const GlobalCommissionMatrix = ({ data }) => {
  const [expandedMonth, setExpandedMonth] = useState(null);
  const monthlyAggregates = data?.monthlyAggregates || [];
  const uniqueARNs = data?.uniqueARNs || [];
  const arnNicknameMap = data?.arnNicknameMap || {};

  const arnTotals = uniqueARNs.reduce((acc, arnId) => {
    acc[arnId] = monthlyAggregates.reduce(
      (sum, m) =>
        sum + (m.arnBreakdown?.find((b) => b.arnId === arnId)?.amount || 0),
      0
    );
    return acc;
  }, {});

  const grandTotalAllARNs = Object.values(arnTotals).reduce((a, b) => a + b, 0);

  if (monthlyAggregates.length === 0) {
    return (
      <div className="w-full p-10 flex flex-col items-center justify-center text-center bg-white dark:bg-[#161B26]">
        <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mb-3">
          <Calendar size={18} />
        </div>
        <p className="sora-font text-xs font-bold text-slate-800 dark:text-slate-200">
          No Monthly Entries Logged
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          No commission records found for this fiscal year. Switch to ARN Workspaces to log entries.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* 1. MOBILE VIEW (< lg) */}
      <div className="lg:hidden space-y-3 p-3">
        <div className="bg-slate-50/70 dark:bg-[#131720] border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 dark:border-slate-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Full Year Total
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-200/70 dark:border-sky-500/25">
              <Building2 size={12} /> {uniqueARNs.length} ARNs
            </span>
          </div>

          <div className="py-2.5">
            <span className="sora-font text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {formatINR(grandTotalAllARNs)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-200/70 dark:border-slate-800">
            {uniqueARNs.map((arnId, idx) => {
              const theme = ARN_PALETTES[idx % ARN_PALETTES.length];
              return (
                <div
                  key={arnId}
                  className="p-2.5 rounded-md bg-white dark:bg-[#161B26] border border-slate-200/70 dark:border-slate-800 min-w-0"
                >
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate uppercase">
                    {arnNicknameMap[arnId] || arnId}
                  </p>
                  <p
                    className={`text-xs font-bold font-mono mt-0.5 tabular-nums ${theme.text}`}
                  >
                    {formatINR(arnTotals[arnId])}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          {monthlyAggregates.map((month) => {
            const isExpanded = expandedMonth === month._id;
            return (
              <div
                key={month._id}
                className="bg-white dark:bg-[#131720] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedMonth(isExpanded ? null : month._id)
                  }
                  className="w-full flex items-center justify-between p-3.5 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-[#1C2230]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-200/70 dark:border-sky-500/20">
                      <Calendar size={15} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-slate-900 dark:text-white font-mono block">
                        {month._id}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        {formatShortMonth(month._id)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-bold font-mono text-sm text-sky-600 dark:text-sky-300 tabular-nums">
                      {formatINR(month.total)}
                    </span>
                    <div className="w-6 h-6 rounded bg-slate-100 dark:bg-[#1C2230] flex items-center justify-center text-slate-400">
                      {isExpanded ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 bg-slate-50/50 dark:bg-[#161B26]">
                    {uniqueARNs.map((arnId, idx) => {
                      const amt =
                        month.arnBreakdown?.find((b) => b.arnId === arnId)
                          ?.amount || 0;
                      const theme = ARN_PALETTES[idx % ARN_PALETTES.length];
                      return (
                        <div
                          key={arnId}
                          className="flex justify-between items-center px-3 py-2 rounded-md bg-white dark:bg-[#131720] border border-slate-200/70 dark:border-slate-800"
                        >
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-44">
                            {arnNicknameMap[arnId] || arnId}
                          </span>
                          <span
                            className={`font-mono text-xs font-bold ${
                              amt > 0
                                ? theme.text
                                : "text-slate-300 dark:text-slate-600"
                            }`}
                          >
                            {amt > 0 ? formatINR(amt) : "—"}
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

      {/* 2. DESKTOP TABLE (>= lg) */}
      <div className="hidden lg:block w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-200">
          <thead>
            {/* TOP TOTALS SUMMARY ROW */}
            <tr className="bg-slate-50/90 dark:bg-[#1C2230] border-b border-slate-200 dark:border-slate-800">
              <th className="px-5 py-4 sticky left-0 bg-slate-50 dark:bg-[#1C2230] z-20 w-52 border-r border-slate-200/80 dark:border-slate-800">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Summary
                  </span>
                  <span className="sora-font text-xs font-bold text-slate-900 dark:text-white">
                    Full Year Total
                  </span>
                </div>
              </th>

              {uniqueARNs.map((arnId, idx) => {
                const theme = ARN_PALETTES[idx % ARN_PALETTES.length];
                return (
                  <th
                    key={arnId}
                    className={`px-5 py-4 text-right border-r border-slate-200/60 dark:border-slate-800 ${theme.headerBg}`}
                  >
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border truncate max-w-36 ${theme.badge}`}
                      >
                        {arnNicknameMap[arnId] || arnId}
                      </span>
                      <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                        {formatINR(arnTotals[arnId])}
                      </span>
                    </div>
                  </th>
                );
              })}

              <th className="px-5 py-4 text-right bg-sky-50/60 dark:bg-sky-500/10 border-l border-slate-200 dark:border-slate-800 w-52">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                    All ARNs Total
                  </span>
                  <span className="sora-font text-base sm:text-lg font-bold tabular-nums text-sky-700 dark:text-sky-300">
                    {formatINR(grandTotalAllARNs)}
                  </span>
                </div>
              </th>
            </tr>

            {/* COLUMN LABELS */}
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-white dark:bg-[#161B26]">
              <th className="px-5 py-2.5 sticky left-0 bg-white dark:bg-[#161B26] border-r border-slate-200/80 dark:border-slate-800 z-10">
                Month
              </th>
              {uniqueARNs.map((arnId) => (
                <th
                  key={arnId}
                  className="px-5 py-2.5 text-right truncate border-r border-slate-100 dark:border-slate-800/60"
                >
                  {arnNicknameMap[arnId] || arnId}
                </th>
              ))}
              <th className="px-5 py-2.5 text-right border-l border-slate-200/80 dark:border-slate-800">
                Month Total
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {monthlyAggregates.map((monthRow) => (
              <tr
                key={monthRow._id}
                className="hover:bg-sky-50/30 dark:hover:bg-white/[0.02] transition-colors group"
              >
                <td className="px-5 py-3.5 sticky left-0 bg-white dark:bg-[#161B26] group-hover:bg-slate-50 dark:group-hover:bg-[#1C2230] z-10 border-r border-slate-200/70 dark:border-slate-800 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-slate-900 dark:text-white text-xs sm:text-sm">
                      {monthRow._id}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                      ({formatShortMonth(monthRow._id)})
                    </span>
                  </div>
                </td>

                {uniqueARNs.map((arnId, idx) => {
                  const amount =
                    monthRow.arnBreakdown?.find((b) => b.arnId === arnId)
                      ?.amount || 0;
                  const theme = ARN_PALETTES[idx % ARN_PALETTES.length];
                  return (
                    <td
                      key={arnId}
                      className="px-5 py-3.5 text-right font-mono tabular-nums border-r border-slate-100 dark:border-slate-800/60"
                    >
                      {amount > 0 ? (
                        <span
                          className={`font-semibold text-xs sm:text-sm ${theme.text}`}
                        >
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

                <td className="px-5 py-3.5 text-right font-mono font-bold tabular-nums text-sky-700 dark:text-sky-300 text-xs sm:text-sm border-l border-slate-200/80 dark:border-slate-800 bg-sky-50/30 dark:bg-sky-500/[0.04]">
                  {formatINR(monthRow.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GlobalCommissionMatrix;