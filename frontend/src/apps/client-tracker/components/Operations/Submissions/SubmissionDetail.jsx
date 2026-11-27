// src/components/Operations/Submissions/SubmissionDetail.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, CheckCircle2, Plus, ShieldAlert, Clock, User, Trash2, 
  CreditCard, Lock, Unlock, Check, AlertTriangle, Landmark, 
  Fingerprint, Share2, MessageCircle, Activity, Send, Loader2, Paperclip,
  ChevronDown, Settings, FileText, Database, Calendar, Hash, ArrowRight
} from 'lucide-react';
import { useApi } from "../../../../../shared/hooks/useApi";
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
    <div className="space-y-1.5 relative" ref={containerRef}>
      {label && (
        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white dark:bg-[#1C2230] border ${
          isOpen
            ? 'border-sky-500 ring-2 ring-sky-500/15'
            : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
        } rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-all outline-none text-slate-900 dark:text-white cursor-pointer`}
      >
        <span className={value ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
          {options.find(o => o.value === value)?.label || placeholder}
        </span>
        <ChevronDown size={14} className={`transition-transform duration-200 text-slate-400 ${isOpen ? 'rotate-180 text-sky-500 dark:text-sky-400' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1.5 bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-3000 overflow-hidden py-1">
          <div className="max-h-56 overflow-y-auto no-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  value === opt.value
                    ? 'bg-sky-600 text-white'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span>{opt.label}</span>
                {value === opt.value && <Check size={14} strokeWidth={2.5} />}
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
  
  // States for Dynamic Metadata
  const [newMetaKey, setNewMetaKey] = useState("");
  const [newMetaValue, setNewMetaValue] = useState("");

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
      toast.success("Submission Record Deleted");
      if (onDelete) onDelete(submissionId);
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

  // --- Dynamic Metadata Handlers ---
  const addMetadata = async (e) => {
    e.preventDefault();
    if (!newMetaKey.trim() || !newMetaValue.trim()) return;
    
    const formattedKey = newMetaKey.trim().toUpperCase();
    const currentMeta = submission.metadata || {};
    
    await handleUpdate({
      metadata: {
        ...currentMeta,
        [formattedKey]: newMetaValue.trim()
      }
    });

    setNewMetaKey("");
    setNewMetaValue("");
    toast.success("Field Added");
  };

  const removeMetadata = async (keyToRemove) => {
    const currentMeta = { ...(submission.metadata || {}) };
    delete currentMeta[keyToRemove];
    
    const res = await request(`/submissions/${submissionId}`, 'PATCH', { metadata: currentMeta });
    if (res?.success) {
      setSubmission(res.data);
      onUpdate(res.data);
      toast.success("Field Removed");
    }
  };

  const formatMetaValue = (val) => {
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    }
    return val;
  };

  if (!isOpen || !submission) return null;

  const isNFT = submission.type === 'NON_FINANCIAL';
  
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const isDateKey = newMetaKey.toLowerCase().includes('date');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .sora-font {
          font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

      <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/75 backdrop-blur-xs z-2000 transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full sm:max-w-xl md:max-w-3xl bg-slate-50 dark:bg-[#131720] shadow-2xl z-2001 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 overflow-hidden">

        {/* HEADER */}
        <div className="bg-white dark:bg-[#161B26] px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border bg-sky-50 dark:bg-sky-500/10 border-sky-200/80 dark:border-sky-500/25 text-sky-600 dark:text-sky-400">
              {isNFT ? <Settings size={19} strokeWidth={2} /> : <Landmark size={19} strokeWidth={2} />}
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md border bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200/70 dark:border-sky-500/25">
                  {isNFT ? submission.subType?.replace(/_/g, ' ') : submission.type?.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500">
                  #{submission._id.slice(-6).toUpperCase()}
                </span>
              </div>
              <h2 className="sora-font text-base font-bold text-slate-900 dark:text-white truncate leading-snug">
                {submission.schemeName || submission.subType?.replace(/_/g, ' ')}
              </h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                {submission.client?.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="flex px-6 bg-white dark:bg-[#161B26] border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'CHECKLIST', label: 'Checklist & Status', icon: CheckCircle2 },
            { id: 'LOGISTICS', label: isNFT ? 'Details & Information' : 'Logistics & Payment', icon: isNFT ? FileText : CreditCard },
            { id: 'ACTIVITY', label: 'Activity Feed', icon: MessageCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-sky-600 text-sky-600 dark:text-sky-300 dark:border-sky-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* TAB WORKSPACE CONTENT */}
        <div className="flex-1 overflow-hidden flex flex-col">

          {/* TAB 1: CHECKLIST & STATUS */}
          {activeTab === 'CHECKLIST' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar text-left">

              {/* Financial Inflow Card */}
              {!isNFT ? (
                <div className="p-4 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Transaction Amount
                    </span>
                    <p className={`sora-font text-xl md:text-2xl font-bold tabular-nums tracking-tight mt-0.5 ${
                      submission.type === 'REDEMPTION' || submission.type === 'SWP'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-sky-600 dark:text-sky-300'
                    }`}>
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(submission.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Payment Status
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                      submission.paymentStatus === 'PAID' || submission.paymentStatus === 'VERIFIED'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-500/25'
                        : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-500/25'
                    }`}>
                      {submission.paymentStatus}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-sky-50/70 dark:bg-sky-500/10 border border-sky-200/80 dark:border-sky-500/25 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                      Service Request Item
                    </span>
                    <p className="sora-font text-base md:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {submission.subType?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <FileText className="text-sky-500 dark:text-sky-400 opacity-40" size={26} />
                </div>
              )}

              {/* Status Switcher Grid */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Status Stage
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'PENDING', label: 'Pending', active: 'bg-amber-500 text-white border-amber-500' },
                    { id: 'SUBMITTED', label: 'Submitted', active: 'bg-sky-600 text-white border-sky-600' },
                    { id: 'REJECTED', label: 'Rejected', active: 'bg-rose-600 text-white border-rose-600' },
                    { id: 'SETTLED', label: 'Settled', active: 'bg-emerald-600 text-white border-emerald-600' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleUpdate({ status: s.id })}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        submission.status === s.id
                          ? s.active
                          : 'bg-white dark:bg-[#161B26] border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rejection Diagnostics (Conditional) */}
              {submission.status === 'REJECTED' && (
                <div className="p-4 bg-rose-50/60 dark:bg-rose-500/10 border border-rose-200/80 dark:border-rose-500/25 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-semibold uppercase text-[11px] tracking-wider">
                    <ShieldAlert size={15} strokeWidth={2.2} /> Rejection Details
                  </div>
                  <CustomSelect
                    label="Reason Category"
                    value={submission.rejectionReason}
                    options={[
                      { value: 'KYC_INCOMPLETE', label: 'KYC Incomplete' },
                      { value: 'SIGNATURE_MISMATCH', label: 'Signature Mismatch' },
                      { value: 'BANK_REJECTED', label: 'Bank Rejected' },
                      { value: 'INFO_MISMATCH', label: 'Info Mismatch' },
                      { value: 'OTHER', label: 'Other Reason' }
                    ]}
                    onChange={(val) => handleUpdate({ rejectionReason: val })}
                    placeholder="Choose reason..."
                  />
                  <textarea
                    placeholder="Log technical discrepancy details..."
                    className="w-full h-20 bg-white dark:bg-[#1C2230] border border-rose-200 dark:border-slate-700/80 rounded-lg p-3 text-xs outline-none focus:border-rose-500 transition-colors resize-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    defaultValue={submission.rejectionNotes}
                    onBlur={(e) => handleUpdate({ rejectionNotes: e.target.value })}
                  />
                </div>
              )}

              {/* Interactive Checklist Protocol */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Process Checklist ({submission.checklist?.filter(c => c.isCompleted).length || 0} / {submission.checklist?.length || 0})
                  </span>
                  <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500">
                    {isChecklistComplete ? 'All Completed' : 'In Progress'}
                  </span>
                </div>

                <div className="bg-white dark:bg-[#161B26] rounded-lg border border-slate-200 dark:border-slate-800/80 divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden">
                  {submission.checklist?.map((step, idx) => (
                    <div key={step._id} className="relative group">
                      <div
                        onClick={() => handleUpdate({
                          checklist: submission.checklist.map(s => s._id === step._id
                            ? { ...s, isCompleted: !s.isCompleted, completedAt: !s.isCompleted ? new Date() : null }
                            : s
                          )
                        })}
                        className={`flex items-center gap-3.5 px-4 py-3 transition-colors cursor-pointer ${
                          step.isCompleted ? 'bg-sky-50/40 dark:bg-sky-500/5' : 'hover:bg-slate-50/80 dark:hover:bg-[#1C2230]/60'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                          step.isCompleted
                            ? 'bg-sky-600 border-sky-600 text-white'
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1C2230]'
                        }`}>
                          {step.isCompleted ? <Check size={12} strokeWidth={3} /> : <span className="text-[10px] font-mono font-semibold text-slate-400">{idx + 1}</span>}
                        </div>
                        <span className={`flex-1 text-xs font-medium ${
                          step.isCompleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {step.text}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveInsertIdx(idx + 1); }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 transition-all rounded-md cursor-pointer"
                          title="Insert step below"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {activeInsertIdx === idx + 1 && (
                        <form onSubmit={injectStep} className="p-2.5 bg-sky-50/70 dark:bg-[#1C2230] border-y border-sky-200/80 dark:border-slate-700 flex gap-2">
                          <input
                            autoFocus
                            className="flex-1 bg-white dark:bg-[#131720] border border-sky-300 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs outline-none focus:border-sky-500 text-slate-900 dark:text-white"
                            placeholder="Type step name..."
                            value={newStep}
                            onChange={(e) => setNewStep(e.target.value)}
                            onBlur={() => !newStep && setActiveInsertIdx(null)}
                          />
                          <button type="submit" className="px-3.5 bg-sky-600 text-white rounded-md text-xs font-semibold hover:bg-sky-500 cursor-pointer">
                            Add
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: LOGISTICS & FIELDS */}
          {activeTab === 'LOGISTICS' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar text-left">

              {/* Primary Key Logistics */}
              <div className="bg-white dark:bg-[#161B26] p-4 rounded-lg border border-slate-200 dark:border-slate-800/80 space-y-4">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Core Registry Identifiers
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Calendar size={11} /> Creation Date
                    </label>
                    <input
                      type="date"
                      className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg px-3.5 py-2 text-xs font-mono font-medium outline-none focus:border-sky-500 text-slate-900 dark:text-white"
                      defaultValue={formatDateForInput(submission.creationDate)}
                      onBlur={(e) => handleUpdate({ creationDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Hash size={11} /> {isNFT ? 'RTA Request Number' : 'RTA Confirmation ID'}
                    </label>
                    <input
                      className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg px-3.5 py-2 text-xs font-mono font-medium uppercase outline-none focus:border-sky-500 text-slate-900 dark:text-white"
                      placeholder="RTA Ref..."
                      defaultValue={submission.rtaReference}
                      onBlur={(e) => handleUpdate({ rtaReference: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Database size={11} /> Folio Account Number
                    </label>
                    <input
                      className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg px-3.5 py-2 text-xs font-mono font-semibold uppercase outline-none focus:border-sky-500 text-slate-900 dark:text-white"
                      defaultValue={submission.folioNumber}
                      onBlur={(e) => handleUpdate({ folioNumber: e.target.value })}
                    />
                  </div>

                  {!isNFT && (
                    <div className="space-y-1.5">
                      <CustomSelect
                        label="Settlement Status"
                        value={submission.paymentStatus}
                        options={[
                          { value: 'WAITING', label: 'Waiting' },
                          { value: 'PAID', label: 'Paid' },
                          { value: 'VERIFIED', label: 'Verified' },
                          { value: 'NOT_APPLICABLE', label: 'Not Applicable' }
                        ]}
                        onChange={(val) => handleUpdate({ paymentStatus: val })}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Metadata Section */}
              <div className="bg-white dark:bg-[#161B26] rounded-lg border border-slate-200 dark:border-slate-800/80 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50/90 dark:bg-[#1C2230] border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database size={14} className="text-sky-500 dark:text-sky-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Additional Metadata Attributes
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    {Object.keys(submission.metadata || {}).length} fields
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {submission.metadata && Object.keys(submission.metadata).length > 0 ? (
                    Object.entries(submission.metadata).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between px-4 py-2.5 group hover:bg-slate-50/80 dark:hover:bg-[#1C2230]/60 transition-colors">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 w-28 truncate">
                            {key}:
                          </span>
                          <span className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                            {formatMetaValue(val)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeMetadata(key)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors cursor-pointer"
                          title="Delete field"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        No custom attributes logged
                      </p>
                    </div>
                  )}
                </div>

                {/* Add Meta Sub-Form */}
                <form onSubmit={addMetadata} className="p-3 bg-slate-50/80 dark:bg-[#1C2230]/70 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row gap-2">
                  <input
                    className="flex-1 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-xs outline-none focus:border-sky-500 text-slate-900 dark:text-white"
                    placeholder="Field name (e.g. Dispatched Date)"
                    value={newMetaKey}
                    onChange={(e) => setNewMetaKey(e.target.value)}
                  />
                  <input
                    type={isDateKey ? 'date' : 'text'}
                    className={`flex-1 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-xs outline-none focus:border-sky-500 text-slate-900 dark:text-white ${isDateKey ? 'font-mono' : ''}`}
                    placeholder={isDateKey ? '' : 'Field value'}
                    value={newMetaValue}
                    onChange={(e) => setNewMetaValue(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!newMetaKey || !newMetaValue}
                    className="px-4 py-2 bg-sky-600 disabled:opacity-40 text-white rounded-lg text-xs font-semibold hover:bg-sky-500 transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Add Field
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 3: ACTIVITY FEED */}
          {activeTab === 'ACTIVITY' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-[#131720]">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {submission.auditTrail?.map((log, i) => (
                  <div key={i} className={`flex flex-col ${log.action === 'NOTE' ? 'items-end' : 'items-center'}`}>
                    {log.action !== 'NOTE' ? (
                      <div className="w-full flex items-center gap-3 py-1.5">
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                        <div className="flex items-center gap-1.5 bg-white dark:bg-[#161B26] px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <Activity size={11} className="text-sky-500 dark:text-sky-400" />
                          <span>{log.action?.replace(/_/g, ' ')}</span>
                          {log.note && <span className="font-normal text-slate-400 dark:text-slate-500">— {log.note}</span>}
                        </div>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                      </div>
                    ) : (
                      <div className="max-w-[85%] space-y-1">
                        <div className="bg-white dark:bg-[#161B26] p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 border-l-4 border-l-sky-500">
                          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                            "{log.note}"
                          </p>
                        </div>
                        <div className="flex justify-end gap-2 px-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                          <span>{log.performedBy?.name || 'Authorized User'}</span>
                          <span>•</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Feed Input Bar */}
              <div className="p-4 bg-white dark:bg-[#161B26] border-t border-slate-200 dark:border-slate-800">
                <form onSubmit={postComment} className="relative flex items-center">
                  <input
                    className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg pl-3.5 pr-20 py-2.5 text-xs outline-none focus:border-sky-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="Log an internal note..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!comment.trim()}
                    className="absolute right-1.5 px-3 py-1.5 bg-sky-600 disabled:opacity-40 text-white rounded-md text-xs font-semibold hover:bg-sky-500 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* WORKSPACE FOOTER */}
        <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B26] shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const msg = `*Update for ${submission.client?.name}*\n${submission.schemeName || submission.subType} is currently ${submission.status}.`;
                  navigator.clipboard.writeText(msg);
                  toast.success("Summary Copied to Clipboard");
                }}
                className="p-2.5 bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors cursor-pointer"
                title="Copy client summary"
              >
                <Share2 size={16} />
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2.5 bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                title="Delete submission"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <button
              disabled={!canFulfill || apiLoading || isExecuting}
              onClick={executeFulfillment}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-xs tracking-wide transition-all ${
                canFulfill
                  ? 'bg-sky-600 hover:bg-sky-500 text-white active:scale-[0.99] cursor-pointer'
                  : 'bg-slate-100 dark:bg-[#1C2230] text-slate-400 dark:text-slate-500 border border-slate-200/70 dark:border-slate-800 cursor-not-allowed'
              }`}
            >
              {isExecuting || apiLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : canFulfill ? (
                <Unlock size={14} strokeWidth={2.2} />
              ) : (
                <Lock size={14} />
              )}
              <span>{canFulfill ? "Fulfill & Finalize" : "Checklist Incomplete"}</span>
            </button>
          </div>
        </div>

      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-5000 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#161B26] rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-11 h-11 bg-rose-50 dark:bg-rose-500/10 border border-rose-200/80 dark:border-rose-500/25 rounded-lg flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 className="sora-font text-base font-bold text-slate-900 dark:text-white">
                Delete Submission?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This record will be permanently purged from the registry.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-[#1C2230] text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubmissionDetail;