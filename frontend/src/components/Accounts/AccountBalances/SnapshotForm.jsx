import React from 'react';
import { X, Calendar, FileText, Landmark, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 w-full h-full z-9999 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 md:p-6 lg:p-10">
      {/* Container - Removed ledger-paper-sage grid classes */}
      <div className="w-full md:max-w-6xl h-full md:h-auto md:max-h-[90vh] md:rounded-xl border-0 md:border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden bg-white dark:bg-slate-950 shadow-2xl transition-all">
        
        {/* Header - More Compact */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center shadow-sm">
              <Landmark className="text-emerald-500" size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                {editingId ? "Modify Ledger" : "Treasury Snapshot"}
              </h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Absolute INR Mode</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all">
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          {/* Main Table Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-slate-50/30 dark:bg-transparent">
            <div className="max-w-3xl mx-auto space-y-6">
              {Object.entries(groupedAccounts).map(([key, group]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-3 px-2">
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em] italic whitespace-nowrap">{group.name}</span>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  </div>
                  
                  <div className="grid gap-2">
                    {group.list.map(acc => (
                      <div key={acc._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all shadow-sm group">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 pl-2">
                          {acc.name}
                        </span>
                        
                        <div className="relative w-full sm:w-64">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 font-bold text-sm italic pointer-events-none">₹</span>
                          <input 
                            type="text"
                            value={toIndianCSV(inputValues[acc._id])}
                            onChange={(e) => handleInputChange(acc._id, e.target.value)}
                            placeholder="0"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 pl-9 pr-4 text-right text-base font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar - Compact and Tighter */}
          <div className="flex flex-col w-full md:w-80 shrink-0 p-6 gap-6 border-l border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} className="text-emerald-500" /> Entry Date
                </label>
                <input 
                  type="date" 
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14} className="text-emerald-500" /> Internal Note
                </label>
                <textarea 
                  rows="6"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Memo..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none resize-none focus:border-emerald-500 transition-all placeholder:text-slate-400"
                />
              </div>
          </div>
        </div>

        {/* Footer - Optimized Height */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-950 shrink-0">
          <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Snapshot Total</span>
              <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-emerald-500 italic">₹</span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {totalInLakhs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase italic">Lakhs</span>
              </div>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={onClose} 
              className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
            >
              Discard
            </button>
            <button 
                onClick={onSave}
                disabled={!isFormValid || saving}
                className={`flex-1 sm:flex-none px-10 py-3.5 rounded-lg font-black uppercase text-[10px] tracking-[0.15em] shadow-lg transition-all active:scale-95
                ${isFormValid 
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white hover:bg-black dark:hover:bg-emerald-500' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
            >
                {saving ? "Processing..." : <><CheckCircle2 size={14} className="inline mr-2 -mt-0.5" /> Commit Snapshot</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnapshotForm;