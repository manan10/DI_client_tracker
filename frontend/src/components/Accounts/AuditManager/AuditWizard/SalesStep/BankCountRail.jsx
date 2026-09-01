import React from 'react';
import { Landmark, Check } from 'lucide-react';

const BankCountRail = ({
  availableBanks = [],
  currentBank,
  bankCounts = {},
  salesTransactions = [],
  onSelectBank,
  formatINR,
  isTrue
}) => {
  const totalVerified = salesTransactions.filter(t => isTrue(t.isSalesApproved)).length;
  const totalCount = salesTransactions.length;
  const totalPercent = totalCount > 0 ? Math.round((totalVerified / totalCount) * 100) : 0;

  return (
    <aside className="w-56 lg:w-64 flex flex-col border-r border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-[#080B11] shrink-0 p-3.5 space-y-3 overflow-y-auto no-scrollbar select-none">
      
      {/* Header Label */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <Landmark size={12} className="text-indigo-500" /> Bank Accounts
        </span>
        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
          {availableBanks.length} Active
        </span>
      </div>

      {/* Bank Selection Cards */}
      <div className="space-y-2">
        {availableBanks.map(bank => {
          const isBankActive = currentBank === bank;
          const stats = bankCounts[bank] || { total: 0, pending: 0, verified: 0, totalAmount: 0 };
          const bankPercent = stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0;
          
          return (
            <button
              key={bank}
              type="button"
              onClick={() => onSelectBank(bank)}
              className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden ${
                isBankActive 
                  ? 'bg-white dark:bg-[#0E131F] border-indigo-500/50 shadow-sm ring-1 ring-indigo-500/20' 
                  : 'bg-white/60 dark:bg-slate-900/40 border-slate-200/70 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
              }`}
            >
              {isBankActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
              )}

              <div className="flex items-center justify-between pl-1">
                <span className={`text-xs font-bold uppercase truncate max-w-32.5 ${
                  isBankActive ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-slate-800 dark:text-slate-200'
                }`}>
                  {bank}
                </span>

                {stats.pending > 0 ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    {stats.pending} left
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
                    <Check size={10} strokeWidth={3} /> Done
                  </span>
                )}
              </div>

              {/* Volume Figure */}
              <div className="flex justify-between items-baseline pl-1 text-[11px] font-mono">
                <span className="text-slate-400 dark:text-slate-500">
                  {stats.verified}/{stats.total} verified
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {formatINR(stats.totalAmount)}
                </span>
              </div>

              {/* Progress */}
              <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ml-1">
                <div 
                  className={`h-full transition-all duration-300 ${isBankActive ? 'bg-indigo-500' : 'bg-slate-400 dark:bg-slate-600'}`}
                  style={{ width: `${bankPercent}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Batch Completion Summary Footer */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 mt-auto">
        <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/2 border border-slate-200/80 dark:border-white/10 space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>Reconciliation</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalPercent}%</span>
          </div>

          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${totalPercent}%` }} 
            />
          </div>

          <p className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 pt-0.5">
            {totalVerified} of {totalCount} Items Verified
          </p>
        </div>
      </div>

    </aside>
  );
};

export default BankCountRail;