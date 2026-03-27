import React, { useState } from "react";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { signInWithCustomToken } from "firebase/auth";
import { storage, auth } from "../../firebase";
import { useApi } from "../../hooks/useApi";

const DocumentUploadForm = ({ client, onUploadSuccess, onCancel }) => {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("Aadhar");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const { request } = useApi();

  const docTypes = [
    "Aadhar",
    "PAN",
    "Passport",
    "Voter ID",
    "Tax Return",
    "Portfolio Statement",
    "Other",
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError(null);

    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !client) return;

    setUploading(true);
    setError(null);

    try {
      if (!auth.currentUser) {
        const authData = await request("/auth/firebase-token", "GET");
        if (!authData?.token)
          throw new Error("Could not retrieve security token.");
        await signInWithCustomToken(auth, authData.token);
      }

      // --- IMPROVED STORAGE PATH LOGIC ---
      const timestamp = Date.now();
      const familyFolder = client.familyId || "unassigned";
      const safeName = (client.name || "CLIENT")
        .replace(/\s+/g, "_")
        .toUpperCase();
      const clientFolderName = `${safeName}_${client._id}`;

      // The directory where the file lives (The Parent)
      const parentDir = `families/${familyFolder}/${clientFolderName}`;

      // Full Path of the actual file
      const storagePath = `${parentDir}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const prog = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          );
          setProgress(prog);
        },
        (err) => {
          console.error("Firebase Storage Error:", err);
          setError("Storage upload failed.");
          setUploading(false);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

            // 1. Add to Client's Private Document List
            await request(`/clients/${client._id}/documents`, "POST", {
              name: file.name,
              docType,
              storagePath,
              downloadUrl,
              uploadedBy: "Admin",
            });

            // 2. Sync to Global Vault (The "Documents" Tab)
            // This ensures it shows up in the file browser tree
            await request("/vault/sync", "POST", {
              name: file.name,
              type: "file",
              storagePath,
              downloadUrl,
              size: (file.size / 1024).toFixed(1) + " KB",
              parentPath: parentDir, // Points to the folder it belongs in
            });

            setUploading(false);
            onUploadSuccess();
          } catch (dbErr) {
            console.error("Database Sync Error:", dbErr);
            setError("File uploaded, but database sync failed.");
            setUploading(false);
          }
        },
      );
    } catch (err) {
      setError(err.message || "Connection failed.");
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">
          Document Classification
        </label>
        <div className="grid grid-cols-1 gap-2">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            disabled={uploading}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none cursor-pointer"
          >
            {docTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">
          File Attachment
        </label>
        {!file ? (
          <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl cursor-pointer hover:bg-amber-500/5 hover:border-amber-500/50 transition-all group overflow-hidden">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload
                className="text-slate-300 group-hover:text-amber-500 transition-all group-hover:scale-110"
                size={32}
              />
              <p className="mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Browse local drive
              </p>
              <p className="text-[8px] text-slate-300 font-bold uppercase mt-1">
                PDF, JPG, PNG (Max 10MB)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </label>
        ) : (
          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 truncate max-w-35 uppercase tracking-tight">
                  {file.name}
                </p>
                <p className="text-[9px] text-amber-600 font-black uppercase mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!uploading && (
              <button
                onClick={() => setFile(null)}
                className="p-1.5 hover:bg-amber-500/10 rounded-lg transition-colors"
              >
                <X size={16} className="text-amber-600" />
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-[10px] font-bold uppercase">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {uploading && (
        <div className="space-y-3 px-1">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span className="animate-pulse">
              Transferring to Mumbai Vault...
            </span>
            <span className="text-amber-600">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        {!uploading && (
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
        )}
        <button
          disabled={!file || uploading}
          onClick={handleUpload}
          className="flex-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-slate-200 dark:shadow-none active:scale-95"
        >
          {uploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <CheckCircle2 size={16} />
          )}
          {uploading ? "Processing" : "Commit to Vault"}
        </button>
      </div>
    </div>
  );
};

export default DocumentUploadForm;
