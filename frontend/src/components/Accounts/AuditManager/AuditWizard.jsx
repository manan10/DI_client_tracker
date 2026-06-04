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
    if (initialSelection?.audit || (initialSelection?.account && initialSelection?.stagedData)) return 3;
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
        isFreshStart: false
      };
    }
    return { ...initialSelection };
  });

  const fetchMasterData = useCallback(async () => {
    try {
      const [arnRes, accRes] = await Promise.all([request('/arns'), request('/accounts')]);
      const fetchedArns = arnRes?.data || [];
      const fetchedAccounts = accRes?.data || [];
      setArns(fetchedArns);
      setAccounts(fetchedAccounts);

      if (selection?.audit) {
        const targetAccountId = selection.audit.accountId?._id || selection.audit.accountId;
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
    if (step === 3 && activeAuditId && !selection.stagedData?.transactions) {
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
    const currentAccountId = selection.account?._id || (typeof selection.account === 'string' ? selection.account : null);
    const duplicate = audits?.find(a => {
      const auditAccId = a.accountId?._id || a.accountId;
      return auditAccId === currentAccountId && 
             a.month === parseInt(selection.month) && 
             a.year === parseInt(selection.year) &&
             a.companyName === selection.tallyCompany &&          
             a.bankLedgerName === selection.tallyLedger;          
    });

    if (duplicate) {
      if (duplicate.status === 'EXPORTED') return toast.error("This period is already finalized.");
      const fullAccount = allAccounts.find(a => a._id === currentAccountId) || duplicate.accountId;
      const resolvedArnId = duplicate.arnId?._id || duplicate.arnId || selection.arnId;
      setSelection(prev => ({ 
        ...prev, audit: duplicate, account: fullAccount, arnId: resolvedArnId,
        tallyCompany: prev.tallyCompany || duplicate.tallyCompanyName,
        tallyLedger: prev.tallyLedger || duplicate.tallyLedgerName, isFreshStart: false 
      }));
      setStep(3);
      return toast.info("Resuming draft session.");
    }
    setStep(2);
  }, [audits, selection, allAccounts]);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    const isSetupComplete = selection.tallyCompany && selection.account?.name && selection.arnId;
    if (!isSetupComplete) return toast.error("Bridge Error: This Tally Company isn't linked to a Client ARN.");

    setIsProcessing(true);
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    formData.append('tallyCompany', selection.tallyCompany);
    formData.append('tallyLedger', selection.account.name);
    formData.append('arnId', selection.arnId); 
    formData.append('month', selection.month);
    formData.append('year', selection.year);
    if (selection.account?._id) formData.append('accountId', selection.account._id);

    try {
      const res = await request('/audit/upload-bulk', 'POST', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res?.success) {
        setSelection(prev => ({ 
          ...prev, audit: res.audit, stagedData: { transactions: res.transactions },
          verifiedIds: res.transactions.filter(t => t.isChecked).map(t => t._id)
        }));
        setStep(3); 
        toast.success("Statement Processed");
      }
    } catch (err) { toast.error(err.message || "Upload failed"); } 
    finally { setIsProcessing(false); }
  };

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
      toast.success("Audit finalized securely!");
      if (refreshData) refreshData();
      onClose();
    } catch { toast.error("Finalization failed mid-way."); } 
    finally { setIsProcessing(false); }
  }, [selection.audit, request, refreshData, onClose]);

  const steps = [
    { id: 1, label: 'Entity Context', desc: 'Company Selection', icon: <Zap size={14} className="md:w-3.5 md:h-3.5" />, enabled: true },
    { id: 2, label: 'Data Ingestion', desc: 'Bank Statement Upload', icon: <HardDriveUpload size={14} className="md:w-3.5 md:h-3.5" />, enabled: !!(selection.tallyCompany && selection.account) },
    { id: 3, label: 'Verification', desc: 'Ledger Matching', icon: <ClipboardCheck size={14} className="md:w-3.5 md:h-3.5" />, enabled: !!selection.stagedData },
    { id: 4, label: 'Sales Matrix', desc: 'Verify Commissions', icon: <ClipboardCheck size={14} className="md:w-3.5 md:h-3.5" />, enabled: !!selection.stagedData },
    { id: 5, label: 'Summary', desc: 'Pre-Flight Check', icon: <Send size={14} className="md:w-3.5 md:h-3.5" />, enabled: !!selection.stagedData },
    { id: 6, label: 'Audit Result', desc: 'Sync Status', icon: <CheckCircle2 size={14} className="md:w-3.5 md:h-3.5" />, enabled: step === 6 },
  ];

  const isStep3Valid = useMemo(() => (selection.stagedData?.transactions || []).some(t => t.isChecked), [selection.stagedData]);
  
  const isStep4Valid = useMemo(() => {
    const txs = selection.stagedData?.transactions || [];
    const salesTxs = txs.filter(t => t.isCommission && t.type === 'RECEIPT');
    if (salesTxs.length === 0) return true;
    if (!selection.salesIncomeLedger) return false;
    return salesTxs.some(t => t.isSalesApproved && t.invoiceBillingDate);
  }, [selection.stagedData, selection.salesIncomeLedger]);

  const footerConfig = useMemo(() => {
    switch (step) {
      case 1: return { label: selection.stagedData ? "Resume Workspace" : "Next: Upload Statement", disabled: !selection.tallyCompany || !selection.account, action: validateAndProceed };
      case 2: return { label: "Awaiting Source", disabled: true, action: () => {} };
      case 3: return { label: "Next: Sales Verification", disabled: !isStep3Valid, action: () => setStep(4) };
      case 4: return { label: isProcessing ? "Saving Checkpoint..." : "Verify & Lock Sales Ledger", disabled: isProcessing || !isStep4Valid, action: handleSalesValidationComplete };
      case 5: return { label: isTallyOnline ? "Commit Vouchers" : "Bridge Offline", disabled: !isTallyOnline, action: () => { setIsSyncComplete(false); setStep(6); } };
      case 6: return { 
        label: isProcessing ? "Finalizing Audit..." : isSyncComplete ? "Finalize & Close Audit" : "Awaiting Manual Sync", 
        disabled: isProcessing || !isSyncComplete, 
        action: handleFinalizeAudit 
      };
      default: return { label: "Proceed", action: () => setStep(s => s + 1) };
    }
  }, [step, selection, isProcessing, isTallyOnline, isStep3Valid, isStep4Valid, isSyncComplete, validateAndProceed, handleSalesValidationComplete, handleFinalizeAudit]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
      <div className="fixed inset-0 z-100 flex items-center justify-center p-0 md:p-4 backdrop-blur-2xl bg-slate-950/80 animate-in fade-in duration-300">
        <div className="relative w-full h-full md:max-w-[95vw] lg:max-w-350 md:h-180 bg-white dark:bg-[#08090A] border-0 md:border border-slate-200 dark:border-white/10 md:rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden text-left">
          
          <div className="px-4 md:px-12 py-4 md:py-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-black/20 shrink-0 overflow-x-auto no-scrollbar">
            <div className="flex-1 md:flex-none flex items-center justify-between md:justify-start w-full md:w-auto md:gap-10 pr-4 md:pr-0">
              {steps.map((s, idx) => {
                const isActive = step === s.id;
                const isDone = step > s.id;
                if (s.id === 6 && step < 6 && window.innerWidth < 768) return null;
                return (
                  <div key={s.id} className={`flex items-center md:gap-5 ${idx !== steps.length - 1 ? 'flex-1 md:flex-none' : ''}`}>
                    <div className={`flex items-center md:gap-4 group transition-all shrink-0 ${isActive ? 'text-emerald-600' : isDone ? 'text-slate-900 dark:text-white' : 'text-slate-300'}`}>
                      <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl flex items-center justify-center border-2 transition-all ${isActive ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : isDone ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black' : 'border-slate-100 dark:border-white/5'}`}>
                        {isDone ? <Check size={14} className="md:w-4.5 md:h-4.5" strokeWidth={4} /> : s.icon}
                      </div>
                      <div className="hidden xl:flex flex-col -space-y-0.5">
                        <span className={`text-[11px] font-[1000] uppercase tracking-wider transition-all ${isActive ? 'opacity-100' : 'opacity-60'}`}>{s.label}</span>
                        <span className="text-[9px] font-black opacity-30 uppercase tracking-tighter">{s.desc}</span>
                      </div>
                    </div>
                    {idx !== steps.length - 1 && <div className="flex-1 md:flex-none md:w-10 h-px bg-slate-200 dark:bg-white/10 mx-2 md:mx-0 transition-all" />}
                  </div>
                );
              })}
            </div>
            <button onClick={onClose} className="shrink-0 p-2 md:p-2.5 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg md:rounded-xl transition-all active:scale-95 sticky right-0"><X size={18} className="md:w-5 md:h-5" /></button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 md:gap-5 opacity-40">
                <Loader2 className="animate-spin text-emerald-500" size={32} md:size={44} strokeWidth={1.5} />
                <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.5em] text-center px-4">Establishing Secure Bridge...</span>
              </div>
            ) : (
              <div className="h-full animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-y-auto no-scrollbar">
                {step === 1 && <IdentityStep arns={arns} accounts={allAccounts} selection={selection} setSelection={setSelection} />}
                {step === 2 && <SyncStep selection={selection} onUpload={handleFileUpload} isProcessing={isProcessing} />}
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
                     onComplete={() => setIsSyncComplete(true)} 
                   />
                )}
              </div>
            )}
          </div>

          <div className="px-4 md:px-12 py-4 md:py-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex flex-row justify-between items-center gap-2 md:gap-0 shrink-0">
            <div className="flex items-center gap-2 md:gap-5 w-auto">
              <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center transition-all shrink-0 ${isTallyOnline ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                  {isTallyOnline ? <Zap size={14} className="md:w-5.5 md:h-5.5" fill="currentColor" /> : <CloudFog size={14} className="md:w-5.5 md:h-5.5" />}
              </div>
              <div className="space-y-0.5 min-w-0">
                  <p className="hidden md:block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none truncate">Tally Connection: <span className={isTallyOnline ? "text-emerald-500" : "text-rose-500"}>{isTallyOnline ? "Online" : "Offline"}</span></p>
                  <p className="text-[9px] md:text-[12px] font-[1000] text-slate-900 dark:text-white uppercase italic leading-none truncate max-w-30 md:max-w-xs">
                      {selection.account ? `${selection.account.name || 'Account Configured'} • ${selection.month}/${selection.year}` : "Ready for selection"}
                  </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-6 w-auto">
                {step > 1 && step < 6 && (
                  <button onClick={() => setStep(step - 1)} className="px-2 md:px-8 py-2 md:py-4 text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all underline underline-offset-4 md:underline-offset-8 decoration-slate-200">Back</button>
                )}
                
                {/* FIX: Removed disabled:grayscale and updated disabled:opacity to 50 so it visibly stays green but dim */}
                <button disabled={footerConfig.disabled} onClick={footerConfig.action} className={`flex items-center justify-center gap-1.5 md:gap-8 hover:bg-opacity-90 text-white px-4 md:px-12 py-3 md:py-5 rounded-lg md:rounded-2xl font-black uppercase text-[9px] md:text-[11px] tracking-widest md:tracking-[0.2em] shadow-lg md:shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap ${step === 6 && isSyncComplete ? 'bg-slate-900 dark:bg-white dark:text-slate-900 shadow-slate-900/20 dark:shadow-white/20' : 'bg-emerald-600 shadow-emerald-600/20'}`}>
                  {isProcessing || (step === 6 && !isSyncComplete) ? <Loader2 size={14} className="md:w-4.5 md:h-4.5 animate-spin" /> : <>{footerConfig.label} <ArrowRight size={12} md:size={16} strokeWidth={3} /></>}
                </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuditWizard;