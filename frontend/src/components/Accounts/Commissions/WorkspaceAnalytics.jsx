import React, { useState, useEffect, useCallback } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, LabelList 
} from 'recharts';
import { TrendingUp, BarChart3, Trophy, Calendar, Zap, Loader2, AlertCircle } from 'lucide-react';
import { useApi } from '../../../hooks/useApi';

const WorkspaceAnalytics = ({ arnId, fiscalYear }) => {
  const [data, setData] = useState(null);
  const { request, loading: apiLoading } = useApi();
  const [isSyncing, setIsSyncing] = useState(true);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EF4444', '#64748B'];

  const fetchAnalytics = useCallback(async () => {
    if (!arnId) return;
    setIsSyncing(true);
    try {
      // FIXED: Passing fiscalYear as a query parameter to ensure data is scoped correctly
      const json = await request(`/commissions/workspace-analytics/${arnId}?fiscalYear=${fiscalYear}`);
      if (json.success) setData(json.data);
    } catch (err) {
      console.error("Analytics Sync Error:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [arnId, fiscalYear, request]); // Added fiscalYear to dependencies

  useEffect(() => {
    let isMounted = true;
    if (isMounted) fetchAnalytics();
    return () => { isMounted = false; };
  }, [fetchAnalytics]);

  if ((isSyncing || apiLoading) && !data) return (
    <div className="h-64 flex flex-col items-center justify-center gap-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
      <Loader2 className="animate-spin text-emerald-500/40" size={32} />
      <div className="text-slate-400 font-black uppercase tracking-[0.3em] text-[9px]">Analyzing Workspace Revenue...</div>
    </div>
  );

  if (!data || !data.amcBreakdown || data.amcBreakdown.length === 0) {
    return (
      <div className="h-32 flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
        <AlertCircle className="text-slate-300" size={20} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-4">
          No Revenue Data for FY {fiscalYear} <br/>
          <span className="text-[8px] opacity-50 tracking-normal">Select a different year or add records.</span>
        </p>
      </div>
    );
  }

  const chartData = data.amcBreakdown
    ?.filter(amc => amc.value > 0)
    .sort((a, b) => b.value - a.value)
    .map(amc => ({
      name: amc._id, 
      value: amc.value,
      percentage: data.stats.allTimeTotal > 0 
        ? ((amc.value / data.stats.allTimeTotal) * 100).toFixed(1) + '%'
        : '0%'
    })) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-in fade-in duration-700">
      
      {/* 1. Tactical KPI Sidebar */}
      <div className="lg:col-span-1 space-y-3">
        {[
          { label: 'Avg Monthly', val: data.stats.avgMonthly || 0, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/5', isCurrency: true },
          { label: `FY Total (${fiscalYear})`, val: data.stats.allTimeTotal || 0, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/5', isCurrency: true },
          { label: 'Months Recorded', val: data.stats.monthCount || 0, icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/5', isCurrency: false }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-lg flex items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon size={18} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{stat.label}</p>
              <p className="text-lg font-[1000] text-slate-900 dark:text-white leading-tight">
                {stat.isCurrency ? formatCurrency(stat.val) : stat.val}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Central Stepped Area Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg">
            <TrendingUp size={16} strokeWidth={3} />
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">FY {fiscalYear} Revenue Trend</h4>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.1} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}}
                tickFormatter={(str) => str.includes('-') ? str.split('-')[1] : str} 
              />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} />
              <Tooltip 
                cursor={{ stroke: '#10b981', strokeWidth: 1 }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#fff', padding: '10px' }}
                itemStyle={{ fontSize: '10px', fontWeight: 900, color: '#0f172a' }}
                labelStyle={{ fontSize: '8px', fontWeight: 800, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}
                formatter={(value) => [formatCurrency(value), 'PAYOUT']}
              />
              <Area 
                type="stepAfter" 
                dataKey="amount" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#chartGradient)" 
                activeDot={{ r: 5, strokeWidth: 0, fill: '#10b981' }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. AMC Contribution (Workspace-Specific) */}
      <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-lg shadow-sm flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg">
            <BarChart3 size={16} strokeWidth={3} />
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Portfolio Mix</h4>
        </div>

        <div className="flex-1 w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={chartData} margin={{ left: -20, right: 45 }}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }}
                width={80}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                formatter={(value) => formatCurrency(value)}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                ))}
                <LabelList 
                  dataKey="percentage" 
                  position="right" 
                  style={{ fontSize: '9px', fontWeight: 900, fill: '#94a3b8' }} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="pt-4 border-t border-slate-50 dark:border-slate-800 mt-2 text-center">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              Revenue split for FY {fiscalYear}
            </p>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceAnalytics;