import React from "react";
import { Wallet, CreditCard, Landmark, Zap, Activity } from "lucide-react";

const formatINR = (num) => new Intl.NumberFormat('en-IN').format(num || 0);

const AnalyticsHero = ({ data, loading, selectedMonth, selectedYear }) => {
  const physical = data?.walletWise?.filter(w => !w.isVirtual) || [];
  const digital = data?.walletWise?.filter(w => w.isVirtual) || [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="transition-all duration-700 py-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* --- LEFT: MASTER METRIC PANEL --- */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`relative p-7 rounded-4xl overflow-hidden transition-all duration-500 ${loading ? 'opacity-30 blur-md' : 'opacity-100'} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl`}>
            {/* Soft Background Aura */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-500/10 blur-[60px] rounded-full animate-pulse" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-rose-500 mb-4">
                <Activity size={14} strokeWidth={3} className="animate-pulse" />
                <span className="text-[10px] font-[1000] uppercase tracking-[0.4em]">Monthly Burn</span>
              </div>
              
              <h2 className="text-6xl font-[1000] text-slate-900 dark:text-white tracking-tighter leading-none italic uppercase font-mono">
                ₹{formatINR(data?.aggregated?.monthNetSpend)}
              </h2>
              
              <div className="flex items-center gap-3 mt-6">
                <span className="px-3 py-1 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest italic shadow-lg">
                    Cycle: {monthNames[selectedMonth]} {selectedYear}
                </span>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800/50" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 group hover:bg-emerald-500/10 transition-all">
              <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Landmark size={11} /> Vault stock
              </p>
              <h3 className="text-2xl font-[1000] italic text-emerald-600 dark:text-emerald-400 tracking-tighter font-mono">₹{formatINR(data?.aggregated?.totalCashBalance)}</h3>
            </div>
            <div className="p-6 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 group hover:border-indigo-500/20 transition-all">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 italic">Annual footprint</p>
              <h3 className="text-2xl font-[1000] italic text-slate-900 dark:text-white tracking-tighter font-mono">₹{formatINR(data?.aggregated?.yearNetSpend)}</h3>
            </div>
          </div>
        </div>

        {/* --- RIGHT: HIGH-DENSITY AUDIT GRID --- */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* PHYSICAL NODES */}
          <div className="bg-white dark:bg-slate-900/40 rounded-4xl p-6 border border-slate-100 dark:border-slate-800 shadow-lg relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-5 px-1 border-b border-slate-50 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
                <h3 className="text-[10px] font-[1000] uppercase tracking-[0.4em] text-slate-400 italic leading-none">Physical Vaults</h3>
              </div>
              <Wallet size={14} className="text-amber-500/30" />
            </div>
            
            <div className="space-y-1.5">
              {physical.map((w, i) => (
                <div key={i} className="group relative flex items-center justify-between py-2.5 px-3.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all hover:shadow-md">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-[1000] text-slate-900 dark:text-white uppercase italic tracking-tight group-hover:text-amber-600 transition-colors">{w.name}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">{w.user}</span>
                  </div>
                  <div className="flex items-center gap-8 text-right">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-emerald-500 font-mono">₹{formatINR(w.balance)}</span>
                      <span className="text-[7px] font-black text-slate-300 uppercase mt-0.5">Reserve</span>
                    </div>
                    <div className="flex flex-col min-w-16.25">
                      <span className={`text-[11px] font-[1000] italic leading-none font-mono ${w.monthSpend > 0 ? 'text-rose-500' : 'text-slate-300 dark:text-slate-700'}`}>₹{formatINR(w.monthSpend)}</span>
                      <div className="h-0.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${Math.min((w.monthSpend / (data?.aggregated?.monthNetSpend || 1)) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DIGITAL NODES */}
          <div className="bg-white dark:bg-slate-900/40 rounded-4xl p-6 border border-slate-100 dark:border-slate-800 shadow-lg relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-5 px-1 border-b border-slate-50 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
                <h3 className="text-[10px] font-[1000] uppercase tracking-[0.4em] text-slate-400 italic leading-none">Online Nodes</h3>
              </div>
              <CreditCard size={14} className="text-indigo-500/30" />
            </div>

            <div className="space-y-1.5">
              {digital.map((w, i) => (
                <div key={i} className="group relative flex items-center justify-between py-2.5 px-3.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all hover:shadow-md">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-[1000] text-slate-900 dark:text-white uppercase italic tracking-tight group-hover:text-indigo-500 transition-colors">{w.name}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">{w.user}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className={`text-[12px] font-[1000] italic leading-none font-mono ${w.monthSpend > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-700'}`}>₹{formatINR(w.monthSpend)}</span>
                    <div className="h-0.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 self-end overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${Math.min((w.monthSpend / (data?.aggregated?.monthNetSpend || 1)) * 100, 100)}%` }} />
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