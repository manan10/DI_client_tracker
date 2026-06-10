import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FileSpreadsheet, Loader2, UploadCloud, 
  CheckCircle2, Landmark, Trash2, FileCode2, 
  AlertCircle, ShieldCheck, Search
} from 'lucide-react';
import { tallyTemplates } from '../../../../utils/tallyTemplates';
import { useApi } from '../../../../hooks/useApi';

// Sub-component: The entire card acts as a sleek dropzone
const BankDropzoneCard = ({ ledger, stagedFiles = [], onFilesAdded, onFileRemoved, disabled }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFilesAdded(ledger.name, acceptedFiles);
    }
  }, [ledger.name, onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt']
    },
    disabled
  });

  const hasFiles = stagedFiles.length > 0;

  return (
    <div 
      {...getRootProps()} 
      className={`relative flex flex-col p-4 lg:p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer group outline-none overflow-hidden ${
        isDragActive 
          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 scale-[1.02] shadow-xl shadow-emerald-500/10' 
          : hasFiles 
            ? 'border-emerald-400 dark:border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-500/5 shadow-sm hover:shadow-md' 
            : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:shadow-md'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input {...getInputProps()} />

      {/* Card Header & Identification */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            hasFiles || isDragActive 
              ? 'bg-emerald-500 text-white' 
              : 'bg-slate-100 dark:bg-white/10 text-slate-400 group-hover:text-emerald-500'
          }`}>
            <Landmark size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-sm font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic truncate">
              {ledger.name}
            </h4>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">
              {ledger.group}
            </span>
          </div>
        </div>

        {/* Upload Indicator */}
        <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-black/20">
          {hasFiles ? (
            <CheckCircle2 size={16} className="text-emerald-500" strokeWidth={3} />
          ) : (
            <UploadCloud size={16} className={`transition-all ${isDragActive ? 'text-emerald-500 animate-bounce' : 'text-slate-400 group-hover:text-emerald-500'}`} />
          )}
        </div>
      </div>

      {/* Upload Prompt (Visible only if empty) */}
      {!hasFiles && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 text-center">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
             {isDragActive ? 'Drop to Attach' : 'Click or Drag Statement'}
           </p>
        </div>
      )}

      {/* Staged Files List (Replaces prompt when files exist) */}
      {hasFiles && (
        <div className="mt-4 pt-4 border-t border-emerald-100 dark:border-emerald-500/20 flex flex-col gap-2 relative z-10">
          {stagedFiles.map((file, idx) => (
            <div key={`${file.name}-${idx}`} className="flex items-center justify-between p-2 lg:p-2.5 bg-white/80 dark:bg-black/40 rounded-lg border border-emerald-100 dark:border-emerald-500/10 shadow-sm">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {file.name.endsWith('.csv') ? <FileCode2 size={14} className="text-blue-500 shrink-0" /> : <FileSpreadsheet size={14} className="text-emerald-500 shrink-0" />}
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                  {file.name}
                </span>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // crucial: prevents opening the file dialog
                  onFileRemoved(ledger.name, idx);
                }}
                disabled={disabled}
                className="p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 rounded-md transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <p className="text-[8px] font-black text-center text-emerald-600/60 uppercase tracking-widest mt-1">
            Click to add more
          </p>
        </div>
      )}
    </div>
  );
};

const SyncStep = ({ selection, setSelection, isProcessing }) => {
  const { request } = useApi();
  const [bankLedgers, setBankLedgers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Bank Ledgers for the Selected Company
  useEffect(() => {
    const fetchBankLedgers = async () => {
      if (!selection.tallyCompany) return;
      setIsLoading(true);
      try {
        const xml = tallyTemplates.getLedgers(selection.tallyCompany);
        const res = await request("/tally/proxy", "POST", { xml });
        const ledgerRegex = /<LEDGER NAME="([^"]*)"[^>]*>[\s\S]*?<PARENT[^>]*>(.*?)<\/PARENT>/g;
        const matches = [...res.matchAll(ledgerRegex)];
        const filtered = matches
          .map(m => ({ name: m[1], group: m[2] }))
          .filter(l => l.group.includes("Bank Accounts") || l.group.includes("Cash-in-Hand"));
        
        // Sort alphabetically for easier visual scanning
        setBankLedgers(filtered.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) { 
        console.error("Ledger Sync Error:", err); 
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchBankLedgers();
  }, [selection.tallyCompany, request]);

  // Filter ledgers based on search
  const displayedLedgers = useMemo(() => {
    if (!searchQuery) return bankLedgers;
    return bankLedgers.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [bankLedgers, searchQuery]);

  const handleFilesAdded = useCallback((ledgerName, newFiles) => {
    setSelection(prev => {
      const existingStaged = prev.stagedFiles || {};
      const currentBankFiles = existingStaged[ledgerName] || [];
      return {
        ...prev,
        stagedFiles: {
          ...existingStaged,
          [ledgerName]: [...currentBankFiles, ...newFiles]
        }
      };
    });
  }, [setSelection]);

  const handleFileRemoved = useCallback((ledgerName, fileIndex) => {
    setSelection(prev => {
      const existingStaged = prev.stagedFiles || {};
      const currentBankFiles = existingStaged[ledgerName] || [];
      const updatedFiles = currentBankFiles.filter((_, idx) => idx !== fileIndex);
      
      const newStagedFiles = { ...existingStaged };
      if (updatedFiles.length > 0) {
        newStagedFiles[ledgerName] = updatedFiles;
      } else {
        delete newStagedFiles[ledgerName];
      }

      return { ...prev, stagedFiles: newStagedFiles };
    });
  }, [setSelection]);

  return (
    <>
      <div className="flex flex-col lg:flex-row h-full w-full bg-[#FBFBFC] dark:bg-[#050607] overflow-hidden">
        
        {/* LEFT PANEL: GUIDANCE & CONTEXT */}
        <aside className="w-full lg:w-80 bg-white dark:bg-white/2 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/5 flex flex-col shrink-0 z-10">
          <div className="p-5 lg:p-10 space-y-6">
            <div>
              <h3 className="text-xl lg:text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                Statement <span className="text-emerald-500">Upload</span>
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 leading-tight">Upload your bank statements</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl space-y-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Target Company</span>
              <p className="text-sm font-[1000] uppercase italic text-slate-900 dark:text-white wrap-break-word leading-tight">
                {selection.tallyCompany}
              </p>
            </div>

            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl hidden lg:block">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Batch Upload</span>
              </div>
              <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase">
                Drag and drop your bank statements directly onto their corresponding bank cards. You can stage multiple banks before proceeding.
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT PANEL: LEDGER WORKBENCH GRID */}
        <section className="flex-1 flex flex-col overflow-hidden relative bg-slate-50/50 dark:bg-transparent">
          
          {/* Action Bar (Search) */}
          <div className="px-4 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 bg-white/50 dark:bg-black/20 shrink-0 backdrop-blur-md">
            <span className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-2 shrink-0 self-start sm:self-auto">
              Bank Account Ledgers
              {isLoading && <Loader2 size={14} className="animate-spin text-emerald-500" />}
            </span>

            <div className="relative w-full sm:max-w-xs">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="FIND BANK Account LEDGER..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-emerald-500 transition-colors text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Grid View */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-10 pb-32">
            {!isLoading && bankLedgers.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4 min-h-75">
                 <AlertCircle size={40} className="text-slate-500" strokeWidth={1.5} />
                 <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-center leading-relaxed">
                   No Bank Accounts found<br/>in this Tally Company.
                 </p>
               </div>
            ) : !isLoading && displayedLedgers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40 gap-3 min-h-75">
                <Search size={32} className="text-slate-400" />
                <p className="text-[10px] font-black uppercase tracking-widest">No ledgers match "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
                {displayedLedgers.map((ledger) => (
                  <BankDropzoneCard 
                    key={ledger.name}
                    ledger={ledger}
                    stagedFiles={selection.stagedFiles?.[ledger.name] || []}
                    onFilesAdded={handleFilesAdded}
                    onFileRemoved={handleFileRemoved}
                    disabled={isProcessing}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default SyncStep;