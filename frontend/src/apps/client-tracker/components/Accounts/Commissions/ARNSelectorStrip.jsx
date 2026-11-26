import React from "react";

const ARN_ACCENTS = [
  {
    activeBg: "bg-sky-50/80 dark:bg-sky-500/10",
    activeBorder: "border-sky-500 ring-1 ring-sky-500/30",
    activeText: "text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
    badge:
      "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border-sky-200 dark:border-sky-500/30",
    bar: "bg-sky-500",
  },
  {
    activeBg: "bg-cyan-50/80 dark:bg-cyan-500/10",
    activeBorder: "border-cyan-500 ring-1 ring-cyan-500/30",
    activeText: "text-cyan-700 dark:text-cyan-300",
    dot: "bg-cyan-500",
    badge:
      "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30",
    bar: "bg-cyan-500",
  },
  {
    activeBg: "bg-blue-50/80 dark:bg-blue-500/10",
    activeBorder: "border-blue-500 ring-1 ring-blue-500/30",
    activeText: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
    badge:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
    bar: "bg-blue-500",
  },
  {
    activeBg: "bg-indigo-50/80 dark:bg-indigo-500/10",
    activeBorder: "border-indigo-500 ring-1 ring-indigo-500/30",
    activeText: "text-indigo-700 dark:text-indigo-300",
    dot: "bg-indigo-500",
    badge:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30",
    bar: "bg-indigo-500",
  },
  {
    activeBg: "bg-amber-50/80 dark:bg-amber-500/10",
    activeBorder: "border-amber-500 ring-1 ring-amber-500/30",
    activeText: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
    bar: "bg-amber-500",
  },
  {
    activeBg: "bg-teal-50/80 dark:bg-teal-500/10",
    activeBorder: "border-teal-500 ring-1 ring-teal-500/30",
    activeText: "text-teal-700 dark:text-teal-300",
    dot: "bg-teal-500",
    badge:
      "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300 border-teal-200 dark:border-teal-500/30",
    bar: "bg-teal-500",
  },
];

const formatCurrency = (val) => {
  if (!val || val === 0) return "0.00";
  if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `${(val / 100000).toFixed(2)} L`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)} K`;
  return new Intl.NumberFormat("en-IN").format(Math.round(val));
};

const formatMonth = (monthStr) => {
  if (!monthStr || monthStr === "N/A") return "Last Month";
  const parts = monthStr.split("-");
  if (parts.length < 2) return monthStr;
  const year = parts[0];
  const month = parseInt(parts[1], 10);
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
  return `${months[month - 1] || parts[1]} '${year.slice(-2)}`;
};

const ARNSelectorStrip = ({
  arns = [],
  stats = {},
  selectedARN,
  onSelectARN,
}) => {
  const activeArns = arns.filter((arn) => {
    if (!arn) return false;
    if (arn.isDummy === true) return false;
    const code = String(arn.arnCode || "").toUpperCase();
    const nick = String(arn.nickname || "").toUpperCase();
    return !code.includes("DUMMY") && !nick.includes("DUMMY");
  });

  return (
    <div className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg p-2 sm:p-2.5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-stretch gap-2 sm:gap-2.5 lg:overflow-x-auto no-scrollbar w-full">
        {activeArns.map((arn, idx) => {
          const isActive = selectedARN?.id === arn._id;
          const arnStats = stats[arn._id] || {};
          const totalFY = arnStats.totalFY || 0;
          const lastPayout = arnStats.lastPayout || 0;
          const lastMonthName = arnStats.lastMonthName || "N/A";
          const theme = ARN_ACCENTS[idx % ARN_ACCENTS.length];

          return (
            <button
              key={arn._id}
              type="button"
              onClick={() =>
                onSelectARN({
                  id: arn._id,
                  name: arn.arnCode,
                  nickname: arn.nickname,
                  lastPayout,
                  lastMonthName,
                  totalFY,
                })
              }
              className={`group w-full lg:flex-1 lg:min-w-52.5 lg:max-w-[320px] p-2.5 sm:p-3 rounded-md border text-left transition-all duration-150 cursor-pointer outline-none select-none relative flex flex-col justify-between gap-2 ${
                isActive
                  ? `${theme.activeBg}${theme.activeBorder}`
                  : "bg-slate-50/60 dark:bg-[#131720] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-[#1C2230]"
              }`}
            >
              {/* Row 1: Nickname & ARN Code */}
              <div className="flex items-start justify-between gap-1.5 w-full">
                <div className="min-w-0 flex items-center gap-1.5 sm:gap-2 flex-1">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isActive
                        ? `${theme.dot}`
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                  <h4
                    className={`sora-font text-[11px] sm:text-xs md:text-sm font-bold truncate ${
                      isActive
                        ? theme.activeText
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {arn.nickname}
                  </h4>
                </div>

                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-semibold uppercase tracking-wider shrink-0 border ${
                    isActive
                      ? theme.badge
                      : "bg-slate-100 dark:bg-[#1C2230] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {arn.arnCode}
                </span>
              </div>

              {/* Row 2: FY Total & Last Month */}
              <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-baseline justify-between gap-1.5 w-full">
                <div className="min-w-0">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block leading-none">
                    FY Total
                  </span>
                  <div className="flex items-baseline gap-0.5 mt-0.5">
                    <span className="text-[10px] font-semibold text-slate-400">
                      ₹
                    </span>
                    <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(totalFY)}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block leading-none truncate max-w-20">
                    {formatMonth(lastMonthName)}
                  </span>
                  <div className="flex items-baseline justify-end gap-0.5 mt-0.5">
                    <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                      ₹
                    </span>
                    <span className="text-xs sm:text-sm font-bold font-mono text-sky-600 dark:text-sky-300 tabular-nums">
                      {formatCurrency(lastPayout)}
                    </span>
                  </div>
                </div>
              </div>

              {isActive && (
                <div
                  className={`absolute bottom-0 left-2 right-2 h-[2px] ${theme.bar} rounded-full`}
                />
              )}
            </button>
          );
        })}

        {activeArns.length === 0 && (
          <div className="col-span-full w-full py-6 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
            No active ARN entities found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ARNSelectorStrip;