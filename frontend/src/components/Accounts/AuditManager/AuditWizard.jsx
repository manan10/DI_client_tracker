import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  X, Loader2, Zap, Check, ArrowRight, ArrowLeft, 
  Send, HardDriveUpload, ClipboardCheck, CheckCircle2,
  Building2, Layers, Calendar, Sparkles, ShieldCheck
} from 'lucide-react';
import { useApi } from '../../../hooks/useApi';
import { toast } from 'sonner';

import IdentityStep from './AuditWizard/IdentityStep';
import SyncStep from './AuditWizard/SyncStep';
import AuditStep from './AuditWizard/AuditStep';
import SalesStep from './AuditWizard/SalesStep'; 
import SummaryStep from './AuditWizard/SummaryStep';
import ResultStep from './AuditWizard/ResultStep'; 

const AuditWizard = ({ onClose, refreshData, initialSelection, audits, isTallyOnline }) => {
  const { request } = useApi();
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncComplete, setIsSyncComplete] = useState(false);
  
  const [arns, setArns] = useState([]);
  const [allAccounts, setAccounts] = useState([]);
  const [masterLedgers, setMasterLedgers] = useState([]);

  // HELPER: Strict Boolean Parser to prevent "false" string truthy bugs
  const isTrue = (val) => val === true || String(val).toLowerCase() === 'true';

  const [step, setStep] = useState(() => {
    if (initialSelection?.audit || (initialSelection?.tallyCompanyName && initialSelection?.stagedData)) return 3;
    return 1;
  });

  const [selection, setSelection] = useState(() => {
    const auditObj = initialSelection?.audit;
    if (auditObj) {
      return {
        ...initialSelection,
        account: initialSelection.account || auditObj.accountId,
        month: initialSelection.month || auditObj.month,
        year: initialSelection.year || auditObj.year,
        arnId: initialSelection.arnId || auditObj.arnId?._id || auditObj.arnId,
        tallyCompany: initialSelection.tallyCompany || auditObj.tallyCompanyName,
        tallyLedger: initialSelection.tallyLedger || auditObj.tallyLedgerName,
        salesIncomeLedger: initialSelection.salesIncomeLedger || auditObj.salesIncomeLedger,
        stagedFiles: {}, 
        isFreshStart: false
      };
    }
    return { ...initialSelection, stagedFiles: {} };
  });

  const fetchMasterData = useCallback(async () => {
    try {
      const [arnRes, accRes] = await Promise.all([request('/arns', 'GET'), request('/accounts', 'GET')]);
      const fetchedArns = arnRes?.data || [];
      const fetchedAccounts = accRes?.data || [];
      setArns(fetchedArns);
      setAccounts(fetchedAccounts);

      if (selection?.audit && selection.audit.accountIds?.length > 0) {
        const targetAccountId = selection.audit.accountIds[0]?._id || selection.audit.accountIds[0];
        const targetAccountObj = fetchedAccounts.find(a => a._id === targetAccountId);
        setSelection(prev => ({ ...prev, account: targetAccountObj || prev.account }));
      }
    } catch { 
      toast.error("System connection failed"); 
    } finally { 
      setLoading(false); 
    }
  }, [request, selection?.audit]);

  useEffect(() => { fetchMasterData(); }, [fetchMasterData]);

  useEffect(() => {
    const fetchLedgers = async () => {
      if (!selection.tallyCompany) return;
      try {
        const res = await request(`/ledgers?company=${encodeURIComponent(selection.tallyCompany)}`, 'GET');
        if (res?.data) setMasterLedgers(res.data);
      } catch (err) {
        console.error("Ledger Fetch Error:", err);
      }
    };
    fetchLedgers();
  }, [selection.tallyCompany, request]);

  // AUTO-RESUME ENGINE: Fetches transactions and calculates exact step
  useEffect(() => {
    const activeAuditId = selection.audit?._id;
    if (step >= 3 && activeAuditId && !selection.stagedData?.transactions) {
      const recoverDraftTransactions = async () => {
        try {
          const res = await request(`/audit/${activeAuditId}/transactions`, 'GET');
          if (res?.success && res.transactions) {
            const fetchedTxs = res.transactions;
            
            setSelection(prev => ({
              ...prev,
              stagedData: { transactions: fetchedTxs },
              verifiedIds: fetchedTxs.filter(t => isTrue(t.isChecked)).map(t => t._id)
            }));

            // --- INTELLIGENT AUTO-RESUME EVALUATION ---
            const validTxs = fetchedTxs.filter(t => t.narration !== "EMPTY_FILE_MARKER");
            const isAuditDone = validTxs.length > 0 && validTxs.every(t => isTrue(t.isChecked));
            
            const salesTxs = fetchedTxs.filter(t => isTrue(t.isSales) && t.type === 'RECEIPT');
            const isSalesDone = salesTxs.length === 0 || salesTxs.every(t => isTrue(t.isSalesApproved));

            const hasSyncedItems = validTxs.some(t => t.isSynced || t.tallySyncStatus === 'COMPLETED' || t.tallySyncStatus === 'SUCCESS');
            const allItemsSynced = validTxs.length > 0 && validTxs.every(t => t.isSynced || t.tallySyncStatus === 'COMPLETED' || t.tallySyncStatus === 'SUCCESS');

            if (allItemsSynced) {
              setIsSyncComplete(true);
            }

            // Fast-Forward the UI
            if (hasSyncedItems) {
              setStep(6);
            } else if (isAuditDone && isSalesDone) {
              setStep(5);
            } else if (isAuditDone) {
              setStep(4);
            }
          }
        } catch {
          toast.error("Failed to recover batch workspace registry");
        }
      };
      recoverDraftTransactions();
    }
  }, [step, selection.audit?._id, selection.stagedData, request]);

  const validateAndProceed = useCallback(() => {
    const duplicate = audits?.find(a => {
      return a.tallyCompanyName === selection.tallyCompany && 
             a.month === parseInt(selection.month) && 
             a.year === parseInt(selection.year);
    });

    if (duplicate) {
      if (duplicate.status === 'EXPORTED') return toast.error("This period is already finalized for this company.");
      
      const resolvedArnId = duplicate.arnId?._id || duplicate.arnId || selection.arnId;
      setSelection(prev => ({ 
        ...prev, 
        audit: duplicate, 
        arnId: resolvedArnId,
        tallyCompany: duplicate.tallyCompanyName, 
        isFreshStart: false 
      }));

      if (duplicate.sourceFiles && duplicate.sourceFiles.length > 0) {
        setStep(3);
        return toast.info("Analyzing batch history...");
      } else {
        setStep(2);
        return toast.info("Batch session initialized. Please upload bank statements.");
      }
    }
    setStep(2);
  }, [audits, selection]);

  const handleBatchFileUpload = useCallback(async () => {
    const stagedFileMap = selection.stagedFiles || {};
    const bankLedgersToProcess = Object.keys(stagedFileMap);
    
    if (bankLedgersToProcess.length === 0) return;
    if (!selection.tallyCompany || !selection.arnId) {
       return toast.error("Bridge Error: Missing Company or ARN context.");
    }

    setIsProcessing(true);
    let cumulativeTransactions = [];
    let updatedAuditObj = selection.audit;

    try {
      for (const bankName of bankLedgersToProcess) {
        const files = stagedFileMap[bankName];
        if (!files || files.length === 0) continue;

        const matchedAccount = allAccounts.find(a => a.tallyMapping?.companyName === selection.tallyCompany && a.tallyMapping?.ledgerName === bankName) 
                              || allAccounts.find(a => a.name === bankName);

        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        formData.append('tallyCompany', selection.tallyCompany);
        formData.append('tallyLedger', bankName);
        formData.append('arnId', selection.arnId); 
        formData.append('month', selection.month);
        formData.append('year', selection.year);
        if (matchedAccount?._id) formData.append('accountId', matchedAccount._id);

        const res = await request('/audit/upload-bulk', 'POST', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        
        if (res?.success) {
          cumulativeTransactions = [...cumulativeTransactions, ...res.transactions];
          updatedAuditObj = res.audit;
        }
      }

      setSelection(prev => ({ 
        ...prev, 
        audit: updatedAuditObj, 
        stagedData: { transactions: cumulativeTransactions }, 
        verifiedIds: cumulativeTransactions.filter(t => isTrue(t.isChecked)).map(t => t._id),
        stagedFiles: {} 
      }));
      
      setStep(3); 
      toast.success(`Batch workspace populated with ${bankLedgersToProcess.length} bank(s).`);

    } catch (err) { 
      toast.error(err.message || "Batch upload encountered an error."); 
    } finally { 
      setIsProcessing(false); 
    }
  }, [selection, allAccounts, request]);

  const handleSalesValidationComplete = useCallback(async () => {
    setIsProcessing(true);
    try {
      const payloadTxs = (selection.stagedData?.transactions || [])
        .filter(t => isTrue(t.isSales) && t.type === 'RECEIPT')
        .map(t => ({ 
           _id: t._id, 
           isSalesApproved: isTrue(t.isSalesApproved), 
           invoiceBillingDate: t.invoiceBillingDate || null,
           individualSalesLedger: t.individualSalesLedger || null,
           baseAmount: t.baseAmount || t.amount,
           cgst: t.cgst || 0,
           sgst: t.sgst || 0,
           igst: t.igst || 0,
           grossVoucherTotal: t.grossVoucherTotal || t.amount,
           isLocalAmc: t.isLocalAmc || false
        }));

      const res = await request(`/audit/${selection.audit._id}/sales-checkpoint`, 'PUT', { transactions: payloadTxs });
      if (res?.success) setStep(5); 
    } catch { 
      toast.error("Failed to commit sales matrix checkpoint"); 
    } finally { 
      setIsProcessing(false); 
    }
  }, [request, selection.audit?._id, selection.stagedData?.transactions]);
  
  const handleFinalizeAudit = useCallback(async () => {
    setIsProcessing(true);
    try {
      await request(`/audit/${selection.audit._id}/finalize`, 'POST');
      toast.success("Batch finalized and archived securely!");
      if (refreshData) refreshData();
      onClose();
    } catch { 
      toast.error("Batch finalization failed mid-way."); 
    } finally { 
      setIsProcessing(false); 
    }
  }, [selection.audit, request, refreshData, onClose]);

  const steps = [
    { id: 1, label: 'Entity Scope', subtitle: 'Company Selection' },
    { id: 2, label: 'Statement Ingestion', subtitle: 'Upload Files' },
    { id: 3, label: 'Transaction Mapping', subtitle: 'Ledger Verification' },
    { id: 4, label: 'Sales Matrix', subtitle: 'GST & Commission' },
    { id: 5, label: 'Batch Summary', subtitle: 'Overview' },
    { id: 6, label: 'Push & Finalize', subtitle: 'Tally Vouchers' },
  ];

  const isStep3Valid = useMemo(() => {
    const txs = (selection.stagedData?.transactions || []).filter(t => t.narration !== "EMPTY_FILE_MARKER");
    if (txs.length === 0) return false;
    return txs.every(t => (selection.verifiedIds || []).includes(t._id));
  }, [selection.stagedData, selection.verifiedIds]);
  
  const isStep4Valid = useMemo(() => {
    const txs = selection.stagedData?.transactions || [];
    
    const salesTxs = txs.filter(t => isTrue(t.isSales) && t.type === 'RECEIPT');
    if (salesTxs.length === 0) return true;
    
    return salesTxs.every(t => {
      const hasValidLedger = !!(t.individualSalesLedger || selection.salesIncomeLedger);
      const hasValidDate = !!(t.invoiceBillingDate || t.date); 
      return isTrue(t.isSalesApproved) && hasValidDate && hasValidLedger;
    });
  }, [selection.stagedData, selection.salesIncomeLedger]);

  const footerConfig = useMemo(() => {
    switch (step) {
      case 1: 
        return { label: selection.stagedData ? "Resume Batch" : "Proceed to Ingestion", disabled: !selection.tallyCompany, action: validateAndProceed };
      case 2: {
        const banksStagedCount = Object.keys(selection.stagedFiles || {}).length;
        return {
          label: isProcessing ? "Pushing to Tally..." : (banksStagedCount > 0 ? `Process Statements (${banksStagedCount} Banks)` : "Awaiting Uploads"),
          disabled: banksStagedCount === 0 || isProcessing,
          action: handleBatchFileUpload
        };
      }
      case 3: 
        return { label: "Proceed to Sales Matrix", disabled: !isStep3Valid, action: () => setStep(4) };
      case 4: 
        return { label: isProcessing ? "Saving Checkpoint..." : "Verify & Lock Sales Matrix", disabled: isProcessing || !isStep4Valid, action: handleSalesValidationComplete };
      case 5: 
        return { label: isTallyOnline ? "Proceed to Voucher Creation" : "Tally Bridge Offline", disabled: !isTallyOnline, action: () => { setIsSyncComplete(false); setStep(6); } };
      case 6: 
        return { label: isProcessing ? "Finalizing Batch..." : isSyncComplete ? "Finalize & Close Batch" : "Awaiting Voucher Push", disabled: isProcessing || !isSyncComplete, action: handleFinalizeAudit };
      default: 
        return { label: "Proceed", action: () => setStep(s => s + 1) };
    }
  }, [step, selection, isProcessing, isTallyOnline, isStep3Valid, isStep4Valid, isSyncComplete, validateAndProceed, handleBatchFileUpload, handleSalesValidationComplete, handleFinalizeAudit]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; } 
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      
      <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200 bg-slate-950/70 backdrop-blur-xs">
        <div className="w-full h-full flex flex-col overflow-hidden text-left bg-[#F8FAFC] dark:bg-[#07090E] min-w-0">
          
          {/* ========================================================================= */}
          {/* 1. TOP HEADER & PROGRESS HUB                                            */}
          {/* ========================================================================= */}
          <header className="px-4 lg:px-8 py-3.5 bg-white dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-white/10 flex flex-col gap-3 shrink-0 z-30 shadow-xs">
            <div className="flex items-center justify-between gap-4">
              {/* Workspace Badge & Title */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Layers size={18} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                      Batch Processing Engine
                    </h2>
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-wider text-slate-500 border border-slate-200/60 dark:border-white/5">
                      Step {step} of 6
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
                    {steps[step - 1]?.label} • {steps[step - 1]?.subtitle}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={onClose} 
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors border border-slate-200/80 dark:border-white/10 shrink-0 cursor-pointer"
                title="Exit Batch Session"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Stepper Strip */}
            {/* Desktop View (>= lg) */}
            <div className="hidden lg:grid grid-cols-6 gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
              {steps.map((s) => {
                const isActive = step === s.id;
                const isDone = step > s.id;
                
                return (
                  <div 
                    key={s.id}
                    className={`flex items-center gap-2.5 p-2 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300' 
                        : isDone 
                          ? 'bg-slate-100/60 dark:bg-white/5 text-slate-700 dark:text-slate-300' 
                          : 'opacity-40 text-slate-400'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : isDone 
                          ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' 
                          : 'bg-slate-200 dark:bg-white/10 text-slate-500'
                    }`}>
                      {isDone ? <Check size={11} strokeWidth={3} /> : s.id}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider truncate">{s.label}</p>
                      <p className="text-[9px] font-medium opacity-70 truncate">{s.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile / Tablet Horizontal Stepper (< lg) */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {steps.map((s) => {
                const isActive = step === s.id;
                const isDone = step > s.id;
                
                return (
                  <div 
                    key={s.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md shrink-0 text-[10px] font-black uppercase tracking-wider border ${
                      isActive 
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400' 
                        : isDone 
                          ? 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200' 
                          : 'border-transparent text-slate-400 opacity-60'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] ${
                      isActive ? 'bg-emerald-600 text-white' : isDone ? 'bg-slate-700 text-white' : 'bg-slate-200 dark:bg-white/10'
                    }`}>
                      {isDone ? <Check size={9} strokeWidth={3} /> : s.id}
                    </span>
                    <span className="truncate">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </header>

          {/* ========================================================================= */}
          {/* 2. ACTIVE STEP WORKSPACE                                                 */}
          {/* ========================================================================= */}
          <main className="flex-1 overflow-hidden relative min-w-0">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="animate-spin text-emerald-500" size={36} strokeWidth={2} />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Establishing Secure Bridge Session...
                </span>
              </div>
            ) : (
              <div className="h-full w-full flex flex-col overflow-y-auto lg:overflow-hidden no-scrollbar">
                {step === 1 && <IdentityStep arns={arns} selection={selection} setSelection={setSelection} />}
                {step === 2 && <SyncStep selection={selection} isProcessing={isProcessing} setSelection={setSelection} />}
                {step === 3 && <AuditStep selection={selection} setSelection={setSelection} masterLedgers={masterLedgers} />}
                {step === 4 && <SalesStep selection={selection} setSelection={setSelection} masterLedgers={masterLedgers} arns={arns} />}
                {step === 5 && <SummaryStep selection={selection} arns={arns} />}
                {step === 6 && (
                   <ResultStep 
                     transactions={(selection.stagedData?.transactions || [])} 
                     companyName={selection.tallyCompany}
                     bankLedgerName={selection.account?.name || selection.tallyLedger}
                     salesIncomeLedger={selection.salesIncomeLedger}
                     arns={arns}
                     arnId={selection.arnId}
                     masterLedgers={masterLedgers}
                     onComplete={() => setIsSyncComplete(true)} 
                   />
                )}
              </div>
            )}
          </main>

          {/* ========================================================================= */}
          {/* 3. BOTTOM WORKBENCH DOCK                                                 */}
          {/* ========================================================================= */}
          <footer className="px-4 lg:px-8 py-3.5 bg-white dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 z-30 shadow-xs">
            
            {/* Left Scope Context */}
            <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
              <div className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 border text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                isTallyOnline 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' 
                  : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isTallyOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isTallyOnline ? 'Bridge Online' : 'Bridge Offline'}</span>
              </div>

              <div className="flex items-center gap-2 min-w-0 border-l border-slate-200 dark:border-white/10 pl-3">
                <Building2 size={13} className="text-slate-400 shrink-0" />
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase truncate">
                  {selection.tallyCompany || "No Company Context"}
                </span>
                {selection.month && (
                  <span className="hidden md:inline text-[10px] font-semibold text-slate-400 shrink-0">
                    ({selection.month}/{selection.year})
                  </span>
                )}
              </div>
            </div>

            {/* Right Action Trigger Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
              {[2, 4, 5].includes(step) && (
                <button 
                  onClick={() => setStep(step - 1)} 
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft size={13} className="inline mr-1" /> Back
                </button>
              )}
              
              <button 
                disabled={footerConfig.disabled} 
                onClick={footerConfig.action} 
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold uppercase text-xs tracking-wider transition-all duration-200 cursor-pointer shadow-xs active:scale-98 select-none ${
                  footerConfig.disabled 
                    ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 border border-slate-200 dark:border-white/5' 
                    : step === 6 && isSyncComplete 
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{footerConfig.label}</span>
                    <ArrowRight size={15} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </div>

          </footer>
        </div>
      </div>
    </>
  );
};

export default AuditWizard;