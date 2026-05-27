import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  
  // Refactored to a callable function for refreshing after inline creation
  const loadCategories = useCallback(async () => {
    try {
      const res = await request("/categories/tree");
      let rawData = res?.success ? res.data : Array.isArray(res) ? res : [];
      const sortedTree = rawData.sort((a, b) => a.label.localeCompare(b.label)).map(parent => ({
        ...parent, subCategories: (parent.subCategories || []).sort((a, b) => a.label.localeCompare(b.label))
      }));
      setCategoryTree(sortedTree);

      // FIX: Use functional state update to prevent infinite re-renders
      setSelectedParent(prev => {
        if (!prev) return null;
        const updatedParent = sortedTree.find(p => p._id === prev._id);
        return updatedParent || null;
      });
    } catch (err) { console.error(err); }
  }, [request]); // selectedParent is successfully removed from dependencies

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadCategories();
    }
  }, [isOpen, loadCategories]);

  // INLINE CREATION HANDLERS
  const handleCreateParent = async () => {
    if (!newParentName.trim()) { setIsAddingParent(false); return; }
    // Defaulting to a nice Slate color and generic Folder icon for quick-adds
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
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={handleClose} />
      
      {/* FIX 1: Changed h-[92vh] to h-[80vh] so it never blocks the top 20% of the screen */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#020617] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col h-[80vh] sm:h-auto sm:max-h-[85vh] overflow-hidden border-t sm:border border-white/10">
        
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0B1120] shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((s) => (
              <button key={s} disabled={(step < s && !isEditMode) || loading} onClick={() => setStep(s)} className={`flex items-center gap-2 transition-all ${step === s ? 'opacity-100' : 'opacity-30'}`}>
                <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-black ${step >= s ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{s}</span>
                {step === s && <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{s === 1 ? "Pocket" : s === 2 ? "Amount" : s === 3 ? "Group" : "Final"}</span>}
              </button>
            ))}
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 active:scale-90"><X size={20} strokeWidth={3} /></button>
        </div>

        {/* FIX 2: Added scrollbar hiding classes [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-5 sm:p-10">
          {localError && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] sm:text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest leading-tight">{localError}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-right-4">
              <div className="text-left">
                <h2 className="text-xl sm:text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">
                  {isEditMode ? "Switch Account" : "Source of Funds"}
                </h2>
                <p className="text-[9px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">
                  Bound to: {currentWallet?.walletName || "Selection Required"}
                </p>
              </div>

              <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                <button onClick={() => setActiveTab("cash")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "cash" ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-sm" : "text-slate-400"}`}>
                  <Coins size={14} /> Cash
                </button>
                <button onClick={() => setActiveTab("online")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "online" ? "bg-white dark:bg-slate-800 text-indigo-500 shadow-sm" : "text-slate-400"}`}>
                  <Globe size={14} /> Digital
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 pb-6">
                {filteredWallets[activeTab].map(w => (
                  <button 
                    key={w._id} 
                    onClick={() => { setExpenseData({...expenseData, sourceWallet: w._id}); isEditMode ? setStep(4) : nextStep(); }} 
                    className={`flex items-center justify-between p-3.5 sm:p-5 rounded-2xl border transition-all active:scale-[0.98] ${
                      expenseData.sourceWallet === w._id 
                        ? (w.isVirtual ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-emerald-500 border-emerald-600 text-white') 
                        : 'bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 text-slate-900 dark:text-white hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden pr-2">
                      <div className={`p-2 rounded-lg shadow-sm shrink-0 ${expenseData.sourceWallet === w._id ? 'bg-white/20' : 'bg-white dark:bg-slate-800'}`}>
                        {w.isGeneralPool ? <Landmark size={18} /> : w.isVirtual ? <Globe size={18} /> : <Wallet size={18} />}
                      </div>
                      <div className="text-left truncate leading-tight">
                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest block truncate">
                          {w.walletName}
                        </span>
                        <span className="text-[7px] sm:text-[8px] font-black uppercase opacity-60 truncate">
                          {w.isVirtual ? "Virtual" : "Cash"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-[1000] italic tabular-nums shrink-0">
                      {w.isVirtual ? "LINKED" : `₹${w.balance?.toLocaleString('en-IN')}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between">
                 <button onClick={prevStep} className="text-[9px] sm:text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1 active:opacity-70 transition-opacity">
                    <ArrowLeft size={12} strokeWidth={3}/> Back
                 </button>
                 <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Target: {currentWallet?.walletName}</span>
              </div>
              <div className="text-left">
                <h2 className="text-xl sm:text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Adjust Amount</h2>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Assign numeric value to this entry</p>
              </div>
              <div className={`relative border-b-2 transition-colors ${currentWallet?.isVirtual ? 'border-indigo-500' : 'border-emerald-500'}`}>
                <span className={`absolute left-0 bottom-6 text-3xl sm:text-4xl font-[1000] text-slate-300 dark:text-slate-700 italic`}>₹</span>
                <input 
                  type="text" inputMode="numeric" autoFocus placeholder="0" 
                  className="w-full bg-transparent pt-4 pb-6 pl-8 sm:pl-10 text-4xl sm:text-6xl font-[1000] text-slate-900 dark:text-white outline-none" 
                  value={formatDisplayAmount(expenseData.amount)} 
                  onChange={handleAmountChange}
                  onKeyDown={(e) => { if(e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault(); }}
                  onWheel={(e) => e.target.blur()}
                />
              </div>
              <button disabled={!expenseData.amount || Number(expenseData.amount) <= 0} onClick={() => isEditMode ? setStep(4) : nextStep()} className={`w-full h-14 sm:h-16 rounded-2xl font-black uppercase text-[10px] sm:text-[11px] tracking-[0.3em] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl ${currentWallet?.isVirtual ? 'bg-indigo-600 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}>
                {isEditMode ? "Update Amount" : "Continue"} <ArrowRight size={14} strokeWidth={3}/>
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 flex flex-col h-full">
               
               {/* SMART STEP HEADER: Resolves state routing dynamically */}
               <div className="flex items-center justify-between">
                 <button 
                   onClick={() => {
                     // Walks backwards through the state stack logically
                     if (isAddingSub) setIsAddingSub(false);
                     else if (isAddingParent) setIsAddingParent(false);
                     else if (searchQuery) setSearchQuery("");
                     else if (selectedParent) setSelectedParent(null);
                     else prevStep();
                   }} 
                   className="text-[9px] sm:text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1 active:opacity-70 transition-opacity"
                 >
                   <ArrowLeft size={12} strokeWidth={3}/> Back
                 </button>
                 <span className={`text-[10px] font-[1000] italic tabular-nums ${currentWallet?.isVirtual ? 'text-indigo-500' : 'text-slate-900 dark:text-white'}`}>
                   ₹{Number(expenseData.amount).toLocaleString('en-IN')}
                 </span>
              </div>
              
              {/* DYNAMIC HEADER: Updates contextually based on selected folder */}
              <div className="text-left flex items-center gap-3">
                {selectedParent && (
                  <div style={{ color: selectedParent.color }} className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-sm">
                    <IconRenderer iconName={selectedParent.icon} size={16} />
                  </div>
                )}
                <h2 className="text-xl sm:text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">
                  {selectedParent ? selectedParent.label : "Categorization"}
                </h2>
              </div>

              {/* STICKY SEARCH BAR */}
              <div className="sticky top-0 z-10 bg-white dark:bg-[#020617] pb-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 -mt-1 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Find category..." 
                  className="w-full bg-slate-50 dark:bg-slate-900 p-3.5 sm:p-4 pl-10 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500/50 transition-colors" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>

              {/* DYNAMIC SCROLL AREA */}
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-10">
                
                {/* STATE 1: SEARCH RESULTS */}
                {searchQuery ? (
                  <div className="grid grid-cols-1 gap-2">
                    {filteredResults.map(res => (
                      <button 
                        key={res._id} 
                        onClick={() => { setExpenseData({...expenseData, category: res._id}); isEditMode ? setStep(4) : nextStep(); }} 
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border active:scale-[0.98] ${
                          expenseData.category === res._id 
                            ? 'bg-emerald-500 text-white border-emerald-600' 
                            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-left pr-2 truncate leading-tight">
                          <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest truncate">{res.label}</p>
                          <p className={`text-[7px] font-bold uppercase tracking-widest mt-0.5 ${expenseData.category === res._id ? 'text-emerald-100' : 'text-slate-400'}`}>
                            In {res.parentLabel}
                          </p>
                        </div>
                        <Check size={16} className={expenseData.category === res._id ? "opacity-100" : "opacity-0"} />
                      </button>
                    ))}
                  </div>
                
                /* STATE 2: PARENT GROUPS */
                ) : !selectedParent ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-4 pb-4">
                    {categoryTree?.map(parent => (
                      <button 
                        key={parent._id} 
                        onClick={() => setSelectedParent(parent)} 
                        className="group flex flex-col items-center justify-start gap-2 p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-95"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow" style={{ color: parent.color }}>
                          <IconRenderer iconName={parent.icon} size={22} />
                        </div>
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 text-center leading-tight">
                          {parent.label}
                        </span>
                      </button>
                    ))}

                    {/* Inline Parent Creation Tile */}
                    {!isAddingParent ? (
                      <button 
                        onClick={() => setIsAddingParent(true)} 
                        className="group flex flex-col items-center justify-start gap-2 p-3 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-dashed border-emerald-200 dark:border-emerald-900/30 hover:border-emerald-400 transition-all active:scale-95"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center shadow-sm text-emerald-500">
                          <Plus size={22} />
                        </div>
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 text-center leading-tight">
                          New
                        </span>
                      </button>
                    ) : (
                      <div className="col-span-3 sm:col-span-4 md:col-span-5 flex items-center bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-2xl p-1.5 shadow-sm animate-in fade-in zoom-in-95">
                        <input 
                          autoFocus
                          value={newParentName}
                          onChange={e => setNewParentName(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleCreateParent()}
                          placeholder="GROUP NAME..."
                          className="w-full bg-transparent px-3 py-2 text-[10px] sm:text-[11px] font-black uppercase outline-none text-slate-900 dark:text-white"
                        />
                        <button onClick={handleCreateParent} className="p-2 bg-emerald-500 text-white rounded-xl mr-1 hover:bg-emerald-600">
                          <Check size={16}/>
                        </button>
                      </div>
                    )}
                  </div>
                
                /* STATE 3: SUBCATEGORIES */
                ) : (
                  <div className="space-y-4 animate-in slide-in-from-right-2 mt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pb-4">
                      {selectedParent.subCategories?.map(sub => (
                        <button 
                          key={sub._id} 
                          onClick={() => { setExpenseData({...expenseData, category: sub._id}); isEditMode ? setStep(4) : nextStep(); }} 
                          className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all active:scale-[0.97] ${
                            expenseData.category === sub._id 
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-md' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 text-slate-700 dark:text-slate-300 shadow-sm'
                          }`}
                        >
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-left pr-2 truncate">
                              {sub.label}
                            </span>
                            {expenseData.category === sub._id && <Check size={14} className="shrink-0" />}
                        </button>
                      ))}

                      {/* Inline Subcategory Creation Tile */}
                      {!isAddingSub ? (
                        <button 
                          onClick={() => setIsAddingSub(true)} 
                          className="flex items-center justify-center p-4 sm:p-5 rounded-2xl border-2 border-dashed border-emerald-500/30 text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all active:scale-[0.97]"
                        >
                          <Plus size={16} strokeWidth={3} className="mr-1"/> 
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                            New Entry
                          </span>
                        </button>
                      ) : (
                        <div className="col-span-2 sm:col-span-3 flex items-center bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-2xl p-1.5 shadow-sm animate-in fade-in zoom-in-95">
                          <input 
                            autoFocus
                            value={newSubName}
                            onChange={e => setNewSubName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleCreateSub()}
                            placeholder="ENTRY NAME..."
                            className="w-full bg-transparent px-3 py-2 text-[10px] sm:text-[11px] font-black uppercase outline-none text-slate-900 dark:text-white"
                          />
                          <button onClick={handleCreateSub} className="p-2 bg-emerald-500 text-white rounded-xl mr-1 hover:bg-emerald-600">
                            <Check size={16}/>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
              <button onClick={() => setStep(isEditMode ? 1 : 3)} disabled={loading} className="text-[9px] sm:text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1 active:opacity-70"><ArrowLeft size={12} strokeWidth={3}/> Back</button>
              <div className="text-left">
                <h2 className="text-xl sm:text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">{isEditMode ? "Verify Change" : "Commit Entry"}</h2>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Final validation before ledger write</p>
              </div>
               <div className={`p-5 sm:p-6 rounded-3xl space-y-4 shadow-2xl border ${currentWallet?.isVirtual ? 'bg-indigo-600 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-emerald-500/10 border-white/5 dark:border-slate-100'}`}>
                  <div className={`flex justify-between items-end pb-4 border-b ${currentWallet?.isVirtual ? 'border-white/20 dark:border-slate-100' : 'border-white/10 dark:border-slate-100'}`}>
                    <div className="space-y-1 text-left truncate pr-2 leading-none">
                      <p className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest ${currentWallet?.isVirtual ? 'text-indigo-200 dark:text-indigo-500' : 'text-emerald-500'}`}>Classification</p>
                      <p className="text-[11px] sm:text-xs font-black uppercase tracking-widest truncate">{currentSub?.label || "Misc"}</p>
                    </div>
                    <p className="text-3xl sm:text-4xl font-[1000] italic tracking-tighter shrink-0 tabular-nums">₹{Number(expenseData.amount).toLocaleString('en-IN')}</p>
                  </div>
                  <div className={`flex justify-between items-center text-[7px] sm:text-[8px] font-black uppercase tracking-widest pt-1 leading-none ${currentWallet?.isVirtual ? 'text-white/60 dark:text-slate-400' : 'text-white/40 dark:text-slate-400'}`}>
                    <span className="flex items-center gap-1 truncate max-w-37.5">{currentWallet?.isVirtual ? <Globe size={10}/> : <Wallet size={10}/>} Source: {currentWallet?.walletName}</span>
                    <span className={`flex items-center gap-1 uppercase font-black shrink-0 ${currentWallet?.isVirtual ? 'text-white' : 'text-emerald-500'}`}>{currentWallet?.isVirtual ? "Link" : "Vault"}</span>
                  </div>
               </div>
               <div className="space-y-2 text-left">
                 <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Context Notes</label>
                 <textarea rows="2" placeholder="Purchase specifics..." className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/20 no-scrollbar" value={expenseData.description} onChange={(e) => setExpenseData({...expenseData, description: e.target.value})} />
               </div>
               <button onClick={handleFinalSubmit} disabled={loading} className={`w-full text-white h-16 sm:h-20 rounded-2xl font-[1000] uppercase text-[10px] sm:text-xs tracking-[0.4em] sm:tracking-[0.5em] shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 ${currentWallet?.isVirtual ? 'bg-indigo-600' : isEditMode ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
                  {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" /> : <>{isEditMode ? "Update Entry" : "Authorize"} <Check size={18} strokeWidth={4}/></>}
               </button>
            </div>
          )}
          <div className="h-8 sm:hidden" />
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;