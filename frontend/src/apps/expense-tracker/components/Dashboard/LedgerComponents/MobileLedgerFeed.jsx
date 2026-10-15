import React from "react";
import {
  CreditCard,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Tag,
  Clock,
  Wallet,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { getWalletColor } from "../walletUtils";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.abs(amount || 0)
  );
};

// Formats text into clean title casing
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
    <div className="lg:hidden flex flex-col space-y-6 w-full min-w-0 max-w-full">
      {groupedMobileTransactions.map((group, groupIdx) => {
        // Derive clean date attributes from the first transaction in the group
        const sampleDate = group.items?.[0]?.date ? new Date(group.items[0].date) : new Date();
        const dayStr = sampleDate.getDate().toString().padStart(2, "0");
        const monthStr = sampleDate.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
        const yearStr = sampleDate.getFullYear();
        const weekdayStr = sampleDate.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase();

        return (
          <div key={groupIdx} className="flex flex-col w-full min-w-0">
            {/* ── High-Precision Date Header Block ── */}
            <div className="flex items-center justify-between gap-3 px-1 mb-2 w-full min-w-0">
              <div className="flex items-center gap-2">
                {/* Two-tone Date Block */}
                <div className="inline-flex items-stretch rounded-sm bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-slate-200/90 dark:border-white/10 shadow-2xs overflow-hidden shrink-0">
                  <span className="px-2 py-0.5 text-xs font-mono font-black leading-none flex items-center">
                    {dayStr}
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 flex items-center">
                    {monthStr}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">{weekdayStr}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span>{yearStr}</span>
                  {group.header === "Today" || group.header === "Yesterday" ? (
                    <span className="ml-1 px-1.5 py-0.2 text-[9px] uppercase font-bold tracking-wider rounded-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                      {group.header}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex-1 h-px bg-slate-200/80 dark:bg-white/10 ml-2" />
            </div>

            {/* ── Continuous Segment List ── */}
            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-sm shadow-2xs overflow-hidden divide-y divide-slate-100 dark:divide-white/5 w-full min-w-0">
              {group.items.map((item) => {
                const isExpanded = expandedId === item._id;
                const isPopulated = item.category && typeof item.category === "object";
                const rawCategory = isPopulated
                  ? item.category.label
                  : item.category || "General";
                const rawSubCategory = item.subCategory || "General Expense";

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
                    ? sourceWallet.balance + (isDebit ? item.amount : -item.amount)
                    : null;
                const afterSource =
                  item.balanceAfter !== undefined
                    ? item.balanceAfter
                    : sourceWallet?.balance;

                return (
                  <div
                    key={item._id}
                    className={`group relative flex flex-col transition-colors duration-150 select-none w-full min-w-0 ${
                      isExpanded
                        ? "bg-slate-50/70 dark:bg-white/[0.03]"
                        : "active:bg-slate-50 dark:active:bg-white/[0.015]"
                    }`}
                  >
                    {/* Left Stripe Indicator */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-150 ${
                        isExpanded
                          ? isDebit
                            ? "bg-rose-500"
                            : "bg-emerald-500"
                          : isDebit
                          ? "bg-rose-300 dark:bg-rose-900/60"
                          : "bg-emerald-300 dark:bg-emerald-900/60"
                      }`}
                    />

                    {/* ── Main Row Item ── */}
                    <div
                      onClick={() => toggleRow(item._id)}
                      className="p-3 pl-3.5 flex items-start justify-between gap-3 cursor-pointer w-full min-w-0"
                    >
                      {/* Left: Icon & Category Information */}
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
                              <Wallet size={9} className="shrink-0 opacity-80" />
                              <span>{sourceName}</span>
                            </span>

                            {targetWallet && targetPalette && (
                              <>
                                <ArrowRight size={8} className="text-slate-400 shrink-0" />
                                <span
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-xs text-[9px] font-mono font-bold tracking-wide uppercase border ${targetPalette.badge}`}
                                >
                                  <Wallet size={9} className="shrink-0 opacity-80" />
                                  <span>{targetName}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Net Amount & Timestamp */}
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
                            {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Expanded Detail Drawer ── */}
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0 text-[11px] flex flex-col gap-2 w-full min-w-0 animate-in fade-in duration-100">
                        <div className="p-3 rounded-xs bg-slate-50 dark:bg-[#070B14] border border-slate-200/80 dark:border-white/10 flex flex-col gap-2.5 w-full min-w-0">
                          {/* Note / Description */}
                          {item.description ? (
                            <div className="text-slate-700 dark:text-slate-300 italic text-[11px] bg-white dark:bg-[#0B1120] p-2 rounded-xs border border-slate-200/70 dark:border-white/5 break-words">
                              "{item.description}"
                            </div>
                          ) : (
                            <div className="text-[10px] font-mono text-slate-400">
                              No note recorded.
                            </div>
                          )}

                          {/* Wallet Balance Movement */}
                          <div className="flex flex-col gap-1 pt-1 border-t border-slate-200/60 dark:border-white/5 w-full min-w-0">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                              {isDebit ? (
                                <TrendingDown size={11} className="text-rose-500" />
                              ) : (
                                <TrendingUp size={11} className="text-emerald-500" />
                              )}
                              Wallet Balance
                            </span>

                            <div className="flex items-center justify-between text-xs font-mono font-bold bg-white dark:bg-[#0B1120] p-2 rounded-xs border border-slate-200/70 dark:border-white/5 w-full min-w-0">
                              <span className="truncate text-slate-600 dark:text-slate-300 max-w-[45%]">
                                {sourceName}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {beforeSource !== null && (
                                  <>
                                    <span className="text-slate-400 tabular-nums">
                                      ₹{formatINR(beforeSource)}
                                    </span>
                                    <ArrowRight size={10} className="text-slate-400" />
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
                            </div>
                          </div>

                          {/* Summary Metadata */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-white/5 text-[10px] font-mono text-slate-400 w-full min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Clock size={11} className="text-indigo-500 shrink-0" />
                              <span>{timeStr}</span>
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {isTransfer
                                ? "Transfer"
                                : isDebit
                                ? "Expense"
                                : "Top-up"}
                            </span>
                          </div>

                          {/* Ref ID & Status */}
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5 w-full min-w-0">
                            <span>ID: #{item._id?.slice(-8).toUpperCase()}</span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-500/20 text-[9px]">
                              <CheckCircle2 size={10} />
                              Checked
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
        );
      })}
    </div>
  );
};

export default MobileLedgerFeed;