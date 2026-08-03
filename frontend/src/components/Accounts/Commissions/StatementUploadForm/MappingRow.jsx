import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Ban, CheckCircle2 } from 'lucide-react';

const MappingRow = ({ idx, result, sortedAmcList, onUpdateMapping, onToggleExclude }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAmcs = sortedAmcList.filter(amc => {
    const name = typeof amc === 'string' ? amc : amc.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // THE FIX: Active row gets z-[100], others default to z-10
  return (
    <div 
      className={`relative transition-all duration-200 rounded-xl border p-4 bg-white dark:bg-slate-900 
      ${isOpen ? 'z-[100] border-blue-500 shadow-md ring-4 ring-blue-500/10' : 'z-10 border-slate-200 dark:border-slate-700 hover:border-slate-300 shadow-sm'}
      ${result.isExcluded ? 'opacity-60 grayscale' : ''}`}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        
        {/* Meta Info */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black uppercase text-slate-400 mb-1 line-clamp-1">
            {result.narration || "No Narration"}
          </div>
          <div className="text-lg font-[1000] text-slate-800 dark:text-white tracking-tight">
            ₹{result.amount?.toLocaleString('en-IN') || '0'}
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          
          {/* AMC Dropdown Target */}
          <div className="relative flex-1 sm:w-64" ref={dropdownRef}>
            <button 
              type="button"
              disabled={result.isExcluded}
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50"
            >
              <span className="truncate pr-2">{result.amcName || "Select AMC..."}</span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu (Absolutely Positioned) */}
            {isOpen && (
              <div className="absolute top-full mt-2 w-full left-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-[110] overflow-hidden flex flex-col">
                <div className="p-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
                  <Search size={14} className="text-slate-400 ml-1" />
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Search AMCs..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium outline-none dark:text-white"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto custom-scroll">
                  {filteredAmcs.map((amc, i) => {
                    const amcName = typeof amc === 'string' ? amc : amc.name;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          onUpdateMapping(idx, amcName);
                          setIsOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-200 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                      >
                        {amcName}
                      </button>
                    );
                  })}
                  {filteredAmcs.length === 0 && (
                    <div className="p-4 text-center text-sm text-slate-400">No AMCs found.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Exclude Toggle */}
          <button 
            type="button"
            onClick={() => onToggleExclude(idx)}
            className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-lg border transition-colors ${
              result.isExcluded 
                ? 'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700' 
                : 'bg-white border-slate-200 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:bg-slate-950 dark:border-slate-800'
            }`}
            title={result.isExcluded ? "Include this receipt" : "Exclude (Not a commission)"}
          >
            {result.isExcluded ? <CheckCircle2 size={18} /> : <Ban size={18} />}
          </button>
        </div>

      </div>
    </div>
  );
};

export default MappingRow;