import React, { useState, useMemo } from 'react';
import { 
  Landmark, ArrowUpRight, AlertTriangle, ShieldCheck, 
  ArrowRightLeft, Receipt, Coins, Sparkles, CheckCircle2, 
  Activity, Building2, Wallet, ChevronDown, ChevronUp, Check, FileText
} from 'lucide-react';
import CommissionMapperModal from './SummaryStep/CommissionMapperModal';

const SummaryStep = ({ selection, arns = [] }) => {
  const [isMapperOpen, setIsMapperOpen] = useState(false);
  const [isCommissionCommitted, setIsCommissionCommitted] = useState(false);
  const [userSelectedBank, setUserSelectedBank] = useState(null);

  const [expandedSections, setExpandedSections] = useState({
    sales: true,
    receipts: true,
    payments: true,
    manual: true
  });

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  // 1. ROBUST BANK & DATA PARSING
  const bankSummaries = useMemo(() => {
    if (selection?.audit?.bankSummaries && selection.audit.bankSummaries.length > 0) {
      return selection.audit.bankSummaries;
    }
    if (selection?.tallyLedger) {
      return [{
        tallyLedgerName: selection.tallyLedger,
        openingBalance: selection?.audit?.summary?.openingBalance || 0,
        closingBalance: selection?.audit?.summary?.closingBalance || 0
      }];
    }
    return [];
  }, [selection]);

  // Derived Active Bank Selection
  const activeBank = userSelectedBank || (bankSummaries.length > 0 ? bankSummaries[0].tallyLedgerName : null);

  const allTransactions = useMemo(() => {
    return (selection?.stagedData?.transactions || []).filter(t => t && t.narration !== "EMPTY_FILE_MARKER");
  }, [selection?.stagedData?.transactions]);

  // 2. GLOBAL COMMISSION EXTRACTOR
  const globalCommissionLines = useMemo(() => {
    return allTransactions.filter(t => t?.isCommission);
  }, [allTransactions]);

  // 3. ACTIVE BANK FILTERING
  const activeBankTransactions = useMemo(() => {
    if (bankSummaries.length <= 1) return allTransactions;
    return allTransactions.filter(t => {
      const txBank = t.bank || t.bankAccount || t.bankLedger || t.tallyLedgerName || "";
      return txBank.toUpperCase() === (activeBank || "").toUpperCase();
    });
  }, [allTransactions, activeBank, bankSummaries.length]);

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(Math.abs(amount || 0)).replace('₹', '₹ ');
  };

  const activeBankMetrics = useMemo(() => {
    return bankSummaries.find(b => b.tallyLedgerName === activeBank) || { openingBalance: 0, closingBalance: 0 };
  }, [bankSummaries, activeBank]);

  const isGstCompliant = useMemo(() => {
    return arns.find(a => a._id === selection?.arnId || a.arnCode === selection?.arnId)?.gstCompliant || false;
  }, [arns, selection?.arnId]);

  // 4. ACTIVE BANK VOUCHER SPLITS (Strict root selection tracking for React Compiler alignment)
  const voucherData = useMemo(() => {
    const isTxVerified = (t) => t.isChecked || (selection?.verifiedIds && selection.verifiedIds.includes(t._id));

    const receipts = activeBankTransactions.filter(t => 
      t?.type === 'RECEIPT' && isTxVerified(t) && !t?.isMarkedForManualEntry && !!(t?.suggestedLedger || t?.ledgerName) && !t?.isSales
    );

    const payments = activeBankTransactions.filter(t => 
      t?.type === 'PAYMENT' && isTxVerified(t) && !t?.isMarkedForManualEntry && !!(t?.suggestedLedger || t?.ledgerName)
    );

    const salesInvoices = activeBankTransactions.filter(t => 
      t?.isSales && isTxVerified(t) && t?.type === 'RECEIPT' && !t?.isMarkedForManualEntry
    );

    const manualEntries = activeBankTransactions.filter(t => 
      t?.isMarkedForManualEntry || (isTxVerified(t) && !(t?.suggestedLedger || t?.ledgerName))
    );

    const normalizedSalesRows = salesInvoices.map(tx => {
      const net = Math.abs(tx.amount || 0);
      const ledgerName = tx.suggestedLedger || tx.ledgerName || "SUSPENSE SALES LEDGER";
      const normalizedLedger = ledgerName.toUpperCase();
      const isLocal = normalizedLedger.includes("NJ") || normalizedLedger.includes("LOCAL") || normalizedLedger.includes("STATE");
      
      let cgst = 0, sgst = 0, igst = 0;
      let grossTotal = net;

      if (isGstCompliant) {
        if (isLocal) {
          cgst = net * 0.09;
          sgst = net * 0.09;
          grossTotal = net + cgst + sgst;
        } else {
          igst = net * 0.18;
          grossTotal = net + igst;
        }
      }

      return { ...tx, ledgerName, baseAmount: net, cgst, sgst, igst, grossTotal };
    });

    return {
      receiptList: receipts,
      receiptTotal: receipts.reduce((sum, t) => sum + Math.abs(t?.amount || 0), 0),
      paymentList: payments,
      paymentTotal: payments.reduce((sum, t) => sum + Math.abs(t?.amount || 0), 0),
      salesList: normalizedSalesRows,
      salesTotal: normalizedSalesRows.reduce((sum, t) => sum + t.grossTotal, 0),
      manualList: manualEntries,
      manualTotal: manualEntries.reduce((sum, t) => sum + Math.abs(t?.amount || 0), 0),
    };
  }, [activeBankTransactions, isGstCompliant, selection]);

  const monthName = useMemo(() => {
    return new Date(selection?.year || new Date().getFullYear(), (selection?.month || 1) - 1).toLocaleString('default', { month: 'long' });
  }, [selection?.month, selection?.year]);

  // 5. GLOBAL COUNTS (Strict root selection tracking for React Compiler alignment)
  const globalCounts = useMemo(() => {
    const isTxVerified = (t) => t.isChecked || (selection?.verifiedIds && selection.verifiedIds.includes(t._id));
    const verified = allTransactions.filter(isTxVerified);
    return {
      sales: verified.filter(t => t.isSales && t.type === 'RECEIPT' && !t.isMarkedForManualEntry).length,
      receipts: verified.filter(t => t.type === 'RECEIPT' && !t.isMarkedForManualEntry && !!(t.suggestedLedger || t.ledgerName) && !t.isSales).length,
      payments: verified.filter(t => t.type === 'PAYMENT' && !t.isMarkedForManualEntry && !!(t.suggestedLedger || t.ledgerName)).length,
      manual: verified.filter(t => t.isMarkedForManualEntry || !(t.suggestedLedger || t.ledgerName)).length
    };
  }, [allTransactions, selection]);

  if (!selection?.stagedData?.transactions || !activeBank) {
    return (
      <div className="h-full w-full bg-slate-50 flex flex-col items-center justify-center gap-4 text-slate-500">
        <Activity size={28} className="animate-spin text-blue-600" />
        <span className="text-xs font-bold uppercase tracking-widest">Assembling Final Ledgers...</span>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
      <div className="h-full w-full bg-slate-50 flex flex-col overflow-hidden text-left font-sans text-slate-800 selection:bg-blue-100">
        
        {/* ===================== COMPACT FIXED CONTROL PANEL ===================== */}
        <div className="bg-white border-b border-slate-200 shrink-0 z-20 flex flex-col">
          
          {/* Base Branding Bar */}
          <div className="px-6 py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <FileText size={18} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 leading-none">
                  Tally Voucher Creation Preview
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Company: <span className="text-blue-600">{selection?.tallyCompany || "Not Specified"}</span>
                  <span className="text-slate-300">•</span> 
                  <span>{monthName} {selection?.year}</span>
                </div>
              </div>
            </div>
            
            {/* Header Performance Metrics */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-lg border border-slate-200/60 shadow-inner">
                <div className="text-slate-500">Sales <span className="text-blue-600 ml-0.5 text-xs">{globalCounts.sales}</span></div>
                <div className="w-px h-3 bg-slate-200" />
                <div className="text-slate-500">Receipts <span className="text-emerald-600 ml-0.5 text-xs">{globalCounts.receipts}</span></div>
                <div className="w-px h-3 bg-slate-200" />
                <div className="text-slate-500">Payments <span className="text-rose-600 ml-0.5 text-xs">{globalCounts.payments}</span></div>
                <div className="w-px h-3 bg-slate-200" />
                <div className="text-slate-500">Holds <span className="text-amber-600 ml-0.5 text-xs">{globalCounts.manual}</span></div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                <ShieldCheck size={14} strokeWidth={2.5} /> Live Sync
              </div>
            </div>
          </div>

          {/* ===================== STRUCTURAL GLOBAL COMMISSION COMPONENT ===================== */}
          {globalCommissionLines.length > 0 && (
            <div className="px-6 py-2.5 bg-linear-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                  <Sparkles size={14} fill="currentColor" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider leading-none">Commission Engine</h4>
                  <p className="text-[13px] text-white-100 font-medium mt-0.5">
                    Isolated <span className="font-black underline underline-offset-2">{globalCommissionLines.length} Trail Commissions</span> from the Statements to log
                  </p>
                </div>
              </div>

              <div>
                {isCommissionCommitted ? (
                  <div className="flex items-center justify-center gap-1.5 bg-white/10 text-emerald-200 font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded border border-white/10 select-none">
                    <CheckCircle2 size={12} strokeWidth={3} /> Complete
                  </div>
                ) : (
                  <button
                    onClick={() => setIsMapperOpen(true)}
                    className="flex items-center justify-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-4 py-1.5 rounded font-black text-[10px] uppercase tracking-widest transition-transform active:scale-95 shadow-sm"
                  >
                    Add Commissions <ArrowUpRight size={12} strokeWidth={3} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ===================== ROBUST VISIBLE BANK TABS ===================== */}
          {bankSummaries.length > 0 && (
            <div className="px-6 bg-slate-50 border-b border-slate-200 flex gap-1 pt-2 overflow-x-auto no-scrollbar">
              {bankSummaries.map((bank) => {
                const isActive = activeBank === bank.tallyLedgerName;
                return (
                  <button 
                    key={bank.tallyLedgerName}
                    onClick={() => setUserSelectedBank(bank.tallyLedgerName)}
                    className={`px-5 py-2.5 rounded-t-lg transition-all border-t border-x text-left flex flex-col min-w-50 gap-0.5 outline-none relative ${
                      isActive 
                        ? 'bg-white border-slate-200 text-blue-700 shadow-xs font-bold' 
                        : 'bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200/70 hover:text-slate-700'
                    }`}
                    style={isActive ? { marginBottom: '-1px', borderBottomColor: '#ffffff' } : {}}
                  >
                    <span className="text-[11px] font-black uppercase tracking-wide truncate max-w-42.5">
                      {bank.tallyLedgerName}
                    </span>
                    <span className={`text-[10px] font-mono tracking-wide ${isActive ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                      Bal: {formatINR(bank.closingBalance)}
                    </span>
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 h-0.75 bg-blue-600 rounded-t-lg" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ===================== STAGED LEDGER VIEWSPACE ===================== */}
        <div className="flex-1 overflow-y-auto custom-scroll px-6 py-6 space-y-6">
          
          {/* BRIGHT BENTO STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs border-l-4 border-l-slate-400">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 items-center gap-1.5"><Wallet size={12}/> Opening Balance</span>
              <p className="text-base font-black font-mono tracking-tight text-slate-800 leading-none">{formatINR(activeBankMetrics.openingBalance)}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs border-l-4 border-l-emerald-500 shadow-emerald-500/5">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1 items-center gap-1.5"><ArrowRightLeft size={12}/> Reciepts</span>
              <p className="text-base font-black font-mono tracking-tight text-emerald-600 leading-none">+ {formatINR(voucherData.receiptTotal + voucherData.salesTotal)}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs border-l-4 border-l-rose-500 shadow-rose-500/5">
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block mb-1 items-center gap-1.5"><Coins size={12}/>Payments</span>
              <p className="text-base font-black font-mono tracking-tight text-rose-600 leading-none">- {formatINR(voucherData.paymentTotal)}</p>
            </div>

            <div className="bg-slate-900 border border-slate-950 rounded-xl p-4 shadow-md border-l-4 border-l-blue-500">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 items-center gap-1.5"><Building2 size={12}/> Statement Closing</span>
              <p className="text-base font-black font-mono tracking-tight text-white leading-none">{formatINR(activeBankMetrics.closingBalance)}</p>
            </div>
          </div>

          {/* FULL-WIDTH ACCORDION MODULES */}
          <div className="space-y-4">

            {/* 1. SALES PIPELINE */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div 
                onClick={() => toggleSection('sales')} 
                className="px-5 py-3 flex items-center justify-between cursor-pointer bg-blue-50/60 border-l-4 border-l-blue-600 select-none hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Receipt size={16} className="text-blue-600" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-950">
                    Sales Vouchers <span className="text-blue-600/80 font-mono ml-1">({voucherData.salesList.length})</span>
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-black text-sm text-blue-600">{formatINR(voucherData.salesTotal)}</span>
                  {expandedSections.sales ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </div>

              {expandedSections.sales && (
                <div className="border-t border-slate-200">
                  {voucherData.salesList.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">No active sales vouchers tracked</div>
                  ) : (
                    <table className="w-full text-left whitespace-nowrap">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70 border-b border-slate-200">
                          <th className="py-3 px-5">Tally Income Account</th>
                          <th className="py-3 px-5 text-center">Tax Invoice Date</th>
                          <th className="py-3 px-5 text-right">Taxable Turnover</th>
                          <th className="py-3 px-5 text-right">GST Collection</th>
                          <th className="py-3 px-5 text-right text-slate-900">Gross Staged</th>
                        </tr>
                      </thead>
                      <tbody className="text-[12px] font-bold uppercase">
                        {voucherData.salesList.map((row) => (
                          <tr key={row._id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-5 text-slate-900 font-black">{row.suggestedLedger || row.ledgerName}</td>
                            <td className="py-3 px-5 text-center font-mono text-slate-500">
                              {row.invoiceBillingDate ? new Date(row.invoiceBillingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '——'}
                            </td>
                            <td className="py-3 px-5 text-right font-mono text-slate-600">{formatINR(row.baseAmount).replace('₹','')}</td>
                            <td className="py-3 px-5 text-right font-mono text-amber-600">{formatINR(row.cgst + row.sgst + row.igst).replace('₹','')}</td>
                            <td className="py-3 px-5 text-right font-black font-sans text-blue-600">{formatINR(row.grossTotal).replace('₹','')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

            {/* 2. BANK RECEIPTS */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div 
                onClick={() => toggleSection('receipts')} 
                className="px-5 py-3 flex items-center justify-between cursor-pointer bg-emerald-50/60 border-l-4 border-l-emerald-600 select-none hover:bg-emerald-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ArrowRightLeft size={16} className="text-emerald-600" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-950">
                    Receipt Vouchers <span className="text-emerald-600/80 font-mono ml-1">({voucherData.receiptList.length})</span>
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-black text-sm text-emerald-600">{formatINR(voucherData.receiptTotal)}</span>
                  {expandedSections.receipts ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </div>

              {expandedSections.receipts && (
                <div className="border-t border-slate-200">
                  {voucherData.receiptList.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">No verified inflows tracked</div>
                  ) : (
                    <table className="w-full text-left whitespace-nowrap">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70 border-b border-slate-200">
                          <th className="py-3 px-5">Value Date</th>
                          <th className="py-3 px-5">Offset Ledger Head</th>
                          <th className="py-3 px-5">Bank Narration String</th>
                          <th className="py-3 px-5 text-right text-slate-900">Amount (Cr)</th>
                        </tr>
                      </thead>
                      <tbody className="text-[12px] font-bold uppercase">
                        {voucherData.receiptList.map((row) => (
                          <tr key={row._id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-5 font-mono text-slate-500">
                              {row.date ? new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '——'}
                            </td>
                            <td className="py-3 px-5 text-slate-900 font-black">{row.suggestedLedger || row.ledgerName}</td>
                            <td className="py-3 px-5 text-slate-400 font-mono tracking-tight text-[11px] truncate max-w-xl">{row.narration}</td>
                            <td className="py-3 px-5 text-right font-black font-sans text-emerald-600">{formatINR(row.amount).replace('₹','')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

            {/* 3. BANK PAYMENTS */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div 
                onClick={() => toggleSection('payments')} 
                  className="px-5 py-3 flex items-center justify-between cursor-pointer bg-rose-50/60 border-l-4 border-l-rose-600 select-none hover:bg-rose-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Coins size={16} className="text-rose-600" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-rose-950">
                    Payment Vouchers <span className="text-rose-600/80 font-mono ml-1">({voucherData.paymentList.length})</span>
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-black text-sm text-rose-600">{formatINR(voucherData.paymentTotal)}</span>
                  {expandedSections.payments ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </div>

              {expandedSections.payments && (
                <div className="border-t border-slate-200">
                  {voucherData.paymentList.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">No verified outflows logged</div>
                  ) : (
                    <table className="w-full text-left whitespace-nowrap">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/70 border-b border-slate-200">
                          <th className="py-3 px-5">Value Date</th>
                          <th className="py-3 px-5">Target Expense/Asset Head</th>
                          <th className="py-3 px-5">Bank Narration String</th>
                          <th className="py-3 px-5 text-right text-slate-900">Amount (Dr)</th>
                        </tr>
                      </thead>
                      <tbody className="text-[12px] font-bold uppercase">
                        {voucherData.paymentList.map((row) => (
                          <tr key={row._id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-5 font-mono text-slate-500">
                              {row.date ? new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '——'}
                            </td>
                            <td className="py-3 px-5 text-slate-900 font-black">{row.suggestedLedger || row.ledgerName}</td>
                            <td className="py-3 px-5 text-slate-400 font-mono tracking-tight text-[11px] truncate max-w-xl">{row.narration}</td>
                            <td className="py-3 px-5 text-right font-black font-sans text-rose-600">{formatINR(row.amount).replace('₹','')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

            {/* 4. RESTORED MANUAL ENTRIES TABLE */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div 
                onClick={() => toggleSection('manual')} 
                className="px-5 py-3 flex items-center justify-between cursor-pointer bg-amber-50/60 border-l-4 border-l-amber-500 select-none hover:bg-amber-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-amber-950">
                    Manual Vouchers & Exceptions <span className="text-amber-700 font-mono ml-1">({voucherData.manualList.length})</span>
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-black text-sm text-amber-600">{formatINR(voucherData.manualTotal)}</span>
                  {expandedSections.manual ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </div>

              {expandedSections.manual && (
                <div className="border-t border-slate-200">
                  {voucherData.manualList.length === 0 ? (
                    <div className="py-10 flex flex-col items-center justify-center text-emerald-600 bg-slate-50/40">
                      <ShieldCheck size={26} className="mb-2 text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Clean Stage Registry</span>
                      <span className="text-[11px] font-medium text-slate-400 mt-0.5">All tracked statement entries mapped flawlessly to ledgers.</span>
                    </div>
                  ) : (
                    <table className="w-full text-left whitespace-nowrap">
                      <thead>
                        <tr className="text-[10px] font-black text-amber-800 uppercase tracking-widest bg-amber-50/40 border-b border-amber-200">
                          <th className="py-3 px-5">Statement Date</th>
                          <th className="py-3 px-5">Exception Vector</th>
                          <th className="py-3 px-5">Bank Narration Details</th>
                          <th className="py-3 px-5 text-right text-amber-900">Unresolved Amount</th>
                        </tr>
                      </thead>
                      <tbody className="text-[12px] font-bold uppercase">
                        {voucherData.manualList.map((row) => (
                          <tr key={row._id} className="border-b border-slate-100 hover:bg-amber-50/30 transition-colors">
                            <td className="py-3 px-5 font-mono text-slate-500">
                              {row.date ? new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '——'}
                            </td>
                            <td className="py-3 px-5 text-amber-700">
                              {row.isMarkedForManualEntry ? "USER REQUESTED HOLD" : (row.suggestedLedger || row.ledgerName || "UNRESOLVED SUSPENSE")}
                            </td>
                            <td className="py-3 px-5 text-slate-500 font-mono text-[11px] truncate max-w-xl">{row.narration}</td>
                            <td className="py-3 px-5 text-right font-black font-mono text-amber-600">{formatINR(row.amount).replace('₹','')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* COMPACT MODAL TRIGGER */}
        {isMapperOpen && (
          <CommissionMapperModal 
            isOpen={isMapperOpen} 
            onClose={() => setIsMapperOpen(false)}
            selection={selection}
            commissionLines={globalCommissionLines}
            formatINR={formatINR}
            onSuccess={() => {
              setIsCommissionCommitted(true);
              setIsMapperOpen(false);
            }}
          />
        )}
      </div>
    </>
  );
};

export default SummaryStep;