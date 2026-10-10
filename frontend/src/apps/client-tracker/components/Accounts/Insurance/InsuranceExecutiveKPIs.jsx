import React from "react";
import { ShieldCheck, TrendingUp, IndianRupee, Clock } from "lucide-react";
import { formatCurrency } from "./insuranceUtils";

const InsuranceExecutiveKPIs = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Pure Risk Coverage */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Risk & Health Cover
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(stats.totalPureRiskCover)}
          </h3>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            Total Life & Health Protection
          </p>
        </div>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
          <ShieldCheck size={24} />
        </div>
      </div>

      {/* Investment & Pension Valuation */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            ULIP & NPS Valuation
          </p>
          <h3 className="text-2xl font-black text-indigo-700 dark:text-indigo-400">
            {formatCurrency(stats.totalInvestmentValuation)}
          </h3>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Market Linked & Pension Assets
          </p>
        </div>
        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <TrendingUp size={24} />
        </div>
      </div>

      {/* Annualized Premium Outflow */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Annual Outflow
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(stats.annualizedPremium)}
          </h3>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
            {stats.activePolicies} Active Policies
          </p>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
          <IndianRupee size={24} />
        </div>
      </div>

      {/* 30-Day Renewal Alerts */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Due Within 30 Days
          </p>
          <h3 className="text-2xl font-black text-amber-700 dark:text-amber-400">
            {stats.upcomingDueCount} Policies
          </h3>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Immediate Attention Required
          </p>
        </div>
        <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
          <Clock size={24} />
        </div>
      </div>
    </div>
  );
};

export default InsuranceExecutiveKPIs;