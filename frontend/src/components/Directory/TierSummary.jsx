import React from 'react';

const TierSummary = ({ families, activeTier, thresholds }) => {
  // 1. DYNAMIC STATS CALCULATION
  // We use the thresholds to determine the label, but calculate totals here
  const totalAum = families.reduce((acc, f) => acc + (f.familyAum || 0), 0);
  
  const stats = families.reduce((acc, f) => {
    const cat = f.category || 'Other';
    if (!acc[cat]) acc[cat] = { count: 0, aum: 0 };
    acc[cat].count += 1;
    acc[cat].aum += (f.familyAum || 0);
    return acc;
  }, {});

  const tiers = [
    { label: 'Diamond', color: 'bg-cyan-500', text: 'text-cyan-600 dark:text-cyan-400', limit: thresholds?.diamond },
    { label: 'Gold', color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-500', limit: thresholds?.gold },
    { label: 'Silver', color: 'bg-slate-400', text: 'text-slate-500 dark:text-slate-400', limit: thresholds?.silver },
    { label: 'Bronze', color: 'bg-orange-400', text: 'text-orange-500 dark:text-orange-400', limit: thresholds?.bronze }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 mb-6 transition-colors duration-300">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">Portfolio Snapshot</h3>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            ₹{(totalAum / 10000000).toFixed(2)} <span className="text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Cr Total Business</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Total Families</p>
          <p className="text-xl font-black text-slate-700 dark:text-slate-300">{families.length}</p>
        </div>
      </div>

      <div className="relative">
        {/* Progress Bar Track */}
        <div className="flex h-6 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-50 dark:border-slate-700 shadow-inner">
          {tiers.map(tier => {
            const width = totalAum > 0 ? (stats[tier.label]?.aum / totalAum) * 100 : 0;
            const isActive = activeTier === tier.label;
            
            return (
              <div 
                key={tier.label} 
                style={{ width: `${width}%` }} 
                className={`
                  ${tier.color} transition-all duration-700 ease-out flex items-center justify-center relative group
                  ${isActive ? 'animate-pulse ring-2 ring-white/50 dark:ring-white/30 ring-inset shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'opacity-90'}
                `}
              >
                {width > 8 && (
                  <span className={`text-[9px] font-black uppercase tracking-tighter pointer-events-none ${isActive ? 'text-white scale-110' : 'text-white/80'}`}>
                    {width.toFixed(0)}%
                  </span>
                )}
                {/* Tooltip now shows the dynamic limit too */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 dark:bg-slate-700 text-white text-[9px] font-bold py-1 px-2 rounded whitespace-nowrap z-20 border dark:border-slate-600 shadow-xl">
                  {tier.label} ({tier.limit ? `>${tier.limit}Cr` : ''}): ₹{(stats[tier.label]?.aum / 10000000).toFixed(2)} Cr
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend Grid */}
      <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
        {tiers.map(tier => (
          <div 
            key={tier.label} 
            className={`flex items-center gap-3 transition-opacity duration-300 ${activeTier !== 'All' && activeTier !== tier.label ? 'opacity-30' : 'opacity-100'}`}
          >
            <div className={`w-1.5 h-6 rounded-full ${tier.color} ${activeTier === tier.label ? 'ring-2 ring-offset-1 ring-slate-200 dark:ring-slate-700 dark:ring-offset-slate-900' : ''}`} />
            <div>
              <div className="flex items-center gap-2">
                <p className={`text-[9px] font-black uppercase tracking-widest ${tier.text}`}>
                  {tier.label}
                </p>
                {tier.limit && (
                  <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tabular-nums">
                    &gt; {tier.limit}Cr
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">
                {stats[tier.label]?.count || 0} <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Families</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TierSummary;