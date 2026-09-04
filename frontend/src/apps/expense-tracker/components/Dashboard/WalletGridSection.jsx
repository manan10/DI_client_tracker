import React from "react";
import {
  Wallet,
  Smartphone,
  Globe,
  Sparkles,
} from "lucide-react";
import WalletCard from "./WalletCard";
import { getWalletColor } from "./walletUtils";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    amount || 0,
  );
};

const WalletGridSection = ({
  cashWallets = [],
  virtualWallets = [],
  totalCash = 0,
  onCardClick,
}) => {
  // Sort digital wallets alphabetically by user/wallet name
  const sortedVirtualWallets = [...virtualWallets].sort((a, b) =>
    (a.walletName || "").localeCompare(b.walletName || "")
  );

  return (
    <aside className="lg:col-span-5 w-full flex flex-col gap-6 relative z-10">
      {/* 1. Cash Wallets Section (3-in-a-row grid on mobile) */}
      <div className="flex flex-col gap-3">
        {/* Prominent Header Banner */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200/90 dark:border-white/10 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/20 shrink-0">
              <Wallet size={16} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-xs sm:text-sm font-[1000] uppercase tracking-wider text-slate-900 dark:text-white leading-tight">
                Cash Wallets
              </h2>
              <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {cashWallets.length} Active Nodes
              </span>
            </div>
          </div>

          {/* High-Impact Total Cash Badge */}
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300/80 dark:border-emerald-500/30 px-3 py-1.5 rounded-lg shadow-xs shrink-0">
            <div className="flex flex-col text-right">
              <span className="text-[8px] font-mono font-extrabold uppercase tracking-widest text-emerald-800/70 dark:text-emerald-300/70 leading-none mb-0.5">
                Total Cash In Hand
              </span>
              <span className="text-base sm:text-lg lg:text-xl font-mono font-[1000] text-emerald-700 dark:text-emerald-300 tracking-tight tabular-nums leading-none">
                ₹{formatINR(totalCash)}
              </span>
            </div>
          </div>
        </div>

        {/* 3-Column Uniform Grid for Cash Wallets */}
        <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 items-start">
          {cashWallets.map((w, idx) => (
            <WalletCard
              key={w._id}
              wallet={w}
              index={idx}
              onCardClick={onCardClick}
            />
          ))}
          {cashWallets.length === 0 && (
            <div className="col-span-full py-6 border border-dashed border-slate-200 dark:border-white/10 rounded-md text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                No Cash Wallets Registered
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Digital & Bank Accounts Section (3-in-a-row structured grid) */}
      <div className="flex flex-col gap-2.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Globe size={13} className="text-indigo-500" />
              Digital Channels
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20">
              {sortedVirtualWallets.length}
            </span>
          </div>

          <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Sparkles size={10} className="text-emerald-500" />
            Live Sync
          </span>
        </div>

        {/* 3-Column Uniform Grid for Digital Accounts */}
        <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 items-stretch">
          {sortedVirtualWallets.map((w, idx) => {
            const palette = getWalletColor(w._id || w.walletName, cashWallets.length + idx);

            return (
              <button
                key={w._id}
                type="button"
                onClick={() => onCardClick(w)}
                className="group relative flex flex-col justify-between p-2.5 bg-white dark:bg-[#0B1120] hover:bg-slate-50 dark:hover:bg-white/4 border border-slate-200/90 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-lg shadow-2xs transition-all active:scale-95 outline-none cursor-pointer select-none text-left touch-manipulation"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110 ${palette.iconBox}`}>
                    <Smartphone size={11} />
                  </div>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                </div>

                <div className="flex flex-col min-w-0 w-full">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate w-full">
                    {w.walletName}
                  </span>
                  <span className="text-[8px] font-mono uppercase tracking-wider text-slate-400">
                    Linked Channel
                  </span>
                </div>
              </button>
            );
          })}

          {sortedVirtualWallets.length === 0 && (
            <div className="col-span-full py-3 px-4 border border-dashed border-slate-200 dark:border-white/10 rounded-xl text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
              No Online Channels Connected
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default WalletGridSection;