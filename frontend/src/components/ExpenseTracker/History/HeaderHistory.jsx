import React, { useState } from "react";
import { Search, Calendar, ChevronDown, Sparkles, X } from "lucide-react";

const HistoryHeader = ({ selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, searchQuery, setSearchQuery }) => {
  const [showPicker, setShowPicker] = useState(false);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = [2024, 2025, 2026];

  return (
    <div className="w-full mb-12 relative group">
      {/* GLOW EFFECT */}
      <div className="absolute -top-10 left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150" />
      
      {/* HEADER IDENTITY */}
      <div className="flex items-end justify-between mb-8">
        <div>
           <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
             <Sparkles size={10} /> Spending
           </p>
           <h1 className="text-5xl sm:text-7xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
              History
           </h1>
        </div>
        
        <button 
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-3.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
             {months[selectedMonth]} {selectedYear}
          </span>
          <ChevronDown size={12} className="text-emerald-500" />
        </button>
      </div>

      {/* SEARCH COMMAND */}
      <div className="relative p-1 bg-slate-100 dark:bg-slate-800 rounded-4xl shadow-inner">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500">
            <Search size={18} />
        </div>
        <input 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH TRANSACTIONS..."
          className="w-full bg-transparent py-5 pl-14 pr-6 text-[11px] font-black uppercase tracking-[0.2em] outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600" 
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* REFINED DATE PICKER MODAL */}
      {showPicker && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-sm" onClick={() => setShowPicker(false)} />
          <div className="absolute top-44 right-0 w-full sm:w-100 z-50 bg-white dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-2xl p-8 animate-in slide-in-from-top-4 duration-300">
             <div className="flex items-center justify-between mb-6">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Date</p>
                 <button onClick={() => setShowPicker(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors">
                    <X size={14} className="text-slate-500" />
                 </button>
             </div>
             
             {/* Year Selector */}
             <div className="flex gap-2 mb-6">
                {years.map(y => (
                    <button 
                        key={y} 
                        onClick={() => setSelectedYear(y)} 
                        className={`flex-1 py-3 text-[10px] font-black uppercase rounded-2xl transition-all ${selectedYear === y ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100'}`}
                    >
                        {y}
                    </button>
                ))}
             </div>

             {/* Month Grid */}
             <div className="grid grid-cols-4 gap-2">
                {months.map((m, i) => (
                    <button 
                        key={m} 
                        onClick={() => { 
                            setSelectedMonth(i); 
                            setShowPicker(false); // Auto-close enabled
                        }} 
                        className={`py-4 text-[10px] font-black uppercase rounded-2xl transition-all ${selectedMonth === i ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                    >
                        {m}
                    </button>
                ))}
             </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryHeader;