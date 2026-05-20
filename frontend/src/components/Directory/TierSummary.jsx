import React from 'react';

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

  // Helper to format Crore/Lakh values
  const formatLimit = (val) => {
    if (val === undefined || val === null) return '0';
    return val < 1 ? `${Math.round(val * 100)}L` : `${val}Cr`;
  };

  const tiers = [
    { label: 'Diamond', color: 'bg-cyan-500', text: 'text-cyan-600 dark:text-cyan-400', range: `> ${formatLimit(thresholds.diamond)}` },
    { label: 'Gold', color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-500', range: `${formatLimit(thresholds.gold)} - ${formatLimit(thresholds.diamond)}` },
    { label: 'Silver', color: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-400', range: `${formatLimit(thresholds.silver)} - ${formatLimit(thresholds.gold)}` },
    { label: 'Bronze', color: 'bg-orange-400', text: 'text-orange-500 dark:text-orange-400', range: `< ${formatLimit(thresholds.silver)}` }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200 dark:border-slate-800 p-5 md:p-6 animate-in fade-in duration-500">
      
      {/* --- HEADER INFO --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-5 md:mb-6">
        <div>
          <h3 className="text-[10px] md:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none mb-1.5 md:mb-2">
            Portfolio Snapshot
          </h3>
          <p className="text-3xl md:text-4xl font-[1000] text-slate-900 dark:text-white tracking-tight leading-none">
            ₹{(totalAum / 10000000).toFixed(2)} <span className="text-xs md:text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Cr Total Business</span>
          </p>
        </div>
        
        {/* Mobile: Formats as a sleek inline row card. Desktop: Clean right-aligned text */}
        <div className="flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto bg-slate-50 dark:bg-slate-800/50 sm:bg-transparent sm:dark:bg-transparent p-3 sm:p-0 rounded-xl border border-slate-100 dark:border-slate-700/50 sm:border-transparent sm:dark:border-transparent">
          <p className="text-[10px] md:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-0 sm:mb-1.5">
            Total Families
          </p>
          <p className="text-xl md:text-2xl font-[1000] text-slate-700 dark:text-slate-200 leading-none">
            {families.length}
          </p>
        </div>
      </div>

      {/* --- PROGRESS BAR TRACK --- */}
      <div className="relative mt-5">
        <div className="flex h-5 md:h-6 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800/80 shadow-inner">
          {tiers.map(tier => {
            const width = totalAum > 0 ? (stats[tier.label]?.aum / totalAum) * 100 : 0;
            const isActive = activeTier === tier.label;
            
            return (
              <div 
                key={tier.label} 
                style={{ width: `${width}%` }} 
                className={`
                  ${tier.color} transition-all duration-700 ease-out flex items-center justify-center relative group
                  ${isActive ? 'shadow-[inset_0_0_12px_rgba(255,255,255,0.4)] ring-1 ring-white/50' : 'opacity-90 border-r border-white/20 dark:border-slate-900/40 last:border-0'}
                `}
              >
                {width > 8 && (
                  <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-tighter pointer-events-none ${isActive ? 'text-white' : 'text-white/80'}`}>
                    {width.toFixed(0)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- PRIMARY STATS GRID --- */}
      {/* Mobile: 2x2 Grid. Desktop: 4-column row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-6">
        {tiers.map(tier => (
          <div 
            key={`stat-${tier.label}`} 
            className={`flex items-center gap-3 transition-opacity duration-300 ${activeTier !== 'All' && activeTier !== tier.label ? 'opacity-30' : 'opacity-100'}`}
          >
            <div className={`w-1.5 h-7 md:h-8 rounded-full ${tier.color}`} />
            <div className="flex flex-col justify-center">
              <p className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest mb-0.5 leading-none ${tier.text}`}>
                {tier.label}
              </p>
              <p className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-200 leading-none mt-1">
                {stats[tier.label]?.count || 0} <span className="text-[10px] md:text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Families</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* --- RANGE LEGEND --- */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Tier Definitions
        </span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 md:gap-6">
          {tiers.map(tier => (
            <div key={`legend-${tier.label}`} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${tier.color} opacity-80`} />
              <span className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-tight">
                <span className={`uppercase mr-1.5 font-black ${tier.text}`}>{tier.label}</span> 
                {tier.range}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default TierSummary;