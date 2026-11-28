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

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    amount || 0
  );
};

const WalletActionModal = ({
  isOpen,
  onClose,
  wallet,
  onOpenExpense,
  onOpenTopUp,
  onOpenTransfer,
  onOpenReconcile,
}) => {
  const isCash = !wallet?.isVirtual;

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

  if (!isOpen || !wallet) return null;

  const handleAction = (callback) => {
    if (callback) {
      onClose();
      callback(wallet);
    }
  };

  return (
    <div
      style={{ fontFamily: "'Nunito Sans', sans-serif" }}
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 text-left"
    >
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full sm:max-w-md bg-white dark:bg-[#1A1C20] border-t sm:border border-stone-200/90 dark:border-white/[0.08] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Subtle Sage Top Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-emerald-700 dark:bg-[#4EA885]" />

        {/* Header Strip */}
        <div className="px-5 py-4 pt-5 border-b border-stone-200/80 dark:border-white/[0.07] bg-[#FAF9F6] dark:bg-[#16181C] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/10 dark:bg-[#4EA885]/15 text-emerald-700 dark:text-[#68C19D] flex items-center justify-center shrink-0">
              {isCash ? (
                wallet.isGeneralPool ? (
                  <Landmark size={18} />
                ) : (
                  <Wallet size={18} />
                )
              ) : (
                <Smartphone size={18} />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700 dark:text-[#68C19D]">
                {isCash ? "Cash Wallet" : "Digital Channel"}
              </span>
              <h3
                style={{ fontFamily: "'Lora', serif" }}
                className="text-base sm:text-lg font-bold tracking-tight text-stone-950 dark:text-stone-50 truncate leading-tight"
              >
                {wallet.walletName}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-white/[0.06] transition-colors cursor-pointer outline-none"
            aria-label="Close action menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Balance Status Banner */}
        <div className="px-5 py-3.5 bg-stone-50/70 dark:bg-white/[0.02] border-b border-stone-200/70 dark:border-white/[0.06] flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
            Current Balance
          </span>
          <span
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-xl font-bold tabular-nums tracking-tight text-emerald-700 dark:text-[#68C19D]"
          >
            {isCash ? `₹${formatINR(wallet.balance)}` : "Digital Sync"}
          </span>
        </div>

        {/* Action Menu List */}
        <div className="p-3 flex flex-col gap-1" role="menu">
          {/* Action 1: Expense */}
          <button
            type="button"
            role="menuitem"
            onClick={() => handleAction(onOpenExpense)}
            className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-rose-700/[0.06] dark:hover:bg-[#E88D96]/[0.08] transition-all text-left cursor-pointer group outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-700/[0.08] dark:bg-[#E88D96]/15 text-rose-700 dark:text-[#F09BA3] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ReceiptIndianRupee size={18} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  style={{ fontFamily: "'Lora', serif" }}
                  className="text-sm font-bold text-stone-950 dark:text-stone-50"
                >
                  Add Expense
                </span>
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="text-[9.5px] font-bold text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-white/10 px-1.5 py-0.2 rounded"
                >
                  1
                </span>
              </div>
              <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                Record direct spending from this account
              </div>
            </div>
            <ChevronRight
              size={16}
              className="text-stone-300 dark:text-stone-600 group-hover:text-rose-700 dark:group-hover:text-[#F09BA3] transition-colors"
            />
          </button>

          {/* Action 2: Top-Up */}
          <button
            type="button"
            role="menuitem"
            onClick={() => handleAction(onOpenTopUp)}
            className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-emerald-700/[0.06] dark:hover:bg-[#4EA885]/[0.1] transition-all text-left cursor-pointer group outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-700/10 dark:bg-[#4EA885]/15 text-emerald-700 dark:text-[#68C19D] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ArrowDownToLine size={18} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  style={{ fontFamily: "'Lora', serif" }}
                  className="text-sm font-bold text-stone-950 dark:text-stone-50"
                >
                  Top-Up Wallet
                </span>
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="text-[9.5px] font-bold text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-white/10 px-1.5 py-0.2 rounded"
                >
                  2
                </span>
              </div>
              <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                Deposit or allocate funds into account
              </div>
            </div>
            <ChevronRight
              size={16}
              className="text-stone-300 dark:text-stone-600 group-hover:text-emerald-700 dark:group-hover:text-[#68C19D] transition-colors"
            />
          </button>

          {/* Action 3: Transfer */}
          <button
            type="button"
            role="menuitem"
            onClick={() => handleAction(onOpenTransfer)}
            className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-stone-100/80 dark:hover:bg-white/[0.05] transition-all text-left cursor-pointer group outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-white/[0.06] text-stone-700 dark:text-stone-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ArrowRightLeft size={18} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  style={{ fontFamily: "'Lora', serif" }}
                  className="text-sm font-bold text-stone-950 dark:text-stone-50"
                >
                  Internal Transfer
                </span>
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="text-[9.5px] font-bold text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-white/10 px-1.5 py-0.2 rounded"
                >
                  3
                </span>
              </div>
              <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                Move funds between cash wallets
              </div>
            </div>
            <ChevronRight
              size={16}
              className="text-stone-300 dark:text-stone-600 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition-colors"
            />
          </button>

          {/* Action 4: Reconcile / Synchronized Status */}
          {isCash ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => handleAction(onOpenReconcile)}
              className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-amber-700/[0.06] dark:hover:bg-amber-400/[0.08] transition-all text-left cursor-pointer group outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-700/10 dark:bg-amber-400/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <RefreshCw size={18} strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    style={{ fontFamily: "'Lora', serif" }}
                    className="text-sm font-bold text-stone-950 dark:text-stone-50"
                  >
                    Reconcile Cash
                  </span>
                  <span
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    className="text-[9.5px] font-bold text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-white/10 px-1.5 py-0.2 rounded"
                  >
                    4
                  </span>
                </div>
                <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                  Audit physical cash and log adjustments
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-stone-300 dark:text-stone-600 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors"
              />
            </button>
          ) : (
            <div className="mx-1 my-1 p-3 bg-[#FAF9F6] dark:bg-[#16181C] rounded-xl flex items-center gap-2.5 text-stone-500 dark:text-stone-400 border border-stone-200/70 dark:border-white/[0.06]">
              <ShieldCheck
                size={16}
                className="text-emerald-700 dark:text-[#68C19D] shrink-0"
              />
              <span className="text-[11px] font-medium">
                Digital channel tracked directly in ledger.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletActionModal;
