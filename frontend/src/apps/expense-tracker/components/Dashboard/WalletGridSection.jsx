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

// Translucent jewel tinted palettes with vibrant borders
const PALETTES = [
  {
    // Tuscan Amber
    border: "border-amber-500/40 hover:border-amber-500 dark:border-amber-400/30 dark:hover:border-amber-400",
    bg: "bg-amber-500/[0.04] dark:bg-amber-500/[0.08] hover:bg-amber-500/[0.08] dark:hover:bg-amber-500/[0.14]",
    stitch: "border-amber-500/20 dark:border-amber-400/20",
    badge: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
    textPrimary: "text-slate-900 dark:text-white",
    textAccent: "text-amber-700 dark:text-amber-300",
    clip: "bg-amber-500",
  },
  {
    // Emerald Green
    border: "border-emerald-500/40 hover:border-emerald-500 dark:border-emerald-400/30 dark:hover:border-emerald-400",
    bg: "bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] hover:bg-emerald-500/[0.08] dark:hover:bg-emerald-500/[0.14]",
    stitch: "border-emerald-500/20 dark:border-emerald-400/20",
    badge: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
    textPrimary: "text-slate-900 dark:text-white",
    textAccent: "text-emerald-700 dark:text-emerald-300",
    clip: "bg-emerald-500",
  },
  {
    // Sapphire Blue
    border: "border-sky-500/40 hover:border-sky-500 dark:border-sky-400/30 dark:hover:border-sky-400",
    bg: "bg-sky-500/[0.04] dark:bg-sky-500/[0.08] hover:bg-sky-500/[0.08] dark:hover:bg-sky-500/[0.14]",
    stitch: "border-sky-500/20 dark:border-sky-400/20",
    badge: "bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30",
    textPrimary: "text-slate-900 dark:text-white",
    textAccent: "text-sky-700 dark:text-sky-300",
    clip: "bg-sky-500",
  },
  {
    // Rose Burgundy
    border: "border-rose-500/40 hover:border-rose-500 dark:border-rose-400/30 dark:hover:border-rose-400",
    bg: "bg-rose-500/[0.04] dark:bg-rose-500/[0.08] hover:bg-rose-500/[0.08] dark:hover:bg-rose-500/[0.14]",
    stitch: "border-rose-500/20 dark:border-rose-400/20",
    badge: "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30",
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
    <aside className="lg:col-span-5 w-full flex flex-col gap-6 relative z-10 select-none">
      
      {/* ─────────────────────────────────────────────────────────────
          1. TOTAL CASH (INLINE HEADER BANNER - NOT A CARD)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between pb-3.5 border-b border-slate-200/90 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Coins size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-[18px] font-black tracking-widest text-emerald-700 dark:text-emerald-400 uppercase">
              Total Cash Balance
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white tabular-nums leading-none">
            ₹{formatINR(totalCash)}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. THE MASTER DRAWER (TRANSLUCENT AMBER GLASS WITH GOLD RIM)
         ───────────────────────────────────────────────────────────── */}
      {drawerWallet && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <KeyRound size={13} className="text-amber-600 dark:text-amber-400" />
              Master Drawer
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Primary Wallet
            </span>
          </div>

          <button
            type="button"
            onClick={() => onCardClick(drawerWallet)}
            className="group relative w-full text-left p-4 sm:p-5 rounded-2xl bg-amber-500/[0.05] dark:bg-amber-400/[0.06] hover:bg-amber-500/[0.09] dark:hover:bg-amber-400/[0.12] border-2 border-amber-500/50 hover:border-amber-500 dark:border-amber-400/40 dark:hover:border-amber-400 shadow-sm hover:shadow-md hover:shadow-amber-500/5 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden backdrop-blur-xs"
          >
            {/* Fine Stitched Inset */}
            <div 
              aria-hidden="true" 
              className="absolute inset-2 rounded-xl border border-dashed border-amber-500/25 dark:border-amber-400/20 pointer-events-none" 
            />

            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 dark:bg-amber-400/15 border border-amber-500/30 dark:border-amber-400/30 flex items-center justify-center shrink-0">
                  <ShieldCheck size={22} className="text-amber-600 dark:text-amber-400" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {drawerWallet.walletName}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                    Central cash reserve
                  </p>
                </div>
              </div>

              {/* Balance & Trigger */}
              <div className="text-right flex items-center gap-2.5 shrink-0">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 block font-bold">
                    Balance
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-amber-700 dark:text-amber-400 tabular-nums">
                    ₹{formatINR(drawerWallet.balance)}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400 transition-colors">
                  <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. MEMBER CASH WALLETS (TINTED GLASS & STITCHED COLOR RIMS)
         ───────────────────────────────────────────────────────────── */}
      {regularCashWallets.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Wallet size={13} className="text-emerald-600 dark:text-emerald-400" />
              Pocket Wallets
            </span>
            <span className="text-[10px] font-bold text-slate-400">
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
                  className={`group relative text-left p-3.5 sm:p-4 rounded-2xl ${theme.bg} ${theme.border} border-2 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between backdrop-blur-xs`}
                >
                  {/* Subtle stitch outline inside card */}
                  <div 
                    aria-hidden="true" 
                    className={`absolute inset-1.5 rounded-xl border border-dashed ${theme.stitch} pointer-events-none`} 
                  />

                  {/* Header: Title and metallic bill clip accent */}
                  <div className="relative z-10 flex items-center justify-between gap-1 mb-2.5">
                    <span className={`text-xs sm:text-sm font-black truncate ${theme.textPrimary}`}>
                      {w.walletName}
                    </span>
                    <div className={`w-3.5 h-1.5 rounded-[1px] ${theme.clip} opacity-80 shrink-0`} />
                  </div>

                  {/* Balance Display */}
                  <div className="relative z-10 flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 block">
                        Balance
                      </span>
                      <span className={`text-base sm:text-lg font-black font-mono tabular-nums tracking-tight mt-0.5 block ${theme.textAccent}`}>
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
          4. DIGITAL CHANNELS: 4 COLUMNS ON ALL SCREENS
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 pt-1">
        
        {/* SUBSECTION A: UPI Wallets (4-Column Grid) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <QrCode size={13} />
              UPI & Online Apps
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {upiWallets.length} Apps
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {upiWallets.map((w) => (
              <button
                key={w._id}
                type="button"
                onClick={() => onCardClick(w)}
                className="group relative flex flex-col justify-between p-2 rounded-xl bg-emerald-500/[0.05] dark:bg-emerald-500/[0.08] hover:bg-emerald-500/[0.12] border-2 border-emerald-500/40 hover:border-emerald-500 dark:border-emerald-400/30 dark:hover:border-emerald-400 transition-all duration-150 active:scale-95 cursor-pointer text-left"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="px-1 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                    UPI
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>

                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate block">
                    {w.walletName}
                  </span>
                  <span className="text-[8px] text-slate-400 dark:text-slate-500 block truncate">
                    Tap to log
                  </span>
                </div>
              </button>
            ))}

            {upiWallets.length === 0 && (
              <div className="col-span-4 py-2 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl text-center text-xs text-slate-400">
                No UPI wallets
              </div>
            )}
          </div>
        </div>

        {/* SUBSECTION B: Bank Accounts (4-Column Grid) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <Building2 size={13} />
              Bank Accounts
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {bankWallets.length} Accounts
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {bankWallets.map((w) => (
              <button
                key={w._id}
                type="button"
                onClick={() => onCardClick(w)}
                className="group relative flex flex-col justify-between p-2 rounded-xl bg-sky-500/[0.05] dark:bg-sky-500/[0.08] hover:bg-sky-500/[0.12] border-2 border-sky-500/40 hover:border-sky-500 dark:border-sky-400/30 dark:hover:border-sky-400 transition-all duration-150 active:scale-95 cursor-pointer text-left"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  {/* Micro chip accent */}
                  <div className="w-4 h-2.5 rounded-[2px] bg-amber-400/30 border border-amber-500/50 flex items-center justify-center">
                    <div className="w-2 h-1 border-t border-b border-amber-700/40" />
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                </div>

                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate block">
                    {w.walletName}
                  </span>
                  <span className="text-[8px] text-slate-400 dark:text-slate-500 block truncate">
                    Tap to log
                  </span>
                </div>
              </button>
            ))}

            {bankWallets.length === 0 && (
              <div className="col-span-4 py-2 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl text-center text-xs text-slate-400">
                No bank accounts
              </div>
            )}
          </div>
        </div>

      </div>
    </aside>
  );
};

export default WalletGridSection;