import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FileSpreadsheet, 
  FileText, 
  Loader2, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  UploadCloud,
  FileCode2
} from 'lucide-react';

const SyncStep = ({ selection, onUpload, isProcessing }) => {
  
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt']
    },
    multiple: false,
    disabled: isProcessing
  });

  return (
    <div className="flex h-full w-full bg-white dark:bg-[#050607] overflow-hidden border-t border-slate-100 dark:border-white/5 animate-in fade-in duration-500">
      
      {/* 1. LEFT PANEL: USER GUIDANCE */}
      <aside className="w-80 bg-slate-50/50 dark:bg-white/2 border-r border-slate-100 dark:border-white/5 p-10 flex flex-col shrink-0">
        <div className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
              Upload <span className="text-emerald-500">Statement</span>
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 leading-tight">Bank Statement Import</p>
          </div>

          <div className="space-y-6">
            <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Security Note</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                Your data is encrypted immediately. We only read the transactions to match them with Tally.
              </p>
            </div>

            <div className="space-y-4">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Selected Bank Book</p>
               <div className="flex items-center gap-3 p-4 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="text-[11px] font-[1000] text-slate-900 dark:text-white uppercase italic truncate">
                    {selection.account?.name || "No Account Selected"}
                  </span>
               </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE: THE SMART DROPZONE */}
      <section className="flex-1 flex flex-col items-center justify-center p-12 bg-white dark:bg-transparent relative">
        <div 
          {...getRootProps()} 
          className={`w-full max-w-2xl aspect-16/10 border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center transition-all duration-500 cursor-pointer group relative overflow-hidden
            ${isDragActive ? 'border-emerald-500 bg-emerald-500/5 scale-[1.01]' : 'border-slate-100 dark:border-white/5 bg-slate-50/40 hover:border-slate-200 hover:bg-slate-50/80'}
            ${isProcessing ? 'pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />

          {isProcessing ? (
            <div className="flex flex-col items-center gap-6">
              <Loader2 size={56} className="text-emerald-500 animate-spin" strokeWidth={1.5} />
              <div className="text-center space-y-2">
                <h4 className="text-2xl font-[1000] uppercase italic tracking-tighter text-slate-900 dark:text-white">Reading Document...</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Matching Transactions with Tally</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center px-12">
              <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center mb-8 transition-all duration-500 
                ${isDragActive ? 'bg-emerald-500 text-white shadow-2xl' : 'bg-white dark:bg-white/5 text-slate-300 group-hover:text-emerald-500 group-hover:shadow-xl group-hover:-translate-y-2'}`}>
                <UploadCloud size={48} strokeWidth={1} />
              </div>
              <div className="space-y-4">
                <h4 className="text-4xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                  {isDragActive ? "Ready to Read" : "Drop Statement"}
                </h4>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] leading-relaxed max-w-xs mx-auto">
                  Select your <span className="text-emerald-500">Excel, CSV</span>, or Text file to begin.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* REFINED FORMAT LABELS (Non-Technical) */}
        <div className="mt-16 flex items-center gap-12">
           <div className="flex flex-col items-center gap-3 group/item">
             <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-600 transition-colors group-hover/item:bg-emerald-500 group-hover/item:text-white">
               <FileSpreadsheet size={22} />
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/item:text-slate-900">Excel Book</span>
           </div>
           
           <div className="flex flex-col items-center gap-3 group/item">
             <div className="w-12 h-12 rounded-2xl bg-blue-500/5 flex items-center justify-center text-blue-600 transition-colors group-hover/item:bg-blue-500 group-hover/item:text-white">
               <FileCode2 size={22} />
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/item:text-slate-900">Data File (CSV)</span>
           </div>

           <div className="flex flex-col items-center gap-3 group/item">
             <div className="w-12 h-12 rounded-2xl bg-amber-500/5 flex items-center justify-center text-amber-600 transition-colors group-hover/item:bg-amber-500 group-hover/item:text-white">
               <FileText size={22} />
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/item:text-slate-900">Text Export</span>
           </div>
        </div>
      </section>
    </div>
  );
};

export default SyncStep;