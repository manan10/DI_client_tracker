import React from "react";
import {
  CreditCard,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Wallet,
  TrendingDown,
  TrendingUp,
  Tag,
  Clock,
  CheckCircle2,
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
  return <IconComponent size={16} className={className} />;
};

const DesktopLedgerTable = ({
  recentHistory = [],
  wallets = [],
  expandedId,
  toggleRow,
}) => {
  return (
    <div className="hidden lg:flex flex-col w-full space-y-2.5">
      {/* List Header Track */}
      <div className="grid grid-cols-12 gap-4 px-5 py-2.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        <div className="col-span-2">Date & Time</div>
        <div className="col-span-5">Narration & Category</div>
        <div className="col-span-3">Payment Channel</div>
        <div className="col-span-2 text-right">Net Flow</div>
      </div>

      {/* Transaction Strip Feed */}
      <div className="flex flex-col space-y-2">
        {recentHistory.map((item) => {
          const isExpanded = expandedId === item._id;
          const isPopulated = item.category && typeof item.category === "object";
          const rawCategory = isPopulated
            ? item.category.label
            : item.category || "General";
          const rawSubCategory = item.subCategory || "General Expense";

          // Proper casing applied
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
          const dayStr = txDate.getDate().toString().padStart(2, "0");
          const monthStr = txDate
            .toLocaleDateString("en-IN", { month: "short" })
            .toUpperCase();
          const yearStr = txDate.getFullYear();
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
              className={`group relative flex flex-col bg-white dark:bg-[#0B1120] rounded-xl border transition-all duration-200 cursor-pointer select-none overflow-hidden shadow-2xs hover:shadow-xs ${
                isExpanded
                  ? "border-slate-400/80 dark:border-white/30 ring-2 ring-emerald-500/10"
                  : "border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              {/* Left Accent Bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${
                  isDebit ? "bg-rose-500" : "bg-emerald-500"
                }`}
              />

              {/* Main Transaction Summary Row */}
              <div className="grid grid-cols-12 gap-4 items-center px-5 py-3.5 pl-6 min-h-[68px]">
                {/* 1. Date & Time Column */}
                <div className="col-span-2 flex flex-col min-w-0 pr-2 border-r border-slate-100 dark:border-white/5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
                      {dayStr} {monthStr}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">
                      {yearStr}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {timeStr}
                  </span>
                </div>

                {/* 2. Narration, Sub-category & Category Column */}
                <div className="col-span-5 flex items-center gap-3.5 min-w-0 pr-3 border-r border-slate-100 dark:border-white/5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs transition-transform duration-200 group-hover:scale-105 ${
                      isDebit
                        ? "bg-rose-50 text-rose-600 border-rose-200/80 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        : "bg-emerald-50 text-emerald-600 border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                    }`}
                  >
                    <IconRenderer iconName={categoryIcon} />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
                        {subCategoryLabel}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/5 truncate max-w-36">
                        {categoryLabel}
                      </span>
                    </div>

                    {item.description ? (
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 italic">
                        "{item.description}"
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                        No description provided
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Account / Channel Column */}
                <div className="col-span-3 flex items-center min-w-0 pr-2 border-r border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border shadow-2xs ${sourcePalette.badge}`}
                    >
                      <Wallet size={11} className="shrink-0" />
                      <span className="truncate max-w-28">{sourceName}</span>
                    </span>
                    {targetWallet && targetPalette && (
                      <>
                        <ArrowRight size={11} className="text-slate-400 shrink-0" />
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border shadow-2xs ${targetPalette.badge}`}
                        >
                          <Wallet size={11} className="shrink-0" />
                          <span className="truncate max-w-28">{targetName}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* 4. Net Amount & Expand Column */}
                <div className="col-span-2 flex items-center justify-end gap-3 pl-1">
                  <div
                    className={`inline-flex items-center justify-end font-mono font-black text-sm sm:text-base tracking-tight tabular-nums px-2.5 py-1 rounded-md border ${
                      isDebit
                        ? "text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-500/10 border-rose-200/60 dark:border-rose-500/20"
                        : "text-emerald-600 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20"
                    }`}
                  >
                    <span>{isDebit ? "-" : "+"}₹{formatINR(item.amount)}</span>
                  </div>

                  <div
                    className={`p-1.5 rounded-lg text-slate-400 transition-colors shrink-0 inline-flex items-center justify-center ${
                      isExpanded
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                        : "group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    }`}
                  >
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </div>
                </div>
              </div>

              {/* Integrated Drawer */}
              {isExpanded && (
                <div className="px-6 pb-4 pt-1 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 animate-in fade-in duration-150">
                  <div className="grid grid-cols-3 gap-4 p-4 bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/10 rounded-xl shadow-xs mt-2">
                    {/* Payment Audit */}
                    <div className="flex flex-col gap-1.5 border-r border-slate-100 dark:border-white/5 pr-4">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Tag size={12} className="text-emerald-500" /> Payment Audit
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {subCategoryLabel}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Class: <strong className="text-slate-700 dark:text-slate-300">{categoryLabel}</strong>
                        </span>
                      </div>
                      <div className="mt-1 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">
                          Memo Note:
                        </span>
                        {item.description ? `"${item.description}"` : "No internal memo attached."}
                      </div>
                    </div>

                    {/* Balance Trajectory */}
                    <div className="flex flex-col gap-1.5 border-r border-slate-100 dark:border-white/5 px-4">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        {isDebit ? (
                          <TrendingDown size={12} className="text-rose-500" />
                        ) : (
                          <TrendingUp size={12} className="text-emerald-500" />
                        )}
                        Vault Balance Movement
                      </span>

                      <div className="flex flex-col gap-1 mt-0.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {sourceName}
                        </span>
                        <div className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-white/5">
                          {beforeSource !== null && (
                            <>
                              <span className="text-slate-500 dark:text-slate-400">
                                ₹{formatINR(beforeSource)}
                              </span>
                              <ArrowRight size={12} className="text-slate-400" />
                            </>
                          )}
                          <span
                            className={
                              isDebit
                                ? "text-rose-600 dark:text-rose-400 font-black"
                                : "text-emerald-600 dark:text-emerald-400 font-black"
                            }
                          >
                            ₹{formatINR(afterSource ?? item.amount)}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                          {isDebit
                            ? `Net outflow debit: -₹${formatINR(item.amount)}`
                            : `Net inflow credit: +₹${formatINR(item.amount)}`}
                        </span>
                      </div>
                    </div>

                    {/* Settlement Meta */}
                    <div className="flex flex-col justify-between pl-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Clock size={12} className="text-indigo-500" /> Execution Stamp
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                          {dayStr} {monthStr} {yearStr} at {timeStr}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Transaction Model:{" "}
                          <strong className="text-slate-600 dark:text-slate-300">
                            {isTransfer
                              ? "Internal Transfer"
                              : isDebit
                              ? "Expense (Debit)"
                              : "Top-up (Credit)"}
                          </strong>
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Ref ID: #{item._id?.slice(-8).toUpperCase()}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200/60 dark:border-emerald-500/20">
                          <CheckCircle2 size={10} />
                          Reconciled
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
  );
};

export default DesktopLedgerTable;