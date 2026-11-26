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
  Loader2,
  FileCheck2,
  BellRing
} from "lucide-react";
import { toast } from "sonner";
import { useApi } from "../../../../shared/hooks/useApi";
import TabHeader from "../../../../shared/components/TabHeader";
import Logo from "../../../../assets/logo_nobrand.png";
import { RISK_QUESTIONS, UI_LABELS } from "./riskProfiler/riskQuestions";
import { calculateRiskAssessment } from "./riskProfiler/riskScoringEngine";
import RiskResultReport from "./riskProfiler/RiskResultReport";
import RemoteSubmissionInspector from "./riskProfiler/RemoteSubmissionInspector";
import RemoteSubmissionsLedger from "./riskProfiler/RemoteSubmissionsLedger";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "gu", label: "ગુજરાતી" }
];

const RiskProfiler = () => {
  const { request } = useApi();

  const [view, setView] = useState("hub");
  const [lang, setLang] = useState("en");
  const [answers, setAnswers] = useState({});

  const [clients, setClients] = useState([]);
  const [investorInput, setInvestorInput] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [invites, setInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [inspectedRecord, setInspectedRecord] = useState(null);
  const [ledgerFilter, setLedgerFilter] = useState("all");

  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const dropdownRef = useRef(null);
  const ledgerRef = useRef(null);
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

  const unreviewedCount = useMemo(
    () => invites.filter((i) => i.status === "completed" && !i.isReviewed).length,
    [invites]
  );

  const assessment = useMemo(
    () => calculateRiskAssessment(answers, lang),
    [answers, lang]
  );

  const inspectedAssessment = useMemo(() => {
    if (!inspectedRecord?.resultSnapshot?.answers) return null;
    return calculateRiskAssessment(inspectedRecord.resultSnapshot.answers, lang);
  }, [inspectedRecord, lang]);

  const inspectedLinkedClient = useMemo(() => {
    if (!inspectedRecord?.clientId) return null;
    const id = inspectedRecord.clientId._id || inspectedRecord.clientId;
    return (
      clients.find((c) => c._id === id) ||
      (typeof inspectedRecord.clientId === "object" ? inspectedRecord.clientId : null)
    );
  }, [inspectedRecord, clients]);

  const activeInvestorName = selectedClient?.name || investorInput.trim();
  const canStart = Boolean(selectedClient || investorInput.trim().length > 0);
  const hasSavedClientAnswers = Boolean(
    selectedClient?.riskAssessment?.answers &&
      Object.keys(selectedClient.riskAssessment.answers).length === RISK_QUESTIONS.length
  );

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
    setAnswers({});
  };

  const handleClearInvestor = () => {
    setSelectedClient(null);
    setInvestorInput("");
    setAnswers({});
    setJustSaved(false);
  };

  const handleStartProfiling = () => {
    if (!canStart) {
      toast.error("Please select a CRM client or enter an investor name.");
      return;
    }
    setAnswers({});
    setJustSaved(false);
    setView("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewSavedClientReport = () => {
    if (!hasSavedClientAnswers || !selectedClient) return;

    setInspectedRecord({
      source: "crm",
      clientId: selectedClient,
      investorName: selectedClient.name,
      pan: selectedClient.pan,
      completedAt: selectedClient.riskAssessedAt || selectedClient.updatedAt,
      isReviewed: true,
      syncedToCrm: true,
      resultSnapshot: {
        answers: selectedClient.riskAssessment.answers
      }
    });
    setView("inspect");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGenerateRemoteLink = async (openWhatsapp = false) => {
    if (!canStart) {
      toast.error("Please select a CRM client or enter an investor name first.");
      return;
    }

    const waWindow = openWhatsapp ? window.open("", "_blank") : null;
    if (waWindow) {
      waWindow.document.write(
        "<p style='font-family:Sora,sans-serif;padding:24px;color:#334155;'>Preparing WhatsApp assessment link...</p>"
      );
    }

    setGeneratingLink(true);
    try {
      const res = await request("/risk-invites", "POST", {
        clientId: selectedClient?._id || null,
        investorName: activeInvestorName,
        lang
      });

      const token = res?.data?.token || res?.token;
      if (!res?.success || !token) {
        if (waWindow && !waWindow.closed) waWindow.close();
        toast.error(res?.message || "Failed to generate client assessment link.");
        return;
      }

      const shareUrl = `${window.location.origin}/assess/${token}`;
      if (res?.data) {
        setInvites((prev) => [res.data, ...prev]);
      } else {
        fetchInvites();
      }
      setLedgerFilter("pending");

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareUrl);
        }
      } catch {
        // Ignore clipboard denial on non-focused/HTTP contexts
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

        if (waWindow && !waWindow.closed) {
          waWindow.location.href = waUrl;
        } else {
          window.location.assign(waUrl);
        }
        toast.success("WhatsApp opened & link logged in ledger below");
      } else {
        toast.success("Client link copied to clipboard & logged below");
      }
    } catch (err) {
      if (waWindow && !waWindow.closed) waWindow.close();
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
    setInspectedRecord({
      ...inv,
      source: "invite"
    });
    if (inv.lang) setLang(inv.lang);
    setView("inspect");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSyncAndCompleteInvite = async (inv) => {
    if (!inv?._id) return;
    setIsSaving(true);
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
        if (inspectedRecord?._id === inv._id) {
          setInspectedRecord({ ...res.data, source: "invite" });
        }
        toast.success(`Saved to ${inv.investorName}'s CRM profile & marked completed!`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to sync submission to CRM");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleReviewedInvite = async (inviteId, markReviewed) => {
    if (!inviteId) return;
    setIsSaving(true);
    try {
      const res = await request(`/risk-invites/${inviteId}/review`, "PATCH", {
        markReviewed
      });
      if (res?.success) {
        setInvites((prev) =>
          prev.map((item) => (item._id === inviteId ? res.data : item))
        );
        if (inspectedRecord?._id === inviteId) {
          setInspectedRecord({ ...res.data, source: "invite" });
        }
        toast.success("Submission marked as completed");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteInvite = async (inviteId) => {
    try {
      const res = await request(`/risk-invites/${inviteId}`, "DELETE");
      if (res?.success) {
        setInvites((prev) => prev.filter((item) => item._id !== inviteId));
        if (inspectedRecord?._id === inviteId) {
          setInspectedRecord(null);
          setView("hub");
        }
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
    setView("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditAnswers = () => {
    setView("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReturnToHub = () => {
    setInspectedRecord(null);
    setAnswers({});
    setJustSaved(false);
    setView("hub");
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
        toast.success(`Saved ${assessment.tier.key} profile to ${res.data.name}`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update client risk profile");
    } finally {
      setIsSaving(false);
    }
  };

  const shareAssessmentWhatsapp = (targetAssessment, clientName, phoneRaw) => {
    if (!targetAssessment?.isComplete) return;
    const t = targetAssessment.tier;
    const allocLines = t.allocation
      .map((a) => `• ${a.name[lang] || a.name.en}: *${a.value}%*`)
      .join("\n");

    const message = [
      `*DALAL INVESTMENTS — INVESTOR RISK PROFILE*`,
      `Client: *${clientName || "Investor"}*`,
      `Risk Category: *${t.title[lang] || t.title.en}* (${targetAssessment.compositeScore}/100)`,
      `Capacity: ${targetAssessment.capacityScore}% | Tolerance: ${targetAssessment.toleranceScore}%`,
      ``,
      `*Recommended Asset Allocation:*`,
      allocLines,
      ``,
      `_${t.suitabilityNote[lang] || t.suitabilityNote.en}_`
    ].join("\n");

    const encoded = encodeURIComponent(message);
    const phone = phoneRaw?.replace(/\D/g, "");
    const url =
      phone && phone.length >= 10
        ? `https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encoded}`
        : `https://wa.me/?text=${encoded}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const printAssessmentReport = (targetAssessment, targetAnswers, clientName, pan) => {
    if (!targetAssessment?.isComplete) return;
    const clientLabel = clientName || "Valued Investor";
    const panLabel = pan ? `PAN: ${pan}` : "";
    const t = targetAssessment.tier;
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
        <text x="50" y="48" text-anchor="middle" font-size="13" font-weight="800" fill="#0f172a">${targetAssessment.compositeScore}</text>
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
      const chosen = q.options.find((o) => o.value === targetAnswers[q.id]);
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
            @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
            @page { size: A4 portrait; margin: 10mm 13mm; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
            body { font-family: 'Sora', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 0; font-size: 11px; line-height: 1.35; background: #ffffff; }
            .page-wrap { width: 100%; max-width: 780px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; background: #1e293b; color: #ffffff; padding: 10px 14px; border-radius: 6px; border-bottom: 3px solid #0284c7; margin-bottom: 11px; }
            .brand-left { display: flex; align-items: center; gap: 10px; }
            .brand-logo { height: 36px; width: auto; object-fit: contain; }
            .brand-title { font-family: Georgia, serif; font-size: 16px; font-weight: 700; letter-spacing: 0.3px; color: #ffffff; }
            .brand-sub { font-size: 9.5px; color: #bae6fd; margin-top: 2px; }
            .meta-right { text-align: right; font-size: 10px; color: #e2e8f0; }
            .top-grid { display: grid; grid-template-columns: 1.2fr 1.15fr; gap: 10px; margin-bottom: 10px; }
            .box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 12px; }
            .verdict-box { border-left: 4px solid ${t.color}; }
            .eyebrow { font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.6px; color: #64748b; font-weight: 700; }
            .investor-name { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px; }
            .tier-pill { display: inline-block; background: ${t.color}; color: #ffffff; padding: 3px 9px; border-radius: 4px; font-size: 10.5px; font-weight: 700; margin-top: 5px; }
            .summary-text { font-size: 10px; color: #334155; margin: 6px 0; line-height: 1.38; }
            .metrics-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-size: 9.5px; }
            .metric-pill { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 6px; }
            .guardrail { margin-top: 6px; padding: 5px 8px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px; font-size: 9px; color: #92400e; }
            .alloc-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; color: #0f172a; margin-bottom: 6px; }
            .alloc-flex { display: flex; align-items: center; gap: 12px; }
            .alloc-list { flex: 1; }
            .alloc-row { display: flex; justify-content: space-between; padding: 3.5px 0; border-bottom: 1px dashed #cbd5e1; font-size: 10.5px; }
            .alloc-row:last-of-type { border-bottom: none; }
            .suitability { font-size: 9.5px; color: #0369a1; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px; padding: 5px 8px; margin-top: 7px; line-height: 1.35; }
            .section-heading { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; margin: 6px 0 4px 0; }
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
                <div class="tier-pill">${t.title[lang] || t.title.en} • ${targetAssessment.compositeScore}/100</div>
                <p class="summary-text">${t.summary[lang] || t.summary.en}</p>
                <div class="metrics-strip">
                  <div class="metric-pill">
                    <span class="eyebrow" style="display:block;">Capacity</span>
                    <strong style="color:#0284c7;">${targetAssessment.capacityScore}%</strong>
                  </div>
                  <div class="metric-pill">
                    <span class="eyebrow" style="display:block;">Tolerance</span>
                    <strong style="color:#d97706;">${targetAssessment.toleranceScore}%</strong>
                  </div>
                  <div class="metric-pill">
                    <span class="eyebrow" style="display:block;">Target Band</span>
                    <strong style="color:#0369a1;">${t.expectedCagr}</strong>
                  </div>
                </div>
                ${
                  targetAssessment.overrideApplied
                    ? `<div class="guardrail"><strong>Advisory Guardrail:</strong> ${targetAssessment.overrideReason}</div>`
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

  return (
    <div className="risk-sora-root w-full space-y-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        .risk-sora-root,
        .risk-sora-root h1,
        .risk-sora-root h2,
        .risk-sora-root h3,
        .risk-sora-root p,
        .risk-sora-root span,
        .risk-sora-root button,
        .risk-sora-root input,
        .risk-sora-root label,
        .risk-sora-root th,
        .risk-sora-root td,
        .risk-sora-root a {
          font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

      {/* SUBORDINATE TAB HEADER */}
      <TabHeader
        kicker="SEBI Suitability Profiling"
        title="Risk"
        accent="Profiler"
        description="Assess an investor in office or send and review remote self-assessment links."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {view !== "hub" && (
              <button
                type="button"
                onClick={handleReturnToHub}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#232B3D] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>
                  {view === "inspect" && inspectedRecord?.source !== "crm"
                    ? "Back to Submissions"
                    : "Back to Risk Profiler"}
                </span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="inline-flex items-center rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#232B3D] p-0.5">
              {LANGUAGES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLang(item.code)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    lang === item.code
                      ? "bg-sky-600 dark:bg-sky-500 text-white"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* ===================================================================== */}
      {/* VIEW 1: HUB (INVESTOR SETUP + REMOTE SUBMISSIONS LEDGER)              */}
      {/* ===================================================================== */}
      {view === "hub" && (
        <div className="animate-in fade-in duration-200 space-y-6">
          {unreviewedCount > 0 && (
            <div className="p-3.5 rounded-md bg-sky-50/90 dark:bg-sky-500/15 border border-sky-300 dark:border-sky-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs font-medium text-sky-950 dark:text-sky-100">
                <BellRing className="w-4 h-4 text-sky-600 dark:text-sky-300 shrink-0" />
                <span>
                  <strong>
                    {unreviewedCount} client assessment{unreviewedCount > 1 ? "s" : ""}
                  </strong>{" "}
                  submitted online and awaiting CRM review.
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLedgerFilter("received");
                  ledgerRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="self-start sm:self-auto px-3 py-1.5 rounded text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer shrink-0"
              >
                Review Submissions ↓
              </button>
            </div>
          )}

          {/* Investor Setup Form */}
          <div className="py-2 max-w-2xl space-y-6">
            <div className="space-y-2" ref={dropdownRef}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  {labels.investorFieldLabel}
                </label>
                {selectedClient && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300">
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
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-md bg-white dark:bg-[#232B3D] border transition-colors ${
                    selectedClient
                      ? "border-sky-600 dark:border-sky-400"
                      : "border-slate-300 dark:border-slate-600 focus-within:border-sky-600 dark:focus-within:border-sky-400"
                  }`}
                >
                  <Search className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                  <input
                    type="text"
                    value={investorInput}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => {
                      setInvestorInput(e.target.value);
                      if (selectedClient) setSelectedClient(null);
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
                  <div className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-md bg-white dark:bg-[#232B3D] border border-slate-300 dark:border-slate-600 shadow-xl divide-y divide-slate-100 dark:divide-slate-700/80">
                    {filteredClients.map((client) => (
                      <button
                        key={client._id}
                        type="button"
                        onClick={() => handleSelectClient(client)}
                        className="w-full px-4 py-2.5 text-left hover:bg-sky-50 dark:hover:bg-sky-500/20 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {client.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-300/80">
                            {client.pan}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-200/70 dark:border-sky-400/30 shrink-0">
                          {client.riskTier || client.riskProfile || "Moderate"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedClient && hasSavedClientAnswers && (
                <div className="p-3 rounded-md bg-slate-50 dark:bg-[#1B2230] border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-200">
                    <FileCheck2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>
                      Existing assessment on file
                      {selectedClient.riskAssessedAt
                        ? ` (${new Date(selectedClient.riskAssessedAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })})`
                        : ""}
                      .
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleViewSavedClientReport}
                    className="self-start sm:self-auto px-3 py-1.5 rounded text-xs font-semibold bg-white hover:bg-sky-50 dark:bg-[#232B3D] dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 border border-slate-300 dark:border-slate-600 transition-colors cursor-pointer shrink-0"
                  >
                    View Saved Report →
                  </button>
                </div>
              )}
            </div>

            <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-slate-500 dark:text-slate-300/80">
                Conduct live in office, or send an online self-assessment link below.
              </p>

              <button
                type="button"
                onClick={handleStartProfiling}
                disabled={!canStart}
                className="w-full sm:w-auto px-5 py-2.5 rounded-md text-xs sm:text-sm font-semibold bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                {selectedClient && hasSavedClientAnswers
                  ? "Start New Reassessment"
                  : labels.startProfilingBtn}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-5 border-t border-slate-200 dark:border-slate-700/80 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300/80 block">
                Client Not in Office? Send Online Assessment Link
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={!canStart || generatingLink}
                  onClick={() => handleGenerateRemoteLink(true)}
                  className="py-2.5 px-3.5 rounded-md text-xs font-semibold bg-white hover:bg-sky-50/70 dark:bg-[#232B3D] dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {generatingLink ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  )}
                  Send Link on WhatsApp
                </button>

                <button
                  type="button"
                  disabled={!canStart || generatingLink}
                  onClick={() => handleGenerateRemoteLink(false)}
                  className="py-2.5 px-3.5 rounded-md text-xs font-semibold bg-white hover:bg-sky-50/70 dark:bg-[#232B3D] dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  Copy Form Link Only
                </button>
              </div>
            </div>
          </div>

          {/* SENT FORMS & RECEIVED SUBMISSIONS LEDGER */}
          <div ref={ledgerRef}>
            <RemoteSubmissionsLedger
              invites={invites}
              loading={loadingInvites}
              filterTab={ledgerFilter}
              onFilterChange={setLedgerFilter}
              onRefresh={fetchInvites}
              onInspectInvite={handleInspectInvite}
              onSyncAndComplete={handleSyncAndCompleteInvite}
              onToggleReviewed={handleToggleReviewedInvite}
              onDeleteInvite={handleDeleteInvite}
            />
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: IN-PERSON 10-POINT QUESTIONNAIRE                              */}
      {/* ===================================================================== */}
      {view === "quiz" && (
        <div className="animate-in fade-in duration-200 space-y-6">
          <div className="pb-4 border-b border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                In-Office Assessment
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate block">
                {activeInvestorName}
                {selectedClient?.pan ? (
                  <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-300">
                    ({selectedClient.pan})
                  </span>
                ) : null}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-bold tabular-nums text-slate-700 dark:text-slate-200">
                {assessment.answeredCount}/{assessment.totalQuestions} {labels.questionsAnswered}
              </span>

              <button
                type="button"
                onClick={handleResetQuiz}
                disabled={assessment.answeredCount === 0}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 flex items-center gap-1 disabled:opacity-40 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {labels.resetQuiz}
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-200/80 dark:divide-slate-700/80">
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
                          ? "text-sky-700 dark:text-sky-300"
                          : "text-amber-700 dark:text-amber-300"
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
                              ? "bg-sky-600 dark:bg-sky-500 border-sky-600 dark:border-sky-400 text-white font-semibold"
                              : "bg-white hover:bg-slate-50 dark:bg-[#1B2230] dark:hover:bg-[#232B3D] border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 font-medium"
                          }`}
                        >
                          <span className="leading-relaxed">
                            {opt.label[lang] || opt.label.en}
                          </span>
                          <span
                            className={`w-4 h-4 rounded-xs flex items-center justify-center shrink-0 mt-0.5 border ${
                              isSelected
                                ? "border-white bg-white text-sky-600"
                                : "border-slate-300 dark:border-slate-500"
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

          <div className="pt-5 border-t border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <CheckCircle2
                className={`w-4 h-4 shrink-0 ${
                  assessment.isComplete ? "text-sky-600 dark:text-sky-400" : "text-slate-400"
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
              className={`w-full sm:w-auto px-5 py-2.5 rounded-md text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                assessment.isComplete
                  ? "bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white"
                  : "bg-slate-200 dark:bg-[#232B3D] text-slate-500 dark:text-slate-400"
              }`}
            >
              {labels.viewResultsBtn}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 3: IN-PERSON ASSESSMENT RESULT REPORT                            */}
      {/* ===================================================================== */}
      {view === "result" && (
        <RiskResultReport
          assessment={assessment}
          lang={lang}
          selectedClient={selectedClient}
          prospectName={investorInput}
          onSaveToClient={handleSaveToClient}
          isSaving={isSaving}
          justSaved={justSaved}
          onShareWhatsapp={() =>
            shareAssessmentWhatsapp(
              assessment,
              activeInvestorName,
              selectedClient?.contactDetails?.phoneNo
            )
          }
          onPrint={() =>
            printAssessmentReport(
              assessment,
              answers,
              activeInvestorName,
              selectedClient?.pan
            )
          }
          onEditAnswers={handleEditAnswers}
          onStartNew={handleReturnToHub}
        />
      )}

      {/* ===================================================================== */}
      {/* VIEW 4: DEDICATED READ-ONLY REPORT & SUBMISSION INSPECTOR             */}
      {/* ===================================================================== */}
      {view === "inspect" && inspectedRecord && inspectedAssessment && (
        <RemoteSubmissionInspector
          invite={inspectedRecord}
          assessment={inspectedAssessment}
          linkedClient={inspectedLinkedClient}
          lang={lang}
          isSaving={isSaving}
          onSyncAndComplete={
            inspectedRecord.source === "invite"
              ? () => handleSyncAndCompleteInvite(inspectedRecord)
              : null
          }
          onMarkReviewed={
            inspectedRecord.source === "invite"
              ? () => handleToggleReviewedInvite(inspectedRecord._id, true)
              : null
          }
          onShareWhatsapp={() =>
            shareAssessmentWhatsapp(
              inspectedAssessment,
              inspectedLinkedClient?.name || inspectedRecord.investorName,
              inspectedLinkedClient?.contactDetails?.phoneNo
            )
          }
          onPrint={() =>
            printAssessmentReport(
              inspectedAssessment,
              inspectedRecord.resultSnapshot.answers,
              inspectedLinkedClient?.name || inspectedRecord.investorName,
              inspectedLinkedClient?.pan || inspectedRecord.pan
            )
          }
        />
      )}
    </div>
  );
};

export default RiskProfiler;