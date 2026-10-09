import React from "react";
import {
  History,
  Search,
  CreditCard,
  ArrowRight,
  Edit3,
  Trash2,
  Clock,
  FileText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { getWalletColor } from "../Dashboard/walletUtils";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.abs(amount || 0)
  );
};

// Converts inputs like "INline test", "HEALTHCARE", or "all caps" into "Inline Test", "Healthcare", etc.
const toTitleCase = (str) => {
  if (!str || typeof str !== "string") return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const IconRenderer = ({ iconName, className = "" }) => {
  const IconComponent = LucideIcons[iconName] || CreditCard;
  return <IconComponent size={16} className={className} />;
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
  return (
    <section className="w-full flex flex-col pt-3 sm:pt-4 select-none antialiased">
      {/* ── Top Statement Summary Header ── */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 max-w-7xl mx-auto w-full px-1 sm:px-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
            <History size={18} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-[1000] uppercase tracking-wider text-slate-900 dark:text-white leading-tight truncate">
              Activity History
            </h2>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Transactions & payment timeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-300/80 dark:border-white/10 font-mono text-xs font-black shrink-0 ml-2 shadow-2xs">
          <span className="text-emerald-600 dark:text-emerald-400 font-[1000] text-sm">
            {transactionsCount}
          </span>
          <span className="uppercase text-[11px] font-bold text-slate-500 dark:text-slate-400">
            Records
          </span>
        </div>
      </div>

      {/* ── Feed Content ── */}
      {loading && transactionsCount === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 max-w-7xl mx-auto w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-emerald-500/20 border-t-emerald-500" />
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Updating History...
          </p>
        </div>
      ) : groupedTransactions.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center px-4 border-2 border-dashed border-slate-300 dark:border-white/15 rounded-xl bg-slate-50/70 dark:bg-white/[0.01] max-w-xl mx-auto w-full my-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-2 text-slate-400">
            <Search size={20} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-800 dark:text-slate-200">
            No Transactions Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            No entries found for {selectedMonthName} {selectedYear}.
          </p>
        </div>
      ) : (
        /* Unified Timeline Container: Clean bordered wrapper on desktop (lg:), fluid and unboxed on mobile */
        <div className="mt-2 w-full max-w-7xl mx-auto lg:border-2 lg:border-slate-300 lg:dark:border-white/15 lg:rounded-2xl lg:bg-white lg:dark:bg-[#0B1120] lg:p-7 lg:shadow-xs transition-all">
          <div className="space-y-8 sm:space-y-6 w-full">
            {groupedTransactions.map((group, groupIdx) => (
              <div
                key={groupIdx}
                className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-start pb-6 sm:pb-4 border-b border-slate-200/80 dark:border-white/10 last:border-b-0 last:pb-0"
              >
                {/* ── Fixed Split-Column Two-Tone Date Anchor ── */}
                <div className="flex sm:flex-col items-center sm:items-stretch rounded-lg bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-white/15 overflow-hidden shrink-0 shadow-2xs">
                  {/* Top Day Number & Weekday Banner */}
                  <div className="px-3.5 py-1.5 bg-emerald-600 dark:bg-emerald-700 text-white flex flex-col items-center justify-center min-w-[56px]">
                    <span className="text-base sm:text-lg font-black font-mono leading-none tracking-tight">
                      {group.header.dayNumber}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase text-emerald-100 leading-tight mt-0.5">
                      {group.header.dayName}
                    </span>
                  </div>

                  {/* Bottom Month Label */}
                  <div className="px-3 py-1 sm:py-1.5 flex flex-col justify-center text-center bg-white dark:bg-slate-900">
                    <span className="text-xs font-black font-mono uppercase text-slate-800 dark:text-slate-100 leading-none">
                      {group.header.monthName}
                    </span>
                  </div>
                </div>

                {/* ── Minimalist Ledger Items Stream for this Date ── */}
                {/* Notice: No border-t-2 or border-b-2 here, divide-y-2 exclusively separates middle items */}
                <div className="flex-1 w-full flex flex-col divide-y-2 divide-slate-300 dark:divide-white/10">
                  {group.items.map((item) => {
                    const isPopulated = item.category && typeof item.category === "object";
                    const rawCategory = isPopulated
                      ? item.category.label
                      : item.category || "General";
                    const categoryIcon = isPopulated ? item.category.icon : "CreditCard";
                    const categoryColor = isPopulated ? item.category.color : "#10B981";
                    const rawSubCategory = item.subCategory || "General Expense";

                    // Formatted Cased Labels
                    const categoryLabel = toTitleCase(rawCategory);
                    const subCategoryLabel = toTitleCase(rawSubCategory);

                    const sourceWalletIndex = wallets.findIndex(
                      (w) => w._id === (item.sourceWallet?._id || item.sourceWallet)
                    );
                    const sourceWallet = wallets[sourceWalletIndex];
                    const sourceName = sourceWallet?.walletName || "Direct Spend";
                    const sourcePalette = getWalletColor(
                      sourceWallet?._id || sourceName,
                      sourceWalletIndex >= 0 ? sourceWalletIndex : null
                    );

                    const targetWalletIndex = wallets.findIndex(
                      (w) => w._id === (item.targetWallet?._id || item.targetWallet)
                    );
                    const targetWallet = wallets[targetWalletIndex];
                    const targetName = targetWallet?.walletName;
                    const targetPalette = targetWallet
                      ? getWalletColor(targetWallet._id, targetWalletIndex)
                      : null;

                    const isDebit = item.type === "DEBIT" || (!item.type && !item.isTopUp);
                    const isTransfer = Boolean(targetName);
                    const txDate = new Date(item.date);
                    const timeStr = txDate.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={item._id}
                        className="py-3 px-1 sm:px-2 flex flex-col gap-2 hover:bg-slate-50/70 dark:hover:bg-white/[0.02] rounded-lg transition-colors"
                      >
                        {/* Upper Tier: Category Meta & Financial Net Figure */}
                        <div className="flex items-start justify-between gap-3 min-w-0">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <span
                              className="mt-0.5 shrink-0 transition-transform hover:scale-110"
                              style={{ color: categoryColor }}
                            >
                              <IconRenderer iconName={categoryIcon} />
                            </span>

                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
                                <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white tracking-tight break-words">
                                  {subCategoryLabel}
                                </h3>
                                <span
                                  className="text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0"
                                  style={{ color: categoryColor }}
                                >
                                  • {categoryLabel}
                                </span>
                              </div>

                              {/* Narration Note */}
                              {item.description && (
                                <div className="flex items-start gap-1 mt-0.5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 italic min-w-0 font-medium">
                                  <FileText size={12} className="text-slate-400 shrink-0 mt-0.5 not-italic" />
                                  <span className="break-words">"{item.description}"</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Net Amount Figure */}
                          <div className="flex items-center gap-1 shrink-0 pl-1">
                            {isTransfer ? (
                              <ArrowRight size={15} className="text-indigo-600 dark:text-indigo-400 stroke-[3]" />
                            ) : isDebit ? (
                              <TrendingDown size={16} className="text-rose-600 dark:text-rose-400 stroke-[3]" />
                            ) : (
                              <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                            )}
                            <span
                              className={`font-mono font-[1000] text-sm sm:text-lg tracking-tight tabular-nums ${
                                isTransfer
                                  ? "text-indigo-600 dark:text-indigo-400"
                                  : isDebit
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {isDebit ? "-" : "+"}₹{formatINR(item.amount)}
                            </span>
                          </div>
                        </div>

                        {/* Lower Tier: Colored Wallet Tags, Reference Code, Progression & Action Triggers */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100 dark:border-white/5">
                          <div className="flex items-center gap-2 font-mono text-[11px] flex-wrap min-w-0">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                              <Clock size={11} /> {timeStr}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
                            <span className="text-slate-500 dark:text-slate-400 font-bold uppercase">
                              #{item._id?.slice(-6)}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>

                            {/* Vivid Colored Wallet Badges */}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border shadow-2xs ${sourcePalette.badge}`}
                            >
                              {sourceName}
                            </span>
                            {targetName && (
                              <>
                                <ArrowRight size={10} className="text-slate-400 shrink-0" />
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border shadow-2xs ${targetPalette?.badge}`}
                                >
                                  {targetName}
                                </span>
                              </>
                            )}

                            {/* Balance Shift */}
                            {item.balanceBefore !== undefined && item.balanceAfter !== undefined && (
                              <>
                                <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
                                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 font-bold">
                                  <span className="line-through text-slate-400">
                                    ₹{formatINR(item.balanceBefore)}
                                  </span>
                                  <ArrowRight size={9} className="text-slate-400" />
                                  <span
                                    className={
                                      isDebit
                                        ? "text-rose-600 dark:text-rose-400"
                                        : "text-emerald-600 dark:text-emerald-400"
                                    }
                                  >
                                    ₹{formatINR(item.balanceAfter)}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Inline Action Buttons */}
                          <div className="flex items-center gap-2.5 shrink-0 ml-auto font-sans">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditClick(item, e);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                              title="Edit record"
                            >
                              <Edit3 size={12} strokeWidth={2.5} />
                              <span>Edit</span>
                            </button>
                            <span className="text-slate-300 dark:text-white/20">|</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick(item, e);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 size={12} strokeWidth={2.5} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default HistoryTimelineStream;