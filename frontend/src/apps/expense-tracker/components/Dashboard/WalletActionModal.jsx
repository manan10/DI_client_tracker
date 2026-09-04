import React, { useEffect } from "react";
import {
  X,
  ReceiptIndianRupee,
  ArrowDownToLine,
  ArrowRightLeft,
  RefreshCw,
  ChevronRight,
  Wallet,
  Landmark,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { getWalletColor } from "./walletUtils";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    amount || 0,
  );
};

const WalletActionModal = ({
  isOpen,
  onClose,
  wallet,
  wallets = [],
  onOpenExpense,
  onOpenTopUp,
  onOpenTransfer,
  onOpenReconcile,
}) => {
  const isCash = !wallet?.isVirtual;

  // Derive the wallet's exact chromatic palette
  const walletIndex = wallets.findIndex((w) => w._id === wallet?._id);
  const palette = wallet
    ? getWalletColor(wallet._id || wallet.walletName, walletIndex >= 0 ? walletIndex : null)
    : null;

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Keyboard accessibility shortcuts
  useEffect(() => {
    if (!isOpen || !wallet) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "1" || e.key.toLowerCase() === "e") {
        e.preventDefault();
        onClose();
        if (onOpenExpense) onOpenExpense(wallet);
      } else if (e.key === "2" || e.key.toLowerCase() === "t") {
        e.preventDefault();
        onClose();
        if (onOpenTopUp) onOpenTopUp(wallet);
      } else if (e.key === "3" || e.key.toLowerCase() === "f") {
        e.preventDefault();
        onClose();
        if (onOpenTransfer) onOpenTransfer(wallet);
      } else if ((e.key === "4" || e.key.toLowerCase() === "r") && isCash) {
        e.preventDefault();
        onClose();
        if (onOpenReconcile) onOpenReconcile(wallet);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    wallet,
    isCash,
    onClose,
    onOpenExpense,
    onOpenTopUp,
    onOpenTransfer,
    onOpenReconcile,
  ]);

  if (!isOpen || !wallet || !palette) return null;

  const handleAction = (callback) => {
    if (callback) {
      onClose();
      callback(wallet);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 text-left">
      {/* Universal Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog with Chromatic Top Accent Indicator */}
      <div
        className={`relative w-full sm:max-w-md bg-white dark:bg-[#0B1120] border ${palette.border} rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200`}
      >
        {/* Card Color Matching Glow Stripe */}
        <div className={`absolute top-0 inset-x-0 h-1.5 ${palette.indicator}`} />

        {/* Header Strip */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-white/2 flex items-center justify-between pt-5">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${palette.iconBox}`}>
              {isCash ? (
                wallet.isGeneralPool ? <Landmark size={20} /> : <Wallet size={20} />
              ) : (
                <Smartphone size={20} />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${palette.accent}`}>
                {isCash ? "Cash Vault Node" : "Digital Account"}
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white wrap-break-word leading-tight">
                {wallet.walletName}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
            aria-label="Close action menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Balance Status Banner (Matching Palette) */}
        <div className="px-5 py-3.5 bg-slate-100/60 dark:bg-white/1 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Current Balance
          </span>
          <span className={`text-xl font-mono font-[1000] tabular-nums ${palette.accent}`}>
            ₹{formatINR(wallet.balance)}
          </span>
        </div>

        {/* Action Menu List */}
        <div className="p-3 flex flex-col gap-1.5" role="menu">
          {/* Action 1: Expense */}
          <button
            type="button"
            role="menuitem"
            onClick={() => handleAction(onOpenExpense)}
            className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-rose-50/70 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30 transition-all text-left cursor-pointer group focus-visible:ring-2 focus-visible:ring-rose-500 outline-none"
          >
            <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ReceiptIndianRupee size={18} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Add Expense</span>
                <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/10 px-1.5 py-0.2 rounded-xs">
                  [1]
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Record direct spending from this account
              </div>
            </div>
            <ChevronRight
              size={16}
              className="text-slate-300 dark:text-slate-600 group-hover:text-rose-500 transition-colors"
            />
          </button>

          {/* Action 2: Top-Up */}
          <button
            type="button"
            role="menuitem"
            onClick={() => handleAction(onOpenTopUp)}
            className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-indigo-50/70 dark:hover:bg-indigo-500/10 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all text-left cursor-pointer group focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ArrowDownToLine size={18} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Top-Up Wallet</span>
                <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/10 px-1.5 py-0.2 rounded-xs">
                  [2]
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Deposit or add funds into account
              </div>
            </div>
            <ChevronRight
              size={16}
              className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors"
            />
          </button>

          {/* Action 3: Transfer */}
          <button
            type="button"
            role="menuitem"
            onClick={() => handleAction(onOpenTransfer)}
            className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-amber-50/70 dark:hover:bg-amber-500/10 border border-transparent hover:border-amber-200 dark:hover:border-amber-500/30 transition-all text-left cursor-pointer group focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ArrowRightLeft size={18} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Internal Transfer</span>
                <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/10 px-1.5 py-0.2 rounded-xs">
                  [3]
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Move funds between treasury accounts
              </div>
            </div>
            <ChevronRight
              size={16}
              className="text-slate-300 dark:text-slate-600 group-hover:text-amber-500 transition-colors"
            />
          </button>

          {/* Action 4: Reconcile / Synchronized Status */}
          {isCash ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => handleAction(onOpenReconcile)}
              className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-emerald-50/70 dark:hover:bg-emerald-500/10 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all text-left cursor-pointer group focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <RefreshCw size={18} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Reconcile Cash</span>
                  <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/10 px-1.5 py-0.2 rounded-xs">
                    [4]
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Audit physical cash and log adjustments
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors"
              />
            </button>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-white/2 rounded-xl flex items-center gap-2.5 text-slate-400 border border-slate-100 dark:border-white/5">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
              <span className="text-[11px] font-medium">Automatic bank synchronization active.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletActionModal;