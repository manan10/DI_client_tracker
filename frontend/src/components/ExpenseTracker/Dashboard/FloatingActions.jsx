import React, { useState, useEffect } from 'react';
import { Plus, ArrowDownToLine, ReceiptIndianRupee } from 'lucide-react';

const FloatingActions = ({ onOpenExpense, onOpenTopUp }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Dad-proof feature: Lock scrolling when menu is open so he doesn't accidentally scroll the page
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
    actionCallback();
  };

  return (
    <>
      {/* --- FOCUS BACKDROP --- */}
      {/* 
        Slightly dims and blurs the background. 
        Instantly eliminates distractions when the menu is open.
      */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 dark:bg-slate-950/70 backdrop-blur-sm transition-all duration-500 ease-out ${
          isOpen ? 'opacity-100 pointer-events-auto z-40' : 'opacity-0 pointer-events-none -z-10'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* --- THE SPEED DIAL CONTAINER --- */}
      <div className="relative flex flex-col items-end z-50 select-none">
        
        {/* --- PREMIUM ACTION CARDS --- */}
        <div className={`flex flex-col items-end gap-3 md:gap-4 mb-5 origin-bottom pointer-events-none`}>
          
          {/* Action 1: Top Up Wallet */}
          <div 
            className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isOpen ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto delay-50' : 'scale-90 opacity-0 translate-y-8 pointer-events-none delay-100'
            }`}
          >
            <button 
              onClick={() => handleAction(onOpenTopUp)}
              className="group flex items-center justify-between gap-5 pl-5 pr-2 py-2 md:pl-6 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-xl active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="text-[12px] md:text-sm font-[1000] uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Top Up
              </span>
              <div className="bg-slate-50 dark:bg-slate-900/50 text-blue-600 dark:text-blue-400 p-2.5 md:p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 group-hover:scale-105 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/20 transition-all duration-300">
                <ArrowDownToLine size={20} strokeWidth={2.5} />
              </div>
            </button>
          </div>

          {/* Action 2: Add Expense (Primary) */}
          <div 
            className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isOpen ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto delay-100' : 'scale-90 opacity-0 translate-y-6 pointer-events-none delay-50'
            }`}
          >
            <button 
              onClick={() => handleAction(onOpenExpense)}
              className="group flex items-center justify-between gap-5 pl-5 pr-2 py-2 md:pl-6 bg-linear-to-l from-emerald-500 to-emerald-600 border border-emerald-400/50 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.4)] active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <span className="text-[12px] md:text-sm font-[1000] uppercase tracking-[0.2em] text-white">
                Expense
              </span>
              <div className="bg-white/20 text-white p-2.5 md:p-3 rounded-xl border border-white/20 group-hover:scale-105 transition-all duration-300 shadow-sm">
                <ReceiptIndianRupee size={20} strokeWidth={2.5} />
              </div>
            </button>
          </div>
          
        </div>

        {/* --- MAIN MASSIVE FAB --- */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full shadow-2xl transition-all duration-500 ease-out outline-none active:scale-90 ${
            isOpen 
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-lg' 
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/40 hover:shadow-emerald-500/50'
          }`}
          aria-label="Toggle Actions"
        >
          {/* Spring-animated X/Plus icon */}
          <Plus 
            size={isOpen ? 30 : 34} 
            strokeWidth={2.5} 
            className={`transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? 'rotate-135 scale-110' : 'rotate-0'}`} 
          />
        </button>

      </div>
    </>
  );
};

export default FloatingActions;