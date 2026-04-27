import React, { useState, useEffect, useCallback } from "react";
import { 
  GitBranch, Plus, Trash2, Save, Loader2, CheckCircle2, 
  FileText, Repeat, Wallet, LogOut, Settings as SettingsIcon,
  ChevronRight, ChevronUp, ChevronDown, Edit3, X, AlertTriangle
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { toast } from "sonner";

const WorkflowManagement = () => {
  const { request } = useApi();
  const [workflows, setWorkflows] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [draftSteps, setDraftSteps] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Custom Modal State
  const [deleteIndex, setDeleteIndex] = useState(null);

  const TRIGGER_CONFIG = {
    PURCHASE_SIP: { label: 'SIP Plan', icon: Repeat, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    PURCHASE_LUMPSUM: { label: 'One-time Purchase', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    REDEMPTION: { label: 'Withdrawal', icon: LogOut, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    CHANGE_OF_BANK: { label: 'Bank Change', icon: SettingsIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    NEW_KYC: { label: 'New Client Registration', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    PAN_KYC_UPDATE: { label: 'Document Update', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
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
    toast.success("Step removed from draft");
  };

  const saveWorkflow = async () => {
    if (!selectedType) return;
    setIsSaving(true);
    const stepsToSave = draftSteps.filter(s => s.trim() !== "");
    const res = await request(`/workflows/${selectedType}`, "PATCH", {
      defaultSteps: stepsToSave
    });
    if (res?.success) {
      toast.success("Office Manual Updated Successfully");
      await refreshWorkflows();
    }
    setIsSaving(false);
  };

  const activeWf = workflows.find(w => w.type === selectedType);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 text-left">
      {/* HEADER */}
      <div className="border-b border-slate-100 dark:border-white/5 pb-8">
        <h3 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
          Office <span className="text-emerald-500">Manual</span>
        </h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">
          Set the standard steps for every client request
        </p>
      </div>

      {/* SIMPLE INSTRUCTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "1. Pick a Task", desc: "Select the type of request from the left list." },
          { label: "2. Organize Steps", desc: "Add, delete, or move steps in the correct order." },
          { label: "3. Save Work", desc: "Click 'Commit Blueprint' to update the master list." }
        ].map((item, i) => (
          <div key={i} className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">{item.label}</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-snug">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT NAV */}
        <aside className="w-full lg:w-80 space-y-4">
          <div className="grid grid-cols-1 gap-2">
            {workflows.map((wf) => {
              const config = TRIGGER_CONFIG[wf.type] || { label: wf.type, icon: GitBranch, color: 'text-slate-400', bg: 'bg-slate-100' };
              const isActive = selectedType === wf.type;
              return (
                <button
                  key={wf.type}
                  onClick={() => handleSelect(wf)}
                  className={`flex items-center gap-4 p-5 rounded-3xl border transition-all text-left ${
                    isActive 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-xl ring-4 ring-emerald-500/10' 
                    : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500 hover:border-emerald-500/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-emerald-500 text-white' : config.bg + ' ' + config.color}`}>
                    <config.icon size={18} strokeWidth={isActive ? 3 : 2} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-black uppercase tracking-tight">{config.label}</p>
                    <p className={`text-[8px] font-bold uppercase tracking-widest ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {wf.defaultSteps?.length || 0} Required Actions
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT EDITOR */}
        <main className="flex-1 w-full">
          {activeWf ? (
            <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6 border-b border-slate-50 dark:border-white/5 pb-10 text-left">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><Edit3 size={20} /></div>
                  <h4 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                    {TRIGGER_CONFIG[activeWf.type]?.label || activeWf.type.replace(/_/g, ' ')}
                  </h4>
                </div>
                <button 
                  onClick={saveWorkflow}
                  disabled={isSaving}
                  className="flex items-center gap-3 bg-slate-900 dark:bg-emerald-500 hover:opacity-90 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 w-full sm:w-auto justify-center"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} strokeWidth={3} />}
                  Commit Blueprint
                </button>
              </div>

              <div className="space-y-4">
                {draftSteps.map((step, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-slate-50/50 dark:bg-black/20 rounded-3xl border border-slate-100 dark:border-white/5 animate-in slide-in-from-top-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-[11px] font-black text-slate-400 border border-slate-200 dark:border-white/10 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => moveStep(idx, 'UP')} disabled={idx === 0} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-emerald-500 disabled:opacity-10 transition-all"><ChevronUp size={18} strokeWidth={3} /></button>
                        <button onClick={() => moveStep(idx, 'DOWN')} disabled={idx === draftSteps.length - 1} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-emerald-500 disabled:opacity-10 transition-all"><ChevronDown size={18} strokeWidth={3} /></button>
                      </div>
                    </div>
                    <input value={step} onChange={(e) => updateStepText(idx, e.target.value)} placeholder="ENTER ACTION (E.G. CHECK BANK ATTACHMENT)..." className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-3.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 uppercase" />
                    <button onClick={() => setDeleteIndex(idx)} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-300 hover:text-rose-500 rounded-xl border border-rose-100 dark:border-rose-500/20 transition-all"><Trash2 size={18} /></button>
                  </div>
                ))}
                <button onClick={addStep} className="w-full flex items-center justify-center gap-3 p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/2 transition-all mt-4">
                  <Plus size={20} strokeWidth={4} className="text-emerald-500" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Add Another Step</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-100 flex flex-col items-center justify-center bg-white dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem] opacity-30">
              <GitBranch size={48} strokeWidth={1} className="mb-4 text-slate-400" />
              <p className="text-[11px] font-black uppercase tracking-[0.4em]">Choose a task from the list</p>
            </div>
          )}
        </main>
      </div>

      {/* CUSTOM DELETE MODAL */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setDeleteIndex(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#0B1120] rounded-[3rem] p-10 shadow-2xl border border-slate-200 dark:border-white/5 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6">
               <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
              Remove <span className="text-rose-500">Step?</span>
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 mb-8 leading-relaxed">
              This will remove step #{deleteIndex + 1} from the blueprint.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteIndex(null)} className="flex-1 py-4 bg-slate-50 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-600/20 active:scale-95 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowManagement;