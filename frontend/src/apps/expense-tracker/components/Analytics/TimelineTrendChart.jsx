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
    <div className="w-full flex flex-col justify-between min-w-0 font-sans">
      <div>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-200 dark:border-white/10 mb-4 gap-3 min-w-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Monthly Spending Trend
              </h3>
              {isTrendLoading && (
                <Activity
                  size={13}
                  className="text-emerald-600 dark:text-emerald-400 animate-pulse shrink-0"
                />
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compare spending across the last 6 months
            </p>
          </div>

          {/* Category Filter Popover */}
          <div className="relative w-full sm:w-auto min-w-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-2 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 dark:hover:border-emerald-400/50 bg-white dark:bg-[#0B1120] text-xs font-sans font-bold text-slate-800 dark:text-slate-200 transition-colors outline-none cursor-pointer shadow-2xs"
            >
              <Filter size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate max-w-[130px]">
                {trendCategory}
              </span>
              <ChevronDown
                size={13}
                className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory("All Categories");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs font-sans font-bold transition-colors cursor-pointer ${
                    trendCategory === "All Categories"
                      ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
                >
                  <span>All Categories</span>
                  {trendCategory === "All Categories" && (
                    <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                  )}
                </button>

                <div className="h-px w-full bg-slate-100 dark:bg-white/5 my-1" />

                <div className="max-h-52 overflow-y-auto">
                  {dropdownOptions.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-slate-400 italic">
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
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-xs font-sans font-semibold transition-colors cursor-pointer ${
                          trendCategory === catLabel
                            ? "text-emerald-700 font-bold bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <span className="truncate pr-2">{catLabel}</span>
                        {trendCategory === catLabel && (
                          <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart Area */}
        <div
          className={`h-56 flex items-end justify-between gap-2 sm:gap-6 relative pt-8 z-10 transition-opacity duration-300 ${
            isTrendLoading ? "opacity-40 blur-xs" : "opacity-100"
          }`}
        >
          {/* Subtle Grid Guidelines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 pt-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-full border-t border-dashed border-slate-200 dark:border-white/5"
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
                className="flex flex-col items-center w-full group relative z-20 h-full justify-end font-sans"
              >
                {/* Floating Tooltip with Clean Number Formatting */}
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-sans font-bold px-2 py-0.5 rounded shadow-sm pointer-events-none whitespace-nowrap z-30 tabular-nums">
                  ₹{formatINR(d.amount)}
                </div>

                {/* Minimalist Bar */}
                <div
                  className={`w-full max-w-[42px] transition-all duration-700 ease-out rounded-t-md cursor-pointer ${
                    isCurrentMonth
                      ? "bg-emerald-600 dark:bg-emerald-500 shadow-xs"
                      : "bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700"
                  }`}
                  style={{ height: `${heightPercent}%`, minHeight: "6px" }}
                />

                {/* Month Label */}
                <span
                  className={`text-[11px] font-sans font-bold uppercase tracking-wider mt-2.5 truncate max-w-full ${
                    isCurrentMonth
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-slate-500 dark:text-slate-400"
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