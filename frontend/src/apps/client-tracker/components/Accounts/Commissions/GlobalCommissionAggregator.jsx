import React, { useMemo } from 'react';
import { Layers, Calendar, BarChart3, TrendingUp } from 'lucide-react';
import GlobalStatsGrid from './GlobalStatsGrid';
import GlobalRiskAnalysis from './GlobalRiskAnalysis';
import GlobalCommissionMatrix from './GlobalCommissionMatrix';

const GlobalCommissionAggregator = ({ data, loading, selectedFY }) => {
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
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      
      {/* 1. FIRMWIDE OVERVIEW HEADER STRIP */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-2 border-b border-slate-200/80 dark:border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Firmwide Revenue Overview
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 uppercase">
              FY {selectedFY}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Consolidated totals and mutual fund payout breakdown across all active family ARNs.
          </p>
        </div>
      </div>

      {/* 2. SUMMARY KPI STATS GRID */}
      <section className="w-full">
        <GlobalStatsGrid data={filteredData} loading={loading} />
      </section>

      {/* 3. MONTHLY ARN RECONCILIATION SCHEDULE */}
      <section className="w-full space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Monthly Payout Schedule
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
            All currency values in INR (₹)
          </span>
        </div>
        
        <div className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl shadow-xs overflow-hidden">
          <GlobalCommissionMatrix data={filteredData} />
        </div>
      </section>

      {/* 4. VISUAL DISTRIBUTION & AMC CHARTS */}
      <section className="w-full space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2 px-1">
          <BarChart3 size={15} className="text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Distribution & AMC Analytics
          </h3>
        </div>
        
        <GlobalRiskAnalysis data={filteredData} />
      </section>

    </div>
  );
};

export default GlobalCommissionAggregator;