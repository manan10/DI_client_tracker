import React from "react";
import { Wallet, Smartphone } from "lucide-react";
import WalletCard from "./WalletCard";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    amount || 0,
  );
};

const WalletGridSection = ({
  cashWallets,
  virtualWallets,
  totalCash,
  onCardClick,
}) => {
  return (
    <aside className="lg:col-span-5 w-full flex flex-col gap-6 relative">
      {/* 1. Cash Wallets Section */}
      <div className="flex flex-col gap-3">
        {/* Prominent Header Banner */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200/90 dark:border-white/10 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/20 shrink-0">
              <Wallet size={16} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col min-w-0">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
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

        {/* 3-Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2.5 items-start">
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

      {/* 2. Digital & Bank Accounts Section */}
      <div className="flex flex-col gap-3 mt-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Smartphone size={15} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Digital & Bank Accounts ({virtualWallets.length})
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            Auto Tracked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2.5 items-start">
          {virtualWallets.map((w, idx) => (
            <WalletCard
              key={w._id}
              wallet={w}
              index={cashWallets.length + idx}
              onCardClick={onCardClick}
            />
          ))}
          {virtualWallets.length === 0 && (
            <div className="col-span-full py-6 border border-dashed border-slate-200 dark:border-white/10 rounded-md text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                No Online Accounts Registered
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default WalletGridSection;