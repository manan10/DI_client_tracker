import React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const AnalyticsHeader = ({ selectedDate, onChangeMonth }) => {
  const isCurrentMonth =
    selectedDate.getMonth() === new Date().getMonth() &&
    selectedDate.getFullYear() === new Date().getFullYear();

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 dark:border-white/10 pb-8 min-w-0">
      {/* Title & Explainer */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-serif tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
          Expense <span className="italic font-normal text-emerald-800 dark:text-emerald-400">Analytics</span>
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm lg:text-base font-sans font-normal text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
          Track category breakdown shifts, analyze multi-month outflow patterns, and monitor your household liquidity reserves in real time.
        </p>
      </div>

      {/* Month Selector Control */}
      <div className="w-full md:w-auto flex justify-start md:justify-end shrink-0 font-sans">
        <div className="inline-flex items-center bg-white dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-white/10 shadow-xs h-11 p-1">
          <button
            type="button"
            onClick={() => onChangeMonth(-1)}
            aria-label="Previous Month"
            className="h-full px-3 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors shrink-0 outline-none cursor-pointer"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>

          <div className="flex-1 sm:flex-none px-4 min-w-[150px] flex items-center justify-center gap-2 h-full">
            <Calendar
              size={14}
              className="text-emerald-600 dark:text-emerald-400 shrink-0"
            />
            <span className="text-xs font-sans font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider whitespace-nowrap">
              {selectedDate.toLocaleString("default", { month: "short" })}{" "}
              {selectedDate.getFullYear()}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onChangeMonth(1)}
            disabled={isCurrentMonth}
            aria-label="Next Month"
            className="h-full px-3 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors disabled:opacity-30 disabled:hover:bg-slate-50 dark:disabled:hover:bg-slate-900/50 shrink-0 outline-none cursor-pointer"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AnalyticsHeader;