import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Check, Loader2, Heart, Search, Film, Minus, Plus, 
  CheckCircle2, PlayCircle, Clock, PauseCircle, XCircle,
  RefreshCw, Clapperboard, ArrowUpRight
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

const FILTER_PILLS = [
  { id: 'ALL', label: 'All Shows' },
  { id: 'SERIES', label: 'Series' },
  { id: 'ANIME', label: 'Anime' },
  { id: 'MINISERIES', label: 'Miniseries' }
];

const AddRatingModal = ({ isOpen, onClose, onCreated }) => {
  const { request, loading } = useApi();

  const [catalogShows, setCatalogShows] = useState([]);
  const [ratedShowIds, setRatedShowIds] = useState(new Set());
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Rating Form State
  const [rating, setRating] = useState(8.5);
  const [status, setStatus] = useState('COMPLETED');
  const [review, setReview] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const fetchShowsAndRatings = async () => {
      setLoadingCatalog(true);
      try {
        // Query both endpoints: /shows/ratings/my (your active backend route) and /shows/user/ratings as fallback
        const [showsRes, myRatingsRes, userRatingsRes] = await Promise.allSettled([
          request('/shows?limit=500'),
          request('/shows/ratings/my'),
          request('/shows/user/ratings')
        ]);

        if (!isMounted) return;

        let rawShows = [];
        if (showsRes.status === 'fulfilled' && showsRes.value) {
          const val = showsRes.value;
          rawShows = Array.isArray(val) ? val : val.data || val.shows || [];
        }

        const ratedIds = new Set();

        const processRatingsList = (resObj) => {
          if (!resObj) return;
          const ratingsList = Array.isArray(resObj) ? resObj : resObj.data || resObj.ratings || [];
          ratingsList.forEach((r) => {
            // Target show ID whether populated or raw ObjectId string
            const sid = r.show?._id || r.show || r.showId?._id || r.showId;
            if (sid) {
              ratedIds.add(String(sid));
            }
          });
        };

        if (myRatingsRes.status === 'fulfilled' && myRatingsRes.value) {
          processRatingsList(myRatingsRes.value);
        }
        if (userRatingsRes.status === 'fulfilled' && userRatingsRes.value) {
          processRatingsList(userRatingsRes.value);
        }

        // Also check any embedded rating flags/objects attached directly to show models
        rawShows.forEach((s) => {
          if (
            s.userRating || 
            s.isRated || 
            s.hasRated || 
            (typeof s.rating === 'number' && s.rating > 0) ||
            s.myRating
          ) {
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

  // Exclude shows that are already in the user's rated list
  const unratedShows = useMemo(() => {
    return catalogShows.filter((s) => {
      if (!s?._id) return false;
      const showIdStr = String(s._id);
      return !ratedShowIds.has(showIdStr);
    });
  }, [catalogShows, ratedShowIds]);

  const filteredUnratedShows = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();

    return unratedShows.filter((s) => {
      if (typeFilter !== 'ALL') {
        const sType = (s.type || '').toUpperCase();
        const sGenres = Array.isArray(s.genres) ? s.genres.map((g) => g.toUpperCase()) : [];
        
        if (typeFilter === 'ANIME') {
          const isAnime = sType === 'ANIME' || sGenres.includes('ANIME');
          if (!isAnime) return false;
        } else if (typeFilter === 'MINISERIES') {
          const isMini = sType === 'MINISERIES' || s.totalSeasons === 1;
          if (!isMini) return false;
        } else if (typeFilter === 'SERIES') {
          if (sType === 'ANIME' || sGenres.includes('ANIME')) return false;
        }
      }

      if (!term) return true;
      const titleMatch = s.title?.toLowerCase().includes(term);
      const genreMatch = Array.isArray(s.genres) && s.genres.some((g) => g.toLowerCase().includes(term));
      const yearMatch = String(s.releaseYear || '').includes(term);

      return titleMatch || genreMatch || yearMatch;
    });
  }, [unratedShows, searchQuery, typeFilter]);

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
  };

  const handleClearSelectedShow = () => {
    setSelectedShow(null);
    setSearchQuery('');
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
        
        // Immediately add the new show's ID to ratedShowIds to avoid showing it again in this session
        setRatedShowIds((prev) => new Set([...prev, String(selectedShow._id)]));

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

  const posterImage = selectedShow?.posterUrl || selectedShow?.bannerUrl || selectedShow?.backdropUrl;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm select-none font-sans"
      onClick={onClose}
    >
      <div 
        className="w-full sm:w-[520px] md:w-[560px] bg-[#E9EEF5] dark:bg-[#151C28] border-t-2 sm:border-t-0 sm:border-l-2 border-slate-300 dark:border-[#2C384D] shadow-[0_15px_45px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col max-h-[94dvh] sm:max-h-screen rounded-t-2xl sm:rounded-none text-slate-800 dark:text-slate-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#40bcf4] to-transparent pointer-events-none z-30" />

        {/* VIEW A: AFTER SHOW SELECTION */}
        {selectedShow ? (
          <div className="relative w-full bg-gradient-to-r from-[#0d131f] via-[#101726] to-[#0c121e] border-b-2 border-slate-300 dark:border-[#2C384D] shrink-0 overflow-hidden select-none">
            
            {posterImage && (
              <div 
                className="absolute -top-12 -left-12 w-80 h-80 bg-cover bg-center blur-3xl opacity-30 pointer-events-none"
                style={{ backgroundImage: `url(${posterImage})` }}
              />
            )}
            <div className="absolute top-0 right-0 w-72 h-full bg-gradient-to-l from-[#40bcf4]/10 via-transparent to-transparent pointer-events-none" />

            {/* Top Utility Controls */}
            <div className="relative z-20 flex items-center justify-between px-4 sm:px-5 pt-3 pb-1">
              <button
                type="button"
                onClick={handleClearSelectedShow}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 hover:text-white border border-white/15 text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                title="Choose a different show"
              >
                <RefreshCw size={11} className="text-[#40bcf4]" />
                <span>Change Show</span>
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer shadow-md"
                title="Close"
              >
                <X size={15} strokeWidth={2.4} />
              </button>
            </div>

            {/* Main Show Info Header */}
            <div className="px-4 sm:px-5 pb-4.5 pt-0.5 flex items-center justify-between gap-4 relative z-20">
              <div className="relative shrink-0 group">
                <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-slate-950 p-1 border border-white/20 shadow-[0_12px_28px_rgba(0,0,0,0.85),0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-transform duration-300 group-hover:scale-105">
                  <div className="w-full h-full rounded-lg overflow-hidden bg-slate-900 relative">
                    {posterImage ? (
                      <img 
                        src={posterImage} 
                        alt={selectedShow.title} 
                        className="w-full h-full object-cover object-top" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <Film size={20} />
                      </div>
                    )}
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                  <span className="font-black uppercase tracking-wider text-[#40bcf4]">
                    {selectedShow.type?.replace('_', ' ') || 'SERIES'}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="font-bold text-slate-300">
                    {selectedShow.releaseYear || '—'}
                  </span>
                  {selectedShow.totalSeasons && (
                    <>
                      <span className="text-slate-500">•</span>
                      <span className="font-bold text-slate-300">
                        {selectedShow.totalSeasons} Season{selectedShow.totalSeasons > 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                </div>

                <h1 className="text-base sm:text-xl font-[1000] text-white tracking-tight leading-tight line-clamp-2 drop-shadow-sm">
                  {selectedShow.title || 'Untitled Show'}
                </h1>

                {Array.isArray(selectedShow.genres) && selectedShow.genres.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {selectedShow.genres.slice(0, 3).map((g) => (
                      <span 
                        key={g} 
                        className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-stone-300"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="shrink-0 pl-1">
                <div className="flex flex-col items-center justify-center px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#1b2537] to-[#111824] border border-[#2e3e57] shadow-[0_8px_20px_rgba(0,0,0,0.6),0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-black/40">
                  <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-slate-400 leading-none">
                    SCORE
                  </span>
                  <div className="flex items-baseline gap-0.5 mt-1">
                    <span className="text-2xl sm:text-3xl font-[1000] font-mono tracking-tight text-[#40bcf4] leading-none drop-shadow-[0_2px_8px_rgba(64,188,244,0.4)]">
                      {rating.toFixed(1)}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 leading-none">
                      /10
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW B: PRE-SELECTION HEADER */
          <div className="shrink-0 border-b-2 border-slate-300 dark:border-[#263143] bg-[#DEE5EF] dark:bg-[#121824] shadow-[0_2px_8px_rgba(0,0,0,0.05)] relative z-20">
            <div className="w-full flex sm:hidden items-center justify-center pt-2 pb-1">
              <div className="w-12 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full" />
            </div>

            <div className="px-5 sm:px-6 pt-3 pb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#40bcf4]/15 border border-[#40bcf4]/30 flex items-center justify-center text-[#0284c7] dark:text-[#40bcf4]">
                  <Clapperboard size={18} strokeWidth={2.4} />
                </div>
                
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 dark:text-white leading-none">
                      Pick a Show
                    </h2>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284c7] dark:text-[#40bcf4] bg-[#40bcf4]/10 border border-[#40bcf4]/30 px-2 py-0.5 rounded">
                      {unratedShows.length} Pending
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Select any unrated show to score it
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/80 dark:bg-[#1E2838] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-[#38465E] active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                title="Close"
              >
                <X size={15} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        )}

        {/* WORKSPACE BODY */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col text-left">
          
          {/* SCREEN 1: UNRATED DIRECTORY */}
          {!selectedShow ? (
            <div className="p-4 sm:p-5 space-y-3.5 flex-1 flex flex-col">
              
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3.5 text-slate-400 dark:text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search series, anime, genre, year..."
                  className="w-full h-11 pl-10 pr-9 rounded-xl bg-white dark:bg-[#101621] border-2 border-slate-300 dark:border-[#2C384D] text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-stone-500 outline-none focus:border-[#40bcf4] focus:ring-1 focus:ring-[#40bcf4]/30 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0B0E14] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {FILTER_PILLS.map((pill) => {
                  const isSelected = typeFilter === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setTypeFilter(pill.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#40bcf4] text-[#0A1017] border-[#29a8e2] shadow-xs'
                          : 'bg-white dark:bg-[#131B27] text-slate-600 dark:text-slate-300 border-slate-300 dark:border-[#2A374C] hover:border-slate-400 dark:hover:border-slate-500'
                      }`}
                    >
                      {pill.label}
                    </button>
                  );
                })}

                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 ml-auto shrink-0 pl-1 font-semibold">
                  {filteredUnratedShows.length} found
                </span>
              </div>

              <div className="flex-1 min-h-[300px] overflow-y-auto space-y-2 pr-0.5 no-scrollbar">
                {loadingCatalog ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-2 text-xs font-mono text-slate-400">
                    <Loader2 size={20} className="animate-spin text-[#40bcf4]" />
                    <span>Indexing unrated collection...</span>
                  </div>
                ) : filteredUnratedShows.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-white dark:bg-[#101621] border-2 border-slate-300 dark:border-[#2C384D] shadow-sm">
                    <Film size={34} className="text-slate-400 dark:text-slate-600 mb-2 stroke-1" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      {searchQuery ? `No unrated shows match "${searchQuery}"` : 'All database shows are already rated'}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-stone-400 mt-1 max-w-xs">
                      {searchQuery ? 'Try another keyword or change your filter pill.' : 'Your backlog is completely up to date!'}
                    </p>
                  </div>
                ) : (
                  filteredUnratedShows.map((show) => (
                    <div
                      key={show._id}
                      onClick={() => handleSelectShow(show)}
                      className="group flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#101621] border-2 border-slate-300 dark:border-[#253043] hover:border-[#40bcf4] dark:hover:border-[#40bcf4] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0B0E14] transition-all cursor-pointer text-left active:translate-y-[1px]"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-11 h-15 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0 overflow-hidden border border-slate-300 dark:border-white/10 shadow-xs relative">
                          {show.posterUrl ? (
                            <img 
                              src={show.posterUrl} 
                              alt={show.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Film size={16} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-xs sm:text-sm font-extrabold truncate text-slate-900 dark:text-white group-hover:text-[#40bcf4] transition-colors leading-snug">
                            {show.title}
                          </h3>

                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/5 font-bold text-slate-700 dark:text-slate-300">
                              {show.releaseYear || '—'}
                            </span>
                            <span>•</span>
                            <span className="uppercase text-[#0284c7] dark:text-[#40bcf4] font-bold">
                              {show.type?.replace('_', ' ') || 'SERIES'}
                            </span>
                            {show.totalSeasons && (
                              <>
                                <span>•</span>
                                <span>{show.totalSeasons}S</span>
                              </>
                            )}
                          </div>

                          {Array.isArray(show.genres) && show.genres.length > 0 && (
                            <p className="text-[10px] font-medium text-slate-400 dark:text-stone-400 truncate mt-0.5">
                              {show.genres.slice(0, 3).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 pl-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1A2332] group-hover:bg-[#40bcf4] text-slate-600 dark:text-slate-300 group-hover:text-[#0A1017] border border-slate-300 dark:border-[#2C384D] group-hover:border-[#40bcf4] text-[10px] font-mono font-black uppercase tracking-wider transition-all shadow-2xs">
                          <span>Rate</span>
                          <ArrowUpRight size={12} strokeWidth={2.8} />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* SCREEN 2: SCORING CONSOLE */
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-4.5">
              
              <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#101621] border-2 border-slate-300 dark:border-[#2C384D] shadow-[0_3px_0_0_#CBD5E1] dark:shadow-[0_3px_0_0_#0F1520] space-y-3 sm:space-y-3.5 relative">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#222E42] pb-2.5 sm:pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                      Your Score
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

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#F5F8FC] dark:bg-[#0A0E15] border border-slate-300 dark:border-[#232F42] shadow-inner">
                  <div className="flex items-baseline justify-between sm:justify-start gap-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-mono leading-none">
                        {rating.toFixed(1)}
                      </span>
                      <span className="text-xs font-bold text-slate-400">/ 10</span>
                    </div>
                  </div>

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
                    className="flex-1 h-2 bg-slate-200 dark:bg-[#0A0E15] rounded-lg appearance-none accent-[#40bcf4] cursor-pointer"
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

              {/* Status Selector */}
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
                            : 'bg-white dark:bg-[#101621] border-slate-300 dark:border-[#2C384D] text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520]'
                        }`}
                      >
                        <Icon size={14} className="shrink-0" />
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  Review & Notes
                </label>
                <textarea
                  rows={3}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="What stood out? Story, acting, pacing, ending..."
                  className="w-full p-3 rounded-xl bg-white dark:bg-[#101621] border-2 border-slate-300 dark:border-[#2C384D] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-stone-500 outline-none focus:border-[#40bcf4] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] transition-colors resize-none"
                />
              </div>
            </form>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t-2 border-slate-300 dark:border-[#263143] bg-[#DEE5EF] dark:bg-[#121824] flex items-center justify-between gap-3 shrink-0 shadow-[0_-2px_6px_rgba(0,0,0,0.03)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.25)] pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
          <button
            type="button"
            onClick={selectedShow ? handleClearSelectedShow : onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {selectedShow ? 'Back' : 'Cancel'}
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

export default AddRatingModal;