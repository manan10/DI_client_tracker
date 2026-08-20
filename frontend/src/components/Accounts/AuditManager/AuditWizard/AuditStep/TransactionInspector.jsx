import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  FileText, Landmark, CornerDownRight, ArrowRight, ArrowDownLeft, 
  Edit3, Tag, ShieldAlert, Check, ChevronLeft, ChevronRight, Loader2,
  Zap, CheckCircle2, ListFilter, Search, X
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
    <span className="text-slate-900 dark:text-slate-100">
      {parts.map((part, i) => {
        const isMatch = tokens.some(t => new RegExp(`^${t}$`, 'i').test(part));
        return isMatch ? (
          <span key={i} className="text-emerald-700 dark:text-emerald-300 font-black bg-emerald-500/20 dark:bg-emerald-500/30 px-1.5 py-0.5 rounded border border-emerald-500/40">
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
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-xs">
          <CheckCircle2 size={36} />
        </div>
        <h3 className="text-base font-black uppercase text-slate-900 dark:text-white">
          All Transactions Reconciled
        </h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Every statement line in this batch has been verified and mapped to Tally.
        </p>
      </div>
    );
  }

  const percent = totalItems > 0 ? Math.round((verifiedCount / totalItems) * 100) : 0;

  return (
    <div className="relative flex-1 flex flex-col justify-between h-full min-w-0 overflow-hidden bg-slate-100/90 dark:bg-[#07090E]">
      
      {/* 1. TOP PROGRESS & BROWSE QUEUE HEADER */}
      <div className="px-6 py-3.5 border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-2xs">
        
        {/* Position Counter & Progress Bar */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-mono font-black shadow-xs">
              #{currentIndex + 1}
            </span>
            <span className="text-xs font-bold text-slate-400">of {totalItems}</span>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-24 sm:w-36 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full" 
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
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
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-2xs"
              title="Jump to the next unverified entry"
            >
              <Zap size={13} className="text-amber-600 dark:text-amber-400 fill-current" />
              <span>{pendingCount} Pending</span>
            </button>
          )}

          {/* Browse Queue Button */}
          <button
            type="button"
            onClick={() => setIsJumpMenuOpen(prev => !prev)}
            className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all shadow-2xs ${
              isJumpMenuOpen 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <ListFilter size={13} />
            <span>Browse Queue</span>
          </button>

          {isCurrentVerified && (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase inline-flex items-center gap-1 border border-emerald-500/30 shadow-2xs">
              <Check size={13} strokeWidth={3} /> Verified
            </span>
          )}
        </div>
      </div>

      {/* BROWSE QUEUE POPOVER DRAWER */}
      {isJumpMenuOpen && (
        <div 
          ref={popoverRef}
          className="absolute top-14 left-6 right-6 z-50 bg-white dark:bg-[#0E131F] border-2 border-slate-300 dark:border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-3.5 space-y-3 max-h-96 flex flex-col"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Search size={12} className="text-emerald-500" /> Jump Directly to Transaction
            </span>
            <button
              type="button"
              onClick={() => setIsJumpMenuOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              autoFocus
              type="text"
              placeholder="SEARCH BY NARRATION, AMOUNT OR LEDGER..."
              value={jumpSearch}
              onChange={(e) => setJumpSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold uppercase outline-none focus:border-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
            {filteredJumpList.length === 0 ? (
              <div className="p-6 text-center text-xs font-bold text-slate-400 uppercase">
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
                    className={`cursor-pointer w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 border transition-all ${
                      isSelected 
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs font-black' 
                        : isChecked 
                          ? 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20' 
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-white/5 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                        isSelected 
                          ? 'bg-white/20 text-white dark:bg-slate-900 dark:text-white' 
                          : isChecked 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {isChecked ? <Check size={10} strokeWidth={3.5} /> : `#${originalIndex + 1}`}
                      </span>

                      <div className="min-w-0">
                        <p className="text-xs uppercase truncate font-bold">{tx.narration}</p>
                        <p className={`text-[9px] font-mono truncate ${isSelected ? 'opacity-80' : 'text-slate-400'}`}>
                          {tx.suggestedLedger ? `➔ ${tx.suggestedLedger}` : 'Unmapped'}
                        </p>
                      </div>
                    </div>

                    <span className={`text-xs font-mono font-black tabular-nums shrink-0 ${
                      isSelected ? 'text-emerald-400 dark:text-emerald-600' : 'text-slate-900 dark:text-white'
                    }`}>
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
      <div className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto no-scrollbar min-w-0">
        
        {/* HERO FINANCIAL IDENTITY ROW */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                activeTab === 'RECEIPT' 
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' 
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
              }`}>
                {activeTab}
              </span>
              <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-300">
                {new Date(activeTx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
              <span className="text-xs font-bold uppercase text-slate-400 truncate">
                • {activeTx.bank || currentBank}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">
              Voucher Transformation Desk
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className={`text-3xl lg:text-5xl font-mono font-black italic tracking-tight tabular-nums ${
              activeTab === 'RECEIPT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatINR(Math.abs(activeTx.amount))}
            </span>
          </div>
        </div>

        {/* RECONCILIATION MAPPING BRIDGE (NARRATION ➔ TALLY DESTINATION) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          {/* Left: Source Statement Narration */}
          <div className="lg:col-span-6 p-4 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0E131F] space-y-2 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <FileText size={13} /> Source Bank Narration
              </span>
            </div>

            <p className="text-xs lg:text-sm font-mono font-semibold uppercase leading-relaxed text-slate-900 dark:text-slate-100 py-1 wrap-break-word">
              <HighlightedNarration narration={activeTx.narration} ledgerName={activeTx.suggestedLedger} />
            </p>
            
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wide">
              Extracted from Statement
            </span>
          </div>

          {/* Center Connector Indicator */}
          <div className="lg:col-span-1 flex items-center justify-center text-emerald-600 dark:text-emerald-400 py-1 lg:py-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ArrowRight size={15} strokeWidth={3} className="hidden lg:block" />
              <ArrowDownLeft size={15} strokeWidth={3} className="lg:hidden" />
            </div>
          </div>

          {/* Right: Target Tally Ledger Mapping */}
          <div className="lg:col-span-5 p-4 rounded-xl border-2 border-emerald-500/50 bg-emerald-50/20 dark:bg-[#0E131F] space-y-2 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Landmark size={13} /> Destination Tally Ledger
              </span>
              {activeTx.confidence > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[9px] font-bold">
                  {Math.round(activeTx.confidence * 100)}% Match
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenLedgerModal}
              className={`cursor-pointer w-full p-3 rounded-lg border-2 text-left flex items-center justify-between transition-all group ${
                activeTx.suggestedLedger 
                  ? 'bg-white dark:bg-slate-950 border-emerald-500 text-emerald-950 dark:text-emerald-200 shadow-xs' 
                  : 'bg-rose-50/50 dark:bg-rose-500/10 border-dashed border-rose-400 text-rose-700 hover:border-rose-500'
              }`}
            >
              <span className="text-xs lg:text-sm font-black uppercase truncate pr-2">
                {activeTx.suggestedLedger || "Map Target Ledger (L)..."}
              </span>
              <Edit3 size={14} className="shrink-0 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </button>

            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wide">
              Target Voucher Account
            </span>
          </div>

        </div>

        {/* TRANSACTION CLASSIFICATION & INLINE REMARKS */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Classification & Voucher Note
          </label>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onToggleSale}
                className={`cursor-pointer px-4 py-2 rounded-lg border-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeTx.isSales 
                    ? 'bg-indigo-600 border-indigo-600 text-white font-black shadow-xs' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                <Tag size={13} className={activeTx.isSales ? 'text-white' : 'opacity-40'} />
                <span>Sale (S)</span>
              </button>

              <button
                type="button"
                onClick={onToggleComm}
                className={`cursor-pointer px-4 py-2 rounded-lg border-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeTx.isCommission 
                    ? 'bg-blue-600 border-blue-600 text-white font-black shadow-xs' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                <FileText size={13} className={activeTx.isCommission ? 'text-white' : 'opacity-40'} />
                <span>Comm (C)</span>
              </button>

              <button
                type="button"
                onClick={onToggleManual}
                className={`cursor-pointer px-4 py-2 rounded-lg border-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeTx.isMarkedForManualEntry 
                    ? 'bg-amber-600 border-amber-600 text-white font-black shadow-xs' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                <ShieldAlert size={13} className={activeTx.isMarkedForManualEntry ? 'text-white' : 'opacity-40'} />
                <span>Manual (M)</span>
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={activeTx.customNarration || ""}
                onChange={(e) => onCustomNarrationChange(e.target.value)}
                placeholder="Add voucher remark / internal note..."
                className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold uppercase outline-none focus:border-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-2xs"
              />
            </div>
          </div>
        </div>

      </div>

      {/* 3. PINNED BOTTOM ACTION DOCK */}
      <footer className="px-6 py-3 border-t border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 shadow-xs">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="cursor-pointer px-4 py-2.5 rounded-lg border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-2xs"
        >
          <ChevronLeft size={15} strokeWidth={2.5} />
          <span>Prev</span>
        </button>

        <button
          type="button"
          onClick={onVerifyAndAdvance}
          disabled={isVerifying}
          className="cursor-pointer flex-1 max-w-md py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black uppercase tracking-[0.15em] shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60"
        >
          {isVerifying ? (
            <Loader2 size={16} className="animate-spin" />
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
          className="cursor-pointer px-4 py-2.5 rounded-lg border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-2xs"
        >
          <span>Skip</span>
          <ChevronRight size={15} strokeWidth={2.5} />
        </button>
      </footer>

    </div>
  );
};

export default TransactionInspector;