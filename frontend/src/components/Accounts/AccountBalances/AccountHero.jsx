import React from 'react';
import { ArrowUpRight, TrendingDown, X, Plus, Terminal, Activity } from 'lucide-react';

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
    <div className="w-full pt-2 pb-10 mb-8 border-b border-slate-200/80 dark:border-white/10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 animate-in fade-in duration-500">
      
      {/* Editorial Headline & Financial Core */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-200/60 dark:border-emerald-500/20">
            <Activity size={12} strokeWidth={2.5} /> Total Balance
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            
          </span>
        </div>

        <div className="flex items-baseline gap-3">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-[1000] tracking-tighter text-slate-950 dark:text-white font-mono leading-none">
            ₹{formatValue(displayTotal)}
          </h1>
          <span className="text-sm font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Lakhs
          </span>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-mono font-black tracking-widest ${
            isPositive 
              ? 'bg-emerald-500 text-white dark:bg-emerald-500/20 dark:text-emerald-300 dark:border dark:border-emerald-500/30' 
              : 'bg-rose-500 text-white dark:bg-rose-500/20 dark:text-rose-300 dark:border dark:border-rose-500/30'
          }`}>
            {isPositive ? <ArrowUpRight size={14} strokeWidth={3} /> : <TrendingDown size={14} strokeWidth={3} />}
            {isPositive ? 'NET SURGE' : 'NET DIP'} : ₹{formatValue(displayGrowth)}L
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            vs. previous snapshot
          </span>
        </div>
      </div>

      {/* Modern Command Action Button */}
      <div className="w-full lg:w-auto shrink-0">
        <button 
          onClick={setIsEntryOpen}
          className={`
            w-full lg:w-auto px-7 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 outline-none cursor-pointer select-none shadow-sm
            ${
              isEntryOpen 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }
          `}
        >
          {isEntryOpen ? <X size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
          <span>{editingId ? "Cancel Edit" : isEntryOpen ? "Close Panel" : "Record Balances"}</span>
        </button>
      </div>

    </div>
  );
};

export default AccountHero;