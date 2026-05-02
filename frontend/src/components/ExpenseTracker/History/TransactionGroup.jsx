import React from "react";
import { 
  Edit3, Trash2, Wallet, 
  ArrowUpRight, ArrowDownLeft, Hash, Clock, Globe 
} from "lucide-react";

const TransactionGroup = ({ date, transactions, onEdit, onDelete }) => {
  const d = new Date(date);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start mb-10 lg:mb-16 relative">
      
      {/* SIDEBAR DATE - Sticky on Desktop, Header on Mobile */}
      <div className="lg:col-span-2 lg:sticky lg:top-32 relative z-10 px-4 sm:px-2">
        <div className="flex lg:flex-col items-baseline lg:items-end gap-2 lg:gap-1 border-l-4 lg:border-l-0 lg:border-r-4 border-emerald-500 pl-3 lg:pl-0 lg:pr-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 italic leading-none">
            {d.toLocaleDateString('en-IN', { weekday: 'short' })}
          </span>
          <h3 className="text-3xl lg:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
            {d.getDate()}
          </h3>
          <span className="text-[10px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            {d.toLocaleDateString('en-IN', { month: 'long' }).substring(0, 3)}
          </span>
        </div>
      </div>

      {/* TRANSACTION CARDS LIST */}
      <div className="lg:col-span-10 space-y-2 lg:space-y-3 relative z-10 px-0 sm:px-0">
        {transactions.map((t) => {
          const isInflow = t.type === 'CREDIT' || t.type === 'TOP_UP';
          const isNeutral = t.type === 'MONTHLY_RESET';
          const isVirt = t.sourceWallet?.isVirtual;

          const colorClass = isNeutral ? 'text-blue-500' : isInflow ? 'text-emerald-500' : isVirt ? 'text-indigo-500' : 'text-rose-500';
          const bgClass = isNeutral ? 'bg-blue-500/5' : isInflow ? 'bg-emerald-500/5' : isVirt ? 'bg-indigo-500/5' : 'bg-rose-500/5';
          
          return (
            <div 
              key={t._id} 
              className={`group relative flex flex-col sm:flex-row items-center gap-3 lg:gap-5 p-3.5 lg:p-5 bg-white dark:bg-slate-900/60 rounded-none lg:rounded-3xl border-y sm:border border-slate-200 dark:border-slate-700/60 transition-all duration-300 shadow-sm lg:shadow-none hover:shadow-md ${
                isVirt ? 'lg:border-indigo-100 dark:lg:border-indigo-900/40' : ''
              }`}
            >
              {/* SOURCE INDICATOR STRIP - Always visible on mobile for separation */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 lg:w-1 transition-all ${
                isVirt ? "bg-indigo-500" : "bg-emerald-500/40 lg:bg-transparent lg:group-hover:bg-emerald-500"
              }`} />

              <div className="flex items-center gap-3 lg:gap-4 w-full sm:w-auto overflow-hidden">
                {/* Category Icon - Compact on mobile */}
                <div 
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 shadow-inner relative"
                    style={{ backgroundColor: `${t.category?.color || '#10b981'}15`, color: t.category?.color || '#10b981' }}
                >
                    <Hash size={18} lg:size={20} strokeWidth={3} />
                    {isVirt && (
                    <div className="absolute -top-1 -right-1 p-0.5 lg:p-1 bg-indigo-500 rounded text-white shadow-lg">
                        <Globe size={8} />
                    </div>
                    )}
                </div>

                {/* Info Section - Tighter margins */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] lg:text-[15px] font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 truncate leading-tight mb-1 lg:mb-2">
                        {t.description || t.category?.label}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-1 lg:gap-2">
                        {/* Category Chip */}
                        <div 
                            className="flex items-center gap-1 text-[7px] lg:text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                            style={{ color: t.category?.color }}
                        >
                            {t.category?.label}
                        </div>
                        
                        {/* Wallet Context */}
                        <div className={`flex items-center gap-1 text-[7px] lg:text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                            isVirt ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                            {t.sourceWallet?.walletName}
                        </div>

                        <div className="flex items-center gap-1 text-[7px] lg:text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            <Clock size={8} />
                            {new Date(t.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
              </div>

              {/* Amount & Actions Area */}
              <div className="flex items-center justify-between sm:justify-end gap-3 lg:gap-6 shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                <div className="text-left sm:text-right">
                  <div className={`inline-flex items-center gap-1.5 px-3 lg:px-4 py-1 lg:py-2 rounded-lg lg:rounded-xl font-black italic text-base lg:text-lg tracking-tighter tabular-nums ${bgClass} ${colorClass}`}>
                    {!isNeutral && (isInflow ? <ArrowUpRight size={14} lg:size={16} strokeWidth={3} /> : <ArrowDownLeft size={14} lg:size={16} strokeWidth={3} />)}
                    ₹{t.amount.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <button 
                    onClick={() => onEdit(t)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-500 active:bg-emerald-500/10 transition-all border border-slate-100 dark:border-slate-800"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button 
                    onClick={() => onDelete(t)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 active:bg-rose-500/10 transition-all border border-slate-100 dark:border-slate-800"
                  >
                    <Trash2 size={15} />
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