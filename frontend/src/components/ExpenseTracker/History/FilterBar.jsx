import React, { useState, useMemo } from "react";
import { 
  ChevronDown, Landmark, Wallet as WalletIcon, 
  Check, Globe, Coins, Activity 
} from "lucide-react";

const FilterBar = ({ wallets, activeWallet, setActiveWallet }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Categorize wallets for the dropdown
  const sections = useMemo(() => ({
    cash: wallets.filter(w => !w.isVirtual),
    virtual: wallets.filter(w => w.isVirtual)
  }), [wallets]);

  const currentWallet = activeWallet === "All" 
    ? { walletName: "All Wallets", isGeneralPool: true, isVirtual: false } 
    : wallets.find(w => w._id === activeWallet);

  const isCurrentVirtual = currentWallet?.isVirtual;

  return (
    <div className="relative mt-12 mb-8">
      <div className="flex items-center gap-4">
        
        {/* ACTIVE SELECTOR PILL */}
        <div className="relative group">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-4 pl-5 pr-4 py-4 rounded-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer z-20 relative border-none ${
              isCurrentVirtual 
                ? 'bg-indigo-600 dark:bg-white text-white dark:text-slate-950 shadow-indigo-500/20' 
                : 'bg-emerald-700 dark:bg-white text-white dark:text-slate-950 shadow-emerald-500/20'
            }`}
          >
            <div className="flex items-center gap-3">
              {currentWallet?.isGeneralPool ? (
                <Landmark size={16} />
              ) : isCurrentVirtual ? (
                <Globe size={16} className="animate-pulse" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              )}
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                {currentWallet?.walletName}
              </span>
            </div>
            <div className={`w-px h-4 ${isCurrentVirtual ? 'bg-white/20 dark:bg-slate-200' : 'bg-white/20 dark:bg-slate-200'}`} />
            <ChevronDown size={14} className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* SPATIAL DROPDOWN MATRIX */}
          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
              
              <div className="absolute top-16 left-0 z-30 w-[300px] sm:w-[450px] bg-white dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] p-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="space-y-6">
                  
                  {/* GLOBAL SECTION */}
                  <div>
                    <button
                      onClick={() => { setActiveWallet("All"); setIsOpen(false); }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                        activeWallet === "All" 
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <Activity size={18} />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest leading-none">All Wallets</p>
                          <p className="text-[8px] font-bold opacity-60 uppercase mt-1">Unified Asset View</p>
                        </div>
                      </div>
                      {activeWallet === "All" && <Check size={14} />}
                    </button>
                  </div>

                  {/* CASH WALLETS SECTION */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-2">
                      <Coins size={10} className="text-emerald-500" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Liquid Assets</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sections.cash.map((w) => (
                        <button
                          key={w._id}
                          onClick={() => { setActiveWallet(w._id); setIsOpen(false); }}
                          className={`flex items-center justify-between p-4 rounded-xl transition-all border ${
                            activeWallet === w._id 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-slate-50 dark:bg-slate-900/30 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-tight truncate w-24">{w.walletName}</p>
                            <p className="text-[8px] font-bold opacity-60">₹{w.balance.toLocaleString()}</p>
                          </div>
                          {activeWallet === w._id && <Check size={12} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* VIRTUAL WALLETS SECTION */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-2">
                      <Globe size={10} className="text-indigo-500" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Digital Nodes</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sections.virtual.map((w) => (
                        <button
                          key={w._id}
                          onClick={() => { setActiveWallet(w._id); setIsOpen(false); }}
                          className={`flex items-center justify-between p-4 rounded-xl transition-all border ${
                            activeWallet === w._id 
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400' 
                            : 'bg-slate-50 dark:bg-slate-900/30 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="text-left flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${activeWallet === w._id ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
                            <p className="text-[10px] font-black uppercase tracking-tight truncate w-24">{w.walletName}</p>
                          </div>
                          {activeWallet === w._id && <Check size={12} />}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}
        </div>

        {/* QUICK STATS (Desktop) */}
        <div className="hidden lg:flex items-center gap-8 ml-auto">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
              {isCurrentVirtual ? "Link Status" : "Active Balance"}
            </span>
            <span className={`text-sm font-black italic ${isCurrentVirtual ? 'text-indigo-500' : 'text-slate-900 dark:text-white'}`}>
              {activeWallet === "All" ? "Full Portfolio" : isCurrentVirtual ? "Online Syncing" : `₹${currentWallet?.balance?.toLocaleString()}`}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />
          <div className="flex -space-x-2">
            {wallets.slice(0, 5).map((w, i) => (
              <div 
                key={i} 
                className={`w-8 h-8 rounded-full border-2 border-white dark:border-[#020617] flex items-center justify-center text-[8px] font-black uppercase text-white shadow-sm ${w.isVirtual ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                title={w.walletName}
              >
                {w.walletName[0]}
              </div>
            ))}
            {wallets.length > 5 && (
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#020617] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400">
                +{wallets.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;