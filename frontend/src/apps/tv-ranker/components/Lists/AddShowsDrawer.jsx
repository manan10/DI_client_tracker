import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { X, Film, Search, Plus, Check, Loader2, Tv } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../../../shared/hooks/useApi';

const AddShowsDrawer = ({
  isOpen,
  onClose,
  listId,
  existingShowIds = [],
  onShowAdded
}) => {
  const { request } = useApi();
  const [catalogShows, setCatalogShows] = useState([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [addingShowId, setAddingShowId] = useState(null);

  const fetchCatalog = useCallback(async () => {
    setIsLoadingCatalog(true);
    try {
      const res = await request('/shows?all=true&limit=1000', 'GET');
      let items = [];
      if (Array.isArray(res)) items = res;
      else if (Array.isArray(res?.data)) items = res.data;
      else if (Array.isArray(res?.shows)) items = res.shows;
      setCatalogShows(items);
    } catch (err) {
      console.error('Failed to load master show catalog:', err);
      toast.error('Failed to load show directory');
    } finally {
      setIsLoadingCatalog(false);
    }
  }, [request]);

  useEffect(() => {
    if (isOpen && catalogShows.length === 0) {
      fetchCatalog();
    }
  }, [isOpen, catalogShows.length, fetchCatalog]);

  const existingSet = useMemo(() => {
    return new Set(existingShowIds.map((id) => String(id)));
  }, [existingShowIds]);

  const filteredCatalog = useMemo(() => {
    const q = catalogSearch.toLowerCase().trim();
    if (!q) return catalogShows.slice(0, 50);

    return catalogShows
      .filter((s) => {
        const titleMatch = (s.title || '').toLowerCase().includes(q);
        const genreMatch = Array.isArray(s.genres) && s.genres.some((g) => g.toLowerCase().includes(q));
        const yearMatch = String(s.releaseYear || s.year || '').includes(q);
        return titleMatch || genreMatch || yearMatch;
      })
      .slice(0, 60);
  }, [catalogShows, catalogSearch]);

  const handleAdd = async (showId) => {
    setAddingShowId(showId);
    try {
      const res = await request(`/lists/${listId}/items`, 'POST', { showId });
      if (res?.success && res.data) {
        toast.success('Show appended to list');
        if (typeof onShowAdded === 'function') onShowAdded(res.data);
      } else {
        toast.error(res?.message || 'Failed to add show');
      }
    } catch (err) {
      console.error('Error adding show to list:', err);
      toast.error(err.message || 'Error adding show');
    } finally {
      setAddingShowId(null);
    }
  };

  if (!isOpen) return null;

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

        {/* Grab Handle for Mobile */}
        <div className="w-full flex sm:hidden items-center justify-center pt-2.5 pb-1 bg-[#DEE5EF] dark:bg-[#19202E] shrink-0">
          <div className="w-12 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4.5 bg-[#DEE5EF] dark:bg-[#171F2C] border-b-2 border-slate-300 dark:border-[#2C384D] flex items-center justify-between shrink-0 shadow-[0_2px_4px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.25)] relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white dark:bg-[#253044] border border-slate-300 dark:border-[#3B4B67] flex items-center justify-center text-[#40bcf4] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#141A24] shrink-0">
              <Film size={16} strokeWidth={2.4} className="text-[#40bcf4]" />
            </div>
            
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 dark:text-white leading-none">
                  Add Shows To List
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284c7] dark:text-[#40bcf4] bg-[#40bcf4]/10 border border-[#40bcf4]/30 px-2 py-0.5 rounded shadow-2xs">
                  Picker
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Search and append titles from the catalog
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

        {/* Live Search Bar */}
        <div className="p-4 bg-[#DEE5EF]/60 dark:bg-[#151D2A] border-b border-slate-300 dark:border-[#2C384D]">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Filter master catalog by title or genre..."
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-white dark:bg-[#141C28] border-2 border-slate-300 dark:border-[#2C384D] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#40bcf4] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] transition-colors"
            />
            {catalogSearch && (
              <button
                type="button"
                onClick={() => setCatalogSearch('')}
                className="absolute right-3 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Catalog Stream */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2 no-scrollbar flex-1 text-left">
          {isLoadingCatalog ? (
            <div className="h-60 flex flex-col items-center justify-center gap-2">
              <Loader2 size={24} className="animate-spin text-[#40bcf4]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Loading Master Catalog...
              </span>
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500">
              No shows match "{catalogSearch}"
            </div>
          ) : (
            filteredCatalog.map((show) => {
              const isAlreadyInList = existingSet.has(String(show._id));
              const isAdding = addingShowId === show._id;

              return (
                <div
                  key={show._id}
                  className="p-2.5 rounded-xl bg-white dark:bg-[#141C28] border-2 border-slate-300 dark:border-[#2C384D] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-11 bg-black shrink-0 overflow-hidden border border-slate-800 rounded-none relative">
                      {show.posterUrl ? (
                        <img src={show.posterUrl} alt={show.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Tv size={14} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {show.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                        {show.releaseYear && <span>{show.releaseYear}</span>}
                        {show.type && <span>• {show.type.replace('_', ' ')}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isAlreadyInList ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold uppercase text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg">
                        <Check size={12} strokeWidth={3} className="text-[#00e054]" />
                        Added
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAdd(show._id)}
                        disabled={isAdding}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-[#00e054] hover:bg-[#00c94b] text-[#14181C] text-[10px] font-black uppercase tracking-wider rounded-lg border border-[#00c94b] border-b-[2px] border-b-[#009e3a] active:border-b active:translate-y-[1px] cursor-pointer disabled:opacity-50"
                      >
                        {isAdding ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} strokeWidth={3} />}
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t-2 border-slate-300 dark:border-[#2C384D] bg-[#DEE5EF] dark:bg-[#171F2C] flex items-center justify-between text-xs font-mono text-slate-500">
          <span>{existingShowIds.length} titles in this list</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-slate-800 dark:text-white hover:underline cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddShowsDrawer;