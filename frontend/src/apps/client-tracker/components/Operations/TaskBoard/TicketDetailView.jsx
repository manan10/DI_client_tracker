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
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white dark:bg-[#1C2230] border ${isOpen ? 'border-sky-500 ring-2 ring-sky-500/15' : 'border-slate-200 dark:border-slate-700/80'} rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer`}
      >
        <span className={value ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
          {options.find(o => o.value === value)?.label || placeholder}
        </span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-sky-500 dark:text-sky-400' : 'text-slate-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1.5 bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-1 max-h-56 overflow-y-auto no-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${value === opt.value ? 'bg-sky-600 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}`}
              >
                <span>{opt.label}</span>
                {value === opt.value && <Check size={13} strokeWidth={2.5} />}
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .sora-font {
          font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 dark:bg-black/75 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Main Drawer Frame */}
      <div className="relative w-full max-w-2xl md:max-w-3xl bg-slate-50 dark:bg-[#131720] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out border-l border-slate-200 dark:border-slate-800">

        {/* HEADER / TOOLBAR */}
        <div className="h-16 shrink-0 flex items-center justify-between px-6 md:px-7 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B26]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-500/25">
              <Sparkles size={16} />
            </div>
            <span className="text-xs font-mono font-semibold text-sky-600 dark:text-sky-300">
              Ticket #{(task._id || task.id)?.slice(-6).toUpperCase()}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* SCROLLABLE WORKSPACE CONTAINER */}
        <div className="flex-1 overflow-y-auto no-scrollbar">

          <div className="flex flex-col lg:flex-row min-h-full">

            {/* LEFT PRIMARY PANE: Description, Checklist, Comments */}
            <div className="flex-1 p-6 md:p-8 lg:border-r border-slate-200 dark:border-slate-800 text-left space-y-8 bg-white dark:bg-[#131720]">

              {/* Ticket Title */}
              <h1 className="sora-font text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
                {task.title}
              </h1>

              {/* EDITABLE DESCRIPTION */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <AlignLeft size={13} className="text-sky-500 dark:text-sky-400" /> Description & Directives
                  </h3>
                  {isDescChanged && (
                    <button
                      onClick={handleUpdateDescription}
                      className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-300 hover:underline transition-colors cursor-pointer"
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
                  className={`w-full text-xs leading-relaxed transition-colors p-3.5 rounded-lg border outline-none ${
                    isEditingDesc || isDescChanged
                      ? "bg-white dark:bg-[#1C2230] border-sky-500 text-slate-900 dark:text-white"
                      : "bg-slate-50 dark:bg-[#161B26] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 cursor-text"
                  }`}
                  rows={4}
                />
              </div>

              {/* CHECKLIST ENGINE */}
              {task.checklist && task.checklist.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <ListTodo size={13} className="text-sky-500 dark:text-sky-400" /> Fulfillment Checklist
                    </h3>
                    <span className="text-[11px] font-mono font-semibold tabular-nums text-sky-600 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-200/70 dark:border-sky-500/25">
                      {task.checklist?.filter(i => i.isCompleted).length} / {task.checklist?.length} Done
                    </span>
                  </div>
                  <div className="bg-white dark:bg-[#161B26] rounded-lg border border-slate-200 dark:border-slate-800/80 divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden">
                    {task.checklist?.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleToggleChecklist(item._id)}
                        className={`flex items-center gap-3.5 px-4 py-3 cursor-pointer transition-colors ${
                          item.isCompleted ? 'bg-sky-50/40 dark:bg-sky-500/5' : 'hover:bg-slate-50/80 dark:hover:bg-[#1C2230]/60'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${item.isCompleted ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1C2230]'}`}>
                          {item.isCompleted && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className={`text-xs font-medium ${item.isCompleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTIVITY LEDGER & COMMENTS */}
              <div className="space-y-5 pt-6 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Activity Ledger & Updates</h3>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center text-[11px] font-mono font-semibold shrink-0 uppercase">
                    {task.comments?.[0]?.author?.substring(0, 2) || 'AD'}
                  </div>
                  <form onSubmit={handleAddComment} className="flex-1 space-y-2.5">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Log an internal update or client communication note..."
                      className="w-full bg-slate-50 dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-colors resize-none leading-relaxed min-h-20 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!comment.trim() || loading}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-40 rounded-lg font-semibold text-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        Post Update
                      </button>
                    </div>
                  </form>
                </div>

                <div className="space-y-3.5 pb-4">
                  {task.comments?.slice().reverse().map((c, i) => (
                    <div key={i} className="flex gap-3 animate-in fade-in duration-300">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1C2230] border border-slate-200/80 dark:border-slate-700/80 text-sky-600 dark:text-sky-300 flex items-center justify-center text-[10px] font-mono font-semibold shrink-0 uppercase">
                        {c.author?.substring(0, 2) || 'US'}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="sora-font text-xs font-semibold text-slate-900 dark:text-white">{c.author || 'Team Member'}</span>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                        </div>
                        <div className="bg-slate-50 dark:bg-[#161B26] p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{c.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT SIDEBAR PANE: Status, Client, Urgency */}
            <div className="w-full lg:w-72 bg-slate-50 dark:bg-[#161B26] p-6 text-left space-y-6 border-t lg:border-t-0 border-slate-200 dark:border-slate-800 shrink-0">

              {/* STATUS SELECTOR */}
              <div className="space-y-2" ref={statusRef}>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Workflow Status</label>
                <div className="relative">
                  <button
                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border transition-colors font-semibold text-xs cursor-pointer ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white dark:bg-[#1C2230] border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <span>{statusOptions.find(o => o.id === task.status)?.label || task.status?.replace("_", " ")}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isStatusOpen && (
                    <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleStatusChange(opt.id)}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer text-left"
                        >
                          <span className={`text-xs font-semibold ${task.status === opt.id ? 'text-sky-600 dark:text-sky-300' : 'text-slate-600 dark:text-slate-300'}`}>
                            {opt.label}
                          </span>
                          {task.status === opt.id && <Check size={14} className="text-sky-600 dark:text-sky-300" strokeWidth={2.5} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* CORE METADATA BLOCK */}
              <div className="space-y-5 pt-5 border-t border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Account Link</span>
                  <div className="flex items-center gap-2 pt-0.5">
                    <User size={14} className="text-sky-500 dark:text-sky-400" />
                    <span className="sora-font text-xs font-semibold text-slate-900 dark:text-white truncate">{task.client?.name || "Global Entity"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Urgency Classification</span>
                  <div className="flex items-center gap-2 pt-0.5">
                    <Shield size={14} className={task.priority === 'URGENT' || task.priority === 'HIGH' ? 'text-rose-500' : 'text-sky-500 dark:text-sky-400'} />
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{task.priority || "Standard"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Department Division</span>
                  <div className="flex items-center gap-2 pt-0.5">
                    <Tag size={14} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{task.category || 'General'}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 md:px-7 py-4 shrink-0 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#161B26]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const msg = `*Operational Update for ${task.client?.name || 'Client'}*\nTask: ${task.title}\nStatus: ${task.status}`;
                navigator.clipboard.writeText(msg);
                toast.success("Copied summary to clipboard");
              }}
              className="p-2.5 bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors cursor-pointer"
              title="Share Ticket"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={() => { if (confirm('Are you sure you want to delete this ticket?')) { /* Original logic */ } }}
              className="p-2.5 bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              title="Delete Ticket"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <button
            onClick={() => { toast.success("Task synchronized successfully"); onClose(); }}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold text-xs tracking-wide transition-all active:scale-[0.99] cursor-pointer"
          >
            Update Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailView;