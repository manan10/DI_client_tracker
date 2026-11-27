import React, { useState, useEffect } from "react";
import { 
  FileCheck, 
  AlertCircle, 
  BarChart3, 
  Home, 
  User, 
  FilePlus, 
  ChevronRight, 
  Clock, 
  Loader2, 
  Upload,
  Sparkles,
  X
} from "lucide-react";
import { toast } from "sonner";

import { useApi } from "../../../hooks/useApi";
import SyncStatusModal from "./SyncResultModal";
import PageHeader from "../../../components/Auth/PageHeader";

const DataSync = () => {
  const [files, setFiles] = useState({ aum: null, family: null, nonfam: null });
  const [lastSync, setLastSync] = useState(null);
  const [fileError, setFileError] = useState(""); 
  const [syncStatus, setSyncStatus] = useState({ isOpen: false, success: false, summary: null });
  const { request, loading } = useApi();

  const configs = [
    { 
      id: "aum", 
      label: "Client AUM Report", 
      desc: "Assets under management and current portfolio values", 
      icon: BarChart3 
    }, 
    { 
      id: "family", 
      label: "Family Master List", 
      desc: "Groupings that link family members and accounts together", 
      icon: Home 
    }, 
    { 
      id: "nonfam", 
      label: "Individual Client Records", 
      desc: "Client contact information, PANs, and individual details", 
      icon: User 
    },
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
      setFileError(`Invalid format: ${file.name}. Only Excel files (.xlsx or .xls) are supported.`);
      return;
    }
    setFileError(""); 
    setFiles((prev) => ({ ...prev, [id]: file }));
  };

  const handleRemoveFile = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setFiles((prev) => ({ ...prev, [id]: null }));
  };

  const handleSync = async () => {
    const aumBlob = Array.isArray(files.aum) || files.aum instanceof FileList ? files.aum[0] : files.aum;
    const famBlob = Array.isArray(files.family) || files.family instanceof FileList ? files.family[0] : files.family;
    const nfBlob = Array.isArray(files.nonfam) || files.nonfam instanceof FileList ? files.nonfam[0] : files.nonfam;

    if (!aumBlob || !famBlob || !nfBlob) {
      return toast.error("Missing Files", { 
        description: "Please upload all 3 Excel files before starting the sync." 
      });
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
      toast.success("Client data updated successfully.");
    } catch (err) {
      console.error("Sync Request Failed:", err);
      setSyncStatus({ isOpen: true, success: false, summary: null });
      toast.error(err?.message || "Something went wrong while importing the files.");
    } 
  };

  const readyFilesCount = Object.values(files).filter(Boolean).length;
  const isReadyToSync = readyFilesCount === 3;

  return (
    <div className="w-full max-w-[100rem] mx-auto space-y-6 animate-in fade-in duration-300 min-w-0 pb-32">
      
      {/* Universal Page Header */}
      <PageHeader 
        title="Wealth Elite"
        accent="Data Sync"
        description="Upload your latest Excel exports from Wealth Elite to refresh client portfolios, update family groups, and recalculate tiers."
      />

      {/* Status & Sync Trigger Strip */}
      <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-md bg-slate-50 dark:bg-[#1C2230] text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700/80">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Last Completed Update
            </p>
            <p className="sora-font text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {lastSync ? new Date(lastSync).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Never updated"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden md:block">
            {readyFilesCount} of 3 files attached
          </span>
          <button
            type="button"
            onClick={handleSync}
            disabled={!isReadyToSync || loading}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99]
              ${loading || !isReadyToSync
                ? "bg-slate-100 dark:bg-[#1C2230] text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700/80"
                : "bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white shadow-sm"
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={15} />
                <span>Importing Data...</span>
              </>
            ) : (
              <>
                <Upload size={15} />
                <span>Start Import ({readyFilesCount}/3)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {fileError && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg animate-in slide-in-from-top-2 text-rose-800 dark:text-rose-300">
          <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold leading-relaxed">{fileError}</p>
        </div>
      )}

      {/* File Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {configs.map((cfg) => {
          const file = files[cfg.id];
          const isUploaded = !!file;
          const Icon = cfg.icon;
          
          return (
            <label 
              key={cfg.id} 
              className={`relative flex flex-col justify-between p-5 rounded-lg border-2 transition-all duration-200 cursor-pointer overflow-hidden shadow-xs group min-h-[190px]
                ${isUploaded 
                  ? "border-sky-500 bg-sky-50/40 dark:bg-sky-500/10" 
                  : "border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#161B26] hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-[#1C2230]/50"
                }`}
            >
              <input 
                type="file" 
                className="hidden" 
                accept=".xlsx, .xls" 
                onChange={(e) => {
                  handleFile(cfg.id, e.target.files[0]);
                  e.target.value = null;
                }} 
              />
              
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 transition-colors border
                    ${isUploaded 
                      ? 'bg-sky-600 border-sky-600 text-white shadow-xs' 
                      : 'bg-slate-50 dark:bg-[#1C2230] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/80'
                    }`}
                  >
                    {isUploaded ? <FileCheck size={18} /> : <Icon size={18} />}
                  </div>
                  
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors
                    ${isUploaded 
                      ? 'bg-sky-600 border-sky-600 text-white' 
                      : 'bg-transparent border-slate-300 dark:border-slate-600 group-hover:border-slate-400'
                    }`}
                  >
                    {isUploaded && <FileCheck size={12} strokeWidth={3.5} />}
                  </div>
                </div>

                <h4 className="sora-font text-sm font-bold text-slate-900 dark:text-white">
                  {cfg.label}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {cfg.desc}
                </p>
              </div>

              {/* Upload Status / Attachment Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between min-w-0">
                <span className={`text-xs font-semibold truncate mr-2
                  ${isUploaded ? 'text-sky-700 dark:text-sky-300 font-mono' : 'text-slate-400 dark:text-slate-500'}`}
                >
                  {isUploaded ? file.name : 'Click to choose file...'}
                </span>
                
                {isUploaded ? (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveFile(e, cfg.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md shrink-0 transition-colors"
                    title="Remove file"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <span className="shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                    <FilePlus size={15} />
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Informational Guidance Note */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80">
        <Sparkles size={16} className="text-sky-600 dark:text-sky-400 shrink-0" />
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
          For the most accurate client balances, export all three files from Wealth Elite at the same time so their dates and values match.
        </p>
      </div>

      {/* Result Status Modal */}
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