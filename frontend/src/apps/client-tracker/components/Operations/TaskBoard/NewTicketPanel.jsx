import React, { useState, useEffect } from "react";
import {
  X, Check, Loader2, Search, Briefcase, AlignLeft, 
  ChevronRight, UserPlus, Settings, IndianRupee,
  Layers
} from "lucide-react";
import { useApi } from "../../../../../shared/hooks/useApi";
import { toast } from "sonner";

const PRIORITIES = [
  { id: "LOW", label: "Low", activeClass: "bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-xs", bg: "bg-slate-500" },
  { id: "MEDIUM", label: "Medium", activeClass: "bg-blue-600 text-white shadow-xs", bg: "bg-blue-600" },
  { id: "HIGH", label: "High", activeClass: "bg-amber-600 text-white shadow-xs", bg: "bg-amber-600" },
  { id: "URGENT", label: "Urgent", activeClass: "bg-rose-600 text-white shadow-xs", bg: "bg-rose-600" },
];

const CATEGORIES = ["Ops", "Advisory", "Compliance", "Banking", "Documentation"];

const NewTicketPanel = ({ isOpen, onClose, onCreated }) => {
  const { request } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [category, setCategory] = useState("FINANCIAL");

  const [formData, setFormData] = useState({
    title: "",
    client: "",
    clientName: "",
    category: "Ops",
    priority: "MEDIUM",
    description: "",
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (isOpen && searchTerm.length > 1 && !formData.client) {
        setIsSearching(true);
        const res = await request(`/clients?search=${searchTerm}`);
        if (res?.success) setClients(res.data);
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, isOpen, request, formData.client]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client || !formData.title)
      return toast.error("Missing required fields");

    setIsSubmitting(true);
    const res = await request("/tasks", "POST", {
      title: formData.title,
      client: formData.client,
      priority: formData.priority,
      category: formData.category,
      description: formData.description,
      meta: { type: category } 
    });

    if (res?.success) {
      toast.success("Ticket generated successfully");
      onCreated(res.data);
      handleClose();
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setFormData({
      title: "",
      client: "",
      clientName: "",
      category: "Ops",
      priority: "MEDIUM",
      description: "",
    });
    setSearchTerm("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm transition-opacity" 
        onClick={handleClose} 
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl md:max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out border-l border-slate-200/80 dark:border-white/10">
        
        {/* Header */}
        <div className="px-6 md:px-8 py-6 border-b border-slate-200/80 dark:border-white/10 shrink-0 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-2xs">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-sm font-[1000] uppercase tracking-wider text-slate-900 dark:text-white">
                New Operation Ticket
              </h2>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Log and assign operational tasks for fulfillment.
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-6">
          
          {/* Workflow Type Selector */}
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Workflow Type</label>
             <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-white/10">
                <button 
                  type="button"
                  onClick={() => setCategory("FINANCIAL")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${category === 'FINANCIAL' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  <IndianRupee size={13} strokeWidth={2.5} /> Financial
                </button>
                <button 
                  type="button"
                  onClick={() => setCategory("SERVICE")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${category === 'SERVICE' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  <Settings size={13} strokeWidth={2.5} /> Service
                </button>
             </div>
          </div>

          {/* Account Link Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400 ml-1">
              <UserPlus size={13} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-wider">Account Link</span>
            </div>

            <div className="relative">
              <div className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all duration-300 ${formData.client ? "border-emerald-500 bg-emerald-50/5 dark:bg-emerald-500/5 ring-1 ring-emerald-500/20" : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/40"}`}>
                {isSearching ? <Loader2 size={16} className="animate-spin text-emerald-500" /> : <Search size={16} className="text-slate-400" />}
                <input
                  placeholder={formData.clientName || "Search Client Name or PAN..."}
                  className="bg-transparent border-none outline-none text-xs font-semibold w-full text-slate-900 dark:text-white placeholder:text-slate-400 uppercase tracking-tight"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (formData.client) setFormData({ ...formData, client: "", clientName: "" });
                  }}
                />
              </div>

              {searchTerm && !formData.client && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto">
                  {clients.map((c) => (
                    <button 
                      key={c._id} 
                      type="button" 
                      onClick={() => { 
                        setFormData({ ...formData, client: c._id, clientName: c.name }); 
                        setSearchTerm(""); 
                      }} 
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 border-b last:border-0 border-slate-100 dark:border-white/5 cursor-pointer text-left"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{c.name}</div>
                        <div className="text-[10px] font-mono font-bold text-slate-400">{c.pan}</div>
                      </div>
                      <ChevronRight size={14} className="text-slate-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Task Info & Title */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-slate-400 ml-1">
                <Briefcase size={13} strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-wider">Task Specification</span>
              </div>
              <input
                required
                placeholder="Enter operation title..."
                className="w-full bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 ring-emerald-500/20 transition-all uppercase tracking-tight"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workflow Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button 
                    key={cat} 
                    type="button" 
                    onClick={() => setFormData({ ...formData, category: cat })} 
                    className={`px-3.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${formData.category === cat ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs" : "border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Urgency Level</label>
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-white/10">
                {PRIORITIES.map((p) => (
                  <button 
                    key={p.id} 
                    type="button" 
                    onClick={() => setFormData({ ...formData, priority: p.id })} 
                    className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${formData.priority === p.id ? p.activeClass : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions / Notes */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400 ml-1">
              <AlignLeft size={13} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-wider">Instructions</span>
            </div>
            <textarea 
              rows={3} 
              placeholder="Enter internal process notes or client instructions..." 
              className="w-full bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 ring-emerald-500/20 transition-all resize-none leading-relaxed" 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 md:px-8 py-5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <button 
            type="button"
            onClick={handleClose} 
            className="text-[10px] font-extrabold text-slate-400 hover:text-rose-600 uppercase tracking-widest transition-all cursor-pointer"
          >
            Discard
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !formData.client || !formData.title} 
            className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 px-6 py-3 rounded-lg font-black text-xs uppercase tracking-widest shadow-sm disabled:opacity-30 transition-all cursor-pointer flex items-center gap-2"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            <span>{isSubmitting ? "Processing..." : "Commit Entry"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTicketPanel;