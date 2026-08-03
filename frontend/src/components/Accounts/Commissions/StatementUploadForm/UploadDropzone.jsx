import React from 'react';
import { UploadCloud, FileSpreadsheet, Trash2, Loader2, Activity, FileText } from 'lucide-react';

const UploadDropzone = ({
  fileInputRef,
  selectedFiles,
  onFileSelect,
  onRemoveFile,
  onProcess,
  isProcessing,
  onDiscard
}) => {
  return (
    <div className="w-full h-full flex flex-col animate-in fade-in zoom-in-95 p-4 sm:p-6 lg:p-10">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
        
        {/* Dropzone Area */}
        <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-white dark:bg-slate-900/50">
          <input 
            type="file" 
            multiple 
            accept=".csv, .xls, .xlsx, .txt" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            ref={fileInputRef}
            onClick={(e) => { e.target.value = null; }}
            onChange={onFileSelect}
          />
          <div className="flex flex-col items-center justify-center text-center p-12 sm:p-20 relative pointer-events-none">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300 shadow-sm">
              <UploadCloud size={36} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-[1000] text-slate-800 dark:text-white mb-2 tracking-tight">Drop Bank Statements</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Upload CSV, Excel, or TXT statements. Our engine will extract and prepare ledgers for merge mapping.
            </p>
          </div>
        </div>

        {/* Selected Files Queue */}
        {selectedFiles.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-4 px-1">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <FileText size={14} /> Ready to Extract ({selectedFiles.length})
              </h4>
              <button 
                type="button" 
                onClick={onDiscard}
                className="text-[10px] uppercase tracking-wider text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-500/10 px-2 py-1 rounded transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {selectedFiles.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center rounded-lg shrink-0">
                      <FileSpreadsheet size={16} />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 truncate pr-4">{f.name}</span>
                  </div>
                  <button type="button" onClick={() => onRemoveFile(idx)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg shrink-0 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); onProcess(); }}
              disabled={isProcessing}
              className="mt-5 w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-[1000] uppercase text-[11px] tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:bg-blue-500 active:scale-[0.98] transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:grayscale"
            >
              {isProcessing ? (
                <><Loader2 size={18} className="animate-spin" /> Running Matcher Engine...</>
              ) : (
                <><Activity size={18} /> Process & Extract Ledgers</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadDropzone;