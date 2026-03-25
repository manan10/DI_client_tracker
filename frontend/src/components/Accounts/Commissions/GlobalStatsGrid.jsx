import React from 'react';
import { IndianRupee, Landmark, Activity, ChevronDown, ChevronUp } from 'lucide-react';

const GlobalStatsGrid = ({ data, isExpanded }) => {
  if (!data) return null;

  const { currentFYStats, _, arnConcentration = [] } = data;
  const format = (num) => new Intl.NumberFormat('en-IN').format(Math.round(num || 0));

  const fyTotal = currentFYStats?.total || 0;
  const activeARNs = arnConcentration.length;
  const avgMonthly = fyTotal / 12;

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
        
        {/* TOTAL YIELD SECTION */}
        <div className="lg:col-span-5 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Annual Enterprise Yield</span>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-light text-emerald-600 italic">₹</span>
            <h2 className="text-4xl font-[1000] text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">
              {format(fyTotal)}
            </h2>
          </div>
        </div>

        {/* METRICS SECTION */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 h-full bg-slate-50/30 dark:bg-slate-900/20">
          <div className="p-8 lg:p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1">License Network</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-[1000] text-slate-700 dark:text-slate-200 tracking-tighter uppercase italic">{activeARNs}</h3>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Active ARNs</span>
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

      {/* --- RE-DESIGNED TOGGLE BUTTON --- */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 py-3 flex justify-center items-center gap-3 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors cursor-pointer">
        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 uppercase tracking-[0.2em] transition-colors">
          {isExpanded ? 'Collapse Detailed View' : 'View Full Matrix & Analysis'}
        </span>
        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          {isExpanded ? 
            <ChevronUp size={14} className="text-emerald-600 dark:text-emerald-400" /> : 
            <ChevronDown size={14} className="text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
          }
        </div>
      </div>
    </div>
  );
};

export default GlobalStatsGrid;