import React from "react";
import { Wallet, CreditCard, Activity, ArrowDownRight, RefreshCcw, Landmark, Zap } from "lucide-react";

const formatINR = (num) => new Intl.NumberFormat('en-IN').format(num || 0);

const AnalyticsHero = ({ data, loading, onRefresh, isRefreshing }) => {
  // Filter and sort wallets by amount spent from high to low
  const physical = (data?.walletWise?.filter(w => !w.isVirtual) || [])
    .sort((a, b) => b.monthSpend - a.monthSpend);
    
  const digital = (data?.walletWise?.filter(w => w.isVirtual) || [])
    .sort((a, b) => b.monthSpend - a.monthSpend);
  
  const totalSpend = data?.aggregated?.monthNetSpend || 0;

  return (
    <div className={`transition-opacity duration-500 w-full min-w-0 ${loading ? 'opacity-40 blur-sm pointer-events-none' : 'opacity-100'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 min-w-0">
        
        {/* --- LEFT: HOUSEHOLD TOTAL SPEND (Executive Dark Card) --- */}
        <div className="lg:col-span-4 flex flex-col bg-slate-900 dark:bg-[#0B1120] border border-slate-800 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden relative text-white min-w-0">
          
          {/* Subtle SaaS Glow Effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />
          
          <div className="p-6 sm:p-8 relative z-10 flex-1 flex flex-col justify-between">
            <div className="min-w-0">
              <div className="flex items-center justify-between mb-5 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 truncate pr-2">
                  <Activity size={14} className="text-indigo-400 shrink-0" />
                  Total Spent This Month
                </p>
                
                {/* UPGRADED HERO SYNC BUTTON */}
                <button 
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="group flex items-center gap-2 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-md text-[9px] font-bold tracking-widest uppercase border border-white/10 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0 outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                >
                  <RefreshCcw size={12} className={isRefreshing ? 'animate-spin text-slate-300' : 'text-indigo-400 group-hover:text-indigo-300 transition-colors'} />
                  <span className="text-slate-300 group-hover:text-white transition-colors hidden sm:inline-block">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
                </button>
              </div>
              <h2 className="text-4xl sm:text-5xl font-[1000] tracking-tighter mb-1 text-white tabular-nums truncate">
                ₹{formatINR(totalSpend)}
              </h2>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700 dark:border-white/10 grid grid-cols-2 gap-4">
              <div className="min-w-0 pr-2">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 truncate">Total Balance</p>
                <p className="text-lg font-bold text-slate-200 tabular-nums truncate">₹{formatINR(data?.aggregated?.totalCashBalance)}</p>
              </div>
              <div className="min-w-0 pl-2 border-l border-slate-700 dark:border-white/10">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 truncate text-right">YTD Spending</p>
                <p className="text-lg font-bold text-slate-200 tabular-nums truncate text-right">₹{formatINR(data?.aggregated?.yearNetSpend)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT: ACCOUNT BREAKDOWN GRID --- */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 min-w-0">
          
          {/* CASH ACCOUNTS */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col group hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-colors min-w-0">
            <div className="flex items-center gap-3 mb-5 border-b border-slate-100 dark:border-white/5 pb-4 min-w-0">
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-md shrink-0">
                <Landmark size={14} className="text-emerald-600 dark:text-emerald-500" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest truncate">Cash Vaults</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scroll pr-1 space-y-1">
              {physical.length === 0 ? (
                <div className="h-full flex items-center justify-center p-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No cash utilized.</p>
                </div>
              ) : physical.map((w, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-colors min-w-0">
                  <div className="flex flex-col min-w-0 pr-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{w.name}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate mt-0.5">{w.user}</span>
                  </div>
                  <div className="text-right flex flex-col items-end shrink-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">₹{formatINR(w.monthSpend)}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <ArrowDownRight size={10} className="text-emerald-500 shrink-0" />
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 tabular-nums">
                        {((w.monthSpend / (totalSpend || 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DIGITAL ACCOUNTS */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col group hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-colors min-w-0">
            <div className="flex items-center gap-3 mb-5 border-b border-slate-100 dark:border-white/5 pb-4 min-w-0">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-md shrink-0">
                <Zap size={14} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest truncate">Digital Wallets</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scroll pr-1 space-y-1">
              {digital.length === 0 ? (
                <div className="h-full flex items-center justify-center p-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No digital transactions.</p>
                </div>
              ) : digital.map((w, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-colors min-w-0">
                  <div className="flex flex-col min-w-0 pr-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{w.name}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate mt-0.5">{w.user}</span>
                  </div>
                  <div className="text-right flex flex-col items-end shrink-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">₹{formatINR(w.monthSpend)}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <ArrowDownRight size={10} className="text-indigo-500 shrink-0" />
                      <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {((w.monthSpend / (totalSpend || 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalyticsHero;