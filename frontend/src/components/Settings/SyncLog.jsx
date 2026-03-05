import React from 'react';
import { FileSpreadsheet, AlertCircle, Trash2 } from 'lucide-react';

const SyncLog = () => {
  const logs = [
    { date: '2026-03-05 10:30 AM', file: 'AUM_Report_March.xlsx', status: 'Success', records: 142 },
    { date: '2026-02-28 04:15 PM', file: 'Family_Master_V2.xlsx', status: 'Success', records: 89 },
    { date: '2026-02-15 09:00 AM', file: 'AUM_Report_Feb.xlsx', status: 'Partial', records: 138 }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <header className="mb-10">
        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Sync History</h3>
      </header>

      <div className="space-y-4">
        {logs.map((log, index) => (
          <div key={index} className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${log.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase">{log.file}</p>
                <p className="text-[10px] font-bold text-slate-400">{log.date}</p>
              </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${
              log.status === 'Success' ? 'border-emerald-100 text-emerald-600' : 'border-amber-100 text-amber-600'
            }`}>
              {log.status}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800">
         <button className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest">
           <Trash2 size={16} /> Clear Local Sync Cache
         </button>
      </div>
    </div>
  );
};

export default SyncLog;