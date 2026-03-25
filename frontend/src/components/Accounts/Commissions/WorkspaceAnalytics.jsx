import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, PieChart, Trophy, Calendar, Zap } from 'lucide-react';

const WorkspaceAnalytics = ({ arnId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/commissions/workspace-analytics/${arnId}`);
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err) {
        console.error("Analytics Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [arnId]);

  if (loading || !data) return (
    <div className="h-64 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      <div className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[9px]">Analyzing Revenue Data</div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-in fade-in duration-700">
      
      {/* 1. Tactical KPI Sidebar - Instant Visibility */}
      <div className="lg:col-span-1 space-y-3">
        {[
          { label: 'Avg Monthly', val: data.stats.avgMonthly, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Cumulative', val: data.stats.allTimeTotal, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/5' },
          { label: 'Total Months Recorded', val: data.stats.monthCount, icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/5' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-lg flex items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon size={18} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg font-[1000] text-slate-900 dark:text-white leading-tight">
                {typeof stat.val === 'number' && stat.val > 999 ? `₹${(stat.val/1000).toFixed(1)}K` : stat.val}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Revenue Trend Chart - High Contrast */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-sm relative">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.2} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}}
                tickFormatter={(str) => str.split('-')[1]} 
              />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
              <Tooltip 
                cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#fff', padding: '12px' }}
                itemStyle={{ fontSize: '11px', fontWeight: 900, color: '#0f172a' }}
                labelStyle={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'NET PAYOUT']}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#chartGradient)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. AMC Distribution - Condensed & Clean */}
      <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
            <PieChart size={16} strokeWidth={3} />
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Distribution</h4>
        </div>

        <div className="space-y-4">
          {data.amcBreakdown.slice(0, 6).map((amc, idx) => (
            <div key={idx} className="relative">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">
                  {amc._id.split(' ')[0]} {/* Shorter names for better scanability */}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  {((amc.value / data.stats.allTimeTotal) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                  style={{ width: `${(amc.value / data.amcBreakdown[0].value) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default WorkspaceAnalytics;