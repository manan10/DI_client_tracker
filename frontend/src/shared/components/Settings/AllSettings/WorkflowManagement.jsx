import React, { useState, useEffect, useCallback } from "react";
import { 
  GitBranch, Plus, Trash2, Save, Loader2, FileText, Repeat, LogOut, 
  Settings as SettingsIcon, ChevronUp, ChevronDown, AlertTriangle, 
  User, Database, X, CheckCircle2, ListOrdered
} from "lucide-react";
import { toast } from "sonner";

import { useApi } from "../../../hooks/useApi";
import PageHeader from "../../../components/Auth/PageHeader";

const WorkflowManagement = () => {
  const { request } = useApi();
  const [workflows, setWorkflows] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [draftSteps, setDraftSteps] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const TRIGGER_CONFIG = {
    PURCHASE_SIP: { label: "SIP Setup", icon: Repeat, desc: "Recurring mutual fund purchase" },
    PURCHASE_LUMPSUM: { label: "Lump Sum", icon: Database, desc: "One-time investment transaction" },
    REDEMPTION: { label: "Withdrawal", icon: LogOut, desc: "Fund redemption or payout" },
    CHANGE_OF_BANK: { label: "Bank Update", icon: SettingsIcon, desc: "Update payout bank account" },
    NEW_KYC: { label: "New Client KYC", icon: FileText, desc: "First-time investor verification" },
    PAN_KYC_UPDATE: { label: "KYC Modification", icon: User, desc: "Address or PAN updates" },
  };

  const refreshWorkflows = useCallback(async () => {
    const res = await request("/workflows");
    if (res?.success) {
      setWorkflows(res.data);
      const active = res.data.find(w => w.type === selectedType);
      if (active) setDraftSteps([...(active.defaultSteps || [])]);
    }
  }, [request, selectedType]);

  useEffect(() => {
    let mounted = true;
    const initLoad = async () => {
      const res = await request("/workflows");
      if (mounted && res?.success) {
        setWorkflows(res.data || []);
        if (res.data?.length > 0) {
          setSelectedType(res.data[0].type);
          setDraftSteps([...(res.data[0].defaultSteps || [])]);
        }
      }
      if (mounted) setIsInitialLoading(false);
    };
    initLoad();
    return () => { mounted = false; };
  }, [request]);

  const handleSelect = (wf) => {
    setSelectedType(wf.type);
    setDraftSteps([...(wf.defaultSteps || [])]);
  };

  const moveStep = (index, direction) => {
    const newSteps = [...draftSteps];
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setDraftSteps(newSteps);
  };

  const addStep = () => {
    setDraftSteps(prev => [...prev, ""]);
  };

  const updateStepText = (index, val) => {
    const newSteps = [...draftSteps];
    newSteps[index] = val;
    setDraftSteps(newSteps);
  };

  const confirmDelete = () => {
    setDraftSteps(draftSteps.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);
    toast.success("Step removed from draft");
  };

  const saveWorkflow = async () => {
    if (!selectedType) return;
    setIsSaving(true);
    const stepsToSave = draftSteps.filter(s => s.trim() !== "");
    const res = await request(`/workflows/${selectedType}`, "PATCH", { defaultSteps: stepsToSave });
    if (res?.success) {
      toast.success("Checklist saved successfully");
      await refreshWorkflows();
    } else {
      toast.error("Failed to save changes");
    }
    setIsSaving(false);
  };

  const activeWf = workflows.find(w => w.type === selectedType);
  const activeConfig = activeWf ? (TRIGGER_CONFIG[activeWf.type] || { label: activeWf.type, icon: GitBranch, desc: "Standard procedure" }) : null;

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="animate-spin text-emerald-500" size={36} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[100rem] mx-auto space-y-6 animate-in fade-in duration-300 min-w-0 pb-32">
      
      {/* Universal Page Header */}
      <PageHeader 
        title="Standard"
        accent="Checklists"
        description="Set the step-by-step checklist staff members must follow whenever a new client request or transaction is submitted."
      />

      <div className="flex flex-col lg:flex-row gap-6 items-start min-w-0">
        
        {/* LEFT NAVIGATION: Task Procedure Selector */}
        <aside className="w-full lg:w-80 shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
          <div className="col-span-full pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Select Procedure
            </span>
          </div>

          {workflows.map((wf) => {
            const config = TRIGGER_CONFIG[wf.type] || { label: wf.type.replace(/_/g, " "), icon: GitBranch, desc: "Transaction procedure" };
            const isActive = selectedType === wf.type;
            const Icon = config.icon;
            
            return (
              <button
                key={wf.type}
                type="button"
                onClick={() => handleSelect(wf)}
                className={`flex items-start gap-3.5 p-3.5 rounded-xl border-2 transition-all text-left shadow-2xs cursor-pointer active:scale-[0.99]
                  ${isActive 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm" 
                    : "bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
              >
                <div className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center transition-colors ${
                  isActive 
                    ? "bg-emerald-500 text-white" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}>
                  <Icon size={18} />
                </div>
                
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider truncate">
                    {config.label}
                  </span>
                  <span className={`text-[11px] truncate mt-0.5 ${isActive ? "text-slate-300 dark:text-slate-600" : "text-slate-400 dark:text-slate-500"}`}>
                    {wf.defaultSteps?.length || 0} checklist items
                  </span>
                </div>
              </button>
            );
          })}
        </aside>

        {/* RIGHT EDITOR PANEL: Steps Reordering & Editing */}
        <main className="flex-1 w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs flex flex-col min-h-[460px]">
          {activeWf ? (
            <>
              {/* Header Bar */}
              <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20 shrink-0">
                    <ListOrdered size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {activeConfig?.label} Checklist
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {activeConfig?.desc}
                    </p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={saveWorkflow}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-current" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Checklist</span>
                    </>
                  )}
                </button>
              </div>

              {/* Step Editor List */}
              <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-3">
                {draftSteps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-3 bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-3 shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all"
                  >
                    {/* Index & Order Buttons */}
                    <div className="flex flex-col items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-1 shrink-0">
                      <button 
                        type="button"
                        onClick={() => moveStep(idx, "UP")} 
                        disabled={idx === 0} 
                        className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-20 p-0.5 transition-colors cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <span className="text-[11px] font-mono font-bold text-slate-500 my-0.5">
                        {idx + 1}
                      </span>
                      <button 
                        type="button"
                        onClick={() => moveStep(idx, "DOWN")} 
                        disabled={idx === draftSteps.length - 1} 
                        className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-20 p-0.5 transition-colors cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    {/* Step Description Input */}
                    <div className="flex-1 min-w-0 pt-1">
                      <textarea 
                        value={step} 
                        onChange={(e) => updateStepText(idx, e.target.value)} 
                        placeholder="Describe what the employee needs to do (e.g. Check client signature on physical form)..." 
                        rows={2}
                        className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none resize-none placeholder:text-slate-400 leading-relaxed" 
                      />
                    </div>

                    {/* Delete Step Button */}
                    <button 
                      type="button"
                      onClick={() => setDeleteIndex(idx)} 
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg shrink-0 transition-colors cursor-pointer"
                      title="Delete step"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

                {draftSteps.length === 0 && (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                    <CheckCircle2 size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-semibold">No steps created yet for this checklist.</p>
                  </div>
                )}

                {/* Add Step Button */}
                <button 
                  type="button"
                  onClick={addStep} 
                  className="w-full py-3.5 border-2 border-dashed border-slate-200 hover:border-emerald-500 dark:border-white/10 dark:hover:border-emerald-400 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Plus size={16} />
                  <span>Add Checklist Step</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-12 text-center">
              <GitBranch size={32} className="mb-3 opacity-25" />
              <p className="text-xs font-bold uppercase tracking-wider">No Task Selected</p>
              <p className="text-xs mt-1 max-w-xs text-slate-500">Pick a procedure from the left side to customize its checklist.</p>
            </div>
          )}
        </main>
      </div>

      {/* DELETE STEP CONFIRMATION MODAL */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex justify-center items-start p-4 sm:p-6 sm:py-16 animate-in fade-in duration-150">
          <div onClick={() => setDeleteIndex(null)} className="fixed inset-0" />
          
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-xl text-center">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center mx-auto mb-3 border border-rose-200 dark:border-rose-500/20">
              <AlertTriangle size={22} strokeWidth={2.4} />
            </div>
            
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delete Step #{deleteIndex + 1}?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 mb-5">
              This task will be removed from the checklist once you save your changes.
            </p>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button 
                type="button"
                onClick={() => setDeleteIndex(null)} 
                className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={confirmDelete} 
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WorkflowManagement;