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
        className={`w-full bg-white dark:bg-slate-900/90 border ${
          isOpen 
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm' 
            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
        } rounded-md px-3.5 py-2.5 text-xs font-black uppercase flex justify-between items-center transition-all shadow-sm outline-none`}
      >
        <span className={value ? "text-slate-900 dark:text-white font-mono tracking-wider" : "text-slate-400"}>
          {formatDisplayDate(value)}
        </span>
        <Calendar size={14} className={isOpen ? "text-emerald-500" : "text-slate-400"} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 p-3.5 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-lg shadow-2xl z-120 min-w-70 animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-white/10">
            <button 
              type="button" 
              onClick={handlePrevMonth} 
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-500 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[11px] font-[1000] uppercase tracking-widest text-slate-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button 
              type="button" 
              onClick={handleNextMonth} 
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-500 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(day => (
              <div key={day} className="text-center text-[9px] font-black text-slate-400 uppercase tracking-wider">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7" />
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
                  className={`h-7 rounded text-[10px] font-bold font-mono transition-all flex items-center justify-center
                    ${isSelected 
                      ? 'bg-emerald-600 text-white font-black shadow-sm' 
                      : isToday 
                        ? 'border border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
        onClick={handleClose} 
      />

      {/* Drawer Container */}
      <div className="relative w-full sm:max-w-xl md:max-w-2xl bg-slate-50 dark:bg-[#080D1A] h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-white/10 animate-in slide-in-from-right duration-300 z-10 overflow-hidden">
        
        {/* TOP BAR / COMMAND HEADER */}
        <div className="px-6 md:px-8 py-4.5 flex justify-between items-center border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Zap size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  New <span className="text-emerald-600 dark:text-emerald-500">Submission</span>
                </h1>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live
                </span>
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                Service Entry
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleClose} 
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* SCROLLABLE FORM WORKSPACE */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 md:px-8 py-5 space-y-5 text-left no-scrollbar">
          
          {/* SECTION 1: DUAL HERO CATEGORY CARDS */}
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Step 1: Select Operation Category
            </span>
            <div className="grid grid-cols-2 gap-3">
              {/* Financial Card */}
              <button
                type="button"
                onClick={() => setCategory("FINANCIAL")}
                className={`p-3.5 rounded-lg border text-left transition-all relative overflow-hidden ${
                  category === 'FINANCIAL'
                    ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                    : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-md ${category === 'FINANCIAL' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <IndianRupee size={15} strokeWidth={2.5} />
                  </div>
                  {category === 'FINANCIAL' && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
                <p className={`text-xs font-[1000] uppercase tracking-tight ${category === 'FINANCIAL' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  Financial Transaction
                </p>
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                  SIP, Lumpsum, SWP & Redemptions
                </p>
              </button>

              {/* Service Card */}
              <button
                type="button"
                onClick={() => setCategory("SERVICE")}
                className={`p-3.5 rounded-lg border text-left transition-all relative overflow-hidden ${
                  category === 'SERVICE'
                    ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
                    : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-md ${category === 'SERVICE' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <Settings size={15} strokeWidth={2.5} />
                  </div>
                  {category === 'SERVICE' && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  )}
                </div>
                <p className={`text-xs font-[1000] uppercase tracking-tight ${category === 'SERVICE' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  Service Request
                </p>
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                  KYC, Bank change, Transmission
                </p>
              </button>
            </div>
          </div>

          {/* SECTION 2: CLIENT SELECTION */}
          <div className="bg-white dark:bg-[#0B1120] p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <User size={12} className="text-slate-400" /> Select Client
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Search</span>
            </div>

            {formData.client ? (
              /* Selected Client State (Unified, Clean Container) */
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-md shadow-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <User size={13} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase truncate">
                      {formData.clientName}
                    </span>
                    {formData.clientPan && (
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 shrink-0">
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
                  className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-200/50 dark:hover:bg-white/10 rounded transition-colors ml-2"
                  title="Change Client"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              /* Live Search Input */
              <div className="relative">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/80 focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all shadow-sm">
                  {isSearching ? (
                    <Loader2 size={14} className="animate-spin text-emerald-500 shrink-0" />
                  ) : (
                    <Search size={14} className="text-slate-400 shrink-0" />
                  )}
                  <input
                    placeholder="TYPE CLIENT NAME OR PAN..."
                    className="bg-transparent border-none outline-none text-xs font-bold w-full uppercase placeholder:text-slate-400 text-slate-900 dark:text-white tracking-tight"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {searchTerm && clients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-md shadow-2xl z-130 overflow-hidden max-h-56 overflow-y-auto">
                    {clients.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => { 
                          setFormData({ ...formData, client: c._id, clientName: c.name, clientPan: c.pan }); 
                          setSearchTerm(""); 
                        }}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 border-b border-slate-100 dark:border-white/5 last:border-0 transition-colors text-left"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-[1000] uppercase tracking-tight text-slate-900 dark:text-white truncate">{c.name}</div>
                          <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">{c.pan}</div>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 3: SPECIFICATIONS & FINANCIAL INFLOW */}
          <div className="bg-white dark:bg-[#0B1120] p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
              Step 2: Transaction Parameters
            </span>

            {/* Application Date & Type Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-20">
              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Calendar size={11} /> Application Date
                </label>
                <CustomDatePicker 
                  value={formData.creationDate}
                  onChange={(val) => setFormData({...formData, creationDate: val})}
                />
              </div>

              {/* Type Dropdown */}
              <div className="space-y-1.5 relative">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Hash size={11} /> {category === 'FINANCIAL' ? 'Transaction Type' : 'Service Type'}
                </label>
                <button 
                  type="button"
                  onClick={() => setShowTypeDrop(!showTypeDrop)}
                  className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-md px-3.5 py-2.5 text-xs font-black uppercase flex justify-between items-center shadow-sm outline-none text-slate-900 dark:text-white"
                >
                  <span className="truncate">
                    {category === 'FINANCIAL' 
                      ? FINANCIAL_TYPES.find(o => o.id === formData.type)?.label 
                      : (SERVICE_TYPES.find(o => o.id === formData.subType)?.label || "SELECT SERVICE...")}
                  </span>
                  <ChevronDown size={14} className="text-slate-400 ml-1 shrink-0" />
                </button>
                
                {showTypeDrop && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-md shadow-2xl z-120 overflow-hidden py-1 animate-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
                    {(category === 'FINANCIAL' ? FINANCIAL_TYPES : SERVICE_TYPES).map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => { 
                          if (category === 'FINANCIAL') setFormData({...formData, type: opt.id});
                          else setFormData({...formData, subType: opt.id});
                          setShowTypeDrop(false); 
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-emerald-600 hover:text-white transition-colors text-slate-700 dark:text-slate-200 flex flex-col"
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider">{opt.label}</span>
                        {opt.desc && (
                          <span className="text-[8px] opacity-70 tracking-tight">{opt.desc}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Scheme / Description Input */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Landmark size={11} /> {category === 'SERVICE' ? 'Scheme / Context Description' : 'Fund / Scheme Name'}
              </label>
              <input
                required={category === 'FINANCIAL'}
                placeholder={category === 'SERVICE' ? "E.G. ALL FOLIOS OR FOLIO NO." : "E.G. NIPPON INDIA SMALL CAP FUND"}
                className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-md px-3.5 py-2.5 text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all uppercase shadow-sm text-slate-900 dark:text-white"
                value={formData.schemeName}
                onChange={(e) => setFormData({ ...formData, schemeName: e.target.value.toUpperCase() })}
              />
            </div>

            {/* Amount & Folio Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {category === 'FINANCIAL' && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <IndianRupee size={11} /> Inflow Amount
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="0.00"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-md text-base font-[1000] outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all tabular-nums tracking-tight shadow-sm text-emerald-600 dark:text-emerald-400"
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
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Hash size={11} /> Folio Number
                </label>
                <input
                  placeholder="NEW / EXISTING..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-md text-xs font-mono font-black outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all uppercase shadow-sm text-slate-900 dark:text-white"
                  value={formData.folioNumber}
                  onChange={(e) => setFormData({ ...formData, folioNumber: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: EXECUTION LOGISTICS & PAYMENT STATUS */}
          <div className="bg-white dark:bg-[#0B1120] p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
              Step 3: Logistics & Settlement
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Submission Mode */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Send size={11} /> Submission Logistics
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, submissionMode: 'DIGITAL'})}
                    className={`py-1.5 rounded text-[9px] font-black uppercase transition-all ${
                      formData.submissionMode === 'DIGITAL'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Digital Online
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, submissionMode: 'PHYSICAL'})}
                    className={`py-1.5 rounded text-[9px] font-black uppercase transition-all ${
                      formData.submissionMode === 'PHYSICAL'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Physical Paper
                  </button>
                </div>
              </div>

              {/* Payment Mode (Financial Only) */}
              {category === 'FINANCIAL' && !formData.type.includes('REDEMPTION') && !formData.type.includes('SWP') ? (
                <div className="space-y-1.5 relative">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <CreditCard size={11} /> Payment Mode
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowPayDrop(!showPayDrop)}
                    className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-md px-3.5 py-2 text-xs font-black uppercase flex justify-between items-center shadow-sm outline-none text-slate-900 dark:text-white"
                  >
                    <span>{PAY_OPTIONS.find(o => o.id === formData.paymentMode)?.label}</span>
                    <ChevronDown size={14} className="text-slate-400 ml-1" />
                  </button>

                  {showPayDrop && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-md shadow-2xl z-120 overflow-hidden py-1 animate-in zoom-in-95 duration-150">
                      {PAY_OPTIONS.map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => { setFormData({...formData, paymentMode: opt.id}); setShowPayDrop(false); }}
                          className="w-full px-3.5 py-2 text-left text-[10px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-colors text-slate-700 dark:text-slate-200 tracking-wider"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Routing Status</label>
                  <div className="px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Direct Payout / N/A
                  </div>
                </div>
              )}
            </div>

            {/* Payment Verification Initial State */}
            {category === 'FINANCIAL' && !formData.type.includes('REDEMPTION') && !formData.type.includes('SWP') && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Initial Payment Status</span>
                <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-white/10">
                  {["WAITING", "PAID"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({...formData, paymentStatus: s})}
                      className={`px-3 py-1 rounded text-[9px] font-black uppercase transition-all ${
                        formData.paymentStatus === s 
                          ? "bg-emerald-600 text-white shadow-sm" 
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
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
            <div className="bg-slate-100/70 dark:bg-[#0B1120] p-4 rounded-lg border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                    <ShieldCheck size={14} />
                  </div>
                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                    Automation Protocol: {blueprint.name || 'Standard Flow'}
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                  {blueprint.defaultSteps?.length || 0} Steps Prepped
                </span>
              </div>

              <div className="space-y-1.5 pl-1">
                {blueprint.defaultSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-[8px] font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="uppercase tracking-tight truncate">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </form>

        {/* BOTTOM ACTION BAR */}
        <div className="p-4 md:px-8 border-t border-slate-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#0B1120] shrink-0">
          <button 
            type="button"
            onClick={handleClose} 
            className="text-[10px] font-black text-slate-400 hover:text-rose-600 uppercase tracking-widest transition-colors px-2 py-1"
          >
            Cancel & Discard
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.client || (category === 'FINANCIAL' && (!formData.schemeName || !formData.amount)) || (category === 'SERVICE' && !formData.subType)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-md transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed shadow-md outline-none"
          >
            <span className="text-xs font-[1000] uppercase tracking-widest">
              {isSubmitting ? "Committing..." : "Submit Submission"}
            </span>
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} strokeWidth={2.5} />}
          </button>
        </div>

      </div>
    </div>
  );
};

export default NewSubmission;