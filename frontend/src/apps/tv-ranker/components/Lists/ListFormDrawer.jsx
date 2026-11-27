import React, { useState, useEffect } from 'react';
import { 
  X, Layers, Check, Loader2, Edit3, 
  ArrowUpDown, Globe, Lock, Tag, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../../../shared/hooks/useApi';

const ListFormDrawer = ({
  isOpen,
  onClose,
  onSuccess,
  list = null // If provided, enters Edit mode; otherwise Create mode
}) => {
  const { request, loading: apiLoading } = useApi();
  const isEditing = Boolean(list?._id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    isRanked: false,
    isPublic: false,
    tagsInput: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state whenever the drawer opens or the target list changes
  useEffect(() => {
    if (isOpen) {
      if (list) {
        setFormData({
          title: list.title || '',
          description: list.description || '',
          coverImage: list.coverImage || '',
          isRanked: Boolean(list.isRanked),
          isPublic: Boolean(list.isPublic),
          tagsInput: Array.isArray(list.tags) ? list.tags.join(', ') : ''
        });
      } else {
        setFormData({
          title: '',
          description: '',
          coverImage: '',
          isRanked: false,
          isPublic: false,
          tagsInput: ''
        });
      }
    }
  }, [isOpen, list]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('List title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedTags = formData.tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        coverImage: formData.coverImage.trim(),
        isRanked: formData.isRanked,
        isPublic: formData.isPublic,
        tags: parsedTags
      };

      const endpoint = isEditing ? `/lists/${list._id}` : '/lists';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await request(endpoint, method, payload);

      if (res?.success || res?._id || res?.data) {
        const savedList = res?.data || res;
        toast.success(
          isEditing 
            ? `List "${formData.title}" updated` 
            : `List "${formData.title}" created`
        );
        if (typeof onSuccess === 'function') onSuccess(savedList);
        if (typeof onClose === 'function') onClose();
      } else {
        toast.error(res?.message || `Failed to ${isEditing ? 'update' : 'create'} list`);
      }
    } catch (err) {
      console.error('List save error:', err);
      toast.error(err.message || 'Error processing list operation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || apiLoading;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm select-none font-sans"
      style={{ '--font-sans': "'Space Grotesk', sans-serif", '--font-mono': "'Space Mono', monospace", fontFamily: "'Space Grotesk', sans-serif" }}
      onClick={onClose}
    >
      {/* Two-Tone Slide-over Drawer Frame: Bottom-sheet on mobile, side-drawer on tablet/desktop */}
      <div 
        className="w-full sm:w-[500px] md:w-[540px] bg-white dark:bg-[#161B22] border-t-2 sm:border-t-0 sm:border-l-2 border-slate-300 dark:border-[#2C3545] shadow-[0_15px_45px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[92dvh] sm:max-h-screen rounded-t-xs sm:rounded-none text-slate-800 dark:text-stone-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent pointer-events-none z-30" />

        {/* Grab Handle for Mobile */}
        <div className="w-full flex sm:hidden items-center justify-center pt-2.5 pb-1 bg-slate-50 dark:bg-[#12171F] shrink-0">
          <div className="w-12 h-1.5 bg-slate-400 dark:bg-stone-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4.5 bg-slate-50 dark:bg-[#12171F] border-b-2 border-slate-200/90 dark:border-[#262E3B] flex items-center justify-between shrink-0 shadow-[0_2px_4px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.25)] relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xs bg-white dark:bg-[#12171F] border border-slate-300 dark:border-[#2C3545] flex items-center justify-center text-pink-500 dark:text-pink-400 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0B0E14] shrink-0">
              {isEditing ? (
                <Edit3 size={16} strokeWidth={2.4} className="text-pink-500 dark:text-pink-400" />
              ) : (
                <Layers size={16} strokeWidth={2.4} className="text-pink-500 dark:text-pink-400 -rotate-6" />
              )}
            </div>
            
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <h2
                  className="text-sm sm:text-base font-normal uppercase tracking-[0.02em] text-slate-900 dark:text-white leading-none"
                  style={{ fontFamily: "'Bungee', sans-serif" }}
                >
                  {isEditing ? 'Edit List' : 'Create List'}
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 bg-pink-500/10 border border-pink-500/30 px-2 py-0.5 rounded-2xs shadow-2xs">
                  {isEditing ? 'Update' : 'Curate'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-500 dark:text-stone-400 mt-1 font-medium">
                {isEditing ? `Modifying: ${list.title}` : 'Compile a custom catalog or ranked leaderboard'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xs bg-white dark:bg-[#12171F] text-slate-500 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-[#2C3545] font-mono shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0B0E14] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            title="Close"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form 
          id="list-form-drawer"
          onSubmit={handleSubmit} 
          className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-4.5 no-scrollbar flex-1 text-left"
        >
          {/* Title Input Card */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-stone-300 block">
                List Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400 dark:text-stone-400">Required</span>
            </div>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Masterpiece Miniseries, Comfort Binge, Top 10 Sci-Fi..."
              className="w-full h-10 px-3.5 rounded-xs bg-white dark:bg-[#12171F] border-2 border-slate-300 dark:border-[#2C3545] text-xs font-mono font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-stone-400 outline-none focus:border-pink-500 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0B0E14] transition-colors"
            />
          </div>

          {/* Description Textarea Card */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-stone-300 block">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain the theme, rules, or criteria for this collection..."
              className="w-full p-3 rounded-xs bg-white dark:bg-[#12171F] border-2 border-slate-300 dark:border-[#2C3545] text-xs font-mono font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-stone-400 outline-none focus:border-pink-500 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0B0E14] transition-colors resize-none"
            />
          </div>

          {/* Tags Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-stone-300 block">
                Category Tags
              </label>
              <span className="text-[10px] font-mono text-slate-400 dark:text-stone-400">Comma-separated</span>
            </div>
            <div className="relative flex items-center">
              <Tag size={14} className="absolute left-3 text-slate-400 dark:text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={formData.tagsInput}
                onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                placeholder="e.g. sci-fi, top10, thriller, family"
                className="w-full h-10 pl-9 pr-3.5 rounded-xs bg-white dark:bg-[#12171F] border-2 border-slate-300 dark:border-[#2C3545] text-xs font-mono font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-stone-400 outline-none focus:border-pink-500 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0B0E14] transition-colors"
              />
            </div>
          </div>

          {/* Optional Custom Cover URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-stone-300 block">
                Custom Cover URL (Optional)
              </label>
              <span className="text-[10px] font-mono text-slate-400 dark:text-stone-400">Defaults to first show poster</span>
            </div>
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              placeholder="https://image.tmdb.org/t/p/w500/..."
              className="w-full h-10 px-3.5 rounded-xs bg-white dark:bg-[#12171F] border-2 border-slate-300 dark:border-[#2C3545] text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-stone-400 outline-none focus:border-pink-500 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0B0E14] transition-colors"
            />
          </div>

          {/* Segmented Toggles Card */}
          <div className="p-3 sm:p-3.5 rounded-xs bg-white dark:bg-[#12171F] border-2 border-slate-300 dark:border-[#2C3545] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0B0E14] grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Ranked Checkbox */}
            <label className="flex items-start gap-2.5 p-2 rounded-xs hover:bg-slate-50 dark:hover:bg-[#161B22] transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRanked}
                onChange={(e) => setFormData({ ...formData, isRanked: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded-2xs text-pink-500 accent-pink-500 focus:ring-0 bg-transparent border-slate-400 dark:border-stone-600"
              />
              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ArrowUpDown size={12} className="text-amber-500" strokeWidth={2.5} />
                  Ranked Order
                </span>
                <span className="text-[10px] text-slate-500 dark:text-stone-400 font-mono">
                  1 to N numbered positions
                </span>
              </div>
            </label>

            {/* Public Checkbox */}
            <label className="flex items-start gap-2.5 p-2 rounded-xs hover:bg-slate-50 dark:hover:bg-[#161B22] transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded-2xs text-pink-500 accent-pink-500 focus:ring-0 bg-transparent border-slate-400 dark:border-stone-600"
              />
              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {formData.isPublic ? (
                    <Globe size={12} className="text-pink-500 dark:text-pink-400" />
                  ) : (
                    <Lock size={12} className="text-slate-400 dark:text-stone-400" />
                  )}
                  Public Visibility
                </span>
                <span className="text-[10px] text-slate-500 dark:text-stone-400 font-mono">
                  Sharable with link
                </span>
              </div>
            </label>
          </div>
        </form>

        {/* Footer Bar */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t-2 border-slate-200/90 dark:border-[#262E3B] bg-slate-50 dark:bg-[#12171F] flex items-center justify-between gap-3 shrink-0 shadow-[0_-2px_6px_rgba(0,0,0,0.03)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.25)] pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xs text-xs font-mono font-bold text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            form="list-form-drawer"
            disabled={isLoading || !formData.title.trim()}
            className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xs bg-pink-500 hover:bg-pink-600 text-white text-xs font-mono font-bold uppercase tracking-wider border border-pink-600 border-b-[3px] border-b-pink-700 active:border-b active:translate-y-[2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_4px_12px_rgba(236,72,153,0.3)]"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <>
                <Check size={15} strokeWidth={3} />
                <span>{isEditing ? 'Save Changes' : 'Create List'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListFormDrawer;