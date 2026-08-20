import React, { useMemo } from 'react';
import { Edit3, History, Calendar, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const HistoryTable = ({ accounts, history, onEdit }) => {
  const sortedAccounts = useMemo(() => [...accounts].sort((a, b) => a.name.localeCompare(b.name)), [accounts]);
  
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);

  const limitedHistory = useMemo(() => history.slice(0, 3), [history]);

  return (
    <section className="w-full space-y-6 animate-in fade-in duration-500 pt-6">
      
      {/* --- SECTION HEADER BAR --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
            <History size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Balance History
            </h3>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              Comparative balance snapshots across active accounts
            </p>
          </div>
        </div>
      </div>

      {/* --- DESKTOP VIEW: High-Contrast Comparative Data Grid --- */}
      <div className="hidden md:block bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/10">
              <th className="p-4 pl-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[25%] border-r border-slate-200 dark:border-white/10">
                Account Name
              </th>
              {limitedHistory.map((snap) => (
                <th 
                  key={snap._id} 
                  onClick={() => onEdit(snap)} 
                  className="p-4 text-right cursor-pointer group hover:bg-white dark:hover:bg-slate-800 transition-all border-r border-slate-200 dark:border-white/10 last:border-r-0 w-[25%]"
                >
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-slate-900 dark:text-white text-sm font-black tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {new Date(snap.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 uppercase tracking-widest transition-colors bg-slate-100 dark:bg-slate-900 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 px-2.5 py-1 rounded-md border border-transparent group-hover:border-indigo-200 dark:group-hover:border-indigo-500/30">
                      <Edit3 size={12} strokeWidth={2.5} /> Edit
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
            {sortedAccounts.map((acc) => (
              <tr key={acc._id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors group/row">
                <td className="p-4 pl-6 border-r border-slate-100 dark:border-white/5 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{acc.name}</p>
                  {acc.accountNumber && (
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                      ID: #{acc.accountNumber}
                    </p>
                  )}
                </td>
                {limitedHistory.map((snap) => {
                  const balanceItem = snap.balances.find(b => (b.accountId?._id || b.accountId) === acc._id);
                  const amount = balanceItem?.amount || 0;
                  
                  return (
                    <td 
                      key={snap._id} 
                      className="p-4 text-right font-semibold text-slate-700 dark:text-slate-300 tabular-nums border-r border-slate-100 dark:border-white/5 last:border-r-0 group-hover/row:text-slate-900 dark:group-hover/row:text-white transition-colors"
                    >
                      ₹{formatCurrency(amount)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          
          {/* TOTALS ROW FOOTER */}
          <tfoot className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-white/10">
            <tr>
              <td className="p-4 pl-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-white/10">
                Totals
              </td>
              {limitedHistory.map(snap => {
                const totalSnapVal = snap.balances.reduce((sum, b) => sum + (b.amount || 0), 0);
                return (
                  <td 
                    key={`total-${snap._id}`} 
                    className="p-4 text-right text-base font-[1000] text-emerald-600 dark:text-emerald-400 tabular-nums border-r border-slate-200 dark:border-white/10 last:border-r-0"
                  >
                    ₹{formatCurrency(snap.totalBalance || totalSnapVal)}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* --- MOBILE VIEW: Premium Stacked Snapshot Cards --- */}
      <div className="md:hidden space-y-6">
        {limitedHistory.map((snap) => {
          const totalSnapVal = snap.balances.reduce((sum, b) => sum + (b.amount || 0), 0);
          return (
            <div key={snap._id} className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col relative">
              
              {/* Vibrant Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>

              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar size={12} /> Snapshot
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                    {new Date(snap.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <button 
                  onClick={() => onEdit(snap)} 
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg shadow-sm active:scale-95 transition-all outline-none flex items-center gap-1.5"
                >
                  <Edit3 size={14} /> Edit
                </button>
              </div>

              {/* Card Data List */}
              <div className="p-5 flex flex-col gap-3">
                {sortedAccounts.map(acc => {
                  const balanceItem = snap.balances.find(b => (b.accountId?._id || b.accountId) === acc._id);
                  const amount = balanceItem?.amount || 0;
                  return (
                    <div key={acc._id} className="flex justify-between items-center py-1">
                      <div className="flex flex-col min-w-0 pr-4">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{acc.name}</span>
                        {acc.accountNumber && (
                          <span className="text-[10px] font-semibold text-slate-400">#{acc.accountNumber}</span>
                        )}
                      </div>
                      <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums shrink-0">
                        ₹{formatCurrency(amount)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Totals Footer */}
              <div className="px-5 py-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Net Balance</span>
                <span className="text-lg font-[1000] text-emerald-600 dark:text-emerald-400 tabular-nums">
                  ₹{formatCurrency(snap.totalBalance || totalSnapVal)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};

export default HistoryTable;