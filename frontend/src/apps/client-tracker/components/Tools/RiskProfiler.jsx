import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  RotateCcw,
  Search,
  UserCheck,
  X,
  Check,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Link2,
  Share2,
  Copy,
  Loader2,
  Home
} from "lucide-react";
import { toast } from "sonner";
import { useApi } from "../../../../shared/hooks/useApi";
import Logo from "../../../../assets/logo_nobrand.png";
import { RISK_QUESTIONS, UI_LABELS } from "./riskProfiler/riskQuestions";
import { calculateRiskAssessment } from "./riskProfiler/riskScoringEngine";
import RiskResultReport from "./riskProfiler/RiskResultReport";
import RemoteSubmissionsLedger from "./riskProfiler/RemoteSubmissionsLedger";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "gu", label: "ગુજરાતી" }
];

const RiskProfiler = () => {
  const { request } = useApi();

  // Sequential Stage: "setup" | "questions" | "result"
  const [step, setStep] = useState("setup");
  const [lang, setLang] = useState("en");
  const [answers, setAnswers] = useState({});

  // Unified Investor Input State
  const [clients, setClients] = useState([]);
  const [investorInput, setInvestorInput] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Remote Client Link & Submissions State
  const [invites, setInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [generatedShareUrl, setGeneratedShareUrl] = useState("");
  const [activeInviteId, setActiveInviteId] = useState(null);

  // Save State
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const dropdownRef = useRef(null);
  const labels = UI_LABELS[lang] || UI_LABELS.en;

  const fetchInvites = useCallback(async () => {
    setLoadingInvites(true);
    try {
      const res = await request("/risk-invites");
      if (res?.success) {
        setInvites(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load risk invites:", err);
    } finally {
      setLoadingInvites(false);
    }
  }, [request]);

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        const [clientRes, inviteRes] = await Promise.all([
          request("/clients/"),
          request("/risk-invites")
        ]);
        if (isMounted) {
          if (clientRes?.success) setClients(clientRes.data || []);
          if (inviteRes?.success) setInvites(inviteRes.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch initial Risk Profiler data:", err);
      }
    };
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, [request]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredClients = useMemo(() => {
    const q = investorInput.trim().toLowerCase();
    if (!q) return clients.slice(0, 25);
    return clients
      .filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.pan?.toLowerCase().includes(q)
      )
      .slice(0, 25);
  }, [clients, investorInput]);

  const assessment = useMemo(
    () => calculateRiskAssessment(answers, lang),
    [answers, lang]
  );

  const activeInvestorName = selectedClient?.name || investorInput.trim();
  const canStart = Boolean(selectedClient || investorInput.trim().length > 0);

  const handleSelectOption = (questionId, optionValue) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionValue
    }));
    setJustSaved(false);
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setInvestorInput(client.name);
    setIsDropdownOpen(false);
    setJustSaved(false);
    setGeneratedShareUrl("");
    setActiveInviteId(null);

    if (
      client?.riskAssessment?.answers &&
      Object.keys(client.riskAssessment.answers).length > 0
    ) {
      setAnswers(client.riskAssessment.answers);
      toast.info(`Loaded saved responses for ${client.name}`);
    } else {
      setAnswers({});
    }
  };

  const handleClearInvestor = () => {
    setSelectedClient(null);
    setInvestorInput("");
    setAnswers({});
    setJustSaved(false);
    setGeneratedShareUrl("");
    setActiveInviteId(null);
  };

  const handleStartProfiling = () => {
    if (!canStart) {
      toast.error("Please select a CRM client or enter an investor name.");
      return;
    }
    setActiveInviteId(null);
    setAnswers({});
    setStep("questions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGenerateRemoteLink = async (openWhatsapp = false) => {
    if (!canStart) {
      toast.error("Please select a CRM client or enter an investor name first.");
      return;
    }

    setGeneratingLink(true);
    try {
      const res = await request("/risk-invites", "POST", {
        clientId: selectedClient?._id || null,
        investorName: activeInvestorName,
        lang
      });

      if (res?.success && res?.data?.token) {
        const shareUrl = `${window.location.origin}/assess/${res.data.token}`;
        setGeneratedShareUrl(shareUrl);
        setInvites((prev) => [res.data, ...prev]);

        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareUrl);
        }

        if (openWhatsapp) {
          const msg = [
            `Namaste *${activeInvestorName}*,`,
            ``,
            `Please complete your brief *SEBI Investor Risk Profile Assessment* for *Dalal Investments* using this secure link:`,
            `${shareUrl}`,
            ``,
            `It takes less than 2 minutes and helps us tailor your investment portfolio.`
          ].join("\n");

          const encoded = encodeURIComponent(msg);
          const phone = selectedClient?.contactDetails?.phoneNo?.replace(/\D/g, "");
          const waUrl =
            phone && phone.length >= 10
              ? `https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encoded}`
              : `https://wa.me/?text=${encoded}`;

          window.open(waUrl, "_blank", "noopener,noreferrer");
        } else {
          toast.success("Client assessment link copied & logged below!");
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to generate client link");
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleInspectInvite = (inv) => {
    if (!inv?.resultSnapshot?.answers) {
      toast.error("No answers found on this submission.");
      return;
    }

    const fullClient = inv.clientId?._id
      ? clients.find((c) => c._id === inv.clientId._id) || inv.clientId
      : null;

    setSelectedClient(fullClient);
    setInvestorInput(fullClient ? fullClient.name : inv.investorName);
    setAnswers(inv.resultSnapshot.answers);
    if (inv.lang) setLang(inv.lang);
    setActiveInviteId(inv._id);
    setJustSaved(Boolean(inv.syncedToCrm));
    setStep("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSyncAndCompleteInvite = async (inv) => {
    try {
      const res = await request(`/risk-invites/${inv._id}/review`, "PATCH", {
        syncToCrm: true,
        markReviewed: true
      });

      if (res?.success) {
        setInvites((prev) =>
          prev.map((item) => (item._id === inv._id ? res.data : item))
        );
        if (res.client) {
          setClients((prev) =>
            prev.map((c) => (c._id === res.client._id ? res.client : c))
          );
          if (selectedClient?._id === res.client._id) {
            setSelectedClient(res.client);
          }
        }
        toast.success(`Saved to ${inv.investorName}'s CRM profile & marked completed!`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to sync submission to CRM");
    }
  };

  const handleToggleReviewedInvite = async (inviteId, markReviewed) => {
    try {
      const res = await request(`/risk-invites/${inviteId}/review`, "PATCH", {
        markReviewed
      });
      if (res?.success) {
        setInvites((prev) =>
          prev.map((item) => (item._id === inviteId ? res.data : item))
        );
        toast.success("Submission marked as completed");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleDeleteInvite = async (inviteId) => {
    try {
      const res = await request(`/risk-invites/${inviteId}`, "DELETE");
      if (res?.success) {
        setInvites((prev) => prev.filter((item) => item._id !== inviteId));
        if (activeInviteId === inviteId) setActiveInviteId(null);
        toast.success("Assessment record removed");
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete record");
    }
  };

  const handleViewResults = () => {
    if (!assessment.isComplete) {
      const remaining = assessment.totalQuestions - assessment.answeredCount;
      toast.error(
        `Please answer ${remaining} remaining question${remaining > 1 ? "s" : ""}.`
      );
      return;
    }
    setActiveInviteId(null);
    setStep("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditAnswers = () => {
    setStep("questions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartNew = () => {
    setSelectedClient(null);
    setInvestorInput("");
    setAnswers({});
    setJustSaved(false);
    setGeneratedShareUrl("");
    setActiveInviteId(null);
    setStep("setup");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetQuiz = () => {
    setAnswers({});
    setJustSaved(false);
    toast.success("All answers cleared");
  };

  const handleSaveToClient = async () => {
    if (!selectedClient?._id || !assessment.isComplete) return;
    setIsSaving(true);
    try {
      const payload = {
        riskProfile: assessment.tier.baseRiskProfile,
        riskTier: assessment.tier.key,
        riskScore: assessment.compositeScore,
        capacityScore: assessment.capacityScore,
        toleranceScore: assessment.toleranceScore,
        overrideApplied: assessment.overrideApplied,
        overrideReason: assessment.overrideReason,
        answers
      };

      const res = await request(
        `/clients/${selectedClient._id}/risk-profile`,
        "PATCH",
        payload
      );

      if (res?.success) {
        setSelectedClient(res.data);
        setClients((prev) =>
          prev.map((c) => (c._id === res.data._id ? res.data : c))
        );
        setJustSaved(true);

        if (activeInviteId) {
          const invRes = await request(
            `/risk-invites/${activeInviteId}/review`,
            "PATCH",
            { syncToCrm: false, markReviewed: true }
          );
          if (invRes?.success) {
            setInvites((prev) =>
              prev.map((item) =>
                item._id === activeInviteId
                  ? { ...invRes.data, syncedToCrm: true }
                  : item
              )
            );
          }
        }

        toast.success(`Saved ${assessment.tier.key} profile to ${res.data.name}`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update client risk profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareWhatsapp = () => {
    if (!assessment.isComplete) return;
    const clientLabel = activeInvestorName || "Investor";
    const t = assessment.tier;
    const allocLines = t.allocation
      .map((a) => `• ${a.name[lang] || a.name.en}: *${a.value}%*`)
      .join("\n");

    const message = [
      `*DALAL INVESTMENTS — INVESTOR RISK PROFILE*`,
      `Client: *${clientLabel}*`,
      `Risk Category: *${t.title[lang] || t.title.en}* (${assessment.compositeScore}/100)`,
      `Capacity: ${assessment.capacityScore}% | Tolerance: ${assessment.toleranceScore}%`,
      ``,
      `*Recommended Asset Allocation:*`,
      allocLines,
      ``,
      `_${t.suitabilityNote[lang] || t.suitabilityNote.en}_`
    ].join("\n");

    const encoded = encodeURIComponent(message);
    const phone = selectedClient?.contactDetails?.phoneNo?.replace(/\D/g, "");
    const url =
      phone && phone.length >= 10
        ? `https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encoded}`
        : `https://wa.me/?text=${encoded}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handlePrintReport = () => {
    if (!assessment.isComplete) return;
    const clientLabel = activeInvestorName || "Valued Investor";
    const panLabel = selectedClient?.pan ? `PAN: ${selectedClient.pan}` : "";
    const t = assessment.tier;
    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    const resolvedLogoUrl = new URL(Logo, window.location.origin).href;

    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    let cumulativePercent = 0;

    const svgCircles = t.allocation
      .map((slice) => {
        const strokeDasharray = `${(slice.value / 100) * circumference} ${circumference}`;
        const strokeDashoffset = -((cumulativePercent / 100) * circumference);
        cumulativePercent += slice.value;
        return `<circle cx="50" cy="50" r="${radius}" fill="transparent" stroke="${slice.color}" stroke-width="14" stroke-dasharray="${strokeDasharray}" stroke-dashoffset="${strokeDashoffset}" transform="rotate(-90 50 50)" />`;
      })
      .join("");

    const svgChartHtml = `
      <svg width="108" height="108" viewBox="0 0 100 100" style="flex-shrink:0;">
        <circle cx="50" cy="50" r="${radius}" fill="transparent" stroke="#e2e8f0" stroke-width="14" />
        ${svgCircles}
        <text x="50" y="48" text-anchor="middle" font-size="13" font-weight="800" fill="#0f172a">${assessment.compositeScore}</text>
        <text x="50" y="60" text-anchor="middle" font-size="7.5" font-weight="700" fill="#64748b">SCORE</text>
      </svg>
    `;

    const allocRows = t.allocation
      .map(
        (a) =>
          `<div class="alloc-row">
            <span style="display:flex;align-items:center;gap:6px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${a.color};"></span>
              ${a.name[lang] || a.name.en}
            </span>
            <strong style="color:#0f172a;">${a.value}%</strong>
          </div>`
      )
      .join("");

    const qaRows = RISK_QUESTIONS.map((q) => {
      const chosen = q.options.find((o) => o.value === answers[q.id]);
      return `
        <tr>
          <td class="q-cell">${q.text[lang] || q.text.en}</td>
          <td class="a-cell">${chosen ? chosen.label[lang] || chosen.label.en : "-"}</td>
        </tr>
      `;
    }).join("");

    const printWindow = window.open("", "_blank", "width=940,height=840");
    if (!printWindow) {
      toast.error("Please allow pop-ups to print the Risk Profile report.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Risk Profile Report - ${clientLabel}</title>
          <style>
            @page { size: A4 portrait; margin: 10mm 13mm; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 0; font-size: 11px; line-height: 1.35; background: #ffffff; }
            .page-wrap { width: 100%; max-width: 780px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #ffffff; padding: 10px 14px; border-radius: 6px; border-bottom: 3px solid #d97706; margin-bottom: 11px; }
            .brand-left { display: flex; align-items: center; gap: 10px; }
            .brand-logo { height: 36px; width: auto; object-fit: contain; }
            .brand-title { font-family: Georgia, serif; font-size: 16px; font-weight: 700; letter-spacing: 0.3px; color: #ffffff; }
            .brand-sub { font-size: 9.5px; color: #cbd5e1; margin-top: 2px; }
            .meta-right { text-align: right; font-size: 10px; color: #e2e8f0; }
            .top-grid { display: grid; grid-template-columns: 1.2fr 1.15fr; gap: 10px; margin-bottom: 10px; }
            .box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 12px; }
            .verdict-box { border-left: 4px solid ${t.color}; }
            .eyebrow { font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.6px; color: #64748b; font-weight: 700; }
            .investor-name { font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px; }
            .tier-pill { display: inline-block; background: ${t.color}; color: #ffffff; padding: 3px 9px; border-radius: 4px; font-size: 10.5px; font-weight: 700; margin-top: 5px; }
            .summary-text { font-size: 10px; color: #334155; margin: 6px 0; line-height: 1.38; }
            .metrics-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-size: 9.5px; }
            .metric-pill { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 6px; }
            .guardrail { margin-top: 6px; padding: 5px 8px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px; font-size: 9px; color: #92400e; }
            .alloc-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; color: #0f172a; margin-bottom: 6px; }
            .alloc-flex { display: flex; align-items: center; gap: 12px; }
            .alloc-list { flex: 1; }
            .alloc-row { display: flex; justify-content: space-between; padding: 3.5px 0; border-bottom: 1px dashed #cbd5e1; font-size: 10.5px; }
            .alloc-row:last-of-type { border-bottom: none; }
            .suitability { font-size: 9.5px; color: #0369a1; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px; padding: 5px 8px; margin-top: 7px; line-height: 1.35; }
            .section-heading { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; margin: 6px 0 4px 0; }
            table { width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; }
            .q-cell { width: 54%; padding: 4px 8px; border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; font-size: 9.5px; color: #334155; vertical-align: top; }
            .a-cell { width: 46%; padding: 4px 8px; border-bottom: 1px solid #e2e8f0; font-size: 9.5px; font-weight: 600; color: #0f172a; vertical-align: top; }
            .footer-block { break-inside: avoid; page-break-inside: avoid; margin-top: 20px; }
            .sign-box { display: flex; justify-content: space-between; font-size: 9.5px; color: #334155; margin-bottom: 8px; }
            .sign-line { border-top: 1px solid #64748b; width: 210px; padding-top: 4px; text-align: center; font-weight: 600; }
            .disclaimer { font-size: 8.5px; color: #64748b; line-height: 1.35; border-top: 1px solid #e2e8f0; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="page-wrap">
            <div class="header">
              <div class="brand-left">
                <img src="${resolvedLogoUrl}" alt="Dalal Investments" class="brand-logo" />
                <div>
                  <div class="brand-title">Dalal Investments</div>
                  <div class="brand-sub">Private Wealth Desk • SEBI Risk Suitability Assessment</div>
                </div>
              </div>
              <div class="meta-right">
                <div><strong>Date:</strong> ${dateStr}</div>
                ${panLabel ? `<div>${panLabel}</div>` : ""}
              </div>
            </div>

            <div class="top-grid">
              <div class="box verdict-box">
                <div class="eyebrow">Investor Name</div>
                <div class="investor-name">${clientLabel}</div>
                <div class="tier-pill">${t.title[lang] || t.title.en} • ${assessment.compositeScore}/100</div>
                <p class="summary-text">${t.summary[lang] || t.summary.en}</p>
                <div class="metrics-strip">
                  <div class="metric-pill">
                    <span class="eyebrow" style="display:block;">Capacity</span>
                    <strong style="color:#0284c7;">${assessment.capacityScore}%</strong>
                  </div>
                  <div class="metric-pill">
                    <span class="eyebrow" style="display:block;">Tolerance</span>
                    <strong style="color:#d97706;">${assessment.toleranceScore}%</strong>
                  </div>
                  <div class="metric-pill">
                    <span class="eyebrow" style="display:block;">Target Band</span>
                    <strong style="color:#059669;">${t.expectedCagr}</strong>
                  </div>
                </div>
                ${
                  assessment.overrideApplied
                    ? `<div class="guardrail"><strong>Advisory Guardrail:</strong> ${assessment.overrideReason}</div>`
                    : ""
                }
              </div>

              <div class="box">
                <div class="alloc-title">Recommended Model Asset Allocation</div>
                <div class="alloc-flex">
                  ${svgChartHtml}
                  <div class="alloc-list">${allocRows}</div>
                </div>
                <div class="suitability"><strong>Suitability Note:</strong> ${t.suitabilityNote[lang] || t.suitabilityNote.en}</div>
              </div>
            </div>

            <div class="section-heading">Investor Questionnaire Disclosures</div>
            <table>
              <tbody>${qaRows}</tbody>
            </table>

            <div class="footer-block">
              <div class="sign-box">
                <div class="sign-line">Investor Signature (${clientLabel})</div>
                <div class="sign-line">Distributor / Advisor Seal & Signature</div>
              </div>
              <div class="disclaimer">${labels.disclaimer}</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const stepsMeta = [
    { id: "setup", label: labels.step1Label },
    { id: "questions", label: labels.step2Label },
    { id: "result", label: labels.step3Label }
  ];
  const currentStepIdx = stepsMeta.findIndex((s) => s.id === step);

  return (
    <div className="w-full space-y-6">
      {/* Flush Underline Progress Track & Language Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2 sm:gap-5 overflow-x-auto no-scrollbar">
          {stepsMeta.map((s, idx) => {
            const isActive = s.id === step;
            const isDone = idx < currentStepIdx;
            const isClickable =
              s.id === "setup" ||
              (s.id === "questions" && canStart && !activeInviteId) ||
              (s.id === "result" && canStart && assessment.isComplete);

            return (
              <React.Fragment key={s.id}>
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && setStep(s.id)}
                  className={`flex items-center gap-2 text-xs font-bold whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-slate-900 dark:text-white"
                      : isDone
                      ? "text-sky-600 dark:text-sky-400 cursor-pointer"
                      : "text-slate-400 dark:text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-extrabold ${
                      isActive
                        ? "bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950"
                        : isDone
                        ? "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300"
                        : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-600"
                    }`}
                  >
                    {isDone ? "✓" : idx + 1}
                  </span>
                  <span>{s.label}</span>
                </button>
                {idx < stepsMeta.length - 1 && (
                  <span className="text-slate-300 dark:text-slate-700 text-xs">/</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Top Control Bar: Return to Opening View & Language Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleStartNew}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Risk Profiler Home</span>
          </button>

          <div className="inline-flex items-center rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-0.5">
            {LANGUAGES.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setLang(item.code)}
                className={`px-3 py-1 rounded-sm text-xs font-bold transition-colors cursor-pointer ${
                  lang === item.code
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STAGE 1: SETUP + REMOTE SUBMISSIONS TRACKING LEDGER */}
      {step === "setup" && (
        <div className="animate-in fade-in duration-200">
          <div className="py-4 sm:py-6 max-w-2xl space-y-6">
            <div className="space-y-2" ref={dropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {labels.investorFieldLabel}
                </label>
                {selectedClient && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <UserCheck className="w-3.5 h-3.5" />
                    CRM Linked • {labels.currentSavedProfile}:{" "}
                    <strong>
                      {selectedClient.riskTier || selectedClient.riskProfile || "Moderate"}
                    </strong>
                  </span>
                )}
              </div>

              <div className="relative">
                <div
                  onClick={() => setIsDropdownOpen(true)}
                  className={`flex items-center gap-2.5 px-3.5 py-3 rounded-md bg-white dark:bg-slate-900 border transition-colors ${
                    selectedClient
                      ? "border-slate-900 dark:border-sky-500"
                      : "border-slate-300 dark:border-white/15 focus-within:border-sky-600"
                  }`}
                >
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={investorInput}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => {
                      setInvestorInput(e.target.value);
                      if (selectedClient) setSelectedClient(null);
                      setGeneratedShareUrl("");
                      setIsDropdownOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canStart) {
                        setIsDropdownOpen(false);
                        handleStartProfiling();
                      }
                    }}
                    placeholder={labels.investorPlaceholder}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                  />
                  {investorInput ? (
                    <button
                      type="button"
                      onClick={handleClearInvestor}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                      aria-label="Clear"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </div>

                {isDropdownOpen && filteredClients.length > 0 && (
                  <div className="absolute z-30 mt-1.5 w-full max-h-64 overflow-y-auto rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 shadow-lg divide-y divide-slate-100 dark:divide-white/5">
                    {filteredClients.map((client) => (
                      <button
                        key={client._id}
                        type="button"
                        onClick={() => handleSelectClient(client)}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {client.name}
                          </p>
                          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            {client.pan}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 shrink-0">
                          {client.riskTier || client.riskProfile || "Moderate"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* In-Person Start CTA */}
            <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Conduct live in office, or send an online self-assessment form below.
              </p>

              <button
                type="button"
                onClick={handleStartProfiling}
                disabled={!canStart}
                className="w-full sm:w-auto px-6 py-3 rounded-md text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                {labels.startProfilingBtn}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Remote Client Link Generator */}
            <div className="pt-5 border-t border-slate-200 dark:border-white/10 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Client Not in Office? Generate Online Form Link
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={!canStart || generatingLink}
                  onClick={() => handleGenerateRemoteLink(false)}
                  className="py-2.5 px-3.5 rounded-md text-xs font-bold bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/15 flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {generatingLink ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Link2 className="w-3.5 h-3.5 text-sky-600" />
                  )}
                  Copy Client Form Link
                </button>

                <button
                  type="button"
                  disabled={!canStart || generatingLink}
                  onClick={() => handleGenerateRemoteLink(true)}
                  className="py-2.5 px-3.5 rounded-md text-xs font-bold bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/15 flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  Send Link on WhatsApp
                </button>
              </div>

              {generatedShareUrl && (
                <div className="p-2.5 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate">
                    {generatedShareUrl}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(generatedShareUrl);
                      toast.success("Link copied");
                    }}
                    className="px-2 py-1 rounded text-xs font-bold text-sky-700 dark:text-sky-400 hover:bg-slate-200/60 dark:hover:bg-white/10 flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SENT FORMS & RECEIVED SUBMISSIONS LEDGER */}
          <RemoteSubmissionsLedger
            invites={invites}
            loading={loadingInvites}
            onRefresh={fetchInvites}
            onInspectInvite={handleInspectInvite}
            onSyncAndComplete={handleSyncAndCompleteInvite}
            onToggleReviewed={handleToggleReviewedInvite}
            onDeleteInvite={handleDeleteInvite}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* STAGE 2: CLEAN DOCUMENT QUESTIONNAIRE                                 */}
      {/* ===================================================================== */}
      {step === "questions" && (
        <div className="animate-in fade-in duration-200 space-y-6">
          <div className="pb-4 border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setStep("setup")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {labels.backToSetup}
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                {activeInvestorName}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {assessment.answeredCount}/{assessment.totalQuestions} {labels.questionsAnswered}
              </span>

              <button
                type="button"
                onClick={handleStartNew}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleResetQuiz}
                disabled={assessment.answeredCount === 0}
                className="text-xs font-bold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 disabled:opacity-40 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {labels.resetQuiz}
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-200/80 dark:divide-white/10">
            {RISK_QUESTIONS.map((q) => {
              const selectedVal = answers[q.id];
              const isCapacity = q.dimension === "capacity";

              return (
                <div key={q.id} className="py-5 sm:py-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3.5">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {q.text[lang] || q.text.en}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        isCapacity
                          ? "text-sky-700 dark:text-sky-400"
                          : "text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {isCapacity ? labels.capacityLabel : labels.toleranceLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {q.options.map((opt) => {
                      const isSelected = selectedVal === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelectOption(q.id, opt.value)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-md border text-xs flex items-start justify-between gap-3 transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-slate-900 dark:bg-sky-600 border-slate-900 dark:border-sky-500 text-white font-semibold"
                              : "bg-white hover:bg-slate-50 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium"
                          }`}
                        >
                          <span className="leading-relaxed">
                            {opt.label[lang] || opt.label.en}
                          </span>
                          <span
                            className={`w-4 h-4 rounded-xs flex items-center justify-center shrink-0 mt-0.5 border ${
                              isSelected
                                ? "border-white bg-white text-slate-900 dark:text-sky-600"
                                : "border-slate-300 dark:border-slate-600"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-5 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <CheckCircle2
                className={`w-4 h-4 shrink-0 ${
                  assessment.isComplete ? "text-emerald-600" : "text-slate-400"
                }`}
              />
              <span>
                {assessment.isComplete
                  ? "All 10 questions completed."
                  : `${assessment.answeredCount} of ${assessment.totalQuestions} questions answered`}
              </span>
            </div>

            <button
              type="button"
              onClick={handleViewResults}
              className={`w-full sm:w-auto px-6 py-3 rounded-md text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                assessment.isComplete
                  ? "bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white"
                  : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400"
              }`}
            >
              {labels.viewResultsBtn}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STAGE 3: SUITABILITY REPORT & ALLOCATION                              */}
      {/* ===================================================================== */}
      {step === "result" && (
        <RiskResultReport
          assessment={assessment}
          lang={lang}
          selectedClient={selectedClient}
          prospectName={investorInput}
          onSaveToClient={handleSaveToClient}
          isSaving={isSaving}
          justSaved={justSaved}
          onShareWhatsapp={handleShareWhatsapp}
          onPrint={handlePrintReport}
          onEditAnswers={activeInviteId ? null : handleEditAnswers}
          onStartNew={handleStartNew}
        />
      )}
    </div>
  );
};

export default RiskProfiler;