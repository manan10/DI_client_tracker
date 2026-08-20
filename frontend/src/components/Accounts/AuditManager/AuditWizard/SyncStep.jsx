import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FileSpreadsheet, Loader2, UploadCloud, 
  CheckCircle2, Landmark, Trash2, FileCode2, 
  AlertCircle, ShieldCheck, Search, FileText,
  Layers, ArrowUpRight, Check
} from 'lucide-react';
import { tallyTemplates } from '../../../../utils/tallyTemplates';
import { useApi } from '../../../../hooks/useApi';

// =========================================================================
// SUB-COMPONENT: BANK DROPZONE CARD
// =========================================================================
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
      className={`relative flex flex-col p-4 rounded-xl border transition-all duration-200 cursor-pointer group outline-none overflow-hidden ${
        isDragActive 
          ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 ring-2 ring-emerald-500/40 scale-[1.01] shadow-md' 
          : hasFiles 
            ? 'border-emerald-500/40 dark:border-emerald-500/30 bg-white dark:bg-slate-900/80 shadow-xs hover:border-emerald-500/60' 
            : 'border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input {...getInputProps()} />

      {/* Card Header & Account Identification */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            hasFiles || isDragActive 
              ? 'bg-emerald-600 text-white shadow-xs' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white'
          }`}>
            <Landmark size={17} />
          </div>
          
          <div className="flex flex-col min-w-0">
            <h4 className={`text-xs font-black uppercase tracking-tight truncate ${
              hasFiles ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'
            }`}>
              {ledger.name}
            </h4>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
              {ledger.group}
            </span>
          </div>
        </div>

        {/* Upload Status Badge */}
        <div className="shrink-0 flex items-center gap-1.5">
          {hasFiles ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
              <Check size={11} strokeWidth={3} /> {stagedFiles.length} {stagedFiles.length === 1 ? 'File' : 'Files'}
            </span>
          ) : (
            <div className={`w-7 h-7 rounded-md flex items-center justify-center border transition-all ${
              isDragActive 
                ? 'bg-emerald-500 border-emerald-500 text-white animate-bounce' 
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
            }`}>
              <UploadCloud size={14} />
            </div>
          )}
        </div>
      </div>

      {/* Empty Drop Prompt */}
      {!hasFiles && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {isDragActive ? 'Drop File to Attach' : 'Click or Drag Statement (.csv, .xlsx)'}
          </p>
        </div>
      )}

      {/* Staged Files Viewport */}
      {hasFiles && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex flex-col gap-1.5 relative z-10">
          {stagedFiles.map((file, idx) => {
            const isCsv = file.name.toLowerCase().endsWith('.csv');
            const isTxt = file.name.toLowerCase().endsWith('.txt');

            return (
              <div 
                key={`${file.name}-${idx}`} 
                className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-white/5 shadow-2xs group/file"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isCsv ? (
                    <FileCode2 size={13} className="text-blue-500 shrink-0" />
                  ) : isTxt ? (
                    <FileText size={13} className="text-amber-500 shrink-0" />
                  ) : (
                    <FileSpreadsheet size={13} className="text-emerald-500 shrink-0" />
                  )}
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                    {file.name}
                  </span>
                </div>
                
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents triggering the Dropzone file dialog
                    onFileRemoved(ledger.name, idx);
                  }}
                  disabled={disabled}
                  className="p-1 text-slate-400 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors shrink-0 cursor-pointer"
                  title="Remove Statement"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
          
          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Drop more files to append
            </span>
            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Ready to Ingest
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// MAIN COMPONENT: SYNC STEP (STATEMENT INGESTION)
// =========================================================================
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

  // Derived Stats
  const totalStagedFiles = useMemo(() => {
    return Object.values(selection.stagedFiles || {}).reduce((sum, files) => sum + (files?.length || 0), 0);
  }, [selection.stagedFiles]);

  const totalStagedBanks = useMemo(() => {
    return Object.keys(selection.stagedFiles || {}).length;
  }, [selection.stagedFiles]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden min-w-0">
        
        {/* ========================================================================= */}
        {/* LEFT PANEL: GUIDANCE, SCOPE CONTEXT & INGESTION STATS                     */}
        {/* ========================================================================= */}
        <aside className="w-full lg:w-80 bg-slate-50/60 dark:bg-slate-900/30 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-white/10 flex flex-col shrink-0 z-10 min-w-0 p-4 lg:p-6 space-y-4">
          
          {/* Header Title */}
          <div className="space-y-1">
            <h3 className="text-base lg:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Statement Ingestion
            </h3>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Attach statements per bank ledger
            </p>
          </div>

          {/* Target Company Context Box */}
          <div className="p-4 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 rounded-xl shadow-xs space-y-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Target Company</span>
            <p className="text-xs font-black uppercase text-slate-900 dark:text-white truncate">
              {selection.tallyCompany || "No Company Selected"}
            </p>
            {selection.month && (
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider pt-1 border-t border-slate-100 dark:border-white/5">
                Cycle: Month {selection.month} / {selection.year}
              </p>
            )}
          </div>

          {/* Staging Metrics Pill */}
          <div className="p-4 bg-slate-900 text-white rounded-xl shadow-xs space-y-2.5 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Staging Summary</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                totalStagedFiles > 0 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'
              }`}>
                {totalStagedFiles} Staged
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Accounts</p>
                <p className="text-sm font-black text-white font-mono">{totalStagedBanks} / {bankLedgers.length}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Files</p>
                <p className="text-sm font-black text-emerald-400 font-mono">{totalStagedFiles}</p>
              </div>
            </div>
          </div>

          {/* Instruction Note */}
          <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl hidden lg:block space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck size={13} />
              <span className="text-[10px] font-black uppercase tracking-wider">Multi-Bank Staging</span>
            </div>
            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
              Drag & drop bank statement files (.csv, .xlsx, .xls) directly onto their respective bank cards. All attached banks will be processed concurrently in the next stage.
            </p>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: LEDGER WORKBENCH & DROPZONE GRID                             */}
        {/* ========================================================================= */}
        <section className="flex-1 flex flex-col overflow-hidden relative min-w-0">
          
          {/* Top Filter & Search Command Strip */}
          <div className="px-4 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Available Bank Accounts ({displayedLedgers.length})
              </span>
              {isLoading && <Loader2 size={13} className="animate-spin text-emerald-500" />}
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="SEARCH BANK ACCOUNT..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider outline-none focus:border-emerald-500 transition-colors text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Grid Viewport */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-8 pb-24 min-w-0">
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2.5 text-slate-400">
                <Loader2 className="animate-spin text-emerald-500" size={28} />
                <span className="text-xs font-bold uppercase tracking-wider">Loading Tally Bank Masters...</span>
              </div>
            ) : bankLedgers.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl p-6 text-center space-y-2">
                <AlertCircle size={32} className="text-slate-400 opacity-60" />
                <p className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  No Bank Accounts Found
                </p>
                <p className="text-[11px] font-medium text-slate-400 max-w-sm">
                  No accounts grouped under "Bank Accounts" or "Cash-in-Hand" were found in {selection.tallyCompany}.
                </p>
              </div>
            ) : displayedLedgers.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400 opacity-60">
                <Search size={24} />
                <p className="text-xs font-bold uppercase tracking-wider">No accounts matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
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