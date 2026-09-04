import React from 'react';
import { Clock, X, Activity, FileText, Calendar } from 'lucide-react';

const VaultRegistry = ({ activities, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="text-emerald-600" size={20} />
            <h2 className="text-sm font-black uppercase tracking-widest">Action History</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Clock size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No recent actions</p>
            </div>
          ) : (
            activities.map((log) => (
              <div key={log._id} className="bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex gap-4">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg h-fit shadow-sm">
                  <FileText size={16} className="text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black uppercase text-slate-900 dark:text-white leading-tight">
                    {log.action.replace('_', ' ')}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 mt-1 truncate">
                    {log.fileName || log.details}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-emerald-600">
                    <Calendar size={10} />
                    <span className="text-[9px] font-black">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VaultRegistry;