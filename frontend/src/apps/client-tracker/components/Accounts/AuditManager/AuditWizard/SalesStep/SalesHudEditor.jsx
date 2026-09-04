import React from 'react';
import { 
  Landmark, Calendar as CalendarIcon, FileSpreadsheet, 
  FastForward, Edit3, CheckCheck, Building2, ShieldCheck, ArrowRight
} from 'lucide-react';

const SalesHudEditor = ({
  activeTx,
  onOpenLedgerModal,
  onOpenDatePicker,
  onUpdateTax,
  onVerifyAndNext,
  formatINR,
  isTrue
}) => {
  if (!activeTx) return null;

  const isApproved = isTrue(activeTx.isSalesApproved);
  const resolvedParty = activeTx.suggestedLedger || activeTx.partyLedger || activeTx.ledgerName || activeTx.partyName || "Party Ledger Unassigned";
  const activeLedgerName = activeTx.activeSalesLedger || activeTx.individualSalesLedger || "SUSPENSE SALES LEDGER";

  const formattedDate = activeTx.date 
    ? new Date(activeTx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : "No Date";

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto space-y-3 font-sans select-none text-slate-900 dark:text-slate-100">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP SUMMARY BAR: PARTY NAME, DATE & BIG VOUCHER TOTAL      */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white dark:bg-[#0E131F] border-2 border-slate-300 dark:border-white/20 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Badges + Huge Party Name */}
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-[1000] uppercase tracking-wider bg-indigo-100 text-indigo-900 dark:bg-indigo-500/25 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40">
            SALES RECEIPT
          </span>

          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
            {formattedDate} • {activeTx.bank || "Default Bank"}
          </span>

          {isApproved && (
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-black uppercase bg-emerald-100 text-emerald-900 dark:bg-emerald-500/25 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 flex items-center gap-1">
              <CheckCheck size={13} strokeWidth={3} /> Verified
            </span>
          )}

          {/* Prominent High-Contrast Party / AMC Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 border-2 border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-200 shadow-xs">
            <Building2 size={15} className="text-amber-700 dark:text-amber-400 shrink-0" />
            <span className="text-sm font-[1000] uppercase tracking-tight">
              {resolvedParty}
            </span>
          </div>
        </div>

        {/* Right: Voucher Total Header */}
        <div className="flex items-baseline gap-2 shrink-0 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-white/10">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            VOUCHER TOTAL:
          </span>
          <span className="text-2xl sm:text-3xl font-mono font-[1000] tracking-tight text-emerald-700 dark:text-emerald-400 tabular-nums">
            {formatINR(activeTx.grossVoucherTotal)}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN 2-COLUMN WORKBENCH: LEDGER & GST ENGINE               */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* LEFT COLUMN: ACCOUNTING CLASSIFICATION (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0E131F] border-2 border-slate-300 dark:border-white/20 rounded-xl p-4 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="space-y-3.5">
            <span className="text-xs font-[1000] uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
              <Landmark size={15} className="text-indigo-600 dark:text-indigo-400" /> Accounting Classification
            </span>

            {/* Target Income Ledger */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Target Income Ledger</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/10">L</kbd>
              </label>

              <button
                type="button"
                onClick={onOpenLedgerModal}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  activeTx.individualSalesLedger 
                    ? 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-400 dark:border-indigo-500 hover:border-indigo-600' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-white/15 hover:border-indigo-500'
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                    {activeTx.individualSalesLedger ? 'Manual Override Active' : 'Global Fallback Active'}
                  </span>
                  <span className="text-xs sm:text-sm font-[1000] uppercase text-indigo-900 dark:text-indigo-300 truncate mt-0.5">
                    {activeLedgerName}
                  </span>
                </div>
                <div className="p-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors shadow-xs">
                  <Edit3 size={14} />
                </div>
              </button>
            </div>

            {/* Document Date */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Invoice Document Date</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/10">D</kbd>
              </label>

              <button
                type="button"
                onClick={onOpenDatePicker}
                className="w-full p-3 rounded-lg border-2 border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 hover:border-indigo-500 text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                    Voucher Date in Tally
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-black uppercase text-slate-950 dark:text-slate-100 mt-0.5">
                    {activeTx.invoiceBillingDate || 'Select Date...'}
                  </span>
                </div>
                <CalendarIcon size={16} className="text-indigo-600 dark:text-indigo-400" />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-white/10">
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
              Auto-mapped for Tally XML export
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: REFINED GST ENGINE (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0E131F] border-2 border-slate-300 dark:border-white/20 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-sm">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
            <span className="text-xs font-[1000] uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-amber-600 dark:text-amber-400" /> GST Split Matrix
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Click boxes below to toggle tax
            </span>
          </div>

          {/* Clean Financial Matrix Breakdown */}
          <div className="space-y-2.5 font-mono">
            
            {/* Prominent Base Amount Header Strip */}
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-100/90 dark:bg-slate-900 border border-slate-300/80 dark:border-white/10 shadow-xs">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Taxable Amount
                </span>
                <span className="text-xs font-[1000] uppercase text-slate-900 dark:text-slate-100 tracking-tight">
                  Base Amount (Net Commission)
                </span>
              </div>
              <span className="font-[1000] text-base sm:text-lg text-slate-950 dark:text-white tabular-nums">
                {formatINR(activeTx.baseAmount)}
              </span>
            </div>

            {/* 3 Interactive Tax Switch Boxes */}
            <div className="grid grid-cols-3 gap-2 text-center">
              
              {/* CGST Box Toggle Button */}
              <button
                type="button"
                onClick={() => onUpdateTax('CGST')}
                className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer text-center flex flex-col justify-between relative group ${
                  activeTx.applyCGST 
                    ? 'bg-amber-50 dark:bg-amber-500/20 border-amber-400 dark:border-amber-500 shadow-sm ring-1 ring-amber-400/40' 
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 opacity-60 hover:opacity-100 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTx.applyCGST ? 'text-amber-900 dark:text-amber-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    CGST (9%)
                  </span>
                  <span className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase ${
                    activeTx.applyCGST 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {activeTx.applyCGST ? 'ON' : 'OFF'}
                  </span>
                </div>
                <span className={`text-base font-[1000] tabular-nums block my-0.5 ${activeTx.applyCGST ? 'text-amber-950 dark:text-amber-200' : 'text-slate-400'}`}>
                  {activeTx.applyCGST ? formatINR(activeTx.cgst) : '—'}
                </span>
              </button>

              {/* SGST Box Toggle Button */}
              <button
                type="button"
                onClick={() => onUpdateTax('SGST')}
                className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer text-center flex flex-col justify-between relative group ${
                  activeTx.applySGST 
                    ? 'bg-amber-50 dark:bg-amber-500/20 border-amber-400 dark:border-amber-500 shadow-sm ring-1 ring-amber-400/40' 
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 opacity-60 hover:opacity-100 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTx.applySGST ? 'text-amber-900 dark:text-amber-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    SGST (9%)
                  </span>
                  <span className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase ${
                    activeTx.applySGST 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {activeTx.applySGST ? 'ON' : 'OFF'}
                  </span>
                </div>
                <span className={`text-base font-[1000] tabular-nums block my-0.5 ${activeTx.applySGST ? 'text-amber-950 dark:text-amber-200' : 'text-slate-400'}`}>
                  {activeTx.applySGST ? formatINR(activeTx.sgst) : '—'}
                </span>
              </button>

              {/* IGST Box Toggle Button */}
              <button
                type="button"
                onClick={() => onUpdateTax('IGST')}
                className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer text-center flex flex-col justify-between relative group ${
                  activeTx.applyIGST 
                    ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-500 dark:border-blue-500 shadow-sm ring-1 ring-blue-500/40' 
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 opacity-60 hover:opacity-100 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTx.applyIGST ? 'text-blue-900 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    IGST (18%)
                  </span>
                  <span className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase ${
                    activeTx.applyIGST 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {activeTx.applyIGST ? 'ON' : 'OFF'}
                  </span>
                </div>
                <span className={`text-base font-[1000] tabular-nums block my-0.5 ${activeTx.applyIGST ? 'text-blue-950 dark:text-blue-200' : 'text-slate-400'}`}>
                  {activeTx.applyIGST ? formatINR(activeTx.igst) : '—'}
                </span>
              </button>

            </div>

            {/* Professional Clean Gross Output Deck */}
            <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-300 dark:border-emerald-500/30 text-emerald-950 dark:text-emerald-200 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-[1000] uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                    Calculated Gross Output
                  </span>
                  <span className="text-[9px] font-mono text-emerald-700/80 dark:text-emerald-400">
                    Base Amount + Applied Taxes
                  </span>
                </div>
              </div>

              <span className="text-lg sm:text-xl font-mono font-[1000] text-emerald-800 dark:text-emerald-300 tabular-nums">
                {formatINR(activeTx.grossVoucherTotal)}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. VERIFY & NEXT PRIMARY CTA BUTTON                           */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onVerifyAndNext}
          className="cursor-pointer w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <FastForward size={15} strokeWidth={3} />
          <span>Verify & Next Sales Item</span>
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-700 text-[10px] font-mono">
            Enter ↵
          </kbd>
        </button>
      </div>

    </div>
  );
};

export default SalesHudEditor;