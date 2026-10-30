import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, Plus, Search, X, Loader2, Sparkles, 
  Trash2, RefreshCw, Layers, Lock, Globe,
  ArrowUpDown, Edit3, AlertTriangle, Tv, ChevronUp, ChevronDown,
  MessageSquare, Film, Heart, Bookmark, PlayCircle, CheckCircle2,
  PauseCircle, XCircle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useApi } from '../../../shared/hooks/useApi';

import ShowNavbar from '../components/ShowNavbar';
import AddRatingModal from '../components/AddRatingModal';
import BulkImportModal from '../components/BulkImportModal';
import ListFormDrawer from '../components/Lists/ListFormDrawer';
import AddShowsDrawer from '../components/Lists/AddShowsDrawer';

const ListDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request, loading: apiLoading } = useApi();

  // Primary State
  const [list, setList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Drawers & Modals
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isAddShowsOpen, setIsAddShowsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // In-line note editing state
  const [editingNoteShowId, setEditingNoteShowId] = useState(null);
  const [noteInputText, setNoteInputText] = useState('');

  const fetchListDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await request(`/lists/${id}`, 'GET');
      if (res?.success && res.data) {
        setList(res.data);
      } else if (res?._id) {
        setList(res);
      } else {
        toast.error(res?.message || 'Failed to load list details');
      }
    } catch (err) {
      console.error('Fetch list error:', err);
      toast.error('Failed to load list details');
    } finally {
      setIsLoading(false);
    }
  }, [id, request]);

  useEffect(() => {
    fetchListDetails();
  }, [fetchListDetails]);

  const isSystem = Boolean(list?.isSystem);

  // Extract show IDs currently in list for the AddShowsDrawer
  const existingShowIds = useMemo(() => {
    if (!list?.items) return [];
    return list.items.map((item) => item.show?._id || item.show);
  }, [list]);

  // In-page search filter
  const filteredListItems = useMemo(() => {
    if (!list?.items) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return list.items;

    return list.items.filter((item) => {
      const title = (item.show?.title || '').toLowerCase();
      const note = (item.note || '').toLowerCase();
      const genreMatch = Array.isArray(item.show?.genres) && item.show.genres.some((g) => g.toLowerCase().includes(q));
      return title.includes(q) || note.includes(q) || genreMatch;
    });
  }, [list, searchQuery]);

  const handleRemoveShow = async (showId, showTitle) => {
    if (isSystem) return;
    try {
      const res = await request(`/lists/${id}/items/${showId}`, 'DELETE');
      if (res?.success && res.data) {
        setList(res.data);
        toast.success(`Removed "${showTitle || 'Show'}" from list`);
      } else {
        toast.error(res?.message || 'Failed to remove show');
      }
    } catch (err) {
      console.error('Remove show error:', err);
      toast.error(err.message || 'Error removing show');
    }
  };

  const handleMoveOrder = async (index, direction) => {
    if (isSystem || !list?.items) return;
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.items.length) return;

    const reordered = [...list.items];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, movedItem);

    setList((prev) => ({
      ...prev,
      items: reordered.map((item, idx) => ({ ...item, order: idx + 1 }))
    }));

    try {
      const orderedShowIds = reordered.map((item) => item.show?._id || item.show);
      const res = await request(`/lists/${id}/reorder`, 'PUT', { orderedShowIds });
      if (res?.success && res.data) {
        setList(res.data);
      }
    } catch (err) {
      console.error('Reorder error:', err);
      toast.error('Failed to sync reordered positions');
      fetchListDetails();
    }
  };

  const handleSaveShowNote = async (showId) => {
    if (isSystem || !list?.items) return;
    try {
      const updatedItems = list.items.map((item) => {
        if (String(item.show?._id || item.show) === String(showId)) {
          return { ...item, note: noteInputText.trim() };
        }
        return item;
      });

      const res = await request(`/lists/${id}`, 'PUT', { items: updatedItems });
      if (res?.success && res.data) {
        setList(res.data);
        toast.success('Note updated');
        setEditingNoteShowId(null);
        setNoteInputText('');
      } else {
        toast.error(res?.message || 'Failed to save note');
      }
    } catch (err) {
      console.error('Note update error:', err);
      toast.error(err.message || 'Error saving note');
    }
  };

  const handleDeleteList = async () => {
    if (isSystem) return;
    try {
      const res = await request(`/lists/${id}`, 'DELETE');
      if (res?.success || res?._id) {
        toast.success(`List "${list.title}" deleted`);
        navigate('/tv-rater/lists');
      } else {
        toast.error(res?.message || 'Failed to delete list');
      }
    } catch (err) {
      console.error('Delete list error:', err);
      toast.error(err.message || 'Error deleting list');
    }
  };

  const totalItemsCount = list?.items?.length || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070A10] text-slate-900 dark:text-stone-100 font-sans selection:bg-[#40bcf4]/20 selection:text-slate-950 dark:selection:bg-[#40bcf4]/30 dark:selection:text-white transition-colors duration-300 pb-20 relative overflow-x-hidden">
      
      {/* Precision Ambient Background */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#40bcf4]/10 dark:from-[#40bcf4]/5 via-transparent to-transparent pointer-events-none" />

      {/* Primary Top Navbar */}
      <ShowNavbar
        onOpenImport={() => setIsImportOpen(true)}
        onOpenAddShow={() => setIsRatingModalOpen(true)}
      />

      <main className="relative z-10 w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 flex flex-col gap-5">

        {/* ========================================================================= */}
        {/* 1. TACTILE BACK BUTTON & EDITORIAL HEADER                                 */}
        {/* ========================================================================= */}
        <section className="relative w-full pt-1 font-sans select-none">
          
          <div className="mb-3">
            <button
              type="button"
              onClick={() => navigate('/tv-rater/lists')}
              className="group inline-flex items-center gap-2.5 px-3.5 py-2 bg-white dark:bg-[#111927] hover:bg-slate-100 dark:hover:bg-[#182337] text-slate-800 dark:text-stone-200 border border-slate-300 dark:border-[#2C3440] border-b-[3px] border-b-slate-400 dark:border-b-black active:border-b active:translate-y-[2px] transition-all cursor-pointer rounded-none shadow-xs select-none"
              title="Back to Show Lists"
            >
              <div className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-[#1B2537] text-slate-700 dark:text-stone-300 group-hover:text-[#40bcf4] transition-colors pointer-events-none">
                <ArrowLeft size={13} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                Back to Lists
              </span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 sm:pb-5">
            
            <div className="space-y-2 max-w-3xl min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-200/60 dark:bg-white/5 border border-slate-300/60 dark:border-white/10 shadow-2xs">
                <Sparkles size={10} className="text-[#40bcf4] animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-stone-300">
                  {isSystem ? 'System Default Vault' : 'Curated Custom Dossier'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[1000] uppercase tracking-tight text-slate-950 dark:text-white leading-[1.04]">
                {list?.title ? (
                  <>
                    {list.title.split(' ').slice(0, -1).join(' ')}{' '}
                    <span className="text-[#40bcf4]">
                      {list.title.split(' ').slice(-1)}
                    </span>
                  </>
                ) : (
                  'List Details'
                )}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-stone-400 font-medium leading-relaxed max-w-2xl">
                {list?.description || 'Curated series collection.'}
              </p>
            </div>

            {/* Right: Actions Cluster (Disabled on System Lists) */}
            {!isSystem ? (
              <div className="self-start sm:self-end shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddShowsOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#00e054] hover:bg-[#00c94b] text-[#14181C] text-xs font-black uppercase tracking-wider border border-[#00c94b] border-b-[3px] border-b-[#009e3a] active:border-b active:translate-y-[2px] transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,224,84,0.3)] rounded-none"
                >
                  <Plus size={15} strokeWidth={3} />
                  <span>Add Shows</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditDrawerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#111927] hover:bg-slate-100 dark:hover:bg-[#182337] text-slate-800 dark:text-stone-200 text-xs font-bold uppercase tracking-wider border border-slate-300 dark:border-[#2C3440] border-b-[3px] border-b-slate-400 dark:border-b-black active:border-b active:translate-y-[2px] transition-all cursor-pointer rounded-none shadow-xs"
                  title="Edit List Metadata"
                >
                  <Edit3 size={13} strokeWidth={2.5} className="text-[#40bcf4]" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-600 text-rose-600 hover:text-white dark:text-rose-400 dark:hover:text-white border border-rose-200 dark:border-rose-500/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none"
                  title="Delete List"
                >
                  <Trash2 size={13} strokeWidth={2.5} />
                  <span>Delete</span>
                </button>
              </div>
            ) : (
              <div className="self-start sm:self-end shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-500/10 border border-purple-500/30">
                  <Lock size={12} />
                  Auto-Synchronized System List
                </span>
              </div>
            )}

          </div>

          {/* Status strip */}
          <div className="w-full border-b border-slate-200/90 dark:border-white/10 pt-1 pb-3 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#38bdf8]/20 dark:bg-[#38bdf8]/15 text-[#0369a1] dark:text-[#38bdf8] border border-[#38bdf8]/40 rounded-none shrink-0">
                {totalItemsCount} {totalItemsCount === 1 ? 'SHOW' : 'SHOWS'}
              </span>

              {list?.isRanked && (
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#0284c7] text-white border border-[#0284c7] rounded-none shrink-0 flex items-center gap-1">
                  <ArrowUpDown size={10} strokeWidth={3} />
                  RANKED
                </span>
              )}

              {isSystem ? (
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 rounded-none shrink-0">
                  SYSTEM DEFAULT
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 bg-transparent rounded-none shrink-0 flex items-center gap-1">
                  {list?.isPublic ? <Globe size={10} /> : <Lock size={10} />}
                  {list?.isPublic ? 'PUBLIC' : 'PRIVATE'}
                </span>
              )}

              {Array.isArray(list?.tags) && list.tags.filter(t => t !== 'system').map((t) => (
                <span key={t} className="text-slate-400 dark:text-stone-400 font-bold ml-1">
                  #{t}
                </span>
              ))}
            </div>

            {list?.updatedAt && (
              <span className="text-[10px] text-slate-400">
                Updated {new Date(list.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. SUB-BAR: Search + Telemetry                                            */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
            <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
              Showing <span className="font-bold text-[#0284c7] dark:text-[#38bdf8] underline">{filteredListItems.length}</span> of {totalItemsCount} titles
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center">
              <Search size={13} className="absolute left-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in this list..."
                className="w-56 sm:w-64 h-8 pl-8 pr-7 bg-white dark:bg-[#101726] border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#40bcf4] rounded-none transition-colors"
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
              onClick={fetchListDetails}
              disabled={isLoading}
              title="Refresh List"
              className="h-8 px-2.5 bg-white dark:bg-[#101726] border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center rounded-none"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin text-[#40bcf4]' : ''} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. SHOWS INTERACTIVE LEDGER TABLE                                         */}
        {/* ========================================================================= */}
        <div className="w-full border-2 border-slate-900 dark:border-black bg-white dark:bg-[#0C121D] shadow-sm rounded-none overflow-hidden">
          
          {isLoading ? (
            <div className="h-80 flex flex-col items-center justify-center gap-2">
              <Loader2 size={28} className="animate-spin text-[#40bcf4]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Loading List Entries...
              </span>
            </div>
          ) : filteredListItems.length === 0 ? (
            <div className="py-20 px-4 text-center space-y-2">
              <Film size={34} className="mx-auto text-slate-400 dark:text-slate-600 stroke-1" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {searchQuery ? `No shows match "${searchQuery}" in this list` : 'No titles currently in this collection'}
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto mb-2">
                {isSystem 
                  ? 'Add or update shows from the Home dashboard to populate this system list automatically.'
                  : 'Use the Add Shows button above to append titles from the catalog.'}
              </p>
              {!isSystem && (
                <button
                  type="button"
                  onClick={() => setIsAddShowsOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00e054] hover:bg-[#00c94b] text-[#14181C] text-xs font-black uppercase tracking-wider rounded-none cursor-pointer"
                >
                  <Plus size={13} strokeWidth={3} />
                  <span>Add Shows</span>
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y-2 divide-slate-900 dark:divide-black">
              {filteredListItems.map((item, index) => {
                const show = item.show || {};
                const showId = show._id;
                const displayRank = item.order || index + 1;
                const isEditingNote = editingNoteShowId === showId;

                return (
                  <div
                    key={showId || index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-4 py-2 hover:bg-slate-50 dark:hover:bg-[#111927] transition-colors gap-3 group"
                  >
                    
                    {/* Left: Reorder Steppers + #Rank + Poster + Title + Tags + Note */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      
                      {/* Reorder Steppers (Only visible on custom lists) */}
                      {!isSystem ? (
                        <div className="flex flex-col items-center justify-center shrink-0 -my-1">
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(index, 'UP')}
                            disabled={index === 0}
                            className="p-0.5 text-slate-400 hover:text-[#40bcf4] disabled:opacity-20 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                            title="Move up"
                          >
                            <ChevronUp size={14} strokeWidth={3} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(index, 'DOWN')}
                            disabled={index === filteredListItems.length - 1}
                            className="p-0.5 text-slate-400 hover:text-[#40bcf4] disabled:opacity-20 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                            title="Move down"
                          >
                            <ChevronDown size={14} strokeWidth={3} />
                          </button>
                        </div>
                      ) : null}

                      {/* Rank # */}
                      <span className="w-6 text-center font-mono text-xs font-black text-slate-800 dark:text-slate-300 shrink-0">
                        #{displayRank}
                      </span>

                      {/* Thumbnail Poster */}
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
                            <Tv size={14} />
                          </div>
                        )}
                      </div>

                      {/* Show Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <span className="font-[1000] text-xs sm:text-sm uppercase tracking-tight text-slate-950 dark:text-white truncate">
                            {show.title || 'Untitled Show'}
                          </span>

                          {show.type && (
                            <span className="px-1.5 py-0.2 text-[9px] font-mono font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 bg-transparent rounded-none shrink-0">
                              {show.type.replace('_', ' ')}
                            </span>
                          )}

                          {show.releaseYear && (
                            <span className="text-[10px] font-mono text-slate-400 font-bold">
                              {show.releaseYear}
                            </span>
                          )}
                        </div>

                        {/* Annotation Note View / Edit */}
                        {isEditingNote && !isSystem ? (
                          <div className="flex items-center gap-2 pt-1 max-w-lg">
                            <input
                              type="text"
                              value={noteInputText}
                              onChange={(e) => setNoteInputText(e.target.value)}
                              placeholder="Add an annotation for this pick..."
                              className="w-full h-7 px-2 bg-slate-50 dark:bg-[#070e1b] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-[#40bcf4] rounded-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveShowNote(showId)}
                              className="px-2 py-1 bg-[#00e054] text-[#14181C] text-[10px] font-mono font-bold uppercase rounded-none cursor-pointer shrink-0"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingNoteShowId(null)}
                              className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-mono uppercase rounded-none cursor-pointer shrink-0"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          item.note ? (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono italic flex items-center gap-1.5 line-clamp-1">
                              <MessageSquare size={10} className="text-[#40bcf4] shrink-0" />
                              "{item.note}"
                            </p>
                          ) : null
                        )}
                      </div>

                    </div>

                    {/* Right: Actions Cluster (Custom lists only) */}
                    {!isSystem && (
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center pl-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteShowId(showId);
                            setNoteInputText(item.note || '');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-[#40bcf4] dark:bg-[#162030] dark:hover:bg-[#40bcf4] text-slate-700 hover:text-black dark:text-slate-300 dark:hover:text-black border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer rounded-none"
                          title={item.note ? 'Edit Note' : 'Add Note'}
                        >
                          <MessageSquare size={11} strokeWidth={2.5} />
                          <span className="hidden sm:inline">{item.note ? 'Edit Note' : '+ Note'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveShow(showId, show.title)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-600 text-rose-600 hover:text-white dark:text-rose-400 dark:hover:text-white border border-rose-200 dark:border-rose-500/30 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer rounded-none"
                          title="Remove from list"
                        >
                          <Trash2 size={11} strokeWidth={2.5} />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </main>

      {/* Extracted Component: Add Shows Drawer (Custom lists only) */}
      {!isSystem && (
        <AddShowsDrawer
          isOpen={isAddShowsOpen}
          onClose={() => setIsAddShowsOpen(false)}
          listId={id}
          existingShowIds={existingShowIds}
          onShowAdded={(updatedList) => setList(updatedList)}
        />
      )}

      {/* Edit List Metadata Drawer (Custom lists only) */}
      {!isSystem && (
        <ListFormDrawer
          isOpen={isEditDrawerOpen}
          onClose={() => setIsEditDrawerOpen(false)}
          list={list}
          onSuccess={(updated) => setList(updated)}
        />
      )}

      {/* Delete List Confirmation Modal (Custom lists only) */}
      {isDeleteModalOpen && !isSystem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsDeleteModalOpen(false)}
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
                  Delete Custom List
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Permanent removal
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{list?.title}"</span>? The shows will remain in the master catalog, but this grouping will be removed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer rounded-none"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteList}
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

      {/* Global Modals */}
      <BulkImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={fetchListDetails}
      />

      <AddRatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onCreated={fetchListDetails}
      />

    </div>
  );
};

export default ListDetail;