import React, { useMemo } from 'react';
import { Edit3, History, Landmark, Hash, Calendar, DollarSign } from 'lucide-react';

const HistoryTable = ({ accounts, history, onEdit }) => {
  const sortedAccounts = useMemo(() => [...accounts].sort((a, b) => a.name.localeCompare(b.name)), [accounts]);
  
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);

  const limitedHistory = useMemo(() => history.slice(0, 3), [history]);

  return (
    <section className="w-full space-y-6">
      {/* Title Section */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <History className="text-emerald-600 dark:text-emerald-400" size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight italic">Historical Ledger</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Performance Analysis</p>
          </div>
        </div>
      </div>

      {/* --- DESKTOP VIEW: The Table --- */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
              <th className="p-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Account Source</th>
              {limitedHistory.map((snap) => (
                <th key={snap._id} onClick={() => onEdit(snap)} className="p-6 text-right cursor-pointer group hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors">
                  <div className="flex flex-col items-end gap-1">
                    <Edit3 size={12} className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-slate-900 dark:text-slate-200 text-xs font-black uppercase tracking-widest">
                      {new Date(snap.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedAccounts.map((acc) => (
              <tr key={acc._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-5 pl-8">
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase">{acc.name}</p>
                  {acc.accountNumber && <p className="text-[10px] font-mono text-slate-400">#{acc.accountNumber}</p>}
                </td>
                {limitedHistory.map(snap => (
                  <td key={snap._id} className="p-5 text-right font-black text-slate-900 dark:text-slate-300">
                    ₹{formatCurrency(snap.balances.find(b => (b.accountId?._id || b.accountId) === acc._id)?.amount || 0)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE VIEW: Stacked Snapshot Cards --- */}
      <div className="md:hidden space-y-4">
        {limitedHistory.map((snap) => (
          <div key={snap._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-widest text-xs">
                <Calendar size={14} className="text-emerald-500" />
                {new Date(snap.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              <button onClick={() => onEdit(snap)} className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg">Edit</button>
            </div>
            <div className="space-y-3">
              {sortedAccounts.map(acc => (
                <div key={acc._id} className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-500">{acc.name}</span>
                  <span className="text-slate-900 dark:text-slate-300 tabular-nums">
                    ₹{formatCurrency(snap.balances.find(b => (b.accountId?._id || b.accountId) === acc._id)?.amount || 0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-400">Total</span>
              <span className="text-sm font-black text-emerald-600 tabular-nums">₹{formatCurrency(snap.totalBalance)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HistoryTable;