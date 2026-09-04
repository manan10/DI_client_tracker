import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search, Check, CornerDownRight } from 'lucide-react';

const LedgerSearchModal = ({
  isOpen,
  activeTx,
  searchQuery,
  companyLedgers = [],
  onSearchChange,
  onSelectLedger,
  onClose
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef(null);

  // Track previous search query to reset index during render phase (avoids useEffect setState warning)
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  if (prevSearchQuery !== searchQuery) {
    setPrevSearchQuery(searchQuery);
    setSelectedIndex(0);
  }

  // =========================================================================
  // SMARTER SEARCH & RANKING ALGORITHM
  // =========================================================================
  const smartFilteredLedgers = useMemo(() => {
    if (!companyLedgers || companyLedgers.length === 0) return [];
    
    const query = (searchQuery || "").trim().toUpperCase();
    if (!query) return companyLedgers.slice(0, 100);

    const queryWords = query.split(/\s+/).filter(Boolean);

    // Score and rank ledgers intelligently
    const scored = companyLedgers.map(l => {
      const name = (l.name || "").toUpperCase();
      const group = (l.groupName || "").toUpperCase();
      let score = 0;

      // 1. Exact match gets highest priority
      if (name === query) score += 1000;

      // 2. Starts with query gets high priority
      else if (name.startsWith(query)) score += 500;

      // 3. Contains exact query string
      else if (name.includes(query)) score += 200;

      // 4. Multi-word fuzzy match (e.g. typing "HDFC BANK" matches "HDFC BANK - CURRENT A/C")
      else {
        let matchedWordsCount = 0;
        queryWords.forEach(word => {
          if (name.includes(word)) matchedWordsCount += 50;
          if (group.includes(word)) matchedWordsCount += 10;
        });
        score += matchedWordsCount;
      }

      // 5. Group match boost
      if (group.includes(query)) score += 30;

      return { ledger: l, score };
    });

    // Filter out zero-matches and sort by highest score descending
    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.ledger)
      .slice(0, 100);
  }, [companyLedgers, searchQuery]);

  // =========================================================================
  // FULL KEYBOARD ACCESSIBILITY ENGINE
  // =========================================================================
  useEffect(() => {
    if (!isOpen) return;

    const handleModalKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, smartFilteredLedgers.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (smartFilteredLedgers[selectedIndex]) {
          onSelectLedger(smartFilteredLedgers[selectedIndex].name);
        }
      }
    };

    window.addEventListener('keydown', handleModalKeyDown);
    return () => window.removeEventListener('keydown', handleModalKeyDown);
  }, [isOpen, selectedIndex, smartFilteredLedgers, onSelectLedger]);

  // Auto-scroll selected item into view inside modal
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex];
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[80vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="space-y-0.5 min-w-0 pr-4">
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
              <CornerDownRight size={11} /> Smart Ledger Search Palette
            </span>
            <p className="text-xs font-black uppercase truncate text-slate-100">
              {activeTx?.narration || "Select Master Ledger"}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
        
        {/* Search Input */}
        <div className="p-3 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/40 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              autoFocus 
              placeholder="TYPE TO SMART-SEARCH LEDGERS (USE ↑↓ AND ENTER)..." 
              value={searchQuery} 
              onChange={(e) => onSearchChange(e.target.value)} 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs font-bold uppercase outline-none focus:border-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400" 
            />
          </div>
        </div>

        {/* Filtered Ledgers List */}
        <div ref={listRef} className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
          {smartFilteredLedgers.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase">
              No matching ledgers found
            </div>
          ) : (
            smartFilteredLedgers.map((l, idx) => {
              const isSelected = activeTx?.suggestedLedger === l.name;
              const isHighlighted = idx === selectedIndex;

              return (
                <button 
                  key={l._id} 
                  type="button"
                  onClick={() => onSelectLedger(l.name)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`cursor-pointer w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase transition-colors flex items-center justify-between ${
                    isHighlighted 
                      ? 'bg-emerald-600 text-white font-black shadow-xs' 
                      : isSelected 
                        ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="truncate pr-3">{l.name}</span>
                  <span className={`text-[9px] font-mono shrink-0 ${isHighlighted ? 'text-white/80' : 'text-slate-400'}`}>
                    {l.groupName || 'PRIMARY'}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Keyboard Helper Footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Use <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">↓</kbd> to navigate</span>
          <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Enter ↵</kbd> to select</span>
        </div>

      </div>
    </div>
  );
};

export default LedgerSearchModal;