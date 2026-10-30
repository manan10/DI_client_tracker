import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Clapperboard, Heart, Loader2, 
  ChevronLeft, ChevronRight, ChevronDown, Check,
  ListPlus, Plus, Bookmark, Layers, X
} from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../../../shared/hooks/useApi';

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
  const { request } = useApi();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  
  // Add to List Popover State
  const [activeListDropdownShowId, setActiveListDropdownShowId] = useState(null);
  const [userLists, setUserLists] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [addingToListId, setAddingToListId] = useState(null);

  const pageSizeRef = useRef(null);
  const catalogTopRef = useRef(null);
  const listDropdownRef = useRef(null);
  const isInitialMount = useRef(true);

  // Fetch available lists once or when opened
  const fetchUserLists = useCallback(async () => {
    setIsLoadingLists(true);
    try {
      const res = await request('/lists', 'GET');
      let data = [];
      if (Array.isArray(res)) data = res;
      else if (Array.isArray(res?.data)) data = res.data;
      else if (Array.isArray(res?.lists)) data = res.lists;
      // Filter out auto-managed system lists since items in system lists are derived from ratings/status
      setUserLists(data.filter((l) => !l.isSystem));
    } catch (err) {
      console.error('Failed to load user lists:', err);
    } finally {
      setIsLoadingLists(false);
    }
  }, [request]);

  useEffect(() => {
    fetchUserLists();
  }, [fetchUserLists]);

  // Handle Add Show to Selected List
  const handleAddShowToList = async (listId, showId, showTitle) => {
    if (!listId || !showId) return;
    setAddingToListId(listId);

    try {
      const res = await request(`/lists/${listId}/items`, 'POST', { showId });
      if (res?.success) {
        toast.success(`Added "${showTitle || 'Show'}" to list`);
        // Update local list state to show checkmark immediately
        setUserLists((prev) => 
          prev.map((l) => {
            if (l._id === listId) {
              const updatedItems = [...(l.items || []), { show: showId }];
              return { ...l, items: updatedItems };
            }
            return l;
          })
        );
      } else {
        toast.error(res?.message || 'Failed to add show to list');
      }
    } catch (err) {
      console.error('Add to list error:', err);
      toast.error(err.message || 'Error adding show to list');
    } finally {
      setAddingToListId(null);
    }
  };

  // Auto-reset to Page 1 when total shows change or layout changes
  useEffect(() => {
    setCurrentPage(1);
    setActiveListDropdownShowId(null);
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

  // Click outside handler for page density selector and list dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pageSizeRef.current && !pageSizeRef.current.contains(e.target)) {
        setIsPageSizeOpen(false);
      }
      if (listDropdownRef.current && !listDropdownRef.current.contains(e.target)) {
        setActiveListDropdownShowId(null);
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

  // Reusable Add-to-List Dropdown Menu Component
  const renderListDropdown = (rawShowId, showTitle, placement = 'bottom-right') => {
    const showId = String(rawShowId);
    const isOpen = activeListDropdownShowId === showId;
    if (!isOpen) return null;

    const placementClasses = placement === 'top-right'
      ? 'bottom-[calc(100%+6px)] right-0'
      : placement === 'bottom-left'
      ? 'top-[calc(100%+6px)] left-0'
      : 'top-[calc(100%+6px)] right-0';

    return (
      <div 
        ref={listDropdownRef}
        onClick={(e) => e.stopPropagation()}
        className={`absolute ${placementClasses} w-52 sm:w-56 rounded-none bg-white dark:bg-[#121926] border-2 border-slate-900 dark:border-black shadow-2xl p-1 z-50 text-left select-none animate-in fade-in zoom-in-95 duration-100`}
      >
        <div className="px-2.5 py-1.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400">
            <ListPlus size={11} className="text-[#40bcf4]" />
            <span>Add to List</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveListDropdownShowId(null)}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X size={11} />
          </button>
        </div>

        <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 py-1">
          {isLoadingLists ? (
            <div className="py-4 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
              <Loader2 size={13} className="animate-spin text-[#40bcf4]" />
              <span>Loading lists...</span>
            </div>
          ) : userLists.length === 0 ? (
            <div className="py-3 px-2 text-center text-[10px] font-mono text-slate-400">
              No custom lists found.
            </div>
          ) : (
            userLists.map((list) => {
              const isAlreadyInList = Array.isArray(list.items) && list.items.some(
                (it) => String(it.show?._id || it.show) === showId
              );
              const isAdding = addingToListId === list._id;

              return (
                <button
                  key={list._id}
                  type="button"
                  disabled={isAlreadyInList || isAdding}
                  onClick={() => handleAddShowToList(list._id, showId, showTitle)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-mono text-left transition-colors cursor-pointer disabled:cursor-default ${
                    isAlreadyInList
                      ? 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-stone-500'
                      : 'text-slate-800 dark:text-stone-200 hover:bg-[#40bcf4]/10 hover:text-[#0284c7] dark:hover:text-[#40bcf4]'
                  }`}
                >
                  <span className="truncate pr-2 font-bold text-[11px] uppercase">
                    {list.title}
                  </span>

                  <div className="shrink-0 flex items-center gap-1">
                    {isAdding ? (
                      <Loader2 size={12} className="animate-spin text-[#40bcf4]" />
                    ) : isAlreadyInList ? (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold text-[#00e054]">
                        <Check size={11} strokeWidth={3} />
                        In list
                      </span>
                    ) : (
                      <Plus size={12} strokeWidth={2.5} className="text-slate-400" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
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
    <div className="relative w-full font-sans select-none flex flex-col gap-3.5 sm:gap-5">

      {/* ========================================================================= */}
      {/* 1. TOP EDITORIAL META LINE (Anchor Target for Auto-Scroll)                */}
      {/* ========================================================================= */}
      <div 
        ref={catalogTopRef}
        className="scroll-mt-20 flex items-center justify-between pb-2.5 sm:pb-3 border-b-2 border-slate-300 dark:border-[#262E3B] text-xs transition-colors duration-300"
      >
        {/* Left: Summary Counter */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#40bcf4] opacity-80" />
            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-[#40bcf4]" />
          </span>
          <p className="font-mono text-[11px] sm:text-xs text-slate-700 dark:text-stone-300 font-medium">
            Showing <strong className="text-slate-950 dark:text-white font-black underline decoration-[#40bcf4] decoration-2">{totalRecords > 0 ? indexOfFirstRecord + 1 : 0}</strong>–
            <strong className="text-slate-950 dark:text-white font-black underline decoration-[#40bcf4] decoration-2">{Math.min(indexOfLastRecord, totalRecords)}</strong> of{' '}
            <strong className="text-[#0284c7] dark:text-[#40bcf4] font-black">{totalRecords}</strong> titles
          </p>
        </div>

        {/* Right: Page Density Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-stone-400 font-bold hidden xs:inline">
            Density:
          </span>

          <div className="relative" ref={pageSizeRef}>
            <button
              type="button"
              onClick={() => setIsPageSizeOpen((prev) => !prev)}
              className="h-7 sm:h-8 px-2 sm:px-3 flex items-center gap-1.5 sm:gap-2 rounded-xs bg-white dark:bg-[#161B22] border-2 border-slate-300 dark:border-[#2C3545] text-[11px] sm:text-xs font-mono font-black text-slate-900 dark:text-stone-200 hover:border-[#40bcf4] hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer outline-none shadow-xs"
            >
              <span>{itemsPerPage} / view</span>
              <ChevronDown 
                size={12} 
                className={`text-[#40bcf4] transition-transform duration-200 ${isPageSizeOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {isPageSizeOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] w-32 sm:w-36 rounded-xs bg-white dark:bg-[#161B22] border-2 border-slate-300 dark:border-[#2C3545] shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
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
          <div className="p-8 sm:p-14 text-center rounded-xs bg-white dark:bg-[#0A0F17] border-2 border-dashed border-slate-300 dark:border-[#22334A] space-y-3 shadow-sm">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xs bg-slate-100 dark:bg-white/5 border-2 border-slate-300 dark:border-white/10 flex items-center justify-center mx-auto text-slate-500">
              <Clapperboard size={20} className="sm:hidden" />
              <Clapperboard size={24} className="hidden sm:block" />
            </div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 dark:text-white">
              No Matching Titles
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto font-mono">
              Adjust your category filter, tier rating, or search parameters to populate records.
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: CARDS VIEW                                                        */}
        {/* ========================================================================= */}
        {filteredShows.length > 0 && layoutView === 'CARDS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-5">
            {currentShows.map((item, index) => {
              const showId = item.show?._id || item.show || item._id;
              const title = item.show?.title || item.title || 'Untitled Show';
              const poster = item.show?.posterUrl || DEFAULT_POSTERS[index % DEFAULT_POSTERS.length];
              const globalIndex = indexOfFirstRecord + index + 1;
              const format = getFormatLabel(item);
              const genre = getGenreLabel(item);

              return (
                <div
                  key={item._id}
                  onClick={() => onSelectItem(item)}
                  className="group relative rounded-xs bg-white dark:bg-[#0A0F16] border-2 border-slate-900 dark:border-[#1F2E42] hover:border-[#40bcf4] dark:hover:border-[#40bcf4] shadow-[2.5px_2.5px_0px_0px_rgba(15,23,42,1)] sm:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.8)] sm:dark:shadow-[0_12px_28px_rgba(0,0,0,0.9),0_0_12px_rgba(64,188,244,0.15)] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[0_16px_36px_rgba(0,0,0,1),0_0_24px_rgba(64,188,244,0.4)] hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-row sm:flex-col justify-between overflow-visible text-left"
                >
                  {/* Photo Container */}
                  <div className="relative w-20 xs:w-24 min-h-[105px] max-h-[125px] sm:min-h-0 sm:max-h-none sm:w-full sm:h-48 shrink-0 bg-slate-950 overflow-hidden border-r-2 sm:border-r-0 sm:border-b-2 border-slate-900 dark:border-[#1F2E42]">
                    <img
                      src={poster}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-95"
                      onError={(e) => { e.target.src = DEFAULT_POSTERS[0]; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 sm:from-black/60 via-transparent to-transparent" />

                    {/* Rank Badge */}
                    <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded-xs bg-slate-950 text-white font-mono text-[8px] sm:text-[9px] font-black border border-white/30 shadow-md">
                      #{globalIndex}
                    </div>

                    {/* Score Badge (Desktop) */}
                    <div className="hidden sm:block absolute top-2 right-2">
                      <div className={`px-2 py-0.5 rounded-xs text-xs font-mono ${getScoreBadge(item.rating)}`}>
                        {item.rating ? item.rating.toFixed(1) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Details Container */}
                  <div className="p-2 xs:p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between gap-1.5 sm:gap-2.5 bg-white dark:bg-[#0A0F16] min-w-0">
                    
                    {/* Top Row: Meta & Title */}
                    <div className="space-y-1 sm:space-y-1.5">
                      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                        <span className="px-1 sm:px-1.5 py-0.2 rounded-xs text-[8px] sm:text-[9px] font-mono font-black uppercase bg-[#40bcf4]/15 border border-[#40bcf4]/40 text-[#0284c7] dark:text-[#40bcf4]">
                          {genre}
                        </span>
                        <span className="px-1 sm:px-1.5 py-0.2 rounded-xs text-[8px] sm:text-[9px] font-mono font-bold uppercase bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300">
                          {format}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-base font-[1000] uppercase text-slate-950 dark:text-white tracking-tight line-clamp-2 leading-tight">
                        {title}
                      </h4>
                    </div>

                    {/* Score Row for Mobile Only */}
                    <div className="flex sm:hidden items-center justify-between gap-1.5 pt-0.5 border-t border-slate-100 dark:border-white/5">
                      <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Score</span>
                      <div className={`px-1.5 py-0.2 rounded-xs text-[10px] font-mono font-black ${getScoreBadge(item.rating)}`}>
                        {item.rating ? item.rating.toFixed(1) : 'N/A'}
                      </div>
                    </div>

                    {/* Bottom Action Strip: Wishlist + Add To List + Edit Score */}
                    <div className="pt-1.5 sm:pt-2 border-t sm:border-t-2 border-slate-200 dark:border-[#1A2536] flex items-center justify-between gap-1 sm:gap-1.5 relative">
                      <div className="flex items-center gap-1">
                        {/* Wishlist */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(e, item._id);
                          }}
                          className={`p-1 sm:p-1.5 rounded-xs transition-colors cursor-pointer border ${
                            item.isFavorite 
                              ? 'text-rose-600 bg-rose-50 border-rose-300 dark:bg-rose-500/20 dark:border-rose-500/40' 
                              : 'text-slate-500 border-slate-300 hover:text-rose-600 hover:border-rose-400 dark:border-slate-700 dark:text-slate-400'
                          }`}
                          title={item.isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                          <Heart size={12} className="sm:hidden" fill={item.isFavorite ? 'currentColor' : 'none'} strokeWidth={2.5} />
                          <Heart size={14} className="hidden sm:block" fill={item.isFavorite ? 'currentColor' : 'none'} strokeWidth={2.5} />
                        </button>

                        {/* Add to List Trigger Button */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveListDropdownShowId((prev) => prev === String(showId) ? null : String(showId));
                            }}
                            className={`p-1 sm:p-1.5 rounded-xs transition-colors cursor-pointer border ${
                              activeListDropdownShowId === String(showId)
                                ? 'bg-[#40bcf4] text-slate-950 border-[#40bcf4]'
                                : 'text-slate-500 border-slate-300 hover:text-[#40bcf4] hover:border-[#40bcf4] dark:border-slate-700 dark:text-slate-400'
                            }`}
                            title="Add to List"
                          >
                            <ListPlus size={12} className="sm:hidden" strokeWidth={2.5} />
                            <ListPlus size={14} className="hidden sm:block" strokeWidth={2.5} />
                          </button>

                          {/* Popover Menu */}
                          {renderListDropdown(showId, title, 'top-right')}
                        </div>
                      </div>

                      {/* Edit Score Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem(item);
                        }}
                        className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xs bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-wider hover:bg-[#0284c7] dark:hover:bg-[#40bcf4] transition-colors"
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
        {/* VIEW 2: DENSE POSTER TILES                                                */}
        {/* ========================================================================= */}
        {filteredShows.length > 0 && layoutView === 'COMPACT_TILES' && (
          <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3.5">
            {currentShows.map((item, index) => {
              const showId = item.show?._id || item.show || item._id;
              const title = item.show?.title || item.title || 'Untitled Show';
              const poster = item.show?.posterUrl || DEFAULT_POSTERS[index % DEFAULT_POSTERS.length];
              const globalIndex = indexOfFirstRecord + index + 1;

              return (
                <div
                  key={item._id}
                  onClick={() => onSelectItem(item)}
                  className="group relative aspect-2/3 rounded-xs bg-slate-950 border-2 border-slate-900 dark:border-[#1E2E42] hover:border-[#40bcf4] shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] sm:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.8)] hover:-translate-y-0.5 sm:hover:-translate-y-1 cursor-pointer text-left transition-all duration-200"
                >
                  <img
                    src={poster}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85"
                    onError={(e) => { e.target.src = DEFAULT_POSTERS[0]; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                  {/* Top Index */}
                  <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 px-1 py-0.2 rounded-xs bg-black/85 text-white font-mono text-[8px] sm:text-[9px] font-black border border-white/25">
                    #{globalIndex}
                  </div>

                  {/* Score Tag */}
                  <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5">
                    <div className={`px-1 sm:px-2 py-0.2 sm:py-0.5 rounded-xs text-[9px] sm:text-[11px] font-mono font-black ${getScoreBadge(item.rating)}`}>
                      {item.rating ? item.rating.toFixed(1) : '—'}
                    </div>
                  </div>

                  {/* Hover Overlay: Add to List Action */}
                  <div className="absolute top-8 right-1 sm:right-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveListDropdownShowId((prev) => prev === String(showId) ? null : String(showId));
                      }}
                      className="p-1 rounded-xs bg-black/80 hover:bg-[#40bcf4] text-white hover:text-black border border-white/30 transition-colors shadow-md"
                      title="Add to List"
                    >
                      <ListPlus size={11} strokeWidth={2.5} />
                    </button>

                    {renderListDropdown(showId, title, 'bottom-right')}
                  </div>

                  {/* Bottom Strip: Title & Wishlist */}
                  <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2">
                    <div className="flex items-end justify-between gap-1">
                      <p className="text-[10px] sm:text-xs font-[1000] uppercase text-white truncate leading-tight drop-shadow-md flex-1">
                        {title}
                      </p>
                      {item.isFavorite && (
                        <Heart size={10} className="sm:hidden fill-rose-500 text-rose-500 shrink-0 mb-0.5" />
                      )}
                      {item.isFavorite && (
                        <Heart size={12} className="hidden sm:block fill-rose-500 text-rose-500 shrink-0 mb-0.5" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: LIST VIEW                                                         */}
        {/* ========================================================================= */}
        {filteredShows.length > 0 && layoutView === 'LIST' && (
          <div className="flex flex-col divide-y-2 divide-slate-900 dark:divide-[#1E2E42] border-2 border-slate-900 dark:border-[#1E2E42] rounded-xs bg-white dark:bg-[#0A0F16] shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] sm:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            {currentShows.map((item, index) => {
              const showId = item.show?._id || item.show || item._id;
              const title = item.show?.title || item.title || 'Untitled Show';
              const poster = item.show?.posterUrl || DEFAULT_POSTERS[index % DEFAULT_POSTERS.length];
              const globalIndex = indexOfFirstRecord + index + 1;
              const format = getFormatLabel(item);
              const genre = getGenreLabel(item);

              return (
                <div
                  key={item._id}
                  onClick={() => onSelectItem(item)}
                  className="p-2 sm:p-3.5 hover:bg-slate-100 dark:hover:bg-[#121A26] transition-colors cursor-pointer flex items-center justify-between gap-2.5 sm:gap-4 text-left relative"
                >
                  {/* Left Cluster: Index, Poster & Full Title Block */}
                  <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
                    <span className="font-mono text-[10px] sm:text-xs font-black text-slate-900 dark:text-slate-300 w-5 sm:w-6 text-right shrink-0">
                      #{globalIndex}
                    </span>

                    <div className="w-7 h-9 sm:w-10 sm:h-12 rounded-xs overflow-hidden bg-slate-950 shrink-0 border sm:border-2 border-slate-900 dark:border-white/20 shadow-xs">
                      <img src={poster} alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Unbroken Title Container */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <h4 className="text-[11px] sm:text-sm font-[1000] uppercase text-slate-950 dark:text-white break-words leading-tight">
                          {title}
                        </h4>
                        
                        <span className="px-1 sm:px-1.5 py-0.2 rounded-xs text-[8px] sm:text-[9px] font-mono font-black uppercase bg-[#40bcf4] text-slate-950 border border-[#0284c7] shrink-0">
                          {genre}
                        </span>

                        <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-xs text-[9px] font-mono font-bold uppercase bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 shrink-0">
                          {format}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Cluster: Add to List, Wishlist & Rating */}
                  <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    {/* Add to List Trigger */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveListDropdownShowId((prev) => prev === String(showId) ? null : String(showId));
                        }}
                        className={`p-1 sm:p-1.5 rounded-xs transition-colors cursor-pointer border ${
                          activeListDropdownShowId === String(showId)
                            ? 'bg-[#40bcf4] text-slate-950 border-[#40bcf4]'
                            : 'text-slate-400 border-slate-300 hover:text-[#40bcf4] dark:border-slate-700'
                        }`}
                        title="Add to List"
                      >
                        <ListPlus size={12} className="sm:hidden" strokeWidth={2.5} />
                        <ListPlus size={14} className="hidden sm:block" strokeWidth={2.5} />
                      </button>

                      {renderListDropdown(showId, title, 'bottom-right')}
                    </div>

                    {/* Wishlist */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(e, item._id);
                      }}
                      className={`p-1 sm:p-1.5 rounded-xs transition-colors cursor-pointer border ${
                        item.isFavorite 
                          ? 'text-rose-600 bg-rose-50 border-rose-300 dark:bg-rose-500/20 dark:border-rose-500/40' 
                          : 'text-slate-400 border-slate-300 hover:text-rose-600 dark:border-slate-700'
                      }`}
                      title={item.isFavorite ? 'Remove Wishlist' : 'Add Wishlist'}
                    >
                      <Heart size={12} className="sm:hidden" fill={item.isFavorite ? 'currentColor' : 'none'} strokeWidth={2.5} />
                      <Heart size={14} className="hidden sm:block" fill={item.isFavorite ? 'currentColor' : 'none'} strokeWidth={2.5} />
                    </button>

                    {/* Score */}
                    <div className={`px-1.5 sm:px-2.5 py-0.2 sm:py-0.5 rounded-xs text-[10px] sm:text-xs font-mono ${getScoreBadge(item.rating)}`}>
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
      {/* 3. DOCKED BOTTOM PAGINATION                                               */}
      {/* ========================================================================= */}
      {filteredShows.length > 0 && (
        <div className="pt-3 sm:pt-4 border-t-2 border-slate-300 dark:border-[#262E3B] flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-xs transition-colors duration-300">
          
          {/* Direct Jump Indicator */}
          <div className="text-[10px] sm:text-[11px] font-mono text-slate-700 dark:text-stone-300">
            Page <span className="font-black text-[#0284c7] dark:text-[#40bcf4]">{currentPage}</span> of <span className="font-black text-slate-900 dark:text-white">{totalPages}</span>
          </div>

          {/* Stepped Number Pills */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
            
            {/* Prev Button */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 sm:gap-1.5 h-7 sm:h-8 px-2 sm:px-3 rounded-xs border-2 border-slate-900 dark:border-[#2C3545] bg-white dark:bg-[#161B22] text-slate-900 dark:text-stone-200 hover:border-[#40bcf4] hover:text-[#0284c7] dark:hover:text-[#40bcf4] text-[11px] sm:text-xs font-mono font-black shadow-xs transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Previous Page"
            >
              <ChevronLeft size={12} className="sm:hidden" strokeWidth={3} />
              <ChevronLeft size={13} className="hidden sm:block" strokeWidth={3} />
              <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-tight hidden xs:inline">Prev</span>
            </button>

            {/* Page Chips */}
            <div className="flex items-center gap-0.5 sm:gap-1 mx-0.5 sm:mx-1">
              {paginationRange.map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-1 sm:px-1.5 py-0.5 sm:py-1 text-slate-400 dark:text-stone-500 font-mono text-[11px] sm:text-xs">
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
                    className={`h-7 sm:h-8 min-w-[28px] sm:min-w-[34px] px-1.5 sm:px-2 rounded-xs text-[11px] sm:text-xs font-mono font-black transition-all cursor-pointer border-2 ${
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
              className="flex items-center gap-1 sm:gap-1.5 h-7 sm:h-8 px-2 sm:px-3 rounded-xs border-2 border-[#40bcf4] bg-[#40bcf4] text-slate-950 hover:bg-[#38aade] text-[11px] sm:text-xs font-mono font-black shadow-[0_0_12px_rgba(64,188,244,0.35)] transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Next Page"
            >
              <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-tight hidden xs:inline">Next</span>
              <ChevronRight size={12} className="sm:hidden" strokeWidth={3} />
              <ChevronRight size={13} className="hidden sm:block" strokeWidth={3} />
            </button>

          </div>

        </div>
      )}

    </div>
  );
};

export default HomeShowCatalog;