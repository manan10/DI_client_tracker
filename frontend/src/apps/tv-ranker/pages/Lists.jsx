import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, Search, X, Loader2, Sparkles, 
  Trash2, RefreshCw, Layers, Lock, Globe,
  ArrowUpDown, ExternalLink, Edit3, Heart, Bookmark,
  PlayCircle, CheckCircle2, PauseCircle, XCircle, Tv
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useApi } from '../../../shared/hooks/useApi';

import ShowNavbar from '../components/ShowNavbar';
import AddRatingModal from '../components/AddRatingModal';
import BulkImportModal from '../components/BulkImportModal';
import ListFormDrawer from '../components/Lists/ListFormDrawer';

// 3 clear tabs
const TABS = [
  { id: 'ALL', label: 'All Lists', icon: Layers },
  { id: 'DEFAULT', label: 'Default Lists', icon: Heart },
  { id: 'CUSTOM', label: 'My Lists', icon: Sparkles }
];

const Lists = () => {
  const navigate = useNavigate();
  const { request, loading: apiLoading } = useApi();

  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Drawers
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [deletingList, setDeletingList] = useState(null);

  const fetchLists = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await request('/lists', 'GET');
      let data = [];
      if (Array.isArray(res)) data = res;
      else if (Array.isArray(res?.data)) data = res.data;
      else if (Array.isArray(res?.lists)) data = res.lists;
      setLists(data);
    } catch (err) {
      console.error('Failed to load lists:', err);
      toast.error('Could not load lists');
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      ALL: lists.length,
      DEFAULT: lists.filter((l) => Boolean(l.isSystem)).length,
      CUSTOM: lists.filter((l) => !l.isSystem).length
    };
  }, [lists]);

  // Icons for default status lists
  const getListIcon = (title) => {
    const t = String(title || '').toLowerCase();
    if (t.includes('favourite')) return <Heart size={14} className="text-rose-500 fill-rose-500" />;
    if (t.includes('watchlist')) return <Bookmark size={14} className="text-amber-500 fill-amber-500" />;
    if (t.includes('watching')) return <PlayCircle size={14} className="text-[#40bcf4]" />;
    if (t.includes('finished') || t.includes('completed')) return <CheckCircle2 size={14} className="text-emerald-500" />;
    if (t.includes('on hold')) return <PauseCircle size={14} className="text-purple-400" />;
    if (t.includes('dropped')) return <XCircle size={14} className="text-rose-400" />;
    return <Tv size={14} className="text-slate-500" />;
  };

  // 1. Filtered Default Lists
  const filteredDefaultLists = useMemo(() => {
    if (activeTab === 'CUSTOM') return [];
    const q = searchQuery.toLowerCase().trim();
    return lists
      .filter((l) => Boolean(l.isSystem))
      .filter((l) => {
        if (!q) return true;
        return (
          (l.title || '').toLowerCase().includes(q) ||
          (l.description || '').toLowerCase().includes(q)
        );
      });
  }, [lists, searchQuery, activeTab]);

  // 2. Filtered Custom Lists
  const filteredCustomLists = useMemo(() => {
    if (activeTab === 'DEFAULT') return [];
    const q = searchQuery.toLowerCase().trim();
    return lists
      .filter((l) => !l.isSystem)
      .filter((l) => {
        if (!q) return true;
        const titleMatch = (l.title || '').toLowerCase().includes(q);
        const descMatch = (l.description || '').toLowerCase().includes(q);
        const tagMatch = Array.isArray(l.tags) && l.tags.some((t) => t.toLowerCase().includes(q));
        return titleMatch || descMatch || tagMatch;
      })
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }, [lists, searchQuery, activeTab]);

  // Custom list pagination
  const totalCustomPages = Math.ceil(filteredCustomLists.length / pageSize) || 1;
  const startCustomIndex = (currentPage - 1) * pageSize;
  const paginatedCustomLists = useMemo(() => {
    return filteredCustomLists.slice(startCustomIndex, startCustomIndex + pageSize);
  }, [filteredCustomLists, startCustomIndex, pageSize]);

  useEffect(() => {
    if (currentPage > totalCustomPages) {
      setCurrentPage(1);
    }
  }, [totalCustomPages, currentPage]);

  const handleDeleteList = async () => {
    if (!deletingList?._id) return;

    try {
      const res = await request(`/lists/${deletingList._id}`, 'DELETE');
      if (res?.success || res?._id || res?.message?.toLowerCase().includes('success')) {
        toast.success(`"${deletingList.title}" deleted`);
        setLists((prev) => prev.filter((l) => l._id !== deletingList._id));
        setDeletingList(null);
      } else {
        toast.error(res?.message || 'Could not delete list');
      }
    } catch (err) {
      console.error('Delete list error:', err);
      toast.error(err.message || 'Error deleting list');
    }
  };

  const handleOpenEdit = (list, e) => {
    if (e) e.stopPropagation();
    if (list.isSystem) {
      toast.info('Default lists cannot be changed');
      return;
    }
    setEditingList(list);
    setIsDrawerOpen(true);
  };

  // Reusable row renderer
  const renderListRow = (list, indexNumber, isDefault = false) => {
    const itemsCount = list.items?.length || 0;
    const firstCover = list.coverImage || list.items?.[0]?.show?.posterUrl || null;

    return (
      <div
        key={list._id}
        onClick={() => navigate(`/tv-rater/lists/${list._id}`)}
        className="flex items-center justify-between px-3 sm:px-4 py-2 hover:bg-slate-50 dark:hover:bg-[#111927] transition-colors gap-3 group cursor-pointer"
      >
        {/* Left: Index + Image + Info */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <span className="w-7 text-center font-mono text-xs font-black text-slate-800 dark:text-slate-300 shrink-0">
            #{indexNumber}
          </span>

          <div className="w-8 h-11 sm:w-9 sm:h-12 bg-black shrink-0 overflow-hidden border border-slate-900 dark:border-white/20 rounded-none relative">
            {firstCover ? (
              <img 
                src={firstCover} 
                alt={list.title} 
                className="w-full h-full object-cover" 
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                {isDefault ? getListIcon(list.title) : <Tv size={14} />}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
            <div className="flex items-center gap-1.5">
              {isDefault && getListIcon(list.title)}
              <span className="font-[1000] text-xs sm:text-sm uppercase tracking-tight text-slate-950 dark:text-white truncate group-hover:text-[#40bcf4] transition-colors">
                {list.title}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-[#38bdf8]/20 dark:bg-[#38bdf8]/15 text-[#0369a1] dark:text-[#38bdf8] border border-[#38bdf8]/40 rounded-none shrink-0">
                {itemsCount} {itemsCount === 1 ? 'SHOW' : 'SHOWS'}
              </span>

              {isDefault ? (
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 rounded-none shrink-0">
                  DEFAULT
                </span>
              ) : (
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 bg-transparent rounded-none shrink-0 flex items-center gap-1">
                  {list.isPublic ? <Globe size={9} /> : <Lock size={9} />}
                  {list.isPublic ? 'PUBLIC' : 'PRIVATE'}
                </span>
              )}

              {list.isRanked && (
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-[#0284c7] text-white border border-[#0284c7] rounded-none shrink-0 flex items-center gap-1">
                  <ArrowUpDown size={9} strokeWidth={3} />
                  RANKED
                </span>
              )}

              {!isDefault && Array.isArray(list.tags) && list.tags.slice(0, 2).map((tag, tIdx) => (
                <span 
                  key={tIdx} 
                  className="text-[10px] font-mono text-slate-400 font-bold ml-0.5 hidden md:inline"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div 
          className="flex items-center gap-1.5 shrink-0 pl-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => navigate(`/tv-rater/lists/${list._id}`)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-[#40bcf4] dark:bg-[#162030] dark:hover:bg-[#40bcf4] text-slate-700 hover:text-black dark:text-slate-300 dark:hover:text-black border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer rounded-none"
            title="Open List"
          >
            <ExternalLink size={11} strokeWidth={2.5} />
            <span className="hidden sm:inline">Open</span>
          </button>

          {!isDefault && (
            <>
              <button
                type="button"
                onClick={(e) => handleOpenEdit(list, e)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-[#40bcf4] dark:bg-[#162030] dark:hover:bg-[#40bcf4] text-slate-700 hover:text-black dark:text-slate-300 dark:hover:text-black border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer rounded-none"
                title="Edit List"
              >
                <Edit3 size={11} strokeWidth={2.5} />
                <span className="hidden sm:inline">Edit</span>
              </button>

              <button
                type="button"
                onClick={() => setDeletingList(list)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-600 text-rose-600 hover:text-white dark:text-rose-400 dark:hover:text-white border border-rose-200 dark:border-rose-500/30 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer rounded-none"
                title="Delete List"
              >
                <Trash2 size={11} strokeWidth={2.5} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const showDefaultTable = activeTab === 'ALL' || activeTab === 'DEFAULT';
  const showCustomTable = activeTab === 'ALL' || activeTab === 'CUSTOM';

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070A10] text-slate-900 dark:text-stone-100 font-sans selection:bg-[#40bcf4]/20 selection:text-slate-950 dark:selection:bg-[#40bcf4]/30 dark:selection:text-white transition-colors duration-300 pb-20 relative overflow-x-hidden">
      
      {/* Precision Ambient Glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#40bcf4]/10 dark:from-[#40bcf4]/5 via-transparent to-transparent pointer-events-none" />

      {/* Top Navbar */}
      <ShowNavbar
        onOpenImport={() => setIsImportOpen(true)}
        onOpenAddShow={() => setIsRatingModalOpen(true)}
      />

      <main className="relative z-10 w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 flex flex-col gap-6">
        
        {/* Header & Tabs */}
        <section className="relative w-full pt-2 sm:pt-4 font-sans select-none">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 sm:pb-5">
            
            <div className="space-y-1.5 max-w-2xl min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-200/60 dark:bg-white/5 border border-slate-300/60 dark:border-white/10 shadow-2xs">
                <Sparkles size={10} className="text-[#40bcf4]" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-stone-300">
                  Collections
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[1000] uppercase tracking-tight text-slate-950 dark:text-white leading-none">
                Show <span className="text-[#40bcf4]">Lists</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-stone-400 font-medium">
                Automatic default lists and your own custom collections.
              </p>
            </div>

            {/* Create List Button */}
            <div className="self-start sm:self-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  setEditingList(null);
                  setIsDrawerOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#00e054] hover:bg-[#00c94b] text-[#14181C] text-xs font-black uppercase tracking-wider border border-[#00c94b] border-b-[3px] border-b-[#009e3a] active:border-b active:translate-y-[2px] transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,224,84,0.3)] rounded-none"
              >
                <Plus size={15} strokeWidth={3} />
                <span>Create List</span>
              </button>
            </div>

          </div>

          {/* 3 Docked Baseline Tabs */}
          <div className="w-full border-b border-slate-200/90 dark:border-white/10 pt-1">
            <div className="grid grid-cols-3 sm:flex items-center gap-1 sm:gap-2 w-full sm:w-auto -mb-px">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const count = tabCounts[tab.id] ?? 0;
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setCurrentPage(1);
                    }}
                    className={`group relative flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold transition-all duration-150 cursor-pointer text-center border-b-2 ${
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

                    <span>{tab.label}</span>

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

        {/* Search Bar + Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs select-none">
          <div className="relative flex items-center max-w-sm w-full">
            <Search size={13} className="absolute left-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search in lists..."
              className="w-full h-8 pl-8 pr-7 bg-white dark:bg-[#101726] border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#40bcf4] rounded-none transition-colors"
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

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={fetchLists}
              disabled={isLoading}
              title="Refresh Lists"
              className="h-8 px-2.5 bg-white dark:bg-[#101726] border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center rounded-none"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin text-[#40bcf4]' : ''} />
            </button>

            {showCustomTable && (
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
            )}
          </div>
        </div>

        {/* Global Loading State */}
        {isLoading ? (
          <div className="h-80 flex flex-col items-center justify-center gap-2 border-2 border-slate-900 dark:border-black bg-white dark:bg-[#0C121D]">
            <Loader2 size={28} className="animate-spin text-[#40bcf4]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Loading Lists...
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-6">

            {/* ===================================================================== */}
            {/* TABLE 1: DEFAULT LISTS                                                */}
            {/* ===================================================================== */}
            {showDefaultTable && (
              <section className="flex flex-col gap-2">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <Heart size={14} className="text-rose-500 fill-rose-500" />
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-stone-200">
                      Default Lists
                    </h2>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({filteredDefaultLists.length})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Auto-Updated from Watch Status
                  </span>
                </div>

                <div className="w-full border-2 border-slate-900 dark:border-black bg-white dark:bg-[#0C121D] shadow-sm rounded-none overflow-hidden">
                  {filteredDefaultLists.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 font-mono">
                      No default lists match "{searchQuery}"
                    </div>
                  ) : (
                    <div className="divide-y-2 divide-slate-900 dark:divide-black">
                      {filteredDefaultLists.map((list, idx) => renderListRow(list, idx + 1, true))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ===================================================================== */}
            {/* TABLE 2: MY CUSTOM LISTS                                              */}
            {/* ===================================================================== */}
            {showCustomTable && (
              <section className="flex flex-col gap-2">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#40bcf4]" />
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-stone-200">
                      My Lists
                    </h2>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({filteredCustomLists.length})
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">
                    {filteredCustomLists.length > 0 && (
                      <>Showing {startCustomIndex + 1}–{Math.min(startCustomIndex + pageSize, filteredCustomLists.length)} of {filteredCustomLists.length}</>
                    )}
                  </span>
                </div>

                <div className="w-full border-2 border-slate-900 dark:border-black bg-white dark:bg-[#0C121D] shadow-sm rounded-none overflow-hidden">
                  {paginatedCustomLists.length === 0 ? (
                    <div className="py-14 px-4 text-center space-y-2">
                      <Layers size={30} className="mx-auto text-slate-400 dark:text-slate-600 stroke-1" />
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        {searchQuery ? `No custom lists match "${searchQuery}"` : 'No custom lists created yet'}
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        Make a collection or ranked queue using the Create List button.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y-2 divide-slate-900 dark:divide-black">
                      {paginatedCustomLists.map((list, idx) => 
                        renderListRow(list, startCustomIndex + idx + 1, false)
                      )}
                    </div>
                  )}
                </div>

                {/* Pagination for Custom Lists */}
                {totalCustomPages > 1 && (
                  <div className="flex items-center justify-between pt-1 select-none text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400">
                      Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of {totalCustomPages}
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
                        onClick={() => setCurrentPage((p) => Math.min(totalCustomPages, p + 1))}
                        disabled={currentPage === totalCustomPages}
                        className="px-3 py-1 bg-white dark:bg-[#101726] border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold rounded-none"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

          </div>
        )}

      </main>

      {/* Create / Edit Drawer */}
      <ListFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingList(null);
        }}
        list={editingList}
        onSuccess={fetchLists}
      />

      {/* Delete Confirmation Alert */}
      {deletingList && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={() => setDeletingList(null)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-[#121926] border-2 border-black rounded-none p-5 space-y-3.5 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-sm font-extrabold uppercase text-slate-900 dark:text-white leading-tight">
                Delete List
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Cannot be undone
              </p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{deletingList.title}"</span>? The shows will still stay in your library.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setDeletingList(null)}
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
        onImportComplete={fetchLists}
      />

      <AddRatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onCreated={fetchLists}
      />
    </div>
  );
};

export default Lists;