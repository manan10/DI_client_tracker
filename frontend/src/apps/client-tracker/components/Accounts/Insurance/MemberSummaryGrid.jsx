import React from "react";
import { User, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { formatCurrency, getNormalizedPersonName } from "./insuranceUtils";

const MemberSummaryGrid = ({ peopleList, policies, onSelectPerson }) => {
  if (peopleList.length === 0) {
    return (
      <div className="py-16 text-center bg-white dark:bg-[#161B26] rounded-lg border border-slate-200 dark:border-slate-800/80">
        <ShieldCheck
          size={30}
          className="mx-auto text-slate-300 dark:text-slate-600 mb-2"
        />
        <p className="sora-font text-sm font-bold text-slate-800 dark:text-slate-200">
          No family members found
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Click Add Policy above to record your first policy.
        </p>
      </div>
    );
  }

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
        (p) =>
          p.policyType === "LIFE_TERM" || p.policyType?.startsWith("HEALTH")
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

    const termCount = memberPolicies.filter(
      (p) => p.policyType === "LIFE_TERM"
    ).length;
    const healthCount = memberPolicies.filter((p) =>
      p.policyType?.startsWith("HEALTH")
    ).length;
    const ulipCount = memberPolicies.filter((p) =>
      ["LIFE_ULIP", "PENSION_NPS", "LIFE_ENDOWMENT"].includes(p.policyType)
    ).length;
    const motorCount = memberPolicies.filter((p) =>
      p.policyType?.startsWith("MOTOR")
    ).length;

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
    <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg overflow-hidden">
      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/90 dark:bg-[#1C2230] text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-5">Member</th>
              <th className="py-3.5 px-4">Policy Types</th>
              <th className="py-3.5 px-4 text-right">Life & Health Cover</th>
              <th className="py-3.5 px-4 text-right">ULIP & NPS Value</th>
              <th className="py-3.5 px-4 text-right">Yearly Premium</th>
              <th className="py-3.5 px-4">Next Due</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
            {memberSummaries.map((m) => (
              <tr
                key={m.person}
                onClick={() => onSelectPerson(m.person)}
                className="hover:bg-sky-50/40 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
              >
                {/* Member Name */}
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/70 dark:border-sky-500/20 flex items-center justify-center shrink-0">
                      <User size={15} />
                    </div>
                    <div>
                      <p className="sora-font font-bold text-slate-900 dark:text-white capitalize group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                        {m.person.toLowerCase()}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {m.count} {m.count === 1 ? "policy" : "policies"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Policy Types */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1.5 max-w-[230px]">
                    {m.breakdown.termCount > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200/70 dark:border-sky-500/20">
                        {m.breakdown.termCount} Term
                      </span>
                    )}
                    {m.breakdown.healthCount > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-500/20">
                        {m.breakdown.healthCount} Health
                      </span>
                    )}
                    {m.breakdown.ulipCount > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200/70 dark:border-cyan-500/20">
                        {m.breakdown.ulipCount} ULIP/NPS
                      </span>
                    )}
                    {m.breakdown.motorCount > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-500/20">
                        {m.breakdown.motorCount} Motor
                      </span>
                    )}
                  </div>
                </td>

                {/* Life & Health Cover */}
                <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(m.totalRiskCover)}
                </td>

                {/* ULIP & NPS Value */}
                <td className="py-3.5 px-4 text-right font-mono font-semibold text-cyan-700 dark:text-cyan-300 tabular-nums">
                  {formatCurrency(m.totalInvestmentValuation)}
                </td>

                {/* Yearly Premium */}
                <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(m.totalAnnualPremium)}
                </td>

                {/* Next Due */}
                <td className="py-3.5 px-4">
                  {m.earliestDue ? (
                    <div className="flex items-center gap-1.5">
                      <Clock
                        size={13}
                        className={
                          m.earliestDue.isDueSoon
                            ? "text-amber-500"
                            : "text-slate-400"
                        }
                      />
                      <span
                        className={`font-mono text-xs font-semibold ${
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

                {/* View Policies Action */}
                <td className="py-3.5 px-5 text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-300 group-hover:translate-x-0.5 transition-transform">
                    <span>View Policies</span>
                    <ArrowRight size={13} strokeWidth={2.2} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE LIST CARDS (< md) */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
        {memberSummaries.map((m) => (
          <div
            key={m.person}
            onClick={() => onSelectPerson(m.person)}
            className="p-4 flex flex-col gap-3 hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/70 dark:border-sky-500/20 flex items-center justify-center shrink-0">
                  <User size={13} />
                </div>
                <div>
                  <h4 className="sora-font text-xs font-bold capitalize text-slate-900 dark:text-white">
                    {m.person.toLowerCase()}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {m.count} {m.count === 1 ? "policy" : "policies"}
                  </span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-300">
                <span>View</span>
                <ArrowRight size={12} strokeWidth={2.2} />
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 dark:bg-[#1C2230]/70 rounded-md border border-slate-200/60 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block truncate">
                  Cover
                </span>
                <span className="text-xs font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(m.totalRiskCover)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block truncate">
                  Fund Value
                </span>
                <span className="text-xs font-bold font-mono text-cyan-700 dark:text-cyan-300 tabular-nums">
                  {formatCurrency(m.totalInvestmentValuation)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block truncate">
                  Yearly
                </span>
                <span className="text-xs font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(m.totalAnnualPremium)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Clock
                  size={12}
                  className={
                    m.earliestDue?.isDueSoon
                      ? "text-amber-500"
                      : "text-slate-400"
                  }
                />
                <span>
                  Next due:{" "}
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">
                    {m.earliestDue
                      ? new Date(m.earliestDue.nextDueDate).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                          }
                        )
                      : "None"}
                  </strong>
                </span>
              </div>

              <div className="flex gap-1">
                {m.breakdown.termCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 font-semibold text-[10px]">
                    {m.breakdown.termCount} Term
                  </span>
                )}
                {m.breakdown.healthCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold text-[10px]">
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