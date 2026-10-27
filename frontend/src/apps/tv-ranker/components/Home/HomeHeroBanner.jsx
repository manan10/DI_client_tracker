import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  X, 
  Check, 
  LayoutGrid, 
  Grid2X2, 
  LayoutList, 
  ArrowUpDown, 
  Trophy, 
  Flame, 
  Eye, 
  Heart, 
  Clock, 
  RotateCcw,
  ChevronDown
} from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All' },
  { id: 'INDIAN', label: 'Desi' },
  { id: 'HOLLYWOOD', label: 'Global' },
  { id: 'ANIME', label: 'Anime' }
];

// First 3 views only, strictly icons
const VIEW_MODES = [
  { id: 'CARDS', label: 'Poster Grid', icon: LayoutGrid },
  { id: 'COMPACT_TILES', label: 'Dense Tiles', icon: Grid2X2 },
  { id: 'LIST', label: 'List View', icon: LayoutList }
];

const TIERS = [
  { id: 'ALL', label: 'All', icon: null },
  { id: 'GOD_TIER', label: '9.0+', icon: Trophy, color: 'text-amber-400' },
  { id: 'ACCLAIMED', label: '8.5+', icon: Sparkles, color: 'text-[#40bcf4]' },
  { id: 'BANGER', label: '8.0+', icon: Flame, color: 'text-orange-400' },
  { id: 'CASUAL', label: '<8.0', icon: Eye, color: 'text-cyan-400' },
  { id: 'FAVORITES', label: 'Favs', icon: Heart, color: 'text-rose-400' },
  { id: 'WATCHLIST', label: 'Queue', icon: Clock, color: 'text-slate-400' }
];

const STATUSES = [
  { value: 'ALL', label: 'All' },
  { value: 'COMPLETED', label: 'Done' },
  { value: 'WATCHING', label: 'Watching' },
  { value: 'PLAN_TO_WATCH', label: 'Plan' },
  { value: 'DROPPED', label: 'Dropped' }
];

const SORTS = [
  { value: 'RATING_DESC', label: 'Highest Score' },
  { value: 'RATING_ASC', label: 'Lowest Score' },
  { value: 'TITLE', label: 'Title (A - Z)' },
  { value: 'RECENT', label: 'Recent Review' },
  { value: 'YEAR_DESC', label: 'Release Year' }
];

const HomeHeroBanner = ({
  searchQuery,
  onSearchChange,
  layoutView,
  onLayoutChange,
  activeCategory,
  onSelectCategory,
  tierFilter,
  onTierChange,
  statusFilter = 'ALL',
  onStatusChange = () => {},
  sortBy,
  onSortChange,
  stats = {},
  totalVisible
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);

  const sortRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const activeExtraFiltersCount = [
    tierFilter !== 'ALL',
    statusFilter !== 'ALL'
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    onTierChange('ALL');
    onStatusChange('ALL');
  };

  const categoryCounts = {
    ALL: stats.total || 0,
    INDIAN: stats.indianCount || 0,
    HOLLYWOOD: stats.hollywoodCount || 0,
    ANIME: stats.animeCount || 0
  };

  return (
    <section className="relative w-full rounded-lg bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#262E3B] shadow-sm dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] overflow-hidden font-sans select-none transition-colors duration-300">
      
      {/* Precision Cyan Horizon Highlight */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#40bcf4] to-transparent pointer-events-none opacity-90" />

      {/* Atmospheric Radial Sheen */}
      <div className="absolute -top-12 -right-12 w-96 h-96 bg-[#40bcf4]/10 dark:bg-[#40bcf4]/12 blur-3xl pointer-events-none rounded-full" />

      {/* ========================================================================= */}
      {/* 1. EDITORIAL HEADLINE BLOCK                                              */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-6 lg:p-7 pb-3.5 sm:pb-4 relative z-10">
        <div className="max-w-3xl space-y-2">
          
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-2xs">
            <Sparkles size={10} className="text-[#40bcf4] animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-stone-300">
              Curated Series Rankings
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-[1000] uppercase tracking-tight text-slate-950 dark:text-white leading-[1.04]">
            All-Time Show <span className="text-[#40bcf4]">Rankings</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-stone-400 font-medium leading-relaxed max-w-2xl pt-0.5">
            An unfiltered ranking of every series, season, and miniseries watched. Scored critically, ranked comparatively, and re-evaluated whenever a rewatch demands it.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. UNIFIED COMMAND DECK                                                  */}
      {/* ========================================================================= */}
      <div className="border-t border-slate-200/90 dark:border-[#262E3B] bg-slate-50/70 dark:bg-[#11161D] p-2.5 sm:p-4 space-y-2.5 relative z-10">
        
        {/* ROW 1: SEARCH + SORT + FILTERS + 3 VIEW MODES */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-stone-400 size-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search series, genres, tags..."
              className="w-full h-9 pl-8 pr-7 rounded bg-white dark:bg-[#1A212C] border border-slate-200 dark:border-[#2C3545] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-stone-400 outline-none focus:border-[#40bcf4] focus:ring-1 focus:ring-[#40bcf4]/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                title="Clear Search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Action Tools Cluster: Sort, Filter, Views */}
          <div className="flex items-center justify-between sm:justify-start gap-1.5 shrink-0">
            
            {/* Sort Dropdown */}
            <div className="relative shrink-0 flex-1 sm:flex-initial" ref={sortRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen((prev) => !prev)}
                className={`w-full sm:w-auto flex items-center justify-center h-9 px-2.5 rounded border text-xs font-mono font-bold transition-all cursor-pointer ${
                  sortBy !== 'RATING_DESC'
                    ? 'bg-[#40bcf4]/15 border-[#40bcf4]/60 text-[#40bcf4]'
                    : 'bg-white dark:bg-[#1A212C] border-slate-200 dark:border-[#2C3545] text-slate-700 dark:text-stone-300 hover:border-[#40bcf4]/50 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Sort Order"
                aria-label="Sort Order"
              >
                <ArrowUpDown size={13} strokeWidth={2.4} className={sortBy !== 'RATING_DESC' ? 'text-[#40bcf4]' : 'text-slate-400'} />
                <span className="ml-1.5 text-[10px] uppercase font-mono tracking-tight truncate max-w-[90px] sm:max-w-none">
                  {SORTS.find((s) => s.value === sortBy)?.label}
                </span>
              </button>

              {isSortOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 top-[calc(100%+4px)] w-44 rounded bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#262E3B] shadow-[0_12px_32px_rgba(0,0,0,0.6)] p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[8px] font-mono tracking-wider uppercase text-slate-400 dark:text-stone-400 select-none">
                    Sort Order
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {SORTS.map((opt) => {
                      const isSelected = sortBy === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            onSortChange(opt.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors cursor-pointer text-left ${
                            isSelected
                              ? 'bg-[#40bcf4]/15 text-[#40bcf4] font-bold'
                              : 'text-slate-700 dark:text-stone-300 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <span className="text-[11px] truncate">{opt.label}</span>
                          {isSelected && <Check size={11} strokeWidth={2.5} className="text-[#40bcf4] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* More Filters Toggle */}
            <button
              type="button"
              onClick={() => setIsMoreFiltersOpen((prev) => !prev)}
              className={`flex items-center justify-center gap-1.5 h-9 px-2.5 rounded border text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                isMoreFiltersOpen || activeExtraFiltersCount > 0
                  ? 'bg-[#40bcf4]/15 border-[#40bcf4]/60 text-[#40bcf4]'
                  : 'bg-white dark:bg-[#1A212C] border-slate-200 dark:border-[#2C3545] text-slate-700 dark:text-stone-300 hover:border-[#40bcf4]/50 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Toggle More Filters"
            >
              <SlidersHorizontal size={13} strokeWidth={2.4} />
              <span className="text-[10px] uppercase font-mono tracking-tight hidden xs:inline">
                Filters
              </span>
              {activeExtraFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-[#14181C] text-[9px] font-black flex items-center justify-center font-mono">
                  {activeExtraFiltersCount}
                </span>
              )}
              <ChevronDown 
                size={12} 
                className={`transition-transform duration-200 ${isMoreFiltersOpen ? 'rotate-180 text-[#40bcf4]' : 'text-slate-400'}`} 
              />
            </button>

            {/* 3 Layout Views: Strictly Icons Only */}
            <div className="flex items-center bg-white dark:bg-[#1A212C] p-0.5 rounded border border-slate-200 dark:border-[#2C3545] shrink-0">
              {VIEW_MODES.map((mode) => {
                const Icon = mode.icon;
                const isSelected = layoutView === mode.id;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => onLayoutChange(mode.id)}
                    title={mode.label}
                    aria-label={mode.label}
                    className={`p-1.5 rounded transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-[#2C3545] text-slate-950 dark:text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-700 dark:text-stone-400 dark:hover:text-white'
                    }`}
                  >
                    <Icon 
                      size={14} 
                      strokeWidth={isSelected ? 2.5 : 2} 
                      className={isSelected ? 'text-[#40bcf4]' : ''} 
                    />
                  </button>
                );
              })}
            </div>

          </div>

        </div>

        {/* ROW 2: CATEGORY CHANNEL CHIPS */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-slate-200/70 dark:border-[#262E3B]">
          <div className="flex items-center gap-1 shrink-0">
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#40bcf4]/15 border-[#40bcf4]/60 text-slate-900 dark:text-white font-bold'
                      : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800 dark:text-stone-400 dark:hover:text-stone-200'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-[#40bcf4] font-bold' : 'text-slate-400 dark:text-stone-400'}`}>
                    {categoryCounts[cat.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="text-[10px] font-mono text-slate-400 dark:text-stone-400 shrink-0 ml-auto hidden sm:inline">
            <strong className="text-slate-900 dark:text-white font-bold">{totalVisible}</strong> shows
          </span>
        </div>

        {/* INLINE EXPANDABLE DRAWER */}
        {isMoreFiltersOpen && (
          <div className="pt-2.5 mt-1 border-t border-slate-200/90 dark:border-[#262E3B] space-y-2.5 animate-in slide-in-from-top-2 duration-150">
            
            {/* Score Tier Row */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-stone-400">
                  Score Tier
                </span>
                {activeExtraFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 text-[9px] font-mono uppercase font-bold text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    <RotateCcw size={10} />
                    <span>Reset Extra Filters</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                {TIERS.map((tier) => {
                  const Icon = tier.icon;
                  const isSelected = tierFilter === tier.id;

                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => onTierChange(tier.id)}
                      className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded border text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#40bcf4]/15 border-[#40bcf4] text-[#40bcf4]'
                          : 'bg-white dark:bg-[#1A212C] border-slate-200 dark:border-[#2C3545] text-slate-700 dark:text-stone-300 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      {Icon && <Icon size={11} className={tier.color} />}
                      <span className="truncate">{tier.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Watch Status Row */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-stone-400 block">
                Watch Status
              </span>

              <div className="grid grid-cols-5 gap-1">
                {STATUSES.map((st) => {
                  const isSelected = statusFilter === st.value;
                  return (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => onStatusChange(st.value)}
                      className={`py-1.5 px-0.5 text-center rounded border text-[10px] font-mono font-bold transition-all cursor-pointer truncate ${
                        isSelected
                          ? 'bg-[#40bcf4]/15 border-[#40bcf4] text-[#40bcf4]'
                          : 'bg-white dark:bg-[#1A212C] border-slate-200 dark:border-[#2C3545] text-slate-700 dark:text-stone-300 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ACTIVE FILTER RIBBON */}
        {activeExtraFiltersCount > 0 && !isMoreFiltersOpen && (
          <div className="flex items-center justify-between gap-2 pt-1.5 mt-1 border-t border-slate-200/70 dark:border-[#262E3B] text-[10px] font-mono">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-slate-400 dark:text-stone-400 uppercase font-bold">Filters:</span>
              
              {tierFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#40bcf4]/15 border border-[#40bcf4]/30 text-[#40bcf4] font-bold">
                  {TIERS.find((t) => t.id === tierFilter)?.label}
                  <button type="button" onClick={() => onTierChange('ALL')} className="hover:text-white cursor-pointer ml-0.5">
                    <X size={10} />
                  </button>
                </span>
              )}

              {statusFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#40bcf4]/15 border border-[#40bcf4]/30 text-[#40bcf4] font-bold">
                  {STATUSES.find((s) => s.value === statusFilter)?.label}
                  <button type="button" onClick={() => onStatusChange('ALL')} className="hover:text-white cursor-pointer ml-0.5">
                    <X size={10} />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-slate-400 hover:text-rose-400 uppercase font-bold ml-1 cursor-pointer"
              >
                Clear
              </button>
            </div>

            <span className="text-slate-400 dark:text-stone-400 sm:hidden">
              {totalVisible} shows
            </span>
          </div>
        )}

      </div>
    </section>
  );
};

export default HomeHeroBanner;