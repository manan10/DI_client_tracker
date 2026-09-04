import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SyncStatusModal = ({ isOpen, onClose, success, summary }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="flex justify-end p-3 pb-0">
           <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md transition-colors">
              <X size={16} />
           </button>
        </div>

        <div className="p-6 pt-2 text-center flex flex-col items-center">
          
          {success ? (
            <>
              <div className="flex items-center justify-center w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 rounded-full mb-4 shrink-0 shadow-sm">
                <CheckCircle2 size={28} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                Sync Successful
              </h2>
              <div className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md border border-slate-100 dark:border-white/5 w-full">
                Database has been updated. 
                <span className="block font-black text-emerald-700 dark:text-emerald-400 mt-1 uppercase tracking-wider">
                  {summary?.processed || 0} Records Processed
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-14 h-14 bg-rose-100 dark:bg-rose-500/20 rounded-full mb-4 shrink-0 shadow-sm">
                <XCircle size={28} className="text-rose-600 dark:text-rose-500" />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                Sync Failed
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-md border border-rose-100 dark:border-rose-500/20 w-full">
                There was an error processing your Excel files. Please check the file formatting and structural integrity.
              </p>
            </>
          )}

          <div className="w-full space-y-2">
            <button
              onClick={() => {
                onClose();
                navigate('/directory');
              }}
              className="w-full bg-indigo-600 text-white py-3 rounded-md font-bold text-xs uppercase tracking-wider hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              View Directory <ArrowRight size={14} />
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              Dismiss
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SyncStatusModal;