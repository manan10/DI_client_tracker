import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Calendar,
  ChevronDown,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.abs(amount || 0)
  );
};

const HistoryHeader = ({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  months = [],
  years = [],
  monthTotalOutflow = 0,
  monthTotalInflow = 0,
}) => {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const dateDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target)) {
        setIsDateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-6 border-b border-slate-200/90 dark:border-white/10 shrink-0">
      {/* Title & Context */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 rounded-md border border-emerald-300 dark:border-emerald-500/30 shadow-2xs">
            <Sparkles size={11} className="text-emerald-600 dark:text-emerald-400" />
            <span>Audit & Statement Center</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Treasury Engine
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[1000] uppercase tracking-tight bg-linear-to-r from-slate-900 via-slate-800 to-emerald-700 dark:from-white dark:via-slate-200 dark:to-emerald-400 bg-clip-text text-transparent leading-none">
          Expense History
        </h1>

        <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Track treasury reserves, monitor daily spending channels, and reconcile physical cash balances from one centralized command hub.
        </p>
      </div>

      {/* Right Controls: Month Selector & Pure Typography Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 w-full lg:w-auto">
        
        {/* Month Picker Dropdown Trigger */}
        <div className="relative shrink-0" ref={dateDropdownRef}>
          <button
            type="button"
            onClick={() => setIsDateOpen(!isDateOpen)}
            className={`h-11 px-3.5 flex items-center gap-2.5 bg-white dark:bg-[#0B1120] border-2 rounded-xl shadow-xs transition-all cursor-pointer outline-none ${
              isDateOpen
                ? "border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                : "border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600 text-slate-900 dark:text-white"
            }`}
          >
            <Calendar size={15} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs sm:text-sm font-black tracking-tight">
              {months[selectedMonth]} {selectedYear}
            </span>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${
                isDateOpen ? "rotate-180 text-indigo-500" : ""
              }`}
            />
          </button>

          {/* Month/Year Popover Modal */}
          {isDateOpen && (
            <div className="absolute top-[calc(100%+6px)] left-0 sm:left-auto sm:right-0 z-50 w-72 bg-white dark:bg-[#0B1120] border-2 border-indigo-500/30 rounded-xl shadow-2xl overflow-hidden p-3 animate-in fade-in zoom-in-95 duration-150">
              {/* Year Selector Tabs */}
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg mb-2.5 border border-slate-200/80 dark:border-white/10">
                {years.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setSelectedYear(y)}
                    className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-md transition-all cursor-pointer ${
                      selectedYear === y
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>

              {/* 12-Month Grid */}
              <div className="grid grid-cols-4 gap-1">
                {months.map((m, idx) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setSelectedMonth(idx);
                      setIsDateOpen(false);
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedMonth === idx
                        ? "bg-emerald-600 text-white font-black shadow-xs"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pure Typographic Period Totals (No Cards/Boxes) */}
        <div className="flex items-center gap-5 sm:gap-6 sm:pl-3 sm:border-l border-slate-200 dark:border-white/10">
          {/* Outflow Metric */}
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none">
              Total Spent
            </span>
            <span className="text-lg sm:text-xl font-mono font-[1000] text-rose-600 dark:text-rose-400 tabular-nums tracking-tight mt-1 leading-none">
              ₹{formatINR(monthTotalOutflow)}
            </span>
          </div>

          <div className="w-px h-7 bg-slate-200 dark:bg-slate-800" />

          {/* Inflow Metric */}
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none">
              Total Inflow
            </span>
            <span className="text-lg sm:text-xl font-mono font-[1000] text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight mt-1 leading-none">
              ₹{formatINR(monthTotalInflow)}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};

export default HistoryHeader;