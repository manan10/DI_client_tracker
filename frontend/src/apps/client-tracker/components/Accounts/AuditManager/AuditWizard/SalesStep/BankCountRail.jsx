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
    <aside className="w-56 lg:w-64 flex flex-col border-r border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#131720] shrink-0 p-3.5 space-y-3 overflow-y-auto no-scrollbar select-none">
      
      {/* Header Label */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <Landmark size={12} className="text-sky-500 dark:text-sky-400" /> Bank Accounts
        </span>
        <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
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
              className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden ${
                isBankActive 
                  ? 'bg-white dark:bg-[#161B26] border-sky-500/60 shadow-sm ring-1 ring-sky-500/20' 
                  : 'bg-white dark:bg-[#161B26] border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {isBankActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500" />
              )}

              <div className="flex items-center justify-between pl-1">
                <span className={`sora-font text-xs font-bold uppercase truncate max-w-32.5 ${
                  isBankActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-800 dark:text-slate-200'
                }`}>
                  {bank}
                </span>

                {stats.pending > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    {stats.pending} left
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
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
                  className={`h-full transition-all duration-300 ${isBankActive ? 'bg-sky-500' : 'bg-slate-400 dark:bg-slate-600'}`}
                  style={{ width: `${bankPercent}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Batch Completion Summary Footer */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 mt-auto">
        <div className="p-3 rounded-lg bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>Reconciliation</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">{totalPercent}%</span>
          </div>

          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${totalPercent}%` }} 
            />
          </div>

          <p className="text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300 pt-0.5">
            {totalVerified} of {totalCount} Items Verified
          </p>
        </div>
      </div>

    </aside>
  );
};

export default BankCountRail;