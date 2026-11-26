import React from "react";
import { ShieldCheck, TrendingUp, IndianRupee, Clock } from "lucide-react";
import { formatCurrency } from "./insuranceUtils";

const InsuranceExecutiveKPIs = ({ stats, selectedPerson = "ALL" }) => {
  const isFiltered = selectedPerson !== "ALL";
  const formattedName = isFiltered
    ? selectedPerson
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Life & Health Cover */}
      <div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Life & Health Cover
          </p>
          <h3 className="sora-font text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums truncate">
            {formatCurrency(stats.totalPureRiskCover)}
          </h3>
          <p className="text-xs font-medium text-sky-600 dark:text-sky-300 truncate">
            {isFiltered ? `${formattedName}'s cover` : "Total protection amount"}
          </p>
        </div>
        <div className="p-2.5 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/70 dark:border-sky-500/20 rounded-lg shrink-0">
          <ShieldCheck size={20} strokeWidth={2} />
        </div>
      </div>

      {/* ULIP & NPS Value */}
      <div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            ULIP & NPS Value
          </p>
          <h3 className="sora-font text-xl sm:text-2xl font-bold text-cyan-700 dark:text-cyan-300 tabular-nums truncate">
            {formatCurrency(stats.totalInvestmentValuation)}
          </h3>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            {isFiltered
              ? `${formattedName}'s fund value`
              : "Current fund & pension value"}
          </p>
        </div>
        <div className="p-2.5 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200/70 dark:border-cyan-500/20 rounded-lg shrink-0">
          <TrendingUp size={20} strokeWidth={2} />
        </div>
      </div>

      {/* Yearly Premium */}
      <div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Yearly Premium
          </p>
          <h3 className="sora-font text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums truncate">
            {formatCurrency(stats.annualizedPremium)}
          </h3>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            {stats.activePolicies} active{" "}
            {stats.activePolicies === 1 ? "policy" : "policies"}
          </p>
        </div>
        <div className="p-2.5 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/70 dark:border-sky-500/20 rounded-lg shrink-0">
          <IndianRupee size={20} strokeWidth={2} />
        </div>
      </div>

      {/* Due Within 30 Days */}
      <div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Due Within 30 Days
          </p>
          <h3 className="sora-font text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums truncate">
            {stats.upcomingDueCount}{" "}
            {stats.upcomingDueCount === 1 ? "Policy" : "Policies"}
          </h3>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            Renewals coming up soon
          </p>
        </div>
        <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/70 dark:border-amber-500/20 rounded-lg shrink-0">
          <Clock size={20} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
};

export default InsuranceExecutiveKPIs;