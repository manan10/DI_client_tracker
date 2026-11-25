import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  TrendingUp,
  Wallet,
  Target,
  Repeat,
  ArrowDownCircle,
  Layers,
  Compass,
  Clock,
  Shield,
  CreditCard,
  Landmark,
  Coins,
  ShieldAlert,
  Copy,
  Send,
  Printer,
  User,
  Check,
  Globe,
  Pin,
  X,
  Image as ImageIcon,
  Search,
  Sparkles,
  ArrowLeft,
  Calculator,
} from "lucide-react";
import { toast } from "sonner";

import Logo from "../../../../assets/logo_nobrand.png";
import { useApi } from "../../../../shared/hooks/useApi";
import { generateBrandedPngCard } from "./calculators/exportBrandedCard";
import { formatINRCompact } from "./calculators/mathUtils";

import SipCalculator from "./calculators/SipCalculator";
import LumpsumCalculator from "./calculators/LumpsumCalculator";
import TargetCorpusCalculator from "./calculators/TargetCorpusCalculator";
import SipSwpCalculator from "./calculators/SipSwpCalculator";
import StpCalculator from "./calculators/StpCalculator";
import SwpCalculator from "./calculators/SwpCalculator";
import StepUpStpCalculator from "./calculators/StepUpStpCalculator";
import CapitalGainsCalculator from "./calculators/CapitalGainsCalculator";
import GoalPlannerCalculator from "./calculators/GoalPlannerCalculator";
import EmergencyFundCalculator from "./calculators/EmergencyFundCalculator";
import DelayCostCalculator from "./calculators/DelayCostCalculator";
import InsuranceCalculator from "./calculators/InsuranceCalculator";
import EmiCalculator from "./calculators/EmiCalculator";
import TaxEstimatorCalculator from "./calculators/TaxEstimatorCalculator";

const CALCULATOR_CATALOG = [
  {
    id: "sip",
    category: "wealth",
    name: "SIP & Step-Up",
    shortDesc: "Monthly wealth & step-up",
    subtitle: "Project long-term wealth creation through disciplined monthly SIPs and yearly step-ups.",
    icon: TrendingUp,
    badgeClass:
      "bg-emerald-50 text-emerald-600 border border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600",
    hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-500/50",
  },
  {
    id: "lumpsum",
    category: "wealth",
    name: "Lumpsum",
    shortDesc: "One-time MF vs FD",
    subtitle: "Compare one-time mutual fund compounding against post-tax bank fixed deposits.",
    icon: Wallet,
    badgeClass:
      "bg-teal-50 text-teal-600 border border-teal-200/80 dark:bg-teal-500/15 dark:text-teal-400 dark:border-teal-500/30 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600",
    hoverBorder: "hover:border-teal-400 dark:hover:border-teal-500/50",
  },
  {
    id: "target-corpus",
    category: "wealth",
    name: "Target Corpus",
    shortDesc: "Reverse SIP for goals",
    subtitle: "Reverse-calculate the exact monthly SIP needed to achieve any ₹50L–₹10 Cr+ wealth goal.",
    icon: Target,
    badgeClass:
      "bg-rose-50 text-rose-600 border border-rose-200/80 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600",
    hoverBorder: "hover:border-rose-400 dark:hover:border-rose-500/50",
  },
  {
    id: "capital-gains",
    category: "wealth",
    name: "Capital Gains",
    shortDesc: "LTCG / STCG & harvesting",
    subtitle: "Calculate mutual fund LTCG / STCG tax liability and check ₹1.25L tax-free profit harvesting.",
    icon: Coins,
    badgeClass:
      "bg-amber-50 text-amber-600 border border-amber-200/80 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600",
    hoverBorder: "hover:border-amber-400 dark:hover:border-amber-500/50",
  },
  {
    id: "sip-swp",
    category: "cashflow",
    name: "SIP + SWP",
    shortDesc: "Build & withdraw plan",
    subtitle: "Model a complete 2-phase journey: build a corpus via SIP, then draw monthly income via SWP.",
    icon: Layers,
    badgeClass:
      "bg-purple-50 text-purple-600 border border-purple-200/80 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600",
    hoverBorder: "hover:border-purple-400 dark:hover:border-purple-500/50",
  },
  {
    id: "stp",
    category: "cashflow",
    name: "STP Planner",
    shortDesc: "Liquid to equity transfer",
    subtitle: "Model systematic transfers from liquid/debt funds into equity over time.",
    icon: Repeat,
    badgeClass:
      "bg-indigo-50 text-indigo-600 border border-indigo-200/80 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600",
    hoverBorder: "hover:border-indigo-400 dark:hover:border-indigo-500/50",
  },
  {
    id: "stepup-stp",
    category: "cashflow",
    name: "Step-Up STP",
    shortDesc: "Escalating vs fixed STP",
    subtitle: "Compare regular fixed STP against annual step-up STP for aggressive equity accumulation.",
    icon: Repeat,
    badgeClass:
      "bg-sky-50 text-sky-600 border border-sky-200/80 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600",
    hoverBorder: "hover:border-sky-400 dark:hover:border-sky-500/50",
  },
  {
    id: "swp",
    category: "cashflow",
    name: "SWP Cashflow",
    shortDesc: "Monthly pension income",
    subtitle: "Plan regular monthly retirement cashflows and check corpus longevity.",
    icon: ArrowDownCircle,
    badgeClass:
      "bg-orange-50 text-orange-600 border border-orange-200/80 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600",
    hoverBorder: "hover:border-orange-400 dark:hover:border-orange-500/50",
  },
  {
    id: "emergency",
    category: "cashflow",
    name: "Emergency Fund",
    shortDesc: "Liquidity & buffer check",
    subtitle: "Calculate ideal liquidity buffer (3–12 months expenses & EMIs) and check cash reserves.",
    icon: ShieldAlert,
    badgeClass:
      "bg-red-50 text-red-600 border border-red-200/80 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600",
    hoverBorder: "hover:border-red-400 dark:hover:border-red-500/50",
  },
  {
    id: "goals",
    category: "goals",
    name: "Life Goals",
    shortDesc: "Education, home & more",
    subtitle: "Plan inflation-adjusted funds for Retirement, Education, Marriage, Home, Car, or Vacation.",
    icon: Compass,
    badgeClass:
      "bg-violet-50 text-violet-600 border border-violet-200/80 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/30 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600",
    hoverBorder: "hover:border-violet-400 dark:hover:border-violet-500/50",
  },
  {
    id: "delay",
    category: "goals",
    name: "Cost of Delay",
    shortDesc: "Impact of starting late",
    subtitle: "See the exact wealth impact of postponing your investment start date.",
    icon: Clock,
    badgeClass:
      "bg-amber-50 text-amber-600 border border-amber-200/80 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600",
    hoverBorder: "hover:border-amber-400 dark:hover:border-amber-500/50",
  },
  {
    id: "insurance",
    category: "goals",
    name: "Life Insurance",
    shortDesc: "Term cover (HLV)",
    subtitle: "Determine adequate term insurance cover based on income, loans, and goals.",
    icon: Shield,
    badgeClass:
      "bg-cyan-50 text-cyan-600 border border-cyan-200/80 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/30 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-600",
    hoverBorder: "hover:border-cyan-400 dark:hover:border-cyan-500/50",
  },
  {
    id: "emi",
    category: "goals",
    name: "Loan EMI",
    shortDesc: "EMI & SIP interest offset",
    subtitle: "Calculate monthly loan EMIs and see how a parallel SIP recovers your interest.",
    icon: CreditCard,
    badgeClass:
      "bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200/80 dark:bg-fuchsia-500/15 dark:text-fuchsia-400 dark:border-fuchsia-500/30 group-hover:bg-fuchsia-600 group-hover:text-white group-hover:border-fuchsia-600",
    hoverBorder: "hover:border-fuchsia-400 dark:hover:border-fuchsia-500/50",
  },
  {
    id: "tax",
    category: "goals",
    name: "Tax Estimator",
    shortDesc: "FY 26–27 New vs Old",
    subtitle: "Quick side-by-side comparison of New vs. Old Income Tax Regimes.",
    icon: Landmark,
    badgeClass:
      "bg-emerald-50 text-emerald-600 border border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600",
    hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-500/50",
  },
];

const SIDEBAR_GROUPS = [
  {
    id: "wealth",
    label: "Wealth Creation",
    icon: TrendingUp,
    badgeBg: "bg-emerald-100/80 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-300/70 dark:border-emerald-500/30",
  },
  {
    id: "cashflow",
    label: "STP & SWP Cashflow",
    icon: Repeat,
    badgeBg: "bg-purple-100/80 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-300/70 dark:border-purple-500/30",
  },
  {
    id: "goals",
    label: "Goals, Risk & Tax",
    icon: Compass,
    badgeBg: "bg-amber-100/80 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300/70 dark:border-amber-500/30",
  },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "gu", label: "ગુજરાતી" },
];

const READY_CALCULATORS = [
  "sip",
  "lumpsum",
  "target-corpus",
  "capital-gains",
  "sip-swp",
  "stp",
  "stepup-stp",
  "swp",
  "emergency",
  "goals",
  "delay",
  "insurance",
  "emi",
  "tax",
];

const Calculators = () => {
  const [isHubView, setIsHubView] = useState(true);
  const [hubSearch, setHubSearch] = useState("");
  const [selectedMode, setSelectedMode] = useState("sip");

  const [clientName, setClientName] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [crmClients, setCrmClients] = useState([]);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

  const [lang, setLang] = useState("en");
  const [copied, setCopied] = useState(false);
  const [exportingPng, setExportingPng] = useState(false);

  const { request } = useApi();
  const [pinnedPlanA, setPinnedPlanA] = useState(null);
  const clientPickerRef = useRef(null);

  const [sharePayload, setSharePayload] = useState({
    title: "Monthly SIP & Step-Up Wealth Plan",
    subtitle: "",
    whatsappText: "",
    takeaway: "",
    assumptions: [],
    highlights: [],
    milestones: [],
    disclaimer:
      "Mutual Fund investments are subject to market risks, read all scheme related documents carefully.",
  });

  useEffect(() => {
    let active = true;
    const loadClients = async () => {
      try {
        const res = await request("/clients/");
        if (active && res?.success) {
          setCrmClients(res.data || []);
        }
      } catch (err) {
        console.error("CRM client auto-fill fetch skipped:", err);
      }
    };
    loadClients();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (clientPickerRef.current && !clientPickerRef.current.contains(e.target)) {
        setClientDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, []);

  const handleOpenCalculator = (modeId) => {
    setSelectedMode(modeId);
    setPinnedPlanA(null);
    setIsHubView(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSummaryChange = useCallback((payload) => {
    setSharePayload(payload);
  }, []);

  const filteredCrmClients = useMemo(() => {
    const q = clientName.trim().toLowerCase();
    if (!q) return crmClients.slice(0, 8);
    return crmClients
      .filter(
        (c) =>
          (c.name || "").toLowerCase().includes(q) ||
          (c.phone || "").toLowerCase().includes(q) ||
          (c.familyHead || "").toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [crmClients, clientName]);

  const currentCalcObj =
    CALCULATOR_CATALOG.find((c) => c.id === selectedMode) || CALCULATOR_CATALOG[0];

  const isShareReady =
    READY_CALCULATORS.includes(selectedMode) && Boolean(sharePayload.whatsappText);

  const handlePinPlanA = () => {
    setPinnedPlanA({
      ...sharePayload,
      pinnedAt: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    toast.success("Pinned as Plan A! Adjust sliders now to compare Plan B side-by-side.");
  };

  const finalWhatsAppText = useMemo(() => {
    if (!sharePayload.whatsappText) return "";
    if (!pinnedPlanA) return sharePayload.whatsappText;

    const heroA =
      (pinnedPlanA.highlights || []).find((h) => h.isHero) ||
      (pinnedPlanA.highlights || []).slice(-1)[0];
    const heroB =
      (sharePayload.highlights || []).find((h) => h.isHero) ||
      (sharePayload.highlights || []).slice(-1)[0];

    const summaryA = (pinnedPlanA.assumptions || [])
      .map((a) => `${a.label}: ${a.value}`)
      .join(" | ");
    const summaryB = (sharePayload.assumptions || [])
      .map((a) => `${a.label}: ${a.value}`)
      .join(" | ");

    const comparisonBlock =
      `\n\n⚖️ *Side-by-Side Scenario Comparison (Plan A vs. Plan B)*\n` +
      `• *Plan A:* ${heroA?.value || "—"} (${summaryA})\n` +
      `• *Plan B:* ${heroB?.value || "—"} (${summaryB})\n`;

    return sharePayload.whatsappText.replace(
      /\n_Disclaimer:/,
      `${comparisonBlock}\n_Disclaimer:`
    );
  }, [sharePayload, pinnedPlanA]);

  const handleCopyWhatsApp = async () => {
    if (!finalWhatsAppText) return;
    try {
      await navigator.clipboard.writeText(finalWhatsAppText);
      setCopied(true);
      toast.success("Client summary copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy text. Please try again.");
    }
  };

  const handleOpenWhatsApp = () => {
    if (!finalWhatsAppText) return;
    const encoded = encodeURIComponent(finalWhatsAppText);
    const rawPhone = (selectedClient?.phone || "").replace(/\D/g, "");
    const phonePrefix =
      rawPhone.length === 10
        ? `91${rawPhone}`
        : rawPhone.length > 10
        ? rawPhone
        : "";
    const waUrl = phonePrefix
      ? `https://wa.me/${phonePrefix}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownloadPngCard = async () => {
    if (!isShareReady) return;
    setExportingPng(true);
    try {
      const dataUrl = await generateBrandedPngCard({
        logoSrc: Logo,
        clientName,
        sharePayload,
        pinnedPlanA,
      });
      const link = document.createElement("a");
      const safeSlug = (clientName.trim() || currentCalcObj.id)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      link.download = `Dalal-Investments-${safeSlug}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Branded PNG card downloaded! Ready to attach on WhatsApp.");
    } catch (err) {
      console.error("PNG card generation error:", err);
      toast.error("Could not generate PNG card.");
    } finally {
      setExportingPng(false);
    }
  };

  const handlePrintClientSheet = () => {
    const printWindow = window.open("", "_blank", "width=880,height=960");
    if (!printWindow) {
      toast.error("Please allow popups to generate the PDF illustration.");
      return;
    }

    const resolvedLogoUrl = new URL(Logo, window.location.origin).href;

    const preparedForHtml = clientName.trim()
      ? `<div class="client-badge">Prepared Exclusively For: <strong>${clientName.trim()}</strong></div>`
      : "";

    const takeawayHtml = sharePayload.takeaway
      ? `<div class="takeaway-box">
           <div class="takeaway-label">Executive Summary</div>
           <div class="takeaway-text">${sharePayload.takeaway}</div>
         </div>`
      : "";

    const heroA = pinnedPlanA
      ? (pinnedPlanA.highlights || []).find((h) => h.isHero) ||
        (pinnedPlanA.highlights || []).slice(-1)[0]
      : null;
    const heroB =
      (sharePayload.highlights || []).find((h) => h.isHero) ||
      (sharePayload.highlights || []).slice(-1)[0];

    const planComparisonHtml = pinnedPlanA
      ? `<div class="section-heading">Side-by-Side Scenario Comparison (Plan A vs. Plan B)</div>
         <table class="milestone-table" style="margin-bottom:20px;">
           <thead>
             <tr>
               <th>Scenario</th>
               <th>Parameters</th>
               <th style="text-align:right;">Headline Outcome</th>
             </tr>
           </thead>
           <tbody>
             <tr>
               <td><strong>Pinned Plan A</strong></td>
               <td>${(pinnedPlanA.assumptions || []).map((a) => `${a.label}: ${a.value}`).join(" • ")}</td>
               <td style="text-align:right; font-weight:800; color:#4f46e5;">${heroA?.value || "—"}</td>
             </tr>
             <tr style="background:#ecfdf5;">
               <td><strong>Current Plan B</strong></td>
               <td>${(sharePayload.assumptions || []).map((a) => `${a.label}: ${a.value}`).join(" • ")}</td>
               <td style="text-align:right; font-weight:800; color:#059669;">${heroB?.value || "—"}</td>
             </tr>
           </tbody>
         </table>`
      : "";

    const assumptionsHtml = (sharePayload.assumptions || [])
      .map(
        (item) => `
        <div class="assumption-card">
          <div class="assumption-label">${item.label}</div>
          <div class="assumption-val">${item.value}</div>
        </div>`
      )
      .join("");

    const highlightsHtml = (sharePayload.highlights || [])
      .map(
        (item) => `
        <tr class="${item.isHero ? "hero-row" : ""}">
          <td>
            <div class="row-title">${item.label}</div>
            ${item.sub ? `<div class="row-sub">${item.sub}</div>` : ""}
          </td>
          <td class="row-val">${item.value}</td>
        </tr>`
      )
      .join("");

    const milestonesHtml =
      sharePayload.milestones && sharePayload.milestones.length > 0
        ? `
        <div class="section-heading">Growth Milestone Snapshot</div>
        <table class="milestone-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Cashflow</th>
              <th>Baseline / Principal</th>
              <th>Gains / Variance</th>
              <th style="text-align:right;">Projected Value</th>
            </tr>
          </thead>
          <tbody>
            ${sharePayload.milestones
              .map(
                (m) => `
              <tr>
                <td><strong>Yr ${m.year}</strong></td>
                <td>${m.sip}</td>
                <td>${m.invested}</td>
                <td style="color:#059669; font-weight:600;">${m.profit}</td>
                <td style="text-align:right; font-weight:700;">${m.total}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>`
        : "";

    const todayStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${sharePayload.title} — Dalal Investments</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #0f172a;
              padding: 36px 44px;
              max-width: 800px;
              margin: 0 auto;
              line-height: 1.45;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2.5px solid #059669;
              padding-bottom: 18px;
              margin-bottom: 24px;
            }
            .brand-left { display: flex; align-items: center; gap: 14px; }
            .brand-logo { height: 44px; width: auto; object-fit: contain; }
            .brand-name { font-family: Georgia, "Times New Roman", serif; font-size: 22px; font-weight: 700; color: #0f172a; }
            .brand-sub { font-size: 10px; font-weight: 800; letter-spacing: 0.18em; color: #059669; text-transform: uppercase; margin-top: 3px; }
            .meta { text-align: right; font-size: 11px; color: #64748b; }
            .meta strong { color: #0f172a; display: block; font-size: 12px; }
            .doc-title { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
            .doc-sub { font-size: 12.5px; color: #475569; margin-bottom: 14px; }
            .client-badge { display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 6px 14px; border-radius: 6px; font-size: 12.5px; margin-bottom: 18px; }
            .takeaway-box { background: #f8fafc; border-left: 4px solid #059669; border: 1px solid #e2e8f0; border-left-width: 4px; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; }
            .takeaway-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #059669; margin-bottom: 4px; }
            .takeaway-text { font-size: 13px; color: #1e293b; font-weight: 500; }
            .section-heading { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; margin: 22px 0 10px 0; }
            .assumptions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
            .assumption-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
            .assumption-label { font-size: 10px; font-weight: 600; color: #64748b; }
            .assumption-val { font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; }
            .summary-table td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13.5px; }
            .row-title { font-weight: 700; color: #0f172a; }
            .row-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
            .row-val { text-align: right; font-weight: 800; font-size: 14.5px; white-space: nowrap; }
            .hero-row { background: #0f172a; color: #ffffff; }
            .hero-row .row-title { color: #6ee7b7; font-size: 14px; }
            .hero-row .row-sub { color: #cbd5e1; }
            .hero-row .row-val { color: #ffffff; font-size: 18px; }
            .hero-row td { border-bottom: none; }
            .milestone-table th { background: #f1f5f9; padding: 8px 12px; font-size: 11px; text-align: left; color: #475569; border-bottom: 1px solid #cbd5e1; }
            .milestone-table td { padding: 8px 12px; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
            .footer { margin-top: 32px; padding-top: 14px; border-top: 1px solid #cbd5e1; font-size: 10.5px; color: #64748b; }
            @media print { body { padding: 16px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand-left">
              <img src="${resolvedLogoUrl}" alt="Dalal Investments" class="brand-logo" />
              <div>
                <div class="brand-name">Dalal Investments</div>
                <div class="brand-sub">Private Wealth Desk • Co-Pilot Illustration</div>
              </div>
            </div>
            <div class="meta">
              <span>Illustration Date</span>
              <strong>${todayStr}</strong>
            </div>
          </div>

          <div class="doc-title">${sharePayload.title}</div>
          ${sharePayload.subtitle ? `<div class="doc-sub">${sharePayload.subtitle}</div>` : ""}
          ${preparedForHtml}
          ${takeawayHtml}
          ${planComparisonHtml}

          ${
            assumptionsHtml
              ? `<div class="section-heading">Plan Parameters</div>
                 <div class="assumptions-grid">${assumptionsHtml}</div>`
              : ""
          }

          <div class="section-heading">Projected Financial Outcome</div>
          <table class="summary-table">
            <tbody>${highlightsHtml}</tbody>
          </table>

          ${milestonesHtml}

          <div class="footer">
            <div>
              <strong>Disclaimer:</strong> ${sharePayload.disclaimer} The figures above are arithmetic illustrations based on assumed rates of return and do not guarantee future performance.
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 150);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const heroPlanA = pinnedPlanA
    ? (pinnedPlanA.highlights || []).find((h) => h.isHero) ||
      (pinnedPlanA.highlights || []).slice(-1)[0]
    : null;
  const heroPlanB =
    (sharePayload.highlights || []).find((h) => h.isHero) ||
    (sharePayload.highlights || []).slice(-1)[0];

  const filteredCatalog = useMemo(() => {
    const q = hubSearch.trim().toLowerCase();
    if (!q) return CALCULATOR_CATALOG;
    return CALCULATOR_CATALOG.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.shortDesc.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q)
    );
  }, [hubSearch]);

  return (
    <div className="w-full font-sans">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ===================================================================== */}
      {/* STEP 1: CLEAN TILE DIRECTORY                                          */}
      {/* ===================================================================== */}
      {isHubView ? (
        <div className="space-y-7 sm:space-y-9">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
              <Calculator size={15} className="text-emerald-600 dark:text-emerald-400" />
              <span>Select a calculator to generate client illustrations</span>
            </div>

            <div className="relative w-full sm:w-72 shrink-0">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={hubSearch}
                onChange={(e) => setHubSearch(e.target.value)}
                placeholder="Search calculators..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 focus:border-emerald-600 text-xs font-semibold text-slate-900 dark:text-white outline-none shadow-xs"
              />
              {hubSearch && (
                <button
                  type="button"
                  onClick={() => setHubSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {SIDEBAR_GROUPS.map((group) => {
            const items = filteredCatalog.filter((c) => c.category === group.id);
            if (items.length === 0) return null;
            const GroupIcon = group.icon;

            return (
              <section key={group.id} className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-300/80 dark:border-slate-700/80">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${group.badgeBg}`}>
                    <GroupIcon size={14} strokeWidth={2.3} />
                  </div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {group.label}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {items.map((calc) => {
                    const Icon = calc.icon;
                    return (
                      <button
                        key={calc.id}
                        type="button"
                        onClick={() => handleOpenCalculator(calc.id)}
                        className={`group bg-white dark:bg-[#111827] border border-slate-300/85 dark:border-slate-700/80 ${calc.hoverBorder} rounded-2xl px-3.5 py-5 sm:px-4 sm:py-6 shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col items-center text-center active:scale-[0.98]`}
                      >
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${calc.badgeClass} flex items-center justify-center mb-3 sm:mb-3.5 transition-colors duration-150`}
                        >
                          <Icon size={21} strokeWidth={2} />
                        </div>

                        <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                          {calc.name}
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 leading-tight">
                          {calc.shortDesc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* ===================================================================== */
        /* STEP 2: BORDERLESS CALCULATOR WORKSPACE (All Screen Sizes)            */
        /* ===================================================================== */
        <div className="w-full space-y-5 sm:space-y-6">
          
          {/* UNIFIED HEADER: BACK ICON + TITLE + LANGUAGE + CRM CLIENT + EXPORT BUTTONS */}
          <div className="space-y-3.5 pb-4 sm:pb-5 border-b border-slate-300/80 dark:border-slate-700/80">
            
            {/* Row 1: Back Icon Button + Title on Left | Action Buttons on Right */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setIsHubView(true)}
                    title="Back to All Calculators"
                    aria-label="Back to All Calculators"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0 transition-colors cursor-pointer active:scale-95 shadow-xs"
                  >
                    <ArrowLeft size={17} strokeWidth={2.5} />
                  </button>

                  <div className="min-w-0">
                    <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                      {currentCalcObj.name}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {currentCalcObj.subtitle}
                    </p>
                  </div>
                </div>

                {/* MOBILE: Compact Unified Icon-Only Action Group (< sm) */}
                {isShareReady && (
                  <div
                    role="group"
                    aria-label="Calculator Actions"
                    className="inline-flex sm:hidden items-center bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden divide-x divide-slate-300 dark:divide-slate-600 shadow-xs shrink-0"
                  >
                    <button
                      type="button"
                      onClick={pinnedPlanA ? () => setPinnedPlanA(null) : handlePinPlanA}
                      title={pinnedPlanA ? "Unpin Plan A" : "Pin Plan A"}
                      aria-label={pinnedPlanA ? "Unpin Plan A" : "Pin Plan A"}
                      className={`p-2 transition-colors cursor-pointer ${
                        pinnedPlanA
                          ? "bg-indigo-600 text-white"
                          : "text-indigo-600 dark:text-indigo-400 active:bg-indigo-50"
                      }`}
                    >
                      <Pin size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadPngCard}
                      disabled={exportingPng}
                      title="Download PNG Card"
                      aria-label="Download PNG Card"
                      className="p-2 text-amber-700 dark:text-amber-400 active:bg-amber-50 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <ImageIcon size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyWhatsApp}
                      title="Copy Summary"
                      aria-label="Copy Summary"
                      className="p-2 text-slate-700 dark:text-slate-200 active:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenWhatsApp}
                      title="Send on WhatsApp"
                      aria-label="Send on WhatsApp"
                      className="p-2 bg-emerald-600 text-white active:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      <Send size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintClientSheet}
                      title="Print / PDF"
                      aria-label="Print / PDF"
                      className="p-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 active:opacity-80 transition-colors cursor-pointer"
                    >
                      <Printer size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* DESKTOP & TABLET: Full Icon + Label Action Buttons (>= sm) */}
              {isShareReady && (
                <div className="hidden sm:flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={pinnedPlanA ? () => setPinnedPlanA(null) : handlePinPlanA}
                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer shadow-2xs ${
                      pinnedPlanA
                        ? "bg-indigo-600 text-white border-indigo-700"
                        : "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/40"
                    }`}
                  >
                    <Pin size={13} />
                    <span>{pinnedPlanA ? "Plan A Pinned" : "Pin Plan A"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPngCard}
                    disabled={exportingPng}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                  >
                    <ImageIcon size={14} />
                    <span>{exportingPng ? "Rendering..." : "PNG Card"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyWhatsApp}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 dark:bg-[#111827] dark:hover:bg-slate-800 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 transition-colors cursor-pointer shadow-2xs"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 shadow-xs transition-colors cursor-pointer"
                  >
                    <Send size={14} />
                    <span>
                      {selectedClient?.phone
                        ? `WhatsApp ${selectedClient.name.split(" ")[0]}`
                        : "Send on WhatsApp"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintClientSheet}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 border border-slate-900 dark:border-white shadow-xs transition-colors cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Print / PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* Row 2: Client Picker (Left) + Compact Language Switcher (Right) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* Searchable CRM Client Auto-Fill Input */}
              <div className="relative flex-1 sm:max-w-sm" ref={clientPickerRef}>
                <div className="flex items-center gap-2 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-600 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-xl px-3 py-2 shadow-xs">
                  <User size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <input
                    type="text"
                    placeholder={
                      crmClients.length > 0
                        ? `Search ${crmClients.length} CRM clients or type name...`
                        : "Client Name (for WhatsApp, PNG & PDF)..."
                    }
                    value={clientName}
                    onFocus={() => setClientDropdownOpen(true)}
                    onChange={(e) => {
                      setClientName(e.target.value);
                      setSelectedClient(null);
                      setClientDropdownOpen(true);
                    }}
                    className="text-xs font-bold text-slate-900 dark:text-white placeholder:font-medium placeholder:text-slate-400 bg-transparent outline-none w-full"
                  />
                  {clientName && (
                    <button
                      type="button"
                      onClick={() => {
                        setClientName("");
                        setSelectedClient(null);
                      }}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {clientDropdownOpen && filteredCrmClients.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1.5 rounded-xl bg-white dark:bg-[#131C31] border border-slate-300 dark:border-slate-600 shadow-2xl p-1.5 z-50 max-h-64 overflow-y-auto no-scrollbar space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Search size={11} />
                      <span>CRM Client Directory Auto-Fill</span>
                    </div>
                    {filteredCrmClients.map((client) => (
                      <button
                        key={client._id || client.id || client.name}
                        type="button"
                        onClick={() => {
                          setClientName(client.name || "");
                          setSelectedClient(client);
                          setClientDropdownOpen(false);
                          toast.success(`Loaded CRM profile: ${client.name}`);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left hover:bg-emerald-50 dark:hover:bg-emerald-500/15 transition-colors cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {client.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {client.phone || client.email || "CRM Client"}
                          </div>
                        </div>
                        {Number(client.aum) > 0 && (
                          <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/20 px-2 py-0.5 rounded shrink-0 ml-2">
                            AUM: {formatINRCompact(client.aum)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Language Pill aligned cleanly to the right */}
              <div className="flex items-center justify-between sm:justify-end gap-2">
                <span className="text-[11px] font-bold text-slate-500 sm:hidden inline-flex items-center gap-1">
                  <Globe size={12} />
                  <span>Report Language:</span>
                </span>
                <div className="inline-flex items-center gap-1 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-600 rounded-xl p-1 shadow-xs">
                  <Globe size={13} className="text-emerald-600 dark:text-emerald-400 ml-2 mr-0.5 hidden sm:block" />
                  {LANGUAGES.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setLang(item.code)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                        lang === item.code
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Universal Plan A vs. Plan B Comparison Drawer */}
            {pinnedPlanA && (
              <div className="rounded-2xl bg-indigo-50/90 dark:bg-indigo-500/10 border border-indigo-300 dark:border-indigo-500/35 p-3.5 sm:p-5 space-y-3 shadow-sm animate-in fade-in duration-150">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 text-xs font-extrabold text-indigo-800 dark:text-indigo-300">
                    <Sparkles size={14} className="shrink-0" />
                    <span>
                      Side-by-Side Scenario Comparison Active — Adjust sliders below to test Plan B against Pinned Plan A
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPinnedPlanA(null)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-rose-600 cursor-pointer"
                  >
                    <X size={13} />
                    <span>Clear</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="bg-white dark:bg-[#0B1120] border border-indigo-300 dark:border-indigo-500/40 rounded-xl p-2.5 sm:p-3.5 space-y-1 shadow-2xs">
                    <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 text-[9px] sm:text-[10px] font-extrabold uppercase inline-block">
                      Plan A ({pinnedPlanA.pinnedAt})
                    </span>
                    <div className="text-base sm:text-xl font-black text-slate-900 dark:text-white tabular-nums">
                      {(heroPlanA?.value || "—").split("(")[0].trim()}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {(pinnedPlanA.assumptions || [])
                        .map((a) => `${a.label}: ${a.value}`)
                        .join(" • ")}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#0B1120] border border-emerald-400 dark:border-emerald-500/40 rounded-xl p-2.5 sm:p-3.5 space-y-1 shadow-2xs">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[9px] sm:text-[10px] font-extrabold uppercase inline-block">
                      Plan B (Live)
                    </span>
                    <div className="text-base sm:text-xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {(heroPlanB?.value || "—").split("(")[0].trim()}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {(sharePayload.assumptions || [])
                        .map((a) => `${a.label}: ${a.value}`)
                        .join(" • ")}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ACTIVE CALCULATOR CONTENT */}
          {selectedMode === "sip" && (
            <SipCalculator
              clientName={clientName}
              selectedClient={selectedClient}
              lang={lang}
              onSummaryChange={handleSummaryChange}
            />
          )}

          {selectedMode === "lumpsum" && (
            <LumpsumCalculator
              clientName={clientName}
              selectedClient={selectedClient}
              lang={lang}
              onSummaryChange={handleSummaryChange}
            />
          )}

          {selectedMode === "target-corpus" && (
            <TargetCorpusCalculator
              clientName={clientName}
              selectedClient={selectedClient}
              lang={lang}
              onSummaryChange={handleSummaryChange}
            />
          )}

          {selectedMode === "capital-gains" && (
            <CapitalGainsCalculator
              clientName={clientName}
              selectedClient={selectedClient}
              lang={lang}
              onSummaryChange={handleSummaryChange}
            />
          )}

          {selectedMode === "sip-swp" && (
            <SipSwpCalculator
              clientName={clientName}
              selectedClient={selectedClient}
              lang={lang}
              onSummaryChange={handleSummaryChange}
            />
          )}

          {selectedMode === "stp" && (
            <StpCalculator
              clientName={clientName}
              selectedClient={selectedClient}
              lang={lang}
              onSummaryChange={handleSummaryChange}
            />
          )}

          {selectedMode === "stepup-stp" && (
            <StepUpStpCalculator
              clientName={clientName}
              selectedClient={selectedClient}
              lang={lang}
              onSummaryChange={handleSummaryChange}
            />
          )}

          {selectedMode === "swp" && (
            <SwpCalculator
              clientName={clientName}
              selectedClient={selectedClient}
              lang={lang}
              onSummaryChange={handleSummaryChange}
            />
          )}

          {selectedMode === "emergency" && (
            <EmergencyFundCalculator
              clientName={clientName}
              selectedClient={selectedClient}
              lang={lang}
              onSummaryChange={handleSummaryChange}
            />
          )}

          {selectedMode === "goals" && (
            <GoalPlannerCalculator
              clientName={clientName}
              selectedClient={selectedClient}
              lang={lang}
              onSummaryChange={handleSummaryChange}
            />
          )}

          {selectedMode === "delay" && (
            <DelayCostCalculator
              clientName={clientName}
              selectedClient={selectedClient}
              lang={lang}
              onSummaryChange={handleSummaryChange}
            />
          )}

          {selectedMode === "insurance" && (
            <InsuranceCalculator
              clientName={clientName}
              selectedClient={selectedClient}
              lang={lang}
              onSummaryChange={handleSummaryChange}
            />
          )}

          {selectedMode === "emi" && (
            <EmiCalculator
              clientName={clientName}
              selectedClient={selectedClient}
              lang={lang}
              onSummaryChange={handleSummaryChange}
            />
          )}

          {selectedMode === "tax" && (
            <TaxEstimatorCalculator
              clientName={clientName}
              selectedClient={selectedClient}
              lang={lang}
              onSummaryChange={handleSummaryChange}
            />
          )}

        </div>
      )}
    </div>
  );
};

export default Calculators;