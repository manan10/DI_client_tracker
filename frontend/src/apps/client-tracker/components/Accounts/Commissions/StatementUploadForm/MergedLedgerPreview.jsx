import React from "react";
import { Layers, ArrowLeft, CheckCircle2 } from "lucide-react";

const formatINR = (val) => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(val || 0);
};

const formatFullDate = (dateStr) => {
  if (!dateStr) return "Earliest Date";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const MergedLedgerPreview = ({ mergedLedgers = [], onBack, onConfirm }) => {
  const totalAmount = mergedLedgers.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-5 animate-in fade-in duration-200 pb-20">
      {/* 1. Summary Header Card */}
      <div className="bg-white dark:bg-[#161B26] rounded-lg border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-200/70 dark:border-sky-500/20">
              <Layers size={15} />
            </div>
            <h3 className="sora-font text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Merged{" "}
              <span className="font-normal text-sky-600 dark:text-sky-300">
                Preview
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Combined into{" "}
            <strong className="text-slate-800 dark:text-slate-200 font-semibold">
              {mergedLedgers.length}
            </strong>{" "}
            AMC {mergedLedgers.length === 1 ? "entry" : "entries"} using the
            earliest payout date.
          </p>
        </div>

        <div className="text-left sm:text-right bg-slate-50/80 dark:bg-[#131720] px-4 py-3 rounded-lg border border-slate-200/80 dark:border-slate-800 shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
            Total Amount
          </span>
          <div className="flex items-baseline sm:justify-end gap-1 mt-0.5">
            <span className="text-xs font-semibold text-slate-400">₹</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-sky-600 dark:text-sky-300 tabular-nums">
              {formatINR(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Merged Items List */}
      <div className="space-y-2.5">
        {mergedLedgers.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#161B26] p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
          >
            <div className="flex flex-col min-w-0 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200/70 dark:border-sky-500/20">
                  {item.count} {item.count > 1 ? "entries" : "entry"} merged
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate font-mono">
                {item.amcName}
              </span>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums block">
                ₹{formatINR(item.amount)}
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mt-0.5">
                {formatFullDate(item.date)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Action Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={onBack}
          className="col-span-1 py-2.5 px-4 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="col-span-2 py-2.5 px-6 rounded-lg text-xs font-semibold tracking-wide bg-sky-600 hover:bg-sky-500 text-white active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle2 size={15} />
          <span>Apply to Entry Form</span>
        </button>
      </div>
    </div>
  );
};

export default MergedLedgerPreview;