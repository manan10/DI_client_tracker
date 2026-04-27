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
    { label: 'Silver', color: 'bg-slate-400', text: 'text-slate-500 dark:text-slate-400', range: `${formatLimit(thresholds.silver)} - ${formatLimit(thresholds.gold)}` },
    { label: 'Bronze', color: 'bg-orange-400', text: 'text-orange-500 dark:text-orange-400', range: `< ${formatLimit(thresholds.silver)}` }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 p-5 mb-6 animate-in fade-in duration-500">
      
      {/* Header Info */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">Portfolio Snapshot</h3>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
            ₹{(totalAum / 10000000).toFixed(2)} <span className="text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Cr Total Business</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Total Families</p>
          <p className="text-xl font-black text-slate-700 dark:text-slate-300 leading-none">{families.length}</p>
        </div>
      </div>

      <div className="relative mt-5">
        {/* Progress Bar Track */}
        <div className="flex h-6 w-full rounded-sm overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-50 dark:border-slate-700 shadow-inner">
          {tiers.map(tier => {
            const width = totalAum > 0 ? (stats[tier.label]?.aum / totalAum) * 100 : 0;
            const isActive = activeTier === tier.label;
            
            return (
              <div 
                key={tier.label} 
                style={{ width: `${width}%` }} 
                className={`
                  ${tier.color} transition-all duration-700 ease-out flex items-center justify-center relative group
                  ${isActive ? 'ring-2 ring-white/50 ring-inset shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'opacity-90'}
                `}
              >
                {width > 8 && (
                  <span className={`text-[9px] font-black uppercase tracking-tighter pointer-events-none ${isActive ? 'text-white' : 'text-white/80'}`}>
                    {width.toFixed(0)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
        {tiers.map(tier => (
          <div 
            key={`stat-${tier.label}`} 
            className={`flex items-center gap-3 transition-opacity duration-300 ${activeTier !== 'All' && activeTier !== tier.label ? 'opacity-30' : 'opacity-100'}`}
          >
            <div className={`w-1.5 h-6 rounded-sm ${tier.color}`} />
            <div>
              <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${tier.text}`}>
                {tier.label}
              </p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-none">
                {stats[tier.label]?.count || 0} <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Families</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Range Legend */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap items-center justify-start gap-6">
        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Tier Definitions
        </span>
        {tiers.map(tier => (
          <div key={`legend-${tier.label}`} className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-sm ${tier.color} opacity-80`} />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-tight">
              <span className={`uppercase mr-1 ${tier.text}`}>{tier.label}</span> 
              {tier.range}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TierSummary;