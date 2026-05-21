import React, { useState } from 'react';
import { Calendar, ChevronDown, Trash2, Copy, FileText } from 'lucide-react';
import { toast } from 'sonner';

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const HistoryRow = ({ row, onDeleteSuccess }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      {/* DESKTOP ROW (Original) */}
      <tr 
        onClick={() => !isDeleting && setIsExpanded(!isExpanded)}
        className="hidden md:table-row dark:bg-slate-900 group cursor-pointer border-b border-slate-100/50 dark:border-slate-800/30 hover:bg-slate-50/80 transition-all"
      >
        <td className="px-6 py-5">
          <div className="flex items-center gap-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              <Calendar size={16} />
            </div>
            <span className="text-[14px] font-black">{row.accountingMonth}</span>
          </div>
        </td>
        <td className="px-6 py-5 text-center text-[11px] font-black uppercase text-slate-500">
            {activeEntries[0]?.amcName || "---"}
            {activeEntries.length > 1 && <div className="text-[9px] text-emerald-500 mt-0.5">+ {activeEntries.length - 1} MORE</div>}
        </td>
        <td className="px-6 py-5 text-right text-[15px] font-[1000]">₹{formatINR(row.totalGross)}</td>
        <td className="px-6 py-5 text-center">
            <div className={`w-2 h-2 rounded-full ${isExpanded ? 'bg-emerald-500' : 'bg-slate-300'}`} />
        </td>
        <td className="px-6 py-5 text-right"><ChevronDown size={18} className={`ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`} /></td>
      </tr>

      {/* MOBILE COMPACT CARD (New & Better) */}
      <div className="md:hidden p-4 border-b border-slate-100 bg-white" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-start mb-2">
            <div>
                <div className="font-black text-[12px] uppercase tracking-widest">{row.accountingMonth}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">{activeEntries[0]?.amcName || "---"}</div>
            </div>
            <div className="text-right">
                <div className="font-[1000] text-[14px] text-emerald-700">₹{formatINR(row.totalGross)}</div>
                {activeEntries.length > 1 && <span className="text-[9px] font-black text-emerald-500">+ {activeEntries.length - 1} MORE</span>}
            </div>
        </div>
      </div>

      {/* EXPANDED MICRO-LEDGER (Shared Logic) */}
      {isExpanded && (
        <tr>
          <td colSpan="5" className="p-0 border-none">
            <div className="bg-slate-50/60 p-4 md:px-12 md:py-10 border-b border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeEntries.map((entry, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3 px-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <FileText size={14} className="text-slate-300" />
                        <span className="text-[11px] font-black text-slate-700 uppercase">{entry.amcName}</span>
                    </div>
                    <span className="text-[12px] font-[1000] text-slate-900 tabular-nums">₹{formatINR(entry.amount)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 flex justify-between items-center border-t border-slate-300">
                <button onClick={copyId} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-500">
                  <Copy size={12} /> UID: {row._id.toUpperCase()}
                </button>
                <button onClick={handleDelete} disabled={isDeleting} className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500 hover:text-red-700 tracking-widest">
                  <Trash2 size={12} /> {isDeleting ? 'DELETING...' : 'DELETE'}
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default HistoryRow;