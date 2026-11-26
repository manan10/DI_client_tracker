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

const PolicyModalContent = ({ onClose, onSave, editingPolicy, saving }) => {
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

  const inputClass =
    "w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-[#161B26] border border-slate-200 dark:border-slate-700/90 rounded-md text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/15 transition-all";

  const labelClass =
    "text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/50 dark:bg-black/75 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#131720] w-full max-w-5xl rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#161B26] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/70 dark:border-sky-500/20">
              <Shield size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="sora-font text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {editingPolicy ? (
                  <>
                    Edit{" "}
                    <span className="font-normal text-sky-600 dark:text-sky-300">
                      Policy
                    </span>
                  </>
                ) : (
                  <>
                    Add{" "}
                    <span className="font-normal text-sky-600 dark:text-sky-300">
                      Policy
                    </span>
                  </>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record policy, health, motor, or pension plan details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-7 space-y-7 max-h-[78vh] overflow-y-auto custom-scrollbar"
        >
          {/* Section 1: Policy Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
              <h4 className="sora-font text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-300">
                1. Policy Details
              </h4>
              <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded bg-slate-100 dark:bg-[#1C2230] text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70">
                {isInvestment
                  ? "ULIP / Pension"
                  : isHealth
                    ? "Health Cover"
                    : isMotor
                      ? "Vehicle Cover"
                      : "Life Cover"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Policy Type *</label>
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
                  className={`${inputClass} cursor-pointer`}
                >
                  {POLICY_TYPES.map((pt) => (
                    <option
                      key={pt.id}
                      value={pt.id}
                      className="dark:bg-[#161B26] text-slate-900 dark:text-white"
                    >
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Policy / PRAN Number *</label>
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
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label className={labelClass}>Insurance Company *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Life / Star Health"
                  value={formData.providerName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      providerName: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Plan Name</label>
                <input
                  type="text"
                  placeholder="e.g. Optima Secure / Click 2 Protect"
                  value={formData.planName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      planName: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Tax Section</label>
                <select
                  value={formData.taxBenefitSection}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      taxBenefitSection: e.target.value,
                    }))
                  }
                  className={`${inputClass} cursor-pointer`}
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

          {/* Section 2A: Investment / ULIP / NPS */}
          {isInvestment && (
            <div className="p-5 rounded-lg bg-cyan-50/40 dark:bg-cyan-500/[0.04] border border-cyan-200/80 dark:border-cyan-500/20 space-y-4">
              <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                <TrendingUp size={18} />
                <h4 className="sora-font text-xs font-bold uppercase tracking-wider">
                  Units & Fund Value
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Units Held</label>
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
                    className={`${inputClass} bg-white dark:bg-[#131720] font-mono`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Latest NAV (₹)</label>
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
                    className={`${inputClass} bg-white dark:bg-[#131720] font-mono`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 block mb-1.5">
                    Current Fund Value (₹)
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
                    className={`${inputClass} bg-white dark:bg-[#131720] border-cyan-300 dark:border-cyan-500/40 font-mono font-bold text-cyan-700 dark:text-cyan-300`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Total Invested (₹)</label>
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
                    className={`${inputClass} bg-white dark:bg-[#131720] font-mono`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Fund Option</label>
                  <input
                    type="text"
                    placeholder="e.g. Aggressive / Balanced"
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
                    className={`${inputClass} bg-white dark:bg-[#131720]`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Lock-in End Date</label>
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
                    className={`${inputClass} bg-white dark:bg-[#131720]`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2B: Health Specifics */}
          {isHealth && (
            <div className="p-5 rounded-lg bg-sky-50/40 dark:bg-sky-500/[0.04] border border-sky-200/80 dark:border-sky-500/20 space-y-4">
              <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300">
                <HeartPulse size={18} />
                <h4 className="sora-font text-xs font-bold uppercase tracking-wider">
                  Health & TPA Details
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>TPA Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Medi Assist"
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
                    className={`${inputClass} bg-white dark:bg-[#131720]`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Deductible (₹)</label>
                  <input
                    type="number"
                    placeholder="For Top-ups"
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
                    className={`${inputClass} bg-white dark:bg-[#131720] font-mono`}
                  />
                </div>

                <div>
                  <label className={labelClass}>No-Claim Bonus (₹)</label>
                  <input
                    type="number"
                    placeholder="Bonus cover earned"
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
                    className={`${inputClass} bg-white dark:bg-[#131720] font-mono`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Room Rent Limit</label>
                  <input
                    type="text"
                    placeholder="e.g. Single Private AC / No Limit"
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
                    className={`${inputClass} bg-white dark:bg-[#131720]`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Co-Pay %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 0 or 10"
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
                    className={`${inputClass} bg-white dark:bg-[#131720] font-mono`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2C: Motor Specifics */}
          {isMotor && (
            <div className="p-5 rounded-lg bg-amber-50/40 dark:bg-amber-500/[0.04] border border-amber-200/80 dark:border-amber-500/20 space-y-4">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Car size={18} />
                <h4 className="sora-font text-xs font-bold uppercase tracking-wider">
                  Vehicle Details
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Registration Number *</label>
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
                    className={`${inputClass} bg-white dark:bg-[#131720] font-mono uppercase`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Car / Bike Model</label>
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
                    className={`${inputClass} bg-white dark:bg-[#131720]`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Vehicle IDV (₹)</label>
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
                    className={`${inputClass} bg-white dark:bg-[#131720] font-mono`}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-6 sm:col-span-3 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
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
                      className="w-4 h-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Zero Depreciation (Bumper to Bumper)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
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
                      className="w-4 h-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Engine Protector
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Cover, Premium & Dates */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800">
              <h4 className="sora-font text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-300">
                2. Cover, Premium & Dates
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>
                  {isInvestment
                    ? "Sum Assured (₹)"
                    : isHealth
                      ? "Sum Insured (₹)"
                      : "Cover / IDV (₹)"}
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
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label className={labelClass}>Premium Amount (₹) *</label>
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
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label className={labelClass}>Payment Cycle</label>
                <select
                  value={formData.premiumFrequency}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      premiumFrequency: e.target.value,
                    }))
                  }
                  className={`${inputClass} cursor-pointer`}
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
                <label className={labelClass}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="GRACE_PERIOD">Grace Period</option>
                  <option value="PAID_UP">Paid Up</option>
                  <option value="LAPSED">Lapsed</option>
                  <option value="MATURED">Matured</option>
                  <option value="SURRENDERED">Surrendered</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Policy Term (Years)</label>
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
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label className={labelClass}>Paying Term (Years)</label>
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
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label className={labelClass}>Start Date *</label>
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
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Next Due Date *</label>
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
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Policy Holder & Covered Members */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
              <h4 className="sora-font text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-300">
                3. Policy Holder & Nominee
              </h4>
              <button
                type="button"
                onClick={addInsuredPerson}
                className="text-xs font-semibold text-sky-600 dark:text-sky-300 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus size={14} /> Add Covered Member
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Policy Holder Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Primary policy holder"
                  value={formData.policyHolder}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      policyHolder: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Nominee Name & Relation</label>
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
                    className={inputClass}
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
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Covered Members List */}
            <div className="space-y-2.5 pt-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Covered Members
              </label>
              {formData.insuredPersons.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <input
                    type="text"
                    placeholder="Member Name"
                    value={p.name}
                    onChange={(e) =>
                      handleInsuredChange(idx, "name", e.target.value)
                    }
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Relation (e.g. Self, Spouse)"
                    value={p.relation}
                    onChange={(e) =>
                      handleInsuredChange(idx, "relation", e.target.value)
                    }
                    className={`${inputClass} sm:w-56`}
                  />
                  {formData.insuredPersons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInsuredPerson(idx)}
                      className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Agent & Notes */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800">
              <h4 className="sora-font text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-300">
                4. Agent & Notes
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Agent Name & Phone</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Agent Name"
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
                    className={inputClass}
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
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Portal Link</label>
                <input
                  type="text"
                  placeholder="https://..."
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
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Notes</label>
              <textarea
                rows={2}
                placeholder="Riders, special terms, or renewal remarks..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-2.5 rounded-lg text-xs font-semibold tracking-wide bg-sky-600 hover:bg-sky-500 text-white transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving
                ? "Saving..."
                : editingPolicy
                  ? "Update Policy"
                  : "Save Policy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PolicyModal = ({ isOpen, onClose, onSave, editingPolicy, saving }) => {
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