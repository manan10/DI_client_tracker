import React from 'react';
import { 
  Landmark, Keyboard, Check, TrendingUp, TrendingDown, 
  Scale, ArrowDownLeft, ArrowUpRight 
} from 'lucide-react';

const BankSidebar = ({
  companyName,
  bankDirectory,
  grandTotals,
  currentBank,
  activeTab,
  onSelectBank,
  onSelectTab,
  onOpenShortcuts,
  formatINR
}) => {
  return (
    <aside className="w-full lg:w-[40%] xl:w-[38%] flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#0A0D14] shrink-0 min-w-0 h-full overflow-hidden">
      
      {/* Header Title Strip */}
      <div className="p-3.5 border-b border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Landmark size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Statement Reconciliation</span>
          </div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">
            {companyName}
          </h3>
        </div>
        
        <button 
          type="button"
          onClick={onOpenShortcuts}
          className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer bg-slate-100 dark:bg-slate-800"
          title="Keyboard Shortcuts (?)"
        >
          <Keyboard size={13} />
          <span>Keys</span>
        </button>
      </div>

      {/* Grand Totals Dashboard Block */}
      <div className="p-3.5 border-b border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
            <Scale size={12} className="text-indigo-500" /> Grand Totals (All Banks)
          </span>
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {grandTotals.verifiedCount}/{grandTotals.totalCount} Verified
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/5 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-1">
                <ArrowDownLeft size={12} /> Inflow (Rx)
              </span>
              <span className="font-mono text-[9px]">{grandTotals.verifiedReceipts}/{grandTotals.receiptCount}</span>
            </div>
            <p className="text-sm font-mono font-black text-emerald-700 dark:text-emerald-400 tabular-nums truncate">
              {formatINR(grandTotals.receiptTotal)}
            </p>
          </div>

          <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/5 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-rose-800 dark:text-rose-300">
              <span className="flex items-center gap-1">
                <ArrowUpRight size={12} /> Outflow (Px)
              </span>
              <span className="font-mono text-[9px]">{grandTotals.verifiedPayments}/{grandTotals.paymentCount}</span>
            </div>
            <p className="text-sm font-mono font-black text-rose-700 dark:text-rose-400 tabular-nums truncate">
              {formatINR(grandTotals.paymentTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Bank Accounts & Receipts/Payments Directory */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3 min-w-0">
        {bankDirectory.map((b) => {
          const isSelectedBank = currentBank === b.bankName;
          const percent = Math.round((b.verifiedTxs / (b.totalTxs || 1)) * 100);

          return (
            <div 
              key={b.bankName} 
              className={`rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                isSelectedBank 
                  ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-md ring-2 ring-emerald-500/20' 
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div 
                onClick={() => { onSelectBank(b.bankName); }}
                className="p-3.5 cursor-pointer flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    b.isCompleted 
                      ? 'bg-emerald-500 text-white shadow-xs' 
                      : isSelectedBank 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {b.isCompleted ? <Check size={16} strokeWidth={3} /> : <Landmark size={15} />}
                  </div>

                  <div className="min-w-0">
                    <h4 className={`text-xs font-black uppercase truncate ${
                      isSelectedBank ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {b.bankName}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {b.verifiedTxs} of {b.totalTxs} Verified
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                    b.isCompleted 
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' 
                      : percent > 0 
                        ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {percent}%
                  </span>
                </div>
              </div>

              {/* Sub-Tabs: Receipts / Payments */}
              <div className="p-2.5 grid grid-cols-2 gap-2 bg-slate-100/40 dark:bg-black/30">
                <button
                  type="button"
                  onClick={() => {
                    onSelectBank(b.bankName);
                    onSelectTab('RECEIPT');
                  }}
                  className={`cursor-pointer p-2.5 rounded-lg border-2 text-left flex flex-col justify-between transition-all ${
                    isSelectedBank && activeTab === 'RECEIPT' 
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm' 
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-black uppercase flex items-center gap-1.5">
                      <TrendingUp size={12} className="text-emerald-600 dark:text-emerald-400" /> Receipts
                    </span>
                    {b.receipts.pending > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                        {b.receipts.pending} Left
                      </span>
                    )}
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-100 dark:border-white/5 flex items-baseline justify-between">
                    <span className="text-[9px] font-bold text-slate-400">{b.receipts.verified}/{b.receipts.total}</span>
                    <span className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {formatINR(b.receipts.amount)}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectBank(b.bankName);
                    onSelectTab('PAYMENT');
                  }}
                  className={`cursor-pointer p-2.5 rounded-lg border-2 text-left flex flex-col justify-between transition-all ${
                    isSelectedBank && activeTab === 'PAYMENT' 
                      ? 'bg-rose-500/15 border-rose-500 text-rose-900 dark:text-rose-200 shadow-sm' 
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-rose-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-black uppercase flex items-center gap-1.5">
                      <TrendingDown size={12} className="text-rose-600 dark:text-rose-400" /> Payments
                    </span>
                    {b.payments.pending > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/30">
                        {b.payments.pending} Left
                      </span>
                    )}
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-100 dark:border-white/5 flex items-baseline justify-between">
                    <span className="text-[10px] font-bold text-slate-400">{b.payments.verified}/{b.payments.total}</span>
                    <span className="text-xs font-mono font-black text-rose-700 dark:text-rose-400 tabular-nums">
                      {formatINR(b.payments.amount)}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </aside>
  );
};

export default BankSidebar;