import React, { useState, useMemo, useRef } from 'react';
import { ChevronDown, CalendarDays, Check, ChevronUp, LayoutPanelTop, Table as TableIcon, Sparkles, LetterText } from 'lucide-react';

import GlobalStatsGrid from './GlobalStatsGrid';
import GlobalRiskAnalysis from './GlobalRiskAnalysis';
import GlobalCommissionMatrix from './GlobalCommissionMatrix';

const GlobalCommissionAggregator = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const dropdownRef = useRef(null);

  const availableYears = useMemo(() => 
    data?.fiscalYearTotals?.map(f => f.fiscalYear) || [], 
    [data]
  );
  
  const [selectedFY, setSelectedFY] = useState(availableYears[0] || "");

  const handleYearChange = (year) => {
    setSelectedFY(year);
    setIsOpen(false);
  };

  const filteredData = useMemo(() => {
    if (!data || !selectedFY) return null;
    const [startYear, endYearShort] = selectedFY.split('-');
    const endYear = `20${endYearShort}`;

    const filteredMonthly = data.monthlyAggregates.filter(item => {
      const [y, m] = item._id.split('-').map(Number);
      if (y === parseInt(startYear) && m >= 4) return true;
      if (y === parseInt(endYear) && m <= 3) return true;
      return false;
    });

    return {
      ...data,
      monthlyAggregates: filteredMonthly,
      currentFYStats: data.fiscalYearTotals.find(f => f.fiscalYear === selectedFY),
      selectedFY
    };
  }, [data, selectedFY]);

  if (!data) return null;

  return (
    <div className="space-y-8">
{/* --- ENHANCED YEAR PICKER HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center px-0 gap-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <LetterText size={12} className="text-emerald-500 fill-emerald-500" />
            <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">Commission Summary</h2>
          </div>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`
              flex items-center gap-4 px-8 py-4 rounded-lg transition-all duration-300
              ${isOpen 
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-2xl scale-105 ring-4 ring-emerald-500/10' 
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-xl shadow-emerald-500/5 hover:border-emerald-500/50 hover:shadow-emerald-500/10'}
            `}
          >
            <div className={`p-2 rounded-l transition-colors ${isOpen ? 'bg-emerald-500 dark:bg-emerald-700 text-white' : 'bg-emerald-50 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400'}`}>
              <CalendarDays size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-start">
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isOpen ? 'text-emerald-400 dark:text-emerald-100' : 'text-slate-400'}`}>Selected Period</span>
              <span className="text-sm font-[1000] uppercase tracking-widest italic">FY {selectedFY}</span>
            </div>
            <ChevronDown size={16} className={`ml-2 transition-transform duration-500 ${isOpen ? 'rotate-180 text-emerald-400 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`} />
          </button>
          
          {isOpen && (
            <div className="absolute right-0 mt-4 w-56 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 z-50 animate-in fade-in zoom-in-95 duration-300 origin-top">
              <div className="px-4 py-3 mb-1 border-b border-slate-50 dark:border-slate-700/50">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Select Fiscal Cycle</span>
              </div>
              {availableYears.map(year => (
                <button 
                  key={year} 
                  onClick={() => handleYearChange(year)} 
                  className={`
                    w-full flex items-center justify-between px-5 py-3 rounded-l text-[10px] font-black uppercase tracking-widest transition-all
                    ${selectedFY === year 
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'}
                  `}
                >
                  FY {year} 
                  {selectedFY === year && <Check size={12} strokeWidth={3} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Accordion Logic with StatsGrid */}
      <div className="relative group cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <GlobalStatsGrid data={filteredData} isExpanded={isExpanded} />
      </div>

      {isExpanded && (
        <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-900">
          <section>
             <GlobalCommissionMatrix data={filteredData} />
          </section>

          <section className="border-t border-slate-100 pb-8">
            <GlobalRiskAnalysis data={filteredData} />
          </section>
        </div>
      )}
    </div>
  );
};

export default GlobalCommissionAggregator;