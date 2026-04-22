import React, { useState, useEffect } from "react";
import { 
  X, Check, Wallet, ArrowRight, ArrowLeft, AlertCircle, Landmark 
} from "lucide-react";

const TopUpModal = ({ isOpen, setOpen, wallets, topUpData, setTopUpData, onSubmit, loading }) => {
  const [step, setStep] = useState(1);
  const [localError, setLocalError] = useState("");

  // Revert back to original states whenever the modal is closed or submitted
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep(1);
        setLocalError("");
        setTopUpData({ amount: "", description: "", targetWallet: "" });
      }, 300); // Wait for slide-down animation
      return () => clearTimeout(timer);
    }
  }, [isOpen, setTopUpData]);

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
  };

  if (!isOpen) return null;

  const currentWallet = wallets.find(w => w._id === topUpData.targetWallet);
  
  const nextStep = () => {
    setLocalError("");
    setStep(prev => prev + 1);
  };
  const prevStep = () => {
    setLocalError("");
    setStep(prev => prev - 1);
  };

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    setLocalError("");
    try {
      await onSubmit(e);
      // Success is handled by parent closing the modal, 
      // which triggers our useEffect reset logic.
    } catch (err) {
      setLocalError(err.message || "Transaction failed. Please check funds.");
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 text-left">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={handleClose} />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#020617] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col h-[75vh] sm:h-auto sm:max-h-[85vh] overflow-hidden border-t sm:border border-white/10">
        
        {/* PROGRESS NAVIGATION */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                disabled={step < s || loading}
                onClick={() => setStep(s)}
                className={`flex items-center gap-2 transition-all ${step === s ? 'opacity-100' : 'opacity-30'}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step >= s ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {s}
                </span>
                {step === s && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    {s === 1 && "Destination"}
                    {s === 2 && "Amount"}
                    {s === 3 && "Finalize"}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-10">
          
          {localError && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest leading-tight">
                {localError}
              </p>
            </div>
          )}

          {/* STEP 1: SELECT TARGET POCKET (Includes Drawer) */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="text-left">
                <h2 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Refill Destination</h2>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Which account are you adding funds to?</p>
              </div>
              <div className="grid grid-cols-1 gap-2 pb-4">
                {wallets.filter(w => !w.isVirtual).map(w => (
                  <button 
                    key={w._id} 
                    onClick={() => { setTopUpData({...topUpData, targetWallet: w._id}); nextStep(); }}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all active:scale-[0.98] ${
                      w.isGeneralPool 
                      ? 'bg-slate-900 border-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-xl' 
                      : 'bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800'
                    } hover:border-emerald-500`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg shadow-sm ${w.isGeneralPool ? 'bg-emerald-500' : 'bg-white dark:bg-slate-800'}`}>
                        {w.isGeneralPool ? <Landmark size={18} className="text-white" /> : <Wallet size={18} className="text-emerald-500"/>}
                      </div>
                      <div className="text-left">
                        <span className={`text-xs font-black uppercase tracking-widest ${w.isGeneralPool ? 'text-white dark:text-slate-900' : 'text-slate-700 dark:text-slate-200'}`}>
                          {w.walletName}
                        </span>
                        {w.isGeneralPool && <p className="text-[8px] font-black uppercase opacity-40">Main Liquidity Source</p>}
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold ${w.isGeneralPool ? 'text-white/60 dark:text-slate-400' : 'text-slate-400'}`}>
                      ₹{w.balance.toLocaleString('en-IN')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: AMOUNT */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between">
                 <button onClick={prevStep} className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1 hover:opacity-70 transition-opacity">
                   <ArrowLeft size={14} strokeWidth={3}/> Change Account
                 </button>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target: {currentWallet?.walletName}</span>
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Funding Amount</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Specify volume to inject</p>
              </div>
              <div className="relative border-b-2 border-slate-100 dark:border-slate-800 focus-within:border-emerald-500 transition-colors">
                <span className="absolute left-0 bottom-6 text-4xl font-[1000] text-slate-300 dark:text-slate-700 italic">₹</span>
                <input
                    type="number" 
                    autoFocus 
                    placeholder="0"
                    className="w-full bg-transparent pt-4 pb-6 pl-10 text-6xl font-[1000] text-slate-900 dark:text-white outline-none"
                    value={topUpData.amount} 
                    onChange={(e) => setTopUpData({...topUpData, amount: e.target.value})} 
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        e.preventDefault();
                      }
                    }}
                    onWheel={(e) => e.target.blur()}                
                  />
              </div>
              <button 
                disabled={!topUpData.amount || topUpData.amount <= 0}
                onClick={nextStep}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-16 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-20 transition-all shadow-xl"
              >
                Proceed to Review <ArrowRight size={16} strokeWidth={3}/>
              </button>
            </div>
          )}

          {/* STEP 3: REVIEW & NOTES */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
               <button onClick={prevStep} disabled={loading} className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1 hover:opacity-70 transition-opacity">
                 <ArrowLeft size={14} strokeWidth={3}/> Go Back
               </button>

               <div className="text-left">
                <h2 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Review Top-Up</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {currentWallet?.isGeneralPool ? "External deposit to Master Pool" : "Transfer from General Pool"}
                </p>
              </div>
               
               <div className="p-6 bg-slate-900 dark:bg-white rounded-3xl space-y-4 shadow-2xl shadow-emerald-500/10 border border-white/5 dark:border-slate-100">
                  <div className="flex justify-between items-end border-b border-white/10 dark:border-slate-100 pb-4">
                    <div className="space-y-1 text-left">
                      <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Injection Goal</p>
                      <p className="text-xs font-black text-white dark:text-slate-900 uppercase tracking-widest">Target: {currentWallet?.walletName}</p>
                    </div>
                    <p className="text-4xl font-[1000] text-white dark:text-slate-900 italic tracking-tighter">+₹{Number(topUpData.amount).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-black text-white/40 dark:text-slate-400 uppercase tracking-widest leading-none pt-1">
                    <span>New Balance: ₹{(currentWallet?.balance + Number(topUpData.amount)).toLocaleString('en-IN')}</span>
                    <span className="flex items-center gap-1 uppercase font-black text-emerald-400">Secure Protocol</span>
                  </div>
               </div>

               <div className="space-y-2 text-left">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Memo (Optional)</label>
                 <textarea 
                   rows="2" placeholder="e.g., Cash deposit, Monthly allowance..."
                   className="w-full bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/20 transition-all no-scrollbar"
                   value={topUpData.description} onChange={(e) => setTopUpData({...topUpData, description: e.target.value})} 
                 />
               </div>

               <button 
                  onClick={handleFinalSubmit} 
                  disabled={loading}
                  className="w-full bg-emerald-500 text-white h-20 rounded-2xl font-[1000] uppercase text-xs tracking-[0.5em] shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                  ) : (
                    <>Authorize Top-Up <Check size={18} strokeWidth={4}/></>
                  )}
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopUpModal;