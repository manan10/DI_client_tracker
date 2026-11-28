import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  History,
  MoveUpRight,
  X,
  SlidersHorizontal,
  Filter,
} from "lucide-react";
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

const isSystemEntry = (item) => {
  const rawCat =
    item.category && typeof item.category === "object"
      ? item.category.label
      : item.category || "";
  const desc = (item.description || "").toLowerCase();
  return (
    String(rawCat).toUpperCase() === "SYSTEM" ||
    Boolean(item.targetWallet) ||
    desc.includes("internal transfer") ||
    desc.includes("reconciliation sync") ||
    desc.includes("top-up allocated")
  );
};

const TransactionLedger = ({
  recentHistory = [],
  wallets = [],
  filteredWallet = null,
  onClearFilter = () => {},
  onOpenWalletActions = () => {},
}) => {
  const [expandedId, setExpandedId] = useState(null);
  const [hideSystem, setHideSystem] = useState(false);

  const toggleRow = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const visibleHistory = useMemo(() => {
    if (!hideSystem) return recentHistory;
    return recentHistory.filter((item) => !isSystemEntry(item));
  }, [recentHistory, hideSystem]);

  // Group transactions chronologically for mobile timeline feed
  const groupedMobileTransactions = useMemo(() => {
    const groups = [];
    let currentHeader = "";
    let currentItems = [];

    visibleHistory.forEach((item) => {
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
  }, [visibleHistory]);

  return (
    <section
      style={{ fontFamily: "'Nunito Sans', sans-serif" }}
      className="w-full flex flex-col pt-4 lg:pt-0 min-w-0"
    >
      {/* Top Section Sub-Heading */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-200/90 dark:border-white/[0.07] mb-3.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1 h-3.5 rounded-full bg-emerald-700 dark:bg-[#4EA885] shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-stone-800 dark:text-stone-100 truncate">
            Recent Transactions
          </h3>
          <span
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-white/[0.06] text-stone-700 dark:text-stone-200 shrink-0"
          >
            {visibleHistory.length}
          </span>
        </div>

        {/* Right Controls: System Noise Toggle + Full Archive Link */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setHideSystem((prev) => !prev)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer touch-manipulation ${
              hideSystem
                ? "bg-emerald-700/12 dark:bg-[#4EA885]/20 text-emerald-800 dark:text-[#86D4B4]"
                : "bg-stone-200/60 dark:bg-white/[0.05] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
            title="Toggle internal transfers and reconciliation sync entries"
          >
            {hideSystem ? "Spend Only" : "All Types"}
          </button>

          <Link
            to="/expenses/history"
            className="group inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-[#68C19D] hover:text-emerald-800 dark:hover:text-[#86D4B4] transition-colors shrink-0 py-0.5"
          >
            <span className="underline decoration-emerald-700/40 dark:decoration-[#4EA885]/50 underline-offset-4 group-hover:decoration-emerald-700 dark:group-hover:decoration-[#68C19D]">
              All Records
            </span>
            <MoveUpRight
              size={12}
              strokeWidth={2.5}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </div>

      {/* Dedicated Active Filter Bar (Only Visible When Filtered by a Wallet) */}
      {filteredWallet && (
        <div className="-mx-4 sm:mx-0 mb-3.5 px-4 py-2.5 sm:px-4 sm:py-2.5 sm:rounded-xl bg-emerald-50/85 dark:bg-[#4EA885]/[0.14] border-y sm:border border-emerald-700/20 dark:border-[#4EA885]/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Filter
              size={13}
              className="text-emerald-700 dark:text-[#68C19D] shrink-0"
            />
            <span className="text-xs font-medium text-stone-700 dark:text-stone-200 truncate">
              Filtered by{" "}
              <strong
                style={{ fontFamily: "'Lora', serif" }}
                className="font-bold text-stone-950 dark:text-white"
              >
                {filteredWallet.walletName}
              </strong>{" "}
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                (Last 10)
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onOpenWalletActions(filteredWallet)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1A1C20] hover:bg-stone-50 text-stone-700 dark:text-stone-200 text-[10.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer touch-manipulation shadow-2xs"
            >
              <SlidersHorizontal size={11} />
              <span>Actions</span>
            </button>

            <button
              type="button"
              onClick={onClearFilter}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 dark:bg-[#4EA885] hover:bg-emerald-800 dark:hover:bg-[#68C19D] text-white dark:text-[#121315] text-[10.5px] font-bold uppercase tracking-wider shadow-2xs transition-colors cursor-pointer touch-manipulation"
            >
              <span>Reset Filter</span>
              <X size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sub-Component */}
      <DesktopLedgerTable
        recentHistory={visibleHistory}
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
      {visibleHistory.length === 0 && (
        <div className="-mx-4 sm:mx-0 py-12 flex flex-col items-center justify-center text-center px-4 border-y sm:border border-stone-200/80 dark:border-white/[0.07] sm:rounded-2xl bg-white dark:bg-[#1A1C20]">
          <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-white/[0.06] flex items-center justify-center mb-2 text-stone-500 dark:text-stone-400">
            <History size={16} />
          </div>
          <span
            style={{ fontFamily: "'Lora', serif" }}
            className="text-sm font-bold tracking-tight text-stone-900 dark:text-white"
          >
            {filteredWallet
              ? `No Entries for ${filteredWallet.walletName}`
              : hideSystem
              ? "No Direct Expenses in Recent Entries"
              : "No Activity Recorded"}
          </span>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm">
            {filteredWallet
              ? "Tap Actions above to log an expense or top-up for this account."
              : hideSystem
              ? "Switch to All Types above to view internal transfers and balance syncs."
              : "Expenses and account top-ups will appear chronologically here."}
          </p>
        </div>
      )}
    </section>
  );
};

export default TransactionLedger;