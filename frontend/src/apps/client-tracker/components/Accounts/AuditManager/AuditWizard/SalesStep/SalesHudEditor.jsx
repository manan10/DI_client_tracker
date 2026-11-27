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
      <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Badges + Huge Party Name */}
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30">
            SALES RECEIPT
          </span>

          <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
            {formattedDate} • {activeTx.bank || "Default Bank"}
          </span>

          {isApproved && (
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
              <CheckCheck size={13} strokeWidth={3} /> Verified
            </span>
          )}

          {/* Prominent High-Contrast Party / AMC Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-200">
            <Building2 size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="sora-font text-sm font-bold uppercase tracking-tight">
              {resolvedParty}
            </span>
          </div>
        </div>

        {/* Right: Voucher Total Header */}
        <div className="flex items-baseline gap-2 shrink-0 bg-slate-50 dark:bg-[#1C2230] px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            VOUCHER TOTAL:
          </span>
          <span className="sora-font text-2xl sm:text-3xl font-mono font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatINR(activeTx.grossVoucherTotal)}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN 2-COLUMN WORKBENCH: LEDGER & GST ENGINE               */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* LEFT COLUMN: ACCOUNTING CLASSIFICATION (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg p-4 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="space-y-3.5">
            <span className="sora-font text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2">
              <Landmark size={15} className="text-sky-600 dark:text-sky-400" /> Accounting Classification
            </span>

            {/* Target Income Ledger */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-semibold uppercase text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Target Income Ledger</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-[#1C2230] text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80">L</kbd>
              </label>

              <button
                type="button"
                onClick={onOpenLedgerModal}
                className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                  activeTx.individualSalesLedger 
                    ? 'bg-sky-50 dark:bg-sky-500/10 border-sky-400 dark:border-sky-500/60 hover:border-sky-500' 
                    : 'bg-slate-50 dark:bg-[#1C2230] border-slate-200 dark:border-slate-700/80 hover:border-sky-500'
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-[9px] font-mono font-semibold uppercase text-slate-500 dark:text-slate-400">
                    {activeTx.individualSalesLedger ? 'Manual Override Active' : 'Global Fallback Active'}
                  </span>
                  <span className="text-xs sm:text-sm font-bold uppercase text-sky-700 dark:text-sky-300 truncate mt-0.5">
                    {activeLedgerName}
                  </span>
                </div>
                <div className="p-1.5 rounded-md bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-sky-600 transition-colors shadow-xs">
                  <Edit3 size={14} />
                </div>
              </button>
            </div>

            {/* Document Date */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-semibold uppercase text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Invoice Document Date</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-[#1C2230] text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80">D</kbd>
              </label>

              <button
                type="button"
                onClick={onOpenDatePicker}
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#1C2230] hover:border-sky-500 text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Voucher Date in Tally
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-bold uppercase text-slate-900 dark:text-slate-100 mt-0.5">
                    {activeTx.invoiceBillingDate || 'Select Date...'}
                  </span>
                </div>
                <CalendarIcon size={16} className="text-sky-600 dark:text-sky-400" />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400">
              Auto-mapped for Tally XML export
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: REFINED GST ENGINE (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg p-4 flex flex-col justify-between space-y-3 shadow-sm">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
            <span className="sora-font text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-amber-600 dark:text-amber-400" /> GST Split Matrix
            </span>
            <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Click boxes below to toggle tax
            </span>
          </div>

          {/* Clean Financial Matrix Breakdown */}
          <div className="space-y-2.5 font-mono">
            
            {/* Prominent Base Amount Header Strip */}
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 shadow-xs">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Taxable Amount
                </span>
                <span className="text-xs font-bold uppercase text-slate-900 dark:text-slate-100 tracking-tight">
                  Base Amount (Net Commission)
                </span>
              </div>
              <span className="sora-font font-bold text-base sm:text-lg text-slate-950 dark:text-white tabular-nums">
                {formatINR(activeTx.baseAmount)}
              </span>
            </div>

            {/* 3 Interactive Tax Switch Boxes */}
            <div className="grid grid-cols-3 gap-2 text-center">
              
              {/* CGST Box Toggle Button */}
              <button
                type="button"
                onClick={() => onUpdateTax('CGST')}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer text-center flex flex-col justify-between relative group ${
                  activeTx.applyCGST 
                    ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-400 dark:border-amber-500/60 shadow-sm ring-1 ring-amber-400/30' 
                    : 'bg-slate-50 dark:bg-[#1C2230] border-slate-200 dark:border-slate-700/80 opacity-60 hover:opacity-100 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${activeTx.applyCGST ? 'text-amber-900 dark:text-amber-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    CGST (9%)
                  </span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                    activeTx.applyCGST 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {activeTx.applyCGST ? 'ON' : 'OFF'}
                  </span>
                </div>
                <span className={`text-base font-bold tabular-nums block my-0.5 ${activeTx.applyCGST ? 'text-amber-950 dark:text-amber-200' : 'text-slate-400'}`}>
                  {activeTx.applyCGST ? formatINR(activeTx.cgst) : '—'}
                </span>
              </button>

              {/* SGST Box Toggle Button */}
              <button
                type="button"
                onClick={() => onUpdateTax('SGST')}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer text-center flex flex-col justify-between relative group ${
                  activeTx.applySGST 
                    ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-400 dark:border-amber-500/60 shadow-sm ring-1 ring-amber-400/30' 
                    : 'bg-slate-50 dark:bg-[#1C2230] border-slate-200 dark:border-slate-700/80 opacity-60 hover:opacity-100 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${activeTx.applySGST ? 'text-amber-900 dark:text-amber-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    SGST (9%)
                  </span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                    activeTx.applySGST 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {activeTx.applySGST ? 'ON' : 'OFF'}
                  </span>
                </div>
                <span className={`text-base font-bold tabular-nums block my-0.5 ${activeTx.applySGST ? 'text-amber-950 dark:text-amber-200' : 'text-slate-400'}`}>
                  {activeTx.applySGST ? formatINR(activeTx.sgst) : '—'}
                </span>
              </button>

              {/* IGST Box Toggle Button */}
              <button
                type="button"
                onClick={() => onUpdateTax('IGST')}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer text-center flex flex-col justify-between relative group ${
                  activeTx.applyIGST 
                    ? 'bg-sky-50 dark:bg-sky-500/15 border-sky-400 dark:border-sky-500/60 shadow-sm ring-1 ring-sky-500/30' 
                    : 'bg-slate-50 dark:bg-[#1C2230] border-slate-200 dark:border-slate-700/80 opacity-60 hover:opacity-100 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${activeTx.applyIGST ? 'text-sky-800 dark:text-sky-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    IGST (18%)
                  </span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                    activeTx.applyIGST 
                      ? 'bg-sky-600 text-white' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {activeTx.applyIGST ? 'ON' : 'OFF'}
                  </span>
                </div>
                <span className={`text-base font-bold tabular-nums block my-0.5 ${activeTx.applyIGST ? 'text-sky-900 dark:text-sky-200' : 'text-slate-400'}`}>
                  {activeTx.applyIGST ? formatINR(activeTx.igst) : '—'}
                </span>
              </button>

            </div>

            {/* Professional Clean Gross Output Deck */}
            <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-950 dark:text-emerald-200 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                    Calculated Gross Output
                  </span>
                  <span className="text-[9px] font-mono text-emerald-700/80 dark:text-emerald-400">
                    Base Amount + Applied Taxes
                  </span>
                </div>
              </div>

              <span className="sora-font text-lg sm:text-xl font-mono font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
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
          className="cursor-pointer w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold uppercase tracking-[0.15em] shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <FastForward size={15} strokeWidth={2.5} />
          <span>Verify & Next Sales Item</span>
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-sky-700 text-[10px] font-mono">
            Enter ↵
          </kbd>
        </button>
      </div>

    </div>
  );
};

export default SalesHudEditor;