import React, { useState, useMemo } from 'react';
import { Landmark, ChevronDown, ArrowUpRight, ChevronUp, AlertTriangle, ShieldCheck, ArrowRightLeft, Receipt, Coins, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
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

    const normalizedSalesRows = salesInvoices.map(tx => {
      const net = tx.amount || 0;
      const ledgerName = tx.suggestedLedger || "SUSPENSE SALES LEDGER";
      const normalizedLedger = ledgerName.toUpperCase();
      const isLocal = normalizedLedger.includes("NJ") || normalizedLedger.includes("LOCAL") || normalizedLedger.includes("STATE");
      
      let cgst = 0, sgst = 0, igst = 0;
      if (isGstCompliant) {
        if (isLocal) {
          cgst = net * 0.09;
          sgst = net * 0.09;
        } else {
          igst = net * 0.18;
        }
      }
      return {
        ...tx,
        ledgerName,
        baseAmount: net,
        cgst,
        sgst,
        igst,
        grossTotal: net + cgst + sgst + igst
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
    <div className="h-full w-full bg-white dark:bg-[#08090A] flex flex-col overflow-hidden text-left font-sans text-slate-800 dark:text-slate-200">
      
      {/* HEADER CONTROL STRIP */}
      <div className="px-12 py-5 bg-slate-50 dark:bg-[#0B0C10] border-b border-slate-200 dark:border-white/5 flex justify-between items-center shrink-0">
        <div className="space-y-1">
          <h2 className="text-base font-black uppercase tracking-wide text-slate-900 dark:text-white">
            Pre-Flight Sync Verification Ledger
          </h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Company: {selection?.tallyCompany || "Not Specified"} <span className="mx-2 text-slate-300">•</span> Period: {monthName} {selection?.year}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-black uppercase text-slate-600 dark:text-slate-300">
          <Landmark size={14} className="text-emerald-500" /> Bank Ledger: <span className="text-slate-900 dark:text-white underline decoration-emerald-500 underline-offset-4 font-mono">{selection?.tallyLedger || "Not Selected"}</span>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-12 py-6 space-y-6">
        
        {/* EXECUTIVE HIGHLIGHT REAL WORLD OPENING AND CLOSING METRICS */}
        <div className="grid grid-cols-3 gap-6 shrink-0 select-none">
          <div className="bg-slate-50 dark:bg-[#121318] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Statement Opening Balance</span>
            <p className="text-xl font-[1000] font-mono text-slate-900 dark:text-white leading-none">{formatINR(balanceMetrics.opening)}</p>
          </div>
          <div className="bg-emerald-500/[0.04] dark:bg-emerald-500/[0.02] border border-emerald-500/20 rounded-2xl p-5 shadow-sm">
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-1.5">Total Receipts (Bank Impact)</span>
            <p className="text-xl font-[1000] font-mono text-emerald-600 dark:text-emerald-400 leading-none">+{formatINR(voucherData.receiptTotal)}</p>
          </div>
          <div className="bg-slate-950 text-white dark:bg-white/5 border border-slate-900 dark:border-white/10 rounded-2xl p-5 shadow-sm">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Statement Closing Balance</span>
            <p className="text-xl font-[1000] font-mono text-white leading-none">{formatINR(balanceMetrics.closing)}</p>
          </div>
        </div>

        {/* MUTUAL FUND ADVISORY AUTOMATION LOGGER HUB BAR */}
        {voucherData.commissionLines.length > 0 && (
          <div className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Sparkles size={16} fill="currentColor" />
              </div>
              <div>
                <h4 className="text-[12.5px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wide">
                  Mutual Fund Trail Commissions Tracked
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Isolated <span className="text-emerald-600 dark:text-emerald-400 font-black">{voucherData.commissionLines.length} income credits</span> for batch mapping layout automation.
                </p>
              </div>
            </div>

            {isCommissionCommitted ? (
              <div className="flex items-center gap-2 border border-emerald-600/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl select-none">
                <CheckCircle2 size={13} strokeWidth={3} /> Commissions Already Logged
              </div>
            ) : (
              <button
                onClick={() => setIsMapperOpen(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all active:scale-95"
              >
                Automate Log To Dashboard <ArrowUpRight size={13} strokeWidth={3} />
              </button>
            )}
          </div>
        )}

        {/* ==================== VOUCHER SECTION 1: ACCRUAL SALES INVOICES ==================== */}
        <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#0C0D12] shadow-sm">
          <div 
            onClick={() => toggleSection('sales')}
            className="px-6 py-4 bg-blue-500/[0.04] dark:bg-blue-500/[0.02] flex items-center justify-between cursor-pointer border-b border-slate-200 dark:border-white/10 select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <ArrowRightLeft size={14} strokeWidth={2.5} />
              </div>
              <h3 className="text-[12.5px] font-black uppercase tracking-wider text-blue-950 dark:text-blue-400">
                Projected Accrual Sales Invoices ({voucherData.salesList.length} Invoices to Generate)
              </h3>
            </div>
            <div className="flex items-center gap-4 font-mono font-black text-[13.5px] text-blue-600 dark:text-blue-400">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Gross Revenue:</span>
              <span>{formatINR(voucherData.salesTotal)}</span>
              {expandedSections.sales ? <ChevronUp size={16} className="opacity-40" /> : <ChevronDown size={16} className="opacity-40" />}
            </div>
          </div>
          
          {expandedSections.sales && (
            <div className="p-6">
              {voucherData.salesList.length === 0 ? (
                <div className="flex items-center gap-2 text-slate-400 py-2 text-[11px] font-black uppercase tracking-widest">
                  <Info size={14}/> No corporate commissions processed or approved as sales vouchers.
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar">
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
              )}
            </div>
          )}
        </div>

        {/* ==================== VOUCHER SECTION 2: BANK RECEIPTS ==================== */}
        <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#0C0D12] shadow-sm">
          <div 
            onClick={() => toggleSection('receipts')}
            className="px-6 py-4 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.02] flex items-center justify-between cursor-pointer border-b border-slate-200 dark:border-white/10 select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Receipt size={14} strokeWidth={2.5} />
              </div>
              <h3 className="text-[12.5px] font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-400">
                Bank Receipt Vouchers <span className="text-slate-400 dark:text-slate-500 font-medium ml-1">({voucherData.receiptList.length} Cash Clearing Lines)</span>
              </h3>
            </div>
            <div className="flex items-center gap-4 font-mono font-black text-[13.5px] text-emerald-600 dark:text-emerald-400">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Total Received:</span>
              <span>{formatINR(voucherData.receiptTotal)}</span>
              {expandedSections.receipts ? <ChevronUp size={16} className="opacity-40" /> : <ChevronDown size={16} className="opacity-40" />}
            </div>
          </div>
          
          {expandedSections.receipts && (
            <div className="p-6">
              {voucherData.receiptList.length === 0 ? (
                <div className="flex items-center gap-2 text-slate-400 py-2 text-[11px] font-black uppercase tracking-widest">
                  <Info size={14}/> No incoming credit statement items located inside the array worksheet.
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-[11.5px] border-collapse table-fixed">
                    <thead>
                      <tr className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/10 pb-2.5">
                        <th className="pb-2.5 text-left w-[18%]">Statement Date</th>
                        <th className="pb-2.5 text-left w-[42%]">Tally Offset Ledger Name</th>
                        <th className="pb-2.5 w-[22%] pl-2 text-left">Bank Narration Particulars</th>
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
              )}
            </div>
          )}
        </div>

        {/* ==================== VOUCHER SECTION 3: BANK PAYMENTS ==================== */}
        <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#0C0D12] shadow-sm">
          <div 
            onClick={() => toggleSection('payments')}
            className="px-6 py-4 bg-rose-500/[0.04] dark:bg-rose-500/[0.02] flex items-center justify-between cursor-pointer border-b border-slate-200 dark:border-white/10 select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Coins size={14} strokeWidth={2.5} />
              </div>
              <h3 className="text-[12.5px] font-black uppercase tracking-wider text-rose-900 dark:text-rose-400">
                Bank Payment Vouchers <span className="text-slate-400 dark:text-slate-500 font-medium ml-1">({voucherData.paymentList.length} Debit Withdrawals)</span>
              </h3>
            </div>
            <div className="flex items-center gap-4 font-mono font-black text-[13.5px] text-rose-600 dark:text-rose-400">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Total Debited:</span>
              <span>{formatINR(voucherData.paymentTotal)}</span>
              {expandedSections.payments ? <ChevronUp size={16} className="opacity-40" /> : <ChevronDown size={16} className="opacity-40" />}
            </div>
          </div>
          
          {expandedSections.payments && (
            <div className="p-6">
              {voucherData.paymentList.length === 0 ? (
                <div className="flex items-center gap-2 text-slate-400 py-2 text-[11px] font-black uppercase tracking-widest">
                  <Info size={14}/> No payment debits logged inside the current statement array period.
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar">
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
              )}
            </div>
          )}
        </div>

        {/* ==================== VOUCHER SECTION 4: MANUAL OVERRIDES & HOLDS ==================== */}
        <div className="border border-amber-200 dark:border-amber-500/20 rounded-2xl overflow-hidden bg-white dark:bg-[#0C0D12] shadow-sm">
          <div 
            onClick={() => toggleSection('manual')}
            className="px-6 py-4 bg-amber-500/[0.04] dark:bg-amber-500/[0.01] flex items-center justify-between cursor-pointer border-b border-slate-200 dark:border-white/10 select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <AlertTriangle size={14} strokeWidth={2.5} />
              </div>
              <h3 className="text-[12.5px] font-black uppercase tracking-wider text-slate-900 dark:text-slate-200">
                Staged Manual Entry Hold List ({voucherData.manualList.length} Items Pending)
              </h3>
            </div>
            <div className="flex items-center gap-4 font-mono font-black text-[13.5px] text-amber-600 dark:text-amber-400">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Hold Volume:</span>
              <span>{formatINR(voucherData.manualTotal)}</span>
              {expandedSections.manual ? <ChevronUp size={16} className="opacity-40" /> : <ChevronDown size={16} className="opacity-40" />}
            </div>
          </div>
          
          {expandedSections.manual && (
            <div className="p-6">
              {voucherData.manualList.length === 0 ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 py-2 text-[11px] font-black uppercase tracking-widest">
                  <ShieldCheck size={14}/> Clean Ledger Registry: No manual override dropouts found for this batch.
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar">
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
                        <tr key={row._id} className="hover:bg-slate-50/50 dark:hover:bg-white/1 transition-colors">
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
              )}
            </div>
          )}
        </div>

      </div>

      {/* FOOTER SYSTEM CONTROL BAR */}
      <footer className="px-8 py-5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0C10] flex items-center justify-between shrink-0 shadow-2xl">
        <div className="flex items-center gap-4 text-left select-none">
          <ShieldCheck size={16} className="text-emerald-500" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
            Pre-flight generation locks verified <span className="mx-2 text-slate-200 dark:text-white/5">|</span> Ready to stream batch XML parameters to Tally Prime proxy
          </p>
        </div>
        <div className="text-right flex items-center gap-6 text-[10.5px] font-black uppercase text-slate-400 tracking-wider select-none">
          <div>Receipt Vouchers: <span className="text-emerald-600 dark:text-emerald-400 font-[1000] ml-1">{voucherData.receiptList.length} Cr</span></div>
          <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
          <div>Sales Invoices: <span className="text-blue-500 dark:text-blue-400 font-[1000] ml-1">{voucherData.salesList.length} Invoices</span></div>
          <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
          <div>Payment Vouchers: <span className="text-rose-500 dark:text-rose-400 font-[1000] ml-1">{voucherData.paymentList.length} Dr</span></div>
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
  );
};

export default SummaryStep;