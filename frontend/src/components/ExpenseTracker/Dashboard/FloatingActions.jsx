import React from "react";
import { Plus, ArrowUpRight } from "lucide-react";

const FloatingActions = ({ onOpenExpense, onOpenTopUp }) => (
  <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-50">
    <div className="bg-slate-900 dark:bg-white p-2.5 rounded-[2.5rem] shadow-2xl flex gap-2 border border-white/5 dark:border-black/5">
      <button
        onClick={onOpenExpense}
        className="flex-[2] py-4.5 bg-emerald-500 rounded-[2rem] flex items-center justify-center gap-3 text-white font-[1000] uppercase text-xs tracking-[0.2em] active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
      >
        <Plus size={20} strokeWidth={3} /> Add Expense
      </button>
      <button
        onClick={onOpenTopUp}
        className="flex-1 py-4.5 bg-transparent flex items-center justify-center text-white dark:text-slate-900 font-[1000] uppercase text-[10px] tracking-widest active:scale-95 transition-all"
      >
        <ArrowUpRight size={18} className="text-emerald-500" /> Top Up
      </button>
    </div>
  </div>
);

export default FloatingActions;