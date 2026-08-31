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
  return <IconComponent size={17} className={className} />;
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
    <section className="flex flex-col gap-5 pt-4 border-t border-slate-200/80 dark:border-white/10 w-full">
      {/* Centered Stream Header */}
      <div className="flex mt-7 items-center justify-between pb-1 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <History size={17} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-900 dark:text-white leading-tight">
              Transaction History
            </h2>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Chronological ledger stream filtered by active channel
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5">
          {transactionsCount} Records
        </span>
      </div>

      {/* Feed Area */}
      {loading && transactionsCount === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 max-w-7xl mx-auto w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-emerald-500/20 border-t-emerald-500" />
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Synchronizing Ledger Stream...
          </p>
        </div>
      ) : groupedTransactions.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center px-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-white/40 dark:bg-white/1 max-w-3xl mx-auto w-full">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-2 text-emerald-600">
            <Search size={18} />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            No Transactions Found
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 max-w-sm">
            No records match your filters for {selectedMonthName} {selectedYear}.
          </p>
        </div>
      ) : (
        <div className="relative pl-4 sm:pl-5 space-y-8 max-w-7xl mx-auto w-full before:absolute before:left-4.25 sm:before:left-5.25 before:top-4 before:bottom-4 before:w-1 before:bg-linear-to-b before:from-emerald-500 before:via-indigo-500/40 before:to-transparent before:rounded-full">
          {groupedTransactions.map((group, groupIdx) => (
            <div key={groupIdx} className="relative flex flex-col gap-3">
              {/* Flashy Spotable Timeline Date Header */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 border-2 border-white dark:border-[#060913] shrink-0 shadow-sm" />

                <div className="flex items-center gap-2">
                  <div className="flex items-baseline gap-1.5 px-3.5 py-1 bg-white dark:bg-[#0B1120] border-2 border-slate-300 dark:border-white/15 rounded-xl shadow-xs">
                    <span className="text-base sm:text-lg font-[1000] font-mono text-slate-900 dark:text-white leading-none">
                      {group.header.dayNumber}
                    </span>
                    <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 uppercase leading-none">
                      {group.header.monthName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold leading-none">
                      {group.header.dayName}
                    </span>
                  </div>

                  {group.header.tag && (
                    <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 shadow-2xs">
                      {group.header.tag}
                    </span>
                  )}
                </div>
              </div>

              {/* Day Transaction Cards */}
              <div className="flex flex-col gap-3 pl-6 sm:pl-8">
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
                      className="group relative bg-white dark:bg-[#0B1120] border-2 border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 rounded-2xl transition-all duration-200 overflow-hidden shadow-2xs hover:shadow-md"
                    >
                      {/* Left Vibrant Accent Rail */}
                      <div
                        className="absolute left-0 inset-y-0 w-1.5"
                        style={{ backgroundColor: categoryColor }}
                      />

                      {/* Main Card Body */}
                      <div className="p-4 pl-5 sm:pl-6 flex flex-col gap-3">
                        
                        {/* Top Line: Category Avatar, Titles & Net Amount Badge */}
                        <div className="flex items-start justify-between gap-3">
                          {/* Left Avatar & Identity */}
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border-2 shadow-2xs group-hover:scale-105 transition-transform"
                              style={{
                                backgroundColor: `${categoryColor}15`,
                                borderColor: `${categoryColor}40`,
                                color: categoryColor,
                              }}
                            >
                              <IconRenderer iconName={categoryIcon} />
                            </div>

                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate leading-tight">
                                  {subCategoryLabel}
                                </span>
                                <span
                                  className="text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider truncate"
                                  style={{
                                    backgroundColor: `${categoryColor}12`,
                                    borderColor: `${categoryColor}30`,
                                    color: categoryColor,
                                  }}
                                >
                                  {categoryLabel}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-1">
                                <div className="flex items-center gap-1">
                                  <Clock size={11} className="shrink-0" />
                                  <span>{timeStr}</span>
                                </div>
                                <span>•</span>
                                <span>#{item._id?.slice(-6).toUpperCase()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Amount Display */}
                          <div className="flex flex-col items-end shrink-0">
                            <span
                              className={`font-mono font-[1000] text-sm sm:text-base tracking-tight tabular-nums px-2.5 py-1 rounded-xl border shadow-2xs ${
                                isDebit
                                  ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
                                  : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
                              }`}
                            >
                              {isDebit ? "-" : "+"}₹{formatINR(item.amount)}
                            </span>
                          </div>
                        </div>

                        {/* Middle Line: Narration / Description Remark */}
                        {item.description && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-200/60 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 italic font-medium">
                            <FileText size={13} className="text-slate-400 shrink-0" />
                            <span className="truncate">"{item.description}"</span>
                          </div>
                        )}

                        {/* Bottom Action & Channel Strip */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 dark:border-white/5 text-xs">
                          {/* Channel & Balance Info */}
                          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                            {/* Channel Badges */}
                            <div className="flex items-center gap-1">
                              <span
                                className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider border shadow-2xs ${sourcePalette.badge}`}
                              >
                                {sourceName}
                              </span>
                              {targetName && targetPalette && (
                                <>
                                  <ArrowRight size={10} className="text-slate-400 shrink-0" />
                                  <span
                                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider border shadow-2xs ${targetPalette.badge}`}
                                  >
                                    {targetName}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Balance Movement Shift */}
                            {item.balanceBefore !== undefined && item.balanceAfter !== undefined && (
                              <div className="flex items-center gap-1.5 text-[10px] font-mono bg-slate-100/90 dark:bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/5">
                                <span className="text-slate-400 line-through">
                                  ₹{formatINR(item.balanceBefore)}
                                </span>
                                <ArrowRight size={9} className="text-slate-400 shrink-0" />
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

                          {/* Large, Visible Action Buttons */}
                          <div className="flex items-center gap-2 ml-auto shrink-0">
                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditClick(item, e);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
                              title="Edit transaction"
                            >
                              <Edit3 size={13} strokeWidth={2.5} />
                              <span>Edit</span>
                            </button>

                            {/* Void / Delete Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick(item, e);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
                              title="Delete transaction"
                            >
                              <Trash2 size={13} strokeWidth={2.5} />
                              <span>Delete</span>
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