import React, { useState, useEffect, useRef } from "react";
import { 
  X, Check, Loader2, Search, ChevronRight, User, 
  Landmark, IndianRupee, ShieldCheck, Hash, 
  Activity, CreditCard, Send, ChevronDown, FileText, Settings, Calendar,
  ChevronLeft
} from "lucide-react";
import { useApi } from "../../../hooks/useApi";
import { toast } from "sonner";

// --- CUSTOM DATE PICKER COMPONENT ---
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
        className={`w-full bg-slate-50 dark:bg-white/5 border ${isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200 dark:border-white/10'} rounded-lg px-4 py-3 md:py-4 text-[10px] md:text-[11px] font-black uppercase flex justify-between items-center transition-all shadow-sm`}
      >
        <span className={value ? "text-slate-900 dark:text-white font-mono tracking-wider" : "text-slate-400"}>
          {formatDisplayDate(value)}
        </span>
        <Calendar size={12} md:size={14} className={isOpen ? "text-emerald-500" : "text-slate-400"} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-[#121418] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-100 min-w-65 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md text-slate-400 hover:text-emerald-500 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md text-slate-400 hover:text-emerald-500 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(day => (
              <div key={day} className="text-center text-[8px] font-black text-slate-400 uppercase">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = value === new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), day)).toISOString().split('T')[0];
              const isToday = new Date().toISOString().split('T')[0] === new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), day)).toISOString().split('T')[0];
              
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDate(day)}
                  className={`h-8 rounded-md text-[10px] font-bold font-mono transition-all flex items-center justify-center
                    ${isSelected ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                    : isToday ? 'border border-emerald-500/50 text-emerald-500' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'}`}
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
      client: "", clientName: "", creationDate: today, type: "PURCHASE_SIP", subType: "",
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
    { id: 'PURCHASE_SIP', label: 'Purchase (SIP)' },
    { id: 'PURCHASE_LUMPSUM', label: 'Purchase (Lumpsum)' },
    { id: 'REDEMPTION', label: 'Redemption' },
    { id: 'SWP', label: 'Withdrawal (SWP)' }
  ];

  const SERVICE_TYPES = [
    { id: 'CHANGE_OF_CONTACT', label: 'Change Contact Detail' },
    { id: 'CHANGE_OF_NAME', label: 'Change of Name' },
    { id: 'CHANGE_OF_BANK', label: 'Change of Bank' },
    { id: 'UNIT_TRANSFER', label: 'Unit Transfer' },
    { id: 'MINOR_TO_MAJOR', label: 'Minor to Major' },
    { id: 'NEW_KYC', label: 'New KYC' },
    { id: 'PAN_KYC_UPDATE', label: 'PAN/KYC Update' },
    { id: 'OTHERS', label: 'Others' }
  ];

  const PAY_OPTIONS = [
    { id: 'UPI', label: 'UPI' },
    { id: 'NET_BANKING', label: 'Net Banking' },
    { id: 'CHEQUE', label: 'Physical Cheque' },
    { id: 'MANDATE', label: 'Existing Mandate' },
    { id: 'OTHER', label: 'Other Channel' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-2000 flex justify-end">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={handleClose} />

      <div className="relative w-full max-w-xl md:max-w-2xl bg-white dark:bg-[#090A0C] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        
        {/* Header */}
        <div className="px-6 md:px-10 pt-8 md:pt-12 pb-6 md:pb-8 flex justify-between items-start border-b border-slate-100 dark:border-white/5">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
               <Activity size={12} md:size={14} className="text-emerald-500" />
               <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Operations Hub</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-[1000] tracking-tighter text-slate-900 dark:text-white uppercase italic">
              New <span className="text-emerald-500">Submission</span>
            </h1>
          </div>
          <button onClick={handleClose} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
            <X size={20} md:size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 md:px-10 py-6 md:py-10 space-y-8 md:space-y-10 no-scrollbar">
          
          {/* CATEGORY SELECTOR */}
          <div className="space-y-3">
             <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest block text-left ml-1">Submission Category</label>
             <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                <button 
                  type="button"
                  onClick={() => setCategory("FINANCIAL")}
                  className={`flex items-center justify-center gap-2 md:gap-3 py-2.5 md:py-3 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${category === 'FINANCIAL' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md' : 'text-slate-400'}`}
                >
                  <IndianRupee size={12} md:size={14} /> Financial
                </button>
                <button 
                  type="button"
                  onClick={() => setCategory("SERVICE")}
                  className={`flex items-center justify-center gap-2 md:gap-3 py-2.5 md:py-3 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${category === 'SERVICE' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md' : 'text-slate-400'}`}
                >
                  <Settings size={12} md:size={14} /> Service
                </button>
             </div>
          </div>

          {/* DYNAMIC LOGISTICS SELECTORS (3-Col Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-left relative z-20">
            
            {/* CUSTOM DATE SELECTION */}
            <div className="space-y-2 md:space-y-3">
              <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={10} md:size={12} strokeWidth={3} /> App Date
              </label>
              <CustomDatePicker 
                value={formData.creationDate}
                onChange={(val) => setFormData({...formData, creationDate: val})}
              />
            </div>

            {/* TYPE SELECTION */}
            <div className="space-y-2 md:space-y-3 relative">
              <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Hash size={10} md:size={12} strokeWidth={3} /> {category === 'FINANCIAL' ? 'Type' : 'Service Type'}
              </label>
              <button 
                type="button"
                onClick={() => setShowTypeDrop(!showTypeDrop)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 md:py-4 text-[10px] md:text-[11px] font-black uppercase flex justify-between items-center"
              >
                {category === 'FINANCIAL' 
                  ? FINANCIAL_TYPES.find(o => o.id === formData.type)?.label 
                  : (SERVICE_TYPES.find(o => o.id === formData.subType)?.label || "SELECT...")}
                <ChevronDown size={12} md:size={14} />
              </button>
              
              {showTypeDrop && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#121418] border border-slate-200 dark:border-white/10 rounded-lg shadow-2xl z-100 overflow-hidden py-1 animate-in zoom-in-95 duration-200">
                  {(category === 'FINANCIAL' ? FINANCIAL_TYPES : SERVICE_TYPES).map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => { 
                        if (category === 'FINANCIAL') setFormData({...formData, type: opt.id});
                        else setFormData({...formData, subType: opt.id});
                        setShowTypeDrop(false); 
                      }}
                      className="w-full px-4 py-2.5 text-left text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* MODE SELECTION */}
            <div className="space-y-2 md:space-y-3">
              <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Send size={10} md:size={12} strokeWidth={3} /> Mode
              </label>
              <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 h-10.5 md:h-12">
                {["DIGITAL", "PHYSICAL"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFormData({...formData, submissionMode: m})}
                    className={`flex-1 rounded text-[8px] md:text-[9px] font-black uppercase transition-all ${formData.submissionMode === m ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CLIENT SEARCH & SELECTION */}
          <div className="space-y-2 md:space-y-3 text-left relative z-10">
            <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User size={10} md:size={12} strokeWidth={3} /> Client Identity
            </label>
            
            {formData.client ? (
              /* --- PREMIUM POST-SELECTION LOCKED STATE --- */
              <div className="flex items-center justify-between p-4 bg-slate-900 dark:bg-white border border-slate-900 dark:border-white rounded-xl shadow-lg transition-all animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center shrink-0">
                    <Check size={18} strokeWidth={3} className="text-white dark:text-black" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-[1000] text-white dark:text-black uppercase tracking-widest truncate">
                      {formData.clientName}
                    </p>
                    <p className="text-[9px] font-black text-emerald-400 dark:text-emerald-600 uppercase tracking-widest mt-0.5">
                      Identity Confirmed
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setFormData({ ...formData, client: "", clientName: "" }); setSearchTerm(""); }}
                  className="p-3 text-slate-400 dark:text-slate-500 hover:text-rose-400 dark:hover:text-rose-500 transition-colors bg-white/5 dark:bg-black/5 rounded-lg"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>
            ) : (
              /* --- SEARCH STATE --- */
              <div className="relative">
                <div className="flex items-center gap-3 md:gap-4 px-4 py-3 md:py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/2 transition-all focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                  {isSearching ? <Loader2 size={16} className="animate-spin text-emerald-500" /> : <Search size={16} className="text-slate-300" />}
                  <input
                    placeholder="SEARCH BY NAME OR PAN..."
                    className="bg-transparent border-none outline-none text-[10px] md:text-xs font-black w-full uppercase placeholder:text-slate-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {searchTerm && clients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#121418] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2">
                    {clients.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => { setFormData({ ...formData, client: c._id, clientName: c.name }); setSearchTerm(""); }}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-50 dark:border-white/5 last:border-0 transition-colors"
                      >
                        <div className="text-left">
                          <div className="text-[11px] font-[1000] uppercase tracking-tight text-slate-800 dark:text-white">{c.name}</div>
                          <div className="text-[9px] font-mono font-bold text-slate-400 mt-0.5">{c.pan}</div>
                        </div>
                        <ChevronRight size={14} className="text-slate-300" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SPECIFICATIONS */}
          <div className="bg-slate-50 dark:bg-white/1 p-5 md:p-8 rounded-lg md:rounded-xl border border-slate-100 dark:border-white/5 space-y-4 md:space-y-6 text-left relative z-0">
            <div className="space-y-2 md:space-y-3">
              <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Landmark size={10} md:size={12} strokeWidth={3} /> 
                {category === 'SERVICE' ? 'Scheme / Context' : 'Fund Name'}
              </label>
              <input
                required={category === 'FINANCIAL'}
                placeholder={category === 'SERVICE' ? "E.G. ALL FOLIOS..." : "E.G. AXIS BLUECHIP..."}
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 md:py-4 text-[10px] md:text-xs font-black outline-none focus:border-emerald-500 transition-all uppercase"
                value={formData.schemeName}
                onChange={(e) => setFormData({ ...formData, schemeName: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-6">
                {category === 'FINANCIAL' && (
                  <div className="space-y-2 md:space-y-3 text-left">
                    <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <IndianRupee size={10} md:size={12} strokeWidth={3} /> Amount
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="0.00"
                        className="w-full px-4 py-3 md:py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-lg md:text-2xl font-[1000] outline-none focus:border-emerald-500 transition-all tabular-nums tracking-tighter"
                        value={formatIndianNumber(formData.amount)}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/,/g, "");
                          if (!isNaN(rawValue)) setFormData({ ...formData, amount: rawValue });
                        }}
                    />
                  </div>
                )}

                <div className="space-y-2 md:space-y-3 text-left">
                  <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={10} md:size={12} strokeWidth={3} /> Folio No.
                  </label>
                  <input
                    placeholder="NEW / EXISTING..."
                    className="w-full px-4 py-3 md:py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] md:text-xs font-black outline-none focus:border-emerald-500 transition-all uppercase"
                    value={formData.folioNumber}
                    onChange={(e) => setFormData({ ...formData, folioNumber: e.target.value })}
                  />
                </div>
            </div>
          </div>

          {/* PAYMENT */}
          {category === 'FINANCIAL' && !formData.type.includes('REDEMPTION') && !formData.type.includes('SWP') && (
            <div className="grid grid-cols-2 gap-4 md:gap-6 text-left relative z-10">
              <div className="space-y-2 md:space-y-3">
                <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard size={10} md:size={12} strokeWidth={3} /> Payment Mode
                </label>
                <button 
                  type="button"
                  onClick={() => setShowPayDrop(!showPayDrop)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 md:py-4 text-[10px] md:text-[11px] font-black uppercase flex justify-between items-center"
                >
                  {PAY_OPTIONS.find(o => o.id === formData.paymentMode)?.label}
                  <ChevronDown size={12} md:size={14} />
                </button>

                {showPayDrop && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#121418] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-100 overflow-hidden py-1 animate-in slide-in-from-bottom-2 duration-200">
                    {PAY_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => { setFormData({...formData, paymentMode: opt.id}); setShowPayDrop(false); }}
                        className="w-full px-5 py-3 text-left text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 md:space-y-3">
                <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Initial Status</label>
                <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 h-10.5 md:h-
                [48px]">
                  {["WAITING", "PAID"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({...formData, paymentStatus: s})}
                      className={`flex-1 rounded text-[8px] md:text-[9px] font-black uppercase transition-all ${formData.paymentStatus === s ? "bg-emerald-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BLUEPRINT PREVIEW */}
          {blueprint && (
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3 text-left">
              <div className="flex items-center justify-between px-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Protocol Blueprint</span>
                <ShieldCheck size={12} className="text-emerald-500" />
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {blueprint.defaultSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 rounded-md">
                    <span className="text-[7px] font-black text-emerald-500">{idx + 1}</span>
                    <span className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-5 md:p-10 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-white/2 shrink-0">
          <button onClick={handleClose} className="text-[9px] md:text-[10px] font-black text-slate-400 hover:text-rose-600 uppercase tracking-widest transition-all">Discard</button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.client || (category === 'FINANCIAL' && (!formData.schemeName || !formData.amount)) || (category === 'SERVICE' && !formData.subType)}
            className="group relative flex items-center gap-2 md:gap-4 bg-slate-900 dark:bg-white text-white dark:text-black px-6 md:px-12 py-3 md:py-4 rounded-lg transition-all active:scale-95 disabled:opacity-20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <div className="relative z-10 flex items-center gap-2 md:gap-3">
                <span className="text-[9px] md:text-[11px] font-[1000] uppercase tracking-widest">{isSubmitting ? "PROCESSING..." : "Submit Entry"}</span>
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={4} />}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewSubmission;