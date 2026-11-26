import React from "react";
import { Sparkles, AlertCircle, X, Layers, ArrowRight } from "lucide-react";
import MappingRow from "./MappingRow";

const RawMappingList = ({
  extractedResults = [],
  sortedAmcList = [],
  onUpdateMapping,
  onToggleExclude,
  onDiscard,
  onMergePreview,
}) => {
  const activeResults = extractedResults.filter((r) => !r.isExcluded);
  const unmappedCount = activeResults.filter((r) => !r.amcName).length;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-5 animate-in fade-in duration-200 pb-20">
      {/* 1. Header Banner */}
      <div className="flex flex-col items-center text-center gap-1.5">
        <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-1 border border-sky-200/70 dark:border-sky-500/20">
          <Sparkles size={19} />
        </div>
        <h3 className="sora-font text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Extracted{" "}
          <span className="font-normal text-sky-600 dark:text-sky-300">
            Entries ({extractedResults.length})
          </span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
          Match each bank credit to its mutual fund house, or exclude non-commission entries before merging.
        </p>

        {unmappedCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-xs font-medium mt-2">
            <AlertCircle
              size={14}
              className="shrink-0 text-amber-600 dark:text-amber-400"
            />
            <span>
              {unmappedCount} {unmappedCount > 1 ? "entries need" : "entry needs"}{" "}
              an AMC selected
            </span>
          </div>
        )}
      </div>

      {/* 2. Mapping Rows */}
      <div className="space-y-2.5">
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

      {/* 3. Action Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={onDiscard}
          className="col-span-1 py-2.5 px-4 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200/80 dark:border-rose-500/25 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <X size={14} /> Discard
        </button>

        <button
          type="button"
          onClick={onMergePreview}
          disabled={unmappedCount > 0 || activeResults.length === 0}
          className="col-span-2 py-2.5 px-6 rounded-lg text-xs font-semibold tracking-wide bg-sky-600 hover:bg-sky-500 text-white active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Layers size={14} />
          <span>Merge & Preview</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default RawMappingList;