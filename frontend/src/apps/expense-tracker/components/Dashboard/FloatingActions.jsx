import React, { useState, useEffect } from "react";
import {
  Plus,
  ArrowDownToLine,
  ReceiptIndianRupee,
  ArrowRightLeft,
  ChevronRight,
} from "lucide-react";

const FloatingActions = ({ onOpenExpense, onOpenTopUp, onOpenTransfer }) => {
  const [isOpen, setIsOpen] = useState(false);

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

  const handleAction = (actionCallback) => {
    setIsOpen(false);
    setTimeout(() => {
      if (actionCallback) actionCallback();
    }, 150);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-stone-950/35 dark:bg-stone-950/65 backdrop-blur-xs transition-all duration-300 ease-out z-90 ${
          isOpen
            ? "opacity-100 pointer-events-auto visible"
            : "opacity-0 pointer-events-none invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Action Container anchored to Bottom Right */}
      <div
        style={{ fontFamily: "'Nunito Sans', sans-serif" }}
        className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-100 flex flex-col items-end select-none pointer-events-none"
      >
        {/* Unified Command Menu Card */}
        <div
          className={`mb-4 w-64 sm:w-72 bg-white dark:bg-[#1A1C20] border border-stone-200/90 dark:border-white/[0.08] rounded-2xl shadow-2xl origin-bottom-right transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
            isOpen
              ? "scale-100 opacity-100 translate-y-0 pointer-events-auto visible"
              : "scale-90 opacity-0 translate-y-4 pointer-events-none invisible"
          }`}
        >
          {/* Header */}
          <div className="px-5 py-3 border-b border-stone-200/80 dark:border-white/[0.07] bg-[#FAF9F6] dark:bg-[#16181C]">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
              Quick Actions
            </span>
          </div>

          {/* Action List */}
          <div className="p-2 space-y-1">
            {/* Primary Action: Expense */}
            <button
              type="button"
              onClick={() => handleAction(onOpenExpense)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-700/[0.06] dark:hover:bg-[#E88D96]/[0.08] transition-colors group outline-none touch-manipulation cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-700/[0.08] dark:bg-[#E88D96]/15 flex items-center justify-center text-rose-700 dark:text-[#F09BA3] group-hover:scale-105 transition-transform shrink-0">
                <ReceiptIndianRupee size={18} strokeWidth={2.2} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div
                  style={{ fontFamily: "'Lora', serif" }}
                  className="text-sm font-bold tracking-tight text-stone-950 dark:text-stone-50 truncate"
                >
                  Add Expense
                </div>
                <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 truncate">
                  Record a new expense
                </div>
              </div>
              <ChevronRight
                size={14}
                className="text-stone-300 dark:text-stone-600 group-hover:text-rose-700 dark:group-hover:text-[#F09BA3] transition-colors shrink-0"
              />
            </button>

            {/* Secondary Action: Top Up */}
            <button
              type="button"
              onClick={() => handleAction(onOpenTopUp)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-700/[0.06] dark:hover:bg-[#4EA885]/[0.1] transition-colors group outline-none touch-manipulation cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-700/10 dark:bg-[#4EA885]/15 flex items-center justify-center text-emerald-700 dark:text-[#68C19D] group-hover:scale-105 transition-transform shrink-0">
                <ArrowDownToLine size={18} strokeWidth={2.2} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div
                  style={{ fontFamily: "'Lora', serif" }}
                  className="text-sm font-bold tracking-tight text-stone-950 dark:text-stone-50 truncate"
                >
                  Top-Up Wallet
                </div>
                <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 truncate">
                  Add money to a wallet
                </div>
              </div>
              <ChevronRight
                size={14}
                className="text-stone-300 dark:text-stone-600 group-hover:text-emerald-700 dark:group-hover:text-[#68C19D] transition-colors shrink-0"
              />
            </button>

            {/* Secondary Action: Transfer */}
            <button
              type="button"
              onClick={() => handleAction(onOpenTransfer)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-100/80 dark:hover:bg-white/[0.05] transition-colors group outline-none touch-manipulation cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-white/[0.06] flex items-center justify-center text-stone-700 dark:text-stone-200 group-hover:scale-105 transition-transform shrink-0">
                <ArrowRightLeft size={18} strokeWidth={2.2} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div
                  style={{ fontFamily: "'Lora', serif" }}
                  className="text-sm font-bold tracking-tight text-stone-950 dark:text-stone-50 truncate"
                >
                  Internal Transfer
                </div>
                <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 truncate">
                  Move funds between wallets
                </div>
              </div>
              <ChevronRight
                size={14}
                className="text-stone-300 dark:text-stone-600 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition-colors shrink-0"
              />
            </button>
          </div>
        </div>

        {/* Master FAB Toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`pointer-events-auto relative flex items-center justify-center w-14 h-14 md:w-15 md:h-15 rounded-full shadow-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none active:scale-90 z-10 touch-manipulation cursor-pointer ${
            isOpen
              ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950"
              : "bg-emerald-700 hover:bg-emerald-800 dark:bg-[#4EA885] dark:hover:bg-[#68C19D] text-white dark:text-[#121315] shadow-[0_8px_28px_rgba(4,120,87,0.28)]"
          }`}
          aria-label="Toggle Menu"
        >
          <Plus
            size={24}
            strokeWidth={2.5}
            className={`transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isOpen
                ? "rotate-45 scale-110 text-stone-300 dark:text-stone-600"
                : "rotate-0 scale-100"
            }`}
          />
        </button>
      </div>
    </>
  );
};

export default FloatingActions;
