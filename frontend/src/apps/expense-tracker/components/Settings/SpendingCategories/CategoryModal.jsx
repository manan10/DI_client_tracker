import React from "react";
import { X, ShieldAlert, Merge, CheckCircle2 } from "lucide-react";

const CategoryModal = ({ 
  modalMode, 
  closeModal, 
  catName, 
  setCatName, 
  catColor, 
  setCatColor, 
  handleAction, 
  confirmDelete, 
  editTarget, 
  selectedCount 
}) => {
  if (!modalMode) return null;

  const isDelete = modalMode === 'delete';
  const isMerge = modalMode === 'merge';
  const isSubDelete = editTarget?.type === 'sub';

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4 antialiased text-left font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
        onClick={closeModal} 
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-[#0B1120] rounded-xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] no-scrollbar z-10">
        
        {isDelete ? (
          /* DELETE CONFIRMATION STATE */
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldAlert size={20} strokeWidth={2.2} />
              </div>

              <button 
                type="button"
                onClick={closeModal} 
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-serif tracking-tight text-slate-900 dark:text-white leading-tight">
                {isSubDelete ? "Remove" : "Delete"}{" "}
                <span className="italic font-normal text-rose-700 dark:text-rose-400">
                  {isSubDelete ? "Tag" : "Category"}
                </span>
              </h3>
              
              <p className="text-xs font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <strong className="text-slate-900 dark:text-slate-100 font-semibold font-sans">
                  "{editTarget?.label}"
                </strong>
                ?
              </p>

              {!isSubDelete && (
                <div className="p-2.5 rounded-lg bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200/80 dark:border-rose-500/20 mt-2">
                  <p className="text-[11px] font-sans text-rose-800 dark:text-rose-300 leading-snug">
                    All subcategory tags assigned under this category will also be removed.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
              <button 
                type="button"
                onClick={closeModal} 
                className="px-3.5 py-1.5 rounded-md text-xs font-sans font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button 
                type="button"
                onClick={confirmDelete} 
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-sans font-semibold tracking-wide shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                Delete {isSubDelete ? "Tag" : "Category"}
              </button>
            </div>
          </div>
        ) : (
          /* CREATE / EDIT / MERGE STATE */
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                {isMerge && (
                  <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                    <Merge size={16} />
                  </div>
                )}
                <div>
                  <h3 className="text-base sm:text-lg font-serif tracking-tight text-slate-900 dark:text-white leading-tight">
                    {isMerge ? (
                      <>
                        Merge{" "}
                        <span className="italic font-normal text-emerald-800 dark:text-emerald-400">
                          {selectedCount} Categories
                        </span>
                      </>
                    ) : modalMode === 'edit' ? (
                      <>
                        Edit{" "}
                        <span className="italic font-normal text-emerald-800 dark:text-emerald-400">
                          Category
                        </span>
                      </>
                    ) : (
                      <>
                        New{" "}
                        <span className="italic font-normal text-emerald-800 dark:text-emerald-400">
                          Category
                        </span>
                      </>
                    )}
                  </h3>
                  <p className="text-[11px] font-sans text-slate-400 mt-0.5">
                    {isMerge 
                      ? "Combine selected items into a single category" 
                      : "Set category name and tag color"}
                  </p>
                </div>
              </div>

              <button 
                type="button"
                onClick={closeModal} 
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 pt-1">
              {/* Category Name Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                  {isMerge ? "Merged Category Name" : "Category Name"}
                </label>
                <input 
                  autoFocus 
                  type="text"
                  value={catName} 
                  onChange={e => setCatName(e.target.value)} 
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAction();
                    if (e.key === 'Escape') closeModal();
                  }}
                  placeholder={isMerge ? "e.g. Subscriptions & Bills" : "e.g. Groceries"}
                  className="w-full bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-sans text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors placeholder:text-slate-400" 
                />
              </div>

              {/* Color Picker Row */}
              <div className="space-y-1">
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                  Accent Color
                </label>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10">
                  <div className="relative w-7 h-7 rounded overflow-hidden shrink-0 border border-slate-300 dark:border-white/20 shadow-2xs cursor-pointer">
                    <input 
                      type="color" 
                      value={catColor} 
                      onChange={e => setCatColor(e.target.value)} 
                      className="absolute -top-3 -left-3 w-14 h-14 cursor-pointer border-none p-0 bg-transparent" 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: catColor }} 
                    />
                    <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300 uppercase">
                      {catColor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
                <button 
                  type="button"
                  onClick={closeModal} 
                  className="px-3.5 py-1.5 rounded-md text-xs font-sans font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button 
                  type="button"
                  onClick={handleAction} 
                  disabled={!catName.trim()}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-white rounded-md text-xs font-sans font-semibold tracking-wide transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs ${
                    isMerge 
                      ? 'bg-indigo-600 hover:bg-indigo-700' 
                      : 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                  }`}
                >
                  <CheckCircle2 size={13} strokeWidth={2.4} />
                  <span>{isMerge ? "Confirm Merge" : modalMode === 'edit' ? "Save Changes" : "Create Category"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryModal;