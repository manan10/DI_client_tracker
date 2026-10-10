import React, { useState } from "react";
import {
  ChevronDown,
  Calendar,
  Users,
  Edit2,
  Trash2,
} from "lucide-react";
import {
  SUB_TYPE_GROUPS,
  formatCurrency,
  getStatusBadge,
} from "./insuranceUtils";

const NestedPolicyLedger = ({
  policies,
  onEditPolicy,
  onDeletePolicy,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroupCollapse = (groupId) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const groupedSections = SUB_TYPE_GROUPS.map((group) => {
    const items = policies.filter((p) => group.match(p.policyType));
    const totalPremium = items.reduce((sum, p) => sum + (p.premiumAmount || 0), 0);
    const totalValuation = items.reduce((sum, p) => {
      if (group.id === "INVESTMENT_PENSION") {
        return sum + (p.investmentDetails?.currentValuation || p.sumAssured || 0);
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
      <div className="py-20 text-center bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
          No policies recorded for this member
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedSections.map((group) => {
        const isCollapsed = !!collapsedGroups[group.id];
        const GroupIcon = group.icon;

        return (
          <div
            key={group.id}
            className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xs overflow-hidden transition-all"
          >
            {/* Master Header Card */}
            <div
              onClick={() => toggleGroupCollapse(group.id)}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-white/[0.015] border-b border-slate-200/80 dark:border-white/10 transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border shrink-0 ${group.color}`}>
                  <GroupIcon size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-[1000] text-slate-900 dark:text-white uppercase tracking-wider">
                      {group.label}
                    </h3>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${group.badgeColor}`}>
                      {group.items.length} {group.items.length === 1 ? "Policy" : "Policies"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    {group.subLabel}
                  </p>
                </div>
              </div>

              {/* Totals & Chevron Toggle */}
              <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    {group.id === "INVESTMENT_PENSION" ? "Total Valuation" : "Total Cover"}
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {formatCurrency(group.totalValuation)}
                  </span>
                </div>

                <div className="text-right border-l border-slate-200 dark:border-white/10 pl-6">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Annual Premium
                  </span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(group.totalPremium)}
                  </span>
                </div>

                <div className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-transform">
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
                  />
                </div>
              </div>
            </div>

            {/* Inner Table */}
            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <th className="py-3 px-4">Policy & Insurer</th>
                      <th className="py-3 px-4">Holder & Lives Covered</th>
                      <th className="py-3 px-4">
                        {group.id === "INVESTMENT_PENSION"
                          ? "Units & NAV"
                          : group.id === "HEALTH"
                          ? "TPA & Cumulative NCB"
                          : group.id === "MOTOR_GENERAL"
                          ? "Vehicle & Model"
                          : "Tax Section"}
                      </th>
                      <th className="py-3 px-4">
                        {group.id === "INVESTMENT_PENSION" ? "Current Valuation" : "Sum Insured"}
                      </th>
                      <th className="py-3 px-4">Premium & Term</th>
                      <th className="py-3 px-4">Renewal Due</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-medium">
                    {group.items.map((p) => {
                      const isDueSoon = p.isDueSoon;

                      return (
                        <tr
                          key={p._id}
                          className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          {/* Policy & Insurer */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-slate-900 dark:text-white truncate">
                                {p.providerName}
                              </span>
                              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                                {p.policyNumber}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase mt-0.5">
                                {p.planName || p.policyType.replace(/_/g, " ")}
                              </span>
                            </div>
                          </td>

                          {/* Holder & Members */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-slate-100">
                                {p.policyHolder}
                              </span>
                              {p.insuredPersons?.length > 0 && (
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Users size={11} />
                                  {p.insuredPersons
                                    .map((m) => m.name)
                                    .filter(Boolean)
                                    .join(", ")}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Details Column */}
                          <td className="py-3.5 px-4">
                            {group.id === "INVESTMENT_PENSION" && (
                              <div className="flex flex-col text-[11px]">
                                {p.investmentDetails?.unitsHeld > 0 ? (
                                  <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">
                                    {p.investmentDetails.unitsHeld} Units @ ₹{p.investmentDetails.latestNav || 0}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">Regular Plan</span>
                                )}
                                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase">
                                  Invested: {formatCurrency(p.investmentDetails?.totalInvestedTillDate)}
                                </span>
                              </div>
                            )}

                            {group.id === "HEALTH" && (
                              <div className="flex flex-col text-[11px]">
                                <span className="text-slate-800 dark:text-slate-200 font-bold">
                                  TPA: {p.healthDetails?.tpaName || "Direct / In-House"}
                                </span>
                                {p.healthDetails?.cumulativeBonusNCB > 0 && (
                                  <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase">
                                    +{formatCurrency(p.healthDetails.cumulativeBonusNCB)} NCB Bonus
                                  </span>
                                )}
                              </div>
                            )}

                            {group.id === "MOTOR_GENERAL" && (
                              <div className="flex flex-col text-[11px]">
                                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                                  {p.motorDetails?.vehicleNumber || "No Reg #"}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                  {p.motorDetails?.makeModel || "Vehicle"}
                                </span>
                              </div>
                            )}

                            {group.id === "LIFE_TERM" && (
                              <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">
                                Section {p.taxBenefitSection || "80C"} Benefit
                              </span>
                            )}
                          </td>

                          {/* Valuation / Sum Assured */}
                          <td className="py-3.5 px-4">
                            {group.id === "INVESTMENT_PENSION" ? (
                              <div className="flex flex-col">
                                <span className="font-black text-indigo-700 dark:text-indigo-400 text-sm">
                                  {formatCurrency(p.investmentDetails?.currentValuation || p.sumAssured)}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">
                                  Current Fund Value
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                <span className="font-black text-slate-900 dark:text-white text-sm">
                                  {p.sumAssured ? formatCurrency(p.sumAssured) : "—"}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">
                                  Sum Insured
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Premium */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {formatCurrency(p.premiumAmount)}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {p.premiumFrequency.replace(/_/g, " ")} • PPT: {p.premiumPayingTermYears || 1}y
                              </span>
                            </div>
                          </td>

                          {/* Renewal Due */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <Calendar
                                size={13}
                                className={isDueSoon ? "text-amber-600" : "text-slate-400"}
                              />
                              <span
                                className={`font-bold ${
                                  isDueSoon
                                    ? "text-amber-700 dark:text-amber-400"
                                    : "text-slate-800 dark:text-slate-200"
                                }`}
                              >
                                {new Date(p.nextDueDate).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border ${getStatusBadge(
                                p.status
                              )}`}
                            >
                              {p.status.replace(/_/g, " ")}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => onEditPolicy(p)}
                                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeletePolicy(p)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NestedPolicyLedger;