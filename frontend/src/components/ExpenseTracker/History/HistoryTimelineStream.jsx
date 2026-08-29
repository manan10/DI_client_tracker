import React from "react";
import {
  History,
  Search,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ArrowRight,
  Edit3,
  Trash2,
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
  return <IconComponent size={16} className={className} />;
};

const HistoryTimelineStream = ({
  loading,
  transactionsCount,
  groupedTransactions,
  expandedId,
  onToggleRow,
  onEditClick,
  onDeleteClick,
  wallets = [],
  selectedMonthName,
  selectedYear,
}) => {
  return (
    <section className="flex flex-col gap-4 pt-4 border-t border-slate-200/80 dark:border-white/10">
      {/* Stream Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <History size={16} strokeWidth={2.5} />
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

        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5">
          {transactionsCount} Records
        </span>
      </div>

      {/* Feed Area */}
      {loading && transactionsCount === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-emerald-500/20 border-t-emerald-500" />
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Synchronizing Ledger Stream...
          </p>
        </div>
      ) : groupedTransactions.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center px-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-white/40 dark:bg-white/[0.01]">
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
        <div className="relative pl-4 sm:pl-5 space-y-8 before:absolute before:left-[17px] sm:before:left-[21px] before:top-4 before:bottom-4 before:w-1 before:bg-gradient-to-b before:from-emerald-500 before:via-indigo-500/40 before:to-transparent before:rounded-full">
          {groupedTransactions.map((group, groupIdx) => (
            <div key={groupIdx} className="relative flex flex-col gap-3">
              {/* Timeline Date Marker */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 border-2 border-white dark:border-[#060913] shrink-0 shadow-sm" />
                
                <div className="flex items-center gap-2">
                  <div className="flex items-baseline gap-1.5 px-3 py-1 bg-white dark:bg-[#0B1120] border-2 border-slate-300 dark:border-white/15 rounded-xl shadow-xs">
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

              {/* Items in Day */}
              <div className="flex flex-col gap-2.5 pl-6 sm:pl-8">
                {group.items.map((item) => {
                  const isExpanded = expandedId === item._id;
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
                      onClick={() => onToggleRow(item._id)}
                      className={`group relative bg-white dark:bg-[#0B1120] border-2 rounded-xl transition-all duration-200 cursor-pointer select-none overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-white/20 active:scale-[0.99] ${
                        isExpanded
                          ? "border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/15"
                          : "border-slate-200/90 dark:border-white/10"
                      }`}
                    >
                      {/* Chromatic Category Left Rail */}
                      <div
                        className="absolute left-0 inset-y-0 w-1.5"
                        style={{ backgroundColor: categoryColor }}
                      />

                      {/* Card Main Row */}
                      <div className="p-3.5 pl-4 sm:pl-5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 shadow-2xs"
                            style={{
                              backgroundColor: `${categoryColor}15`,
                              borderColor: `${categoryColor}35`,
                              color: categoryColor,
                            }}
                          >
                            <IconRenderer iconName={categoryIcon} />
                          </div>

                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                                {subCategoryLabel}
                              </span>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span
                                className="text-[9px] font-black px-1.5 py-0.2 rounded-md border uppercase tracking-wider truncate max-w-32"
                                style={{
                                  backgroundColor: `${categoryColor}12`,
                                  borderColor: `${categoryColor}25`,
                                  color: categoryColor,
                                }}
                              >
                                {categoryLabel}
                              </span>
                            </div>

                            {item.description ? (
                              <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5 font-medium">
                                "{item.description}"
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                                {timeStr}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 pl-1">
                          <div className="flex flex-col items-end">
                            <span
                              className={`font-mono font-[1000] text-xs sm:text-sm tracking-tight tabular-nums px-2 py-0.5 rounded-md border ${
                                isDebit
                                  ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
                                  : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
                              }`}
                            >
                              {isDebit ? "-" : "+"}₹{formatINR(item.amount)}
                            </span>

                            <div className="flex items-center gap-1 text-[9px] font-mono mt-1">
                              <span
                                className={`px-1.5 py-0.2 rounded-sm font-bold uppercase tracking-wider border shadow-2xs ${sourcePalette.badge}`}
                              >
                                {sourceName}
                              </span>
                              {targetName && targetPalette && (
                                <>
                                  <ArrowRight size={9} className="text-slate-400" />
                                  <span
                                    className={`px-1.5 py-0.2 rounded-sm font-bold uppercase tracking-wider border shadow-2xs ${targetPalette.badge}`}
                                  >
                                    {targetName}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="text-slate-400">
                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </div>
                        </div>
                      </div>

                      {/* Inspection Drawer */}
                      {isExpanded && (
                        <div className="px-3 sm:px-3.5 pb-3 pt-1 text-xs flex flex-col gap-2 border-t border-slate-100 dark:border-white/5 animate-in fade-in duration-150">
                          <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-lg border border-slate-200/80 dark:border-white/10 flex flex-col gap-2">
                            <div className="flex items-center justify-between text-[10px] pb-1.5 border-b border-slate-200/60 dark:border-white/5">
                              <span className="text-slate-500 font-semibold">Reference ID:</span>
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                #{item._id?.slice(-8).toUpperCase()}
                              </span>
                            </div>

                            {item.balanceBefore !== undefined && item.balanceAfter !== undefined && (
                              <div className="flex items-center justify-between text-[10px] font-mono pb-1.5 border-b border-slate-200/60 dark:border-white/5">
                                <span className="text-slate-500 font-semibold">Balance Shift:</span>
                                <div className="flex items-center gap-2 font-black">
                                  <span className="text-slate-400 line-through">
                                    ₹{formatINR(item.balanceBefore)}
                                  </span>
                                  <ArrowRight size={10} className="text-slate-400" />
                                  <span className={isDebit ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}>
                                    ₹{formatINR(item.balanceAfter)}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                                Transaction Remark:
                              </span>
                              <p className="text-slate-800 dark:text-slate-200 font-medium italic text-[11px] bg-white dark:bg-[#0B1120] p-2 rounded-md border border-slate-200/80 dark:border-white/5">
                                "{item.description || "Standard treasury transfer."}"
                              </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-slate-200/60 dark:border-white/5">
                              <button
                                type="button"
                                onClick={(e) => onEditClick(item, e)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-500/30"
                              >
                                <Edit3 size={12} />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => onDeleteClick(item, e)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors cursor-pointer border border-rose-200 dark:border-rose-500/30"
                              >
                                <Trash2 size={12} />
                                <span>Void</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
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