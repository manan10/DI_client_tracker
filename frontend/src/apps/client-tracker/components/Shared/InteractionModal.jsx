import React, { useState, useEffect, useRef, Fragment } from "react";
import {
  X,
  Search,
  Mic,
  Lock,
  Check,
  Sparkles,
  Loader2,
  RotateCcw,
  Activity,
  Phone,
  MessageSquare,
  Mail,
  Users,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { useApi } from "../../../../shared/hooks/useApi";
import DateTimePicker from "./DateTimePicker";

const CHANNELS = [
  { id: "In-Person", label: "In-Person", icon: Users },
  { id: "Call", label: "Call", icon: Phone },
  { id: "WhatsApp", label: "WhatsApp", icon: MessageSquare },
  { id: "Email", label: "Email", icon: Mail },
];

const TOPIC_TAGS = ["MF", "PMS", "AIF", "SIF", "Debt", "Tax Planning"];

const InteractionModal = ({
  isOpen,
  onClose,
  onRefresh,
  initialClient,
  editingData,
}) => {
  const { request, loading } = useApi();
  const [clients, setClients] = useState([]);

  // Existing States Preserved
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [originalSummary, setOriginalSummary] = useState("");
  const dropdownRef = useRef(null);

  // Helper to get current local date and time in YYYY-MM-DDTHH:mm format
  const getNowLocal = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  // Format existing date to YYYY-MM-DDTHH:mm for datetime-local input/DateTimePicker
  const formatForDateTimeLocal = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    client: "",
    clientName: "",
    date: getNowLocal(),
    type: "In-Person",
    discussionPoints: [],
    summary: "",
    followUpRequired: false,
    followUpDate: "",
  });

  // --- PRE-POPULATION LOGIC (RELIABLE SYNC) ---
  useEffect(() => {
    if (isOpen) {
      if (editingData) {
        setFormData({
          client: editingData.client?._id || editingData.client || "",
          clientName: editingData.clientName || initialClient?.name || "",
          date: editingData.date
            ? formatForDateTimeLocal(editingData.date)
            : getNowLocal(),
          type: editingData.type || "In-Person",
          discussionPoints: editingData.discussionPoints || [],
          summary: editingData.summary || "",
          followUpRequired: editingData.followUpRequired || false,
          // Upgrade followUpDate to full datetime to support custom DateTimePicker safely
          followUpDate: editingData.followUpDate
            ? formatForDateTimeLocal(editingData.followUpDate)
            : "",
        });
        setSearchTerm(editingData.clientName || initialClient?.name || "");
      } else {
        setFormData({
          client: initialClient?._id || "",
          clientName: initialClient?.name || "",
          date: getNowLocal(),
          type: "In-Person",
          discussionPoints: [],
          summary: "",
          followUpRequired: false,
          followUpDate: "",
        });
        setSearchTerm(initialClient?.name || "");
      }
    }
  }, [isOpen, editingData, initialClient]);

  const isClientLocked = !!initialClient;

  // Fetch Clients for Search
  useEffect(() => {
    if (isOpen && !isClientLocked) {
      const fetchClients = async () => {
        try {
          const res = await request("/clients/");
          if (res && typeof res === "object") {
            const clientData = res.data || (Array.isArray(res) ? res : []);
            setClients(clientData);
          } else {
            setClients([]);
          }
        } catch (err) {
          console.error("Failed to load clients", err);
          setClients([]);
        }
      };
      fetchClients();
    }
  }, [isOpen, request, isClientLocked]);

  // Outside Click Handler for Client Search Dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const setFollowUpPresetDays = (days) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    target.setHours(11, 0, 0, 0);
    const offset = target.getTimezoneOffset() * 60000;
    const formatted = new Date(target.getTime() - offset).toISOString().slice(0, 16);
    setFormData((prev) => ({
      ...prev,
      followUpRequired: true,
      followUpDate: formatted,
    }));
  };

  const handleAiRefine = async () => {
    if (!formData.summary || formData.summary.trim().length < 5) return;
    setIsRefining(true);
    setOriginalSummary(formData.summary);
    try {
      const data = await request("/ai/refine-notes", "POST", {
        text: formData.summary,
      });
      if (data?.refinedText) {
        setFormData((prev) => ({ ...prev, summary: data.refinedText }));
      }
    } catch (err) {
      console.error("AI Refinement failed", err);
    } finally {
      setIsRefining(false);
    }
  };

  const handleUndoRefinement = () => {
    setFormData((prev) => ({ ...prev, summary: originalSummary }));
    setOriginalSummary("");
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData((prev) => ({
        ...prev,
        summary: prev.summary ? prev.summary + " " + transcript : transcript,
      }));
    };
    recognition.start();
  };

  const toggleDiscussionPoint = (point) => {
    setFormData((prev) => ({
      ...prev,
      discussionPoints: prev.discussionPoints.includes(point)
        ? prev.discussionPoints.filter((p) => p !== point)
        : [...prev.discussionPoints, point],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRefining) return;
    try {
      const { clientName: _unused, ...payload } = formData;
      const endpoint = editingData
        ? `/interactions/${editingData._id}`
        : "/interactions";
      const method = editingData ? "PUT" : "POST";

      const res = await request(endpoint, method, payload);
      if (res.success) {
        if (onRefresh) await onRefresh();
        resetAndClose();
      }
    } catch (err) {
      console.error("Submission error", err);
    }
  };

  const resetAndClose = () => {
    setOriginalSummary("");
    onClose();
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.pan?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-9999" onClose={resetAndClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-400"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="pointer-events-auto w-screen lg:w-[940px] xl:w-[1020px] max-w-full transform text-left align-middle transition-all bg-white dark:bg-[#161B26] shadow-2xl border-l border-slate-200 dark:border-slate-800/80 flex flex-col h-dvh">
                {/* --- CLEAN ENTERPRISE HEADER --- */}
                <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#161B26] flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-2.5 rounded-md shadow-xs border ${
                        editingData
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
                          : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25"
                      }`}
                    >
                      <Activity size={20} strokeWidth={2.25} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="sora-font text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                          {editingData
                            ? "Modify Interaction"
                            : "Log Interaction"}
                        </h2>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                            editingData
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25"
                              : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25"
                          }`}
                        >
                          {editingData ? "Revision Mode" : "New Entry"}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        Client Intelligence & Action Mapping
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="group flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1C2230] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
                  >
                    <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-mono font-semibold text-slate-400 bg-slate-50 dark:bg-[#131720]">
                      ESC
                    </kbd>
                    <X
                      size={20}
                      className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors"
                    />
                  </button>
                </div>

                {/* --- DUAL COLUMN WORKSPACE --- */}
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden bg-[#F6F8FB] dark:bg-[#131720]">
                    {/* LEFT COLUMN: Metadata & Configuration */}
                    <div className="w-full lg:w-[400px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#161B26]/60 p-5 sm:p-6 flex flex-col gap-5 lg:overflow-y-auto custom-scrollbar relative">
                      {/* Client Search */}
                      <div className="relative" ref={dropdownRef}>
                        <label className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          <span>
                            Client <span className="text-rose-500">*</span>
                          </span>
                          {isClientLocked && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 normal-case tracking-normal">
                              <Lock size={11} className="text-sky-500" /> Locked
                            </span>
                          )}
                        </label>
                        <div className="relative group">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                            {isClientLocked ? (
                              <Lock size={15} />
                            ) : (
                              <Search size={15} />
                            )}
                          </div>
                          <input
                            type="text"
                            disabled={isClientLocked}
                            onFocus={() => {
                              if (!isClientLocked) setIsDropdownOpen(true);
                            }}
                            className="w-full h-11 pl-10 pr-9 bg-white dark:bg-[#131720] border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 outline-none transition-all disabled:opacity-65 font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            placeholder="Search by name or PAN..."
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              setFormData((prev) => ({
                                ...prev,
                                client: "",
                                clientName: "",
                              }));
                              setIsDropdownOpen(true);
                            }}
                            required
                          />
                          {!isClientLocked && searchTerm && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearchTerm("");
                                setFormData((prev) => ({
                                  ...prev,
                                  client: "",
                                  clientName: "",
                                }));
                                setIsDropdownOpen(true);
                              }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                              title="Clear client"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>

                        {/* Custom Dropdown List */}
                        {!isClientLocked && isDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                            {filteredClients.length > 0 ? (
                              filteredClients.slice(0, 30).map((c) => (
                                <div
                                  key={c._id}
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      client: c._id,
                                      clientName: c.name,
                                    });
                                    setSearchTerm(c.name);
                                    setIsDropdownOpen(false);
                                  }}
                                  className={`px-3.5 py-2.5 hover:bg-sky-50 dark:hover:bg-sky-500/10 cursor-pointer border-b border-slate-100 dark:border-slate-800/70 last:border-0 transition-colors flex items-center justify-between gap-2 ${
                                    formData.client === c._id
                                      ? "bg-sky-50/80 dark:bg-sky-500/10"
                                      : ""
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                      {c.name}
                                    </p>
                                    <p className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mt-0.5">
                                      {c.pan || "NO PAN"}
                                    </p>
                                  </div>
                                  {formData.client === c._id && (
                                    <Check
                                      size={14}
                                      className="text-sky-600 dark:text-sky-400 shrink-0"
                                    />
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-5 text-center text-xs font-semibold text-slate-400">
                                No matching clients found.
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Date & Time */}
                      <div className="relative">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          Interaction Time{" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <DateTimePicker
                          value={formData.date}
                          onChange={(newDate) =>
                            setFormData({ ...formData, date: newDate })
                          }
                        />
                      </div>

                      {/* Channel (1-Click Segmented Grid) */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          Channel
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
                          {CHANNELS.map(({ id, label, icon: Icon }) => {
                            const isActive = formData.type === id;
                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() =>
                                  setFormData({ ...formData, type: id })
                                }
                                className={`flex items-center justify-center gap-2 h-10 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                                  isActive
                                    ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                                    : "bg-white dark:bg-[#131720] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-sky-400/60 hover:text-sky-600 dark:hover:text-sky-400"
                                }`}
                              >
                                <Icon size={14} />
                                <span>{label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Focus Topics (Pills) */}
                      <div>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          <Sparkles size={13} className="text-sky-500" />
                          Topic Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {TOPIC_TAGS.map((point) => {
                            const isSelected =
                              formData.discussionPoints.includes(point);
                            return (
                              <button
                                key={point}
                                type="button"
                                onClick={() => toggleDiscussionPoint(point)}
                                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer border ${
                                  isSelected
                                    ? "bg-sky-600 text-white shadow-sm border-sky-600"
                                    : "bg-white dark:bg-[#131720] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-sky-400/60 hover:text-sky-600 dark:hover:text-sky-300"
                                }`}
                              >
                                {point}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Follow Up Requirement */}
                      <div
                        className={`p-3.5 rounded-lg border transition-all ${
                          formData.followUpRequired
                            ? "bg-sky-500/[0.06] dark:bg-sky-500/[0.08] border-sky-500/30"
                            : "bg-white dark:bg-[#131720] border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                              Follow-Up Required
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              Schedule a reminder date
                            </span>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={formData.followUpRequired}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                followUpRequired: !formData.followUpRequired,
                              })
                            }
                            className={`relative w-12 h-6.5 rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 shrink-0 cursor-pointer ${
                              formData.followUpRequired
                                ? "bg-sky-600"
                                : "bg-slate-200 dark:bg-slate-700"
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 w-5.5 h-5.5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                                formData.followUpRequired
                                  ? "translate-x-6"
                                  : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </div>

                        {formData.followUpRequired && (
                          <div className="mt-3 pt-3 border-t border-sky-500/20 space-y-2.5 animate-in fade-in duration-200">
                            <DateTimePicker
                              value={formData.followUpDate || getNowLocal()}
                              onChange={(newDate) =>
                                setFormData({
                                  ...formData,
                                  followUpDate: newDate,
                                })
                              }
                            />
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {[
                                { label: "+3 Days", days: 3 },
                                { label: "+1 Week", days: 7 },
                                { label: "+1 Month", days: 30 },
                              ].map((preset) => (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() =>
                                    setFollowUpPresetDays(preset.days)
                                  }
                                  className="px-2 py-1 rounded-md text-[10px] font-mono font-semibold bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT COLUMN: The Summary Engine */}
                    <div className="flex-1 bg-white dark:bg-[#161B26] p-5 sm:p-6 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                          <Mic size={13} className="text-sky-500" />
                          Executive Summary & Notes{" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] font-mono text-slate-400">
                          {formData.summary.length} chars
                        </span>
                      </div>

                      {/* Integrated Focus Textarea + Bottom Toolbar */}
                      <div className="flex-1 flex flex-col rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#131720] focus-within:border-sky-500 dark:focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/15 focus-within:bg-white dark:focus-within:bg-[#131720] transition-all overflow-hidden">
                        <textarea
                          required
                          className="w-full flex-1 min-h-60 p-4 sm:p-5 bg-transparent text-sm text-slate-900 dark:text-white outline-none leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none font-normal custom-scrollbar"
                          placeholder="Detail the key takeaways, client sentiment, and required follow-up actions..."
                          value={formData.summary}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              summary: e.target.value,
                            })
                          }
                        />

                        {/* Integrated Bottom Command Bar */}
                        <div className="px-3.5 py-2.5 border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#1C2230]/70 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400 hidden sm:inline">
                            Use Voice Dictation or AI Polish to structure notes
                          </span>
                          <div className="flex items-center gap-2 ml-auto">
                            {originalSummary && !isRefining && (
                              <button
                                type="button"
                                onClick={handleUndoRefinement}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                              >
                                <RotateCcw size={13} /> Revert AI
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={handleAiRefine}
                              disabled={
                                isRefining ||
                                !formData.summary ||
                                formData.summary.trim().length < 5
                              }
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-all disabled:opacity-40 cursor-pointer"
                            >
                              {isRefining ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Sparkles size={13} />
                              )}
                              {isRefining ? "Polishing..." : "Refine Notes"}
                            </button>

                            <button
                              type="button"
                              onClick={handleVoiceInput}
                              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                                isListening
                                  ? "bg-rose-500 text-white border-rose-500 animate-pulse shadow-sm"
                                  : "bg-slate-100 dark:bg-[#131720] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                              }`}
                            >
                              <Mic size={13} />
                              {isListening ? "Recording" : "Dictate"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- STICKY FOOTER COMMAND BAR --- */}
                  <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#161B26] shrink-0 flex flex-col sm:flex-row justify-between items-center gap-3 z-20">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                      Fields marked with <span className="text-rose-500">*</span>{" "}
                      are mandatory.
                    </p>
                    <div className="flex w-full sm:w-auto items-center gap-3">
                      <button
                        type="button"
                        onClick={resetAndClose}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C2230] transition-colors outline-none cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !formData.client || isRefining}
                        className={`w-full sm:w-auto px-7 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          editingData
                            ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                            : "bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
                        }`}
                      >
                        {loading ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>
                              {editingData ? "Update Record" : "Commit Entry"}
                            </span>
                            <Check size={16} strokeWidth={2.5} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default InteractionModal;
