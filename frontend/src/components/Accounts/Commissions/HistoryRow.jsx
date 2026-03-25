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
 * Helper to format currency according to Indian Numbering System
 * Example: 100000 -> 1,00,000
 */
const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
};

const HistoryRow = ({ row, onDeleteSuccess }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter out zero-amount entries
  const activeEntries = row.entries.filter(entry => entry.amount > 0);

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
        <td className="px-6 py-4">
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
              isExpanded ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-emerald-500'
            }`}>
              <Calendar size={14} strokeWidth={2.5} />
            </div>
            <span className={`text-[12px] font-black tracking-tight transition-colors ${isExpanded ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-200'}`}>
              {row.accountingMonth}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
           <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                {activeEntries[0]?.amcName || "---"}
              </span>
              {activeEntries.length > 1 && (
                <span className="text-[8px] font-bold text-emerald-500/80 tracking-widest leading-none">
                   + {activeEntries.length - 1} OTHER SOURCES
                </span>
              )}
           </div>
        </td>
        <td className="px-6 py-4 text-right">
          <span className={`text-[13px] font-[1000] tracking-tighter transition-all ${
            isExpanded ? 'text-emerald-600 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'text-slate-800 dark:text-slate-200'
          }`}>
            ₹{formatINR(row.totalGross)}
          </span>
        </td>
        <td className="px-6 py-4 text-center">
           <div className={`mx-auto w-1.5 h-1.5 rounded-l transition-all duration-500 ${isExpanded ? 'bg-emerald-500 scale-125 shadow-[0_0_8px_#10b981]' : 'bg-slate-300 dark:bg-slate-700'}`} />
        </td>
        <td className="px-6 py-4 text-right">
          <ChevronDown size={16} className={`ml-auto transition-transform duration-500 text-slate-300 ${isExpanded ? 'rotate-180 text-emerald-500' : 'group-hover:text-slate-400'}`} />
        </td>
      </tr>

      {/* Expanded Micro-Ledger */}
      <tr>
        <td colSpan="5" className="p-0 border-none">
          <div className={`grid transition-all duration-500 ease-in-out ${
            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'
          }`}>
            <div className="overflow-hidden bg-slate-50/40 dark:bg-slate-950/20">
              <div className="px-12 py-6 border-b border-slate-100 dark:border-slate-800/60">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-1">
                  {activeEntries.map((entry, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-dashed border-slate-200 dark:border-slate-800/80 last:border-0 hover:translate-x-1 transition-transform">
                      <div className="flex items-center gap-2.5">
                        <Landmark size={11} className="text-amber-500/60" />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase truncate max-w-37.5">
                          {entry.amcName}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[8px] font-black text-slate-400/60 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase">D{entry.payoutDay || '--'}</span>
                        <span className="text-[11px] font-[1000] text-slate-800 dark:text-slate-100 tracking-tighter font-mono">
                          ₹{formatINR(entry.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-4 flex justify-between items-center border-t border-slate-200 dark:border-slate-800/50">
                  <button 
                    onClick={copyId}
                    className="group flex items-center gap-2 text-[8px] font-black text-slate-400 hover:text-emerald-500 transition-colors tracking-widest"
                  >
                    <Copy size={10} className="group-hover:scale-110 transition-transform" />
                    UID: {row._id.slice(-12).toUpperCase()}
                  </button>
                  
                  <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 text-[9px] font-black uppercase text-red-400/50 hover:text-red-600 transition-all tracking-[0.2em] group"
                  >
                    <Trash2 size={12} className="group-hover:rotate-12 transition-transform" />
                    {isDeleting ? 'PURGING...' : 'PERMANENT DELETE'}
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