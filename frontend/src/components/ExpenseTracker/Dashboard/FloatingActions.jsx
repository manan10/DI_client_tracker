import React, { useState, useEffect } from 'react';
import { Plus, ArrowDownToLine, ReceiptIndianRupee, ArrowRightLeft, ChevronRight } from 'lucide-react';

const FloatingActions = ({ onOpenExpense, onOpenTopUp, onOpenTransfer }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when the command menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleAction = (actionCallback) => {
    setIsOpen(false);
    // Slight delay to allow the menu to animate out before opening the respective modal
    setTimeout(() => actionCallback(), 150);
  };

  return (
    <>
      {/* Cinematic Blur Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 dark:bg-[#020617]/60 backdrop-blur-sm transition-opacity duration-300 ease-out z-90 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Action Container anchored to Bottom Right 
          FIX: Lifted mobile bottom from bottom-5 to bottom-24 to clear bottom nav bars 
      */}
      <div className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-100 flex flex-col items-end select-none">
        
        {/* Unified Command Menu Card */}
        <div 
          className={`mb-4 w-64 sm:w-72 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] origin-bottom-right transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
            isOpen 
              ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto' 
              : 'scale-90 opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {/* Header */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/20">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Quick Actions
            </span>
          </div>

          {/* Action List */}
          <div className="p-1.5 space-y-0.5">
            
            {/* Primary Action: Expense */}
            <button 
              onClick={() => handleAction(onOpenExpense)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 group-hover:scale-105 transition-transform shrink-0 shadow-sm">
                <ReceiptIndianRupee size={18} strokeWidth={2.5} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">Add Expense</div>
                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">Record a new expense</div>
              </div>
              <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors shrink-0" />
            </button>

            {/* Secondary Action: Top Up */}
            <button 
              onClick={() => handleAction(onOpenTopUp)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-105 transition-transform shrink-0 shadow-sm">
                <ArrowDownToLine size={18} strokeWidth={2.5} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">Top-up Wallet</div>
                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">Add money to a wallet</div>
              </div>
              <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors shrink-0" />
            </button>

            {/* Secondary Action: Transfer */}
            <button 
              onClick={() => handleAction(onOpenTransfer)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 group-hover:scale-105 transition-transform shrink-0 shadow-sm">
                <ArrowRightLeft size={18} strokeWidth={2.5} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">Internal Transfer</div>
                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">Move funds between wallets</div>
              </div>
              <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-amber-500 transition-colors shrink-0" />
            </button>

          </div>
        </div>

        {/* Master FAB Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none active:scale-90 z-10 ${
            isOpen 
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-transparent dark:border-white/10' 
              : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white shadow-[0_8px_30px_rgba(16,185,129,0.3)] border border-emerald-500 dark:border-emerald-400'
          }`}
          aria-label="Toggle Menu"
        >
          <Plus 
            size={26} 
            strokeWidth={2.5} 
            className={`transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'rotate-45 scale-110 text-slate-500 dark:text-slate-400' : 'rotate-0 scale-100'}`} 
          />
        </button>

      </div>
    </>
  );
};

export default FloatingActions;