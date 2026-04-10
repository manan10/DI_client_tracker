import React from 'react';
import { Briefcase, EyeOff, Eye } from 'lucide-react';

const WorkbenchHeader = ({ activeArn, checkedCount, totalCount, progressPercent, hideChecked, setHideChecked }) => (
  <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#050607]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 px-8 py-4 flex justify-between items-center">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 flex items-center justify-center rounded-sm border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
        <Briefcase size={18} />
      </div>
      <div>
        <h2 className="text-sm font-bold uppercase tracking-tight leading-none mb-1">{activeArn?.nickname || "Auditing"}</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{activeArn?.arnCode}</p>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <button 
        onClick={() => setHideChecked(!hideChecked)}
        className={`p-2 rounded transition-all border ${hideChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 text-slate-300 hover:text-slate-500'}`}
        title={hideChecked ? "Showing Unchecked" : "Filter Checked"}
      >
        {hideChecked ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
      <div className="text-right border-l border-slate-100 dark:border-white/5 pl-6">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Session Data Progress</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tabular-nums">{checkedCount} / {totalCount}</span>
          <div className="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded shadow-lg shadow-emerald-600/20">{progressPercent}%</div>
        </div>
      </div>
    </div>
  </header>
);

export default WorkbenchHeader;