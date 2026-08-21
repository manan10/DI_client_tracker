import React, { useState } from 'react';
import { Calendar, ChevronDown, Trash2, Copy, Building2, Check, AlertTriangle, Layers } from 'lucide-react';
import { toast } from 'sonner';

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

const formatShortMonth = (monthStr) => {
  if (!monthStr || monthStr === "N/A") return "Last Cycle";
  const parts = monthStr.split('-');
  if (parts.length < 2) return monthStr;
  const year = parts[0];
  const month = parseInt(parts[1], 10);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1] || parts[1]} '${year.slice(-2)}`;
};

const HistoryRow = ({ row, onDeleteSuccess }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const activeEntries = (row?.entries || [])
    .filter(entry => entry.amount > 0)
    .sort((a, b) => (a.amcName || '').localeCompare(b.amcName || ''));

  const copyId = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(row._id);
    toast.success("Statement ID copied to clipboard", { duration: 1200 });
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/commissions/${row._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success(`Statement records for ${row.accountingMonth} purged`);
        if (onDeleteSuccess) onDeleteSuccess();
      } else {
        toast.error(json.message || "Failed to purge record");
      }
    } catch {
      toast.error("Server connection lost while deleting");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      {/* ======================================================== */}
      {/* 1. DESKTOP ROW VIEW (>= md)                              */}
      {/* ======================================================== */}
      <tr 
        onClick={() => !isDeleting && setIsExpanded(!isExpanded)}
        className={`hidden md:table-row group cursor-pointer transition-colors border-b border-slate-100 dark:border-white/5 ${
          isExpanded 
            ? 'bg-emerald-500/4 dark:bg-emerald-500/8' 
            : 'hover:bg-slate-50/80 dark:hover:bg-white/2'
        } ${isDeleting ? 'opacity-30 pointer-events-none' : ''}`}
      >
        {/* Accounting Period */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-200 ${
              isExpanded 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                : 'bg-slate-100 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
            }`}>
              <Calendar size={15} strokeWidth={2.2} />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white block">
                {row.accountingMonth}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                {formatShortMonth(row.accountingMonth)}
              </span>
            </div>
          </div>
        </td>

        {/* Breakdown Indicator */}
        <td className="px-5 py-4 text-center">
          <div className="inline-flex flex-col items-center">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-37.5">
              {activeEntries[0]?.amcName || "No AMC recorded"}
            </span>
            {activeEntries.length > 1 && (
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                + {activeEntries.length - 1} other AMC{activeEntries.length > 2 ? 's' : ''}
              </span>
            )}
          </div>
        </td>

        {/* Net Commission Figure */}
        <td className="px-5 py-4 text-right font-mono font-black tabular-nums text-slate-900 dark:text-white text-sm">
          ₹{formatINR(row.totalGross)}
        </td>

        {/* Audit Status */}
        <td className="px-5 py-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Reconciled
          </span>
        </td>

        {/* Action / Expand Caret */}
        <td className="px-5 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
              isExpanded 
                ? 'bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
                : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
            }`}>
              <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </td>
      </tr>

      {/* ======================================================== */}
      {/* 2. MOBILE CARD VIEW (< md)                               */}
      {/* ======================================================== */}
      <tr className="md:hidden border-b border-slate-100 dark:border-white/5">
        <td colSpan="5" className="p-0">
          <div 
            onClick={() => !isDeleting && setIsExpanded(!isExpanded)}
            className={`p-4 transition-colors cursor-pointer ${
              isExpanded ? 'bg-emerald-500/4 dark:bg-emerald-500/8' : 'bg-white dark:bg-[#0B1120]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  isExpanded 
                    ? 'bg-emerald-600 border-emerald-600 text-white' 
                    : 'bg-slate-100 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400'
                }`}>
                  <Calendar size={15} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold font-mono text-slate-900 dark:text-white block">
                    {row.accountingMonth}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate block">
                    {activeEntries[0]?.amcName || "No AMC"}
                    {activeEntries.length > 1 && ` +${activeEntries.length - 1} more`}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono font-black text-sm text-slate-900 dark:text-white block tabular-nums">
                  ₹{formatINR(row.totalGross)}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 mt-0.5">
                  View Detail <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </span>
              </div>
            </div>
          </div>
        </td>
      </tr>

      {/* ======================================================== */}
      {/* 3. EXPANDED MICRO-LEDGER (Shared Desktop & Mobile)       */}
      {/* ======================================================== */}
      {isExpanded && (
        <tr className="border-b border-slate-200 dark:border-white/10">
          <td colSpan="5" className="p-0">
            <div className="bg-slate-50/75 dark:bg-[#070B14] p-4 sm:p-6 border-t border-slate-100 dark:border-white/5 animate-in fade-in duration-200">
              
              {/* Header Title for Breakdown */}
              <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200/80 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    AMC Itemized Ledger ({activeEntries.length} Contributor{activeEntries.length === 1 ? '' : 's'})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  Gross Sum: ₹{formatINR(row.totalGross)}
                </span>
              </div>

              {/* Individual AMC Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {activeEntries.map((entry, idx) => (
                  <div 
                    key={idx} 
                    className="flex justify-between items-center py-2.5 px-3.5 bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/10 rounded-lg shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase truncate" title={entry.amcName}>
                        {entry.amcName}
                      </span>
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white tabular-nums shrink-0">
                      ₹{formatINR(entry.amount)}
                    </span>
                  </div>
                ))}

                {activeEntries.length === 0 && (
                  <div className="col-span-full py-4 text-center text-xs text-slate-400 font-medium">
                    No individual AMC amounts logged for this cycle.
                  </div>
                )}
              </div>

              {/* Action Bar / UID & Delete */}
              <div className="mt-5 pt-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-slate-200/80 dark:border-white/10">
                <button 
                  type="button"
                  onClick={copyId} 
                  className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  <Copy size={12} /> Statement UID: {row._id}
                </button>

                {!showDeleteConfirm ? (
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
                    }} 
                    disabled={isDeleting}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all cursor-pointer"
                  >
                    <Trash2 size={12} /> Purge Cycle
                  </button>
                ) : (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">Confirm delete?</span>
                    <button 
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      {isDeleting ? 'Purging...' : 'Yes, Delete'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2.5 py-1 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default HistoryRow;