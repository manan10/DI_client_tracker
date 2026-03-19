import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import SyncStatusModal from "./SyncResultModal";
import { CloudSync, FileCheck, AlertCircle, BarChart3, Home, User, ArrowRight, Database } from "lucide-react";

const DataUploader = () => {
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
    { id: "aum", label: "Client AUM Report", icon: <BarChart3 size={18} />, color: "text-blue-600 dark:text-blue-400" }, 
    { id: "family", label: "Family Master List", icon: <Home size={18} />, color: "text-emerald-600 dark:text-emerald-400" },
    { id: "nonfam", label: "Individual Records", icon: <User size={18} />, color: "text-indigo-600 dark:text-indigo-400" },
  ];

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await request("/upload/sync-status");
        if (data.lastSync) setLastSync(data.lastSync);
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
      setFileError(`Invalid format: ${file.name}. Use Excel.`);
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
      setSyncStatus({ isOpen: true, success: true, summary: response.summary });
      setLastSync(new Date());
      setFiles({ aum: null, family: null, nonfam: null });
    } catch (err) {
      setFileError(err.response?.data?.error || "Sync failed. Check connection.");
      setSyncStatus({ isOpen: true, success: false, summary: null });
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. HEADER - System Status */}
      <div className="flex justify-between items-end px-1">
        <div>
          <h3 className="text-[11px] font-[1000] text-slate-900 dark:text-white uppercase tracking-[0.3em] flex items-center gap-2">
            <Database size={14} className="text-indigo-600" strokeWidth={3} />
            Wealth Elite Sync
          </h3>
          <p className={`text-[9px] font-black uppercase mt-1 tracking-widest ${lastSync ? "text-emerald-600" : "text-slate-400"}`}>
            {lastSync ? `LAST SYNC: ${new Date(lastSync).toLocaleString("en-IN")}` : "PENDING INITIAL SYNC"}
          </p>
        </div>
      </div>

      {/* Error Alert - High Contrast */}
      {fileError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={18} className="text-red-600 shrink-0" strokeWidth={3} />
          <p className="text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-tight">{fileError}</p>
        </div>
      )}

      {/* 2. UPLOAD SLOTS - Using the "Physical Tab" design */}
      <div className="grid grid-cols-1 gap-3">
        {configs.map((cfg) => (
          <label
            key={cfg.id}
            className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 group
              ${files[cfg.id] 
                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 border-b-4 border-b-emerald-300 dark:border-b-emerald-900/50" 
                : "bg-white dark:bg-white/2 border-slate-200 dark:border-white/5 border-b-4 border-b-slate-200 dark:border-b-black/40 hover:-translate-y-1"
              }`}
          >
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => handleFile(cfg.id, e.target.files[0])} />
            
            {/* Icon Well */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-all
              ${files[cfg.id] ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white"}`}>
              {files[cfg.id] ? <FileCheck size={18} strokeWidth={3} /> : cfg.icon}
            </div>

            <div className="ml-4 flex-1 min-w-0">
              <p className="text-[12px] font-[1000] text-slate-900 dark:text-white uppercase tracking-tight">
                {cfg.label}
              </p>
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 truncate uppercase tracking-widest mt-1">
                {files[cfg.id] ? files[cfg.id].name : "Ready for import..."}
              </p>
            </div>
          </label>
        ))}
      </div>

      {/* 3. SYNC ACTION - The "Primary Drive" Button */}
      <button
        onClick={handleSync}
        disabled={!files.aum || !files.family || !files.nonfam || loading}
        className={`w-full group flex items-center justify-center gap-3 py-5 rounded-2xl font-[1000] text-[11px] uppercase tracking-[0.2em] transition-all border-b-4 shadow-xl
          ${loading || !files.aum || !files.family || !files.nonfam
            ? "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-400 cursor-not-allowed border-b-transparent shadow-none"
            : "bg-slate-900 dark:bg-indigo-600 text-white border-b-black/40 dark:border-b-indigo-950 hover:-translate-y-1 active:translate-y-0.5 active:border-b-0 active:shadow-inner"
        }`}
      >
        {loading ? (
          <>
            <CloudSync className="animate-spin" size={18} strokeWidth={3} />
            <span>Calibrating Data Vault...</span>
          </>
        ) : (
          <>
            <span>Initiate Sync</span>
            <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      <SyncStatusModal
        isOpen={syncStatus.isOpen}
        onClose={() => setSyncStatus((prev) => ({ ...prev, isOpen: false }))}
        success={syncStatus.success}
        summary={syncStatus.summary}
      />
    </div>
  );
};

export default DataUploader;