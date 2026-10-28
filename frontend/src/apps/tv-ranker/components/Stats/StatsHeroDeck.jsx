import React from 'react';
import { Sparkles, Film, Tv, Flame } from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All', shortLabel: 'All', icon: Film },
  { id: 'INDIAN', label: 'Indian', shortLabel: 'Indian', icon: Flame },
  { id: 'HOLLYWOOD', label: 'Hollywood', shortLabel: 'West', icon: Tv },
  { id: 'ANIME', label: 'Anime', shortLabel: 'Anime', icon: Sparkles }
];

const StatsHeroDeck = ({
  activeRegionFilter = 'ALL',
  onSelectRegionFilter,
  analytics = {}
}) => {
  const categoryCounts = {
    ALL: analytics.total || 0,
    INDIAN: analytics.indianCount || 0,
    HOLLYWOOD: analytics.hollywoodCount || 0,
    ANIME: analytics.animeCount || 0
  };

  const typeCounts = [
    { label: 'Hollywood', count: analytics.hollywoodCount || 0, dot: 'bg-cyan-400', text: 'text-cyan-600 dark:text-[#40bcf4]' },
    { label: 'Indian', count: analytics.indianCount || 0, dot: 'bg-amber-400', text: 'text-amber-500 dark:text-amber-400' },
    { label: 'Anime', count: analytics.animeCount || 0, dot: 'bg-rose-400', text: 'text-rose-500 dark:text-rose-400' }
  ];

  return (
    <section className="relative w-full pt-6 pb-3 font-sans select-none transition-colors duration-200">
      
      {/* ========================================================================= */}
      {/* 1. EDITORIAL HEADER & SEAMLESS INLINE TALLIES                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-5 sm:pb-6">
        
        {/* Title, Badge & Subtitle */}
        <div className="space-y-2 max-w-2xl min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-200/60 dark:bg-white/5 border border-slate-300/60 dark:border-white/10 shadow-2xs">
            <Sparkles size={10} className="text-[#40bcf4] animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-stone-300">
              Curated Series Statistics
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[1000] uppercase tracking-tight text-slate-950 dark:text-white leading-[1.04]">
            Binge <span className="text-[#40bcf4]">Report Card</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-stone-400 font-medium leading-relaxed max-w-xl">
            A comprehensive breakdown of your ratings, genre affinity, and watching velocity across all logged series.
          </p>
        </div>

        {/* Seamless Type Counters (No box, blends directly into the page canvas) */}
        <div className="flex items-center gap-4 sm:gap-6 self-start md:self-end pt-1 md:pt-0">
          {typeCounts.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${item.dot} shrink-0`} />
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400">
                  {item.label}
                </span>
                <span className={`text-sm sm:text-base font-mono font-[1000] tabular-nums leading-none ${item.text}`}>
                  {item.count}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. OPEN DOCKED TABS (Natural edge-to-edge baseline divider)               */}
      {/* ========================================================================= */}
      <div className="w-full border-b border-slate-200/90 dark:border-white/10 pt-1">
        <div className="grid grid-cols-4 sm:flex items-center gap-1 sm:gap-2 w-full sm:w-auto -mb-px">
          {CATEGORIES.map((cat) => {
            const isActive = activeRegionFilter === cat.id;
            const count = categoryCounts[cat.id] ?? 0;
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectRegionFilter(cat.id)}
                className={`group relative flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 text-xs font-bold transition-all duration-150 cursor-pointer text-center border-b-2 ${
                  isActive
                    ? 'border-[#40bcf4] text-slate-950 dark:text-[#40bcf4]'
                    : 'border-transparent text-slate-500 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-200 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <Icon 
                  size={13} 
                  className={`hidden sm:inline shrink-0 transition-colors ${
                    isActive ? 'text-[#40bcf4]' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-stone-300'
                  }`} 
                />

                {/* Short labels on mobile prevent truncation; full label on tablet+ */}
                <span className="inline sm:hidden tracking-tight">{cat.shortLabel}</span>
                <span className="hidden sm:inline tracking-wide">{cat.label}</span>

                <span
                  className={`text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded font-[1000] shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#40bcf4]/15 text-[#40bcf4]'
                      : 'bg-slate-200/80 dark:bg-white/10 text-slate-500 dark:text-stone-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </section>
  );
};

export default StatsHeroDeck;