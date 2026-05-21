import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BarChart3, TrendingUp } from 'lucide-react';

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR',
  }).format(amount || 0);
};

const GlobalCommissionMatrix = ({ data }) => {
  const [expandedMonth, setExpandedMonth] = useState(null);
  const monthlyAggregates = data?.monthlyAggregates || [];
  const uniqueARNs = data?.uniqueARNs || [];
  const arnNicknameMap = data?.arnNicknameMap || {};

  const arnTotals = uniqueARNs.reduce((acc, arnId) => {
    acc[arnId] = monthlyAggregates.reduce((sum, m) => sum + (m.arnBreakdown?.find(b => b.arnId === arnId)?.amount || 0), 0);
    return acc;
  }, {});

  const grandTotalAllARNs = Object.values(arnTotals).reduce((a, b) => a + b, 0);

  if (monthlyAggregates.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* --- MOBILE: PROFESSIONAL LIGHT-THEME MATRIX --- */}
      <div className="md:hidden space-y-4">
        {/* Professional Summary Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Yearly Total Yield</span>
            <TrendingUp size={14} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-[1000] text-slate-900 mb-6">{formatINR(grandTotalAllARNs)}</h2>
          
          <div className="space-y-3 border-t border-slate-100 pt-4">
            {uniqueARNs.map(arnId => (
              <div key={arnId} className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase truncate max-w-37.5">{arnNicknameMap[arnId] || arnId}</span>
                <span className="text-[11px] font-black text-slate-900">{formatINR(arnTotals[arnId])}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Breakdown List */}
        <div className="space-y-2">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-1 mb-2">Monthly Breakdown</h3>
          {monthlyAggregates.map((month) => (
            <div key={month._id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <button onClick={() => setExpandedMonth(expandedMonth === month._id ? null : month._id)} className="w-full flex items-center justify-between p-4">
                <span className="font-black text-[11px] uppercase tracking-widest text-slate-800">{month._id}</span>
                <div className="flex items-center gap-3">
                  <span className="font-[1000] text-emerald-600 text-xs">{formatINR(month.total)}</span>
                  {expandedMonth === month._id ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                </div>
              </button>
              {expandedMonth === month._id && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                  {uniqueARNs.map(arnId => {
                    const amt = month.arnBreakdown?.find(b => b.arnId === arnId)?.amount || 0;
                    return (
                      <div key={arnId} className="flex justify-between py-1.5 text-[10px]">
                        <span className="text-slate-500 uppercase font-bold">{arnNicknameMap[arnId] || arnId}</span>
                        <span className="font-black text-slate-900">{formatINR(amt)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- DESKTOP: ORIGINAL SPREADSHEET TABLE --- */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-200">
            <thead>
              <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
                <th className="w-48 px-8 py-10 sticky left-0 bg-emerald-50/80 dark:bg-slate-900 z-20 border-b border-emerald-100">
                  <div className="flex flex-col"><span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Fiscal Year</span><span className="text-[18px] font-[1000] text-emerald-900 dark:text-emerald-400 italic uppercase">Totals</span></div>
                </th>
                {uniqueARNs.map((arnId) => (
                  <th key={arnId} className="px-8 py-10 text-right border-b border-l border-emerald-100/50">
                    <div className="flex flex-col items-end"><span className="text-[9px] font-black text-emerald-600/60 uppercase mb-2 truncate w-full text-right">{arnNicknameMap[arnId] || arnId}</span><span className="text-xl font-[1000] text-slate-900 dark:text-white italic tabular-nums">{formatINR(arnTotals[arnId])}</span></div>
                  </th>
                ))}
                <th className="w-56 px-8 py-10 text-right bg-emerald-600 border-b border-emerald-500">
                  <div className="flex flex-col items-end"><span className="text-[9px] font-black text-emerald-100 uppercase mb-2">Total Yield</span><span className="text-2xl font-[1000] text-white italic tabular-nums">{formatINR(grandTotalAllARNs)}</span></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {monthlyAggregates.map((monthRow) => (
                <tr key={monthRow._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-50 font-bold text-[11px] uppercase italic">{monthRow._id}</td>
                  {uniqueARNs.map((arnId) => {
                    const amount = monthRow.arnBreakdown?.find((b) => b.arnId === arnId)?.amount || 0;
                    return <td key={arnId} className="px-8 py-5 text-right text-[11px] font-bold text-slate-500 tabular-nums">{amount > 0 ? formatINR(amount) : '—'}</td>
                  })}
                  <td className="px-8 py-5 text-right bg-emerald-50/10 font-[1000] text-emerald-600 dark:text-emerald-400 italic text-[12px] tabular-nums">{formatINR(monthRow.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GlobalCommissionMatrix;