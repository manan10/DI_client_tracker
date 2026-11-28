import React from "react";
import {
  ShieldCheck,
  Globe,
  Coins,
  Zap,
  Smartphone,
  Activity,
  Wallet,
  Landmark,
  RefreshCw,
} from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    amount || 0
  );
};

const WalletGrid = ({ wallets, onReconcile }) => {
  const cashWallets = wallets.filter((w) => !w.isVirtual);
  const virtualWallets = wallets.filter((w) => w.isVirtual);
  const totalLiquidity = cashWallets.reduce(
    (acc, curr) => acc + curr.balance,
    0
  );

  return (
    <div
      style={{ fontFamily: "'Nunito Sans', sans-serif" }}
      className="w-full max-w-[1680px] mx-auto lg:mb-8"
    >
      <div className="flex flex-col lg:flex-row bg-white dark:bg-[#1A1C20] lg:rounded-2xl border-y lg:border border-stone-200/80 dark:border-white/[0.07] shadow-2xs overflow-hidden min-w-0">
        {/* LEFT: THE CASH VAULT */}
        <div className="w-full lg:w-7/12 p-4 sm:p-6 lg:p-8 flex flex-col justify-between bg-white dark:bg-[#1A1C20] min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-700/10 dark:bg-[#4EA885]/15 rounded-lg text-emerald-700 dark:text-[#68C19D] shrink-0">
                <Coins size={14} />
              </div>
              <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-[0.12em] truncate">
                Total Cash In Hand
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-3 mb-6">
              <span
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                className="text-4xl lg:text-5xl font-bold text-stone-950 dark:text-stone-50 tracking-tight tabular-nums leading-none truncate"
              >
                ₹{formatINR(totalLiquidity)}
              </span>
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-700/10 dark:bg-[#4EA885]/18 rounded-md text-[9.5px] font-bold text-emerald-800 dark:text-[#86D4B4] uppercase tracking-wider shrink-0">
                <Activity size={10} /> Active
              </div>
            </div>
          </div>

          {/* PHYSICAL NODES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
            {cashWallets.map((w) => (
              <div
                key={w._id}
                className="flex items-center justify-between p-3 bg-[#FAF9F6] dark:bg-[#16181C] rounded-xl border border-stone-200/80 dark:border-white/[0.07] min-w-0"
              >
                <div className="flex items-center gap-3 overflow-hidden pr-2">
                  <div className="p-2 rounded-xl shrink-0 bg-emerald-700/10 dark:bg-[#4EA885]/15 text-emerald-700 dark:text-[#68C19D]">
                    {w.isGeneralPool ? (
                      <Landmark size={16} />
                    ) : (
                      <Wallet size={16} />
                    )}
                  </div>
                  <span
                    style={{ fontFamily: "'Lora', serif" }}
                    className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate"
                  >
                    {w.walletName}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onReconcile && onReconcile(w)}
                  title="Adjust or Sync Balance"
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-stone-200/60 dark:hover:bg-white/[0.06] transition-colors shrink-0 cursor-pointer"
                >
                  <span
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    className="text-sm font-bold text-stone-950 dark:text-stone-50 tabular-nums"
                  >
                    ₹{formatINR(w.balance)}
                  </span>
                  <div className="text-stone-400 dark:text-stone-500">
                    <RefreshCw size={13} />
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: THE DIGITAL PIPELINE */}
        <div className="w-full lg:w-5/12 p-4 sm:p-6 lg:p-8 bg-[#FAF9F6] dark:bg-[#16181C] border-t lg:border-t-0 lg:border-l border-stone-200/80 dark:border-white/[0.07] flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 bg-emerald-700/10 dark:bg-[#4EA885]/15 rounded-lg text-emerald-700 dark:text-[#68C19D] shrink-0">
                <Globe size={14} />
              </div>
              <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-[0.12em] truncate">
                Digital Accounts
              </p>
            </div>
            <ShieldCheck size={16} className="text-stone-400 shrink-0" />
          </div>

          <div className="space-y-2 flex-1">
            {virtualWallets.map((w) => (
              <div
                key={w._id}
                className="flex items-center justify-between p-3 bg-white dark:bg-[#1A1C20] rounded-xl border border-stone-200/80 dark:border-white/[0.07] shadow-2xs min-w-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 dark:bg-[#4EA885] flex items-center justify-center text-white dark:text-[#121315] shrink-0">
                    <Smartphone size={14} />
                  </div>
                  <div className="truncate pr-2">
                    <p
                      style={{ fontFamily: "'Lora', serif" }}
                      className="text-xs font-bold text-stone-950 dark:text-stone-50 truncate mb-0.5"
                    >
                      {w.walletName}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-700 dark:bg-[#68C19D] shrink-0" />
                      <span className="text-[9.5px] font-bold text-emerald-700 dark:text-[#68C19D] uppercase tracking-wider">
                        Linked
                      </span>
                    </div>
                  </div>
                </div>
                <Zap
                  size={14}
                  className="text-stone-300 dark:text-stone-600 shrink-0"
                />
              </div>
            ))}

            {virtualWallets.length === 0 && (
              <div className="h-24 border border-dashed border-stone-300 dark:border-white/15 rounded-xl flex items-center justify-center bg-white/50 dark:bg-white/[0.02]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  No Digital Channels
                </p>
              </div>
            )}
          </div>

          {/* STATUS FOOTER */}
          <div className="mt-6 pt-4 border-t border-stone-200/80 dark:border-white/[0.07]">
            <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed">
              Digital channels reflect external UPI and bank activity. Balances
              are tracked directly in the ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletGrid;
