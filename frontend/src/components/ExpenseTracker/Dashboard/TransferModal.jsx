import React, { useState, useEffect } from "react";
import { 
  X, Check, Wallet, ArrowRight, ArrowLeft, AlertCircle, Landmark 
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
      {/* Darker, flatter backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-[#020617]/80 backdrop-blur-sm transition-opacity" onClick={handleClose} />
      
      {/* SaaS Geometric Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0B1120] rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border-t sm:border border-slate-200 dark:border-white/10">
        
        {/* HEADER / NAVIGATION COMMAND BAR */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B1120] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                disabled={step < s || loading}
                onClick={() => setStep(s)}
                className={`flex items-center gap-2 transition-all outline-none ${step === s ? 'opacity-100' : 'opacity-40'}`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= s ? 'bg-amber-600 dark:bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                  {s}
                </span>
                {step === s && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                    {s === 1 && "Source"}
                    {s === 2 && "Target"}
                    {s === 3 && "Details"}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button 
            onClick={handleClose} 
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-500 active:scale-95 outline-none"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* SCROLLABLE WORKSPACE */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 sm:p-6 pb-8 sm:pb-6">
          
          {localError && (
            <div className="mb-5 flex items-start gap-2.5 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg">
              <AlertCircle size={14} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[10px] sm:text-xs font-semibold text-rose-700 dark:text-rose-300 leading-snug">
                {localError}
              </p>
            </div>
          )}

          {/* STEP 1: SELECT SOURCE */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="text-left mb-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Select Origin Wallet</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select the wallet from which you want to transfer funds.</p>
              </div>
              <div className="flex flex-col gap-2.5">
                {wallets.filter(w => !w.isVirtual).map(w => (
                  <button 
                    key={w._id} 
                    onClick={() => { setTransferData({...transferData, sourceWallet: w._id, targetWallet: ""}); nextStep(); }}
                    className={`flex items-center justify-between p-3.5 rounded-lg border transition-all text-left outline-none ${
                      w.isGeneralPool 
                      ? 'bg-slate-900 border-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-sm' 
                      : 'bg-white border-slate-200 dark:bg-[#0B1120] dark:border-white/10 hover:border-amber-500 dark:hover:border-amber-500'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden min-w-0">
                      <div className={`p-2 rounded-md shrink-0 ${w.isGeneralPool ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                        {w.isGeneralPool ? <Landmark size={16} /> : <Wallet size={16} />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm font-semibold truncate ${w.isGeneralPool ? 'text-white dark:text-slate-900' : 'text-slate-900 dark:text-white'}`}>
                          {w.walletName}
                        </span>
                        {w.isGeneralPool && <p className="text-[9px] font-bold uppercase tracking-wider opacity-60 mt-0.5">Master Pool</p>}
                      </div>
                    </div>
                    <span className={`text-sm font-bold tabular-nums shrink-0 pl-3 ${w.isGeneralPool ? 'text-white/80 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'}`}>
                      ₹{w.balance?.toLocaleString('en-IN') || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT TARGET */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 mb-2">
                <button onClick={prevStep} className="p-1 -ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors outline-none">
                  <ArrowLeft size={16} />
                </button>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">Select Destination Wallet</h2>
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest truncate">From: {sourceWalletObj?.walletName}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {wallets.filter(w => !w.isVirtual && w._id !== transferData.sourceWallet).map(w => (
                  <button 
                    key={w._id} 
                    onClick={() => { setTransferData({...transferData, targetWallet: w._id}); nextStep(); }}
                    className={`flex items-center justify-between p-3.5 rounded-lg border transition-all text-left outline-none ${
                      w.isGeneralPool 
                      ? 'bg-slate-900 border-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-sm' 
                      : 'bg-white border-slate-200 dark:bg-[#0B1120] dark:border-white/10 hover:border-amber-500 dark:hover:border-amber-500'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden min-w-0">
                      <div className={`p-2 rounded-md shrink-0 ${w.isGeneralPool ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                        {w.isGeneralPool ? <Landmark size={16} /> : <Wallet size={16} />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm font-semibold truncate ${w.isGeneralPool ? 'text-white dark:text-slate-900' : 'text-slate-900 dark:text-white'}`}>
                          {w.walletName}
                        </span>
                      </div>
                    </div>
                    <span className={`text-sm font-bold tabular-nums shrink-0 pl-3 ${w.isGeneralPool ? 'text-white/80 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'}`}>
                      ₹{w.balance?.toLocaleString('en-IN') || 0}
                    </span>
                  </button>
                ))}
                {wallets.filter(w => !w.isVirtual && w._id !== transferData.sourceWallet).length === 0 && (
                   <div className="p-6 text-center text-slate-400 text-xs font-bold uppercase tracking-widest border border-dashed border-slate-200 dark:border-white/10 rounded-lg">
                      No matching targets
                   </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: AMOUNT & DETAILS */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2">
                <button onClick={prevStep} className="p-1 -ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors outline-none">
                  <ArrowLeft size={16} />
                </button>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">Transfer Details</h2>
              </div>

              {/* Amount Input */}
              <div className="relative border-b border-slate-200 dark:border-white/10 focus-within:border-amber-500 transition-colors pt-2">
                <span className="absolute left-0 bottom-3 text-2xl font-bold text-slate-400 dark:text-slate-600">₹</span>
                <input
                    type="text"
                    inputMode="numeric"
                    autoFocus 
                    placeholder="0"
                    className="w-full bg-transparent pb-3 pl-8 text-3xl sm:text-4xl font-bold tabular-nums text-slate-900 dark:text-white outline-none placeholder:text-slate-200 dark:placeholder:text-slate-800"
                    value={formatDisplayAmount(transferData.amount)} 
                    onChange={handleAmountChange}
                />
              </div>

              {/* Pathway Visualizer */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-white/5">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">From</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{sourceWalletObj?.walletName}</p>
                </div>
                <div className="shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 shadow-sm">
                  <ArrowRight size={14} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0 pl-2 text-right">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">To</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{targetWalletObj?.walletName}</p>
                </div>
              </div>

              {/* Memo Input */}
              <div className="space-y-1.5 pt-2">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Comments (Optional)</label>
                 <textarea 
                   rows="2" 
                   placeholder="Add details..."
                   className="w-full bg-white dark:bg-[#0B1120] p-3 rounded-lg text-sm text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-white/10 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all no-scrollbar placeholder:text-slate-400 dark:placeholder:text-slate-600"
                   value={transferData.description} 
                   onChange={(e) => setTransferData({...transferData, description: e.target.value})} 
                 />
              </div>

              {/* Submission Command */}
              <div className="pt-2">
                <button 
                  disabled={!transferData.amount || Number(transferData.amount) <= 0 || loading}
                  onClick={handleFinalSubmit}
                  className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-600 dark:focus-visible:ring-offset-[#0B1120]"
                >
                  {loading ? (
                     <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                   ) : (
                     <>Complete Transfer <Check size={16} strokeWidth={3}/></>
                   )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferModal;