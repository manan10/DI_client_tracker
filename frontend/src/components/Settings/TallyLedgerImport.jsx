import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Terminal, Info, Building2, Check, Sparkles } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { toast } from 'sonner';

const TallyLedgerImport = () => {
  const { request } = useApi();
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [file, setFile] = useState(null);
  const [importStats, setImportStats] = useState(null);
  
  const [arns, setArns] = useState([]);
  const [selectedArn, setSelectedArn] = useState('');

  useEffect(() => {
    const fetchArns = async () => {
      try {
        const res = await request('/arns');
        if (res?.data) setArns(res.data);
      } catch {
        toast.error("Failed to load ARN registry");
      }
    };
    fetchArns();
  }, [request]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        setImportStats(null); // Clear previous stats on new file
      } else {
        toast.error("Invalid File Type", { description: "Please upload a .csv or .xlsx file exported from Tally." });
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedArn) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('arnId', selectedArn);

    try {
      const res = await request('/ledgers/import', 'POST', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.success) {
        setImportStats(res.stats);
        setShowSuccessOverlay(true);
        
        toast.success("Ledgers Synchronized", {
          description: `Successfully processed ${res.stats.total} total records.`
        });
        
        setFile(null);
        // Hide overlay after 3 seconds
        setTimeout(() => setShowSuccessOverlay(false), 3000);
      }
    } catch (err) {
      toast.error("Import Failed", { description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Success Celebration Overlay */}
      {showSuccessOverlay && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm rounded-md animate-in fade-in zoom-in duration-300">
          <div className="flex flex-col items-center bg-white dark:bg-slate-900 p-8 border-2 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.2)] rounded-lg text-center">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <Check className="text-white" size={32} strokeWidth={4} />
            </div>
            <h4 className="text-xl font-black uppercase italic dark:text-white">Sync Completed</h4>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mt-1">Registry Updated Successfully</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-2 border-l-4 border-emerald-500 pl-6">
        <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">
          Tally ERP <span className="text-emerald-500">Sync</span>
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Import ledger master records from Tally export files
        </p>
      </div>

      {/* ARN Selection Dropdown */}
      <div className="p-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-md">
        <div className="flex items-center gap-3 mb-4">
          <Building2 size={16} className="text-emerald-500" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Target Entity (ARN)</h4>
        </div>
        <select 
          value={selectedArn}
          onChange={(e) => setSelectedArn(e.target.value)}
          className="w-full bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-white/10 p-4 font-black uppercase text-xs tracking-widest outline-none focus:border-emerald-500 transition-all cursor-pointer text-slate-900 dark:text-white"
        >
          <option value="">Choose an ARN...</option>
          {arns.map(arn => (
            <option key={arn._id} value={arn._id}>{arn.arnCode} — {arn.nickname}</option>
          ))}
        </select>
      </div>

      {/* Upload Zone */}
      <div className={`grid grid-cols-1 lg:grid-cols-5 gap-8 transition-all duration-500 ${!selectedArn ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
        <div className="lg:col-span-3">
          <label className={`
            relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-md transition-all cursor-pointer
            ${file ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400 bg-slate-50/50 dark:bg-slate-900/50'}
          `}>
            <input type="file" className="hidden" onChange={handleFileChange} accept=".csv,.xlsx" />
            
            <div className="flex flex-col items-center text-center p-6">
              {file ? (
                <>
                  <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                    <FileText size={32} />
                  </div>
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{file.name}</p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase mt-1">Ready for processing</p>
                </>
              ) : (
                <>
                  <Upload className="text-slate-300 mb-4" size={40} strokeWidth={1.5} />
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">Drop Tally Export Here</p>
                  <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest leading-relaxed">
                    Supported: CSV, XLSX <br />
                    <span className="opacity-50">Standard Ledger Master Format</span>
                  </p>
                </>
              )}
            </div>
          </label>

          <button
            onClick={handleUpload}
            disabled={!file || isUploading || !selectedArn}
            className={`
              mt-6 w-full py-5 rounded-md font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all overflow-hidden relative
              ${!file || isUploading || !selectedArn
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-950 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-xl hover:scale-[1.01] active:scale-95'}
            `}
          >
            {isUploading ? (
              <span className="flex items-center gap-4">
                <Loader2 className="animate-spin" size={18} />
                Executing Import...
              </span>
            ) : (
              <span className="flex items-center gap-4">
                <Terminal size={18} />
                Begin Synchronization
              </span>
            )}
          </button>
        </div>

        {/* Documentation Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-slate-900 text-white rounded-md shadow-2xl relative overflow-hidden group">
            <Terminal className="absolute -right-4 -top-4 size-24 opacity-10 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 flex items-center gap-2">
                <Info size={14} /> Import Logic
              </h4>
              <ul className="space-y-3">
                {[
                  "Ledgers are ARN-isolated",
                  "Names are auto-normalized",
                  "Existing records are updated",
                  "Automatic group recognition"
                ].map((text, i) => (
                  <li key={i} className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-tight">
                    <span className="text-emerald-500">»</span> {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {importStats && (
            <div className="p-6 border-2 border-emerald-500/50 bg-white dark:bg-slate-900 rounded-md animate-in zoom-in duration-500 shadow-lg shadow-emerald-500/5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Cycle Results</h4>
                <Sparkles size={14} className="text-emerald-500 animate-pulse" />
              </div>
                {/* Change the labels in your stats display to be clearer */}
                <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">New Ledgers</p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {importStats.created}
                    </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#111218] border border-slate-100 dark:border-white/5">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Existing Verified</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                    {importStats.updated}
                    </p>
                </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TallyLedgerImport;