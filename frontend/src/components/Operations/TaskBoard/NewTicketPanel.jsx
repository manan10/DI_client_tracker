import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Loader2,
  Search,
  Briefcase,
  AlignLeft,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import { useApi } from "../../../hooks/useApi";
import { toast } from "sonner";

const PRIORITIES = [
  {
    id: "LOW",
    label: "Low",
    activeClass: "bg-slate-500 text-white shadow-md",
    bg: "bg-slate-500",
  },
  {
    id: "MEDIUM",
    label: "Medium",
    activeClass: "bg-blue-600 text-white shadow-md",
    bg: "bg-blue-600",
  },
  {
    id: "HIGH",
    label: "High",
    activeClass: "bg-orange-500 text-white shadow-md",
    bg: "bg-orange-500",
  },
  {
    id: "URGENT",
    label: "Urgent",
    activeClass: "bg-rose-600 text-white shadow-md",
    bg: "bg-rose-600",
  },
];

const CATEGORIES = [
  "Ops",
  "Advisory",
  "Compliance",
  "Banking",
  "Documentation",
];

const NewTicketPanel = ({ isOpen, onClose, onCreated }) => {
  const { request } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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
    <div className="fixed inset-0 z-2000 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-137.5 bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        {/* Header */}
        <div className="px-8 pt-10 pb-6 border-b border-slate-100 dark:border-white/5">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                New Operation
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Log a new task for service fulfillment.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 bg-slate-50 dark:bg-white/5 rounded-full text-slate-400 hover:text-rose-500 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-8 py-10 space-y-10 no-scrollbar"
        >
          {/* Client Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <UserPlus size={14} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                Account Link
              </span>
            </div>

            <div className="relative">
              <div
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${formData.client ? "border-emerald-500 bg-emerald-500/5 ring-4 ring-emerald-500/10" : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5"}`}
              >
                {isSearching ? (
                  <Loader2
                    size={18}
                    className="animate-spin text-emerald-500"
                  />
                ) : (
                  <Search size={18} className="text-slate-400" />
                )}
                <input
                  placeholder={formData.clientName || "Search Name or PAN..."}
                  className="bg-transparent border-none outline-none text-sm font-semibold w-full dark:text-white placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (formData.client)
                      setFormData({ ...formData, client: "", clientName: "" });
                  }}
                />
              </div>

              {searchTerm && !formData.client && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#1A1D23] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                  {clients.length > 0 ? (
                    clients.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            client: c._id,
                            clientName: c.name,
                          });
                          setSearchTerm("");
                        }}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b last:border-0 border-slate-100 dark:border-white/5"
                      >
                        <div className="text-left">
                          <div className="text-sm font-bold dark:text-white">
                            {c.name}
                          </div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {c.pan}
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300" />
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-sm text-slate-500 text-center italic">
                      No records found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Task Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Briefcase size={14} strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                  Task Specification
                </span>
              </div>
              <input
                required
                placeholder="Operation Title (e.g. Bank Change)"
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm font-bold dark:text-white outline-none focus:border-emerald-500 transition-all uppercase"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Category Select */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Workflow Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, category: cat })
                      }
                      className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border
                        ${
                          formData.category === cat
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* UPGRADED PRIORITY BUTTONS: Segmented Control */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Urgency Level
                </label>
                <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, priority: p.id })
                      }
                      className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2
                        ${
                          formData.priority === p.id
                            ? p.activeClass
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${formData.priority === p.id ? "bg-white" : p.bg}`}
                      />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <AlignLeft size={14} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                Instructions
              </span>
            </div>
            <textarea
              rows={4}
              placeholder="Internal process notes..."
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm font-medium dark:text-white outline-none focus:border-emerald-500 transition-all resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/30 dark:bg-white/1">
          <button
            type="button"
            onClick={handleClose}
            className="text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
          >
            Discard
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.client || !formData.title}
            className="bg-slate-900 dark:bg-white text-white dark:text-black px-12 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-95 disabled:opacity-30 transition-all flex items-center gap-3"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} strokeWidth={3} />
            )}
            {isSubmitting ? "Processing" : "Commit Entry"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTicketPanel;
