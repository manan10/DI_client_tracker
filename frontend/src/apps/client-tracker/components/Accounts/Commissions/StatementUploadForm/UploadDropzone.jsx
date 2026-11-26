import React from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Trash2,
  Loader2,
  Activity,
  FileText,
} from "lucide-react";

const UploadDropzone = ({
  fileInputRef,
  selectedFiles = [],
  onFileSelect,
  onRemoveFile,
  onProcess,
  isProcessing,
  onDiscard,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-5 animate-in fade-in duration-200">
      {/* 1. Drag & Drop Surface */}
      <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 rounded-lg p-8 sm:p-11 text-center transition-colors bg-white dark:bg-[#161B26] group cursor-pointer">
        <input
          type="file"
          multiple
          accept=".csv, .xls, .xlsx, .txt"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          ref={fileInputRef}
          onClick={(e) => {
            e.target.value = null;
          }}
          onChange={onFileSelect}
        />

        <div className="flex flex-col items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3.5 border border-sky-200/70 dark:border-sky-500/20 group-hover:-translate-y-0.5 transition-transform duration-200">
            <UploadCloud size={24} strokeWidth={2} />
          </div>

          <h3 className="sora-font text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Drop Bank Statements Here
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
            Upload CSV, Excel, or TXT bank statements to extract credit entries and match them to AMCs.
          </p>

          <div className="flex items-center gap-2 mt-4">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-100 dark:bg-[#1C2230] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              CSV
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-100 dark:bg-[#1C2230] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              XLSX / XLS
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-100 dark:bg-[#1C2230] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              TXT
            </span>
          </div>
        </div>
      </div>

      {/* 2. Selected Files Queue */}
      {selectedFiles.length > 0 && (
        <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FileText
                size={15}
                className="text-sky-600 dark:text-sky-400"
              />
              <h4 className="sora-font text-xs font-bold text-slate-800 dark:text-slate-200">
                Selected Files ({selectedFiles.length})
              </h4>
            </div>

            <button
              type="button"
              onClick={onDiscard}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline transition-colors cursor-pointer"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-md bg-slate-50/70 dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div className="w-8 h-8 rounded-md bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-200/70 dark:border-sky-500/20">
                    <FileSpreadsheet size={15} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate block">
                      {file.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 block">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveFile(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors shrink-0 cursor-pointer"
                  title="Remove file"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onProcess();
            }}
            disabled={isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold tracking-wide active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Extracting Entries...</span>
              </>
            ) : (
              <>
                <Activity size={15} />
                <span>Extract Entries</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadDropzone;