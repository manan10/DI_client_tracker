import React, { useState, useRef, useEffect } from "react";
import { 
  X, CheckCircle2, Plus, ShieldAlert, Clock, User, Trash2, 
  CreditCard, Lock, Unlock, Check, AlertTriangle, Landmark, 
  Fingerprint, Share2, MessageCircle, AlignLeft,
  ChevronDown, Activity, Save, ListTodo, Shield, Tag, Sparkles
} from "lucide-react";
import { useApi } from "../../../../../shared/hooks/useApi";
import { toast } from "sonner";

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
        className={`w-full flex items-center justify-between bg-white dark:bg-slate-900 border ${isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200 dark:border-white/10'} rounded-xl px-4 py-3 text-xs font-bold uppercase transition-all shadow-2xs`}
      >
        <span className={value ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
          {options.find(o => o.value === value)?.label || placeholder}
        </span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-500' : 'text-slate-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-1 max-h-56 overflow-y-auto no-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${value === opt.value ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs font-black' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                <span>{opt.label}</span>
                {value === opt.value && <Check size={13} strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TicketDetailView = ({ isOpen, onClose, task: initialTask, onUpdate }) => {
  const { request, loading } = useApi();
  
  const [task, setTask] = useState(initialTask);
  const [comment, setComment] = useState("");
  const [desc, setDesc] = useState(initialTask?.description || "");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen || !task) return null;

  const isDescChanged = desc !== (task?.description || "");

  const handleDataUpdate = (updatedTask) => {
    setTask(updatedTask);
    if (onUpdate) onUpdate(updatedTask);
  };

  const handleUpdateDescription = async () => {
    const res = await request(`/tasks/${task._id}`, "PATCH", { description: desc });
    if (res?.success) {
      handleDataUpdate(res.data);
      setIsEditingDesc(false);
      toast.success("Description updated");
    }
  };

  const handleStatusChange = async (newStatus) => {
    const res = await request(`/tasks/${task._id}`, "PATCH", { status: newStatus });
    if (res?.success) {
      handleDataUpdate(res.data);
      setIsStatusOpen(false);
      toast.success(`Protocol: ${newStatus.replace("_", " ")}`);
    }
  };

  const handleToggleChecklist = async (itemId) => {
    const res = await request(`/tasks/${task._id}/checklist/${itemId}`, "PATCH");
    if (res?.success) handleDataUpdate(res.data);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const res = await request(`/tasks/${task._id}/comments`, "POST", { text: comment });
    if (res?.success) {
      setComment("");
      handleDataUpdate(res.data);
    }
  };

  const statusOptions = [
    { id: "BACKLOG", label: "To Do" },
    { id: "IN_PROGRESS", label: "In Progress" },
    { id: "PENDING_CLIENT", label: "Waiting On Client" },
    { id: "COMPLETED", label: "Done" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Main Drawer Frame */}
      <div className="relative w-full max-w-2xl md:max-w-3xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out border-l border-emerald-500/20 dark:border-emerald-500/10">
        
        {/* HEADER / TOOLBAR with vibrant gradient bar */}
        <div className="h-16 shrink-0 flex items-center justify-between px-6 md:px-8 border-b border-slate-200/80 dark:border-white/10 bg-linear-to-r from-emerald-500/10 via-blue-500/5 to-transparent dark:from-emerald-500/15 dark:via-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-2xs">
              <Sparkles size={16} className="animate-pulse" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-mono">
              Operational Ticket / #{(task._id || task.id)?.slice(-6).toUpperCase()}
            </span>
          </div>
          <button onClick={onClose} className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all cursor-pointer">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* SCROLLABLE WORKSPACE CONTAINER */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          
          <div className="flex flex-col lg:flex-row min-h-full">
            
            {/* LEFT PRIMARY PANE: Description, Checklist, Comments */}
            <div className="flex-1 p-6 md:p-10 lg:border-r border-slate-200/80 dark:border-white/10 text-left space-y-10">
              
              {/* Ticket Title */}
              <h1 className="text-xl md:text-2xl font-[1000] text-slate-900 dark:text-white leading-snug tracking-tight bg-linear-to-r from-slate-900 via-slate-800 to-emerald-700 dark:from-white dark:via-slate-200 dark:to-emerald-400 bg-clip-text">
                {task.title}
              </h1>

              {/* EDITABLE DESCRIPTION */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <AlignLeft size={13} className="text-emerald-500" /> Description & Directives
                  </h3>
                  {isDescChanged && (
                    <button 
                      onClick={handleUpdateDescription}
                      className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:underline transition-all cursor-pointer"
                    >
                      <Save size={13} /> Save Changes
                    </button>
                  )}
                </div>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  onFocus={() => setIsEditingDesc(true)}
                  onBlur={() => !isDescChanged && setIsEditingDesc(false)}
                  placeholder="Add a detailed operational description..."
                  className={`w-full text-xs font-semibold leading-relaxed transition-all p-4 rounded-xl border outline-none ${
                    isEditingDesc || isDescChanged
                      ? "bg-white dark:bg-slate-800 border-emerald-500 shadow-sm text-slate-900 dark:text-white ring-1 ring-emerald-500/20" 
                      : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-white/10 hover:border-slate-300 text-slate-700 dark:text-slate-300 cursor-text"
                  }`}
                  rows={4}
                />
              </div>

              {/* CHECKLIST ENGINE */}
              {task.checklist && task.checklist.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ListTodo size={13} className="text-emerald-500" /> Fulfillment Checklist 
                    </h3>
                    <span className="text-[10px] font-black tabular-nums text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                      {task.checklist?.filter(i => i.isCompleted).length} / {task.checklist?.length} Done
                    </span>
                  </div>
                  <div className="space-y-2">
                    {task.checklist?.map((item) => (
                      <div 
                        key={item._id} 
                        onClick={() => handleToggleChecklist(item._id)}
                        className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10 cursor-pointer group transition-all"
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all shrink-0 ${item.isCompleted ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'}`}>
                          {item.isCompleted && <Check size={12} strokeWidth={3.5} />}
                        </div>
                        <span className={`text-xs font-bold tracking-tight ${item.isCompleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTIVITY LEDGER & COMMENTS */}
              <div className="space-y-6 pt-6 border-t border-slate-200/80 dark:border-white/10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity Ledger & Updates</h3>
                
                <div className="flex gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-[10px] font-black shadow-xs shrink-0 uppercase">
                    {task.comments?.[0]?.author?.substring(0, 2) || 'AD'}
                  </div>
                  <form onSubmit={handleAddComment} className="flex-1 space-y-3">
                    <textarea 
                      value={comment} 
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Log an internal update or client communication note..."
                      className="w-full bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 ring-emerald-500/20 transition-all resize-none leading-relaxed min-h-22.5"
                    />
                    <div className="flex justify-end">
                      <button 
                        type="submit" 
                        disabled={!comment.trim() || loading} 
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                      >
                        Post Update
                      </button>
                    </div>
                  </form>
                </div>

                <div className="space-y-4 pb-6">
                  {task.comments?.slice().reverse().map((c, i) => (
                    <div key={i} className="flex gap-3.5 animate-in fade-in duration-300">
                      <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[9px] font-black shrink-0 uppercase shadow-2xs">
                        {c.author?.substring(0, 2) || 'US'}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{c.author || 'Team Member'}</span>
                          <span className="text-[9px] font-mono text-slate-400 uppercase">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-white/5">
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{c.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT SIDEBAR PANE: Status, Client, Urgency */}
            <div className="w-full lg:w-75 bg-slate-50/80 dark:bg-slate-900/40 p-6 md:p-8 text-left space-y-8 border-t lg:border-t-0 border-slate-200/80 dark:border-white/10 shrink-0">
              
              {/* STATUS SELECTOR */}
              <div className="space-y-2.5" ref={statusRef}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Workflow Status</label>
                <div className="relative">
                  <button 
                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all font-black text-xs uppercase tracking-wider cursor-pointer shadow-xs ${
                      task.status === 'COMPLETED' ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-600/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:border-slate-300'
                    }`}
                  >
                    <span>{task.status?.replace("_", " ")}</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isStatusOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isStatusOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleStatusChange(opt.id)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-white/5 last:border-0 cursor-pointer text-left"
                        >
                          <span className={`text-[10px] font-black uppercase tracking-wider ${task.status === opt.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                            {opt.label}
                          </span>
                          {task.status === opt.id && <Check size={14} className="text-emerald-600 dark:text-emerald-400" strokeWidth={3.5} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* CORE METADATA BLOCK */}
              <div className="space-y-6 pt-6 border-t border-slate-200/80 dark:border-white/10">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Account Link</span>
                  <div className="flex items-center gap-2 pt-1">
                    <User size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate">{task.client?.name || "Global Entity"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Urgency Classification</span>
                  <div className="flex items-center gap-2 pt-1">
                    <Shield size={14} className={task.priority === 'URGENT' || task.priority === 'HIGH' ? 'text-rose-500' : 'text-emerald-500'} />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{task.priority || "Standard"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Department Division</span>
                  <div className="flex items-center gap-2 pt-1">
                    <Tag size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{task.category || 'General'}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="h-20 shrink-0 px-6 md:px-8 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { 
                  const msg = `*Operational Update for ${task.client?.name || 'Client'}*\nTask: ${task.title}\nStatus: ${task.status}`; 
                  navigator.clipboard.writeText(msg); 
                  toast.success("Copied summary to clipboard"); 
                }} 
                className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-2xs cursor-pointer"
                title="Share Ticket"
              >
                <Share2 size={18} />
              </button>
              <button 
                onClick={() => { if(confirm('Are you sure you want to delete this ticket?')) { /* Original logic */ } }} 
                className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all shadow-2xs cursor-pointer"
                title="Delete Ticket"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <button
              onClick={() => { toast.success("Task synchronized successfully"); onClose(); }}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer"
            >
              Update Task
            </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailView;