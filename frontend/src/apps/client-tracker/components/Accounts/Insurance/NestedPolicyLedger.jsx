import React, { useState } from "react";
import {
  ChevronDown,
  Calendar,
  Users,
  Edit2,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import {
  SUB_TYPE_GROUPS,
  formatCurrency,
  getStatusBadge,
} from "./insuranceUtils";

const NestedPolicyLedger = ({ policies, onEditPolicy, onDeletePolicy }) => {
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroupCollapse = (groupId) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const groupedSections = SUB_TYPE_GROUPS.map((group) => {
    const items = policies.filter((p) => group.match(p.policyType));
    const totalPremium = items.reduce(
      (sum, p) => sum + (p.premiumAmount || 0),
      0
    );
    const totalValuation = items.reduce((sum, p) => {
      if (group.id === "INVESTMENT_PENSION") {
        return (
          sum + (p.investmentDetails?.currentValuation || p.sumAssured || 0)
        );
      }
      return sum + (p.sumAssured || 0);
    }, 0);

    return {
      ...group,
      items,
      totalPremium,
      totalValuation,
    };
  }).filter((group) => group.items.length > 0);

  if (groupedSections.length === 0) {
    return (
      <div className="py-16 text-center bg-white dark:bg-[#161B26] rounded-lg border border-slate-200 dark:border-slate-800/80">
        <ShieldCheck
          size={30}
          className="mx-auto text-slate-300 dark:text-slate-600 mb-2"
        />
        <p className="sora-font text-sm font-bold text-slate-800 dark:text-slate-200">
          No policies found for this member
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Click Add Policy above to record one.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          {/* Master Header */}
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/90 dark:bg-[#1C2230] text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-5">Policy Type</th>
              <th className="py-3.5 px-4 text-center">Policies</th>
              <th className="py-3.5 px-5 text-right">Cover / Fund Value</th>
              <th className="py-3.5 px-5 text-right">Yearly Premium</th>
              <th className="py-3.5 px-5 text-right w-20">Expand</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
            {groupedSections.map((group) => {
              const isCollapsed = !!collapsedGroups[group.id];
              const GroupIcon = group.icon;

              return (
                <React.Fragment key={group.id}>
                  {/* Master Category Row */}
                  <tr
                    onClick={() => toggleGroupCollapse(group.id)}
                    className="cursor-pointer hover:bg-sky-50/35 dark:hover:bg-white/[0.02] transition-colors group select-none"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-md border shrink-0 ${group.color}`}
                        >
                          <GroupIcon size={16} strokeWidth={2.2} />
                        </div>
                        <div>
                          <p className="sora-font font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                            {group.label}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {group.subLabel}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded border ${group.badgeColor}`}
                      >
                        {group.items.length}{" "}
                        {group.items.length === 1 ? "Policy" : "Policies"}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <span className="font-bold font-mono text-sm text-slate-900 dark:text-white tabular-nums block">
                        {formatCurrency(group.totalValuation)}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {group.id === "INVESTMENT_PENSION"
                          ? "Fund value"
                          : "Sum insured"}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <span className="font-bold font-mono text-sm text-sky-600 dark:text-sky-300 tabular-nums block">
                        {formatCurrency(group.totalPremium)}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        Per year
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex p-1 rounded text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${
                            isCollapsed ? "-rotate-90" : "rotate-0"
                          }`}
                        />
                      </div>
                    </td>
                  </tr>

                  {/* Nested Policy Rows */}
                  {!isCollapsed && (
                    <tr className="bg-slate-50/60 dark:bg-[#131720]">
                      <td
                        colSpan={5}
                        className="p-0 border-t border-b border-slate-200 dark:border-slate-800"
                      >
                        <div className="p-3.5 sm:px-5 sm:py-4">
                          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-[#161B26]">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#1C2230] text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                  <th className="py-2.5 px-3.5">
                                    Insurer & Policy #
                                  </th>
                                  <th className="py-2.5 px-3.5">
                                    Holder & Covered
                                  </th>
                                  <th className="py-2.5 px-3.5">
                                    {group.id === "INVESTMENT_PENSION"
                                      ? "Units & NAV"
                                      : group.id === "HEALTH"
                                        ? "TPA & Bonus"
                                        : group.id === "MOTOR_GENERAL"
                                          ? "Vehicle"
                                          : "Tax Section"}
                                  </th>
                                  <th className="py-2.5 px-3.5 text-right">
                                    {group.id === "INVESTMENT_PENSION"
                                      ? "Fund Value"
                                      : "Sum Insured"}
                                  </th>
                                  <th className="py-2.5 px-3.5 text-right">
                                    Premium
                                  </th>
                                  <th className="py-2.5 px-3.5">Next Due</th>
                                  <th className="py-2.5 px-3.5 text-center">
                                    Status
                                  </th>
                                  <th className="py-2.5 px-3.5 text-right">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                                {group.items.map((p) => {
                                  const isDueSoon = p.isDueSoon;

                                  return (
                                    <tr
                                      key={p._id}
                                      className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                                    >
                                      {/* Insurer & Policy # */}
                                      <td className="py-3 px-3.5">
                                        <div className="flex flex-col min-w-0">
                                          <span className="font-bold text-slate-900 dark:text-white truncate">
                                            {p.providerName}
                                          </span>
                                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                            {p.policyNumber}
                                          </span>
                                          <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-300 mt-0.5">
                                            {p.planName ||
                                              p.policyType.replace(/_/g, " ")}
                                          </span>
                                        </div>
                                      </td>

                                      {/* Holder & Covered */}
                                      <td className="py-3 px-3.5">
                                        <div className="flex flex-col">
                                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                                            {p.policyHolder}
                                          </span>
                                          {p.insuredPersons?.length > 0 && (
                                            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                              <Users size={11} />
                                              {p.insuredPersons
                                                .map((m) => m.name)
                                                .filter(Boolean)
                                                .join(", ")}
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      {/* Plan Specifics */}
                                      <td className="py-3 px-3.5">
                                        {group.id === "INVESTMENT_PENSION" && (
                                          <div className="flex flex-col text-[11px]">
                                            {p.investmentDetails?.unitsHeld >
                                            0 ? (
                                              <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                                                {p.investmentDetails.unitsHeld}{" "}
                                                units @ ₹
                                                {p.investmentDetails
                                                  .latestNav || 0}
                                              </span>
                                            ) : (
                                              <span className="text-slate-400">
                                                Regular Plan
                                              </span>
                                            )}
                                            <span className="text-[10px] font-semibold text-cyan-700 dark:text-cyan-300">
                                              Invested:{" "}
                                              {formatCurrency(
                                                p.investmentDetails
                                                  ?.totalInvestedTillDate
                                              )}
                                            </span>
                                          </div>
                                        )}

                                        {group.id === "HEALTH" && (
                                          <div className="flex flex-col text-[11px]">
                                            <span className="text-slate-800 dark:text-slate-200 font-semibold">
                                              TPA:{" "}
                                              {p.healthDetails?.tpaName ||
                                                "Direct"}
                                            </span>
                                            {p.healthDetails
                                              ?.cumulativeBonusNCB > 0 && (
                                              <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-300">
                                                +
                                                {formatCurrency(
                                                  p.healthDetails
                                                    .cumulativeBonusNCB
                                                )}{" "}
                                                Bonus
                                              </span>
                                            )}
                                          </div>
                                        )}

                                        {group.id === "MOTOR_GENERAL" && (
                                          <div className="flex flex-col text-[11px]">
                                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                                              {p.motorDetails?.vehicleNumber ||
                                                "No Reg #"}
                                            </span>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                              {p.motorDetails?.makeModel ||
                                                "Vehicle"}
                                            </span>
                                          </div>
                                        )}

                                        {group.id === "LIFE_TERM" && (
                                          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                                            Section{" "}
                                            {p.taxBenefitSection || "80C"}
                                          </span>
                                        )}
                                      </td>

                                      {/* Valuation / Sum Assured */}
                                      <td className="py-3 px-3.5 text-right tabular-nums">
                                        {group.id === "INVESTMENT_PENSION" ? (
                                          <span className="font-bold font-mono text-cyan-700 dark:text-cyan-300 text-sm">
                                            {formatCurrency(
                                              p.investmentDetails
                                                ?.currentValuation ||
                                                p.sumAssured
                                            )}
                                          </span>
                                        ) : (
                                          <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                                            {p.sumAssured
                                              ? formatCurrency(p.sumAssured)
                                              : "—"}
                                          </span>
                                        )}
                                      </td>

                                      {/* Premium */}
                                      <td className="py-3 px-3.5 text-right tabular-nums">
                                        <div className="flex flex-col items-end">
                                          <span className="font-bold font-mono text-slate-900 dark:text-white">
                                            {formatCurrency(p.premiumAmount)}
                                          </span>
                                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 capitalize">
                                            {p.premiumFrequency
                                              .toLowerCase()
                                              .replace(/_/g, " ")}{" "}
                                            • {p.premiumPayingTermYears || 1}y
                                            PPT
                                          </span>
                                        </div>
                                      </td>

                                      {/* Next Due */}
                                      <td className="py-3 px-3.5">
                                        <div className="flex items-center gap-1.5">
                                          <Calendar
                                            size={13}
                                            className={
                                              isDueSoon
                                                ? "text-amber-500"
                                                : "text-slate-400"
                                            }
                                          />
                                          <span
                                            className={`font-semibold font-mono ${
                                              isDueSoon
                                                ? "text-amber-600 dark:text-amber-400"
                                                : "text-slate-800 dark:text-slate-200"
                                            }`}
                                          >
                                            {new Date(
                                              p.nextDueDate
                                            ).toLocaleDateString("en-IN", {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                            })}
                                          </span>
                                        </div>
                                      </td>

                                      {/* Status */}
                                      <td className="py-3 px-3.5 text-center">
                                        <span
                                          className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border ${getStatusBadge(
                                            p.status
                                          )}`}
                                        >
                                          {p.status.replace(/_/g, " ")}
                                        </span>
                                      </td>

                                      {/* Actions */}
                                      <td className="py-3 px-3.5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                          <button
                                            type="button"
                                            onClick={() => onEditPolicy(p)}
                                            className="p-1.5 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded transition-colors cursor-pointer"
                                            title="Edit Policy"
                                          >
                                            <Edit2 size={13} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => onDeletePolicy(p)}
                                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                                            title="Delete Policy"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NestedPolicyLedger;