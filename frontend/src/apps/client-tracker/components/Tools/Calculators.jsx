import React, { useState, useCallback, useEffect, useRef } from "react";
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
  Copy,
  Send,
  Printer,
  User,
  Check,
  Globe,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import Logo from "../../../../assets/logo_nobrand.png";
import SipCalculator from "./calculators/SipCalculator";
import LumpsumCalculator from "./calculators/LumpsumCalculator";
import TargetCorpusCalculator from "./calculators/TargetCorpusCalculator";
import SipSwpCalculator from "./calculators/SipSwpCalculator";
import StpCalculator from "./calculators/StpCalculator";
import SwpCalculator from "./calculators/SwpCalculator";
import GoalPlannerCalculator from "./calculators/GoalPlannerCalculator";
import DelayCostCalculator from "./calculators/DelayCostCalculator";
import InsuranceCalculator from "./calculators/InsuranceCalculator";
import EmiCalculator from "./calculators/EmiCalculator";
import TaxEstimatorCalculator from "./calculators/TaxEstimatorCalculator";

const CALCULATOR_CATALOG = [
  {
    id: "sip",
    category: "wealth",
    name: "SIP & Step-Up Calculator",
    subtitle: "Project long-term wealth creation through disciplined monthly SIPs and yearly step-ups.",
    icon: TrendingUp,
  },
  {
    id: "lumpsum",
    category: "wealth",
    name: "Lumpsum & FD vs. MF",
    subtitle: "Compare one-time mutual fund compounding against post-tax bank fixed deposits.",
    icon: Wallet,
  },
  {
    id: "target-corpus",
    category: "wealth",
    name: "Target Corpus Planner",
    subtitle: "Reverse-calculate the exact monthly SIP needed to achieve any ₹50L–₹10 Cr+ wealth goal.",
    icon: Target,
  },
  {
    id: "sip-swp",
    category: "cashflow",
    name: "SIP + SWP (Build & Withdraw)",
    subtitle: "Model a complete 2-phase journey: build a corpus via SIP, then draw monthly income via SWP.",
    icon: Layers,
  },
  {
    id: "stp",
    category: "cashflow",
    name: "STP & Step-Up STP",
    subtitle: "Model systematic transfers from liquid/debt funds into equity over time.",
    icon: Repeat,
  },
  {
    id: "swp",
    category: "cashflow",
    name: "SWP & Step-Up SWP",
    subtitle: "Plan regular monthly retirement cashflows and check corpus longevity.",
    icon: ArrowDownCircle,
  },
  {
    id: "goals",
    category: "goals",
    name: "Life Goal Planner",
    subtitle: "Plan inflation-adjusted funds for Retirement, Education, Marriage, Home, Car, or Vacation.",
    icon: Compass,
  },
  {
    id: "delay",
    category: "goals",
    name: "Cost of Delay Calculator",
    subtitle: "See the exact wealth impact of postponing your investment start date.",
    icon: Clock,
  },
  {
    id: "insurance",
    category: "goals",
    name: "Life Insurance (HLV)",
    subtitle: "Determine adequate term insurance cover based on income, loans, and goals.",
    icon: Shield,
  },
  {
    id: "emi",
    category: "goals",
    name: "Loan EMI & SIP Offset",
    subtitle: "Calculate monthly loan EMIs and see how a parallel SIP recovers your interest.",
    icon: CreditCard,
  },
  {
    id: "tax",
    category: "goals",
    name: "FY 26–27 Tax Estimator",
    subtitle: "Quick side-by-side comparison of New vs. Old Income Tax Regimes.",
    icon: Landmark,
  },
];

const SIDEBAR_GROUPS = [
  { id: "wealth", label: "Wealth Creation" },
  { id: "cashflow", label: "STP & SWP Cashflow" },
  { id: "goals", label: "Goals, Risk & Tax" },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "gu", label: "ગુજરાતી" },
];

const Calculators = () => {
  const [selectedMode, setSelectedMode] = useState("sip");
  const [clientName, setClientName] = useState("");
  const [lang, setLang] = useState("en");
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileDropdownRef = useRef(null);

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
    const handleOutside = (e) => {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [mobileMenuOpen]);

  const handleSummaryChange = useCallback((payload) => {
    setSharePayload(payload);
  }, []);

  const currentCalcObj =
    CALCULATOR_CATALOG.find((c) => c.id === selectedMode) || CALCULATOR_CATALOG[0];

  const isShareReady = Boolean(sharePayload.whatsappText);

  const handleCopyWhatsApp = async () => {
    if (!sharePayload.whatsappText) return;
    try {
      await navigator.clipboard.writeText(sharePayload.whatsappText);
      setCopied(true);
      toast.success("Detailed client summary copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy text. Please try again.");
    }
  };

  const handleOpenWhatsApp = () => {
    if (!sharePayload.whatsappText) return;
    const encoded = encodeURIComponent(sharePayload.whatsappText);
    window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
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
            .brand-left {
              display: flex;
              align-items: center;
              gap: 14px;
            }
            .brand-logo {
              height: 44px;
              width: auto;
              object-fit: contain;
            }
            .brand-name {
              font-family: Georgia, "Times New Roman", serif;
              font-size: 22px;
              font-weight: 700;
              color: #0f172a;
              letter-spacing: -0.01em;
            }
            .brand-sub {
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 0.18em;
              color: #059669;
              text-transform: uppercase;
              margin-top: 3px;
            }
            .meta {
              text-align: right;
              font-size: 11px;
              color: #64748b;
            }
            .meta strong {
              color: #0f172a;
              display: block;
              font-size: 12px;
            }
            .doc-title {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 4px;
            }
            .doc-sub {
              font-size: 12.5px;
              color: #475569;
              margin-bottom: 14px;
            }
            .client-badge {
              display: inline-block;
              background: #ecfdf5;
              border: 1px solid #a7f3d0;
              color: #065f46;
              padding: 6px 14px;
              border-radius: 6px;
              font-size: 12.5px;
              margin-bottom: 18px;
            }
            .takeaway-box {
              background: #f8fafc;
              border-left: 4px solid #059669;
              border-top: 1px solid #e2e8f0;
              border-right: 1px solid #e2e8f0;
              border-bottom: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 14px 16px;
              margin-bottom: 20px;
            }
            .takeaway-label {
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #059669;
              margin-bottom: 4px;
            }
            .takeaway-text {
              font-size: 13px;
              color: #1e293b;
              font-weight: 500;
            }
            .section-heading {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #475569;
              margin: 22px 0 10px 0;
            }
            .assumptions-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              margin-bottom: 20px;
            }
            .assumption-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 10px 12px;
            }
            .assumption-label {
              font-size: 10px;
              font-weight: 600;
              color: #64748b;
            }
            .assumption-val {
              font-size: 13px;
              font-weight: 800;
              color: #0f172a;
              margin-top: 2px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            .summary-table td {
              padding: 12px 14px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 13.5px;
            }
            .row-title {
              font-weight: 700;
              color: #0f172a;
            }
            .row-sub {
              font-size: 11px;
              color: #64748b;
              margin-top: 2px;
            }
            .row-val {
              text-align: right;
              font-weight: 800;
              font-size: 14.5px;
              white-space: nowrap;
            }
            .hero-row {
              background: #0f172a;
              color: #ffffff;
            }
            .hero-row .row-title {
              color: #6ee7b7;
              font-size: 14px;
            }
            .hero-row .row-sub {
              color: #cbd5e1;
            }
            .hero-row .row-val {
              color: #ffffff;
              font-size: 18px;
            }
            .hero-row td {
              border-bottom: none;
            }
            .milestone-table th {
              background: #f1f5f9;
              padding: 8px 12px;
              font-size: 11px;
              text-align: left;
              color: #475569;
              border-bottom: 1px solid #cbd5e1;
            }
            .milestone-table td {
              padding: 8px 12px;
              font-size: 12px;
              border-bottom: 1px solid #e2e8f0;
            }
            .footer {
              margin-top: 32px;
              padding-top: 14px;
              border-top: 1px solid #cbd5e1;
              font-size: 10.5px;
              color: #64748b;
            }
            @media print {
              body { padding: 16px; }
            }
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

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full font-sans">
      
      {/* LEFT SIDEBAR RAIL (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-3.5 shadow-xs space-y-5 sticky top-24">
        {SIDEBAR_GROUPS.map((group) => {
          const items = CALCULATOR_CATALOG.filter((c) => c.category === group.id);
          return (
            <div key={group.id} className="space-y-1.5">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.label}
              </div>

              <div className="flex flex-col gap-1">
                {items.map((calc) => {
                  const Icon = calc.icon;
                  const isSelected = selectedMode === calc.id;

                  return (
                    <button
                      key={calc.id}
                      type="button"
                      onClick={() => setSelectedMode(calc.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer outline-none ${
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30 shadow-2xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.03] border border-transparent"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        <Icon size={14} strokeWidth={2.2} />
                      </div>
                      <span className="truncate">{calc.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </aside>

      {/* CUSTOM MOBILE CALCULATOR DROPDOWN (< lg) */}
      <div className="lg:hidden w-full relative" ref={mobileDropdownRef}>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="w-full flex items-center justify-between bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white shadow-xs cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <currentCalcObj.icon size={15} />
            </div>
            <span>{currentCalcObj.name}</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-150 ${
              mobileMenuOpen ? "rotate-180 text-emerald-600" : ""
            }`}
          />
        </button>

        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-white dark:bg-[#131C31] border border-slate-200 dark:border-white/15 shadow-2xl p-2 z-50 max-h-80 overflow-y-auto space-y-3 animate-in fade-in zoom-in-95 duration-150">
            {SIDEBAR_GROUPS.map((group) => (
              <div key={group.id} className="space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.label}
                </div>
                {CALCULATOR_CATALOG.filter((c) => c.category === group.id).map((calc) => {
                  const Icon = calc.icon;
                  const isSelected = selectedMode === calc.id;
                  return (
                    <button
                      key={calc.id}
                      type="button"
                      onClick={() => {
                        setSelectedMode(calc.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} className={isSelected ? "text-emerald-600" : "text-slate-400"} />
                        <span>{calc.name}</span>
                      </div>
                      {isSelected && <Check size={14} className="text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT PRIMARY CALCULATOR WORKSPACE */}
      <div className="flex-1 min-w-0 w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
        
        {/* TOP COMMAND HEADER: CALCULATOR TITLE + SHARE ACTIONS + CONTROLS */}
        <div className="space-y-4 pb-5 border-b border-slate-200 dark:border-white/10">
          
          {/* Row 1: Calculator Title & Share Action Buttons */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200/80 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <currentCalcObj.icon size={20} strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currentCalcObj.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {currentCalcObj.subtitle}
                </p>
              </div>
            </div>

            {isShareReady && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyWhatsApp}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Send size={14} />
                  <span>Send on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintClientSheet}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 transition-colors cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print / PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Row 2: Client Language Toggle + Client Name Input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl p-1 self-start">
              <Globe size={14} className="text-emerald-600 dark:text-emerald-400 ml-2 mr-1" />
              {LANGUAGES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLang(item.code)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    lang === item.code
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 focus-within:border-emerald-500 rounded-xl px-3.5 py-2 w-full sm:w-72">
              <User size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <input
                type="text"
                placeholder="Client Name (for WhatsApp & PDF)..."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="text-xs font-medium text-slate-900 dark:text-white bg-transparent outline-none w-full"
              />
            </div>
          </div>

        </div>

        {/* ACTIVE CALCULATOR CONTENT */}
        {selectedMode === "sip" && (
          <SipCalculator
            clientName={clientName}
            lang={lang}
            onSummaryChange={handleSummaryChange}
          />
        )}

        {selectedMode === "lumpsum" && (
          <LumpsumCalculator
            clientName={clientName}
            lang={lang}
            onSummaryChange={handleSummaryChange}
          />
        )}

        {selectedMode === "target-corpus" && (
          <TargetCorpusCalculator
            clientName={clientName}
            lang={lang}
            onSummaryChange={handleSummaryChange}
          />
        )}

        {selectedMode === "sip-swp" && (
          <SipSwpCalculator
            clientName={clientName}
            lang={lang}
            onSummaryChange={handleSummaryChange}
          />
        )}

        {selectedMode === "stp" && (
          <StpCalculator
            clientName={clientName}
            lang={lang}
            onSummaryChange={handleSummaryChange}
          />
        )}

        {selectedMode === "swp" && (
          <SwpCalculator
            clientName={clientName}
            lang={lang}
            onSummaryChange={handleSummaryChange}
          />
        )}

        {selectedMode === "goals" && (
          <GoalPlannerCalculator
            clientName={clientName}
            lang={lang}
            onSummaryChange={handleSummaryChange}
          />
        )}

        {selectedMode === "delay" && (
          <DelayCostCalculator
            clientName={clientName}
            lang={lang}
            onSummaryChange={handleSummaryChange}
          />
        )}

        {selectedMode === "insurance" && (
          <InsuranceCalculator
            clientName={clientName}
            lang={lang}
            onSummaryChange={handleSummaryChange}
          />
        )}

        {selectedMode === "emi" && (
          <EmiCalculator
            clientName={clientName}
            lang={lang}
            onSummaryChange={handleSummaryChange}
          />
        )}

        {selectedMode === "tax" && (
          <TaxEstimatorCalculator
            clientName={clientName}
            lang={lang}
            onSummaryChange={handleSummaryChange}
          />
        )}

      </div>

    </div>
  );
};

export default Calculators;