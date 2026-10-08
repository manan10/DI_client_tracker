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
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { getWalletColor } from "../Dashboard/walletUtils";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.abs(amount || 0)
  );
};

const IconRenderer = ({ iconName, className = "" }) => {
  const IconComponent = LucideIcons[iconName] || CreditCard;
  return <IconComponent size={15} className={className} />;
};

const HistoryTimelineStream = ({
  loading,
  transactionsCount,
  groupedTransactions,
  onEditClick,
  onDeleteClick,
  wallets = [],
  selectedMonthName,
  selectedYear,
}) => {
  return (
    <section className="flex flex-col gap-4 sm:gap-5 pt-3 sm:pt-4 border-t border-slate-200/80 dark:border-white/10 w-full overflow-hidden">
      {/* Centered Stream Header */}
      <div className="flex mt-3 sm:mt-6 items-center justify-between pb-1 max-w-7xl mx-auto w-full px-1 sm:px-0">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <History size={16} strokeWidth={2.5} className="sm:w-[17px] sm:h-[17px]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-base font-black uppercase tracking-tight text-slate-900 dark:text-white leading-tight truncate">
              Transaction History
            </h2>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
              Chronological ledger stream filtered by active channel
            </p>
          </div>
        </div>

        <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5 shrink-0 ml-2">
          {transactionsCount} Records
        </span>
      </div>

      {/* Feed Area */}
      {loading && transactionsCount === 0 ? (
        <div className="py-16 sm:py-20 flex flex-col items-center justify-center text-center space-y-3 max-w-7xl mx-auto w-full">
          <div className="animate-spin rounded-full h-7 w-7 sm:h-8 sm:w-8 border-2 sm:border-3 border-emerald-500/20 border-t-emerald-500" />
          <p className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Synchronizing Ledger Stream...
          </p>
        </div>
      ) : groupedTransactions.length === 0 ? (
        <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center px-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl bg-white/40 dark:bg-white/[0.01] max-w-3xl mx-auto w-full">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-2 text-emerald-600">
            <Search size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            No Transactions Found
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 max-w-sm">
            No records match your filters for {selectedMonthName} {selectedYear}.
          </p>
        </div>
      ) : (
        <div className="relative pl-3 sm:pl-5 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 sm:before:w-1 before:bg-gradient-to-b before:from-emerald-500 before:via-indigo-500/30 before:to-transparent before:rounded-full">
          {groupedTransactions.map((group, groupIdx) => (
            <div key={groupIdx} className="relative flex flex-col gap-2.5 sm:gap-3">
              {/* Timeline Date Header */}
              <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-emerald-500 ring-2 sm:ring-4 ring-emerald-500/20 border sm:border-2 border-white dark:border-[#060913] shrink-0 shadow-xs" />

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex items-baseline gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-0.5 sm:py-1 bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-white/15 rounded-lg sm:rounded-xl shadow-2xs">
                    <span className="text-sm sm:text-lg font-black font-mono text-slate-900 dark:text-white leading-none">
                      {group.header.dayNumber}
                    </span>
                    <span className="text-[10px] sm:text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 uppercase leading-none">
                      {group.header.monthName}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 font-bold leading-none">
                      {group.header.dayName}
                    </span>
                  </div>

                  {group.header.tag && (
                    <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase px-1.5 sm:px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 shadow-2xs">
                      {group.header.tag}
                    </span>
                  )}
                </div>
              </div>

              {/* Day Transaction Cards */}
              <div className="flex flex-col gap-2 sm:gap-3 pl-4 sm:pl-8">
                {group.items.map((item) => {
                  const isPopulated = item.category && typeof item.category === "object";
                  const categoryLabel = isPopulated
                    ? item.category.label
                    : item.category || "General";
                  const categoryIcon = isPopulated ? item.category.icon : "CreditCard";
                  const categoryColor = isPopulated ? item.category.color : "#10B981";
                  const subCategoryLabel = item.subCategory || "General Expense";

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
                  const txDate = new Date(item.date);
                  const timeStr = txDate.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={item._id}
                      className="group relative bg-white dark:bg-[#0B1120] border border-slate-200/90 sm:border-2 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 rounded-xl sm:rounded-2xl transition-all duration-150 overflow-hidden shadow-2xs hover:shadow-xs"
                    >
                      {/* Left Vibrant Accent Rail */}
                      <div
                        className="absolute left-0 inset-y-0 w-1 sm:w-1.5"
                        style={{ backgroundColor: categoryColor }}
                      />

                      {/* Main Card Body */}
                      <div className="p-2.5 sm:p-4 pl-3.5 sm:pl-6 flex flex-col gap-2 sm:gap-2.5 min-w-0">
                        {/* Top Line: Category Avatar, SubCategory, Category & Amount */}
                        <div className="flex items-center justify-between gap-2 sm:gap-3 min-w-0">
                          {/* Left Avatar & Identity */}
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-white/10 shadow-2xs group-hover:scale-105 transition-transform"
                              style={{
                                backgroundColor: `${categoryColor}15`,
                                borderColor: `${categoryColor}35`,
                                color: categoryColor,
                              }}
                            >
                              <IconRenderer iconName={categoryIcon} />
                            </div>

                            <div className="flex flex-col min-w-0 flex-1 justify-center">
                              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate leading-tight">
                                  {subCategoryLabel}
                                </span>
                                <span
                                  className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded border uppercase tracking-wider truncate shrink-0"
                                  style={{
                                    backgroundColor: `${categoryColor}12`,
                                    borderColor: `${categoryColor}30`,
                                    color: categoryColor,
                                  }}
                                >
                                  {categoryLabel}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-slate-400 mt-0.5">
                                <div className="flex items-center gap-0.5">
                                  <Clock size={10} className="shrink-0" />
                                  <span>{timeStr}</span>
                                </div>
                                <span>•</span>
                                <span className="truncate">#{item._id?.slice(-6).toUpperCase()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Amount Display */}
                          <div className="flex flex-col items-end shrink-0 pl-1">
                            <span
                              className={`font-mono font-black text-xs sm:text-sm tracking-tight tabular-nums px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border shadow-2xs ${
                                isDebit
                                  ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200/70 dark:border-rose-500/20"
                                  : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/70 dark:border-emerald-500/20"
                              }`}
                            >
                              {isDebit ? "-" : "+"}₹{formatINR(item.amount)}
                            </span>
                          </div>
                        </div>

                        {/* Middle Line: Narration / Description Remark */}
                        {item.description && (
                          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 italic font-medium min-w-0">
                            <FileText size={11} className="text-slate-400 shrink-0" />
                            <span className="truncate">"{item.description}"</span>
                          </div>
                        )}

                        {/* Bottom Action & Channel Strip */}
                        <div className="flex items-center justify-between gap-2 pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-white/5 min-w-0">
                          {/* Channel & Balance Info */}
                          <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                            {/* Channel Badges */}
                            <div className="flex items-center gap-1 min-w-0 shrink">
                              <span
                                className={`px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded font-bold text-[9px] sm:text-[10px] uppercase tracking-wider border shadow-2xs truncate max-w-24 sm:max-w-none ${sourcePalette.badge}`}
                              >
                                {sourceName}
                              </span>
                              {targetName && targetPalette && (
                                <>
                                  <ArrowRight size={9} className="text-slate-400 shrink-0" />
                                  <span
                                    className={`px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded font-bold text-[9px] sm:text-[10px] uppercase tracking-wider border shadow-2xs truncate max-w-24 sm:max-w-none ${targetPalette.badge}`}
                                  >
                                    {targetName}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Balance Movement Shift */}
                            {item.balanceBefore !== undefined && item.balanceAfter !== undefined && (
                              <div className="hidden xs:flex items-center gap-1 text-[9px] sm:text-[10px] font-mono bg-slate-100/80 dark:bg-slate-800/80 px-1.5 py-0.2 sm:py-0.5 rounded border border-slate-200/60 dark:border-white/5 shrink-0">
                                <span className="text-slate-400 line-through">
                                  ₹{formatINR(item.balanceBefore)}
                                </span>
                                <ArrowRight size={8} className="text-slate-400 shrink-0" />
                                <span
                                  className={`font-bold ${
                                    isDebit ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                                  }`}
                                >
                                  ₹{formatINR(item.balanceAfter)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditClick(item, e);
                              }}
                              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/30 text-[10px] sm:text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
                              title="Edit transaction"
                            >
                              <Edit3 size={11} strokeWidth={2.5} />
                              <span className="hidden xs:inline">Edit</span>
                            </button>

                            {/* Void / Delete Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick(item, e);
                              }}
                              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-500/30 text-[10px] sm:text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
                              title="Delete transaction"
                            >
                              <Trash2 size={11} strokeWidth={2.5} />
                              <span className="hidden xs:inline">Delete</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default HistoryTimelineStream;