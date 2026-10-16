import React, { useMemo } from "react";
import {
  Wallet,
  Building2,
  QrCode,
  ArrowUpRight,
  ShieldCheck,
  Coins,
  KeyRound,
} from "lucide-react";

const formatINR = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    amount || 0,
  );
};

// Subtle double-bordered gradient palettes for cash wallets
const PALETTES = [
  {
    // Tuscan Amber
    border: "border-amber-200/90 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-400 ring-1 ring-amber-300/30 dark:ring-amber-400/10",
    bg: "bg-gradient-to-br from-amber-500/[0.04] via-amber-500/[0.015] to-transparent dark:from-amber-500/[0.06] dark:via-transparent dark:to-transparent",
    stitch: "border-amber-500/15 dark:border-amber-400/15",
    badge: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20",
    textPrimary: "text-slate-900 dark:text-white",
    textAccent: "text-amber-700 dark:text-amber-300",
    clip: "bg-amber-500",
  },
  {
    // Emerald Green
    border: "border-emerald-200/90 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-400 ring-1 ring-emerald-300/30 dark:ring-emerald-400/10",
    bg: "bg-gradient-to-br from-emerald-500/[0.04] via-emerald-500/[0.015] to-transparent dark:from-emerald-500/[0.06] dark:via-transparent dark:to-transparent",
    stitch: "border-emerald-500/15 dark:border-emerald-400/15",
    badge: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20",
    textPrimary: "text-slate-900 dark:text-white",
    textAccent: "text-emerald-700 dark:text-emerald-300",
    clip: "bg-emerald-500",
  },
  {
    // Sapphire Blue
    border: "border-sky-200/90 dark:border-sky-500/30 hover:border-sky-400 dark:hover:border-sky-400 ring-1 ring-sky-300/30 dark:ring-sky-400/10",
    bg: "bg-gradient-to-br from-sky-500/[0.04] via-sky-500/[0.015] to-transparent dark:from-sky-500/[0.06] dark:via-transparent dark:to-transparent",
    stitch: "border-sky-500/15 dark:border-sky-400/15",
    badge: "bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/20",
    textPrimary: "text-slate-900 dark:text-white",
    textAccent: "text-sky-700 dark:text-sky-300",
    clip: "bg-sky-500",
  },
  {
    // Rose Burgundy
    border: "border-rose-200/90 dark:border-rose-500/30 hover:border-rose-400 dark:hover:border-rose-400 ring-1 ring-rose-300/30 dark:ring-rose-400/10",
    bg: "bg-gradient-to-br from-rose-500/[0.04] via-rose-500/[0.015] to-transparent dark:from-rose-500/[0.06] dark:via-transparent dark:to-transparent",
    stitch: "border-rose-500/15 dark:border-rose-400/15",
    badge: "bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/20",
    textPrimary: "text-slate-900 dark:text-white",
    textAccent: "text-rose-700 dark:text-rose-300",
    clip: "bg-rose-500",
  },
];

const WalletGridSection = ({
  cashWallets = [],
  virtualWallets = [],
  totalCash = 0,
  onCardClick,
}) => {
  // 1. Separate Primary Drawer
  const { drawerWallet, regularCashWallets } = useMemo(() => {
    let drawer = null;
    const others = [];

    cashWallets.forEach((w) => {
      const name = (w.walletName || "").toLowerCase();
      const isDrawer =
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

  // 2. Classify Virtual Wallets into UPI Apps vs Bank Accounts
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
        upi.push(w);
      } else {
        banks.push(w);
      }
    });

    upi.sort((a, b) => (a.walletName || "").localeCompare(b.walletName || ""));
    banks.sort((a, b) => (a.walletName || "").localeCompare(b.walletName || ""));

    return { upiWallets: upi, bankWallets: banks };
  }, [virtualWallets]);

  return (
    <aside className="lg:col-span-5 w-full flex flex-col gap-6 relative z-10 select-none font-sans">
      {/* ─────────────────────────────────────────────────────────────
          1. TOTAL CASH (INLINE HEADER BANNER)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between pb-3.5 border-b border-slate-200/90 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Coins size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-base sm:text-lg font-serif tracking-tight text-emerald-800 dark:text-emerald-400">
              Total Cash <span className="italic font-normal">Balance</span>
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums leading-none">
            ₹{formatINR(totalCash)}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. THE MASTER DRAWER (SUBTLE GRADIENT & DOUBLE BORDER)
         ───────────────────────────────────────────────────────────── */}
      {drawerWallet && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-serif tracking-tight text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
              <KeyRound size={13} className="text-amber-600 dark:text-amber-400" />
              Master <span className="italic font-normal">Drawer</span>
            </span>
            <span className="text-[10px] font-sans font-medium text-slate-500 dark:text-slate-400">
              Primary Wallet
            </span>
          </div>

          <button
            type="button"
            onClick={() => onCardClick(drawerWallet)}
            className="group relative w-full text-left p-4 sm:p-5 rounded-xl bg-gradient-to-br from-amber-500/[0.05] via-amber-500/[0.015] to-transparent dark:from-amber-400/[0.07] dark:via-transparent dark:to-transparent border border-amber-300/80 hover:border-amber-400 dark:border-amber-500/30 dark:hover:border-amber-400 ring-1 ring-amber-300/30 dark:ring-amber-400/10 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 cursor-pointer overflow-hidden backdrop-blur-xs font-sans"
          >
            <div
              aria-hidden="true"
              className="absolute inset-1 rounded-lg border border-dashed border-amber-500/20 dark:border-amber-400/15 pointer-events-none"
            />

            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 dark:border-amber-400/20 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} className="text-amber-600 dark:text-amber-400" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-serif tracking-tight capitalize text-slate-900 dark:text-white break-words leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {drawerWallet.walletName}
                  </h3>
                  <p className="text-xs font-sans text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                    Central Cash Reserve
                  </p>
                </div>
              </div>

              <div className="text-right flex items-center gap-2.5 shrink-0">
                <div>
                  <span className="text-[10px] font-sans text-slate-500 dark:text-slate-400 block font-medium">
                    Balance
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-amber-700 dark:text-amber-400 tabular-nums">
                    ₹{formatINR(drawerWallet.balance)}
                  </span>
                </div>
                <div className="w-6.5 h-6.5 rounded-md bg-amber-500/10 group-hover:bg-amber-500/15 flex items-center justify-center text-amber-700 dark:text-amber-400 transition-colors">
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. MEMBER CASH WALLETS (ROUNDED-XL & SUBTLE TINT)
         ───────────────────────────────────────────────────────────── */}
      {regularCashWallets.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-serif tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Wallet size={13} className="text-emerald-600 dark:text-emerald-400" />
              Pocket <span className="italic font-normal">Wallets</span>
            </span>
            <span className="text-[10px] font-sans font-medium text-slate-500 dark:text-slate-400">
              {regularCashWallets.length} Wallets
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {regularCashWallets.map((w, idx) => {
              const theme = PALETTES[idx % PALETTES.length];

              return (
                <button
                  key={w._id}
                  type="button"
                  onClick={() => onCardClick(w)}
                  className={`group relative text-left p-3 sm:p-3.5 rounded-xl ${theme.bg} ${theme.border} border shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between backdrop-blur-xs min-h-[92px] font-sans`}
                >
                  <div
                    aria-hidden="true"
                    className={`absolute inset-1 rounded-lg border border-dashed ${theme.stitch} pointer-events-none`}
                  />

                  {/* Header: Title and Accent Clip */}
                  <div className="relative z-10 flex items-start justify-between gap-1 mb-2">
                    <span className={`text-xs sm:text-sm font-serif tracking-tight capitalize break-words leading-tight ${theme.textPrimary}`}>
                      {w.walletName}
                    </span>
                    <div className={`w-3 h-1.5 rounded-[1px] ${theme.clip} opacity-80 shrink-0 mt-1`} />
                  </div>

                  {/* Balance Display */}
                  <div className="relative z-10 flex items-baseline justify-between mt-auto pt-1 font-sans">
                    <div>
                      <span className="text-[9px] font-sans font-medium text-slate-500 dark:text-slate-400 block leading-none">
                        Balance
                      </span>
                      <span className={`text-base sm:text-lg font-bold font-mono tabular-nums tracking-tight mt-0.5 block ${theme.textAccent}`}>
                        ₹{formatINR(w.balance)}
                      </span>
                    </div>
                    <ArrowUpRight size={13} className="text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. DIGITAL CHANNELS (EXPANDED TO PREVENT TEXT TRUNCATION)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 pt-1 font-sans">
        {/* SUBSECTION A: UPI Wallets */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-serif tracking-tight text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <QrCode size={13} />
              UPI & Online <span className="italic font-normal">Apps</span>
            </span>
            <span className="text-[10px] font-sans font-medium text-slate-500 dark:text-slate-400">
              {upiWallets.length} Apps
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-2.5">
            {upiWallets.map((w) => (
              <button
                key={w._id}
                type="button"
                onClick={() => onCardClick(w)}
                className="group relative flex flex-col justify-between p-3 rounded-lg bg-gradient-to-br from-emerald-500/[0.04] via-emerald-500/[0.01] to-transparent dark:from-emerald-500/[0.07] dark:via-transparent dark:to-transparent border border-emerald-200/90 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-400 ring-1 ring-emerald-300/30 dark:ring-emerald-400/10 transition-all duration-150 active:scale-95 cursor-pointer text-left min-h-[78px] font-sans"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[8.5px] font-sans font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
                    UPI
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                </div>

                <div className="min-w-0 w-full mt-auto">
                  <span className="text-xs font-serif tracking-tight capitalize text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors break-words leading-tight block">
                    {w.walletName}
                  </span>
                  <span className="text-[9px] font-sans font-normal text-slate-500 dark:text-slate-400 block mt-0.5">
                    Tap to Log
                  </span>
                </div>
              </button>
            ))}

            {upiWallets.length === 0 && (
              <div className="col-span-full py-2.5 border border-dashed border-slate-300 dark:border-white/10 rounded-lg text-center text-xs font-sans text-slate-400">
                No UPI Wallets
              </div>
            )}
          </div>
        </div>

        {/* SUBSECTION B: Bank Accounts */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-serif tracking-tight text-sky-800 dark:text-sky-400 flex items-center gap-1.5">
              <Building2 size={13} />
              Bank <span className="italic font-normal">Accounts</span>
            </span>
            <span className="text-[10px] font-sans font-medium text-slate-500 dark:text-slate-400">
              {bankWallets.length} Accounts
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-2.5">
            {bankWallets.map((w) => (
              <button
                key={w._id}
                type="button"
                onClick={() => onCardClick(w)}
                className="group relative flex flex-col justify-between p-3 rounded-lg bg-gradient-to-br from-sky-500/[0.04] via-sky-500/[0.01] to-transparent dark:from-sky-500/[0.07] dark:via-transparent dark:to-transparent border border-sky-200/90 dark:border-sky-500/30 hover:border-sky-400 dark:hover:border-sky-400 ring-1 ring-sky-300/30 dark:ring-sky-400/10 transition-all duration-150 active:scale-95 cursor-pointer text-left min-h-[78px] font-sans"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="w-3.5 h-2 rounded-[2px] bg-amber-400/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-0.5 border-t border-b border-amber-700/40" />
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                </div>

                <div className="min-w-0 w-full mt-auto">
                  <span className="text-xs font-serif tracking-tight capitalize text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors break-words leading-tight block">
                    {w.walletName}
                  </span>
                  <span className="text-[9px] font-sans font-normal text-slate-500 dark:text-slate-400 block mt-0.5">
                    Tap to Log
                  </span>
                </div>
              </button>
            ))}

            {bankWallets.length === 0 && (
              <div className="col-span-full py-2.5 border border-dashed border-slate-300 dark:border-white/10 rounded-lg text-center text-xs font-sans text-slate-400">
                No Bank Accounts
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default WalletGridSection;