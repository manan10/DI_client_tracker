// src/components/Operations/Submissions/CommandHeader.jsx
import React from 'react';
import { Activity, Inbox, CheckCircle, Search, Plus } from 'lucide-react';

const CommandHeader = ({ viewMode, setViewMode, searchTerm, setSearchTerm, onNewClick }) => {
  return (
    <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-4 md:gap-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-white/10">
      <div className="space-y-2 md:space-y-3">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 md:p-2.5 bg-emerald-500/15 rounded-md border border-emerald-500/20 shadow-inner">
            <Activity size={18} className="text-emerald-600 dark:text-emerald-400 md:w-5 md:h-5" />
          </div>
          <div className="h-8 w-px bg-slate-300 dark:bg-white/10 hidden md:block" />
          <div>
            <h2 className="text-xl md:text-2xl uppercase tracking-tight bg-linear-to-r from-slate-900 via-slate-800 to-emerald-700 dark:from-white dark:via-slate-200 dark:to-emerald-400 bg-clip-text text-transparent">
              Submissions <span className="text-emerald-600 dark:text-emerald-500">Desk</span>
            </h2>
            <div className="flex items-center gap-1.5 md:gap-2 mt-1.5">
              <div className={`w-1.5 h-1.5 rounded-sm animate-pulse ${viewMode === 'ACTIVE' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Client Ops / {viewMode === 'ACTIVE' ? 'Pending Submissions' : 'Hostorical Submissions'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        {/* SEGMENTED VIEW TOGGLE */}
        <div className="inline-flex p-1 bg-slate-200/50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-white/5 h-10 md:h-11">
          <button 
            onClick={() => setViewMode('ACTIVE')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 rounded text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
              viewMode === 'ACTIVE' 
              ? 'bg-white dark:bg-[#0B1120] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-white/10' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Inbox size={14} /> Active
          </button>
          <button 
            onClick={() => setViewMode('FINALIZED')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 rounded text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
              viewMode === 'FINALIZED' 
              ? 'bg-white dark:bg-[#0B1120] text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-white/10' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <CheckCircle size={14} /> Historical
          </button>
        </div>

        {/* SEARCH & ADD GROUP */}
        <div className="flex items-center gap-2 h-10 md:h-11">
          <div className="relative flex-1 sm:w-64 h-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search (Client, Folio...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-full pl-9 pr-4 bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-white/10 rounded-md text-[11px] font-bold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all uppercase tracking-tight text-slate-900 dark:text-white"
            />
          </div>
          <button 
            onClick={onNewClick}
            className="h-full flex items-center justify-center gap-2 px-4 md:px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-[1000] uppercase tracking-widest transition-all shadow-sm shrink-0 outline-none"
          >
            <Plus size={16} strokeWidth={3} />
            <span className="hidden sm:inline text-nowrap">New Submission</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommandHeader;