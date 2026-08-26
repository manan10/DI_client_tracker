import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  History,
  MoveUpRight,
  CreditCard,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Landmark,
  Wallet,
  FileText,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Tag,
  Receipt,
  Sparkles,
  Layers,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { getWalletColor } from "./walletUtils";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.abs(amount || 0)
  );
};

const IconRenderer = ({ iconName, className = "" }) => {
  const IconComponent = LucideIcons[iconName] || CreditCard;
  return <IconComponent size={14} className={className} />;
};

const TransactionLedger = ({ recentHistory = [], wallets = [] }) => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleRow = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="lg:col-span-7 w-full flex flex-col">
      {/* Ledger Header Strip */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/90 dark:border-white/10 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
            <History size={16} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white leading-tight">
                Recent Transactions
              </h3>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-white/5">
                {recentHistory.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Tap any row to view before & after balance changes
            </p>
          </div>
        </div>

        <Link
          to="/expenses/history"
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition-all active:scale-95 border border-slate-200/80 dark:border-white/10 shadow-2xs"
        >
          <span>All Records</span>
          <MoveUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {/* Desktop Structured Table (>= lg) */}
      <div className="hidden lg:block w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <th className="py-2.5 pr-3 pl-2">Date</th>
              <th className="py-2.5 px-3">Item & Category</th>
              <th className="py-2.5 px-3">Paid Via</th>
              <th className="py-2.5 pl-3 text-right">Amount</th>
              <th className="py-2.5 pl-2 pr-2 w-10 text-center" aria-label="Details" />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
            {recentHistory.map((item) => {
              const isExpanded = expandedId === item._id;
              const isPopulated = item.category && typeof item.category === "object";
              const categoryLabel = isPopulated
                ? item.category.label
                : item.category || "General";
              const categoryIcon = isPopulated ? item.category.icon : "CreditCard";
              const subCategoryLabel = item.subCategory || "General Expense";

              // Source and Target Wallet Resolution
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

              const isDebit = item.type === "DEBIT";
              const isTransfer = Boolean(item.targetWallet);

              const txDate = new Date(item.date);
              const dayStr = txDate.getDate().toString().padStart(2, "0");
              const monthStr = txDate
                .toLocaleDateString("en-IN", { month: "short" })
                .toUpperCase();
              const yearStr = txDate.getFullYear();
              const timeStr = txDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              });

              // Balance before and after calculation fallback
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
                <React.Fragment key={item._id}>
                  <tr
                    onClick={() => toggleRow(item._id)}
                    className={`group cursor-pointer transition-all duration-200 select-none relative ${
                      isExpanded
                        ? "bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs"
                        : "hover:bg-slate-100/70 dark:hover:bg-white/[0.04] hover:shadow-2xs"
                    }`}
                  >
                    {/* Date Column */}
                    <td className="py-3.5 pr-3 pl-2 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap align-middle">
                      <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-slate-100 font-black group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {dayStr} {monthStr}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {yearStr}
                        </span>
                      </div>
                    </td>

                    {/* Sub Category -> Category Column */}
                    <td className="py-3.5 px-3 min-w-0 max-w-72 align-middle">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Status Icon */}
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 shadow-2xs ${
                            isDebit
                              ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                              : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          }`}
                        >
                          <IconRenderer iconName={categoryIcon} />
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          {/* Subcategory -> Category Path */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                              {subCategoryLabel}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">/</span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/5 truncate max-w-36">
                              {categoryLabel}
                            </span>
                          </div>

                          {/* Notes */}
                          {item.description ? (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 italic">
                              "{item.description}"
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">
                              No notes attached
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Paid Via (Source & Destination Wallets) */}
                    <td className="py-3.5 px-3 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border shadow-2xs ${sourcePalette.badge}`}
                        >
                          <Wallet size={10} className="shrink-0" />
                          <span>{sourceName}</span>
                        </span>
                        {targetWallet && targetPalette && (
                          <>
                            <ArrowRight size={12} className="text-slate-400 shrink-0" />
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border shadow-2xs ${targetPalette.badge}`}
                            >
                              <Wallet size={10} className="shrink-0" />
                              <span>{targetName}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Amount Column */}
                    <td className="py-3.5 pl-3 text-right whitespace-nowrap align-middle">
                      <div
                        className={`inline-flex items-center justify-end gap-1 font-mono font-black text-sm tracking-tight tabular-nums px-2 py-0.5 rounded-md ${
                          isDebit
                            ? "text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-500/10"
                            : "text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-500/10"
                        }`}
                      >
                        <span>{isDebit ? "-" : "+"}₹{formatINR(item.amount)}</span>
                      </div>
                    </td>

                    {/* Expand Indicator */}
                    <td className="py-3.5 pl-2 pr-2 text-center align-middle">
                      <div
                        className={`p-1 rounded-md text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-all duration-200 inline-flex items-center justify-center ${
                          isExpanded ? "bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-white" : ""
                        }`}
                      >
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </div>
                    </td>
                  </tr>

                  {/* Interactive Ledger Detail Slip */}
                  {isExpanded && (
                    <tr className="bg-slate-50/80 dark:bg-white/[0.02]">
                      <td colSpan={5} className="px-3 py-3 border-y border-slate-200 dark:border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/10 rounded-xl shadow-xs animate-in fade-in slide-in-from-top-1 duration-150">
                          
                          {/* 1. What was this for? */}
                          <div className="flex flex-col gap-1.5 border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/5 pb-2.5 md:pb-0 md:pr-3.5">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              <Tag size={12} className="text-emerald-500" /> Payment Details
                            </span>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {subCategoryLabel}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                Category: <strong className="text-slate-700 dark:text-slate-300">{categoryLabel}</strong>
                              </span>
                            </div>
                            <div className="mt-1 p-2 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-300">
                              <span className="font-semibold text-slate-400 block text-[9px] uppercase tracking-wider">Note:</span>
                              {item.description ? `"${item.description}"` : "No special note written."}
                            </div>
                          </div>

                          {/* 2. Wallet Balance Impact */}
                          <div className="flex flex-col gap-1.5 border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/5 pb-2.5 md:pb-0 md:px-3.5">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              {isDebit ? (
                                <TrendingDown size={12} className="text-rose-500" />
                              ) : (
                                <TrendingUp size={12} className="text-emerald-500" />
                              )}
                              Wallet Balance Impact
                            </span>
                            
                            <div className="flex flex-col gap-1 mt-0.5">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {sourceName}
                              </span>
                              <div className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900/60 p-2 rounded-md border border-slate-100 dark:border-white/5">
                                {beforeSource !== null && (
                                  <>
                                    <span className="text-slate-500 dark:text-slate-400">₹{formatINR(beforeSource)}</span>
                                    <ArrowRight size={12} className="text-slate-400" />
                                  </>
                                )}
                                <span className={isDebit ? "text-rose-600 dark:text-rose-400 font-black" : "text-emerald-600 dark:text-emerald-400 font-black"}>
                                  ₹{formatINR(afterSource ?? item.amount)}
                                </span>
                              </div>
                              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                {isDebit ? `Money deducted: -₹${formatINR(item.amount)}` : `Money added: +₹${formatINR(item.amount)}`}
                              </span>
                            </div>
                          </div>

                          {/* 3. Transaction Summary & Time */}
                          <div className="flex flex-col justify-between md:pl-3.5">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Clock size={12} className="text-indigo-500" /> Timestamp
                              </span>
                              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                                {dayStr} {monthStr} {yearStr} at {timeStr}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                Type: <strong className="text-slate-600 dark:text-slate-300">{isTransfer ? "Internal Transfer" : isDebit ? "Expense (Outflow)" : "Top-up (Inflow)"}</strong>
                              </span>
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                              <span>Ref: #{item._id?.slice(-6).toUpperCase()}</span>
                              <span className="px-1.5 py-0.2 rounded-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                                Settled
                              </span>
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Compact Feed View (< lg) */}
      <div className="lg:hidden flex flex-col divide-y divide-slate-100 dark:divide-white/5">
        {recentHistory.map((item) => {
          const isExpanded = expandedId === item._id;
          const isPopulated = item.category && typeof item.category === "object";
          const categoryLabel = isPopulated
            ? item.category.label
            : item.category || "General";
          const categoryIcon = isPopulated ? item.category.icon : "CreditCard";
          const subCategoryLabel = item.subCategory || "General Expense";

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

          const isDebit = item.type === "DEBIT";
          const txDate = new Date(item.date);
          const dayStr = txDate.getDate().toString().padStart(2, "0");
          const monthStr = txDate
            .toLocaleDateString("en-IN", { month: "short" })
            .toUpperCase();
          const timeStr = txDate.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={item._id}
              onClick={() => toggleRow(item._id)}
              className={`p-3.5 flex flex-col gap-2.5 transition-all duration-200 cursor-pointer rounded-lg my-0.5 ${
                isExpanded
                  ? "bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20"
                  : "hover:bg-slate-100/70 dark:hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 shadow-2xs ${
                      isDebit
                        ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                    }`}
                  >
                    <IconRenderer iconName={categoryIcon} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {subCategoryLabel}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">/</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/5">
                        {categoryLabel}
                      </span>
                    </div>
                    {item.description ? (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 italic">
                        "{item.description}"
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        No note recorded
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`font-mono font-black text-sm tracking-tight tabular-nums px-2 py-0.5 rounded-md shrink-0 ${
                    isDebit
                      ? "text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-500/10"
                      : "text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-500/10"
                  }`}
                >
                  {isDebit ? "-" : "+"}₹{formatINR(item.amount)}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider border shadow-2xs ${sourcePalette.badge}`}
                  >
                    {sourceName}
                  </span>
                  {targetWallet && targetPalette && (
                    <>
                      <ArrowRight size={10} className="text-slate-400" />
                      <span
                        className={`px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider border shadow-2xs ${targetPalette.badge}`}
                      >
                        {targetName}
                      </span>
                    </>
                  )}
                </div>
                <span className="font-bold text-slate-600 dark:text-slate-300">
                  {dayStr} {monthStr} • {timeStr}
                </span>
              </div>

              {/* Mobile Expanded Drawer Detail */}
              {isExpanded && (
                <div className="mt-1.5 p-3 bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/10 rounded-lg text-xs flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-150 shadow-xs">
                  <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-100 dark:border-white/5">
                    <span className="text-slate-500 font-medium">Money Deducted From:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{sourceName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">Balance Impact:</span>
                    <span className={isDebit ? "text-rose-500 font-bold" : "text-emerald-500 font-bold"}>
                      {isDebit ? `-₹${formatINR(item.amount)} (Spent)` : `+₹${formatINR(item.amount)} (Added)`}
                    </span>
                  </div>
                  {item.description && (
                    <div className="text-slate-600 dark:text-slate-300 italic text-[11px] p-2 bg-slate-50 dark:bg-slate-900/60 rounded-md border border-slate-100 dark:border-white/5">
                      "{item.description}"
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {recentHistory.length === 0 && (
        <div className="py-14 flex flex-col items-center justify-center text-center px-4 border border-dashed border-slate-200 dark:border-white/10 rounded-xl mt-3 bg-white/40 dark:bg-white/[0.01]">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2.5 text-slate-400">
            <History size={18} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
            No Transactions Yet
          </span>
          <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
            Expenses, wallet top-ups, and internal fund transfers will appear here in real time.
          </p>
        </div>
      )}
    </section>
  );
};

export default TransactionLedger;