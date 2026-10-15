import React, { useState } from "react";
import {
  History,
  Search,
  CreditCard,
  ArrowRight,
  Edit3,
  Trash2,
  Clock,
  Tag,
  TrendingDown,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { getWalletColor } from "../Dashboard/walletUtils";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.abs(amount || 0)
  );
};

// Formats text into proper case: 1st letter capitalized, rest lowercase per word
const toProperCase = (str = "") => {
  if (!str || typeof str !== "string") return "";
  return String(str)
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const IconRenderer = ({ iconName, className = "" }) => {
  const IconComponent = LucideIcons[iconName] || CreditCard;
  return <IconComponent size={14} className={className} />;
};

const HistoryTimelineStream = ({
  loading,
  transactionsCount,
  groupedTransactions = [],
  onEditClick,
  onDeleteClick,
  wallets = [],
  selectedMonthName,
  selectedYear,
}) => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleRow = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="w-full flex flex-col pt-3 sm:pt-4 select-none antialiased">
      {/* ── Top Statement Summary Header (Full-Width) ── */}
      <div className="mb-7 flex items-center justify-between pb-3 sm:pb-4 w-full px-1 sm:px-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
            <History size={18} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-900 dark:text-white leading-tight truncate">
              Activity History
            </h2>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Transactions & payment timeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-300/80 dark:border-white/10 font-mono text-xs font-bold shrink-0 ml-2 shadow-2xs">
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
            {transactionsCount}
          </span>
          <span className="uppercase text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Records
          </span>
        </div>
      </div>

      {/* ── Feed Content ── */}
      {loading && transactionsCount === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-emerald-500/20 border-t-emerald-500" />
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Updating History...
          </p>
        </div>
      ) : groupedTransactions.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center px-4 border-2 border-dashed border-slate-300 dark:border-white/15 rounded-sm bg-slate-50/70 dark:bg-white/[0.01] max-w-xl mx-auto w-full my-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-2 text-slate-400">
            <Search size={20} />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-slate-200">
            No Transactions Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            No entries found for {selectedMonthName} {selectedYear}.
          </p>
        </div>
      ) : (
        /* Increased vertical separation between date blocks on mobile and desktop */
        <div className="space-y-10 sm:space-y-12 w-full">
          {groupedTransactions.map((group, groupIdx) => {
            const dayNum = group.header?.dayNumber || "01";
            const monthText =
              group.header?.monthName ||
              selectedMonthName?.slice(0, 3)?.toUpperCase() ||
              "OCT";
            const dayText = group.header?.dayName || "";

            return (
              <div key={groupIdx} className="flex flex-col w-full">
                {/* ── Two-Tone Date Group Header (Enlarged on Desktop) ── */}
                <div className="flex items-center gap-2.5 sm:gap-3.5 px-1 mb-3 sm:mb-4 w-full min-w-0">
                  <div className="inline-flex items-stretch rounded-sm bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-slate-200/90 dark:border-white/10 shadow-2xs overflow-hidden shrink-0">
                    <span className="px-2.5 sm:px-3.5 py-1 text-xs sm:text-xl font-mono font-black leading-none flex items-center tracking-tight">
                      {dayNum}
                    </span>
                    <span className="px-2 sm:px-2.5 py-1 text-[9px] sm:text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 flex items-center">
                      {monthText}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-slate-500 dark:text-slate-400">
                    {dayText && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wide">
                        {dayText}
                      </span>
                    )}
                    {group.header?.tag && (
                      <span className="ml-1 px-2 py-0.5 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider rounded-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                        {group.header.tag}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 h-px bg-slate-200/80 dark:bg-white/10 ml-2" />
                </div>

                {/* ── Continuous Segment List Table ── */}
                <div className="w-full overflow-hidden rounded-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] shadow-2xs">
                  {/* Table Header Strip */}
                  <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-slate-200 dark:border-white/10 select-none text-xs font-mono font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-slate-100/80 dark:bg-white/[0.04]">
                    <div className="col-span-5">Expense / Item</div>
                    <div className="col-span-4">Paid From</div>
                    <div className="col-span-2 text-right pr-2">Amount</div>
                    <div className="col-span-1 text-right pr-1">Actions</div>
                  </div>

                  {/* List Rows */}
                  <div className="flex flex-col divide-y divide-slate-100 dark:divide-white/5">
                    {group.items.map((item) => {
                      const isExpanded = expandedId === item._id;
                      const isPopulated =
                        item.category && typeof item.category === "object";
                      const rawCategory = isPopulated
                        ? item.category.label
                        : item.category || "General";
                      const rawSubCategory =
                        item.subCategory || "General Expense";

                      const categoryLabel = toProperCase(rawCategory);
                      const subCategoryLabel = toProperCase(rawSubCategory);
                      const categoryIcon = isPopulated
                        ? item.category.icon
                        : "CreditCard";

                      const sourceWalletIndex = wallets.findIndex(
                        (w) =>
                          w._id === (item.sourceWallet?._id || item.sourceWallet)
                      );
                      const sourceWallet = wallets[sourceWalletIndex];
                      const sourceName =
                        sourceWallet?.walletName || "Direct Spend";
                      const sourcePalette = getWalletColor(
                        sourceWallet?._id || sourceName,
                        sourceWalletIndex >= 0 ? sourceWalletIndex : null
                      );

                      const targetWalletIndex = wallets.findIndex(
                        (w) =>
                          w._id === (item.targetWallet?._id || item.targetWallet)
                      );
                      const targetWallet = wallets[targetWalletIndex];
                      const targetName = targetWallet?.walletName;
                      const targetPalette = targetWallet
                        ? getWalletColor(targetWallet._id, targetWalletIndex)
                        : null;

                      const isDebit =
                        item.type === "DEBIT" || (!item.type && !item.isTopUp);
                      const isTransfer = Boolean(targetName);
                      const txDate = new Date(item.date);
                      const timeStr = txDate.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      const beforeSource =
                        item.balanceBefore !== undefined
                          ? item.balanceBefore
                          : sourceWallet
                          ? sourceWallet.balance +
                            (isDebit ? item.amount : -item.amount)
                          : null;
                      const afterSource =
                        item.balanceAfter !== undefined
                          ? item.balanceAfter
                          : sourceWallet?.balance;

                      return (
                        <div
                          key={item._id}
                          className={`group relative flex flex-col transition-colors duration-150 select-none ${
                            isExpanded
                              ? "bg-slate-50/70 dark:bg-white/[0.03]"
                              : "hover:bg-slate-50/40 dark:hover:bg-white/[0.015]"
                          }`}
                        >
                          {/* Left Accent Stripe */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-150 ${
                              isExpanded
                                ? isDebit
                                  ? "bg-rose-500"
                                  : "bg-emerald-500"
                                : isDebit
                                ? "bg-transparent group-hover:bg-rose-400"
                                : "bg-transparent group-hover:bg-emerald-400"
                            }`}
                          />

                          {/* ── DESKTOP ROW ── */}
                          <div
                            onClick={() => toggleRow(item._id)}
                            className="hidden lg:grid grid-cols-12 gap-4 items-center px-6 py-3.5 cursor-pointer min-h-[58px]"
                          >
                            {/* 1. Expense / Item Column */}
                            <div className="col-span-5 flex items-center gap-3 min-w-0 pr-3 border-r border-slate-100 dark:border-white/5">
                              <div
                                className={`w-7 h-7 rounded-xs flex items-center justify-center shrink-0 border transition-transform duration-150 group-hover:scale-105 ${
                                  isDebit
                                    ? "bg-rose-50 text-rose-600 border-rose-200/80 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                                    : "bg-emerald-50 text-emerald-600 border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                }`}
                              >
                                <IconRenderer iconName={categoryIcon} />
                              </div>

                              <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                    {subCategoryLabel}
                                  </span>
                                  <span className="text-[9px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded-xs bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-white/10 truncate max-w-32">
                                    {categoryLabel}
                                  </span>
                                </div>

                                {item.description ? (
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 italic">
                                    "{item.description}"
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                                    No note recorded
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* 2. Paid From Column */}
                            <div className="col-span-4 flex items-center min-w-0 pr-3 border-r border-slate-100 dark:border-white/5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold tracking-wide uppercase border ${sourcePalette.badge}`}
                                >
                                  <CreditCard size={11} className="shrink-0 opacity-80" />
                                  <span className="truncate max-w-36">{sourceName}</span>
                                </span>

                                {targetWallet && targetPalette && (
                                  <>
                                    <ArrowRight size={11} className="text-slate-400 shrink-0" />
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold tracking-wide uppercase border ${targetPalette.badge}`}
                                    >
                                      <CreditCard size={11} className="shrink-0 opacity-80" />
                                      <span className="truncate max-w-36">{targetName}</span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* 3. Pure Amount Column */}
                            <div className="col-span-2 flex items-center justify-end pr-3 border-r border-slate-100 dark:border-white/5 whitespace-nowrap">
                              <div className="flex items-baseline justify-end gap-1.5 text-right shrink-0">
                                {isDebit ? (
                                  <ArrowUpRight
                                    size={14}
                                    className="text-rose-600 dark:text-rose-400 shrink-0 stroke-[2.5]"
                                  />
                                ) : (
                                  <ArrowDownLeft
                                    size={14}
                                    className="text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]"
                                  />
                                )}
                                <span
                                  className={`font-mono font-black text-sm tabular-nums tracking-tight ${
                                    isDebit
                                      ? "text-rose-600 dark:text-rose-400"
                                      : "text-emerald-600 dark:text-emerald-400"
                                  }`}
                                >
                                  {isDebit ? "-" : "+"}₹{formatINR(item.amount)}
                                </span>
                              </div>
                            </div>

                            {/* 4. Actions Column */}
                            <div className="col-span-1 flex items-center justify-end gap-1.5 pl-1 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditClick(item, e);
                                }}
                                className="p-1 rounded-xs hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                title="Edit entry"
                              >
                                <Edit3 size={13} strokeWidth={2.2} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteClick(item, e);
                                }}
                                className="p-1 rounded-xs hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                title="Delete entry"
                              >
                                <Trash2 size={13} strokeWidth={2.2} />
                              </button>
                              <div className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors p-0.5 shrink-0 ml-0.5">
                                {isExpanded ? (
                                  <ChevronUp size={14} />
                                ) : (
                                  <ChevronDown size={14} />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* ── MOBILE ROW ── */}
                          <div
                            onClick={() => toggleRow(item._id)}
                            className="lg:hidden p-3 pl-3.5 flex items-start justify-between gap-3 cursor-pointer w-full min-w-0"
                          >
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                              <div
                                className={`w-7 h-7 rounded-xs flex items-center justify-center shrink-0 border mt-0.5 ${
                                  isDebit
                                    ? "bg-rose-50 text-rose-600 border-rose-200/80 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                                    : "bg-emerald-50 text-emerald-600 border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                }`}
                              >
                                <IconRenderer iconName={categoryIcon} />
                              </div>

                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight break-words">
                                  {subCategoryLabel}
                                </span>

                                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                  <span className="font-mono font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded-xs bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 text-[9px] text-slate-600 dark:text-slate-300">
                                    {categoryLabel}
                                  </span>

                                  <span
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-xs text-[9px] font-mono font-bold tracking-wide uppercase border ${sourcePalette.badge}`}
                                  >
                                    <CreditCard size={9} className="shrink-0 opacity-80" />
                                    <span>{sourceName}</span>
                                  </span>

                                  {targetWallet && targetPalette && (
                                    <>
                                      <ArrowRight size={8} className="text-slate-400 shrink-0" />
                                      <span
                                        className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-xs text-[9px] font-mono font-bold tracking-wide uppercase border ${targetPalette.badge}`}
                                      >
                                        <CreditCard size={9} className="shrink-0 opacity-80" />
                                        <span>{targetName}</span>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end shrink-0 pl-1 text-right">
                              <div className="flex items-center gap-1 font-mono font-black text-xs sm:text-sm tabular-nums tracking-tight">
                                {isDebit ? (
                                  <ArrowUpRight
                                    size={13}
                                    className="text-rose-600 dark:text-rose-400 stroke-[2.5]"
                                  />
                                ) : (
                                  <ArrowDownLeft
                                    size={13}
                                    className="text-emerald-600 dark:text-emerald-400 stroke-[2.5]"
                                  />
                                )}
                                <span
                                  className={
                                    isDebit
                                      ? "text-rose-600 dark:text-rose-400"
                                      : "text-emerald-600 dark:text-emerald-400"
                                  }
                                >
                                  {isDebit ? "-" : "+"}₹{formatINR(item.amount)}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 mt-1">
                                <span>{timeStr}</span>
                                <div className="text-slate-400 ml-0.5">
                                  {isExpanded ? (
                                    <ChevronUp size={11} />
                                  ) : (
                                    <ChevronDown size={11} />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ── EXPANDED INSPECTION DRAWER ── */}
                          {isExpanded && (
                            <div className="px-6 pb-4 pt-1 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.015] animate-in fade-in duration-100">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-3.5 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xs shadow-2xs mt-1.5">
                                {/* Section 1: Details */}
                                <div className="flex flex-col gap-1.5 lg:border-r border-slate-100 dark:border-white/5 lg:pr-4">
                                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <Tag size={12} className="text-emerald-600 dark:text-emerald-400" /> Details
                                  </span>
                                  <div className="flex flex-col mt-0.5">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                      {subCategoryLabel}
                                    </span>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                      Category:{" "}
                                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                                        {categoryLabel}
                                      </strong>
                                    </span>
                                  </div>
                                  <div className="mt-1 p-2 rounded-xs bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-300">
                                    <span className="font-semibold text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">
                                      Note:
                                    </span>
                                    {item.description
                                      ? `"${item.description}"`
                                      : "No note attached."}
                                  </div>
                                </div>

                                {/* Section 2: Wallet Balance */}
                                <div className="flex flex-col gap-1.5 lg:border-r border-slate-100 dark:border-white/5 lg:px-4">
                                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    {isDebit ? (
                                      <TrendingDown size={12} className="text-rose-500" />
                                    ) : (
                                      <TrendingUp size={12} className="text-emerald-500" />
                                    )}
                                    Wallet Balance
                                  </span>

                                  <div className="flex flex-col gap-1 mt-0.5">
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                      {sourceName}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-50 dark:bg-white/[0.02] p-2 rounded-xs border border-slate-200/70 dark:border-white/5">
                                      {beforeSource !== null && (
                                        <>
                                          <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                                            ₹{formatINR(beforeSource)}
                                          </span>
                                          <ArrowRight size={11} className="text-slate-400" />
                                        </>
                                      )}
                                      <span
                                        className={`tabular-nums ${
                                          isDebit
                                            ? "text-rose-600 dark:text-rose-400 font-black"
                                            : "text-emerald-600 dark:text-emerald-400 font-black"
                                        }`}
                                      >
                                        ₹{formatINR(afterSource ?? item.amount)}
                                      </span>
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                      {isDebit
                                        ? `Money spent: -₹${formatINR(item.amount)}`
                                        : `Money added: +₹${formatINR(item.amount)}`}
                                    </span>
                                  </div>
                                </div>

                                {/* Section 3: Summary, Actions & Status */}
                                <div className="flex flex-col justify-between lg:pl-4">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                      <Clock size={12} className="text-indigo-500" /> Date & Time
                                    </span>
                                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                      {dayNum} {monthText} {selectedYear || ""} at {timeStr}
                                    </span>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                      Payment Type:{" "}
                                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                                        {isTransfer
                                          ? "Transfer"
                                          : isDebit
                                          ? "Expense"
                                          : "Top-up"}
                                      </strong>
                                    </span>
                                  </div>

                                  <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onEditClick(item, e);
                                        }}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                      >
                                        <Edit3 size={11} strokeWidth={2.2} />
                                        <span>Edit</span>
                                      </button>
                                      <span>|</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteClick(item, e);
                                        }}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                                      >
                                        <Trash2 size={11} strokeWidth={2.2} />
                                        <span>Delete</span>
                                      </button>
                                    </div>

                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-500/20 text-[10px]">
                                      <CheckCircle2 size={11} />
                                      Checked
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default HistoryTimelineStream;