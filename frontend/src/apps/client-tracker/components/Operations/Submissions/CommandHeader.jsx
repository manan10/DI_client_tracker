// src/components/Operations/Submissions/CommandHeader.jsx
import React from 'react';
import { Inbox, CheckCircle, Search, Plus } from 'lucide-react';
import TabHeader from '../../../../../shared/components/TabHeader';

const CommandHeader = ({ viewMode, setViewMode, searchTerm, setSearchTerm, onNewClick }) => {
  return (
    <div className="space-y-5">
      <TabHeader
        kicker={`Client Ops • ${viewMode === 'ACTIVE' ? 'Pending Submissions' : 'Historical Submissions'}`}
        title="Submissions"
        accent="Desk"
        description="Track active client transaction submissions, RTA references, and settled history."
        actions={
          <button
            onClick={onNewClick}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 outline-none cursor-pointer select-none shrink-0 bg-sky-600 hover:bg-sky-500 text-white active:scale-[0.99]"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span className="text-nowrap">New Submission</span>
          </button>
        }
      />

      {/* TOOLBAR: VIEW TOGGLE & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* SEGMENTED VIEW TOGGLE */}
        <div className="inline-flex items-center bg-slate-100/90 dark:bg-[#161B26] p-1 rounded-lg border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setViewMode('ACTIVE')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              viewMode === 'ACTIVE'
                ? 'bg-white dark:bg-[#1C2230] text-sky-600 dark:text-sky-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Inbox size={13} strokeWidth={2.2} />
            <span>Active</span>
          </button>
          <button
            onClick={() => setViewMode('FINALIZED')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              viewMode === 'FINALIZED'
                ? 'bg-white dark:bg-[#1C2230] text-sky-600 dark:text-sky-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle size={13} strokeWidth={2.2} />
            <span>Historical</span>
          </button>
        </div>

        {/* SEARCH INPUT */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search client, PAN, folio, RTA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default CommandHeader;