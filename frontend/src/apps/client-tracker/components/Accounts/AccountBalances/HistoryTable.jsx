import React, { useState, useMemo } from "react";
import {
  Edit3,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
} from "lucide-react";
import { groupAccountsByOwner } from "./accountUtils";

const HistoryTable = ({
  accounts,
  history,
  selectedOwner = "ALL",
  groupedAccounts = {},
  accountOwnerMap = {},
  onEdit,
}) => {
  const [groupByEntity, setGroupByEntity] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [columnCount, setColumnCount] = useState(3);
  const [historyOffset, setHistoryOffset] = useState(0);

  const visibleHistory = useMemo(
    () => history.slice(historyOffset, historyOffset + columnCount),
    [history, historyOffset, columnCount],
  );

  const filteredAccounts = useMemo(() => {
    return [...accounts]
      .filter((acc) => {
        if (
          selectedOwner !== "ALL" &&
          accountOwnerMap[acc._id] !== selectedOwner
        ) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = acc.name?.toLowerCase().includes(q);
          const matchNum = acc.accountNumber?.toLowerCase().includes(q);
          return matchName || matchNum;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [accounts, selectedOwner, accountOwnerMap, searchQuery]);

  const tableSections = useMemo(() => {
    if (!groupByEntity) {
      return [{ key: "ALL", title: null, list: filteredAccounts }];
    }
    const grouped = groupAccountsByOwner(filteredAccounts);
    return Object.entries(grouped)
      .map(([key, grp]) => ({
        key,
        title: grp.name,
        list: grp.list.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [filteredAccounts, groupByEntity]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
      amount || 0,
    );

  return (
    <section className="w-full space-y-4 pt-1">
      {/* TABLE TOOLBAR: SEARCH, GROUPING & DATE NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search account or #number..."
              className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-white outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors"
            />
          </div>

          {/* Group by Holder Toggle */}
          <button
            type="button"
            onClick={() => setGroupByEntity((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              groupByEntity
                ? "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/30"
                : "bg-white dark:bg-[#161B26] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
            }`}
          >
            <Layers size={13} />
            <span>Group by Holder</span>
          </button>
        </div>

        {/* Date Columns & Pager */}
        {history.length > 0 && (
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-[#161B26] p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold">
              {[3, 5].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    setColumnCount(cnt);
                    setHistoryOffset(0);
                  }}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    columnCount === cnt
                      ? "bg-white dark:bg-[#1C2230] text-sky-600 dark:text-sky-300 shadow-2xs"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {cnt} Dates
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs">
              <button
                type="button"
                onClick={() => setHistoryOffset((o) => Math.max(0, o - 1))}
                disabled={historyOffset === 0}
                title="Newer dates"
                className="p-0.5 rounded text-slate-500 hover:text-sky-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="font-mono text-[11px] font-medium text-slate-600 dark:text-slate-300 px-1.5">
                {historyOffset + 1}–
                {Math.min(historyOffset + columnCount, history.length)} of{" "}
                {history.length}
              </span>
              <button
                type="button"
                onClick={() =>
                  setHistoryOffset((o) =>
                    o + columnCount < history.length ? o + 1 : o,
                  )
                }
                disabled={historyOffset + columnCount >= history.length}
                title="Older dates"
                className="p-0.5 rounded text-slate-500 hover:text-sky-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP ACCOUNT BALANCES TABLE */}
      <div className="hidden md:block bg-white dark:bg-[#161B26] rounded-lg border border-slate-200 dark:border-slate-800/80 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 dark:bg-[#1C2230] border-b border-slate-200 dark:border-slate-800/80">
              <th className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 min-w-[240px] border-r border-slate-200/80 dark:border-slate-800/80">
                Account Name
              </th>
              {visibleHistory.map((snap, idx) => {
                const isLatest = idx === 0 && historyOffset === 0;
                return (
                  <th
                    key={snap._id}
                    className="py-3.5 px-5 text-right border-r border-slate-200/80 dark:border-slate-800/80 last:border-r-0 min-w-[185px]"
                  >
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center justify-end gap-2">
                        {isLatest && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-200/70 dark:border-sky-500/25">
                            Latest
                          </span>
                        )}
                        <span className="sora-font text-slate-900 dark:text-white text-xs sm:text-sm font-bold tracking-tight">
                          {new Date(snap.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        {snap.note && (
                          <span
                            title={snap.note}
                            className="inline-flex items-center gap-1 text-[11px] font-normal text-slate-400 dark:text-slate-500 max-w-[120px] truncate"
                          >
                            <FileText size={10} className="shrink-0" />
                            {snap.note}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onEdit(snap)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/15 dark:hover:bg-sky-500/25 px-2.5 py-1 rounded-md border border-sky-200/80 dark:border-sky-500/30 transition-colors cursor-pointer active:scale-95"
                        >
                          <Edit3 size={11} strokeWidth={2.25} />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
            {filteredAccounts.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleHistory.length + 1}
                  className="py-12 text-center text-xs text-slate-500 dark:text-slate-400"
                >
                  No matching accounts found.
                </td>
              </tr>
            ) : (
              tableSections.map((section) => (
                <React.Fragment key={section.key}>
                  {/* Holder Group Header Row */}
                  {section.title && (
                    <tr className="bg-slate-50/80 dark:bg-[#131720]/90">
                      <td className="py-2.5 px-5 border-r border-slate-200/60 dark:border-slate-800/60">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-3.5 rounded-xs bg-sky-500" />
                          <span className="sora-font text-xs font-bold text-slate-800 dark:text-slate-200">
                            {section.title}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            ({section.list.length})
                          </span>
                        </div>
                      </td>
                      {visibleHistory.map((snap) => {
                        const groupTotal = section.list.reduce((sum, acc) => {
                          const item = snap.balances.find(
                            (b) => (b.accountId?._id || b.accountId) === acc._id,
                          );
                          return sum + (item?.amount || 0);
                        }, 0);
                        return (
                          <td
                            key={`${section.key}-${snap._id}`}
                            className="py-2.5 px-5 text-right font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums border-r border-slate-200/60 dark:border-slate-800/60 last:border-r-0"
                          >
                            ₹{formatCurrency(groupTotal)}
                          </td>
                        );
                      })}
                    </tr>
                  )}

                  {/* Account Rows */}
                  {section.list.map((acc) => {
                    const latestAmt =
                      history[0]?.balances.find(
                        (b) => (b.accountId?._id || b.accountId) === acc._id,
                      )?.amount || 0;
                    const prevAmt =
                      history[1]?.balances.find(
                        (b) => (b.accountId?._id || b.accountId) === acc._id,
                      )?.amount ?? latestAmt;
                    const rowDelta = latestAmt - prevAmt;

                    return (
                      <tr
                        key={acc._id}
                        className="hover:bg-sky-50/30 dark:hover:bg-white/[0.02] transition-colors group/row"
                      >
                        <td className="py-3.5 px-5 border-r border-slate-100 dark:border-slate-800/60 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                              {acc.name}
                            </p>
                            {acc.accountNumber && (
                              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100/80 dark:bg-slate-800/70 px-1.5 py-0.5 rounded shrink-0">
                                #{acc.accountNumber}
                              </span>
                            )}
                          </div>
                        </td>

                        {visibleHistory.map((snap, snapIdx) => {
                          const balanceItem = snap.balances.find(
                            (b) => (b.accountId?._id || b.accountId) === acc._id,
                          );
                          const amount = balanceItem?.amount || 0;
                          const isLatestCol =
                            snapIdx === 0 && historyOffset === 0;

                          return (
                            <td
                              key={snap._id}
                              className="py-3.5 px-5 text-right font-mono text-sm font-medium text-slate-800 dark:text-slate-200 tabular-nums border-r border-slate-100 dark:border-slate-800/60 last:border-r-0 group-hover/row:text-slate-950 dark:group-hover/row:text-white transition-colors"
                            >
                              <div className="flex flex-col items-end">
                                <span>₹{formatCurrency(amount)}</span>
                                {isLatestCol &&
                                  history.length > 1 &&
                                  rowDelta !== 0 && (
                                    <span
                                      className={`text-[10px] font-semibold ${
                                        rowDelta > 0
                                          ? "text-sky-600 dark:text-sky-400"
                                          : "text-rose-600 dark:text-rose-400"
                                      }`}
                                    >
                                      {rowDelta > 0 ? "+" : "-"}₹
                                      {formatCurrency(Math.abs(rowDelta))}
                                    </span>
                                  )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))
            )}
          </tbody>

          {/* TOTALS FOOTER */}
          {visibleHistory.length > 0 && (
            <tfoot className="bg-slate-50 dark:bg-[#1C2230] border-t-2 border-slate-200 dark:border-slate-800">
              <tr>
                <td className="py-4 px-5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 border-r border-slate-200/80 dark:border-slate-800/80">
                  {selectedOwner === "ALL"
                    ? "Total Balance"
                    : `${groupedAccounts[selectedOwner]?.name}'s Total`}
                </td>
                {visibleHistory.map((snap) => {
                  const scopedSnapTotal = filteredAccounts.reduce((sum, acc) => {
                    const item = snap.balances.find(
                      (b) => (b.accountId?._id || b.accountId) === acc._id,
                    );
                    return sum + (item?.amount || 0);
                  }, 0);

                  return (
                    <td
                      key={`total-${snap._id}`}
                      className="py-4 px-5 text-right font-mono text-sm sm:text-base font-bold text-sky-600 dark:text-sky-300 tabular-nums border-r border-slate-200/80 dark:border-slate-800/80 last:border-r-0"
                    >
                      ₹{formatCurrency(scopedSnapTotal)}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* MOBILE ACCOUNT CARDS */}
      <div className="md:hidden space-y-4">
        {visibleHistory.map((snap) => {
          const scopedSnapTotal = filteredAccounts.reduce((sum, acc) => {
            const item = snap.balances.find(
              (b) => (b.accountId?._id || b.accountId) === acc._id,
            );
            return sum + (item?.amount || 0);
          }, 0);

          return (
            <div
              key={snap._id}
              className="bg-white dark:bg-[#161B26] rounded-lg border border-slate-200 dark:border-slate-800/80 overflow-hidden flex flex-col"
            >
              <div className="h-[2px] w-full bg-sky-500" />

              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/60 dark:bg-[#1C2230]/60">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <Calendar
                      size={14}
                      className="text-sky-600 dark:text-sky-400"
                    />
                    <span className="sora-font text-xs font-semibold text-slate-900 dark:text-white">
                      {new Date(snap.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {snap.note && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                      {snap.note}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onEdit(snap)}
                  className="px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/15 border border-sky-200/80 dark:border-sky-500/30 rounded-md transition-colors outline-none flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 size={12} /> Edit
                </button>
              </div>

              <div className="p-4 flex flex-col gap-2.5">
                {filteredAccounts.map((acc) => {
                  const balanceItem = snap.balances.find(
                    (b) => (b.accountId?._id || b.accountId) === acc._id,
                  );
                  const amount = balanceItem?.amount || 0;
                  return (
                    <div
                      key={acc._id}
                      className="flex justify-between items-center py-0.5"
                    >
                      <div className="flex flex-col min-w-0 pr-4">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {acc.name}
                        </span>
                        {acc.accountNumber && (
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                            #{acc.accountNumber}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums shrink-0">
                        ₹{formatCurrency(amount)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/90 dark:bg-[#1C2230]">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Balance
                </span>
                <span className="font-mono text-sm font-bold text-sky-600 dark:text-sky-300 tabular-nums">
                  ₹{formatCurrency(scopedSnapTotal)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HistoryTable;