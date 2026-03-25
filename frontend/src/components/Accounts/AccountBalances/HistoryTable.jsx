import React from 'react';
import { TrendingUp, Edit3, ChevronRight, History, Landmark } from 'lucide-react';

const HistoryTable = ({ accounts, history, onEdit }) => {
  return (
    <section className="w-full space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-500/10 dark:bg-slate-400/10 rounded-lg border border-slate-200 dark:border-slate-800/50">
            <History className="text-slate-700 dark:text-slate-400" size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight italic">
              Historical Ledger
            </h2>
            <p className="text-[10px] font-black text-slate-700/60 dark:text-slate-400/50 uppercase tracking-[0.2em]">
              Performance over last 5 snapshots
            </p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-950/30 rounded-full border border-slate-100 dark:border-slate-900/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          <span className="text-[9px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-tighter">
            Tap date to modify
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border-2 border-slate-100/50 dark:border-slate-900/30 shadow-2xl overflow-hidden transition-all duration-500">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              {/* Header: Slate Tint */}
              <tr className="bg-slate-50/80 dark:bg-slate-900/40 border-b-2 border-slate-100 dark:border-slate-900/50">
                <th className="p-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-800/70 dark:text-slate-400/70 w-72">
                  <div className="flex items-center gap-2">
                    <Landmark size={14} /> Account Source
                  </div>
                </th>
                {history.slice(0, 5).map((snap) => (
                  <th 
                    key={snap._id} 
                    onClick={() => onEdit(snap)} 
                    className="p-6 text-[11px] font-black uppercase text-center cursor-pointer hover:bg-white dark:hover:bg-slate-800/20 transition-all border-l border-slate-100 dark:border-slate-900/50 group"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <Edit3 size={12} className="text-emerald-600 dark:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1" />
                      <span className="text-slate-900 dark:text-slate-200">
                        {new Date(snap.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-50/50 dark:divide-slate-600/20">
              {accounts.map((acc) => (
                <tr 
                  key={acc._id} 
                  className="hover:bg-slate-500/3 dark:hover:bg-slate-400/2 dark:bg-slate-800 transition-colors group"
                >
                  <td className="p-5 text-sm font-bold text-slate-700 dark:text-slate-400 uppercase tracking-tight pl-8">
                    {acc.name}
                  </td>
                  {history.slice(0, 5).map(snap => {
                    const balance = snap.balances.find(b => b.accountId._id === acc._id)?.amount || 0;
                    return (
                      <td key={snap._id} className="p-5 text-right font-black text-sm text-slate-950 dark:text-white border-l border-slate-50 dark:border-slate-900/10">
                        <span className="text-slate-800/30 dark:text-slate-400/20 text-[10px] mr-1.5 font-black italic">₹</span>
                        {(balance / 100000).toFixed(2)}
                        <span className="text-emerald-600/60 dark:text-emerald-500/40 italic ml-1 font-black">L</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>

            {/* Footer: Deep Slate & Bronze */}
            <tfoot>
              <tr className="bg-slate-900 dark:bg-slate-900 text-white border-t-4 border-emerald-600/80">
                <td className="p-8 uppercase text-xs font-black tracking-[0.2em] text-emerald-500">
                  <div className="flex flex-col">
                    <span className="text-white/40 text-[8px] mb-1">Treasury Report</span>
                    Aggregate Liquidity
                  </div>
                </td>
                {history.slice(0, 5).map(snap => (
                  <td key={snap._id} className="p-8 text-right border-l border-white/5">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-slate-400/50 uppercase font-black mb-1">Snapshot Total</span>
                      <div className="text-xl font-black tracking-tighter">
                        <span className="text-emerald-500 text-sm italic mr-1">₹</span>
                        {(snap.totalBalance / 100000).toFixed(2)}
                        <span className="text-xs italic text-slate-400/60 ml-1">L</span>
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
};

export default HistoryTable;