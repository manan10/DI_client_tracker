import React from 'react';
import { ArrowUpRight, TrendingDown, X, Plus, Wallet } from 'lucide-react';

const AccountHero = ({ 
  currentTotal = 0, 
  growth = 0, 
  isEntryOpen, 
  setIsEntryOpen, 
  editingId, 
}) => {
  const isPositive = growth >= 0;

  const displayTotal = currentTotal / 100000;
  const displayGrowth = Math.abs(growth) / 100000;

  const formatValue = (val) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <section className="w-full pt-2">
      <div className="bg-emerald-50/60 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-emerald-100 dark:border-emerald-900/30 shadow-xl overflow-hidden transition-all duration-500">
        
        {/* PREMIUM GOLDEN ACCENT BAR */}
        <div className="h-1.5 w-full bg-linear-to-r from-emerald-600 via-amber-400 to-transparent opacity-90" />
        
        <div className="p-6 md:p-10 lg:p-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          
          <div className="flex-1 space-y-4 md:space-y-6 w-full">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600/10 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 text-[9px] font-black uppercase tracking-[0.2em]">
                <Wallet size={10} strokeWidth={3} /> Live Treasury
              </span>
            </div>
            
            <div className="flex flex-col gap-1">
              {/* TYPOGRAPHY FIX: text-5xl on mobile, text-7xl on desktop */}
              <h1 className="text-5xl md:text-7xl font-[1000] text-slate-950 dark:text-white tracking-tighter italic leading-none wrap-break-word">
                ₹{formatValue(displayTotal)}
              </h1>
              <span className="text-emerald-700 dark:text-emerald-400 font-black text-lg md:text-xl tracking-tighter uppercase italic opacity-80">
                Lakhs Total
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest border-2 shadow-sm ${
                isPositive 
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' 
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
              }`}>
                {isPositive ? <ArrowUpRight size={14} strokeWidth={3} /> : <TrendingDown size={14} strokeWidth={3} />}
                {isPositive ? 'SURGE' : 'DIP'} OF ₹{formatValue(displayGrowth)}L
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">
                vs. last snapshot
              </p>
            </div>
          </div>

          <div className="w-full lg:w-auto">
            <button 
              onClick={setIsEntryOpen}
              className={`w-full lg:w-auto px-8 py-4 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] ${
                isEntryOpen 
                  ? 'bg-white dark:bg-slate-700 border-b-4 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300' 
                  : 'bg-linear-to-br from-emerald-500 to-emerald-600 border-b-4 border-emerald-800 text-white hover:brightness-110'
              }`}
            >
              {isEntryOpen ? <X size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
              {editingId ? "Cancel Edit" : isEntryOpen ? "Close Panel" : "Record Balances"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountHero;