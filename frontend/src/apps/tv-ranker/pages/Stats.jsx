import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../../shared/hooks/useApi';

import ShowNavbar from '../components/ShowNavbar';
import NotesImportModal from '../components/NotesImportModal';
import ScoreHistoryModal from '../components/ScoreHistoryModal';
import CreateShowRatingModal from '../components/CreateShowRatingModal';

import StatsHeroDeck from '../components/Stats/StatsHeroDeck';
import StatsKpiStrip from '../components/Stats/StatsKpiStrip';
import StatsDecileDistribution from '../components/Stats/StatsDecileDistribution';
import StatsGenreAffinity from '../components/Stats/StatsGenreAffinity';
import StatsHallOfFame from '../components/Stats/StatsHallOfFame';
import StatsAnalyticsRow from '../components/Stats/StatsAnalyticsRow';

const Stats = () => {
  const { request } = useApi();

  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRegionFilter, setActiveRegionFilter] = useState('ALL');

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
      console.error('Failed to load stats telemetry:', err);
      toast.error('Failed to load vault statistics');
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const categorizeShow = useCallback((item) => {
    const genres = (item?.show?.genres || []).map((g) => String(g).toLowerCase());
    const type = String(item?.show?.type || '').toUpperCase();
    const title = String(item?.show?.title || '').toLowerCase();

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
      item?.region === 'INDIAN'
    ) {
      return 'INDIAN';
    }

    return 'HOLLYWOOD';
  }, []);

  const analytics = useMemo(() => {
    const totalAllCatalog = ratings.length;

    // Filtered pool based on tab selection
    const filtered = ratings.filter((r) => {
      if (activeRegionFilter === 'ALL') return true;
      return categorizeShow(r) === activeRegionFilter;
    });

    const total = filtered.length;
    const completed = filtered.filter((r) => r.status === 'COMPLETED').length;
    const watching = filtered.filter((r) => r.status === 'WATCHING').length;
    const dropped = filtered.filter((r) => r.status === 'DROPPED').length;
    const planToWatch = filtered.filter((r) => r.status === 'PLAN_TO_WATCH').length;
    const favorites = filtered.filter((r) => r.isFavorite).length;

    const ratedShows = filtered.filter((r) => typeof r.rating === 'number' && r.rating > 0);
    const avgScore = ratedShows.length > 0 
      ? (ratedShows.reduce((a, b) => a + (b.rating || 0), 0) / ratedShows.length).toFixed(2)
      : '0.00';

    // Tiers
    const godTier = ratedShows.filter((r) => r.rating >= 9.0).length;
    const acclaimed = ratedShows.filter((r) => r.rating >= 8.5 && r.rating < 9.0).length;
    const banger = ratedShows.filter((r) => r.rating >= 8.0 && r.rating < 8.5).length;
    const midTier = ratedShows.filter((r) => r.rating >= 7.0 && r.rating < 8.0).length;
    const flopTier = ratedShows.filter((r) => r.rating < 7.0).length;

    const godTierRate = ratedShows.length > 0 ? ((godTier / ratedShows.length) * 100).toFixed(1) : '0.0';
    const favoritesRate = total > 0 ? ((favorites / total) * 100).toFixed(1) : '0.0';
    const dropRate = total > 0 ? ((dropped / total) * 100).toFixed(1) : '0.0';

    // Decile Histogram
    const deciles = [
      { label: '9.0 - 10', count: ratedShows.filter((r) => r.rating >= 9.0).length },
      { label: '8.0 - 8.9', count: ratedShows.filter((r) => r.rating >= 8.0 && r.rating < 9.0).length },
      { label: '7.0 - 7.9', count: ratedShows.filter((r) => r.rating >= 7.0 && r.rating < 8.0).length },
      { label: '6.0 - 6.9', count: ratedShows.filter((r) => r.rating >= 6.0 && r.rating < 7.0).length },
      { label: '< 6.0', count: ratedShows.filter((r) => r.rating < 6.0).length }
    ];
    const maxDecileCount = Math.max(...deciles.map((d) => d.count), 1);

    // =========================================================================
    // 1. SIMPLE TYPE COMPARISON
    // =========================================================================
    const typeScorecard = ['HOLLYWOOD', 'INDIAN', 'ANIME'].map((typeKey) => {
      const typeShows = ratings.filter((r) => categorizeShow(r) === typeKey);
      const scoredTypeShows = typeShows.filter((r) => typeof r.rating === 'number' && r.rating > 0);
      const typeAvg = scoredTypeShows.length > 0
        ? (scoredTypeShows.reduce((a, b) => a + b.rating, 0) / scoredTypeShows.length).toFixed(1)
        : '0.0';
      const typeGod = scoredTypeShows.filter((r) => r.rating >= 9.0).length;
      const typeFavs = typeShows.filter((r) => r.isFavorite).length;

      const metaMap = {
        HOLLYWOOD: { label: 'Hollywood', dot: 'bg-cyan-400', color: 'text-[#40bcf4]' },
        INDIAN: { label: 'Indian', dot: 'bg-amber-400', color: 'text-amber-400' },
        ANIME: { label: 'Anime', dot: 'bg-rose-400', color: 'text-rose-400' }
      };

      return {
        label: metaMap[typeKey].label,
        dot: metaMap[typeKey].dot,
        color: metaMap[typeKey].color,
        count: typeShows.length,
        avgScore: typeAvg,
        godCount: typeGod,
        favCount: typeFavs
      };
    });

    // =========================================================================
    // 2. GENRE HEART RATE (Which genres get the most favorites)
    // =========================================================================
    const genreMap = {};
    filtered.forEach((item) => {
      (item.show?.genres || []).forEach((g) => {
        if (!genreMap[g]) genreMap[g] = { count: 0, scoreSum: 0, scoredCount: 0, favCount: 0 };
        genreMap[g].count += 1;
        if (item.rating > 0) {
          genreMap[g].scoreSum += item.rating;
          genreMap[g].scoredCount += 1;
        }
        if (item.isFavorite) {
          genreMap[g].favCount += 1;
        }
      });
    });

    const topGenres = Object.entries(genreMap)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avg: data.scoredCount > 0 ? (data.scoreSum / data.scoredCount).toFixed(1) : '0.0',
        numericAvg: data.scoredCount > 0 ? data.scoreSum / data.scoredCount : 0,
        favCount: data.favCount,
        favRate: data.count > 0 ? Math.round((data.favCount / data.count) * 100) : 0,
        scoredCount: data.scoredCount
      }))
      .sort((a, b) => b.count - a.count);

    // Highest Hearted Genres with minimum 2 entries
    const genreAffinity = [...topGenres]
      .filter((g) => g.count >= 2)
      .sort((a, b) => b.favRate - a.favRate)
      .slice(0, 4);

    const signatureCandidate = [...topGenres]
      .filter((g) => g.scoredCount >= 2)
      .sort((a, b) => b.numericAvg - a.numericAvg)[0];

    const topGenreName = signatureCandidate?.name || topGenres[0]?.name || 'None';
    const topGenreAvg = signatureCandidate?.avg || topGenres[0]?.avg || null;

    // =========================================================================
    // 3. MONTHLY TIMELINE LOGS (Recent 6 Months)
    // =========================================================================
    const monthBuckets = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short' });
      monthBuckets[key] = 0;
    }

    filtered.forEach((item) => {
      const dateStr = item.updatedAt || item.createdAt;
      if (dateStr) {
        const d = new Date(dateStr);
        const key = d.toLocaleString('default', { month: 'short' });
        if (monthBuckets[key] !== undefined) {
          monthBuckets[key] += 1;
        }
      }
    });

    const timelineActivity = Object.entries(monthBuckets).map(([label, count]) => ({
      label,
      count
    }));

    // =========================================================================
    // 4. RATING BIAS (Is rater generous or strict)
    // =========================================================================
    const sortedScores = ratedShows.map((r) => r.rating).sort((a, b) => a - b);
    let median = '0.0';
    if (sortedScores.length > 0) {
      const mid = Math.floor(sortedScores.length / 2);
      median = sortedScores.length % 2 !== 0 
        ? sortedScores[mid].toFixed(1) 
        : ((sortedScores[mid - 1] + sortedScores[mid]) / 2).toFixed(1);
    }

    const subEightCount = ratedShows.filter((r) => r.rating < 8.0).length;
    const subEightRate = ratedShows.length > 0 ? Math.round((subEightCount / ratedShows.length) * 100) : 0;

    let ratingStyle = 'Fair & Balanced';
    if (subEightRate >= 35) ratingStyle = 'Tough Critic';
    else if (subEightRate <= 10) ratingStyle = 'Generous Rater';

    const scoringPersonality = {
      median,
      avg: avgScore,
      subEightCount,
      subEightRate,
      ratingStyle
    };

    // Global Regional Totals across full catalog
    const hollywoodCount = ratings.filter((r) => categorizeShow(r) === 'HOLLYWOOD').length;
    const indianCount = ratings.filter((r) => categorizeShow(r) === 'INDIAN').length;
    const animeCount = ratings.filter((r) => categorizeShow(r) === 'ANIME').length;

    const sortedScored = [...ratedShows].sort((a, b) => b.rating - a.rating);
    const hallOfFame = sortedScored.slice(0, 5);
    const lowestRated = sortedScored.length > 5 ? [...sortedScored].reverse().slice(0, 4) : [];

    return {
      total,
      totalAllCatalog,
      completed,
      watching,
      dropped,
      planToWatch,
      favorites,
      avgScore,
      godTier,
      godTierRate,
      favoritesRate,
      dropRate,
      topGenreName,
      topGenreAvg,
      acclaimed,
      banger,
      midTier,
      flopTier,
      deciles,
      maxDecileCount,
      typeScorecard,
      genreAffinity,
      timelineActivity,
      scoringPersonality,
      topGenres: topGenres.slice(0, 6),
      hollywoodCount,
      indianCount,
      animeCount,
      hallOfFame,
      lowestRated
    };
  }, [ratings, activeRegionFilter, categorizeShow]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070A10] text-slate-900 dark:text-stone-100 font-sans selection:bg-[#40bcf4]/20 selection:text-slate-950 dark:selection:bg-[#40bcf4]/30 dark:selection:text-white transition-colors duration-300 pb-28 lg:pb-16 relative overflow-x-hidden">
      
      {/* Precision Ambient Atmosphere */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#40bcf4]/10 dark:from-[#40bcf4]/5 via-transparent to-transparent pointer-events-none" />

      <ShowNavbar
        onOpenImport={() => setIsImportOpen(true)}
        onOpenAddShow={() => setIsCreateOpen(true)}
      />

      <main className="relative z-10 w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 2xl:px-12 pt-3 sm:pt-6 flex flex-col gap-6">
        
        {/* 1. Seamless Hero Deck */}
        <StatsHeroDeck
          activeRegionFilter={activeRegionFilter}
          onSelectRegionFilter={setActiveRegionFilter}
          analytics={analytics}
        />

        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4 bg-white dark:bg-[#161B22] rounded-lg border border-slate-200 dark:border-[#262E3B] shadow-sm">
            <Loader2 size={36} className="text-[#40bcf4] animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 font-mono">
              Loading Report Card Telemetry...
            </span>
          </div>
        ) : (
          <>
            {/* 2. Responsive 8-Card KPI Strip */}
            <StatsKpiStrip analytics={analytics} />

            {/* 3. Single Unified Row: Score Spread, Top Genres, and Hall of Fame */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-4 sm:gap-5 w-full">
              {/* Score Spread Histogram (Column 1) */}
              <div className="xl:col-span-4 h-full flex flex-col">
                <StatsDecileDistribution analytics={analytics} />
              </div>

              {/* Genre Concentration (Column 2) */}
              <div className="xl:col-span-4 h-full flex flex-col">
                <StatsGenreAffinity topGenres={analytics.topGenres} />
              </div>

              {/* Hall of Fame & Lowest Rated (Column 3) */}
              <div className="lg:col-span-2 xl:col-span-4 h-full flex flex-col">
                <StatsHallOfFame 
                  hallOfFame={analytics.hallOfFame}
                  lowestRated={analytics.lowestRated}
                  categorizeShow={categorizeShow}
                  onSelectItemForEdit={setActiveItemForEdit}
                />
              </div>
            </div>

            {/* 4. Secondary 4-Card Analytics Strip (Plain English & Simple) */}
            <StatsAnalyticsRow analytics={analytics} />
          </>
        )}
      </main>

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

export default Stats;