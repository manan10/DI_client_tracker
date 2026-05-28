import React from "react";
import { Wallet, CreditCard, Activity, ArrowDownRight, RefreshCcw } from "lucide-react";

const formatINR = (num) => new Intl.NumberFormat('en-IN').format(num || 0);

const AnalyticsHero = ({ data, loading, onRefresh, isRefreshing }) => {
  const physical = data?.walletWise?.filter(w => !w.isVirtual) || [];
  const digital = data?.walletWise?.filter(w => w.isVirtual) || [];
  
  const totalSpend = data?.aggregated?.monthNetSpend || 0;

  return (
    <div className={`transition-opacity duration-700 ${loading ? 'opacity-50 blur-sm pointer-events-none' : 'opacity-100'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- LEFT: HOUSEHOLD TOTAL SPEND --- */}
        <div className="lg:col-span-4 flex flex-col bg-linear-to-br from-indigo-600 via-purple-700 to-violet-900 border border-indigo-500/30 rounded-xl shadow-lg shadow-indigo-500/20 overflow-hidden relative text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/4 pointer-events-none" />
          
          <div className="p-6 relative z-10 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-indigo-300" />
                  Net Expenditure
                </p>
                
                {/* UPGRADED HERO SYNC BUTTON */}
                <button 
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="group flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black tracking-widest uppercase border border-white/10 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCcw size={12} className={isRefreshing ? 'animate-spin text-white' : 'text-indigo-200 group-hover:text-white transition-colors'} />
                  <span className="text-white hidden sm:inline-block">{isRefreshing ? 'Syncing...' : 'Force Sync'}</span>
                  <span className="text-white sm:hidden">Sync</span>
                </button>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-1 text-transparent bg-clip-text bg-linear-to-r from-white to-indigo-100">
                ₹{formatINR(totalSpend)}
              </h2>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-indigo-200/70 uppercase tracking-widest mb-1">Total Liquidity</p>
                <p className="text-lg font-bold text-white">₹{formatINR(data?.aggregated?.totalCashBalance)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-indigo-200/70 uppercase tracking-widest mb-1 text-right">YTD Spending</p>
                <p className="text-lg font-bold text-white text-right">₹{formatINR(data?.aggregated?.yearNetSpend)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT: ACCOUNT BREAKDOWN GRID --- */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CASH ACCOUNTS */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex flex-col group hover:border-amber-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                <Wallet size={16} className="text-amber-600 dark:text-amber-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Physical Cash</h3>
            </div>
            
            <div className="space-y-4 flex-1">
              {physical.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium">No cash utilized this cycle.</p>
              ) : physical.map((w, i) => (
                <div key={i} className="flex justify-between items-center p-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{w.name}</span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{w.user}</span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">₹{formatINR(w.monthSpend)}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <ArrowDownRight size={10} className="text-amber-500" />
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500">
                        {((w.monthSpend / (totalSpend || 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DIGITAL ACCOUNTS */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex flex-col group hover:border-sky-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="p-2 bg-sky-50 dark:bg-sky-500/10 rounded-lg">
                <CreditCard size={16} className="text-sky-600 dark:text-sky-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Digital & Bank</h3>
            </div>

            <div className="space-y-4 flex-1">
              {digital.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium">No digital transactions this cycle.</p>
              ) : digital.map((w, i) => (
                <div key={i} className="flex justify-between items-center p-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{w.name}</span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{w.user}</span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">₹{formatINR(w.monthSpend)}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <ArrowDownRight size={10} className="text-sky-500" />
                      <span className="text-[10px] font-bold text-sky-600 dark:text-sky-500">
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