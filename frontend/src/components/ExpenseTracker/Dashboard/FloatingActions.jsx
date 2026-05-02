import React from "react";
import { Plus, ArrowUpRight } from "lucide-react";

const FloatingActions = ({ onOpenExpense, onOpenTopUp }) => (
  /* 
     CONTAINER LOGIC:
     Mobile: Docked to bottom (bottom-0), full width.
     Large: Floating capsule (sm:bottom-10 sm:left-1/2).
  */
  <div className="fixed bottom-0 sm:bottom-10 left-0 sm:left-1/2 sm:-translate-x-1/2 w-full sm:w-[92%] sm:max-w-sm z-50">
    <div className="flex bg-slate-900 dark:bg-white border-t-2 sm:border border-emerald-500 sm:border-white/5 dark:sm:border-black/5 sm:rounded-[2.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.2)] sm:shadow-2xl overflow-hidden">
      
      {/* ADD EXPENSE: Full-height action on mobile */}
      <button
        onClick={onOpenExpense}
        className="flex-1 sm:flex-2 py-5 sm:m-2 bg-emerald-500 sm:rounded-4xl flex items-center justify-center gap-2 sm:gap-3 text-white font-[1000] uppercase text-[11px] sm:text-xs tracking-[0.2em] active:bg-emerald-600 transition-all"
      >
        <Plus size={18} sm:size={20} strokeWidth={3} /> 
        <span>Add Expense</span>
      </button>

      {/* MOBILE DIVIDER: Subtle vertical line between buttons */}
      <div className="w-px bg-white/10 dark:bg-black/10 my-4 sm:hidden" />

      {/* TOP UP: Balanced width on mobile for better thumb reach */}
      <button
        onClick={onOpenTopUp}
        className="flex-1 py-5 bg-transparent flex items-center justify-center gap-2 text-white dark:text-slate-900 font-[1000] uppercase text-[11px] tracking-widest active:bg-white/5 dark:active:bg-black/5 transition-all"
      >
        <ArrowUpRight size={18} className="text-emerald-500" /> 
        <span>Top Up</span>
      </button>
    </div>
    
    {/* IPHONE SAFE AREA SPACER: Ensures buttons sit above the home swipe bar */}
    <div className="h-[env(safe-area-inset-bottom)] bg-slate-900 dark:bg-white sm:hidden" />
  </div>
);

export default FloatingActions;