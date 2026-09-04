import React, { useEffect } from "react";
import { X, FileText, Download, Calendar } from "lucide-react";

const FilePreview = ({ file, onClose, onDownload }) => {
  // Listen for ESC key specifically when this component is mounted
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    
    // Cleanup the listener when the preview closes
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!file) return null;

  const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name);
  
  const dateDisplay = file.createdAt 
    ? new Date(file.createdAt).toLocaleDateString() 
    : "Recently Added";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-90 animate-in fade-in" onClick={onClose}>
      <div 
        className="fixed inset-y-0 right-0 w-full lg:w-212.5 bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform duration-500 border-l border-slate-200 dark:border-slate-800" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black uppercase truncate leading-none dark:text-white">{file.name}</h2>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{file.size}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onDownload} className="p-2 text-slate-500 hover:text-emerald-600 transition-colors" title="Download">
              <Download size={20} />
            </button>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
          {isImage ? (
            <img src={file.downloadUrl} className="w-full h-full object-contain" alt="Preview" />
          ) : (
            <iframe src={file.downloadUrl} className="w-full h-full border-none" title="Viewer" />
          )}
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
           <div className="flex items-center gap-3 text-slate-400">
              <Calendar size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Added: {dateDisplay}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;