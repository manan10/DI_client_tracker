import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FileSpreadsheet, 
  FileText, 
  Loader2, 
  ShieldCheck, 
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
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#050607] overflow-y-auto lg:overflow-hidden border-t border-slate-100 dark:border-white/5 animate-in fade-in duration-500 no-scrollbar">
        
        {/* 1. LEFT PANEL / MOBILE TOP HEADER: USER GUIDANCE */}
        <aside className="w-full lg:w-80 bg-slate-50/50 dark:bg-white/2 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-white/5 p-4 lg:p-10 flex flex-col shrink-0">
          <div className="space-y-4 lg:space-y-8">
            <div className="space-y-1 lg:space-y-2 flex flex-row lg:flex-col justify-between items-center lg:items-start">
              <div>
                <h3 className="text-xl lg:text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                  Upload <span className="text-emerald-500">Statement</span>
                </h3>
                <p className="hidden lg:block text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 leading-tight">Bank Statement Import</p>
              </div>
              
              {/* Mobile-only condensed selected bank pill */}
              <div className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 max-w-35">
                <CheckCircle2 size={10} className="text-emerald-600 shrink-0" />
                <span className="text-[8px] font-black text-emerald-700 dark:text-emerald-500 uppercase tracking-widest truncate">
                   {selection.account?.name || "No Account"}
                </span>
              </div>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="p-3 lg:p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl lg:rounded-2xl">
                <div className="flex items-center gap-2 lg:gap-3 mb-1.5 lg:mb-2">
                  <ShieldCheck size={14} className="text-emerald-500 lg:w-4 lg:h-4" />
                  <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Security Note</span>
                </div>
                <p className="text-[8px] lg:text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                  Your data is encrypted immediately. We only read the transactions to match them with Tally.
                </p>
              </div>

              {/* Desktop-only expanded selected bank card */}
              <div className="hidden lg:block space-y-4">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Selected Bank Book</p>
                 <div className="flex items-center gap-3 p-4 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
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
        <section className="flex-1 flex flex-col items-center justify-center p-4 lg:p-12 bg-white dark:bg-transparent relative min-h-87.5 lg:min-h-0">
          <div 
            {...getRootProps()} 
            className={`w-full max-w-2xl py-12 lg:py-0 lg:aspect-16/10 border-2 lg:border-4 border-dashed rounded-3xl lg:rounded-[3rem] flex flex-col items-center justify-center transition-all duration-500 cursor-pointer group relative overflow-hidden px-4 text-center
              ${isDragActive ? 'border-emerald-500 bg-emerald-500/5 scale-[1.01]' : 'border-slate-200 dark:border-white/5 bg-slate-50/40 hover:border-slate-300 lg:hover:border-slate-200 hover:bg-slate-50/80'}
              ${isProcessing ? 'pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />

            {isProcessing ? (
              <div className="flex flex-col items-center gap-4 lg:gap-6">
                <Loader2 size={40} className="text-emerald-500 animate-spin lg:w-14 lg:h-14" strokeWidth={1.5} />
                <div className="text-center space-y-1.5 lg:space-y-2">
                  <h4 className="text-lg lg:text-2xl font-[1000] uppercase italic tracking-tighter text-slate-900 dark:text-white">Reading Document...</h4>
                  <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] lg:tracking-[0.4em] animate-pulse">Matching Transactions with Tally</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 lg:w-28 lg:h-28 rounded-2xl lg:rounded-[2.5rem] flex items-center justify-center mb-4 lg:mb-8 transition-all duration-500 
                  ${isDragActive ? 'bg-emerald-500 text-white shadow-xl lg:shadow-2xl' : 'bg-white dark:bg-white/5 text-slate-300 group-hover:text-emerald-500 shadow-sm lg:shadow-none lg:group-hover:shadow-xl group-hover:-translate-y-1 lg:group-hover:-translate-y-2'}`}>
                  <UploadCloud size={32} className="lg:w-12 lg:h-12" strokeWidth={1} />
                </div>
                <div className="space-y-2 lg:space-y-4">
                  <h4 className="text-2xl lg:text-4xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                    {isDragActive ? "Ready to Read" : "Drop Statement"}
                  </h4>
                  <p className="text-[9px] lg:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] lg:tracking-[0.3em] leading-relaxed max-w-50 lg:max-w-xs mx-auto">
                    Select your <span className="text-emerald-500">Excel, CSV</span>, or Text file to begin.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* REFINED FORMAT LABELS - Wrapped for Mobile */}
          <div className="mt-8 lg:mt-16 flex items-center justify-center gap-4 lg:gap-12 flex-wrap max-w-sm lg:max-w-none">
             <div className="flex flex-col items-center gap-2 lg:gap-3 group/item">
               <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-600 transition-colors lg:group-hover/item:bg-emerald-500 lg:group-hover/item:text-white">
                 <FileSpreadsheet size={18} className="lg:w-5.5 lg:h-5.5" />
               </div>
               <span className="text-[7px] lg:text-[9px] font-black uppercase tracking-widest text-slate-400 lg:group-hover/item:text-slate-900">Excel Book</span>
             </div>
             
             <div className="flex flex-col items-center gap-2 lg:gap-3 group/item">
               <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-blue-500/5 flex items-center justify-center text-blue-600 transition-colors lg:group-hover/item:bg-blue-500 lg:group-hover/item:text-white">
                 <FileCode2 size={18} className="lg:w-5.5 lg:h-5.5" />
               </div>
               <span className="text-[7px] lg:text-[9px] font-black uppercase tracking-widest text-slate-400 lg:group-hover/item:text-slate-900">Data File (CSV)</span>
             </div>

             <div className="flex flex-col items-center gap-2 lg:gap-3 group/item">
               <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-amber-500/5 flex items-center justify-center text-amber-600 transition-colors lg:group-hover/item:bg-amber-500 lg:group-hover/item:text-white">
                 <FileText size={18} className="lg:w-5.5 lg:h-5.5" />
               </div>
               <span className="text-[7px] lg:text-[9px] font-black uppercase tracking-widest text-slate-400 lg:group-hover/item:text-slate-900">Text Export</span>
             </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SyncStep;