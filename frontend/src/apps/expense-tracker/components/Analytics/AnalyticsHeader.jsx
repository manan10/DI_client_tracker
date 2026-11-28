import React from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const AnalyticsHeader = ({ selectedDate, onChangeMonth }) => {
  const isCurrentMonth =
    selectedDate.getMonth() === new Date().getMonth() &&
    selectedDate.getFullYear() === new Date().getFullYear();

  const monthLabel = selectedDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <header className="relative z-10 w-full bg-[#FAF9F6] dark:bg-[#16181C] border-b border-stone-200/90 dark:border-white/[0.07]">
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-14 py-6 sm:py-8 flex flex-col md:flex-row md:items-end justify-between gap-6 min-w-0">
        {/* Left: Unified Upright Heading Block */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2">
            <span className="uppercase tracking-[0.16em] text-[10px] font-bold text-emerald-700 dark:text-[#68C19D]">
              Kharcha Paani
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="inline-flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
              <CalendarDays
                size={12}
                className="text-emerald-700 dark:text-[#68C19D]"
              />
              <span>{monthLabel}</span>
            </span>
          </div>

          <h1
            style={{ fontFamily: "'Lora', serif" }}
            className="text-2xl sm:text-3xl lg:text-[40px] font-bold tracking-tight leading-none text-stone-950 dark:text-stone-50"
          >
            Expense Analytics
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm font-medium text-stone-500 dark:text-stone-400 max-w-xl">
            Category breakdown shifts, multi-month outflow patterns, and
            household liquidity reserves.
          </p>
        </div>

        {/* Right: Month Selector Control */}
        <div className="w-full md:w-auto flex justify-start md:justify-end shrink-0">
          <div className="inline-flex items-center bg-white dark:bg-[#1A1C20] rounded-xl border border-stone-200/90 dark:border-white/[0.08] shadow-2xs h-11 p-1">
            <button
              type="button"
              onClick={() => onChangeMonth(-1)}
              aria-label="Previous Month"
              className="h-full px-3 flex items-center justify-center rounded-lg bg-stone-50 hover:bg-stone-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-stone-500 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-[#68C19D] transition-colors shrink-0 outline-none cursor-pointer"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>

            <div className="flex-1 sm:flex-none px-4 min-w-[140px] flex items-center justify-center gap-2 h-full">
              <CalendarDays
                size={14}
                className="text-emerald-700 dark:text-[#68C19D] shrink-0"
              />
              <span
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider whitespace-nowrap"
              >
                {selectedDate.toLocaleString("default", { month: "short" })}{" "}
                {selectedDate.getFullYear()}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onChangeMonth(1)}
              disabled={isCurrentMonth}
              aria-label="Next Month"
              className="h-full px-3 flex items-center justify-center rounded-lg bg-stone-50 hover:bg-stone-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-stone-500 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-[#68C19D] transition-colors disabled:opacity-30 disabled:hover:bg-stone-50 dark:disabled:hover:bg-white/[0.04] shrink-0 outline-none cursor-pointer"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AnalyticsHeader;
