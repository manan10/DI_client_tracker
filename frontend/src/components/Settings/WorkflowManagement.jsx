import React, { useState, useEffect, useCallback } from "react";
import { 
  GitBranch, Plus, Trash2, Save, Loader2, FileText, Repeat, LogOut, Settings as SettingsIcon,
  ChevronUp, ChevronDown, AlertTriangle, User, Database, Edit3, Info
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { toast } from "sonner";

const WorkflowManagement = () => {
  const { request } = useApi();
  const [workflows, setWorkflows] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [draftSteps, setDraftSteps] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

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
    newSteps[index] = val.toUpperCase();
    setDraftSteps(newSteps);
  };

  const confirmDelete = () => {
    setDraftSteps(draftSteps.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);
    toast.success("Step removed");
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

  return (
    <div className="w-full max-w-5xl mx-auto pb-64 md:pb-12 pt-4 px-4 md:px-0 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Workflow Blueprint</h1>
        <div className="flex items-center gap-2 mt-1">
          <Info size={10} className="text-emerald-600" />
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Manage standard operating procedures</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* NAV: 3-Column Grid for Mobile, List for Desktop */}
        <aside className="w-full lg:w-72 grid grid-cols-3 lg:grid-cols-1 gap-2">
          {workflows.map((wf) => {
            const config = TRIGGER_CONFIG[wf.type] || { label: wf.type, icon: GitBranch };
            const isActive = selectedType === wf.type;
            const Icon = config.icon;
            return (
              <button
                key={wf.type}
                onClick={() => handleSelect(wf)}
                className={`flex lg:flex-row flex-col items-center justify-center lg:justify-start gap-2 p-3 rounded-lg border transition-all ${
                  isActive 
                  ? 'bg-emerald-600 text-white border-transparent ring-2 ring-emerald-500/20' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                }`}
              >
                <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${isActive ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-800'}`}>
                  <Icon size={14} />
                </div>
                <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-tight text-center lg:text-left">{config.label}</span>
              </button>
            );
          })}
        </aside>

        {/* EDITOR */}
        <main className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {activeWf ? (
            <div>
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50">
                <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Editing: {TRIGGER_CONFIG[activeWf.type]?.label}</h4>
                <button 
                  onClick={saveWorkflow}
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded text-[9px] font-black uppercase hover:bg-emerald-700 transition-all"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>

              <div className="p-4 space-y-2">
                {draftSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group hover:border-emerald-200 border border-transparent transition-all">
                    <div className="w-6 h-6 flex items-center justify-center text-[9px] font-bold text-slate-400">{idx + 1}</div>
                    <div className="flex flex-col gap-0.5">
                       <button onClick={() => moveStep(idx, 'UP')} disabled={idx === 0} className="text-slate-300 hover:text-slate-900"><ChevronUp size={10} /></button>
                       <button onClick={() => moveStep(idx, 'DOWN')} disabled={idx === draftSteps.length - 1} className="text-slate-300 hover:text-slate-900"><ChevronDown size={10} /></button>
                    </div>
                    <input 
                      value={step} 
                      onChange={(e) => updateStepText(idx, e.target.value)} 
                      className="flex-1 bg-transparent text-[10px] font-bold text-slate-900 dark:text-slate-200 outline-none uppercase" 
                    />
                    <button onClick={() => setDeleteIndex(idx)} className="text-slate-300 hover:text-rose-500"><Trash2 size={14} /></button>
                  </div>
                ))}
                <button onClick={addStep} className="w-full py-3 border border-dashed border-slate-200 rounded-lg text-[9px] font-bold uppercase text-slate-400 hover:border-emerald-500 hover:text-emerald-600">
                  + Add New Step
                </button>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              Select a task to edit
            </div>
          )}
        </main>
      </div>
      
      {/* MODALS */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-white p-6 rounded-2xl shadow-xl text-center">
            <AlertTriangle className="mx-auto text-rose-500 mb-4" size={24} />
            <p className="text-[10px] font-bold uppercase mb-6">Confirm deletion of step #{deleteIndex + 1}?</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setDeleteIndex(null)} className="py-2.5 bg-slate-100 rounded-lg text-[9px] font-bold uppercase">Cancel</button>
              <button onClick={confirmDelete} className="py-2.5 bg-rose-600 text-white rounded-lg text-[9px] font-bold uppercase">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowManagement;