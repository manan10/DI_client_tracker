import React, { useState, useEffect, useRef } from "react";
import { X, Scale, AlertCircle, RefreshCw } from "lucide-react";

const formatDisplayAmount = (val) => {
  if (val === "" || val === undefined) return "";
  const number = String(val).replace(/[^0-9]/g, "");
  return new Intl.NumberFormat("en-IN").format(number);
};

const ReconcileModal = ({ isOpen, setOpen, wallet, onSubmit, loading }) => {
  const [actualAmount, setActualAmount] = useState(
    String(wallet?.balance ?? 0)
  );
  const [localError, setLocalError] = useState("");
  const amountInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (window.innerWidth >= 768 && amountInputRef.current) {
        amountInputRef.current.focus();
      }
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !wallet) return null;

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

  const currentBalance = wallet.balance || 0;
  const newBalance = Number(actualAmount || 0);
  const difference = newBalance - currentBalance;

  const isMissingCash = difference < 0;
  const isBalanced = difference === 0;

  return (
    <div
      style={{ fontFamily: "'Nunito Sans', sans-serif" }}
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 text-left"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#1A1C20] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border-t sm:border border-stone-200/90 dark:border-white/[0.08] z-10 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* COMMAND HEADER */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-stone-200/80 dark:border-white/[0.07] bg-[#FAF9F6] dark:bg-[#16181C] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-700/10 dark:bg-amber-400/15 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <Scale size={14} strokeWidth={2.3} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-700 dark:text-stone-300">
              Wallet Reconciliation
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 hover:bg-stone-200/60 dark:hover:bg-white/[0.06] rounded-lg transition-colors text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 active:scale-95 outline-none cursor-pointer"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {localError && (
            <div className="flex items-start gap-2.5 p-3 bg-rose-700/[0.08] dark:bg-[#E88D96]/15 border border-rose-700/20 dark:border-[#E88D96]/25 rounded-xl animate-in fade-in slide-in-from-top-2">
              <AlertCircle
                size={14}
                className="text-rose-700 dark:text-[#F09BA3] shrink-0 mt-0.5"
              />
              <p className="text-xs font-semibold text-rose-700 dark:text-[#F09BA3] leading-snug">
                {localError}
              </p>
            </div>
          )}

          <div className="text-left space-y-1">
            <h2
              style={{ fontFamily: "'Lora', serif" }}
              className="text-lg sm:text-xl font-bold tracking-tight text-stone-950 dark:text-stone-50 truncate"
            >
              {wallet.walletName}
            </h2>
            <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              Ledger Balance:{" "}
              <span
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                className="font-bold tabular-nums text-stone-800 dark:text-stone-200"
              >
                ₹{currentBalance.toLocaleString("en-IN")}
              </span>
            </p>
          </div>

          <div className="relative border-b border-stone-200 dark:border-white/[0.09] focus-within:border-emerald-700 dark:focus-within:border-[#4EA885] transition-colors pt-4">
            <p className="text-[10px] font-bold text-emerald-700 dark:text-[#68C19D] uppercase tracking-[0.12em] absolute top-0 left-0">
              Actual Physical Balance
            </p>
            <span
              style={{ fontFamily: "'Lora', serif" }}
              className="absolute left-0 bottom-3 text-2xl font-bold text-stone-400 dark:text-stone-500"
            >
              ₹
            </span>
            <input
              ref={amountInputRef}
              type="text"
              inputMode="numeric"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="w-full bg-transparent pb-3 pl-7 text-3xl sm:text-4xl font-bold tabular-nums text-stone-950 dark:text-stone-50 outline-none placeholder:text-stone-300 dark:placeholder:text-stone-700"
              value={formatDisplayAmount(actualAmount)}
              onChange={handleAmountChange}
              placeholder="0"
            />
          </div>

          {/* Dynamic Difference Display */}
          <div
            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
              isBalanced
                ? "bg-[#FAF9F6] border-stone-200/80 dark:bg-[#16181C] dark:border-white/[0.07]"
                : isMissingCash
                ? "bg-rose-700/[0.06] border-rose-700/20 dark:bg-[#E88D96]/12 dark:border-[#E88D96]/25"
                : "bg-emerald-700/[0.07] border-emerald-700/20 dark:bg-[#4EA885]/12 dark:border-[#4EA885]/25"
            }`}
          >
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
                Difference
              </span>
              <span
                className={`text-xs font-bold truncate mt-0.5 ${
                  isBalanced
                    ? "text-stone-600 dark:text-stone-300"
                    : isMissingCash
                    ? "text-rose-700 dark:text-[#F09BA3]"
                    : "text-emerald-700 dark:text-[#68C19D]"
                }`}
              >
                {isBalanced
                  ? "Perfect match"
                  : isMissingCash
                  ? "Funds missing"
                  : "Surplus funds"}
              </span>
            </div>
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className={`text-base font-bold tabular-nums tracking-tight shrink-0 ${
                isBalanced
                  ? "text-stone-400 dark:text-stone-500"
                  : isMissingCash
                  ? "text-rose-700 dark:text-[#F09BA3]"
                  : "text-emerald-700 dark:text-[#68C19D]"
              }`}
            >
              {isBalanced
                ? "₹0"
                : isMissingCash
                ? `-₹${Math.abs(difference).toLocaleString("en-IN")}`
                : `+₹${Math.abs(difference).toLocaleString("en-IN")}`}
            </span>
          </div>

          <div className="pt-1">
            <button
              type="button"
              disabled={loading || isBalanced || actualAmount === ""}
              onClick={handleFinalSubmit}
              className="w-full bg-emerald-700 hover:bg-emerald-800 dark:bg-[#4EA885] dark:hover:bg-[#68C19D] text-white dark:text-[#121315] h-12 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 outline-none transition-all shadow-2xs cursor-pointer"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white dark:border-stone-900/30 dark:border-t-stone-900" />
              ) : (
                <>
                  Perform Correction <RefreshCw size={14} strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReconcileModal;
