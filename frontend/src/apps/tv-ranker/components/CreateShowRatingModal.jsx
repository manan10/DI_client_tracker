import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  X, Check, Loader2, Heart, Clapperboard, ChevronDown, 
  Layers, CheckCircle2, PlayCircle, Clock, Ban, Minus, Plus, 
  Search, Film
} from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../../shared/hooks/useApi';

const STATUS_OPTIONS = [
  { 
    value: 'COMPLETED', 
    label: 'Completed', 
    icon: CheckCircle2, 
    color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-emerald-500/30 ring-emerald-500/10' 
  },
  { 
    value: 'WATCHING', 
    label: 'Watching', 
    icon: PlayCircle, 
    color: 'text-sky-700 dark:text-sky-300 bg-sky-500/15 border-sky-500/30 ring-sky-500/10' 
  },
  { 
    value: 'PLAN_TO_WATCH', 
    label: 'Plan to Watch', 
    icon: Clock, 
    color: 'text-amber-700 dark:text-amber-300 bg-amber-500/15 border-amber-500/30 ring-amber-500/10' 
  },
  { 
    value: 'ON_HOLD', 
    label: 'On Hold', 
    icon: Layers, 
    color: 'text-purple-700 dark:text-purple-300 bg-purple-500/15 border-purple-500/30 ring-purple-500/10' 
  },
  { 
    value: 'DROPPED', 
    label: 'Dropped', 
    icon: Ban, 
    color: 'text-rose-700 dark:text-rose-300 bg-rose-500/15 border-rose-500/30 ring-rose-500/10' 
  }
];

const CreateShowRatingModal = ({ isOpen, onClose, onCreated }) => {
  const { request, loading } = useApi();

  // Show Catalog & Ratings State
  const [catalogShows, setCatalogShows] = useState([]);
  const [ratedShowIds, setRatedShowIds] = useState(new Set());
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isShowDropdownOpen, setIsShowDropdownOpen] = useState(false);

  // Rating & Review State
  const [rating, setRating] = useState(8.5);
  const [status, setStatus] = useState('COMPLETED');
  const [seasonsWatched, setSeasonsWatched] = useState(1);
  const [review, setReview] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Dropdown & Dial References
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const showDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const dialRef = useRef(null);
  const isDraggingDial = useRef(false);

  // Fetch catalog & user ratings to isolate UNRATED shows only
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
        console.error('Failed to load show list or ratings:', err);
        toast.error('Unable to fetch unrated catalog');
      } finally {
        if (isMounted) setLoadingCatalog(false);
      }
    };

    fetchShowsAndRatings();

    return () => {
      isMounted = false;
    };
  }, [isOpen, request]);

  // Click outside listener for custom dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDropdownRef.current && !showDropdownRef.current.contains(e.target)) {
        setIsShowDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter shows: ONLY shows that are NOT rated yet & match the search term
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

  // Circular gauge math & scrubbing
  const calculateAngleScore = useCallback((clientX, clientY) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = clientX - centerX;
    const y = clientY - centerY;

    let degrees = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;

    const rawScore = (degrees / 360) * 10;
    const clampedScore = Math.min(10, Math.max(0, parseFloat(rawScore.toFixed(1))));
    setRating(clampedScore);
  }, []);

  const handleDialMouseDown = (e) => {
    isDraggingDial.current = true;
    calculateAngleScore(e.clientX, e.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingDial.current) {
        calculateAngleScore(e.clientX, e.clientY);
      }
    };
    const handleMouseUp = () => {
      isDraggingDial.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [calculateAngleScore]);

  if (!isOpen) return null;

  const adjustScore = (delta) => {
    setRating((prev) => Math.min(10, Math.max(0, parseFloat((prev + delta).toFixed(1)))));
  };

  const currentStatusObj = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

  const getTierDetails = () => {
    const val = parseFloat(rating) || 0;
    if (val >= 9.0) {
      return { 
        label: 'Masterpiece', 
        badge: 'text-amber-300 bg-amber-400/20 border-amber-400/50', 
        stroke: '#f59e0b' 
      };
    }
    if (val >= 8.0) {
      return { 
        label: 'Great', 
        badge: 'text-rose-300 bg-rose-500/20 border-rose-500/40', 
        stroke: '#f43f5e' 
      };
    }
    if (val >= 7.0) {
      return { 
        label: 'Good', 
        badge: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40', 
        stroke: '#06b6d4' 
      };
    }
    return { 
      label: 'Casual', 
      badge: 'text-slate-300 bg-slate-800 border-slate-700', 
      stroke: '#94a3b8' 
    };
  };

  const tier = getTierDetails();

  const handleSelectShow = (show) => {
    setSelectedShow(show);
    setSearchQuery('');
    setIsShowDropdownOpen(false);
    if (show.totalSeasons) {
      setSeasonsWatched(Math.min(seasonsWatched || 1, show.totalSeasons));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedShow?._id) {
      toast.error('Please select an unrated show from the list');
      return;
    }

    try {
      const ratingRes = await request(`/shows/${selectedShow._id}/rating`, 'POST', {
        rating: parseFloat(rating) || 0,
        status: status || 'COMPLETED',
        seasonsWatched: parseInt(seasonsWatched, 10) || 1,
        review: review.trim(),
        isFavorite: Boolean(isFavorite),
        reason: 'Vault Entry'
      });

      if (ratingRes?.success || ratingRes?.data || ratingRes?._id) {
        toast.success('Title Rated Successfully', {
          description: `${selectedShow.title} marked ${status} with ${parseFloat(rating).toFixed(1)}/10`
        });
        if (typeof onCreated === 'function') onCreated();
        if (typeof onClose === 'function') onClose();
      } else {
        toast.error(ratingRes?.message || 'Failed to record rating');
      }
    } catch (err) {
      console.error('Rate show failure:', err);
      toast.error(err.message || 'Submission failed');
    }
  };

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * (rating / 10));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-xl md:max-w-2xl bg-white dark:bg-[#070A12] border-t sm:border border-slate-200 dark:border-white/10 rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-slate-100 transition-all relative font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Slide-Up Grab Handle */}
        <div className="w-full flex sm:hidden items-center justify-center pt-2 pb-1.5 bg-linear-to-r from-rose-950 via-slate-900 to-[#0F1424]">
          <div className="w-10 h-1 bg-rose-400/50 rounded-full" />
        </div>

        {/* ===================== HEADER BAR ===================== */}
        <div className="px-5 sm:px-6 py-4 bg-linear-to-r from-rose-950 via-slate-900 to-[#0F1424] border-b border-rose-500/30 flex items-center justify-between text-white shrink-0 relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-linear-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-950/50 shrink-0 border border-white/10">
              <Clapperboard size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold tracking-[0.14em] uppercase leading-none text-white drop-shadow-xs">
                Rate a Show
              </h2>
              <p className="text-[11px] font-mono tracking-wider uppercase text-rose-200/90 mt-1 font-semibold">
                Unrated Database Titles Only
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10 shadow-xs"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* ===================== MAIN FORM ===================== */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 no-scrollbar flex-1 text-left">
          
          {/* Row 1: Custom Show Search & Selection Dropdown */}
          <div className="space-y-1.5 relative" ref={showDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-serif font-bold tracking-[0.12em] uppercase text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <span>Select Unrated Show</span>
                <span className="text-rose-500">*</span>
              </label>

              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10">
                {unratedShows.length} unrated available
              </span>
            </div>

            {/* Custom Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => setIsShowDropdownOpen((prev) => !prev)}
              className={`w-full min-h-12 px-3.5 py-2 flex items-center justify-between gap-3 rounded-lg bg-slate-50 dark:bg-white/5 border text-left transition-all cursor-pointer outline-none ${
                isShowDropdownOpen 
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-white dark:bg-white/10' 
                  : 'border-slate-300 dark:border-white/15 hover:border-slate-400 dark:hover:border-white/30 shadow-2xs'
              }`}
            >
              {selectedShow ? (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-10 rounded-sm bg-slate-800 shrink-0 overflow-hidden border border-slate-300 dark:border-white/20 shadow-xs">
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
                    <p className="text-sm font-serif font-bold uppercase tracking-wide text-slate-900 dark:text-white truncate">
                      {selectedShow.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      <span className="font-semibold">{selectedShow.releaseYear || '—'}</span>
                      <span>•</span>
                      <span className="uppercase">{selectedShow.type?.replace('_', ' ') || 'SERIES'}</span>
                      {selectedShow.totalSeasons && (
                        <>
                          <span>•</span>
                          <span>{selectedShow.totalSeasons} Seasons</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                  <Search size={16} className="text-rose-500 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">Search unrated show by title or genre...</span>
                </div>
              )}

              <ChevronDown 
                size={16} 
                className={`text-slate-400 shrink-0 transition-transform duration-200 ${isShowDropdownOpen ? 'rotate-180 text-rose-500' : ''}`} 
              />
            </button>

            {/* Custom Popover Menu */}
            {isShowDropdownOpen && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-white dark:bg-[#0B101E] border-2 border-slate-300 dark:border-white/20 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/3">
                  <div className="relative flex items-center">
                    <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type show title, anime, comedy, drama..."
                      className="w-full h-9 pl-9 pr-3 rounded-md bg-white dark:bg-[#070A12] border border-slate-300 dark:border-white/15 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 no-scrollbar">
                  {loadingCatalog ? (
                    <div className="p-6 flex flex-col items-center justify-center gap-2 text-xs font-mono text-slate-400">
                      <Loader2 size={16} className="animate-spin text-rose-500" />
                      <span>Checking database for unrated titles...</span>
                    </div>
                  ) : filteredUnratedShows.length === 0 ? (
                    <div className="p-6 text-center space-y-1">
                      <p className="text-xs font-serif font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        {searchQuery ? `No unrated shows match "${searchQuery}"` : 'All database shows are already rated!'}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">
                        {searchQuery 
                          ? 'Check your search query or add a new show first.' 
                          : 'Use the Add Show modal to register new titles.'}
                      </p>
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
                              ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-800 dark:text-rose-200 font-bold border border-rose-300 dark:border-rose-500/40 shadow-xs'
                              : 'hover:bg-slate-100/80 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div className="w-7 h-9 rounded-xs bg-slate-800 shrink-0 overflow-hidden border border-slate-300 dark:border-white/10 shadow-2xs">
                              {show.posterUrl ? (
                                <img src={show.posterUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                  <Film size={12} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-serif tracking-wide font-bold uppercase truncate">
                                {show.title}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{show.releaseYear || '—'}</span>
                                <span>•</span>
                                <span className="uppercase">{show.type?.replace('_', ' ') || 'SERIES'}</span>
                                {Array.isArray(show.genres) && show.genres.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="text-rose-600 dark:text-rose-400 truncate font-semibold">
                                      {show.genres.slice(0, 2).join(', ')}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center">
                                <Check size={12} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* COMPACT HYBRID RATINGS CONSOLE (WITH INTEGRATED FAVORITE TOGGLE)          */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-xl bg-linear-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/40 shadow-lg text-white relative overflow-hidden space-y-3.5">
            <div className="absolute top-0 right-0 w-48 h-full bg-linear-to-l from-rose-500/15 to-transparent pointer-events-none" />

            {/* Header Strip: Title + Tier Badge + Integrated Favorites Heart Button */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400/50" />
                <span className="text-[11px] font-mono font-bold tracking-[0.18em] uppercase text-cyan-300">
                  Ratings Console
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border shadow-xs ${tier.badge}`}>
                  {tier.label}
                </div>

                {/* Integrated Heart Favorite Button */}
                <button
                  type="button"
                  onClick={() => setIsFavorite((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer active:scale-95 shadow-xs select-none ${
                    isFavorite
                      ? 'bg-rose-500/25 border-rose-400 text-rose-300 ring-1 ring-rose-500/30'
                      : 'bg-white/5 border-white/15 text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={isFavorite ? 'Pinned to Favorites' : 'Click to pin to Favorites'}
                >
                  <Heart 
                    size={13} 
                    className={`transition-colors duration-200 ${isFavorite ? 'fill-rose-500 text-rose-500 animate-in zoom-in-50' : 'text-slate-400'}`} 
                  />
                  <span>Favorite</span>
                </button>
              </div>
            </div>

            {/* Center Scoring Stage */}
            <div className="flex items-center justify-between gap-4 sm:gap-6 relative z-10">
              {/* Circular Dial */}
              <div 
                ref={dialRef}
                onMouseDown={handleDialMouseDown}
                className="relative w-24 h-24 sm:w-26 sm:h-26 flex items-center justify-center cursor-pointer select-none shrink-0 group"
                title="Drag or click dial to adjust rating"
              >
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#1e1b4b"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={tier.stroke}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-100"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl sm:text-3xl font-mono font-[1000] tracking-tighter text-white leading-none">
                    {parseFloat(rating || 0).toFixed(1)}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    / 10
                  </span>
                </div>
              </div>

              {/* Steppers & Snap Benchmarks */}
              <div className="flex-1 min-w-0 space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
                  <span>Fine Adjust:</span>
                  <span>Quick Snaps:</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {[-0.5, -0.1, +0.1, +0.5].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() => adjustScore(delta)}
                        className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-mono font-bold text-white transition-all active:scale-95 cursor-pointer shadow-xs"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    {[6.0, 7.5, 8.5, 9.5].map((snap) => (
                      <button
                        key={snap}
                        type="button"
                        onClick={() => setRating(snap)}
                        className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                          Math.abs(rating - snap) < 0.05
                            ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-xs shadow-amber-400/30'
                            : 'bg-white/10 text-slate-200 border-white/15 hover:border-white/30'
                        }`}
                      >
                        {snap.toFixed(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Control Rail */}
            <div className="flex items-center gap-2.5 pt-1.5 border-t border-white/10 relative z-10">
              <button
                type="button"
                onClick={() => adjustScore(-0.1)}
                className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 transition-colors shrink-0 cursor-pointer active:scale-90"
                title="-0.1"
              >
                <Minus size={12} strokeWidth={3} />
              </button>

              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="flex-1 accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-sm appearance-none"
              />

              <button
                type="button"
                onClick={() => adjustScore(0.1)}
                className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 transition-colors shrink-0 cursor-pointer active:scale-90"
                title="+0.1"
              >
                <Plus size={12} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Row 2: Status & Seasons Seen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Viewing Status Custom Dropdown */}
            <div className="space-y-1.5 relative" ref={statusDropdownRef}>
              <label className="text-xs font-serif font-bold tracking-[0.12em] uppercase text-slate-700 dark:text-slate-300">
                Viewing Status
              </label>

              <button
                type="button"
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className={`w-full h-11 px-3.5 flex items-center justify-between rounded-lg bg-slate-50 dark:bg-white/5 border text-left transition-all cursor-pointer outline-none ${
                  isStatusOpen
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-slate-300 dark:border-white/15 hover:border-slate-400 dark:hover:border-white/25 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border truncate ${currentStatusObj.color}`}>
                    {currentStatusObj.label}
                  </span>
                </div>
                <ChevronDown
                  size={15}
                  className={`text-slate-400 shrink-0 transition-transform duration-200 ${isStatusOpen ? 'rotate-180 text-rose-500' : ''}`}
                />
              </button>

              {/* Status Popover Options */}
              {isStatusOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white dark:bg-[#0B101E] border-2 border-slate-300 dark:border-white/20 rounded-xl shadow-xl p-1.5 space-y-1 animate-in fade-in duration-150">
                  {STATUS_OPTIONS.map((s) => {
                    const isSelected = s.value === status;
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => {
                          setStatus(s.value);
                          setIsStatusOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-white/10 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={14} className="text-rose-500 shrink-0" />
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${s.color}`}>
                            {s.label}
                          </span>
                        </div>
                        {isSelected && <Check size={14} className="text-emerald-500 shrink-0" strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Seasons Watched */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-serif font-bold tracking-[0.12em] uppercase text-slate-700 dark:text-slate-300">
                  Seasons Watched
                </label>
                {selectedShow?.totalSeasons && (
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    Max: {selectedShow.totalSeasons}
                  </span>
                )}
              </div>
              <input
                type="number"
                min="0"
                max={selectedShow?.totalSeasons || 99}
                value={seasonsWatched}
                onChange={(e) => setSeasonsWatched(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 transition-colors shadow-2xs"
              />
            </div>
          </div>

          {/* Row 3: Personal Review & Critique */}
          <div className="space-y-1.5">
            <label className="text-xs font-serif font-bold tracking-[0.12em] uppercase text-slate-700 dark:text-slate-300">
              Personal Review & Notes
            </label>
            <textarea
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What stood out? Performances, plot twists, soundtrack, pacing..."
              className="w-full p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 resize-none transition-colors placeholder:text-slate-400 font-sans shadow-2xs"
            />
          </div>
        </form>

        {/* ===================== FOOTER ACTIONS ===================== */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/2 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-serif font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !selectedShow}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-linear-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-serif font-bold uppercase tracking-wider shadow-md shadow-rose-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                <span>Recording...</span>
              </>
            ) : (
              <>
                <Check size={15} strokeWidth={2.5} />
                <span>Save to Vault</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateShowRatingModal;