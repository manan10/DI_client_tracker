import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  CheckCircle2, XCircle, FileText, AlertCircle, 
  TrendingUp, TrendingDown, Layers, Loader2, 
  Play, ShieldCheck, Landmark, Banknote, Zap, Send
} from 'lucide-react';
import { useApi } from '../../../../hooks/useApi';
import { tallyTemplates } from '../../../../utils/tallyTemplates';
import { toast } from 'sonner';

const ResultStep = ({ transactions, companyName, bankLedgerName, salesIncomeLedger, arns = [], arnId, masterLedgers = [], onComplete }) => {
  const { request } = useApi();
  
  const safeTransactions = useMemo(() => transactions || [], [transactions]);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // =========================================================================
  // STATE DEFINITIONS
  // =========================================================================
  const [vouchers, setVouchers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);

  // HELPER: Strict Boolean Parser
  const isTrue = (val) => val === true || String(val).toLowerCase() === 'true';

  const activeArnObject = useMemo(() => (arns || []).find(a => a._id === arnId || a.arnCode === arnId), [arns, arnId]);
  const isGstCompliant = !!activeArnObject?.gstCompliant;

  // =========================================================================
  // INITIALIZATION: TASK FLATTENER ENGINE 
  // =========================================================================
  useEffect(() => {
    const initialVouchers = [];
    
    safeTransactions.forEach((tx) => {
      if (isTrue(tx.isMarkedForManualEntry)) return;

      const bankName = tx.bank || tx.bankAccount || tx.bankLedger || 'Default Bank';

      // 1. Bank Receipt/Payment Voucher
      if (isTrue(tx.isChecked) && !!(tx.suggestedLedger || tx.ledgerName)) {
        initialVouchers.push({
          id: `bank-${tx._id}`,
          refId: tx._id,
          vType: tx.type, 
          bank: bankName,
          rawTx: tx,
          status: 'PENDING',
          voucherNo: null,
          errorMsg: null
        });
      }

      // 2. Commission Sales Invoice
      if (isTrue(tx.isSales) && tx.type === 'RECEIPT' && isTrue(tx.isSalesApproved)) {
        initialVouchers.push({
          id: `sales-${tx._id}`,
          refId: tx._id,
          vType: 'SALES',
          bank: bankName,
          rawTx: tx,
          status: 'PENDING',
          voucherNo: null,
          errorMsg: null
        });
      }
    });

    setVouchers(initialVouchers);
  }, [safeTransactions]); 

  // =========================================================================
  // HELPERS
  // =========================================================================
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 2
    }).format(Math.abs(amount || 0)).replace('₹', '₹ ');
  };

  const monthName = useMemo(() => {
    if(!safeTransactions.length) return "Current Month";
    const d = new Date(safeTransactions[0].date);
    return isNaN(d) ? "Current Month" : d.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [safeTransactions]);

  const stats = useMemo(() => {
    return vouchers.reduce((acc, v) => {
      acc.total++;
      if (v.status === 'PENDING') acc.pending++;
      if (v.status === 'SUCCESS') acc.success++;
      if (v.status === 'FAILED') acc.failed++;
      if (v.vType === 'SALES') acc.sales++;
      if (v.vType === 'RECEIPT') acc.receipts++;
      if (v.vType === 'PAYMENT') acc.payments++;
      return acc;
    }, { total: 0, pending: 0, success: 0, failed: 0, sales: 0, receipts: 0, payments: 0 });
  }, [vouchers]);

  const globalCounts = useMemo(() => {
    return {
      sales: safeTransactions.filter(tx => isTrue(tx.isSales) && tx.type === 'RECEIPT' && isTrue(tx.isSalesApproved) && !isTrue(tx.isMarkedForManualEntry)).length,
      receipts: safeTransactions.filter(tx => tx.type === 'RECEIPT' && isTrue(tx.isChecked) && !!(tx.suggestedLedger || tx.ledgerName) && !isTrue(tx.isMarkedForManualEntry)).length,
      payments: safeTransactions.filter(tx => tx.type === 'PAYMENT' && isTrue(tx.isChecked) && !!(tx.suggestedLedger || tx.ledgerName) && !isTrue(tx.isMarkedForManualEntry)).length,
      manual: safeTransactions.filter(tx => isTrue(tx.isMarkedForManualEntry) || !(tx.suggestedLedger || tx.ledgerName)).length
    };
  }, [safeTransactions]);

  const groupedVouchers = useMemo(() => {
    const groups = {};
    vouchers.forEach(v => {
      if (!groups[v.bank]) groups[v.bank] = [];
      groups[v.bank].push(v);
    });
    return groups;
  }, [vouchers]);

  const getThemeConfig = (type) => {
    if (type === 'RECEIPT') return { text: 'text-emerald-600', border: 'border-emerald-500', icon: <TrendingUp size={16} />, label: 'Receipt' };
    if (type === 'PAYMENT') return { text: 'text-rose-600', border: 'border-rose-500', icon: <TrendingDown size={16} />, label: 'Payment' };
    if (type === 'SALES') return { text: 'text-blue-600', border: 'border-blue-500', icon: <Layers size={16} />, label: 'Sales Invoice' };
    return { text: 'text-slate-600', border: 'border-slate-500', icon: <FileText size={16} />, label: 'Voucher' };
  };

  // =========================================================================
  // EXECUTION ENGINE (TALLY SYNC)
  // =========================================================================
  const processBatch = async (idsToProcess) => {
    if (idsToProcess.length === 0 || isProcessing) return;
    setIsProcessing(true);
    setGlobalProgress(0);

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    for (let i = 0; i < idsToProcess.length; i++) {
      const vId = idsToProcess[i];
      
      setVouchers(prev => prev.map(v => v.id === vId ? { ...v, status: 'PROCESSING', errorMsg: null } : v));

      const targetVoucher = vouchers.find(v => v.id === vId);
      const tx = targetVoucher.rawTx;
      let xmlPayload = "";
      let finalVoucherNo = null;
      let isSuccess = false;
      let errorMsg = null;

      let safeDate = "";
      try {
        const dStr = targetVoucher.vType === 'SALES' ? (tx.invoiceBillingDate || tx.date) : tx.date;
        const d = new Date(dStr || new Date());
        safeDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      } catch {
        safeDate = new Date().toISOString().split('T')[0];
      }

      const finalLedger = tx.suggestedLedger || tx.ledgerName || 'UNKNOWN LEDGER';
      const finalNarration = tx.customNarration || tx.narration || "Auto-generated via Accrual Bridge";

      if (targetVoucher.vType === 'SALES') {
        let baseAmount = (tx.baseAmount !== undefined && tx.baseAmount !== null && tx.baseAmount !== "") ? Number(tx.baseAmount) : Math.abs(tx.amount || 0);
        let cgst = 0, sgst = 0, igst = 0;

        if (isGstCompliant) {
          const applyCG = isTrue(tx.applyCGST);
          const applySG = isTrue(tx.applySGST);
          const applyIG = isTrue(tx.applyIGST);

          cgst = (tx.cgst !== undefined && tx.cgst !== null && tx.cgst !== "") ? Number(tx.cgst) : (applyCG ? baseAmount * 0.09 : 0);
          sgst = (tx.sgst !== undefined && tx.sgst !== null && tx.sgst !== "") ? Number(tx.sgst) : (applySG ? baseAmount * 0.09 : 0);
          igst = (tx.igst !== undefined && tx.igst !== null && tx.igst !== "") ? Number(tx.igst) : (applyIG ? baseAmount * 0.18 : 0);
        }

        const activeSalesLedger = tx.individualSalesLedger || salesIncomeLedger || "SUSPENSE SALES LEDGER";
        const normalizedTargetLedger = finalLedger.toUpperCase().trim();
        const ledgerObj = masterLedgers.find(l => (l.name || "").toUpperCase().trim() === normalizedTargetLedger);

        const salesData = {
          company: companyName,
          date: safeDate,
          invoiceNumber: tx.invoiceNumber || `INV-${tx._id.slice(-5).toUpperCase()}`,
          ledgerName: finalLedger,
          incomeLedger: activeSalesLedger,
          amount: baseAmount,
          gstType: (cgst > 0 || sgst > 0) ? "LOCAL" : (igst > 0 ? "INTERSTATE" : "NONE"),
          cgstLedger: "CGST", sgstLedger: "SGST", igstLedger: "IGST",
          cgstAmount: cgst, sgstAmount: sgst, igstAmount: igst,
          narration: finalNarration,
          partyState: ledgerObj?.stateName || "",     
          partyCountry: ledgerObj?.country || "India",
          partyGstRegType: ledgerObj?.gstRegistrationType || (ledgerObj?.gstin ? "Regular" : "Unregistered"),
          partyGstin: ledgerObj?.gstin || "",         
          partyAddress: ledgerObj?.address || []  
        };
        xmlPayload = tallyTemplates.generateSalesVoucher(salesData);
        finalVoucherNo = salesData.invoiceNumber;
      } else {
        const bankData = {
          company: companyName,
          type: targetVoucher.vType === 'RECEIPT' ? 'Receipt' : 'Payment',
          date: safeDate,
          ledgerName: finalLedger,
          bankAccount: bankLedgerName || targetVoucher.bank,
          amount: Math.abs(tx.amount || 0),
          narration: finalNarration
        };
        xmlPayload = tallyTemplates.generateVoucher(bankData);
      }

      try {
        const response = await request("/tally/proxy", "POST", { xml: xmlPayload });
        const responseStr = typeof response === 'string' ? response : (response?.data || JSON.stringify(response));
        
        if (responseStr.includes("<CREATED>1</CREATED>") || responseStr.includes("CREATED: 1")) {
          isSuccess = true;
        } else {
          errorMsg = responseStr.includes("Line Error") ? "Missing Master Ledger configuration in Tally." : "Rejected by Tally Engine.";
        }
      } catch (err) {
        errorMsg = err.message || "Connection to local Tally tunnel lost.";
      }

      setVouchers(prev => prev.map(v => 
        v.id === vId ? { 
          ...v, 
          status: isSuccess ? 'SUCCESS' : 'FAILED', 
          voucherNo: isSuccess ? finalVoucherNo : null, 
          errorMsg 
        } : v
      ));

      setGlobalProgress(Math.round(((i + 1) / idsToProcess.length) * 100));
      await sleep(250); 
    }

    setIsProcessing(false);
    
    setVouchers(current => {
      const remainingPending = current.filter(v => v.status === 'PENDING').length;
      if (remainingPending === 0) {
        toast.success("Batch Operations Completed!");
      }
      return current;
    });
  };

  const handleSyncAll = () => processBatch(vouchers.filter(v => v.status === 'PENDING').map(v => v.id));
  const handleSyncType = (type) => processBatch(vouchers.filter(v => v.status === 'PENDING' && v.vType === type).map(v => v.id));
  const handleSyncBank = (bank) => processBatch(vouchers.filter(v => v.status === 'PENDING' && v.bank === bank).map(v => v.id));
  const handleSyncSingle = (id) => processBatch([id]);

  // =========================================================================
  // RENDER UI
  // =========================================================================
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

      <div className="h-full w-full bg-white overflow-y-auto custom-scroll text-slate-900 font-sans pb-32">
        
        {/* ===================== HERO HEADER ===================== */}
        <div className="bg-[#0f172a] w-full px-6 lg:px-12 pt-8 pb-14 text-white relative">
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 w-full relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shrink-0">
                <FileText size={24} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <h2 className="text-[24px] font-black leading-none tracking-tight text-white mb-2">
                  {companyName || "Final Synchronization"}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Execution Manifest</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" /> 
                  <span className="text-slate-300">{monthName}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" /> 
                  <span className="flex items-center gap-1 text-emerald-400"><ShieldCheck size={14} /> Bridge Active</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl backdrop-blur-md">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-white/10 pr-4">Global Queue</div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-200">{stats.total} Total</span>
                  <span className="text-xs font-bold text-emerald-400">{stats.success} Synced</span>
                  <span className="text-xs font-bold text-slate-400">{stats.pending} Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== GLOBAL EXECUTION TOOLBAR ===================== */}
        <div className="w-full px-6 lg:px-12 -mt-6 relative z-10 mb-8">
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/80 px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              <div className="flex flex-col shrink-0">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Sales Ready</span>
                <span className="font-mono text-base font-bold text-blue-600">{globalCounts.sales}</span>
              </div>
              <div className="w-px h-8 bg-slate-200 shrink-0" />
              <div className="flex flex-col shrink-0">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Receipts Ready</span>
                <span className="font-mono text-base font-bold text-emerald-600">{globalCounts.receipts}</span>
              </div>
              <div className="w-px h-8 bg-slate-200 shrink-0" />
              <div className="flex flex-col shrink-0">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Payments Ready</span>
                <span className="font-mono text-base font-bold text-rose-600">{globalCounts.payments}</span>
              </div>
            </div>
            
            {/* ENHANCED OUTLINED ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                disabled={isProcessing || stats.pending === 0 || stats.sales === 0}
                onClick={() => handleSyncType('SALES')}
                className="flex items-center gap-2 px-4 py-2 bg-transparent border-2 border-blue-500 hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Layers size={14} strokeWidth={2.5}/> Sync Sales
              </button>
              
              <button
                disabled={isProcessing || stats.pending === 0 || (stats.receipts === 0 && stats.payments === 0)}
                onClick={() => {
                  handleSyncType('RECEIPT');
                  setTimeout(() => handleSyncType('PAYMENT'), 500); 
                }}
                className="flex items-center gap-2 px-4 py-2 bg-transparent border-2 border-slate-300 hover:border-slate-500 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Banknote size={14} strokeWidth={2.5}/> Sync Banking
              </button>

              <div className="hidden lg:block w-px h-6 bg-slate-200 mx-1" />

              <button
                disabled={isProcessing || stats.pending === 0}
                onClick={handleSyncAll}
                className="group flex items-center gap-2 px-6 py-2 bg-transparent border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow-md"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} className="group-hover:fill-current" strokeWidth={2.5} />}
                Sync All Pending
              </button>
            </div>
          </div>
          
          {/* Main Progress Bar */}
          {isProcessing && (
            <div className="w-full mt-4 animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Engine Progress</span>
                <span className="text-[10px] font-black text-blue-600">{globalProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden shadow-inner">
                <div className="bg-blue-600 h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(37,99,235,0.8)]" style={{ width: `${globalProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* ===================== FLAT PIPELINE LEDGER ===================== */}
        <div className="w-full px-6 lg:px-12 mt-6">
          {vouchers.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 border-t border-b border-slate-200">
              <CheckCircle2 size={36} className="mb-4 text-emerald-400" />
              <span className="text-sm font-bold uppercase tracking-widest">No Vouchers Generated</span>
              <span className="text-sm mt-1">Check your selections in the previous steps.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-14">
              {Object.entries(groupedVouchers).map(([bank, bankVouchers]) => {
                
                const pendingCount = bankVouchers.filter(v => v.status === 'PENDING').length;

                return (
                  <div key={bank} className="w-full">
                    
                    {/* --- BANK GROUP HEADER (Outlined Action) --- */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b-2 border-slate-800">
                      <div className="flex items-end gap-3">
                        <Landmark size={24} className="text-slate-800 mb-0.5" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">
                            Bank Origin
                          </span>
                          <span className="text-[22px] font-black text-slate-900 leading-none tracking-tight">
                            {bank}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 shrink-0">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {bankVouchers.length} Items ({pendingCount} Pending)
                        </span>
                        
                        <button
                          disabled={isProcessing || pendingCount === 0}
                          onClick={() => handleSyncBank(bank)}
                          className="group flex items-center gap-2 px-4 py-2 bg-transparent border-2 border-slate-400 text-slate-600 hover:border-slate-900 hover:text-slate-900 hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm active:scale-95"
                        >
                          <Play size={12} strokeWidth={3} className="group-hover:fill-current transition-all" /> 
                          Sync Bank Group
                        </button>

                      </div>
                    </div>

                    {/* --- VOUCHER SUB-GROUPS --- */}
                    <div className="flex flex-col w-full mt-4">
                      {['SALES', 'RECEIPT', 'PAYMENT'].map(vType => {
                        const typeVouchers = bankVouchers.filter(v => v.vType === vType);
                        if (typeVouchers.length === 0) return null;

                        const theme = getThemeConfig(vType);

                        return (
                          <div key={vType} className="mb-8 last:mb-0">
                            
                            <div className={`flex items-center gap-2 mb-3 mt-2 ${theme.text}`}>
                              {theme.icon}
                              <span className="text-[12px] font-black uppercase tracking-widest">
                                {theme.label}s ({typeVouchers.length})
                              </span>
                            </div>

                            <div className="flex flex-col border-t border-slate-200">
                              {typeVouchers.map((v) => {
                                const isSuccess = v.status === 'SUCCESS';
                                const isFailed = v.status === 'FAILED';
                                const isRunning = v.status === 'PROCESSING';

                                // UI MATH FOR SALES ROW
                                let displayGross = Math.abs(v.rawTx.amount || 0);
                                let displayBase = displayGross;
                                let dCgst = 0, dSgst = 0, dIgst = 0;
                                let resolvedLedger = v.rawTx.suggestedLedger || v.rawTx.ledgerName;

                                if (v.vType === 'SALES') {
                                  resolvedLedger = v.rawTx.individualSalesLedger || salesIncomeLedger || "SUSPENSE SALES LEDGER";
                                  displayBase = (v.rawTx.baseAmount !== undefined && v.rawTx.baseAmount !== null && v.rawTx.baseAmount !== "") 
                                    ? Number(v.rawTx.baseAmount) 
                                    : Math.abs(v.rawTx.amount || 0);
                                  
                                  if (isGstCompliant) {
                                    const applyCG = isTrue(v.rawTx.applyCGST);
                                    const applySG = isTrue(v.rawTx.applySGST);
                                    const applyIG = isTrue(v.rawTx.applyIGST);

                                    dCgst = (v.rawTx.cgst !== undefined && v.rawTx.cgst !== null && v.rawTx.cgst !== "") ? Number(v.rawTx.cgst) : (applyCG ? displayBase * 0.09 : 0);
                                    dSgst = (v.rawTx.sgst !== undefined && v.rawTx.sgst !== null && v.rawTx.sgst !== "") ? Number(v.rawTx.sgst) : (applySG ? displayBase * 0.09 : 0);
                                    dIgst = (v.rawTx.igst !== undefined && v.rawTx.igst !== null && v.rawTx.igst !== "") ? Number(v.rawTx.igst) : (applyIG ? displayBase * 0.18 : 0);
                                  }
                                  displayGross = displayBase + dCgst + dSgst + dIgst;
                                }

                                return (
                                  <div key={v.id} className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 pl-6 pr-4 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors bg-white">
                                    
                                    {/* Minimalist Left Accent Border */}
                                    <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${theme.border} bg-slate-300 opacity-50 group-hover:opacity-100 transition-opacity`} 
                                         style={{ backgroundColor: v.vType === 'SALES' ? '#3b82f6' : v.vType === 'RECEIPT' ? '#10b981' : '#f43f5e' }}/>
                                    
                                    {/* Left Info: Type & Ledger */}
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${theme.text}`}>
                                          {theme.label}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400">
                                          • {v.rawTx.date ? new Date(v.rawTx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'No Date'}
                                        </span>
                                      </div>
                                      <span className="text-[15px] font-bold text-slate-900 leading-snug truncate pr-4">
                                        {resolvedLedger}
                                      </span>

                                      {/* Inline Clean GST Math */}
                                      {v.vType === 'SALES' && (
                                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500 tracking-wide mt-1">
                                          <span>Base: <span className="text-slate-800">{formatINR(displayBase).replace('₹', '')}</span></span>
                                          {dCgst > 0 && <span className="text-slate-300">•</span>}
                                          {dCgst > 0 && <span>CG: <span className="text-slate-800">{formatINR(dCgst).replace('₹', '')}</span></span>}
                                          {dSgst > 0 && <span className="text-slate-300">•</span>}
                                          {dSgst > 0 && <span>SG: <span className="text-slate-800">{formatINR(dSgst).replace('₹', '')}</span></span>}
                                          {dIgst > 0 && <span className="text-slate-300">•</span>}
                                          {dIgst > 0 && <span className="text-blue-600">IGST: <span className="font-bold">{formatINR(dIgst).replace('₹', '')}</span></span>}
                                        </div>
                                      )}
                                    </div>

                                    {/* Middle Info: Amount */}
                                    <div className="flex items-center sm:justify-end w-32 shrink-0">
                                      <span className={`font-mono text-[16px] font-black ${theme.text}`}>
                                        {formatINR(v.vType === 'SALES' ? displayGross : v.rawTx.amount)}
                                      </span>
                                    </div>

                                    {/* Right Info: Status & Intuitive Push Action */}
                                    <div className="flex items-center justify-end gap-4 w-48 shrink-0">
                                      
                                      <div className="flex items-center">
                                        {isRunning && (
                                          <span className="flex items-center gap-1.5 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                                            <Loader2 size={14} className="animate-spin" /> Pushing
                                          </span>
                                        )}
                                        {isSuccess && (
                                          <div className="flex flex-col items-end">
                                            <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                              <CheckCircle2 size={16} strokeWidth={2.5}/> Synced
                                            </span>
                                            {v.voucherNo && <span className="text-[9px] text-slate-400 font-mono mt-0.5 font-bold tracking-widest">{v.voucherNo}</span>}
                                          </div>
                                        )}
                                        {isFailed && (
                                          <div className="flex flex-col items-end group/err relative cursor-help">
                                            <span className="flex items-center gap-1.5 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                                              <AlertCircle size={16} strokeWidth={2.5}/> Failed
                                            </span>
                                            <div className="absolute right-0 bottom-full mb-2 w-56 bg-slate-900 text-white text-[11px] p-3 rounded shadow-xl opacity-0 group-hover/err:opacity-100 transition-opacity pointer-events-none z-50">
                                              {v.errorMsg}
                                            </div>
                                          </div>
                                        )}
                                        {v.status === 'PENDING' && (
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-300 pb-0.5">
                                            [ READY ]
                                          </span>
                                        )}
                                      </div>

                                      {/* OUTLINED Individual Sync Button */}
                                      {(v.status === 'PENDING' || v.status === 'FAILED') && !isProcessing && (
                                        <button
                                          onClick={() => handleSyncSingle(v.id)}
                                          className="group/btn flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-transparent border-2 border-blue-400 hover:border-blue-600 hover:bg-blue-50 text-blue-600 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                          title="Push to Tally"
                                        >
                                          <span className="text-[9px] font-black uppercase tracking-widest mt-0.5">Push</span>
                                          <Send size={12} strokeWidth={2.5} className="group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                        </button>
                                      )}
                                      
                                      {/* Visual spacing lock */}
                                      {(isSuccess || isRunning || isProcessing) && v.status !== 'PROCESSING' && v.status !== 'PENDING' && v.status !== 'FAILED' && (
                                        <div className="w-[66px]" />
                                      )}
                                    </div>

                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* FINAL OUTLINED CLOSE BUTTON */}
          {vouchers.length > 0 && stats.pending === 0 && !isProcessing && (
            <div className="mt-12 flex justify-center pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={() => {
                  if (onCompleteRef.current) onCompleteRef.current();
                }}
                className="px-14 py-4 cursor-pointer bg-transparent border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-sm hover:shadow-lg active:scale-95 flex items-center gap-3"
              >
                <CheckCircle2 size={18} /> Finalize & Close Wizard
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default ResultStep;