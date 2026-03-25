import React from 'react';
import { TrendingUp, CalendarDays, Layers3, Building2, Info, CheckCircle2 } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ChartHeader = ({ icon: Icon, title, subtitle, info }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-50 dark:bg-slate-600 text-slate-600 dark:text-slate-400 rounded-xl border border-slate-100 dark:border-slate-700">
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-0.5">{title}</h4>
        <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">{subtitle}</p>
      </div>
    </div>
    <div className="group relative">
      <Info size={14} className="text-slate-300 dark:text-slate-600 cursor-help hover:text-emerald-500 transition-colors" />
      <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-900 dark:bg-slate-600 text-white text-[8px] p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-slate-700">
        {info}
      </div>
    </div>
  </div>
);

const GlobalRiskAnalysis = ({ data }) => {
  if (!data) return null;

  const { arnConcentration = [], seasonality = [], summary = {}, arnNicknameMap = {}, amcConcentration = [] } = data;
  const totalRevenue = summary?.totalEnterpriseRevenue || 0;

  const arnPieData = arnConcentration.map((arn, index) => ({
    name: arnNicknameMap[arn._id] || arn.nickname || 'Unknown',
    value: arn.value,
    color: COLORS[index % COLORS.length]
  }));

  const amcBarData = amcConcentration.map((amc, index) => ({
    name: amc.name || 'Other',
    displayName: amc.name && amc.name.length > 12 ? amc.name.substring(0, 10) + ".." : amc.name,
    value: amc.value,
    fill: COLORS[(index + 1) % COLORS.length]
  }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6 pb-12">
      
      {/* 1. ARN DISTRIBUTION (DONUT) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col h-110">
        <ChartHeader 
          icon={Layers3} 
          title="License Mix" 
          subtitle="Yield per ARN" 
          info="Breakdown of total revenue across all family licenses for the selected cycle." 
        />
        <div className="flex-1 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={arnPieData} innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none">
                {arnPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(v) => `₹${Math.round(v).toLocaleString('en-IN')}`} 
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '15px', color: '#64748b' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12">
            <span className="text-[12px] font-black text-slate-400 dark:text-slate-500 uppercase leading-none">Total</span>
            <span className="text-sm font-[1000] text-slate-900 dark:text-white italic">₹{(totalRevenue/100000).toFixed(1)}L</span>
          </div>
        </div>
      </div>

      {/* 2. AMC DISTRIBUTION (BAR CHART) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col h-110">
        <ChartHeader 
          icon={Building2} 
          title="Top Fund Houses" 
          subtitle="Revenue Partners" 
          info="Top AMCs contributing to the total yield. Based on nested entry amounts." 
        />
        <div className="flex-1">
          {amcBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={amcBarData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="displayName" type="category" tick={{fontSize: 8, fontWeight: 900, fill: '#64748b'}} width={80} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}} 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(v, n, p) => [`₹${Math.round(v).toLocaleString('en-IN')}`, p.payload.name]} 
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={16}>
                  {amcBarData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-[10px] uppercase font-black text-slate-300 dark:text-slate-700">No partner data</div>
          )}
        </div>
      </div>

      {/* 3. SEASONALITY (AREA CHART) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col h-110">
        <ChartHeader 
          icon={CalendarDays} 
          title="Seasonality" 
          subtitle="Monthly Momentum" 
          info="Average historical performance for each month in the fiscal cycle." 
        />
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={seasonality} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 8, fontWeight: 900, fill: '#94a3b8'}} 
                tickFormatter={(v) => ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][parseInt(v)-1]} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(v) => `₹${Math.round(v).toLocaleString('en-IN')}`} 
              />
              <Area type="monotone" dataKey="avgRevenue" stroke="#10b981" strokeWidth={3} fill="url(#emeraldGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GlobalRiskAnalysis;