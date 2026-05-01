import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, CheckCircle2, Plus, ShieldAlert, Clock, User, Trash2, 
  CreditCard, Lock, Unlock, Check, AlertTriangle, Landmark, 
  Fingerprint, Share2, MessageCircle, Activity, Send, Loader2, Paperclip,
  ChevronDown, Settings, FileText
} from 'lucide-react';
import { useApi } from '../../../hooks/useApi';
import { toast } from 'sonner';

// Custom Dropdown Sub-Component
const CustomSelect = ({ label, value, options, onChange, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white dark:bg-black/40 border ${isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200 dark:border-white/10'} rounded-xl px-5 py-4 text-xs font-black uppercase transition-all shadow-sm`}
      >
        <span className={value ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
          {options.find(o => o.value === value)?.label || placeholder}
        </span>
        <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-500' : 'text-slate-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#12141C] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-3000 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-1 max-h-60 overflow-y-auto no-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${value === opt.value ? 'bg-emerald-500 text-white shadow-lg' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'}`}
              >
                {opt.label}
                {value === opt.value && <Check size={14} strokeWidth={4} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SubmissionDetail = ({ submissionId, isOpen, onClose, onUpdate, onDelete }) => {
  const { request, loading: apiLoading } = useApi();
  const [submission, setSubmission] = useState(null);
  const [activeTab, setActiveTab] = useState('CHECKLIST'); 
  const [newStep, setNewStep] = useState("");
  const [activeInsertIdx, setActiveInsertIdx] = useState(null);
  const [comment, setComment] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current && activeTab === 'ACTIVITY') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [submission?.auditTrail, activeTab]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!isOpen || !submissionId) return;
      const res = await request(`/submissions/${submissionId}`);
      if (res?.success && isMounted) setSubmission(res.data);
    };
    loadData();
    return () => { isMounted = false; };
  }, [isOpen, submissionId, request]);

  const isChecklistComplete = useMemo(() => submission?.checklist?.every(s => s.isCompleted) ?? false, [submission]);
  const canFulfill = isChecklistComplete && submission?.status === 'SETTLED';

  const handleUpdate = async (payload) => {
    const res = await request(`/submissions/${submissionId}`, 'PATCH', payload);
    if (res?.success) {
      setSubmission(res.data);
      onUpdate(res.data);
    }
  };

  const handleDelete = async () => {
    setIsExecuting(true);
    const res = await request(`/submissions/${submissionId}`, 'DELETE');
    if (res?.success) {
      toast.success("Registry Record Expunged");
      if (onDelete) onDelete(submissionId); // Notify parent to remove from list
      onClose();
    }
    setIsExecuting(false);
    setShowDeleteConfirm(false);
  };

  const executeFulfillment = async () => {
    setIsExecuting(true);
    const res = await request(`/submissions/${submissionId}`, 'PATCH', { 
      isFinalized: true 
    });
    if (res?.success) {
      toast.success("Submission Fulfilled & Finalized");
      onUpdate(res.data);
      onClose();
    }
    setIsExecuting(false);
  };

  const postComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const res = await request(`/submissions/${submissionId}`, 'PATCH', {
      auditTrail: [{ action: 'NOTE', note: comment }]
    });
    if (res?.success) {
      setSubmission(res.data);
      setComment("");
      toast.success("Note logged");
    }
  };

  const injectStep = async (e) => {
    e.preventDefault();
    if (!newStep.trim()) return;
    const res = await request(`/submissions/${submissionId}/custom-step`, 'POST', { 
      text: newStep.toUpperCase(), 
      index: activeInsertIdx 
    });
    if (res?.success) {
      setSubmission(res.data);
      setNewStep("");
      setActiveInsertIdx(null);
      onUpdate(res.data);
    }
  };

  if (!isOpen || !submission) return null;

  const isNFT = submission.type === 'NON_FINANCIAL';

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[2000]" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-[850px] bg-[#F1F5F9] dark:bg-[#08090A] shadow-[-50px_0_100px_rgba(0,0,0,0.5)] z-[2001] flex flex-col animate-in slide-in-from-right duration-500">
        
        {/* HEADER */}
        <div className="bg-white dark:bg-[#0D0E12] px-10 py-8 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-8 text-left">
            <div className={`h-20 w-20 rounded-3xl flex items-center justify-center shadow-inner ${isNFT ? 'bg-blue-500/10 border border-blue-500/20 text-blue-500' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'}`}>
              {isNFT ? <Settings size={40} strokeWidth={1.5} /> : <Landmark size={40} strokeWidth={1.5} />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 text-white dark:text-black text-[9px] font-black uppercase tracking-[0.2em] rounded ${isNFT ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-900 dark:bg-emerald-500'}`}>
                   {isNFT ? submission.subType?.replace(/_/g, ' ') : submission.type?.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest italic uppercase opacity-50">REF: {submission._id.slice(-8)}</span>
              </div>
              <h2 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                {submission.schemeName || submission.subType?.replace(/_/g, ' ')}
              </h2>
              <p className="text-sm font-bold text-slate-500 uppercase">{submission.client?.name} <span className="mx-2 text-slate-300">|</span> {submission.client?.pan}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-rose-500 transition-all border border-slate-100 dark:border-white/5 shadow-sm">
            <X size={24} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex px-10 bg-white dark:bg-[#0D0E12] border-b border-slate-200 dark:border-white/10">
          {[
            { id: 'CHECKLIST', label: '1. Checklist', icon: CheckCircle2 },
            { id: 'LOGISTICS', label: isNFT ? '2. Request Details' : '2. Settlement', icon: isNFT ? FileText : CreditCard },
            { id: 'ACTIVITY', label: '3. Activity Feed', icon: MessageCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-5 text-[11px] font-black uppercase tracking-widest border-b-4 transition-all ${
                activeTab === tab.id ? 'border-emerald-500 text-emerald-500 bg-emerald-500/2' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          
          {/* TAB 1: CHECKLIST */}
          {activeTab === 'CHECKLIST' && (
            <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar text-left">
              {!isNFT ? (
                <section className="px-8 py-6 bg-white dark:bg-[#0D0E12] border border-slate-200 dark:border-white/10 rounded-3xl flex justify-between items-center shadow-sm">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount</p>
                    <p className="text-3xl font-[1000] text-slate-900 dark:text-white tabular-nums tracking-tighter italic">
                       {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(submission.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Status</p>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${submission.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {submission.paymentStatus}
                    </span>
                  </div>
                </section>
              ) : (
                <section className="px-8 py-6 bg-blue-500/5 border border-blue-500/20 rounded-3xl flex justify-between items-center shadow-sm">
                   <div>
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Non-Financial Request</p>
                    <p className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-tight">
                       {submission.subType?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <FileText className="text-blue-500 opacity-20" size={40} />
                </section>
              )}

              <section className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Submission Status</p>
                <div className="grid grid-cols-4 gap-2">
                  {['PENDING', 'SUBMITTED', 'REJECTED', 'SETTLED'].map(s => (
                    <button 
                      key={s}
                      onClick={() => handleUpdate({ status: s })}
                      className={`py-4 text-[10px] font-black rounded-xl border transition-all ${
                        submission.status === s 
                          ? (s === 'REJECTED' ? 'bg-rose-600 text-white border-rose-600 shadow-lg' : 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xl scale-[1.02]') 
                          : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>

              {submission.status === 'REJECTED' && (
                <section className="p-8 bg-rose-500/5 border-2 border-rose-500/20 rounded-3xl space-y-6 animate-in slide-in-from-top-4">
                  <div className="flex items-center gap-3 text-rose-600 font-black uppercase text-[10px] tracking-widest">
                    <ShieldAlert size={18} strokeWidth={3} /> Rejection Reason
                  </div>
                  <CustomSelect 
                    label="IDENTIFY DISCREPANCY"
                    value={submission.rejectionReason}
                    options={[
                      { value: 'KYC_INCOMPLETE', label: 'KYC INCOMPLETE' },
                      { value: 'SIGNATURE_MISMATCH', label: 'SIGNATURE MISMATCH' },
                      { value: 'BANK_REJECTED', label: 'BANK REJECTED' },
                      { value: 'INFO_MISMATCH', label: 'INFO MISMATCH' },
                      { value: 'OTHER', label: 'OTHER REASON' }
                    ]}
                    onChange={(val) => handleUpdate({ rejectionReason: val })}
                    placeholder="CHOOSE REASON..."
                  />
                  <textarea 
                    placeholder="LOG TECHNICAL DISCREPANCIES..."
                    className="w-full h-28 bg-white dark:bg-black/40 border border-rose-200 dark:border-white/10 rounded-xl p-5 text-xs font-medium outline-none transition-all resize-none shadow-inner"
                    defaultValue={submission.rejectionNotes}
                    onBlur={(e) => handleUpdate({ rejectionNotes: e.target.value })}
                  />
                </section>
              )}

              <div className="bg-white dark:bg-[#0D0E12] rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                {submission.checklist?.map((step, idx) => (
                  <div key={step._id} className="relative group">
                    <div 
                      onClick={() => handleUpdate({ checklist: submission.checklist.map(s => s._id === step._id ? {...s, isCompleted: !s.isCompleted, completedAt: !s.isCompleted ? new Date() : null} : s) })}
                      className={`flex items-center gap-6 px-8 py-6 border-b last:border-0 border-slate-100 dark:border-white/5 transition-all cursor-pointer ${step.isCompleted ? 'bg-emerald-500/1' : 'hover:bg-slate-50 dark:hover:bg-white/1'}`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${step.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'border-slate-200 dark:border-white/10 group-hover:border-emerald-500'}`}>
                        {step.isCompleted ? <Check size={14} strokeWidth={4} /> : <span className="text-[10px] font-black text-slate-300">{idx + 1}</span>}
                      </div>
                      <span className={`flex-1 text-[13px] font-bold uppercase tracking-tight ${step.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{step.text}</span>
                      <button onClick={(e) => { e.stopPropagation(); setActiveInsertIdx(idx + 1); }} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-emerald-500 transition-all"><Plus size={18} /></button>
                    </div>

                    {activeInsertIdx === idx + 1 && (
                      <form onSubmit={injectStep} className="p-4 bg-emerald-500/5 border-y border-emerald-500/20 flex gap-4 animate-in slide-in-from-top-2">
                        <input autoFocus className="flex-1 bg-white dark:bg-black/20 border border-emerald-500/30 rounded-xl px-5 py-3 text-xs font-black uppercase outline-none" placeholder="Inject requirement..." value={newStep} onChange={(e) => setNewStep(e.target.value)} onBlur={() => !newStep && setActiveInsertIdx(null)} />
                        <button type="submit" className="px-6 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase">ADD</button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LOGISTICS */}
          {activeTab === 'LOGISTICS' && (
            <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar text-left">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isNFT ? 'RTA Request No.' : 'RTA Confirmation ID'}</label>
                    <input className="w-full bg-white dark:bg-[#0D0E12] border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-5 text-sm font-mono font-bold uppercase outline-none focus:border-emerald-500 shadow-sm" placeholder="ID..." defaultValue={submission.rtaReference} onBlur={(e) => handleUpdate({ rtaReference: e.target.value })} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Folio Account No.</label>
                    <input className="w-full bg-white dark:bg-[#0D0E12] border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-5 text-sm font-black uppercase outline-none focus:border-emerald-500 shadow-sm" defaultValue={submission.folioNumber} onBlur={(e) => handleUpdate({ folioNumber: e.target.value })} />
                  </div>
               </div>
               
               {!isNFT && (
                 <div className="p-8 bg-white dark:bg-[#0D0E12] rounded-3xl border border-slate-200 dark:border-white/10 space-y-6 shadow-sm">
                    <CustomSelect 
                      label="SETTLEMENT ENGINE STATUS"
                      value={submission.paymentStatus}
                      options={[
                        { value: 'WAITING', label: 'WAITING' },
                        { value: 'PAID', label: 'PAID' },
                        { value: 'VERIFIED', label: 'VERIFIED' },
                        { value: 'NOT_APPLICABLE', label: 'NOT APPLICABLE' }
                      ]}
                      onChange={(val) => handleUpdate({ paymentStatus: val })}
                    />
                 </div>
               )}

               <div className="p-10 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl flex flex-col items-center opacity-30">
                  <Paperclip size={32} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Documentation Vault Restricted</p>
               </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY */}
          {activeTab === 'ACTIVITY' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-black/20">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
                {submission.auditTrail?.map((log, i) => (
                  <div key={i} className={`flex flex-col ${log.action === 'NOTE' ? 'items-end' : 'items-center'}`}>
                    {log.action !== 'NOTE' ? (
                      <div className="w-full flex flex-col items-center gap-2 py-4">
                        <div className="flex items-center gap-4 w-full opacity-40">
                          <div className="h-px flex-1 bg-slate-300 dark:bg-white/10" />
                          <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-4 py-1.5 rounded-full border border-slate-200 dark:border-white/10 shadow-sm">
                            <Activity size={10} className="text-emerald-500" />
                            <span className="text-[9px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-[0.2em]">{log.action?.replace('_', ' ')}</span>
                          </div>
                          <div className="h-px flex-1 bg-slate-300 dark:bg-white/10" />
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 italic text-center max-w-md">{log.note}</p>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    ) : (
                      <div className="max-w-[75%] space-y-2 animate-in slide-in-from-right-4">
                        <div className="bg-white dark:bg-[#161920] p-6 rounded-3xl rounded-tr-none border border-slate-200 dark:border-white/10 shadow-xl border-l-4 border-l-emerald-500">
                          <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 leading-relaxed italic text-left">"{log.note}"</p>
                        </div>
                        <div className="flex justify-end items-center gap-2 px-2">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{log.performedBy?.name || 'Authorized User'}</span>
                           <span className="text-[9px] font-bold text-slate-300">•</span>
                           <span className="text-[9px] font-bold text-slate-300">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-8 bg-white dark:bg-[#0D0E12] border-t border-slate-200 dark:border-white/10">
                <form onSubmit={postComment} className="relative group">
                  <input className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-6 pr-32 py-5 text-sm font-medium outline-none focus:border-emerald-500 transition-all shadow-inner" placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
                  <button type="submit" disabled={!comment.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">Submit</button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-10 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D0E12]">
           <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <button onClick={() => { const msg = `*Update for ${submission.client?.name}*\n${submission.schemeName || submission.subType} is ${submission.status}.`; navigator.clipboard.writeText(msg); toast.success("Copied to Clipboard"); }} className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-400 hover:text-emerald-500 transition-all shadow-sm"><Share2 size={22} /></button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-400 hover:text-rose-500 transition-all shadow-sm"
                >
                  <Trash2 size={22} />
                </button>
              </div>
              
              <button
                disabled={!canFulfill || apiLoading || isExecuting}
                onClick={executeFulfillment}
                className={`flex-1 flex items-center justify-center gap-4 py-5 rounded-2xl font-[1000] text-[12px] uppercase tracking-[0.3em] transition-all
                  ${canFulfill ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-2xl hover:scale-[1.01] active:scale-95' : 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-white/10 grayscale opacity-40 cursor-not-allowed'}
                `}
              >
                {isExecuting || apiLoading ? <Loader2 size={16} className="animate-spin" /> : (canFulfill ? <Unlock size={16} strokeWidth={3} /> : <Lock size={16} />)}
                {canFulfill ? "Mark as Fulfilled" : "Fulfillment Pending"}
              </button>
           </div>
        </div>
      </div>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#0B1120] rounded-[2.5rem] p-10 border border-slate-200 dark:border-white/5 shadow-2xl text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center text-rose-500 mx-auto mb-8">
              <AlertTriangle size={40} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none mb-4">
              Delete <span className="text-rose-500">Record?</span>
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed mb-10">
              This action is irreversible. All checklist data and audit logs for this submission will be permanently expunged.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isExecuting}
                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isExecuting ? <Loader2 size={14} className="animate-spin" /> : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubmissionDetail;