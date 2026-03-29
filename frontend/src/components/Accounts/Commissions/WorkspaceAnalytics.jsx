import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, PieChart, Trophy, Calendar, Zap, Loader2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi'; // Ensure correct path

const WorkspaceAnalytics = ({ arnId }) => {
  const [data, setData] = useState(null);
  const { request, loading: apiLoading } = useApi();
  const [isSyncing, setIsSyncing] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!arnId) return;
    
    setIsSyncing(true);
    try {
      // useApi handles production URL and Auth automatically
      const json = await request(`/commissions/workspace-analytics/${arnId}`);
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Analytics Sync Error:", err);
      // We don't toast here to avoid spamming the UI if data is just missing
    } finally {
      setIsSyncing(false);
    }
  }, [arnId, request]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) await fetchAnalytics();
    };

    loadData();

    return () => { isMounted = false; };
  }, [fetchAnalytics]);

  const isLoading = isSyncing || apiLoading;

  if (isLoading && !data) return (
    <div className="h-64 flex flex-col items-center justify-center gap-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
      <Loader2 className="animate-spin text-emerald-500/40" size={32} />
      <div className="text-slate-400 font-black uppercase tracking-[0.3em] text-[9px]">Analyzing Revenue Data...</div>
    </div>
  );

  // Fallback for no data
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-in fade-in duration-700">
      
      {/* 1. Tactical KPI Sidebar */}
      <div className="lg:col-span-1 space-y-3">
        {[
          { label: 'Avg Monthly', val: data.stats.avgMonthly, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Cumulative', val: data.stats.allTimeTotal, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/5' },
          { label: 'Total Periods', val: data.stats.monthCount, icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/5' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-lg flex items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon size={18} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{stat.label}</p>
              <p className="text-lg font-[1000] text-slate-900 dark:text-white leading-tight">
                {typeof stat.val === 'number' && stat.val > 999 ? `₹${(stat.val/1000).toFixed(1)}K` : stat.val}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Revenue Trend Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg">
            <TrendingUp size={16} strokeWidth={3} />
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Revenue Performance (12M)</h4>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
                cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid #f1f5f9', 
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                  backgroundColor: '#fff', 
                  padding: '10px' 
                }}
                itemStyle={{ fontSize: '10px', fontWeight: 900, color: '#0f172a' }}
                labelStyle={{ fontSize: '8px', fontWeight: 800, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'NET PAYOUT']}
              />
              <Area 
                type="monotone" 
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

      {/* 3. AMC Distribution */}
      <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg">
            <PieChart size={16} strokeWidth={3} />
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Distribution</h4>
        </div>

        <div className="space-y-4">
          {data.amcBreakdown && data.amcBreakdown.length > 0 ? (
            data.amcBreakdown.slice(0, 5).map((amc, idx) => (
              <div key={idx} className="relative">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300 truncate pr-2">
                    {amc._id.split(' ')[0]}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">
                    {data.stats.allTimeTotal > 0 ? ((amc.value / data.stats.allTimeTotal) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${data.amcBreakdown[0]?.value > 0 ? (amc.value / data.amcBreakdown[0].value) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center">
               <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">No breakdown available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceAnalytics;