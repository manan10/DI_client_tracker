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

  // Converts absolute value to lakhs for clean display
  const displayTotal = currentTotal / 100000;
  const displayGrowth = Math.abs(growth) / 100000;

  const formatValue = (val) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <section className="w-full pt-4">
      <div className="bg-emerald-50/60 dark:bg-slate-300/10 backdrop-blur-xl rounded-lg border-2 border-emerald-100 dark:border-emerald-800/40 shadow-2xl overflow-hidden transition-all duration-500">
        
        {/* PREMIUM GOLDEN ACCENT BAR */}
        <div className="h-1.5 w-full bg-linear-to-r from-emerald-600 via-amber-400 to-transparent opacity-90" />
        
        <div className="p-8 md:p-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="flex-1 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/10 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em]">
                <Wallet size={12} strokeWidth={3} /> Live Treasury
              </span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
              {/* DISPLAYING VALUE IN LAKHS */}
              <h1 className="text-6xl md:text-7xl font-[1000] text-slate-950 dark:text-white tracking-tighter italic leading-none">
                ₹{formatValue(displayTotal)}
              </h1>
              <span className="text-emerald-700 dark:text-emerald-400 font-black text-xl tracking-tighter uppercase italic opacity-80">
                Lakhs Total
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-[11px] font-black tracking-widest border-2 shadow-sm ${
                isPositive 
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' 
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
              }`}>
                {isPositive ? <ArrowUpRight size={16} strokeWidth={3} /> : <TrendingDown size={16} strokeWidth={3} />}
                {isPositive ? 'SURGE' : 'DIP'} OF ₹{formatValue(displayGrowth)}L
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                vs. last snapshot
              </p>
            </div>
          </div>

          <div className="w-full lg:w-auto">
            <button 
              onClick={setIsEntryOpen}
              className={`w-full sm:w-auto px-12 py-5 rounded-lg font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-4 border-b-4 active:border-b-0 active:translate-y-1 shadow-xl ${
                isEntryOpen 
                  ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500' 
                  : 'bg-linear-to-br from-emerald-400 to-emerald-600 border-emerald-950 text-white hover:brightness-110'
              }`}
            >
              {isEntryOpen ? <X size={18} strokeWidth={4} /> : <Plus size={18} strokeWidth={4} />}
              {editingId ? "Cancel Edit" : isEntryOpen ? "Close Panel" : "Record Balances"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountHero;