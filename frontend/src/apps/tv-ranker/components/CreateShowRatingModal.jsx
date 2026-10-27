import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, Check, Loader2, Heart, ChevronDown, 
  Search, Film, Star, Minus, Plus, 
  CheckCircle2, PlayCircle, Clock, PauseCircle, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../../shared/hooks/useApi';

const STATUS_OPTIONS = [
  { 
    value: 'COMPLETED', 
    label: 'Finished', 
    icon: CheckCircle2,
    active: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/50 shadow-[0_2px_0_0_rgba(16,185,129,0.3)]' 
  },
  { 
    value: 'WATCHING', 
    label: 'Watching', 
    icon: PlayCircle,
    active: 'bg-[#40bcf4]/15 text-[#0284c7] dark:text-[#40bcf4] border-[#40bcf4]/50 shadow-[0_2px_0_0_rgba(64,188,244,0.3)]' 
  },
  { 
    value: 'PLAN_TO_WATCH', 
    label: 'Plan to Watch', 
    icon: Clock,
    active: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/50 shadow-[0_2px_0_0_rgba(245,158,11,0.3)]' 
  },
  { 
    value: 'ON_HOLD', 
    label: 'On Hold', 
    icon: PauseCircle,
    active: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/50 shadow-[0_2px_0_0_rgba(168,85,247,0.3)]' 
  },
  { 
    value: 'DROPPED', 
    label: 'Dropped', 
    icon: XCircle,
    active: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/50 shadow-[0_2px_0_0_rgba(244,63,94,0.3)]' 
  }
];

const QUICK_SCORES = [6.0, 7.0, 8.0, 8.5, 9.0, 10.0];

const CreateShowRatingModal = ({ isOpen, onClose, onCreated }) => {
  const { request, loading } = useApi();

  const [catalogShows, setCatalogShows] = useState([]);
  const [ratedShowIds, setRatedShowIds] = useState(new Set());
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isShowDropdownOpen, setIsShowDropdownOpen] = useState(false);

  const [rating, setRating] = useState(8.5);
  const [status, setStatus] = useState('COMPLETED');
  const [review, setReview] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const showDropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const fetchShowsAndRatings = async () => {
      setLoadingCatalog(true);
      try {
        const [showsRes, ratingsRes] = await Promise.allSettled([
          request('/shows?limit=250'),
          request('/shows/user/ratings')
        ]);

        if (!isMounted) return;

        let rawShows = [];
        if (showsRes.status === 'fulfilled' && showsRes.value) {
          const val = showsRes.value;
          rawShows = Array.isArray(val) ? val : val.data || val.shows || [];
        }

        const ratedIds = new Set();
        if (ratingsRes.status === 'fulfilled' && ratingsRes.value) {
          const val = ratingsRes.value;
          const ratingsList = Array.isArray(val) ? val : val.data || val.ratings || [];
          ratingsList.forEach((r) => {
            const sid = r.showId?._id || r.showId || r.show?._id || r.show;
            if (sid) ratedIds.add(String(sid));
          });
        }

        rawShows.forEach((s) => {
          if (s.userRating || s.isRated || s.hasRated) {
            ratedIds.add(String(s._id));
          }
        });

        setCatalogShows(rawShows);
        setRatedShowIds(ratedIds);
      } catch (err) {
        console.error('Failed to load shows:', err);
        toast.error('Unable to load show directory');
      } finally {
        if (isMounted) setLoadingCatalog(false);
      }
    };

    fetchShowsAndRatings();

    return () => {
      isMounted = false;
    };
  }, [isOpen, request]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDropdownRef.current && !showDropdownRef.current.contains(e.target)) {
        setIsShowDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unratedShows = useMemo(() => {
    return catalogShows.filter((s) => !ratedShowIds.has(String(s._id)));
  }, [catalogShows, ratedShowIds]);

  const filteredUnratedShows = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return unratedShows;
    return unratedShows.filter((s) => {
      const titleMatch = s.title?.toLowerCase().includes(term);
      const genreMatch = Array.isArray(s.genres) && s.genres.some((g) => g.toLowerCase().includes(term));
      const typeMatch = s.type?.toLowerCase().includes(term);
      return titleMatch || genreMatch || typeMatch;
    });
  }, [unratedShows, searchQuery]);

  if (!isOpen) return null;

  const adjustScore = (delta) => {
    setRating((prev) => Math.min(10, Math.max(0, parseFloat((prev + delta).toFixed(1)))));
  };

  const getTierDetails = (val) => {
    if (val >= 9.0) {
      return { 
        label: 'Masterpiece', 
        badge: 'text-[#40bcf4] bg-[#40bcf4]/15 border-[#40bcf4]/40 shadow-[0_2px_0_0_rgba(64,188,244,0.3)]' 
      };
    }
    if (val >= 8.0) {
      return { 
        label: 'Great Watch', 
        badge: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/40 shadow-[0_2px_0_0_rgba(16,185,129,0.3)]' 
      };
    }
    if (val >= 6.5) {
      return { 
        label: 'Solid', 
        badge: 'text-amber-700 dark:text-amber-400 bg-amber-500/15 border-amber-500/40 shadow-[0_2px_0_0_rgba(245,158,11,0.3)]' 
      };
    }
    return { 
      label: 'Casual', 
      badge: 'text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-[#1E2636] border-slate-300 dark:border-[#38455C] shadow-[0_2px_0_0_rgba(0,0,0,0.15)]' 
    };
  };

  const tier = getTierDetails(rating);

  const handleSelectShow = (show) => {
    setSelectedShow(show);
    setSearchQuery('');
    setIsShowDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedShow?._id) {
      toast.error('Please pick a show first');
      return;
    }

    try {
      const ratingRes = await request(`/shows/${selectedShow._id}/rating`, 'POST', {
        rating: parseFloat(rating) || 0,
        status: status || 'COMPLETED',
        review: review.trim(),
        isFavorite: Boolean(isFavorite),
        reason: 'User Rating'
      });

      if (ratingRes?.success || ratingRes?.data || ratingRes?._id) {
        toast.success('Rating saved successfully', {
          description: `${selectedShow.title} marked ${status} with ${parseFloat(rating).toFixed(1)}/10`
        });
        if (typeof onCreated === 'function') onCreated();
        if (typeof onClose === 'function') onClose();
      } else {
        toast.error(ratingRes?.message || 'Failed to save rating');
      }
    } catch (err) {
      console.error('Rate show failure:', err);
      toast.error(err.message || 'Submission failed');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm select-none font-sans"
      onClick={onClose}
    >
      <div 
        className="w-full sm:w-[500px] md:w-[540px] bg-[#E9EEF5] dark:bg-[#1E2636] border-t-2 sm:border-t-0 sm:border-l-2 border-slate-300 dark:border-[#334158] shadow-[0_15px_45px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[92dvh] sm:max-h-screen rounded-t-2xl sm:rounded-none text-slate-800 dark:text-slate-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#40bcf4] to-transparent pointer-events-none z-30" />

        {/* Grab Handle */}
        <div className="w-full flex sm:hidden items-center justify-center pt-2.5 pb-1 bg-[#DEE5EF] dark:bg-[#19202E] shrink-0">
          <div className="w-12 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4.5 bg-[#DEE5EF] dark:bg-[#171F2C] border-b-2 border-slate-300 dark:border-[#2C384D] flex items-center justify-between shrink-0 shadow-[0_2px_4px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.25)] relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white dark:bg-[#253044] border border-slate-300 dark:border-[#3B4B67] flex items-center justify-center text-[#40bcf4] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#141A24] shrink-0">
              <Star size={16} className="fill-[#40bcf4]" />
            </div>
            
            <div className="flex flex-col text-left">
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 dark:text-white leading-none">
                Rate Show
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Add your score, watch status, and thoughts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white dark:bg-[#253044] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-[#38465E] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#131924] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            title="Close"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-4.5 no-scrollbar flex-1 text-left">
          
          {/* Select Show */}
          <div className="space-y-1.5 relative" ref={showDropdownRef}>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Select Show</span>
              <span className="text-[#40bcf4]">*</span>
            </label>

            <button
              type="button"
              onClick={() => setIsShowDropdownOpen((prev) => !prev)}
              className={`w-full min-h-11 sm:min-h-12 px-3.5 py-2 flex items-center justify-between gap-3 rounded-xl bg-white dark:bg-[#141C28] border-2 text-left transition-all cursor-pointer outline-none shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] ${
                isShowDropdownOpen 
                  ? 'border-[#40bcf4] ring-2 ring-[#40bcf4]/20' 
                  : 'border-slate-300 dark:border-[#2C384D] hover:border-slate-400 dark:hover:border-[#40bcf4]/50'
              }`}
            >
              {selectedShow ? (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-10 rounded bg-slate-200 dark:bg-slate-800 shrink-0 overflow-hidden border border-slate-300 dark:border-white/10 shadow-xs">
                    {selectedShow.posterUrl ? (
                      <img 
                        src={selectedShow.posterUrl} 
                        alt={selectedShow.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Film size={14} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {selectedShow.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      <span>{selectedShow.releaseYear || '—'}</span>
                      <span>•</span>
                      <span className="uppercase text-[#0284c7] dark:text-[#40bcf4] font-bold">
                        {selectedShow.type?.replace('_', ' ') || 'SERIES'}
                      </span>
                      {selectedShow.totalSeasons && (
                        <>
                          <span>•</span>
                          <span>{selectedShow.totalSeasons}S</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
                  <Search size={15} className="text-[#40bcf4] shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">Search by title or genre...</span>
                </div>
              )}

              <ChevronDown 
                size={16} 
                className={`text-slate-400 shrink-0 transition-transform duration-200 ${isShowDropdownOpen ? 'rotate-180 text-[#40bcf4]' : ''}`} 
              />
            </button>

            {/* Custom Popover Search Menu */}
            {isShowDropdownOpen && (
              <div className="absolute top-[calc(100%+6px)] inset-x-0 z-50 bg-white dark:bg-[#141C28] border-2 border-slate-300 dark:border-[#38465E] rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.18)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.7)] overflow-hidden animate-in fade-in duration-150">
                <div className="p-2 border-b border-slate-200 dark:border-[#232F42] bg-[#F5F8FC] dark:bg-[#101721]">
                  <div className="relative flex items-center">
                    <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type show title, anime, drama..."
                      className="w-full h-8.5 pl-9 pr-3 rounded-lg bg-white dark:bg-[#192230] border border-slate-300 dark:border-[#2C384D] text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#40bcf4] transition-all"
                    />
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto p-1.5 space-y-1 no-scrollbar">
                  {loadingCatalog ? (
                    <div className="p-5 flex flex-col items-center justify-center gap-2 text-xs font-mono text-slate-400">
                      <Loader2 size={16} className="animate-spin text-[#40bcf4]" />
                      <span>Loading shows...</span>
                    </div>
                  ) : filteredUnratedShows.length === 0 ? (
                    <div className="p-5 text-center text-xs text-slate-500 dark:text-slate-400">
                      {searchQuery ? `No shows found for "${searchQuery}"` : 'All shows are already rated'}
                    </div>
                  ) : (
                    filteredUnratedShows.map((show) => {
                      const isSelected = selectedShow?._id === show._id;
                      return (
                        <button
                          key={show._id}
                          type="button"
                          onClick={() => handleSelectShow(show)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#40bcf4]/15 text-[#0284c7] dark:text-[#40bcf4] font-bold border border-[#40bcf4]/40 shadow-2xs'
                              : 'hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-800 dark:text-slate-200 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className="w-7 h-9 rounded bg-slate-200 dark:bg-slate-800 shrink-0 overflow-hidden border border-slate-300 dark:border-white/10 shadow-2xs">
                              {show.posterUrl ? (
                                <img src={show.posterUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <Film size={12} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate text-slate-900 dark:text-white">
                                {show.title}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                <span>{show.releaseYear || '—'}</span>
                                <span>•</span>
                                <span className="uppercase">{show.type?.replace('_', ' ') || 'SERIES'}</span>
                                {Array.isArray(show.genres) && show.genres.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="text-[#0284c7] dark:text-[#40bcf4] truncate">
                                      {show.genres.slice(0, 2).join(', ')}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <Check size={14} className="text-[#40bcf4] shrink-0" strokeWidth={2.5} />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Rating Console (Responsive Mobile Flow) */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#141C28] border-2 border-slate-300 dark:border-[#2C384D] shadow-[0_3px_0_0_#CBD5E1] dark:shadow-[0_3px_0_0_#0F1520] space-y-3 sm:space-y-3.5 relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#222E42] pb-2.5 sm:pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  Your Rating
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400">
                  Scale of 0.0 to 10.0
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border transition-all ${tier.badge}`}>
                  {tier.label}
                </span>

                <button
                  type="button"
                  onClick={() => setIsFavorite((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border transition-all cursor-pointer active:translate-y-[1px] ${
                    isFavorite
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-[0_2px_0_0_rgba(244,63,94,0.3)]'
                      : 'bg-slate-100 dark:bg-[#1E2838] border-slate-300 dark:border-[#38465E] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#101621]'
                  }`}
                  title={isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}
                >
                  <Heart 
                    size={12} 
                    className={`transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} 
                  />
                  <span>Favorite</span>
                </button>
              </div>
            </div>

            {/* Score & Presets - Responsive Wrap / Grid to avoid overflow */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#F5F8FC] dark:bg-[#0F1622] border border-slate-300 dark:border-[#232F42] shadow-inner">
              <div className="flex items-baseline justify-between sm:justify-start gap-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-mono leading-none">
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-slate-400">/ 10</span>
                </div>
              </div>

              {/* 6 Quick Preset Buttons arranged in a 6-col grid to guarantee no horizontal overflow on mobile */}
              <div className="grid grid-cols-6 gap-1 w-full sm:w-auto">
                {QUICK_SCORES.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    className={`h-8 sm:h-auto px-1 sm:px-2.5 py-1 text-center rounded text-xs font-mono font-bold border transition-all cursor-pointer active:translate-y-[1px] active:shadow-none ${
                      Math.abs(rating - val) < 0.05
                        ? 'bg-[#40bcf4] text-[#0A1017] border-[#29a8e2] font-black shadow-[0_2px_0_0_#1c86b8]'
                        : 'bg-white dark:bg-[#1F293A] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#34425A] hover:border-slate-400 dark:hover:border-slate-500 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520]'
                    }`}
                  >
                    {val === 10 ? '10' : val.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider with Precision Steppers */}
            <div className="flex items-center gap-2.5 sm:gap-3 pt-1">
              <button
                type="button"
                onClick={() => adjustScore(-0.1)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1E2838] hover:bg-slate-200 dark:hover:bg-[#253246] border border-slate-300 dark:border-[#34425A] flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all cursor-pointer active:translate-y-[1px] active:shadow-none shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] shrink-0"
                title="-0.1"
              >
                <Minus size={13} strokeWidth={2.5} />
              </button>

              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-slate-200 dark:bg-[#0E1520] rounded-lg appearance-none accent-[#40bcf4] cursor-pointer"
              />

              <button
                type="button"
                onClick={() => adjustScore(0.1)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1E2838] hover:bg-slate-200 dark:hover:bg-[#253246] border border-slate-300 dark:border-[#34425A] flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all cursor-pointer active:translate-y-[1px] active:shadow-none shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] shrink-0"
                title="+0.1"
              >
                <Plus size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Watch Status (Mobile: 2 cols with last item full width, sm+: 3 cols) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Watch Status
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt, idx) => {
                const Icon = opt.icon;
                const isSelected = status === opt.value;
                const isLastOnMobile = idx === STATUS_OPTIONS.length - 1;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-lg border-2 text-xs font-bold transition-all cursor-pointer text-left active:translate-y-[1px] ${
                      isLastOnMobile ? 'col-span-2 sm:col-span-1' : ''
                    } ${
                      isSelected
                        ? opt.active
                        : 'bg-white dark:bg-[#141C28] border-slate-300 dark:border-[#2C384D] text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520]'
                    }`}
                  >
                    <Icon size={14} className="shrink-0" />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Personal Review */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Review & Notes
            </label>
            <textarea
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What stood out? Story, acting, pacing, ending..."
              className="w-full p-3 rounded-xl bg-white dark:bg-[#141C28] border-2 border-slate-300 dark:border-[#2C384D] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#40bcf4] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] transition-colors resize-none"
            />
          </div>
        </form>

        {/* Footer Bar with safe-area spacing */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t-2 border-slate-300 dark:border-[#2C384D] bg-[#DEE5EF] dark:bg-[#171F2C] flex items-center justify-between gap-3 shrink-0 shadow-[0_-2px_6px_rgba(0,0,0,0.03)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.25)] pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !selectedShow}
            className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-lg bg-[#00e054] hover:bg-[#00c94b] text-[#14181C] text-xs font-black uppercase tracking-wider border border-[#00c94b] border-b-[3px] border-b-[#009e3a] active:border-b active:translate-y-[2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_4px_12px_rgba(0,224,84,0.3)]"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin text-[#14181C]" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={15} strokeWidth={3} />
                <span>Save Rating</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateShowRatingModal;