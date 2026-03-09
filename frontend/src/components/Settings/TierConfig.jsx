import React from 'react';
import { Info } from 'lucide-react';

const TierConfig = ({ thresholds, setThresholds }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
    <header className="mb-12">
      <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Tier Thresholds</h3>
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">Set AUM limits for Wealth Elite Categorization</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {Object.entries(thresholds).map(([tier, value]) => (
        <div key={tier} className="group">
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1 first-letter:uppercase">
            {tier} Tier (₹ Crores)
          </label>
          <div className="relative">
            <input 
              type="number"
              value={value}
              onChange={(e) => setThresholds({...thresholds, [tier]: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-5 text-lg font-black text-slate-800 dark:text-slate-100 outline-none focus:border-amber-600 transition-all"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase">Cr</div>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-12 p-8 bg-amber-50 dark:bg-amber-900/10 rounded-4xl border border-amber-100 dark:border-amber-900/20 flex gap-5 items-start">
      <Info className="text-amber-600 mt-1" size={20} />
      <div>
        <p className="text-xs font-bold text-amber-900 dark:text-amber-400 uppercase tracking-tight mb-1">Impact Analysis</p>
        <p className="text-[11px] font-medium text-amber-800/70 dark:text-amber-500/70 leading-relaxed">
          Adjusting these values will re-classify all families in your directory immediately.
        </p>
      </div>
    </div>
  </div>
);

export default TierConfig;