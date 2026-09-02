import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  CheckCircle2, AlertCircle, Loader2, Play, ShieldCheck, 
  Landmark, Banknote, Zap, Send, ArrowRight, Building2, 
  Wallet, ArrowRightLeft, Coins, Hash, MapPin, Layers, FileText,
  AlertTriangle, RefreshCw, CheckCheck, Check, Undo2
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

    // 2. Process grouping rules strictly by Party Ledger
    Object.entries(bankMap).forEach(([bank, txs]) => {
      const groupsMap = new Map();
      let manualCounter = 0;

      txs.forEach(tx => {
        const partyLedger = tx?.suggestedLedger || tx?.partyLedger || tx?.ledgerName || tx?.partyName;
        const isManual = isTrue(tx?.isMarkedForManualEntry) || !partyLedger;
        let groupKey = isManual ? `MANUAL_${manualCounter++}` : `${tx.type}_${partyLedger}`;

        if (!groupsMap.has(groupKey)) {
          groupsMap.set(groupKey, {
            id: groupKey,
            bank,
            partyLedger: isManual ? 'Manual Exception' : partyLedger,
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
            // FIX: Robust resolution of sales income account chosen in SalesStep
            let activeSalesLedger = 
              tx.individualSalesLedger || 
              tx.activeSalesLedger || 
              salesIncomeLedger || 
              (masterLedgers.find(l => l.name?.toLowerCase().includes("mf com"))?.name) ||
              "MF COMMISSION INCOME";

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
              id: vId, 
              bank, 
              groupId: group.id, 
              vType: 'SALES', 
              grossTotal: baseAmount + cgst + sgst + igst, 
              baseAmount, 
              cgst, 
              sgst, 
              igst, 
              activeSalesLedger, 
              rawTx: tx, 
              status: 'PENDING' 
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
  }, [safeTransactions, isGstCompliant, salesIncomeLedger, masterLedgers]); 

  // =========================================================================
  // METRICS & COUNTERS
  // =========================================================================
  const totals = useMemo(() => {
    let sales = 0;
    let receipts = 0;
    let payments = 0;
    let manual = 0;

    vouchers.forEach(v => {
      if (v.vType === 'SALES') sales++;
      if (v.vType === 'RECEIPT') receipts++;
      if (v.vType === 'PAYMENT') payments++;
      if (v.vType === 'MANUAL') manual++;
    });

    return {
      sales,
      receipts,
      payments,
      manual,
      totalActionable: sales + receipts + payments
    };
  }, [vouchers]);

  const stats = useMemo(() => {
    const s = { 
      salesPending: 0,
      salesSuccess: 0,
      receiptsPending: 0,
      receiptsSuccess: 0,
      paymentsPending: 0,
      paymentsSuccess: 0,
      pending: 0, 
      success: 0, 
      failed: 0 
    };

    vouchers.forEach(v => {
      if (v.vType === 'MANUAL') return;
      if (v.status === 'PENDING') {
        s.pending++;
        if (v.vType === 'SALES') s.salesPending++;
        if (v.vType === 'RECEIPT') s.receiptsPending++;
        if (v.vType === 'PAYMENT') s.paymentsPending++;
      }
      if (v.status === 'SUCCESS') {
        s.success++;
        if (v.vType === 'SALES') s.salesSuccess++;
        if (v.vType === 'RECEIPT') s.receiptsSuccess++;
        if (v.vType === 'PAYMENT') s.paymentsSuccess++;
      }
      if (v.status === 'FAILED') s.failed++;
    });

    return s;
  }, [vouchers]);

  const failedVouchers = useMemo(() => {
    return vouchers.filter(v => v.status === 'FAILED');
  }, [vouchers]);

  const unpushedCount = useMemo(() => {
    return vouchers.filter(v => v.vType !== 'MANUAL' && v.status !== 'SUCCESS').length;
  }, [vouchers]);

  // =========================================================================
  // AUTO-UNLOCK WIZARD PARENT WHEN SYNC COMPLETES
  // =========================================================================
  useEffect(() => {
    if (vouchers.length > 0 && stats.pending === 0 && failedVouchers.length === 0 && !isProcessing) {
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }
  }, [stats.pending, failedVouchers.length, vouchers.length, isProcessing]);

  // =========================================================================
  // MARK / UNMARK HANDLERS
  // =========================================================================
  const handleMarkSingleAsPushed = (id) => {
    setVouchers(prev => prev.map(v => v.id === id ? { 
      ...v, 
      status: 'SUCCESS', 
      errorMsg: null, 
      voucherNo: v.voucherNo || 'Manual' 
    } : v));
    toast.success("Voucher marked as pushed");
  };

  const handleUnmarkSingleAsPushed = (id) => {
    setVouchers(prev => prev.map(v => v.id === id ? { 
      ...v, 
      status: 'PENDING', 
      errorMsg: null, 
      voucherNo: null 
    } : v));
    toast.info("Voucher marked as pending");
  };

  const handleMarkAllAsPushed = () => {
    setVouchers(prev => prev.map(v => {
      if (v.vType === 'MANUAL') return v;
      if (v.status !== 'SUCCESS') {
        return { ...v, status: 'SUCCESS', errorMsg: null, voucherNo: v.voucherNo || 'Manual' };
      }
      return v;
    }));
    toast.success("All non-manual vouchers marked as pushed");
  };

  const handleUnmarkAllPushed = () => {
    setVouchers(prev => prev.map(v => {
      if (v.vType === 'MANUAL') return v;
      if (v.status === 'SUCCESS') {
        return { ...v, status: 'PENDING', errorMsg: null, voucherNo: null };
      }
      return v;
    }));
    toast.info("All synced vouchers reset to pending");
  };

  const handleMarkCategoryAsPushed = (types) => {
    const typeArray = Array.isArray(types) ? types : [types];
    let count = 0;
    setVouchers(prev => prev.map(v => {
      if (typeArray.includes(v.vType) && v.status !== 'SUCCESS') {
        count++;
        return { ...v, status: 'SUCCESS', errorMsg: null, voucherNo: v.voucherNo || 'Manual' };
      }
      return v;
    }));
    if (count > 0) toast.success(`Marked ${count} voucher(s) as pushed`);
  };

  const handleUnmarkCategoryAsPushed = (types) => {
    const typeArray = Array.isArray(types) ? types : [types];
    let count = 0;
    setVouchers(prev => prev.map(v => {
      if (typeArray.includes(v.vType) && v.status === 'SUCCESS') {
        count++;
        return { ...v, status: 'PENDING', errorMsg: null, voucherNo: null };
      }
      return v;
    }));
    if (count > 0) toast.info(`Reset ${count} voucher(s) to pending`);
  };

  const handleMarkFailedAsPushed = () => {
    setVouchers(prev => prev.map(v => {
      if (v.status === 'FAILED') {
        return { ...v, status: 'SUCCESS', errorMsg: null, voucherNo: v.voucherNo || 'Manual' };
      }
      return v;
    }));
    toast.success("Failed vouchers marked as pushed");
  };

  const handleMarkGroupAsPushed = (groupId) => {
    let count = 0;
    setVouchers(prev => prev.map(v => {
      if (v.groupId === groupId && v.vType !== 'MANUAL' && v.status !== 'SUCCESS') {
        count++;
        return { ...v, status: 'SUCCESS', errorMsg: null, voucherNo: v.voucherNo || 'Manual' };
      }
      return v;
    }));
    if (count > 0) toast.success(`Marked ${count} voucher(s) as pushed`);
  };

  const handleUnmarkGroupAsPushed = (groupId) => {
    let count = 0;
    setVouchers(prev => prev.map(v => {
      if (v.groupId === groupId && v.vType !== 'MANUAL' && v.status === 'SUCCESS') {
        count++;
        return { ...v, status: 'PENDING', errorMsg: null, voucherNo: null };
      }
      return v;
    }));
    if (count > 0) toast.info(`Reset ${count} voucher(s) to pending`);
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

      // Party Ledger resolution (Debtor / Client / AMC)
      const finalPartyLedger = tx.suggestedLedger || tx.partyLedger || tx.ledgerName || tx.partyName || 'UNKNOWN LEDGER';
      const finalNarration = tx.customNarration || "";

      if (targetVoucher.vType === 'SALES') {
        const normalizedTargetLedger = finalPartyLedger.toUpperCase().trim();
        const ledgerObj = masterLedgers.find(l => (l.name || "").toUpperCase().trim() === normalizedTargetLedger);

        // Resolved Income Account (e.g. MF COMMISSION IGST / LOCAL)
        const finalSalesIncomeLedger = 
          targetVoucher.activeSalesLedger || 
          tx.individualSalesLedger || 
          salesIncomeLedger || 
          "MF COMMISSION INCOME";

        const salesData = {
          company: companyName,
          date: safeDate,
          invoiceNumber: tx.invoiceNumber || `INV-${tx._id.slice(-5).toUpperCase()}`,
          ledgerName: finalPartyLedger,
          incomeLedger: finalSalesIncomeLedger,
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
          ledgerName: finalPartyLedger,
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
      const remainingPending = current.filter(v => v.status === 'PENDING' && v.vType !== 'MANUAL').length;
      const totalFailedNow = current.filter(v => v.status === 'FAILED').length;
      
      if (remainingPending === 0 && totalFailedNow === 0 && idsToProcess.length > 0) {
        toast.success("All pending vouchers pushed successfully!");
      } else if (totalFailedNow > 0) {
        toast.error(`${totalFailedNow} voucher(s) failed to post. See alert banner.`);
      }
      return current;
    });
  };

  const handleSyncType = (type) => processBatch(vouchers.filter(v => v.status === 'PENDING' && v.vType === type).map(v => v.id));
  const handleSyncGroup = (groupId) => processBatch(vouchers.filter(v => v.status === 'PENDING' && v.groupId === groupId && v.vType !== 'MANUAL').map(v => v.id));
  const handleSyncAll = () => processBatch(vouchers.filter(v => v.status === 'PENDING' && v.vType !== 'MANUAL').map(v => v.id));
  const handleRetryFailed = () => processBatch(vouchers.filter(v => v.status === 'FAILED').map(v => v.id));
  const handleSyncSingle = (id) => processBatch([id]);

  const getGroupTheme = (type) => {
    if (type === 'RECEIPT') return { text: 'text-emerald-700 dark:text-emerald-400', border: 'border-b-2 border-emerald-500', badge: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20', icon: <ArrowRightLeft size={16} strokeWidth={2.5} /> };
    if (type === 'PAYMENT') return { text: 'text-rose-700 dark:text-rose-400', border: 'border-b-2 border-rose-500', badge: 'text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/20', icon: <Coins size={16} strokeWidth={2.5} /> };
    return { text: 'text-amber-700 dark:text-amber-400', border: 'border-b-2 border-amber-500', badge: 'text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20', icon: <AlertCircle size={16} strokeWidth={2.5} /> };
  };

  return (
    <div className="h-full w-full bg-slate-50 dark:bg-[#07090E] overflow-y-auto font-sans pb-48 select-none">
      
      {/* 1. EXECUTIVE HEADER */}
      <div className="bg-[#0B1120] w-full px-6 lg:px-12 pt-7 pb-10 text-white relative border-b border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-md bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center shrink-0">
              <Building2 size={22} strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={12} /> Tally Link Active
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  Execution Workspace
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-tight">
                {companyName || "Target Company"}
              </h2>
            </div>
          </div>

          <div className="text-left md:text-right">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
              Target Batch Total
            </span>
            <span className="text-xl font-mono font-black text-white">
              {totals.totalActionable} Vouchers
            </span>
          </div>
        </div>
      </div>

      {/* 2. PROMINENT FAILED VOUCHERS BANNER */}
      {failedVouchers.length > 0 && (
        <div className="w-full px-6 lg:px-12 mt-4">
          <div className="bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-500/50 rounded-md p-4 sm:p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
                <AlertTriangle size={20} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                    Transmission Alert
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="px-2 py-0.2 rounded-sm bg-rose-200/60 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 text-[10px] font-mono font-black">
                    {failedVouchers.length} Failed
                  </span>
                </div>
                <h3 className="text-sm font-black text-rose-950 dark:text-rose-100 mt-0.5">
                  Some vouchers could not be created in Tally
                </h3>
                <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-0.5 max-w-2xl">
                  {failedVouchers[0]?.errorMsg || "Tally rejected the entry."} Verify ledger master entries in Tally.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end md:self-center">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleMarkFailedAsPushed}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white hover:bg-transparent hover:text-slate-800 dark:hover:text-white border border-transparent hover:border-slate-800 dark:hover:border-white rounded-md text-[11px] font-mono font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                <CheckCheck size={13} strokeWidth={2.5} />
                <span>Mark Failed as Pushed</span>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleRetryFailed}
                className="cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 text-white hover:bg-transparent hover:text-rose-600 dark:hover:text-rose-400 border border-transparent hover:border-rose-600 dark:hover:border-rose-500 rounded-md text-[11px] font-mono font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} strokeWidth={2.5} />}
                <span>Retry Failed ({failedVouchers.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. COMMAND DECK WITH CATEGORY MARK/UNMARK CONTROLS */}
      <div className="w-full px-6 lg:px-12 -mt-5 relative z-10 mb-6">
        <div className="bg-white dark:bg-[#0E131F] rounded-md border-2 border-slate-200 dark:border-white/10 p-4 shadow-sm flex flex-col gap-4">
          
          {/* Top Row: Permanent Target Counts + Category Mark/Unmark Controls + Sync Health */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-white/5">
            
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Category Batches:
              </span>

              {/* Sales Category Pill with Mark/Unmark */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
                  <Layers size={13} />
                  <span>Sales:</span>
                  <strong className="font-black text-sm">{totals.sales}</strong>
                  <span className="text-[10px] opacity-70 font-normal">({stats.salesPending} P | {stats.salesSuccess} S)</span>
                </span>
                <div className="w-px h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                <button
                  type="button"
                  disabled={isProcessing || stats.salesPending === 0}
                  onClick={() => handleMarkCategoryAsPushed('SALES')}
                  className="cursor-pointer text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-tight disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Mark all pending sales vouchers as pushed"
                >
                  Mark
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  disabled={isProcessing || stats.salesSuccess === 0}
                  onClick={() => handleUnmarkCategoryAsPushed('SALES')}
                  className="cursor-pointer text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 uppercase tracking-tight disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Reset all pushed sales vouchers to pending"
                >
                  Unmark
                </button>
              </div>

              {/* Banking Category Pill with Mark/Unmark */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2 font-bold">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <ArrowRightLeft size={13} />
                    <span>Rec:</span>
                    <strong className="font-black text-sm">{totals.receipts}</strong>
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                    <Coins size={13} />
                    <span>Pay:</span>
                    <strong className="font-black text-sm">{totals.payments}</strong>
                  </span>
                </div>
                <div className="w-px h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                <button
                  type="button"
                  disabled={isProcessing || (stats.receiptsPending === 0 && stats.paymentsPending === 0)}
                  onClick={() => handleMarkCategoryAsPushed(['RECEIPT', 'PAYMENT'])}
                  className="cursor-pointer text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 uppercase tracking-tight disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Mark all pending banking vouchers as pushed"
                >
                  Mark
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  disabled={isProcessing || (stats.receiptsSuccess === 0 && stats.paymentsSuccess === 0)}
                  onClick={() => handleUnmarkCategoryAsPushed(['RECEIPT', 'PAYMENT'])}
                  className="cursor-pointer text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 uppercase tracking-tight disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Reset all pushed banking vouchers to pending"
                >
                  Unmark
                </button>
              </div>
            </div>

            {/* Live Queue Status */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-sm text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                {stats.success} Synced
              </span>
              <span className="px-2.5 py-1 rounded-sm text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">
                {stats.pending} Pending
              </span>
              {stats.failed > 0 && (
                <span className="px-2.5 py-1 rounded-sm text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20">
                  {stats.failed} Failed
                </span>
              )}
            </div>

          </div>

          {/* Bottom Row: Actions (Solid Default -> Outlined on Hover) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            {/* Left: Push Actions to Tally */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mr-1">
                Push to Tally:
              </span>
              
              <button 
                type="button"
                disabled={isProcessing || stats.salesPending === 0} 
                onClick={() => handleSyncType('SALES')}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white hover:bg-transparent hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-blue-600 dark:hover:border-blue-400 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                <Layers size={13} /> Push Sales ({stats.salesPending})
              </button>
              
              <button 
                type="button"
                disabled={isProcessing || (stats.receiptsPending === 0 && stats.paymentsPending === 0)} 
                onClick={() => { handleSyncType('RECEIPT'); setTimeout(() => handleSyncType('PAYMENT'), 500); }}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-white hover:bg-transparent hover:text-slate-700 dark:hover:text-slate-200 border border-transparent hover:border-slate-700 dark:hover:border-slate-400 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                <Banknote size={13} /> Push Banking ({stats.receiptsPending + stats.paymentsPending})
              </button>

              <button 
                type="button"
                disabled={isProcessing || stats.pending === 0} 
                onClick={handleSyncAll}
                className="cursor-pointer flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white hover:bg-transparent hover:text-emerald-600 dark:hover:text-emerald-400 border-2 border-transparent hover:border-emerald-600 dark:hover:border-emerald-400 rounded-md text-[11px] font-mono font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                Push All Pending ({stats.pending})
              </button>
            </div>

            {/* Right: Manual Verification Overrides */}
            <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 border-slate-100 dark:border-white/5 pt-2 lg:pt-0">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mr-1">
                Manual Overrides:
              </span>

              {stats.success > 0 && (
                <button 
                  type="button"
                  disabled={isProcessing} 
                  onClick={handleUnmarkAllPushed}
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white hover:bg-transparent hover:text-amber-600 dark:hover:text-amber-400 border border-transparent hover:border-amber-600 dark:hover:border-amber-400 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                  title="Reset all pushed vouchers back to pending state"
                >
                  <Undo2 size={13} strokeWidth={2.5} /> Unmark All ({stats.success})
                </button>
              )}

              <button 
                type="button"
                disabled={isProcessing || unpushedCount === 0} 
                onClick={handleMarkAllAsPushed}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white hover:bg-transparent hover:text-slate-800 dark:hover:text-white border border-transparent hover:border-slate-800 dark:hover:border-slate-400 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                title="Mark all pending and failed vouchers as manually created in Tally"
              >
                <CheckCheck size={13} strokeWidth={2.5} /> Mark All Pushed ({unpushedCount})
              </button>
            </div>

          </div>

        </div>
        
        {/* Progress Bar */}
        {isProcessing && (
          <div className="w-full mt-2 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-300 ease-out" style={{ width: `${globalProgress}%` }} />
          </div>
        )}
      </div>

      {/* 4. MAIN WORKSPACE (BANK TABS & DUAL-PANE PIPELINE) */}
      <div className="w-full px-6 lg:px-12">
        {/* Bank Tabs */}
        {Object.keys(uiGroups).length > 0 && (
          <div className="flex border-b border-slate-300 dark:border-white/10 mb-6 overflow-x-auto no-scrollbar gap-2">
            {Object.keys(uiGroups).map(bank => {
              const isActive = activeBankTab === bank;
              const bankPending = uiGroups[bank].reduce((acc, g) => acc + g.vouchersList.filter(vId => vouchers.find(x => x.id === vId)?.status === 'PENDING' && vouchers.find(x => x.id === vId)?.vType !== 'MANUAL').length, 0);
              const bankFailed = uiGroups[bank].reduce((acc, g) => acc + g.vouchersList.filter(vId => vouchers.find(x => x.id === vId)?.status === 'FAILED').length, 0);

              return (
                <button 
                  key={bank} 
                  type="button"
                  onClick={() => setActiveBankTab(bank)}
                  className={`cursor-pointer pb-2.5 px-3 flex items-center gap-2 border-b-2 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                    isActive ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Landmark size={13} className={isActive ? 'text-emerald-500' : 'text-slate-400'} />
                  <span>{bank}</span>
                  {bankPending > 0 && (
                    <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                      {bankPending}
                    </span>
                  )}
                  {bankFailed > 0 && (
                    <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      {bankFailed} err
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* The Pipeline List */}
        {activeBankTab && uiGroups[activeBankTab] && (
          <div className="flex flex-col gap-8">
            {uiGroups[activeBankTab].map((group, gIdx) => {
              const theme = getGroupTheme(group.type);
              const groupVouchers = group.vouchersList.map(vId => vouchers.find(v => v.id === vId)).filter(Boolean);
              const groupPending = groupVouchers.filter(v => v.status === 'PENDING' && v.vType !== 'MANUAL').length;
              const groupSuccess = groupVouchers.filter(v => v.status === 'SUCCESS' && v.vType !== 'MANUAL').length;

              return (
                <div key={group.id || gIdx} className="w-full">
                  
                  {/* Flat Clean Group Header */}
                  <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 mb-3 ${theme.border}`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`px-2 py-0.5 rounded-sm border text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${theme.badge}`}>
                        {theme.icon}
                        {group.type}
                      </span>
                      <h4 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">
                        {group.partyLedger}
                      </h4>
                      <span className="text-slate-400 text-xs font-mono font-bold">
                        ({group.transactions.length})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-base font-black mr-2 ${theme.text}`}>
                        {group.type === 'RECEIPT' ? '+' : group.type === 'PAYMENT' ? '-' : ''}{formatINR(group.totalBankAmount)}
                      </span>
                      
                      {!group.isManual && (
                        <div className="flex items-center gap-1.5">
                          {groupPending > 0 && (
                            <button 
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleMarkGroupAsPushed(group.id)}
                              className="cursor-pointer flex items-center gap-1 px-2.5 py-1 bg-slate-700 text-white hover:bg-transparent hover:text-slate-800 dark:hover:text-white border border-transparent hover:border-slate-700 dark:hover:border-slate-300 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                            >
                              <Check size={11} strokeWidth={2.5} /> Mark Group
                            </button>
                          )}

                          {groupSuccess > 0 && (
                            <button 
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleUnmarkGroupAsPushed(group.id)}
                              className="cursor-pointer flex items-center gap-1 px-2.5 py-1 bg-amber-600 text-white hover:bg-transparent hover:text-amber-600 dark:hover:text-amber-400 border border-transparent hover:border-amber-600 dark:hover:border-amber-400 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                            >
                              <Undo2 size={11} strokeWidth={2.5} /> Unmark Group
                            </button>
                          )}

                          <button 
                            type="button"
                            disabled={isProcessing || groupPending === 0} 
                            onClick={() => handleSyncGroup(group.id)}
                            className="cursor-pointer flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white hover:bg-transparent hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-900 dark:hover:border-white rounded-md text-[10px] font-mono font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                          >
                            <Play size={11} className="fill-current" /> Sync ({groupPending})
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dual Pane Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_36px_1fr] w-full gap-4 items-start">
                    
                    {/* LEFT: Raw Transactions */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                        <Banknote size={12} /> Source Statement Lines
                      </div>
                      {group.transactions.map((tx, tIdx) => (
                        <div key={tIdx} className="p-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-sm flex justify-between items-start gap-3">
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                              {tx.date ? new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No Date'}
                            </span>
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 wrap-break-word leading-tight">
                              {tx.narration}
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white shrink-0">
                            {formatINR(tx.amount)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* MIDDLE: Visual Connector */}
                    <div className="hidden lg:flex flex-col items-center justify-center pt-8 text-slate-300 dark:text-slate-700">
                      <ArrowRight size={16} strokeWidth={2} />
                    </div>

                    {/* RIGHT: Resulting Tally Vouchers */}
                    <div className="space-y-2 border-t lg:border-t-0 border-slate-200 dark:border-white/10 pt-3 lg:pt-0">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                        <FileText size={12} /> Target Tally Vouchers
                      </div>
                      
                      {groupVouchers.map((v) => {
                        // SALES INVOICE CARD
                        if (v.vType === 'SALES') {
                          const resolvedPartyLedger = v.rawTx.suggestedLedger || v.rawTx.partyLedger || v.rawTx.ledgerName || v.rawTx.partyName || group.partyLedger;
                          const ledgerObj = masterLedgers.find(l => (l.name || "").toUpperCase().trim() === resolvedPartyLedger.toUpperCase().trim());
                          const isFailed = v.status === 'FAILED';
                          return (
                            <div key={v.id} className={`bg-white dark:bg-[#0E131F] border ${isFailed ? 'border-rose-400 dark:border-rose-500/50 border-l-4 border-l-rose-500' : 'border-slate-200 dark:border-white/10 border-l-3 border-l-blue-500'} rounded-sm overflow-hidden shadow-xs`}>
                              <div className="p-3 border-b border-slate-100 dark:border-white/5 flex justify-between items-start gap-3">
                                <div className="flex flex-col gap-0.5 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                      Sales Invoice
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400">
                                      {v.rawTx.invoiceNumber || `INV-${v.rawTx._id.slice(-5).toUpperCase()}`}
                                    </span>
                                  </div>
                                  <span className="text-xs font-black uppercase text-slate-900 dark:text-white truncate">
                                    {v.activeSalesLedger}
                                  </span>
                                </div>
                                <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 shrink-0">
                                  {formatINR(v.grossTotal)}
                                </span>
                              </div>

                              <div className="p-3 flex flex-col gap-2.5 text-xs bg-slate-50/50 dark:bg-white/1">
                                <div className="grid grid-cols-[24px_1fr] gap-x-2 gap-y-0.5 text-[11px]">
                                  <span className="font-mono text-slate-400 font-bold">Dr</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                    {resolvedPartyLedger} <span className="text-slate-400 font-normal">({formatINR(v.grossTotal)})</span>
                                  </span>
                                  
                                  <span className="font-mono text-slate-400 font-bold">Cr</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                    {v.activeSalesLedger} <span className="text-slate-400 font-normal">({formatINR(v.baseAmount)})</span>
                                  </span>
                                </div>

                                {ledgerObj && (
                                  <div className="flex flex-wrap gap-x-3 gap-y-1 p-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-sm text-[10px] font-mono text-slate-600 dark:text-slate-300">
                                    {ledgerObj.gstin && (
                                      <div className="flex items-center gap-1">
                                        <Hash size={11} className="text-slate-400" />
                                        <span>{ledgerObj.gstin}</span>
                                      </div>
                                    )}
                                    {ledgerObj.stateName && (
                                      <div className="flex items-center gap-1">
                                        <MapPin size={11} className="text-slate-400" />
                                        <span>{ledgerObj.stateName}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-white/5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                  <span>Base: <strong className="text-slate-900 dark:text-white">{formatINR(v.baseAmount).replace('₹', '')}</strong></span>
                                  {v.cgst > 0 && <span>• CGST: <strong className="text-slate-900 dark:text-white">{formatINR(v.cgst).replace('₹', '')}</strong></span>}
                                  {v.sgst > 0 && <span>• SGST: <strong className="text-slate-900 dark:text-white">{formatINR(v.sgst).replace('₹', '')}</strong></span>}
                                  {v.igst > 0 && <span>• IGST: <strong className="text-blue-600 dark:text-blue-400">{formatINR(v.igst).replace('₹', '')}</strong></span>}
                                </div>
                              </div>

                              <VoucherStatusFooter 
                                v={v} 
                                onPush={() => handleSyncSingle(v.id)} 
                                onMarkPushed={() => handleMarkSingleAsPushed(v.id)}
                                onUnmarkPushed={() => handleUnmarkSingleAsPushed(v.id)}
                                isProcessing={isProcessing} 
                              />
                            </div>
                          );
                        }

                        // STANDARD RECEIPT / PAYMENT
                        if (v.vType === 'RECEIPT' || v.vType === 'PAYMENT') {
                          const isFailed = v.status === 'FAILED';
                          const config = v.vType === 'RECEIPT' 
                            ? { color: 'emerald', border: isFailed ? 'border-l-rose-500' : 'border-l-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', label: 'Receipt Voucher' } 
                            : { color: 'rose', border: 'border-l-rose-500', text: 'text-rose-600 dark:text-rose-400', label: 'Payment Voucher' };
                          
                          const resolvedPartyLedger = v.rawTx.suggestedLedger || v.rawTx.partyLedger || v.rawTx.ledgerName || v.rawTx.partyName || group.partyLedger;

                          return (
                            <div key={v.id} className={`bg-white dark:bg-[#0E131F] border ${isFailed ? 'border-rose-400 dark:border-rose-500/50' : 'border-slate-200 dark:border-white/10'} border-l-4 ${config.border} rounded-sm overflow-hidden shadow-xs`}>
                              <div className="p-3 flex justify-between items-center gap-3">
                                <div className="flex flex-col min-w-0">
                                  <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${config.text}`}>
                                    {config.label}
                                  </span>
                                  <span className="text-xs font-bold uppercase text-slate-900 dark:text-white truncate">
                                    {resolvedPartyLedger}
                                  </span>
                                </div>
                                <span className={`font-mono text-xs font-black ${config.text} shrink-0`}>
                                  {formatINR(v.amount)}
                                </span>
                              </div>
                              <VoucherStatusFooter 
                                v={v} 
                                onPush={() => handleSyncSingle(v.id)} 
                                onMarkPushed={() => handleMarkSingleAsPushed(v.id)}
                                onUnmarkPushed={() => handleUnmarkSingleAsPushed(v.id)}
                                isProcessing={isProcessing} 
                              />
                            </div>
                          );
                        }

                        // MANUAL ROW
                        if (v.vType === 'MANUAL') {
                          return (
                            <div key={v.id} className="p-3 rounded-sm border border-slate-200 dark:border-white/10 border-l-3 border-l-amber-500 bg-white dark:bg-slate-900/60 flex justify-between items-center gap-3">
                              <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                                  Manual Review Required
                                </span>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 italic truncate">
                                  Missing Ledger Mapping
                                </span>
                              </div>
                              <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400 shrink-0">
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
    </div>
  );
};

// Reusable Sub-Component for Individual Voucher Execution
const VoucherStatusFooter = ({ v, onPush, onMarkPushed, onUnmarkPushed, isProcessing }) => {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/2 px-3 py-2">
      <div className="flex items-center">
        {v.status === 'PROCESSING' && (
          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Loader2 size={11} className="animate-spin" /> Pushing
          </span>
        )}
        {v.status === 'SUCCESS' && (
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
            <CheckCircle2 size={13} strokeWidth={2.5} /> Synced {v.voucherNo && `(${v.voucherNo})`}
          </span>
        )}
        {v.status === 'FAILED' && (
          <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-[10px] font-mono font-bold uppercase tracking-wider cursor-help relative group">
            <AlertCircle size={13} strokeWidth={2.5} /> Failed: {v.errorMsg || "Rejected"}
            <div className="absolute left-0 bottom-full mb-2 w-56 bg-slate-900 text-white text-[11px] p-2.5 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 normal-case font-normal border border-slate-800">
              {v.errorMsg}
            </div>
          </div>
        )}
        {v.status === 'PENDING' && (
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-200/50 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-300 dark:border-white/10">
            Ready
          </span>
        )}
      </div>
      
      {!isProcessing && (
        <div className="flex items-center gap-2">
          {v.status === 'SUCCESS' && (
            <button 
              type="button"
              onClick={onUnmarkPushed}
              className="cursor-pointer flex items-center gap-1 px-2.5 py-1 bg-amber-600 text-white hover:bg-transparent hover:text-amber-600 dark:hover:text-amber-400 border border-transparent hover:border-amber-600 dark:hover:border-amber-400 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all active:scale-95 shadow-2xs"
              title="Reset this voucher back to pending"
            >
              <Undo2 size={11} strokeWidth={2.5} /> Unmark
            </button>
          )}

          {(v.status === 'PENDING' || v.status === 'FAILED') && (
            <button 
              type="button"
              onClick={onMarkPushed}
              className="cursor-pointer flex items-center gap-1 px-2.5 py-1 bg-slate-700 text-white hover:bg-transparent hover:text-slate-700 dark:hover:text-slate-200 border border-transparent hover:border-slate-700 dark:hover:border-slate-400 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all active:scale-95 shadow-2xs"
              title="Mark as pushed manually without pinging Tally bridge"
            >
              <Check size={11} strokeWidth={2.5} /> Mark Pushed
            </button>
          )}

          {(v.status === 'PENDING' || v.status === 'FAILED') && (
            <button 
              type="button"
              onClick={onPush}
              className={`cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all active:scale-95 shadow-2xs border border-transparent ${
                v.status === 'FAILED'
                  ? 'bg-rose-600 text-white hover:bg-transparent hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-600 dark:hover:border-rose-400'
                  : 'bg-emerald-600 text-white hover:bg-transparent hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-600 dark:hover:border-emerald-400'
              }`}
            >
              {v.status === 'FAILED' ? (
                <>Retry <RefreshCw size={11} strokeWidth={2.5} /></>
              ) : (
                <>Push <Send size={11} strokeWidth={2} /></>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultStep;