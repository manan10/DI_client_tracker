import React from "react";
import { Link } from "react-router-dom";
import {
  History,
  Banknote,
  MoveUpRight,
  Zap,
  Coins,
  MessageSquare,
  ArrowRight,
  Calendar,
  CreditCard,
} from "lucide-react";
import * as LucideIcons from "lucide-react";

const IconRenderer = ({ iconName, className = "" }) => {
  const IconComponent = LucideIcons[iconName] || Banknote;
  return <IconComponent size={16} className={className} />;
};

const GlobalFeed = ({ history, wallets }) => {
  const getWalletDetails = (source) => {
    if (source && typeof source === "object") {
      return {
        name: source.walletName || "Unknown",
        isVirtual: !!source.isVirtual,
      };
    }
    const localMatch = wallets?.find((w) => w._id === source);
    return {
      name: localMatch ? localMatch.walletName : "System",
      isVirtual: localMatch ? !!localMatch.isVirtual : false,
    };
  };

  const recentHistory = history?.slice(0, 10) || [];

  return (
    <div
      style={{ fontFamily: "'Nunito Sans', sans-serif" }}
      className="w-full flex flex-col gap-3.5 min-w-0"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-200/90 dark:border-white/[0.07]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1 h-3.5 rounded-full bg-emerald-700 dark:bg-[#4EA885] shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-stone-800 dark:text-stone-100 truncate">
            Transaction History
          </h2>
        </div>

        <Link
          to="/expenses/history"
          className="group inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-[#68C19D] hover:text-emerald-800 dark:hover:text-[#86D4B4] transition-colors shrink-0 py-0.5"
        >
          <span className="underline decoration-emerald-700/40 dark:decoration-[#4EA885]/50 underline-offset-4">
            View All
          </span>
          <MoveUpRight
            size={12}
            strokeWidth={2.5}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>

      {/* FEED LIST */}
      <div className="-mx-4 sm:mx-0 sm:w-full rounded-none sm:rounded-2xl bg-white dark:bg-[#1A1C20] border-y border-x-0 sm:border border-stone-200/80 dark:border-white/[0.07] sm:shadow-2xs overflow-hidden divide-y divide-stone-100 dark:divide-white/[0.05]">
        {recentHistory.map((item) => {
          const isPopulated =
            item.category && typeof item.category === "object";
          const categoryLabel = isPopulated
            ? item.category.label
            : item.category || "System";
          const categoryIcon = isPopulated ? item.category.icon : "Banknote";
          const subCategory = item.subCategory;

          const sourceInfo = getWalletDetails(item.sourceWallet);
          const isVirt = sourceInfo.isVirtual;
          const comments = item.description || "";
          const isDebit = item.type === "DEBIT";

          const hasBalances =
            item.balanceBefore !== undefined && item.balanceAfter !== undefined;

          return (
            <div
              key={item._id}
              className="group relative flex items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 hover:bg-stone-50/80 dark:hover:bg-white/[0.025] transition-colors min-w-0"
            >
              {/* LEFT: Identity & Meta */}
              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                <div
                  className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 ${
                    isDebit
                      ? "bg-rose-700/[0.08] text-rose-700 dark:bg-[#E88D96]/15 dark:text-[#F09BA3]"
                      : "bg-emerald-700/[0.09] text-emerald-700 dark:bg-[#4EA885]/15 dark:text-[#68C19D]"
                  }`}
                >
                  <IconRenderer iconName={categoryIcon} />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2 min-w-0">
                    <h4
                      style={{ fontFamily: "'Lora', serif" }}
                      className="text-sm font-bold text-stone-950 dark:text-stone-50 truncate tracking-tight"
                    >
                      {subCategory || categoryLabel}
                    </h4>
                    {subCategory && (
                      <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 truncate">
                        {categoryLabel}
                      </span>
                    )}
                  </div>

                  {comments && (
                    <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 mt-0.5">
                      <MessageSquare size={10} className="shrink-0 opacity-60" />
                      <span className="text-[11.5px] truncate">
                        &ldquo;{comments}&rdquo;
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 mt-1.5">
                    <div
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      className="flex items-center gap-1 text-[10px] font-semibold text-stone-500 dark:text-stone-400 shrink-0"
                    >
                      <Calendar size={10} />
                      {new Date(item.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>
                    <span className="text-stone-300 dark:text-stone-700">•</span>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/[0.06] text-[10px] font-semibold text-stone-700 dark:text-stone-200 min-w-0">
                      {isVirt ? (
                        <Zap
                          size={9}
                          className="shrink-0 text-emerald-700 dark:text-[#68C19D]"
                        />
                      ) : (
                        <Coins
                          size={9}
                          className="shrink-0 text-emerald-700 dark:text-[#68C19D]"
                        />
                      )}
                      <span className="truncate">{sourceInfo.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Amounts */}
              <div className="flex flex-col items-end shrink-0 pl-3">
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className={`text-sm font-bold tabular-nums tracking-tight ${
                    isDebit
                      ? "text-rose-700 dark:text-[#F09BA3]"
                      : "text-emerald-700 dark:text-[#68C19D]"
                  }`}
                >
                  {isDebit ? "-" : "+"}₹
                  {item.amount.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </span>

                {hasBalances ? (
                  <div
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    className="flex items-center gap-1 mt-1 text-[10px]"
                  >
                    <span className="text-stone-400 line-through">
                      {item.balanceBefore.toLocaleString("en-IN")}
                    </span>
                    <ArrowRight size={9} className="text-stone-400" />
                    <span className="font-bold text-stone-700 dark:text-stone-200 bg-[#FAF9F6] dark:bg-[#16181C] px-1.5 py-0.5 rounded">
                      {item.balanceAfter.toLocaleString("en-IN")}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-1 text-[9.5px] text-stone-400 font-semibold">
                    <CreditCard size={9} /> Digital
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {recentHistory.length === 0 && (
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-white/[0.06] flex items-center justify-center mb-2 text-stone-500 dark:text-stone-400">
              <History size={16} />
            </div>
            <p
              style={{ fontFamily: "'Lora', serif" }}
              className="text-sm font-bold text-stone-900 dark:text-stone-50"
            >
              No Activity Recorded
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Active ledger is empty
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalFeed;
