import { TrendingUp, Shield, HeartPulse, Car } from "lucide-react";

export const SUB_TYPE_GROUPS = [
  {
    id: "INVESTMENT_PENSION",
    label: "ULIP & Pension Assets",
    subLabel: "Market-Linked & Retirement Plans",
    icon: TrendingUp,
    color:
      "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20",
    badgeColor:
      "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
    match: (type) =>
      ["LIFE_ULIP", "PENSION_NPS", "LIFE_ENDOWMENT"].includes(type),
  },
  {
    id: "LIFE_TERM",
    label: "Term Life Protection",
    subLabel: "Pure Financial Security",
    icon: Shield,
    color:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
    badgeColor:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    match: (type) => type === "LIFE_TERM",
  },
  {
    id: "HEALTH",
    label: "Health & Mediclaim",
    subLabel: "Hospitalization & Medical Cover",
    icon: HeartPulse,
    color:
      "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20",
    badgeColor:
      "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
    match: (type) => type?.startsWith("HEALTH"),
  },
  {
    id: "MOTOR_GENERAL",
    label: "Motor & General Protection",
    subLabel: "Vehicles & Asset Insurance",
    icon: Car,
    color:
      "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
    badgeColor:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    match: (type) =>
      type?.startsWith("MOTOR") ||
      (!["LIFE_ULIP", "PENSION_NPS", "LIFE_ENDOWMENT", "LIFE_TERM"].includes(
        type
      ) &&
        !type?.startsWith("HEALTH")),
  },
];

/**
 * Normalizes any person's name to use only First and Last Name, ignoring middle names.
 * Example: "MANAN UDAY DALAL" -> "MANAN DALAL"
 * Example: "JBHGI YGUGUG U UFU" -> "JBHGI UFU"
 * Example: "PRIYA" -> "PRIYA"
 */
export const getNormalizedPersonName = (rawName) => {
  if (!rawName || typeof rawName !== "string") return "";
  const parts = rawName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] || "";
  return `${parts[0]} ${parts[parts.length - 1]}`;
};

export const formatCurrency = (val) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export const getStatusBadge = (status) => {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
    case "GRACE_PERIOD":
      return "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
    case "PAID_UP":
      return "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20";
    case "LAPSED":
      return "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
    default:
      return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700";
  }
};