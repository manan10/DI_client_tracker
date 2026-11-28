import React from "react";
import {
  CreditCard,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Clock,
  Wallet,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  CheckCircle2,
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
  return <IconComponent size={15} className={className} />;
};

const MobileLedgerFeed = ({
  groupedMobileTransactions = [],
  wallets = [],
  expandedId,
  toggleRow,
}) => {
  return (
    <div
      style={{ fontFamily: "'Nunito Sans', sans-serif" }}
      className="lg:hidden flex flex-col space-y-5 w-full min-w-0 max-w-full"
    >
      {groupedMobileTransactions.map((group, groupIdx) => {
        const sampleDate = group.items?.[0]?.date
          ? new Date(group.items[0].date)
          : new Date();
        const dayStr = sampleDate.getDate().toString().padStart(2, "0");
        const monthStr = sampleDate
          .toLocaleDateString("en-IN", { month: "short" })
          .toUpperCase();
        const yearStr = sampleDate.getFullYear();
        const weekdayStr = sampleDate
          .toLocaleDateString("en-IN", { weekday: "short" })
          .toUpperCase();

        return (
          <div key={groupIdx} className="flex flex-col w-full min-w-0">
            {/* ── Date Partition Header ── */}
            <div className="flex items-center justify-between gap-2.5 px-0.5 mb-2 w-full min-w-0">
              <div className="flex items-center gap-2">
                <div
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="inline-flex items-stretch rounded-md bg-stone-900 text-white dark:bg-[#22252C] dark:text-stone-100 shadow-2xs overflow-hidden shrink-0"
                >
                  <span className="px-2 py-0.5 text-xs font-bold leading-none flex items-center">
                    {dayStr}
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-700 text-white dark:bg-[#4EA885] dark:text-[#121315] flex items-center">
                    {monthStr}
                  </span>
                </div>

                <div
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-600 dark:text-stone-300"
                >
                  <span className="text-emerald-700 dark:text-[#68C19D] font-bold">
                    {weekdayStr}
                  </span>
                  <span className="text-stone-300 dark:text-stone-700">•</span>
                  <span>{yearStr}</span>
                  {(group.header === "Today" ||
                    group.header === "Yesterday") && (
                    <span
                      style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                      className="ml-1 px-1.5 py-0.2 text-[9px] uppercase font-bold tracking-wider rounded bg-emerald-700/10 dark:bg-[#4EA885]/18 text-emerald-800 dark:text-[#86D4B4]"
                    >
                      {group.header}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 h-px bg-stone-200/90 dark:bg-white/[0.07] ml-1" />
            </div>

            {/* ── Edge-to-Edge Mobile Sheet (-mx-4 sm:mx-0) ── */}
            <div className="-mx-4 sm:mx-0 sm:w-full rounded-none sm:rounded-2xl bg-white dark:bg-[#1A1C20] border-y border-x-0 sm:border border-stone-200/80 dark:border-white/[0.07] sm:shadow-2xs overflow-hidden divide-y divide-stone-100 dark:divide-white/[0.05]">
              {group.items.map((item) => {
                const isExpanded = expandedId === item._id;
                const isPopulated =
                  item.category && typeof item.category === "object";
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

                const categoryIcon = isPopulated
                  ? item.category.icon
                  : "CreditCard";

                const sourceWallet = wallets?.find(
                  (w) => w._id === (item.sourceWallet?._id || item.sourceWallet)
                );
                const sourceName = sourceWallet?.walletName || "Direct Spend";

                const targetWallet = wallets?.find(
                  (w) => w._id === (item.targetWallet?._id || item.targetWallet)
                );
                const targetName = targetWallet?.walletName;

                const isDebit =
                  item.type === "DEBIT" || (!item.type && !item.isTopUp);
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
                    ? sourceWallet.balance +
                      (isDebit ? item.amount : -item.amount)
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
                        ? "bg-stone-50/90 dark:bg-[#202329]"
                        : isSystem
                        ? "bg-stone-50/30 dark:bg-white/[0.01] active:bg-stone-100/80 dark:active:bg-white/[0.03]"
                        : "active:bg-stone-100/80 dark:active:bg-white/[0.03]"
                    }`}
                  >
                    {/* Left Stripe Indicator */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 sm:w-[3px] transition-all duration-150 ${
                        isExpanded
                          ? isSystem
                            ? "bg-stone-500 dark:bg-stone-400"
                            : isDebit
                            ? "bg-rose-700 dark:bg-[#F09BA3]"
                            : "bg-emerald-700 dark:bg-[#68C19D]"
                          : isSystem
                          ? "bg-stone-400/35"
                          : isDebit
                          ? "bg-rose-700/45 dark:bg-[#E88D96]/40"
                          : "bg-emerald-700/45 dark:bg-[#4EA885]/40"
                      }`}
                    />

                    {/* ── Click-Friendly 2-Tier Row Item ── */}
                    <div
                      onClick={() => toggleRow(item._id)}
                      className="px-4 py-3.5 pl-4.5 flex flex-col gap-2 cursor-pointer touch-manipulation w-full min-w-0"
                    >
                      {/* Top Tier: Icon + SubCategory Title + Net Amount */}
                      <div className="flex items-start justify-between gap-3 w-full min-w-0">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div
                            className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
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

                          <div className="min-w-0 flex-1">
                            <span
                              style={{ fontFamily: "'Lora', serif" }}
                              className={`text-sm font-bold tracking-tight leading-snug break-words block ${
                                isSystem
                                  ? "text-stone-700 dark:text-stone-200"
                                  : "text-stone-950 dark:text-stone-50"
                              }`}
                            >
                              {displayTitle}
                            </span>
                            {item.description && (
                              <span className="text-[11.5px] text-stone-500 dark:text-stone-400 break-words leading-snug block mt-0.5">
                                &ldquo;{item.description}&rdquo;
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Amount + Expand Toggle */}
                        <div className="flex items-center gap-1.5 shrink-0 pl-1">
                          <div
                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                            className="flex items-center gap-0.5 font-bold text-sm tabular-nums tracking-tight"
                          >
                            {isSystem ? (
                              <ArrowLeftRight
                                size={12}
                                className="text-stone-400"
                              />
                            ) : isDebit ? (
                              <ArrowUpRight
                                size={13}
                                className="text-rose-700 dark:text-[#F09BA3] stroke-[2.5]"
                              />
                            ) : (
                              <ArrowDownLeft
                                size={13}
                                className="text-emerald-700 dark:text-[#68C19D] stroke-[2.5]"
                              />
                            )}
                            <span
                              className={
                                isSystem
                                  ? "text-stone-600 dark:text-stone-300"
                                  : isDebit
                                  ? "text-rose-700 dark:text-[#F09BA3]"
                                  : "text-emerald-700 dark:text-[#68C19D]"
                              }
                            >
                              {isDebit ? "-" : "+"}₹{formatINR(item.amount)}
                            </span>
                          </div>

                          <div className="text-stone-400 p-0.5">
                            {isExpanded ? (
                              <ChevronUp size={15} />
                            ) : (
                              <ChevronDown size={15} />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Tier: Category + Soft Borderless Account Chips + Time */}
                      <div className="flex items-center justify-between gap-2 pl-11.5 w-full min-w-0">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="text-[10.5px] font-medium text-stone-500 dark:text-stone-400">
                            {categoryLabel}
                          </span>

                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide capitalize bg-stone-100 dark:bg-white/[0.06] text-stone-700 dark:text-stone-200">
                            <Wallet
                              size={9}
                              className="shrink-0 text-emerald-700 dark:text-[#68C19D]"
                            />
                            <span>{sourceName}</span>
                          </span>

                          {targetWallet && (
                            <>
                              <ArrowRight
                                size={9}
                                className="text-stone-400 shrink-0"
                              />
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide capitalize bg-emerald-700/10 dark:bg-[#4EA885]/18 text-emerald-800 dark:text-[#86D4B4]">
                                <Wallet size={9} className="shrink-0 opacity-90" />
                                <span>{targetName}</span>
                              </span>
                            </>
                          )}
                        </div>

                        <span
                          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                          className="text-[10.5px] font-medium text-stone-500 dark:text-stone-400 shrink-0"
                        >
                          {timeStr}
                        </span>
                      </div>
                    </div>

                    {/* ── Expanded Detail Drawer ── */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 text-[11px] flex flex-col gap-2 w-full min-w-0 animate-in fade-in duration-100">
                        <div className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-[#16181C] border border-stone-200/80 dark:border-white/[0.07] flex flex-col gap-2.5 w-full min-w-0">
                          {item.description && (
                            <div className="text-stone-800 dark:text-stone-200 text-xs bg-white dark:bg-[#1A1C20] p-2.5 rounded-lg break-words">
                              &ldquo;{item.description}&rdquo;
                            </div>
                          )}

                          {/* Wallet Balance Movement */}
                          <div className="flex flex-col gap-1.5 pt-1 border-t border-stone-200/70 dark:border-white/[0.06] w-full min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
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

                            <div className="flex items-center justify-between gap-2 text-xs font-bold bg-white dark:bg-[#1A1C20] p-2.5 rounded-lg w-full min-w-0">
                              <span
                                style={{ fontFamily: "'Lora', serif" }}
                                className="text-stone-900 dark:text-white break-words"
                              >
                                {sourceName}
                              </span>
                              <div
                                style={{
                                  fontFamily: "'IBM Plex Mono', monospace",
                                }}
                                className="flex items-center gap-1.5 shrink-0"
                              >
                                {beforeSource !== null && (
                                  <>
                                    <span className="text-stone-500 dark:text-stone-400 tabular-nums">
                                      ₹{formatINR(beforeSource)}
                                    </span>
                                    <ArrowRight
                                      size={10}
                                      className="text-stone-400"
                                    />
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
                            </div>
                          </div>

                          {/* Summary Metadata */}
                          <div className="flex items-center justify-between pt-1.5 border-t border-stone-200/70 dark:border-white/[0.06] text-[10.5px] text-stone-500 dark:text-stone-400 w-full min-w-0">
                            <div
                              style={{
                                fontFamily: "'IBM Plex Mono', monospace",
                              }}
                              className="flex items-center gap-1.5"
                            >
                              <Clock
                                size={11}
                                className="text-emerald-700 dark:text-[#68C19D] shrink-0"
                              />
                              <span>{timeStr}</span>
                            </div>
                            <span className="font-semibold text-stone-800 dark:text-stone-200">
                              {isTransfer || isSystem
                                ? "Internal / System"
                                : isDebit
                                ? "Expense"
                                : "Top-up"}
                            </span>
                          </div>

                          {/* Ref ID & Status */}
                          <div className="flex items-center justify-between text-[10.5px] text-stone-500 dark:text-stone-400 pt-0.5 w-full min-w-0">
                            <span
                              style={{
                                fontFamily: "'IBM Plex Mono', monospace",
                              }}
                            >
                              ID: #{item._id?.slice(-8).toUpperCase()}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-700/10 dark:bg-[#4EA885]/18 text-emerald-800 dark:text-[#86D4B4] font-bold text-[9.5px]">
                              <CheckCircle2 size={10} />
                              Verified
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