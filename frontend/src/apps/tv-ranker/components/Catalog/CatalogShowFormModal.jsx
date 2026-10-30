import React, { useState, useEffect } from 'react';
import { 
  X, Check, Loader2, Film, Tv, Sparkles, 
  Layers, Calendar, Hash, Image as ImageIcon, Plus, Trash2 
} from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../../../shared/hooks/useApi';

const FORMAT_OPTIONS = [
  { value: 'TV_SERIES', label: 'Series', icon: Tv },
  { value: 'ANIME', label: 'Anime', icon: Sparkles },
  { value: 'MINISERIES', label: 'Miniseries', icon: Layers },
  { value: 'MOVIE', label: 'Movie', icon: Film }
];

const GENRE_TAGS = [
  'Drama', 'Crime', 'Comedy', 'Thriller', 'Sci-Fi', 
  'Action', 'Romance', 'Mystery', 'Animation', 'Indian'
];

const CatalogShowFormModal = ({ isOpen, onClose, onSaved, initialShow = null }) => {
  const { request, loading } = useApi();
  const isEditing = Boolean(initialShow);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('TV_SERIES');
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());
  const [totalSeasons, setTotalSeasons] = useState(1);
  const [genres, setGenres] = useState(['Drama']);
  const [customGenre, setCustomGenre] = useState('');
  const [posterUrl, setPosterUrl] = useState('');

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (initialShow) {
      setTitle(initialShow.title || '');
      setType(initialShow.type || 'TV_SERIES');
      setReleaseYear(initialShow.releaseYear || initialShow.year || new Date().getFullYear());
      setTotalSeasons(initialShow.totalSeasons || 1);
      setGenres(Array.isArray(initialShow.genres) ? initialShow.genres : ['Drama']);
      setPosterUrl(initialShow.posterUrl || initialShow.bannerUrl || '');
    } else {
      setTitle('');
      setType('TV_SERIES');
      setReleaseYear(new Date().getFullYear());
      setTotalSeasons(1);
      setGenres(['Drama']);
      setPosterUrl('');
    }
  }, [initialShow]);

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
    if (e) e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required', { description: 'Please provide a name for the show.' });
      return;
    }

    const payload = {
      title: title.trim(),
      type: type || 'TV_SERIES',
      releaseYear: releaseYear ? parseInt(releaseYear, 10) : undefined,
      totalSeasons: totalSeasons ? parseInt(totalSeasons, 10) : 1,
      genres: Array.isArray(genres) ? genres : [],
      posterUrl: posterUrl.trim() || undefined
    };

    try {
      let res;
      if (isEditing) {
        res = await request(`/shows/${initialShow._id}`, 'PUT', payload);
      } else {
        res = await request('/shows', 'POST', payload);
      }

      if (res?.success || res?.data || res?._id) {
        const savedData = res.data || res;
        toast.success(isEditing ? 'Show details updated' : 'New show registered');
        if (typeof onSaved === 'function') onSaved(savedData);
        if (typeof onClose === 'function') onClose();
      } else {
        toast.error(res?.message || 'Failed to save show');
      }
    } catch (err) {
      console.error('Save show error:', err);
      toast.error(err.message || 'Network error saving show');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm select-none font-sans"
      onClick={onClose}
    >
      {/* Two-Tone Slide-over Drawer Frame */}
      <div 
        className="w-full sm:w-[500px] md:w-[540px] bg-[#E9EEF5] dark:bg-[#1E2636] border-t-2 sm:border-t-0 sm:border-l-2 border-slate-300 dark:border-[#334158] shadow-[0_15px_45px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[92dvh] sm:max-h-screen rounded-t-2xl sm:rounded-none text-slate-800 dark:text-slate-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#40bcf4] to-transparent pointer-events-none z-30" />

        {/* Grab Handle for Mobile */}
        <div className="w-full flex sm:hidden items-center justify-center pt-2.5 pb-1 bg-[#DEE5EF] dark:bg-[#19202E] shrink-0">
          <div className="w-12 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4.5 bg-[#DEE5EF] dark:bg-[#171F2C] border-b-2 border-slate-300 dark:border-[#2C384D] flex items-center justify-between shrink-0 shadow-[0_2px_4px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.25)] relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white dark:bg-[#253044] border border-slate-300 dark:border-[#3B4B67] flex items-center justify-center text-[#40bcf4] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#141A24] shrink-0">
              {isEditing ? (
                <Tv size={16} strokeWidth={2.4} className="text-[#40bcf4]" />
              ) : (
                <Film size={16} strokeWidth={2.4} className="text-[#40bcf4]" />
              )}
            </div>
            
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 dark:text-white leading-none">
                  {isEditing ? 'Edit Show Details' : 'Add New Show'}
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284c7] dark:text-[#40bcf4] bg-[#40bcf4]/10 border border-[#40bcf4]/30 px-2 py-0.5 rounded shadow-2xs">
                  {isEditing ? 'Update' : 'Catalog'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {isEditing ? `Modifying: ${initialShow?.title || 'Selected show'}` : 'Register a master record into catalog'}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-4.5 no-scrollbar flex-1 text-left">
          
          {/* Title Input Card */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Show Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400">Required</span>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Severance, Succession, Attack on Titan..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#141C28] border-2 border-slate-300 dark:border-[#2C384D] text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#40bcf4] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] transition-colors"
            />
          </div>

          {/* Media Format Selector Buttons */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Media Format
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FORMAT_OPTIONS.map((f) => {
                const Icon = f.icon;
                const isSelected = type === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setType(f.value)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-mono font-bold uppercase border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#40bcf4] text-[#0A1017] border-[#2aa6e0] shadow-[0_2px_0_0_#0284c7]'
                        : 'bg-white dark:bg-[#141C28] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#2C384D] hover:border-slate-400 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] active:translate-y-[1px] active:shadow-none'
                    }`}
                  >
                    <Icon size={14} className={isSelected ? 'text-[#0A1017]' : 'text-[#40bcf4]'} />
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Release Year & Total Seasons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar size={13} className="text-[#40bcf4]" />
                <span>Release Year</span>
              </label>
              <input
                type="number"
                min="1900"
                max="2099"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#141C28] border-2 border-slate-300 dark:border-[#2C384D] text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#40bcf4] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Hash size={13} className="text-[#40bcf4]" />
                <span>Total Seasons</span>
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={totalSeasons}
                onChange={(e) => setTotalSeasons(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#141C28] border-2 border-slate-300 dark:border-[#2C384D] text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#40bcf4] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] transition-colors"
              />
            </div>
          </div>

          {/* Poster Artwork URL Card */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon size={13} className="text-[#40bcf4]" />
                <span>Poster Artwork URL</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400">Optional</span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-[#141C28] border-2 border-slate-300 dark:border-[#2C384D] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] flex items-center gap-3">
              {posterUrl ? (
                <div className="w-10 h-14 rounded-lg overflow-hidden bg-slate-900 border border-slate-300 dark:border-[#38465E] shrink-0 shadow-2xs">
                  <img
                    src={posterUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              ) : (
                <div className="w-10 h-14 rounded-lg bg-slate-100 dark:bg-[#1E2838] border border-dashed border-slate-300 dark:border-[#38465E] flex items-center justify-center text-slate-400 shrink-0">
                  <ImageIcon size={18} />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <input
                  type="url"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="https://image.tmdb.org/t/p/w500/..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1B2433] border border-slate-300 dark:border-[#38465E] text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#40bcf4] transition-colors"
                />
                <span className="text-[10px] font-mono text-slate-400 mt-1 block truncate">
                  {posterUrl ? 'Direct image link loaded' : 'Direct TMDB, IMDb, or web poster link'}
                </span>
              </div>

              {posterUrl && (
                <button
                  type="button"
                  onClick={() => setPosterUrl('')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  title="Remove URL"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 py-0.5">
            <div className="h-0.5 bg-slate-300 dark:bg-[#2C384D] flex-1" />
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
              GENRES & CLASSIFICATION
            </span>
            <div className="h-0.5 bg-slate-300 dark:bg-[#2C384D] flex-1" />
          </div>

          {/* Genres Chips & Custom Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Select Genres
              </label>
              <span className="text-[10px] font-mono text-[#0284c7] dark:text-[#40bcf4] font-bold">
                {genres.length} Selected
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#141C28] border-2 border-slate-300 dark:border-[#2C384D] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {GENRE_TAGS.map((g) => {
                  const active = genres.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleToggleGenre(g)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border transition-all cursor-pointer ${
                        active
                          ? 'bg-[#40bcf4] text-[#0A1017] border-[#2aa6e0] shadow-xs'
                          : 'bg-slate-100 dark:bg-[#1E2838] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#38465E] hover:border-slate-400'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Genre Field */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  onKeyDown={handleAddCustomGenre}
                  placeholder="Type custom genre and press Enter..."
                  className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-[#1B2433] border border-slate-300 dark:border-[#38465E] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#40bcf4] transition-colors"
                />
                <Plus size={14} className="absolute left-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

        </form>

        {/* Footer Bar */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t-2 border-slate-300 dark:border-[#2C384D] bg-[#DEE5EF] dark:bg-[#171F2C] flex items-center justify-between gap-3 shrink-0 shadow-[0_-2px_6px_rgba(0,0,0,0.03)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.25)] pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
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
                <span>{isEditing ? 'Save Changes' : 'Save Show'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CatalogShowFormModal;