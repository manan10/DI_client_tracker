import React from 'react';
import { UploadCloud, FileSpreadsheet, Trash2, Loader2, Activity, FileText, Sparkles, AlertCircle } from 'lucide-react';

const UploadDropzone = ({
  fileInputRef,
  selectedFiles = [],
  onFileSelect,
  onRemoveFile,
  onProcess,
  isProcessing,
  onDiscard
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 animate-in fade-in duration-200">
      
      {/* 1. Drag & Drop Surface */}
      <div className="relative border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-2xl p-8 sm:p-12 text-center transition-all bg-white dark:bg-[#0B1120] shadow-xs group cursor-pointer">
        <input 
          type="file" 
          multiple 
          accept=".csv, .xls, .xlsx, .txt" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
          ref={fileInputRef}
          onClick={(e) => { e.target.value = null; }}
          onChange={onFileSelect}
        />

        <div className="flex flex-col items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-200/80 dark:border-emerald-500/20 shadow-2xs group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300">
            <UploadCloud size={30} strokeWidth={2.2} />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Drop Bank Statements Here
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 leading-relaxed">
            Upload CSV, Excel, or TXT bank statements. The extraction engine will auto-detect credit entries and prepare them for ledger mapping.
          </p>

          <div className="flex items-center gap-2 mt-4">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
              CSV
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
              XLSX / XLS
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
              TXT
            </span>
          </div>
        </div>
      </div>

      {/* 2. Selected Files Queue */}
      {selectedFiles.length > 0 && (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-xs space-y-4 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Staged Source Statements ({selectedFiles.length})
              </h4>
            </div>

            <button 
              type="button" 
              onClick={onDiscard}
              className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
            >
              Clear Queue
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
            {selectedFiles.map((file, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50/70 dark:bg-white/2 border border-slate-200/70 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div className="w-8 h-8 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <FileSpreadsheet size={15} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate block">
                      {file.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={() => onRemoveFile(idx)} 
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors shrink-0 cursor-pointer"
                  title="Remove statement"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); onProcess(); }}
            disabled={isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-emerald-600/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:grayscale cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Running Matcher Engine...</span>
              </>
            ) : (
              <>
                <Activity size={16} />
                <span>Process & Extract Statements</span>
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
};

export default UploadDropzone;