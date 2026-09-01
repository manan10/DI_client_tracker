import React from 'react';
import { Search, X } from 'lucide-react';

const GlobalLedgerModal = ({
  ledgerModalMode,
  searchQuery,
  onSearchChange,
  filteredLedgers = [],
  selection,
  activeTx,
  showAllLedgers,
  onToggleShowAll,
  onSelectLedger,
  onClearOverride,
  onClose
}) => {
  if (!ledgerModalMode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150">
        
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="space-y-0.5 min-w-0 pr-4">
            <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
              {ledgerModalMode === 'GLOBAL' ? 'Global Default Fallback' : 'Sales Ledger Override'}
            </span>
            <p className="text-xs font-black uppercase truncate text-slate-100">
              {ledgerModalMode === 'GLOBAL' ? 'Select fallback for unmapped sales items' : activeTx?.narration}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="cursor-pointer p-1.5 text-slate-400 hover:text-white bg-white/10 rounded-md transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-3 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/40 shrink-0 flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              autoFocus 
              placeholder="SEARCH TALLY LEDGERS..." 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs font-bold uppercase outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400" 
              value={searchQuery} 
              onChange={(e) => onSearchChange(e.target.value)} 
            />
          </div>

          {ledgerModalMode === 'INDIVIDUAL' && activeTx?.individualSalesLedger && (
            <button
              type="button"
              onClick={onClearOverride}
              className="px-3 py-2 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold uppercase hover:bg-rose-100 cursor-pointer border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400"
            >
              Clear Override
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
          {filteredLedgers.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2 opacity-60">
              <Search size={24} />
              <p className="text-xs font-bold uppercase tracking-wider">No ledgers match "{searchQuery}"</p>
            </div>
          ) : (
            <>
              {filteredLedgers.map(l => {
                const isSelected = ledgerModalMode === 'GLOBAL' 
                  ? selection.salesIncomeLedger === l.name 
                  : activeTx?.activeSalesLedger === l.name;

                return (
                  <button 
                    key={l._id} 
                    type="button"
                    onClick={() => onSelectLedger(l.name)} 
                    className={`cursor-pointer w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase transition-colors flex items-center justify-between group ${
                      isSelected 
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="truncate pr-4">{l.name}</span>
                    <span className="text-[9px] font-mono uppercase text-slate-400 shrink-0">
                      {l.groupName || 'PRIMARY'}
                    </span>
                  </button>
                );
              })}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onToggleShowAll}
                  className="cursor-pointer w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {showAllLedgers ? "Show Recommended Ledgers Only" : "Show All Company Ledgers"}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default GlobalLedgerModal;