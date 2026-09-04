import React, { useState, useEffect, useCallback } from "react";
import { 
  GitBranch, Plus, Trash2, Save, Loader2, FileText, Repeat, LogOut, Settings as SettingsIcon,
  ChevronUp, ChevronDown, AlertTriangle, User, Database, Info, X
} from "lucide-react";
import { toast } from "sonner";

import { useApi } from '../../../../shared/hooks/useApi';

const WorkflowManagement = () => {
  const { request } = useApi();
  const [workflows, setWorkflows] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [draftSteps, setDraftSteps] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const TRIGGER_CONFIG = {
    PURCHASE_SIP: { label: 'SIP Plan', icon: Repeat },
    PURCHASE_LUMPSUM: { label: 'Lumpsum', icon: Database },
    REDEMPTION: { label: 'Withdraw', icon: LogOut },
    CHANGE_OF_BANK: { label: 'Bank Update', icon: SettingsIcon },
    NEW_KYC: { label: 'Registration', icon: FileText },
    PAN_KYC_UPDATE: { label: 'Doc Update', icon: User },
  };

  const refreshWorkflows = useCallback(async () => {
    const res = await request("/workflows");
    if (res?.success) {
      setWorkflows(res.data);
      const active = res.data.find(w => w.type === selectedType);
      if (active) setDraftSteps([...active.defaultSteps]);
    }
  }, [request, selectedType]);

  useEffect(() => {
    let mounted = true;
    const initLoad = async () => {
      const res = await request("/workflows");
      if (mounted && res?.success) {
        setWorkflows(res.data);
        if (res.data.length > 0) {
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
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setDraftSteps(newSteps);
  };

  const addStep = () => setDraftSteps(prev => [...prev, ""]);
  const updateStepText = (index, val) => {
    const newSteps = [...draftSteps];
    newSteps[index] = val;
    setDraftSteps(newSteps);
  };

  const confirmDelete = () => {
    setDraftSteps(draftSteps.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);
    toast.success("Step removed from blueprint");
  };

  const saveWorkflow = async () => {
    if (!selectedType) return;
    setIsSaving(true);
    const stepsToSave = draftSteps.filter(s => s.trim() !== "");
    const res = await request(`/workflows/${selectedType}`, "PATCH", { defaultSteps: stepsToSave });
    if (res?.success) {
      toast.success("Blueprint saved successfully");
      await refreshWorkflows();
    }
    setIsSaving(false);
  };

  const activeWf = workflows.find(w => w.type === selectedType);

  if (isInitialLoading) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="w-full pb-32 space-y-6 animate-in fade-in duration-300">
      
      {/* Mobile-Only Header */}
      <div className="lg:hidden border-b border-slate-200 dark:border-white/5 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">Workflow Engine</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage standard operating procedures.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* NAV: Flexible Grid for Mobile, Vertical List for Desktop */}
        <aside className="w-full lg:w-72 shrink-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-2">
          {workflows.map((wf) => {
            const config = TRIGGER_CONFIG[wf.type] || { label: wf.type, icon: GitBranch };
            const isActive = selectedType === wf.type;
            const Icon = config.icon;
            return (
              <button
                key={wf.type}
                onClick={() => handleSelect(wf)}
                className={`flex items-center gap-3 p-3 rounded-md border transition-all text-left shadow-sm
                  ${isActive 
                    ? 'bg-emerald-600 text-white border-emerald-600' 
                    : 'bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                  }`}
              >
                <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center transition-colors
                  ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <Icon size={16} />
                </div>
                <div className="flex flex-col min-w-0">
                   <span className="text-xs font-bold uppercase tracking-wider truncate">{config.label}</span>
                   <span className={`text-[9px] font-medium truncate ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                     {wf.defaultSteps?.length || 0} Steps Configured
                   </span>
                </div>
              </button>
            );
          })}
        </aside>

        {/* EDITOR PANELS */}
        <main className="flex-1 w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-md overflow-hidden shadow-sm flex flex-col min-h-125">
          {activeWf ? (
            <>
              {/* Header Bar */}
              <div className="px-5 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                   <GitBranch size={18} className="text-emerald-600 dark:text-emerald-500" />
                   <div>
                     <h4 className="text-sm font-black uppercase tracking-wider">{TRIGGER_CONFIG[activeWf.type]?.label}</h4>
                     <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Execution Blueprint</p>
                   </div>
                </div>
                <button 
                  onClick={saveWorkflow}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>

              {/* Step Editor List */}
              <div className="p-5 flex-1 overflow-y-auto space-y-3 bg-slate-50/30 dark:bg-transparent">
                {draftSteps.map((step, idx) => (
                  <div key={idx} className="group flex items-stretch gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md p-2 shadow-sm transition-all focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                    
                    {/* Index & Controls */}
                    <div className="flex flex-col justify-between items-center bg-slate-50 dark:bg-slate-800 rounded px-1.5 py-1">
                      <button onClick={() => moveStep(idx, 'UP')} disabled={idx === 0} className="text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-30 transition-colors p-0.5"><ChevronUp size={14} /></button>
                      <span className="text-[10px] font-black text-slate-400 my-1">{idx + 1}</span>
                      <button onClick={() => moveStep(idx, 'DOWN')} disabled={idx === draftSteps.length - 1} className="text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-30 transition-colors p-0.5"><ChevronDown size={14} /></button>
                    </div>

                    {/* Text Input */}
                    <textarea 
                      value={step} 
                      onChange={(e) => updateStepText(idx, e.target.value)} 
                      placeholder="Enter task instructions..."
                      rows={2}
                      className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none resize-none pt-2 placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                    />

                    {/* Delete Control */}
                    <div className="flex items-center pr-2">
                       <button 
                         onClick={() => setDeleteIndex(idx)} 
                         className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"
                         title="Remove Step"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                ))}

                {draftSteps.length === 0 && (
                  <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                     <GitBranch size={24} className="mx-auto mb-2 opacity-30" />
                     <p className="text-sm font-medium">No steps defined for this workflow.</p>
                  </div>
                )}

                {/* Add Step Trigger */}
                <button 
                  onClick={addStep} 
                  className="w-full py-4 mt-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-md text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add New Step
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-10 text-center">
              <GitBranch size={32} className="mb-3 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">No Workflow Selected</p>
              <p className="text-xs mt-1 max-w-xs">Select a procedure from the left menu to view and edit its standard blueprint.</p>
            </div>
          )}
        </main>
      </div>
      
      {/* DELETE CONFIRMATION MODAL */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-6 rounded-lg w-full max-w-sm shadow-xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-end mb-2">
               <button onClick={() => setDeleteIndex(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={16}/></button>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle className="text-rose-600 dark:text-rose-500" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2">Remove Step?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Are you sure you want to delete step #{deleteIndex + 1}? This change will take effect once you save the workflow.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setDeleteIndex(null)} className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-xs font-bold transition-colors">Cancel</button>
                <button onClick={confirmDelete} className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-bold transition-colors shadow-sm">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowManagement;