import React from 'react';
import { Search, CheckCheck, X, FileText } from 'lucide-react';

const SalesAccordionList = ({
  displayTransactions = [],
  currentTxId,
  txSearchQuery,
  onSearchChange,
  onSelectTx,
  formatINR,
  isTrue
}) => {
  return (
    <div className="border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#161B26] p-3.5 space-y-2.5 shadow-lg z-30 animate-in slide-in-from-top-2 duration-150">
      
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="FILTER VOUCHERS IN VIEW (NARRATION, AMOUNT, OR LEDGER)..."
          value={txSearchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg pl-8 pr-8 py-1.5 text-xs font-medium uppercase outline-none focus:border-sky-500 text-slate-900 dark:text-white placeholder:text-slate-400"
        />
        {txSearchQuery && (
          <button 
            type="button"
            onClick={() => onSearchChange("")} 
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 max-h-60 overflow-y-auto no-scrollbar p-0.5">
        {displayTransactions.length === 0 ? (
          <div className="col-span-full py-6 flex flex-col items-center justify-center text-slate-400 gap-1 opacity-60">
            <FileText size={20} />
            <p className="text-[11px] font-mono font-semibold uppercase tracking-wider">No matching vouchers found</p>
          </div>
        ) : (
          displayTransactions.map(tx => {
            const isApproved = isTrue(tx.isSalesApproved);
            const isCurrent = currentTxId === tx._id;

            return (
              <button
                key={tx._id}
                type="button"
                onClick={() => onSelectTx(tx._id)}
                className={`p-2.5 rounded-lg border text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer ${
                  isCurrent 
                    ? 'bg-sky-50 dark:bg-sky-500/10 text-slate-900 dark:text-white border-sky-500 dark:border-sky-500/60 shadow-xs ring-1 ring-sky-500/20' 
                    : isApproved 
                      ? 'bg-emerald-50/60 dark:bg-emerald-500/5 border-emerald-500/25 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' 
                      : 'bg-slate-50 dark:bg-[#1C2230] border-slate-200 dark:border-slate-700/80 hover:border-sky-400 dark:hover:border-sky-500/50'
                }`}
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-[11px] font-semibold uppercase truncate">
                    {tx.narration || tx.description || "NO NARRATION"}
                  </p>
                  <p className={`text-[9px] font-mono truncate ${isCurrent ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`}>
                    {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {tx.activeSalesLedger}
                  </p>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end">
                  <span className="text-xs font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatINR(tx.grossVoucherTotal)}
                  </span>
                  {isApproved && (
                    <span className="flex items-center gap-0.5 text-[8px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <CheckCheck size={11} strokeWidth={3} /> Verified
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

    </div>
  );
};

export default SalesAccordionList;