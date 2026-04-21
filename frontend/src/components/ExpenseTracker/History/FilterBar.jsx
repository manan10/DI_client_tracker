import React, { useState } from "react";
import { ChevronDown, Box, Landmark, Wallet as WalletIcon, Check, Plus } from "lucide-react";

const FilterBar = ({ wallets, activeWallet, setActiveWallet }) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentWallet = activeWallet === "All" 
    ? { walletName: "All Wallets", isGeneralPool: true } 
    : wallets.find(w => w._id === activeWallet);

  return (
    <div className="relative mt-12 mb-8">
      {/* THE HUB: A floating command-style bar */}
      <div className="flex items-center gap-4">
        
        {/* ACTIVE SELECTOR PILL */}
        <div className="relative group">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-4 bg-emerald-700 dark:bg-white text-white dark:text-slate-950 pl-5 pr-4 py-4 rounded-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer z-20 relative"
          >
            <div className="flex items-center gap-3">
              {currentWallet?.isGeneralPool ? (
                <Landmark size={16} className="text-slate-950" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              )}
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                {currentWallet?.walletName}
              </span>
            </div>
            <div className="w-px h-4 bg-white/20 dark:bg-slate-200" />
            <ChevronDown size={14} className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* SPATIAL DROPDOWN MATRIX */}
          {isOpen && (
            <>
              {/* Overlay to close */}
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
              
              <div className="absolute top-16 left-0 z-30 w-[280px] sm:w-[400px] bg-white dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] p-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  
                  {/* GLOBAL OPTION */}
                  <button
                    onClick={() => { setActiveWallet("All"); setIsOpen(false); }}
                    className={`flex items-center justify-between p-4 rounded-[1.5rem] transition-all ${
                      activeWallet === "All" 
                      ? 'bg-emerald-500/10 border border-emerald-500/20' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Landmark size={18} className={activeWallet === "All" ? "text-emerald-500" : "text-slate-400"} />
                      <div className="text-left">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${activeWallet === "All" ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-300'}`}>Global</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">All Assets</p>
                      </div>
                    </div>
                    {activeWallet === "All" && <Check size={14} className="text-emerald-500" />}
                  </button>

                  {/* WALLET OPTIONS */}
                  {wallets.map((w) => (
                    <button
                      key={w._id}
                      onClick={() => { setActiveWallet(w._id); setIsOpen(false); }}
                      className={`flex items-center justify-between p-4 rounded-[1.5rem] transition-all ${
                        activeWallet === w._id 
                        ? 'bg-emerald-500/10 border border-emerald-500/20' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <WalletIcon size={18} className={activeWallet === w._id ? "text-emerald-500" : "text-slate-400"} />
                        <div className="text-left">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${activeWallet === w._id ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-300'}`}>{w.walletName}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">₹{w.balance.toLocaleString()}</p>
                        </div>
                      </div>
                      {activeWallet === w._id && <Check size={14} className="text-emerald-500" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* QUICK STATS (Desktop Only) */}
        <div className="hidden lg:flex items-center gap-8 ml-auto">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Vault Liquidity</span>
            <span className="text-sm font-black text-slate-900 dark:text-white italic">
              {activeWallet === "All" ? "Combined Assets" : `₹${currentWallet?.balance?.toLocaleString()}`}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />
          <div className="flex -space-x-2">
            {wallets.map((w, i) => (
              <div 
                key={i} 
                className="w-8 h-8 rounded-full border-2 border-white dark:border-[#020617] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400 uppercase"
                title={w.walletName}
              >
                {w.walletName[0]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;