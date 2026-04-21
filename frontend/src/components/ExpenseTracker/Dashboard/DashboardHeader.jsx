import React from "react";
import { RefreshCw, Wallet, CalendarDays, ArrowUpRight, LayoutGrid } from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
};

export const DashboardHeader = ({ summary, loading, loadDashboardData }) => {
  return (
    <div className="relative bg-white dark:bg-[#020617] pt-16 pb-12 px-6 overflow-hidden border-b border-slate-100 dark:border-slate-800/40">
      
      {/* BACKGROUND DECOR: Subtitle "Watermark" for that creative edge */}
      <div className="absolute -bottom-10 right-0 select-none pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        <h1 className="text-[15rem] font-[1000] italic leading-none tracking-tighter">
          DALAL
        </h1>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col gap-8">
          
          {/* TOP SECTION: Floating Command Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center rotate-3 shadow-lg">
                <LayoutGrid size={18} className="text-white dark:text-slate-900 -rotate-3" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 leading-none">
                  Household
                </p>
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase mt-1">
                  Spending View
                </h2>
              </div>
            </div>

            {/* THE DETACHED CAPSULE: Simple wordings, high-end look */}
            <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-inner">
              <div className="px-6 py-2 flex items-center gap-3">
                <CalendarDays size={14} className="text-emerald-500" />
                <span className="text-[11px] font-black text-slate-900 dark:text-slate-200 uppercase tracking-tight">
                  {new Date().toLocaleDateString(undefined, { month: 'long' })}
                </span>
              </div>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
              <button 
                onClick={() => loadDashboardData(true)}
                className="ml-2 px-5 py-2.5 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 group"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw size={14} className={`text-slate-500 group-hover:text-emerald-500 ${loading ? 'animate-spin' : ''}`} />
                  <span className="text-[10px] font-black uppercase text-slate-500">Sync</span>
                </div>
              </button>
            </div>
          </div>

          {/* BOTTOM SECTION: The "Hero" Amount */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-500">
                <ArrowUpRight size={16} strokeWidth={3} />
                <span className="text-[11px] font-black uppercase tracking-[0.4em]">Spent this month</span>
              </div>
              <h1 className="text-7xl md:text-[9rem] font-[1000] text-slate-900 dark:text-white tracking-tighter leading-none italic tabular-nums">
                ₹{formatINR(summary.monthlyTotal)}
              </h1>
            </div>

            {/* Simplified Trust Badge */}
            <div className="flex items-center gap-4 py-4 md:py-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
               <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Security Status</p>
                  <p className="text-[11px] font-black text-emerald-500 uppercase mt-1">Money Safe</p>
               </div>
               <div className="p-3 bg-emerald-500/10 rounded-2xl">
                  <Wallet size={20} className="text-emerald-500" />
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};