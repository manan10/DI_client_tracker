import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Calendar, ChevronDown, Sparkles, X, Check, Landmark, Globe, Briefcase, Coins, Zap
} from "lucide-react";

const HistoryCommandCenter = ({ 
  wallets = [], activeWallet, setActiveWallet,
  selectedMonth, setSelectedMonth, selectedYear, setSelectedYear
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null); 
  const walletRef = useRef(null);
  const dateRef = useRef(null);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = [2024, 2025, 2026];

  // Click outside to close popovers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        walletRef.current && !walletRef.current.contains(event.target) &&
        dateRef.current && !dateRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sections = useMemo(() => ({
    cash: wallets.filter(w => !w.isVirtual),
    virtual: wallets.filter(w => w.isVirtual)
  }), [wallets]);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const currentWallet = activeWallet === "All" 
    ? { walletName: "All Wallets", isGeneralPool: true } 
    : wallets.find(w => w._id === activeWallet);

  const isCurrentVirtual = currentWallet?.isVirtual;

  const activeDisplayBalance = useMemo(() => {
    if (activeWallet === "All") {
      return wallets.reduce((acc, w) => acc + (w.balance || 0), 0);
    }
    return currentWallet?.balance || 0;
  }, [wallets, activeWallet, currentWallet]);

  return (
    <header className="w-full bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-800/60 pt-6 pb-4 md:pt-8 md:pb-6 relative z-50 transition-colors duration-300">
      
      {/* VIBRANT AMBIENT BACKGROUND EFFECTS */}
      <div className="absolute top-0 left-0 w-75 h-50 bg-emerald-500/10 dark:bg-emerald-400/5 rounded-full blur-[80px] pointer-events-none -z-10" />
      <div className="absolute top-0 right-0 w-75 h-50 bg-indigo-500/10 dark:bg-indigo-400/5 rounded-full blur-[80px] pointer-events-none -z-10" />

      <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-end justify-between gap-5 lg:gap-8 relative z-10">
        
        {/* IDENTITY & TITLE */}
        <div className="shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-sm mb-3 md:mb-4">
            <Sparkles size={10} className="text-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 uppercase tracking-widest">
              Spending Archives
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-[1000] italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
            Spending <span className="text-emerald-500">History</span>
          </h1>
        </div>

        {/* FLOATING GLASS CONTROL STRIP */}
        <div className="grid grid-cols-2 lg:flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
          
          {/* 1. WALLET SELECTOR */}
          <div className="relative w-full lg:w-auto flex-1 lg:flex-none" ref={walletRef}>
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'wallet' ? null : 'wallet')}
              className={`w-full h-14 flex items-center justify-between gap-2 md:gap-4 px-3 md:px-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border transition-all duration-300 rounded-xl outline-none select-none active:scale-[0.98] ${
                activeDropdown === 'wallet' 
                  ? 'border-emerald-500/80 dark:border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-2 ring-emerald-500/10' 
                  : 'border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-emerald-500/40 dark:hover:border-emerald-400/40 hover:shadow-md hover:-translate-y-px'
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className={`flex p-1.5 md:p-2 rounded-lg shrink-0 shadow-inner ${
                  activeWallet === "All" ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 
                  isCurrentVirtual ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 
                  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {activeWallet === "All" ? <Coins size={14} className="md:w-4 md:h-4" /> : isCurrentVirtual ? <Zap size={14} className="md:w-4 md:h-4" /> : <Landmark size={14} className="md:w-4 md:h-4" />}
                </div>
                <div className="text-left truncate">
                  <span className="block text-[8px] md:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 leading-none">
                    Selected Wallet
                  </span>
                  <span className="block text-[11px] md:text-sm font-black text-slate-900 dark:text-white truncate max-w-20 sm:max-w-35 leading-none">
                    {currentWallet?.walletName}
                  </span>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

              <div className="text-right hidden sm:block min-w-20">
                <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 leading-none">
                  Net Balance
                </span>
                <span className={`block text-xs md:text-sm font-black truncate leading-none ${activeWallet === "All" ? 'text-amber-500' : isCurrentVirtual ? 'text-indigo-500' : 'text-emerald-500'}`}>
                  {isCurrentVirtual ? "LIVE SYNC" : `₹${activeDisplayBalance.toLocaleString('en-IN')}`}
                </span>
              </div>
              
              <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-300 md:ml-1 ${activeDropdown === 'wallet' ? 'rotate-180 text-emerald-500' : ''}`} />
            </button>

            {/* SMART POPOVER (Anchored Left, Fluid Width on Mobile) */}
            {activeDropdown === 'wallet' && (
              <div className="absolute top-[calc(100%+8px)] left-0 z-100 w-[calc(100vw-2.5rem)] sm:w-105 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-3xl rounded-2xl p-3 shadow-[0_10px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-slate-200/80 dark:border-slate-800/80 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-3 scrollbar-hide">
                  
                  <button
                    type="button"
                    onClick={() => { setActiveWallet("All"); setActiveDropdown(null); }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                      activeWallet === "All" 
                        ? 'bg-linear-to-r from-slate-900 to-slate-800 text-white dark:from-white dark:to-slate-100 dark:text-slate-900 shadow-md border-transparent' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${activeWallet === "All" ? 'bg-white/20 dark:bg-slate-300/50' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        <Briefcase size={14} className={activeWallet === "All" ? "text-white dark:text-slate-900" : "text-amber-500"} />
                      </div>
                      <div className="text-left">
                        <span className="block text-xs font-black uppercase tracking-wide">All Wallets</span>
                        <span className={`block text-[9px] font-bold uppercase tracking-widest mt-0.5 ${activeWallet === "All" ? 'text-slate-300 dark:text-slate-500' : 'text-slate-400'}`}>Unified Asset View</span>
                      </div>
                    </div>
                    {activeWallet === "All" && <Check size={16} strokeWidth={3} />}
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Cash Section */}
                    <div className="space-y-1.5 bg-slate-50/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                      <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest px-1 block mb-2 border-b border-emerald-100 dark:border-emerald-900/30 pb-1.5">Liquid Assets</span>
                      {sections.cash.map(w => (
                        <button
                          type="button" key={w._id} onClick={() => { setActiveWallet(w._id); setActiveDropdown(null); }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all border ${
                            activeWallet === w._id 
                              ? 'bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-500/40 shadow-sm text-emerald-700 dark:text-emerald-400' 
                              : 'border-transparent hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="truncate text-left pr-2 leading-tight">
                            <span className="block text-[10px] font-black uppercase truncate">{w.walletName}</span>
                            <span className={`block text-[9px] font-bold mt-1 ${activeWallet === w._id ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400'}`}>₹{w.balance?.toLocaleString('en-IN')}</span>
                          </div>
                          {activeWallet === w._id && <Check size={14} strokeWidth={3} className="shrink-0" />}
                        </button>
                      ))}
                    </div>

                    {/* Virtual Section */}
                    <div className="space-y-1.5 bg-slate-50/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                      <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest px-1 block mb-2 border-b border-indigo-100 dark:border-indigo-900/30 pb-1.5">Digital Nodes</span>
                      {sections.virtual.map(w => (
                        <button
                          type="button" key={w._id} onClick={() => { setActiveWallet(w._id); setActiveDropdown(null); }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all border ${
                            activeWallet === w._id 
                              ? 'bg-white dark:bg-slate-800 border-indigo-300 dark:border-indigo-500/40 shadow-sm text-indigo-700 dark:text-indigo-400' 
                              : 'border-transparent hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="truncate text-left pr-2 leading-tight">
                            <span className="block text-[10px] font-black uppercase truncate">{w.walletName}</span>
                            <span className={`block text-[9px] font-bold mt-1 ${activeWallet === w._id ? 'text-indigo-600 dark:text-indigo-500' : 'text-slate-400'}`}>Live Sync</span>
                          </div>
                          {activeWallet === w._id && <Check size={14} strokeWidth={3} className="shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. DATE SELECTOR */}
          <div className="relative w-full lg:w-auto flex-1 lg:flex-none" ref={dateRef}>
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
              className={`w-full h-14 flex items-center justify-between gap-2 md:gap-4 px-3 md:px-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border transition-all duration-300 rounded-xl outline-none select-none active:scale-[0.98] ${
                activeDropdown === 'date' 
                  ? 'border-emerald-500/80 dark:border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-2 ring-emerald-500/10' 
                  : 'border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-emerald-500/40 dark:hover:border-emerald-400/40 hover:shadow-md hover:-translate-y-px'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex p-1.5 md:p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 shadow-inner">
                  <Calendar size={14} className="md:w-4 md:h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-[8px] md:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 leading-none">
                    Timeline
                  </span>
                  <span className="block text-[11px] md:text-sm font-black text-slate-900 dark:text-white whitespace-nowrap leading-none">
                    {months[selectedMonth]} {selectedYear}
                  </span>
                </div>
              </div>
              <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-300 md:ml-1 ${activeDropdown === 'date' ? 'rotate-180 text-emerald-500' : ''}`} />
            </button>

            {/* SMART POPOVER (Anchored Right, Fluid Width on Mobile) */}
            {activeDropdown === 'date' && (
              <div className="absolute top-[calc(100%+8px)] right-0 z-100 w-[calc(100vw-2.5rem)] sm:w-[320px] bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-3xl rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-slate-200/80 dark:border-slate-800/80 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                
                <div className="flex gap-1.5 bg-slate-100/80 dark:bg-slate-900 p-1.5 rounded-xl mb-4 border border-slate-200/50 dark:border-slate-800">
                  {years.map(y => (
                    <button 
                      type="button" key={y} onClick={() => setSelectedYear(y)} 
                      className={`flex-1 py-2 text-[10px] md:text-[11px] font-black rounded-lg transition-all ${
                        selectedYear === y 
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-transparent' 
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-1.5 max-h-[40vh] overflow-y-auto">
                  {months.map((m, i) => (
                    <button 
                      type="button" key={m} onClick={() => { setSelectedMonth(i); setActiveDropdown(null); }} 
                      className={`py-3 text-[10px] md:text-[11px] font-black rounded-xl transition-all ${
                        selectedMonth === i 
                          ? 'bg-linear-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                          : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default HistoryCommandCenter;