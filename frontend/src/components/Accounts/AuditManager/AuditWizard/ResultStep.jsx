import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CheckCircle2, XCircle, FileText, AlertCircle, TrendingUp, TrendingDown, Layers, Loader2, Zap, Check, Play } from 'lucide-react';
import { useApi } from '../../../../hooks/useApi';
import { tallyTemplates } from '../../../../utils/tallyTemplates';

const ResultStep = ({ transactions, companyName, bankLedgerName, salesIncomeLedger, onComplete }) => {
  const { request } = useApi();
  const safeTransactions = transactions || [];

  // =========================================================================
  // STATE DEFINITIONS
  // =========================================================================
  const [phase, setPhase] = useState('READY'); // 'READY' | 'PROCESSING' | 'DONE'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCurrentlyCreating, setIsCurrentlyCreating] = useState(false);
  const [completedLogs, setCompletedLogs] = useState([]); 
  const [finalResults, setFinalResults] = useState([]); 

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // =========================================================================
  // TASK FLATTENER ENGINE (Decoupled & Normalized Vector Queue)
  // =========================================================================
  const voucherTasks = useMemo(() => {
    const tasks = [];
    safeTransactions.forEach((tx) => {
      // Task A: Standard Bank Ledger Match (Receipts / Payments)
      if (tx.isChecked) {
        tasks.push({
          id: `bank-${tx._id}`,
          vType: tx.type, // 'RECEIPT' or 'PAYMENT'
          rawTx: tx
        });
      }
      // Task B: Commission Sales Invoice Match
      if (tx.isCommission && tx.isSalesApproved) {
        tasks.push({
          id: `sales-${tx._id}`,
          vType: 'SALES',
          rawTx: tx
        });
      }
    });
    return tasks;
  }, [safeTransactions]);

  // =========================================================================
  // FORMATTERS & METRIC AGGREGATORS
  // =========================================================================
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(Math.abs(amount || 0)).replace('₹', '₹ ');
  };

  const getVoucherTypeLabel = (type) => {
    switch (type) {
      case 'RECEIPT': return 'Bank Receipt';
      case 'PAYMENT': return 'Bank Payment';
      case 'SALES': return 'Sales Invoice';
      default: return 'Voucher';
    }
  };

  const readyMetrics = useMemo(() => {
    return voucherTasks.reduce((acc, task) => {
      acc[task.vType] = (acc[task.vType] || 0) + 1;
      return acc;
    }, { RECEIPT: 0, PAYMENT: 0, SALES: 0 });
  }, [voucherTasks]);

  // =========================================================================
  // CONTROLLED TRANSLATION PUSH BUTTON LOGIC
  // =========================================================================
  const handleStartSynchronization = async () => {
    if (voucherTasks.length === 0) {
      setPhase('DONE');
      if (onCompleteRef.current) onCompleteRef.current();
      return;
    }

    setPhase('PROCESSING');
    setCompletedLogs([]);
    setFinalResults([]);
    setCurrentIndex(0);
    setIsCurrentlyCreating(true);

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    for (let i = 0; i < voucherTasks.length; i++) {
      const task = voucherTasks[i];
      const tx = task.rawTx;
      
      setCurrentIndex(i);
      setIsCurrentlyCreating(true);

      let xmlPayload = "";
      let finalAmountForLog = Math.abs(task.vType === 'SALES' ? (tx.grossVoucherTotal || tx.amount) : tx.amount);
      let finalLedgerForLog = tx.suggestedLedger || tx.ledgerName || 'UNKNOWN LEDGER';
      let finalNarrationForLog = tx.customNarration || tx.narration || "Auto-generated via Accrual Bridge";
      let finalVoucherNoForLog = null;

      // Ensure proper YYYY-MM-DD Date Conversion avoiding UTC offset jumps
      let safeDate = "";
      try {
          const dStr = task.vType === 'SALES' ? (tx.invoiceBillingDate || tx.date) : tx.date;
          const d = new Date(dStr || new Date());
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          safeDate = `${yyyy}-${mm}-${dd}`;
      } catch {
          safeDate = new Date().toISOString().split('T')[0];
      }

      const normalizedLedger = finalLedgerForLog.toUpperCase();
      const isLocalAmc = tx.isLocalAmc !== undefined ? tx.isLocalAmc : (normalizedLedger.includes("NJ") || normalizedLedger.includes("LOCAL") || normalizedLedger.includes("STATE"));
      const resolvedIncomeLedger = isLocalAmc ? "MF COMMISSION (LOC)" : (salesIncomeLedger || "MF COMMISION INCOME");

      // Deep Mapping Logic
      if (task.vType === 'SALES') {
        const salesData = {
          company: companyName,
          date: safeDate,
          invoiceNumber: tx.invoiceNumber || `INV-${tx._id.slice(-5).toUpperCase()}`,
          ledgerName: finalLedgerForLog,
          incomeLedger: resolvedIncomeLedger,
          amount: Math.abs(tx.baseAmount !== undefined ? tx.baseAmount : tx.amount),
          gstType: (tx.cgst > 0 || tx.sgst > 0) ? "LOCAL" : (tx.igst > 0 ? "INTERSTATE" : "NONE"),
          cgstLedger: "CGST",
          sgstLedger: "SGST",
          igstLedger: "IGST",
          cgstAmount: Math.abs(tx.cgst || 0),
          sgstAmount: Math.abs(tx.sgst || 0),
          igstAmount: Math.abs(tx.igst || 0),
          narration: finalNarrationForLog
        };
        xmlPayload = tallyTemplates.generateSalesVoucher(salesData);
        finalVoucherNoForLog = salesData.invoiceNumber;
      } else {
        const bankData = {
          company: companyName,
          type: task.vType === 'RECEIPT' ? 'Receipt' : 'Payment',
          date: safeDate,
          ledgerName: finalLedgerForLog,
          bankAccount: bankLedgerName,
          amount: Math.abs(tx.amount),
          narration: finalNarrationForLog
        };
        xmlPayload = tallyTemplates.generateVoucher(bankData);
      }

      let isSuccess = false;
      let errorMsg = null;

      try {
        const response = await request("/tally/proxy", "POST", { xml: xmlPayload });
        const responseStr = typeof response === 'string' ? response : (response?.data || JSON.stringify(response));
        
        if (responseStr.includes("<CREATED>1</CREATED>") || responseStr.includes("CREATED: 1")) {
          isSuccess = true;
        } else {
          errorMsg = responseStr.includes("Line Error") ? "Tally missing specific ledger account masters or state configurations." : "Tally engine rejected voucher serialization layout.";
        }
      } catch (err) {
        errorMsg = err.message || "Loss of active data pipeline tunnel between app and local PC.";
      }

      setIsCurrentlyCreating(false);

      const processedItem = {
        _id: `${task.id}-${i}`,
        vType: task.vType,
        ledger: finalLedgerForLog,
        amount: finalAmountForLog,
        date: safeDate,
        narration: finalNarrationForLog,
        voucherNumber: finalVoucherNoForLog,
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        error: errorMsg
      };

      setFinalResults(prev => [...prev, processedItem]);
      setCompletedLogs(prev => {
        const newLog = { id: `${processedItem._id}-${Date.now()}`, item: processedItem, isSuccess };
        return [...prev, newLog].slice(-3);
      });

      await sleep(350); 
    }

    await sleep(600);
    setPhase('DONE');
    if (onCompleteRef.current) onCompleteRef.current();
  };

  // =========================================================================
  // VIEW GROUP BUILDER (Summary Stage Mapping)
  // =========================================================================
  const groupedResults = useMemo(() => {
    return finalResults.reduce((acc, curr) => {
      const type = curr.vType || 'UNKNOWN';
      if (!acc[type]) acc[type] = { items: [], total: 0 };
      acc[type].items.push(curr);
      acc[type].total += (curr.amount || 0);
      return acc;
    }, {});
  }, [finalResults]);

  const totalSuccess = finalResults.filter(r => r.status === 'SUCCESS').length;
  const totalFailed = finalResults.filter(r => r.status === 'FAILED').length;

  const getTypeConfig = (type) => {
    switch(type) {
      case 'RECEIPT': return { icon: <TrendingUp size={16}/>, title: 'Bank Receipts', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' };
      case 'PAYMENT': return { icon: <TrendingDown size={16}/>, title: 'Bank Payments', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20' };
      case 'SALES': return { icon: <Layers size={16}/>, title: 'Commission Sales Invoices', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-200 dark:border-indigo-500/20' };
      default: return { icon: <FileText size={16}/>, title: 'Other Vouchers', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-500/10', border: 'border-slate-200 dark:border-slate-500/20' };
    }
  };

  // =========================================================================
  // PHASE VIEW 1: MANUALLY TRIGGERED GATEWAY ZONE (Safe Landing)
  // =========================================================================
  if (phase === 'READY') {
    return (
      <div className="h-full w-full bg-slate-50/50 dark:bg-[#08090A] lg:bg-white flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md bg-white dark:bg-[#111214] border border-slate-200 dark:border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-400">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm">
            <Layers size={24} />
          </div>
          
          <div className="space-y-1.5">
            <h2 className="text-xl font-[1000] uppercase tracking-tight text-slate-900 dark:text-white italic">
              Verification Staging Ready
            </h2>
            <p className="text-xs font-bold text-slate-400">
              The compilation engine flattened your selections into absolute book tasks.
            </p>
          </div>

          {/* Setup Breakdown Metrics Info Cards */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 p-3 rounded-xl flex flex-col items-center text-center">
              <TrendingUp size={14} className="text-emerald-500 mb-1" />
              <span className="text-[14px] font-[1000] text-slate-800 dark:text-slate-200">{readyMetrics.RECEIPT}</span>
              <span className="text-[7.5px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Receipts</span>
            </div>
            <div className="bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 p-3 rounded-xl flex flex-col items-center text-center">
              <TrendingDown size={14} className="text-rose-500 mb-1" />
              <span className="text-[14px] font-[1000] text-slate-800 dark:text-slate-200">{readyMetrics.PAYMENT}</span>
              <span className="text-[7.5px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Payments</span>
            </div>
            <div className="bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 p-3 rounded-xl flex flex-col items-center text-center">
              <Layers size={14} className="text-indigo-500 mb-1" />
              <span className="text-[14px] font-[1000] text-slate-800 dark:text-slate-200">{readyMetrics.SALES}</span>
              <span className="text-[7.5px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Invoices</span>
            </div>
          </div>

          <button
            onClick={handleStartSynchronization}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-[0.15em] flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/10 mt-2"
          >
            <Play size={14} fill="currentColor" /> Begin Tally Sync Sequence
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PHASE VIEW 2: REAL-TIME PROGRESSIVE WRITER FEED
  // =========================================================================
  if (phase === 'PROCESSING') {
    const activeTask = voucherTasks[currentIndex];
    const progressPercent = (currentIndex / Math.max(1, voucherTasks.length)) * 100;

    return (
      <div className="h-full w-full bg-slate-50/50 dark:bg-[#08090A] lg:bg-white flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg flex flex-col items-center gap-10 animate-in zoom-in-95 duration-500 py-4">
          
          <div className="text-center w-full max-w-sm mx-auto">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-500/20">
               <Zap className="text-emerald-500" size={20} fill="currentColor" />
            </div>
            <h2 className="text-xl lg:text-2xl font-[1000] uppercase tracking-tight text-slate-900 dark:text-white italic mb-1">
              Writing to Tally
            </h2>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Processing {currentIndex + 1} of {voucherTasks.length} Entries
            </p>
            
            <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden mt-6 shadow-inner">
              <div className="h-full bg-emerald-500 transition-all duration-500 ease-out relative" style={{ width: `${progressPercent}%` }}>
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col gap-3 min-h-[260px]">
            <div className="flex items-start gap-4 bg-white dark:bg-[#111214] border-2 border-emerald-500/30 dark:border-emerald-500/40 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(16,185,129,0.05)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                {isCurrentlyCreating ? <Loader2 size={18} className="animate-spin" strokeWidth={3} /> : <CheckCircle2 size={18} strokeWidth={3} />}
              </div>
              
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
                  {isCurrentlyCreating ? 'Currently Generating' : 'Finalizing...'}
                </span>
                
                {isCurrentlyCreating && activeTask ? (
                  <div className="flex flex-col">
                    <span className="text-sm font-[1000] text-slate-900 dark:text-white truncate">
                      {activeTask.rawTx.suggestedLedger || activeTask.rawTx.ledgerName || 'Suspense Accounting Master'}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{getVoucherTypeLabel(activeTask.vType)}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span className="text-[10px] font-bold text-slate-500 italic tabular-nums">{formatINR(activeTask.rawTx.grossVoucherTotal || activeTask.rawTx.amount)}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm font-[1000] text-slate-900 dark:text-white animate-pulse">Please wait...</span>
                )}
              </div>
            </div>

            {/* Structured History Log Rows */}
            <div className="flex flex-col gap-2.5 px-2 mt-2">
              {completedLogs.map((log, idx) => {
                const opacityClass = idx === completedLogs.length - 1 ? 'opacity-100' : idx === completedLogs.length - 2 ? 'opacity-60' : 'opacity-30';
                return (
                  <div key={log.id} className={`flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 transition-opacity ${opacityClass}`}>
                    <div className={`shrink-0 mt-0.5 ${log.isSuccess ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {log.isSuccess ? <CheckCircle2 size={16} strokeWidth={3} /> : <XCircle size={16} strokeWidth={3} />}
                    </div>
                    
                    <div className="flex-1 min-w-0 text-[11.5px] text-slate-600 dark:text-slate-300 truncate">
                      {log.isSuccess ? (
                        <>Saved <span className="font-[1000] text-slate-900 dark:text-white">{getVoucherTypeLabel(log.item.vType)}</span> for <span className="font-[1000] text-slate-900 dark:text-white">{log.item.ledger}</span></>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-bold">Failed to save {getVoucherTypeLabel(log.item.vType)} for {log.item.ledger}</span>
                      )}
                    </div>
                    
                    <div className={`shrink-0 text-[10px] font-[1000] tabular-nums px-2 py-0.5 rounded-md border ${log.isSuccess ? 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-white/5 dark:border-white/10 dark:text-slate-400' : 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20'}`}>
                       {formatINR(log.item.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PHASE VIEW 3: CARD-BASED SUMMARY BREAKDOWN SCREEN
  // =========================================================================
  return (
    <div className="h-full w-full bg-[#FAFAFA] dark:bg-[#08090A] lg:bg-slate-50/50 flex flex-col overflow-hidden text-left text-slate-800 dark:text-slate-200 font-sans relative animate-in fade-in zoom-in-95 duration-500">
      
      {/* HEADER BAR */}
      <div className="px-5 lg:px-12 py-5 bg-white dark:bg-[#0B0C10] border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0 z-10 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg lg:text-xl font-[1000] uppercase tracking-tight text-slate-900 dark:text-white italic">
            Synchronization Complete
          </h2>
          <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-500" />
            All queued items synchronized to database. Ready to lock ledger map session.
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
               <Check size={14} className="text-emerald-600 dark:text-emerald-400" strokeWidth={4} />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mb-0.5">Committed</span>
              <span className="text-sm font-[1000] text-emerald-700 dark:text-emerald-300 tabular-nums leading-none">{totalSuccess}</span>
            </div>
          </div>

          {totalFailed > 0 && (
            <div className="flex items-center gap-2.5 px-4 py-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-200 dark:border-rose-500/20">
              <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
                 <XCircle size={14} className="text-rose-600 dark:text-rose-400" strokeWidth={3} />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest leading-none mb-0.5">Failed</span>
                <span className="text-sm font-[1000] text-rose-700 dark:text-rose-300 tabular-nums leading-none">{totalFailed}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COMPACT SECTIONAL CARDS SUMMARY LISTS */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 lg:p-12 space-y-8 lg:space-y-10 pb-24">
        {Object.keys(groupedResults).length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center opacity-20 gap-3">
             <CheckCircle2 size={36} strokeWidth={1.5} />
             <p className="text-xs font-black uppercase tracking-widest">No entries successfully compiled.</p>
           </div>
        ) : (
          Object.entries(groupedResults).map(([type, group]) => {
            const config = getTypeConfig(type);
            return (
              <div key={type} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Accordion Card Category Header */}
                <div className="flex items-end justify-between border-b-2 border-slate-200 dark:border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${config.bg} ${config.color} ${config.border} border`}>
                      {config.icon}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-[1000] uppercase tracking-wider text-slate-800 dark:text-slate-200 leading-tight">
                        {config.title}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {group.items.length} Records
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Total Group Value</span>
                    <span className="text-sm font-[1000] text-slate-900 dark:text-white tabular-nums italic">{formatINR(group.total)}</span>
                  </div>
                </div>

                {/* Sub-item Cards List Grid */}
                <div className="grid grid-cols-1 gap-3">
                  {group.items.map((item) => {
                    const isSuccess = item.status === 'SUCCESS';
                    return (
                      <div key={item._id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all ${isSuccess ? 'bg-white dark:bg-[#111214] border-slate-200 dark:border-white/5' : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/20'}`}>
                        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                          <div className={`shrink-0 mt-0.5 sm:mt-0 ${isSuccess ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isSuccess ? <CheckCircle2 size={20} strokeWidth={2.5} /> : <AlertCircle size={20} strokeWidth={2.5} />}
                          </div>
                          
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap mb-1">
                              <span className="text-xs sm:text-[13px] font-[1000] uppercase tracking-tight text-slate-900 dark:text-white leading-tight break-words">
                                {item.ledger}
                              </span>
                              {isSuccess && item.voucherNumber && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 shrink-0">
                                  <FileText size={10} /> {item.voucherNumber}
                                </span>
                              )}
                            </div>
                            
                            {!isSuccess && item.error ? (
                              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 leading-snug">
                                {item.error}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500 font-medium leading-snug truncate">
                                {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} 
                                <span className="mx-1.5 opacity-40">•</span> 
                                {item.narration}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 sm:pl-6 text-left sm:text-right mt-3 sm:mt-0 ml-9 sm:ml-0">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block sm:hidden mb-0.5">Amount</span>
                          <p className={`text-sm font-[1000] tabular-nums ${isSuccess ? 'text-slate-800 dark:text-slate-200' : 'text-rose-600 dark:text-rose-400'}`}>
                             {formatINR(item.amount)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ResultStep;