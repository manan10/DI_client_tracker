import React from 'react';
import { X, Calendar, FileText, Landmark, CheckCircle2, HelpCircle, FilePlus } from 'lucide-react';

const SnapshotForm = ({ 
  isOpen, 
  onClose, 
  groupedAccounts, 
  inputValues, 
  setInputValues, 
  entryDate, 
  setEntryDate, 
  note, 
  setNote, 
  onSave, 
  saving, 
  editingId 
}) => {
  if (!isOpen) return null;

  const toIndianCSV = (val) => {
    if (val === undefined || val === null || val === "") return "";
    const cleanVal = val.toString().replace(/,/g, "");
    if (isNaN(cleanVal)) return "";
    return new Intl.NumberFormat('en-IN').format(cleanVal);
  };

  const totalAbsolute = Object.values(inputValues).reduce((sum, v) => {
    const num = typeof v === 'string' ? v.replace(/,/g, "") : v;
    return sum + (Number(num) || 0);
  }, 0);
  
  const totalInLakhs = totalAbsolute / 100000;
  const isFormValid = entryDate && totalAbsolute > 0;

  const handleInputChange = (id, rawValue) => {
    const digits = rawValue.replace(/\D/g, "");
    setInputValues({ ...inputValues, [id]: digits });
  };

  return (
    <div className="fixed inset-0 w-full h-full z-9999 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 md:p-4 lg:p-6">
      <style>{`
        .ledger-paper-sage { 
            background-color: #f0f7f4; 
            background-image: linear-gradient(#e2ece7 1.5px, transparent 1.5px), linear-gradient(90deg, #e2ece7 1.5px, transparent 1px);
            background-size: 30px 30px;
        }
        .dark .ledger-paper-sage {
            background-color: #0f1720;
            background-image: linear-gradient(#1e293b 1.5px, transparent 1.5px), linear-gradient(90deg, #1e293b 1.5px, transparent 1px);
        }
      `}</style>

      <div className="ledger-paper-sage w-full md:max-w-7xl h-full md:h-[92vh] md:rounded-[2.5rem] border-0 md:border-2 border-emerald-200 dark:border-slate-700/50 flex flex-col overflow-hidden bg-white shadow-2xl">
        
        {/* Header */}
        <div className="px-6 md:px-10 py-5 md:py-7 border-b-2 border-emerald-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-14 bg-emerald-950 dark:bg-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Landmark className="text-amber-500" size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                {editingId ? "Modify Ledger" : "Treasury Snapshot"}
              </h2>
              <p className="text-[10px] font-black text-emerald-700/60 dark:text-slate-400 uppercase tracking-[0.2em] mt-0.5">Absolute INR • Indian Numerical Format</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-emerald-800/40 dark:text-slate-500 hover:text-emerald-900 dark:hover:text-slate-300 transition-colors">
            <X size={32} strokeWidth={3} />
          </button>
        </div>

        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          {/* Main Table */}
          <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
            <div className="bg-white/90 dark:bg-slate-700/40 rounded-3xl border-2 border-emerald-100 dark:border-slate-800 p-4 md:p-8 shadow-inner backdrop-blur-sm">
              <table className="w-full border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-emerald-800/50 dark:text-slate-500">
                    <th className="text-left px-6">Bank Account</th>
                    <th className="text-right px-6">Balance (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedAccounts).map(([key, group]) => (
                    <React.Fragment key={key}>
                      <tr>
                        <td colSpan="2" className="pt-8 pb-2 px-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-amber-600 uppercase tracking-[0.3em] italic">{group.name}</span>
                            <div className="h-px flex-1 bg-emerald-200/50 dark:bg-slate-500" />
                          </div>
                        </td>
                      </tr>
                      {group.list.map(acc => (
                        <tr key={acc._id} className="group hover:bg-emerald-50/50 dark:hover:bg-slate-800/40 rounded-xl">
                          <td className="py-3 px-6 text-xl font-bold text-slate-900 dark:text-slate-200 tracking-tight">
                            {acc.name}
                          </td>
                          <td className="py-2 px-1 text-right">
                            <div className="inline-flex items-center relative w-full md:w-72">
                              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-700/30 dark:text-slate-600 font-black text-lg italic pointer-events-none">₹</span>
                              <input 
                                type="text"
                                value={toIndianCSV(inputValues[acc._id])}
                                onChange={(e) => handleInputChange(acc._id, e.target.value)}
                                placeholder="0"
                                className="w-full bg-white dark:bg-slate-900 border-2 border-emerald-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-right text-2xl font-black text-slate-900 dark:text-white outline-none focus:border-amber-500/80 transition-all shadow-sm"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden md:flex flex-col w-1/3 max-w-sm shrink-0 p-10 gap-8 border-l-2 border-emerald-100 dark:border-slate-800 bg-emerald-50/40 dark:bg-slate-900/20 overflow-y-auto custom-scrollbar">
             <div className="space-y-3">
                <label className="text-xs font-black text-emerald-800 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Calendar size={18} className="text-amber-600" /> Entry Date
                </label>
                <input 
                  type="date" 
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-700 border-2 border-emerald-100 dark:border-slate-700 rounded-2xl px-5 py-5 text-lg font-black text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-emerald-800 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <FileText size={18} className="text-amber-600" /> Snapshot Notes
                </label>
                <textarea 
                  rows="10"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add notes (optional)"
                  className="w-full bg-white dark:bg-slate-700 border-2 border-emerald-100 dark:border-slate-700 rounded-2xl px-5 py-5 text-base font-bold text-slate-900 dark:text-white outline-none resize-none focus:border-amber-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-400"
                />
              </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 border-t-2 border-emerald-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950 shrink-0">
          <div className="flex flex-col">
              <span className="text-[10px] font-black text-emerald-800/50 dark:text-slate-500 uppercase tracking-widest leading-none mb-2">Aggregate Treasury</span>
              <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-amber-500 italic">₹</span>
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                      {totalInLakhs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-sm font-black text-emerald-600 dark:text-slate-400 uppercase ml-1 italic">Lakhs</span>
              </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={onClose} 
              className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-800/40 dark:text-slate-500 hover:text-rose-600 transition-colors"
            >
              Discard
            </button>
            <button 
                onClick={onSave}
                disabled={!isFormValid || saving}
                className={`px-16 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all border-b-4 active:border-b-0 active:translate-y-1
                ${isFormValid 
                    ? 'bg-emerald-700 dark:bg-amber-500 border-emerald-900 dark:border-amber-700 text-white dark:text-slate-950 hover:bg-emerald-600 dark:hover:bg-amber-400' 
                    : 'bg-emerald-100 dark:bg-slate-800 border-emerald-200 dark:border-slate-700 text-emerald-800/30 dark:text-slate-500/60 cursor-not-allowed shadow-none'
                }`}
            >
                {saving ? "..." : <><CheckCircle2 size={18} strokeWidth={3} className="inline mr-2" /> Commit Snapshot</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnapshotForm;