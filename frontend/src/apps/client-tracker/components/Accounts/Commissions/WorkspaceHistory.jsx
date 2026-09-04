import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  History,
  Calendar,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import HistoryRow from "./HistoryRow";
import { useApi } from "../../../../../shared/hooks/useApi";

const WorkspaceHistory = ({ arnId, fiscalYear }) => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { request, loading: apiLoading } = useApi();
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!arnId) return;
    setIsSyncing(true);
    try {
      const json = await request(
        `/commissions/history/${arnId}?fiscalYear=${fiscalYear}`,
      );
      setHistory(json.success ? json.data : []);
    } catch (err) {
      if (err.response?.status === 404) setHistory([]);
      else toast.error("Failed to load history entries");
    } finally {
      setIsSyncing(false);
    }
  }, [arnId, fiscalYear, request]);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (active) await fetchHistory();
    };
    loadData();
    return () => {
      active = false;
    };
  }, [fetchHistory]);

  const filteredHistory = history.filter((item) =>
    item.accountingMonth?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const isLoading = isSyncing || apiLoading;

  if (isLoading && history.length === 0) {
    return (
      <div className="space-y-3 mt-4">
        <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse h-14 bg-white dark:bg-[#0B1120] rounded-xl border border-slate-200/80 dark:border-white/10"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Header & Live Search Toolstrip */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
            <History size={16} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Commission History Ledger
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                FY {fiscalYear}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
              {filteredHistory.length} Reconciled Statement
              {filteredHistory.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {/* Search Field & Refresh Trigger */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={14}
            />
            <input
              type="text"
              placeholder="Search period (YYYY-MM)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/80 dark:bg-[#0E1626] border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={fetchHistory}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
            title="Refresh History Entries"
          >
            <RefreshCw
              size={15}
              className={isLoading ? "animate-spin text-emerald-500" : ""}
            />
          </button>
        </div>
      </div>

      {/* 2. Ledger Container */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-xs">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 mb-3">
              <FileSpreadsheet size={20} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              No History Records Found
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
              {searchTerm
                ? `No commission entries match "${searchTerm}" for FY ${fiscalYear}.`
                : `No commission entries have been logged yet for FY ${fiscalYear}.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-170">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-white/2 border-b border-slate-200 dark:border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="px-5 py-3.5">Accounting Period</th>
                  <th className="px-5 py-3.5 text-center">AMC Breakdown</th>
                  <th className="px-5 py-3.5 text-right">Net Commission</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                {filteredHistory.map((row) => (
                  <HistoryRow
                    key={row._id}
                    row={row}
                    onDeleteSuccess={fetchHistory}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceHistory;
