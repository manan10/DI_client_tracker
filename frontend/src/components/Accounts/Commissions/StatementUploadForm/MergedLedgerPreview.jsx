import React from 'react';
import { Layers, ArrowLeft, CheckCircle2 } from 'lucide-react';

const formatIndianNumber = (num) => {
  if (!num) return '0.00';
  const numStr = num.toString();
  const parts = numStr.split('.');
  const integerPart = parts[0].replace(/,/g, '');
  const decimalPart = parts[1] !== undefined ? '.' + parts[1].padEnd(2, '0') : '.00';
  const lastThree = integerPart.slice(-3);
  const otherParts = integerPart.slice(0, -3);
  const formattedInteger = otherParts ? (otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree) : lastThree;
  return formattedInteger + decimalPart;
};

const formatFullDate = (dateStr) => {
  if (!dateStr) return 'Unknown Date';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

const MergedLedgerPreview = ({ mergedLedgers, onBack, onConfirm }) => {
  const totalAmount = mergedLedgers.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-[#010413] animate-in slide-in-from-right-8 z-40">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 flex flex-col max-w-4xl mx-auto w-full">
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6 shrink-0">
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-lg sm:text-xl font-[1000] text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-tight italic">
                <Layers className="text-blue-500" size={22} /> Merged Ledgers
              </h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                Grouped into <span className="text-slate-700 dark:text-slate-200">{mergedLedgers.length}</span> unique AMC entries based on earliest payment date.
              </p>
            </div>
            <div className="text-right bg-white dark:bg-slate-950 px-5 py-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Final Gross Total</div>
              <div className="text-xl sm:text-2xl font-[1000] text-blue-600 dark:text-blue-400 leading-none tracking-tighter">
                ₹{formatIndianNumber(totalAmount)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pb-8">
          {mergedLedgers.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-4">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
                    Merged {item.count} Entries
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{item.amcName}</span>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white tabular-nums leading-none mb-1">
                  ₹{formatIndianNumber(item.amount)}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  Dated {formatFullDate(item.date)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FIXED FOOTER */}
      <div className="shrink-0 p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-50">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-3">
          <button 
            type="button"
            onClick={onBack}
            className="col-span-1 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 py-4 rounded-xl font-[1000] uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button 
            type="button"
            onClick={onConfirm} 
            className="col-span-2 bg-blue-600 text-white py-4 rounded-xl font-[1000] uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-blue-500 active:scale-95 transition-all flex justify-center items-center gap-2"
          >
            <CheckCircle2 size={16} /> Confirm & Write Ledgers
          </button>
        </div>
      </div>
    </div>
  );
};

export default MergedLedgerPreview;