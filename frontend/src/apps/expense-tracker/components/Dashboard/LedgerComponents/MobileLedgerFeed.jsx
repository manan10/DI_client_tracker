import React from "react";
import {
  CreditCard,
  Calendar,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Tag,
  ChevronDown,
  ChevronUp,
  Wallet,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { getWalletColor } from "../walletUtils";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.abs(amount || 0)
  );
};

// Formats text into proper case: 1st letter capitalized, rest lowercase per word
const toProperCase = (str = "") => {
  if (!str) return "";
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

const MobileLedgerFeed = ({
  groupedMobileTransactions = [],
  wallets = [],
  expandedId,
  toggleRow,
}) => {
  return (
    <div className="lg:hidden flex flex-col space-y-4 w-full">
      {groupedMobileTransactions.map((group, groupIdx) => (
        <div key={groupIdx} className="flex flex-col">
          {/* Crisp Date Divider */}
          <div className="flex items-center gap-2 px-1 py-1 mb-1.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs">
              <Calendar size={11} className="text-emerald-400 dark:text-emerald-600" />
              <span className="text-[10px] font-mono font-black uppercase tracking-wider">
                {group.header}
              </span>
            </div>
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
          </div>

          {/* List of Transactions */}
          <div className="flex flex-col space-y-1.5">
            {group.items.map((item) => {
              const isExpanded = expandedId === item._id;
              const isPopulated = item.category && typeof item.category === "object";
              const rawCategory = isPopulated
                ? item.category.label
                : item.category || "General";
              const rawSubCategory = item.subCategory || "General Expense";

              // Proper Casing applied: 1st letter capital, rest small
              const categoryLabel = toProperCase(rawCategory);
              const subCategoryLabel = toProperCase(rawSubCategory);

              const categoryIcon = isPopulated ? item.category.icon : "CreditCard";

              const sourceWalletIndex = wallets?.findIndex(
                (w) => w._id === (item.sourceWallet?._id || item.sourceWallet)
              );
              const sourceWallet = wallets?.[sourceWalletIndex];
              const sourceName = sourceWallet?.walletName || "Direct Spend";
              const sourcePalette = getWalletColor(
                sourceWallet?._id || sourceName,
                sourceWalletIndex >= 0 ? sourceWalletIndex : null
              );

              const targetWalletIndex = wallets?.findIndex(
                (w) => w._id === (item.targetWallet?._id || item.targetWallet)
              );
              const targetWallet = wallets?.[targetWalletIndex];
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

              const beforeSource =
                item.balanceBefore !== undefined
                  ? item.balanceBefore
                  : sourceWallet
                  ? sourceWallet.balance + (isDebit ? item.amount : -item.amount)
                  : null;
              const afterSource =
                item.balanceAfter !== undefined
                  ? item.balanceAfter
                  : sourceWallet?.balance;

              return (
                <div
                  key={item._id}
                  onClick={() => toggleRow(item._id)}
                  className={`group relative flex flex-col rounded-md border transition-all duration-150 cursor-pointer select-none overflow-hidden ${
                    isDebit
                      ? isExpanded
                        ? "bg-rose-50/70 dark:bg-rose-950/20 border-rose-400 dark:border-rose-500/60 shadow-xs"
                        : "bg-white dark:bg-[#0B1120] border-rose-200/90 dark:border-rose-900/40 hover:border-rose-400 active:bg-rose-50/40"
                      : isExpanded
                      ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-500/60 shadow-xs"
                      : "bg-white dark:bg-[#0B1120] border-emerald-200/90 dark:border-emerald-900/40 hover:border-emerald-400 active:bg-emerald-50/40"
                  }`}
                >
                  {/* High-Contrast Left Edge Indicator Rail */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      isDebit ? "bg-rose-600" : "bg-emerald-600"
                    }`}
                  />

                  {/* Primary Summary Strip */}
                  <div className="p-3 pl-3.5 flex items-center justify-between gap-2.5">
                    {/* Left: Icon & Category Hierarchy */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 border shadow-2xs ${
                          isDebit
                            ? "bg-rose-100/80 text-rose-700 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30"
                            : "bg-emerald-100/80 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
                        }`}
                      >
                        <IconRenderer iconName={categoryIcon} />
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 truncate">
                          {/* Sub Category: Prominent & Title-Cased */}
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {subCategoryLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {/* Category Badge: Title-Cased */}
                          <span
                            className={`font-bold px-1.5 py-0.2 rounded-xs tracking-normal text-[9.5px] border ${
                              isDebit
                                ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
                            }`}
                          >
                            {categoryLabel}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="font-mono text-slate-400 shrink-0">{timeStr}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Net Amount & Highly Visible Wallet Badges */}
                    <div className="flex flex-col items-end shrink-0 pl-1">
                      <span
                        className={`font-mono font-[1000] text-sm tabular-nums tracking-tight px-1.5 py-0.5 rounded-xs border ${
                          isDebit
                            ? "text-rose-700 dark:text-rose-300 bg-rose-100/50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30"
                            : "text-emerald-700 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30"
                        }`}
                      >
                        {isDebit ? "- " : "+ "}₹{formatINR(item.amount)}
                      </span>

                      {/* Prominent High-Visibility Wallet Badge Chip */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider border shadow-2xs ${sourcePalette.badge}`}
                        >
                          <Wallet size={10} className="shrink-0" />
                          <span className="truncate max-w-[90px]">{sourceName}</span>
                        </span>

                        {targetName && targetPalette && (
                          <>
                            <ArrowRight size={9} className="text-slate-400 shrink-0" />
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider border shadow-2xs ${targetPalette.badge}`}
                            >
                              <Wallet size={10} className="shrink-0" />
                              <span className="truncate max-w-[90px]">{targetName}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-slate-400 pl-0.5">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>

                  {/* Expanded Transaction Drawer */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-0 text-[11px] flex flex-col gap-2">
                      <div className="p-2.5 rounded-sm bg-slate-50 dark:bg-[#070B14] border border-slate-200/80 dark:border-white/10 flex flex-col gap-2">
                        {/* Transaction Detail Row */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-white/5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Tag size={10} className={isDebit ? "text-rose-500" : "text-emerald-500"} />
                            Payment Route
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[9.5px] font-mono font-bold uppercase tracking-wider border ${sourcePalette.badge}`}
                            >
                              <Wallet size={9} className="shrink-0" />
                              <span>{sourceName}</span>
                            </span>
                            {targetName && targetPalette && (
                              <>
                                <ArrowRight size={9} className="text-slate-400 shrink-0" />
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[9.5px] font-mono font-bold uppercase tracking-wider border ${targetPalette.badge}`}
                                >
                                  <Wallet size={9} className="shrink-0" />
                                  <span>{targetName}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Balance Trajectory */}
                        <div className="flex items-center justify-between font-mono pb-1.5 border-b border-slate-200/60 dark:border-white/5">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            {isDebit ? (
                              <TrendingDown size={10} className="text-rose-500" />
                            ) : (
                              <TrendingUp size={10} className="text-emerald-500" />
                            )}
                            Flow Delta
                          </span>
                          <div className="flex items-center gap-1 text-[11px]">
                            {beforeSource !== null && (
                              <>
                                <span className="text-slate-400">₹{formatINR(beforeSource)}</span>
                                <ArrowRight size={9} className="text-slate-400" />
                              </>
                            )}
                            <span
                              className={`font-black ${
                                isDebit
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              ₹{formatINR(afterSource ?? item.amount)}
                            </span>
                          </div>
                        </div>

                        {/* Note / Memo */}
                        {item.description ? (
                          <div className="text-slate-600 dark:text-slate-300 italic text-[11px] bg-white dark:bg-[#0B1120] p-1.5 rounded-xs border border-slate-200/60 dark:border-white/5">
                            "{item.description}"
                          </div>
                        ) : (
                          <div className="text-[10px] font-mono text-slate-400">
                            No memo attached to this transaction.
                          </div>
                        )}

                        {/* Audit Ref Stamp */}
                        <div className="flex items-center justify-between pt-1 text-[9px] font-mono text-slate-400">
                          <span>REF: #{item._id?.slice(-8).toUpperCase()}</span>
                          <span
                            className={`font-bold px-1.5 py-0.2 rounded-xs ${
                              isDebit
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                            }`}
                          >
                            {isDebit ? "Disbursed" : "Credited"}
                          </span>
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
  );
};

export default MobileLedgerFeed;