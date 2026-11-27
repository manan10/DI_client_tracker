import React, { useState, useEffect } from "react";
import {
  X, Check, Loader2, Search, Briefcase, AlignLeft, 
  ChevronRight, UserPlus, Settings, IndianRupee,
  Layers
} from "lucide-react";
import { useApi } from "../../../../../shared/hooks/useApi";
import { toast } from "sonner";

const PRIORITIES = [
  { id: "LOW", label: "Low", activeClass: "bg-slate-800 text-white dark:bg-white dark:text-slate-900", bg: "bg-slate-500" },
  { id: "MEDIUM", label: "Medium", activeClass: "bg-sky-600 text-white", bg: "bg-sky-600" },
  { id: "HIGH", label: "High", activeClass: "bg-amber-600 text-white", bg: "bg-amber-600" },
  { id: "URGENT", label: "Urgent", activeClass: "bg-rose-600 text-white", bg: "bg-rose-600" },
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .sora-font {
          font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 dark:bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-slate-50 dark:bg-[#131720] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out border-l border-slate-200 dark:border-slate-800">

        {/* Header */}
        <div className="px-6 md:px-7 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between bg-white dark:bg-[#161B26]">
          <div className="flex items-center gap-3.5">
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-500/25">
              <Layers size={18} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="sora-font text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                New{" "}
                <span className="font-normal text-sky-600 dark:text-sky-300">
                  Ticket
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Log and assign operational tasks for fulfillment.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 md:px-7 py-5 space-y-5 text-left">

          {/* Workflow Type Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Workflow Type</label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100/90 dark:bg-[#161B26] rounded-lg border border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCategory("FINANCIAL")}
                className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${category === 'FINANCIAL' ? 'bg-white dark:bg-[#1C2230] text-sky-600 dark:text-sky-300 shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <IndianRupee size={13} strokeWidth={2.2} /> Financial
              </button>
              <button
                type="button"
                onClick={() => setCategory("SERVICE")}
                className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${category === 'SERVICE' ? 'bg-white dark:bg-[#1C2230] text-sky-600 dark:text-sky-300 shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Settings size={13} strokeWidth={2.2} /> Service
              </button>
            </div>
          </div>

          {/* Account Link Selection */}
          <div className="bg-white dark:bg-[#161B26] p-4 rounded-lg border border-slate-200 dark:border-slate-800/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <UserPlus size={12} className="text-sky-500 dark:text-sky-400" strokeWidth={2.2} />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Account Link</span>
            </div>

            <div className="relative">
              <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-colors ${formData.client ? "border-sky-500 bg-sky-50/40 dark:bg-sky-500/10" : "border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#1C2230] focus-within:border-sky-500"}`}>
                {isSearching ? <Loader2 size={14} className="animate-spin text-sky-500 shrink-0" /> : <Search size={14} className="text-slate-400 shrink-0" />}
                <input
                  placeholder={formData.clientName || "Search client name or PAN..."}
                  className="bg-transparent border-none outline-none text-xs w-full text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (formData.client) setFormData({ ...formData, client: "", clientName: "" });
                  }}
                />
              </div>

              {searchTerm && !formData.client && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto">
                  {clients.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, client: c._id, clientName: c.name });
                        setSearchTerm("");
                      }}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/70 border-b last:border-0 border-slate-100 dark:border-slate-800 cursor-pointer text-left"
                    >
                      <div>
                        <div className="sora-font text-xs font-semibold text-slate-900 dark:text-white">{c.name}</div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{c.pan}</div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Task Info & Title */}
          <div className="bg-white dark:bg-[#161B26] p-4 rounded-lg border border-slate-200 dark:border-slate-800/80 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Briefcase size={12} className="text-sky-500 dark:text-sky-400" strokeWidth={2.2} />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Task Specification</span>
              </div>
              <input
                required
                placeholder="Enter operation title..."
                className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[#1C2230] transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Workflow Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${formData.category === cat ? "border-sky-300 dark:border-sky-500/40 bg-sky-50/80 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300" : "border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#1C2230] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Urgency Level</label>
              <div className="flex p-1 bg-slate-100/90 dark:bg-[#131720] rounded-lg border border-slate-200/80 dark:border-slate-800">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p.id })}
                    className={`flex-1 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${formData.priority === p.id ? p.activeClass : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions / Notes */}
          <div className="bg-white dark:bg-[#161B26] p-4 rounded-lg border border-slate-200 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <AlignLeft size={12} className="text-sky-500 dark:text-sky-400" strokeWidth={2.2} />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Instructions</span>
            </div>
            <textarea
              rows={3}
              placeholder="Enter internal process notes or client instructions..."
              className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg p-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[#1C2230] transition-colors resize-none leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 md:px-7 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#161B26] shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.client || !formData.title}
            className="bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-lg font-semibold text-xs tracking-wide disabled:opacity-35 transition-all active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            <span>{isSubmitting ? "Processing..." : "Create Ticket"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTicketPanel;