import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, XCircle, Undo2, AlertCircle, CheckCircle2 } from 'lucide-react';

const formatIndianNumber = (num) => {
  if (!num) return '0.00';
  const numStr = num.toString();
  const parts = numStr.split('.');
  const integerPart = parts[0].replace(/,/g, '');
  const decimalPart = parts[1] !== undefined ? '.' + parts[1].padEnd(2, '0') : '.00';
  const lastThree = integerPart.slice(-3);
  const otherParts = integerPart.slice(0, -3);
  const formattedInteger = otherParts ? (otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree) : lastThree;
  return formattedInteger + decimalPart;
};

const formatFullDate = (dateStr) => {
  if (!dateStr) return 'Unknown Date';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

const MappingRow = ({ result, idx, sortedAmcList, onUpdateMapping, onToggleExclude }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const isUnmapped = !result.amcName;

  // Handle click outside to close dropdown safely
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filteredAmcs = sortedAmcList.filter(amc => {
    const name = typeof amc === 'string' ? amc : amc.name;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className={`flex flex-col p-4 rounded-xl transition-all border relative shrink-0 ${isOpen ? 'z-50 shadow-md ring-2 ring-emerald-500/10' : 'z-10'} ${
      result.isExcluded 
        ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/50 opacity-60 grayscale' 
        : isUnmapped 
          ? 'bg-amber-50/40 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50 shadow-sm' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm hover:border-emerald-500/30'
    }`}>
      
      {/* Top Half: Data Context */}
      <div className="flex justify-between items-start gap-4 mb-4 w-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {formatFullDate(result.date)}
            </span>
            {isUnmapped && !result.isExcluded && (
              <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                <AlertCircle size={10}/> Needs Mapping
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 leading-snug line-clamp-2" title={result.rawNarration}>
            {result.rawNarration}
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className={`text-base sm:text-lg font-[1000] tabular-nums tracking-tight block leading-none ${result.isExcluded ? 'text-slate-400 line-through decoration-slate-400/50' : 'text-slate-900 dark:text-white'}`}>
            ₹{formatIndianNumber(result.amount)}
          </span>
        </div>
      </div>

      {/* Bottom Half: Interactive Actions */}
      <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 relative">
        <div className="flex-1 min-w-0" ref={dropdownRef}>
          <button 
            type="button"
            disabled={result.isExcluded}
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg border-2 transition-all group ${
              result.isExcluded 
                ? 'bg-transparent border-transparent text-slate-400 cursor-not-allowed' 
                : isUnmapped 
                  ? 'bg-amber-100/50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-400 hover:border-amber-400 dark:hover:border-amber-500' 
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400 hover:border-emerald-400 hover:bg-white dark:hover:bg-slate-900'
            }`}
          >
            <span className={`text-xs sm:text-sm font-bold truncate pr-2 ${!isUnmapped && !result.isExcluded ? 'text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors' : ''}`}>
              {result.amcName || "Select target AMC ledger..."}
            </span>
            <ChevronDown size={14} className={`shrink-0 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-[999] overflow-hidden animate-in fade-in zoom-in-95 origin-top">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search AMC list..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 text-xs font-bold pl-9 pr-3 py-2.5 rounded-lg outline-none focus:ring-2 ring-emerald-500/20 border border-slate-200 dark:border-slate-800 dark:text-white transition-all placeholder:font-medium"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-56 overflow-y-auto p-1.5 scrollbar-thin">
                {filteredAmcs.length === 0 ? (
                  <div className="text-xs font-medium text-center text-slate-400 py-6">No matching AMCs found.</div>
                ) : (
                  filteredAmcs.map(amc => {
                    const name = typeof amc === 'string' ? amc : amc.name;
                    const isSelected = result.amcName === name;
                    return (
                      <button
                        key={name}
                        onClick={() => {
                          onUpdateMapping(idx, name);
                          setIsOpen(false);
                          setSearch('');
                        }}
                        className={`w-full text-left px-3 py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-between ${
                          isSelected 
                            ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate pr-2">{name}</span>
                        {isSelected && <CheckCircle2 size={14} className="shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <button 
          type="button"
          onClick={() => onToggleExclude(idx)}
          className={`shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-2.5 rounded-lg transition-all border-2 ${
            result.isExcluded 
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300' 
              : 'bg-white dark:bg-slate-950 text-rose-500 border-rose-100 dark:border-rose-900/30 hover:border-rose-300 dark:hover:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10'
          }`}
        >
          {result.isExcluded ? <><Undo2 size={14} /> Restore</> : <><XCircle size={14} /> Exclude</>}
        </button>
      </div>
    </div>
  );
};

export default MappingRow;