import React, { useState, useEffect } from 'react';
import { 
  X, Check, Loader2, Heart, Minus, Plus, 
  History, Clock, Film,
  CheckCircle2, PlayCircle, PauseCircle, XCircle
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
    active: 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/50 shadow-[0_2px_0_0_rgba(236,72,153,0.3)]' 
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

const ScoreHistoryModal = ({ item, isOpen, onClose, onUpdated }) => {
  const { request, loading } = useApi();

  const [rating, setRating] = useState(8.5);
  const [reason, setReason] = useState('');
  const [review, setReview] = useState('');
  const [status, setStatus] = useState('COMPLETED');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (item) {
      setRating(item.rating ?? 8.5);
      setReview(item.review || '');
      setStatus(item.status || 'COMPLETED');
      setIsFavorite(Boolean(item.isFavorite));
      setReason('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const show = item.show || {};
  const history = item.ratingHistory || [];
  const posterImage = show.posterUrl || show.bannerUrl || show.backdropUrl;

  const adjustScore = (delta) => {
    setRating((prev) => Math.min(10, Math.max(0, parseFloat((prev + delta).toFixed(1)))));
  };

  const getTierDetails = (val) => {
    if (val >= 9.0) {
      return { 
        label: 'Masterpiece', 
        badge: 'text-pink-600 dark:text-pink-400 bg-pink-500/15 border-pink-500/40 shadow-[0_2px_0_0_rgba(236,72,153,0.3)]' 
      };
    }
    if (val >= 8.0) {
      return { 
        label: 'Very Good', 
        badge: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/40 shadow-[0_2px_0_0_rgba(16,185,129,0.3)]' 
      };
    }
    if (val >= 6.5) {
      return { 
        label: 'Good', 
        badge: 'text-amber-700 dark:text-amber-400 bg-amber-500/15 border-amber-500/40 shadow-[0_2px_0_0_rgba(245,158,11,0.3)]' 
      };
    }
    return { 
      label: 'Average', 
      badge: 'text-slate-600 dark:text-stone-300 bg-slate-200 dark:bg-[#12171F] border-slate-300 dark:border-[#2C3545] shadow-[0_2px_0_0_rgba(0,0,0,0.15)]' 
    };
  };

  const tier = getTierDetails(rating);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const showId = show._id || item.show;
    if (!showId) {
      toast.error('Could not find show details');
      return;
    }

    try {
      const res = await request(`/shows/${showId}/rating`, 'POST', {
        rating: parseFloat(rating) || 0,
        status: status || 'COMPLETED',
        review: review.trim(),
        isFavorite: Boolean(isFavorite),
        reason: reason.trim() || undefined
      });

      if (res?.success || res?.data || res?._id) {
        toast.success('Score updated', {
          description: `${show.title || 'Show'} is now set to ${parseFloat(rating).toFixed(1)}/10`
        });
        if (typeof onUpdated === 'function') onUpdated();
        if (typeof onClose === 'function') onClose();
      } else {
        toast.error(res?.message || 'Failed to update score');
      }
    } catch (err) {
      console.error('Update score failure:', err);
      toast.error(err.message || 'Could not save score');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm select-none font-sans"
      style={{ '--font-sans': "'Space Grotesk', sans-serif", '--font-mono': "'Space Mono', monospace", fontFamily: "'Space Grotesk', sans-serif" }}
      onClick={onClose}
    >
      {/* Slide-over Drawer Frame */}
      <div 
        className="w-full sm:w-[500px] md:w-[540px] bg-white dark:bg-[#161B22] border-t-2 sm:border-t-0 sm:border-l-2 border-slate-300 dark:border-[#2C3545] shadow-[0_15px_45px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[92dvh] sm:max-h-screen rounded-t-xs sm:rounded-none text-slate-800 dark:text-stone-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent pointer-events-none z-30" />

{/* ========================================================================= */}
        {/* RE-ARCHITECTED CINEMATIC HERO SECTION                                      */}
        {/* ========================================================================= */}
        <div className="relative w-full bg-gradient-to-r from-[#0d131f] via-[#101726] to-[#0c121e] border-b-2 border-slate-200/90 dark:border-[#262E3B] shrink-0 overflow-hidden select-none">
          
          {/* Ambient Lighting & Horizon Glow */}
          {posterImage && (
            <div 
              className="absolute -top-12 -left-12 w-80 h-80 bg-cover bg-center blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundImage: `url(${posterImage})` }}
            />
          )}
          <div className="absolute top-0 right-0 w-72 h-full bg-gradient-to-l from-pink-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Top Utility Layer: Mobile Handle + Floating Close Button */}
          <div className="relative z-20 flex items-center justify-between px-4 sm:px-5 pt-3 pb-1">
            {/* Mobile Drag Pill */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full sm:hidden mx-auto" />
            
            {/* Close Button cleanly positioned in top-right corner */}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-stone-300 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer shadow-md font-mono"
              title="Close"
            >
              <X size={15} strokeWidth={2.4} />
            </button>
          </div>

          {/* Main Stage Grid */}
          <div className="px-4 sm:px-5 pb-4.5 pt-0.5 flex items-center justify-between gap-4 relative z-20">
            
            {/* 1. Left: Poster with 3D Depth Elevation */}
            <div className="relative shrink-0 group">
              <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xs bg-slate-950 p-1 border border-white/20 shadow-[0_12px_28px_rgba(0,0,0,0.85),0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full rounded-2xs overflow-hidden bg-slate-900 relative">
                  {posterImage ? (
                    <img 
                      src={posterImage} 
                      alt={show.title} 
                      className="w-full h-full object-cover object-top" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <Film size={20} />
                    </div>
                  )}
                  {/* Glass rim shine on image */}
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 2. Middle Content Stack */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                <span className="font-bold uppercase tracking-wider text-pink-400">
                  {show.type?.replace('_', ' ') || 'SERIES'}
                </span>
                <span className="text-stone-400">•</span>
                <span className="font-bold text-stone-300">
                  {show.releaseYear || '—'}
                </span>
                {show.totalSeasons && (
                  <>
                    <span className="text-stone-400">•</span>
                    <span className="font-bold text-stone-300">
                      {show.totalSeasons} Season{show.totalSeasons > 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-base sm:text-xl font-bold text-white tracking-tight leading-tight line-clamp-2 drop-shadow-sm">
                {show.title || 'Untitled Show'}
              </h1>

              {/* Genre Pills */}
              {Array.isArray(show.genres) && show.genres.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {show.genres.slice(0, 3).map((g) => (
                    <span 
                      key={g} 
                      className="px-2 py-0.5 rounded-2xs text-[9px] font-mono font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-stone-300 shadow-2xs"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Right: Tactile 3D Score Badge */}
            <div className="shrink-0 pl-1">
              <div className="flex flex-col items-center justify-center px-3.5 py-2 rounded-xs bg-gradient-to-b from-[#1b2537] to-[#111824] border border-[#2C3545] shadow-[0_8px_20px_rgba(0,0,0,0.6),0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-black/40">
                <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-stone-400 leading-none">
                  SCORE
                </span>
                <div className="flex items-baseline gap-0.5 mt-1">
                  <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-pink-400 leading-none drop-shadow-[0_2px_8px_rgba(236,72,153,0.4)]">
                    {(item.rating ?? 0).toFixed(1)}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-stone-400 leading-none">
                    /10
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-4.5 no-scrollbar flex-1 text-left">
          
          {/* Rating Console */}
          <div className="p-3.5 sm:p-4 rounded-xs bg-white dark:bg-[#12171F] border-2 border-slate-300 dark:border-[#2C3545] shadow-[0_3px_0_0_#CBD5E1] dark:shadow-[0_3px_0_0_#0B0E14] space-y-3 sm:space-y-3.5 relative">
            <div className="flex items-center justify-between border-b border-slate-200/90 dark:border-[#262E3B] pb-2.5 sm:pb-3">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-stone-300 block">
                  New Score
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-stone-400">
                  Choose from 0.0 to 10.0
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-2xs text-[10px] font-mono font-bold uppercase tracking-wider border transition-all ${tier.badge}`}>
                  {tier.label}
                </span>

                <button
                  type="button"
                  onClick={() => setIsFavorite((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-xs font-mono font-bold border transition-all cursor-pointer active:translate-y-[1px] ${
                    isFavorite
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-[0_2px_0_0_rgba(244,63,94,0.3)]'
                      : 'bg-slate-100 dark:bg-[#161B22] border-slate-300 dark:border-[#2C3545] text-slate-600 dark:text-stone-300 hover:text-slate-900 dark:hover:text-white shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0B0E14]'
                  }`}
                  title={isFavorite ? 'Saved as favorite' : 'Add to favorites'}
                >
                  <Heart 
                    size={12} 
                    className={`transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-stone-400'}`} 
                  />
                  <span>Favorite</span>
                </button>
              </div>
            </div>

            {/* Score Display Card + Presets */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xs bg-slate-50 dark:bg-[#0D1117] border border-slate-300 dark:border-[#2C3545] shadow-inner">
              <div className="flex items-baseline justify-between sm:justify-start gap-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-mono leading-none">
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-stone-400">/ 10</span>
                </div>
              </div>

              {/* 6 Quick Preset Buttons */}
              <div className="grid grid-cols-6 gap-1 w-full sm:w-auto">
                {QUICK_SCORES.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    className={`h-8 sm:h-auto px-1 sm:px-2.5 py-1 text-center rounded-2xs text-xs font-mono font-bold border transition-all cursor-pointer active:translate-y-[1px] active:shadow-none ${
                      Math.abs(rating - val) < 0.05
                        ? 'bg-pink-500 text-white border-pink-600 font-bold shadow-[0_2px_0_0_#be185d]'
                        : 'bg-white dark:bg-[#161B22] text-slate-700 dark:text-stone-300 border-slate-300 dark:border-[#2C3545] hover:border-slate-400 dark:hover:border-stone-500 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0B0E14]'
                    }`}
                  >
                    {val === 10 ? '10' : val.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Range Slider + Steppers */}
            <div className="flex items-center gap-2.5 sm:gap-3 pt-1">
              <button
                type="button"
                onClick={() => adjustScore(-0.1)}
                className="w-8 h-8 rounded-xs bg-slate-100 dark:bg-[#161B22] hover:bg-slate-200 dark:hover:bg-[#1E242E] border border-slate-300 dark:border-[#2C3545] flex items-center justify-center text-slate-700 dark:text-stone-300 font-mono transition-all cursor-pointer active:translate-y-[1px] active:shadow-none shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0B0E14] shrink-0"
                title="Subtract 0.1"
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
                className="flex-1 h-2 bg-slate-200 dark:bg-[#0D1117] rounded-xs appearance-none accent-pink-500 cursor-pointer"
              />

              <button
                type="button"
                onClick={() => adjustScore(0.1)}
                className="w-8 h-8 rounded-xs bg-slate-100 dark:bg-[#161B22] hover:bg-slate-200 dark:hover:bg-[#1E242E] border border-slate-300 dark:border-[#2C3545] flex items-center justify-center text-slate-700 dark:text-stone-300 font-mono transition-all cursor-pointer active:translate-y-[1px] active:shadow-none shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0B0E14] shrink-0"
                title="Add 0.1"
              >
                <Plus size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Watch Status Buttons */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-stone-300 block">
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
                    className={`flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xs border-2 text-xs font-mono font-bold transition-all cursor-pointer text-left active:translate-y-[1px] ${
                      isLastOnMobile ? 'col-span-2 sm:col-span-1' : ''
                    } ${
                      isSelected
                        ? opt.active
                        : 'bg-white dark:bg-[#12171F] border-slate-300 dark:border-[#2C3545] text-slate-600 dark:text-stone-300 hover:border-slate-400 dark:hover:border-stone-500 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0B0E14]'
                    }`}
                  >
                    <Icon size={14} className="shrink-0" />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason for Change */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-stone-300 block">
              Why are you changing this score?
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Rewatched season 2, loved the ending, lost interest..."
              className="w-full h-11 px-3.5 rounded-xs bg-white dark:bg-[#12171F] border-2 border-slate-300 dark:border-[#2C3545] text-xs font-mono font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-stone-400 outline-none focus:border-pink-500 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0B0E14] transition-colors"
            />
          </div>

          {/* Review & Thoughts */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-stone-300 block">
              Your Review & Thoughts
            </label>
            <textarea
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your thoughts on the story, characters, acting..."
              className="w-full p-3 rounded-xs bg-white dark:bg-[#12171F] border-2 border-slate-300 dark:border-[#2C3545] text-xs font-mono font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-stone-400 outline-none focus:border-pink-500 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0B0E14] transition-colors resize-none"
            />
          </div>

          {/* Past Score Changes */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-stone-300 flex items-center gap-1.5">
                <Clock size={13} className="text-pink-600 dark:text-pink-400" />
                <span>Past Score Changes ({history.length})</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400 dark:text-stone-400 font-semibold uppercase">
                History
              </span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
              {history.length === 0 ? (
                <div className="p-3 rounded-xs bg-white dark:bg-[#12171F] border-2 border-slate-300 dark:border-[#2C3545] text-center shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0B0E14]">
                  <p className="text-xs font-mono text-slate-400 dark:text-stone-400 italic">No past changes logged yet.</p>
                </div>
              ) : (
                history.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xs bg-white dark:bg-[#12171F] border-2 border-slate-300 dark:border-[#2C3545] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0B0E14] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono font-bold text-pink-600 dark:text-pink-400 text-xs px-2 py-0.5 rounded-2xs bg-pink-500/10 border border-pink-500/30 shrink-0">
                        {entry.score.toFixed(1)}
                      </span>
                      <span className="text-slate-700 dark:text-stone-300 font-semibold truncate text-xs">
                        {entry.reason || 'Score updated'}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 dark:text-stone-400 shrink-0">
                      {new Date(entry.changedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </form>

        {/* Footer Bar */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t-2 border-slate-200/90 dark:border-[#262E3B] bg-slate-50 dark:bg-[#12171F] flex items-center justify-between gap-3 shrink-0 shadow-[0_-2px_6px_rgba(0,0,0,0.03)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.25)] pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xs text-xs font-mono font-bold text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xs bg-pink-500 hover:bg-pink-600 text-white text-xs font-mono font-bold uppercase tracking-wider border border-pink-600 border-b-[3px] border-b-pink-700 active:border-b active:translate-y-[2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_4px_12px_rgba(236,72,153,0.3)]"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={15} strokeWidth={3} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreHistoryModal;