import React, { useMemo, useState } from "react";
import {
  Building2,
  QrCode,
  ShieldCheck,
  KeyRound,
  Filter,
  X,
} from "lucide-react";

const formatINR = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    amount || 0
  );
};

// Normalizes wallet casing cleanly while preserving acronyms like UPI / HDFC / SBI / ICICI
const formatWalletTitle = (name = "") => {
  if (!name) return "";
  const acronyms = new Set([
    "UPI",
    "HDFC",
    "SBI",
    "ICICI",
    "IDFC",
    "KOTAK",
    "AXIS",
    "ATM",
  ]);
  return String(name)
    .trim()
    .split(/\s+/)
    .map((word) => {
      const upper = word.toUpperCase();
      if (acronyms.has(upper)) return upper;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

const WalletGridSection = ({
  cashWallets = [],
  virtualWallets = [],
  totalCash = 0,
  selectedWalletId = null,
  onCardClick,
  onFilterWallet,
}) => {
  const [activeTab, setActiveTab] = useState("ALL");

  // 1. Separate Primary Drawer from Regular Cash Wallets
  const { drawerWallet, regularCashWallets } = useMemo(() => {
    let drawer = null;
    const others = [];

    cashWallets.forEach((w) => {
      const name = (w.walletName || "").toLowerCase();
      const isDrawer =
        w.isGeneralPool ||
        name.includes("drawer") ||
        name.includes("tijori") ||
        name.includes("cash box") ||
        name.includes("safe");

      if (isDrawer && !drawer) {
        drawer = w;
      } else {
        others.push(w);
      }
    });

    if (!drawer && others.length > 0) {
      drawer = others.shift();
    }

    return { drawerWallet: drawer, regularCashWallets: others };
  }, [cashWallets]);

  // 2. Classify & Sort Virtual Wallets (UPI vs Bank)
  const { upiWallets, bankWallets } = useMemo(() => {
    const upiKeywords = [
      "upi",
      "gpay",
      "google pay",
      "phonepe",
      "paytm",
      "cred",
      "bhim",
      "amazon pay",
    ];
    const upi = [];
    const banks = [];

    virtualWallets.forEach((w) => {
      const name = (w.walletName || "").toLowerCase();
      const isUpi =
        w.type === "UPI" ||
        w.category === "UPI" ||
        upiKeywords.some((k) => name.includes(k));

      if (isUpi) {
        upi.push({ ...w, channelKind: "UPI" });
      } else {
        banks.push({ ...w, channelKind: "BANK" });
      }
    });

    upi.sort((a, b) => (a.walletName || "").localeCompare(b.walletName || ""));
    banks.sort((a, b) => (a.walletName || "").localeCompare(b.walletName || ""));

    return { upiWallets: upi, bankWallets: banks };
  }, [virtualWallets]);

  const cashCount = (drawerWallet ? 1 : 0) + regularCashWallets.length;
  const digitalCount = upiWallets.length + bankWallets.length;
  const totalCount = cashCount + digitalCount;

  const showCash = activeTab === "ALL" || activeTab === "CASH";
  const showDigital = activeTab === "ALL" || activeTab === "DIGITAL";
  const digitalCombined = [...upiWallets, ...bankWallets];

  const computedTotalCash =
    totalCash ||
    cashWallets.reduce((sum, item) => sum + (Number(item.balance) || 0), 0);

  const drawerSharePct =
    drawerWallet && computedTotalCash > 0
      ? Math.round(((drawerWallet.balance || 0) / computedTotalCash) * 100)
      : 0;

  const isDrawerFiltered =
    drawerWallet && selectedWalletId === drawerWallet._id;

  return (
    <aside
      style={{ fontFamily: "'Nunito Sans', sans-serif" }}
      className="lg:col-span-5 lg:sticky lg:top-24 w-full flex flex-col gap-3.5 relative z-10 select-none min-w-0"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. CLEAN SECTION HEADER & SAGE SEGMENTED TABS
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-200/90 dark:border-white/[0.07]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1 h-3.5 rounded-full bg-emerald-700 dark:bg-[#4EA885] shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-stone-800 dark:text-stone-100 truncate">
            Wallets &amp; Channels
          </h2>
        </div>

        {/* Soft Borderless Segmented Pill with Botanical Sage Active Tab */}
        <div className="inline-flex items-center p-0.5 rounded-lg bg-stone-200/70 dark:bg-white/[0.06] shrink-0">
          {[
            { id: "ALL", label: `All (${totalCount})` },
            { id: "CASH", label: `Cash (${cashCount})` },
            { id: "DIGITAL", label: `Digital (${digitalCount})` },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer touch-manipulation ${
                  isSelected
                    ? "bg-emerald-700 dark:bg-[#4EA885] text-white dark:text-[#121315] shadow-2xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DE-BOXED EDITORIAL TREASURY SHEET (EDGE-TO-EDGE ON MOBILE)
         ───────────────────────────────────────────────────────────── */}
      <div className="-mx-4 sm:mx-0 sm:w-full rounded-none sm:rounded-2xl bg-white dark:bg-[#1A1C20] border-y border-x-0 sm:border border-stone-200/80 dark:border-white/[0.07] sm:shadow-2xs overflow-hidden flex flex-col divide-y divide-stone-100 dark:divide-white/[0.05]">
        {/* A. PRIMARY RESERVE ROW (INTEGRATED BOTTOM PROGRESS TRACK, ZERO CLUTTER) */}
        {showCash && drawerWallet && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => onCardClick(drawerWallet)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCardClick(drawerWallet);
              }
            }}
            className={`group relative w-full text-left px-4 py-4.5 sm:px-5 sm:py-4.5 min-h-[76px] transition-colors duration-150 cursor-pointer touch-manipulation flex items-center justify-between gap-3 ${
              isDrawerFiltered
                ? "bg-emerald-50/75 dark:bg-[#4EA885]/[0.14]"
                : "bg-[#FAF9F6] dark:bg-[#1F2227] hover:bg-stone-100/70 dark:hover:bg-[#24282E]"
            }`}
          >
            {/* Active Left Spine */}
            {isDrawerFiltered && (
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-700 dark:bg-[#68C19D]" />
            )}

            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div
                className={`w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isDrawerFiltered
                    ? "bg-emerald-700 dark:bg-[#4EA885] text-white dark:text-[#121315]"
                    : "bg-emerald-700/10 dark:bg-[#4EA885]/15 text-emerald-700 dark:text-[#68C19D]"
                }`}
              >
                <ShieldCheck size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    style={{ fontFamily: "'Lora', serif" }}
                    className={`text-[15px] sm:text-base font-bold tracking-tight transition-colors truncate ${
                      isDrawerFiltered
                        ? "text-emerald-800 dark:text-[#86D4B4]"
                        : "text-stone-950 dark:text-stone-50 group-hover:text-emerald-800 dark:group-hover:text-[#86D4B4]"
                    }`}
                  >
                    {formatWalletTitle(drawerWallet.walletName)}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-700/10 dark:bg-[#4EA885]/15 text-emerald-800 dark:text-[#86D4B4] shrink-0">
                    <KeyRound size={9} />
                    Primary
                  </span>
                </div>

                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium mt-0.5 truncate">
                  Central cash reserve
                </p>
              </div>
            </div>

            {/* Balance + Ghost Filter Icon */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="text-right">
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="text-base sm:text-xl font-bold text-stone-950 dark:text-stone-50 tabular-nums tracking-tight block leading-none"
                >
                  ₹{formatINR(drawerWallet.balance)}
                </span>
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 block mt-1 tabular-nums"
                >
                  {drawerSharePct}% share
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFilterWallet(drawerWallet);
                }}
                title={
                  isDrawerFiltered
                    ? "Clear filter"
                    : `Filter ledger to ${formatWalletTitle(drawerWallet.walletName)}`
                }
                aria-label={
                  isDrawerFiltered
                    ? "Clear filter"
                    : `Filter ledger to ${formatWalletTitle(drawerWallet.walletName)}`
                }
                className={`w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer touch-manipulation shrink-0 ${
                  isDrawerFiltered
                    ? "bg-emerald-700 dark:bg-[#4EA885] text-white dark:text-[#121315]"
                    : "text-stone-400 dark:text-stone-500 hover:bg-emerald-700/10 hover:text-emerald-700 dark:hover:bg-[#4EA885]/15 dark:hover:text-[#68C19D]"
                }`}
              >
                {isDrawerFiltered ? (
                  <X size={14} strokeWidth={2.5} />
                ) : (
                  <Filter size={13} />
                )}
              </button>
            </div>

            {/* Architectural Bottom Share Track */}
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-stone-200/60 dark:bg-white/[0.04]">
              <div
                style={{ width: `${Math.max(drawerSharePct, 3)}%` }}
                className="h-full bg-emerald-700 dark:bg-[#4EA885] transition-all duration-300"
              />
            </div>
          </div>
        )}

        {/* B. POCKET CASH WALLETS (BOTANICAL SAGE-TINTED SECTION STRIP) */}
        {showCash && regularCashWallets.length > 0 && (
          <div className="flex flex-col divide-y divide-stone-100 dark:divide-white/[0.05]">
            <div className="px-4 sm:px-5 py-2.5 border-b border-slate-300/75 dark:border-[#4EA885]/20 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-900/80 dark:text-[#86D4B4]/90">
              <span>Pocket Wallets ({regularCashWallets.length})</span>
              <span>Balance</span>
            </div>

            {regularCashWallets.map((w) => {
              const displayName = formatWalletTitle(w.walletName);
              const initial = displayName.charAt(0).toUpperCase() || "W";

              const sharePct =
                computedTotalCash > 0
                  ? Math.round(((w.balance || 0) / computedTotalCash) * 100)
                  : 0;

              const isFiltered = selectedWalletId === w._id;

              return (
                <div
                  key={w._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onCardClick(w)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onCardClick(w);
                    }
                  }}
                  className={`group relative w-full text-left px-4 py-4 sm:px-5 sm:py-3.5 min-h-[64px] transition-colors cursor-pointer touch-manipulation flex items-center justify-between gap-3 ${
                    isFiltered
                      ? "bg-emerald-50/70 dark:bg-[#4EA885]/[0.12]"
                      : "hover:bg-stone-50/90 dark:hover:bg-white/[0.02]"
                  }`}
                >
                  {isFiltered && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-700 dark:bg-[#68C19D]" />
                  )}

                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      style={{ fontFamily: "'Lora', serif" }}
                      className={`w-9 h-9 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-colors shrink-0 ${
                        isFiltered
                          ? "bg-emerald-700 dark:bg-[#4EA885] text-white dark:text-[#121315]"
                          : "bg-stone-100 dark:bg-white/[0.06] text-stone-700 dark:text-stone-200 group-hover:bg-emerald-700/10 group-hover:text-emerald-800 dark:group-hover:bg-[#4EA885]/15 dark:group-hover:text-[#68C19D]"
                      }`}
                    >
                      {initial}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span
                        style={{ fontFamily: "'Lora', serif" }}
                        className={`text-sm font-bold tracking-tight transition-colors block truncate ${
                          isFiltered
                            ? "text-emerald-800 dark:text-[#86D4B4]"
                            : "text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-[#86D4B4]"
                        }`}
                      >
                        {displayName}
                      </span>

                      <div className="mt-1.5 h-1 w-full max-w-[150px] rounded-full bg-stone-100 dark:bg-white/[0.06] overflow-hidden">
                        <div
                          style={{ width: `${Math.max(sharePct, 4)}%` }}
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFiltered
                              ? "bg-emerald-700 dark:bg-[#68C19D]"
                              : "bg-emerald-700/55 dark:bg-[#4EA885]/65 group-hover:bg-emerald-700 dark:group-hover:bg-[#68C19D]"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Balance + Ghost Filter Icon */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right">
                      <span
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                        className="text-[15px] sm:text-base font-bold tabular-nums tracking-tight text-stone-950 dark:text-stone-50 block leading-none"
                      >
                        ₹{formatINR(w.balance)}
                      </span>
                      <span
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                        className="text-[10px] font-medium text-stone-500 dark:text-stone-400 block mt-1 tabular-nums"
                      >
                        {sharePct}% share
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFilterWallet(w);
                      }}
                      title={
                        isFiltered
                          ? "Clear filter"
                          : `Filter ledger to ${displayName}`
                      }
                      aria-label={
                        isFiltered
                          ? "Clear filter"
                          : `Filter ledger to ${displayName}`
                      }
                      className={`w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer touch-manipulation shrink-0 ${
                        isFiltered
                          ? "bg-emerald-700 dark:bg-[#4EA885] text-white dark:text-[#121315]"
                          : "text-stone-400 dark:text-stone-500 hover:bg-emerald-700/10 hover:text-emerald-700 dark:hover:bg-[#4EA885]/15 dark:hover:text-[#68C19D]"
                      }`}
                    >
                      {isFiltered ? (
                        <X size={14} strokeWidth={2.5} />
                      ) : (
                        <Filter size={13} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* C. DE-BOXED DIGITAL CHANNELS (BOTANICAL SAGE-TINTED SECTION STRIP) */}
        {showDigital && (
          <div className="flex flex-col bg-[#FAF9F6] dark:bg-[#16181C]">
            <div className="px-4 sm:px-5 py-2.5 border-b border-slate-300/75 dark:border-[#4EA885]/20 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-900/80 dark:text-[#86D4B4]/90">
              <span>Digital Channels ({digitalCombined.length})</span>
              <span>Tap to Log</span>
            </div>

            {digitalCombined.length > 0 ? (
              <div className="flex flex-col divide-y divide-stone-200/60 dark:divide-white/[0.05] sm:divide-y-0 sm:p-3 sm:grid sm:grid-cols-2 sm:gap-2">
                {digitalCombined.map((w) => {
                  const isUpi = w.channelKind === "UPI";
                  const isFiltered = selectedWalletId === w._id;
                  const displayName = formatWalletTitle(w.walletName);

                  return (
                    <div
                      key={w._id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onCardClick(w)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onCardClick(w);
                        }
                      }}
                      className={`group relative w-full flex items-center justify-between gap-2 px-4 py-3.5 sm:px-3 sm:py-2.5 min-h-[56px] sm:min-h-0 sm:rounded-xl transition-all duration-150 cursor-pointer touch-manipulation text-left min-w-0 ${
                        isFiltered
                          ? "bg-emerald-50/90 dark:bg-[#4EA885]/[0.16] ring-1 ring-emerald-700/50 dark:ring-[#68C19D]/50"
                          : "bg-white dark:bg-[#1F2227] hover:bg-stone-100/80 dark:hover:bg-[#252930]"
                      }`}
                    >
                      {isFiltered && (
                        <div className="sm:hidden absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-700 dark:bg-[#68C19D]" />
                      )}

                      <div className="flex items-center gap-3 sm:gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isFiltered
                              ? "bg-emerald-700 dark:bg-[#4EA885] text-white dark:text-[#121315]"
                              : "bg-emerald-700/10 dark:bg-[#4EA885]/15 text-emerald-700 dark:text-[#68C19D]"
                          }`}
                        >
                          {isUpi ? (
                            <QrCode size={14} className="sm:w-3.5 sm:h-3.5" />
                          ) : (
                            <Building2 size={14} className="sm:w-3.5 sm:h-3.5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <span
                            style={{ fontFamily: "'Lora', serif" }}
                            className={`text-sm sm:text-xs font-bold tracking-tight transition-colors block truncate ${
                              isFiltered
                                ? "text-emerald-800 dark:text-[#86D4B4]"
                                : "text-stone-950 dark:text-stone-50 group-hover:text-emerald-800 dark:group-hover:text-[#86D4B4]"
                            }`}
                          >
                            {displayName}
                          </span>
                          <span className="text-[10px] sm:text-[9px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block leading-none mt-1 sm:mt-0.5">
                            {isUpi ? "UPI Handle" : "Bank Account"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFilterWallet(w);
                        }}
                        title={
                          isFiltered
                            ? "Clear filter"
                            : `Filter ledger to ${displayName}`
                        }
                        aria-label={
                          isFiltered
                            ? "Clear filter"
                            : `Filter ledger to ${displayName}`
                        }
                        className={`w-8 h-8 sm:w-6.5 sm:h-6.5 rounded-lg flex items-center justify-center transition-all cursor-pointer touch-manipulation shrink-0 ${
                          isFiltered
                            ? "bg-emerald-700 dark:bg-[#4EA885] text-white dark:text-[#121315]"
                            : "text-stone-400 dark:text-stone-500 hover:bg-emerald-700/10 hover:text-emerald-700 dark:hover:bg-[#4EA885]/15 dark:hover:text-[#68C19D]"
                        }`}
                      >
                        {isFiltered ? (
                          <X size={13} strokeWidth={2.5} />
                        ) : (
                          <Filter size={12} />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs font-medium text-stone-500 dark:text-stone-400">
                No UPI or Bank channels added yet
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {totalCount === 0 && (
          <div className="py-10 px-4 text-center text-xs font-medium text-stone-500 dark:text-stone-400">
            No wallets configured yet.
          </div>
        )}
      </div>
    </aside>
  );
};

export default WalletGridSection;