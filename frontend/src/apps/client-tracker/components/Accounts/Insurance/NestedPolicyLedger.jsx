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
      <div className="py-16 text-center bg-white dark:bg-[#0F172A] rounded-md border border-slate-200 dark:border-white/10 shadow-xs">
        <ShieldCheck
          size={32}
          className="mx-auto text-slate-300 dark:text-slate-600 mb-2"
        />
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
          No policies recorded for this member
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Use the Add Policy button above to log a record.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-md shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          {/* Master Table Header */}
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <th className="py-3 px-5">Policy Category</th>
              <th className="py-3 px-4 text-center">Policies</th>
              <th className="py-3 px-5 text-right">Total Cover / Fund Value</th>
              <th className="py-3 px-5 text-right">Annual Premium</th>
              <th className="py-3 px-5 text-right w-16">Details</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-medium">
            {groupedSections.map((group) => {
              const isCollapsed = !!collapsedGroups[group.id];
              const GroupIcon = group.icon;

              return (
                <React.Fragment key={group.id}>
                  {/* Master Category Row */}
                  <tr
                    onClick={() => toggleGroupCollapse(group.id)}
                    className="cursor-pointer hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors group select-none"
                  >
                    {/* Category Title & Badge */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-sm border shrink-0 ${group.color}`}>
                          <GroupIcon size={15} strokeWidth={2.4} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {group.label}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {group.subLabel}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Policy Count Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm border ${group.badgeColor}`}>
                        {group.items.length} {group.items.length === 1 ? "Policy" : "Policies"}
                      </span>
                    </td>

                    {/* Valuation / Cover Sum */}
                    <td className="py-3.5 px-5 text-right">
                      <span className="font-black font-mono text-sm text-slate-900 dark:text-white block">
                        {formatCurrency(group.totalValuation)}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        {group.id === "INVESTMENT_PENSION" ? "Fund Value" : "Sum Insured"}
                      </span>
                    </td>

                    {/* Annual Premium Total */}
                    <td className="py-3.5 px-5 text-right">
                      <span className="font-black font-mono text-sm text-emerald-600 dark:text-emerald-400 block">
                        {formatCurrency(group.totalPremium)}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        Annual Outflow
                      </span>
                    </td>

                    {/* Toggle Chevron */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex p-1 rounded-sm text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors">
                        <ChevronDown
                          size={15}
                          className={`transition-transform duration-200 ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
                        />
                      </div>
                    </td>
                  </tr>

                  {/* Nested Sub-Table Row */}
                  {!isCollapsed && (
                    <tr className="bg-slate-50/50 dark:bg-black/20">
                      <td colSpan={5} className="p-0 border-t border-b border-slate-200 dark:border-white/10">
                        <div className="p-3.5 sm:px-5 sm:py-3.5">
                          <div className="border border-slate-200 dark:border-white/10 rounded-md overflow-hidden bg-white dark:bg-[#0B1120] shadow-2xs">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                  <th className="py-2.5 px-3.5">Policy & Insurer</th>
                                  <th className="py-2.5 px-3.5">Holder & Covered</th>
                                  <th className="py-2.5 px-3.5">
                                    {group.id === "INVESTMENT_PENSION"
                                      ? "Units & NAV"
                                      : group.id === "HEALTH"
                                      ? "TPA & Bonus NCB"
                                      : group.id === "MOTOR_GENERAL"
                                      ? "Vehicle & Model"
                                      : "Tax Section"}
                                  </th>
                                  <th className="py-2.5 px-3.5 text-right">
                                    {group.id === "INVESTMENT_PENSION" ? "Valuation" : "Sum Insured"}
                                  </th>
                                  <th className="py-2.5 px-3.5 text-right">Premium</th>
                                  <th className="py-2.5 px-3.5">Renewal Due</th>
                                  <th className="py-2.5 px-3.5 text-center">Status</th>
                                  <th className="py-2.5 px-3.5 text-right">Actions</th>
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
                                      <td className="py-3 px-3.5">
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
                                      <td className="py-3 px-3.5">
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
                                      <td className="py-3 px-3.5">
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
                                      <td className="py-3 px-3.5 text-right">
                                        {group.id === "INVESTMENT_PENSION" ? (
                                          <div className="flex flex-col items-end">
                                            <span className="font-black font-mono text-indigo-700 dark:text-indigo-400 text-sm">
                                              {formatCurrency(p.investmentDetails?.currentValuation || p.sumAssured)}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                              Fund Value
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex flex-col items-end">
                                            <span className="font-black font-mono text-slate-900 dark:text-white text-sm">
                                              {p.sumAssured ? formatCurrency(p.sumAssured) : "—"}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                              Sum Insured
                                            </span>
                                          </div>
                                        )}
                                      </td>

                                      {/* Premium */}
                                      <td className="py-3 px-3.5 text-right">
                                        <div className="flex flex-col items-end">
                                          <span className="font-bold font-mono text-slate-900 dark:text-white">
                                            {formatCurrency(p.premiumAmount)}
                                          </span>
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            {p.premiumFrequency.replace(/_/g, " ")} • {p.premiumPayingTermYears || 1}y PPT
                                          </span>
                                        </div>
                                      </td>

                                      {/* Renewal Due */}
                                      <td className="py-3 px-3.5">
                                        <div className="flex items-center gap-1.5">
                                          <Calendar
                                            size={13}
                                            className={isDueSoon ? "text-amber-600" : "text-slate-400"}
                                          />
                                          <span
                                            className={`font-bold font-mono ${
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
                                      <td className="py-3 px-3.5 text-center">
                                        <span
                                          className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-sm border ${getStatusBadge(
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
                                            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-sm transition-colors cursor-pointer"
                                            title="Edit Policy"
                                          >
                                            <Edit2 size={13} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => onDeletePolicy(p)}
                                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-sm transition-colors cursor-pointer"
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