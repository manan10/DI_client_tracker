import React from 'react';
import { X, Calendar, FileText, Landmark, CheckCircle2, Info } from 'lucide-react';

const SnapshotForm = ({ 
  isOpen, onClose, groupedAccounts, inputValues, setInputValues, 
  entryDate, onDateChange, note, setNote, onSave, saving, editingId 
}) => {
  if (!isOpen) return null;

  const toIndianCSV = (val) => {
    if (val === undefined || val === null || val === "") return "";
    const parts = val.toString().split('.');
    const integerPart = parts[0].replace(/,/g, "");
    const formattedInteger = new Intl.NumberFormat('en-IN').format(integerPart);
    return parts.length > 1 ? `${formattedInteger}.${parts[1].slice(0, 2)}` : formattedInteger;
  };

  const totalAbsolute = Object.values(inputValues).reduce((sum, v) => {
    const num = typeof v === 'string' ? v.replace(/,/g, "") : v;
    return sum + (Number(num) || 0);
  }, 0);
  
  const totalInLakhs = totalAbsolute / 100000;
  const isFormValid = entryDate && totalAbsolute > 0;

  const handleInputChange = (id, rawValue) => {
    let cleanValue = rawValue.replace(/[^0-9.]/g, "");
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
    setInputValues({ ...inputValues, [id]: cleanValue });
  };

  return (
    /* BACKDROP: Justify-end forces the drawer to dock to the right edge of the screen */
    <div className="fixed inset-0 z-9999 flex justify-end bg-slate-900/60 backdrop-blur-sm transition-all">
      
      {/* DRAWER CONTAINER: 
        Mobile: Full height, full width. 
        Desktop: Full height, docked right, massive 950px width.
      */}
      <div className="w-full h-dvh sm:w-212.5 lg:w-237.5 bg-white dark:bg-slate-950 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-[100%] sm:slide-in-from-bottom-0 sm:slide-in-from-right-[100%] duration-300 sm:border-l border-slate-200 dark:border-slate-800">
        
        {/* --- HEADER --- */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <Landmark className="text-emerald-600 dark:text-emerald-500" size={20} />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {editingId ? "Update Ledger" : "Log Balances"}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors outline-none"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- DUAL-COLUMN WORKSPACE --- */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-y-auto sm:overflow-hidden bg-white dark:bg-slate-950">
          
          {/* LEFT COLUMN: Metadata (Date & Notes) */}
          <div className="w-full sm:w-[320px] lg:w-90 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 p-6 sm:p-8 flex flex-col gap-6 sm:overflow-y-auto custom-scrollbar">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Entry Date
              </label>
              <input 
                type="date" 
                value={entryDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-4 py-3 text-base sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
              />
            </div>

            {editingId && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 flex items-start gap-3">
                <Info className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                  Modifying an existing entry for this date. Saving will override the previous records.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Internal Note
              </label>
              <textarea 
                rows="5"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reference details..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-4 py-3 text-base sm:text-sm font-medium text-slate-900 dark:text-white outline-none resize-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: The Ledger / Accounts */}
          <div className="flex-1 p-6 sm:p-8 sm:overflow-y-auto custom-scrollbar">
            {Object.entries(groupedAccounts).map(([key, group]) => (
              <div key={key} className="mb-8 last:mb-0">
                
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                  {group.name}
                </h3>
                
                <div className="flex flex-col gap-1">
                  {group.list.map(acc => (
                    <div key={acc._id} className="flex flex-col xl:flex-row xl:items-center justify-between py-3 xl:py-2 border-b border-slate-50 dark:border-slate-800/50 group hover:bg-slate-50 dark:hover:bg-slate-900/50 xl:px-3 xl:-mx-3 rounded-md transition-colors gap-2">
                      
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                        {acc.name}
                      </label>
                      
                      <div className="relative w-full xl:w-56">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                        <input 
                          type="text"
                          inputMode="decimal"
                          value={toIndianCSV(inputValues[acc._id])}
                          onChange={(e) => handleInputChange(acc._id, e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md py-3 xl:py-2 pl-8 pr-3 text-right text-base xl:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- STICKY FOOTER --- */}
        <div className="px-6 py-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Balance
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-[1000] text-slate-900 dark:text-white tracking-tight">
                ₹{totalInLakhs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase">Lakhs</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={onClose} 
              className="hidden sm:block px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors outline-none"
            >
              Cancel
            </button>
            <button 
              onClick={onSave}
              disabled={!isFormValid || saving}
              className={`w-full sm:w-auto px-10 py-3.5 sm:py-2.5 rounded-md font-bold uppercase text-sm sm:text-xs tracking-wider transition-all flex items-center justify-center gap-2 outline-none
              ${isFormValid 
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white hover:bg-slate-800 dark:hover:bg-emerald-500 active:scale-[0.98] shadow-sm' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              {saving ? "Saving..." : <><CheckCircle2 size={16} /> Save Record</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnapshotForm;