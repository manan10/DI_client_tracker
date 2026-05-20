import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Loader2, Zap, Check, ArrowRight, CloudFog, Send, HardDriveUpload, ClipboardCheck } from 'lucide-react';
import { useApi } from '../../../hooks/useApi';
import { toast } from 'sonner';

import IdentityStep from './AuditWizard/IdentityStep';
import SyncStep from './AuditWizard/SyncStep';
import AuditStep from './AuditWizard/AuditStep';
import SalesStep from './AuditWizard/SalesStep'; 
import SummaryStep from './AuditWizard/SummaryStep';

const AuditWizard = ({ onClose, refreshData, initialSelection, audits, isTallyOnline }) => {
  const { request } = useApi();
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [arns, setArns] = useState([]);
  const [allAccounts, setAccounts] = useState([]);
  const [masterLedgers, setMasterLedgers] = useState([]);

  // --- LAZY INITIAL STATE HYDRATION ---
  const [step, setStep] = useState(() => {
    if (initialSelection?.audit || (initialSelection?.account && initialSelection?.stagedData)) {
      return 3;
    }
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
    return initialSelection;
  });

  // Initial Data Fetch
  const fetchMasterData = useCallback(async () => {
    try {
      const [arnRes, accRes] = await Promise.all([
        request('/arns'), request('/accounts')
      ]);
      
      const fetchedArns = arnRes?.data || [];
      const fetchedAccounts = accRes?.data || [];
      
      setArns(fetchedArns);
      setAccounts(fetchedAccounts);

      if (selection?.audit) {
        const targetAccountId = selection.audit.accountId?._id || selection.audit.accountId;
        const targetAccountObj = fetchedAccounts.find(a => a._id === targetAccountId);
        
        setSelection(prev => ({
          ...prev,
          account: targetAccountObj || prev.account
        }));
      }
    } catch { 
      toast.error("System connection failed"); 
    } finally { 
      setLoading(false); 
    }
  }, [request, selection?.audit]);

  useEffect(() => { fetchMasterData(); }, [fetchMasterData]);

  // Fetch Master Ledger Suggestion Map
  useEffect(() => {
    const fetchLedgers = async () => {
      if (!selection.tallyCompany) return;

      try {
        const res = await request(`/ledgers?company=${encodeURIComponent(selection.tallyCompany)}`);
        if (res?.data) {
          setMasterLedgers(res.data);
        }
      } catch (err) {
        console.error("Ledger Fetch Error:", err);
      }
    };

    fetchLedgers();
  }, [selection.tallyCompany, request]);

  // TRANSACTION DATA INGESTION HOOK FOR DRAFTS
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
        } catch (err) {
          console.error("Draft reconciliation failure:", err);
          toast.error("Failed to recover transaction workspace registry");
        }
      };
      
      recoverDraftTransactions();
    }
  }, [step, selection.audit?._id, selection.stagedData, request]);

  // FIXED: Stable transactional modifier callback passed down to children routes
  const handleUpdateTransactionData = useCallback((txId, updatedFields) => {
    setSelection(prev => {
      const currentTxs = prev.stagedData?.transactions || [];
      const modifiedTxs = currentTxs.map(tx => 
        tx._id === txId ? { ...tx, ...updatedFields } : tx
      );
      return {
        ...prev,
        stagedData: { ...prev.stagedData, transactions: modifiedTxs }
      };
    });
  }, []);

  // Handle forward validation on Manual Step 1 clicks
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
      if (duplicate.status === 'EXPORTED') {
        toast.error("This period is already finalized.");
        return;
      }
      
      const fullAccount = allAccounts.find(a => a._id === currentAccountId) || duplicate.accountId;
      const resolvedArnId = duplicate.arnId?._id || duplicate.arnId || selection.arnId;

      setSelection(prev => ({ 
        ...prev, 
        audit: duplicate, 
        account: fullAccount,
        arnId: resolvedArnId,
        tallyCompany: prev.tallyCompany || duplicate.tallyCompanyName,
        tallyLedger: prev.tallyLedger || duplicate.tallyLedgerName,
        isFreshStart: false 
      }));
      setStep(3);
      toast.info("Resuming draft session.");
      return;
    }
    setStep(2);
  }, [audits, selection.account, selection.month, selection.year, selection.arnId, selection.tallyCompany, selection.tallyLedger, allAccounts]);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    const isSetupComplete = selection.tallyCompany && selection.account?.name && selection.arnId;

    if (!isSetupComplete) {
      toast.error("Bridge Error: This Tally Company isn't linked to a Client ARN in Settings.");
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    
    formData.append('tallyCompany', selection.tallyCompany);
    formData.append('tallyLedger', selection.account.name);
    formData.append('arnId', selection.arnId); 
    formData.append('month', selection.month);
    formData.append('year', selection.year);

    if (selection.account?._id) {
      formData.append('accountId', selection.account._id);
    }

    try {
      const res = await request('/audit/upload-bulk', 'POST', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res?.success) {
        setSelection(prev => ({ 
          ...prev, 
          audit: res.audit,
          stagedData: { transactions: res.transactions },
          verifiedIds: res.transactions.filter(t => t.isChecked).map(t => t._id)
        }));
        setStep(3); 
        toast.success("Statement Processed");
      }
    } catch (err) { 
      toast.error(err.message || "Upload failed"); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleSalesValidationComplete = useCallback(async () => {
    setIsProcessing(true);
    try {
      const payloadTxs = (selection.stagedData?.transactions || [])
        .filter(t => t.isCommission && t.type === 'RECEIPT')
        .map(t => ({
          _id: t._id,
          isSalesApproved: t.isSalesApproved || false,
          invoiceBillingDate: t.invoiceBillingDate || null
        }));

      const res = await request(`/audit/${selection.audit._id}/sales-checkpoint`, 'PUT', {
        transactions: payloadTxs
      });

      if (res?.success) {
        setStep(5); 
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to commit sales matrix checkpoint down to server");
    } finally {
      setIsProcessing(false);
    }
  }, [request, selection.audit?._id, selection.stagedData?.transactions]);
  
  const handleDirectPush = useCallback(async () => {
    if (!isTallyOnline) return toast.error("Tally Link Offline");
    setIsProcessing(true);
    try {
      await request(`/audit/${selection.audit._id}/finalize`, 'POST');
      toast.success("Vouchers pushed to Tally!");
      if (refreshData) refreshData();
      onClose();
    } catch { toast.error("Push failed mid-way."); } 
    finally { setIsProcessing(false); }
  }, [isTallyOnline, selection.audit, request, refreshData, onClose]);

  const steps = [
    { id: 1, label: 'Entity Context', desc: 'Company Selection', icon: <Zap size={14}/>, enabled: true },
    { id: 2, label: 'Data Ingestion', desc: 'Bank Statement Upload', icon: <HardDriveUpload size={14}/>, enabled: !!(selection.tallyCompany && selection.account) },
    { id: 3, label: 'Verification', desc: 'Ledger Matching', icon: <ClipboardCheck size={14}/>, enabled: !!selection.stagedData },
    { id: 4, label: 'Sales Matrix', desc: 'Verify Commissions', icon: <ClipboardCheck size={14}/>, enabled: !!selection.stagedData },
    { id: 5, label: 'Voucher Creation', desc: 'Create & Push Vouchers', icon: <Send size={14}/>, enabled: !!selection.stagedData },
  ];

  // COMPUTE DISABLING HOOK INTERCEPTORS BASED ON ACTUAL WORKSPACE DATA STREAM COUNTS
  const isStep3Valid = useMemo(() => {
    const txs = selection.stagedData?.transactions || [];
    return txs.some(t => t.isChecked);
  }, [selection.stagedData?.transactions]);

  const isStep4Valid = useMemo(() => {
    const txs = selection.stagedData?.transactions || [];
    return txs.some(t => t.isCommission && t.type === 'RECEIPT' && t.isSalesApproved && t.invoiceBillingDate);
  }, [selection.stagedData?.transactions]);

  const footerConfig = useMemo(() => {
    switch (step) {
      case 1: return { 
        label: selection.stagedData ? "Resume Workspace" : "Next: Upload Statement", 
        disabled: !selection.tallyCompany || !selection.account, 
        action: validateAndProceed 
      };
      case 2: return { label: "Awaiting Source", disabled: true, action: () => {} };
      case 3: return { 
        label: "Next: Sales Verification", 
        disabled: !isStep3Valid, // FIXED: Bounded step 3 blocking logic
        action: () => setStep(4) 
      };
      case 4: return { 
        label: isProcessing ? "Saving Checkpoint..." : "Verify & Lock Sales Ledger", 
        disabled: isProcessing || !isStep4Valid, // FIXED: Bounded step 4 blocking logic
        action: handleSalesValidationComplete 
      };
      case 5: return { 
        label: isTallyOnline ? "Commit Vouchers" : "Bridge Offline", 
        disabled: isProcessing || !isTallyOnline, 
        action: handleDirectPush 
      };
      default: return { label: "Proceed", action: () => setStep(s => s + 1) };
    }
  }, [step, selection, isProcessing, isTallyOnline, isStep3Valid, isStep4Valid, handleDirectPush, validateAndProceed, handleSalesValidationComplete]);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 backdrop-blur-2xl bg-slate-950/80 animate-in fade-in duration-300">
      <div className="relative w-full max-w-350 h-180 bg-white dark:bg-[#08090A] rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden text-left">
        
        {/* HEADER / BREADCRUMBS */}
        <div className="px-12 py-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-black/20">
          <div className="flex items-center gap-14">
            {steps.map((s, idx) => {
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <div key={s.id} className="flex items-center gap-5">
                  <div className={`flex items-center gap-4 group transition-all ${isActive ? 'text-emerald-600' : isDone ? 'text-slate-900 dark:text-white' : 'text-slate-300'}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all ${isActive ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : isDone ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 dark:border-white/5'}`}>
                      {isDone ? <Check size={18} strokeWidth={4} /> : s.icon}
                    </div>
                    <div className="flex flex-col -space-y-0.5">
                      <span className={`text-[11px] font-[1000] uppercase tracking-wider transition-all ${isActive ? 'opacity-100' : 'opacity-60'}`}>{s.label}</span>
                      <span className="text-[9px] font-black opacity-30 uppercase tracking-tighter">{s.desc}</span>
                    </div>
                  </div>
                  {idx !== steps.length - 1 && <div className="w-12 h-px bg-slate-100 dark:bg-white/5" />}
                </div>
              );
            })}
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all active:scale-95"><X size={20} /></button>
        </div>

        {/* WORKSPACE ELEMENT DISPLAY PORT PANELS */}
        <div className="flex-1 overflow-hidden relative">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-5 opacity-40">
              <Loader2 className="animate-spin text-emerald-500" size={44} strokeWidth={1.5} />
              <span className="text-[11px] font-black uppercase tracking-[0.5em]">Establishing Secure Bridge...</span>
            </div>
          ) : (
            <div className="h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
              {step === 1 && <IdentityStep arns={arns} accounts={allAccounts} selection={selection} setSelection={setSelection} />}
              {step === 2 && <SyncStep selection={selection} onUpload={handleFileUpload} isProcessing={isProcessing} />}
              {step === 3 && <AuditStep selection={selection} setSelection={setSelection} masterLedgers={masterLedgers} />}
              {step === 4 && <SalesStep selection={selection} arns={arns} onUpdateTransaction={handleUpdateTransactionData} />}
              {step === 5 && <SummaryStep selection={selection} />}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-12 py-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isTallyOnline ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                {isTallyOnline ? <Zap size={22} fill="currentColor" /> : <CloudFog size={22} />}
            </div>
            <div className="space-y-0.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Tally Connection: <span className={isTallyOnline ? "text-emerald-500" : "text-rose-500"}>{isTallyOnline ? "Online" : "Offline"}</span></p>
                <p className="text-[12px] font-[1000] text-slate-900 dark:text-white uppercase italic leading-none truncate max-w-xs">
                    {selection.account ? `${selection.account.name || 'Account Configured'} • ${selection.month}/${selection.year}` : "Ready for selection"}
                </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
             {step > 1 && (
               <button 
                 onClick={() => setStep(step - 1)} 
                 className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all underline underline-offset-8 decoration-slate-200"
               >
                 Back
               </button>
             )}
             <button 
                disabled={footerConfig.disabled} 
                onClick={footerConfig.action} 
                className="flex items-center gap-8 bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-emerald-600/20 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all"
             >
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <>{footerConfig.label} <ArrowRight size={16} strokeWidth={3} /></>}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditWizard;