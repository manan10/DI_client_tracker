import React from "react";
import { ShieldCheck, Globe, Coins, Zap, Smartphone, Activity, Wallet, Landmark, RefreshCw } from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount || 0);
};

const WalletGrid = ({ wallets, onReconcile }) => {
  const cashWallets = wallets.filter(w => !w.isVirtual);
  const virtualWallets = wallets.filter(w => w.isVirtual);
  const totalLiquidity = cashWallets.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="w-full max-w-7xl mx-auto lg:mb-8">
      {/* Strict Geometry: Standardized to rounded-2xl max */}
      <div className="flex flex-col lg:flex-row bg-white dark:bg-[#0B1120] lg:rounded-2xl border-y lg:border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden min-w-0">
        
        {/* LEFT: THE CASH VAULT */}
        <div className="w-full lg:w-7/12 p-4 sm:p-6 lg:p-8 flex flex-col justify-between bg-white dark:bg-[#0B1120] min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/10 rounded-md text-emerald-600 dark:text-emerald-500 shrink-0">
                <Coins size={14} />
              </div>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">
                Total Cash In Hand
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-3 mb-6">
              <span className="text-4xl lg:text-5xl font-[1000] text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none truncate">
                ₹{formatINR(totalLiquidity)}
              </span>
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-md border border-emerald-100 dark:border-emerald-500/20 text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest shrink-0">
                <Activity size={10} /> Active
              </div>
            </div>
          </div>

          {/* PHYSICAL NODES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
            {cashWallets.map((w) => (
              <div key={w._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/5 min-w-0">
                
                {/* Standard Wallet Identity */}
                <div className="flex items-center gap-3 overflow-hidden pr-2">
                   <div className={`p-2 rounded-md shrink-0 ${w.isGeneralPool ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                      {w.isGeneralPool ? <Landmark size={16} /> : <Wallet size={16} />}
                   </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {w.walletName}
                  </span>
                </div>

                {/* Interactive Balance & Permanently Visible Sync Action */}
                <button
                  onClick={() => onReconcile && onReconcile(w)}
                  title="Adjust or Sync Balance"
                  className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                    ₹{formatINR(w.balance)}
                  </span>
                  <div className="text-slate-400 dark:text-slate-500">
                    <RefreshCw size={14} />
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: THE DIGITAL PIPELINE */}
        <div className="w-full lg:w-5/12 p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900/30 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/10 flex flex-col min-w-0">
          
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 bg-indigo-100 dark:bg-indigo-500/10 rounded-md text-indigo-600 dark:text-indigo-400 shrink-0">
                <Globe size={14} />
              </div>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">
                Digital Accounts
              </p>
            </div>
            <ShieldCheck size={16} className="text-slate-400 shrink-0" />
          </div>

          <div className="space-y-2 flex-1">
            {virtualWallets.map((w) => (
              <div key={w._id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shrink-0">
                    <Smartphone size={14} />
                  </div>
                  <div className="truncate pr-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate mb-0.5">
                      {w.walletName}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                      <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Linked</span>
                    </div>
                  </div>
                </div>
                <Zap size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
              </div>
            ))}

            {virtualWallets.length === 0 && (
              <div className="h-24 border border-dashed border-slate-300 dark:border-white/20 rounded-lg flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Digital Streams</p>
              </div>
            )}
          </div>

          {/* STATUS FOOTER */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Digital nodes reflect external UPI/Bank activity. Balances are tracked entirely externally.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default WalletGrid;