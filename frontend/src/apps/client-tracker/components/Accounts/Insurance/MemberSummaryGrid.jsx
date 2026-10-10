import React from "react";
import {
  User,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency, getNormalizedPersonName } from "./insuranceUtils";

const MemberSummaryGrid = ({ peopleList, policies, onSelectPerson }) => {
  if (peopleList.length === 0) {
    return (
      <div className="py-16 text-center bg-white dark:bg-[#0F172A] rounded-md border border-slate-200 dark:border-white/10 shadow-xs">
        <ShieldCheck
          size={32}
          className="mx-auto text-slate-300 dark:text-slate-600 mb-2"
        />
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
          No family members found
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Add a policy to get started.
        </p>
      </div>
    );
  }

  // Pre-calculate aggregate metrics per normalized person name
  const memberSummaries = peopleList.map((person) => {
    const memberPolicies = policies.filter(
      (p) =>
        getNormalizedPersonName(p.policyHolder).toLowerCase() ===
        person.toLowerCase()
    );

    const totalAnnualPremium = memberPolicies.reduce(
      (sum, p) => sum + (p.premiumAmount || 0),
      0
    );

    const totalRiskCover = memberPolicies
      .filter(
        (p) => p.policyType === "LIFE_TERM" || p.policyType?.startsWith("HEALTH")
      )
      .reduce((sum, p) => sum + (p.sumAssured || 0), 0);

    const totalInvestmentValuation = memberPolicies
      .filter((p) =>
        ["LIFE_ULIP", "PENSION_NPS", "LIFE_ENDOWMENT"].includes(p.policyType)
      )
      .reduce(
        (sum, p) =>
          sum + (p.investmentDetails?.currentValuation || p.sumAssured || 0),
        0
      );

    const sortedDues = memberPolicies
      .filter((p) => p.nextDueDate)
      .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
    const earliestDue = sortedDues.length > 0 ? sortedDues[0] : null;

    const termCount = memberPolicies.filter((p) => p.policyType === "LIFE_TERM").length;
    const healthCount = memberPolicies.filter((p) => p.policyType?.startsWith("HEALTH")).length;
    const ulipCount = memberPolicies.filter((p) =>
      ["LIFE_ULIP", "PENSION_NPS", "LIFE_ENDOWMENT"].includes(p.policyType)
    ).length;
    const motorCount = memberPolicies.filter((p) => p.policyType?.startsWith("MOTOR")).length;

    return {
      person,
      count: memberPolicies.length,
      totalAnnualPremium,
      totalRiskCover,
      totalInvestmentValuation,
      earliestDue,
      breakdown: { termCount, healthCount, ulipCount, motorCount },
    };
  });

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-md shadow-xs overflow-hidden">
      
      {/* ========================================================= */}
      {/* DESKTOP VIEW: High-Density Comparative Summary Table      */}
      {/* ========================================================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <th className="py-3 px-5">Family Member</th>
              <th className="py-3 px-4">Coverage Mix</th>
              <th className="py-3 px-4 text-right">Pure Risk Cover</th>
              <th className="py-3 px-4 text-right">Fund Valuation</th>
              <th className="py-3 px-4 text-right">Annual Outflow</th>
              <th className="py-3 px-4">Next Renewal</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-medium">
            {memberSummaries.map((m) => (
              <tr
                key={m.person}
                onClick={() => onSelectPerson(m.person)}
                className="hover:bg-emerald-50/40 dark:hover:bg-emerald-500/[0.03] transition-colors cursor-pointer group"
              >
                {/* Member Identity (First and Last Name Only) */}
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <User size={15} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {m.person}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {m.count} {m.count === 1 ? "Policy" : "Policies"} Active
                      </p>
                    </div>
                  </div>
                </td>

                {/* Coverage Mix Badges */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1 max-w-[220px]">
                    {m.breakdown.termCount > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        {m.breakdown.termCount} Term
                      </span>
                    )}
                    {m.breakdown.healthCount > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                        {m.breakdown.healthCount} Health
                      </span>
                    )}
                    {m.breakdown.ulipCount > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                        {m.breakdown.ulipCount} ULIP/NPS
                      </span>
                    )}
                    {m.breakdown.motorCount > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                        {m.breakdown.motorCount} Motor
                      </span>
                    )}
                  </div>
                </td>

                {/* Pure Risk Cover */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {formatCurrency(m.totalRiskCover)}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Life & Health
                    </span>
                  </div>
                </td>

                {/* ULIP & NPS Valuation */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(m.totalInvestmentValuation)}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Market Linked
                    </span>
                  </div>
                </td>

                {/* Annual Outflow */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-extrabold font-mono text-slate-900 dark:text-white">
                      {formatCurrency(m.totalAnnualPremium)}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Annualized
                    </span>
                  </div>
                </td>

                {/* Next Renewal */}
                <td className="py-3.5 px-4">
                  {m.earliestDue ? (
                    <div className="flex items-center gap-1.5">
                      <Clock
                        size={12}
                        className={
                          m.earliestDue.isDueSoon
                            ? "text-amber-500"
                            : "text-slate-400"
                        }
                      />
                      <span
                        className={`font-mono text-xs font-bold ${
                          m.earliestDue.isDueSoon
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {new Date(m.earliestDue.nextDueDate).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 font-mono text-xs">—</span>
                  )}
                </td>

                {/* View Details Action */}
                <td className="py-3.5 px-5 text-right">
                  <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Ledger</span>
                    <ArrowRight size={13} strokeWidth={2.5} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========================================================= */}
      {/* MOBILE VIEW: Compact List Cards (< md)                   */}
      {/* ========================================================= */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-white/5">
        {memberSummaries.map((m) => (
          <div
            key={m.person}
            onClick={() => onSelectPerson(m.person)}
            className="p-3.5 flex flex-col gap-2.5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            {/* Top row: Name, count and navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-sm bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <User size={13} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    {m.person}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    {m.count} {m.count === 1 ? "Policy" : "Policies"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                <span>View</span>
                <ArrowRight size={12} strokeWidth={2.5} />
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 dark:bg-white/[0.02] rounded-sm border border-slate-100 dark:border-white/5">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block truncate">
                  Risk Cover
                </span>
                <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                  {formatCurrency(m.totalRiskCover)}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block truncate">
                  Fund Value
                </span>
                <span className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(m.totalInvestmentValuation)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block truncate">
                  Annual Outflow
                </span>
                <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                  {formatCurrency(m.totalAnnualPremium)}
                </span>
              </div>
            </div>

            {/* Bottom Row: Next Due Date & Mix */}
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 text-slate-400">
                <Clock
                  size={11}
                  className={m.earliestDue?.isDueSoon ? "text-amber-500" : "text-slate-400"}
                />
                <span>
                  Next Due:{" "}
                  <strong className="text-slate-700 dark:text-slate-300 font-mono">
                    {m.earliestDue
                      ? new Date(m.earliestDue.nextDueDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "None"}
                  </strong>
                </span>
              </div>

              <div className="flex gap-1">
                {m.breakdown.termCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-sm bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-[8px]">
                    {m.breakdown.termCount} Term
                  </span>
                )}
                {m.breakdown.healthCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-sm bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-[8px]">
                    {m.breakdown.healthCount} Health
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default MemberSummaryGrid;