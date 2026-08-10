import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { 
  X, Check, ChevronRight, ArrowLeft, Search, 
  Wallet, ArrowRight, CornerDownRight, AlertCircle, Landmark,
  Globe, Coins, Plus
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useApi } from "../../../hooks/useApi";

const IconRenderer = ({ iconName, size = 16, className = "" }) => {
  const IconComponent = LucideIcons[iconName] || LucideIcons.Folder;
  return <IconComponent size={size} className={className} />;
};

const formatDisplayAmount = (val) => {
  if (!val) return "";
  const number = val.toString().replace(/[^0-9]/g, "");
  return new Intl.NumberFormat('en-IN').format(number);
};

const ExpenseModal = ({ isOpen, setOpen, wallets, expenseData, setExpenseData, onSubmit, loading }) => {
  const { request } = useApi();
  const isEditMode = !!expenseData?._id;

  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState("cash");
  const [categoryTree, setCategoryTree] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [localError, setLocalError] = useState("");

  const amountInputRef = useRef(null);

  // INLINE CREATION STATE
  const [isAddingParent, setIsAddingParent] = useState(false);
  const [newParentName, setNewParentName] = useState("");
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [newSubName, setNewSubName] = useState("");

  const filteredWallets = useMemo(() => ({
    cash: wallets?.filter(w => !w.isVirtual) || [],
    online: wallets?.filter(w => w.isVirtual) || []
  }), [wallets]);
  
  useEffect(() => {
      if (!isOpen) {
        const timer = setTimeout(() => {
          setSelectedParent(null);
          setSearchQuery(""); 
          setLocalError("");
          setIsAddingParent(false);
          setIsAddingSub(false);
          setNewParentName("");
          setNewSubName("");
          if (!isEditMode) {
            setExpenseData({ 
              amount: "", category: "", description: "", 
              sourceWallet: expenseData.sourceWallet, type: "DEBIT" 
            });
          }
        }, 300);
        return () => clearTimeout(timer);
      }

      setTimeout(() => {
        if (isEditMode) {
            setStep(4);
        } else {
            setStep(1);
        }

        const current = wallets?.find(w => w._id === expenseData.sourceWallet);
        if (current?.isVirtual) {
            setActiveTab("online");
        } else {
            setActiveTab("cash");
        }
      }, 0);
      
  }, [isOpen, isEditMode, expenseData.sourceWallet, wallets, setExpenseData]);

  // Smart Auto-Focus: Prevent mobile keyboard pop-up
  useEffect(() => {
    if (step === 2 && amountInputRef.current) {
      if (window.innerWidth >= 768) {
        amountInputRef.current.focus();
      }
    }
  }, [step]);
  
  const loadCategories = useCallback(async () => {
    try {
      const res = await request("/categories/tree");
      let rawData = res?.success ? res.data : Array.isArray(res) ? res : [];
      const sortedTree = rawData.sort((a, b) => a.label.localeCompare(b.label)).map(parent => ({
        ...parent, subCategories: (parent.subCategories || []).sort((a, b) => a.label.localeCompare(b.label))
      }));
      setCategoryTree(sortedTree);

      setSelectedParent(prev => {
        if (!prev) return null;
        const updatedParent = sortedTree.find(p => p._id === prev._id);
        return updatedParent || null;
      });
    } catch (err) { console.error(err); }
  }, [request]); 

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadCategories();
    }
  }, [isOpen, loadCategories]);

  // INLINE CREATION HANDLERS
  const handleCreateParent = async () => {
    if (!newParentName.trim()) { setIsAddingParent(false); return; }
    const res = await request("/categories", "POST", { label: newParentName, color: "#64748b", icon: "Folder" });
    if (res?.success) {
      await loadCategories();
      setNewParentName("");
      setIsAddingParent(false);
    } else {
      setLocalError("Failed to create category");
    }
  };

  const handleCreateSub = async () => {
    if (!newSubName.trim()) { setIsAddingSub(false); return; }
    const res = await request(`/categories/${selectedParent._id}/sub`, "POST", { label: newSubName });
    if (res?.success) {
      await loadCategories();
      setNewSubName("");
      setIsAddingSub(false);
    } else {
      setLocalError("Failed to create entry");
    }
  };

  const handleClose = () => !loading && setOpen(false);
  const nextStep = () => { setLocalError(""); setStep(prev => prev + 1); };
  const prevStep = () => { setLocalError(""); setStep(prev => prev - 1); };

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    setLocalError("");
    try { await onSubmit(e); } catch (err) { setLocalError(err.message || "Entry failed."); }
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, ""); 
    setExpenseData({ ...expenseData, amount: rawValue });
  };

  const filteredResults = useMemo(() => {
    if (!searchQuery || !categoryTree) return [];
    const results = [];
    categoryTree.forEach(parent => {
      parent.subCategories?.forEach(sub => {
        if (sub.label.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ ...sub, parentLabel: parent.label });
        }
      });
    });
    return results.sort((a, b) => a.label.localeCompare(b.label));
  }, [searchQuery, categoryTree]);

  const currentSub = useMemo(() => {
    if (!categoryTree || !expenseData.category) return null;
    return categoryTree.flatMap(p => p.subCategories || []).find(s => s._id === expenseData.category);
  }, [categoryTree, expenseData.category]);

  if (!isOpen) return null;
  const currentWallet = wallets?.find(w => w._id === expenseData.sourceWallet);

  return (
    <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 text-left">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-[#020617]/80 backdrop-blur-sm transition-opacity" onClick={handleClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0B1120] rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh] overflow-hidden border-t sm:border border-slate-200 dark:border-white/10">
        
        {/* NAV BAR */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B1120] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {[1, 2, 3, 4].map((s) => (
              <button 
                key={s} 
                disabled={(step < s && !isEditMode) || loading} 
                onClick={() => setStep(s)} 
                className={`flex items-center gap-2 transition-all outline-none ${step === s ? 'opacity-100' : 'opacity-40'}`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= s ? 'bg-emerald-600 dark:bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>{s}</span>
                {step === s && <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">{s === 1 ? "Source" : s === 2 ? "Amount" : s === 3 ? "Group" : "Details"}</span>}
              </button>
            ))}
          </div>
          <button onClick={handleClose} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-500 active:scale-95 outline-none">
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-5 sm:p-6 pb-8 sm:pb-6">
          {localError && (
            <div className="mb-5 flex items-start gap-2.5 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg">
              <AlertCircle size={14} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[10px] sm:text-xs font-semibold text-rose-700 dark:text-rose-300 leading-snug">{localError}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="text-left mb-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {isEditMode ? "Switch Source" : "Funding Source"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select the account to debit this expense from.
                </p>
              </div>

              {/* Segmented Control */}
              <div className="bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg flex gap-1 border border-slate-200 dark:border-white/5">
                <button onClick={() => setActiveTab("cash")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all outline-none ${activeTab === "cash" ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
                  <Coins size={14} /> Cash
                </button>
                <button onClick={() => setActiveTab("online")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all outline-none ${activeTab === "online" ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
                  <Globe size={14} /> Digital
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                {filteredWallets[activeTab].map(w => (
                  <button 
                    key={w._id} 
                    onClick={() => { setExpenseData({...expenseData, sourceWallet: w._id}); isEditMode ? setStep(4) : nextStep(); }} 
                    className={`flex items-center justify-between p-3.5 rounded-lg border transition-all text-left outline-none ${
                      expenseData.sourceWallet === w._id 
                        ? (w.isVirtual ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300') 
                        : 'bg-white border-slate-200 dark:bg-[#0B1120] dark:border-white/10 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden min-w-0">
                      <div className={`p-2 rounded-md shrink-0 ${expenseData.sourceWallet === w._id ? (w.isVirtual ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white') : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                        {w.isGeneralPool ? <Landmark size={16} /> : w.isVirtual ? <Globe size={16} /> : <Wallet size={16} />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate">
                          {w.walletName}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${expenseData.sourceWallet === w._id ? 'opacity-80' : 'text-slate-500'}`}>
                          {w.isVirtual ? "Linked" : "Vault"}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold tabular-nums shrink-0 pl-3">
                      {w.isVirtual ? "—" : `₹${w.balance?.toLocaleString('en-IN')}`}
                    </span>
                  </button>
                ))}
                {filteredWallets[activeTab].length === 0 && (
                   <div className="p-6 text-center text-slate-400 text-xs font-bold uppercase tracking-widest border border-dashed border-slate-200 dark:border-white/10 rounded-lg">
                      No matching accounts
                   </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 mb-2">
                 <button onClick={prevStep} className="p-1 -ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors outline-none">
                    <ArrowLeft size={16} />
                 </button>
                 <div className="flex flex-col min-w-0">
                   <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">Expense Volume</h2>
                   <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest truncate">From: {currentWallet?.walletName}</p>
                 </div>
              </div>

              <div className={`relative border-b border-slate-200 dark:border-white/10 focus-within:border-emerald-500 transition-colors pt-2`}>
                <span className="absolute left-0 bottom-3 text-2xl font-bold text-slate-400 dark:text-slate-600">₹</span>
                <input 
                  ref={amountInputRef}
                  type="text" 
                  inputMode="numeric" 
                  placeholder="0" 
                  className="w-full bg-transparent pb-3 pl-8 text-3xl sm:text-4xl font-bold tabular-nums text-slate-900 dark:text-white outline-none placeholder:text-slate-200 dark:placeholder:text-slate-800" 
                  value={formatDisplayAmount(expenseData.amount)} 
                  onChange={handleAmountChange}
                />
              </div>

              <div className="pt-2">
                <button 
                  disabled={!expenseData.amount || Number(expenseData.amount) <= 0} 
                  onClick={() => isEditMode ? setStep(4) : nextStep()} 
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-30 transition-all shadow-sm outline-none"
                >
                  {isEditMode ? "Update Details" : "Proceed"} <ArrowRight size={14} strokeWidth={2.5}/>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 flex flex-col h-full">
               
               <div className="flex items-center gap-2 mb-2 shrink-0">
                 <button 
                   onClick={() => {
                     if (isAddingSub) setIsAddingSub(false);
                     else if (isAddingParent) setIsAddingParent(false);
                     else if (searchQuery) setSearchQuery("");
                     else if (selectedParent) setSelectedParent(null);
                     else prevStep();
                   }} 
                   className="p-1 -ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors outline-none"
                 >
                   <ArrowLeft size={16} />
                 </button>
                 <div className="flex flex-col min-w-0 flex-1">
                   <div className="flex items-center gap-2">
                     {selectedParent && (
                       <div style={{ color: selectedParent.color }} className="shrink-0 flex items-center">
                         <IconRenderer iconName={selectedParent.icon} size={14} />
                       </div>
                     )}
                     <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
                       {selectedParent ? selectedParent.label : "Categorization"}
                     </h2>
                   </div>
                 </div>
                 <span className={`text-sm font-bold tabular-nums shrink-0 ${currentWallet?.isVirtual ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                   ₹{Number(expenseData.amount).toLocaleString('en-IN')}
                 </span>
              </div>

              {/* STICKY SEARCH BAR */}
              <div className="sticky top-0 z-10 bg-white dark:bg-[#0B1120] pb-2 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Find category..." 
                    className="w-full bg-slate-50 dark:bg-slate-900/50 p-2.5 pl-9 rounded-lg text-xs font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                  />
                </div>
              </div>

              {/* DYNAMIC SCROLL AREA */}
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                
                {/* STATE 1: SEARCH RESULTS */}
                {searchQuery ? (
                  <div className="flex flex-col gap-2">
                    {filteredResults.map(res => (
                      <button 
                        key={res._id} 
                        onClick={() => { setExpenseData({...expenseData, category: res._id}); isEditMode ? setStep(4) : nextStep(); }} 
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all active:scale-[0.98] outline-none text-left ${
                          expenseData.category === res._id 
                            ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10 hover:border-emerald-500 text-slate-900 dark:text-white'
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <p className="text-sm font-semibold truncate">{res.label}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5 truncate">
                            In {res.parentLabel}
                          </p>
                        </div>
                        <Check size={16} className={expenseData.category === res._id ? "opacity-100 text-emerald-600 dark:text-emerald-400" : "opacity-0"} />
                      </button>
                    ))}
                    {filteredResults.length === 0 && (
                      <div className="p-4 text-center text-slate-400 text-xs font-bold uppercase tracking-widest border border-dashed border-slate-200 dark:border-white/10 rounded-lg">
                        No matches found
                      </div>
                    )}
                  </div>
                
                /* STATE 2: PARENT GROUPS */
                ) : !selectedParent ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {categoryTree?.map(parent => (
                      <button 
                        key={parent._id} 
                        onClick={() => setSelectedParent(parent)} 
                        className="group flex flex-col items-center justify-start gap-2 p-3 rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all active:scale-95 outline-none"
                      >
                        <div className="w-10 h-10 rounded-md bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center transition-colors" style={{ color: parent.color }}>
                          <IconRenderer iconName={parent.icon} size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 text-center truncate w-full">
                          {parent.label}
                        </span>
                      </button>
                    ))}

                    {/* Inline Parent Creation Tile */}
                    {!isAddingParent ? (
                      <button 
                        onClick={() => setIsAddingParent(true)} 
                        className="group flex flex-col items-center justify-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-white/20 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/10 transition-all active:scale-95 outline-none"
                      >
                        <div className="w-10 h-10 rounded-md bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-emerald-500">
                          <Plus size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 text-center truncate w-full">
                          New Group
                        </span>
                      </button>
                    ) : (
                      <div className="col-span-3 sm:col-span-4 flex items-center bg-white dark:bg-[#0B1120] border border-emerald-500 rounded-lg p-1.5 shadow-sm">
                        <input 
                          autoFocus
                          value={newParentName}
                          onChange={e => setNewParentName(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleCreateParent()}
                          placeholder="Group name..."
                          className="w-full bg-transparent px-2 py-1.5 text-xs font-semibold outline-none text-slate-900 dark:text-white"
                        />
                        <button onClick={handleCreateParent} className="p-1.5 bg-emerald-600 text-white rounded-md ml-1 hover:bg-emerald-700 outline-none">
                          <Check size={14}/>
                        </button>
                      </div>
                    )}
                  </div>
                
                /* STATE 3: SUBCATEGORIES */
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedParent.subCategories?.map(sub => (
                      <button 
                        key={sub._id} 
                        onClick={() => { setExpenseData({...expenseData, category: sub._id}); isEditMode ? setStep(4) : nextStep(); }} 
                        className={`flex items-center justify-between p-3.5 rounded-lg border transition-all active:scale-[0.98] outline-none text-left ${
                          expenseData.category === sub._id 
                            ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10 hover:border-emerald-500 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                          <span className="text-sm font-semibold truncate pr-2">
                            {sub.label}
                          </span>
                          <Check size={16} className={expenseData.category === sub._id ? "opacity-100 text-emerald-600 dark:text-emerald-400" : "opacity-0"} />
                      </button>
                    ))}

                    {/* Inline Subcategory Creation Tile */}
                    {!isAddingSub ? (
                      <button 
                        onClick={() => setIsAddingSub(true)} 
                        className="flex items-center justify-center gap-2 p-3.5 rounded-lg border border-dashed border-slate-300 dark:border-white/20 text-slate-500 hover:text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/10 transition-all active:scale-[0.98] outline-none"
                      >
                        <Plus size={14} strokeWidth={2.5}/> 
                        <span className="text-xs font-bold uppercase tracking-widest">
                          New Entry
                        </span>
                      </button>
                    ) : (
                      <div className="flex items-center bg-white dark:bg-[#0B1120] border border-emerald-500 rounded-lg p-1.5 shadow-sm">
                        <input 
                          autoFocus
                          value={newSubName}
                          onChange={e => setNewSubName(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleCreateSub()}
                          placeholder="Entry name..."
                          className="w-full bg-transparent px-2 py-1.5 text-xs font-semibold outline-none text-slate-900 dark:text-white"
                        />
                        <button onClick={handleCreateSub} className="p-1.5 bg-emerald-600 text-white rounded-md ml-1 hover:bg-emerald-700 outline-none">
                          <Check size={14}/>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 mb-2">
                 <button onClick={() => setStep(isEditMode ? 1 : 3)} disabled={loading} className="p-1 -ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors outline-none disabled:opacity-50">
                    <ArrowLeft size={16} />
                 </button>
                 <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">Review Entry</h2>
              </div>
              
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-white/10">
                 <div className="flex justify-between items-end pb-3 border-b border-slate-200 dark:border-white/10">
                   <div className="space-y-0.5 text-left pr-2 min-w-0">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Category</p>
                     <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{currentSub?.label || "Misc"}</p>
                   </div>
                   <p className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight shrink-0 text-slate-900 dark:text-white">
                     ₹{Number(expenseData.amount).toLocaleString('en-IN')}
                   </p>
                 </div>
                 
                 <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 pt-3">
                   <div className="flex items-center gap-1.5 min-w-0">
                     {currentWallet?.isVirtual ? <Globe size={12}/> : <Wallet size={12}/>}
                     <span className="truncate">From: {currentWallet?.walletName}</span>
                   </div>
                   <span className="uppercase tracking-widest shrink-0 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">
                     {currentWallet?.isVirtual ? "Linked" : "Vault"}
                   </span>
                 </div>
              </div>

              <div className="space-y-1.5 pt-2">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Memo (Optional)</label>
                 <textarea 
                   rows="2" 
                   placeholder="Purchase details..." 
                   className="w-full bg-white dark:bg-[#0B1120] p-3 rounded-lg text-sm text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-white/10 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all no-scrollbar placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                   value={expenseData.description} 
                   onChange={(e) => setExpenseData({...expenseData, description: e.target.value})} 
                 />
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleFinalSubmit} 
                  disabled={loading} 
                  className="w-full text-white h-12 rounded-lg font-bold uppercase text-xs tracking-wider shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 transition-all disabled:opacity-50 outline-none bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-600 dark:focus-visible:ring-offset-[#0B1120]"
                >
                  {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" /> : <>{isEditMode ? "Update Entry" : "Save Entry"} <Check size={16} strokeWidth={3}/></>}
                </button>
              </div>
            </div>
          )}
          <div className="h-8 sm:hidden" />
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;