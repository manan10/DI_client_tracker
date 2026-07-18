import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import SyncStatusModal from "./SyncResultModal";
import { 
  CloudSync, FileCheck, AlertCircle, BarChart3, 
  Home, User, ArrowRight, Database, FilePlus, ChevronRight
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
    const fetchStatus = async () => {
      try {
        const data = await request("/upload/sync-status");
        if (data?.lastSync) setLastSync(data.lastSync);
      } catch { console.error("Status fetch failed"); }
    };
    fetchStatus();
  }, [request]);

  const handleFile = (id, file) => {
    if (!file) return;
    if (!/(\.xlsx|\.xls)$/i.test(file.name)) {
      setFileError(`Invalid format: ${file.name.slice(0, 15)}...`);
      return;
    }
    setFileError(""); 
    setFiles((prev) => ({ ...prev, [id]: file }));
  };

const handleSync = async () => {
    // DIAGNOSTIC: Check what is actually in the state before appending
    console.log("State Files Object:", files);

    // 1. EXTRACT THE BLOB: Ensure we send the actual File, not a FileList array
    const aumBlob = Array.isArray(files.aum) || files.aum instanceof FileList ? files.aum[0] : files.aum;
    const famBlob = Array.isArray(files.family) || files.family instanceof FileList ? files.family[0] : files.family;
    const nfBlob = Array.isArray(files.nonfam) || files.nonfam instanceof FileList ? files.nonfam[0] : files.nonfam;

    if (!aumBlob || !famBlob || !nfBlob) {
      return toast.error("Missing Files", { description: "Please attach all 3 files before syncing." });
    }

    const formData = new FormData();
    formData.append("aumFile", aumBlob);
    formData.append("familyFile", famBlob);
    formData.append("nonFamFile", nfBlob);

    try {
      // CRITICAL WARNING: Ensure your custom `request` function does NOT force 
      // {'Content-Type': 'application/json'} when passing a FormData object.
      // fetch() needs to calculate the multipart boundary automatically!
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

  return (
    <div className="w-full max-w-5xl mx-auto pt-8 px-4 md:px-8 pb-64 md:pb-10 space-y-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-8 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Wealth Elite Sync</h1>
          <p className="text-[10px] font-bold text-emerald-600 tracking-[0.25em] uppercase mt-2">Operational Sync Node & Reconciliation</p>
        </div>
        <div className="bg-slate-50 px-5 py-3 rounded-lg border border-slate-200 text-right">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Last Sync Time</p>
          <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">
            {lastSync ? new Date(lastSync).toLocaleString("en-IN") : "No Recent Activity"}
          </p>
        </div>
      </div>

      {/* ERROR CONSOLE */}
      {fileError && (
        <div className="flex items-center gap-3 px-5 py-4 bg-rose-50 border border-rose-100 rounded-xl animate-in slide-in-from-top-4">
          <AlertCircle size={18} className="text-rose-600" />
          <p className="text-[10px] font-black text-rose-800 uppercase tracking-widest">{fileError}</p>
        </div>
      )}

      {/* UPLOAD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {configs.map((cfg) => {
          const isUploaded = !!files[cfg.id];
          const Icon = cfg.icon;
          return (
            <label 
              key={cfg.id} 
              className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                isUploaded 
                  ? "border-emerald-500 bg-white shadow-[0_10px_30px_-10px_rgba(16,185,129,0.2)]" 
                  : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-md"
              }`}
            >
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => handleFile(cfg.id, e.target.files[0])} />
              
              <div className={`w-12 h-12 mb-8 rounded-xl flex items-center justify-center transition-all ${isUploaded ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {isUploaded ? <FileCheck size={20} /> : <Icon size={20} />}
              </div>

              <div className="mb-8">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{cfg.label}</h4>
                <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wider mt-1 h-3 truncate">
                  {isUploaded ? files[cfg.id].name : cfg.desc}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between border-t pt-4 border-slate-50">
                <span className={`text-[9px] font-black uppercase ${isUploaded ? 'text-emerald-700' : 'text-slate-300'}`}>
                  {isUploaded ? 'File Ready' : 'Pending'}
                </span>
                {isUploaded ? <ChevronRight size={14} className="text-emerald-600" /> : <FilePlus size={14} className="text-slate-300" />}
              </div>
            </label>
          );
        })}
      </div>

      {/* SYNC ACTION FOOTER */}
      <div className="pt-6 border-t border-slate-100 flex justify-end">
        <button
          onClick={handleSync}
          disabled={Object.values(files).filter(Boolean).length < 3 || loading}
          className={`w-full md:w-auto px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
            loading || Object.values(files).filter(Boolean).length < 3
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-slate-900 text-white hover:bg-emerald-600 shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-95"
          }`}
        >
          {loading ? (
             <CloudSync className="animate-spin" size={16} /> 
          ) : (
             <Database size={16} />
          )}
          {loading ? "Calibrating..." : "Execute Master Sync"}
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