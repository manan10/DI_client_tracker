import React, { useState, useRef, useEffect } from "react";
import {
  X, User, Tag, Send, History, ListTodo, 
  CheckCircle2, Loader2, Clock, Shield, 
  ChevronDown, MessageSquare, AlignLeft,
  Check, Activity, Save
} from "lucide-react";
import { useApi } from "../../../hooks/useApi";
import { toast } from "sonner";

const TicketDetailView = ({ isOpen, onClose, task: initialTask, onUpdate }) => {
  const { request, loading } = useApi();
  
  // INITIALIZE STATE DIRECTLY - No more useEffect needed here for props
  const [task, setTask] = useState(initialTask);
  const [comment, setComment] = useState("");
  const [desc, setDesc] = useState(initialTask?.description || "");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef(null);

  // You only need this Effect for the "Click Outside" logic, not for data syncing
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
    { id: "BACKLOG", label: "Backlog" },
    { id: "IN_PROGRESS", label: "In Progress" },
    { id: "PENDING_CLIENT", label: "Pending Client" },
    { id: "COMPLETED", label: "Completed" },
  ];

  return (
    <div className="fixed inset-0 z-5000 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full max-w-275 bg-white dark:bg-[#0B0C0E] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* TOOLBAR */}
        <div className="h-14 shrink-0 flex items-center justify-between px-8 border-b border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-3">
            <Activity size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
              Operational Task / {task._id?.slice(-6).toUpperCase()}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md text-slate-400 transition-colors">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* LEFT: CONTENT (70%) */}
          <div className="flex-[2.5] overflow-y-auto p-10 no-scrollbar border-r border-slate-200 dark:border-white/5 text-left">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-10 leading-tight">
              {task.title}
            </h1>

            {/* EDITABLE DESCRIPTION */}
            <div className="mb-12 group">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <AlignLeft size={14} /> Description
                </h3>
                {isDescChanged && (
                  <button 
                    onClick={handleUpdateDescription}
                    className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-600 transition-all animate-in fade-in"
                  >
                    <Save size={12} /> Save Changes
                  </button>
                )}
              </div>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                onFocus={() => setIsEditingDesc(true)}
                onBlur={() => !isDescChanged && setIsEditingDesc(false)}
                placeholder="Add a detailed description..."
                className={`w-full text-sm leading-relaxed font-medium transition-all p-4 rounded-xl border-2 outline-none ${
                  isEditingDesc || isDescChanged
                  ? "bg-white dark:bg-[#0D1117] border-emerald-500 shadow-sm text-slate-700 dark:text-slate-200" 
                  : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 cursor-text"
                }`}
                rows={4}
              />
            </div>

            {/* CHECKLIST */}
            <div className="mb-12">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <ListTodo size={14} /> Checklist ({task.checklist?.filter(i => i.isCompleted).length}/{task.checklist?.length})
              </h3>
              <div className="space-y-1">
                {task.checklist?.map((item) => (
                  <div 
                    key={item._id} 
                    onClick={() => handleToggleChecklist(item._id)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer group transition-all"
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${item.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'border-slate-300 dark:border-slate-700'}`}>
                      {item.isCompleted && <Check size={12} strokeWidth={4} />}
                    </div>
                    <span className={`text-sm font-bold ${item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIVITY LEDGER */}
            <div className="mt-16">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Activity Ledger</h3>
              
              <div className="flex gap-4 mb-10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-[10px] font-black shadow-lg shrink-0 uppercase">
                   {task.comments?.[0]?.author?.substring(0, 2) || 'AD'}
                </div>
                <form onSubmit={handleAddComment} className="flex-1 space-y-3">
                  <textarea 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Log an update..."
                    className="w-full bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-xs font-bold dark:text-white outline-none focus:border-emerald-500 transition-all min-h-30 shadow-sm resize-none"
                  />
                  <div className="flex justify-end">
                    <button type="submit" disabled={!comment.trim() || loading} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-black text-[10px] uppercase tracking-widest transition-all">
                      {loading ? <Loader2 size={12} className="animate-spin" /> : "Save Comment"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-10 pb-10">
                {task.comments?.slice().reverse().map((c, i) => (
                  <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 text-[10px] font-black shrink-0 uppercase">
                      {c.author?.substring(0, 2)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{c.author}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-white/5">
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: SIDEBAR (30%) */}
          <div className="w-full md:w-[320px] bg-slate-50 dark:bg-[#0D0E11] p-8 overflow-y-auto no-scrollbar text-left">
            <div className="space-y-8">
              
              {/* CUSTOM STATUS DROPDOWN */}
              <div className="space-y-3" ref={statusRef}>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</h3>
                <div className="relative">
                  <button 
                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all font-black text-[11px] uppercase tracking-widest ${
                      task.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white'
                    }`}
                  >
                    <span>{task.status.replace("_", " ")}</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isStatusOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isStatusOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1A1C20] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleStatusChange(opt.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-50 dark:border-white/5 last:border-0"
                        >
                          <span className={`text-[10px] font-black uppercase tracking-widest ${task.status === opt.id ? 'text-emerald-500' : 'text-slate-500'}`}>
                            {opt.label}
                          </span>
                          {task.status === opt.id && <Check size={14} className="text-emerald-500" strokeWidth={4} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* CORE INFO */}
              <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-white/5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Client</span>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-emerald-500" />
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{task.client?.name || "Global"}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Urgency</span>
                  <div className="flex items-center gap-2">
                    <Shield size={14} className={task.priority === 'HIGH' ? 'text-rose-500' : 'text-emerald-500'} />
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{task.priority || "Standard"}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Division</span>
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-slate-400" />
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{task.category}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailView;