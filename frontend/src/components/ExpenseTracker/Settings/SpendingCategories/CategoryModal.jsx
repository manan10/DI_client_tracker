import React from "react";
import { X, ShieldAlert, Palette, Merge } from "lucide-react";

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
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={closeModal} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 text-left">
        
        {isDelete ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase italic leading-none dark:text-white">
                {isSubDelete ? 'Remove Class?' : 'Authorize Purge?'}
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mt-2 px-4">
                Target: <span className="text-slate-900 dark:text-white">{editTarget?.label}</span>
                {!isSubDelete && <span className="block text-[9px] text-rose-500 mt-1 italic">Warning: This deletes all nested items.</span>}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase dark:text-white cursor-pointer hover:bg-slate-200 transition-colors">Abort</button>
              <button onClick={confirmDelete} className="flex-1 py-3.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95 cursor-pointer">Confirm</button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {isMerge && <Merge size={18} className="text-indigo-500" />}
                <h3 className="text-lg font-black uppercase tracking-tighter italic">
                  {isMerge ? `Merge ${selectedCount} Items` : modalMode === 'edit' ? 'Update Category' : 'New Category'}
                </h3>
              </div>
              <X size={20} className="text-slate-400 cursor-pointer" onClick={closeModal} />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                  {isMerge ? 'New Parent Name' : 'Label'}
                </label>
                <input 
                  autoFocus 
                  value={catName} 
                  onChange={e => setCatName(e.target.value)} 
                  placeholder={isMerge ? "e.g. Subscriptions" : "Identity Label"}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase outline-none focus:border-indigo-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Color Theme</label>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input 
                    type="color" 
                    value={catColor} 
                    onChange={e => setCatColor(e.target.value)} 
                    className="w-10 h-10 rounded-md cursor-pointer border-none bg-transparent" 
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{catColor}</span>
                </div>
              </div>
              <button 
                onClick={handleAction} 
                className={`w-full py-4 ${isMerge ? 'bg-indigo-600 shadow-indigo-500/20' : 'bg-emerald-600 shadow-emerald-500/20'} text-white rounded-lg text-[11px] font-black uppercase tracking-[0.2em] shadow-lg cursor-pointer transition-all active:scale-95`}
              >
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