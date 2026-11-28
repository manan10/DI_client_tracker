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
  ArrowLeftRight,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import * as LucideIcons from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.abs(amount || 0)
  );
};

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
  expandedId: controlledExpandedId,
  onToggleRow,
  onEditClick,
  onDeleteClick,
  wallets = [],
  selectedMonthName,
  selectedYear,
}) => {
  const [localExpandedId, setLocalExpandedId] = useState(null);
  const expandedId =
    controlledExpandedId !== undefined ? controlledExpandedId : localExpandedId;

  const toggleRow = (id) => {
    if (onToggleRow) {
      onToggleRow(id);
    } else {
      setLocalExpandedId((prev) => (prev === id ? null : id));
    }
  };

  return (
    <section className="w-full flex flex-col pt-2 select-none antialiased">
      {/* ── Top Statement Summary Header ── */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-200/90 dark:border-white/[0.07] mb-5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1 h-3.5 rounded-full bg-emerald-700 dark:bg-[#4EA885] shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-stone-800 dark:text-stone-100 truncate">
            Activity Timeline
          </h2>
          <span
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-white/[0.06] text-stone-700 dark:text-stone-200 shrink-0"
          >
            {transactionsCount}
          </span>
        </div>

        <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 shrink-0">
          {selectedMonthName} {selectedYear}
        </span>
      </div>

      {/* ── Feed Content ── */}
      {loading && transactionsCount === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-200 dark:border-white/10 border-t-emerald-700 dark:border-t-[#4EA885]" />
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400"
          >
            Loading History...
          </p>
        </div>
      ) : groupedTransactions.length === 0 ? (
        <div className="-mx-4 sm:mx-0 py-14 flex flex-col items-center justify-center text-center px-4 border-y sm:border border-stone-200/80 dark:border-white/[0.07] sm:rounded-2xl bg-white dark:bg-[#1A1C20] w-full">
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-white/[0.06] flex items-center justify-center mb-2.5 text-stone-500 dark:text-stone-400">
            <Search size={18} />
          </div>
          <h3
            style={{ fontFamily: "'Lora', serif" }}
            className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-50"
          >
            No Transactions Found
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm">
            No entries match your filters for {selectedMonthName} {selectedYear}.
          </p>
        </div>
      ) : (
        <div className="space-y-8 sm:space-y-10 w-full">
          {groupedTransactions.map((group, groupIdx) => {
            const dayNum = group.header?.dayNumber || "01";
            const monthText =
              group.header?.monthName ||
              selectedMonthName?.slice(0, 3)?.toUpperCase() ||
              "JAN";
            const dayText = group.header?.dayName || "";
            const yearText = group.header?.yearName || selectedYear;

            return (
              <div key={groupIdx} className="flex flex-col w-full">
                {/* ── Two-Tone Date Group Header ── */}
                <div className="flex items-center gap-2.5 px-0.5 mb-2.5 w-full min-w-0">
                  <div
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    className="inline-flex items-stretch rounded-md bg-stone-900 text-white dark:bg-[#22252C] dark:text-stone-100 shadow-2xs overflow-hidden shrink-0"
                  >
                    <span className="px-2.5 py-1 text-xs sm:text-sm font-bold leading-none flex items-center">
                      {dayNum}
                    </span>
                    <span className="px-2 py-1 text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-wider bg-emerald-700 text-white dark:bg-[#4EA885] dark:text-[#121315] flex items-center">
                      {monthText}
                    </span>
                  </div>

                  <div
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-stone-600 dark:text-stone-300"
                  >
                    {dayText && (
                      <span className="text-emerald-700 dark:text-[#68C19D] font-bold uppercase">
                        {dayText}
                      </span>
                    )}
                    <span className="text-stone-300 dark:text-stone-700">•</span>
                    <span>{yearText}</span>
                    {group.header?.tag && (
                      <span
                        style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                        className="ml-1 px-1.5 py-0.5 text-[9.5px] uppercase font-bold tracking-wider rounded bg-emerald-700/10 dark:bg-[#4EA885]/18 text-emerald-800 dark:text-[#86D4B4]"
                      >
                        {group.header.tag}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 h-px bg-stone-200/90 dark:bg-white/[0.07] ml-1" />
                </div>

                {/* ── De-boxed Editorial Sheet ── */}
                <div className="-mx-4 sm:mx-0 sm:w-full rounded-none sm:rounded-2xl bg-white dark:bg-[#1A1C20] border-y border-x-0 sm:border border-stone-200/80 dark:border-white/[0.07] sm:shadow-2xs overflow-hidden">
                  {/* Desktop Table Header Strip */}
                  <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 border-b border-stone-200/80 dark:border-white/[0.07] select-none text-[10px] font-bold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400 bg-[#FAF9F6] dark:bg-[#16181C]">
                    <div className="col-span-5">Item &amp; Category</div>
                    <div className="col-span-3">Account</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-2 text-right pr-1">Actions</div>
                  </div>

                  {/* List Rows */}
                  <div className="flex flex-col divide-y divide-stone-100 dark:divide-white/[0.05]">
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
                      const descLower = (item.description || "").toLowerCase();
                      const isSystem =
                        String(rawCategory).toUpperCase() === "SYSTEM" ||
                        Boolean(item.targetWallet) ||
                        descLower.includes("internal transfer") ||
                        descLower.includes("reconciliation sync") ||
                        descLower.includes("top-up allocated");

                      const displayTitle = isSystem
                        ? descLower.includes("reconciliation")
                          ? "Balance Sync"
                          : descLower.includes("top-up")
                          ? "Drawer Allocation"
                          : "Internal Transfer"
                        : toProperCase(rawSubCategory);

                      const categoryIcon = isPopulated
                        ? item.category.icon
                        : "CreditCard";

                      const sourceWallet = wallets?.find(
                        (w) =>
                          w._id === (item.sourceWallet?._id || item.sourceWallet)
                      );
                      const sourceName =
                        sourceWallet?.walletName || "Direct Spend";

                      const targetWallet = wallets?.find(
                        (w) =>
                          w._id === (item.targetWallet?._id || item.targetWallet)
                      );
                      const targetName = targetWallet?.walletName;

                      const isDebit =
                        item.type === "DEBIT" || (!item.type && !item.isTopUp);
                      const isTransfer = Boolean(item.targetWallet);
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
                              ? "bg-stone-50/90 dark:bg-[#202329]"
                              : isSystem
                              ? "bg-stone-50/30 dark:bg-white/[0.01] hover:bg-stone-50/80 dark:hover:bg-white/[0.025]"
                              : "hover:bg-stone-50/80 dark:hover:bg-white/[0.025]"
                          }`}
                        >
                          {/* Left Accent Stripe */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-1 lg:w-[3px] transition-all duration-150 ${
                              isExpanded
                                ? isSystem
                                  ? "bg-stone-500 dark:bg-stone-400"
                                  : isDebit
                                  ? "bg-rose-700 dark:bg-[#F09BA3]"
                                  : "bg-emerald-700 dark:bg-[#68C19D]"
                                : "bg-transparent"
                            }`}
                          />

                          {/* ── DESKTOP ROW ── */}
                          <div
                            onClick={() => toggleRow(item._id)}
                            className="hidden lg:grid grid-cols-12 gap-4 items-center px-6 py-3.5 cursor-pointer min-h-[60px]"
                          >
                            {/* 1. Expense / Item Column */}
                            <div className="col-span-5 flex items-center gap-3.5 min-w-0">
                              <div
                                className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                  isSystem
                                    ? "bg-stone-100 text-stone-600 dark:bg-white/[0.06] dark:text-stone-300"
                                    : isDebit
                                    ? "bg-rose-700/[0.08] text-rose-700 dark:bg-[#E88D96]/15 dark:text-[#F09BA3]"
                                    : "bg-emerald-700/[0.09] text-emerald-700 dark:bg-[#4EA885]/15 dark:text-[#68C19D]"
                                }`}
                              >
                                {isSystem ? (
                                  <ArrowLeftRight size={14} />
                                ) : (
                                  <IconRenderer iconName={categoryIcon} />
                                )}
                              </div>

                              <div className="flex flex-col justify-center min-w-0 flex-1">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                  <span
                                    style={{ fontFamily: "'Lora', serif" }}
                                    className={`font-bold tracking-tight text-[13.5px] leading-snug ${
                                      isSystem
                                        ? "text-stone-700 dark:text-stone-200"
                                        : "text-stone-950 dark:text-stone-50"
                                    }`}
                                  >
                                    {displayTitle}
                                  </span>
                                  <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                                    {categoryLabel}
                                  </span>
                                </div>

                                {item.description ? (
                                  <span className="text-[11.5px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                                    &ldquo;{item.description}&rdquo;
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      fontFamily: "'IBM Plex Mono', monospace",
                                    }}
                                    className="text-[10.5px] text-stone-400 dark:text-stone-500 mt-0.5"
                                  >
                                    {timeStr}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* 2. Account Column */}
                            <div className="col-span-3 flex items-center min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide capitalize bg-stone-100 dark:bg-white/[0.06] text-stone-700 dark:text-stone-200">
                                  <Wallet
                                    size={10}
                                    className="shrink-0 text-emerald-700 dark:text-[#68C19D]"
                                  />
                                  <span className="truncate max-w-32">
                                    {sourceName}
                                  </span>
                                </span>

                                {targetWallet && (
                                  <>
                                    <ArrowRight
                                      size={11}
                                      className="text-stone-400 shrink-0"
                                    />
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide capitalize bg-emerald-700/10 dark:bg-[#4EA885]/15 text-emerald-800 dark:text-[#86D4B4]">
                                      <Wallet
                                        size={10}
                                        className="shrink-0 opacity-90"
                                      />
                                      <span className="truncate max-w-32">
                                        {targetName}
                                      </span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* 3. Amount Column */}
                            <div className="col-span-2 flex items-center justify-end whitespace-nowrap">
                              <div className="flex items-baseline justify-end gap-1 text-right shrink-0">
                                {isSystem ? (
                                  <ArrowLeftRight
                                    size={12}
                                    className="text-stone-400 shrink-0"
                                  />
                                ) : isDebit ? (
                                  <ArrowUpRight
                                    size={13}
                                    className="text-rose-700 dark:text-[#F09BA3] shrink-0 stroke-[2.5]"
                                  />
                                ) : (
                                  <ArrowDownLeft
                                    size={13}
                                    className="text-emerald-700 dark:text-[#68C19D] shrink-0 stroke-[2.5]"
                                  />
                                )}
                                <span
                                  style={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                  }}
                                  className={`font-bold text-sm tabular-nums tracking-tight ${
                                    isSystem
                                      ? "text-stone-600 dark:text-stone-300"
                                      : isDebit
                                      ? "text-rose-700 dark:text-[#F09BA3]"
                                      : "text-emerald-700 dark:text-[#68C19D]"
                                  }`}
                                >
                                  {isDebit ? "-" : "+"}₹{formatINR(item.amount)}
                                </span>
                              </div>
                            </div>

                            {/* 4. Actions Column */}
                            <div className="col-span-2 flex items-center justify-end gap-1.5 pl-1 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditClick(item, e);
                                }}
                                className="p-1.5 rounded-lg hover:bg-stone-200/70 dark:hover:bg-white/[0.08] text-stone-400 hover:text-emerald-700 dark:hover:text-[#68C19D] transition-colors cursor-pointer"
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
                                className="p-1.5 rounded-lg hover:bg-rose-700/10 dark:hover:bg-[#E88D96]/15 text-stone-400 hover:text-rose-700 dark:hover:text-[#F09BA3] transition-colors cursor-pointer"
                                title="Delete entry"
                              >
                                <Trash2 size={13} strokeWidth={2.2} />
                              </button>
                              <div className="text-stone-400 group-hover:text-stone-800 dark:group-hover:text-stone-200 transition-colors p-1 shrink-0">
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
                            className="lg:hidden px-4 py-3.5 pl-4.5 flex flex-col gap-2 cursor-pointer touch-manipulation w-full min-w-0"
                          >
                            <div className="flex items-start justify-between gap-3 w-full min-w-0">
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                <div
                                  className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                    isSystem
                                      ? "bg-stone-100 text-stone-600 dark:bg-white/[0.06] dark:text-stone-300"
                                      : isDebit
                                      ? "bg-rose-700/[0.08] text-rose-700 dark:bg-[#E88D96]/15 dark:text-[#F09BA3]"
                                      : "bg-emerald-700/[0.09] text-emerald-700 dark:bg-[#4EA885]/15 dark:text-[#68C19D]"
                                  }`}
                                >
                                  {isSystem ? (
                                    <ArrowLeftRight size={14} />
                                  ) : (
                                    <IconRenderer iconName={categoryIcon} />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <span
                                    style={{ fontFamily: "'Lora', serif" }}
                                    className={`text-sm font-bold tracking-tight leading-snug break-words block ${
                                      isSystem
                                        ? "text-stone-700 dark:text-stone-200"
                                        : "text-stone-950 dark:text-stone-50"
                                    }`}
                                  >
                                    {displayTitle}
                                  </span>
                                  {item.description && (
                                    <span className="text-[11.5px] text-stone-500 dark:text-stone-400 break-words leading-snug block mt-0.5">
                                      &ldquo;{item.description}&rdquo;
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 pl-1">
                                <div
                                  style={{
                                    fontFamily: "'IBM Plex Mono', monospace",
                                  }}
                                  className="flex items-center gap-0.5 font-bold text-sm tabular-nums tracking-tight"
                                >
                                  {isSystem ? (
                                    <ArrowLeftRight
                                      size={12}
                                      className="text-stone-400"
                                    />
                                  ) : isDebit ? (
                                    <ArrowUpRight
                                      size={13}
                                      className="text-rose-700 dark:text-[#F09BA3] stroke-[2.5]"
                                    />
                                  ) : (
                                    <ArrowDownLeft
                                      size={13}
                                      className="text-emerald-700 dark:text-[#68C19D] stroke-[2.5]"
                                    />
                                  )}
                                  <span
                                    className={
                                      isSystem
                                        ? "text-stone-600 dark:text-stone-300"
                                        : isDebit
                                        ? "text-rose-700 dark:text-[#F09BA3]"
                                        : "text-emerald-700 dark:text-[#68C19D]"
                                    }
                                  >
                                    {isDebit ? "-" : "+"}₹
                                    {formatINR(item.amount)}
                                  </span>
                                </div>

                                <div className="text-stone-400 p-0.5">
                                  {isExpanded ? (
                                    <ChevronUp size={15} />
                                  ) : (
                                    <ChevronDown size={15} />
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pl-11.5 w-full min-w-0">
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                <span className="text-[10.5px] font-medium text-stone-500 dark:text-stone-400">
                                  {categoryLabel}
                                </span>

                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide capitalize bg-stone-100 dark:bg-white/[0.06] text-stone-700 dark:text-stone-200">
                                  <Wallet
                                    size={9}
                                    className="shrink-0 text-emerald-700 dark:text-[#68C19D]"
                                  />
                                  <span>{sourceName}</span>
                                </span>

                                {targetWallet && (
                                  <>
                                    <ArrowRight
                                      size={9}
                                      className="text-stone-400 shrink-0"
                                    />
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide capitalize bg-emerald-700/10 dark:bg-[#4EA885]/18 text-emerald-800 dark:text-[#86D4B4]">
                                      <Wallet
                                        size={9}
                                        className="shrink-0 opacity-90"
                                      />
                                      <span>{targetName}</span>
                                    </span>
                                  </>
                                )}
                              </div>

                              <span
                                style={{
                                  fontFamily: "'IBM Plex Mono', monospace",
                                }}
                                className="text-[10.5px] font-medium text-stone-500 dark:text-stone-400 shrink-0"
                              >
                                {timeStr}
                              </span>
                            </div>
                          </div>

                          {/* ── EXPANDED INSPECTION DRAWER ── */}
                          {isExpanded && (
                            <div className="px-4 sm:px-6 pb-4 pt-1 bg-[#FAF9F6] dark:bg-[#16181C] border-t border-stone-200/70 dark:border-white/[0.06] animate-in fade-in duration-100">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 p-4 bg-white dark:bg-[#1A1C20] border border-stone-200/80 dark:border-white/[0.07] rounded-xl mt-1.5">
                                {/* Section 1: Details */}
                                <div className="flex flex-col gap-1.5 lg:border-r border-stone-100 dark:border-white/[0.06] lg:pr-4">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                                    <Tag
                                      size={11}
                                      className="text-emerald-700 dark:text-[#68C19D]"
                                    />{" "}
                                    Details
                                  </span>
                                  <div className="flex flex-col mt-0.5">
                                    <span
                                      style={{ fontFamily: "'Lora', serif" }}
                                      className="text-xs font-bold tracking-tight text-stone-950 dark:text-white"
                                    >
                                      {displayTitle}
                                    </span>
                                    <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                                      Category:{" "}
                                      <strong className="text-stone-800 dark:text-stone-200 font-semibold">
                                        {categoryLabel}
                                      </strong>
                                    </span>
                                  </div>
                                  {item.description && (
                                    <div className="mt-1 p-2.5 rounded-lg bg-[#FAF9F6] dark:bg-[#16181C] text-[11.5px] text-stone-700 dark:text-stone-200">
                                      &ldquo;{item.description}&rdquo;
                                    </div>
                                  )}
                                </div>

                                {/* Section 2: Wallet Balance */}
                                <div className="flex flex-col gap-1.5 lg:border-r border-stone-100 dark:border-white/[0.06] lg:px-4">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                                    {isDebit ? (
                                      <TrendingDown
                                        size={11}
                                        className="text-rose-700 dark:text-[#F09BA3]"
                                      />
                                    ) : (
                                      <TrendingUp
                                        size={11}
                                        className="text-emerald-700 dark:text-[#68C19D]"
                                      />
                                    )}
                                    Account Balance
                                  </span>

                                  <div className="flex flex-col gap-1 mt-0.5">
                                    <span
                                      style={{ fontFamily: "'Lora', serif" }}
                                      className="text-xs font-bold tracking-tight text-stone-900 dark:text-white truncate"
                                    >
                                      {sourceName}
                                    </span>
                                    <div
                                      style={{
                                        fontFamily: "'IBM Plex Mono', monospace",
                                      }}
                                      className="flex items-center gap-2 text-xs font-bold bg-[#FAF9F6] dark:bg-[#16181C] p-2.5 rounded-lg"
                                    >
                                      {beforeSource !== null && (
                                        <>
                                          <span className="text-stone-500 dark:text-stone-400 tabular-nums">
                                            ₹{formatINR(beforeSource)}
                                          </span>
                                          <ArrowRight
                                            size={11}
                                            className="text-stone-400"
                                          />
                                        </>
                                      )}
                                      <span
                                        className={`tabular-nums ${
                                          isDebit
                                            ? "text-rose-700 dark:text-[#F09BA3]"
                                            : "text-emerald-700 dark:text-[#68C19D]"
                                        }`}
                                      >
                                        ₹{formatINR(afterSource ?? item.amount)}
                                      </span>
                                    </div>
                                    <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                                      {isDebit
                                        ? `Amount deducted: ₹${formatINR(item.amount)}`
                                        : `Amount credited: ₹${formatINR(item.amount)}`}
                                    </span>
                                  </div>
                                </div>

                                {/* Section 3: Summary, Actions & Status */}
                                <div className="flex flex-col justify-between lg:pl-4">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                                      <Clock
                                        size={11}
                                        className="text-emerald-700 dark:text-[#68C19D]"
                                      />{" "}
                                      Date &amp; Time
                                    </span>
                                    <span
                                      style={{
                                        fontFamily: "'IBM Plex Mono', monospace",
                                      }}
                                      className="text-xs font-semibold text-stone-900 dark:text-white mt-0.5"
                                    >
                                      {dayNum} {monthText} {yearText} at {timeStr}
                                    </span>
                                    <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                                      Entry Type:{" "}
                                      <strong className="text-stone-800 dark:text-stone-200 font-semibold">
                                        {isTransfer || isSystem
                                          ? "Internal / System"
                                          : isDebit
                                          ? "Expense"
                                          : "Top-up"}
                                      </strong>
                                    </span>
                                  </div>

                                  <div className="pt-2.5 mt-2 border-t border-stone-100 dark:border-white/[0.06] flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onEditClick(item, e);
                                        }}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-[#68C19D] hover:underline cursor-pointer"
                                      >
                                        <Edit3 size={11} strokeWidth={2.2} />
                                        <span>Edit</span>
                                      </button>
                                      <span className="text-stone-300 dark:text-stone-700">
                                        |
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteClick(item, e);
                                        }}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-[#F09BA3] hover:underline cursor-pointer"
                                      >
                                        <Trash2 size={11} strokeWidth={2.2} />
                                        <span>Delete</span>
                                      </button>
                                    </div>

                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-700/10 dark:bg-[#4EA885]/18 text-emerald-800 dark:text-[#86D4B4] font-bold text-[10px]">
                                      <CheckCircle2 size={11} />
                                      Verified
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
