import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import SyncStatusModal from "./SyncResultModal";
import { 
  CloudSync, FileCheck, AlertCircle, BarChart3, 
  Home, User, Database, FilePlus, ChevronRight, Clock
} from "lucide-react";
import { toast } from "sonner";

const DataSync = () => {
  const [files, setFiles] = useState({ aum: null, family: null, nonfam: null });
  const [lastSync, setLastSync] = useState(null);
  const [fileError, setFileError] = useState(""); 
  const [syncStatus, setSyncStatus] = useState({ isOpen: false, success: false, summary: null });
  const { request, loading } = useApi();

  const configs = [
    { id: "aum", label: "Client AUM Report", desc: "Assets Under Management", icon: BarChart3 }, 
    { id: "family", label: "Family Master List", desc: "Relationship Mappings", icon: Home },
    { id: "nonfam", label: "Individual Records", desc: "Granular Client Data", icon: User },
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const data = await request("/upload/sync-status");
        if (data?.lastSync && isMounted) setLastSync(data.lastSync);
      } catch { 
        console.error("Status fetch failed"); 
      }
    };
    fetchStatus();
    return () => { isMounted = false; };
  }, [request]);

  const handleFile = (id, file) => {
    if (!file) return;
    if (!/(\.xlsx|\.xls)$/i.test(file.name)) {
      setFileError(`Invalid format: ${file.name.slice(0, 15)}... Must be Excel (.xls or .xlsx)`);
      return;
    }
    setFileError(""); 
    setFiles((prev) => ({ ...prev, [id]: file }));
  };

  const handleSync = async () => {
    console.log("State Files Object:", files);

    // 1. EXTRACT THE BLOB: Ensure we send the actual File
    const aumBlob = Array.isArray(files.aum) || files.aum instanceof FileList ? files.aum[0] : files.aum;
    const famBlob = Array.isArray(files.family) || files.family instanceof FileList ? files.family[0] : files.family;
    const nfBlob = Array.isArray(files.nonfam) || files.nonfam instanceof FileList ? files.nonfam[0] : files.nonfam;

    if (!aumBlob || !famBlob || !nfBlob) {
      return toast.error("Missing Documents", { description: "Please attach all 3 files before executing sync." });
    }

    const formData = new FormData();
    formData.append("aumFile", aumBlob);
    formData.append("familyFile", famBlob);
    formData.append("nonFamFile", nfBlob);

    try {
      const response = await request("/upload/sync", "POST", formData);
      setSyncStatus({ isOpen: true, success: true, summary: response?.summary });
      setLastSync(new Date());
      setFiles({ aum: null, family: null, nonfam: null });
      toast.success("Sync executed successfully.");
    } catch (err) {
      console.error("Sync Request Failed:", err);
      setSyncStatus({ isOpen: true, success: false, summary: null });
      toast.error(err?.message || "Sync process encountered an error.");
    } 
  };

  const isReadyToSync = Object.values(files).filter(Boolean).length === 3;

  return (
    <div className="w-full pb-32 space-y-6 animate-in fade-in duration-300">
      
      {/* Mobile-Only Header */}
      <div className="lg:hidden border-b border-slate-200 dark:border-white/5 pb-4">
        <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">WE Sync</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Operational Sync Node & Reconciliation</p>
      </div>

      {/* System Status Banner */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-md p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-md shrink-0">
             <Clock size={18} />
          </div>
          <div>
             <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Last Successful Sync</p>
             <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mt-0.5">
               {lastSync ? new Date(lastSync).toLocaleString("en-IN") : "No Recent Activity"}
             </p>
          </div>
        </div>
        
        <button
          onClick={handleSync}
          disabled={!isReadyToSync || loading}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-md font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm
            ${loading || !isReadyToSync
              ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
        >
          {loading ? <CloudSync className="animate-spin" size={16} /> : <Database size={16} />}
          {loading ? "Calibrating..." : "Execute Master Sync"}
        </button>
      </div>

      {/* Error Console */}
      {fileError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-md animate-in slide-in-from-top-2">
          <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
          <p className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">{fileError}</p>
        </div>
      )}

      {/* File Upload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {configs.map((cfg) => {
          const isUploaded = !!files[cfg.id];
          const Icon = cfg.icon;
          
          return (
            <label 
              key={cfg.id} 
              className={`relative flex flex-col p-5 rounded-md border transition-all duration-200 cursor-pointer overflow-hidden shadow-sm group
                ${isUploaded 
                  ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/10" 
                  : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                }`}
            >
              <input 
                 type="file" 
                 className="hidden" 
                 accept=".xlsx, .xls" 
                 onChange={(e) => {
                   handleFile(cfg.id, e.target.files[0]);
                   e.target.value = null; // Reset to allow re-uploading same file if needed
                 }} 
              />
              
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 transition-colors
                  ${isUploaded ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                  {isUploaded ? <FileCheck size={18} /> : <Icon size={18} />}
                </div>
                
                <div className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 transition-colors
                  ${isUploaded 
                    ? 'bg-emerald-600 border-emerald-600' 
                    : 'bg-transparent border-slate-300 dark:border-slate-600 group-hover:border-slate-400'
                  }`}
                >
                   {isUploaded && <FileCheck size={12} className="text-white" />}
                </div>
              </div>

              <div className="mb-4 flex-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{cfg.label}</h4>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                  {cfg.desc}
                </p>
              </div>

              <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between min-w-0">
                <span className={`text-xs font-bold uppercase tracking-wider truncate mr-3
                  ${isUploaded ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {isUploaded ? files[cfg.id].name : 'Awaiting File...'}
                </span>
                <span className="shrink-0 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {isUploaded ? <ChevronRight size={14} /> : <FilePlus size={14} />}
                </span>
              </div>
            </label>
          );
        })}
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