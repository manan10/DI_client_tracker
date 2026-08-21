import React, { useState, useEffect, useCallback } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { TrendingUp, BarChart3, Trophy, Calendar, Zap, Loader2, AlertCircle, CircleDot, Building2 } from 'lucide-react';
import { useApi } from '../../../hooks/useApi';

const THEME_COLORS = ['#10b981', '#3b82f6', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

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
    const name = item.payload?.fullName || item.payload?.name || item.payload?.month || label;
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
          {item.payload?.percentage && (
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              {item.payload.percentage}
            </span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const WorkspaceAnalytics = ({ arnId, fiscalYear }) => {
  const [data, setData] = useState(null);
  const { request, loading: apiLoading } = useApi();
  const [isSyncing, setIsSyncing] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!arnId) return;
    setIsSyncing(true);
    try {
      const json = await request(`/commissions/workspace-analytics/${arnId}?fiscalYear=${fiscalYear}`);
      if (json.success) setData(json.data);
    } catch (err) {
      console.error("Analytics Sync Error:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [arnId, fiscalYear, request]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if ((isSyncing || apiLoading) && !data) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-white/10">
        <Loader2 className="animate-spin text-emerald-600 dark:text-emerald-400" size={24} />
        <p className="text-xs text-slate-400 dark:text-slate-500 font-mono font-semibold uppercase tracking-wider">
          Compiling Workspace Metrics...
        </p>
      </div>
    );
  }

  if (!data || !data.amcBreakdown || data.amcBreakdown.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center gap-2.5 bg-white dark:bg-[#0B1120] rounded-xl border border-dashed border-slate-200 dark:border-white/10 p-6 text-center">
        <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-400">
          <AlertCircle size={20} />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          No Analytics Recorded for FY {fiscalYear}
        </p>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 max-w-sm">
          Log monthly statements in this workspace to inspect payout momentum and AMC revenue breakdown.
        </span>
      </div>
    );
  }

  const allTimeTotal = data?.stats?.allTimeTotal || 0;
  const sortedAmcs = (data?.amcBreakdown || [])
    .filter(amc => (amc.value || 0) > 0)
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  const maxAmcVal = sortedAmcs.length > 0 ? sortedAmcs[0].value || 1 : 1;

  const amcStemData = sortedAmcs.map((amc, idx) => {
    const raw = amc._id || 'Other';
    const short = raw.replace(/Mutual Fund|MF|Asset Management/gi, '').trim();
    return {
      name: short,
      fullName: raw,
      value: amc.value || 0,
      percentage: allTimeTotal > 0 ? `${(((amc.value || 0) / allTimeTotal) * 100).toFixed(1)}%` : '0%',
      color: THEME_COLORS[idx % THEME_COLORS.length]
    };
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* ======================================================== */}
      {/* 1. KEY PERFORMANCE INDICATOR METRIC TILES                */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* Metric 1: Monthly Average */}
        <div className="bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-white/10 p-4 sm:p-5 rounded-xl shadow-xs flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Monthly Run-Rate
            </span>
            <p className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white tabular-nums tracking-tight mt-0.5">
              {formatINR(data.stats.avgMonthly)}
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Average Yield / Period
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Calendar size={18} strokeWidth={2.2} />
          </div>
        </div>

        {/* Metric 2: FY Gross Total */}
        <div className="bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-white/10 p-4 sm:p-5 rounded-xl shadow-xs flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              FY {fiscalYear} Cumulative
            </span>
            <p className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white tabular-nums tracking-tight mt-0.5">
              {formatINR(data.stats.allTimeTotal)}
            </p>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
              Total Accrued Revenue
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Trophy size={18} strokeWidth={2.2} />
          </div>
        </div>

        {/* Metric 3: Logged Periods */}
        <div className="bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-white/10 p-4 sm:p-5 rounded-xl shadow-xs flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Recorded Periods
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
                {data.stats.monthCount || 0}
              </span>
              <span className="text-xs font-bold text-slate-400 font-mono">/ 12 Cycles</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Audited Months
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <Zap size={18} strokeWidth={2.2} />
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 2. VISUAL ANALYTICS: TREND AREA & AMC STEM GRIDS         */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* CHART 1: MONTHLY PERFORMANCE TREND (AREA CHART) */}
        <div className="bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-white/10 p-5 rounded-xl shadow-xs flex flex-col justify-between h-90">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp size={16} strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Payout Trajectory
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Monthly brokerage momentum for FY {fiscalYear}
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 uppercase">
              Trend
            </span>
          </div>

          <div className="flex-1 min-h-0 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="emeraldWorkspaceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <filter id="workspaceGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#10b981" floodOpacity="0.3" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  tick={{ fontSize: 9, fill: '#64748b', fontWeight: 600 }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} 
                />
                <Tooltip content={<PremiumChartTooltip isCurrency={true} />} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  fill="url(#emeraldWorkspaceGradient)" 
                  filter="url(#workspaceGlow)"
                  activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500">
            <span>Points: {(data.trend || []).length} Cycles</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Total: {formatINR(data.stats.allTimeTotal)}
            </span>
          </div>
        </div>

        {/* CHART 2: AMC PORTFOLIO SHARE (STEM LOLLIPOP + DIRECTORY) */}
        <div className="bg-white dark:bg-[#0E1626] border border-slate-200/80 dark:border-white/10 p-5 rounded-xl shadow-xs flex flex-col justify-between h-90">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <BarChart3 size={16} strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  AMC Portfolio Share
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Revenue concentration by mutual fund house
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 uppercase">
              {amcStemData.length} AMCs
            </span>
          </div>

          {/* Stem Visual Track */}
          <div className="flex-1 min-h-0 w-full overflow-x-auto no-scrollbar flex items-end justify-between px-2 pt-5 pb-1 gap-2.5">
            {amcStemData.map((item, idx) => {
              const heightPct = Math.max(Math.round(((item.value || 0) / maxAmcVal) * 100), 14);
              return (
                <div 
                  key={idx} 
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer shrink-0 min-w-9 max-w-17.5"
                  title={`${item.fullName}: ${formatINR(item.value)} (${item.percentage})`}
                >
                  <span className="text-[8px] font-mono font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 select-none">
                    {item.percentage}
                  </span>

                  <div className="flex flex-col items-center w-full relative" style={{ height: `${heightPct}%` }}>
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white dark:border-[#0E1626] shadow-md flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-125 z-10"
                      style={{ backgroundColor: item.color }}
                    >
                      <CircleDot size={8} className="text-white" />
                    </div>

                    <div 
                      className="w-0.5 flex-1 opacity-75 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>

                  <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Multi-Column Itemized AMC Legend */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-x-3 gap-y-1.5 max-h-20 overflow-y-auto no-scrollbar">
            {amcStemData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                <div className="flex items-center gap-1.5 min-w-0 pr-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate" title={item.fullName}>
                    {item.fullName}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                  {item.percentage}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default WorkspaceAnalytics;