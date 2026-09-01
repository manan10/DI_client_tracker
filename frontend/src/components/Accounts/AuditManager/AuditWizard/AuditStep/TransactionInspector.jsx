import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  FileText, Landmark, ChevronDown, Edit3, Tag, 
  ShieldAlert, Check, ChevronLeft, ChevronRight, Loader2,
  Zap, CheckCircle2, ListFilter, Search, X, Calendar
} from 'lucide-react';

const HighlightedNarration = ({ narration, ledgerName }) => {
  if (!narration) return null;
  if (!ledgerName) return <span className="text-slate-900 dark:text-slate-100">{narration}</span>;

  const ignoreWords = ['LTD', 'PVT', 'LIMITED', 'PRIVATE', 'A/C', 'ACCOUNT', 'BANK', 'THE', 'AND', 'OF', 'CORP', 'CORPORATION', 'INC', 'LLP'];
  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  const tokens = ledgerName.toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(w => w.length > 2 && !ignoreWords.includes(w))
    .map(escapeRegExp);

  if (tokens.length === 0) return <span className="text-slate-900 dark:text-slate-100">{narration}</span>;

  const regex = new RegExp(`(${tokens.join('|')})`, 'gi');
  const parts = narration.split(regex);

  return (
    <span className="text-slate-900 dark:text-slate-100 font-mono">
      {parts.map((part, i) => {
        const isMatch = tokens.some(t => new RegExp(`^${t}$`, 'i').test(part));
        return isMatch ? (
          <span key={i} className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/20 dark:bg-emerald-500/30 px-1.5 py-0.5 rounded-sm border border-emerald-500/40">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </span>
  );
};

const TransactionInspector = ({
  activeTx,
  activeTab,
  currentBank,
  currentIndex,
  displayTransactions = [],
  verifiedIds = [],
  totalItems,
  verifiedCount,
  isCurrentVerified,
  isVerifying,
  onOpenLedgerModal,
  onToggleSale,
  onToggleComm,
  onToggleManual,
  onCustomNarrationChange,
  onPrev,
  onNext,
  onSetIndex,
  onVerifyAndAdvance,
  onJumpNextPending,
  pendingCount,
  formatINR
}) => {
  const [isJumpMenuOpen, setIsJumpMenuOpen] = useState(false);
  const [jumpSearch, setJumpSearch] = useState("");
  const popoverRef = useRef(null);

  // Close jump menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsJumpMenuOpen(false);
      }
    };
    if (isJumpMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isJumpMenuOpen]);

  // Filter list inside Browse Queue Popover
  const filteredJumpList = useMemo(() => {
    if (!jumpSearch) return displayTransactions;
    const q = jumpSearch.toLowerCase();
    return displayTransactions.filter(t => 
      (t.narration && t.narration.toLowerCase().includes(q)) ||
      (t.suggestedLedger && t.suggestedLedger.toLowerCase().includes(q)) ||
      String(t.amount).includes(q)
    );
  }, [displayTransactions, jumpSearch]);

  if (!activeTx) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 text-slate-400">
        <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
          <CheckCircle2 size={26} />
        </div>
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
          All Transactions Reconciled
        </h3>
        <p className="text-xs text-slate-500 max-w-xs">
          Every statement line in this batch has been mapped and verified.
        </p>
      </div>
    );
  }

  const percent = totalItems > 0 ? Math.round((verifiedCount / totalItems) * 100) : 0;
  const isReceipt = activeTab === 'RECEIPT';
  const txDate = new Date(activeTx.date);
  
  const dayStr = txDate.getDate().toString().padStart(2, '0');
  const monthStr = txDate.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
  const yearStr = txDate.getFullYear();
  const weekdayStr = txDate.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase();

  return (
    <div className="relative flex-1 flex flex-col justify-between h-full min-w-0 overflow-hidden bg-[#F8FAFC] dark:bg-[#07090E]">
      
      {/* 1. TOP PROGRESS & BROWSE QUEUE BAR */}
      <div className="px-5 py-2.5 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0F19] flex items-center justify-between gap-3 shrink-0">
        
        {/* Counter & Progress Track */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2 py-0.5 rounded-sm bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-mono font-black">
              #{currentIndex + 1}
            </span>
            <span className="text-xs font-bold text-slate-400">of {totalItems}</span>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-24 sm:w-36 h-2 bg-slate-200 dark:bg-slate-800 rounded-sm overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300 rounded-sm" 
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {percent}%
            </span>
          </div>
        </div>

        {/* Quick Pending Jump & Browse Queue Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {pendingCount > 0 && (
            <button
              type="button"
              onClick={onJumpNextPending}
              className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider transition-all"
              title="Jump to next pending item"
            >
              <Zap size={12} className="text-amber-600 dark:text-amber-400 fill-current" />
              <span>{pendingCount} Pending</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsJumpMenuOpen(prev => !prev)}
            className={`cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold uppercase tracking-wider transition-all ${
              isJumpMenuOpen 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <ListFilter size={12} />
            <span>Browse Queue</span>
          </button>

          {isCurrentVerified && (
            <span className="px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[11px] font-black uppercase inline-flex items-center gap-1 border border-emerald-500/30">
              <Check size={12} strokeWidth={3} /> Verified
            </span>
          )}
        </div>
      </div>

      {/* BROWSE QUEUE POPOVER DRAWER */}
      {isJumpMenuOpen && (
        <div 
          ref={popoverRef}
          className="absolute top-12 left-5 right-5 z-50 bg-white dark:bg-[#0E131F] border border-slate-300 dark:border-white/15 rounded-lg shadow-xl overflow-hidden animate-in fade-in duration-150 p-3 space-y-2.5 max-h-80 flex flex-col"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Search size={12} className="text-emerald-500" /> Direct Jump
            </span>
            <button
              type="button"
              onClick={() => setIsJumpMenuOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-sm cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              autoFocus
              type="text"
              placeholder="SEARCH NARRATION, AMOUNT OR LEDGER..."
              value={jumpSearch}
              onChange={(e) => setJumpSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md pl-8 pr-3 py-1.5 text-xs font-bold uppercase outline-none focus:border-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
            {filteredJumpList.length === 0 ? (
              <div className="p-4 text-center text-xs font-bold text-slate-400 uppercase">
                No matching records
              </div>
            ) : (
              filteredJumpList.map((tx) => {
                const originalIndex = displayTransactions.findIndex(t => t._id === tx._id);
                const isChecked = (verifiedIds || []).includes(tx._id);
                const isSelected = originalIndex === currentIndex;

                return (
                  <button
                    key={tx._id}
                    type="button"
                    onClick={() => {
                      onSetIndex(originalIndex);
                      setIsJumpMenuOpen(false);
                      setJumpSearch("");
                    }}
                    className={`cursor-pointer w-full text-left p-2 rounded-md flex items-center justify-between gap-2 border transition-all ${
                      isSelected 
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white font-black' 
                        : isChecked 
                          ? 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20' 
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-white/5 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                        isSelected 
                          ? 'bg-white/20 text-white dark:bg-slate-900 dark:text-white' 
                          : isChecked 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {isChecked ? <Check size={10} strokeWidth={3.5} /> : `#${originalIndex + 1}`}
                      </span>
                      <p className="text-xs uppercase truncate font-bold">{tx.narration}</p>
                    </div>

                    <span className="text-xs font-mono font-black tabular-nums shrink-0">
                      {formatINR(Math.abs(tx.amount))}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 2. MAIN TRANSACTION CANVAS */}
      <div className="flex-1 p-4 lg:p-6 space-y-3.5 overflow-y-auto no-scrollbar min-w-0 flex flex-col justify-center">
        
        {/* ========================================================================= */}
        {/* CONSOLIDATED LEDGER PANEL (SaaS Enterprise Grid Aesthetic)               */}
        {/* ========================================================================= */}
        <div className={`rounded-lg border-2 bg-white dark:bg-[#0E131F] shadow-xs overflow-hidden ${
          isReceipt ? 'border-emerald-500/40' : 'border-rose-500/40'
        }`}>
          
          {/* HEADER ROW: HIGH-PRECISION DATE BADGE + TAGS + CURRENCY HERO */}
          <div className="p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/2">
            
            {/* Left: Financial Date Block & Voucher Identity */}
            <div className="flex items-center gap-3.5 min-w-0">
              
              {/* Refined Terminal Date Block */}
              <div className="flex items-stretch rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden shrink-0">
                <div className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white flex flex-col items-center justify-center min-w-10">
                  <span className="text-base font-black font-mono leading-none tracking-tight">
                    {dayStr}
                  </span>
                  <span className="text-[9px] font-mono font-bold uppercase text-emerald-400 leading-tight mt-0.5">
                    {weekdayStr}
                  </span>
                </div>
                <div className="px-3 py-1.5 flex flex-col justify-center bg-white dark:bg-slate-900">
                  <span className="text-xs font-black font-mono uppercase text-slate-800 dark:text-slate-100 leading-none">
                    {monthStr}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400 leading-none mt-0.5">
                    {yearStr}
                  </span>
                </div>
              </div>

              {/* Tag & Source Bank */}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm border shadow-2xs shrink-0 ${
                    isReceipt 
                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40' 
                      : 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/40'
                  }`}>
                    {activeTab}
                  </span>
                  <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 truncate">
                    • {activeTx.bank || currentBank}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 mt-0.5 truncate">
                  Voucher Transformation Desk
                </span>
              </div>
            </div>

            {/* Right: Currency Figure */}
            <div className="text-left sm:text-right shrink-0">
              <span className={`text-3xl sm:text-4xl lg:text-5xl font-mono font-black italic tracking-tight tabular-nums ${
                isReceipt ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {formatINR(Math.abs(activeTx.amount))}
              </span>
            </div>
          </div>

          {/* FLUSH REVIEW AREA: STATEMENT NARRATION + ATTACHED LEDGER DROPDOWN */}
          <div className="p-4 sm:p-4.5 space-y-3 bg-white dark:bg-[#0E131F]">
            
            {/* 1. Bank Narration Extract */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText size={13} className="text-indigo-500" /> Source Bank Narration
              </span>
              <div className="p-3 rounded-md bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10">
                <p className="text-xs sm:text-sm font-mono font-semibold uppercase leading-relaxed text-slate-900 dark:text-slate-100 wrap-break-word">
                  <HighlightedNarration narration={activeTx.narration} ledgerName={activeTx.suggestedLedger} />
                </p>
              </div>
            </div>

            {/* 2. Structured Destination Ledger Dropdown Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Landmark size={13} className="text-emerald-600 dark:text-emerald-400" />
                  Target Tally Ledger
                </label>
                {activeTx.confidence > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-500/20">
                    {Math.round(activeTx.confidence * 100)}% Auto Match
                  </span>
                )}
              </div>

              {/* Explicit Dropdown Trigger Box */}
              <button
                type="button"
                onClick={onOpenLedgerModal}
                className={`cursor-pointer w-full h-12 px-3.5 rounded-md border-2 text-left flex items-center justify-between transition-all group shadow-xs ${
                  activeTx.suggestedLedger 
                    ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500 hover:border-emerald-600 hover:bg-emerald-500/10' 
                    : 'bg-rose-50/60 dark:bg-rose-500/10 border-dashed border-rose-400 hover:border-rose-500'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-3">
                  <div className={`w-7 h-7 rounded-sm flex items-center justify-center shrink-0 border ${
                    activeTx.suggestedLedger 
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' 
                      : 'bg-rose-500/20 border-rose-500/30 text-rose-600 dark:text-rose-400'
                  }`}>
                    <Landmark size={14} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs sm:text-sm font-black uppercase truncate ${
                      activeTx.suggestedLedger 
                        ? 'text-slate-900 dark:text-white' 
                        : 'text-rose-700 dark:text-rose-300'
                    }`}>
                      {activeTx.suggestedLedger || "Select destination Tally ledger..."}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">
                      {activeTx.suggestedLedger ? "Mapped Voucher Account" : "Press (L) or click to map account"}
                    </span>
                  </div>
                </div>

                {/* Dropdown Chevron Controls */}
                <div className="flex items-center gap-1.5 shrink-0 text-slate-400 group-hover:text-emerald-500 transition-colors">
                  <Edit3 size={13} className="opacity-60 hidden sm:block" />
                  <div className="w-6 h-6 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                    <ChevronDown size={14} className="text-slate-600 dark:text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              </button>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. TRANSACTION CLASSIFICATION & INLINE REMARKS                            */}
        {/* ========================================================================= */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Classification & Voucher Note
          </label>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onToggleSale}
                className={`cursor-pointer px-3 py-1.5 rounded-md border-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeTx.isSales 
                    ? 'bg-indigo-600 border-indigo-600 text-white font-black shadow-xs' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <Tag size={12} className={activeTx.isSales ? 'text-white' : 'opacity-40'} />
                <span>Sale (S)</span>
              </button>

              <button
                type="button"
                onClick={onToggleComm}
                className={`cursor-pointer px-3 py-1.5 rounded-md border-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeTx.isCommission 
                    ? 'bg-blue-600 border-blue-600 text-white font-black shadow-xs' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <FileText size={12} className={activeTx.isCommission ? 'text-white' : 'opacity-40'} />
                <span>Comm (C)</span>
              </button>

              <button
                type="button"
                onClick={onToggleManual}
                className={`cursor-pointer px-3 py-1.5 rounded-md border-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeTx.isMarkedForManualEntry 
                    ? 'bg-amber-600 border-amber-600 text-white font-black shadow-xs' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <ShieldAlert size={12} className={activeTx.isMarkedForManualEntry ? 'text-white' : 'opacity-40'} />
                <span>Manual (M)</span>
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={activeTx.customNarration || ""}
                onChange={(e) => onCustomNarrationChange(e.target.value)}
                placeholder="Add voucher remark / internal note..."
                className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-md px-3 py-1.5 text-xs font-bold uppercase outline-none focus:border-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:normal-case shadow-2xs"
              />
            </div>
          </div>
        </div>

      </div>

      {/* 4. PINNED BOTTOM ACTION FOOTER */}
      <footer className="px-5 py-2.5 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0F19] flex items-center justify-between gap-3 shrink-0">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="cursor-pointer px-3.5 py-2 rounded-md border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-2xs"
        >
          <ChevronLeft size={14} strokeWidth={2.5} />
          <span>Prev</span>
        </button>

        <button
          type="button"
          onClick={onVerifyAndAdvance}
          disabled={isVerifying}
          className="cursor-pointer flex-1 max-w-md py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 shadow-md shadow-emerald-600/20"
        >
          {isVerifying ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <>
              <span>Verify & Advance</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-emerald-700 text-[10px] font-mono font-bold">
                Space ␣
              </kbd>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={currentIndex === totalItems - 1}
          className="cursor-pointer px-3.5 py-2 rounded-md border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-2xs"
        >
          <span>Skip</span>
          <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      </footer>

    </div>
  );
};

export default TransactionInspector;