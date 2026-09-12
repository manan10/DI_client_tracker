import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Search, Tv, Film, Sparkles, Clapperboard, Layers, 
  Plus, Loader2, LayoutGrid, List as ListIcon, 
  Library, Edit3, Heart, Bookmark, ChevronLeft, 
  ChevronRight, ChevronDown, Check, X, RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../../shared/hooks/useApi';

import ShowNavbar from '../components/ShowNavbar';
import CreateShowModal from '../components/Lists/CreateShowModal';
import NotesImportModal from '../components/NotesImportModal';

const DEFAULT_POSTERS = [
  'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&q=80',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&q=80'
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const Lists = () => {
  const { request } = useApi();

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Categories: 'ALL' | 'TV_SERIES' | 'ANIME' | 'MOVIE' | 'MINISERIES' | 'DOCUMENTARY'
  const [activeChannel, setActiveChannel] = useState('ALL');
  
  // Custom Filters for Favorites and Wishlist
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [filterWishlist, setFilterWishlist] = useState(false);

  // Layout view: default set to 'LIST'
  const [layoutView, setLayoutView] = useState('LIST');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const pageSizeRef = useRef(null);

  // Modals & Editing State
  const [isAddShowOpen, setIsAddShowOpen] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Close Page Size Popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pageSizeRef.current && !pageSizeRef.current.contains(e.target)) {
        setIsPageSizeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request('/shows?limit=500');
      const list = Array.isArray(res) ? res : res?.data || res?.shows || [];
      setShows(list);
    } catch (err) {
      console.error('Failed to load shows catalog:', err);
      toast.error('Unable to fetch show lists');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Channel breakdown counts
  const channelCounts = useMemo(() => {
    return {
      all: shows.length,
      series: shows.filter(s => s.type === 'TV_SERIES').length,
      anime: shows.filter(s => s.type === 'ANIME' || s.genres?.some(g => g.toLowerCase() === 'anime')).length,
      movies: shows.filter(s => s.type === 'MOVIE').length,
      mini: shows.filter(s => s.type === 'MINISERIES').length,
      docs: shows.filter(s => s.type === 'DOCUMENTARY').length,
      favorites: shows.filter(s => Boolean(s.isFavorite || s.favorite)).length,
      wishlist: shows.filter(s => s.status === 'PLAN_TO_WATCH' || s.isWishlist || s.wishlist).length
    };
  }, [shows]);

  // Filter shows based on active channel, search query, favorites, and wishlist
  const filteredShows = useMemo(() => {
    return shows.filter((show) => {
      const term = searchQuery.toLowerCase().trim();
      const titleMatch = !term || show.title?.toLowerCase().includes(term);
      const genreMatch = !term || (Array.isArray(show.genres) && show.genres.some(g => g.toLowerCase().includes(term)));
      
      if (!titleMatch && !genreMatch) return false;

      // Favorites Toggle Filter
      if (filterFavorites && !(show.isFavorite || show.favorite)) {
        return false;
      }

      // Wishlist Toggle Filter
      if (filterWishlist && !(show.status === 'PLAN_TO_WATCH' || show.isWishlist || show.wishlist)) {
        return false;
      }

      if (activeChannel === 'ALL') return true;
      if (activeChannel === 'ANIME') {
        return show.type === 'ANIME' || show.genres?.some(g => g.toLowerCase() === 'anime');
      }
      return show.type === activeChannel;
    });
  }, [shows, activeChannel, searchQuery, filterFavorites, filterWishlist]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeChannel, filterFavorites, filterWishlist, layoutView]);

  // Sliced pagination records
  const totalRecords = filteredShows.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const indexOfLastRecord = currentPage * itemsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
  const paginatedShows = useMemo(() => {
    return filteredShows.slice(indexOfFirstRecord, indexOfLastRecord);
  }, [filteredShows, indexOfFirstRecord, indexOfLastRecord]);

  const channels = [
    { id: 'ALL', label: 'All Catalog', count: channelCounts.all, icon: Library, color: 'text-rose-400' },
    { id: 'TV_SERIES', label: 'TV Series', count: channelCounts.series, icon: Tv, color: 'text-amber-400' },
    { id: 'ANIME', label: 'Anime', count: channelCounts.anime, icon: Sparkles, color: 'text-cyan-400' },
    { id: 'MOVIE', label: 'Feature Films', count: channelCounts.movies, icon: Film, color: 'text-pink-400' },
    { id: 'MINISERIES', label: 'Miniseries', count: channelCounts.mini, icon: Layers, color: 'text-purple-400' },
    { id: 'DOCUMENTARY', label: 'Documentaries', count: channelCounts.docs, icon: Clapperboard, color: 'text-emerald-400' }
  ];

  const handleOpenAdd = () => {
    setEditingShow(null);
    setIsAddShowOpen(true);
  };

  const handleOpenEdit = (show, e) => {
    if (e) e.stopPropagation();
    setEditingShow(show);
    setIsAddShowOpen(true);
  };

  const handleModalClose = () => {
    setIsAddShowOpen(false);
    setEditingShow(null);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || activeChannel !== 'ALL' || filterFavorites || filterWishlist;

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveChannel('ALL');
    setFilterFavorites(false);
    setFilterWishlist(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060A14] text-slate-900 dark:text-slate-100 font-sans selection:bg-rose-500/20 transition-colors duration-300 pb-36 relative overflow-x-hidden">
      
      {/* Precision Ambient Horizon Glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-linear-to-b from-rose-500/10 via-amber-500/5 to-transparent pointer-events-none dark:from-rose-500/5 dark:via-transparent" />

      {/* Global Navigation */}
      <ShowNavbar
        onOpenImport={() => setIsImportOpen(true)}
        onOpenAddShow={handleOpenAdd}
      />

      <main className="relative z-10 w-full max-w-425 mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-5 sm:pt-7 flex flex-col gap-5 sm:gap-6">
        
        {/* ===================================================================== */}
        {/* 1. CINEMATIC HERO HEADER                                             */}
        {/* ===================================================================== */}
        <header className="p-5 sm:p-7 rounded-xl bg-linear-to-r from-rose-950 via-slate-900 to-[#0F1424] border border-rose-500/30 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-full bg-linear-to-l from-rose-500/15 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-white/10 border border-white/15 text-rose-300 text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
              <Library size={13} className="text-amber-400" />
              <span>Master Entertainment Index</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold uppercase tracking-[0.14em] leading-tight text-white">
              Catalog <span className="bg-linear-to-r from-amber-300 via-rose-300 to-fuchsia-300 bg-clip-text text-transparent">Directory</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Explore your registered database titles segregated by media category. Click on any title or card to edit metadata and details.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 shrink-0 self-start lg:self-auto">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-linear-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-serif font-bold uppercase tracking-[0.14em] shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={16} strokeWidth={3} />
              <span>Add New Show</span>
            </button>
          </div>
        </header>

        {/* ===================================================================== */}
        {/* 2. CHANNELS & CURATED STATUS FILTERS (FAVORITES & WISHLIST)          */}
        {/* ===================================================================== */}
        <div className="flex flex-col gap-3">
          {/* Format Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {channels.map((ch) => {
              const Icon = ch.icon;
              const isSelected = activeChannel === ch.id;

              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setActiveChannel(ch.id)}
                  className={`flex flex-col justify-between p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-linear-to-r from-rose-950 via-slate-900 to-[#0F1424] text-white border-rose-500 ring-2 ring-rose-500/30 shadow-md'
                      : 'bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <Icon size={16} className={isSelected ? 'text-amber-300' : ch.color} />
                    <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-sm border ${
                      isSelected 
                        ? 'bg-white/15 text-white border-white/20' 
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10'
                    }`}>
                      {ch.count}
                    </span>
                  </div>

                  <span className="text-xs font-serif font-bold uppercase tracking-wider truncate mt-3">
                    {ch.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Collection Filters Strip: Favorites & Wishlist */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
                Collection Filter:
              </span>

              {/* Favorites Filter Button */}
              <button
                type="button"
                onClick={() => setFilterFavorites(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  filterFavorites
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-400 dark:border-rose-500/50 shadow-xs'
                    : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                }`}
              >
                <Heart size={14} className={filterFavorites ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
                <span>Favorites Only</span>
                <span className="text-[10px] font-mono ml-1 px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10">
                  {channelCounts.favorites}
                </span>
              </button>

              {/* Wishlist / Plan to Watch Filter Button */}
              <button
                type="button"
                onClick={() => setFilterWishlist(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  filterWishlist
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400 dark:border-amber-500/50 shadow-xs'
                    : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                }`}
              >
                <Bookmark size={14} className={filterWishlist ? 'fill-amber-500 text-amber-500' : 'text-slate-400'} />
                <span>Wishlist Queue</span>
                <span className="text-[10px] font-mono ml-1 px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10">
                  {channelCounts.wishlist}
                </span>
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:underline cursor-pointer ml-auto"
              >
                <RotateCcw size={11} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 3. DISCOVERY CONTROLS & LAYOUT SWITCHER                              */}
        {/* ===================================================================== */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-3 sm:p-4 rounded-xl shadow-xs">
          {/* Search Bar */}
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search directory by title or genre (e.g. Severance, Drama, Anime)..."
              className="w-full h-10 pl-10 pr-9 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-rose-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
              Showing <strong className="text-slate-900 dark:text-white">{filteredShows.length}</strong> Titles
            </span>

            {/* Layout Toggle (Default: List View) */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-lg border border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setLayoutView('LIST')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  layoutView === 'LIST'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Detailed List"
              >
                <ListIcon size={15} />
              </button>

              <button
                type="button"
                onClick={() => setLayoutView('CARDS')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  layoutView === 'CARDS'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Poster Cards"
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 4. SHOWS DISPLAY (DEFAULT LIST VIEW OR CARDS VIEW)                    */}
        {/* ===================================================================== */}
        {loading ? (
          <div className="h-72 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="text-rose-600 animate-spin" />
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
              Retrieving Catalog Directory...
            </p>
          </div>
        ) : filteredShows.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-white dark:bg-[#0B1120] border border-dashed border-slate-300 dark:border-white/15 space-y-3">
            <Clapperboard size={36} className="text-slate-400 mx-auto" />
            <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              No Shows In This Filter
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-mono">
              {hasActiveFilters ? 'No shows matched your criteria. Clear filters or add a new entry.' : 'Your catalog for this format is empty.'}
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-xs font-serif font-bold uppercase tracking-wider cursor-pointer"
            >
              <Plus size={14} />
              <span>Create Show Entry</span>
            </button>
          </div>
        ) : layoutView === 'LIST' ? (
          /* ======================== DEFAULT VIEW: DENSE DIRECTORY LIST ======================== */
          <div className="flex flex-col divide-y divide-slate-200 dark:divide-white/10 bg-white dark:bg-[#0A0F1D] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-xs">
            {paginatedShows.map((show, idx) => {
              const poster = show.posterUrl || DEFAULT_POSTERS[idx % DEFAULT_POSTERS.length];
              const globalIndex = indexOfFirstRecord + idx + 1;

              return (
                <div
                  key={show._id || idx}
                  onClick={(e) => handleOpenEdit(show, e)}
                  className="p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-white/2 transition-colors flex items-center justify-between gap-3 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-400 w-6 text-right shrink-0">
                      {globalIndex}
                    </span>

                    <div className="w-10 h-12 rounded-sm overflow-hidden bg-slate-800 shrink-0 border border-slate-200 dark:border-white/10 shadow-2xs group-hover:border-rose-500/40 transition-colors">
                      <img src={poster} alt="" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold uppercase text-slate-900 dark:text-white truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          {show.title}
                        </h4>
                        <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-mono font-bold uppercase bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 shrink-0">
                          {show.type?.replace('_', ' ') || 'SERIES'}
                        </span>
                        {(show.isFavorite || show.favorite) && (
                          <Heart size={12} className="fill-rose-500 text-rose-500 shrink-0" />
                        )}
                        {(show.status === 'PLAN_TO_WATCH' || show.isWishlist || show.wishlist) && (
                          <Bookmark size={12} className="fill-amber-500 text-amber-500 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1 truncate">
                        <span>{show.releaseYear || '—'}</span>
                        <span>•</span>
                        <span>{show.totalSeasons ? `${show.totalSeasons} Seasons` : '1 Season'}</span>
                        {Array.isArray(show.genres) && show.genres.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-rose-600 dark:text-rose-400 truncate">
                              {show.genres.join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(show, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-serif font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ======================== VIEW 2: POSTER CARDS ======================== */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
            {paginatedShows.map((show, idx) => {
              const poster = show.posterUrl || DEFAULT_POSTERS[idx % DEFAULT_POSTERS.length];
              return (
                <div
                  key={show._id || idx}
                  onClick={(e) => handleOpenEdit(show, e)}
                  className="group relative rounded-xl bg-white dark:bg-[#0A0F1D] border border-slate-200 dark:border-white/10 hover:border-rose-500/60 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden text-left cursor-pointer"
                >
                  <div className="relative aspect-2/3 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={poster}
                      alt={show.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                      onError={(e) => { e.target.src = DEFAULT_POSTERS[0]; }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#0A0F1D] via-transparent to-transparent" />

                    {/* Format Pill */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-sm bg-black/75 backdrop-blur-sm text-white font-mono text-[9px] font-bold uppercase tracking-wider border border-white/10">
                      {show.type?.replace('_', ' ') || 'SERIES'}
                    </div>

                    {/* Icons Indicator */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      {(show.isFavorite || show.favorite) && (
                        <div className="p-1 rounded-sm bg-black/75 backdrop-blur-sm text-rose-500 border border-white/10">
                          <Heart size={11} className="fill-rose-500" />
                        </div>
                      )}
                      {(show.status === 'PLAN_TO_WATCH' || show.isWishlist || show.wishlist) && (
                        <div className="p-1 rounded-sm bg-black/75 backdrop-blur-sm text-amber-400 border border-white/10">
                          <Bookmark size={11} className="fill-amber-400" />
                        </div>
                      )}
                      <div className="p-1 rounded-sm bg-black/75 hover:bg-rose-600 backdrop-blur-sm text-white border border-white/10">
                        <Edit3 size={11} />
                      </div>
                    </div>

                    {/* Bottom overlay: Title */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <h4 className="text-xs sm:text-sm font-bold uppercase text-white tracking-wide truncate leading-tight drop-shadow-sm group-hover:text-rose-300 transition-colors">
                        {show.title}
                      </h4>
                    </div>
                  </div>

                  <div className="p-2.5 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {show.releaseYear || '—'}
                    </span>
                    <span>{show.totalSeasons ? `${show.totalSeasons}S` : '1S'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===================================================================== */}
        {/* 5. PAGINATION CONTROLS                                                */}
        {/* ===================================================================== */}
        {!loading && totalRecords > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 rounded-xl bg-white dark:bg-[#0A0F1D] border border-slate-200 dark:border-white/10 gap-3 shadow-xs text-left">
            
            {/* Range Counter & Rows-Per-Page Selector */}
            <div className="flex items-center gap-3.5 w-full sm:w-auto justify-between sm:justify-start">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono tracking-wide">
                Showing <span className="font-bold text-slate-900 dark:text-white">{indexOfFirstRecord + 1}</span> to{' '}
                <span className="font-bold text-slate-900 dark:text-white">{Math.min(indexOfLastRecord, totalRecords)}</span> of{' '}
                <span className="font-bold text-slate-900 dark:text-white">{totalRecords}</span> entries[cite: 1]
              </p>

              <div className="relative" ref={pageSizeRef}>
                <button
                  type="button"
                  onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
                  className="h-8 px-2.5 flex items-center gap-1.5 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:border-slate-300 transition-all cursor-pointer outline-none"
                >
                  <span>{itemsPerPage} / page</span>
                  <ChevronDown size={11} className={`text-slate-400 transition-transform ${isPageSizeOpen ? 'rotate-180 text-rose-500' : ''}`} />
                </button>

                {isPageSizeOpen && (
                  <div className="absolute bottom-[calc(100%+4px)] left-0 w-28 z-50 bg-white dark:bg-[#0B101E] border border-slate-200 dark:border-white/15 rounded-md shadow-xl p-1 space-y-0.5 animate-in fade-in duration-150">
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
                          className={`w-full flex items-center justify-between p-1.5 rounded-sm text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold'
                              : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="text-[11px] font-mono font-bold">{size} rows</span>
                          {isSelected && <Check size={11} className="text-rose-600 dark:text-rose-400" strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Prev / Next Steppers */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-serif font-bold uppercase tracking-wider rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition-all outline-none cursor-pointer"
              >
                <ChevronLeft size={13} />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-500 dark:text-slate-400 px-1.5">
                <span className="text-slate-900 dark:text-white font-bold">{currentPage}</span>
                <span>/</span>
                <span>{totalPages}</span>
              </div>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-serif font-bold uppercase tracking-wider rounded-md bg-linear-to-r from-rose-600 to-amber-500 text-white disabled:opacity-30 transition-all shadow-xs outline-none cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>

          </div>
        )}
      </main>

      {/* ===================================================================== */}
      {/* 6. MODALS                                                             */}
      {/* ===================================================================== */}
      <CreateShowModal
        isOpen={isAddShowOpen}
        onClose={handleModalClose}
        onCreated={fetchCatalog}
        editingShow={editingShow}
      />

      <NotesImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={fetchCatalog}
      />
    </div>
  );
};

export default Lists;