import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, CalendarDays, Check, LetterText } from 'lucide-react';

import GlobalStatsGrid from './GlobalStatsGrid';
import GlobalRiskAnalysis from './GlobalRiskAnalysis';
import GlobalCommissionMatrix from './GlobalCommissionMatrix';

const GlobalCommissionAggregator = ({ data, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const dropdownRef = useRef(null);

  /**
   * Helper: Determine Current FY String (YYYY-YY)
   * Standard Indian Fiscal Cycle: April - March
   */
  const getCurrentFYString = () => {
    const now = new Date();
    const month = now.getMonth(); // 0-indexed (Jan=0, Mar=2)
    const year = now.getFullYear();
    const startYear = month <= 2 ? year - 1 : year;
    const endYearShort = (startYear + 1).toString().slice(-2);
    return `${startYear}-${endYearShort}`;
  };

  /**
   * Lazy Initializer for Selected FY
   */
  const [selectedFY, setSelectedFY] = useState(() => getCurrentFYString());

  /**
   * Dynamic Years List
   * Ensures the picker is populated with years available in the database
   */
  const availableYears = useMemo(() => {
    const years = data?.fiscalYearTotals?.map(f => f.fiscalYear) || [];
    const current = getCurrentFYString();
    
    if (years.length === 0) return [current];
    // Ensure current year is always at the top if not already present
    if (!years.includes(current)) return [current, ...years];
    return years;
  }, [data]);

  /**
   * Filtered Data Logic
   * Bridges the gap between Backend naming ("total") and StatsGrid naming ("totalFY")
   */
  const filteredData = useMemo(() => {
    // 1. Safe Fallback
    if (!data) {
      return {
        monthlyAggregates: [],
        currentFYStats: { totalFY: 0, growth: 0, monthCount: 0 },
        arnConcentration: [],
        amcConcentration: [],
        selectedFY
      };
    }

    // 2. Extract specific stats for the selected year from backend array
    const fyStats = data.fiscalYearTotals?.find(f => f.fiscalYear === selectedFY) || { 
      total: 0, 
      yoyGrowth: 0 
    };

    // 3. Filter monthly aggregates based on FY Date Logic
    const [startYear, endYearShort] = selectedFY.split('-');
    const endYear = `20${endYearShort}`;

    const filteredMonthly = (data.monthlyAggregates || []).filter(item => {
      const [y, m] = item._id.split('-').map(Number);
      // Logic: April (4) of startYear to March (3) of endYear
      if (y === parseInt(startYear) && m >= 4) return true;
      if (y === parseInt(endYear) && m <= 3) return true;
      return false;
    });

    return {
      ...data,
      monthlyAggregates: filteredMonthly,
      // Map backend keys to what GlobalStatsGrid expects
      currentFYStats: {
        totalFY: fyStats.total,
        growth: fyStats.yoyGrowth,
        monthCount: filteredMonthly.length 
      },
      selectedFY
    };
  }, [data, selectedFY]);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleYearChange = (year) => {
    setSelectedFY(year);
    setIsOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* --- PERIOD SELECTOR --- */}
      <div className="flex flex-col md:flex-row justify-between items-center px-0 gap-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <LetterText size={12} className="text-emerald-500 fill-emerald-500" />
            <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">Intelligence Aggregator</h2>
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
            <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-emerald-500 dark:bg-emerald-700 text-white' : 'bg-emerald-50 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400'}`}>
              <CalendarDays size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-start">
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isOpen ? 'text-emerald-400 dark:text-emerald-100' : 'text-slate-400'}`}>Fiscal Cycle</span>
              <span className="text-sm font-[1000] uppercase tracking-widest italic">FY {selectedFY}</span>
            </div>
            <ChevronDown size={16} className={`ml-2 transition-transform duration-500 ${isOpen ? 'rotate-180 text-emerald-400 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`} />
          </button>
          
          {isOpen && (
            <div className="absolute right-0 mt-4 w-56 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 z-50 animate-in fade-in zoom-in-95 duration-300 origin-top">
              <div className="px-4 py-3 mb-1 border-b border-slate-50 dark:border-slate-700/50">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Select Audit Year</span>
              </div>
              {availableYears.map(year => (
                <button 
                  key={year} 
                  onClick={() => handleYearChange(year)} 
                  className={`
                    w-full flex items-center justify-between px-5 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                    ${selectedFY === year 
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-lg' 
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

      {/* Grid Summary (Accordion Toggle) */}
      <div className="relative group cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <GlobalStatsGrid data={filteredData} isExpanded={isExpanded} loading={loading} />
      </div>

      {/* Expanded Sections */}
      {isExpanded && (
        <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-700">
          <section>
             <GlobalCommissionMatrix data={filteredData} />
          </section>

          <section className="border-t border-slate-100 dark:border-slate-800/50 pt-8">
            <GlobalRiskAnalysis data={filteredData} />
          </section>
        </div>
      )}
    </div>
  );
};

export default GlobalCommissionAggregator;