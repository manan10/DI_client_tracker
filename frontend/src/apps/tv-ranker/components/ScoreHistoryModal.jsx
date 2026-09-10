import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, History, Star, Save, Clock, ChevronDown, Check,
  CheckCircle2, PlayCircle, Layers, Ban, Minus, Plus, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../../shared/hooks/useApi';

const STATUS_OPTIONS = [
  { value: 'COMPLETED', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-emerald-500/30' },
  { value: 'WATCHING', label: 'Watching', icon: PlayCircle, color: 'text-sky-700 dark:text-sky-300 bg-sky-500/15 border-sky-500/30' },
  { value: 'PLAN_TO_WATCH', label: 'Plan to Watch', icon: Clock, color: 'text-amber-700 dark:text-amber-300 bg-amber-500/15 border-amber-500/30' },
  { value: 'ON_HOLD', label: 'On Hold', icon: Layers, color: 'text-purple-700 dark:text-purple-300 bg-purple-500/15 border-purple-500/30' },
  { value: 'DROPPED', label: 'Dropped', icon: Ban, color: 'text-rose-700 dark:text-rose-300 bg-rose-500/15 border-rose-500/30' }
];

const ScoreHistoryModal = ({ item, isOpen, onClose, onUpdated }) => {
  const { request } = useApi();
  const [newRating, setNewRating] = useState(item?.rating ?? 8.5);
  const [reason, setReason] = useState('');
  const [review, setReview] = useState(item?.review || '');
  const [status, setStatus] = useState(item?.status || 'COMPLETED');
  const [isLoading, setIsLoading] = useState(false);

  // Custom Dropdown Open State
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  // Rotary Dial Interaction Refs
  const dialRef = useRef(null);
  const isDraggingDial = useRef(false);

  useEffect(() => {
    if (item) {
      setNewRating(item.rating ?? 8.5);
      setReview(item.review || '');
      setStatus(item.status || 'COMPLETED');
      setReason('');
    }
  }, [item]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calculateAngleScore = useCallback((clientX, clientY) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = clientX - centerX;
    const y = clientY - centerY;

    let degrees = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;

    const rawScore = (degrees / 360) * 10;
    const clampedScore = Math.min(10, Math.max(0, parseFloat(rawScore.toFixed(1))));
    setNewRating(clampedScore);
  }, []);

  const handleDialMouseDown = (e) => {
    isDraggingDial.current = true;
    calculateAngleScore(e.clientX, e.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingDial.current) {
        calculateAngleScore(e.clientX, e.clientY);
      }
    };
    const handleMouseUp = () => {
      isDraggingDial.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [calculateAngleScore]);

  if (!isOpen || !item) return null;

  const adjustScore = (delta) => {
    setNewRating((prev) => {
      const updated = Math.min(10, Math.max(0, parseFloat((prev + delta).toFixed(1))));
      return updated;
    });
  };

  const getTierDetails = () => {
    const val = parseFloat(newRating) || 0;
    if (val >= 9.0) {
      return { 
        label: 'Masterpiece', 
        badge: 'text-amber-300 bg-amber-400/20 border-amber-400/50', 
        stroke: '#f59e0b'
      };
    }
    if (val >= 8.0) {
      return { 
        label: 'Great', 
        badge: 'text-rose-300 bg-rose-500/20 border-rose-500/40', 
        stroke: '#f43f5e'
      };
    }
    if (val >= 7.0) {
      return { 
        label: 'Good', 
        badge: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40', 
        stroke: '#06b6d4'
      };
    }
    return { 
      label: 'Casual', 
      badge: 'text-slate-300 bg-slate-800 border-slate-700', 
      stroke: '#94a3b8'
    };
  };

  const tier = getTierDetails();
  const currentStatusObj = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const showId = item.show?._id || item.show;
      const res = await request(`/shows/${showId}/rating`, 'POST', {
        rating: parseFloat(newRating),
        reason: reason.trim() || undefined,
        review: review.trim(),
        status
      });

      if (res?.success || res?.data) {
        toast.success('Rating Adjusted', { 
          description: `${item.show?.title} is now ${parseFloat(newRating).toFixed(1)}/10` 
        });
        if (typeof onUpdated === 'function') onUpdated();
        if (typeof onClose === 'function') onClose();
      } else {
        toast.error(res?.message || 'Could not update score');
      }
    } catch {
      toast.error('Failed to update rating timeline');
    } finally {
      setIsLoading(false);
    }
  };

  const history = item.ratingHistory || [];
  const showTitle = item.show?.title || 'Unknown Title';

  // Circular gauge math (compact 44px radius)
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * (newRating / 10));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Container: Less Rounded Shell */}
      <div 
        className="w-full sm:max-w-xl md:max-w-2xl bg-white dark:bg-[#070A12] border-t sm:border border-slate-200/90 dark:border-white/10 rounded-t-xl sm:rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-slate-100 transition-all relative font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="w-full flex sm:hidden items-center justify-center pt-2 pb-1 bg-linear-to-r from-rose-950 via-slate-900 to-slate-950">
          <div className="w-8 h-1 bg-rose-400/40 rounded-full" />
        </div>

        {/* ===================== COLORED HEADER BAR ===================== */}
        <div className="px-5 sm:px-6 py-3.5 bg-linear-to-r from-rose-950 via-slate-900 to-[#0F1424] border-b border-rose-500/30 flex items-center justify-between text-white shrink-0 relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-md bg-linear-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
              <History size={17} strokeWidth={2.4} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-serif font-bold tracking-[0.14em] uppercase leading-none text-white truncate">
                {showTitle}
              </h2>
              <p className="text-[10px] font-mono tracking-wider uppercase text-rose-300/80 mt-0.5">
                Score Timeline & Revision Ledger
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10 shrink-0"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* ===================== BODY CONTENT ===================== */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 no-scrollbar flex-1 text-left">
          
          {/* ===================== COMPACT HYBRID RATINGS PANE ===================== */}
          <div className="p-3.5 rounded-md bg-linear-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/40 shadow-md text-white relative overflow-hidden space-y-3">
            
            {/* Top Row: Mini Header + Tier Capsule */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2 relative z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-mono font-bold tracking-[0.16em] uppercase text-cyan-300">
                  Rating Console
                </span>
              </div>

              <div className={`px-2 py-0.5 rounded-sm text-[9px] font-mono font-bold uppercase tracking-wider border ${tier.badge}`}>
                {tier.label}
              </div>
            </div>

            {/* Middle Row: Compact Radial Gauge + Steppers & Snaps */}
            <div className="flex items-center justify-between gap-4 relative z-10">
              
              {/* Compact Rotary Dial (Scrub/Drag supported) */}
              <div 
                ref={dialRef}
                onMouseDown={handleDialMouseDown}
                className="relative w-24 h-24 flex items-center justify-center cursor-pointer select-none shrink-0 group"
                title="Drag or click dial to adjust score"
              >
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#1e1b4b"
                    strokeWidth="7"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={tier.stroke}
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-100"
                  />
                </svg>

                {/* Score Readout Inside Dial */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-mono font-black tracking-tighter text-white leading-none">
                    {parseFloat(newRating || 0).toFixed(1)}
                  </span>
                  <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    / 10
                  </span>
                </div>
              </div>

              {/* Steppers & Snap Benchmarks */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>Fine Steppers:</span>
                  <span>Direct Snaps:</span>
                </div>

                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    {[-0.5, -0.1, +0.1, +0.5].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() => adjustScore(delta)}
                        className="px-2 py-1 rounded-sm bg-white/10 hover:bg-white/20 border border-white/15 text-[10px] font-mono font-bold text-white transition-all active:scale-95 cursor-pointer"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    {[6.0, 7.5, 8.5, 9.5].map((snap) => (
                      <button
                        key={snap}
                        type="button"
                        onClick={() => setNewRating(snap)}
                        className={`px-1.5 py-1 rounded-sm text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                          Math.abs(newRating - snap) < 0.05
                            ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                        }`}
                      >
                        {snap.toFixed(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Row: Precision Range Rail */}
            <div className="flex items-center gap-2 pt-1 border-t border-white/10 relative z-10">
              <button
                type="button"
                onClick={() => adjustScore(-0.1)}
                className="p-1 rounded-sm bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 transition-colors shrink-0 cursor-pointer active:scale-90"
                title="-0.1"
              >
                <Minus size={11} strokeWidth={3} />
              </button>

              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={newRating}
                onChange={(e) => setNewRating(parseFloat(e.target.value))}
                className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-sm appearance-none"
              />

              <button
                type="button"
                onClick={() => adjustScore(0.1)}
                className="p-1 rounded-sm bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 transition-colors shrink-0 cursor-pointer active:scale-90"
                title="+0.1"
              >
                <Plus size={11} strokeWidth={3} />
              </button>
            </div>

          </div>

          {/* Reason Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-serif font-bold tracking-[0.12em] uppercase text-slate-600 dark:text-slate-300">
              Reason for Adjustment
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Rewatched S2, ending was rushed, held up well..."
              className="w-full h-10 px-3 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 transition-all font-sans"
            />
          </div>

          {/* Status & Review Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
            {/* Custom Status Dropdown */}
            <div className="sm:col-span-5 space-y-1 relative" ref={statusDropdownRef}>
              <label className="text-[11px] font-serif font-bold tracking-[0.12em] uppercase text-slate-600 dark:text-slate-300">
                Viewing Status
              </label>

              <button
                type="button"
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className={`w-full h-10 px-3 flex items-center justify-between rounded-md bg-slate-50 dark:bg-white/5 border text-left transition-all cursor-pointer outline-none ${
                  isStatusOpen
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <span className={`px-1.5 py-0.2 rounded-sm text-[9px] font-mono font-bold uppercase tracking-wider border truncate ${currentStatusObj.color}`}>
                  {currentStatusObj.label}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-slate-400 shrink-0 transition-transform duration-200 ${isStatusOpen ? 'rotate-180 text-rose-500' : ''}`}
                />
              </button>

              {isStatusOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white dark:bg-[#0B101E] border border-slate-200 dark:border-white/15 rounded-md shadow-xl p-1 space-y-0.5 animate-in fade-in duration-150">
                  {STATUS_OPTIONS.map((s) => {
                    const isSelected = s.value === status;
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => {
                          setStatus(s.value);
                          setIsStatusOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-1.5 rounded-sm text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-white/10 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={13} className="text-rose-500" />
                          <span className={`px-1 py-0.2 rounded-sm text-[9px] font-mono font-bold uppercase border ${s.color}`}>
                            {s.label}
                          </span>
                        </div>
                        {isSelected && <Check size={12} className="text-emerald-500 shrink-0" strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Review Input */}
            <div className="sm:col-span-7 space-y-1">
              <label className="text-[11px] font-serif font-bold tracking-[0.12em] uppercase text-slate-600 dark:text-slate-300">
                Personal Critique
              </label>
              <input
                type="text"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Key takeaways, highlights..."
                className="w-full h-10 px-3 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500 transition-colors font-sans"
              />
            </div>
          </div>

          {/* Revision Timeline Ledger */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-serif font-bold tracking-[0.12em] uppercase text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Clock size={13} className="text-amber-500" />
                Score Revision History ({history.length})
              </span>
              <span className="text-[9px] font-mono text-slate-400">Chronological</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
              {history.length === 0 ? (
                <div className="p-3 rounded-md bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 text-center">
                  <p className="text-xs text-slate-400 italic">Initial score logged without revisions yet.</p>
                </div>
              ) : (
                history.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-md bg-slate-50 dark:bg-white/2 border border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs shrink-0">
                        {entry.score.toFixed(1)}/10
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium truncate text-[11px]">
                        {entry.reason || 'Rating update'}
                      </span>
                    </div>

                    <span className="text-[9px] font-mono text-slate-400 shrink-0">
                      {new Date(entry.changedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* ===================== FOOTER ACTIONS ===================== */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-white/2 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-md text-xs font-serif font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 rounded-md bg-linear-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-serif font-bold uppercase tracking-wider shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin text-white" />
                <span>Adjusting...</span>
              </>
            ) : (
              <>
                <Save size={13} strokeWidth={2.5} />
                <span>Apply Score Change</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreHistoryModal;