import React, { useState, useEffect } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import HistoryRow from './HistoryRow'; // Adjust path based on your folder structure

const WorkspaceHistory = ({ arnId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/commissions/history/${arnId}`);
      const json = await res.json();
      if (json.success) setHistory(json.data);
    } catch {
      toast.error("Ledger sync failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [arnId]);

  const filteredHistory = history.filter(item => 
    item.accountingMonth.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-3 mt-8">
      {[1, 2, 3].map(i => <div key={i} className="animate-pulse h-14 bg-slate-50 dark:bg-slate-900/20 rounded-lg" />)}
    </div>
  );

  return (
    <div className="mt-12 space-y-6 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 px-2">
        <div className="flex flex-col gap-1">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 leading-none">History Ledger</h4>
          <span className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest">Showing {filteredHistory.length} recorded periods</span>
        </div>
        
        <div className="relative group w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={14} />
          <input 
            type="text"
            placeholder="FILTER BY MONTH (YYYY-MM)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-lg py-3 pl-11 pr-4 text-[10px] font-bold tracking-widest focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-transparent border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-950/60">
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Accounting Period</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Breakdown</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Commission</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-900/40">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((row) => (
                <HistoryRow key={row._id} row={row} onDeleteSuccess={fetchHistory} />
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-20 text-center">
                  <AlertCircle className="mx-auto text-slate-200 mb-3" size={32} />
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No historical data found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkspaceHistory;