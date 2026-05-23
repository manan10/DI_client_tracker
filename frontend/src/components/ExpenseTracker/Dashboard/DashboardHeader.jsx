import React from "react";
import { RefreshCw, Wallet, CalendarDays, ArrowUpRight, LayoutGrid } from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
};

export const DashboardHeader = ({ summary, loading, loadDashboardData }) => {
  return (
    <div className="relative bg-white dark:bg-[#020617] pt-8 md:pt-16 pb-8 md:pb-12 px-4 md:px-8 overflow-hidden border-b border-slate-200 dark:border-slate-800">
      
      {/* REFINED BACKGROUND WATERMARK */}
      <div className="absolute -bottom-4 md:-bottom-10 right-0 select-none pointer-events-none opacity-[0.02] dark:opacity-[0.03]">
        <h1 className="text-[6rem] md:text-[15rem] font-[1000] italic leading-none tracking-tighter text-slate-900 dark:text-white">
          DALAL
        </h1>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col gap-6 md:gap-10">
          
          {/* TOP SECTION: Context & Actions */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <LayoutGrid size={18} className="text-white dark:text-slate-900" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 leading-none">
                  Overview
                </p>
                <h2 className="text-[11px] font-black text-slate-900 dark:text-white uppercase mt-1 tracking-widest">
                  Spending
                </h2>
              </div>
            </div>

            <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="px-3 py-1.5 flex items-center gap-2">
                <CalendarDays size={12} className="text-emerald-600 shrink-0" />
                <span className="text-[9px] font-black text-slate-900 dark:text-slate-200 uppercase tracking-widest whitespace-nowrap">
                  {new Date().toLocaleDateString(undefined, { month: 'short' })}
                </span>
              </div>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
              <button 
                onClick={() => loadDashboardData(true)}
                className="px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all active:scale-95"
              >
                <RefreshCw size={12} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* BOTTOM SECTION: Hero Metric & Trust Badge */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            
            {/* Hero Metric */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-emerald-600">
                <ArrowUpRight size={12} strokeWidth={3} />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Spent this month</span>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-[8rem] font-[1000] text-slate-900 dark:text-white tracking-tighter leading-none italic tabular-nums">
                ₹{formatINR(summary.monthlyTotal)}
              </h1>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};