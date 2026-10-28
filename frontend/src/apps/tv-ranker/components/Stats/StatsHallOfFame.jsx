import React from 'react';
import { Award, Heart, ArrowUpRight } from 'lucide-react';

const StatsHallOfFame = ({
  hallOfFame = [],
  categorizeShow,
  onSelectItemForEdit
}) => {
  return (
    <section className="relative w-full h-[300px] sm:h-[340px] xl:h-[360px] p-3 sm:p-4 lg:p-5 rounded-sm bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-[#262E3B] shadow-2xs flex flex-col justify-between overflow-hidden select-none font-sans transition-colors duration-200">
      
      {/* Precision Top-Edge Cyan Accent Line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#40bcf4] to-transparent opacity-80" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-2 sm:pb-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="p-1 rounded-sm bg-amber-500/10 text-amber-400 shrink-0">
            <Award size={13} strokeWidth={2.4} />
          </div>
          <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">
            Hall of Fame
          </h4>
        </div>
        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-500 uppercase shrink-0">
          Top 5 Evaluated
        </span>
      </div>

      {/* Clean Unboxed Leaderboard */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 py-0.5 sm:py-1">
        {hallOfFame.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
            No rated shows logged
          </div>
        ) : (
          hallOfFame.map((item, idx) => (
            <div
              key={item._id}
              onClick={() => onSelectItemForEdit && onSelectItemForEdit(item)}
              className="py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3 group cursor-pointer hover:bg-slate-50/60 dark:hover:bg-white/[0.02] px-1 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <span className="text-[11px] sm:text-xs font-mono font-black text-amber-500 w-3.5 shrink-0">
                  #{idx + 1}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h5 className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#40bcf4] transition-colors">
                      {item.show?.title}
                    </h5>
                    {item.show?.year && (
                      <span className="text-[9px] font-mono text-slate-400 shrink-0">
                        '{String(item.show?.year).slice(-2)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 mt-0.5">
                    <span className="truncate">{categorizeShow ? categorizeShow(item) : 'Show'}</span>
                    <span>•</span>
                    <span className="shrink-0">{item.seasonsWatched || 1}S</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {item.isFavorite && (
                  <Heart size={11} className="text-rose-500 fill-rose-500 shrink-0" />
                )}
                <span className="font-mono font-black text-[11px] sm:text-xs text-amber-500 dark:text-amber-400 tabular-nums">
                  {item.rating?.toFixed(1)}★
                </span>
                <ArrowUpRight size={11} className="text-slate-400 group-hover:text-[#40bcf4] transition-colors shrink-0" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 sm:pt-2.5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-slate-400">
        <span className="truncate">Click show to inspect history</span>
        <span className="text-amber-500 font-bold shrink-0">9.0+ Benchmark</span>
      </div>

    </section>
  );
};

export default StatsHallOfFame;