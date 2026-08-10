import React from "react";
import { RefreshCw, LayoutGrid, CalendarDays, ArrowUpRight } from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
};

export const DashboardHeader = ({ summary, loading, loadDashboardData }) => {
  return (
    <div className="relative w-full bg-white dark:bg-[#0B1120] pt-6 md:pt-12 pb-6 md:pb-10 px-4 md:px-8 overflow-hidden border-b border-slate-200 dark:border-white/10">
      
      {/* REFINED BACKGROUND WATERMARK (Overflow hidden prevents layout breaks) */}
      <div className="absolute -bottom-4 md:-bottom-10 right-0 select-none pointer-events-none opacity-[0.03] dark:opacity-[0.02]">
        <h1 className="text-[5rem] md:text-[12rem] font-[1000] italic leading-none tracking-tighter text-slate-900 dark:text-white">
          DALAL
        </h1>
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col gap-6 md:gap-8">
          
          {/* TOP SECTION: Context & Command Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Identity Badge */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                <LayoutGrid size={18} className="text-white dark:text-slate-900" />
              </div>
              <div className="truncate">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 leading-none">
                  Overview
                </p>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase mt-1 tracking-wider truncate">
                  Spending
                </h2>
              </div>
            </div>

            {/* Structured Command Bar */}
            <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 p-1 rounded-md border border-slate-200 dark:border-white/10 shadow-sm shrink-0">
              <div className="px-3 py-1.5 flex items-center gap-2 border-r border-slate-200 dark:border-white/10">
                <CalendarDays size={14} className="text-emerald-600 dark:text-emerald-500 shrink-0" />
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest whitespace-nowrap">
                  {new Date().toLocaleDateString(undefined, { month: 'short' })}
                </span>
              </div>
              <button 
                onClick={() => loadDashboardData(true)}
                disabled={loading}
                className="px-3 py-1.5 ml-1 flex items-center justify-center hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-50"
                title="Sync Dashboard"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* BOTTOM SECTION: Hero Metric */}
          <div className="flex flex-col justify-start">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 mb-1">
              <ArrowUpRight size={14} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-wider">Spent this month</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-[1000] text-slate-900 dark:text-white tracking-tighter leading-none tabular-nums truncate">
              ₹{formatINR(summary.monthlyTotal)}
            </h1>
          </div>

        </div>
      </div>
    </div>
  );
};