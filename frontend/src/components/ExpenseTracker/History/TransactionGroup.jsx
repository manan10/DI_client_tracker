import React from "react";
import { 
  Edit3, Trash2, Wallet, 
  ArrowUpRight, ArrowDownLeft, Clock, Globe 
} from "lucide-react";

const TransactionGroup = ({ date, transactions = [], onEdit, onDelete }) => {
  const d = new Date(date);
  
  return (
    <div className="w-full mb-10 lg:mb-12">
      {/* PROFESSIONAL LEDGER HEADER */}
      <div className="flex items-center gap-4 lg:gap-6 mb-6">
        <h2 className="text-xl lg:text-3xl font-[900] text-slate-900 dark:text-slate-100 tracking-tighter">
          {d.getDate().toString().padStart(2, '0')} 
          <span className="text-slate-400 dark:text-slate-500 font-medium ml-2 lg:ml-3 text-lg lg:text-2xl">
            {d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </span>
        </h2>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="flex flex-col gap-2 lg:gap-3">
        {transactions.map((t) => {
          const isInflow = t.type === 'CREDIT' || t.type === 'TOP_UP';
          const isVirt = t.sourceWallet?.isVirtual;
          
          const statusBorder = isInflow ? "border-l-emerald-500" : "border-l-rose-500";
          const amountColor = isInflow ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";

          return (
            <div 
              key={t._id} 
              className={`group flex items-center justify-between px-3 py-3 lg:px-6 lg:py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 ${statusBorder} rounded-lg shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600`}
            >
              {/* LEFT: Info (Truncate prevents mobile break) */}
              <div className="flex items-center gap-3 lg:gap-5 min-w-0 flex-1">
                {/* Icon block */}
                <div className={`w-10 h-10 lg:w-14 lg:h-14 flex items-center justify-center shrink-0 rounded border border-slate-100 dark:border-slate-800 ${isInflow ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'}`}>
                  {isInflow ? <ArrowUpRight size={18} lg:size={24} strokeWidth={2.5} /> : <ArrowDownLeft size={18} lg:size={24} strokeWidth={2.5} />}
                </div>

                <div className="flex flex-col min-w-0">
                  <h4 className="text-xs lg:text-base font-black text-slate-900 dark:text-slate-100 truncate uppercase tracking-tight">
                    {t.description || t.category?.label}
                  </h4>
                  <div className="flex items-center gap-2 lg:gap-4 mt-0.5 lg:mt-1">
                    <span className="flex items-center gap-1 text-[9px] lg:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                      {isVirt ? <Globe size={10} /> : <Wallet size={10} />}
                      {t.sourceWallet?.walletName}
                    </span>
                    <span className="text-[9px] lg:text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Clock size={10} /> {new Date(t.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Amount & Action Buttons (Shrink-0 prevents squashing) */}
              <div className="flex items-center gap-3 lg:gap-8 pl-3 lg:pl-6 shrink-0">
                <span className={`font-mono font-black text-xs lg:text-lg tracking-tighter ${amountColor}`}>
                  {isInflow ? '+' : '-'} ₹{t.amount.toLocaleString('en-IN')}
                </span>

                <div className="flex items-center gap-1 lg:gap-2">
                  <button 
                    onClick={() => onEdit(t)} 
                    className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 shadow-sm transition-all"
                  >
                    <Edit3 size={14} lg:size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(t)} 
                    className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-rose-600 shadow-sm transition-all"
                  >
                    <Trash2 size={14} lg:size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionGroup;