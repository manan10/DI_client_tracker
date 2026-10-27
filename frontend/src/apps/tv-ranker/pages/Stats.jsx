import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Star, 
  CheckCircle2, 
  Clock, 
  Tv, 
  Flame, 
  Sparkles, 
  Heart, 
  Compass, 
  Award, 
  Layers, 
  ArrowUpRight, 
  ThumbsDown, 
  Film, 
  Zap, 
  Loader2, 
  RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../../shared/hooks/useApi';

import ShowNavbar from '../components/ShowNavbar';
import NotesImportModal from '../components/NotesImportModal';
import ScoreHistoryModal from '../components/ScoreHistoryModal';
import CreateShowRatingModal from '../components/CreateShowRatingModal';

const Stats = () => {
  const { request } = useApi();

  // Primary API Data State
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRegionFilter, setActiveRegionFilter] = useState('ALL');

  // Modal Controllers
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeItemForEdit, setActiveItemForEdit] = useState(null);

  // Fetch Live Ratings from user vault[cite: 1]
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

  // Regional & Category Taxonomy Categorizer[cite: 1]
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

  // Telemetry Aggregation Engine
  const analytics = useMemo(() => {
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

    // Tier Deciles
    const godTier = ratedShows.filter((r) => r.rating >= 9.0).length;
    const acclaimed = ratedShows.filter((r) => r.rating >= 8.5 && r.rating < 9.0).length;
    const banger = ratedShows.filter((r) => r.rating >= 8.0 && r.rating < 8.5).length;
    const midTier = ratedShows.filter((r) => r.rating >= 7.0 && r.rating < 8.0).length;
    const flopTier = ratedShows.filter((r) => r.rating < 7.0).length;

    // Bell Curve Histogram Bins
    const deciles = [
      { label: '9.0 - 10', count: ratedShows.filter((r) => r.rating >= 9.0).length, color: 'bg-gradient-to-t from-amber-600 to-yellow-400', glow: 'shadow-amber-500/20' },
      { label: '8.0 - 8.9', count: ratedShows.filter((r) => r.rating >= 8.0 && r.rating < 9.0).length, color: 'bg-gradient-to-t from-rose-600 to-pink-500', glow: 'shadow-rose-500/20' },
      { label: '7.0 - 7.9', count: ratedShows.filter((r) => r.rating >= 7.0 && r.rating < 8.0).length, color: 'bg-gradient-to-t from-cyan-600 to-[#40bcf4]', glow: 'shadow-cyan-500/20' },
      { label: '6.0 - 6.9', count: ratedShows.filter((r) => r.rating >= 6.0 && r.rating < 7.0).length, color: 'bg-gradient-to-t from-emerald-600 to-teal-400', glow: 'shadow-emerald-500/20' },
      { label: '< 6.0', count: ratedShows.filter((r) => r.rating < 6.0).length, color: 'bg-gradient-to-t from-slate-600 to-slate-400', glow: 'shadow-slate-500/20' },
    ];
    const maxDecileCount = Math.max(...deciles.map((d) => d.count), 1);

    // Watch Time Metric Calculations
    const totalSeasons = filtered.reduce((a, b) => a + (b.seasonsWatched || 0), 0);
    const estimatedHours = totalSeasons * 8; 
    const bingeDays = (estimatedHours / 24).toFixed(1);

    // Genre Affinity Breakdown
    const genreMap = {};
    filtered.forEach((item) => {
      (item.show?.genres || []).forEach((g) => {
        if (!genreMap[g]) genreMap[g] = { count: 0, scoreSum: 0, scoredCount: 0 };
        genreMap[g].count += 1;
        if (item.rating > 0) {
          genreMap[g].scoreSum += item.rating;
          genreMap[g].scoredCount += 1;
        }
      });
    });

    const topGenres = Object.entries(genreMap)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avg: data.scoredCount > 0 ? (data.scoreSum / data.scoredCount).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Global Regional Distribution
    const hollywoodCount = ratings.filter((r) => categorizeShow(r) === 'HOLLYWOOD').length;
    const indianCount = ratings.filter((r) => categorizeShow(r) === 'INDIAN').length;
    const animeCount = ratings.filter((r) => categorizeShow(r) === 'ANIME').length;

    // Leaderboards (Top 5 Hall of Fame & Lowest Critiques)
    const sortedScored = [...ratedShows].sort((a, b) => b.rating - a.rating);
    const hallOfFame = sortedScored.slice(0, 5);
    const lowestRated = sortedScored.length > 5 ? [...sortedScored].reverse().slice(0, 4) : [];

    return {
      total,
      completed,
      watching,
      dropped,
      planToWatch,
      favorites,
      avgScore,
      godTier,
      acclaimed,
      banger,
      midTier,
      flopTier,
      deciles,
      maxDecileCount,
      totalSeasons,
      estimatedHours,
      bingeDays,
      topGenres,
      hollywoodCount,
      indianCount,
      animeCount,
      hallOfFame,
      lowestRated,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [ratings, activeRegionFilter, categorizeShow]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070A10] text-slate-900 dark:text-stone-100 font-sans selection:bg-[#40bcf4]/20 selection:text-slate-950 dark:selection:bg-[#40bcf4]/30 dark:selection:text-white transition-colors duration-300 pb-28 lg:pb-16 relative overflow-x-hidden">
      
      {/* Ambient Multi-Stop Glowing Canvas */}
      <div className="absolute top-0 inset-x-0 h-[480px] bg-gradient-to-b from-[#40bcf4]/10 via-rose-500/5 to-transparent pointer-events-none dark:from-[#40bcf4]/10 dark:via-purple-900/10 dark:to-transparent" />
      <div className="absolute top-40 -left-48 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-60 -right-48 w-96 h-96 bg-rose-500/10 dark:bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navigation */}
      <ShowNavbar
        onOpenImport={() => setIsImportOpen(true)}
        onOpenAddShow={() => setIsCreateOpen(true)}
      />

      <main className="relative z-10 w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 pt-3 sm:pt-6 flex flex-col gap-6">

        {/* ========================================================= */}
        {/* 1. HERO COMMAND DECK WITH AMBIENT HORIZON GLAZE           */}
        {/* ========================================================= */}
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-[#101726] to-[#180F24] border-2 border-slate-700/60 dark:border-white/10 p-5 sm:p-8 shadow-2xl text-white">
          <div className="absolute -top-10 right-0 w-[500px] h-[300px] bg-gradient-to-l from-[#40bcf4]/20 via-rose-500/10 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#40bcf4]/50 to-transparent" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase shadow-inner">
                <Zap size={13} className="text-amber-400 animate-pulse" />
                <span>Auditorium Intelligence Engine</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[1000] tracking-tight uppercase leading-none">
                Screening <span className="bg-gradient-to-r from-[#40bcf4] via-rose-400 to-amber-300 bg-clip-text text-transparent">Analytics</span>
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Objective scoring telemetry derived directly from your personal database vault. Live score curves, fatigue indices, and regional ratios.
              </p>
            </div>

            {/* Filter Toggle Console & Live Refresher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-black/50 backdrop-blur-md rounded-lg border border-white/15 shadow-inner">
                {[
                  { id: 'ALL', label: 'All Catalog', icon: Film },
                  { id: 'HOLLYWOOD', label: 'Hollywood', icon: Tv },
                  { id: 'INDIAN', label: 'Indian', icon: Flame },
                  { id: 'ANIME', label: 'Anime', icon: Sparkles }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveRegionFilter(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeRegionFilter === item.id
                        ? 'bg-gradient-to-r from-[#40bcf4] to-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <item.icon size={13} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={fetchRatings}
                disabled={isLoading}
                title="Reload Vault Data"
                className="p-2.5 rounded-lg bg-white/10 border border-white/15 text-slate-300 hover:text-white hover:bg-white/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin text-[#40bcf4]' : ''} />
              </button>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. LOADING STATE OR METRIC CONTENT STRIP                  */}
        {/* ========================================================= */}
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4 bg-white dark:bg-[#0D121D] rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xl">
            <Loader2 size={36} className="text-[#40bcf4] animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 font-mono">
              Synthesizing Live Vault Statistics...
            </span>
          </div>
        ) : (
          <>
            {/* KPI METRIC TILES */}
            <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
              {[
                { 
                  label: 'Vault Catalog', 
                  val: analytics.total, 
                  sub: 'Logged Shows', 
                  icon: Tv, 
                  border: 'border-cyan-500/40',
                  text: 'text-cyan-600 dark:text-cyan-400',
                  bgLight: 'bg-cyan-500/10' 
                },
                { 
                  label: 'Average Score', 
                  val: analytics.avgScore, 
                  sub: '/ 10.0 Benchmark', 
                  icon: Star, 
                  border: 'border-amber-500/40',
                  text: 'text-amber-500',
                  bgLight: 'bg-amber-500/10'
                },
                { 
                  label: 'Masterpieces', 
                  val: analytics.godTier, 
                  sub: '9.0+ Elite Tier', 
                  icon: Flame, 
                  border: 'border-rose-500/40',
                  text: 'text-rose-500',
                  bgLight: 'bg-rose-500/10'
                },
                { 
                  label: 'Completed Runs', 
                  val: analytics.completed, 
                  sub: `${analytics.completionRate}% Finished`, 
                  icon: CheckCircle2, 
                  border: 'border-emerald-500/40',
                  text: 'text-emerald-500',
                  bgLight: 'bg-emerald-500/10'
                },
                { 
                  label: 'Seasons Logged', 
                  val: analytics.totalSeasons, 
                  sub: 'Total Cycles', 
                  icon: Layers, 
                  border: 'border-purple-500/40',
                  text: 'text-purple-500 dark:text-purple-400',
                  bgLight: 'bg-purple-500/10'
                },
                { 
                  label: 'Screen Hours', 
                  val: `~${analytics.estimatedHours}h`, 
                  sub: `${analytics.bingeDays} Days Spent`, 
                  icon: Clock, 
                  border: 'border-orange-500/40',
                  text: 'text-orange-500',
                  bgLight: 'bg-orange-500/10'
                }
              ].map((card, i) => (
                <div 
                  key={i}
                  className={`p-4 rounded-lg bg-white dark:bg-[#0D121D] border-2 ${card.border} shadow-[0_6px_20px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.5)] flex flex-col justify-between gap-3 relative overflow-hidden group hover:-translate-y-1 transition-all duration-200`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {card.label}
                    </span>
                    <div className={`p-1.5 rounded-md ${card.bgLight} ${card.text}`}>
                      <card.icon size={15} strokeWidth={2.5} />
                    </div>
                  </div>

                  <div>
                    <span className={`text-3xl font-[1000] font-mono tracking-tight leading-none ${card.text}`}>
                      {card.val}
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                      {card.sub}
                    </p>
                  </div>
                </div>
              ))}
            </section>

            {/* ========================================================= */}
            {/* 3. VISUAL DISTRIBUTION GAUGE & RATING BELL CURVE          */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
              
              {/* Rating Decile Curve (Histogram) */}
              <div className="lg:col-span-7 p-5 sm:p-6 rounded-xl bg-white dark:bg-[#0D121D] border-2 border-slate-200/90 dark:border-white/10 shadow-xl flex flex-col justify-between gap-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={17} className="text-[#40bcf4]" strokeWidth={2.5} />
                    <h3 className="text-xs font-serif font-bold uppercase tracking-[0.14em] text-slate-900 dark:text-white">
                      Score Distribution Spectrum
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    {analytics.total} Titles Counted
                  </span>
                </div>

                {/* Histogram Bars */}
                <div className="h-44 w-full flex items-end justify-between gap-3 sm:gap-6 px-2 pt-6">
                  {analytics.deciles.map((dec, i) => {
                    const heightPct = Math.round((dec.count / analytics.maxDecileCount) * 100);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform">
                          {dec.count}
                        </span>
                        <div className="w-full max-w-[56px] bg-slate-100 dark:bg-white/5 rounded-t-md p-0.5 flex flex-col justify-end h-full">
                          <div 
                            style={{ height: `${heightPct}%` }}
                            className={`w-full ${dec.color} rounded-t-sm shadow-lg ${dec.glow} transition-all duration-500`}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {dec.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Proportion Bar Breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Tier Balance</span>
                    <span className="text-amber-500">
                      {analytics.godTier} God Tier ({analytics.total > 0 ? Math.round((analytics.godTier / analytics.total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-white/5 rounded-sm overflow-hidden flex gap-0.5">
                    <div style={{ width: `${analytics.total > 0 ? (analytics.godTier / analytics.total) * 100 : 0}%` }} className="bg-amber-400" title="God Tier" />
                    <div style={{ width: `${analytics.total > 0 ? (analytics.acclaimed / analytics.total) * 100 : 0}%` }} className="bg-rose-500" title="Acclaimed" />
                    <div style={{ width: `${analytics.total > 0 ? (analytics.banger / analytics.total) * 100 : 0}%` }} className="bg-[#40bcf4]" title="Bangers" />
                    <div style={{ width: `${analytics.total > 0 ? (analytics.midTier / analytics.total) * 100 : 0}%` }} className="bg-emerald-500" title="Good" />
                    <div style={{ width: `${analytics.total > 0 ? (analytics.flopTier / analytics.total) * 100 : 0}%` }} className="bg-slate-500" title="Flops" />
                  </div>
                </div>
              </div>

              {/* Regional Origins & Status Breakdown */}
              <div className="lg:col-span-5 p-5 sm:p-6 rounded-xl bg-white dark:bg-[#0D121D] border-2 border-slate-200/90 dark:border-white/10 shadow-xl flex flex-col justify-between gap-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Compass size={17} className="text-rose-500" strokeWidth={2.5} />
                    <h3 className="text-xs font-serif font-bold uppercase tracking-[0.14em] text-slate-900 dark:text-white">
                      Regional Origins & Status
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Active Catalog
                  </span>
                </div>

                {/* Regional Share Bars */}
                <div className="space-y-3.5">
                  {[
                    { label: 'Hollywood / Western TV', count: analytics.hollywoodCount, color: 'bg-cyan-500', text: 'text-cyan-500' },
                    { label: 'Indian Originals & Series', count: analytics.indianCount, color: 'bg-amber-500', text: 'text-amber-500' },
                    { label: 'Anime & Japanese Animation', count: analytics.animeCount, color: 'bg-rose-500', text: 'text-rose-500' }
                  ].map((item, idx) => {
                    const pct = ratings.length > 0 ? Math.round((item.count / ratings.length) * 100) : 0;
                    return (
                      <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            {item.label}
                          </span>
                          <span className={`font-mono font-black ${item.text}`}>
                            {item.count} <span className="text-[10px] font-normal text-slate-400">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-sm overflow-hidden">
                          <div style={{ width: `${pct}%` }} className={`h-full ${item.color} rounded-sm`} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Status Counter Deck */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                  <div className="text-center p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Finished</span>
                    <span className="text-base font-mono font-black text-emerald-600 dark:text-emerald-400">{analytics.completed}</span>
                  </div>
                  <div className="text-center p-2 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                    <span className="text-[9px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block">Watching</span>
                    <span className="text-base font-mono font-black text-cyan-600 dark:text-cyan-400">{analytics.watching}</span>
                  </div>
                  <div className="text-center p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">Queued</span>
                    <span className="text-base font-mono font-black text-amber-600 dark:text-amber-400">{analytics.planToWatch}</span>
                  </div>
                  <div className="text-center p-2 rounded-md bg-rose-500/10 border border-rose-500/20">
                    <span className="text-[9px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 block">Dropped</span>
                    <span className="text-base font-mono font-black text-rose-600 dark:text-rose-400">{analytics.dropped}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* ========================================================= */}
            {/* 4. GENRE POWER RANKINGS & HALL OF FAME                    */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
              
              {/* Top Genre Affinity */}
              <div className="lg:col-span-5 p-5 sm:p-6 rounded-xl bg-white dark:bg-[#0D121D] border-2 border-slate-200/90 dark:border-white/10 shadow-xl flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={17} className="text-amber-400" strokeWidth={2.5} />
                    <h3 className="text-xs font-serif font-bold uppercase tracking-[0.14em] text-slate-900 dark:text-white">
                      Genre Concentration & Scores
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Volume Rank
                  </span>
                </div>

                <div className="space-y-3">
                  {analytics.topGenres.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center font-mono">
                      No genre metadata found in active catalog.
                    </p>
                  ) : (
                    analytics.topGenres.map((g, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 hover:border-[#40bcf4]/50 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono font-bold text-slate-400 w-4">
                            0{idx + 1}
                          </span>
                          <span className="text-xs font-serif font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            {g.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                            {g.count} Series
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-black bg-[#40bcf4]/15 text-[#40bcf4] border border-[#40bcf4]/30">
                            {g.avg}★
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5 flex justify-between">
                  <span>Dynamic Evaluation</span>
                  <span className="font-mono text-cyan-400">
                    {analytics.topGenres[0]?.name ? `${analytics.topGenres[0].name} Dominant` : 'Awaiting Shows'}
                  </span>
                </div>
              </div>

              {/* Hall of Fame vs Harsh Critiques */}
              <div className="lg:col-span-7 p-5 sm:p-6 rounded-xl bg-white dark:bg-[#0D121D] border-2 border-slate-200/90 dark:border-white/10 shadow-xl flex flex-col justify-between gap-5">
                
                {/* Top Rated Masterpieces */}
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Award size={17} className="text-amber-400" strokeWidth={2.5} />
                      <h3 className="text-xs font-serif font-bold uppercase tracking-[0.14em] text-slate-900 dark:text-white">
                        Vault Hall of Fame (Top 5)
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">
                      Highest Scored
                    </span>
                  </div>

                  <div className="space-y-2">
                    {analytics.hallOfFame.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center font-mono">
                        No scored shows in your archive yet.
                      </p>
                    ) : (
                      analytics.hallOfFame.map((item, idx) => (
                        <div 
                          key={item._id}
                          onClick={() => setActiveItemForEdit(item)}
                          className="p-2.5 rounded-lg bg-gradient-to-r from-slate-50 to-white dark:from-[#111726] dark:to-[#0A0E17] border border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3 group cursor-pointer hover:border-[#40bcf4] transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-mono font-black text-amber-500 w-4">
                              #{idx + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-white truncate group-hover:text-[#40bcf4] transition-colors">
                                  {item.show?.title}
                                </h4>
                                {item.show?.year && (
                                  <span className="text-[10px] font-mono text-slate-400">
                                    ({item.show?.year})
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                                {categorizeShow(item)} • {item.seasonsWatched || 1} Seasons
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.isFavorite && (
                              <Heart size={14} className="text-rose-500 fill-rose-500" />
                            )}
                            <div className="px-2.5 py-1 rounded-md text-xs font-mono font-black bg-amber-400/20 text-amber-500 dark:text-amber-400 border border-amber-400/50 shadow-sm">
                              {item.rating?.toFixed(1)}
                            </div>
                            <ArrowUpRight size={14} className="text-slate-400 group-hover:text-[#40bcf4] transition-colors" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Lowest Scored Shows */}
                {analytics.lowestRated.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ThumbsDown size={14} className="text-rose-400" />
                        <span className="text-[11px] font-serif font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Tough Crowd (Lowest Scored)
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">Harsh Critiques</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {analytics.lowestRated.map((item) => (
                        <div 
                          key={item._id}
                          onClick={() => setActiveItemForEdit(item)}
                          className="p-2 rounded-md bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center justify-between cursor-pointer hover:border-rose-500/40"
                        >
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                            {item.show?.title}
                          </span>
                          <span className="text-xs font-mono font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                            {item.rating?.toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </>
        )}

      </main>

      {/* Global Modals connected with fetchRatings sync[cite: 1] */}
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