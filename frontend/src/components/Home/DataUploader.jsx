import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import SyncStatusModal from "./SyncResultModal";

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
    { id: "aum", label: "AUM Report", icon: "💰" },
    { id: "family", label: "Family List", icon: "🏠" },
    { id: "nonfam", label: "Non-Family List", icon: "👤" },
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

    // Validation: Only allow .xlsx and .xls
    const allowedExtensions = /(\.xlsx|\.xls)$/i;
    const isExcel = allowedExtensions.exec(file.name);

    if (!isExcel) {
      setFileError(`Invalid file: ${file.name}. Please upload an Excel file.`);
      return;
    }

    setFileError(""); // Clear errors if valid
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
      const errorMessage = err.response?.data?.error || "Sync failed. Check server connection.";
      setFileError(errorMessage);
      setSyncStatus({ isOpen: true, success: false, summary: null });
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-md">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">
            Wealth Elite Sync
          </h3>
          <p
            className={`text-[10px] font-bold uppercase tracking-widest ${lastSync ? "text-emerald-600" : "text-slate-400"}`}
          >
            {lastSync
              ? `Last synced: ${new Date(lastSync).toLocaleString("en-IN")}`
              : "Never synced"}
          </p>
        </div>
      </div>

      {/* Error Message Alert */}
      {fileError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] font-bold text-rose-600 uppercase tracking-tight">
          ⚠️ {fileError}
        </div>
      )}

      <div className="space-y-4 mb-6">
        {configs.map((cfg) => (
          <label
            key={cfg.id}
            className={`flex items-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              files[cfg.id]
                ? "border-emerald-200 bg-emerald-50"
                : "border-slate-100 bg-slate-50 hover:border-blue-200"
            }`}
          >
            {/* Added 'accept' attribute to file explorer */}
            <input
              type="file"
              className="hidden"
              accept=".xlsx, .xls"
              onChange={(e) => handleFile(cfg.id, e.target.files[0])}
            />
            <span className="text-2xl mr-4">{cfg.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">
                {cfg.label}
              </p>
              <p className="text-[10px] font-bold text-slate-400 truncate w-40 uppercase">
                {files[cfg.id] ? files[cfg.id].name : "Select file..."}
              </p>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={handleSync}
        disabled={!files.aum || !files.family || !files.nonfam || loading}
        className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] text-white transition-all ${
          loading || !files.aum || !files.family || !files.nonfam
            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
            : "bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-100" // Updated to Amber/Gold
        }`}
      >
        {loading ? "Processing Wealth Elite..." : "Start Full Sync"}
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
