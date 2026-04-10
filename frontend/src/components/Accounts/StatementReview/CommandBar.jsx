import React from 'react';
import { Trash2, Loader2, FileDown, AlertCircle, CheckCircle2 } from 'lucide-react';

const CommandBar = ({ 
  visible, 
  checkedCount, 
  totalCount, 
  pendingAccounts, 
  pendingArns, 
  progressPercent, 
  onReset, 
  onFinalize, 
  isFinalizing 
}) => {
  if (!visible) return null;
  const isEverythingChecked = totalCount > 0 && checkedCount >= totalCount;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-60 bg-white dark:bg-[#0B0C0E] border-t border-slate-200 dark:border-white/10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)]">
      <div className="max-w-400 mx-auto px-8 h-20 flex items-center justify-between">
        
        {/* LEFT: RESET */}
        <div className="flex items-center gap-4 w-1/5">
          <button 
            onClick={onReset} 
            className="group flex items-center gap-3 px-5 py-2.5 border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-500/5 text-rose-600 hover:bg-rose-600 hover:text-white transition-all rounded-sm"
          >
            <Trash2 size={16} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">Reset Batch</span>
          </button>
        </div>

        {/* CENTER: CONTEXTUAL PROGRESS */}
        <div className="flex-1 max-w-4xl flex items-center gap-12">
          
          {/* MILESTONE CLUSTER */}
          <div className="flex items-center gap-8 border-r border-slate-200 dark:border-white/5 pr-12">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Queue</span>
              <span className="text-xl font-black tabular-nums tracking-tighter">
                {checkedCount}<span className="text-slate-300 dark:text-slate-700">/</span>{totalCount}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Accounts Left</span>
              <span className={`text-xl font-black tabular-nums tracking-tighter transition-colors ${pendingAccounts === 0 ? 'text-emerald-500' : ''}`}>
                {pendingAccounts}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Entities Left</span>
              <span className={`text-xl font-black tabular-nums tracking-tighter transition-colors ${pendingArns === 0 ? 'text-emerald-500' : ''}`}>
                {pendingArns}
              </span>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden ring-1 ring-inset ring-black/5">
              <div 
                className="h-full bg-emerald-600 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
            <div className="flex justify-between items-center">
               <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">
                 {isEverythingChecked ? "Batch Verified" : "Verification in progress..."}
               </span>
               <span className="text-[10px] font-black text-emerald-600 tabular-nums">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* RIGHT: EXPORT */}
        <div className="flex items-center justify-end gap-6 w-1/5">
          <button 
            onClick={onFinalize} 
            disabled={!isEverythingChecked || isFinalizing}
            className={`group px-10 h-12 font-black uppercase text-[11px] tracking-[0.2em] rounded-sm transition-all flex items-center gap-3 active:translate-y-0.5
              ${isEverythingChecked 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-600/20' 
                : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-700 cursor-not-allowed border border-slate-200 dark:border-white/5'}`}
          >
            {isFinalizing ? (
              <Loader2 className="animate-spin" size={16} />
            ) : isEverythingChecked ? (
              <FileDown size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {isEverythingChecked ? 'Export Tally XML' : 'Verification Required'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CommandBar;