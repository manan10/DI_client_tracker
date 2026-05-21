import React, { useState, useMemo } from 'react';
import { ChevronDown, CalendarDays, Check, LetterText, BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

import GlobalStatsGrid from './GlobalStatsGrid';
import GlobalRiskAnalysis from './GlobalRiskAnalysis';
import GlobalCommissionMatrix from './GlobalCommissionMatrix';

const GlobalCommissionAggregator = ({ data, loading, selectedFY, setSelectedFY }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const availableYears = ["2025-26", "2026-27"];

  const filteredData = useMemo(() => {
    if (!data) return { monthlyAggregates: [], currentFYStats: { totalFY: 0, growth: 0, monthCount: 0 }, selectedFY };
    const fyStats = data.fiscalYearTotals?.find(f => f.fiscalYear === selectedFY) || { total: 0, yoyGrowth: 0 };
    const [startYear, endYearShort] = selectedFY.split('-');
    const endYear = `20${endYearShort}`;
    const filteredMonthly = (data.monthlyAggregates || []).filter(item => {
      const [y, m] = item._id.split('-').map(Number);
      return (y === parseInt(startYear) && m >= 4) || (y === parseInt(endYear) && m <= 3);
    });
    return { 
      ...data, 
      monthlyAggregates: filteredMonthly, 
      currentFYStats: { 
        totalFY: fyStats.total, 
        growth: fyStats.yoyGrowth, 
        monthCount: filteredMonthly.length 
      }, 
      selectedFY 
    };
  }, [data, selectedFY]);

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center px-1">
        <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Aggregator</h2>
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] font-black italic">FY {selectedFY}</span>
          <ChevronDown size={12} />
        </button>
      </div>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg p-1 z-50">
          {availableYears.map(year => (
            <button 
              key={year} 
              onClick={() => { setSelectedFY(year); setIsOpen(false); }} 
              className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
            >
              FY {year} {selectedFY === year && <Check size={12} className="text-emerald-500" />}
            </button>
          ))}
        </div>
      )}

      {/* MOBILE COMPACT STATS GRID */}
      <div className="md:hidden grid grid-cols-2 gap-2">
        <CompactStat label="Revenue" value={`₹${(filteredData.currentFYStats.totalFY / 100000).toFixed(2)}L`} icon={BarChart3} />
        <CompactStat label="Growth" value={`${filteredData.currentFYStats.growth}%`} icon={TrendingUp} />
        <CompactStat label="ARNs" value={data?.activeArns || 0} icon={Users} />
        <CompactStat label="Months" value={filteredData.currentFYStats.monthCount} icon={Clock} />
      </div>

      {/* DESKTOP ORIGINAL */}
      <div className="hidden md:block cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <GlobalStatsGrid data={filteredData} isExpanded={isExpanded} loading={loading} />
      </div>

      {/* EXPANDED CONTENT */}
      <button onClick={() => setIsExpanded(!isExpanded)} className="md:hidden w-full py-2 text-[8px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
        {isExpanded ? "Hide Details" : "View Details"}
      </button>

      {isExpanded && (
        <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-500">
          <GlobalCommissionMatrix data={filteredData} />
          <GlobalRiskAnalysis data={filteredData} />
        </div>
      )}
    </div>
  );
};

const CompactStat = ({ label, value, icon: Icon }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl flex items-center gap-3">
    <Icon size={14} className="text-emerald-500" />
    <div>
      <p className="text-[7px] font-black uppercase text-slate-400">{label}</p>
      <p className="text-[11px] font-[1000] tracking-tight">{value}</p>
    </div>
  </div>
);

export default GlobalCommissionAggregator;