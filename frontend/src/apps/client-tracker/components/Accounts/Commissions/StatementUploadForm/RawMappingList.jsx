import React from 'react';
import { Sparkles, AlertCircle, X, Layers, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import MappingRow from './MappingRow';

const RawMappingList = ({ 
  extractedResults = [], 
  sortedAmcList = [], 
  onUpdateMapping, 
  onToggleExclude, 
  onDiscard, 
  onMergePreview 
}) => {
  const activeResults = extractedResults.filter(r => !r.isExcluded);
  const unmappedCount = activeResults.filter(r => !r.amcName).length;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in duration-200 pb-20">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1 border border-emerald-500/20 shadow-2xs">
          <Sparkles size={22} className="animate-pulse" />
        </div>
        <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
          Receipts Extracted ({extractedResults.length})
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
          Map each credit item to its registered mutual fund house or exclude non-commission payments before merging.
        </p>

        {unmappedCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-xs font-mono font-bold mt-2">
            <AlertCircle size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{unmappedCount} active receipt{unmappedCount > 1 ? 's' : ''} require AMC mapping</span>
          </div>
        )}
      </div>

      {/* 2. Interactive Mapping Row Grid */}
      <div className="space-y-3">
        {extractedResults.map((result, idx) => (
          <MappingRow 
            key={idx}
            idx={idx}
            result={result}
            sortedAmcList={sortedAmcList}
            onUpdateMapping={onUpdateMapping}
            onToggleExclude={onToggleExclude}
          />
        ))}
      </div>

      {/* 3. Action Deck Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-white/10 grid grid-cols-3 gap-3">
        <button 
          type="button"
          onClick={onDiscard} 
          className="col-span-1 py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <X size={15} /> Discard
        </button>

        <button 
          type="button"
          onClick={onMergePreview}
          disabled={unmappedCount > 0 || activeResults.length === 0}
          className="col-span-2 py-3 px-6 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-emerald-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed cursor-pointer"
        >
          <Layers size={15} />
          <span>Merge & Preview</span>
          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
};

export default RawMappingList;