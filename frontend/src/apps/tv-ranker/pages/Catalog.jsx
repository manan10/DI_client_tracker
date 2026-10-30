import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, Search, X, Loader2, Film, Tv, Sparkles, 
  Flame, Edit3, Trash2, AlertTriangle, RefreshCw, UploadCloud
} from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../../shared/hooks/useApi';

import ShowNavbar from '../components/ShowNavbar';
import AddRatingModal from '../components/AddRatingModal';
import BulkImportModal from '../components/BulkImportModal';
import CatalogShowFormModal from '../components/Catalog/CatalogShowFormModal';

const CATEGORIES = [
  { id: 'ALL', label: 'All', shortLabel: 'All', icon: Film },
  { id: 'INDIAN', label: 'Indian', shortLabel: 'Indian', icon: Flame },
  { id: 'HOLLYWOOD', label: 'Hollywood', shortLabel: 'West', icon: Tv },
  { id: 'ANIME', label: 'Anime', shortLabel: 'Anime', icon: Sparkles }
];

const Catalog = () => {
  const { request, loading: apiLoading } = useApi();

  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isAddShowOpen, setIsAddShowOpen] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const [deletingShow, setDeletingShow] = useState(null);

  // Fetch full catalog without backend limit capping
  const fetchShows = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await request('/shows?all=true&limit=1000');

      let list = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res?.shows)) {
        list = res.shows;
      } else if (res?.data && typeof res.data === 'object') {
        list = Array.isArray(res.data.shows) ? res.data.shows : (Array.isArray(res.data.data) ? res.data.data : []);
      }

      setShows(list);
    } catch (err) {
      console.error('Failed to load shows:', err);
      toast.error('Failed to load show directory');
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  // Taxonomical categorizer identical to Stats and Home
  const categorizeShow = useCallback((s) => {
    const genres = (s?.genres || []).map((g) => String(g).toLowerCase());
    const type = String(s?.type || '').toUpperCase();
    const title = String(s?.title || '').toLowerCase();

    if (
      type === 'ANIME' ||
      genres.includes('anime') ||
      genres.includes('animation') ||
      title.includes('one piece') ||
      title.includes('attack on titan')
    ) {
      return 'ANIME';
    }

    if (
      genres.includes('indian') ||
      genres.includes('hindi') ||
      genres.includes('regional') ||
      s?.region === 'INDIAN'
    ) {
      return 'INDIAN';
    }

    return 'HOLLYWOOD';
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const hollywood = shows.filter((s) => categorizeShow(s) === 'HOLLYWOOD').length;
    const indian = shows.filter((s) => categorizeShow(s) === 'INDIAN').length;
    const anime = shows.filter((s) => categorizeShow(s) === 'ANIME').length;
    return {
      ALL: shows.length,
      HOLLYWOOD: hollywood,
      INDIAN: indian,
      ANIME: anime
    };
  }, [shows, categorizeShow]);

  // Filter shows by active tab and search query, sorted alphabetically A-Z
  const filteredShows = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return shows
      .filter((s) => {
        if (activeCategory !== 'ALL' && categorizeShow(s) !== activeCategory) {
          return false;
        }

        if (!query) return true;

        const titleMatch = (s.title || '').toLowerCase().includes(query);
        const genreMatch = Array.isArray(s.genres) && s.genres.some((g) => g.toLowerCase().includes(query));
        const yearMatch = String(s.releaseYear || s.year || '').includes(query);

        return titleMatch || genreMatch || yearMatch;
      })
      .sort((a, b) => {
        const titleA = (a.title || '').trim();
        const titleB = (b.title || '').trim();
        return titleA.localeCompare(titleB, undefined, { sensitivity: 'base', numeric: true });
      });
  }, [shows, searchQuery, activeCategory, categorizeShow]);

  // Pagination calculation
  const totalCount = filteredShows.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedShows = useMemo(() => {
    return filteredShows.slice(startIndex, startIndex + pageSize);
  }, [filteredShows, startIndex, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleDeleteShow = async () => {
    if (!deletingShow?._id) return;

    try {
      const res = await request(`/shows/${deletingShow._id}`, 'DELETE');
      if (res?.success || res?._id || res?.message?.toLowerCase().includes('success')) {
        toast.success(`"${deletingShow.title}" removed from catalog`);
        setShows((prev) => prev.filter((s) => s._id !== deletingShow._id));
        setDeletingShow(null);
      } else {
        toast.error(res?.message || 'Failed to delete show');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Error deleting show');
    }
  };

  const getFormatTags = (show) => {
    const tags = [];
    const rawType = (show?.type || 'TV_SERIES').toUpperCase();
    const genres = (show?.genres || []).map((g) => String(g).toUpperCase());

    if (rawType === 'ANIME' || genres.includes('ANIME') || genres.includes('ANIMATION')) {
      tags.push({ label: 'ANIME', variant: 'cyan' });
    } else {
      tags.push({ label: 'GLOBAL', variant: 'blue' });
    }

    if (rawType === 'MINISERIES') {
      tags.push({ label: 'MINISERIES', variant: 'neutral' });
    } else if (rawType === 'MOVIE') {
      tags.push({ label: 'MOVIE', variant: 'neutral' });
    } else {
      tags.push({ label: 'TV SERIES', variant: 'neutral' });
    }

    return tags;
  };

  const renderBadge = (tag, idx) => {
    if (tag.variant === 'cyan') {
      return (
        <span 
          key={idx}
          className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-[#0284c7] text-white border border-[#0284c7] rounded-none shrink-0"
        >
          {tag.label}
        </span>
      );
    }
    if (tag.variant === 'blue') {
      return (
        <span 
          key={idx}
          className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-[#38bdf8]/20 dark:bg-[#38bdf8]/15 text-[#0369a1] dark:text-[#38bdf8] border border-[#38bdf8]/40 rounded-none shrink-0"
        >
          {tag.label}
        </span>
      );
    }
    return (
      <span 
        key={idx}
        className="px-1.5 py-0.5 text-[9px] font-mono font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 bg-transparent rounded-none shrink-0"
      >
        {tag.label}
      </span>
    );
  };

  const currentDisplayStart = totalCount === 0 ? 0 : startIndex + 1;
  const currentDisplayEnd = Math.min(startIndex + pageSize, totalCount);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070A10] text-slate-900 dark:text-stone-100 font-sans selection:bg-[#40bcf4]/20 selection:text-slate-950 dark:selection:bg-[#40bcf4]/30 dark:selection:text-white transition-colors duration-300 pb-20 relative overflow-x-hidden">
      
      {/* Precision Ambient Background */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#40bcf4]/10 dark:from-[#40bcf4]/5 via-transparent to-transparent pointer-events-none" />

      {/* Top Navbar */}
      <ShowNavbar
        onOpenAddShow={() => setIsRatingModalOpen(true)}
      />

      <main className="relative z-10 w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 flex flex-col gap-5">
        
        {/* ========================================================================= */}
        {/* 1. EDITORIAL HEADER & DOCKED TABS                                         */}
        {/* ========================================================================= */}
        <section className="relative w-full pt-2 sm:pt-4 font-sans select-none">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 sm:pb-5">
            
            {/* Title, Badge & Subtitle */}
            <div className="space-y-2 max-w-2xl min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-200/60 dark:bg-white/5 border border-slate-300/60 dark:border-white/10 shadow-2xs">
                <Sparkles size={10} className="text-[#40bcf4] animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-stone-300">
                  Master Title Directory
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[1000] uppercase tracking-tight text-slate-950 dark:text-white leading-[1.04]">
                Show <span className="text-[#40bcf4]">Catalog</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-stone-400 font-medium leading-relaxed max-w-xl">
                Canonical inventory of all series and anime sorted alphabetically. Add new entries, import note archives, or adjust formats.
              </p>
            </div>

            {/* Right: Actions Cluster (Bulk Import + Add Show) */}
            <div className="self-start sm:self-end shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsImportOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#111927] hover:bg-slate-100 dark:hover:bg-[#182337] text-slate-800 dark:text-stone-200 text-xs font-bold uppercase tracking-wider border border-slate-300 dark:border-[#2C3440] border-b-[3px] border-b-slate-400 dark:border-b-black active:border-b active:translate-y-[2px] transition-all cursor-pointer rounded-none shadow-xs"
                title="Bulk Import Notes Archive"
              >
                <UploadCloud size={14} className="text-[#40bcf4]" />
                <span>Bulk Import</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddShowOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#00e054] hover:bg-[#00c94b] text-[#14181C] text-xs font-black uppercase tracking-wider border border-[#00c94b] border-b-[3px] border-b-[#009e3a] active:border-b active:translate-y-[2px] transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,224,84,0.3)] rounded-none"
              >
                <Plus size={15} strokeWidth={3} />
                <span>Add Show</span>
              </button>
            </div>

          </div>

          {/* Docked Baseline Tabs */}
          <div className="w-full border-b border-slate-200/90 dark:border-white/10 pt-1">
            <div className="grid grid-cols-4 sm:flex items-center gap-1 sm:gap-2 w-full sm:w-auto -mb-px">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                const count = categoryCounts[cat.id] ?? 0;
                const Icon = cat.icon;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setCurrentPage(1);
                    }}
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
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. SUB-BAR: Search + Count Telemetry + Page Sizer                         */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs select-none">
          
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
            <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
              Showing <span className="font-bold text-[#0284c7] dark:text-[#38bdf8] underline">{currentDisplayStart}–{currentDisplayEnd}</span> of {totalCount} titles
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <div className="relative flex items-center">
              <Search size={13} className="absolute left-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search catalog..."
                className="w-48 sm:w-60 h-8 pl-8 pr-7 bg-white dark:bg-[#101726] border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#40bcf4] rounded-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={fetchShows}
              disabled={isLoading}
              title="Refresh Show Directory"
              className="h-8 px-2.5 bg-white dark:bg-[#101726] border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center rounded-none"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin text-[#40bcf4]' : ''} />
            </button>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8 px-2 bg-white dark:bg-[#101726] border border-slate-300 dark:border-slate-800 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer rounded-none"
            >
              <option value={20}>20 / view</option>
              <option value={50}>50 / view</option>
              <option value={100}>100 / view</option>
            </select>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. COMPACT FLAT LEDGER TABLE                                              */}
        {/* ========================================================================= */}
        <div className="w-full border-2 border-slate-900 dark:border-black bg-white dark:bg-[#0C121D] shadow-sm rounded-none overflow-hidden">
          
          {isLoading ? (
            <div className="h-80 flex flex-col items-center justify-center gap-2">
              <Loader2 size={28} className="animate-spin text-[#40bcf4]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Loading Master Catalog...
              </span>
            </div>
          ) : paginatedShows.length === 0 ? (
            <div className="py-20 px-4 text-center space-y-2">
              <Film size={34} className="mx-auto text-slate-400 dark:text-slate-600 stroke-1" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {searchQuery ? `No shows match "${searchQuery}"` : 'No titles currently registered'}
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Use the Add Show button above to register a new entry.
              </p>
            </div>
          ) : (
            <div className="divide-y-2 divide-slate-900 dark:divide-black">
              {paginatedShows.map((show, index) => {
                const globalIndex = startIndex + index + 1;
                const formatTags = getFormatTags(show);
                const year = show.releaseYear || show.year || null;

                return (
                  <div
                    key={show._id || index}
                    className="flex items-center justify-between px-3 sm:px-4 py-2 hover:bg-slate-50 dark:hover:bg-[#111927] transition-colors gap-3 group"
                  >
                    
                    {/* Left: #Rank + Thumbnail + Title + Tags */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      
                      <span className="w-7 text-center font-mono text-xs font-black text-slate-800 dark:text-slate-300 shrink-0">
                        #{globalIndex}
                      </span>

                      <div className="w-8 h-11 sm:w-9 sm:h-12 bg-black shrink-0 overflow-hidden border border-slate-900 dark:border-white/20 rounded-none relative">
                        {show.posterUrl ? (
                          <img 
                            src={show.posterUrl} 
                            alt={show.title} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <Film size={14} />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                        <span className="font-[1000] text-xs sm:text-sm uppercase tracking-tight text-slate-950 dark:text-white truncate">
                          {show.title}
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {formatTags.map((tag, tIdx) => renderBadge(tag, tIdx))}

                          {year && (
                            <span className="text-[10px] font-mono text-slate-400 font-bold ml-0.5">
                              {year}
                            </span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Right: Edit & Delete Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <button
                        type="button"
                        onClick={() => setEditingShow(show)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-[#40bcf4] dark:bg-[#162030] dark:hover:bg-[#40bcf4] text-slate-700 hover:text-black dark:text-slate-300 dark:hover:text-black border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer rounded-none"
                        title="Edit show details"
                      >
                        <Edit3 size={11} strokeWidth={2.5} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingShow(show)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-600 text-rose-600 hover:text-white dark:text-rose-400 dark:hover:text-white border border-rose-200 dark:border-rose-500/30 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer rounded-none"
                        title="Delete show"
                      >
                        <Trash2 size={11} strokeWidth={2.5} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* 4. PAGINATION CONTROLS                                                    */}
        {/* ========================================================================= */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1 select-none text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">
              Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of {totalPages}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white dark:bg-[#101726] border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold rounded-none"
              >
                Prev
              </button>
              
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white dark:bg-[#101726] border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold rounded-none"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Delete Confirmation Alert Modal */}
      {deletingShow && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={() => setDeletingShow(null)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-[#121926] border-2 border-black rounded-none p-5 space-y-3.5 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-none bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle size={17} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold uppercase text-slate-900 dark:text-white leading-tight">
                  Delete Catalog Entry
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Permanent removal
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{deletingShow.title}"</span>? This will permanently remove this record from the database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setDeletingShow(null)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer rounded-none"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteShow}
                disabled={apiLoading}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer rounded-none disabled:opacity-50"
              >
                {apiLoading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Show Modal */}
      {isAddShowOpen && (
        <CatalogShowFormModal
          isOpen={isAddShowOpen}
          onClose={() => setIsAddShowOpen(false)}
          onSaved={(newShow) => {
            setShows((prev) => [newShow, ...prev]);
            setIsAddShowOpen(false);
          }}
        />
      )}

      {/* Edit Show Details Modal */}
      {editingShow && (
        <CatalogShowFormModal
          isOpen={Boolean(editingShow)}
          initialShow={editingShow}
          onClose={() => setEditingShow(null)}
          onSaved={(updatedShow) => {
            setShows((prev) =>
              prev.map((s) => (s._id === updatedShow._id ? updatedShow : s))
            );
            setEditingShow(null);
          }}
        />
      )}

      {/* Global Modals */}
      <BulkImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={fetchShows}
      />

      <AddRatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onCreated={fetchShows}
      />
    </div>
  );
};

export default Catalog;