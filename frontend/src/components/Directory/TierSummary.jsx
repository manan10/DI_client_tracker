import React from 'react';
import { TrendingUp, Users, ShieldCheck } from 'lucide-react';

const TierSummary = ({ families, activeTier, thresholds }) => {
  // CRITICAL GUARD: Ensure we don't calculate on null data
  if (!thresholds || !families || families.length === 0) return null;

  // 1. DYNAMIC STATS CALCULATION
  const totalAum = families.reduce((acc, f) => acc + (f.familyAum || 0), 0);
  
  const stats = families.reduce((acc, f) => {
    const cat = f.category || 'Bronze';
    if (!acc[cat]) acc[cat] = { count: 0, aum: 0 };
    acc[cat].count += 1;
    acc[cat].aum += (f.familyAum || 0);
    return acc;
  }, {});

  // Helper to format Crore/Lakh values clearly
  const formatLimit = (val) => {
    if (val === undefined || val === null) return '0';
    return val < 1 ? `${Math.round(val * 100)}L` : `${val}Cr`;
  };

  const tiers = [
    { label: 'Diamond', color: 'bg-cyan-500', bgSoft: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', range: `> ${formatLimit(thresholds.diamond)}` },
    { label: 'Gold', color: 'bg-emerald-500', bgSoft: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-500', range: `${formatLimit(thresholds.gold)} - ${formatLimit(thresholds.diamond)}` },
    { label: 'Silver', color: 'bg-slate-400', bgSoft: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-300', range: `${formatLimit(thresholds.silver)} - ${formatLimit(thresholds.gold)}` },
    { label: 'Bronze', color: 'bg-orange-500', bgSoft: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', range: `< ${formatLimit(thresholds.silver)}` }
  ];

  return (
    <div className="w-full">
      
      {/* ========================================= */}
      {/* DESKTOP VERSION (Vertical Professional Rail) */}
      {/* ========================================= */}
      <div className="hidden lg:flex flex-col gap-5 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
        
        {/* Header Block */}
        <div className="flex flex-col gap-4 pb-5 border-b border-slate-200/60 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-500/20">
                <TrendingUp size={16} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                AUM Intelligence
              </span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-white/10">
              {activeTier === 'All' ? 'All Tiers' : activeTier}
            </span>
          </div>

          {/* Main Total Volume Box */}
          <div className="bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/10 rounded-lg p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              Total Business Volume
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-[1000] text-slate-900 dark:text-white tracking-tight leading-none font-mono">
                ₹{(totalAum / 10000000).toFixed(2)}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Crore
              </span>
            </div>
          </div>

          {/* Family Count Metadata */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/50 dark:bg-white/2 border border-slate-200/60 dark:border-white/5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <Users size={14} className="text-blue-500" strokeWidth={2.5} />
              Total Portfolios
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{families.length} Families</span>
          </div>
        </div>

        {/* Asset Share Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <span>Asset Distribution Share</span>
          </div>
          <div className="flex h-3 w-full rounded overflow-hidden bg-slate-100 dark:bg-white/5 gap-0.5 p-0.5 border border-slate-200 dark:border-white/10">
            {tiers.map(tier => {
              const width = totalAum > 0 ? (stats[tier.label]?.aum / totalAum) * 100 : 0;
              const isActive = activeTier === tier.label;
              if (width === 0) return null;
              return (
                <div 
                  key={tier.label} 
                  style={{ width: `${width}%` }} 
                  className={`${tier.color} transition-all duration-300 relative rounded-2xs ${isActive ? 'ring-2 ring-white dark:ring-slate-900 z-10' : 'opacity-90 hover:opacity-100'}`}
                  title={`${tier.label}: ${width.toFixed(1)}%`}
                />
              );
            })}
          </div>
        </div>

        {/* Vertical Executive Tier Blocks */}
        <div className="flex flex-col gap-3">
          {tiers.map(tier => {
            const tierStat = stats[tier.label] || { count: 0, aum: 0 };
            const isActive = activeTier === tier.label;
            const percentage = totalAum > 0 ? ((tierStat.aum / totalAum) * 100).toFixed(1) : 0;
            const tierAumCr = (tierStat.aum / 10000000).toFixed(2);

            return (
              <div 
                key={`stat-${tier.label}`} 
                className={`
                  flex flex-col p-3.5 rounded-lg border transition-all duration-200 gap-2.5 relative overflow-hidden
                  ${activeTier !== 'All' && !isActive ? 'opacity-30 grayscale-30' : 'opacity-100'}
                  ${isActive 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md' 
                    : 'bg-white dark:bg-white/2 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}
                `}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${tier.color}`} />
                
                <div className="flex justify-between items-center pl-1">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${isActive ? 'bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-900' : `${tier.bgSoft} ${tier.text}`}`}>
                    {tier.label}
                  </span>
                  <span className={`text-[11px] font-mono font-bold ${isActive ? 'text-slate-200 dark:text-slate-600' : 'text-slate-600 dark:text-slate-400'}`}>
                    {percentage}% Share
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pl-1 pt-2 border-t border-slate-200/40 dark:border-white/10 text-xs">
                  <div>
                    <span className={`block text-[9px] uppercase tracking-wider ${isActive ? 'text-slate-300 dark:text-slate-500' : 'text-slate-400'}`}>Families</span>
                    <span className="font-mono font-black text-sm">{tierStat.count}</span>
                  </div>
                  <div className="text-right">
                    <span className={`block text-[9px] uppercase tracking-wider ${isActive ? 'text-slate-300 dark:text-slate-500' : 'text-slate-400'}`}>AUM Vol</span>
                    <span className="font-mono font-black text-sm">₹{tierAumCr}Cr</span>
                  </div>
                </div>

                <div className={`pl-1 pt-1.5 border-t border-slate-200/40 dark:border-white/10 flex justify-between text-[10px] font-mono ${isActive ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>
                  <span>Limit:</span>
                  <span className="font-bold">{tier.range}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ========================================= */}
      {/* MOBILE VERSION (Ultra-Compact Horizontal Strip) */}
      {/* ========================================= */}
      <div className="lg:hidden flex flex-col gap-3 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 shadow-sm">
        
        {/* Top Mini Summary Row */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase">Total AUM:</span>
            <span className="text-base font-black font-mono text-slate-900 dark:text-white">
              ₹{(totalAum / 10000000).toFixed(2)}Cr
            </span>
          </div>
          <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">
            {families.length} Families
          </span>
        </div>

        {/* Horizontally Scrollable Micro-Cards */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {tiers.map(tier => {
            const tierStat = stats[tier.label] || { count: 0, aum: 0 };
            const isActive = activeTier === tier.label;
            const percentage = totalAum > 0 ? ((tierStat.aum / totalAum) * 100).toFixed(0) : 0;

            return (
              <div 
                key={`mobile-tier-${tier.label}`}
                className={`
                  flex flex-col justify-between shrink-0 w-32 p-2.5 rounded-lg border text-xs
                  ${isActive ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs' : 'bg-slate-50 dark:bg-white/2 border-slate-200 dark:border-white/10'}
                `}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider ${isActive ? 'text-white dark:text-slate-900' : tier.text}`}>
                    {tier.label}
                  </span>
                  <span className={`text-[9px] font-mono font-bold ${isActive ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400'}`}>
                    {percentage}%
                  </span>
                </div>
                <div>
                  <span className="text-sm font-black font-mono leading-none block">
                    {tierStat.count} <span className="text-[9px] font-normal opacity-75">Fam</span>
                  </span>
                  <span className={`text-[9px] font-mono mt-0.5 block ${isActive ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500'}`}>
                    ₹{(tierStat.aum / 10000000).toFixed(1)}Cr
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};

export default TierSummary;