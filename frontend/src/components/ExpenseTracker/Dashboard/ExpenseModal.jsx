import React, { useState, useEffect, useMemo } from "react";
import { 
  X, Check, ChevronRight, ArrowLeft, Search, 
  Wallet, ArrowRight, CornerDownRight, AlertCircle, Landmark,
  Globe, Coins
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useApi } from "../../../hooks/useApi";

const IconRenderer = ({ iconName, size = 16, className = "" }) => {
  const IconComponent = LucideIcons[iconName] || LucideIcons.MoreHorizontal;
  return <IconComponent size={size} className={className} />;
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

  // Memoize filtered wallets for tabs
  const filteredWallets = useMemo(() => ({
    cash: wallets?.filter(w => !w.isVirtual) || [],
    online: wallets?.filter(w => w.isVirtual) || []
  }), [wallets]);
  
  useEffect(() => {
      if (!isOpen) {
        // Cleanup / Reset when closing
        const timer = setTimeout(() => {
          setSelectedParent(null);
          setSearchQuery(null); // Reset search
          setLocalError("");
          if (!isEditMode) {
            setExpenseData({ 
              amount: "", category: "", description: "", 
              sourceWallet: expenseData.sourceWallet, type: "DEBIT" 
            });
          }
        }, 300);
        return () => clearTimeout(timer);
      }

      // Modal just opened: Set initial states
      // We use a check to prevent cascading if already set
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
      
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  
  // ... fetchTree logic remains the same ...
  useEffect(() => {
    const fetchTree = async () => {
      try {
        const res = await request("/categories/tree");
        let rawData = res?.success ? res.data : Array.isArray(res) ? res : [];
        const sortedTree = rawData.sort((a, b) => a.label.localeCompare(b.label)).map(parent => ({
          ...parent, subCategories: (parent.subCategories || []).sort((a, b) => a.label.localeCompare(b.label))
        }));
        setCategoryTree(sortedTree);
      } catch (err) { console.error(err); }
    };
    if (isOpen) fetchTree();
  }, [isOpen, request]);

  const handleClose = () => !loading && setOpen(false);
  const nextStep = () => { setLocalError(""); setStep(prev => prev + 1); };
  const prevStep = () => { setLocalError(""); setStep(prev => prev - 1); };

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    setLocalError("");
    try { await onSubmit(e); } catch (err) { setLocalError(err.message || "Entry failed."); }
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
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#020617] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh] overflow-hidden border-t sm:border border-white/10">
        
        {/* PROGRESS NAV */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4].map((s) => (
              <button key={s} disabled={(step < s && !isEditMode) || loading} onClick={() => setStep(s)} className={`flex items-center gap-2 transition-all ${step === s ? 'opacity-100' : 'opacity-30'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step >= s ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{s}</span>
                {step === s && <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{s === 1 ? "Account" : s === 2 ? "Amount" : s === 3 ? "Category" : "Confirm"}</span>}
              </button>
            ))}
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"><X size={20} strokeWidth={3} /></button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-10">
          {localError && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest leading-tight">{localError}</p>
            </div>
          )}

          {/* STEP 1: TABBED SOURCE SELECTION */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="text-left flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">{isEditMode ? "Switch Account" : "Source of Funds"}</h2>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Bound to: {currentWallet?.walletName || "Selection Required"}</p>
                </div>
              </div>

              {/* TABS SWITCHER */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                <button onClick={() => setActiveTab("cash")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "cash" ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-sm" : "text-slate-400"}`}>
                  <Coins size={14} /> Cash Wallets
                </button>
                <button onClick={() => setActiveTab("online")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "online" ? "bg-white dark:bg-slate-800 text-indigo-500 shadow-sm" : "text-slate-400"}`}>
                  <Globe size={14} /> Digital/UPI
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 pb-6 min-h-75">
                {filteredWallets[activeTab].map(w => (
                  <button 
                    key={w._id} 
                    onClick={() => { setExpenseData({...expenseData, sourceWallet: w._id}); isEditMode ? setStep(4) : nextStep(); }}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all active:scale-[0.98] ${
                      expenseData.sourceWallet === w._id 
                      ? (w.isVirtual ? 'bg-indigo-600 border-indigo-700 text-white shadow-xl' : 'bg-emerald-500 border-emerald-600 text-white shadow-xl')
                      : 'bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 text-slate-900 dark:text-white hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg shadow-sm ${expenseData.sourceWallet === w._id ? 'bg-white/20' : 'bg-white dark:bg-slate-800'}`}>
                        {w.isGeneralPool ? <Landmark size={18} /> : w.isVirtual ? <Globe size={18} /> : <Wallet size={18} />}
                      </div>
                      <div className="text-left leading-none">
                        <span className="text-[11px] font-black uppercase tracking-widest block mb-1">{w.walletName}</span>
                        <span className={`text-[8px] font-black uppercase tracking-tighter opacity-60`}>
                          {w.isVirtual ? "Digital Wallet" : "Cash Wallet"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-[1000] italic">
                      {w.isVirtual ? "LINKED" : `₹${w.balance?.toLocaleString('en-IN')}`}
                    </span>
                  </button>
                ))}
                {filteredWallets[activeTab].length === 0 && (
                   <div className="flex flex-col items-center justify-center py-10 opacity-30">
                      <Search size={32} />
                      <p className="text-[10px] font-black uppercase mt-2">No {activeTab} wallets found</p>
                   </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: AMOUNT */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between">
                 <button onClick={prevStep} className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1 hover:opacity-70 transition-opacity"><ArrowLeft size={14} strokeWidth={3}/> Change Account</button>
                 <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${currentWallet?.isVirtual ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                    {currentWallet?.isVirtual ? <Globe size={10}/> : <Coins size={10}/>}
                    <span className="text-[9px] font-black uppercase tracking-widest">{currentWallet?.walletName}</span>
                 </div>
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Adjust Amount</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Assign numeric value to this entry</p>
              </div>
              <div className={`relative border-b-2 transition-colors ${currentWallet?.isVirtual ? 'border-indigo-500' : 'border-emerald-500'}`}>
                <span className={`absolute left-0 bottom-6 text-4xl font-[1000] italic ${currentWallet?.isVirtual ? 'text-indigo-200' : 'text-emerald-200'}`}>₹</span>
                <input type="number" autoFocus placeholder="0" className="w-full bg-transparent pt-4 pb-6 pl-10 text-6xl font-[1000] text-slate-900 dark:text-white outline-none" value={expenseData.amount} onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})} onKeyDown={(e) => (e.key === "ArrowUp" || e.key === "ArrowDown") && e.preventDefault()} onWheel={(e) => e.target.blur()} />
              </div>
              <button disabled={!expenseData.amount || expenseData.amount <= 0} onClick={() => isEditMode ? setStep(4) : nextStep()} className={`w-full h-16 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl ${currentWallet?.isVirtual ? 'bg-indigo-600 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}>
                {isEditMode ? "Update Amount" : "Proceed to Category"} <ArrowRight size={16} strokeWidth={3}/>
              </button>
            </div>
          )}

          {/* ... Step 3 (Category) remains mostly the same, ensuring buttons are compact ... */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 flex flex-col h-full min-h-0">
               <div className="flex items-center justify-between">
                 <button onClick={prevStep} className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1 hover:opacity-70 transition-opacity"><ArrowLeft size={14} strokeWidth={3}/> Back</button>
                 <span className={`text-[11px] font-[1000] italic ${currentWallet?.isVirtual ? 'text-indigo-500' : 'text-slate-900 dark:text-white'}`}>₹{Number(expenseData.amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Categorization</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Target: {currentSub?.label || "Unclassified"}</p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Quick Search..." className="w-full bg-slate-50 dark:bg-slate-900 p-4 pl-12 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-800 focus:border-emerald-500/50 outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar min-h-75 pb-10">
                {searchQuery ? (
                  <div className="grid grid-cols-1 gap-1">
                    {filteredResults.map(res => (
                      <button key={res._id} onClick={() => { setExpenseData({...expenseData, category: res._id}); isEditMode ? setStep(4) : nextStep(); }} className={`w-full flex items-center justify-between p-4 rounded-xl transition-all group ${expenseData.category === res._id ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-900/50'}`}>
                        <div className="text-left"><p className="text-[10px] font-black uppercase tracking-widest">{res.label}</p><p className={`text-[8px] font-bold uppercase ${expenseData.category === res._id ? 'text-white/70' : 'opacity-60'}`}>{res.parentLabel}</p></div>
                        <Check size={14} className={expenseData.category === res._id ? "opacity-100" : "opacity-0"} />
                      </button>
                    ))}
                  </div>
                ) : !selectedParent ? (
                  <div className="grid grid-cols-2 gap-2">
                    {categoryTree?.map(parent => (
                      <button key={parent._id} onClick={() => setSelectedParent(parent)} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-transparent hover:border-emerald-500/30 transition-all active:scale-95">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 shadow-sm shrink-0" style={{ color: parent.color }}><IconRenderer iconName={parent.icon} size={18} /></div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 text-left leading-tight">{parent.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button onClick={() => setSelectedParent(null)} className="w-full p-3 flex items-center justify-center gap-2 text-[9px] font-black text-emerald-500 uppercase bg-emerald-500/5 rounded-xl border border-emerald-500/10 mb-4 hover:bg-emerald-500/10 transition-colors"><ArrowLeft size={14} strokeWidth={3} /> Change Group</button>
                    <div className="grid grid-cols-1 gap-1">
                      {selectedParent.subCategories?.map(sub => (
                        <button key={sub._id} onClick={() => { setExpenseData({...expenseData, category: sub._id}); isEditMode ? setStep(4) : nextStep(); }} className={`flex items-center justify-between p-4 rounded-xl text-left transition-all border ${expenseData.category === sub._id ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                           <span className={`text-[10px] font-black uppercase tracking-widest ${expenseData.category === sub._id ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>{sub.label}</span>
                           {expenseData.category === sub._id ? <Check size={12} /> : <CornerDownRight size={12} className="text-slate-300"/>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <button onClick={prevStep} disabled={loading} className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1 hover:opacity-70 transition-opacity"><ArrowLeft size={14} strokeWidth={3}/> Edit Details</button>
              <div className="text-left">
                <h2 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">{isEditMode ? "Verify Change" : "Commit Entry"}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Final validation before ledger write</p>
              </div>
               <div className={`p-6 rounded-3xl space-y-4 shadow-2xl border ${currentWallet?.isVirtual ? 'bg-indigo-600 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-emerald-500/10 border-white/5 dark:border-slate-100'}`}>
                  <div className={`flex justify-between items-end pb-4 border-b ${currentWallet?.isVirtual ? 'border-white/20 dark:border-slate-100' : 'border-white/10 dark:border-slate-100'}`}>
                    <div className="space-y-1 text-left">
                      <p className={`text-[8px] font-black uppercase tracking-widest ${currentWallet?.isVirtual ? 'text-indigo-200 dark:text-indigo-500' : 'text-emerald-500'}`}>Classification</p>
                      <p className="text-xs font-black uppercase tracking-widest leading-none">{currentSub?.label}</p>
                    </div>
                    <p className="text-4xl font-[1000] italic tracking-tighter">₹{Number(expenseData.amount).toLocaleString('en-IN')}</p>
                  </div>
                  <div className={`flex justify-between items-center text-[8px] font-black uppercase tracking-widest pt-1 leading-none ${currentWallet?.isVirtual ? 'text-white/60 dark:text-slate-400' : 'text-white/40 dark:text-slate-400'}`}>
                    <span className="flex items-center gap-1">{currentWallet?.isVirtual ? <Globe size={10}/> : <Wallet size={10}/>} Source: {currentWallet?.walletName}</span>
                    <span className={`flex items-center gap-1 uppercase font-black ${currentWallet?.isVirtual ? 'text-white' : 'text-emerald-500'}`}>{currentWallet?.isVirtual ? "Digital Link" : "Vault Entry"}</span>
                  </div>
               </div>
               <div className="space-y-2 text-left">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Context Notes</label>
                 <textarea rows="2" placeholder="Purchase specifics..." className="w-full bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/20 no-scrollbar" value={expenseData.description} onChange={(e) => setExpenseData({...expenseData, description: e.target.value})} />
               </div>
               <button onClick={handleFinalSubmit} disabled={loading} className={`w-full text-white h-20 rounded-2xl font-[1000] uppercase text-xs tracking-[0.5em] shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 ${currentWallet?.isVirtual ? 'bg-indigo-600' : isEditMode ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
                  {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" /> : <>{isEditMode ? "Update Entry" : "Authorize Spends"} <Check size={18} strokeWidth={4}/></>}
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;