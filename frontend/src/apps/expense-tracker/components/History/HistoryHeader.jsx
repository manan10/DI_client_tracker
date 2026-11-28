import React, { useState, useRef, useEffect } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";

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
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(e.target)
      ) {
        setIsDateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasOutflow = Number(monthTotalOutflow) > 0;
  const hasInflow = Number(monthTotalInflow) > 0;

  return (
    <header className="relative z-20 w-full bg-[#FAF9F6] dark:bg-[#16181C] border-b border-stone-200/90 dark:border-white/[0.07]">
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-14 py-6 sm:py-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
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
              <span>
                {months[selectedMonth]} {selectedYear}
              </span>
            </span>
          </div>

          <h1
            style={{ fontFamily: "'Lora', serif" }}
            className="text-2xl sm:text-3xl lg:text-[40px] font-bold tracking-tight leading-none text-stone-950 dark:text-stone-50"
          >
            Expense History
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm font-medium text-stone-500 dark:text-stone-400 max-w-xl">
            Complete statement ledger of household expenses, wallet top-ups, and
            internal transfers.
          </p>
        </div>

        {/* Right: Architectural Typographic Ledger Figures + Period Picker */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between lg:justify-end gap-6 sm:gap-9 pt-4 lg:pt-0 border-t lg:border-t-0 border-stone-200/80 dark:border-white/[0.07]">
          {/* Period Figures */}
          <div className="flex items-center gap-6 sm:gap-9">
            {/* Outflow Metric */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
                Spent ({months[selectedMonth]})
              </span>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span
                  style={{ fontFamily: "'Lora', serif" }}
                  className="text-base sm:text-lg font-semibold text-rose-700/65 dark:text-[#F09BA3]/65"
                >
                  ₹
                </span>
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className={`text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight leading-none tabular-nums ${
                    hasOutflow
                      ? "text-rose-700 dark:text-[#F09BA3]"
                      : "text-stone-400 dark:text-stone-500"
                  }`}
                >
                  {formatINR(monthTotalOutflow)}
                </span>
              </div>
              <span className="mt-1.5 text-[11px] font-medium text-stone-500 dark:text-stone-400">
                All channels combined
              </span>
            </div>

            {/* Vertical Ledger Rule */}
            <div className="w-px h-12 bg-stone-200 dark:bg-white/[0.08] shrink-0" />

            {/* Inflow Metric */}
            <div className="flex flex-col pl-3.5 border-l-2 border-emerald-700/75 dark:border-[#4EA885]">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
                Inflow ({months[selectedMonth]})
              </span>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span
                  style={{ fontFamily: "'Lora', serif" }}
                  className="text-base sm:text-lg font-semibold text-emerald-700/65 dark:text-[#68C19D]/65"
                >
                  ₹
                </span>
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className={`text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight leading-none tabular-nums ${
                    hasInflow
                      ? "text-emerald-700 dark:text-[#68C19D]"
                      : "text-stone-400 dark:text-stone-500"
                  }`}
                >
                  {formatINR(monthTotalInflow)}
                </span>
              </div>
              <span className="mt-1.5 text-[11px] font-medium text-stone-600 dark:text-stone-300">
                Top-ups &amp; deposits
              </span>
            </div>
          </div>

          {/* Month Picker Dropdown Trigger */}
          <div className="relative shrink-0" ref={dateDropdownRef}>
            <button
              type="button"
              onClick={() => setIsDateOpen(!isDateOpen)}
              className={`h-10.5 px-3.5 flex items-center gap-2.5 bg-white dark:bg-[#1A1C20] border rounded-xl shadow-2xs transition-all cursor-pointer outline-none ${
                isDateOpen
                  ? "border-emerald-700 dark:border-[#4EA885] ring-2 ring-emerald-700/15 dark:ring-[#4EA885]/20 text-emerald-800 dark:text-[#86D4B4]"
                  : "border-stone-200/90 hover:border-stone-300 dark:border-white/[0.09] dark:hover:border-white/20 text-stone-900 dark:text-stone-100"
              }`}
            >
              <CalendarDays
                size={14}
                className="text-emerald-700 dark:text-[#68C19D]"
              />
              <span
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                className="text-xs font-bold tracking-tight"
              >
                {months[selectedMonth]} {selectedYear}
              </span>
              <ChevronDown
                size={14}
                className={`text-stone-400 transition-transform duration-200 ${
                  isDateOpen
                    ? "rotate-180 text-emerald-700 dark:text-[#68C19D]"
                    : ""
                }`}
              />
            </button>

            {/* Month/Year Popover Modal */}
            {isDateOpen && (
              <div className="absolute top-[calc(100%+6px)] left-0 sm:left-auto sm:right-0 z-50 w-72 bg-white dark:bg-[#1A1C20] border border-stone-200/90 dark:border-white/[0.09] rounded-2xl shadow-xl overflow-hidden p-3 animate-in fade-in zoom-in-95 duration-150">
                {/* Year Selector Tabs */}
                <div className="flex gap-1 bg-stone-100 dark:bg-white/[0.05] p-1 rounded-xl mb-2.5">
                  {years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setSelectedYear(y)}
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        selectedYear === y
                          ? "bg-white dark:bg-[#262930] text-stone-950 dark:text-white shadow-2xs"
                          : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
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
                      className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        selectedMonth === idx
                          ? "bg-emerald-700 dark:bg-[#4EA885] text-white dark:text-[#121315] font-bold shadow-2xs"
                          : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/[0.06]"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HistoryHeader;
