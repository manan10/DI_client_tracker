import React, { useState, useEffect, useCallback } from 'react';
import { Search, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import HistoryRow from './HistoryRow';
import { useApi } from '../../../hooks/useApi';

const WorkspaceHistory = ({ arnId, fiscalYear }) => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { request, loading: apiLoading } = useApi();
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!arnId) return;
    setIsSyncing(true);
    try {
      const json = await request(`/commissions/history/${arnId}?fiscalYear=${fiscalYear}`);
      setHistory(json.success ? json.data : []);
    } catch (err) {
      if (err.response?.status === 404) setHistory([]);
      else toast.error("Ledger history sync failed");
    } finally {
      setIsSyncing(false);
    }
  }, [arnId, fiscalYear, request]);

  useEffect(() => {
    let active = true;
    const loadData = async () => { if (active) await fetchHistory(); };
    loadData();
    return () => { active = false; };
  }, [fetchHistory]);

  const filteredHistory = history.filter(item => 
    item.accountingMonth.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = isSyncing || apiLoading;

  if (isLoading && history.length === 0) return (
    <div className="space-y-3 mt-8">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse h-14 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-100 dark:border-slate-800" />
      ))}
    </div>
  );

  return (
    <div className="mt-12 space-y-6 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 px-2">
        <div className="flex flex-col gap-1">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 leading-none">History Ledger</h4>
          <span className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest">
            {isLoading ? "Syncing..." : `FY ${fiscalYear} | ${filteredHistory.length} Periods`}
          </span>
        </div>
        <div className="relative group w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={14} />
          <input 
            type="text"
            placeholder="FILTER BY MONTH (YYYY-MM)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-lg py-3 pl-11 pr-4 text-[10px] font-bold tracking-widest focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all placeholder:text-slate-300 uppercase"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-transparent border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
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
              {filteredHistory.map((row) => <HistoryRow key={row._id} row={row} onDeleteSuccess={fetchHistory} />)}
            </tbody>
          </table>
        </div>
        {/* Mobile View Placeholder */}
        <div className="md:hidden">
            {filteredHistory.map((row) => <HistoryRow key={row._id} row={row} onDeleteSuccess={fetchHistory} />)}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceHistory;