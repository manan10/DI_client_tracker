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

  if ((isSyncing || apiLoading) && !data) return (
    <div className="h-64 flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
      <Loader2 className="animate-spin text-emerald-500/40" size={32} />
      <div className="text-slate-400 font-black uppercase tracking-[0.3em] text-[9px]">Analyzing Revenue...</div>
    </div>
  );

  if (!data || !data.amcBreakdown || data.amcBreakdown.length === 0) {
    return (
      <div className="h-32 flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
        <AlertCircle className="text-slate-300" size={20} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-4">No Data for FY {fiscalYear}</p>
      </div>
    );
  }

  const chartData = data.amcBreakdown
    ?.filter(amc => amc.value > 0)
    .sort((a, b) => b.value - a.value)
    .map(amc => ({
      name: amc._id, 
      value: amc.value,
      percentage: data.stats.allTimeTotal > 0 ? ((amc.value / data.stats.allTimeTotal) * 100).toFixed(1) + '%' : '0%'
    })) || [];

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-700">
      
      {/* 1. KPI Stats - Vertical Grid on Mobile, 3-col on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Avg Monthly', val: data.stats.avgMonthly || 0, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: `FY Total`, val: data.stats.allTimeTotal || 0, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/5' },
          { label: 'Months', val: data.stats.monthCount || 0, icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/5' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 p-4 rounded-lg flex items-center gap-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon size={18} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase">{stat.label}</p>
              <p className="text-sm font-[1000] text-slate-900">{typeof stat.val === 'number' && stat.val > 1000 ? formatCurrency(stat.val) : stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Charts Stack - Vertical stacking for mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trend Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 p-4 rounded-lg shadow-sm h-64">
          <h4 className="text-[9px] font-black uppercase text-slate-500 mb-4 flex items-center gap-2"><TrendingUp size={12}/> Trend</h4>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={data.trend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis dataKey="month" hide />
              <Tooltip formatter={(v) => [formatCurrency(v), 'PAYOUT']} />
              <Area type="stepAfter" dataKey="amount" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio Mix Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 p-4 rounded-lg shadow-sm h-64">
          <h4 className="text-[9px] font-black uppercase text-slate-500 mb-4 flex items-center gap-2"><BarChart3 size={12}/> Portfolio Mix</h4>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart layout="vertical" data={chartData} margin={{ left: -20, right: 30 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tick={{fontSize: 8, fontWeight: 900}} width={60} axisLine={false} tickLine={false} />
              <Bar dataKey="value" barSize={10} radius={[0, 4, 4, 0]}>
                {chartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceAnalytics;