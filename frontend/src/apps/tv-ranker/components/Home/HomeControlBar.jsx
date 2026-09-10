import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, LayoutGrid, LayoutList, Table as TableIcon, 
  ChevronDown, Check, Trophy, Heart, ArrowDownUp,
  Rows, Grid2X2, Sparkles, Flame, Eye, Clock,
  Filter, X
} from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'RATING_DESC', label: 'Highest Score' },
  { value: 'RATING_ASC', label: 'Lowest Score' },
  { value: 'TITLE', label: 'Alphabetical' },
  { value: 'RECENT', label: 'Recent Review' },
  { value: 'YEAR_DESC', label: 'Release Year' }
];

const STATUS_FILTERS = [
  { value: 'ALL', label: 'All Status' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'WATCHING', label: 'Watching' },
  { value: 'PLAN_TO_WATCH', label: 'Watchlist' },
  { value: 'DROPPED', label: 'Dropped' }
];

const VIEW_MODES = [
  { id: 'CARDS', label: 'Poster Grid', icon: LayoutGrid },
  { id: 'COMPACT_TILES', label: 'Dense Tiles', icon: Grid2X2 },
  { id: 'LIST', label: 'Editorial List', icon: LayoutList },
  { id: 'TIMELINE', label: 'Log Timeline', icon: Rows },
  { id: 'TABLE', label: 'Audit Ledger', icon: TableIcon }
];

const TIER_FILTERS = [
  { id: 'ALL', label: 'All Vault' },
  { id: 'GOD_TIER', label: '9.0+ Masterpiece', icon: Trophy, color: 'text-amber-400' },
  { id: 'ACCLAIMED', label: '8.5+ Acclaimed', icon: Sparkles, color: 'text-rose-400' },
  { id: 'BANGER', label: '8.0+ Solid', icon: Flame, color: 'text-orange-400' },
  { id: 'CASUAL', label: '< 8.0 Casual', icon: Eye, color: 'text-cyan-400' },
  { id: 'FAVORITES', label: 'Favorites', icon: Heart, color: 'text-pink-400' },
  { id: 'WATCHLIST', label: 'Queue', icon: Clock, color: 'text-slate-400' }
];

const HomeControlBar = ({ 
  searchQuery, 
  onSearchChange, 
  layoutView, 
  onLayoutChange, 
  sortBy, 
  onSortChange, 
  tierFilter, 
  onTierChange, 
  statusFilter = 'ALL',
  onStatusChange = () => {},
  totalVisible 
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const sortRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setIsSortOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target)) setIsStatusOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSortObj = SORT_OPTIONS.find(s => s.value === sortBy) || SORT_OPTIONS[0];
  const currentStatusObj = STATUS_FILTERS.find(s => s.value === statusFilter) || STATUS_FILTERS[0];
  const hasActiveFilters = searchQuery.trim() !== '' || tierFilter !== 'ALL' || statusFilter !== 'ALL';

  return (
    <div className="flex flex-col gap-3 bg-gradient-to-r from-[#170B20] via-[#0F0D24] to-[#0A1224] border border-rose-500/30 p-3.5 sm:p-4 rounded-lg shadow-[0_4px_25px_rgba(244,63,94,0.1)] text-left relative z-20 font-sans backdrop-blur-xl text-white">
      
      {/* Decorative Top Accent Horizon */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-amber-400/80 via-rose-500/80 to-cyan-400/80 pointer-events-none" />

      {/* --- TOP ROW: UNIFIED COMMAND BAR --- */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        
        {/* Search Field */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-300/60 size-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search titles, directors, genres (e.g., Succession, Scam 1992)..."
            className="w-full h-10 pl-10 pr-8 rounded-md bg-white/[0.07] border border-white/10 text-xs font-semibold text-white placeholder:text-slate-400 outline-none focus:border-rose-500 focus:bg-white/[0.1] focus:ring-1 focus:ring-rose-500/30 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Right Controls: View Switcher + Floating Popovers */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          
          {/* 5 View Mode Buttons */}
          <div className="flex items-center bg-black/40 p-0.5 rounded-md border border-white/10 shadow-inner">
            {VIEW_MODES.map((m) => {
              const Icon = m.icon;
              const isSelected = layoutView === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onLayoutChange(m.id)}
                  title={m.label}
                  className={`p-1.5 rounded-sm transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon size={14} strokeWidth={isSelected ? 2.5 : 2} />
                </button>
              );
            })}
          </div>

          {/* Status Filter Popover */}
          <div className="relative" ref={statusRef}>
            <button
              type="button"
              onClick={() => {
                setIsStatusOpen(!isStatusOpen);
                setIsSortOpen(false);
              }}
              className={`h-10 px-3 flex items-center gap-1.5 rounded-md border text-xs font-mono font-bold uppercase transition-all cursor-pointer outline-none shadow-xs ${
                statusFilter !== 'ALL'
                  ? 'bg-rose-500/20 text-amber-300 border-rose-500/50 shadow-rose-500/10'
                  : 'bg-white/[0.07] border-white/10 text-slate-200 hover:border-rose-400/40 hover:bg-white/10'
              }`}
            >
              <Filter size={11} className="text-rose-400" />
              <span className="hidden md:inline">{currentStatusObj.label}</span>
              <ChevronDown size={12} className={`text-slate-400 transition-transform ${isStatusOpen ? 'rotate-180 text-rose-400' : ''}`} />
            </button>

            {isStatusOpen && (
              <div className="absolute top-[calc(100%+4px)] right-0 w-44 z-50 bg-[#0E0A1E] border border-rose-500/30 rounded-md shadow-2xl p-1 space-y-0.5 animate-in fade-in duration-150 backdrop-blur-xl">
                {STATUS_FILTERS.map((st) => {
                  const isSelected = st.value === statusFilter;
                  return (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => {
                        onStatusChange(st.value);
                        setIsStatusOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-1.5 rounded-sm text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-500/25 text-amber-300 font-bold border border-rose-500/40'
                          : 'hover:bg-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span className="text-[11px] font-mono font-bold uppercase">{st.label}</span>
                      {isSelected && <Check size={12} className="text-amber-400 shrink-0" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sort Popover */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsStatusOpen(false);
              }}
              className="h-10 px-3 flex items-center gap-1.5 rounded-md bg-white/[0.07] border border-white/10 text-slate-200 hover:border-amber-400/40 hover:bg-white/10 text-xs font-mono font-bold uppercase transition-all cursor-pointer outline-none shadow-xs"
            >
              <ArrowDownUp size={11} className="text-amber-400" />
              <span className="hidden md:inline">{currentSortObj.label}</span>
              <ChevronDown size={12} className={`text-slate-400 transition-transform ${isSortOpen ? 'rotate-180 text-amber-400' : ''}`} />
            </button>

            {isSortOpen && (
              <div className="absolute top-[calc(100%+4px)] right-0 w-52 z-50 bg-[#0E0A1E] border border-amber-500/30 rounded-md shadow-2xl p-1 space-y-0.5 animate-in fade-in duration-150 backdrop-blur-xl">
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = opt.value === sortBy;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onSortChange(opt.value);
                        setIsSortOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-sm text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                          : 'hover:bg-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span className="text-[11px] font-mono font-bold uppercase">{opt.label}</span>
                      {isSelected && <Check size={12} className="text-amber-400 shrink-0" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* --- BOTTOM ROW: TIER STRIP & RESULT TELEMETRY --- */}
      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/10 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300/80 mr-1 hidden sm:inline">
            Tier Gate:
          </span>

          {TIER_FILTERS.map((tab) => {
            const Icon = tab.icon;
            const active = tierFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTierChange(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                  active
                    ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white border-rose-400 shadow-md shadow-rose-600/20'
                    : 'bg-white/[0.05] text-slate-300 border-white/10 hover:border-white/20 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {Icon && <Icon size={10} className={active ? 'text-white' : tab.color || 'text-slate-400'} />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Counter & Quick Reset */}
        <div className="flex items-center gap-2.5 shrink-0 pl-2 ml-auto text-[10px] font-mono">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onTierChange('ALL');
                onStatusChange('ALL');
              }}
              className="text-amber-400 hover:text-amber-300 hover:underline font-bold uppercase cursor-pointer tracking-wider"
            >
              Reset
            </button>
          )}
          <span className="text-slate-400">
            Dossier: <strong className="text-white font-bold">{totalVisible}</strong> Shows
          </span>
        </div>
      </div>

    </div>
  );
};

export default HomeControlBar;