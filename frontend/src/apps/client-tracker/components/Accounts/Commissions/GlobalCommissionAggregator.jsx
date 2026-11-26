import React, { useMemo } from "react";
import { Calendar, BarChart3 } from "lucide-react";
import GlobalStatsGrid from "./GlobalStatsGrid";
import GlobalRiskAnalysis from "./GlobalRiskAnalysis";
import GlobalCommissionMatrix from "./GlobalCommissionMatrix";

const GlobalCommissionAggregator = ({ data, loading, selectedFY }) => {
  const filteredData = useMemo(() => {
    if (!data)
      return {
        monthlyAggregates: [],
        currentFYStats: { totalFY: 0, growth: 0, monthCount: 0 },
        selectedFY,
      };
    const fyStats = data.fiscalYearTotals?.find(
      (f) => f.fiscalYear === selectedFY
    ) || { total: 0, yoyGrowth: 0 };
    const [startYear, endYearShort] = selectedFY.split("-");
    const endYear = `20${endYearShort}`;
    const filteredMonthly = (data.monthlyAggregates || []).filter((item) => {
      const [y, m] = item._id.split("-").map(Number);
      return (
        (y === parseInt(startYear) && m >= 4) ||
        (y === parseInt(endYear) && m <= 3)
      );
    });
    return {
      ...data,
      monthlyAggregates: filteredMonthly,
      currentFYStats: {
        totalFY: fyStats.total,
        growth: fyStats.yoyGrowth,
        monthCount: filteredMonthly.length,
      },
      selectedFY,
    };
  }, [data, selectedFY]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* 1. OVERVIEW SUBHEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="sora-font text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Firmwide{" "}
              <span className="font-normal text-sky-600 dark:text-sky-300">
                Revenue
              </span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-200/70 dark:border-sky-500/25 uppercase">
              FY {selectedFY}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Consolidated totals and mutual fund payouts across all active family ARNs.
          </p>
        </div>
      </div>

      {/* 2. SUMMARY KPI GRID */}
      <section className="w-full">
        <GlobalStatsGrid data={filteredData} loading={loading} />
      </section>

      {/* 3. MONTHLY PAYOUT SCHEDULE */}
      <section className="w-full space-y-3 pt-1">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-sky-600 dark:text-sky-400" />
            <h4 className="sora-font text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              Monthly Payout Schedule
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Amounts in INR (₹)
          </span>
        </div>

        <div className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg overflow-hidden">
          <GlobalCommissionMatrix data={filteredData} />
        </div>
      </section>

      {/* 4. DISTRIBUTION & AMC CHARTS */}
      <section className="w-full space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2 px-0.5">
          <BarChart3 size={15} className="text-sky-600 dark:text-sky-400" />
          <h4 className="sora-font text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            AMC & ARN Breakdown
          </h4>
        </div>

        <GlobalRiskAnalysis data={filteredData} />
      </section>
    </div>
  );
};

export default GlobalCommissionAggregator;