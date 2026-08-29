import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Plus,
  Search,
  Clock,
  IndianRupee,
  Edit2,
  Trash2,
  Calendar,
  Users,
  TrendingUp,
  HeartPulse,
  Car,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useApi } from "../../hooks/useApi";

import PolicyModal from "./Insurance/PolicyModal";
import { POLICY_TYPES } from "./Insurance/policyConstants";

const Insurance = () => {
  const { request } = useApi();
  const [policies, setPolicies] = useState([]);
  const [stats, setStats] = useState({
    totalPolicies: 0,
    activePolicies: 0,
    totalPureRiskCover: 0,
    totalInvestmentValuation: 0,
    annualizedPremium: 0,
    upcomingDueCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (groupFilter !== "ALL") params.append("group", groupFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await request(`/insurance?${params.toString()}`);
      if (res?.success) {
        setPolicies(res.data || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error("Failed to load insurance records", err);
      toast.error("Failed to fetch insurance portfolio");
    } finally {
      setLoading(false);
    }
  }, [request, groupFilter, statusFilter, search]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchPolicies();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchPolicies]);

  const handleSavePolicy = async (payload) => {
    try {
      setSaving(true);
      if (editingPolicy) {
        const res = await request(`/insurance/${editingPolicy._id}`, "PUT", payload);
        if (res?.success) {
          toast.success("Policy updated successfully");
          setIsModalOpen(false);
          setEditingPolicy(null);
          fetchPolicies();
        }
      } else {
        const res = await request("/insurance", "POST", payload);
        if (res?.success) {
          toast.success("Policy recorded successfully");
          setIsModalOpen(false);
          fetchPolicies();
        }
      }
    } catch (err) {
      console.error("Save Policy Error:", err);
      toast.error(err.message || "Failed to save policy record");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePolicy = async (policy) => {
    if (!window.confirm(`Delete record for ${policy.policyNumber} (${policy.providerName})?`)) return;
    try {
      const res = await request(`/insurance/${policy._id}`, "DELETE");
      if (res?.success) {
        toast.success("Policy removed");
        fetchPolicies();
      }
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Failed to delete policy");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getPolicyCategoryIcon = (type) => {
    if (["LIFE_ULIP", "PENSION_NPS", "LIFE_ENDOWMENT"].includes(type))
      return <TrendingUp size={15} className="text-indigo-500" />;
    if (type.startsWith("HEALTH")) return <HeartPulse size={15} className="text-teal-500" />;
    if (type.startsWith("MOTOR")) return <Car size={15} className="text-amber-500" />;
    return <Shield size={15} className="text-emerald-500" />;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
      case "GRACE_PERIOD":
        return "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
      case "PAID_UP":
        return "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20";
      case "LAPSED":
        return "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. EXECUTIVE SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pure Risk Coverage */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Risk & Health Cover
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(stats.totalPureRiskCover)}
            </h3>
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
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
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              ULIP & NPS Valuation
            </p>
            <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {formatCurrency(stats.totalInvestmentValuation)}
            </h3>
            <p className="text-[11px] font-bold text-slate-500">
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
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Annual Outflow
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(stats.annualizedPremium)}
            </h3>
            <p className="text-[11px] font-bold text-slate-500">
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
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Due Within 30 Days
            </p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats.upcomingDueCount} Policies
            </h3>
            <p className="text-[11px] font-bold text-slate-500">
              Immediate Attention Required
            </p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* 2. CATEGORY FILTER CHIPS & CONTROLS */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 overflow-x-auto">
          {[
            { id: "ALL", label: "All Policies" },
            { id: "INVESTMENT_PENSION", label: "ULIP & NPS" },
            { id: "HEALTH", label: "Health & Mediclaim" },
            { id: "LIFE_TERM", label: "Term Life" },
            { id: "MOTOR_GENERAL", label: "Motor & General" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setGroupFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                groupFilter === tab.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search, Status Filter & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-60">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search policy, PRAN, vehicle, or member..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="GRACE_PERIOD">Grace Period</option>
            <option value="PAID_UP">Paid Up</option>
            <option value="LAPSED">Lapsed</option>
            <option value="MATURED">Matured</option>
            <option value="SURRENDERED">Surrendered</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setEditingPolicy(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} strokeWidth={3} /> Add Record
          </button>
        </div>
      </div>

      {/* 3. POLICY LEDGER TABLE */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-slate-400">
            Loading insurance portfolio...
          </div>
        ) : policies.length === 0 ? (
          <div className="py-20 text-center">
            <ShieldCheck size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No insurance records found</p>
            <p className="text-xs text-slate-400 mt-1">Add your policies or adjust your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Policy & Insurer</th>
                  <th className="py-3.5 px-4">Holder & Lives Covered</th>
                  <th className="py-3.5 px-4">Coverage / Asset Details</th>
                  <th className="py-3.5 px-4">Valuation / Sum Insured</th>
                  <th className="py-3.5 px-4">Premium & Term</th>
                  <th className="py-3.5 px-4">Renewal Due</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-medium">
                {policies.map((p) => {
                  const isDueSoon = p.isDueSoon;
                  const isInvestmentPolicy = ["LIFE_ULIP", "PENSION_NPS", "LIFE_ENDOWMENT"].includes(p.policyType);
                  const isHealthPolicy = p.policyType.startsWith("HEALTH");
                  const isMotorPolicy = p.policyType.startsWith("MOTOR");

                  return (
                    <tr
                      key={p._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-white/2 transition-colors"
                    >
                      {/* Policy & Insurer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 shrink-0 mt-0.5">
                            {getPolicyCategoryIcon(p.policyType)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              {p.providerName}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                              {p.policyNumber}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mt-0.5">
                              {p.planName || p.policyType.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Holder & Members */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {p.policyHolder}
                          </span>
                          {p.insuredPersons?.length > 0 && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Users size={11} />
                              {p.insuredPersons.map((m) => m.name).filter(Boolean).join(", ")}
                            </span>
                          )}
                          {p.nominee?.name && (
                            <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                              Nominee: {p.nominee.name} ({p.nominee.relation || "Nominee"})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Specific Details Column */}
                      <td className="py-3.5 px-4">
                        {isInvestmentPolicy && (
                          <div className="flex flex-col text-[11px]">
                            {p.investmentDetails?.unitsHeld > 0 && (
                              <span className="font-mono text-slate-700 dark:text-slate-300">
                                {p.investmentDetails.unitsHeld} Units @ ₹{p.investmentDetails.latestNav || 0}
                              </span>
                            )}
                            <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                              Invested: {formatCurrency(p.investmentDetails?.totalInvestedTillDate)}
                            </span>
                          </div>
                        )}

                        {isHealthPolicy && (
                          <div className="flex flex-col text-[11px]">
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                              TPA: {p.healthDetails?.tpaName || "Direct / In-House"}
                            </span>
                            {p.healthDetails?.cumulativeBonusNCB > 0 && (
                              <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase">
                                +{formatCurrency(p.healthDetails.cumulativeBonusNCB)} NCB Bonus
                              </span>
                            )}
                          </div>
                        )}

                        {isMotorPolicy && (
                          <div className="flex flex-col text-[11px]">
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {p.motorDetails?.vehicleNumber || "No Reg #"}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {p.motorDetails?.makeModel || "Vehicle"}
                            </span>
                          </div>
                        )}

                        {!isInvestmentPolicy && !isHealthPolicy && !isMotorPolicy && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            Section {p.taxBenefitSection} Benefit
                          </span>
                        )}
                      </td>

                      {/* Valuation / Sum Assured */}
                      <td className="py-3.5 px-4">
                        {isInvestmentPolicy ? (
                          <div className="flex flex-col">
                            <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
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

                      {/* Premium & Frequency */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {formatCurrency(p.premiumAmount)}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            {p.premiumFrequency.replace(/_/g, " ")} • PPT: {p.premiumPayingTermYears || 1}y
                          </span>
                        </div>
                      </td>

                      {/* Renewal Due */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className={isDueSoon ? "text-amber-500" : "text-slate-400"} />
                          <span
                            className={`font-bold ${
                              isDueSoon ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"
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
                          className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${getStatusBadge(
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
                            onClick={() => {
                              setEditingPolicy(p);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePolicy(p)}
                            className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
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

      {/* 4. MODAL DIALOG */}
      <PolicyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPolicy(null);
        }}
        onSave={handleSavePolicy}
        editingPolicy={editingPolicy}
        saving={saving}
      />
    </div>
  );
};

export default Insurance;