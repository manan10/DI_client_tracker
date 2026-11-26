import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  History,
  RefreshCw,
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
        <div className="h-10 bg-slate-100 dark:bg-[#1C2230] rounded-lg animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse h-14 bg-slate-50 dark:bg-[#131720] rounded-lg border border-slate-200/80 dark:border-slate-800"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* 1. Header & Search Toolstrip */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-sky-50 dark:bg-sky-500/10 border border-sky-200/70 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <History size={16} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="sora-font text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Monthly{" "}
                <span className="font-normal text-sky-600 dark:text-sky-300">
                  History
                </span>
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-[#1C2230] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                FY {fiscalYear}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
              {filteredHistory.length} saved{" "}
              {filteredHistory.length === 1 ? "month" : "months"}
            </p>
          </div>
        </div>

        {/* Search Field & Refresh */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={14}
            />
            <input
              type="text"
              placeholder="Search month (YYYY-MM)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/80 dark:bg-[#131720] border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-9 pr-3 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={fetchHistory}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-50 dark:bg-[#131720] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-sky-600 dark:hover:text-sky-300 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
            title="Refresh History"
          >
            <RefreshCw
              size={15}
              className={isLoading ? "animate-spin text-sky-500" : ""}
            />
          </button>
        </div>
      </div>

      {/* 2. History Table */}
      <div className="bg-white dark:bg-[#131720] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mb-2.5">
              <FileSpreadsheet size={18} />
            </div>
            <p className="sora-font text-xs font-bold text-slate-800 dark:text-slate-200">
              No Records Found
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {searchTerm
                ? `No entries match "${searchTerm}" for FY ${fiscalYear}.`
                : `No commission entries logged yet for FY ${fiscalYear}.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-170">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-[#1C2230] border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-3.5">Month</th>
                  <th className="px-5 py-3.5 text-center">AMC Breakdown</th>
                  <th className="px-5 py-3.5 text-right">Net Commission</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
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