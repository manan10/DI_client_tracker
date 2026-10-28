import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';

const StatsDecileDistribution = ({ analytics = {} }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const total = analytics.total || 0;
  const deciles = analytics.deciles || [];
  const maxCount = analytics.maxDecileCount || 1;

  const tiers = [
    { label: 'Masterpiece (9+)', count: analytics.godTier || 0, color: 'bg-[#40bcf4]', text: 'text-[#40bcf4]' },
    { label: 'Great (8.5-8.9)', count: analytics.acclaimed || 0, color: 'bg-emerald-500', text: 'text-emerald-500' },
    { label: 'Good (8.0-8.4)', count: analytics.banger || 0, color: 'bg-amber-400', text: 'text-amber-500' },
    { label: 'Decent (7-7.9)', count: analytics.midTier || 0, color: 'bg-indigo-400', text: 'text-indigo-500' },
    { label: 'Low (<7.0)', count: analytics.flopTier || 0, color: 'bg-slate-400', text: 'text-slate-400' }
  ];

  return (
    <section className="relative w-full h-[300px] sm:h-[340px] xl:h-[360px] p-3 sm:p-4 lg:p-5 rounded-sm bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-[#262E3B] shadow-2xs flex flex-col justify-between overflow-hidden select-none font-sans transition-colors duration-200">
      
      {/* Precision Top-Edge Cyan Accent Line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#40bcf4] to-transparent pointer-events-none opacity-80" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-2 sm:pb-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="p-1 rounded-sm bg-[#40bcf4]/10 text-[#40bcf4] shrink-0">
            <BarChart3 size={13} strokeWidth={2.4} />
          </div>
          <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">
            Score Spread
          </h4>
        </div>
        <span className="text-[11px] sm:text-xs font-mono font-[1000] text-slate-900 dark:text-white tabular-nums shrink-0">
          {total} <span className="text-[9px] sm:text-[10px] font-normal text-slate-400 uppercase">Rated</span>
        </span>
      </div>

      {/* Vertical Histogram Bars */}
      <div className="flex-1 min-h-0 w-full flex items-end justify-between gap-1.5 sm:gap-2.5 px-0.5 sm:px-1 pt-2 sm:pt-3 pb-1 sm:pb-2">
        {deciles.map((dec, i) => {
          const count = dec.count || 0;
          const heightPct = Math.max(Math.round((count / maxCount) * 100), 6);
          const sharePct = total > 0 ? Math.round((count / total) * 100) : 0;
          const isHovered = hoveredIndex === i;

          return (
            <div 
              key={i} 
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="flex-1 flex flex-col items-center gap-1 sm:gap-1.5 h-full justify-end group cursor-pointer relative"
            >
              <div className="text-center leading-none">
                <span className={`text-[11px] sm:text-xs font-mono font-[1000] tabular-nums block ${
                  count > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                }`}>
                  {count}
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 leading-none">
                  {sharePct}%
                </span>
              </div>

              {/* Bar Slot */}
              <div className="w-full max-w-[34px] sm:max-w-[42px] bg-slate-100 dark:bg-[#11161D] rounded-sm p-0.5 flex flex-col justify-end h-full">
                <div 
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-xs transition-all duration-300 ${
                    i === 0 ? 'bg-[#40bcf4]' :
                    i === 1 ? 'bg-emerald-500' :
                    i === 2 ? 'bg-amber-400' :
                    i === 3 ? 'bg-indigo-400' : 'bg-slate-400'
                  }`}
                />
              </div>

              <span className={`text-[9px] sm:text-[10px] font-mono font-bold whitespace-nowrap ${
                isHovered ? 'text-[#40bcf4]' : 'text-slate-500 dark:text-stone-400'
              }`}>
                {dec.label}
              </span>

              {isHovered && (
                <div className="absolute -top-7 z-20 px-1.5 py-0.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-sm text-[9px] font-mono font-bold shadow-md whitespace-nowrap">
                  {count} shows ({sharePct}%)
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Composition Track & Legend */}
      <div className="pt-2 sm:pt-2.5 border-t border-slate-200/80 dark:border-white/10 space-y-1.5">
        <div className="h-1.5 w-full bg-slate-100 dark:bg-[#11161D] rounded-xs overflow-hidden flex gap-0.5">
          {tiers.map((t, i) => {
            const width = total > 0 ? (t.count / total) * 100 : 0;
            if (width === 0) return null;
            return (
              <div key={i} style={{ width: `${width}%` }} className={`h-full ${t.color}`} />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono pt-0.5">
          {tiers.map((t, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-xs ${t.color}`} />
              <span className="text-slate-400 hidden xs:inline">{t.label.split(' ')[0]}:</span>
              <span className={`font-bold tabular-nums ${t.text}`}>{t.count}</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default StatsDecileDistribution;