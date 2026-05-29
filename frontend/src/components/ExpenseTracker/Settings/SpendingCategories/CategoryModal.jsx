import React from "react";
import { X, ShieldAlert, Merge, CheckCircle2 } from "lucide-react";

const CategoryModal = ({ 
  modalMode, closeModal, catName, setCatName, catColor, 
  setCatColor, handleAction, confirmDelete, editTarget, selectedCount
}) => {
  if (!modalMode) return null;

  const isDelete = modalMode === 'delete';
  const isMerge = modalMode === 'merge';
  const isSubDelete = editTarget?.type === 'sub';

  return (
    <div className="fixed inset-0 z-150 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal} />
      
      <div className="relative w-full sm:max-w-md bg-white dark:bg-[#0B1120] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[85vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] text-left">
        
        <div className="w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6 sm:hidden" />
        
        {isDelete ? (
          <div className="text-center space-y-6 pt-2">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h3 className="text-xl font-[1000] uppercase italic tracking-tight text-slate-900 dark:text-white">
                {isSubDelete ? 'Remove Sub-Category?' : 'Delete Category?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-3">
                Target: <span className="text-slate-900 dark:text-white">{editTarget?.label}</span>
              </p>
              {!isSubDelete && (
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mt-2 px-4 leading-relaxed">
                  Warning: This action will permanently destroy all nested sub-categories.
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer">Abort</button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer">Confirm Purge</button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic flex items-center gap-2">
                  {isMerge && <Merge size={20} className="text-indigo-500" />}
                  {isMerge ? `Merge ${selectedCount} Items` : modalMode === 'edit' ? 'Update Category' : 'New Category'}
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Classification Settings</p>
              </div>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full bg-slate-50 dark:bg-slate-800 transition-colors">
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {isMerge ? 'New Master Label' : 'Category Label'}
                </label>
                <input 
                  autoFocus 
                  value={catName} 
                  onChange={e => setCatName(e.target.value)} 
                  placeholder={isMerge ? "e.g. Subscriptions" : "Identity Label"}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all placeholder:text-slate-400" 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Identifier</label>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer">
                    <input 
                      type="color" 
                      value={catColor} 
                      onChange={e => setCatColor(e.target.value)} 
                      className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-none p-0 bg-transparent" 
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">{catColor}</span>
                </div>
              </div>

              <button 
                onClick={handleAction} 
                className={`w-full mt-2 py-4 ${isMerge ? 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'} text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2`}
              >
                <CheckCircle2 size={16} strokeWidth={2.5} />
                {isMerge ? 'Execute Merge' : 'Save Configuration'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryModal;