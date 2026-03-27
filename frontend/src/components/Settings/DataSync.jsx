import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import SyncStatusModal from "./SyncResultModal";
import { 
  CloudSync, FileCheck, AlertCircle, BarChart3, 
  Home, User, ArrowRight, Database, 
  FilePlus, ShieldAlert, Sparkles, HelpCircle
} from "lucide-react";

const DataSync = () => {
  const [files, setFiles] = useState({ aum: null, family: null, nonfam: null });
  const [lastSync, setLastSync] = useState(null);
  const [fileError, setFileError] = useState(""); 
  const { request, loading } = useApi();

  const [syncStatus, setSyncStatus] = useState({
    isOpen: false,
    success: false,
    summary: null,
  });

  const configs = [
    { 
      id: "aum", 
      label: "Client AUM Report", 
      desc: "Assets Under Management", 
      info: "Requires 'Client Name', 'AUM Value', and 'Folio Number'.",
      icon: BarChart3,
      colorClass: "emerald"
    }, 
    { 
      id: "family", 
      label: "Family Master List", 
      desc: "Relationship Mappings", 
      info: "Matches individual clients to Family Heads.",
      icon: Home,
      colorClass: "emerald"
    },
    { 
      id: "nonfam", 
      label: "Individual Records", 
      desc: "Granular Client Data", 
      info: "Master data for non-mapped clients.",
      icon: User,
      colorClass: "indigo"
    },
  ];

  const filesAttachedCount = Object.values(files).filter(Boolean).length;

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await request("/upload/sync-status");
        if (data?.lastSync) setLastSync(data.lastSync);
      } catch (err) {
        console.error("Status check failed", err);
      }
    };
    fetchStatus();
  }, [request]);

  const handleFile = (id, file) => {
    if (!file) return;
    const allowedExtensions = /(\.xlsx|\.xls)$/i;
    if (!allowedExtensions.exec(file.name)) {
      setFileError(`Format Error: ${file.name}. Only Excel files accepted.`);
      return;
    }
    setFileError(""); 
    setFiles((prev) => ({ ...prev, [id]: file }));
  };

  const handleSync = async () => {
    const formData = new FormData();
    formData.append("aumFile", files.aum);
    formData.append("familyFile", files.family);
    formData.append("nonFamFile", files.nonfam);

    try {
      const response = await request("/upload/sync", "POST", formData);
      setSyncStatus({ isOpen: true, success: true, summary: response?.summary });
      setLastSync(new Date());
      setFiles({ aum: null, family: null, nonfam: null });
    } catch (err) {
      setFileError(err.response?.data?.error || "Sync Protocol Failed: Ledger Mismatch.");
      setSyncStatus({ isOpen: true, success: false, summary: null });
    }
  };

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-700 pb-10">
      
      {/* 1. GOLDEN GLASS HEADER */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-emerald-200/50 dark:border-emerald-500/10 p-8 rounded-lg shadow-2xl shadow-emerald-500/5">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 blur-[80px] pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-linear-to-br from-emerald-400 to-emerald-600 text-white rounded-lg shadow-lg shadow-emerald-500/40 transform -rotate-3">
              <Database size={24} strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                Master Ledger Sync
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Sparkles size={12} className="text-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.3em]">
                  Premium Intelligence Node
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 bg-emerald-50/50 dark:bg-emerald-900/10 px-8 py-4 rounded-sm border border-emerald-100 dark:border-emerald-800/20">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Status: Active</p>
              <p className="text-[11px] font-[1000] text-emerald-900 dark:text-emerald-200 uppercase italic">
                {lastSync ? `Last Sync: ${new Date(lastSync).toLocaleString("en-IN")}` : "Initial Sync Required"}
              </p>
            </div>
            <div className={`w-4 h-4 rounded-full border-4 border-white dark:border-slate-800 ${lastSync ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]' : 'bg-red-500 animate-pulse'}`} />
          </div>
        </div>
      </div>

      {/* 2. ERROR CONSOLE (Fixes no-unused-vars) */}
      {fileError && (
        <div className="mx-2 p-5 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-600 rounded-lg flex items-center gap-4 animate-in slide-in-from-top-4">
          <AlertCircle size={20} className="text-red-600 shrink-0" strokeWidth={3} />
          <div className="flex-1">
            <p className="text-[10px] font-black text-red-800 dark:text-red-400 uppercase tracking-widest leading-none">System Validation Error</p>
            <p className="text-[11px] font-bold text-red-600/80 dark:text-red-500/80 uppercase mt-1">{fileError}</p>
          </div>
          <button onClick={() => setFileError("")} className="text-[10px] font-black text-red-300 hover:text-red-600 uppercase">Clear</button>
        </div>
      )}

      {/* 3. UPLOAD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {configs.map((cfg) => {
          const isUploaded = !!files[cfg.id];
          const IconComponent = cfg.icon;
          
          const baseStyles = {
            amber: "bg-amber-50/60 border-amber-100 text-amber-600",
            emerald: "bg-emerald-50/60 border-emerald-100 text-emerald-600",
            indigo: "bg-indigo-50/60 border-indigo-100 text-indigo-600"
          };

          return (
            <label
              key={cfg.id}
              className={`flex flex-col p-8 border-2 rounded-lg cursor-pointer transition-all duration-500 relative group
                ${isUploaded 
                  ? "bg-emerald-50/40 dark:bg-emerald-500/10 border-emerald-500 shadow-2xl shadow-emerald-500/20 scale-[1.02]" 
                  : `bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 hover:border-emerald-400 hover:shadow-2xl hover:-translate-y-2`
                }`}
            >
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => handleFile(cfg.id, e.target.files[0])} />
              
              <div className="absolute top-8 right-8 opacity-40 group-hover:opacity-100">
                <HelpCircle size={18} className="text-slate-400 group-hover:text-emerald-500" />
              </div>

              <div className={`w-16 h-16 rounded-lg flex items-center justify-center transition-all duration-700 mb-8 shadow-md
                ${isUploaded 
                  ? "bg-emerald-600 text-white shadow-emerald-500/40 rotate-360" 
                  : `${baseStyles[cfg.colorClass]} group-hover:scale-110 shadow-inner`}`}>
                {isUploaded ? <FileCheck size={28} strokeWidth={3} /> : <IconComponent size={28} strokeWidth={2.5} />}
              </div>

              <div className="space-y-2">
                <h4 className={`text-[15px] font-[1000] uppercase tracking-tight leading-none ${isUploaded ? 'text-emerald-700' : 'text-slate-900 dark:text-white'}`}>
                  {cfg.label}
                </h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                  {isUploaded ? files[cfg.id].name : cfg.desc}
                </p>
              </div>

              <div className={`mt-10 pt-6 border-t-2 flex items-center justify-between ${isUploaded ? 'border-emerald-200' : 'border-slate-50 dark:border-white/5'}`}>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isUploaded ? "text-emerald-600 italic" : "text-slate-400"}`}>
                  {isUploaded ? "Verified" : "Pending Selection"}
                </span>
                <div className={`p-2 rounded-sm transition-colors ${isUploaded ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white'}`}>
                  <FilePlus size={18} />
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {/* 4. GOLDEN SYNC BUTTON */}
      <div className="pt-10 flex flex-col items-center gap-8 border-t-2 border-slate-100 dark:border-white/5">
        <button
          onClick={handleSync}
          disabled={filesAttachedCount < 3 || loading}
          className={`group flex items-center gap-8 px-24 py-7 rounded-xl font-black text-[13px] uppercase tracking-[0.5em] transition-all relative overflow-hidden
            ${loading || filesAttachedCount < 3
              ? "bg-slate-100 text-slate-300 cursor-not-allowed border-2 border-slate-200"
              : "bg-linear-to-br from-emerald-500 to-orange-600 text-white hover:scale-[1.05] shadow-[0_25px_60px_rgba(245,158,11,0.35)] active:scale-95"
          }`}
        >
          {loading ? (
            <>
              <CloudSync className="animate-spin" size={20} strokeWidth={3} />
              <span>Calibrating...</span>
            </>
          ) : (
            <>
              <span>Execute Master Sync</span>
              <ArrowRight size={22} strokeWidth={3} className="group-hover:translate-x-3 transition-transform duration-500" />
            </>
          )}
        </button>
      </div>

      <SyncStatusModal
        isOpen={syncStatus.isOpen}
        onClose={() => setSyncStatus((prev) => ({ ...prev, isOpen: false }))}
        success={syncStatus.success}
        summary={syncStatus.summary}
      />
    </div>
  );
};

export default DataSync;