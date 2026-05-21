import React, { useState } from 'react';
import { Layers3, Building2, CalendarDays, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Renamed prop to Icon to satisfy linting
const ChartHeader = ({ Icon, title, subtitle, info }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-50 dark:bg-slate-600 text-slate-600 dark:text-slate-400 rounded-xl border border-slate-100 dark:border-slate-700">
        {/* Rendered correctly here */}
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
  const [showCharts, setShowCharts] = useState(false);
  
  if (!data) return null;

  const { arnConcentration = [], seasonality = [], arnNicknameMap = {}, amcConcentration = [] } = data;

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
    <div className="mt-6 pb-12">
      <button 
        onClick={() => setShowCharts(!showCharts)}
        className="md:hidden w-full flex items-center justify-between p-4 mb-4 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm"
      >
        {showCharts ? "Hide Visual Analytics" : "View Visual Analytics"}
        {showCharts ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <div className={`${showCharts ? 'grid' : 'hidden'} md:grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto`}>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 p-8 shadow-sm flex flex-col h-110">
          <ChartHeader Icon={Layers3} title="License Mix" subtitle="Yield per ARN" info="Breakdown of total revenue." />
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={arnPieData} innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none">
                {arnPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `₹${Math.round(v).toLocaleString('en-IN')}`} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 p-8 shadow-sm flex flex-col h-110">
          <ChartHeader Icon={Building2} title="Top Fund Houses" subtitle="Revenue Partners" info="Top AMC contributors." />
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={amcBarData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="displayName" type="category" tick={{fontSize: 8, fontWeight: 900}} width={80} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v, n, p) => [`₹${Math.round(v).toLocaleString('en-IN')}`, p.payload.name]} />
              <Bar dataKey="value" barSize={16}>
                {amcBarData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 p-8 shadow-sm flex flex-col h-110">
          <ChartHeader Icon={CalendarDays} title="Seasonality" subtitle="Monthly Momentum" info="Historical monthly performance." />
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={seasonality} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 8, fontWeight: 900}} tickFormatter={(v) => ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][parseInt(v)-1]} />
              <Tooltip formatter={(v) => `₹${Math.round(v).toLocaleString('en-IN')}`} />
              <Area type="monotone" dataKey="avgRevenue" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GlobalRiskAnalysis;