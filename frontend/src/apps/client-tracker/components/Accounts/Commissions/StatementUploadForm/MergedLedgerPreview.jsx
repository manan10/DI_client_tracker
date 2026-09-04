import React from 'react';
import { Layers, ArrowLeft, CheckCircle2, Calendar, Building2, IndianRupee } from 'lucide-react';

const formatINR = (val) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(val || 0);
};

const formatFullDate = (dateStr) => {
  if (!dateStr) return 'Earliest Cycle Date';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const MergedLedgerPreview = ({ mergedLedgers = [], onBack, onConfirm }) => {
  const totalAmount = mergedLedgers.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in duration-200 pb-20">
      
      {/* 1. Summary Ledger Header Card */}
      <div className="bg-white dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-white/10 p-5 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Layers size={16} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight font-mono">
              Merged Ledger Review
            </h3>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Grouped into <strong className="text-slate-800 dark:text-slate-200 font-bold">{mergedLedgers.length}</strong> unique AMC entries based on the earliest payout date.
          </p>
        </div>

        <div className="text-left sm:text-right bg-slate-50/70 dark:bg-white/2 p-3.5 rounded-lg border border-slate-200/70 dark:border-white/5 shrink-0">
          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Consolidated Gross Sum
          </span>
          <div className="flex items-baseline sm:justify-end gap-1 mt-0.5">
            <span className="text-xs font-bold text-slate-400">₹</span>
            <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
              {formatINR(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Merged Items Breakdown List */}
      <div className="space-y-2.5">
        {mergedLedgers.map((item, idx) => (
          <div 
            key={idx} 
            className="bg-white dark:bg-[#0B1120] p-4 rounded-xl border border-slate-200/90 dark:border-white/10 shadow-xs flex items-center justify-between gap-4"
          >
            <div className="flex flex-col min-w-0 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  {item.count} Statement Entry{item.count > 1 ? 's' : ''} Merged
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase truncate font-mono">
                {item.amcName}
              </span>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-white tabular-nums block">
                ₹{formatINR(item.amount)}
              </span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block mt-0.5">
                Dated {formatFullDate(item.date)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Action Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-white/10 grid grid-cols-3 gap-3">
        <button 
          type="button"
          onClick={onBack}
          className="col-span-1 py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft size={15} /> Back
        </button>

        <button 
          type="button"
          onClick={onConfirm} 
          className="col-span-2 py-3 px-6 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-emerald-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle2 size={15} />
          <span>Confirm & Write to Workbench</span>
        </button>
      </div>

    </div>
  );
};

export default MergedLedgerPreview;