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
  ArrowUpRight,
  ArrowDownLeft,
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

const DesktopLedgerTable = ({
  recentHistory = [],
  wallets = [],
  expandedId,
  toggleRow,
}) => {
  return (
    <div className="hidden lg:flex flex-col w-full overflow-hidden rounded-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] shadow-2xs font-sans">
      {/* ── Table Header Strip ── */}
      <div className="grid grid-cols-12 gap-3 px-6 py-3.5 border-b border-slate-200 dark:border-white/10 select-none text-xs font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-slate-100/80 dark:bg-white/[0.04]">
        <div className="col-span-2 flex items-center gap-1.5">
          <span>Date</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span>Time</span>
        </div>
        <div className="col-span-4">Expense / Item</div>
        <div className="col-span-3">Paid From</div>
        <div className="col-span-3 text-right pr-2">Amount</div>
      </div>

      {/* ── Continuous Row Feed ── */}
      <div className="flex flex-col divide-y divide-slate-100 dark:divide-white/5">
        {recentHistory.map((item) => {
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

              {/* Main Interactive Row */}
              <div
                onClick={() => toggleRow(item._id)}
                className="grid grid-cols-12 gap-3 items-center px-6 py-3.5 cursor-pointer min-h-[58px]"
              >
                {/* 1. Date & Time Column */}
                <div className="col-span-2 flex flex-col min-w-0 pr-2 border-r border-slate-100 dark:border-white/5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white tracking-tight">
                      {dayStr} {monthStr}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-medium">
                      {yearStr}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={10} className="text-slate-400 shrink-0" />
                    <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400">
                      {timeStr}
                    </span>
                  </div>
                </div>

                {/* 2. Expense / Item Column */}
                <div className="col-span-4 flex items-center gap-3 min-w-0 pr-2 border-r border-slate-100 dark:border-white/5">
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
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-serif tracking-tight text-xs text-slate-900 dark:text-white truncate">
                        {subCategoryLabel}
                      </span>
                      <span className="text-[9px] font-mono font-medium uppercase tracking-wider px-1.5 py-0.2 rounded-xs bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-white/10 truncate max-w-28">
                        {categoryLabel}
                      </span>
                    </div>

                    {item.description ? (
                      <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        "{item.description}"
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                        No note added
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Paid From Column */}
                <div className="col-span-3 flex items-center min-w-0 pr-2 border-r border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold tracking-wide uppercase border ${sourcePalette.badge}`}
                    >
                      <Wallet size={11} className="shrink-0 opacity-80" />
                      <span className="truncate max-w-28">{sourceName}</span>
                    </span>

                    {targetWallet && targetPalette && (
                      <>
                        <ArrowRight size={11} className="text-slate-400 shrink-0" />
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold tracking-wide uppercase border ${targetPalette.badge}`}
                        >
                          <Wallet size={11} className="shrink-0 opacity-80" />
                          <span className="truncate max-w-28">{targetName}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* 4. Amount Column */}
                <div className="col-span-3 flex items-center justify-end gap-3 pl-1 whitespace-nowrap">
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
                      className={`font-mono font-bold text-sm tabular-nums tracking-tight ${
                        isDebit
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {isDebit ? "-" : "+"}₹{formatINR(item.amount)}
                    </span>
                  </div>

                  <div className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors p-1 shrink-0">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>
              </div>

              {/* ── Expanded Detail Drawer ── */}
              {isExpanded && (
                <div className="px-6 pb-4 pt-1 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.015] animate-in fade-in duration-100">
                  <div className="grid grid-cols-3 gap-4 p-3.5 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xs shadow-2xs mt-1.5">
                    
                    {/* Section 1: Details */}
                    <div className="flex flex-col gap-1.5 border-r border-slate-100 dark:border-white/5 pr-4">
                      <span className="text-[11px] font-sans font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Tag size={12} className="text-emerald-600 dark:text-emerald-400" /> Details
                      </span>
                      <div className="flex flex-col mt-0.5">
                        <span className="text-xs font-serif tracking-tight text-slate-900 dark:text-white">
                          {subCategoryLabel}
                        </span>
                        <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-0.5">
                          Category: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{categoryLabel}</strong>
                        </span>
                      </div>
                      <div className="mt-1 p-2 rounded-xs bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 text-[11px] font-sans text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5 font-sans">
                          Note:
                        </span>
                        {item.description ? `"${item.description}"` : "No note attached."}
                      </div>
                    </div>

                    {/* Section 2: Wallet Balance */}
                    <div className="flex flex-col gap-1.5 border-r border-slate-100 dark:border-white/5 px-4">
                      <span className="text-[11px] font-sans font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        {isDebit ? (
                          <TrendingDown size={12} className="text-rose-500" />
                        ) : (
                          <TrendingUp size={12} className="text-emerald-500" />
                        )}
                        Wallet Balance
                      </span>

                      <div className="flex flex-col gap-1 mt-0.5">
                        <span className="text-xs font-serif tracking-tight text-slate-800 dark:text-slate-200 truncate">
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
                                ? "text-rose-600 dark:text-rose-400 font-bold"
                                : "text-emerald-600 dark:text-emerald-400 font-bold"
                            }`}
                          >
                            ₹{formatINR(afterSource ?? item.amount)}
                          </span>
                        </div>
                        <span className="text-[11px] font-sans font-normal text-slate-500 dark:text-slate-400">
                          {isDebit
                            ? `Amount spent: ₹${formatINR(item.amount)}`
                            : `Amount added: ₹${formatINR(item.amount)}`}
                        </span>
                      </div>
                    </div>

                    {/* Section 3: Summary & Date */}
                    <div className="flex flex-col justify-between pl-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-sans font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Clock size={12} className="text-indigo-500" /> Date & Time
                        </span>
                        <span className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                          {dayStr} {monthStr} {yearStr} at {timeStr}
                        </span>
                        <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-1">
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

                      <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>ID: #{item._id?.slice(-8).toUpperCase()}</span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-sans">
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
  );
};

export default DesktopLedgerTable;