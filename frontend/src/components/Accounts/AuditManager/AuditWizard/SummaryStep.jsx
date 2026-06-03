import React, { useState, useMemo } from 'react';
import { Landmark, ChevronDown, ArrowUpRight, ChevronUp, AlertTriangle, ShieldCheck, ArrowRightLeft, Receipt, Coins, Sparkles, CheckCircle2, Info } from 'lucide-react';
import CommissionMapperModal from './SummaryStep/CommissionMapperModal';

const SummaryStep = ({ selection, arns = [] }) => {
  const [isMapperOpen, setIsMapperOpen] = useState(false);
  const [isCommissionCommitted, setIsCommissionCommitted] = useState(false);

  // Keep critical transaction streams expanded by default for rapid scanning
  const [expandedSections, setExpandedSections] = useState({
    sales: true,
    receipts: true,
    payments: true,
    manual: true
  });

  const rawTransactions = useMemo(() => {
    return selection?.stagedData?.transactions || [];
  }, [selection?.stagedData?.transactions]);

  const transactions = useMemo(() => {
    return rawTransactions.filter(t => t && t.narration !== "EMPTY_FILE_MARKER");
  }, [rawTransactions]);

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const isGstCompliant = useMemo(() => {
    return arns.find(a => a._id === selection?.arnId || a.arnCode === selection?.arnId)?.gstCompliant || false;
  }, [arns, selection?.arnId]);

  // READ LIVE ACCOUNT COORDINATES DIRECTLY FROM BACKEND AUDIT SESSION METRICS
  const balanceMetrics = useMemo(() => {
    return {
      opening: selection?.audit?.summary?.openingBalance || 0,
      closing: selection?.audit?.summary?.closingBalance || 0
    };
  }, [selection?.audit?.summary]);

  // EXTRACT AND COMPUTE SEPARATE VOUCHER STREAMS
  const voucherData = useMemo(() => {
    // Isolate automated items vs explicit manual entries cleanly
    const receipts = transactions.filter(t => t?.type === 'RECEIPT' && !t?.isMarkedForManualEntry);
    const payments = transactions.filter(t => t?.type === 'PAYMENT' && !t?.isMarkedForManualEntry);
    const salesInvoices = transactions.filter(t => t?.isCommission && t?.type === 'RECEIPT' && t?.isSalesApproved && !t?.isMarkedForManualEntry);
    const manualEntries = transactions.filter(t => t?.isMarkedForManualEntry || !t?.suggestedLedger);

    // FIX: Read explicitly saved tax values from SalesStep instead of recalculating
    const normalizedSalesRows = salesInvoices.map(tx => {
      const ledgerName = tx.suggestedLedger || tx.ledgerName || "SUSPENSE SALES LEDGER";
      
      return {
        ...tx,
        ledgerName,
        baseAmount: tx.baseAmount !== undefined ? tx.baseAmount : (tx.amount || 0),
        cgst: tx.cgst || 0,
        sgst: tx.sgst || 0,
        igst: tx.igst || 0,
        grossTotal: tx.grossVoucherTotal || tx.amount || 0
      };
    });

    return {
      receiptList: receipts,
      receiptTotal: receipts.reduce((sum, t) => sum + (t?.amount || 0), 0),
      paymentList: payments,
      paymentTotal: payments.reduce((sum, t) => sum + (t?.amount || 0), 0),
      salesList: normalizedSalesRows,
      salesTotal: normalizedSalesRows.reduce((sum, t) => sum + t.grossTotal, 0),
      manualList: manualEntries,
      manualTotal: manualEntries.reduce((sum, t) => sum + (t?.amount || 0), 0),
      commissionLines: transactions.filter(t => t?.isCommission)
    };
  }, [transactions, isGstCompliant]);

  const monthName = useMemo(() => {
    return new Date(selection?.year || new Date().getFullYear(), (selection?.month || 1) - 1).toLocaleString('default', { month: 'long' });
  }, [selection?.month, selection?.year]);

  if (!selection?.stagedData?.transactions) {
    return (
      <div className="h-full w-full bg-white dark:bg-[#08090A] flex flex-col items-center justify-center gap-4 text-slate-400">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] animate-pulse">Compiling Voucher Maps...</span>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      <div className="h-full w-full bg-slate-50 dark:bg-[#08090A] flex flex-col overflow-hidden text-left font-sans text-slate-800 dark:text-slate-200">
        
        {/* HEADER CONTROL STRIP (Responsive) */}
        <div className="px-4 lg:px-12 py-4 lg:py-5 bg-white lg:bg-slate-50 dark:bg-[#0B0C10] border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 lg:gap-0 shrink-0">
          <div className="space-y-0.5 lg:space-y-1">
            <h2 className="text-sm lg:text-base font-black uppercase tracking-wide text-slate-900 dark:text-white">
              Pre-Flight Ledger Sync
            </h2>
            <p className="text-[8px] lg:text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 flex-wrap">
              <span>{selection?.tallyCompany || "Not Specified"}</span> 
              <span className="text-slate-300">•</span> 
              <span>{monthName} {selection?.year}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 text-[9px] lg:text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-2 sm:p-0 rounded-lg sm:bg-transparent">
            <Landmark size={14} className="text-emerald-500 shrink-0" /> 
            <span className="truncate">Bank:</span> 
            <span className="text-slate-900 dark:text-white underline decoration-emerald-500 underline-offset-4 font-mono truncate">{selection?.tallyLedger || "Not Selected"}</span>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 lg:px-12 py-4 lg:py-6 space-y-4 lg:space-y-6">
          
          {/* EXECUTIVE HIGHLIGHT REAL WORLD METRICS (Horizontal scroll on mobile) */}
          <div className="flex overflow-x-auto no-scrollbar gap-3 lg:grid lg:grid-cols-3 lg:gap-6 shrink-0 select-none pb-1 lg:pb-0">
            <div className="bg-white lg:bg-slate-50 dark:bg-[#121318] border border-slate-200 dark:border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm min-w-50 lg:min-w-0">
              <span className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 lg:mb-1.5">Opening Balance</span>
              <p className="text-lg lg:text-xl font-[1000] font-mono text-slate-900 dark:text-white leading-none">{formatINR(balanceMetrics.opening)}</p>
            </div>
            <div className="bg-emerald-500/4 dark:bg-emerald-500/2 border border-emerald-500/20 rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm min-w-50 lg:min-w-0">
              <span className="text-[8px] lg:text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-1 lg:mb-1.5">Total Receipts</span>
              <p className="text-lg lg:text-xl font-[1000] font-mono text-emerald-600 dark:text-emerald-400 leading-none">+{formatINR(voucherData.receiptTotal)}</p>
            </div>
            <div className="bg-slate-950 text-white dark:bg-white/5 border border-slate-900 dark:border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm min-w-50 lg:min-w-0">
              <span className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 lg:mb-1.5">Closing Balance</span>
              <p className="text-lg lg:text-xl font-[1000] font-mono text-white leading-none">{formatINR(balanceMetrics.closing)}</p>
            </div>
          </div>

          {/* MUTUAL FUND ADVISORY AUTOMATION LOGGER HUB BAR (Stacked on mobile) */}
          {voucherData.commissionLines.length > 0 && (
            <div className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-xl lg:rounded-2xl p-4 lg:p-5 flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-4 md:gap-0">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg lg:rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <Sparkles size={14} className="lg:w-4 lg:h-4" fill="currentColor" />
                </div>
                <div>
                  <h4 className="text-[11px] lg:text-[12.5px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wide leading-tight lg:leading-normal">
                    Mutual Fund Trail Commissions
                  </h4>
                  <p className="text-[9px] lg:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Isolated <span className="text-emerald-600 dark:text-emerald-400 font-black">{voucherData.commissionLines.length} income credits</span>.
                  </p>
                </div>
              </div>

              {isCommissionCommitted ? (
                <div className="flex items-center justify-center gap-2 border border-emerald-600/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-black text-[9px] lg:text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-lg lg:rounded-xl select-none w-full md:w-auto">
                  <CheckCircle2 size={13} strokeWidth={3} /> Logged
                </div>
              ) : (
                <button
                  onClick={() => setIsMapperOpen(true)}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 lg:py-2.5 rounded-lg lg:rounded-xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest shadow-md transition-all active:scale-95 w-full md:w-auto"
                >
                  Automate Log <ArrowUpRight size={13} strokeWidth={3} />
                </button>
              )}
            </div>
          )}

          {/* ==================== VOUCHER SECTION 1: ACCRUAL SALES INVOICES ==================== */}
          <div className="border border-slate-200 dark:border-white/10 rounded-xl lg:rounded-2xl overflow-hidden bg-white dark:bg-[#0C0D12] shadow-sm">
            <div 
              onClick={() => toggleSection('sales')}
              className="px-4 lg:px-6 py-3 lg:py-4 bg-blue-500/4 dark:bg-blue-500/2 flex items-center justify-between cursor-pointer border-b border-slate-200 dark:border-white/10 select-none"
            >
              <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0 pr-2">
                <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-md lg:rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <ArrowRightLeft size={12} className="lg:w-3.5 lg:h-3.5" strokeWidth={2.5} />
                </div>
                <h3 className="text-[10px] lg:text-[12.5px] font-black uppercase tracking-wider text-blue-950 dark:text-blue-400 truncate">
                  Accrual Sales <span className="hidden sm:inline">({voucherData.salesList.length} Invoices)</span>
                </h3>
              </div>
              <div className="flex items-center gap-2 lg:gap-4 font-mono font-black text-[11px] lg:text-[13.5px] text-blue-600 dark:text-blue-400 shrink-0">
                <span className="hidden sm:block text-[8px] lg:text-[10px] font-black tracking-widest text-slate-400 uppercase">Gross:</span>
                <span>{formatINR(voucherData.salesTotal)}</span>
                {expandedSections.sales ? <ChevronUp size={14} className="lg:w-4 lg:h-4 opacity-40" /> : <ChevronDown size={14} className="lg:w-4 lg:h-4 opacity-40" />}
              </div>
            </div>
            
            {expandedSections.sales && (
              <div className="p-3 lg:p-6 bg-slate-50/30 dark:bg-transparent">
                {voucherData.salesList.length === 0 ? (
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-400 py-4 lg:py-2 text-[9px] lg:text-[11px] font-black uppercase tracking-widest text-center">
                    <Info size={14}/> No corporate commissions processed.
                  </div>
                ) : (
                  <>
                    {/* MOBILE CARD VIEW */}
                    <div className="lg:hidden space-y-3">
                      {voucherData.salesList.map(row => (
                        <div key={row._id} className="bg-white dark:bg-[#111214] border border-slate-200 dark:border-white/10 rounded-lg p-3 shadow-sm flex flex-col gap-2.5">
                          <div className="flex justify-between items-start">
                             <span className="text-[10px] font-[1000] uppercase text-slate-900 dark:text-white truncate flex-1 pr-2 leading-tight">{row.ledgerName}</span>
                             <span className="text-[9px] font-mono text-blue-600 dark:text-blue-400 shrink-0">{row.invoiceBillingDate || '——'}</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-50 dark:bg-white/5 p-2 rounded-md">
                             <div className="flex flex-col">
                               <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Taxable</span>
                               <span className="text-[9px] font-mono font-bold text-slate-600 dark:text-slate-400">{formatINR(row.baseAmount)}</span>
                             </div>
                             <div className="text-right">
                               <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5 block">Gross</span>
                               <span className="text-[11px] font-mono font-black text-blue-600 dark:text-blue-400 leading-none block">{formatINR(row.grossTotal)}</span>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* DESKTOP TABLE VIEW */}
                    <div className="hidden lg:block overflow-x-auto no-scrollbar">
                      <table className="w-full text-[11.5px] border-collapse table-fixed">
                        <thead>
                          <tr className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/10 pb-2.5">
                            <th className="pb-2.5 text-left w-[26%]">Tally Sales Ledger Name</th>
                            <th className="pb-2.5 text-center w-[15%]">Billing Date</th>
                            <th className="pb-2.5 text-right w-[15%]">Taxable Turnover</th>
                            <th className="pb-2.5 text-right w-[11%]">CGST (9%)</th>
                            <th className="pb-2.5 text-right w-[11%]">SGST (9%)</th>
                            <th className="pb-2.5 text-right w-[11%]">IGST (18%)</th>
                            <th className="pb-2.5 text-right w-[11%] pr-1">Invoice Gross</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-bold uppercase">
                          {voucherData.salesList.map((row) => (
                            <tr key={row._id} className="hover:bg-slate-50/50 dark:hover:bg-white/1 transition-colors">
                              <td className="py-3.5 text-slate-900 dark:text-white font-[1000] truncate text-[12.5px]">{row.ledgerName}</td>
                              <td className="py-3.5 text-center text-blue-600 dark:text-blue-400 font-mono text-[11px]">{row.invoiceBillingDate || '——'}</td>
                              <td className="py-3.5 text-right font-mono text-slate-600 dark:text-slate-400">{formatINR(row.baseAmount).replace('₹','')}</td>
                              <td className="py-3.5 text-right font-mono text-amber-600 dark:text-amber-500">{row.cgst > 0 ? formatINR(row.cgst).replace('₹','') : '——'}</td>
                              <td className="py-3.5 text-right font-mono text-amber-600 dark:text-amber-500">{row.sgst > 0 ? formatINR(row.sgst).replace('₹','') : '——'}</td>
                              <td className="py-3.5 text-right font-mono text-blue-500 dark:text-blue-400">{row.igst > 0 ? formatINR(row.igst).replace('₹','') : '——'}</td>
                              <td className="py-3.5 text-right font-sans font-[1000] text-blue-600 dark:text-blue-400 pr-1 text-[13px]">{formatINR(row.grossTotal).replace('₹','')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ==================== VOUCHER SECTION 2: BANK RECEIPTS ==================== */}
          <div className="border border-slate-200 dark:border-white/10 rounded-xl lg:rounded-2xl overflow-hidden bg-white dark:bg-[#0C0D12] shadow-sm">
            <div 
              onClick={() => toggleSection('receipts')}
              className="px-4 lg:px-6 py-3 lg:py-4 bg-emerald-500/4 dark:bg-emerald-500/2 flex items-center justify-between cursor-pointer border-b border-slate-200 dark:border-white/10 select-none"
            >
              <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0 pr-2">
                <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-md lg:rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Receipt size={12} className="lg:w-3.5 lg:h-3.5" strokeWidth={2.5} />
                </div>
                <h3 className="text-[10px] lg:text-[12.5px] font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-400 truncate">
                  Bank Receipts <span className="hidden sm:inline font-medium text-slate-400 ml-1">({voucherData.receiptList.length} Lines)</span>
                </h3>
              </div>
              <div className="flex items-center gap-2 lg:gap-4 font-mono font-black text-[11px] lg:text-[13.5px] text-emerald-600 dark:text-emerald-400 shrink-0">
                <span className="hidden sm:block text-[8px] lg:text-[10px] font-black tracking-widest text-slate-400 uppercase">Total:</span>
                <span>{formatINR(voucherData.receiptTotal)}</span>
                {expandedSections.receipts ? <ChevronUp size={14} className="lg:w-4 lg:h-4 opacity-40" /> : <ChevronDown size={14} className="lg:w-4 lg:h-4 opacity-40" />}
              </div>
            </div>
            
            {expandedSections.receipts && (
              <div className="p-3 lg:p-6 bg-slate-50/30 dark:bg-transparent">
                {voucherData.receiptList.length === 0 ? (
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-400 py-4 lg:py-2 text-[9px] lg:text-[11px] font-black uppercase tracking-widest text-center">
                    <Info size={14}/> No incoming credit statement items.
                  </div>
                ) : (
                  <>
                    {/* MOBILE CARD VIEW */}
                    <div className="lg:hidden space-y-3">
                      {voucherData.receiptList.map(row => (
                         <div key={row._id} className="bg-white dark:bg-[#111214] border border-slate-200 dark:border-white/10 rounded-lg p-3 shadow-sm flex flex-col gap-2">
                           <div className="flex justify-between items-start gap-3">
                              <span className="text-[10px] font-[1000] uppercase text-slate-900 dark:text-white truncate flex-1 leading-tight">{row.suggestedLedger || "SUSPENSE ACCOUNT"}</span>
                              <span className="text-[11px] font-mono font-black text-emerald-600 dark:text-emerald-400 shrink-0 leading-none">{formatINR(row.amount)}</span>
                           </div>
                           <div className="flex justify-between items-end">
                              <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest truncate flex-1 pr-2">{row.narration}</span>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                                {row.date ? new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '——'}
                              </span>
                           </div>
                         </div>
                      ))}
                    </div>

                    {/* DESKTOP TABLE VIEW */}
                    <div className="hidden lg:block overflow-x-auto no-scrollbar">
                      <table className="w-full text-[11.5px] border-collapse table-fixed">
                        <thead>
                          <tr className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/10 pb-2.5">
                            <th className="pb-2.5 text-left w-[18%]">Statement Date</th>
                            <th className="pb-2.5 text-left w-[42%]">Tally Offset Ledger Name</th>
                            <th className="pb-2.5 w-[22%] pl-2 text-left">Bank Narration particulars</th>
                            <th className="pb-2.5 text-right w-[18%] pr-1">Amount (Cr)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-bold uppercase">
                          {voucherData.receiptList.map((row) => (
                            <tr key={row._id} className="hover:bg-slate-50/50 dark:hover:bg-white/1 transition-colors">
                              <td className="py-3.5 text-slate-400 font-mono text-[11px]">
                                {row.date ? new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : '——'}
                              </td>
                              <td className="py-3.5 text-slate-900 dark:text-white font-[1000] truncate text-[12.5px]">{row.suggestedLedger || "SUSPENSE ACCOUNT"}</td>
                              <td className="py-3.5 text-slate-400 font-bold tracking-tight truncate text-[10.5px] pl-2 font-mono text-left">{row.narration}</td>
                              <td className="py-3.5 text-right font-sans font-[1000] text-emerald-600 dark:text-emerald-400 pr-1 text-[12.5px]">{formatINR(row.amount).replace('₹','')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ==================== VOUCHER SECTION 3: BANK PAYMENTS ==================== */}
          <div className="border border-slate-200 dark:border-white/10 rounded-xl lg:rounded-2xl overflow-hidden bg-white dark:bg-[#0C0D12] shadow-sm">
            <div 
              onClick={() => toggleSection('payments')}
              className="px-4 lg:px-6 py-3 lg:py-4 bg-rose-500/4 dark:bg-rose-500/2 flex items-center justify-between cursor-pointer border-b border-slate-200 dark:border-white/10 select-none"
            >
              <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0 pr-2">
                <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-md lg:rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                  <Coins size={12} className="lg:w-3.5 lg:h-3.5" strokeWidth={2.5} />
                </div>
                <h3 className="text-[10px] lg:text-[12.5px] font-black uppercase tracking-wider text-rose-900 dark:text-rose-400 truncate">
                  Bank Payments <span className="hidden sm:inline font-medium text-slate-400 ml-1">({voucherData.paymentList.length} Debits)</span>
                </h3>
              </div>
              <div className="flex items-center gap-2 lg:gap-4 font-mono font-black text-[11px] lg:text-[13.5px] text-rose-600 dark:text-rose-400 shrink-0">
                <span className="hidden sm:block text-[8px] lg:text-[10px] font-black tracking-widest text-slate-400 uppercase">Total:</span>
                <span>{formatINR(voucherData.paymentTotal)}</span>
                {expandedSections.payments ? <ChevronUp size={14} className="lg:w-4 lg:h-4 opacity-40" /> : <ChevronDown size={14} className="lg:w-4 lg:h-4 opacity-40" />}
              </div>
            </div>
            
            {expandedSections.payments && (
              <div className="p-3 lg:p-6 bg-slate-50/30 dark:bg-transparent">
                {voucherData.paymentList.length === 0 ? (
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-400 py-4 lg:py-2 text-[9px] lg:text-[11px] font-black uppercase tracking-widest text-center">
                    <Info size={14}/> No payment debits logged.
                  </div>
                ) : (
                  <>
                    {/* MOBILE CARD VIEW */}
                    <div className="lg:hidden space-y-3">
                      {voucherData.paymentList.map(row => (
                         <div key={row._id} className="bg-white dark:bg-[#111214] border border-slate-200 dark:border-white/10 rounded-lg p-3 shadow-sm flex flex-col gap-2">
                           <div className="flex justify-between items-start gap-3">
                              <span className="text-[10px] font-[1000] uppercase text-slate-900 dark:text-white truncate flex-1 leading-tight">{row.suggestedLedger || "SUSPENSE ACCOUNT"}</span>
                              <span className="text-[11px] font-mono font-black text-rose-600 dark:text-rose-400 shrink-0 leading-none">{formatINR(row.amount)}</span>
                           </div>
                           <div className="flex justify-between items-end">
                              <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest truncate flex-1 pr-2">{row.narration}</span>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                                {row.date ? new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '——'}
                              </span>
                           </div>
                         </div>
                      ))}
                    </div>

                    {/* DESKTOP TABLE VIEW */}
                    <div className="hidden lg:block overflow-x-auto no-scrollbar">
                      <table className="w-full text-[11.5px] border-collapse table-fixed">
                        <thead>
                          <tr className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/10 pb-2.5">
                            <th className="pb-2.5 text-left w-[18%]">Statement Date</th>
                            <th className="pb-2.5 text-left w-[42%]">Tally Target Account Ledger</th>
                            <th className="pb-2.5 w-[22%] pl-2 text-left">Bank Narration particulars</th>
                            <th className="pb-2.5 text-right w-[18%] pr-1">Amount (Dr)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-bold uppercase">
                          {voucherData.paymentList.map((row) => (
                            <tr key={row._id} className="hover:bg-rose-50/20 dark:hover:bg-rose-950/5 transition-colors">
                              <td className="py-3.5 text-slate-400 font-mono text-[11px]">
                                {row.date ? new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : '——'}
                              </td>
                              <td className="py-3.5 text-slate-900 dark:text-white font-[1000] truncate text-[12.5px]">{row.suggestedLedger || "SUSPENSE ACCOUNT"}</td>
                              <td className="py-3.5 text-slate-400 font-bold tracking-tight truncate text-[10.5px] pl-2 font-mono text-left">{row.narration}</td>
                              <td className="py-3.5 text-right font-sans font-[1000] text-rose-600 dark:text-rose-400 pr-1 text-[12.5px]">{formatINR(row.amount).replace('₹','')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ==================== VOUCHER SECTION 4: MANUAL OVERRIDES & HOLDS ==================== */}
          <div className="border border-amber-200 dark:border-amber-500/20 rounded-xl lg:rounded-2xl overflow-hidden bg-white dark:bg-[#0C0D12] shadow-sm">
            <div 
              onClick={() => toggleSection('manual')}
              className="px-4 lg:px-6 py-3 lg:py-4 bg-amber-500/4 dark:bg-amber-500/1 flex items-center justify-between cursor-pointer border-b border-slate-200 dark:border-white/10 select-none"
            >
              <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0 pr-2">
                <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-md lg:rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <AlertTriangle size={12} className="lg:w-3.5 lg:h-3.5" strokeWidth={2.5} />
                </div>
                <h3 className="text-[10px] lg:text-[12.5px] font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 truncate">
                  Manual Entry Hold List <span className="hidden sm:inline font-medium text-slate-400 ml-1">({voucherData.manualList.length} Items)</span>
                </h3>
              </div>
              <div className="flex items-center gap-2 lg:gap-4 font-mono font-black text-[11px] lg:text-[13.5px] text-amber-600 dark:text-amber-400 shrink-0">
                <span className="hidden sm:block text-[8px] lg:text-[10px] font-black tracking-widest text-slate-400 uppercase">Hold Volume:</span>
                <span>{formatINR(voucherData.manualTotal)}</span>
                {expandedSections.manual ? <ChevronUp size={14} className="lg:w-4 lg:h-4 opacity-40" /> : <ChevronDown size={14} className="lg:w-4 lg:h-4 opacity-40" />}
              </div>
            </div>
            
            {expandedSections.manual && (
              <div className="p-3 lg:p-6 bg-slate-50/30 dark:bg-transparent">
                {voucherData.manualList.length === 0 ? (
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-emerald-600 dark:text-emerald-400 py-4 lg:py-2 text-[9px] lg:text-[11px] font-black uppercase tracking-widest text-center">
                    <ShieldCheck size={14}/> Clean Registry: No manual dropouts found.
                  </div>
                ) : (
                  <>
                    {/* MOBILE CARD VIEW */}
                    <div className="lg:hidden space-y-3">
                      {voucherData.manualList.map(row => (
                         <div key={row._id} className="bg-white dark:bg-[#111214] border border-amber-200/50 dark:border-amber-500/20 rounded-lg p-3 shadow-sm flex flex-col gap-2">
                           <div className="flex justify-between items-start gap-3">
                              <span className="text-[10px] font-[1000] uppercase text-amber-600 dark:text-amber-500 truncate flex-1 leading-tight">{row.suggestedLedger || "SUSPENSE OFF-RECON LEDGER"}</span>
                              <span className="text-[11px] font-mono font-black text-amber-600 dark:text-amber-500 shrink-0 leading-none">{formatINR(row.amount)}</span>
                           </div>
                           <div className="flex justify-between items-end">
                              <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest truncate flex-1 pr-2">{row.narration}</span>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                                {row.date ? new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '——'}
                              </span>
                           </div>
                         </div>
                      ))}
                    </div>

                    {/* DESKTOP TABLE VIEW */}
                    <div className="hidden lg:block overflow-x-auto no-scrollbar">
                      <table className="w-full text-[11.5px] border-collapse table-fixed">
                        <thead>
                          <tr className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/10 pb-2.5">
                            <th className="pb-2.5 text-left w-[18%]">Statement Date</th>
                            <th className="pb-2.5 text-left w-[42%]">Tally Off-Recon Exception Head</th>
                            <th className="pb-2.5 w-[22%] pl-2 text-left">Bank Description</th>
                            <th className="pb-2.5 text-right w-[18%] pr-1">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-bold uppercase">
                          {voucherData.manualList.map((row) => (
                            <tr key={row._id} className="hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition-colors">
                              <td className="py-3.5 text-slate-400 font-mono text-[11px]">
                                {row.date ? new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : '——'}
                              </td>
                              <td className="py-3.5 text-amber-600 dark:text-amber-500 font-[1000] truncate text-[12.5px]">{row.suggestedLedger || "SUSPENSE OFF-RECON LEDGER"}</td>
                              <td className="py-3.5 text-slate-400 font-bold tracking-tight truncate text-[10.5px] pl-2 font-mono text-left">{row.narration}</td>
                              <td className="py-3.5 text-right font-sans font-[1000] text-amber-600 dark:text-amber-400 pr-1 text-[12.5px]">{formatINR(row.amount).replace('₹','')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

        </div>

        {/* FOOTER SYSTEM CONTROL BAR (Stacked on mobile) */}
        <footer className="px-4 lg:px-8 py-4 lg:py-5 border-t border-slate-200 dark:border-white/10 bg-white lg:bg-slate-50 dark:bg-[#0B0C10] flex flex-col lg:flex-row items-center justify-between shrink-0 shadow-2xl gap-3 lg:gap-0 z-10">
          <div className="flex items-center justify-center lg:justify-start gap-2 lg:gap-4 text-center lg:text-left select-none w-full lg:w-auto">
            <ShieldCheck size={14} className="text-emerald-500 lg:w-4 lg:h-4 shrink-0" />
            <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed lg:leading-none">
              Pre-flight generation locks verified <span className="hidden lg:inline mx-2 text-slate-200 dark:text-white/5">|</span><br className="lg:hidden"/> Ready to stream batch XML to Tally proxy
            </p>
          </div>
          
          <div className="flex flex-wrap lg:flex-nowrap justify-center lg:justify-end items-center gap-3 lg:gap-6 text-[9px] lg:text-[10.5px] font-black uppercase text-slate-400 tracking-wider select-none w-full lg:w-auto">
            <div className="bg-slate-50 dark:bg-white/5 lg:bg-transparent px-2 py-1 lg:p-0 rounded-md">
              Rx: <span className="text-emerald-600 dark:text-emerald-400 font-[1000] ml-0.5 lg:ml-1">{voucherData.receiptList.length}</span>
            </div>
            <div className="hidden lg:block h-4 w-px bg-slate-200 dark:bg-white/10" />
            <div className="bg-slate-50 dark:bg-white/5 lg:bg-transparent px-2 py-1 lg:p-0 rounded-md">
              Inv: <span className="text-blue-500 dark:text-blue-400 font-[1000] ml-0.5 lg:ml-1">{voucherData.salesList.length}</span>
            </div>
            <div className="hidden lg:block h-4 w-px bg-slate-200 dark:bg-white/10" />
            <div className="bg-slate-50 dark:bg-white/5 lg:bg-transparent px-2 py-1 lg:p-0 rounded-md">
              Px: <span className="text-rose-500 dark:text-rose-400 font-[1000] ml-0.5 lg:ml-1">{voucherData.paymentList.length}</span>
            </div>
          </div>
        </footer>

        <CommissionMapperModal 
          isOpen={isMapperOpen} 
          onClose={() => setIsMapperOpen(false)}
          selection={selection}
          commissionLines={voucherData.commissionLines}
          formatINR={formatINR}
          onSuccess={() => setIsCommissionCommitted(true)}
        />
      </div>
    </>
  );
};

export default SummaryStep;