import React, { useState, useMemo } from 'react';
import { 
  ArrowUpRight, ShieldCheck, ArrowRightLeft, 
  Coins, Activity, FileText, Banknote, Layers,
  Wallet, TrendingUp, TrendingDown, Landmark, 
  ArrowRight, CheckCircle2,
  Building2
} from 'lucide-react';
import CommissionMapperModal from './SummaryStep/CommissionMapperModal';

const SummaryStep = ({ selection, arns = [] }) => {
  const [isMapperOpen, setIsMapperOpen] = useState(false);
  const [isCommissionCommitted, setIsCommissionCommitted] = useState(false);
  const [userSelectedBank, setUserSelectedBank] = useState(null);

  // HELPER: Strict Boolean Parser
  const isTrue = (val) => val === true || String(val).toLowerCase() === 'true';

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

  const activeBank = userSelectedBank || (bankSummaries.length > 0 ? bankSummaries[0].tallyLedgerName : null);

  const allTransactions = useMemo(() => {
    return (selection?.stagedData?.transactions || []).filter(t => t && t.narration !== "EMPTY_FILE_MARKER");
  }, [selection?.stagedData?.transactions]);

  // 2. GLOBAL COMMISSION EXTRACTOR
  const globalCommissionLines = useMemo(() => {
    return allTransactions.filter(t => isTrue(t?.isCommission));
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
    if (!selection?.arnId) return false;
    const activeArnObject = arns.find(a => 
      String(a._id) === String(selection.arnId) || String(a.arnCode) === String(selection.arnId)
    );
    return !!activeArnObject?.gstCompliant;
  }, [arns, selection?.arnId]);

  // 4. THE STRICT FORWARD-MATH GROUPING ENGINE
  const transactionGroups = useMemo(() => {
    const groupsMap = new Map();
    let manualCounter = 0;

    // STEP A: Group transactions strictly by Party Ledger
    activeBankTransactions.forEach(tx => {
      const isManual = isTrue(tx?.isMarkedForManualEntry) || !(tx?.suggestedLedger || tx?.ledgerName);
      
      let groupKey;
      if (isManual) {
        groupKey = `MANUAL_${manualCounter++}`;
      } else {
        groupKey = `${tx.type}_${tx.suggestedLedger || tx.ledgerName}`;
      }

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          id: groupKey,
          partyLedger: isManual ? 'Manual Exception' : (tx.suggestedLedger || tx.ledgerName),
          type: isManual ? 'MANUAL' : tx.type,
          transactions: [],
          vouchers: [],
          totalBankAmount: 0,
          isManual: isManual
        });
      }

      const group = groupsMap.get(groupKey);
      group.transactions.push(tx);
      group.totalBankAmount += Math.abs(tx.amount || 0);
    });

    const groups = Array.from(groupsMap.values());

    // STEP B: Generate Exact Vouchers via Forward-Math
    groups.forEach(group => {
      if (group.isManual) {
        group.vouchers.push({ type: 'MANUAL', amount: group.totalBankAmount, data: group.transactions[0] });
        return;
      }

      if (group.type === 'RECEIPT') {
        
        // 1. Generate 1 Sales Voucher for EVERY transaction flagged as a sale
        const salesTxs = group.transactions.filter(t => isTrue(t.isSales));
        
        salesTxs.forEach(tx => {
          let activeSalesLedger = tx.individualSalesLedger || selection?.salesIncomeLedger || "SUSPENSE SALES LEDGER";
          let invoiceDate = tx.invoiceBillingDate || tx.date || "";

          // STRICT RULE: Base is the bank amount UNLESS user explicitly overwrote it
          let baseAmount = (tx.baseAmount !== undefined && tx.baseAmount !== null && tx.baseAmount !== "") 
            ? Number(tx.baseAmount) 
            : Math.abs(tx.amount || 0);

          let cgst = 0, sgst = 0, igst = 0;

          // STRICT RULE: Only calculate GST if the ARN is GST Compliant
          if (isGstCompliant) {
            const applyCG = isTrue(tx.applyCGST);
            const applySG = isTrue(tx.applySGST);
            const applyIG = isTrue(tx.applyIGST);

            cgst = (tx.cgst !== undefined && tx.cgst !== null && tx.cgst !== "") ? Number(tx.cgst) : (applyCG ? baseAmount * 0.09 : 0);
            sgst = (tx.sgst !== undefined && tx.sgst !== null && tx.sgst !== "") ? Number(tx.sgst) : (applySG ? baseAmount * 0.09 : 0);
            igst = (tx.igst !== undefined && tx.igst !== null && tx.igst !== "") ? Number(tx.igst) : (applyIG ? baseAmount * 0.18 : 0);
          }

          let grossTotal = baseAmount + cgst + sgst + igst;

          group.vouchers.push({
            type: 'SALES',
            grossTotal,
            baseAmount,
            cgst,
            sgst,
            igst,
            activeSalesLedger,
            invoiceBillingDate: invoiceDate
          });
        });

        // 2. Generate 1 Receipt Voucher for EVERY transaction
        group.transactions.forEach(tx => {
          group.vouchers.push({ type: 'RECEIPT', amount: Math.abs(tx.amount || 0), data: tx });
        });

      } else if (group.type === 'PAYMENT') {
        group.transactions.forEach(tx => {
          group.vouchers.push({ type: 'PAYMENT', amount: Math.abs(tx.amount || 0), data: tx });
        });
      }
    });

    return groups.sort((a, b) => {
      if (a.isManual) return 1;
      if (b.isManual) return -1;
      const aHasSales = a.vouchers.some(v => v.type === 'SALES');
      const bHasSales = b.vouchers.some(v => v.type === 'SALES');
      if (aHasSales && !bHasSales) return -1;
      if (!aHasSales && bHasSales) return 1;
      return 0;
    });
  }, [activeBankTransactions, selection?.salesIncomeLedger, isGstCompliant]);

  const activeBankVoucherStats = useMemo(() => {
    let receiptTotal = 0, paymentTotal = 0;
    let counts = { receipt: 0, payment: 0, sales: 0, manual: 0 };
    
    transactionGroups.forEach(g => {
      g.vouchers.forEach(v => {
        if (v.type === 'RECEIPT') { receiptTotal += v.amount; counts.receipt++; }
        if (v.type === 'PAYMENT') { paymentTotal += v.amount; counts.payment++; }
        if (v.type === 'SALES') { counts.sales++; }
        if (v.type === 'MANUAL') { counts.manual++; }
      });
    });
    return { receiptTotal, paymentTotal, counts };
  }, [transactionGroups]);

  const globalCounts = useMemo(() => {
    return {
      sales: allTransactions.filter(t => isTrue(t.isSales) && t.type === 'RECEIPT' && !isTrue(t.isMarkedForManualEntry)).length,
      receipts: allTransactions.filter(t => t.type === 'RECEIPT' && !isTrue(t.isMarkedForManualEntry) && !!(t.suggestedLedger || t.ledgerName)).length,
      payments: allTransactions.filter(t => t.type === 'PAYMENT' && !isTrue(t.isMarkedForManualEntry) && !!(t.suggestedLedger || t.ledgerName)).length,
      manual: allTransactions.filter(t => isTrue(t.isMarkedForManualEntry) || !(t.suggestedLedger || t.ledgerName)).length
    };
  }, [allTransactions]);

  const monthName = useMemo(() => {
    return new Date(selection?.year || new Date().getFullYear(), (selection?.month || 1) - 1).toLocaleString('default', { month: 'long' });
  }, [selection?.month, selection?.year]);

  if (!selection?.stagedData?.transactions || !activeBank) {
    return (
      <div className="h-full w-full bg-white flex flex-col items-center justify-center gap-4 text-gray-500">
        <Activity size={24} className="animate-spin text-blue-600" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Parsing Ledger Data...</span>
      </div>
    );
  }

  // Minimalist Color Palette mapping for headers and borders
  const getGroupTheme = (type) => {
    if (type === 'RECEIPT') return { text: 'text-emerald-600', border: 'border-emerald-500', icon: <ArrowRightLeft size={18} /> };
    if (type === 'PAYMENT') return { text: 'text-rose-600', border: 'border-rose-500', icon: <Coins size={18} /> };
    return { text: 'text-amber-600', border: 'border-amber-500', icon: <Activity size={18} /> };
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}} />
      
      {/* PERFECT WHITE BACKGROUND - NO SLATE ALLOWED */}
      <div className="h-full w-full bg-white overflow-y-auto custom-scroll text-gray-900 font-sans pb-32">
        
        {/* ===================== HERO HEADER (UNTOUCHED) ===================== */}
        <div className="bg-[#0f172a] w-full px-6 lg:px-12 pt-8 pb-14 text-white relative">
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 w-full relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shrink-0">
                <Building2 size={28} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1 flex items-center gap-1">Company</span>
                <h2 className="text-[24px] font-black leading-none tracking-tight text-white mb-2">
                  {selection?.tallyCompany || "Not Specified"}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Voucher Manifesto</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" /> 
                  <span className="text-slate-300">{monthName} {selection?.year}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl backdrop-blur-md">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-white/10 pr-4">Total Vouchers</div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-blue-400">{globalCounts.sales} Sales</span>
                  <span className="text-xs font-bold text-emerald-400">{globalCounts.receipts} Rec</span>
                  <span className="text-xs font-bold text-rose-400">{globalCounts.payments} Pay</span>
                  {globalCounts.manual > 0 && <span className="text-xs font-bold text-amber-400">{globalCounts.manual} Holds</span>}
                </div>
              </div>
              {globalCommissionLines.length > 0 && (
                <div className="flex items-center gap-4 bg-slate-800/50 border border-slate-700 px-5 py-2.5 rounded-xl backdrop-blur-md">
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto-Log Commissions</span>
                    <span className="text-xs font-bold text-slate-200">{globalCommissionLines.length} entries detected</span>
                  </div>
                  <div className="w-px h-8 bg-slate-700" />
                  <div>
                    {isCommissionCommitted ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-black uppercase tracking-widest">
                        <CheckCircle2 size={16} /> Mapped
                      </span>
                    ) : (
                      <button 
                        onClick={() => setIsMapperOpen(true)} 
                        className="flex cursor-pointer items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all hover:bg-emerald-500 active:scale-95"
                      >
                        Open<ArrowUpRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {bankSummaries.length > 0 && (
            <div className="w-full mt-10 border-b border-white/10 flex gap-8 overflow-x-auto no-scrollbar relative z-10">
              {bankSummaries.map((bank) => {
                const isActive = activeBank === bank.tallyLedgerName;
                return (
                  <button 
                    key={bank.tallyLedgerName}
                    onClick={() => setUserSelectedBank(bank.tallyLedgerName)}
                    className={`py-3 text-[11px] font-black uppercase tracking-widest transition-colors relative whitespace-nowrap ${
                      isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {bank.tallyLedgerName}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-blue-500 rounded-t-md" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ===================== FLOATING METRICS (UNTOUCHED) ===================== */}
        <div className="w-full px-6 lg:px-12 -mt-6 relative z-10">
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 px-8 py-5 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-6 lg:gap-12">
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">
                  <Wallet size={12}/> Opening
                </span>
                <span className="font-mono text-lg font-bold text-slate-800">{formatINR(activeBankMetrics.openingBalance)}</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-emerald-600 font-bold mb-0.5">
                  <TrendingUp size={12}/> Receipts
                </span>
                <span className="font-mono text-lg font-bold text-emerald-600">+{formatINR(activeBankVoucherStats.receiptTotal)}</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-rose-600 font-bold mb-0.5">
                  <TrendingDown size={12}/> Payments
                </span>
                <span className="font-mono text-lg font-bold text-rose-600">-{formatINR(activeBankVoucherStats.paymentTotal)}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 lg:gap-12">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-blue-50/80 border border-blue-100/50 text-blue-700 text-[10px] font-bold rounded-lg tracking-wide">
                  {activeBankVoucherStats.counts.sales} Sales
                </span>
                <span className="px-2.5 py-1 bg-emerald-50/80 border border-emerald-100/50 text-emerald-700 text-[10px] font-bold rounded-lg tracking-wide">
                  {activeBankVoucherStats.counts.receipt} Rec
                </span>
                <span className="px-2.5 py-1 bg-rose-50/80 border border-rose-100/50 text-rose-700 text-[10px] font-bold rounded-lg tracking-wide">
                  {activeBankVoucherStats.counts.payment} Pay
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col text-right">
                <span className="flex items-center justify-end gap-1.5 text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">
                  <Landmark size={12}/> Closing
                </span>
                <span className="font-mono text-xl font-black text-slate-900 leading-none">{formatINR(activeBankMetrics.closingBalance)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== PURE FLAT SPREADSHEET LEDGER ===================== */}
        <div className="w-full px-6 lg:px-12 mt-12">
          {transactionGroups.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-gray-400 border-t border-b border-gray-200">
              <Layers size={36} className="mb-4 text-gray-300" />
              <span className="text-sm font-bold uppercase tracking-widest">No Actionable Groups</span>
              <span className="text-sm mt-1">This statement period is fully resolved or empty.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-16">
              {transactionGroups.map((group, idx) => {
                const theme = getGroupTheme(group.type);
                
                return (
                  <div key={group.id || idx} className="w-full">
                    
                    {/* --- CLEAN GROUP HEADER --- */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b-2 border-gray-900">
                      <div className="flex items-end gap-3">
                        <span className={`${theme.text} mb-1`}>{theme.icon}</span>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">
                            {group.type === 'RECEIPT' ? 'Receipt Group' : group.type === 'PAYMENT' ? 'Payment Group' : 'Exception Group'} 
                            <span className="ml-2 text-gray-400">({group.transactions.length} entries)</span>
                          </span>
                          <span className={`text-[20px] font-black leading-none tracking-tight ${theme.text}`}>
                            {group.partyLedger}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className={`font-mono font-black text-xl leading-none ${theme.text}`}>
                          {group.type === 'RECEIPT' ? '+' : '-'}{formatINR(group.totalBankAmount)}
                        </span>
                      </div>
                    </div>

                    {/* --- THE PIPELINE GRID --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_60px_1fr] w-full pt-2">
                      
                      {/* LEFT: Raw Bank Statements */}
                      <div className="py-2 pr-0 lg:pr-8 flex flex-col">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 mt-2 flex items-center gap-1.5">
                          <Banknote size={14}/> Bank Statement Source
                        </div>
                        {group.transactions.map((tx, tIdx) => (
                          <div key={tIdx} className="group flex justify-between items-start gap-4 py-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50/80 transition-colors">
                            <div className="flex flex-col gap-1 pr-4">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {tx.date ? new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No Date'}
                              </span>
                              <span className="text-[13px] font-medium text-gray-800 leading-snug">
                                {tx.narration}
                              </span>
                            </div>
                            <span className="font-mono text-[14px] font-bold text-gray-900 shrink-0">
                              {formatINR(tx.amount)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* MIDDLE: Visual Connector Arrow */}
                      <div className="hidden lg:flex flex-col items-center relative">
                        <div className="absolute top-0 bottom-0 left-1/2 w-px border-l-2 border-dashed border-gray-200 -translate-x-1/2" />
                        <div className="relative z-10 mt-12 w-16 h-16 bg-white flex items-center justify-center text-blue-300">
                          <ArrowRight size={30} strokeWidth={2}/>
                        </div>
                      </div>

                      {/* RIGHT: Generated Tally Vouchers */}
                      <div className="py-2 pl-0 lg:pl-8 flex flex-col border-t lg:border-t-0 border-gray-200 mt-6 lg:mt-0">
                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4 mt-2 flex items-center gap-1.5">
                          <FileText size={14}/> Tally Vouchers Preview
                        </div>
                        
                        {group.vouchers.map((v, vIdx) => {

                          // RECEIPT VOUCHER ROW
                          if (v.type === 'RECEIPT') {
                            return (
                              <div key={vIdx} className="group relative flex justify-between items-center py-4 pl-5 border-b border-gray-200 last:border-b-0 hover:bg-emerald-50/40 transition-colors">
                                <div className="absolute left-0 top-4 bottom-4 w-0.75 bg-emerald-500 rounded-full" />
                                <div className="flex flex-col gap-1 pr-4">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                    Receipt
                                  </span>
                                  <span className="text-[13px] font-bold text-gray-800 leading-snug">
                                    {v.data.suggestedLedger || v.data.ledgerName}
                                  </span>
                                </div>
                                <span className="font-mono text-[14px] font-black text-emerald-600 shrink-0">
                                  {formatINR(v.amount)}
                                </span>
                              </div>
                            );
                          }

                          // SALES VOUCHER ROW
                          if (v.type === 'SALES') {
                            return (
                              <div key={vIdx} className="group relative flex flex-col gap-2.5 py-4 pl-5 border-b border-gray-200 last:border-b-0 hover:bg-blue-50/40 transition-colors">
                                <div className="absolute left-0 top-4 bottom-4 w-0.75 bg-blue-500 rounded-full" />
                                
                                <div className="flex justify-between items-start gap-4">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                                      Sales Invoice
                                    </span>
                                    <span className="text-[14px] font-bold text-gray-900 leading-snug">
                                      {v.activeSalesLedger}
                                    </span>
                                  </div>
                                  <span className="font-mono text-[15px] font-black text-blue-600 shrink-0">
                                    {formatINR(v.grossTotal)}
                                  </span>
                                </div>
                                
                                {/* INLINE GST TEXT (No bulky pills) */}
                                <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-semibold text-gray-500 tracking-wide mt-1">
                                  <span>Base: <span className="text-gray-900">{formatINR(v.baseAmount).replace('₹', '')}</span></span>
                                  {v.cgst > 0 && (
                                    <>
                                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                                      <span>CG: <span className="text-gray-900">{formatINR(v.cgst).replace('₹', '')}</span></span>
                                    </>
                                  )}
                                  {v.sgst > 0 && (
                                    <>
                                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                                      <span>SG: <span className="text-gray-900">{formatINR(v.sgst).replace('₹', '')}</span></span>
                                    </>
                                  )}
                                  {v.igst > 0 && (
                                    <>
                                      <span className="w-1 h-1 rounded-full bg-blue-300" />
                                      <span className="text-blue-600">IGST: <span className="font-bold">{formatINR(v.igst).replace('₹', '')}</span></span>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          }


                          // PAYMENT VOUCHER ROW
                          if (v.type === 'PAYMENT') {
                            return (
                              <div key={vIdx} className="group relative flex justify-between items-center py-4 pl-5 border-b border-gray-200 last:border-b-0 hover:bg-rose-50/40 transition-colors">
                                <div className="absolute left-0 top-4 bottom-4 w-0.75 bg-rose-500 rounded-full" />
                                <div className="flex flex-col gap-1 pr-4">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">
                                    Payment
                                  </span>
                                  <span className="text-[13px] font-bold text-gray-800 leading-snug">
                                    {v.data.suggestedLedger || v.data.ledgerName}
                                  </span>
                                </div>
                                <span className="font-mono text-[14px] font-black text-rose-600 shrink-0">
                                  {formatINR(v.amount)}
                                </span>
                              </div>
                            );
                          }

                          // MANUAL HOLD ROW
                          if (v.type === 'MANUAL') {
                            return (
                              <div key={vIdx} className="group relative flex justify-between items-center py-4 pl-5 border-b border-gray-200 last:border-b-0 hover:bg-amber-50/40 transition-colors">
                                <div className="absolute left-0 top-4 bottom-4 w-0.75 bg-amber-500 rounded-full" />
                                <div className="flex flex-col gap-1 pr-4">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                                    Hold / Manual Review
                                  </span>
                                  <span className="text-[13px] font-bold text-amber-900 italic leading-snug">
                                    Missing Ledger Mapping
                                  </span>
                                </div>
                                <span className="font-mono text-[14px] font-black text-amber-600 shrink-0">
                                  {formatINR(v.amount)}
                                </span>
                              </div>
                            );
                          }

                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL TRIGGER */}
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