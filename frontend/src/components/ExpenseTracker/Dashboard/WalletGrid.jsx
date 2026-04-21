import React from "react";
import { Landmark, ShieldCheck, ArrowRightLeft, Activity } from "lucide-react";

/**
 * Formats numbers into the Indian Numbering System (Lakhs/Crores)
 * e.g., 100000 -> 1,00,000
 */
const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
};

const WalletGrid = ({ wallets }) => {
  const totalLiquidity = wallets.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="w-full mb-8">
      {/* Header Stat Line */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-emerald-500" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
            Available Balances
          </h2>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck size={12} className="text-emerald-500/50" />
            <span className="text-[9px] font-black uppercase tracking-widest">Encrypted Ledger</span>
        </div>
      </div>

      {/* CONSOLIDATED PORTFOLIO CARD */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
          
          {/* SECTION A: MASTER BALANCE */}
          <div className="p-8 lg:w-1/3 flex flex-col justify-center bg-white dark:bg-[#0B1120]">
            <div className="flex items-center gap-2 mb-2">
                <Activity size={12} className="text-emerald-500" />
                {/* Label removed for a cleaner, high-impact look */}
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Family Balance
                </p>
            </div>
            <h1 className="text-5xl font-[1000] text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">
              ₹{formatINR(totalLiquidity)}
            </h1>
          </div>

          {/* SECTION B: ACCOUNT BREAKDOWN */}
          <div className="p-4 md:p-6 lg:flex-1 bg-slate-50/30 dark:bg-white/1">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {wallets.map((wallet) => (
                <div 
                  key={wallet._id} 
                  className="group flex items-center justify-between p-4 bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 rounded-xl transition-all hover:border-emerald-500/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Sharper vertical indicator */}
                    <div className={`w-1 h-6 ${wallet.isGeneralPool ? 'bg-slate-200 dark:bg-slate-700' : 'bg-emerald-500'}`} />
                    <div className="min-w-0">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 truncate">
                            {wallet.walletName}
                        </p>
                        <p className="text-base font-[1000] text-slate-900 dark:text-white italic tracking-tight leading-none">
                            ₹{formatINR(wallet.balance)}
                        </p>
                    </div>
                  </div>
                  <ArrowRightLeft size={12} className="text-slate-200 dark:text-slate-800 group-hover:text-emerald-500 transition-colors" />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* AUDIT FOOTER */}
        <div className="px-8 py-3 bg-white dark:bg-[#0B1120] border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-emerald-500" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Real-time Sync</span>
                </div>
            </div>
            <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                Last Entry: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
      </div>
    </div>
  );
};

export default WalletGrid;