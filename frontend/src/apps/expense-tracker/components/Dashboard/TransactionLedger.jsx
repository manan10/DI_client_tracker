import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { History, MoveUpRight } from "lucide-react";
import DesktopLedgerTable from "./LedgerComponents/DesktopLedgerTable";
import MobileLedgerFeed from "./LedgerComponents/MobileLedgerFeed";

const getRelativeDateHeader = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();

  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const TransactionLedger = ({ recentHistory = [], wallets = [] }) => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleRow = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Group transactions chronologically for mobile timeline feed
  const groupedMobileTransactions = useMemo(() => {
    const groups = [];
    let currentHeader = "";
    let currentItems = [];

    recentHistory.forEach((item) => {
      const header = getRelativeDateHeader(item.date);
      if (header !== currentHeader) {
        if (currentItems.length > 0) {
          groups.push({ header: currentHeader, items: currentItems });
        }
        currentHeader = header;
        currentItems = [item];
      } else {
        currentItems.push(item);
      }
    });

    if (currentItems.length > 0) {
      groups.push({ header: currentHeader, items: currentItems });
    }

    return groups;
  }, [recentHistory]);

  return (
    <section className="lg:col-span-7 w-full flex flex-col pt-8 lg:pt-0 border-t lg:border-t-0 border-slate-200/80 dark:border-white/10 mt-8 lg:mt-0 min-w-0">
      {/* Header Strip */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/90 dark:border-white/10 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs shrink-0">
            <History size={16} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white leading-tight truncate">
                Recent Transactions
              </h3>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/10 shrink-0">
                {recentHistory.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Last 15 transactions
            </p>
          </div>
        </div>

        {/* Text link representation */}
        <Link
          to="/expenses/history"
          className="group inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors shrink-0 py-1"
        >
          <span className="underline decoration-emerald-500/40 underline-offset-4 group-hover:decoration-emerald-500">
            Check All
          </span>
          <MoveUpRight
            size={13}
            strokeWidth={2.5}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>

      {/* Desktop Sub-Component */}
      <DesktopLedgerTable
        recentHistory={recentHistory}
        wallets={wallets}
        expandedId={expandedId}
        toggleRow={toggleRow}
      />

      {/* Mobile Sub-Component */}
      <MobileLedgerFeed
        groupedMobileTransactions={groupedMobileTransactions}
        wallets={wallets}
        expandedId={expandedId}
        toggleRow={toggleRow}
      />

      {/* Empty State */}
      {recentHistory.length === 0 && (
        <div className="py-14 flex flex-col items-center justify-center text-center px-4 border border-dashed border-slate-200 dark:border-white/10 rounded-xl mt-3 bg-white/40 dark:bg-white/[0.01]">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2.5 text-slate-400">
            <History size={18} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
            No Activity Recorded
          </span>
          <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
            Expenses and account top-ups will stream chronologically into this statement view.
          </p>
        </div>
      )}
    </section>
  );
};

export default TransactionLedger;