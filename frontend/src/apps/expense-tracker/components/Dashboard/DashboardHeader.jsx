import React from "react";
import { RefreshCw, CalendarDays, ArrowUpRight } from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const DashboardHeader = ({ summary, loading, loadDashboardData }) => {
  const currentMonthName = new Date().toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <header
      style={{ fontFamily: "'Nunito Sans', sans-serif" }}
      className="relative w-full bg-[#FAF9F6] dark:bg-[#16181C] pt-6 sm:pt-8 pb-6 sm:pb-8 px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-14 border-b border-stone-200/90 dark:border-white/[0.07]"
    >
      <div className="w-full max-w-[1680px] mx-auto relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col min-w-0">
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
              <span>{currentMonthName}</span>
            </span>
          </div>

          <h1
            style={{ fontFamily: "'Lora', serif" }}
            className="text-2xl sm:text-3xl lg:text-[40px] font-bold tracking-tight leading-none text-stone-950 dark:text-stone-50"
          >
            Overview
          </h1>
        </div>

        <div className="flex items-end justify-between lg:justify-end gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-[#68C19D] mb-1">
              <ArrowUpRight size={13} strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
                Spent This Month
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                style={{ fontFamily: "'Lora', serif" }}
                className="text-lg font-semibold text-stone-400 dark:text-stone-500"
              >
                ₹
              </span>
              <span
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                className="text-3xl sm:text-4xl font-bold text-stone-950 dark:text-stone-50 tracking-tight leading-none tabular-nums"
              >
                {formatINR(summary?.monthlyTotal)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadDashboardData?.(true)}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1A1C20] border border-stone-200/90 dark:border-white/[0.08] hover:border-emerald-700/50 dark:hover:border-[#4EA885]/50 text-stone-600 dark:text-stone-300 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            title="Sync Dashboard"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
    </header>
  );
};
