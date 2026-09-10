import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useApi } from '../../../shared/hooks/useApi';

import ShowNavbar from '../components/ShowNavbar';
import NotesImportModal from '../components/NotesImportModal';
import ScoreHistoryModal from '../components/ScoreHistoryModal';
import CreateShowRatingModal from '../components/CreateShowRatingModal';

import HomeHeroBanner from '../components/Home/HomeHeroBanner';
import HomeCategoryPills from '../components/Home/HomeCategoryPills';
import HomeControlBar from '../components/Home/HomeControlBar';
import HomeShowCatalog from '../components/Home/HomeShowCatalog';

const ShowRaterHome = () => {
  const { request } = useApi();

  // Primary Data
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Category Segregation: 'ALL' | 'INDIAN' | 'HOLLYWOOD' | 'ANIME'
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Tier Filter: 'ALL' | 'GOD_TIER' | 'ACCLAIMED' | 'FAVORITES' | 'WATCHLIST'
  const [tierFilter, setTierFilter] = useState('ALL');

  // Layout View Switcher: 'CARDS' | 'LIST' | 'TABLE'
  const [layoutView, setLayoutView] = useState('CARDS');

  // Sorting
  const [sortBy, setSortBy] = useState('RATING_DESC');

  // Modals
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeItemForEdit, setActiveItemForEdit] = useState(null);

  const fetchRatings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await request('/shows/ratings/my?sort=-rating');
      if (res?.success) {
        setRatings(res.data || []);
      } else {
        setRatings([]);
      }
    } catch (err) {
      console.error('Failed to load shows:', err);
      toast.error('Failed to load ratings vault');
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const handleToggleFavorite = async (e, ratingId) => {
    e.stopPropagation();
    try {
      const res = await request(`/shows/ratings/${ratingId}/favorite`, 'PATCH');
      if (res?.success) {
        setRatings((prev) =>
          prev.map((item) =>
            item._id === ratingId ? { ...item, isFavorite: res.isFavorite } : item
          )
        );
      }
    } catch (err) {
      toast.error('Could not toggle favorite');
    }
  };

  const categorizeShow = (item) => {
    const genres = (item.show?.genres || []).map(g => g.toLowerCase());
    const type = String(item.show?.type || '').toUpperCase();
    const title = String(item.show?.title || '').toLowerCase();

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
      item.region === 'INDIAN'
    ) {
      return 'INDIAN';
    }

    return 'HOLLYWOOD';
  };

  const filteredShows = useMemo(() => {
    return ratings
      .filter((item) => {
        const title = item.show?.title?.toLowerCase() || '';
        const genres = item.show?.genres?.map(g => g.toLowerCase()) || [];
        const query = searchQuery.toLowerCase().trim();

        const matchesSearch = title.includes(query) || genres.some(g => g.includes(query));
        if (!matchesSearch) return false;

        const showCategory = categorizeShow(item);
        if (activeCategory !== 'ALL' && showCategory !== activeCategory) {
          return false;
        }

        if (tierFilter === 'FAVORITES') return item.isFavorite;
        if (tierFilter === 'WATCHLIST') return item.status === 'PLAN_TO_WATCH';
        if (tierFilter === 'GOD_TIER') return item.rating >= 9.0;
        if (tierFilter === 'ACCLAIMED') return item.rating >= 8.5 && item.rating < 9.0;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'RATING_DESC') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'RATING_ASC') return (a.rating || 0) - (b.rating || 0);
        if (sortBy === 'TITLE') return (a.show?.title || '').localeCompare(b.show?.title || '');
        if (sortBy === 'RECENT') return new Date(b.updatedAt) - new Date(a.updatedAt);
        return 0;
      });
  }, [ratings, searchQuery, activeCategory, tierFilter, sortBy]);

  const stats = useMemo(() => {
    const total = ratings.length;
    const completed = ratings.filter((r) => r.status === 'COMPLETED').length;
    const godTierCount = ratings.filter((r) => r.rating >= 9.0).length;
    const ratedList = ratings.filter((r) => r.rating > 0);
    const avgScore = ratedList.length > 0 
      ? (ratedList.reduce((acc, curr) => acc + curr.rating, 0) / ratedList.length).toFixed(1)
      : '0.0';

    const indianCount = ratings.filter(r => categorizeShow(r) === 'INDIAN').length;
    const hollywoodCount = ratings.filter(r => categorizeShow(r) === 'HOLLYWOOD').length;
    const animeCount = ratings.filter(r => categorizeShow(r) === 'ANIME').length;

    return { 
      total, 
      completed, 
      godTierCount, 
      avgScore,
      indianCount,
      hollywoodCount,
      animeCount
    };
  }, [ratings]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060A14] text-slate-900 dark:text-slate-100 font-sans selection:bg-rose-500/20 transition-colors duration-300 pb-28 lg:pb-16 relative overflow-x-hidden">
      
      {/* Background Atmosphere */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-rose-500/10 via-amber-500/5 to-transparent pointer-events-none dark:from-rose-500/5 dark:via-transparent" />

      {/* Top Navbar */}
      <ShowNavbar
        onOpenImport={() => setIsImportOpen(true)}
        onOpenAddShow={() => setIsCreateOpen(true)}
      />

      <main className="relative z-10 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-5 sm:pt-7 flex flex-col gap-6">
        
        {/* 1. Hero Telemetry Banner (Kept exactly as requested) */}
        <HomeHeroBanner stats={stats} />

        {/* 2. Responsive Workspace Matrix: Desktop Left Sidebar + Content Canvas */}
        <div className="flex items-start gap-6 w-full">
          
          {/* Desktop Left Sidebar / Mobile Bottom Dock */}
          <HomeCategoryPills
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            stats={stats}
          />

          {/* Right Core Content Area */}
          <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
            {/* Discovery & Layout Controls */}
            <HomeControlBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              layoutView={layoutView}
              onLayoutChange={setLayoutView}
              sortBy={sortBy}
              onSortChange={setSortBy}
              tierFilter={tierFilter}
              onTierChange={setTierFilter}
              totalVisible={filteredShows.length}
            />

            {/* Catalog (Cards, List, or Ledger) */}
            <HomeShowCatalog
              filteredShows={filteredShows}
              layoutView={layoutView}
              isLoading={isLoading}
              categorizeShow={categorizeShow}
              onSelectItem={setActiveItemForEdit}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>

        </div>

      </main>

      {/* Modals */}
      <NotesImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={fetchRatings}
      />

      <CreateShowRatingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={fetchRatings}
      />

      <ScoreHistoryModal
        item={activeItemForEdit}
        isOpen={Boolean(activeItemForEdit)}
        onClose={() => setActiveItemForEdit(null)}
        onUpdated={fetchRatings}
      />
    </div>
  );
};

export default ShowRaterHome;