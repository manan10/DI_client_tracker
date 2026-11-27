import React from 'react';
import { Compass } from 'lucide-react';

const StatsRegionalOrigins = ({ analytics, totalRatingsCount }) => {
  const regions = [
    { label: 'Hollywood / Western TV', count: analytics.hollywoodCount, color: 'bg-cyan-500', text: 'text-cyan-500' },
    { label: 'Indian Originals & Series', count: analytics.indianCount, color: 'bg-amber-500', text: 'text-amber-500' },
    { label: 'Anime & Japanese Animation', count: analytics.animeCount, color: 'bg-rose-500', text: 'text-rose-500' }
  ];

  return (
    <div className="lg:col-span-5 p-5 sm:p-6 rounded-xs bg-white dark:bg-[#12171F] border border-slate-300 dark:border-[#2C3545] shadow-xl flex flex-col justify-between gap-5">
      <div className="flex items-center justify-between border-b border-slate-200/90 dark:border-[#262E3B] pb-3">
        <div className="flex items-center gap-2">
          <Compass size={17} className="text-pink-600 dark:text-pink-400" strokeWidth={2.5} />
          <h3 className="text-xs font-sans font-bold uppercase tracking-[0.14em] text-slate-900 dark:text-white">
            Regional Origins & Status
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-stone-400 uppercase">
          Active Catalog
        </span>
      </div>

      {/* Regional Share Bars */}
      <div className="space-y-3.5">
        {regions.map((item, idx) => {
          const pct = totalRatingsCount > 0 ? Math.round((item.count / totalRatingsCount) * 100) : 0;
          return (
            <div key={idx} className="p-3 rounded-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200/90 dark:border-[#262E3B] space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-sans font-bold uppercase tracking-wider text-slate-800 dark:text-stone-200">
                  {item.label}
                </span>
                <span className={`font-mono font-bold ${item.text}`}>
                  {item.count} <span className="text-[10px] font-normal text-slate-500 dark:text-stone-400">({pct}%)</span>
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-[#161B22] rounded-2xs overflow-hidden">
                <div style={{ width: `${pct}%` }} className={`h-full ${item.color} rounded-2xs`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Counter Deck */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200/90 dark:border-[#262E3B]">
        <div className="text-center p-2 rounded-xs bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Finished</span>
          <span className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">{analytics.completed}</span>
        </div>
        <div className="text-center p-2 rounded-xs bg-cyan-500/10 border border-cyan-500/20">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block">Watching</span>
          <span className="text-base font-mono font-bold text-cyan-600 dark:text-cyan-400">{analytics.watching}</span>
        </div>
        <div className="text-center p-2 rounded-xs bg-amber-500/10 border border-amber-500/20">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">Queued</span>
          <span className="text-base font-mono font-bold text-amber-600 dark:text-amber-400">{analytics.planToWatch}</span>
        </div>
        <div className="text-center p-2 rounded-xs bg-rose-500/10 border border-rose-500/20">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">Dropped</span>
          <span className="text-base font-mono font-bold text-rose-600 dark:text-rose-400">{analytics.dropped}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsRegionalOrigins;