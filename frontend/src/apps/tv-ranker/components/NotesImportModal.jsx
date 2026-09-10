import React, { useState } from 'react';
import { 
  X, UploadCloud, FileText, CheckCircle2, 
  Loader2, Ticket, Check, Sparkles, Terminal
} from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../../shared/hooks/useApi';

const NotesImportModal = ({ isOpen, onClose, onImportComplete }) => {
  const { request } = useApi();
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        setSelectedFile(file);
      } else {
        toast.error('Invalid Format', { description: 'Please choose a plain text (.txt) file.' });
      }
    }
  };

  const handleImport = async () => {
    if (!pastedText.trim() && !selectedFile) {
      toast.error('No Content Detected', { description: 'Paste note content or attach your .txt file.' });
      return;
    }

    setIsProcessing(true);
    try {
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        res = await request('/shows/import-notes', 'POST', formData);
      } else {
        res = await request('/shows/import-notes', 'POST', { text: pastedText });
      }

      if (res?.success) {
        toast.success('Archive Ingested Successfully', {
          description: `Imported ${res.stats?.newRatingsCreated || 0} new ratings (${res.stats?.totalParsed || 0} total parsed).`
        });
        setPastedText('');
        setSelectedFile(null);
        if (typeof onImportComplete === 'function') onImportComplete();
        if (typeof onClose === 'function') onClose();
      } else {
        toast.error(res?.message || 'Import failed');
      }
    } catch (err) {
      console.error('Import error:', err);
      toast.error(err.message || 'Server ingestion error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Container: Less Rounded Shell */}
      <div 
        className="w-full sm:max-w-xl md:max-w-2xl bg-white dark:bg-[#070A12] border-t sm:border border-slate-200/90 dark:border-white/10 rounded-t-xl sm:rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-slate-100 transition-all relative font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="w-full flex sm:hidden items-center justify-center pt-2 pb-1 bg-linear-to-r from-rose-950 via-slate-900 to-slate-950">
          <div className="w-8 h-1 bg-rose-400/40 rounded-full" />
        </div>

        {/* ===================== COLORED HEADER BAR ===================== */}
        <div className="px-5 sm:px-6 py-3.5 bg-linear-to-r from-rose-950 via-slate-900 to-[#0F1424] border-b border-rose-500/30 flex items-center justify-between text-white shrink-0 relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 rounded-md bg-linear-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Ticket size={17} strokeWidth={2.4} className="-rotate-12" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold tracking-[0.14em] uppercase leading-none text-white">
                Import Archive
              </h2>
              <p className="text-[10px] font-mono tracking-wider uppercase text-rose-300/80 mt-0.5">
                Batch Notes Ingestion & Parser
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* ===================== BODY CONTENT ===================== */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 no-scrollbar flex-1 text-left">
          
          {/* Format Guide Banner */}
          <div className="p-3 rounded-md bg-linear-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/30 text-white flex items-start gap-2.5 shadow-xs">
            <div className="p-1 rounded-sm bg-cyan-500/20 text-cyan-300 shrink-0 mt-0.5">
              <Terminal size={13} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-300 block">
                Automatic Syntax Detection
              </span>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-mono">
                Accepts lines like <span className="text-amber-300">1. Show Name ( 9.3/10 )</span>, season markers like <span className="text-rose-300">Show - s2</span>, unrated watchlist items, and <span className="text-cyan-300">INDIAN SHOWS</span> headers.
              </p>
            </div>
          </div>

          {/* Raw Text Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-serif font-bold tracking-[0.12em] uppercase text-slate-600 dark:text-slate-300">
                Paste Notes Content *
              </label>
              <span className="text-[9px] font-mono text-slate-400">0 - 10 /10 patterns recognized</span>
            </div>
            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => {
                setPastedText(e.target.value);
                if (selectedFile) setSelectedFile(null);
              }}
              placeholder={`INTERNATIONAL\n1. Sherlock ( 9.3/10 )\n2. Succession ( 9.1/10 )\n\n56 days\nThe bear\n\nINDIAN SHOWS\n1. Scam 1992 ( 9/10 )`}
              className="w-full p-3 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 resize-none transition-all"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 py-0.5">
            <div className="h-px bg-slate-200 dark:bg-white/10 flex-1" />
            <span className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-widest">
              OR ATTACH .TXT FILE
            </span>
            <div className="h-px bg-slate-200 dark:bg-white/10 flex-1" />
          </div>

          {/* File Upload Drop Target */}
          <label className="border border-dashed border-slate-300 dark:border-white/15 hover:border-rose-500 dark:hover:border-rose-500 rounded-md p-3.5 flex items-center justify-between gap-3 cursor-pointer bg-slate-50/60 dark:bg-white/2 hover:bg-rose-500/5 transition-all">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <UploadCloud size={16} />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {selectedFile ? selectedFile.name : 'Select or drop notes text file (.txt)'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Plain text encoding'}
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 shrink-0">
              Browse
            </span>

            <input
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

        </div>

        {/* ===================== FOOTER ACTIONS ===================== */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-white/2 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-3.5 py-2 rounded-md text-xs font-serif font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleImport}
            disabled={isProcessing || (!pastedText.trim() && !selectedFile)}
            className="flex items-center gap-2 px-5 py-2 rounded-md bg-linear-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-serif font-bold uppercase tracking-wider shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 size={13} className="animate-spin text-white" />
                <span>Ingesting Archive...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} strokeWidth={2.5} />
                <span>Parse & Seed Database</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesImportModal;