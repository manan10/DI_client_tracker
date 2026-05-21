import React from 'react';
import { Landmark, CheckCircle2, MousePointerClick } from 'lucide-react';

const ARNCommissionCard = ({ arn, onClick, isActive }) => {
  const formatCurrency = (val) => {
    if (val >= 100000) return (val / 100000).toFixed(2);
    if (val >= 1000) return (val / 1000).toFixed(1);
    return val.toFixed(0);
  };

  const getUnit = (val) => {
    if (val >= 100000) return "L";
    if (val >= 1000) return "K";
    return "";
  };

  const formatMonth = (monthStr) => {
    if (!monthStr || monthStr === "N/A") return "Last Month";
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
  };

  return (
    <>
      {/* MOBILE COMPACT VIEW: Ultra-slim 2-row layout */}
      <button 
        onClick={() => onClick(arn)}
        className={`md:hidden w-full p-2 rounded-lg border-2 flex flex-col justify-between h-20 ${isActive ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-100'}`}
      >
        <div className="flex justify-between items-start">
            <span className="text-[8px] font-black uppercase truncate">{arn.nickname}</span>
            {isActive && <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />}
        </div>
        <div className="flex justify-between items-end">
            <div className="text-[7px] font-black text-slate-400 uppercase">{arn.name}</div>
            <div className="text-right">
                <p className="text-[10px] font-[1000] text-emerald-600">₹{formatCurrency(arn.totalFY)}{getUnit(arn.totalFY)}</p>
                <p className="text-[6px] font-black text-slate-400 uppercase">FY Total</p>
            </div>
        </div>
      </button>

      {/* DESKTOP ORIGINAL VIEW */}
      <button 
        onClick={() => onClick(arn)}
        className={`hidden md:block group relative w-full text-left transition-all duration-500 transform active:scale-[0.96]
          ${isActive 
            ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-500 shadow-xl shadow-emerald-500/10 -translate-y-1.5' 
            : 'bg-white dark:bg-slate-800 border-emerald-100 dark:border-slate-800 hover:border-emerald-400 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-500/5 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 shadow-sm'
          } 
          p-4 rounded-lg border-2 cursor-pointer outline-none overflow-hidden`}
      >
        <div className={`absolute -right-4 -top-4 w-20 h-20 blur-3xl rounded-lg transition-opacity duration-500
          ${isActive ? 'bg-emerald-500/20 opacity-100' : 'bg-emerald-500/10 opacity-0 group-hover:opacity-100'}`} 
        />
        {!isActive && (
          <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none z-20">
            <div className="flex items-center gap-1.5 bg-slate-900 dark:bg-emerald-500 px-2.5 py-1 rounded-full shadow-lg">
              <MousePointerClick size={8} className="text-white dark:text-slate-950 animate-bounce" />
              <span className="text-[7px] font-black text-white dark:text-slate-950 uppercase tracking-tighter">Enter</span>
            </div>
          </div>
        )}
        {isActive && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white rounded-full p-0.5 shadow-lg animate-in zoom-in spin-in-90 duration-500 z-20">
            <CheckCircle2 size={12} strokeWidth={4} />
          </div>
        )}
        <div className="flex flex-col gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`shrink-0 p-2.5 rounded-xl transition-all duration-500 
              ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 rotate-6' : 'bg-emerald-50 dark:bg-slate-700 text-emerald-700 dark:text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:rotate-6'}`}
            >
              <Landmark size={18} />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] leading-none mb-1">{arn.name}</h3>
              <p className={`text-base font-[1000] italic leading-tight truncate transition-colors duration-300 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-950 dark:text-white'}`}>
                {arn.nickname}
              </p>
            </div>
          </div>
          <div className={`flex items-end justify-between pt-3 border-t transition-colors duration-500 ${isActive ? 'border-emerald-200/50 dark:border-emerald-800/30' : 'border-slate-50 dark:border-slate-800/50'}`}>
            <div className="space-y-0.5">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">FY Total</p>
              <p className={`text-xl font-[1000] italic transition-all duration-300 ${isActive ? 'text-slate-950 dark:text-white scale-110 origin-left' : 'text-slate-900 dark:text-slate-100'}`}>
                ₹{formatCurrency(arn.totalFY)}<span className="text-[10px] opacity-40 uppercase font-black tracking-tighter ml-0.5">{getUnit(arn.totalFY)}</span>
              </p>
            </div>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all duration-500 ${isActive ? 'bg-emerald-500 text-white border-transparent shadow-md' : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:text-emerald-500'}`}>
               <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isActive ? 'bg-white' : 'bg-emerald-500'}`} />
               <span className="text-[8px] font-[1000] uppercase tracking-widest">{isActive ? 'ACTIVE' : 'LIVE'}</span>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${isActive ? 'bg-emerald-100/50 dark:bg-emerald-950/20 border-emerald-200/50' : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800/50'}`}>
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">{formatMonth(arn.lastMonthName)} Payout:</span>
            <p className={`text-[11px] font-[1000] italic ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-emerald-600 dark:text-emerald-500'}`}>₹{formatCurrency(arn.lastPayout)}{getUnit(arn.lastPayout)}</p>
          </div>
        </div>
      </button>
    </>
  );
};

export default ARNCommissionCard;