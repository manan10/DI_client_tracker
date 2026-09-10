import React from 'react';
import { Clapperboard, Flame, Film, Sparkles, ChevronRight } from 'lucide-react';

const HomeCategoryPills = ({ activeCategory, onSelectCategory, stats }) => {
  const categories = [
    { 
      id: 'ALL', 
      label: 'All Shows', 
      fullLabel: 'All Shows & Movies',
      count: stats.total, 
      desc: 'Complete vault catalog', 
      icon: Clapperboard,
      badgeColor: 'text-slate-300'
    },
    { 
      id: 'INDIAN', 
      label: 'Desi', 
      fullLabel: 'Desi Central',
      count: stats.indianCount, 
      desc: 'Indian OTTs, Cult & Regional', 
      icon: Flame,
      badgeColor: 'text-amber-400'
    },
    { 
      id: 'HOLLYWOOD', 
      label: 'Global', 
      fullLabel: 'Hollywood & Global',
      count: stats.hollywoodCount, 
      desc: 'HBO prestige, series & cinema', 
      icon: Film,
      badgeColor: 'text-rose-400'
    },
    { 
      id: 'ANIME', 
      label: 'Anime', 
      fullLabel: 'Anime & Animation',
      count: stats.animeCount, 
      desc: 'Shonen, classics & visual arcs', 
      icon: Sparkles,
      badgeColor: 'text-cyan-400'
    }
  ];

  return (
    <>
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR MENU (Expanded, Bolder & More Atmospheric)               */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex flex-col gap-3.5 w-84 xl:w-96 shrink-0 sticky top-20 self-start">
        <div className="p-5 xl:p-6 rounded-md bg-linear-to-b from-[#0F1424]/95 via-[#0B0F1B]/95 to-slate-950/95 border border-rose-500/30 shadow-2xl space-y-3 text-left relative overflow-hidden backdrop-blur-xl text-white">
          
          {/* Subtle Ambient Backlight Glows */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-rose-500/15 blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-500/15 blur-[60px] pointer-events-none" />

          {/* Header Strip */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-rose-300">
                Category Channels
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-amber-300">
              {stats.total} Total
            </span>
          </div>

          {/* Channel Selector Cards */}
          <div className="space-y-2 pt-1 relative z-10">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const active = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`group w-full flex items-center justify-between p-3.5 xl:p-4 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-linear-to-r from-rose-900/90 via-slate-900 to-[#141A2E] text-white border-rose-500 shadow-lg ring-1 ring-rose-500/50 -translate-y-0.5'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-rose-400/30 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    {/* Icon Well */}
                    <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      active 
                        ? 'bg-rose-500/20 text-amber-300 border border-rose-500/40 shadow-xs' 
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}>
                      <Icon size={18} strokeWidth={2.4} />
                    </div>

                    {/* Titles */}
                    <div className="flex flex-col truncate">
                      <span className="text-sm xl:text-base font-serif font-bold uppercase tracking-[0.12em] leading-tight truncate">
                        {cat.fullLabel}
                      </span>
                      <span className={`text-xs font-mono mt-0.5 truncate ${
                        active ? 'text-rose-200/80 font-medium' : 'text-slate-400'
                      }`}>
                        {cat.desc}
                      </span>
                    </div>
                  </div>

                  {/* Count Capsule & Arrow */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs xl:text-sm font-mono font-bold px-2.5 py-0.5 rounded-sm border ${
                      active
                        ? 'bg-rose-500/20 text-amber-300 border-rose-500/50 shadow-xs'
                        : 'bg-white/5 text-slate-300 border-white/10'
                    }`}>
                      {cat.count}
                    </span>
                    <ChevronRight 
                      size={15} 
                      className={`transition-transform duration-200 ${
                        active ? 'text-rose-400 translate-x-0.5' : 'text-slate-500 group-hover:text-slate-300'
                      }`} 
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Footnote */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400 relative z-10">
            <span>Filter Mode: Single Select</span>
            <span className="text-rose-300 font-bold">Over-Rated Vault</span>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM MENU (Untouched & Preserved)                                */}
      {/* ========================================================================= */}
      <nav 
        aria-label="Mobile Channels"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-linear-to-r from-rose-950 via-slate-900 to-[#0F1424] border-t border-rose-500/30 px-2 py-2 shadow-[0_-4px_30px_rgba(0,0,0,0.5)] select-none"
      >
        {/* Neon horizon marquee line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-amber-400 via-rose-500 to-cyan-400 opacity-80 pointer-events-none" />

        <div className="grid grid-cols-4 gap-1.5 max-w-md mx-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-md transition-all cursor-pointer ${
                  active
                    ? 'text-amber-300 font-bold bg-white/10 border border-rose-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {/* Active Indicator Notch */}
                {active && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-linear-to-r from-amber-400 to-rose-500 rounded-full" />
                )}

                <div className="relative">
                  <Icon size={17} strokeWidth={active ? 2.6 : 2} className={active ? 'text-amber-300' : 'text-slate-400'} />
                  <span className={`absolute -top-1.5 -right-3 px-1 rounded-xs text-[8px] font-mono leading-tight font-bold ${
                    active ? 'bg-rose-500 text-white shadow-xs' : 'bg-white/10 text-slate-300 border border-white/10'
                  }`}>
                    {cat.count}
                  </span>
                </div>

                <span className="text-[9px] font-serif font-bold uppercase tracking-wider mt-1 truncate max-w-full">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default HomeCategoryPills;