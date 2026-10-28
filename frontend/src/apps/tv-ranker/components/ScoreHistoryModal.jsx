import React, { useState, useEffect } from 'react';
import { 
  X, Check, Loader2, Heart, Star, Minus, Plus, 
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
    active: 'bg-[#40bcf4]/15 text-[#0284c7] dark:text-[#40bcf4] border-[#40bcf4]/50 shadow-[0_2px_0_0_rgba(64,188,244,0.3)]' 
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
  const heroImage = show.bannerUrl || show.backdropUrl || show.posterUrl;

  const adjustScore = (delta) => {
    setRating((prev) => Math.min(10, Math.max(0, parseFloat((prev + delta).toFixed(1)))));
  };

  const getTierDetails = (val) => {
    if (val >= 9.0) {
      return { 
        label: 'Masterpiece', 
        badge: 'text-[#40bcf4] bg-[#40bcf4]/15 border-[#40bcf4]/40 shadow-[0_2px_0_0_rgba(64,188,244,0.3)]' 
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
      badge: 'text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-[#1E2636] border-slate-300 dark:border-[#38455C] shadow-[0_2px_0_0_rgba(0,0,0,0.15)]' 
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
      onClick={onClose}
    >
      {/* Slide-over Drawer Frame */}
      <div 
        className="w-full sm:w-[500px] md:w-[540px] bg-[#E9EEF5] dark:bg-[#1E2636] border-t-2 sm:border-t-0 sm:border-l-2 border-slate-300 dark:border-[#334158] shadow-[0_15px_45px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[92dvh] sm:max-h-screen rounded-t-2xl sm:rounded-none text-slate-800 dark:text-slate-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#40bcf4] to-transparent pointer-events-none z-30" />

        {/* ========================================================================= */}
        {/* HERO SHOW HEADER WITH FULL-BLEED COVER PHOTO                              */}
        {/* ========================================================================= */}
        <div className="relative w-full h-56 sm:h-64 bg-slate-900 shrink-0 overflow-hidden">
          {heroImage ? (
            <img 
              src={heroImage} 
              alt={show.title || 'Show poster'} 
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
              <Film size={48} strokeWidth={1.5} />
              <span className="text-xs font-mono uppercase tracking-widest mt-2">No Photo Available</span>
            </div>
          )}

          {/* Cinematic Multi-stop Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141C28] via-[#141C28]/60 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141C28]/80 via-transparent to-black/30" />

          {/* Mobile Pull Handle Over Picture */}
          <div className="w-full flex sm:hidden items-center justify-center pt-2.5 pb-1 relative z-20">
            <div className="w-12 h-1.5 bg-white/40 backdrop-blur-md rounded-full" />
          </div>

          {/* Top Actions: Category Badge & Close Button */}
          <div className="absolute top-3 sm:top-4 inset-x-4 sm:inset-x-5 flex items-center justify-between z-20">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-md border border-white/15 text-white shadow-lg">
              <History size={12} className="text-[#40bcf4]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-200">
                Score Revision
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/55 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/80 border border-white/20 transition-all cursor-pointer shadow-lg active:scale-95"
              title="Close"
            >
              <X size={17} strokeWidth={2.4} />
            </button>
          </div>

          {/* Bottom Title & Show Metadata Overlay */}
          <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-20 flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#40bcf4] drop-shadow-sm block">
                {show.type?.replace('_', ' ') || 'SERIES'}
              </span>

              <h1 className="text-xl sm:text-2xl font-[1000] text-white tracking-tight leading-tight line-clamp-2 drop-shadow-md">
                {show.title || 'Untitled Show'}
              </h1>

              <div className="flex items-center gap-2 text-[11px] font-mono text-stone-300 mt-1 drop-shadow-sm">
                <span>{show.releaseYear || '—'}</span>
                <span>•</span>
                {show.totalSeasons ? (
                  <span>{show.totalSeasons} Season{show.totalSeasons > 1 ? 's' : ''}</span>
                ) : (
                  <span>Single Run</span>
                )}
                {Array.isArray(show.genres) && show.genres.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-[#40bcf4] font-semibold truncate max-w-[150px] sm:max-w-[200px]">
                      {show.genres.slice(0, 2).join(', ')}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Current Stored Score Chip */}
            <div className="shrink-0 px-2.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-right shadow-xl">
              <span className="text-[9px] font-mono uppercase text-stone-400 block font-semibold leading-none">
                Current
              </span>
              <div className="flex items-baseline gap-0.5 justify-end mt-0.5">
                <span className="text-base sm:text-lg font-black font-mono text-[#40bcf4] leading-none">
                  {(item.rating ?? 0).toFixed(1)}
                </span>
                <span className="text-[9px] font-bold text-stone-400 leading-none">/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-4.5 no-scrollbar flex-1 text-left">
          
          {/* Rating Console */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#141C28] border-2 border-slate-300 dark:border-[#2C384D] shadow-[0_3px_0_0_#CBD5E1] dark:shadow-[0_3px_0_0_#0F1520] space-y-3 sm:space-y-3.5 relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#222E42] pb-2.5 sm:pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  New Score
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400">
                  Choose from 0.0 to 10.0
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border transition-all ${tier.badge}`}>
                  {tier.label}
                </span>

                <button
                  type="button"
                  onClick={() => setIsFavorite((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border transition-all cursor-pointer active:translate-y-[1px] ${
                    isFavorite
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-[0_2px_0_0_rgba(244,63,94,0.3)]'
                      : 'bg-slate-100 dark:bg-[#1E2838] border-slate-300 dark:border-[#38465E] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#101621]'
                  }`}
                  title={isFavorite ? 'Saved as favorite' : 'Add to favorites'}
                >
                  <Heart 
                    size={12} 
                    className={`transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} 
                  />
                  <span>Favorite</span>
                </button>
              </div>
            </div>

            {/* Score Display Card + Presets */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#F5F8FC] dark:bg-[#0F1622] border border-slate-300 dark:border-[#232F42] shadow-inner">
              <div className="flex items-baseline justify-between sm:justify-start gap-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-mono leading-none">
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-slate-400">/ 10</span>
                </div>
              </div>

              {/* 6 Quick Preset Buttons */}
              <div className="grid grid-cols-6 gap-1 w-full sm:w-auto">
                {QUICK_SCORES.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    className={`h-8 sm:h-auto px-1 sm:px-2.5 py-1 text-center rounded text-xs font-mono font-bold border transition-all cursor-pointer active:translate-y-[1px] active:shadow-none ${
                      Math.abs(rating - val) < 0.05
                        ? 'bg-[#40bcf4] text-[#0A1017] border-[#29a8e2] font-black shadow-[0_2px_0_0_#1c86b8]'
                        : 'bg-white dark:bg-[#1F293A] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#34425A] hover:border-slate-400 dark:hover:border-slate-500 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520]'
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
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1E2838] hover:bg-slate-200 dark:hover:bg-[#253246] border border-slate-300 dark:border-[#34425A] flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all cursor-pointer active:translate-y-[1px] active:shadow-none shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] shrink-0"
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
                className="flex-1 h-2 bg-slate-200 dark:bg-[#0E1520] rounded-lg appearance-none accent-[#40bcf4] cursor-pointer"
              />

              <button
                type="button"
                onClick={() => adjustScore(0.1)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1E2838] hover:bg-slate-200 dark:hover:bg-[#253246] border border-slate-300 dark:border-[#34425A] flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all cursor-pointer active:translate-y-[1px] active:shadow-none shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] shrink-0"
                title="Add 0.1"
              >
                <Plus size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Watch Status Buttons */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
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
                    className={`flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-lg border-2 text-xs font-bold transition-all cursor-pointer text-left active:translate-y-[1px] ${
                      isLastOnMobile ? 'col-span-2 sm:col-span-1' : ''
                    } ${
                      isSelected
                        ? opt.active
                        : 'bg-white dark:bg-[#141C28] border-slate-300 dark:border-[#2C384D] text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520]'
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
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Why are you changing this score?
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Rewatched season 2, loved the ending, lost interest..."
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#141C28] border-2 border-slate-300 dark:border-[#2C384D] text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#40bcf4] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] transition-colors"
            />
          </div>

          {/* Review & Thoughts */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Your Review & Thoughts
            </label>
            <textarea
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your thoughts on the story, characters, acting..."
              className="w-full p-3 rounded-xl bg-white dark:bg-[#141C28] border-2 border-slate-300 dark:border-[#2C384D] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#40bcf4] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] transition-colors resize-none"
            />
          </div>

          {/* Past Score Changes */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock size={13} className="text-[#0284c7] dark:text-[#40bcf4]" />
                <span>Past Score Changes ({history.length})</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                History
              </span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
              {history.length === 0 ? (
                <div className="p-3 rounded-xl bg-white dark:bg-[#141C28] border-2 border-slate-300 dark:border-[#2C384D] text-center shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520]">
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">No past changes logged yet.</p>
                </div>
              ) : (
                history.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#141C28] border-2 border-slate-300 dark:border-[#2C384D] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono font-black text-[#0284c7] dark:text-[#40bcf4] text-xs px-2 py-0.5 rounded bg-[#40bcf4]/10 border border-[#40bcf4]/30 shrink-0">
                        {entry.score.toFixed(1)}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 font-semibold truncate text-xs">
                        {entry.reason || 'Score updated'}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {new Date(entry.changedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </form>

        {/* Footer Bar */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t-2 border-slate-300 dark:border-[#2C384D] bg-[#DEE5EF] dark:bg-[#171F2C] flex items-center justify-between gap-3 shrink-0 shadow-[0_-2px_6px_rgba(0,0,0,0.03)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.25)] pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-lg bg-[#00e054] hover:bg-[#00c94b] text-[#14181C] text-xs font-black uppercase tracking-wider border border-[#00c94b] border-b-[3px] border-b-[#009e3a] active:border-b active:translate-y-[2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_4px_12px_rgba(0,224,84,0.3)]"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin text-[#14181C]" />
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