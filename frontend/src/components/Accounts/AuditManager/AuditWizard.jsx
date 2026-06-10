import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Loader2, Zap, Check, ArrowRight, CloudFog, Send, HardDriveUpload, ClipboardCheck, CheckCircle2 } from 'lucide-react';
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
        stagedFiles: {}, 
        isFreshStart: false
      };
    }
    return { ...initialSelection, stagedFiles: {} };
  });

  const fetchMasterData = useCallback(async () => {
    try {
      const [arnRes, accRes] = await Promise.all([request('/arns'), request('/accounts')]);
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
        const res = await request(`/ledgers?company=${encodeURIComponent(selection.tallyCompany)}`);
        if (res?.data) setMasterLedgers(res.data);
      } catch (err) {
        console.error("Ledger Fetch Error:", err);
      }
    };
    fetchLedgers();
  }, [selection.tallyCompany, request]);

  useEffect(() => {
    const activeAuditId = selection.audit?._id;
    if (step >= 3 && activeAuditId && !selection.stagedData?.transactions) {
      const recoverDraftTransactions = async () => {
        try {
          const res = await request(`/audit/${activeAuditId}/transactions`);
          if (res?.success && res.transactions) {
            setSelection(prev => ({
              ...prev,
              stagedData: { transactions: res.transactions },
              verifiedIds: res.transactions.filter(t => t.isChecked).map(t => t._id)
            }));
          }
        } catch  {
          toast.error("Failed to recover transaction workspace registry");
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
        return toast.info("Resuming active company dossier.");
      } else {
        setStep(2);
        return toast.info("Company dossier initialized. Please upload bank statements.");
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
        verifiedIds: cumulativeTransactions.filter(t => t.isChecked).map(t => t._id),
        stagedFiles: {} 
      }));
      
      setStep(3); 
      toast.success(`Dossier populated with ${bankLedgersToProcess.length} bank(s).`);

    } catch (err) { 
      toast.error(err.message || "Batch upload encountered an error."); 
    } finally { 
      setIsProcessing(false); 
    }
  }, [selection, allAccounts, request, setStep]);

  const handleSalesValidationComplete = useCallback(async () => {
    setIsProcessing(true);
    try {
      const payloadTxs = (selection.stagedData?.transactions || [])
        .filter(t => t.isCommission && t.type === 'RECEIPT')
        .map(t => ({ 
           _id: t._id, 
           isSalesApproved: t.isSalesApproved || false, 
           invoiceBillingDate: t.invoiceBillingDate || null,
           baseAmount: t.baseAmount || t.amount,
           cgst: t.cgst || 0,
           sgst: t.sgst || 0,
           igst: t.igst || 0,
           grossVoucherTotal: t.grossVoucherTotal || t.amount,
           isLocalAmc: t.isLocalAmc || false
        }));

      const res = await request(`/audit/${selection.audit._id}/sales-checkpoint`, 'PUT', { transactions: payloadTxs });
      if (res?.success) setStep(5); 
    } catch  { toast.error("Failed to commit sales matrix checkpoint"); } 
    finally { setIsProcessing(false); }
  }, [request, selection.audit?._id, selection.stagedData?.transactions]);
  
  const handleFinalizeAudit = useCallback(async () => {
    setIsProcessing(true);
    try {
      await request(`/audit/${selection.audit._id}/finalize`, 'POST');
      toast.success("Dossier finalized securely!");
      if (refreshData) refreshData();
      onClose();
    } catch { toast.error("Finalization failed mid-way."); } 
    finally { setIsProcessing(false); }
  }, [selection.audit, request, refreshData, onClose]);

  const steps = [
    { id: 1, label: 'Entity Context' },
    { id: 2, label: 'Data Ingestion' },
    { id: 3, label: 'Verification' },
    { id: 4, label: 'Sales Matrix' },
    { id: 5, label: 'Summary' },
    { id: 6, label: 'Audit Result' },
  ];

  const isStep3Valid = useMemo(() => {
    const txs = (selection.stagedData?.transactions || []).filter(t => t.narration !== "EMPTY_FILE_MARKER");
    if (txs.length === 0) return false;
    return txs.every(t => (selection.verifiedIds || []).includes(t._id));
  }, [selection.stagedData, selection.verifiedIds]);
  
  const isStep4Valid = useMemo(() => {
    const txs = selection.stagedData?.transactions || [];
    const salesTxs = txs.filter(t => t.isCommission && t.type === 'RECEIPT');
    if (salesTxs.length === 0) return true;
    if (!selection.salesIncomeLedger) return false;
    return salesTxs.some(t => t.isSalesApproved && t.invoiceBillingDate);
  }, [selection.stagedData, selection.salesIncomeLedger]);

  const footerConfig = useMemo(() => {
    switch (step) {
      case 1: 
        return { label: selection.stagedData ? "Resume Dossier" : "Next: Data Ingestion", disabled: !selection.tallyCompany, action: validateAndProceed };
      case 2: {
        const banksStagedCount = Object.keys(selection.stagedFiles || {}).length;
        return {
          label: isProcessing ? "Pushing to Tally..." : (banksStagedCount > 0 ? `Process Statements (${banksStagedCount} Banks)` : "Awaiting Uploads"),
          disabled: banksStagedCount === 0 || isProcessing,
          action: handleBatchFileUpload
        };
      }
      case 3: 
        return { label: "Next: Sales Verification", disabled: !isStep3Valid, action: () => setStep(4) };
      case 4: 
        return { label: isProcessing ? "Saving Checkpoint..." : "Verify & Lock Sales Ledger", disabled: isProcessing || !isStep4Valid, action: handleSalesValidationComplete };
      case 5: 
        return { label: isTallyOnline ? "Commit Vouchers" : "Bridge Offline", disabled: !isTallyOnline, action: () => { setIsSyncComplete(false); setStep(6); } };
      case 6: 
        return { label: isProcessing ? "Finalizing Audit..." : isSyncComplete ? "Finalize & Close Dossier" : "Awaiting Manual Sync", disabled: isProcessing || !isSyncComplete, action: handleFinalizeAudit };
      default: 
        return { label: "Proceed", action: () => setStep(s => s + 1) };
    }
  }, [step, selection, isProcessing, isTallyOnline, isStep3Valid, isStep4Valid, isSyncComplete, validateAndProceed, handleBatchFileUpload, handleSalesValidationComplete, handleFinalizeAudit]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
      
      <div className="fixed inset-0 z-100 flex animate-in fade-in duration-300 bg-slate-900/60 backdrop-blur-sm">
        <div className="w-full h-full flex flex-col overflow-hidden text-left bg-white dark:bg-[#050607]">
          
          {/* =====================================================================
              FANCIER PREMIUM BREADCRUMB HEADER
              ===================================================================== */}
          <div className="px-6 md:px-10 py-5 lg:py-6 border-b-2 border-slate-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#08090A] shrink-0 z-30 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex-1 flex items-center gap-2 max-w-5xl">
              {steps.map((s, idx) => {
                const isActive = step === s.id;
                const isDone = step > s.id;
                if (s.id === 6 && step < 6 && window.innerWidth < 768) return null;
                
                return (
                  <React.Fragment key={s.id}>
                    <div className="flex flex-col relative group shrink-0">
                       <div className={`flex items-center gap-3 transition-all duration-300 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : isDone ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                         <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-[11px] font-[1000] border-2 transition-all duration-500 ${
                           isActive 
                             ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] ring-4 ring-emerald-500/20 scale-110' 
                             : isDone 
                               ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black' 
                               : 'border-dashed border-slate-300 dark:border-white/20 bg-transparent'
                         }`}>
                           {isDone ? <Check size={14} strokeWidth={4} /> : s.id}
                         </div>
                         <span className={`hidden lg:block text-[11px] font-[1000] uppercase tracking-widest transition-all duration-500 ${isActive ? 'opacity-100 text-emerald-600 dark:text-emerald-400 translate-x-1' : isDone ? 'opacity-100' : 'opacity-40'}`}>
                           {s.label}
                         </span>
                       </div>
                    </div>
                    {idx !== steps.length - 1 && (
                      <div className={`flex-1 h-0.75 rounded-full mx-2 lg:mx-4 transition-all duration-700 ${isDone ? 'bg-slate-900 dark:bg-white' : 'bg-slate-100 dark:bg-white/10'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            
            <button 
              onClick={onClose} 
              className="ml-8 shrink-0 p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all active:scale-95 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer shadow-sm"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* =====================================================================
              MAIN CONTENT AREA
              ===================================================================== */}
          <div className="flex-1 overflow-hidden relative bg-slate-50/50 dark:bg-[#0B0C10]">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 opacity-40">
                <Loader2 className="animate-spin text-emerald-500" size={48} strokeWidth={1.5} />
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-center px-4">Establishing Secure Bridge...</span>
              </div>
            ) : (
              <div className="h-full w-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-y-auto lg:overflow-hidden no-scrollbar">
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
          </div>

          {/* =====================================================================
              PROFESSIONAL FOOTER 
              ===================================================================== */}
          <div className="px-6 md:px-10 py-5 lg:py-6 border-t-2 border-slate-100 dark:border-white/5 bg-white dark:bg-[#08090A] flex flex-row justify-between items-center shrink-0 z-30 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.5)]">
            
            <div className="flex items-center gap-5">
              <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border-2 ${isTallyOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 shadow-sm' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${isTallyOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{isTallyOnline ? 'Tally Connected' : 'Tally Offline'}</span>
              </div>
              
              <div className="hidden md:flex flex-col border-l-2 border-slate-100 dark:border-white/5 pl-5">
                 <span className="text-[11px] font-[1000] text-slate-900 dark:text-white uppercase tracking-wider leading-none">
                    {selection.tallyCompany ? selection.tallyCompany : "No Company Selected"}
                 </span>
                 {selection.month && (
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                     Active Period: {selection.month}/{selection.year}
                   </span>
                 )}
              </div>
            </div>

            <div className="flex items-center gap-4">
                {/* NAV GUARD: Only allow backtracking on permitted steps.
                    Prevents backing out of Verification (3) to Sync (2)
                    Prevents backing out of Result (6) to Summary (5) */}
                {[2, 4, 5].includes(step) && (
                  <button 
                    onClick={() => setStep(step - 1)} 
                    className="px-8 py-4 rounded-xl text-[11px] font-[1000] uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-white/20 active:scale-95"
                  >
                    Back
                  </button>
                )}
                
                <button 
                  disabled={footerConfig.disabled} 
                  onClick={footerConfig.action} 
                  className={`flex items-center justify-center gap-3 px-10 py-4 rounded-xl font-[1000] uppercase text-[11px] lg:text-xs tracking-[0.15em] transition-all duration-300 cursor-pointer select-none
                    ${footerConfig.disabled 
                      ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500 border border-slate-200 dark:border-white/10' 
                      : step === 6 && isSyncComplete 
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl hover:-translate-y-0.5 active:scale-95' 
                        : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_25px_-8px_rgba(16,185,129,0.6)] active:scale-95 hover:-translate-y-0.5'
                    }`}
                >
                  {isProcessing || (step === 6 && !isSyncComplete) ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>{footerConfig.label} <ArrowRight size={18} strokeWidth={3} /></>
                  )}
                </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AuditWizard;