import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Clapperboard, Heart, Loader2, 
  ChevronLeft, ChevronRight, ChevronDown, Check
} from 'lucide-react';

const DEFAULT_POSTERS = [
  'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&q=80',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&q=80'
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const HomeShowCatalog = ({ 
  filteredShows = [], 
  layoutView = 'CARDS', 
  isLoading = false, 
  categorizeShow, 
  onSelectItem, 
  onToggleFavorite 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  
  const pageSizeRef = useRef(null);
  const catalogTopRef = useRef(null);
  const isInitialMount = useRef(true);

  // Auto-reset to Page 1 when total shows change or layout changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredShows.length, layoutView]);

  // Smooth Auto-Scroll to Top of Catalog on Page Change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (catalogTopRef.current) {
      catalogTopRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [currentPage]);

  // Click outside handler for page density selector
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pageSizeRef.current && !pageSizeRef.current.contains(e.target)) {
        setIsPageSizeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Compute sliced records
  const totalRecords = filteredShows.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const indexOfLastRecord = currentPage * itemsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;

  const currentShows = useMemo(() => {
    return filteredShows.slice(indexOfFirstRecord, indexOfLastRecord);
  }, [filteredShows, indexOfFirstRecord, indexOfLastRecord]);

  // Numbered pagination range calculation
  const paginationRange = useMemo(() => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }, [totalPages, currentPage]);

  const getScoreBadge = (score) => {
    if (!score || score === 0) {
      return 'bg-slate-200 text-slate-700 border-slate-400 dark:bg-white/10 dark:text-slate-400 dark:border-white/20';
    }
    if (score >= 9.0) {
      return 'bg-amber-400 text-slate-950 font-black border-2 border-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.5)] dark:bg-amber-400/20 dark:text-amber-300 dark:border-amber-400';
    }
    if (score >= 8.5) {
      return 'bg-[#40bcf4] text-slate-950 font-black border-2 border-[#0284c7] shadow-[0_0_12px_rgba(64,188,244,0.5)] dark:bg-[#40bcf4]/20 dark:text-[#40bcf4] dark:border-[#40bcf4]';
    }
    if (score >= 8.0) {
      return 'bg-orange-400 text-slate-950 font-black border-2 border-orange-500 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-400';
    }
    if (score >= 7.0) {
      return 'bg-cyan-400 text-slate-950 font-bold border-2 border-cyan-500 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-400';
    }
    return 'bg-slate-200 text-slate-900 border-2 border-slate-400 dark:bg-white/10 dark:text-slate-300 dark:border-white/20 font-bold';
  };

  const getFormatLabel = (item) => {
    const rawType = item.show?.type || item.type || 'TV_SERIES';
    switch (rawType) {
      case 'MINISERIES': return 'Miniseries';
      case 'MOVIE': return 'Movie';
      case 'ANIME': return 'Anime';
      case 'DOCUMENTARY': return 'Docuseries';
      default: return 'TV Series';
    }
  };

  const getGenreLabel = (item) => {
    const genres = item.show?.genres || [];
    if (genres.length > 0) return genres[0];
    const category = categorizeShow ? categorizeShow(item) : 'HOLLYWOOD';
    return category === 'INDIAN' ? 'Desi' : category === 'ANIME' ? 'Anime' : 'Global';
  };

  if (isLoading) {
    return (
      <div className="w-full h-80 flex flex-col items-center justify-center gap-3 transition-colors duration-300">
        <Loader2 size={32} className="text-[#40bcf4] animate-spin" />
        <p className="text-xs font-mono font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
          Syncing Catalog Ledger...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full font-sans select-none flex flex-col gap-5">

      {/* ========================================================================= */}
      {/* 1. TOP EDITORIAL META LINE (Anchor Target for Auto-Scroll)                */}
      {/* ========================================================================= */}
      <div 
        ref={catalogTopRef}
        className="scroll-mt-20 flex items-center justify-between pb-3 border-b-2 border-slate-300 dark:border-[#262E3B] text-xs transition-colors duration-300"
      >
        {/* Left: Summary Counter */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#40bcf4] opacity-80" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#40bcf4]" />
          </span>
          <p className="font-mono text-xs text-slate-700 dark:text-stone-300 font-medium">
            Showing <strong className="text-slate-950 dark:text-white font-black underline decoration-[#40bcf4] decoration-2">{totalRecords > 0 ? indexOfFirstRecord + 1 : 0}</strong>–
            <strong className="text-slate-950 dark:text-white font-black underline decoration-[#40bcf4] decoration-2">{Math.min(indexOfLastRecord, totalRecords)}</strong> of{' '}
            <strong className="text-[#0284c7] dark:text-[#40bcf4] font-black">{totalRecords}</strong> titles
          </p>
        </div>

        {/* Right: Page Density Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-stone-400 font-bold hidden xs:inline">
            Density:
          </span>

          <div className="relative" ref={pageSizeRef}>
            <button
              type="button"
              onClick={() => setIsPageSizeOpen((prev) => !prev)}
              className="h-8 px-3 flex items-center gap-2 rounded-xs bg-white dark:bg-[#161B22] border-2 border-slate-300 dark:border-[#2C3545] text-xs font-mono font-black text-slate-900 dark:text-stone-200 hover:border-[#40bcf4] hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer outline-none shadow-xs"
            >
              <span>{itemsPerPage} / view</span>
              <ChevronDown 
                size={12} 
                className={`text-[#40bcf4] transition-transform duration-200 ${isPageSizeOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {isPageSizeOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] w-36 rounded-xs bg-white dark:bg-[#161B22] border-2 border-slate-300 dark:border-[#2C3545] shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[8px] font-mono tracking-wider uppercase text-slate-400 select-none">
                  Page Density
                </div>
                {PAGE_SIZE_OPTIONS.map((size) => {
                  const isSelected = itemsPerPage === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setItemsPerPage(size);
                        setCurrentPage(1);
                        setIsPageSizeOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-2xs text-xs font-mono font-bold transition-colors cursor-pointer text-left ${
                        isSelected
                          ? 'bg-[#40bcf4] text-slate-950 font-black'
                          : 'text-slate-700 dark:text-stone-300 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <span>{size} rows</span>
                      {isSelected && <Check size={12} strokeWidth={3} className="text-slate-950" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CATALOG CONTENT AREA                                                   */}
      {/* ========================================================================= */}
      <div>
        
        {/* Empty State */}
        {filteredShows.length === 0 && (
          <div className="p-14 text-center rounded-xs bg-white dark:bg-[#0A0F17] border-2 border-dashed border-slate-300 dark:border-[#22334A] space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-xs bg-slate-100 dark:bg-white/5 border-2 border-slate-300 dark:border-white/10 flex items-center justify-center mx-auto text-slate-500">
              <Clapperboard size={24} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-white">
              No Matching Titles
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto font-mono">
              Adjust your category filter, tier rating, or search parameters to populate records.
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: CARDS VIEW (Tactile 3D Cards Restored)                            */}
        {/* ========================================================================= */}
        {filteredShows.length > 0 && layoutView === 'CARDS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {currentShows.map((item, index) => {
              const poster = item.show?.posterUrl || DEFAULT_POSTERS[index % DEFAULT_POSTERS.length];
              const globalIndex = indexOfFirstRecord + index + 1;
              const format = getFormatLabel(item);
              const genre = getGenreLabel(item);

              return (
                <div
                  key={item._id}
                  onClick={() => onSelectItem(item)}
                  className="group relative rounded-xs bg-white dark:bg-[#0A0F16] border-2 border-slate-900 dark:border-[#1F2E42] hover:border-[#40bcf4] dark:hover:border-[#40bcf4] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.9),0_0_12px_rgba(64,188,244,0.15)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[0_16px_36px_rgba(0,0,0,1),0_0_24px_rgba(64,188,244,0.4)] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-row sm:flex-col justify-between overflow-hidden text-left"
                >
                  {/* Photo Container */}
                  <div className="relative w-28 xs:w-32 sm:w-full h-auto sm:h-48 shrink-0 bg-slate-950 overflow-hidden border-r-2 sm:border-r-0 sm:border-b-2 border-slate-900 dark:border-[#1F2E42]">
                    <img
                      src={poster}
                      alt={item.show?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-95"
                      onError={(e) => { e.target.src = DEFAULT_POSTERS[0]; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 sm:from-black/60 via-transparent to-transparent" />

                    {/* Rank Badge */}
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-xs bg-slate-950 text-white font-mono text-[9px] font-black border-2 border-white/30 shadow-md">
                      #{globalIndex}
                    </div>

                    {/* Score Badge (Visible on Desktop) */}
                    <div className="hidden sm:block absolute top-2 right-2">
                      <div className={`px-2 py-0.5 rounded-xs text-xs font-mono ${getScoreBadge(item.rating)}`}>
                        {item.rating ? item.rating.toFixed(1) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Details Container */}
                  <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between gap-2.5 bg-white dark:bg-[#0A0F16] min-w-0">
                    
                    {/* Top Row: Meta & Title */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.2 rounded-xs text-[9px] font-mono font-black uppercase bg-[#40bcf4]/15 border border-[#40bcf4]/40 text-[#0284c7] dark:text-[#40bcf4]">
                          {genre}
                        </span>
                        <span className="px-1.5 py-0.2 rounded-xs text-[9px] font-mono font-bold uppercase bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300">
                          {format}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-[1000] uppercase text-slate-950 dark:text-white tracking-tight line-clamp-2 leading-tight">
                        {item.show?.title}
                      </h4>
                    </div>

                    {/* Score Row for Mobile Only */}
                    <div className="flex sm:hidden items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Score</span>
                      <div className={`px-2 py-0.5 rounded-xs text-xs font-mono font-black ${getScoreBadge(item.rating)}`}>
                        {item.rating ? item.rating.toFixed(1) : 'N/A'}
                      </div>
                    </div>

                    {/* Bottom Action Strip: Wishlist + Edit Score Button */}
                    <div className="pt-2 border-t-2 border-slate-200 dark:border-[#1A2536] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(e, item._id);
                        }}
                        className={`p-1.5 rounded-xs transition-colors cursor-pointer border ${
                          item.isFavorite 
                            ? 'text-rose-600 bg-rose-50 border-rose-300 dark:bg-rose-500/20 dark:border-rose-500/40' 
                            : 'text-slate-500 border-slate-300 hover:text-rose-600 hover:border-rose-400 dark:border-slate-700 dark:text-slate-400'
                        }`}
                        title={item.isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      >
                        <Heart size={14} fill={item.isFavorite ? 'currentColor' : 'none'} strokeWidth={2.5} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem(item);
                        }}
                        className="px-2.5 py-1 rounded-xs bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-mono font-black uppercase tracking-wider hover:bg-[#0284c7] dark:hover:bg-[#40bcf4] transition-colors"
                      >
                        Edit Score
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: DENSE POSTER TILES (Tactile 3D Tiles Restored)                    */}
        {/* ========================================================================= */}
        {filteredShows.length > 0 && layoutView === 'COMPACT_TILES' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-3.5">
            {currentShows.map((item, index) => {
              const poster = item.show?.posterUrl || DEFAULT_POSTERS[index % DEFAULT_POSTERS.length];
              const globalIndex = indexOfFirstRecord + index + 1;

              return (
                <div
                  key={item._id}
                  onClick={() => onSelectItem(item)}
                  className="group relative aspect-2/3 rounded-xs bg-slate-950 border-2 border-slate-900 dark:border-[#1E2E42] hover:border-[#40bcf4] shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.8)] hover:-translate-y-1 overflow-hidden cursor-pointer text-left transition-all duration-200"
                >
                  <img
                    src={poster}
                    alt={item.show?.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85"
                    onError={(e) => { e.target.src = DEFAULT_POSTERS[0]; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Top Index */}
                  <div className="absolute top-1.5 left-1.5 px-1 py-0.2 rounded-xs bg-black/85 text-white font-mono text-[9px] font-black border border-white/25">
                    #{globalIndex}
                  </div>

                  {/* Score Tag */}
                  <div className="absolute top-1.5 right-1.5">
                    <div className={`px-2 py-0.5 rounded-xs text-[11px] font-mono font-black ${getScoreBadge(item.rating)}`}>
                      {item.rating ? item.rating.toFixed(1) : '—'}
                    </div>
                  </div>

                  {/* Bottom Strip: Title & Wishlist */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-end justify-between gap-1.5">
                      <p className="text-xs font-[1000] uppercase text-white truncate leading-tight drop-shadow-md flex-1">
                        {item.show?.title}
                      </p>
                      {item.isFavorite && (
                        <Heart size={12} className="fill-rose-500 text-rose-500 shrink-0 mb-0.5" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: LIST VIEW (Tactile Rows & Full Unbroken Titles Restored)          */}
        {/* ========================================================================= */}
        {filteredShows.length > 0 && layoutView === 'LIST' && (
          <div className="flex flex-col divide-y-2 divide-slate-900 dark:divide-[#1E2E42] border-2 border-slate-900 dark:border-[#1E2E42] rounded-xs overflow-hidden bg-white dark:bg-[#0A0F16] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            {currentShows.map((item, index) => {
              const poster = item.show?.posterUrl || DEFAULT_POSTERS[index % DEFAULT_POSTERS.length];
              const globalIndex = indexOfFirstRecord + index + 1;
              const format = getFormatLabel(item);
              const genre = getGenreLabel(item);

              return (
                <div
                  key={item._id}
                  onClick={() => onSelectItem(item)}
                  className="p-3.5 hover:bg-slate-100 dark:hover:bg-[#121A26] transition-colors cursor-pointer flex items-center justify-between gap-3 sm:gap-4 text-left"
                >
                  {/* Left Cluster: Index, Poster & Full Title Block */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <span className="font-mono text-xs font-black text-slate-900 dark:text-slate-300 w-6 text-right shrink-0">
                      #{globalIndex}
                    </span>

                    <div className="w-10 h-12 rounded-xs overflow-hidden bg-slate-950 shrink-0 border-2 border-slate-900 dark:border-white/20 shadow-xs">
                      <img src={poster} alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Unbroken Title Container */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-[1000] uppercase text-slate-950 dark:text-white break-words">
                          {item.show?.title}
                        </h4>
                        
                        <span className="px-1.5 py-0.2 rounded-xs text-[9px] font-mono font-black uppercase bg-[#40bcf4] text-slate-950 border border-[#0284c7] shrink-0">
                          {genre}
                        </span>

                        <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-xs text-[9px] font-mono font-bold uppercase bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 shrink-0">
                          {format}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Cluster: Wishlist & Rating */}
                  <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(e, item._id);
                      }}
                      className={`p-1.5 rounded-xs transition-colors cursor-pointer border ${
                        item.isFavorite 
                          ? 'text-rose-600 bg-rose-50 border-rose-300 dark:bg-rose-500/20 dark:border-rose-500/40' 
                          : 'text-slate-400 border-slate-300 hover:text-rose-600 dark:border-slate-700'
                      }`}
                      title={item.isFavorite ? 'Remove Wishlist' : 'Add Wishlist'}
                    >
                      <Heart size={14} fill={item.isFavorite ? 'currentColor' : 'none'} strokeWidth={2.5} />
                    </button>

                    <div className={`px-2.5 py-0.5 rounded-xs text-xs font-mono ${getScoreBadge(item.rating)}`}>
                      {item.rating ? item.rating.toFixed(1) : 'N/A'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 3. DOCKED BOTTOM PAGINATION (High Contrast Brutalist Strip)               */}
      {/* ========================================================================= */}
      {filteredShows.length > 0 && (
        <div className="pt-4 border-t-2 border-slate-300 dark:border-[#262E3B] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs transition-colors duration-300">
          
          {/* Direct Jump Indicator */}
          <div className="text-[11px] font-mono text-slate-700 dark:text-stone-300">
            Page <span className="font-black text-[#0284c7] dark:text-[#40bcf4]">{currentPage}</span> of <span className="font-black text-slate-900 dark:text-white">{totalPages}</span>
          </div>

          {/* Stepped Number Pills */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            
            {/* Prev Button */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xs border-2 border-slate-900 dark:border-[#2C3545] bg-white dark:bg-[#161B22] text-slate-900 dark:text-stone-200 hover:border-[#40bcf4] hover:text-[#0284c7] dark:hover:text-[#40bcf4] text-xs font-mono font-black shadow-xs transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Previous Page"
            >
              <ChevronLeft size={13} strokeWidth={3} />
              <span className="text-[10px] uppercase font-mono tracking-tight hidden xs:inline">Prev</span>
            </button>

            {/* Page Chips */}
            <div className="flex items-center gap-1 mx-0.5 sm:mx-1">
              {paginationRange.map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-1.5 py-1 text-slate-400 dark:text-stone-500 font-mono text-xs">
                      ...
                    </span>
                  );
                }

                const isSelected = currentPage === page;
                return (
                  <button
                    key={`page-${page}`}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 min-w-[34px] px-2 rounded-xs text-xs font-mono font-black transition-all cursor-pointer border-2 ${
                      isSelected
                        ? 'bg-[#40bcf4] border-[#40bcf4] text-slate-950 shadow-[0_0_12px_rgba(64,188,244,0.5)]'
                        : 'bg-white dark:bg-[#161B22] border-slate-900 dark:border-[#2C3545] text-slate-900 dark:text-stone-200 hover:border-[#40bcf4]'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xs border-2 border-[#40bcf4] bg-[#40bcf4] text-slate-950 hover:bg-[#38aade] text-xs font-mono font-black shadow-[0_0_12px_rgba(64,188,244,0.35)] transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Next Page"
            >
              <span className="text-[10px] uppercase font-mono tracking-tight hidden xs:inline">Next</span>
              <ChevronRight size={13} strokeWidth={3} />
            </button>

          </div>

        </div>
      )}

    </div>
  );
};

export default HomeShowCatalog;