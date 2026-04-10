import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

const ResetModal = ({ onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-100 flex items-end justify-center bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
    <div 
      className="w-full max-w-2xl bg-white dark:bg-[#0B0C0E] border-t-4 border-rose-600 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.5)] p-8 rounded-t-xl animate-in slide-in-from-bottom duration-500"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-full text-rose-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold uppercase tracking-tight text-slate-900 dark:text-white leading-none mb-2">
              Purge Session Data?
            </h4>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider leading-relaxed">
              This will permanently delete the current synchronized batch for all entities. <br/>
              <span className="text-rose-600 font-bold">This action cannot be undone.</span>
            </p>
          </div>
        </div>
        <button 
          onClick={onCancel} 
          className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={onConfirm} 
          className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-sm transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          <Trash2 size={16} /> Confirm Data Purge
        </button>
        <button 
          onClick={onCancel} 
          className="px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
        >
          Keep Data
        </button>
      </div>
    </div>
  </div>
);

export default ResetModal;