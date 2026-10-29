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
  ChevronDown,
  Film,
  Tv
} from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All', shortLabel: 'All', icon: Film },
  { id: 'INDIAN', label: 'Indian', shortLabel: 'Indian', icon: Flame },
  { id: 'HOLLYWOOD', label: 'Hollywood', shortLabel: 'West', icon: Tv },
  { id: 'ANIME', label: 'Anime', shortLabel: 'Anime', icon: Sparkles }
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

  const typeCounts = [
    { label: 'Hollywood', count: stats.hollywoodCount || 0, dot: 'bg-cyan-400', text: 'text-cyan-600 dark:text-[#40bcf4]' },
    { label: 'Indian', count: stats.indianCount || 0, dot: 'bg-amber-400', text: 'text-amber-500 dark:text-amber-400' },
    { label: 'Anime', count: stats.animeCount || 0, dot: 'bg-rose-400', text: 'text-rose-500 dark:text-rose-400' }
  ];

  return (
    <div className="relative w-full font-sans select-none flex flex-col gap-4 sm:gap-6 pt-1">
      
      {/* ========================================================================= */}
      {/* 1. EDITORIAL HEADER & SEAMLESS INLINE TALLIES                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-2 pt-6 sm:pb-3">
        
        {/* Title, Badge & Subtitle */}
        <div className="space-y-2 max-w-2xl min-w-0">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[1000] uppercase tracking-tight text-slate-950 dark:text-white leading-[1.04]">
            The <span className="text-[#40bcf4]">Couch Hierarchy</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-stone-400 font-medium leading-relaxed max-w-xl">
            An unfiltered ranking of every series, season, and miniseries watched. Scored critically, ranked comparatively, and re-evaluated whenever a rewatch demands it.
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
      {/* 2. COMMAND BAR (SEARCH, SORT, FILTERS & VIEW MODES)                       */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-3">
        
        {/* ROW 1: Search, Sort, Filters Button, Layout Views */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-stone-400 size-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search series, genres, tags..."
              className="w-full h-9 pl-9 pr-8 rounded-xs bg-white dark:bg-[#12171F] border-2 border-slate-300 dark:border-[#2C3545] text-xs font-mono font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-stone-500 outline-none focus:border-[#40bcf4] transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                title="Clear Search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Action Tools Cluster: Sort, Filter, Views */}
          <div className="flex items-center justify-between sm:justify-start gap-1.5 shrink-0">
            
            {/* Sort Dropdown */}
            <div className={`relative shrink-0 flex-1 sm:flex-initial ${isSortOpen ? 'z-50' : 'z-10'}`} ref={sortRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen((prev) => !prev)}
                className={`w-full sm:w-auto flex items-center justify-center h-9 px-3 rounded-xs border-2 text-xs font-mono font-black transition-all cursor-pointer shadow-xs ${
                  sortBy !== 'RATING_DESC'
                    ? 'bg-[#40bcf4]/15 border-[#40bcf4] text-[#0284c7] dark:text-[#40bcf4]'
                    : 'bg-white dark:bg-[#12171F] border-slate-300 dark:border-[#2C3545] text-slate-900 dark:text-stone-200 hover:border-[#40bcf4]'
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
                <div className="absolute left-0 sm:left-auto sm:right-0 top-[calc(100%+6px)] w-44 rounded-xs bg-white dark:bg-[#161B22] border-2 border-slate-300 dark:border-[#2C3545] shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[8px] font-mono tracking-wider uppercase text-slate-400 select-none">
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
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-2xs text-xs font-mono font-bold transition-colors cursor-pointer text-left ${
                            isSelected
                              ? 'bg-[#40bcf4] text-slate-950 font-black'
                              : 'text-slate-700 dark:text-stone-300 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <span className="text-[11px] truncate">{opt.label}</span>
                          {isSelected && <Check size={11} strokeWidth={3} className="text-slate-950 shrink-0" />}
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
              className={`flex items-center justify-center gap-1.5 h-9 px-3 rounded-xs border-2 text-xs font-mono font-black transition-all cursor-pointer shrink-0 shadow-xs ${
                isMoreFiltersOpen || activeExtraFiltersCount > 0
                  ? 'bg-[#40bcf4]/15 border-[#40bcf4] text-[#0284c7] dark:text-[#40bcf4]'
                  : 'bg-white dark:bg-[#12171F] border-slate-300 dark:border-[#2C3545] text-slate-900 dark:text-stone-200 hover:border-[#40bcf4]'
              }`}
              title="Toggle More Filters"
            >
              <SlidersHorizontal size={13} strokeWidth={2.4} />
              <span className="text-[10px] uppercase font-mono tracking-tight hidden xs:inline">
                Filters
              </span>
              {activeExtraFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black flex items-center justify-center font-mono">
                  {activeExtraFiltersCount}
                </span>
              )}
              <ChevronDown 
                size={12} 
                className={`transition-transform duration-200 ${isMoreFiltersOpen ? 'rotate-180 text-[#40bcf4]' : 'text-slate-400'}`} 
              />
            </button>

            {/* 3 Layout Views: Strictly Icons Only */}
            <div className="flex items-center bg-white dark:bg-[#12171F] p-0.5 rounded-xs border-2 border-slate-300 dark:border-[#2C3545] shrink-0 shadow-xs">
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
                    className={`p-1.5 rounded-2xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#40bcf4] text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon 
                      size={14} 
                      strokeWidth={isSelected ? 3 : 2} 
                      className={isSelected ? 'text-slate-950' : ''} 
                    />
                  </button>
                );
              })}
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* ROW 2: OPEN DOCKED TABS (Natural edge-to-edge baseline divider)           */}
        {/* ========================================================================= */}
        <div className="w-full border-b border-slate-200/90 dark:border-white/10 pt-1">
          <div className="flex items-center justify-between -mb-px">
            <div className="grid grid-cols-4 sm:flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                const count = categoryCounts[cat.id] ?? 0;
                const Icon = cat.icon;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
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

            <span className="text-[11px] font-mono text-slate-500 dark:text-stone-400 shrink-0 ml-auto pb-2 hidden sm:inline font-bold">
              <strong className="text-slate-950 dark:text-white font-black">{totalVisible}</strong> titles cataloged
            </span>
          </div>
        </div>

        {/* INLINE EXPANDABLE DRAWER */}
        {isMoreFiltersOpen && (
          <div className="pt-3 pb-1 space-y-3 animate-in slide-in-from-top-2 duration-150 border-b-2 border-slate-300 dark:border-[#262E3B]">
            
            {/* Score Tier Row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 dark:text-stone-400">
                  Score Tier
                </span>
                {activeExtraFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 text-[10px] font-mono uppercase font-black text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    <RotateCcw size={11} />
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {TIERS.map((tier) => {
                  const Icon = tier.icon;
                  const isSelected = tierFilter === tier.id;

                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => onTierChange(tier.id)}
                      className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-xs border-2 text-[10px] font-mono font-black transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#40bcf4] border-[#40bcf4] text-slate-950 shadow-xs'
                          : 'bg-white dark:bg-[#12171F] border-slate-300 dark:border-[#2C3545] text-slate-700 dark:text-stone-300 hover:border-[#40bcf4]'
                      }`}
                    >
                      {Icon && <Icon size={12} className={isSelected ? 'text-slate-950' : tier.color} />}
                      <span className="truncate">{tier.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Watch Status Row */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 dark:text-stone-400 block">
                Watch Status
              </span>

              <div className="grid grid-cols-5 gap-1.5">
                {STATUSES.map((st) => {
                  const isSelected = statusFilter === st.value;
                  return (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => onStatusChange(st.value)}
                      className={`py-1.5 px-0.5 text-center rounded-xs border-2 text-[10px] font-mono font-black transition-all cursor-pointer truncate ${
                        isSelected
                          ? 'bg-[#40bcf4] border-[#40bcf4] text-slate-950 shadow-xs'
                          : 'bg-white dark:bg-[#12171F] border-slate-300 dark:border-[#2C3545] text-slate-700 dark:text-stone-300 hover:border-[#40bcf4]'
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
          <div className="flex items-center justify-between gap-2 pt-1 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 dark:text-stone-400 uppercase font-bold">Filters:</span>
              
              {tierFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#40bcf4]/15 border border-[#40bcf4]/40 text-[#0284c7] dark:text-[#40bcf4] font-black">
                  {TIERS.find((t) => t.id === tierFilter)?.label}
                  <button type="button" onClick={() => onTierChange('ALL')} className="hover:text-rose-500 cursor-pointer ml-0.5">
                    <X size={11} />
                  </button>
                </span>
              )}

              {statusFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#40bcf4]/15 border border-[#40bcf4]/40 text-[#0284c7] dark:text-[#40bcf4] font-black">
                  {STATUSES.find((s) => s.value === statusFilter)?.label}
                  <button type="button" onClick={() => onStatusChange('ALL')} className="hover:text-rose-500 cursor-pointer ml-0.5">
                    <X size={11} />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-slate-400 hover:text-rose-500 uppercase font-black ml-1 cursor-pointer"
              >
                Clear
              </button>
            </div>

            <span className="text-slate-400 dark:text-stone-400 sm:hidden font-mono">
              {totalVisible} shows
            </span>
          </div>
        )}

      </div>
    </div>
  );
};

export default HomeHeroBanner;