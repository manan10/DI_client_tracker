import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  Landmark, 
  Trash2, 
  Copy 
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Formats currency with 2 decimal places as requested
 */
const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const HistoryRow = ({ row, onDeleteSuccess }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter and SORT entries alphabetically
  const activeEntries = row.entries
    .filter(entry => entry.amount > 0)
    .sort((a, b) => a.amcName.localeCompare(b.amcName));

  const copyId = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(row._id);
    toast.success("ID copied to clipboard", { duration: 1000 });
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Purge ${row.accountingMonth} records?`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/commissions/${row._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success(`Records for ${row.accountingMonth} purged`);
        onDeleteSuccess(); 
      }
    } catch {
      toast.error("Server connection lost");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <tr 
        onClick={() => !isDeleting && setIsExpanded(!isExpanded)}
        className={`dark:bg-slate-900 group cursor-pointer border-b border-slate-100/50 dark:border-slate-800/30 transition-all duration-200 ${
          isExpanded 
            ? 'bg-emerald-50/50 dark:bg-emerald-500/3' 
            : 'hover:bg-slate-50/80 dark:hover:bg-slate-900/40'
        } ${isDeleting ? 'opacity-20 grayscale' : ''}`}
      >
        <td className="px-6 py-5">
          <div className="flex items-center gap-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
              isExpanded ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-emerald-500'
            }`}>
              <Calendar size={16} strokeWidth={2.5} />
            </div>
            <span className={`text-[14px] font-black tracking-tight transition-colors ${isExpanded ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-200'}`}>
              {row.accountingMonth}
            </span>
          </div>
        </td>
        <td className="px-6 py-5">
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                {activeEntries[0]?.amcName || "---"}
              </span>
              {activeEntries.length > 1 && (
                <span className="text-[9px] font-black text-emerald-500 tracking-widest mt-0.5">
                   + {activeEntries.length - 1} MORE
                </span>
              )}
            </div>
        </td>
        <td className="px-6 py-5 text-right">
          <span className={`text-[15px] font-[1000] tracking-tighter transition-all ${
            isExpanded ? 'text-emerald-600 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'text-slate-800 dark:text-slate-200'
          }`}>
            ₹{formatINR(row.totalGross)}
          </span>
        </td>
        <td className="px-6 py-5 text-center">
            <div className={`mx-auto w-2 h-2 rounded-full transition-all duration-500 ${isExpanded ? 'bg-emerald-500 scale-125 shadow-[0_0_8px_#10b981]' : 'bg-slate-300 dark:bg-slate-700'}`} />
        </td>
        <td className="px-6 py-5 text-right">
          <ChevronDown size={18} className={`ml-auto transition-transform duration-500 text-slate-300 ${isExpanded ? 'rotate-180 text-emerald-500' : 'group-hover:text-slate-400'}`} />
        </td>
      </tr>

      {/* Expanded Micro-Ledger */}
      <tr>
        <td colSpan="5" className="p-0 border-none">
          <div className={`grid transition-all duration-500 ease-in-out ${
            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'
          }`}>
            <div className="overflow-hidden bg-slate-50/60 dark:bg-slate-950/40">
              <div className="px-12 py-10 border-b border-slate-200 dark:border-slate-800/60">
                
                {/* Header for Micro Ledger */}
                <div className="flex justify-between items-center mb-6 px-4 pb-2 border-b-2 border-slate-200 dark:border-slate-800">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">AMC Breakdown </h5>
                    <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Amount</h5>
                </div>

                {/* Vertical sorting using columns-2 */}
                <div className="columns-1 md:columns-2 gap-x-16 space-y-2">
                  {activeEntries.map((entry, idx) => (
                    <div 
                      key={idx} 
                      className="break-inside-avoid mb-2 flex justify-between items-center py-3 px-4 bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 rounded-xl hover:border-emerald-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                        <span className="text-[12px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">
                          {entry.amcName}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded tabular-nums">D{entry.payoutDay || '--'}</span>
                        <span className="text-[13.5px] font-[1000] text-slate-900 dark:text-white tracking-tighter font-mono min-w-[100px] text-right">
                          ₹{formatINR(entry.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 pt-6 flex justify-between items-center border-t border-slate-300 dark:border-slate-800">
                  <button 
                    onClick={copyId}
                    className="group flex items-center gap-2 text-[9px] font-black text-slate-400 hover:text-emerald-500 transition-colors tracking-widest"
                  >
                    <Copy size={12} className="group-hover:scale-110 transition-transform" />
                    UID: {row._id.toUpperCase()}
                  </button>
                  
                  <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500/60 hover:text-red-600 transition-all tracking-[0.2em] group bg-red-500/5 px-4 py-2 rounded-lg border border-red-500/10"
                  >
                    <Trash2 size={14} className="group-hover:rotate-12 transition-transform" />
                    {isDeleting ? 'DELETING...' : 'PERMANENT DELETE'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
};

export default HistoryRow;