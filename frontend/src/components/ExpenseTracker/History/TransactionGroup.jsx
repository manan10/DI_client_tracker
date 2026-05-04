import React from "react";
import { 
  Edit3, Trash2, Wallet, 
  ArrowUpRight, ArrowDownLeft, Hash, Clock, Globe 
} from "lucide-react";

const TransactionGroup = ({ date, transactions, onEdit, onDelete }) => {
  const d = new Date(date);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 lg:gap-8 items-start mb-10 lg:mb-20 relative">
      
      {/* DATE SIDEBAR - Now properly sized for both Mobile & Desktop */}
      <div className="lg:col-span-2 lg:sticky lg:top-32 relative z-10 px-4 sm:px-2">
        <div className="flex lg:flex-col items-baseline lg:items-end gap-2 lg:gap-1 border-l-4 lg:border-l-0 lg:border-r-4 border-emerald-500 pl-3 lg:pl-0 lg:pr-4 py-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 italic leading-none">
            {d.toLocaleDateString('en-IN', { weekday: 'short' })}
          </span>
          <h3 className="text-4xl lg:text-5xl font-[1000] tracking-tighter text-slate-900 dark:text-white leading-none">
            {d.getDate().toString().padStart(2, '0')}
          </h3>
          <span className="text-[10px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            {d.toLocaleDateString('en-IN', { month: 'short' })} '{d.getFullYear().toString().slice(-2)}
          </span>
        </div>
      </div>

      {/* TRANSACTION LIST - Padded on Mobile to show hierarchy */}
      <div className="lg:col-span-10 relative z-10 pl-16 lg:pl-0 pr-4 lg:pr-0 space-y-3">
        
        {/* Timeline Connector Line for Mobile */}
        <div className="absolute left-[1.15rem] top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800 lg:hidden" />

        {transactions.map((t) => {
          const isInflow = t.type === 'CREDIT' || t.type === 'TOP_UP';
          const isNeutral = t.type === 'MONTHLY_RESET';
          const isVirt = t.sourceWallet?.isVirtual;

          const colorClass = isNeutral ? 'text-blue-500' : isInflow ? 'text-emerald-500' : isVirt ? 'text-indigo-500' : 'text-rose-500';
          const bgClass = isNeutral ? 'bg-blue-500/5' : isInflow ? 'bg-emerald-500/5' : isVirt ? 'bg-indigo-500/5' : 'bg-rose-500/5';
          
          return (
            <div 
              key={t._id} 
              className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Horizontal Node Connector (Mobile Only) */}
              <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-10 h-0.5 bg-slate-100 dark:bg-slate-800 lg:hidden" />
              <div className="absolute -left-[2.65rem] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 lg:hidden" />

              <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0 mb-3 sm:mb-0">
                <div 
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner relative border border-slate-100 dark:border-slate-800"
                  style={{ backgroundColor: `${t.category?.color || '#10b981'}10`, color: t.category?.color || '#10b981' }}
                >
                  <Hash size={18} lg:size={22} strokeWidth={2.5} />
                  {isVirt && (
                    <div className="absolute -top-1 -right-1 p-0.5 bg-indigo-500 rounded text-white ring-2 ring-white dark:ring-slate-900">
                      <Globe size={8} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-[13px] lg:text-base font-black uppercase tracking-tight text-slate-900 dark:text-white truncate leading-tight mb-1 lg:mb-2">
                    {t.description || t.category?.label}
                  </h4>
                  
                  <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
                    <div className={`flex items-center gap-1 text-[7px] lg:text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                      isVirt ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {isVirt ? <Globe size={8} /> : <Wallet size={8} />}
                      {t.sourceWallet?.walletName}
                    </div>
                    <div className="flex items-center gap-1 text-[7px] lg:text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      <Clock size={8} />
                      {new Date(t.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount & Actions Container */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 lg:gap-6 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/50 pt-3 sm:pt-0">
                <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-black italic text-base lg:text-lg tracking-tighter tabular-nums ${bgClass} ${colorClass}`}>
                  {!isNeutral && (isInflow ? <ArrowUpRight size={14} lg:size={16} strokeWidth={3} /> : <ArrowDownLeft size={14} lg:size={16} strokeWidth={3} />)}
                  ₹{t.amount.toLocaleString('en-IN')}
                </div>

                <div className="flex gap-1">
                  <button onClick={() => onEdit(t)} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/5 border border-slate-100 dark:border-slate-800 transition-all"><Edit3 size={16} /></button>
                  <button onClick={() => onDelete(t)} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 border border-slate-100 dark:border-slate-800 transition-all"><Trash2 size={16} /></button>
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