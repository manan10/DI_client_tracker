import React from 'react';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SyncStatusModal = ({ isOpen, onClose, success, summary }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="p-8 text-center">
          {success ? (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-6">
                <CheckCircle2 size={48} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">
                Sync Successful
              </h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Your Wealth Elite records have been processed. 
                <span className="block font-bold text-slate-700 mt-1">
                  {summary?.processed || 0} clients are now up to date.
                </span>
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-50 rounded-full mb-6">
                <XCircle size={48} className="text-rose-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">
                Sync Failed
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                There was an error processing your Excel files. Please check the file formatting and try again.
              </p>
            </>
          )}

          <div className="space-y-3">
            <button
              onClick={() => {
                onClose();
                navigate('/directory');
              }}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              Go to Directory <ArrowRight size={16} />
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
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