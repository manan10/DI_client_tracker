import React from 'react';
import { Sparkles, AlertCircle, X, Layers, ArrowRight } from 'lucide-react';
import MappingRow from './MappingRow';

const RawMappingList = ({ 
  extractedResults, 
  sortedAmcList, 
  onUpdateMapping, 
  onToggleExclude, 
  onDiscard, 
  onMergePreview 
}) => {
  const activeResults = extractedResults.filter(r => !r.isExcluded);
  const unmappedCount = activeResults.filter(r => !r.amcName).length;

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-[#010413]">
      {/* SCROLLABLE LIST AREA */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 flex flex-col max-w-4xl mx-auto w-full relative z-10">
        <div className="flex flex-col items-center text-center gap-2 mt-2 mb-6 shrink-0">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-1 shadow-sm ring-4 ring-emerald-500/20">
            <Sparkles size={28} className="animate-pulse" />
          </div>
          <h3 className="text-xl font-[1000] text-slate-800 dark:text-white uppercase italic tracking-tight">Receipts Extracted</h3>
          <p className="text-xs text-slate-500 font-medium max-w-[300px]">Map unmapped items or exclude non-commission receipts.</p>
          
          {unmappedCount > 0 && (
            <div className="flex items-center gap-2 mt-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse border border-amber-200 dark:border-amber-500/30">
              <AlertCircle size={14} />
              {unmappedCount} active payout(s) require manual mapping.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 pb-24">
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
      </div>

      {/* FIXED FOOTER */}
      <div className="shrink-0 p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-30">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-3">
          <button 
            type="button"
            onClick={onDiscard} 
            className="col-span-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-100 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-500/20 py-4 rounded-xl font-[1000] uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2"
          >
            <X size={16} /> Discard
          </button>
          <button 
            type="button"
            onClick={onMergePreview}
            disabled={unmappedCount > 0 || activeResults.length === 0}
            className="col-span-2 bg-emerald-600 text-white py-4 rounded-xl font-[1000] uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-emerald-500 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
            <Layers size={16} /> Merge & Preview <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RawMappingList;