import React from 'react';
import { IndianRupee, Landmark, Activity, ChevronDown, ChevronUp, Clock } from 'lucide-react';

const GlobalStatsGrid = ({ data, isExpanded, loading }) => {
  // Extract data from the filtered object we built above
  const stats = data?.currentFYStats || {};
  const arnConcentration = data?.arnConcentration || [];
  
  const fyTotal = stats.totalFY || 0;
  const monthsRecorded = stats.monthCount || 0;
  const activeARNs = arnConcentration.length;
  
  const format = (num) => new Intl.NumberFormat('en-IN').format(Math.round(num || 0));
  const avgMonthly = monthsRecorded > 0 ? fyTotal / monthsRecorded : 0;

  return (
    <div className={`relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all rounded-lg ${isExpanded ? '' : 'rounded-lg'}`}>
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
        
        {/* ANNUAL YIELD */}
        <div className="lg:col-span-4 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Annual Enterprise Commission</span>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-light text-emerald-600 italic">₹</span>
            <h2 className="text-4xl font-[1000] text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">
              {format(fyTotal)}
            </h2>
          </div>
        </div>

        {/* METRICS */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 h-full bg-slate-50/30 dark:bg-slate-900/20">
          
          <div className="p-8 lg:p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1">License Network</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-[1000] text-slate-700 dark:text-slate-200 tracking-tighter uppercase italic">{activeARNs}</h3>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Active ARNs</span>
            </div>
          </div>

          <div className="p-8 lg:p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1">Total Months Recorded</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-[1000] text-emerald-600 dark:text-emerald-500 tracking-tighter uppercase italic">{monthsRecorded}</h3>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Months</span>
            </div>
          </div>

          <div className="p-8 lg:p-10 flex flex-col justify-center">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1">Monthly Average</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 italic">₹</span>
              <h3 className="text-2xl font-[1000] text-slate-700 dark:text-slate-200 tracking-tighter uppercase italic">{format(avgMonthly)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* TOGGLE */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 py-3 flex justify-center items-center gap-3 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors cursor-pointer">
        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 uppercase tracking-[0.2em]">
          {isExpanded ? 'Collapse Detailed View' : 'View Full Matrix & Analysis'}
        </span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'}`} />
      </div>
    </div>
  );
};

export default GlobalStatsGrid;