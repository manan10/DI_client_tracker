import React from 'react';
import { Layers3, Building2, CalendarDays, Info, TrendingUp, CircleDot } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, 
  PieChart, Pie, Cell, CartesianGrid 
} from 'recharts';

const THEME_COLORS = ['#10b981', '#3b82f6', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e', '#84cc16'];

const formatINR = (val) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR'
  }).format(val || 0);
};

// 1. Premium Glassmorphic Tooltip
const PremiumChartTooltip = ({ active, payload, label, isCurrency = true }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const displayVal = isCurrency ? formatINR(item.value) : item.value;
    const name = item.payload?.fullName || item.payload?.name || label;
    const color = item.payload?.color || item.fill || item.color || '#10b981';

    return (
      <div className="bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border border-slate-200/90 dark:border-white/10 p-3 rounded-xl shadow-xl space-y-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 min-w-35">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <p className="font-bold text-slate-800 dark:text-slate-200 uppercase font-mono text-[10px] tracking-wider truncate">
            {name}
          </p>
        </div>
        <div className="flex items-baseline justify-between gap-3 pt-0.5">
          <span className="font-black font-mono text-slate-900 dark:text-white text-xs sm:text-sm">
            {displayVal}
          </span>
          {item.payload?.share && (
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              {item.payload.share}
            </span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// 2. High-Density Reusable Header
const ChartHeader = ({ Icon, title, subtitle, info, badgeText }) => (
  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
        <Icon size={16} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white truncate">
          {title}
        </h4>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
          {subtitle}
        </p>
      </div>
    </div>
    
    <div className="flex items-center gap-2 shrink-0">
      {badgeText && (
        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 uppercase">
          {badgeText}
        </span>
      )}
      <div className="group relative">
        <Info size={14} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-help transition-colors" />
        <div className="absolute right-0 bottom-full mb-1.5 w-52 bg-slate-900 dark:bg-slate-800 text-slate-200 text-[10px] p-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-slate-700 leading-tight">
          {info}
        </div>
      </div>
    </div>
  </div>
);

const GlobalRiskAnalysis = ({ data }) => {
  if (!data) return null;

  const { arnConcentration = [], seasonality = [], arnNicknameMap = {}, amcConcentration = [] } = data;

  // 1. ARN Data Prep
  const totalArnVal = arnConcentration.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const arnPieData = arnConcentration.map((arn, index) => {
    const rawName = arnNicknameMap[arn._id] || arn.nickname || 'Unknown';
    const share = totalArnVal > 0 ? `${((arn.value / totalArnVal) * 100).toFixed(1)}%` : '0%';
    return {
      name: rawName,
      fullName: rawName,
      value: arn.value,
      share,
      color: THEME_COLORS[index % THEME_COLORS.length]
    };
  });

  // 2. AMC Data Prep
  const totalAmcVal = amcConcentration.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const sortedAmcs = [...amcConcentration].sort((a, b) => (b.value || 0) - (a.value || 0));
  const maxAmcVal = sortedAmcs.length > 0 ? sortedAmcs[0].value || 1 : 1;

  const allAmcLollipops = sortedAmcs.map((amc, index) => {
    const raw = amc.name || 'Other';
    const short = raw.replace(/Mutual Fund|MF|Asset Management/gi, '').trim();
    return {
      name: short,
      fullName: raw,
      value: amc.value || 0,
      share: totalAmcVal > 0 ? `${((amc.value / totalAmcVal) * 100).toFixed(1)}%` : '0%',
      color: THEME_COLORS[index % THEME_COLORS.length]
    };
  });

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      
      {/* ======================================================== */}
      {/* ROW 1: 2-COLUMN GRID (ARN DONUT + MOMENTUM AREA CHART)    */}
      {/* ======================================================== */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* 1. ARN DISTRIBUTION DONUT CHART */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/10 rounded-xl p-5 shadow-xs flex flex-col justify-between h-90 relative overflow-hidden">
          <ChartHeader 
            Icon={Layers3} 
            title="ARN Distribution Mix" 
            subtitle="Revenue share per license" 
            info="Proportion of total gross brokerage generated by each contributing ARN entity." 
            badgeText={`${arnPieData.length} ARNs`}
          />

          <div className="flex-1 min-h-0 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.15" />
                  </filter>
                </defs>
                <Pie 
                  data={arnPieData} 
                  innerRadius={58} 
                  outerRadius={82} 
                  paddingAngle={4} 
                  dataKey="value" 
                  stroke="none"
                  filter="url(#donutShadow)"
                >
                  {arnPieData.map((e, i) => (
                    <Cell key={`donut-cell-${i}`} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip content={<PremiumChartTooltip isCurrency={true} />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Total Yield
              </span>
              <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                {formatINR(totalArnVal)}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5 max-h-20 overflow-y-auto no-scrollbar">
            {arnPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0 pr-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                    {item.name}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
                  {item.share}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. MONTHLY PAYOUT MOMENTUM AREA CHART */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/10 rounded-xl p-5 shadow-xs flex flex-col justify-between h-90">
          <ChartHeader 
            Icon={CalendarDays} 
            title="Payout Momentum" 
            subtitle="Monthly trajectory & velocity" 
            info="Monthly commission flow trajectory and seasonality trends across the active fiscal cycle." 
            badgeText="Trend"
          />

          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seasonality} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="emeraldAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <filter id="glowCurve" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#10b981" floodOpacity="0.3" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                  tickFormatter={(v) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(v, 10) - 1] || v} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#64748b', fontWeight: 600 }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} 
                />
                <Tooltip content={<PremiumChartTooltip isCurrency={true} />} />
                <Area 
                  type="monotone" 
                  dataKey="avgRevenue" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  fill="url(#emeraldAreaGradient)" 
                  filter="url(#glowCurve)"
                  activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500">
            <span>Data Points: {seasonality.length} Months</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={12} /> Active Trajectory
            </span>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* ROW 2: FULL-WIDTH TOP AMC HOUSES LOLLIPOP & LEGEND GRID  */}
      {/* ======================================================== */}
      <div className="w-full bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/10 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <ChartHeader 
          Icon={Building2} 
          title="Top Fund Houses" 
          subtitle="Proportional revenue contribution across all mutual fund houses" 
          info="Proportional stem analysis showing all active asset management companies contributing to gross brokerage yield." 
          badgeText={`${allAmcLollipops.length} Total AMCs`}
        />

        {/* Expansive Stem Chart Track (No Scrolling Needed on Large Screens) */}
        <div className="w-full h-48 flex items-end justify-between px-2 pt-6 pb-2 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          {allAmcLollipops.map((item, idx) => {
            const heightPct = Math.max(Math.round(((item.value || 0) / maxAmcVal) * 100), 12);
            return (
              <div 
                key={idx} 
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer min-w-10 max-w-22.5"
                title={`${item.fullName}: ${formatINR(item.value)} (${item.share})`}
              >
                {/* Value / Share Tag on Hover */}
                <span className="text-[9px] font-mono font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 select-none">
                  {item.share}
                </span>

                <div className="flex flex-col items-center w-full relative" style={{ height: `${heightPct}%` }}>
                  {/* Circular Node Head */}
                  <div 
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white dark:border-[#0B1120] shadow-md flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-125 z-10"
                    style={{ backgroundColor: item.color }}
                  >
                    <CircleDot size={10} className="text-white" />
                  </div>

                  {/* Vertical Stem Line */}
                  <div 
                    className="w-0.5 sm:w-1 flex-1 opacity-75 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: item.color }}
                  />
                </div>

                {/* Sub-label Under Stem */}
                <span className="text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-400 mt-2 truncate w-full text-center group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {item.name}
                </span>
              </div>
            );
          })}

          {allAmcLollipops.length === 0 && (
            <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
              No AMC records found for this cycle
            </div>
          )}
        </div>

        {/* Full-Width Multi-Column Complete AMC Directory (Zero Internal Scroll) */}
        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-2">
            {allAmcLollipops.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50/50 dark:bg-white/1.5 border border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                <div className="flex items-center gap-2 min-w-0 pr-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate" title={item.fullName}>
                    {item.fullName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">
                    {formatINR(item.value)}
                  </span>
                  <span className="font-mono text-[9px] font-semibold text-slate-400 dark:text-slate-500">
                    ({item.share})
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] font-mono text-slate-400 dark:text-slate-500">
            <span>Primary Revenue Driver: <strong className="text-slate-700 dark:text-slate-300 font-bold">{allAmcLollipops[0]?.fullName || 'N/A'}</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Yield: {formatINR(allAmcLollipops[0]?.value)} ({allAmcLollipops[0]?.share})</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default GlobalRiskAnalysis;