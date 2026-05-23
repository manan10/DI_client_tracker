import React from "react";
import { ShieldCheck, Globe, Coins, Zap, Smartphone, Activity } from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount || 0);
};

const WalletGrid = ({ wallets }) => {
  const cashWallets = wallets.filter(w => !w.isVirtual);
  const virtualWallets = wallets.filter(w => w.isVirtual);
  const totalLiquidity = cashWallets.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="w-full lg:mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-[#0B1120] rounded-none lg:rounded-4xl border-y lg:border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        
        {/* LEFT: THE CASH VAULT */}
        <div className="lg:col-span-7 p-4 sm:p-6 lg:p-8 flex flex-col justify-between bg-white dark:bg-[#0B1120]">
          <div>
            <div className="flex items-center gap-2 mb-2 lg:mb-4">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500">
                <Coins size={12} lg={14} />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Cash Balance</p>
            </div>

            <div className="flex items-baseline gap-2 mb-4 lg:mb-8">
              <span className="text-3xl sm:text-4xl lg:text-6xl font-[1000] text-slate-900 dark:text-white tracking-tighter italic tabular-nums leading-none">
                ₹{formatINR(totalLiquidity)}
              </span>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 rounded text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                <Activity size={8} /> Active
              </div>
            </div>
          </div>

          {/* PHYSICAL NODES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 lg:mt-0">
            {cashWallets.map((w) => (
              <div key={w._id} className="flex items-center justify-between p-2.5 lg:p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:border-emerald-500/30">
                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase truncate pr-2">{w.walletName}</span>
                <span className="text-xs lg:text-sm font-[1000] text-slate-900 dark:text-white italic tracking-tighter">₹{formatINR(w.balance)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: THE DIGITAL PIPELINE */}
        <div className="lg:col-span-5 p-4 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-white/2 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-500">
                <Globe size={12} lg={14} />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Digital Assets</p>
            </div>
            <ShieldCheck size={12} lg={14} className="text-slate-300 dark:text-slate-700" />
          </div>

          <div className="space-y-1.5 lg:space-y-2 flex-1">
            {virtualWallets.map((w) => (
              <div key={w._id} className="flex items-center justify-between p-2.5 lg:p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm group">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                    <Smartphone size={12} lg={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] lg:text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{w.walletName}</p>
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest">Linked</span>
                    </div>
                  </div>
                </div>
                <Zap size={10} lg={12} className="text-slate-200 dark:text-slate-800 group-hover:text-indigo-500 transition-colors" />
              </div>
            ))}

            {virtualWallets.length === 0 && (
              <div className="h-full min-h-16 lg:min-h-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center opacity-40">
                <p className="text-[8px] font-black uppercase tracking-widest">No Digital Streams</p>
              </div>
            )}
          </div>

          {/* STATUS FOOTER */}
          <div className="mt-4 lg:mt-6 pt-3 lg:pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[7px] lg:text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed italic">
              Digital nodes reflect external UPI/Bank activity. Balances tracked externally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletGrid;