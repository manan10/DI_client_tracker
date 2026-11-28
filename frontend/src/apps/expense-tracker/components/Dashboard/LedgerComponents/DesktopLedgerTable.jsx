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
  ArrowLeftRight,
} from "lucide-react";
import * as LucideIcons from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.abs(amount || 0)
  );
};

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
    <div
      style={{ fontFamily: "'Nunito Sans', sans-serif" }}
      className="hidden lg:flex flex-col w-full overflow-hidden rounded-2xl border border-stone-200/80 dark:border-white/[0.07] bg-white dark:bg-[#1A1C20] shadow-2xs"
    >
      {/* ── Table Header Strip (Clean Borderless Columns) ── */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-stone-300/75 dark:border-white/[0.20] text-emerald-900/80 dark:text-[#86D4B4]/90 select-none text-[10px] font-bold uppercase tracking-[0.12em] bg-[#FAF9F6] dark:bg-[#16181C]">
        <div className="col-span-2">Date &amp; Time</div>
        <div className="col-span-4">Item &amp; Category</div>
        <div className="col-span-3">Account</div>
        <div className="col-span-3 text-right pr-4">Amount</div>
      </div>

      {/* ── Continuous Row Feed (Zero Vertical Dividers) ── */}
      <div className="flex flex-col divide-y divide-stone-100 dark:divide-white/[0.05]">
        {recentHistory.map((item) => {
          const isExpanded = expandedId === item._id;
          const isPopulated = item.category && typeof item.category === "object";
          const rawCategory = isPopulated
            ? item.category.label
            : item.category || "General";
          const rawSubCategory = item.subCategory || "General Expense";

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

          const categoryIcon = isPopulated ? item.category.icon : "CreditCard";

          const sourceWallet = wallets?.find(
            (w) => w._id === (item.sourceWallet?._id || item.sourceWallet)
          );
          const sourceName = sourceWallet?.walletName || "Direct Spend";

          const targetWallet = wallets?.find(
            (w) => w._id === (item.targetWallet?._id || item.targetWallet)
          );
          const targetName = targetWallet?.walletName;

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
                  ? "bg-stone-50/90 dark:bg-[#202329]"
                  : isSystem
                  ? "bg-stone-50/30 dark:bg-white/[0.01] hover:bg-stone-50/80 dark:hover:bg-white/[0.025]"
                  : "hover:bg-stone-50/80 dark:hover:bg-white/[0.025]"
              }`}
            >
              {/* Left Accent Stripe */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-150 ${
                  isExpanded
                    ? isSystem
                      ? "bg-stone-500 dark:bg-stone-400"
                      : isDebit
                      ? "bg-rose-700 dark:bg-[#E88D96]"
                      : "bg-emerald-700 dark:bg-[#4EA885]"
                    : "bg-transparent"
                }`}
              />

              {/* Main Interactive Row */}
              <div
                onClick={() => toggleRow(item._id)}
                className="grid grid-cols-12 gap-4 items-center px-6 py-3.5 cursor-pointer min-h-[60px]"
              >
                {/* 1. Date & Time Column */}
                <div
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="col-span-2 flex flex-col min-w-0"
                >
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                      {dayStr} {monthStr}
                    </span>
                    <span className="text-[10.5px] text-stone-400 dark:text-stone-500 font-medium">
                      {yearStr}
                    </span>
                  </div>
                  <span className="text-[10.5px] font-medium text-stone-500 dark:text-stone-400 mt-0.5">
                    {timeStr}
                  </span>
                </div>

                {/* 2. Expense / Item Column (Clean Hierarchy, No Boxed Badges) */}
                <div className="col-span-4 flex items-center gap-3.5 min-w-0">
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

                    {item.description && (
                      <span className="text-[11.5px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                        &ldquo;{item.description}&rdquo;
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Account Column (Soft Borderless Surface Chips) */}
                <div className="col-span-3 flex items-center min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide capitalize bg-stone-100 dark:bg-white/[0.06] text-stone-700 dark:text-stone-200">
                      <Wallet
                        size={10}
                        className="shrink-0 text-emerald-700 dark:text-[#68C19D]"
                      />
                      <span className="truncate max-w-32">{sourceName}</span>
                    </span>

                    {targetWallet && (
                      <>
                        <ArrowRight
                          size={11}
                          className="text-stone-400 shrink-0"
                        />
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide capitalize bg-emerald-700/10 dark:bg-[#4EA885]/15 text-emerald-800 dark:text-[#86D4B4]">
                          <Wallet size={10} className="shrink-0 opacity-90" />
                          <span className="truncate max-w-32">{targetName}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* 4. Amount Column */}
                <div className="col-span-3 flex items-center justify-end gap-2.5 pl-1 whitespace-nowrap">
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
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
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

                  <div className="text-stone-400 group-hover:text-stone-800 dark:group-hover:text-stone-200 transition-colors p-1 shrink-0">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>
              </div>

              {/* ── Expanded Detail Drawer ── */}
              {isExpanded && (
                <div className="px-6 pb-4 pt-1 bg-[#FAF9F6] dark:bg-[#16181C] border-t border-stone-200/70 dark:border-white/[0.06] animate-in fade-in duration-100">
                  <div className="grid grid-cols-3 gap-5 p-4 bg-white dark:bg-[#1A1C20] border border-stone-200/80 dark:border-white/[0.07] rounded-xl mt-1.5">
                    {/* Section 1: Details */}
                    <div className="flex flex-col gap-1.5 border-r border-stone-100 dark:border-white/[0.06] pr-4">
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
                    <div className="flex flex-col gap-1.5 border-r border-stone-100 dark:border-white/[0.06] px-4">
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
                          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                          className="flex items-center gap-2 text-xs font-bold bg-[#FAF9F6] dark:bg-[#16181C] p-2.5 rounded-lg"
                        >
                          {beforeSource !== null && (
                            <>
                              <span className="text-stone-500 dark:text-stone-400 tabular-nums">
                                ₹{formatINR(beforeSource)}
                              </span>
                              <ArrowRight size={11} className="text-stone-400" />
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

                    {/* Section 3: Summary & Date */}
                    <div className="flex flex-col justify-between pl-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                          <Clock
                            size={11}
                            className="text-emerald-700 dark:text-[#68C19D]"
                          />{" "}
                          Date &amp; Time
                        </span>
                        <span
                          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                          className="text-xs font-semibold text-stone-900 dark:text-white mt-0.5"
                        >
                          {dayStr} {monthStr} {yearStr} at {timeStr}
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

                      <div
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                        className="pt-2 border-t border-stone-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-stone-400"
                      >
                        <span>ID: #{item._id?.slice(-8).toUpperCase()}</span>
                        <span
                          style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-700/10 dark:bg-[#4EA885]/18 text-emerald-800 dark:text-[#86D4B4] font-bold text-[10px]"
                        >
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
  );
};

export default DesktopLedgerTable;