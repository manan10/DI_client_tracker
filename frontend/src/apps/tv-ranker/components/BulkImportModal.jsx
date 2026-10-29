import React, { useState } from 'react';
import { 
  X, UploadCloud, FileText, Check, 
  Loader2, Ticket, Terminal, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../../shared/hooks/useApi';

const NotesImportModal = ({ isOpen, onClose, onImportComplete }) => {
  const { request, loading: apiLoading } = useApi();
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
        toast.error('Invalid file', { description: 'Please choose a plain text (.txt) file.' });
      }
    }
  };

  const handleImport = async (e) => {
    if (e) e.preventDefault();
    if (!pastedText.trim() && !selectedFile) {
      toast.error('No notes found', { description: 'Paste your notes or attach a text file.' });
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
        toast.success('Notes imported successfully', {
          description: `Added ${res.stats?.newRatingsCreated || 0} new ratings (${res.stats?.totalParsed || 0} total parsed).`
        });
        setPastedText('');
        setSelectedFile(null);
        if (typeof onImportComplete === 'function') onImportComplete();
        if (typeof onClose === 'function') onClose();
      } else {
        toast.error(res?.message || 'Failed to import notes');
      }
    } catch (err) {
      console.error('Import error:', err);
      toast.error(err.message || 'Could not import notes');
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = isProcessing || apiLoading;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm select-none font-sans"
      onClick={onClose}
    >
      {/* Two-Tone Slide-over Drawer Frame */}
      <div 
        className="w-full sm:w-[500px] md:w-[540px] bg-[#E9EEF5] dark:bg-[#1E2636] border-t-2 sm:border-t-0 sm:border-l-2 border-slate-300 dark:border-[#334158] shadow-[0_15px_45px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[92dvh] sm:max-h-screen rounded-t-2xl sm:rounded-none text-slate-800 dark:text-slate-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#40bcf4] to-transparent pointer-events-none z-30" />

        {/* Grab Handle for Mobile */}
        <div className="w-full flex sm:hidden items-center justify-center pt-2.5 pb-1 bg-[#DEE5EF] dark:bg-[#19202E] shrink-0">
          <div className="w-12 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4.5 bg-[#DEE5EF] dark:bg-[#171F2C] border-b-2 border-slate-300 dark:border-[#2C384D] flex items-center justify-between shrink-0 shadow-[0_2px_4px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.25)] relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white dark:bg-[#253044] border border-slate-300 dark:border-[#3B4B67] flex items-center justify-center text-[#40bcf4] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#141A24] shrink-0">
              <Ticket size={16} strokeWidth={2.4} className="text-[#40bcf4] -rotate-12" />
            </div>
            
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 dark:text-white leading-none">
                  Import Notes
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284c7] dark:text-[#40bcf4] bg-[#40bcf4]/10 border border-[#40bcf4]/30 px-2 py-0.5 rounded shadow-2xs">
                  Batch
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Add ratings quickly from text or a file
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white dark:bg-[#253044] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-[#38465E] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#131924] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            title="Close"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleImport} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-4.5 no-scrollbar flex-1 text-left">
          
          {/* Format Helper Banner */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-[#141C28] border-2 border-slate-300 dark:border-[#2C384D] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#40bcf4]/15 border border-[#40bcf4]/30 flex items-center justify-center text-[#0284c7] dark:text-[#40bcf4] shrink-0 mt-0.5">
              <Terminal size={15} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284c7] dark:text-[#40bcf4] block">
                Accepted Formats
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-mono mt-0.5 leading-relaxed">
                Accepts lines like <span className="font-bold text-amber-600 dark:text-amber-400">Show Name ( 9.2/10 )</span>, seasons like <span className="font-bold text-rose-500">Show - s2</span>, or unrated watchlist titles.
              </p>
            </div>
          </div>

          {/* Raw Text Input Card */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Paste Notes Text
              </label>
              <span className="text-[10px] font-mono text-slate-400">0 to 10 score pattern</span>
            </div>
            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => {
                setPastedText(e.target.value);
                if (selectedFile) setSelectedFile(null);
              }}
              placeholder={`INTERNATIONAL\n1. Sherlock ( 9.3/10 )\n2. Succession ( 9.1/10 )\n\n56 days\nThe bear\n\nINDIAN SHOWS\n1. Scam 1992 ( 9/10 )`}
              className="w-full p-3 rounded-xl bg-white dark:bg-[#141C28] border-2 border-slate-300 dark:border-[#2C384D] text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#40bcf4] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] transition-colors resize-none"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 py-0.5">
            <div className="h-0.5 bg-slate-300 dark:bg-[#2C384D] flex-1" />
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
              OR UPLOAD A FILE
            </span>
            <div className="h-0.5 bg-slate-300 dark:bg-[#2C384D] flex-1" />
          </div>

          {/* File Upload Drop Target */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Text File (.txt)
            </label>

            <label className="w-full p-3.5 rounded-xl bg-white dark:bg-[#141C28] border-2 border-dashed border-slate-300 dark:border-[#2C384D] hover:border-[#40bcf4] dark:hover:border-[#40bcf4] shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0F1520] flex items-center justify-between gap-3 cursor-pointer transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#40bcf4]/15 border border-[#40bcf4]/30 text-[#0284c7] dark:text-[#40bcf4] flex items-center justify-center shrink-0">
                  <UploadCloud size={18} />
                </div>
                <div className="flex flex-col truncate min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {selectedFile ? selectedFile.name : 'Choose or drag a notes file (.txt)'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Plain text file only'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {selectedFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedFile(null);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    title="Remove file"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#1E2838] border border-slate-300 dark:border-[#38465E] text-slate-700 dark:text-slate-300 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#101621]">
                  Browse
                </span>
              </div>

              <input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

        </form>

        {/* Footer Bar */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t-2 border-slate-300 dark:border-[#2C384D] bg-[#DEE5EF] dark:bg-[#171F2C] flex items-center justify-between gap-3 shrink-0 shadow-[0_-2px_6px_rgba(0,0,0,0.03)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.25)] pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleImport}
            disabled={isLoading || (!pastedText.trim() && !selectedFile)}
            className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-lg bg-[#00e054] hover:bg-[#00c94b] text-[#14181C] text-xs font-black uppercase tracking-wider border border-[#00c94b] border-b-[3px] border-b-[#009e3a] active:border-b active:translate-y-[2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_4px_12px_rgba(0,224,84,0.3)]"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin text-[#14181C]" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <Check size={15} strokeWidth={3} />
                <span>Import Notes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesImportModal;