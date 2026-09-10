import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Clapperboard, Heart, Loader2, Star, 
  ArrowUpRight, CheckCircle2, PlayCircle, 
  Clock, Ban, ChevronLeft, ChevronRight, 
  ChevronDown, Check, Sparkles, Flame
} from 'lucide-react';

const DEFAULT_POSTERS = [
  'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&q=80',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&q=80'
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const HomeShowCatalog = ({ 
  filteredShows, 
  layoutView, 
  isLoading, 
  categorizeShow, 
  onSelectItem, 
  onToggleFavorite 
}) => {
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isTopPageSizeOpen, setIsTopPageSizeOpen] = useState(false);
  const [isBottomPageSizeOpen, setIsBottomPageSizeOpen] = useState(false);

  const topPageSizeRef = useRef(null);
  const bottomPageSizeRef = useRef(null);

  // Auto-reset to Page 1 when total shows change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredShows.length, layoutView]);

  // Click outside handlers for page size selectors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (topPageSizeRef.current && !topPageSizeRef.current.contains(e.target)) {
        setIsTopPageSizeOpen(false);
      }
      if (bottomPageSizeRef.current && !bottomPageSizeRef.current.contains(e.target)) {
        setIsBottomPageSizeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute sliced records
  const totalRecords = filteredShows.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const indexOfLastRecord = currentPage * itemsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
  const currentShows = useMemo(() => {
    return filteredShows.slice(indexOfFirstRecord, indexOfLastRecord);
  }, [filteredShows, indexOfFirstRecord, indexOfLastRecord]);

  const getScoreBadge = (score) => {
    if (!score || score === 0) {
      return 'bg-slate-800 text-slate-400 border-slate-700';
    }
    if (score >= 9.0) {
      return 'bg-gradient-to-r from-amber-400 to-rose-600 text-slate-950 font-black border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.4)]';
    }
    if (score >= 8.5) {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]';
    }
    if (score >= 8.0) {
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_8px_rgba(99,102,241,0.2)]';
    }
    if (score >= 7.0) {
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 size={12} className="text-emerald-400" />;
      case 'WATCHING': return <PlayCircle size={12} className="text-sky-400" />;
      case 'PLAN_TO_WATCH': return <Clock size={12} className="text-amber-400" />;
      case 'DROPPED': return <Ban size={12} className="text-rose-400" />;
      default: return null;
    }
  };

  // Reusable Pagination Bar Subcomponent
  const renderPaginationBar = (isTop = false) => {
    const isPopoverOpen = isTop ? isTopPageSizeOpen : isBottomPageSizeOpen;
    const setIsPopoverOpen = isTop ? setIsTopPageSizeOpen : setIsBottomPageSizeOpen;
    const ref = isTop ? topPageSizeRef : bottomPageSizeRef;

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#170B22] via-[#0F0D24] to-[#0A1224] border border-rose-500/30 gap-3 shadow-[0_4px_25px_rgba(244,63,94,0.08)] text-left relative z-10 backdrop-blur-md text-white">
        
        {/* Left: Range Counter & Custom Rows-Per-Page Selector */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto justify-between sm:justify-start">
          <p className="text-xs font-medium text-slate-300 font-mono tracking-wide">
            Showing <span className="font-bold text-amber-300">{totalRecords > 0 ? indexOfFirstRecord + 1 : 0}</span> to{' '}
            <span className="font-bold text-amber-300">{Math.min(indexOfLastRecord, totalRecords)}</span> of{' '}
            <span className="font-bold text-white">{totalRecords}</span> entries[cite: 1]
          </p>

          <div className="relative" ref={ref}>
            <button
              type="button"
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              className="h-8 px-2.5 flex items-center gap-1.5 rounded-md bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-xs font-mono font-bold text-slate-200 transition-all cursor-pointer outline-none shadow-xs"
            >
              <span>{itemsPerPage} / page</span>
              <ChevronDown size={11} className={`text-rose-400 transition-transform ${isPopoverOpen ? 'rotate-180' : ''}`} />
            </button>

            {isPopoverOpen && (
              <div className={`absolute ${isTop ? 'top-[calc(100%+4px)]' : 'bottom-[calc(100%+4px)]'} left-0 w-28 z-50 bg-[#0E0A1E] border border-rose-500/40 rounded-md shadow-2xl p-1 space-y-0.5 animate-in fade-in duration-150 backdrop-blur-xl`}>
                {PAGE_SIZE_OPTIONS.map((size) => {
                  const isSelected = itemsPerPage === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setItemsPerPage(size);
                        setCurrentPage(1);
                        setIsPopoverOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-1.5 rounded-sm text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-500/25 text-amber-300 font-bold border border-rose-500/40'
                          : 'hover:bg-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span className="text-[11px] font-mono font-bold">{size} rows</span>
                      {isSelected && <Check size={11} className="text-amber-400" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Step Page Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-serif font-bold uppercase tracking-wider rounded-md border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 disabled:opacity-30 transition-all outline-none cursor-pointer"
          >
            <ChevronLeft size={13} />
            <span>Prev</span>
          </button>

          <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-400 px-1.5">
            <span className="text-amber-300 font-bold">{currentPage}</span>
            <span>/</span>
            <span>{totalPages}</span>
          </div>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-serif font-bold uppercase tracking-wider rounded-md bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white disabled:opacity-30 transition-all shadow-md shadow-rose-600/25 outline-none cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight size={13} />
          </button>
        </div>

      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-72 flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="text-rose-500 animate-spin" />
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
          Syncing Catalog Dossier...
        </p>
      </div>
    );
  }

  if (filteredShows.length === 0) {
    return (
      <div className="p-12 text-center rounded-lg bg-gradient-to-r from-[#170B20] via-[#0F0D24] to-[#0A1224] border border-rose-500/30 space-y-3 text-white">
        <Clapperboard size={36} className="text-rose-400 mx-auto" />
        <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-slate-200">
          No Titles In This Filter
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto font-mono">
          No matching records were located. Adjust your tier gate, status, or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 1. TOP PAGINATION BAR */}
      {renderPaginationBar(true)}

      {/* ========================================================================= */}
      {/* VIEW 1: CINEMA POSTER CARDS                                               */}
      {/* ========================================================================= */}
      {layoutView === 'CARDS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
          {currentShows.map((item, index) => {
            const category = categorizeShow(item);
            const seasons = item.seasonsWatched || item.show?.totalSeasons || 1;
            const poster = item.show?.posterUrl || DEFAULT_POSTERS[index % DEFAULT_POSTERS.length];
            const globalIndex = indexOfFirstRecord + index + 1;

            return (
              <div
                key={item._id}
                onClick={() => onSelectItem(item)}
                className="group relative rounded-md bg-gradient-to-b from-[#160B24] via-[#0F0C1E] to-[#0A0F1D] border border-rose-500/25 hover:border-rose-400 shadow-lg hover:shadow-rose-950/40 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden text-left"
              >
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={poster}
                    alt={item.show?.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                    onError={(e) => { e.target.src = DEFAULT_POSTERS[0]; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0C1E] via-[#0F0C1E]/30 to-transparent" />

                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-sm bg-black/80 backdrop-blur-md text-amber-300 font-mono text-[10px] font-bold border border-white/10">
                    #{globalIndex}
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <div className={`px-2 py-0.5 rounded-sm text-xs font-mono font-black border ${getScoreBadge(item.rating)}`}>
                      {item.rating ? item.rating.toFixed(1) : 'N/A'}
                    </div>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-rose-300 block mb-0.5">
                      {category === 'INDIAN' ? '🇮🇳 Desi' : category === 'ANIME' ? '⚡ Anime' : '🎬 Hollywood'}
                    </span>
                    <h4 className="text-sm font-bold uppercase text-white tracking-tight truncate leading-tight">
                      {item.show?.title}
                    </h4>
                  </div>
                </div>

                <div className="p-3 space-y-2 text-white">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                    <span className="flex items-center gap-1.5">
                      {getStatusIcon(item.status)}
                      <span>S{seasons} Watched</span>
                    </span>
                    {item.show?.releaseYear && <span className="text-amber-300">{item.show.releaseYear}</span>}
                  </div>

                  {item.review ? (
                    <p className="text-[11px] text-slate-300 italic line-clamp-2 leading-tight">
                      "{item.review}"
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">No review notes logged.</p>
                  )}

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => onToggleFavorite(e, item._id)}
                      className={`p-1 rounded-sm transition-colors ${
                        item.isFavorite ? 'text-rose-400' : 'text-slate-400 hover:text-rose-400'
                      }`}
                    >
                      <Heart size={14} fill={item.isFavorite ? 'currentColor' : 'none'} />
                    </button>

                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 group-hover:text-amber-300 transition-colors">
                      Edit Score →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: COMPACT TILES                                                     */}
      {/* ========================================================================= */}
      {layoutView === 'COMPACT_TILES' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
          {currentShows.map((item, index) => {
            const poster = item.show?.posterUrl || DEFAULT_POSTERS[index % DEFAULT_POSTERS.length];
            return (
              <div
                key={item._id}
                onClick={() => onSelectItem(item)}
                className="group relative aspect-2/3 rounded-md bg-slate-900 border border-rose-500/20 hover:border-rose-400 overflow-hidden cursor-pointer shadow-md text-left transition-all"
              >
                <img
                  src={poster}
                  alt={item.show?.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-75"
                  onError={(e) => { e.target.src = DEFAULT_POSTERS[0]; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-black border backdrop-blur-sm bg-black/70 text-amber-300 border-amber-400/40">
                  {item.rating ? item.rating.toFixed(1) : '—'}
                </div>

                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs font-bold uppercase text-white truncate leading-tight">
                    {item.show?.title}
                  </p>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 mt-0.5">
                    <span>S{item.seasonsWatched || 1}</span>
                    {item.isFavorite && <Heart size={10} className="fill-rose-500 text-rose-500" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: EDITORIAL LIST                                                    */}
      {/* ========================================================================= */}
      {layoutView === 'LIST' && (
        <div className="flex flex-col divide-y divide-white/10 bg-gradient-to-b from-[#160B24] via-[#0F0C1E] to-[#0A0F1D] border border-rose-500/30 rounded-md overflow-hidden shadow-lg text-white">
          {currentShows.map((item, index) => {
            const category = categorizeShow(item);
            const seasons = item.seasonsWatched || item.show?.totalSeasons || 1;
            const poster = item.show?.posterUrl || DEFAULT_POSTERS[index % DEFAULT_POSTERS.length];
            const globalIndex = indexOfFirstRecord + index + 1;

            return (
              <div
                key={item._id}
                onClick={() => onSelectItem(item)}
                className="p-3 sm:p-3.5 hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs font-bold text-amber-400 w-5 text-right shrink-0">
                    {globalIndex}
                  </span>

                  <div className="w-9 h-11 rounded-sm overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                    <img src={poster} alt="" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold uppercase text-white truncate">
                        {item.show?.title}
                      </h4>
                      <span className="px-1.5 py-0.2 rounded-xs text-[9px] font-mono font-bold uppercase bg-white/10 text-rose-300 border border-rose-500/30 shrink-0">
                        {category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-slate-400">
                        Season {seasons} Watched
                      </span>
                      {item.review && (
                        <>
                          <span className="text-slate-500">•</span>
                          <span className="text-[11px] text-slate-300 truncate italic max-w-sm">
                            "{item.review}"
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => onToggleFavorite(e, item._id)}
                    className={`p-1.5 rounded-sm transition-colors ${
                      item.isFavorite ? 'text-rose-400' : 'text-slate-400 hover:text-rose-400'
                    }`}
                  >
                    <Heart size={14} fill={item.isFavorite ? 'currentColor' : 'none'} />
                  </button>

                  <div className={`px-2 py-0.5 rounded-sm text-xs font-mono font-bold border ${getScoreBadge(item.rating)}`}>
                    {item.rating ? item.rating.toFixed(1) : 'N/A'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: TIMELINE STRIP                                                    */}
      {/* ========================================================================= */}
      {layoutView === 'TIMELINE' && (
        <div className="space-y-2 text-left">
          {currentShows.map((item) => {
            const category = categorizeShow(item);
            const reviewDate = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Logged';

            return (
              <div
                key={item._id}
                onClick={() => onSelectItem(item)}
                className="p-3 rounded-md bg-gradient-to-r from-[#170B22] via-[#0F0D24] to-[#0A1224] border border-rose-500/25 hover:border-rose-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer shadow-md transition-colors text-white"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="px-2.5 py-1 rounded-sm bg-white/[0.08] border border-white/10 font-mono text-[10px] font-bold text-amber-300 shrink-0 text-center">
                    {item.show?.releaseYear || reviewDate}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold uppercase text-white truncate">
                        {item.show?.title}
                      </h4>
                      <span className="text-[9px] font-mono uppercase text-rose-300">
                        [{category}]
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 truncate italic mt-0.5">
                      {item.review ? `"${item.review}"` : 'No review note added'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-white/10">
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.ratingHistory?.length > 1 ? `${item.ratingHistory.length} edits` : 'Original score'}
                  </span>

                  <div className={`px-2.5 py-0.5 rounded-sm text-xs font-mono font-bold border ${getScoreBadge(item.rating)}`}>
                    {item.rating ? `${item.rating.toFixed(1)} / 10` : '—'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: DENSE AUDIT TABLE                                                 */}
      {/* ========================================================================= */}
      {layoutView === 'TABLE' && (
        <div className="w-full overflow-x-auto bg-gradient-to-b from-[#160B24] via-[#0F0C1E] to-[#0A0F1D] border border-rose-500/30 rounded-md shadow-lg text-left text-white">
          <table className="w-full border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04] text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300/80">
                <th className="py-2.5 px-3.5 w-10 text-center">#</th>
                <th className="py-2.5 px-3.5">Title</th>
                <th className="py-2.5 px-3.5">Channel</th>
                <th className="py-2.5 px-3.5">Progress</th>
                <th className="py-2.5 px-3.5">Critique Snippet</th>
                <th className="py-2.5 px-3.5 text-right">Score</th>
                <th className="py-2.5 px-3.5 text-center w-12">Fav</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-sans">
              {currentShows.map((item, idx) => {
                const category = categorizeShow(item);
                const seasons = item.seasonsWatched || item.show?.totalSeasons || 1;
                const globalIndex = indexOfFirstRecord + idx + 1;

                return (
                  <tr
                    key={item._id}
                    onClick={() => onSelectItem(item)}
                    className="hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3.5 font-mono text-center font-bold text-amber-300">
                      {globalIndex}
                    </td>

                    <td className="py-2.5 px-3.5 font-bold text-white uppercase truncate max-w-[200px]">
                      {item.show?.title}
                    </td>

                    <td className="py-2.5 px-3.5">
                      <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-mono font-bold uppercase bg-white/10 text-rose-300 border border-rose-500/30">
                        {category}
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5 font-mono text-slate-300">
                      S{seasons}
                    </td>

                    <td className="py-2.5 px-3.5 text-slate-300 italic truncate max-w-xs">
                      {item.review || '—'}
                    </td>

                    <td className="py-2.5 px-3.5 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-sm text-xs font-mono font-bold border ${getScoreBadge(item.rating)}`}>
                        {item.rating ? item.rating.toFixed(1) : '—'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => onToggleFavorite(e, item._id)}
                        className={item.isFavorite ? 'text-rose-400' : 'text-slate-400 hover:text-rose-400'}
                      >
                        <Heart size={13} fill={item.isFavorite ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. BOTTOM PAGINATION BAR */}
      {renderPaginationBar(false)}
    </div>
  );
};

export default HomeShowCatalog;