import React from 'react';
import { Compass } from 'lucide-react';

const StatsRegionalOrigins = ({ analytics, totalRatingsCount }) => {
  const regions = [
    { label: 'Hollywood / Western TV', count: analytics.hollywoodCount, color: 'bg-cyan-500', text: 'text-cyan-500' },
    { label: 'Indian Originals & Series', count: analytics.indianCount, color: 'bg-amber-500', text: 'text-amber-500' },
    { label: 'Anime & Japanese Animation', count: analytics.animeCount, color: 'bg-rose-500', text: 'text-rose-500' }
  ];

  return (
    <div className="lg:col-span-5 p-5 sm:p-6 rounded-xl bg-white dark:bg-[#0D121D] border-2 border-slate-200/90 dark:border-white/10 shadow-xl flex flex-col justify-between gap-5">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Compass size={17} className="text-rose-500" strokeWidth={2.5} />
          <h3 className="text-xs font-serif font-bold uppercase tracking-[0.14em] text-slate-900 dark:text-white">
            Regional Origins & Status
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
          Active Catalog
        </span>
      </div>

      {/* Regional Share Bars */}
      <div className="space-y-3.5">
        {regions.map((item, idx) => {
          const pct = totalRatingsCount > 0 ? Math.round((item.count / totalRatingsCount) * 100) : 0;
          return (
            <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {item.label}
                </span>
                <span className={`font-mono font-black ${item.text}`}>
                  {item.count} <span className="text-[10px] font-normal text-slate-400">({pct}%)</span>
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-sm overflow-hidden">
                <div style={{ width: `${pct}%` }} className={`h-full ${item.color} rounded-sm`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Counter Deck */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
        <div className="text-center p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Finished</span>
          <span className="text-base font-mono font-black text-emerald-600 dark:text-emerald-400">{analytics.completed}</span>
        </div>
        <div className="text-center p-2 rounded-md bg-cyan-500/10 border border-cyan-500/20">
          <span className="text-[9px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block">Watching</span>
          <span className="text-base font-mono font-black text-cyan-600 dark:text-cyan-400">{analytics.watching}</span>
        </div>
        <div className="text-center p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
          <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">Queued</span>
          <span className="text-base font-mono font-black text-amber-600 dark:text-amber-400">{analytics.planToWatch}</span>
        </div>
        <div className="text-center p-2 rounded-md bg-rose-500/10 border border-rose-500/20">
          <span className="text-[9px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 block">Dropped</span>
          <span className="text-base font-mono font-black text-rose-600 dark:text-rose-400">{analytics.dropped}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsRegionalOrigins;