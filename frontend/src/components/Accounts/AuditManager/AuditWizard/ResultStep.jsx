import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  CheckCircle2, AlertCircle, Loader2, Play, ShieldCheck, 
  Landmark, Banknote, Zap, Send, ArrowRight, Building2, 
  Wallet, ArrowRightLeft, Coins, Hash, MapPin, Layers, FileText
} from 'lucide-react';
import { useApi } from '../../../../hooks/useApi';
import { tallyTemplates } from '../../../../utils/tallyTemplates';
import { toast } from 'sonner';

const ResultStep = ({ transactions, companyName, bankLedgerName, salesIncomeLedger, arns = [], arnId, masterLedgers = [], onComplete }) => {
  const { request } = useApi();
  const safeTransactions = useMemo(() => transactions || [], [transactions]);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // =========================================================================
  // STATE DEFINITIONS
  // =========================================================================
  const [vouchers, setVouchers] = useState([]);
  const [uiGroups, setUiGroups] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [activeBankTab, setActiveBankTab] = useState(null);

  // HELPER: Strict Boolean Parser
  const isTrue = (val) => val === true || String(val).toLowerCase() === 'true';
  const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Math.abs(amount || 0)).replace('₹', '₹ ');

  const activeArnObject = useMemo(() => (arns || []).find(a => String(a._id) === String(arnId) || String(a.arnCode) === String(arnId)), [arns, arnId]);
  const isGstCompliant = !!activeArnObject?.gstCompliant;

  // =========================================================================
  // INITIALIZATION: STRICT PARTY-LEDGER GROUPING ENGINE
  // =========================================================================
  useEffect(() => {
    const generatedVouchers = [];
    const bankMap = {};

    // 1. Isolate by Bank
    safeTransactions.forEach(tx => {
      const bank = tx.bank || tx.bankAccount || tx.bankLedger || 'Default Bank';
      if (!bankMap[bank]) bankMap[bank] = [];
      bankMap[bank].push(tx);
    });

    const finalUiGroups = {};
    let vIdCounter = 0;

    // 2. Process grouping rules strictly by Party Ledger (Like SummaryStep)
    Object.entries(bankMap).forEach(([bank, txs]) => {
      const groupsMap = new Map();
      let manualCounter = 0;

      txs.forEach(tx => {
        const isManual = isTrue(tx?.isMarkedForManualEntry) || !(tx?.suggestedLedger || tx?.ledgerName);
        let groupKey = isManual ? `MANUAL_${manualCounter++}` : `${tx.type}_${tx.suggestedLedger || tx.ledgerName}`;

        if (!groupsMap.has(groupKey)) {
          groupsMap.set(groupKey, {
            id: groupKey,
            bank,
            partyLedger: isManual ? 'Manual Exception' : (tx.suggestedLedger || tx.ledgerName),
            type: isManual ? 'MANUAL' : tx.type,
            transactions: [],
            vouchersList: [], 
            totalBankAmount: 0,
            isManual
          });
        }
        const group = groupsMap.get(groupKey);
        group.transactions.push(tx);
        group.totalBankAmount += Math.abs(tx.amount || 0);
      });

      const groups = Array.from(groupsMap.values());

      // 3. Generate Target Vouchers
      groups.forEach(group => {
        if (group.isManual) {
          const vId = `v_${vIdCounter++}`;
          generatedVouchers.push({ id: vId, bank, groupId: group.id, vType: 'MANUAL', amount: group.totalBankAmount, rawTx: group.transactions[0], status: 'PENDING' });
          group.vouchersList.push(vId);
          return;
        }

        if (group.type === 'RECEIPT') {
          // Sales Vouchers (1 per eligible transaction)
          const salesTxs = group.transactions.filter(t => isTrue(t.isSales) && isTrue(t.isSalesApproved));
          salesTxs.forEach(tx => {
            let activeSalesLedger = tx.individualSalesLedger || salesIncomeLedger || "SUSPENSE SALES LEDGER";
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

            const vId = `v_${vIdCounter++}`;
            generatedVouchers.push({ 
              id: vId, bank, groupId: group.id, vType: 'SALES', 
              grossTotal: baseAmount + cgst + sgst + igst, 
              baseAmount, cgst, sgst, igst, activeSalesLedger, 
              rawTx: tx, status: 'PENDING' 
            });
            group.vouchersList.push(vId);
          });

          // Receipt Vouchers (1 per eligible transaction)
          group.transactions.forEach(tx => {
            const vId = `v_${vIdCounter++}`;
            if (isTrue(tx.isChecked)) {
              generatedVouchers.push({ id: vId, bank, groupId: group.id, vType: 'RECEIPT', amount: Math.abs(tx.amount || 0), rawTx: tx, status: 'PENDING' });
              group.vouchersList.push(vId);
            }
          });

        } else if (group.type === 'PAYMENT') {
          group.transactions.forEach(tx => {
            const vId = `v_${vIdCounter++}`;
            if (isTrue(tx.isChecked)) {
              generatedVouchers.push({ id: vId, bank, groupId: group.id, vType: 'PAYMENT', amount: Math.abs(tx.amount || 0), rawTx: tx, status: 'PENDING' });
              group.vouchersList.push(vId);
            }
          });
        }
      });

      // Sort: Sales-heavy groups first, Manual last
      finalUiGroups[bank] = groups.sort((a, b) => {
        if (a.isManual) return 1;
        if (b.isManual) return -1;
        const aHasSales = a.vouchersList.some(vId => generatedVouchers.find(v => v.id === vId)?.vType === 'SALES');
        const bHasSales = b.vouchersList.some(vId => generatedVouchers.find(v => v.id === vId)?.vType === 'SALES');
        if (aHasSales && !bHasSales) return -1;
        if (!aHasSales && bHasSales) return 1;
        return 0;
      });
    });

    setUiGroups(finalUiGroups);
    setVouchers(generatedVouchers);
    
    const banks = Object.keys(finalUiGroups);
    if (banks.length > 0) setActiveBankTab(banks[0]);
  }, [safeTransactions, isGstCompliant, salesIncomeLedger]); 

  // =========================================================================
  // METRICS & STYLING HELPERS
  // =========================================================================
  const getGroupTheme = (type) => {
    if (type === 'RECEIPT') return { text: 'text-emerald-700', border: 'border-emerald-600', bg: 'bg-emerald-50', icon: <ArrowRightLeft size={18} /> };
    if (type === 'PAYMENT') return { text: 'text-rose-700', border: 'border-rose-600', bg: 'bg-rose-50', icon: <Coins size={18} /> };
    return { text: 'text-amber-700', border: 'border-amber-600', bg: 'bg-amber-50', icon: <AlertCircle size={18} /> };
  };

  const stats = useMemo(() => {
    const s = { sales: 0, receipts: 0, payments: 0, pending: 0, success: 0, failed: 0 };
    vouchers.forEach(v => {
      if (v.vType === 'MANUAL') return;
      if (v.status === 'PENDING') s.pending++;
      if (v.status === 'SUCCESS') s.success++;
      if (v.status === 'FAILED') s.failed++;
      if (v.status === 'PENDING' && v.vType === 'SALES') s.sales++;
      if (v.status === 'PENDING' && v.vType === 'RECEIPT') s.receipts++;
      if (v.status === 'PENDING' && v.vType === 'PAYMENT') s.payments++;
    });
    return s;
  }, [vouchers]);

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
      if (!targetVoucher || targetVoucher.vType === 'MANUAL') continue;

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
      const finalNarration = tx.customNarration || "";

      if (targetVoucher.vType === 'SALES') {
        const normalizedTargetLedger = finalLedger.toUpperCase().trim();
        const ledgerObj = masterLedgers.find(l => (l.name || "").toUpperCase().trim() === normalizedTargetLedger);

        const salesData = {
          company: companyName,
          date: safeDate,
          invoiceNumber: tx.invoiceNumber || `INV-${tx._id.slice(-5).toUpperCase()}`,
          ledgerName: finalLedger,
          incomeLedger: targetVoucher.activeSalesLedger,
          amount: targetVoucher.baseAmount,
          gstType: (targetVoucher.cgst > 0 || targetVoucher.sgst > 0) ? "LOCAL" : (targetVoucher.igst > 0 ? "INTERSTATE" : "NONE"),
          cgstLedger: "CGST", sgstLedger: "SGST", igstLedger: "IGST",
          cgstAmount: targetVoucher.cgst, sgstAmount: targetVoucher.sgst, igstAmount: targetVoucher.igst,
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
          amount: targetVoucher.amount,
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
          errorMsg = responseStr.includes("Line Error") ? "Missing Master Ledger in Tally." : "Rejected by Tally.";
        }
      } catch (err) {
        errorMsg = err.message || "Connection to Tally lost.";
      }

      setVouchers(prev => prev.map(v => v.id === vId ? { ...v, status: isSuccess ? 'SUCCESS' : 'FAILED', voucherNo: isSuccess ? finalVoucherNo : null, errorMsg } : v));
      setGlobalProgress(Math.round(((i + 1) / idsToProcess.length) * 100));
      await sleep(300); 
    }

    setIsProcessing(false);
    setVouchers(current => {
      if (current.filter(v => v.status === 'PENDING' && v.vType !== 'MANUAL').length === 0 && idsToProcess.length > 0) {
        toast.success("All pending vouchers pushed successfully!");
      }
      return current;
    });
  };

  const handleSyncType = (type) => processBatch(vouchers.filter(v => v.status === 'PENDING' && v.vType === type).map(v => v.id));
  const handleSyncGroup = (groupId) => processBatch(vouchers.filter(v => v.status === 'PENDING' && v.groupId === groupId && v.vType !== 'MANUAL').map(v => v.id));
  const handleSyncAll = () => processBatch(vouchers.filter(v => v.status === 'PENDING' && v.vType !== 'MANUAL').map(v => v.id));
  
  // FIX: Added the missing Individual sync handler
  const handleSyncSingle = (id) => processBatch([id]);

  // =========================================================================
  // RENDER UI
  // =========================================================================
  return (
    <div className="h-full w-full bg-slate-50 overflow-y-auto font-sans pb-32">
      
      {/* 1. HERO HEADER */}
      <div className="bg-[#0f172a] w-full px-6 lg:px-12 pt-8 pb-14 text-white relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <Zap size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Link Active
              </span>
              <h2 className="text-2xl font-black leading-none tracking-tight text-white">{companyName}</h2>
            </div>
          </div>
          
          {/* Top Status Indicators */}
          <div className="flex items-center gap-4 bg-white/10 border border-white/20 px-5 py-3 rounded-xl backdrop-blur-md">
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Queue Status</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-200">{stats.success} Synced</span>
                <span className="text-sm font-bold text-amber-400">{stats.pending} Pending</span>
                {stats.failed > 0 && <span className="text-sm font-bold text-rose-400">{stats.failed} Failed</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REAL TACTILE ACTION TOOLBAR */}
      <div className="w-full px-6 lg:px-12 -mt-6 relative z-10 mb-8">
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5"><Layers size={16} className="text-blue-600"/> Sales: {stats.sales}</span>
            <div className="w-px h-5 bg-slate-200" />
            <span className="flex items-center gap-1.5"><ArrowRightLeft size={16} className="text-emerald-600"/> Receipts: {stats.receipts}</span>
            <div className="w-px h-5 bg-slate-200" />
            <span className="flex items-center gap-1.5"><Coins size={16} className="text-rose-600"/> Payments: {stats.payments}</span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button disabled={isProcessing || stats.sales === 0} onClick={() => handleSyncType('SALES')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              <Layers size={14} /> Push Sales
            </button>
            
            <button disabled={isProcessing || (stats.receipts === 0 && stats.payments === 0)} onClick={() => { handleSyncType('RECEIPT'); setTimeout(() => handleSyncType('PAYMENT'), 500); }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              <Banknote size={14} /> Push Banking
            </button>

            <button disabled={isProcessing || stats.pending === 0} onClick={handleSyncAll}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-b-2 border-emerald-800">
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              Push All Pending ({stats.pending})
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        {isProcessing && (
          <div className="w-full mt-4 bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
            <div className="bg-blue-600 h-full transition-all duration-300 ease-out" style={{ width: `${globalProgress}%` }} />
          </div>
        )}
      </div>

      {/* 3. MAIN WORKSPACE (BANK TABS & GRID) */}
      <div className="w-full px-6 lg:px-12">
        {/* Bank Tabs */}
        {Object.keys(uiGroups).length > 0 && (
          <div className="flex border-b-2 border-slate-200 mb-8 overflow-x-auto gap-1">
            {Object.keys(uiGroups).map(bank => {
              const isActive = activeBankTab === bank;
              const bankPending = uiGroups[bank].reduce((acc, g) => acc + g.vouchersList.filter(vId => vouchers.find(x => x.id === vId)?.status === 'PENDING' && vouchers.find(x => x.id === vId)?.vType !== 'MANUAL').length, 0);

              return (
                <button key={bank} onClick={() => setActiveBankTab(bank)}
                  className={`px-6 py-3 flex items-center gap-3 border-b-2 transition-all ${isActive ? 'border-slate-900 bg-white font-black text-slate-900' : 'border-transparent text-slate-500 font-bold hover:bg-slate-100'} text-xs uppercase tracking-widest`}>
                  {bank}
                  {bankPending > 0 && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">{bankPending}</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* The Pipeline List */}
        {activeBankTab && uiGroups[activeBankTab] && (
          <div className="flex flex-col gap-10">
            {uiGroups[activeBankTab].map((group, gIdx) => {
              const theme = getGroupTheme(group.type);
              const groupVouchers = group.vouchersList.map(vId => vouchers.find(v => v.id === vId)).filter(Boolean);
              const groupPending = groupVouchers.filter(v => v.status === 'PENDING' && v.vType !== 'MANUAL').length;

              return (
                <div key={group.id || gIdx} className="w-full">
                  
                  {/* GROUP HEADER */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b-2 border-slate-900">
                    <div className="flex items-end gap-3">
                      <span className={`${theme.text} mb-1`}>{theme.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">
                          {group.type === 'RECEIPT' ? 'Receipt Group' : group.type === 'PAYMENT' ? 'Payment Group' : 'Exception'} ({group.transactions.length} entries)
                        </span>
                        <span className={`text-[20px] font-black leading-none tracking-tight ${theme.text}`}>
                          {group.partyLedger}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`font-mono font-black text-xl leading-none ${theme.text}`}>
                        {group.type === 'RECEIPT' ? '+' : group.type === 'PAYMENT' ? '-' : ''}{formatINR(group.totalBankAmount)}
                      </span>
                      {!group.isManual && (
                        <button disabled={isProcessing || groupPending === 0} onClick={() => handleSyncGroup(group.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer">
                          <Play size={12} className="fill-current"/> Sync Group ({groupPending})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SPLIT GRID (RAW vs VOUCHERS) */}
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_60px_1fr] w-full pt-4">
                    
                    {/* LEFT: Raw Transactions */}
                    <div className="lg:pr-8 flex flex-col gap-3">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                        <Banknote size={14}/> Raw Bank Entries
                      </div>
                      {group.transactions.map((tx, tIdx) => (
                        <div key={tIdx} className="flex justify-between items-start gap-4 p-4 border border-slate-200 bg-white shadow-sm rounded-lg">
                          <div className="flex flex-col gap-1 pr-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {tx.date ? new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No Date'}
                            </span>
                            <span className="text-[13px] font-medium text-slate-800 leading-relaxed">
                              {tx.narration}
                            </span>
                          </div>
                          <span className="font-mono text-sm font-bold text-slate-900 shrink-0">
                            {formatINR(tx.amount)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* MIDDLE: Visual Connector */}
                    <div className="hidden lg:flex flex-col items-center relative">
                      <div className="absolute top-0 bottom-0 left-1/2 w-px border-l-2 border-dashed border-slate-300 -translate-x-1/2" />
                      <div className="relative z-10 mt-12 w-10 h-10 bg-white rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-400">
                        <ArrowRight size={18} strokeWidth={2.5}/>
                      </div>
                    </div>

                    {/* RIGHT: Tally Vouchers */}
                    <div className="lg:pl-8 flex flex-col gap-4 mt-8 lg:mt-0">
                      <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2 flex items-center gap-1.5">
                        <FileText size={14}/> Resulting Tally Vouchers
                      </div>
                      
                      {groupVouchers.map((v) => {
                        // SALES INVOICE (Data Rich Layout)
                        if (v.vType === 'SALES') {
                          const ledgerObj = masterLedgers.find(l => (l.name || "").toUpperCase().trim() === (v.rawTx.suggestedLedger || v.rawTx.ledgerName || "").toUpperCase().trim());
                          return (
                            <div key={v.id} className="relative flex flex-col bg-white border border-blue-200 shadow-md rounded-xl overflow-hidden transition-all hover:border-blue-400">
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500" />
                              
                              <div className="p-4 pl-6 flex justify-between items-start border-b border-slate-100 bg-slate-50/50">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest rounded">Sales Invoice</span>
                                    <span className="text-[10px] font-bold text-slate-500">{v.rawTx.invoiceNumber || `INV-${v.rawTx._id.slice(-5).toUpperCase()}`}</span>
                                  </div>
                                  <span className="text-sm font-black text-slate-900 leading-snug">{v.activeSalesLedger}</span>
                                </div>
                                <span className="font-mono text-lg font-black text-blue-600 shrink-0">{formatINR(v.grossTotal)}</span>
                              </div>

                              <div className="p-4 pl-6 flex flex-col gap-4 text-xs bg-white">
                                {/* Accounting Routing */}
                                <div className="grid grid-cols-[30px_1fr] gap-x-2 gap-y-1">
                                  <span className="font-mono text-slate-400 font-bold text-right">Dr</span>
                                  <span className="font-bold text-slate-800">{v.rawTx.suggestedLedger || v.rawTx.ledgerName} <span className="text-slate-400 font-normal">({formatINR(v.grossTotal)})</span></span>
                                  
                                  <span className="font-mono text-slate-400 font-bold text-right">Cr</span>
                                  <span className="font-bold text-slate-800">{v.activeSalesLedger} <span className="text-slate-400 font-normal">({formatINR(v.baseAmount)})</span></span>
                                </div>

                                {/* Master Data Block */}
                                {ledgerObj && (
                                  <div className="flex flex-wrap gap-x-4 gap-y-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                    {ledgerObj.gstin && <div className="flex items-center gap-1.5"><Hash size={12} className="text-slate-400"/><span className="font-bold text-slate-700">GSTIN:</span><span className="font-mono uppercase">{ledgerObj.gstin}</span></div>}
                                    {ledgerObj.stateName && <div className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-400"/><span className="font-bold text-slate-700">State:</span><span>{ledgerObj.stateName}</span></div>}
                                    {ledgerObj.gstRegistrationType && <div className="flex items-center gap-1.5"><Building2 size={12} className="text-slate-400"/><span className="font-bold text-slate-700">Reg:</span><span>{ledgerObj.gstRegistrationType}</span></div>}
                                  </div>
                                )}

                                {/* Tax Math */}
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-slate-600 bg-blue-50/50 p-2 rounded">
                                  <span>Base: {formatINR(v.baseAmount).replace('₹', '')}</span>
                                  {v.cgst > 0 && <><span className="text-slate-300">|</span><span>CGST: {formatINR(v.cgst).replace('₹', '')}</span></>}
                                  {v.sgst > 0 && <><span className="text-slate-300">|</span><span>SGST: {formatINR(v.sgst).replace('₹', '')}</span></>}
                                  {v.igst > 0 && <><span className="text-slate-300">|</span><span className="text-blue-700">IGST: {formatINR(v.igst).replace('₹', '')}</span></>}
                                </div>
                              </div>

                              <VoucherStatusFooter v={v} onPush={() => handleSyncSingle(v.id)} isProcessing={isProcessing} />
                            </div>
                          );
                        }

                        // STANDARD RECEIPT / PAYMENT
                        if (v.vType === 'RECEIPT' || v.vType === 'PAYMENT') {
                          const config = v.vType === 'RECEIPT' ? { color: 'emerald', label: 'Receipt' } : { color: 'rose', label: 'Payment' };
                          return (
                            <div key={v.id} className={`relative flex flex-col bg-white border border-${config.color}-200 shadow-sm rounded-xl overflow-hidden transition-all hover:border-${config.color}-400`}>
                              <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-${config.color}-500`} />
                              
                              <div className="p-4 pl-6 flex justify-between items-center">
                                <div className="flex flex-col">
                                  <span className={`text-[9px] font-black uppercase tracking-widest text-${config.color}-600 mb-1`}>{config.label} Voucher</span>
                                  <span className="text-[13px] font-bold text-slate-900 leading-snug">{v.rawTx.suggestedLedger || v.rawTx.ledgerName}</span>
                                </div>
                                <span className={`font-mono text-base font-black text-${config.color}-600 shrink-0`}>{formatINR(v.amount)}</span>
                              </div>
                              <VoucherStatusFooter v={v} onPush={() => handleSyncSingle(v.id)} isProcessing={isProcessing} />
                            </div>
                          );
                        }

                        // MANUAL ROW
                        if (v.vType === 'MANUAL') {
                          return (
                            <div key={v.id} className="relative flex justify-between items-center p-4 pl-6 rounded-xl border border-amber-200 bg-amber-50">
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500" />
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Manual Resolution Required</span>
                                <span className="text-xs font-bold text-amber-900 italic leading-snug">Missing Ledger Mapping</span>
                              </div>
                              <span className="font-mono text-sm font-black text-amber-700 shrink-0">{formatINR(v.amount)}</span>
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

        {/* FINAL FINALIZE BUTTON */}
        {vouchers.length > 0 && stats.pending === 0 && !isProcessing && (
          <div className="mt-16 flex justify-center pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => { if (onCompleteRef.current) onCompleteRef.current(); }}
              className="px-10 py-4 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center gap-3">
              <CheckCircle2 size={18} /> Finalize & Close Sync
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable Footer Component for Vouchers
const VoucherStatusFooter = ({ v, onPush, isProcessing }) => {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2.5 pl-6">
      <div className="flex items-center">
        {v.status === 'PROCESSING' && <span className="flex items-center gap-1.5 text-blue-600 text-[10px] font-black uppercase tracking-widest"><Loader2 size={12} className="animate-spin" /> Pushing</span>}
        {v.status === 'SUCCESS' && <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest"><CheckCircle2 size={14} strokeWidth={2.5}/> Synced {v.voucherNo && `(${v.voucherNo})`}</span>}
        {v.status === 'FAILED' && (
          <div className="flex items-center gap-1.5 text-rose-600 text-[10px] font-black uppercase tracking-widest cursor-help relative group">
            <AlertCircle size={14} strokeWidth={2.5}/> Failed
            <div className="absolute left-0 bottom-full mb-2 w-56 bg-slate-900 text-white text-[11px] p-3 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 normal-case tracking-normal font-normal">
              {v.errorMsg}
            </div>
          </div>
        )}
        {v.status === 'PENDING' && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-200/50 px-2 py-0.5 rounded border border-slate-300">Ready</span>}
      </div>
      
      {(v.status === 'PENDING' || v.status === 'FAILED') && !isProcessing && (
        <button onClick={onPush}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-slate-300 hover:border-slate-800 hover:bg-slate-800 hover:text-white text-slate-700 transition-all shadow-sm active:scale-95 cursor-pointer text-[9px] font-black uppercase tracking-widest">
          Push <Send size={12} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};

export default ResultStep;