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
import { storage, auth } from "../../../../shared/firebase/firebase";
import { useApi } from '../../../../shared/hooks/useApi';

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

      // --- SIMPLIFIED STORAGE PATH LOGIC ---
      // 1. Family folder named ONLY by familyId
      const familyFolder = client.familyId || "unassigned";

      // 2. Client folder named ONLY by clientId
      const clientFolderName = client._id;

      // The directory structure: families/ID/ID
      const parentDir = `families/${familyFolder}/${clientFolderName}`;

      // 3. File saved EXACTLY as named by user (no timestamp)
      const storagePath = `${parentDir}/${file.name}`;
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

            // Add to Client's Private Document List
            await request(`/clients/${client._id}/documents`, "POST", {
              name: file.name,
              docType,
              storagePath,
              downloadUrl,
              uploadedBy: "Admin",
            });

            // Sync to Global Vault
            await request("/vault/sync", "POST", {
              name: file.name,
              type: "file",
              storagePath,
              downloadUrl,
              size: (file.size / 1024).toFixed(1) + " KB",
              parentPath: parentDir,
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
        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 block">
          Document Classification
        </label>
        <div className="grid grid-cols-1 gap-2">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            disabled={uploading}
            className="w-full bg-slate-50 dark:bg-[#131720] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-xs font-semibold focus:ring-2 focus:ring-sky-500 outline-none transition-all appearance-none cursor-pointer dark:text-white"
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
        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 block">
          File Attachment
        </label>
        {!file ? (
          <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-sky-500/5 hover:border-sky-500/50 transition-all group overflow-hidden">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload
                className="text-slate-300 dark:text-slate-600 group-hover:text-sky-500 transition-all group-hover:scale-110"
                size={32}
              />
              <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Browse local drive
              </p>
              <p className="text-[8px] text-slate-400 dark:text-slate-500 font-semibold uppercase mt-1">
                Raw filename preservation active
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
          <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-600 text-white rounded-md shadow-lg shadow-sky-500/20">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate max-w-35 uppercase tracking-tight">
                  {file.name}
                </p>
                <p className="text-[9px] font-mono text-sky-600 dark:text-sky-400 font-bold uppercase mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!uploading && (
              <button
                onClick={() => setFile(null)}
                className="p-1.5 hover:bg-sky-500/10 rounded-md transition-colors cursor-pointer"
              >
                <X size={16} className="text-sky-600 dark:text-sky-400" />
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/20 rounded-lg text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {uploading && (
        <div className="space-y-3 px-1">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <span className="animate-pulse">Syncing to Client Vault...</span>
            <span className="font-mono text-sky-600 dark:text-sky-400">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-[#131720] h-2 rounded-full overflow-hidden">
            <div
              className="bg-sky-500 h-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(14,165,233,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        {!uploading && (
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          disabled={!file || uploading}
          onClick={handleUpload}
          className="flex-2 bg-sky-600 hover:bg-sky-500 text-white py-3.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md active:scale-95 cursor-pointer"
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
