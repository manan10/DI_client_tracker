import React, { useState, useEffect } from "react";
import { 
  X, Check, Wallet, ArrowRight, ArrowLeft, AlertCircle, Landmark, DownloadCloud, Box
} from "lucide-react";

// Helper for Indian Currency Formatting during typing
const formatDisplayAmount = (val) => {
  if (!val) return "";
  const number = String(val).replace(/[^0-9]/g, ""); 
  return new Intl.NumberFormat('en-IN').format(number);
};

const TopUpModal = ({ isOpen, setOpen, wallets, topUpData, setTopUpData, onSubmit, loading }) => {
  const [step, setStep] = useState(1);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep(1);
        setLocalError("");
        // Added isExternal to state initialization
        setTopUpData({ amount: "", description: "", targetWallet: "", isExternal: false });
      }, 300);
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

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    setTopUpData({ ...topUpData, amount: rawValue });
  };

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    setLocalError("");
    try {
      await onSubmit(e);
    } catch (err) {
      setLocalError(err.message || "Transaction failed. Please check funds.");
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 text-left">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={handleClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#020617] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh] overflow-hidden border-t sm:border border-white/10 transition-transform">
        
        {/* PROGRESS NAVIGATION */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0B1120] shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                disabled={step < s || loading}
                onClick={() => setStep(s)}
                className={`flex items-center gap-2 transition-all ${step === s ? 'opacity-100' : 'opacity-30'}`}
              >
                <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-black ${step >= s ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {s}
                </span>
                {step === s && (
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    {s === 1 && "Pocket"}
                    {s === 2 && "Volume"}
                    {s === 3 && "Review"}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 active:scale-90">
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-5 sm:p-10 pb-10 sm:pb-10">
          
          {localError && (
            <div className="mb-4 flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest leading-tight">
                {localError}
              </p>
            </div>
          )}

          {/* STEP 1: SELECT WALLET */}
          {step === 1 && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="text-left">
                <h2 className="text-xl sm:text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Refill Destination</h2>
                <p className="text-[9px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Select account for injection</p>
              </div>
              <div className="grid grid-cols-1 gap-2 pb-4">
                {wallets.filter(w => !w.isVirtual).map(w => (
                  <button 
                    key={w._id} 
                    onClick={() => { setTopUpData({...topUpData, targetWallet: w._id}); nextStep(); }}
                    className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all active:scale-[0.98] ${
                      w.isGeneralPool 
                      ? 'bg-slate-900 border-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-lg' 
                      : 'bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800'
                    } hover:border-emerald-500`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                      <div className={`p-2 rounded-lg shadow-sm shrink-0 ${w.isGeneralPool ? 'bg-emerald-500' : 'bg-white dark:bg-slate-800'}`}>
                        {w.isGeneralPool ? <Landmark size={18} className="text-white" /> : <Wallet size={18} className="text-emerald-500"/>}
                      </div>
                      <div className="text-left truncate">
                        <span className={`text-[11px] sm:text-xs font-black uppercase tracking-widest truncate block ${w.isGeneralPool ? 'text-white dark:text-slate-900' : 'text-slate-700 dark:text-slate-200'}`}>
                          {w.walletName}
                        </span>
                        {w.isGeneralPool && <p className="text-[7px] sm:text-[8px] font-black uppercase opacity-40">Master Pool</p>}
                      </div>
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-bold shrink-0 ${w.isGeneralPool ? 'text-white/60 dark:text-slate-400' : 'text-slate-400'}`}>
                      ₹{w.balance?.toLocaleString('en-IN') || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: AMOUNT AND SOURCE */}
          {step === 2 && (
            <div className="space-y-4 sm:space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between">
                 <button onClick={prevStep} className="text-[9px] sm:text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1 active:opacity-70 transition-opacity">
                    <ArrowLeft size={12} strokeWidth={3}/> Back
                 </button>
                 <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Target: {currentWallet?.walletName}</span>
              </div>
              
              <div className="text-left">
                <h2 className="text-xl sm:text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Funding Details</h2>
              </div>

              {/* NEW: Funding Source Toggle */}
              <div className="bg-slate-50 dark:bg-[#0B1120] p-1.5 rounded-[1.25rem] flex gap-1 border border-slate-100 dark:border-slate-800/60 shadow-inner">
                <button 
                  onClick={() => setTopUpData({...topUpData, isExternal: false})}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${!topUpData.isExternal ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm border border-slate-200/50 dark:border-white/5' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  <Box size={14} strokeWidth={3}/> Drawer
                </button>
                <button 
                  onClick={() => setTopUpData({...topUpData, isExternal: true})}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${topUpData.isExternal ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm border border-slate-200/50 dark:border-white/5' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  <DownloadCloud size={14} strokeWidth={3}/> External
                </button>
              </div>

              <div className="relative border-b-2 border-slate-100 dark:border-slate-800 focus-within:border-emerald-500 transition-colors pt-2">
                <span className="absolute left-0 bottom-4 sm:bottom-6 text-3xl sm:text-4xl font-[1000] text-slate-300 dark:text-slate-700 italic">₹</span>
                <input
                    type="text"
                    inputMode="numeric"
                    autoFocus 
                    placeholder="0"
                    className="w-full bg-transparent pt-4 pb-4 sm:pb-6 pl-8 sm:pl-10 text-4xl sm:text-6xl font-[1000] text-slate-900 dark:text-white outline-none"
                    value={formatDisplayAmount(topUpData.amount)} 
                    onChange={handleAmountChange}
                />
              </div>

              <button 
                disabled={!topUpData.amount || Number(topUpData.amount) <= 0}
                onClick={nextStep}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-14 sm:h-16 rounded-2xl font-black uppercase text-[10px] sm:text-[11px] tracking-[0.3em] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-20 transition-all shadow-xl"
              >
                Proceed to Review <ArrowRight size={14} strokeWidth={3}/>
              </button>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 3 && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4">
               <button onClick={prevStep} disabled={loading} className="text-[9px] sm:text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1 active:opacity-70 transition-opacity">
                  <ArrowLeft size={12} strokeWidth={3}/> Back
               </button>

               <div className="text-left">
                <h2 className="text-xl sm:text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Review Top-Up</h2>
               </div>
               
               <div className="p-4 sm:p-6 bg-slate-900 dark:bg-white rounded-3xl space-y-4 shadow-2xl border border-white/5 dark:border-slate-100 overflow-hidden relative">
                  
                  {/* Dynamic Source Indicator */}
                  <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${topUpData.isExternal ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {topUpData.isExternal ? 'External Source' : 'From Drawer'}
                  </div>

                  <div className="flex justify-between items-end border-b border-white/10 dark:border-slate-100 pb-4 pt-4 sm:pt-2">
                    <div className="space-y-1 text-left truncate pr-2">
                      <p className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest ${topUpData.isExternal ? 'text-indigo-400 dark:text-indigo-600' : 'text-emerald-500'}`}>Injection Goal</p>
                      <p className="text-[10px] sm:text-xs font-black text-white dark:text-slate-900 uppercase tracking-widest truncate">{currentWallet?.walletName}</p>
                    </div>
                    <p className={`text-3xl font-[1000] italic tracking-tighter shrink-0 ${topUpData.isExternal ? 'text-indigo-400 dark:text-indigo-600' : 'text-emerald-500 dark:text-emerald-600'}`}>
                      +₹{Number(topUpData.amount).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-[7px] sm:text-[8px] font-black text-white/40 dark:text-slate-400 uppercase tracking-widest leading-none pt-1">
                    <span>New Balance: ₹{((currentWallet?.balance || 0) + Number(topUpData.amount)).toLocaleString('en-IN')}</span>
                  </div>
               </div>

               <div className="space-y-2 text-left">
                 <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Memo (Optional)</label>
                 <textarea 
                   rows="2" placeholder={topUpData.isExternal ? "Note down who sent this..." : "Note down reason..."}
                   className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-[11px] font-bold text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/20 transition-all no-scrollbar"
                   value={topUpData.description} onChange={(e) => setTopUpData({...topUpData, description: e.target.value})} 
                 />
               </div>

               <button 
                  onClick={handleFinalSubmit} 
                  disabled={loading}
                  className={`w-full text-white h-16 rounded-2xl font-[1000] uppercase text-[10px] sm:text-xs tracking-[0.4em] shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 transition-all disabled:opacity-50 ${topUpData.isExternal ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
               >
                 {loading ? (
                   <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                 ) : (
                   <>Authorize Top-Up <Check size={16} strokeWidth={4}/></>
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