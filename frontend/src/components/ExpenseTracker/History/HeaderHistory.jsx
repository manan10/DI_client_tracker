import React, { useState } from "react";
import { Search, Calendar, ChevronDown } from "lucide-react";

const HistoryHeader = ({ selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, searchQuery, setSearchQuery }) => {
  const [showPicker, setShowPicker] = useState(false);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2024, 2025, 2026];

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 md:gap-10 mb-8 md:mb-12 border-b border-slate-100 dark:border-slate-800 pb-8 md:pb-12 px-4 sm:px-0">
      
      {/* TITLE SECTION: Scaled for mobile */}
      <div className="space-y-1 md:space-y-2">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
          SPENDING <span className="text-emerald-500 font-light italic">HISTORY</span>
        </h1>
        <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Spend Audit Dashboard</p>
      </div>

      {/* SEARCH & PICKER GROUP */}
      <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
        
        {/* Search Input: Full width on mobile */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH ENTRY..."
            className="w-full bg-slate-50 dark:bg-slate-900/50 p-4 pl-12 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/50 transition-all" 
          />
        </div>

        {/* Date Picker: Now full width on mobile to match search */}
        <div className="relative w-full md:w-auto">
          <button 
            onClick={() => setShowPicker(!showPicker)}
            className="w-full md:w-auto flex items-center justify-between md:justify-start gap-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-slate-100 transition-all cursor-pointer shadow-lg md:shadow-none"
          >
            <div className="flex items-center gap-3">
                <Calendar size={14} />
                <span>{months[selectedMonth]} {selectedYear}</span>
            </div>
            <ChevronDown size={14} className={`${showPicker ? "rotate-180" : ""} transition-transform`} />
          </button>

          {showPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
              {/* Dropdown: Adjusted to be full-width on mobile for consistency */}
              <div className="absolute top-16 right-0 left-0 md:left-auto md:w-72 z-50 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95">
                <div className="grid grid-cols-3 gap-1 mb-4">
                  {months.map((m, i) => (
                    <button 
                        key={m} 
                        onClick={() => { setSelectedMonth(i); setShowPicker(false); }} 
                        className={`py-2.5 text-[8px] font-bold uppercase rounded-lg transition-colors ${selectedMonth === i ? 'bg-emerald-500 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400'}`}
                    >
                      {m.substring(0, 3)}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 border-t border-slate-100 dark:border-slate-800 pt-4">
                  {years.map(y => (
                    <button 
                        key={y} 
                        onClick={() => { setSelectedYear(y); setShowPicker(false); }} 
                        className={`flex-1 py-2.5 text-[9px] font-bold uppercase rounded-lg transition-colors ${selectedYear === y ? 'bg-emerald-500 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400'}`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryHeader;