import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Calendar, ChevronDown, Sparkles, Check, Landmark, Globe, Briefcase, Coins, Zap
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
    <header className="w-full bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-white/10 pt-6 pb-6 relative z-50">
      
      {/* Expanded to max-w-7xl for full desktop utilization */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-end justify-between gap-5 relative z-10 min-w-0">
        
        {/* IDENTITY & TITLE */}
        <div className="shrink-0 flex flex-col min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 w-max mb-2">
            <Sparkles size={12} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
              Spending Archives
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[1000] uppercase tracking-tighter text-slate-900 dark:text-white leading-none truncate italic">
            Spending <span className="text-emerald-600 dark:text-emerald-500">History</span>
          </h1>
        </div>

        {/* STRUCTURED COMMAND STRIP */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto min-w-0">
          
          {/* 1. WALLET SELECTOR */}
          <div className="relative w-full sm:w-auto flex-1 sm:flex-none min-w-0" ref={walletRef}>
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'wallet' ? null : 'wallet')}
              className={`w-full h-14 flex items-center justify-between gap-3 px-3 sm:px-4 bg-white dark:bg-[#0B1120] border transition-all duration-200 rounded-lg outline-none select-none active:scale-[0.98] ${
                activeDropdown === 'wallet' 
                  ? 'border-emerald-500 dark:border-emerald-500 ring-1 ring-emerald-500 shadow-sm' 
                  : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden min-w-0">
                <div className={`flex p-2 rounded-md shrink-0 ${
                  activeWallet === "All" ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500' : 
                  isCurrentVirtual ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 
                  'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {activeWallet === "All" ? <Coins size={16} /> : isCurrentVirtual ? <Zap size={16} /> : <Landmark size={16} />}
                </div>
                <div className="text-left truncate min-w-0">
                  <span className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">
                    Selected Wallet
                  </span>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white truncate leading-none sm:max-w-40 lg:max-w-50">
                    {currentWallet?.walletName}
                  </span>
                </div>
              </div>
              
              {/* Restored Desktop Net Balance Display */}
              <div className="hidden sm:flex items-center gap-3 shrink-0 ml-2">
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                <div className="text-right min-w-20">
                  <span className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 leading-none">
                    Net Balance
                  </span>
                  <span className={`block text-sm font-black truncate leading-none ${activeWallet === "All" ? 'text-amber-600 dark:text-amber-500' : isCurrentVirtual ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-500'}`}>
                    {isCurrentVirtual ? "LIVE SYNC" : `₹${activeDisplayBalance.toLocaleString('en-IN')}`}
                  </span>
                </div>
              </div>

              <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-200 ml-1 ${activeDropdown === 'wallet' ? 'rotate-180 text-emerald-500' : ''}`} />
            </button>

            {/* WALLET POPOVER */}
            {activeDropdown === 'wallet' && (
              <div className="absolute top-[calc(100%+8px)] left-0 z-100 w-[calc(100vw-2rem)] sm:w-85 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 overflow-hidden">
                <div className="max-h-[50vh] overflow-y-auto p-2 space-y-2 custom-scroll">
                  
                  {/* Master View */}
                  <button
                    type="button"
                    onClick={() => { setActiveWallet("All"); setActiveDropdown(null); }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all border outline-none ${
                      activeWallet === "All" 
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm' 
                        : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${activeWallet === "All" ? 'bg-white/20 dark:bg-slate-200/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        <Briefcase size={14} className={activeWallet === "All" ? "text-white dark:text-slate-900" : ""} />
                      </div>
                      <div className="text-left">
                        <span className="block text-xs font-bold uppercase tracking-wide">All Wallets</span>
                        <span className={`block text-[9px] font-bold uppercase tracking-widest mt-0.5 ${activeWallet === "All" ? 'text-slate-300 dark:text-slate-500' : 'text-slate-400'}`}>Unified Asset View</span>
                      </div>
                    </div>
                    {activeWallet === "All" && <Check size={14} strokeWidth={3} />}
                  </button>

                  <div className="h-px w-full bg-slate-100 dark:bg-white/5 my-1" />

                  {/* Cash Nodes */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 block mb-1">Liquid Assets</span>
                    {sections.cash.map(w => (
                      <button
                        type="button" key={w._id} onClick={() => { setActiveWallet(w._id); setActiveDropdown(null); }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all outline-none ${
                          activeWallet === w._id 
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="truncate text-left pr-2">
                          <span className="block text-xs font-semibold truncate">{w.walletName}</span>
                        </div>
                        <span className={`text-xs font-bold shrink-0 ${activeWallet === w._id ? '' : 'text-slate-400'}`}>
                          ₹{w.balance?.toLocaleString('en-IN')}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="h-px w-full bg-slate-100 dark:bg-white/5 my-1" />

                  {/* Virtual Nodes */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 block mb-1">Digital Nodes</span>
                    {sections.virtual.map(w => (
                      <button
                        type="button" key={w._id} onClick={() => { setActiveWallet(w._id); setActiveDropdown(null); }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all outline-none ${
                          activeWallet === w._id 
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="truncate text-left pr-2">
                          <span className="block text-xs font-semibold truncate">{w.walletName}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest shrink-0 ${activeWallet === w._id ? '' : 'text-slate-400'}`}>
                          Live Sync
                        </span>
                      </button>
                    ))}
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* 2. DATE SELECTOR */}
          <div className="relative w-full sm:w-auto flex-1 sm:flex-none min-w-0" ref={dateRef}>
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
              className={`w-full sm:w-45 lg:w-50 h-14 flex items-center justify-between gap-3 px-3 sm:px-4 bg-white dark:bg-[#0B1120] border transition-all duration-200 rounded-lg outline-none select-none active:scale-[0.98] ${
                activeDropdown === 'date' 
                  ? 'border-emerald-500 dark:border-emerald-500 ring-1 ring-emerald-500 shadow-sm' 
                  : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex p-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                  <Calendar size={16} />
                </div>
                <div className="text-left truncate">
                  <span className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 leading-none">
                    Timeline
                  </span>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white truncate leading-none">
                    {months[selectedMonth]} {selectedYear}
                  </span>
                </div>
              </div>
              <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-200 ${activeDropdown === 'date' ? 'rotate-180 text-emerald-500' : ''}`} />
            </button>

            {/* DATE POPOVER */}
            {activeDropdown === 'date' && (
              <div className="absolute top-[calc(100%+8px)] right-0 z-100 w-[calc(100vw-2rem)] sm:w-70 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 overflow-hidden p-3">
                
                <div className="flex gap-1 bg-slate-100 dark:bg-[#0B1120] p-1 rounded-lg mb-3 border border-slate-200 dark:border-white/5">
                  {years.map(y => (
                    <button 
                      type="button" key={y} onClick={() => setSelectedYear(y)} 
                      className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all outline-none ${
                        selectedYear === y 
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-transparent' 
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {months.map((m, i) => (
                    <button 
                      type="button" key={m} onClick={() => { setSelectedMonth(i); setActiveDropdown(null); }} 
                      className={`py-2.5 text-xs font-bold rounded-lg transition-all outline-none ${
                        selectedMonth === i 
                          ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm' 
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
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