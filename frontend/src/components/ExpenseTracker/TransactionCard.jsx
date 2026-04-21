import React from "react";
import { Trash2, Edit3, ArrowUpRight, ArrowDownLeft, Calendar, Tag } from "lucide-react";

const TransactionCard = ({ transaction, onEdit, onDelete }) => {
  const isExpense = transaction.type === 'EXPENSE' || transaction.type === 'TRANSFER';
  
  return (
    <div className="group relative bg-white dark:bg-[#161B22]/50 p-6 rounded-4xl border border-slate-100 dark:border-slate-800 transition-all hover:border-emerald-500/30 shadow-sm overflow-hidden">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-5 text-left">
          {/* Status Icon */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
            isExpense ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
          }`}>
            {isExpense ? <ArrowUpRight size={24} strokeWidth={3} /> : <ArrowDownLeft size={24} strokeWidth={3} />}
          </div>

          <div className="text-left leading-none">
            <div className="flex items-center gap-2 mb-2">
               <p className="text-xs font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">
                {transaction.category}
              </p>
              {transaction.type === 'TOP_UP' && (
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-[7px] font-black text-blue-500 uppercase tracking-widest">Top Up</span>
              )}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight max-w-37.5 truncate">
              {transaction.description}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-xl font-[1000] tracking-tighter italic leading-none ${
            isExpense ? 'text-slate-900 dark:text-white' : 'text-emerald-500'
          }`}>
            {isExpense ? '-' : '+'}₹{transaction.amount.toLocaleString()}
          </p>
          <div className="flex items-center justify-end gap-1.5 mt-2 text-slate-400">
             <Calendar size={10} />
             <p className="text-[8px] font-black uppercase tracking-widest">
              {new Date(transaction.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            </p>
          </div>
        </div>
      </div>

      {/* ACTION OVERLAY: Reveals on hover/selection */}
      <div className="flex gap-2 pt-5 border-t border-slate-50 dark:border-slate-800/50 mt-5 transition-all duration-300 sm:opacity-0 group-hover:opacity-100">
        <button 
          onClick={() => onEdit(transaction)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:text-emerald-500 hover:bg-emerald-500/5 transition-all active:scale-95"
        >
          <Edit3 size={14} strokeWidth={3} /> Edit
        </button>
        <button 
          onClick={() => onDelete(transaction._id)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:text-red-500 hover:bg-red-500/5 transition-all active:scale-95"
        >
          <Trash2 size={14} strokeWidth={3} /> Undo
        </button>
      </div>
    </div>
  );
};

export default TransactionCard;