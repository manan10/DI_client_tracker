import React, { useEffect, useRef } from 'react';
import { X, Calendar, FileText, Landmark, CheckCircle2, Info, Keyboard, CornerDownLeft } from 'lucide-react';

const SnapshotForm = ({ 
  isOpen, onClose, groupedAccounts, inputValues, setInputValues, 
  entryDate, onDateChange, note, setNote, onSave, saving, editingId 
}) => {
  const drawerRef = useRef(null);

  // Focus trap & Escape key listener for deep keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      // Optional: Add Cmd/Ctrl + Enter to save
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isFormValid && !saving) {
        onSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onSave, saving]);

  if (!isOpen) return null;

  // --- PRESERVED BUSINESS LOGIC ---
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
  // --------------------------------

  return (
    /* BACKDROP: Deep overlay with blur. Docked to the right. */
    <div className="fixed inset-0 z-9999 flex justify-end bg-slate-900/60 dark:bg-[#0B1120]/80 backdrop-blur-sm transition-all">
      
      {/* DRAWER CONTAINER */}
      <div 
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        className="w-full h-dvh sm:w-212.5 lg:w-237.5 bg-white dark:bg-[#0B1120] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-[100%] sm:slide-in-from-bottom-0 sm:slide-in-from-right-[100%] duration-300 sm:border-l border-slate-200 dark:border-white/10"
      >
        
        {/* --- HEADER --- */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl shadow-sm ${editingId ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
              <Landmark size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {editingId ? "Update Balances" : "Enter Daily Balances"}
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                Record your current amounts
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-900 shadow-sm">
              ESC
            </kbd>
            <X size={24} className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* --- DUAL-COLUMN WORKSPACE --- */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-y-auto sm:overflow-hidden bg-white dark:bg-[#0B1120]">
          
          {/* LEFT COLUMN: Metadata (Date & Notes) */}
          <div className="w-full sm:w-[320px] lg:w-96 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/20 p-6 sm:p-8 flex flex-col gap-6 sm:overflow-y-auto custom-scrollbar relative">
            
            {editingId && (
              <div className="bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <Info className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-amber-900 dark:text-amber-200 font-semibold leading-relaxed">
                  You are editing an existing entry. Saving will update the previous numbers.
                </p>
              </div>
            )}

            {/* Smart Container handling the Tab Hint for Date -> Note */}
            <div className="flex flex-col gap-6 [&_.meta-field:focus-within+.meta-field_.tab-hint]:opacity-100 [&_.meta-field:focus-within+.meta-field_.tab-hint]:translate-y-0">
              
              <div className="meta-field space-y-3 relative">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-300">
                  <Calendar size={16} className="text-blue-500" />
                  Date
                </label>
                <input 
                  autoFocus
                  type="date" 
                  value={entryDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-base font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm"
                />
              </div>

              <div className="meta-field space-y-3 flex-1 flex flex-col relative">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-300">
                    <FileText size={16} className="text-indigo-500" />
                    Note
                  </label>
                  
                  {/* TAB HINT: Appears when the Date field above is focused */}
                  <span className="tab-hint opacity-0 translate-y-1 transition-all duration-300 inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-md">
                    Next: Tab <CornerDownLeft size={12} />
                  </span>
                </div>
                
                <textarea 
                  rows="6"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add any details or context here..."
                  className="w-full flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-base font-medium text-slate-900 dark:text-white outline-none resize-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="hidden sm:flex items-center justify-center gap-2 mt-auto pt-6 text-slate-400 dark:text-slate-500 text-xs font-semibold">
              <Keyboard size={16} />
              <span>Use keyboard to move quickly</span>
            </div>
          </div>

          {/* RIGHT COLUMN: The Accounts */}
          <div className="flex-1 p-6 sm:p-8 sm:overflow-y-auto custom-scrollbar bg-white dark:bg-[#0B1120]">
            
            <div className="max-w-3xl mx-auto space-y-10">
              {Object.entries(groupedAccounts).map(([key, group]) => (
                <div key={key} className="relative">
                  
                  {/* Vibrant Category Header */}
                  <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <h3 className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">
                      {group.name}
                    </h3>
                  </div>
                  
                  {/* Ledger Rows Wrapper with CSS Magic for Tab Hints */}
                  <div className="flex flex-col gap-3 [&_.ledger-row:focus-within+.ledger-row_.tab-hint]:opacity-100 [&_.ledger-row:focus-within+.ledger-row_.tab-hint]:translate-x-0">
                    {group.list.map((acc) => (
                      <div 
                        key={acc._id} 
                        className="ledger-row relative flex flex-col xl:flex-row xl:items-center justify-between p-4 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 rounded-2xl transition-all gap-3 shadow-sm focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:bg-white dark:focus-within:bg-[#0B1120]"
                      >
                        
                        <div className="flex flex-col gap-1 shrink-0">
                          <label 
                            htmlFor={`input-${acc._id}`} 
                            className="text-base font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
                          >
                            {acc.name}
                          </label>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {key}
                          </span>
                        </div>
                        
                        <div className="relative w-full xl:w-80 flex items-center gap-3">
                          
                          {/* TAB HINT: Appears when the PREVIOUS row is focused */}
                          <div className="tab-hint hidden xl:flex opacity-0 -translate-x-4 transition-all duration-300 items-center justify-end flex-1 pointer-events-none">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-widest bg-indigo-100 dark:bg-indigo-500/20 px-2.5 py-1.5 rounded-md shadow-sm">
                              Next: Tab <CornerDownLeft size={12} />
                            </span>
                          </div>

                          <div className="relative w-full xl:w-56 shrink-0">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 font-bold text-sm">
                              ₹
                            </div>
                            <input 
                              id={`input-${acc._id}`}
                              type="text"
                              inputMode="decimal"
                              value={toIndianCSV(inputValues[acc._id])}
                              onChange={(e) => handleInputChange(acc._id, e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-right text-lg font-black text-slate-900 dark:text-white outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-700"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- STICKY FOOTER COMMAND BAR --- */}
        <div className="px-6 py-5 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4 z-10 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
          
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start bg-slate-50 dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-white/5">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Total Amount
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-[1000] tracking-tight ${totalAbsolute > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                ₹{totalInLakhs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-slate-400">Lakhs</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={onClose} 
              className="hidden sm:block px-6 py-3.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors outline-none"
            >
              Cancel
            </button>
            <button 
              onClick={onSave}
              disabled={!isFormValid || saving}
              className={`group w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30
              ${isFormValid 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 active:translate-y-px shadow-lg shadow-emerald-600/30 cursor-pointer' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-white/5'
              }`}
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <CheckCircle2 size={20} className={isFormValid ? "text-emerald-200" : ""} /> 
                  Save Balances
                  <kbd className={`hidden sm:inline-flex items-center justify-center px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                    isFormValid ? 'bg-emerald-700 text-emerald-100 border border-emerald-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 border border-slate-300 dark:border-slate-600'
                  }`}>
                    ⌘ ↵
                  </kbd>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnapshotForm;