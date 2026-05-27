import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  ChevronDown, Landmark, Check, Globe, Wallet, Activity 
} from "lucide-react";

const FilterBar = ({ wallets, activeWallet, setActiveWallet }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Categorize wallets
  const sections = useMemo(() => ({
    cash: wallets.filter(w => !w.isVirtual),
    virtual: wallets.filter(w => w.isVirtual)
  }), [wallets]);

  const currentWallet = activeWallet === "All" 
    ? { walletName: "Global Portfolio", isGeneralPool: true, isVirtual: false } 
    : wallets.find(w => w._id === activeWallet);

  const isCurrentVirtual = currentWallet?.isVirtual;

  return (
    <div className="relative w-full mb-8 px-4 sm:px-0 z-40" ref={dropdownRef}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
        
        {/* 1. TACTILE SELECTOR TRIGGER - Matches the sleek 'May 2026' pill aesthetic */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group w-full md:w-auto flex items-center justify-between md:justify-start gap-4 px-6 py-3.5 rounded-full bg-white dark:bg-slate-900 border transition-all duration-300 hover:shadow-md active:scale-[0.98] ${
            isOpen ? 'border-emerald-400 shadow-emerald-500/10 shadow-lg' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Dynamic Status Icon */}
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentWallet?.isGeneralPool ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' :
              isCurrentVirtual ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 
              'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
            }`}>
              {currentWallet?.isGeneralPool ? <Activity size={14} strokeWidth={2.5} /> : 
               isCurrentVirtual ? <Globe size={14} strokeWidth={2.5} /> : 
               <Wallet size={14} strokeWidth={2.5} />}
            </div>
            
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">
                {currentWallet?.isGeneralPool ? "Viewing" : isCurrentVirtual ? "Digital Node" : "Liquid Asset"}
              </span>
              <span className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none truncate max-w-[180px] md:max-w-[220px]">
                {currentWallet?.walletName}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pl-2">
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
            <ChevronDown size={18} strokeWidth={2.5} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-500' : 'group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
          </div>
        </button>

        {/* 2. QUICK STATS (Desktop) - Refined and aligned */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex flex-col items-end justify-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              {isCurrentVirtual ? "Sync Status" : "Active Balance"}
            </span>
            <span className={`text-base font-black italic tracking-tighter ${isCurrentVirtual ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
              {activeWallet === "All" ? "Full Portfolio" : isCurrentVirtual ? "Online Active" : `₹${currentWallet?.balance?.toLocaleString('en-IN')}`}
            </span>
          </div>
          
          {/* Overlapping Avatars */}
          <div className="flex -space-x-3">
            {wallets.slice(0, 5).map((w, i) => (
              <div 
                key={i} 
                className={`w-10 h-10 rounded-full ring-2 ring-white dark:ring-[#0B1120] flex items-center justify-center text-[10px] font-black uppercase text-white shadow-sm transition-transform hover:-translate-y-1 hover:z-10 cursor-pointer ${w.isVirtual ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                title={w.walletName}
              >
                {w.walletName.substring(0, 2)}
              </div>
            ))}
            {wallets.length > 5 && (
              <div className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-[#0B1120] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
                +{wallets.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. PREMIUM DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute top-full mt-3 left-4 right-4 md:left-0 md:right-auto md:w-[420px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto scrollbar-hide">
            
            {/* Global Selection */}
            <button
              onClick={() => { setActiveWallet("All"); setIsOpen(false); }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                activeWallet === "All" 
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md' 
                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Landmark size={18} strokeWidth={2.5} className={activeWallet === "All" ? 'text-white dark:text-slate-900' : 'text-slate-400'} />
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-wider leading-none">Global Portfolio</p>
                  <p className={`text-[9px] font-bold uppercase tracking-widest mt-1.5 ${activeWallet === "All" ? 'text-slate-400 dark:text-slate-500' : 'text-slate-400'}`}>Unified Asset View</p>
                </div>
              </div>
              {activeWallet === "All" && <Check size={16} strokeWidth={3} />}
            </button>

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4" />

            {/* Liquid Assets */}
            <div className="px-2 pb-2">
              <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em] mb-2 px-2">Liquid Assets</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {sections.cash.map((w) => (
                  <button
                    key={w._id}
                    onClick={() => { setActiveWallet(w._id); setIsOpen(false); }}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                      activeWallet === w._id 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-left min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-tight truncate">{w.walletName}</p>
                      <p className={`text-[9px] font-bold mt-0.5 ${activeWallet === w._id ? 'opacity-80' : 'text-slate-400'}`}>₹{w.balance.toLocaleString('en-IN')}</p>
                    </div>
                    {activeWallet === w._id && <Check size={14} strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Digital Nodes */}
            <div className="px-2 pb-2">
              <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-2 px-2">Digital Nodes</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {sections.virtual.map((w) => (
                  <button
                    key={w._id}
                    onClick={() => { setActiveWallet(w._id); setIsOpen(false); }}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                      activeWallet === w._id 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-left min-w-0 flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeWallet === w._id ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      <p className="text-[10px] font-black uppercase tracking-tight truncate">{w.walletName}</p>
                    </div>
                    {activeWallet === w._id && <Check size={14} strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;