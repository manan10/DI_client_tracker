import React, { useState, useRef, useEffect } from "react";
import { Filter, Check, ChevronDown, Activity } from "lucide-react";

const TimelineTrendChart = ({
  trendData = [],
  maxTrendAmount = 1,
  isTrendLoading = false,
  trendCategory = "All Categories",
  onSelectCategory,
  dropdownOptions = [],
  formatINR,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full flex flex-col min-w-0">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2.5 border-b border-stone-200/90 dark:border-white/[0.07] mb-3.5 gap-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1 h-3.5 rounded-full bg-emerald-700 dark:bg-[#4EA885] shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-stone-800 dark:text-stone-100 truncate">
            6-Month Spending Trend
          </h3>
          {isTrendLoading && (
            <Activity
              size={13}
              className="text-emerald-700 dark:text-[#68C19D] animate-pulse shrink-0"
            />
          )}
        </div>

        {/* Category Filter Popover */}
        <div className="relative w-full sm:w-auto min-w-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center gap-2 py-1 px-2.5 rounded-lg border border-stone-200/90 dark:border-white/[0.08] hover:border-emerald-700/50 dark:hover:border-[#4EA885]/50 bg-white dark:bg-[#1A1C20] text-[11px] font-bold text-stone-800 dark:text-stone-200 transition-colors outline-none cursor-pointer shadow-2xs"
          >
            <Filter
              size={11}
              className="text-emerald-700 dark:text-[#68C19D] shrink-0"
            />
            <span className="truncate max-w-[140px]">{trendCategory}</span>
            <ChevronDown
              size={12}
              className={`text-stone-400 transition-transform duration-200 shrink-0 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-[#1A1C20] border border-stone-200/90 dark:border-white/[0.09] rounded-2xl shadow-xl overflow-hidden py-1.5 z-50 animate-in fade-in zoom-in-95">
              <button
                type="button"
                onClick={() => {
                  onSelectCategory("All Categories");
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs font-bold transition-colors cursor-pointer ${
                  trendCategory === "All Categories"
                    ? "text-emerald-800 bg-emerald-50/85 dark:text-[#86D4B4] dark:bg-[#4EA885]/[0.15]"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100/80 dark:hover:bg-white/[0.05]"
                }`}
              >
                <span>All Categories</span>
                {trendCategory === "All Categories" && (
                  <Check
                    size={14}
                    className="text-emerald-700 dark:text-[#68C19D]"
                  />
                )}
              </button>

              <div className="h-px w-full bg-stone-100 dark:bg-white/[0.06] my-1" />

              <div className="max-h-52 overflow-y-auto">
                {dropdownOptions.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-stone-400 italic">
                    No categories found
                  </div>
                ) : (
                  dropdownOptions.map((catLabel, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        onSelectCategory(catLabel);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-xs font-semibold transition-colors cursor-pointer ${
                        trendCategory === catLabel
                          ? "text-emerald-800 font-bold bg-emerald-50/85 dark:text-[#86D4B4] dark:bg-[#4EA885]/[0.15]"
                          : "text-stone-700 dark:text-stone-300 hover:bg-stone-100/80 dark:hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="truncate pr-2">{catLabel}</span>
                      {trendCategory === catLabel && (
                        <Check
                          size={14}
                          className="text-emerald-700 dark:text-[#68C19D] shrink-0"
                        />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editorial Chart Sheet */}
      <div className="-mx-4 sm:mx-0 sm:w-full flex-1 flex flex-col justify-between rounded-none sm:rounded-2xl bg-white dark:bg-[#1A1C20] border-y border-x-0 sm:border border-stone-200/80 dark:border-white/[0.07] sm:shadow-2xs p-5 sm:p-6">
        <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2">
          Showing trailing 6 months for{" "}
          <span
            style={{ fontFamily: "'Lora', serif" }}
            className="font-bold text-stone-900 dark:text-stone-100"
          >
            {trendCategory}
          </span>
        </p>

        {/* Bar Chart Area */}
        <div
          className={`h-60 flex items-end justify-between gap-2 sm:gap-6 relative pt-9 z-10 transition-opacity duration-300 ${
            isTrendLoading ? "opacity-40 blur-xs" : "opacity-100"
          }`}
        >
          {/* Subtle Grid Guidelines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 pt-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-full border-t border-dashed border-stone-200/80 dark:border-white/[0.06]"
              />
            ))}
          </div>

          {trendData.map((d, i) => {
            const heightPercent =
              maxTrendAmount === 0 ? 0 : (d.amount / maxTrendAmount) * 100;
            const isCurrentMonth = i === trendData.length - 1;

            return (
              <div
                key={i}
                className="flex flex-col items-center w-full group relative z-20 h-full justify-end"
              >
                {/* Floating Tooltip with Clean Number Formatting */}
                <div
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm pointer-events-none whitespace-nowrap z-30 tabular-nums"
                >
                  ₹{formatINR(d.amount)}
                </div>

                {/* Minimalist Bar */}
                <div
                  className={`w-full max-w-[42px] transition-all duration-700 ease-out rounded-t-lg cursor-pointer ${
                    isCurrentMonth
                      ? "bg-emerald-700 dark:bg-[#4EA885] shadow-2xs"
                      : "bg-stone-200 dark:bg-white/[0.1] hover:bg-stone-300 dark:hover:bg-white/[0.18]"
                  }`}
                  style={{ height: `${heightPercent}%`, minHeight: "6px" }}
                />

                {/* Month Label */}
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className={`text-[10.5px] font-bold uppercase tracking-wider mt-2.5 truncate max-w-full ${
                    isCurrentMonth
                      ? "text-emerald-700 dark:text-[#68C19D]"
                      : "text-stone-500 dark:text-stone-400"
                  }`}
                >
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineTrendChart;
