import React from 'react';
import { Layers } from 'lucide-react';

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const GlobalCommissionMatrix = ({ data }) => {
  const monthlyAggregates = data?.monthlyAggregates || [];
  const uniqueARNs = data?.uniqueARNs || [];
  const arnNicknameMap = data?.arnNicknameMap || {};

  const arnTotals = uniqueARNs.reduce((acc, arnId) => {
    const total = monthlyAggregates.reduce((sum, month) => {
      const entry = month.arnBreakdown?.find(b => b.arnId === arnId);
      return sum + (entry?.amount || 0);
    }, 0);
    acc[arnId] = total;
    return acc;
  }, {});

  const grandTotalAllARNs = Object.values(arnTotals).reduce((a, b) => a + b, 0);

  if (monthlyAggregates.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-250">
            <thead>
              <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
                <th className="w-48 px-8 py-10 sticky left-0 bg-emerald-50/80 dark:bg-slate-900 backdrop-blur-md z-20 border-b border-emerald-100 dark:border-emerald-900/30">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-500 uppercase tracking-widest leading-none mb-1">Fiscal Year</span>
                    <span className="text-[18px] font-[1000] text-emerald-900 dark:text-emerald-400 italic tracking-tighter uppercase">Totals</span>
                  </div>
                </th>
                {uniqueARNs.map((arnId) => (
                  <th key={arnId} className="px-8 py-10 text-right border-b border-l border-emerald-100/50 dark:border-emerald-900/20">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-emerald-600/60 dark:text-emerald-500/40 uppercase tracking-tighter mb-2 truncate w-full text-right">
                        {arnNicknameMap[arnId] || arnId}
                      </span>
                      <span className="text-xl font-[1000] text-slate-900 dark:text-white tabular-nums tracking-tighter italic">
                        ₹{formatINR(arnTotals[arnId])}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="w-56 px-8 py-10 text-right bg-emerald-600 dark:bg-emerald-700 border-b border-emerald-500 dark:border-emerald-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-emerald-100 dark:text-emerald-200 uppercase tracking-widest mb-2">Total Yield</span>
                    <span className="text-2xl font-[1000] text-white tabular-nums tracking-tighter italic">
                      ₹{formatINR(grandTotalAllARNs)}
                    </span>
                  </div>
                </th>
              </tr>

              <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-4 sticky left-0 bg-white dark:bg-slate-900 z-10 text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Month</th>
                {uniqueARNs.map((arnId) => (
                  <th key={arnId} className="px-8 py-4 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase text-right border-l border-slate-50 dark:border-slate-800/50">Payout</th>
                ))}
                <th className="px-8 py-4 text-[9px] font-black text-emerald-500 dark:text-emerald-400 uppercase text-right bg-emerald-50/30 dark:bg-emerald-900/10">Sub-Total</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {monthlyAggregates.map((monthRow) => (
                <tr key={monthRow._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-8 py-5 sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 z-10 border-r border-slate-50 dark:border-slate-800 font-bold text-[11px] text-slate-800 dark:text-slate-200 uppercase italic">
                    {monthRow._id}
                  </td>
                  {uniqueARNs.map((arnId) => {
                    const amount = monthRow.arnBreakdown?.find((b) => b.arnId === arnId)?.amount || 0;
                    return (
                      <td key={arnId} className="px-8 py-5 text-right border-l border-slate-50 dark:border-slate-800/50 font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {amount > 0 ? `₹${formatINR(amount)}` : '—'}
                      </td>
                    );
                  })}
                  <td className="px-8 py-5 text-right bg-emerald-50/10 dark:bg-emerald-900/5 font-[1000] text-emerald-600 dark:text-emerald-400 italic text-[12px]">
                    ₹{formatINR(monthRow.total)}
                  </td>
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