import React, { useState, useEffect } from "react";
import { X, Check, Scale, AlertCircle } from "lucide-react";

// Helper for Indian Currency Formatting during typing
const formatDisplayAmount = (val) => {
  if (val === "" || val === undefined) return "";
  const number = String(val).replace(/[^0-9]/g, ""); 
  return new Intl.NumberFormat('en-IN').format(number);
};

const ReconcileModal = ({ isOpen, setOpen, wallet, onSubmit, loading }) => {
  const [actualAmount, setActualAmount] = useState("");
  const [localError, setLocalError] = useState("");

  // --- Derived State (Fixes the set-state-in-effect warning) ---
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const [prevWallet, setPrevWallet] = useState(null);

  if (isOpen && (!prevIsOpen || wallet?._id !== prevWallet?._id)) {
    setActualAmount(String(wallet?.balance || 0));
    setLocalError("");
    setPrevIsOpen(true);
    setPrevWallet(wallet);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }
  // -------------------------------------------------------------

  // We still use a delayed effect to clear the form *after* the modal closes
  // so the numbers don't vanish while the fade-out animation plays.
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setActualAmount("");
        setLocalError("");
        setPrevWallet(null); 
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    setActualAmount(rawValue);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    try {
      await onSubmit(wallet._id, actualAmount);
    } catch (err) {
      setLocalError(err.message || "Reconciliation failed.");
    }
  };

  if (!isOpen || !wallet) return null;

  const currentBalance = wallet.balance || 0;
  const newBalance = Number(actualAmount || 0);
  const difference = newBalance - currentBalance;
  
  const isMissingCash = difference < 0;
  const isBalanced = difference === 0;

  return (
    <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 text-left">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={handleClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-[#020617] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border-t sm:border border-white/10 transition-transform">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Scale size={16} strokeWidth={3} />
            </div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                Quick Sync
            </span>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 active:scale-90">
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {localError && (
            <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest leading-tight">
                {localError}
              </p>
            </div>
          )}

          <div className="text-left space-y-1">
            <h2 className="text-xl sm:text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">
                {wallet.walletName}
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                System Balance: ₹{currentBalance.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="relative border-b-2 border-slate-100 dark:border-slate-800 focus-within:border-amber-500 transition-colors pt-2">
            <p className="text-[8px] sm:text-[9px] font-black text-amber-500 uppercase tracking-widest absolute top-0 left-0">
                Actual Cash In Hand
            </p>
            <span className="absolute left-0 bottom-3 sm:bottom-4 text-3xl font-[1000] text-slate-300 dark:text-slate-700 italic">₹</span>
            <input
                type="text"
                inputMode="numeric"
                autoFocus 
                className="w-full bg-transparent pt-6 pb-3 sm:pb-4 pl-8 text-4xl sm:text-5xl font-[1000] text-slate-900 dark:text-white outline-none"
                value={formatDisplayAmount(actualAmount)} 
                onChange={handleAmountChange}
            />
          </div>

          {/* Dynamic Difference Display */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
              isBalanced ? 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700' : 
              isMissingCash ? 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20' : 
              'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20'
          }`}>
             <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Adjustment
             </span>
             <span className={`text-sm sm:text-base font-[1000] tracking-tight ${
                 isBalanced ? 'text-slate-400' : 
                 isMissingCash ? 'text-red-500' : 'text-emerald-500'
             }`}>
                {isBalanced ? 'Perfectly Synced' : 
                 isMissingCash ? `-₹${Math.abs(difference).toLocaleString('en-IN')} (Missing)` : 
                 `+₹${Math.abs(difference).toLocaleString('en-IN')} (Extra)`}
             </span>
          </div>

          <button 
            disabled={loading || isBalanced || actualAmount === ""}
            onClick={handleFinalSubmit}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white h-14 sm:h-16 rounded-2xl font-black uppercase text-[10px] sm:text-[11px] tracking-[0.3em] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-30 disabled:hover:bg-amber-500 transition-all shadow-xl shadow-amber-500/20"
          >
            {loading ? (
               <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
             ) : (
               <>True-Up Balance <Check size={16} strokeWidth={4}/></>
             )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReconcileModal;