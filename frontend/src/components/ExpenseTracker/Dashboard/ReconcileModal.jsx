import React, { useState, useEffect, useRef } from "react";
import { X, Check, Scale, AlertCircle, RefreshCw } from "lucide-react";

// Helper for Indian Currency Formatting during typing
const formatDisplayAmount = (val) => {
  if (val === "" || val === undefined) return "";
  const number = String(val).replace(/[^0-9]/g, ""); 
  return new Intl.NumberFormat('en-IN').format(number);
};

const ReconcileModal = ({ isOpen, setOpen, wallet, onSubmit, loading }) => {
  const [actualAmount, setActualAmount] = useState("");
  const [localError, setLocalError] = useState("");
  const amountInputRef = useRef(null);

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

  // Delayed reset
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

  // Smart Auto-Focus: Prevent mobile keyboard pop-up
  useEffect(() => {
    if (isOpen && amountInputRef.current) {
      if (window.innerWidth >= 768) {
        amountInputRef.current.focus();
      }
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
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-[#020617]/80 backdrop-blur-sm transition-opacity" onClick={handleClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-[#0B1120] rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col overflow-hidden border-t sm:border border-slate-200 dark:border-white/10 transition-transform">
        
        {/* COMMAND HEADER */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B1120] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500">
                <Scale size={14} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                Ledger Sync
            </span>
          </div>
          <button onClick={handleClose} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-500 active:scale-95 outline-none">
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {localError && (
            <div className="flex items-start gap-2.5 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={14} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[10px] sm:text-xs font-semibold text-rose-700 dark:text-rose-300 leading-snug">
                {localError}
              </p>
            </div>
          )}

          <div className="text-left space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                {wallet.walletName}
            </h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                Current System Record: <span className="font-bold tabular-nums text-slate-700 dark:text-slate-300">₹{currentBalance.toLocaleString('en-IN')}</span>
            </p>
          </div>

          <div className="relative border-b border-slate-200 dark:border-white/10 focus-within:border-amber-500 transition-colors pt-3">
            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest absolute top-0 left-0">
                True Physical Balance
            </p>
            <span className="absolute left-0 bottom-3 text-2xl font-bold text-slate-400 dark:text-slate-600">₹</span>
            <input
                ref={amountInputRef}
                type="text"
                inputMode="numeric"
                className="w-full bg-transparent pb-3 pl-8 text-3xl sm:text-4xl font-bold tabular-nums text-slate-900 dark:text-white outline-none placeholder:text-slate-200 dark:placeholder:text-slate-800"
                value={formatDisplayAmount(actualAmount)} 
                onChange={handleAmountChange}
                placeholder="0"
            />
          </div>

          {/* Dynamic Difference Display */}
          <div className={`flex items-center justify-between p-3.5 rounded-lg border transition-all ${
              isBalanced ? 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-white/5' : 
              isMissingCash ? 'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20' : 
              'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20'
          }`}>
             <div className="flex flex-col min-w-0 pr-2">
               <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                 Deviation
               </span>
               <span className={`text-xs font-semibold truncate mt-0.5 ${
                 isBalanced ? 'text-slate-600 dark:text-slate-300' :
                 isMissingCash ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'
               }`}>
                 {isBalanced ? 'Perfect match' : isMissingCash ? 'Funds missing' : 'Surplus funds'}
               </span>
             </div>
             <span className={`text-base font-bold tabular-nums tracking-tight shrink-0 ${
                 isBalanced ? 'text-slate-400 dark:text-slate-500' : 
                 isMissingCash ? 'text-rose-600 dark:text-rose-500' : 'text-emerald-600 dark:text-emerald-500'
             }`}>
                {isBalanced ? '₹0' : 
                 isMissingCash ? `-₹${Math.abs(difference).toLocaleString('en-IN')}` : 
                 `+₹${Math.abs(difference).toLocaleString('en-IN')}`}
             </span>
          </div>

          <div className="pt-2">
            <button 
              disabled={loading || isBalanced || actualAmount === ""}
              onClick={handleFinalSubmit}
              className="w-full bg-amber-500 hover:bg-amber-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 dark:focus-visible:ring-offset-[#0B1120] text-white h-12 rounded-lg font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 outline-none transition-all shadow-sm"
            >
              {loading ? (
                 <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
               ) : (
                 <>Commit Correction <RefreshCw size={14} strokeWidth={2.5}/></>
               )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReconcileModal;