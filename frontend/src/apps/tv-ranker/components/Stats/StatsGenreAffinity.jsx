import React from 'react';
import { Sparkles } from 'lucide-react';

const StatsGenreAffinity = ({ topGenres = [] }) => {
  const maxGenreCount = topGenres.length > 0 ? Math.max(...topGenres.map(g => g.count), 1) : 1;

  return (
    <section className="relative w-full h-[300px] sm:h-[340px] xl:h-[360px] p-3 sm:p-4 lg:p-5 rounded-sm bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-[#262E3B] shadow-2xs flex flex-col justify-between overflow-hidden select-none font-sans transition-colors duration-200">
      
      {/* Precision Top-Edge Cyan Accent Line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#40bcf4] to-transparent opacity-80" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-2 sm:pb-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="p-1 rounded-sm bg-[#40bcf4]/10 text-[#40bcf4] shrink-0">
            <Sparkles size={13} strokeWidth={2.4} />
          </div>
          <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">
            Top Genres
          </h4>
        </div>
        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-400 uppercase shrink-0">
          Volume & Avg
        </span>
      </div>

      {/* Clean Unboxed List with Scaled Progress Lines */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 py-0.5 sm:py-1">
        {topGenres.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
            No genre records found
          </div>
        ) : (
          topGenres.slice(0, 6).map((g, idx) => {
            const barWidth = Math.round((g.count / maxGenreCount) * 100);

            return (
              <div key={idx} className="py-1.5 sm:py-2 flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                  <span className="font-mono text-[9px] sm:text-[10px] font-bold text-slate-400 w-3 shrink-0">
                    {idx + 1}
                  </span>
                  
                  <div className="min-w-0 flex-1 pr-1.5 sm:pr-2">
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white truncate">
                        {g.name}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 tabular-nums">
                        {g.count} titles
                      </span>
                    </div>

                    {/* Integrated Micro Progress Line */}
                    <div className="h-1 w-full bg-slate-100 dark:bg-[#11161D] rounded-xs overflow-hidden">
                      <div 
                        style={{ width: `${barWidth}%` }} 
                        className="h-full bg-gradient-to-r from-cyan-500 to-[#40bcf4] rounded-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Score Tag */}
                <div className="shrink-0 text-right font-mono">
                  <span className="text-[11px] sm:text-xs font-black text-amber-500 dark:text-amber-400">
                    {g.avg}★
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 sm:pt-2.5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-slate-400">
        <span className="truncate">Top: <strong className="text-slate-800 dark:text-stone-200 font-bold">{topGenres[0]?.name || 'None'}</strong></span>
        <span className="text-[#40bcf4] font-bold shrink-0">{topGenres[0]?.count || 0} Shows</span>
      </div>

    </section>
  );
};

export default StatsGenreAffinity;