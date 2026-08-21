import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Ban, CheckCircle2, Building2, Calendar } from 'lucide-react';

const formatINR = (val) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(val || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const MappingRow = ({ idx, result, sortedAmcList = [], onUpdateMapping, onToggleExclude }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredAmcs = sortedAmcList.filter(amc => {
    const name = typeof amc === 'string' ? amc : amc.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const isMapped = Boolean(result.amcName);

  return (
    <div 
      className={`relative transition-all duration-200 rounded-xl border p-4 bg-white dark:bg-[#0B1120] ${
        isOpen 
          ? 'z-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
          : result.isExcluded
            ? 'z-10 border-slate-200/60 dark:border-white/5 opacity-50 bg-slate-50/50 dark:bg-white/1'
            : 'z-10 border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        
        {/* Left Info: Narration, Date & Amount */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate block">
              {result.narration || "Bank Receipt Entry"}
            </span>
            {result.date && (
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                • {formatDate(result.date)}
              </span>
            )}
          </div>
          
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-slate-400">₹</span>
            <span className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              {formatINR(result.amount)}
            </span>
          </div>
        </div>

        {/* Right Action: AMC Selector Dropdown + Exclude Button */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          
          {/* AMC Dropdown Target */}
          <div className="relative flex-1 sm:w-72" ref={dropdownRef}>
            <button 
              type="button"
              disabled={result.isExcluded}
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer select-none ${
                result.isExcluded
                  ? 'bg-slate-100 dark:bg-white/5 text-slate-400 border-transparent cursor-not-allowed'
                  : isMapped
                    ? 'bg-emerald-50/60 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50/60 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 animate-pulse'
              }`}
            >
              <span className="truncate pr-2 uppercase font-mono">
                {result.amcName || "Map Target AMC..."}
              </span>
              <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Popover */}
            {isOpen && (
              <div className="absolute top-full mt-2 w-full left-0 bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-120 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
                <div className="p-2.5 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/2 flex items-center gap-2">
                  <Search size={14} className="text-slate-400 ml-1 shrink-0" />
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Search registered AMCs..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs font-mono font-medium outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto no-scrollbar">
                  {filteredAmcs.map((amc, i) => {
                    const amcName = typeof amc === 'string' ? amc : amc.name;
                    const isSelected = result.amcName === amcName;

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          onUpdateMapping(idx, amcName);
                          setIsOpen(false);
                          setSearchQuery('');
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs font-bold transition-colors border-b border-slate-50 dark:border-white/3 last:border-0 flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                            : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate uppercase font-mono">{amcName}</span>
                        {isSelected && <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}

                  {filteredAmcs.length === 0 && (
                    <div className="p-4 text-center text-xs font-mono text-slate-400">
                      No matching AMCs found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Exclude / Include Toggle */}
          <button 
            type="button"
            onClick={() => onToggleExclude(idx)}
            className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
              result.isExcluded 
                ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-300' 
                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10'
            }`}
            title={result.isExcluded ? "Include this entry" : "Exclude non-commission entry"}
          >
            {result.isExcluded ? <CheckCircle2 size={16} /> : <Ban size={16} />}
          </button>

        </div>

      </div>
    </div>
  );
};

export default MappingRow;