// src/components/Operations/Submissions/NewSubmission.jsx
import React, { useState, useEffect, useRef } from "react";
import { 
  X, Check, Loader2, Search, ChevronRight, User, 
  Landmark, IndianRupee, ShieldCheck, Hash, 
  Activity, CreditCard, Send, ChevronDown, Settings, Calendar,
  ChevronLeft, Sparkles, Building2, CheckCircle2,
  ReceiptText, ArrowRight, Zap, RefreshCw
} from "lucide-react";
import { useApi } from "../../../../../shared/hooks/useApi";
import { toast } from "sonner";

// --- CUSTOM HIGH-CONTRAST CALENDAR COMPONENT ---
const CustomDatePicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleSelectDate = (day) => {
    const selected = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), day));
    onChange(selected.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "SELECT DATE";
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  };

  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white dark:bg-[#1C2230] border ${
          isOpen
            ? 'border-sky-500 ring-2 ring-sky-500/15'
            : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
        } rounded-lg px-3.5 py-2.5 text-xs font-semibold flex justify-between items-center transition-all outline-none cursor-pointer`}
      >
        <span className={value ? "text-slate-900 dark:text-white font-mono tracking-wider" : "text-slate-400 dark:text-slate-500"}>
          {formatDisplayDate(value)}
        </span>
        <Calendar size={14} className={isOpen ? "text-sky-500 dark:text-sky-400" : "text-slate-400"} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 p-3.5 bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-120 min-w-70 animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-300 transition-colors cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="sora-font text-xs font-bold text-slate-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-300 transition-colors cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-0.5">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), day)).toISOString().split('T')[0];
              const isSelected = value === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDate(day)}
                  className={`h-8 rounded-md text-xs font-semibold font-mono transition-colors flex items-center justify-center cursor-pointer
                    ${isSelected
                      ? 'bg-sky-600 text-white'
                      : isToday
                        ? 'bg-sky-50 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/30 text-sky-600 dark:text-sky-300'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const NewSubmission = ({ isOpen, onClose, onCreated }) => {
  const { request } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [blueprint, setBlueprint] = useState(null);
  
  const [showTypeDrop, setShowTypeDrop] = useState(false);
  const [showPayDrop, setShowPayDrop] = useState(false);
  const [category, setCategory] = useState("FINANCIAL");

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    client: "",
    clientName: "",
    clientPan: "",
    creationDate: today,
    type: "PURCHASE_SIP",
    subType: "",
    schemeName: "",
    amount: "",
    folioNumber: "NEW",
    submissionMode: "DIGITAL",
    paymentMode: "UPI",
    paymentStatus: "WAITING"
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

  useEffect(() => {
    let isMounted = true;
    const syncWorkflow = async () => {
      if (!isOpen) return;
      const lookupKey = category === "SERVICE" ? formData.subType : formData.type;
      if (!lookupKey) {
        setBlueprint(null);
        return;
      }
      try {
        const res = await request(`/workflows/${lookupKey}`);
        if (res?.success && isMounted) setBlueprint(res.data);
      } catch {
        setBlueprint(null);
      }
    };
    syncWorkflow();
    return () => { isMounted = false; };
  }, [formData.type, formData.subType, category, isOpen, request]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isFinancialValid = category === "FINANCIAL" && formData.client && formData.schemeName && formData.amount;
    const isServiceValid = category === "SERVICE" && formData.client && formData.subType;

    if (!isFinancialValid && !isServiceValid) {
      return toast.error("Required fields missing");
    }

    setIsSubmitting(true);
    
    // --- PAYLOAD CLEANING ---
    const payload = { ...formData };
    delete payload.clientPan;
    
    if (category === "SERVICE") {
      payload.type = "NON_FINANCIAL";
      payload.amount = 0;
      if (!payload.schemeName) payload.schemeName = payload.subType.replace(/_/g, ' ');
    } else {
      delete payload.subType;
    }

    const res = await request("/submissions", "POST", payload);

    if (res?.success) {
      toast.success("Entry Logged Successfully");
      onCreated(res.data);
      handleClose();
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setFormData({ 
      client: "", clientName: "", clientPan: "", creationDate: today, type: "PURCHASE_SIP", subType: "",
      schemeName: "", amount: "", folioNumber: "NEW", 
      submissionMode: "DIGITAL", paymentMode: "UPI",
      paymentStatus: "WAITING"
    });
    setCategory("FINANCIAL");
    setSearchTerm("");
    setBlueprint(null);
    onClose();
  };
    
  const formatIndianNumber = (val) => {
    if (!val) return "";
    let x = val.toString().replace(/\D/g, "");
    let lastThree = x.substring(x.length - 3);
    let otherNumbers = x.substring(0, x.length - 3);
    if (otherNumbers !== "") lastThree = "," + lastThree;
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  };

  const FINANCIAL_TYPES = [
    { id: 'PURCHASE_SIP', label: 'Purchase (SIP)', desc: 'Recurring systematic investment' },
    { id: 'PURCHASE_LUMPSUM', label: 'Purchase (Lumpsum)', desc: 'One-time direct mutual fund purchase' },
    { id: 'REDEMPTION', label: 'Redemption', desc: 'Liquidating fund units into bank' },
    { id: 'SWP', label: 'Withdrawal (SWP)', desc: 'Systematic systematic outflow' }
  ];

  const SERVICE_TYPES = [
    { id: 'CHANGE_OF_CONTACT', label: 'Change Contact Detail', desc: 'Email / Mobile update' },
    { id: 'CHANGE_OF_NAME', label: 'Change of Name', desc: 'Marriage or legal name correction' },
    { id: 'CHANGE_OF_BANK', label: 'Change of Bank', desc: 'Mandate & payout account switch' },
    { id: 'UNIT_TRANSFER', label: 'Unit Transfer', desc: 'Transmission or folio transfer' },
    { id: 'MINOR_TO_MAJOR', label: 'Minor to Major', desc: 'Status shift upon age of 18' },
    { id: 'NEW_KYC', label: 'New KYC', desc: 'Fresh KRA/CKYC registration' },
    { id: 'PAN_KYC_UPDATE', label: 'PAN/KYC Update', desc: 'Aadhaar seeding or validation' },
    { id: 'OTHERS', label: 'Others', desc: 'Miscellaneous support operation' }
  ];

  const PAY_OPTIONS = [
    { id: 'UPI', label: 'UPI Instant' },
    { id: 'NET_BANKING', label: 'Net Banking' },
    { id: 'CHEQUE', label: 'Physical Cheque' },
    { id: 'MANDATE', label: 'Registered Mandate' },
    { id: 'OTHER', label: 'Direct RTGS / NEFT' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-2000 flex justify-end">
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

      {/* Drawer Container */}
      <div className="relative w-full sm:max-w-xl md:max-w-2xl bg-slate-50 dark:bg-[#131720] h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 z-10 overflow-hidden">

        {/* TOP BAR / COMMAND HEADER */}
        <div className="px-6 md:px-7 py-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B26]">
          <div className="flex items-center gap-3.5">
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-200/80 dark:border-sky-500/25 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Zap size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="sora-font text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  New{" "}
                  <span className="font-normal text-sky-600 dark:text-sky-300">
                    Submission
                  </span>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-200/70 dark:border-sky-500/25">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Log a new client financial transaction or service request
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

        {/* SCROLLABLE FORM WORKSPACE */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 md:px-7 py-5 space-y-5 text-left no-scrollbar">

          {/* SECTION 1: DUAL HERO CATEGORY CARDS */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Step 1: Operation Category
            </span>
            <div className="grid grid-cols-2 gap-3">
              {/* Financial Card */}
              <button
                type="button"
                onClick={() => setCategory("FINANCIAL")}
                className={`p-3.5 rounded-lg border text-left transition-colors relative overflow-hidden cursor-pointer ${
                  category === 'FINANCIAL'
                    ? 'bg-sky-50/80 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/40'
                    : 'bg-white dark:bg-[#161B26] border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-md border ${
                    category === 'FINANCIAL'
                      ? 'bg-sky-600 text-white border-sky-600 dark:bg-sky-500 dark:border-sky-400'
                      : 'bg-slate-50 dark:bg-[#1C2230] text-slate-500 dark:text-slate-400 border-slate-200/70 dark:border-slate-700/70'
                  }`}>
                    <IndianRupee size={15} strokeWidth={2.2} />
                  </div>
                  {category === 'FINANCIAL' && (
                    <div className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400" />
                  )}
                </div>
                <p className={`sora-font text-xs font-bold ${category === 'FINANCIAL' ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                  Financial Transaction
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  SIP, Lumpsum, SWP & Redemptions
                </p>
              </button>

              {/* Service Card */}
              <button
                type="button"
                onClick={() => setCategory("SERVICE")}
                className={`p-3.5 rounded-lg border text-left transition-colors relative overflow-hidden cursor-pointer ${
                  category === 'SERVICE'
                    ? 'bg-sky-50/80 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/40'
                    : 'bg-white dark:bg-[#161B26] border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-md border ${
                    category === 'SERVICE'
                      ? 'bg-sky-600 text-white border-sky-600 dark:bg-sky-500 dark:border-sky-400'
                      : 'bg-slate-50 dark:bg-[#1C2230] text-slate-500 dark:text-slate-400 border-slate-200/70 dark:border-slate-700/70'
                  }`}>
                    <Settings size={15} strokeWidth={2.2} />
                  </div>
                  {category === 'SERVICE' && (
                    <div className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400" />
                  )}
                </div>
                <p className={`sora-font text-xs font-bold ${category === 'SERVICE' ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                  Service Request
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  KYC, Bank change, Transmission
                </p>
              </button>
            </div>
          </div>

          {/* SECTION 2: CLIENT SELECTION */}
          <div className="bg-white dark:bg-[#161B26] p-4 rounded-lg border border-slate-200 dark:border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User size={12} className="text-sky-500 dark:text-sky-400" /> Select Client
              </span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Search</span>
            </div>

            {formData.client ? (
              /* Selected Client State */
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C2230] border border-slate-200/80 dark:border-slate-700/80 rounded-lg">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-sky-50 dark:bg-sky-500/10 border border-sky-200/70 dark:border-sky-500/25 flex items-center justify-center shrink-0">
                    <User size={13} className="text-sky-600 dark:text-sky-400" />
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="sora-font text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {formData.clientName}
                    </span>
                    {formData.clientPan && (
                      <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-[#161B26] px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-slate-700/70 shrink-0">
                        {formData.clientPan}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, client: "", clientName: "", clientPan: "" });
                    setSearchTerm("");
                  }}
                  className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md transition-colors ml-2 cursor-pointer"
                  title="Change Client"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              /* Live Search Input */
              <div className="relative">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#1C2230] focus-within:border-sky-500 focus-within:bg-white dark:focus-within:bg-[#1C2230] transition-colors">
                  {isSearching ? (
                    <Loader2 size={14} className="animate-spin text-sky-500 shrink-0" />
                  ) : (
                    <Search size={14} className="text-slate-400 shrink-0" />
                  )}
                  <input
                    placeholder="Type client name or PAN..."
                    className="bg-transparent border-none outline-none text-xs w-full placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {searchTerm && clients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-130 overflow-hidden max-h-56 overflow-y-auto">
                    {clients.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, client: c._id, clientName: c.name, clientPan: c.pan });
                          setSearchTerm("");
                        }}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/70 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors text-left cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="sora-font text-xs font-semibold text-slate-900 dark:text-white truncate">{c.name}</div>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{c.pan}</div>
                        </div>
                        <ChevronRight size={14} className="text-slate-400 shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 3: SPECIFICATIONS & FINANCIAL INFLOW */}
          <div className="bg-white dark:bg-[#161B26] p-4 rounded-lg border border-slate-200 dark:border-slate-800/80 space-y-4">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Step 2: Transaction Parameters
            </span>

            {/* Application Date & Type Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-20">
              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar size={11} /> Application Date
                </label>
                <CustomDatePicker
                  value={formData.creationDate}
                  onChange={(val) => setFormData({ ...formData, creationDate: val })}
                />
              </div>

              {/* Type Dropdown */}
              <div className="space-y-1.5 relative">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Hash size={11} /> {category === 'FINANCIAL' ? 'Transaction Type' : 'Service Type'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowTypeDrop(!showTypeDrop)}
                  className="w-full bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg px-3.5 py-2.5 text-xs font-semibold flex justify-between items-center outline-none text-slate-900 dark:text-white cursor-pointer"
                >
                  <span className="truncate">
                    {category === 'FINANCIAL'
                      ? FINANCIAL_TYPES.find(o => o.id === formData.type)?.label
                      : (SERVICE_TYPES.find(o => o.id === formData.subType)?.label || "Select service...")}
                  </span>
                  <ChevronDown size={14} className="text-slate-400 ml-1 shrink-0" />
                </button>

                {showTypeDrop && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-120 overflow-hidden py-1 animate-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
                    {(category === 'FINANCIAL' ? FINANCIAL_TYPES : SERVICE_TYPES).map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          if (category === 'FINANCIAL') setFormData({ ...formData, type: opt.id });
                          else setFormData({ ...formData, subType: opt.id });
                          setShowTypeDrop(false);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-sky-600 hover:text-white transition-colors text-slate-700 dark:text-slate-200 flex flex-col cursor-pointer"
                      >
                        <span className="text-xs font-semibold">{opt.label}</span>
                        {opt.desc && (
                          <span className="text-[10px] opacity-75">{opt.desc}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Scheme / Description Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Landmark size={11} /> {category === 'SERVICE' ? 'Scheme / Context Description' : 'Fund / Scheme Name'}
              </label>
              <input
                required={category === 'FINANCIAL'}
                placeholder={category === 'SERVICE' ? "e.g. All Folios or Folio No." : "e.g. Nippon India Small Cap Fund"}
                className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs font-medium outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[#1C2230] transition-colors uppercase text-slate-900 dark:text-white placeholder:normal-case placeholder:text-slate-400 dark:placeholder:text-slate-500"
                value={formData.schemeName}
                onChange={(e) => setFormData({ ...formData, schemeName: e.target.value.toUpperCase() })}
              />
            </div>

            {/* Amount & Folio Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {category === 'FINANCIAL' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <IndianRupee size={11} /> Amount
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="0.00"
                      className="sora-font w-full px-3.5 py-2 bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg text-base font-bold outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[#1C2230] transition-colors tabular-nums tracking-tight text-sky-600 dark:text-sky-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      value={formatIndianNumber(formData.amount)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, "");
                        if (!isNaN(rawValue)) setFormData({ ...formData, amount: rawValue });
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Hash size={11} /> Folio Number
                </label>
                <input
                  placeholder="NEW / Existing..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs font-mono font-semibold outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[#1C2230] transition-colors uppercase text-slate-900 dark:text-white placeholder:normal-case placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  value={formData.folioNumber}
                  onChange={(e) => setFormData({ ...formData, folioNumber: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: EXECUTION LOGISTICS & PAYMENT STATUS */}
          <div className="bg-white dark:bg-[#161B26] p-4 rounded-lg border border-slate-200 dark:border-slate-800/80 space-y-4">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Step 3: Logistics & Settlement
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Submission Mode */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Send size={11} /> Submission Logistics
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100/90 dark:bg-[#131720] rounded-lg border border-slate-200/80 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, submissionMode: 'DIGITAL' })}
                    className={`py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      formData.submissionMode === 'DIGITAL'
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Digital
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, submissionMode: 'PHYSICAL' })}
                    className={`py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      formData.submissionMode === 'PHYSICAL'
                        ? 'bg-amber-600 text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Physical
                  </button>
                </div>
              </div>

              {/* Payment Mode (Financial Only) */}
              {category === 'FINANCIAL' && !formData.type.includes('REDEMPTION') && !formData.type.includes('SWP') ? (
                <div className="space-y-1.5 relative">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <CreditCard size={11} /> Payment Mode
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPayDrop(!showPayDrop)}
                    className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs font-semibold flex justify-between items-center outline-none text-slate-900 dark:text-white cursor-pointer"
                  >
                    <span>{PAY_OPTIONS.find(o => o.id === formData.paymentMode)?.label}</span>
                    <ChevronDown size={14} className="text-slate-400 ml-1" />
                  </button>

                  {showPayDrop && (
                    <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-120 overflow-hidden py-1 animate-in zoom-in-95 duration-150">
                      {PAY_OPTIONS.map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => { setFormData({ ...formData, paymentMode: opt.id }); setShowPayDrop(false); }}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-sky-600 hover:text-white transition-colors text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Routing Status</label>
                  <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-[#1C2230] border border-slate-200/70 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Direct Payout / N/A
                  </div>
                </div>
              )}
            </div>

            {/* Payment Verification Initial State */}
            {category === 'FINANCIAL' && !formData.type.includes('REDEMPTION') && !formData.type.includes('SWP') && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Initial Payment Status</span>
                <div className="inline-flex p-1 bg-slate-100/90 dark:bg-[#131720] rounded-lg border border-slate-200/80 dark:border-slate-800">
                  {["WAITING", "PAID"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentStatus: s })}
                      className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                        formData.paymentStatus === s
                          ? "bg-sky-600 text-white"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5: PROTOCOL BLUEPRINT ROADMAP */}
          {blueprint && (
            <div className="bg-white dark:bg-[#161B26] p-4 rounded-lg border border-slate-200 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-sky-50 dark:bg-sky-500/10 border border-sky-200/70 dark:border-sky-500/20 text-sky-600 dark:text-sky-400">
                    <ShieldCheck size={14} />
                  </div>
                  <span className="sora-font text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Protocol: {blueprint.name || 'Standard Flow'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  {blueprint.defaultSteps?.length || 0} steps
                </span>
              </div>

              <div className="space-y-1.5 pl-1">
                {blueprint.defaultSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-md bg-slate-50 dark:bg-[#1C2230] border border-slate-200/80 dark:border-slate-700/80 text-[10px] font-mono font-semibold text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="truncate">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </form>

        {/* BOTTOM ACTION BAR */}
        <div className="p-4 md:px-7 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#161B26] shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors px-2 py-1.5 cursor-pointer"
          >
            Cancel & Discard
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.client || (category === 'FINANCIAL' && (!formData.schemeName || !formData.amount)) || (category === 'SERVICE' && !formData.subType)}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all active:scale-[0.99] disabled:opacity-35 disabled:cursor-not-allowed outline-none cursor-pointer"
          >
            <span>
              {isSubmitting ? "Submitting..." : "Submit Entry"}
            </span>
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} strokeWidth={2.2} />}
          </button>
        </div>

      </div>
    </div>
  );
};

export default NewSubmission;