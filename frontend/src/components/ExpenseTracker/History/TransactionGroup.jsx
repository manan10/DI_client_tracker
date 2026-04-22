import React from "react";
import { 
  Edit3, Trash2, Tag, Wallet, 
  ArrowUpRight, ArrowDownLeft, Hash, Clock, Globe 
} from "lucide-react";

const TransactionGroup = ({ date, transactions, onEdit, onDelete }) => {
  const d = new Date(date);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16 relative">
      {/* SIDEBAR DATE */}
      <div className="lg:col-span-2 lg:sticky lg:top-32 relative z-10">
        <div className="flex lg:flex-col items-baseline lg:items-end gap-1 px-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 italic opacity-80 leading-none">
            {d.toLocaleDateString('en-IN', { weekday: 'short' })}
          </span>
          <h3 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
            {d.getDate()}
          </h3>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 leading-none">
            {d.toLocaleDateString('en-IN', { month: 'long' }).substring(0, 3)}
          </span>
        </div>
      </div>

      {/* TRANSACTION CARDS */}
      <div className="lg:col-span-10 space-y-3 relative z-10">
        {transactions.map((t) => {
          const isInflow = t.type === 'CREDIT' || t.type === 'TOP_UP';
          const isNeutral = t.type === 'MONTHLY_RESET';
          const isVirt = t.sourceWallet?.isVirtual; // HYBRID CHECK

          const colorClass = isNeutral ? 'text-blue-500' : isInflow ? 'text-emerald-500' : isVirt ? 'text-indigo-500' : 'text-rose-500';
          const bgClass = isNeutral ? 'bg-blue-500/5' : isInflow ? 'bg-emerald-500/5' : isVirt ? 'bg-indigo-500/5' : 'bg-rose-500/5';
          
          return (
            <div 
              key={t._id} 
              className={`group relative flex flex-col sm:flex-row items-center gap-5 p-5 bg-white dark:bg-slate-900/40 rounded-[1.5rem] border transition-all duration-300 hover:shadow-xl ${
                isVirt 
                ? 'border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-500/30' 
                : 'border-slate-100 dark:border-slate-800/60 hover:border-emerald-500/30'
              }`}
            >
              {/* SOURCE INDICATOR STRIP */}
              <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full transition-all ${
                isVirt ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-transparent group-hover:bg-emerald-500"
              }`} />

              {/* Category Icon */}
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner relative"
                style={{ backgroundColor: `${t.category?.color || '#10b981'}15`, color: t.category?.color || '#10b981' }}
              >
                <Hash size={20} strokeWidth={2.5} />
                {isVirt && (
                  <div className="absolute -top-1 -right-1 p-1 bg-indigo-500 rounded-lg text-white shadow-lg">
                    <Globe size={8} />
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-[15px] font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 truncate leading-none">
                    {t.description || t.category?.label}
                  </h4>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Chip */}
                  <div 
                    className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800"
                    style={{ color: t.category?.color }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.category?.color }} />
                    {t.category?.label}
                  </div>
                  
                  {/* Wallet Context - Color Coded */}
                  <div className={`flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                    isVirt ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400'
                  }`}>
                    {isVirt ? <Globe size={10} /> : <Wallet size={10} />}
                    {t.sourceWallet?.walletName}
                  </div>

                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest px-2.5 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <Clock size={10} />
                    {new Date(t.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Amount & Actions */}
              <div className="flex items-center gap-6 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-50 dark:border-slate-800 pt-4 sm:pt-0">
                <div className="text-right">
                  <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-black italic text-lg tracking-tighter ${bgClass} ${colorClass}`}>
                    {!isNeutral && (isInflow ? <ArrowUpRight size={16} strokeWidth={3} /> : <ArrowDownLeft size={16} strokeWidth={3} />)}
                    ₹{t.amount.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[7px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em] mt-1.5 leading-none">
                    {t.type.replace('_', ' ')} {isVirt ? '• DIGITAL' : ''}
                  </p>
                </div>

                <div className="flex gap-1">
                  <button 
                    onClick={() => onEdit(t)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all cursor-pointer border border-transparent hover:border-emerald-500/10"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button 
                    onClick={() => onDelete(t)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-500/5 transition-all cursor-pointer border border-transparent hover:border-rose-500/10"
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