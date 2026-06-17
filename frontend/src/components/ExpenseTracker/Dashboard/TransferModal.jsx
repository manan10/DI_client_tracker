import React, { useState, useEffect } from "react";
import { 
  X, Check, Wallet, ArrowRight, ArrowLeft, AlertCircle, Landmark, ArrowRightLeft 
} from "lucide-react";

const formatDisplayAmount = (val) => {
  if (!val) return "";
  const number = String(val).replace(/[^0-9]/g, ""); 
  return new Intl.NumberFormat('en-IN').format(number);
};

const TransferModal = ({ isOpen, setOpen, wallets, transferData, setTransferData, onSubmit, loading }) => {
  const [step, setStep] = useState(1);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep(1);
        setLocalError("");
        setTransferData({ amount: "", description: "", sourceWallet: "", targetWallet: "" });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, setTransferData]);

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
  };

  if (!isOpen) return null;

  const sourceWalletObj = wallets.find(w => w._id === transferData.sourceWallet);
  const targetWalletObj = wallets.find(w => w._id === transferData.targetWallet);
  
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
    setTransferData({ ...transferData, amount: rawValue });
  };

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    setLocalError("");
    try {
      await onSubmit(e);
    } catch (err) {
      setLocalError(err.message || "Transfer failed. Please check funds.");
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
                <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-black ${step >= s ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {s}
                </span>
                {step === s && (
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    {s === 1 && "Source"}
                    {s === 2 && "Target"}
                    {s === 3 && "Volume"}
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

          {/* STEP 1: SELECT SOURCE */}
          {step === 1 && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="text-left">
                <h2 className="text-xl sm:text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Origin Account</h2>
                <p className="text-[9px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Where is the money coming from?</p>
              </div>
              <div className="grid grid-cols-1 gap-2 pb-4">
                {wallets.filter(w => !w.isVirtual).map(w => (
                  <button 
                    key={w._id} 
                    onClick={() => { setTransferData({...transferData, sourceWallet: w._id, targetWallet: ""}); nextStep(); }}
                    className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all active:scale-[0.98] ${
                      w.isGeneralPool 
                      ? 'bg-slate-900 border-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-lg' 
                      : 'bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800'
                    } hover:border-indigo-500`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                      <div className={`p-2 rounded-lg shadow-sm shrink-0 ${w.isGeneralPool ? 'bg-indigo-500' : 'bg-white dark:bg-slate-800 text-indigo-500'}`}>
                        {w.isGeneralPool ? <Landmark size={18} className="text-white" /> : <Wallet size={18} />}
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

          {/* STEP 2: SELECT TARGET */}
          {step === 2 && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between">
                 <button onClick={prevStep} className="text-[9px] sm:text-[10px] font-black text-indigo-500 uppercase flex items-center gap-1 active:opacity-70 transition-opacity">
                    <ArrowLeft size={12} strokeWidth={3}/> Back
                 </button>
                 <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-37.5">
                   From: {sourceWalletObj?.walletName}
                 </span>
              </div>
              <div className="text-left">
                <h2 className="text-xl sm:text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Destination</h2>
                <p className="text-[9px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Who is receiving the money?</p>
              </div>
              <div className="grid grid-cols-1 gap-2 pb-4">
                {wallets.filter(w => !w.isVirtual && w._id !== transferData.sourceWallet).map(w => (
                  <button 
                    key={w._id} 
                    onClick={() => { setTransferData({...transferData, targetWallet: w._id}); nextStep(); }}
                    className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all active:scale-[0.98] ${
                      w.isGeneralPool 
                      ? 'bg-slate-900 border-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-lg' 
                      : 'bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800'
                    } hover:border-indigo-500`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                      <div className={`p-2 rounded-lg shadow-sm shrink-0 ${w.isGeneralPool ? 'bg-indigo-500' : 'bg-white dark:bg-slate-800 text-indigo-500'}`}>
                        {w.isGeneralPool ? <Landmark size={18} className="text-white" /> : <Wallet size={18} />}
                      </div>
                      <div className="text-left truncate">
                        <span className={`text-[11px] sm:text-xs font-black uppercase tracking-widest truncate block ${w.isGeneralPool ? 'text-white dark:text-slate-900' : 'text-slate-700 dark:text-slate-200'}`}>
                          {w.walletName}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-bold shrink-0 ${w.isGeneralPool ? 'text-white/60 dark:text-slate-400' : 'text-slate-400'}`}>
                      ₹{w.balance?.toLocaleString('en-IN') || 0}
                    </span>
                  </button>
                ))}
                {wallets.filter(w => !w.isVirtual && w._id !== transferData.sourceWallet).length === 0 && (
                   <div className="p-4 text-center text-slate-400 text-xs font-bold uppercase tracking-widest border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      No other wallets available
                   </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: AMOUNT & REVIEW */}
          {step === 3 && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between">
                 <button onClick={prevStep} className="text-[9px] sm:text-[10px] font-black text-indigo-500 uppercase flex items-center gap-1 active:opacity-70 transition-opacity">
                    <ArrowLeft size={12} strokeWidth={3}/> Back
                 </button>
              </div>
              
              <div className="text-left">
                <h2 className="text-xl sm:text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Transfer Volume</h2>
              </div>

              {/* Amount Input */}
              <div className="relative border-b-2 border-slate-100 dark:border-slate-800 focus-within:border-indigo-500 transition-colors pt-2 mb-6">
                <span className="absolute left-0 bottom-4 sm:bottom-6 text-3xl sm:text-4xl font-[1000] text-slate-300 dark:text-slate-700 italic">₹</span>
                <input
                    type="text"
                    inputMode="numeric"
                    autoFocus 
                    placeholder="0"
                    className="w-full bg-transparent pt-4 pb-4 sm:pb-6 pl-8 sm:pl-10 text-4xl sm:text-6xl font-[1000] text-slate-900 dark:text-white outline-none"
                    value={formatDisplayAmount(transferData.amount)} 
                    onChange={handleAmountChange}
                />
              </div>

              {/* Pathway Visualizer */}
              <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                 <div className="w-1/2 pr-2 text-left">
                   <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Debited From</p>
                   <p className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest truncate">
                     {sourceWalletObj?.walletName}
                   </p>
                 </div>
                 <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-md z-10">
                   <ArrowRightLeft size={14} strokeWidth={3} />
                 </div>
                 <div className="w-1/2 pl-2 text-right">
                   <p className="text-[7px] sm:text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1">Credited To</p>
                   <p className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest truncate">
                     {targetWalletObj?.walletName}
                   </p>
                 </div>
              </div>

              {/* Description Input */}
              <div className="space-y-2 text-left pt-2">
                 <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Memo (Optional)</label>
                 <textarea 
                   rows="2" placeholder="Note down reason..."
                   className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-[11px] font-bold text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-indigo-500/20 transition-all no-scrollbar"
                   value={transferData.description} onChange={(e) => setTransferData({...transferData, description: e.target.value})} 
                 />
               </div>

              <button 
                disabled={!transferData.amount || Number(transferData.amount) <= 0 || loading}
                onClick={handleFinalSubmit}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-14 sm:h-16 rounded-2xl font-black uppercase text-[10px] sm:text-[11px] tracking-[0.3em] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-indigo-500/20"
              >
                {loading ? (
                   <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                 ) : (
                   <>Authorize Transfer <Check size={16} strokeWidth={4}/></>
                 )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferModal;