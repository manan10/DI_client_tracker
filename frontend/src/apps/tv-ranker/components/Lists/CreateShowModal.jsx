import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Tv, Film, Check, Loader2, 
  Clapperboard, ChevronDown, Layers, 
  Sparkles, Calendar, Hash, Image as ImageIcon,
  Lock, Edit3
} from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../../../shared/hooks/useApi';

const GENRE_PRESETS = [
  'Drama', 'Crime', 'Comedy', 'Thriller', 'Sci-Fi', 
  'Action', 'Romance', 'Mystery', 'Animation', 'Indian'
];

const FORMAT_OPTIONS = [
  { value: 'TV_SERIES', label: 'TV Series', icon: Tv, desc: 'Multi-season episodic series' },
  { value: 'MINISERIES', label: 'Miniseries', icon: Layers, desc: 'Single season limited run' },
  { value: 'MOVIE', label: 'Feature Film', icon: Film, desc: 'Stand-alone cinema release' },
  { value: 'ANIME', label: 'Anime', icon: Sparkles, desc: 'Animated Japanese production' },
  { value: 'DOCUMENTARY', label: 'Documentary', icon: Clapperboard, desc: 'Factual or docuseries' }
];

const CreateShowModal = ({ isOpen, onClose, onCreated, editingShow = null }) => {
  const { request, loading } = useApi();
  const isEditing = Boolean(editingShow?._id);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('TV_SERIES');
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());
  const [totalSeasons, setTotalSeasons] = useState(1);
  const [genres, setGenres] = useState(['Drama']);
  const [customGenre, setCustomGenre] = useState('');
  const [posterUrl, setPosterUrl] = useState('');

  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const typeDropdownRef = useRef(null);

  // Sync state on open and handle edit vs create hydration
  useEffect(() => {
    if (isOpen) {
      if (editingShow) {
        setTitle(editingShow.title || '');
        setType(editingShow.type || 'TV_SERIES');
        setReleaseYear(editingShow.releaseYear || new Date().getFullYear());
        setTotalSeasons(editingShow.totalSeasons || 1);
        setGenres(Array.isArray(editingShow.genres) && editingShow.genres.length > 0 ? editingShow.genres : ['Drama']);
        setPosterUrl(editingShow.posterUrl || '');
        setCustomGenre('');
      } else {
        setTitle('');
        setType('TV_SERIES');
        setReleaseYear(new Date().getFullYear());
        setTotalSeasons(1);
        setGenres(['Drama']);
        setCustomGenre('');
        setPosterUrl('');
      }
    }
  }, [isOpen, editingShow]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setIsTypeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleToggleGenre = (g) => {
    setGenres((prev) => 
      prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
    );
  };

  const handleAddCustomGenre = (e) => {
    if (e.key === 'Enter' && customGenre.trim()) {
      e.preventDefault();
      const clean = customGenre.trim();
      if (!genres.includes(clean)) {
        setGenres([...genres, clean]);
      }
      setCustomGenre('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        type: type || 'TV_SERIES',
        releaseYear: releaseYear ? parseInt(releaseYear, 10) : undefined,
        totalSeasons: totalSeasons ? parseInt(totalSeasons, 10) : 1,
        genres: Array.isArray(genres) ? genres : [],
        posterUrl: posterUrl.trim() || undefined
      };

      let res;
      if (isEditing) {
        res = await request(`/shows/${editingShow._id}`, 'PUT', payload);
      } else {
        res = await request('/shows', 'POST', payload);
      }

      if (res?.success || res?.data || res?._id) {
        toast.success(isEditing ? 'Show Updated Successfully' : 'New Show Added to Database', {
          description: `${title} details have been saved.`
        });
        if (typeof onCreated === 'function') onCreated(res.data || res);
        if (typeof onClose === 'function') onClose();
      } else {
        toast.error(res?.message || 'Failed to save show details');
      }
    } catch (err) {
      console.error('Save show failure:', err);
      toast.error(err.message || 'Network error while saving show');
    }
  };

  const currentTypeObj = FORMAT_OPTIONS.find((f) => f.value === type) || FORMAT_OPTIONS[0];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-xl md:max-w-2xl bg-white dark:bg-[#070A12] border-t sm:border border-slate-200 dark:border-white/10 rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-slate-100 transition-all relative font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Tab */}
        <div className="w-full flex sm:hidden items-center justify-center pt-2 pb-1.5 bg-linear-to-r from-rose-950 via-slate-900 to-[#0F1424]">
          <div className="w-10 h-1 bg-rose-400/40 rounded-full" />
        </div>

        {/* Header Bar */}
        <div className="px-5 sm:px-6 py-4 bg-linear-to-r from-rose-950 via-slate-900 to-[#0F1424] border-b border-rose-500/30 flex items-center justify-between text-white shrink-0 relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-linear-to-tr from-rose-600 via-pink-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-950/50 border border-white/10">
              {isEditing ? <Edit3 size={18} strokeWidth={2.4} /> : <Clapperboard size={18} strokeWidth={2.4} />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold tracking-[0.14em] uppercase leading-none text-white drop-shadow-xs">
                {isEditing ? 'Edit Show Details' : 'Add New Show'}
              </h2>
              <p className="text-[11px] font-mono tracking-wider uppercase text-rose-200/90 mt-1 font-semibold">
                {isEditing ? 'Modify format, metadata & poster' : 'Register Show or Film into Master Database'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10 shadow-xs"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 no-scrollbar flex-1 text-left">
          
          {/* Row 1: Title & Media Format */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-start">
            
            {/* Title (Non-editable when editing) */}
            <div className="sm:col-span-7 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-serif font-bold tracking-[0.12em] uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>Show Name</span>
                  {!isEditing && <span className="text-rose-500">*</span>}
                </label>
                {isEditing && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10">
                    <Lock size={10} />
                    <span>Locked</span>
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={isEditing}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Severance, Breaking Bad, Attack on Titan..."
                  className={`w-full h-11 px-3.5 rounded-lg border text-xs sm:text-sm font-semibold transition-all font-sans shadow-2xs ${
                    isEditing 
                      ? 'bg-slate-100/90 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 cursor-not-allowed select-none' 
                      : 'bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/15 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20'
                  }`}
                />
              </div>
            </div>

            {/* Custom Format Dropdown */}
            <div className="sm:col-span-5 space-y-1.5 relative" ref={typeDropdownRef}>
              <label className="text-xs font-serif font-bold tracking-[0.12em] uppercase text-slate-700 dark:text-slate-300">
                Media Format
              </label>

              <button
                type="button"
                onClick={() => setIsTypeOpen(!isTypeOpen)}
                className={`w-full h-11 px-3.5 flex items-center justify-between rounded-lg bg-slate-50 dark:bg-white/5 border text-left transition-all cursor-pointer outline-none ${
                  isTypeOpen
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-slate-300 dark:border-white/15 hover:border-slate-400 dark:hover:border-white/30 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2 truncate min-w-0">
                  <currentTypeObj.icon size={15} className="text-rose-500 shrink-0" />
                  <span className="text-xs font-serif tracking-wider font-bold uppercase text-slate-900 dark:text-white truncate">
                    {currentTypeObj.label}
                  </span>
                </div>
                <ChevronDown
                  size={15}
                  className={`text-slate-400 shrink-0 transition-transform duration-200 ${isTypeOpen ? 'rotate-180 text-rose-500' : ''}`}
                />
              </button>

              {isTypeOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white dark:bg-[#0B101E] border-2 border-slate-300 dark:border-white/20 rounded-xl shadow-2xl p-1 space-y-1 animate-in fade-in duration-150">
                  {FORMAT_OPTIONS.map((f) => {
                    const isSelected = f.value === type;
                    const Icon = f.icon;
                    return (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => {
                          setType(f.value);
                          setIsTypeOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-500/40 shadow-xs'
                            : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon size={14} className={isSelected ? 'text-rose-500' : 'text-slate-400'} />
                          <div className="flex flex-col truncate">
                            <span className="text-xs font-serif tracking-wide font-bold uppercase">{f.label}</span>
                            <span className="text-[10px] font-mono text-slate-400">{f.desc}</span>
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="text-rose-500 shrink-0" strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Total Seasons & Release Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-bold tracking-[0.12em] uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Hash size={13} className="text-slate-400" />
                <span>Total Seasons Produced</span>
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={totalSeasons}
                onChange={(e) => setTotalSeasons(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-rose-500 shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-serif font-bold tracking-[0.12em] uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar size={13} className="text-slate-400" />
                <span>Year of Release</span>
              </label>
              <input
                type="number"
                min="1900"
                max="2099"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-rose-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Row 3: Poster Artwork URL & Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-serif font-bold tracking-[0.12em] uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <ImageIcon size={13} className="text-slate-400" />
              <span>Poster Artwork URL (Optional)</span>
            </label>
            <div className="flex gap-2.5 items-center">
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://image.tmdb.org/t/p/w500/..."
                className="flex-1 h-11 px-3.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500 shadow-2xs"
              />
              {posterUrl && (
                <div className="w-9 h-11 rounded-sm border border-slate-300 dark:border-white/20 overflow-hidden shrink-0 bg-slate-900 shadow-xs">
                  <img
                    src={posterUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Row 4: Genre Chips & Tag Creator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-serif font-bold tracking-[0.12em] uppercase text-slate-700 dark:text-slate-300">
                Genres & Categorization Tags
              </label>
              <span className="text-[10px] font-mono text-slate-400">Press enter for custom tag</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {GENRE_PRESETS.map((g) => {
                const active = genres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleToggleGenre(g)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      active
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/50 shadow-2xs'
                        : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/10 hover:border-slate-400'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={customGenre}
              onChange={(e) => setCustomGenre(e.target.value)}
              onKeyDown={handleAddCustomGenre}
              placeholder="+ Add custom tag (e.g. Psychological, Sitcom, Heist)..."
              className="w-full h-9 px-3 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500 shadow-2xs"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/2 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-serif font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-linear-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-serif font-bold uppercase tracking-wider shadow-md shadow-rose-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                <span>{isEditing ? 'Updating...' : 'Registering...'}</span>
              </>
            ) : (
              <>
                <Check size={15} strokeWidth={2.5} />
                <span>{isEditing ? 'Save Changes' : 'Save to Database'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateShowModal;