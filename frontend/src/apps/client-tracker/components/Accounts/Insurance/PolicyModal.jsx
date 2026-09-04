import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Shield,
  TrendingUp,
  HeartPulse,
  Car,
} from "lucide-react";
import { POLICY_TYPES, INITIAL_FORM } from "./policyConstants";

const getInitialFormData = (editingPolicy) => {
  if (!editingPolicy) return INITIAL_FORM;
  return {
    ...INITIAL_FORM,
    ...editingPolicy,
    sumAssured: editingPolicy.sumAssured || "",
    premiumAmount: editingPolicy.premiumAmount || "",
    policyTermYears: editingPolicy.policyTermYears || "1",
    premiumPayingTermYears: editingPolicy.premiumPayingTermYears || "1",
    startDate: editingPolicy.startDate
      ? new Date(editingPolicy.startDate).toISOString().slice(0, 10)
      : "",
    nextDueDate: editingPolicy.nextDueDate
      ? new Date(editingPolicy.nextDueDate).toISOString().slice(0, 10)
      : "",
    maturityDate: editingPolicy.maturityDate
      ? new Date(editingPolicy.maturityDate).toISOString().slice(0, 10)
      : "",
    nominee: editingPolicy.nominee || {
      name: "",
      relation: "",
      sharePercentage: 100,
    },
    insuredPersons: editingPolicy.insuredPersons?.length
      ? editingPolicy.insuredPersons
      : [{ name: "", relation: "Self" }],
    investmentDetails: {
      ...INITIAL_FORM.investmentDetails,
      ...(editingPolicy.investmentDetails || {}),
      unitsHeld: editingPolicy.investmentDetails?.unitsHeld || "",
      latestNav: editingPolicy.investmentDetails?.latestNav || "",
      currentValuation: editingPolicy.investmentDetails?.currentValuation || "",
      totalInvestedTillDate:
        editingPolicy.investmentDetails?.totalInvestedTillDate || "",
      lockInUntil: editingPolicy.investmentDetails?.lockInUntil
        ? new Date(editingPolicy.investmentDetails.lockInUntil)
            .toISOString()
            .slice(0, 10)
        : "",
    },
    healthDetails: {
      ...INITIAL_FORM.healthDetails,
      ...(editingPolicy.healthDetails || {}),
      deductibleAmount: editingPolicy.healthDetails?.deductibleAmount || "",
      cumulativeBonusNCB: editingPolicy.healthDetails?.cumulativeBonusNCB || "",
    },
    motorDetails: {
      ...INITIAL_FORM.motorDetails,
      ...(editingPolicy.motorDetails || {}),
      idv: editingPolicy.motorDetails?.idv || "",
    },
    servicingAgent: {
      ...INITIAL_FORM.servicingAgent,
      ...(editingPolicy.servicingAgent || {}),
    },
  };
};

const PolicyModalContent = ({
  onClose,
  onSave,
  editingPolicy,
  saving,
}) => {
  const [formData, setFormData] = useState(() =>
    getInitialFormData(editingPolicy)
  );

  const isInvestment = [
    "LIFE_ULIP",
    "PENSION_NPS",
    "LIFE_ENDOWMENT",
  ].includes(formData.policyType);

  const isHealth = [
    "HEALTH_INDIVIDUAL",
    "HEALTH_FLOATER",
    "HEALTH_SUPER_TOPUP",
    "HEALTH_CRITICAL_ILLNESS",
  ].includes(formData.policyType);

  const isMotor = [
    "MOTOR_FOUR_WHEELER",
    "MOTOR_TWO_WHEELER",
    "COMMERCIAL_VEHICLE",
  ].includes(formData.policyType);

  const handleInsuredChange = (index, field, val) => {
    const updated = [...formData.insuredPersons];
    updated[index][field] = val;
    setFormData((prev) => ({ ...prev, insuredPersons: updated }));
  };

  const addInsuredPerson = () => {
    setFormData((prev) => ({
      ...prev,
      insuredPersons: [...prev.insuredPersons, { name: "", relation: "" }],
    }));
  };

  const removeInsuredPerson = (index) => {
    if (formData.insuredPersons.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      insuredPersons: prev.insuredPersons.filter((_, i) => i !== index),
    }));
  };

  const calculateValuation = (units, nav) => {
    const u = parseFloat(units) || 0;
    const n = parseFloat(nav) || 0;
    if (u > 0 && n > 0) {
      return (u * n).toFixed(2);
    }
    return formData.investmentDetails.currentValuation;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      sumAssured: Number(formData.sumAssured) || 0,
      premiumAmount: Number(formData.premiumAmount) || 0,
      policyTermYears: Number(formData.policyTermYears) || 1,
      premiumPayingTermYears: Number(formData.premiumPayingTermYears) || 1,
      maturityDate: formData.maturityDate || null,
      insuredPersons: formData.insuredPersons.filter(
        (p) => p.name.trim() !== ""
      ),
      investmentDetails: {
        ...formData.investmentDetails,
        unitsHeld: Number(formData.investmentDetails.unitsHeld) || 0,
        latestNav: Number(formData.investmentDetails.latestNav) || 0,
        currentValuation:
          Number(formData.investmentDetails.currentValuation) || 0,
        totalInvestedTillDate:
          Number(formData.investmentDetails.totalInvestedTillDate) || 0,
        equityAllocationPct:
          Number(formData.investmentDetails.equityAllocationPct) || 0,
        debtAllocationPct:
          Number(formData.investmentDetails.debtAllocationPct) || 0,
        lockInUntil: formData.investmentDetails.lockInUntil || null,
      },
      healthDetails: {
        ...formData.healthDetails,
        deductibleAmount: Number(formData.healthDetails.deductibleAmount) || 0,
        cumulativeBonusNCB:
          Number(formData.healthDetails.cumulativeBonusNCB) || 0,
        copayPercentage: Number(formData.healthDetails.copayPercentage) || 0,
      },
      motorDetails: {
        ...formData.motorDetails,
        idv: Number(formData.motorDetails.idv) || 0,
        ncbPercentage: Number(formData.motorDetails.ncbPercentage) || 0,
      },
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#0B1120] w-full max-w-5xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/2 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {editingPolicy
                  ? "Update Policy Record"
                  : "Add Policy / Pension Portfolio"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Family asset, health, risk & retirement coverage registry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar"
        >
          {/* Section 1: Classification */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                1. Policy & Product Identification
              </h4>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500 uppercase">
                {isInvestment
                  ? "Market/Unit Linked"
                  : isHealth
                  ? "Health Risk"
                  : isMotor
                  ? "Asset Cover"
                  : "Pure Term"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Policy Category *
                </label>
                <select
                  value={formData.policyType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    let taxSec = "80D";
                    if (
                      ["LIFE_TERM", "LIFE_ULIP", "LIFE_ENDOWMENT"].includes(
                        newType
                      )
                    )
                      taxSec = "80C";
                    if (newType === "PENSION_NPS") taxSec = "80CCD(1B)";
                    if (
                      [
                        "MOTOR_FOUR_WHEELER",
                        "MOTOR_TWO_WHEELER",
                        "COMMERCIAL_VEHICLE",
                        "HOME_PROPERTY",
                      ].includes(newType)
                    )
                      taxSec = "NONE";

                    setFormData((prev) => ({
                      ...prev,
                      policyType: newType,
                      taxBenefitSection: taxSec,
                    }));
                  }}
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {POLICY_TYPES.map((pt) => (
                    <option
                      key={pt.id}
                      value={pt.id}
                      className="dark:bg-slate-900 text-slate-900 dark:text-white py-1"
                    >
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Policy / PRAN Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 028491823901"
                  value={formData.policyNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      policyNumber: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Provider / Insurer / PFM *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Life / Star Health / SBI Pension"
                  value={formData.providerName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      providerName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Plan / Product Scheme Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Optima Secure / Click 2 Protect / NPS Tier 1"
                  value={formData.planName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      planName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Tax Deduction Section
                </label>
                <select
                  value={formData.taxBenefitSection}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      taxBenefitSection: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="80D">Section 80D (Health)</option>
                  <option value="80C">Section 80C (Life/ULIP)</option>
                  <option value="80CCD(1B)">Section 80CCD(1B) (NPS ₹50k)</option>
                  <option value="80CCD(2)">Section 80CCD(2) (Employer NPS)</option>
                  <option value="10(10D)">Section 10(10D) (Maturity)</option>
                  <option value="NONE">None / Not Applicable</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: DYNAMIC CONTEXTUAL CARDS */}
          {/* A. Investment / ULIP / NPS */}
          {isInvestment && (
            <div className="p-5 sm:p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-200/80 dark:border-indigo-500/20 space-y-5 animate-in fade-in">
              <div className="flex items-center gap-2.5 text-indigo-700 dark:text-indigo-400">
                <TrendingUp size={20} />
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                  Investment, Units & Valuation Details
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Units Held / Balance
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="e.g. 1420.58"
                    value={formData.investmentDetails.unitsHeld}
                    onChange={(e) => {
                      const units = e.target.value;
                      const val = calculateValuation(
                        units,
                        formData.investmentDetails.latestNav
                      );
                      setFormData((prev) => ({
                        ...prev,
                        investmentDetails: {
                          ...prev.investmentDetails,
                          unitsHeld: units,
                          currentValuation:
                            val || prev.investmentDetails.currentValuation,
                        },
                      }));
                    }}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Latest NAV (₹)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="e.g. 84.25"
                    value={formData.investmentDetails.latestNav}
                    onChange={(e) => {
                      const nav = e.target.value;
                      const val = calculateValuation(
                        formData.investmentDetails.unitsHeld,
                        nav
                      );
                      setFormData((prev) => ({
                        ...prev,
                        investmentDetails: {
                          ...prev.investmentDetails,
                          latestNav: nav,
                          currentValuation:
                            val || prev.investmentDetails.currentValuation,
                        },
                      }));
                    }}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block mb-1.5">
                    Current Portfolio Valuation (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Total Value"
                    value={formData.investmentDetails.currentValuation}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        investmentDetails: {
                          ...prev.investmentDetails,
                          currentValuation: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-500/40 rounded-xl text-sm font-black text-indigo-700 dark:text-indigo-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Total Invested / Capital Paid (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    value={formData.investmentDetails.totalInvestedTillDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        investmentDetails: {
                          ...prev.investmentDetails,
                          totalInvestedTillDate: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Fund Option / Strategy
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aggressive (LC 75%) / Balanced"
                    value={formData.investmentDetails.fundOption}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        investmentDetails: {
                          ...prev.investmentDetails,
                          fundOption: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Lock-in / Maturation End
                  </label>
                  <input
                    type="date"
                    value={formData.investmentDetails.lockInUntil}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        investmentDetails: {
                          ...prev.investmentDetails,
                          lockInUntil: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* B. Health & Mediclaim Specifics */}
          {isHealth && (
            <div className="p-5 sm:p-6 rounded-2xl bg-teal-50/50 dark:bg-teal-500/5 border border-teal-200/80 dark:border-teal-500/20 space-y-5 animate-in fade-in">
              <div className="flex items-center gap-2.5 text-teal-700 dark:text-teal-400">
                <HeartPulse size={20} />
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                  Mediclaim, TPA & Hospitalization Details
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    TPA (Third Party Administrator)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Medi Assist / Vidal Health"
                    value={formData.healthDetails.tpaName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        healthDetails: {
                          ...prev.healthDetails,
                          tpaName: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Deductible Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="For Top-ups (e.g. 500000)"
                    value={formData.healthDetails.deductibleAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        healthDetails: {
                          ...prev.healthDetails,
                          deductibleAmount: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Cumulative Bonus (NCB ₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Bonus coverage earned"
                    value={formData.healthDetails.cumulativeBonusNCB}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        healthDetails: {
                          ...prev.healthDetails,
                          cumulativeBonusNCB: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Room Rent Limit / Capping
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Single Private AC / No Capping"
                    value={formData.healthDetails.roomRentLimit}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        healthDetails: {
                          ...prev.healthDetails,
                          roomRentLimit: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Co-Pay % (if any)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 10 or 0"
                    value={formData.healthDetails.copayPercentage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        healthDetails: {
                          ...prev.healthDetails,
                          copayPercentage: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* C. Motor & Vehicle Specifics */}
          {isMotor && (
            <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/80 dark:border-amber-500/20 space-y-5 animate-in fade-in">
              <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400">
                <Car size={20} />
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                  Vehicle & Add-on Coverage Details
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Vehicle Registration Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GJ-05-AB-1234"
                    value={formData.motorDetails.vehicleNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        motorDetails: {
                          ...prev.motorDetails,
                          vehicleNumber: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold font-mono uppercase text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Make & Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hyundai Creta SX"
                    value={formData.motorDetails.makeModel}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        motorDetails: {
                          ...prev.motorDetails,
                          makeModel: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Insured Declared Value (IDV ₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1450000"
                    value={formData.motorDetails.idv}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        motorDetails: {
                          ...prev.motorDetails,
                          idv: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-8 sm:col-span-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.motorDetails.hasZeroDepreciation}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          motorDetails: {
                            ...prev.motorDetails,
                            hasZeroDepreciation: e.target.checked,
                          },
                        }))
                      }
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Zero Depreciation Included (Bumper to Bumper)
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.motorDetails.hasEngineProtector}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          motorDetails: {
                            ...prev.motorDetails,
                            hasEngineProtector: e.target.checked,
                          },
                        }))
                      }
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Engine Protector Included
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Premiums & Schedules */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-100 dark:border-white/5">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                3. Coverage, Premium & Schedules
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  {isInvestment
                    ? "Sum Assured (₹)"
                    : isHealth
                    ? "Sum Insured (₹)"
                    : "Sum Assured / IDV (₹)"}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 10000000"
                  value={formData.sumAssured}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sumAssured: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Premium / Outflow (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 25000"
                  value={formData.premiumAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      premiumAmount: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Frequency
                </label>
                <select
                  value={formData.premiumFrequency}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      premiumFrequency: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="YEARLY">Yearly</option>
                  <option value="HALF_YEARLY">Half-Yearly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="SINGLE_PAY">Single Pay</option>
                  <option value="FLEXIBLE">Flexible (NPS)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="GRACE_PERIOD">GRACE PERIOD</option>
                  <option value="PAID_UP">PAID UP</option>
                  <option value="LAPSED">LAPSED</option>
                  <option value="MATURED">MATURED</option>
                  <option value="SURRENDERED">SURRENDERED</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Policy Term (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 30"
                  value={formData.policyTermYears}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      policyTermYears: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Paying Term (PPT)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 10"
                  value={formData.premiumPayingTermYears}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      premiumPayingTermYears: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Next Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.nextDueDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nextDueDate: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Members & Nominee */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                4. Policy Holder, Covered Lives & Beneficiaries
              </h4>
              <button
                type="button"
                onClick={addInsuredPerson}
                className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <Plus size={16} /> Add Covered Person
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Policy Holder Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Primary holder / Investor"
                  value={formData.policyHolder}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      policyHolder: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Nominee Details (Name & Relation)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nominee Name"
                    value={formData.nominee.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        nominee: { ...prev.nominee, name: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Relation"
                    value={formData.nominee.relation}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        nominee: { ...prev.nominee, relation: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Covered Lives Row */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Covered Lives / Insured Members
              </label>
              {formData.insuredPersons.map((p, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Member Name"
                    value={p.name}
                    onChange={(e) =>
                      handleInsuredChange(idx, "name", e.target.value)
                    }
                    className="flex-1 px-4 py-2.5 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Relation (e.g. Self, Spouse, Child)"
                    value={p.relation}
                    onChange={(e) =>
                      handleInsuredChange(idx, "relation", e.target.value)
                    }
                    className="w-56 px-4 py-2.5 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  {formData.insuredPersons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInsuredPerson(idx)}
                      className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Servicing Agent & Notes */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-100 dark:border-white/5">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                5. Servicing Advisor & Notes
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Advisor / Agent (Name & Phone)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Advisor Name"
                    value={formData.servicingAgent.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        servicingAgent: {
                          ...prev.servicingAgent,
                          name: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={formData.servicingAgent.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        servicingAgent: {
                          ...prev.servicingAgent,
                          phone: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Portal Login URL / Claims Portal
                </label>
                <input
                  type="text"
                  placeholder="https://cra-nsdl.com / insurer portal"
                  value={formData.servicingAgent.portalUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      servicingAgent: {
                        ...prev.servicingAgent,
                        portalUrl: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Internal Notes & Observations
              </label>
              <textarea
                rows={2}
                placeholder="Riders attached, special terms, renewal details..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                className="w-full p-4 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl text-sm font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving
                ? "Saving Record..."
                : editingPolicy
                ? "Update Policy"
                : "Save to Ledger"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PolicyModal = ({
  isOpen,
  onClose,
  onSave,
  editingPolicy,
  saving,
}) => {
  if (!isOpen) return null;

  return (
    <PolicyModalContent
      key={isOpen ? editingPolicy?._id || "new-policy" : "closed"}
      onClose={onClose}
      onSave={onSave}
      editingPolicy={editingPolicy}
      saving={saving}
    />
  );
};

export default PolicyModal;