import React from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Printer,
  Database,
  TrendingUp,
  ArrowRight,
  CheckCheck,
  UserCheck,
  FileCheck2
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";
import { RISK_QUESTIONS, UI_LABELS } from "./riskQuestions";

const RemoteSubmissionInspector = ({
  invite,
  assessment,
  linkedClient,
  lang,
  isSaving,
  onSyncAndComplete,
  onMarkReviewed,
  onShareWhatsapp,
  onPrint
}) => {
  const labels = UI_LABELS[lang] || UI_LABELS.en;
  const {
    compositeScore,
    capacityScore,
    toleranceScore,
    tier,
    overrideApplied,
    overrideReason
  } = assessment;

  const submittedAnswers = invite?.resultSnapshot?.answers || {};
  const isCrmSnapshot = invite?.source === "crm";
  const displayName = linkedClient?.name || invite?.investorName || "Investor";
  const displayPan = linkedClient?.pan || invite?.pan;

  const chartData = tier.allocation.map((item) => ({
    name: item.name[lang] || item.name.en,
    value: item.value,
    color: item.color
  }));

  const recordedDate = invite?.completedAt
    ? new Date(invite.completedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : null;

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-700/80 animate-in fade-in duration-300">
      {/* Read-Only Audit Header Bar */}
      <div className="pb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200 dark:bg-sky-500/20 dark:text-sky-200 dark:border-sky-400/40">
              <FileCheck2 className="w-3.5 h-3.5" />
              {isCrmSnapshot
                ? "Saved CRM Assessment Record"
                : "Client Self-Submission Audit"}
            </span>

            {recordedDate && (
              <span className="text-xs text-slate-500 dark:text-slate-300">
                {isCrmSnapshot ? `Assessed ${recordedDate}` : `Submitted ${recordedDate}`}
              </span>
            )}

            {invite.isReviewed && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-200 dark:border-cyan-400/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isCrmSnapshot
                  ? "Active on CRM Profile"
                  : invite.syncedToCrm
                  ? "Synced to CRM & Completed"
                  : "Reviewed"}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {displayName}
            </h1>
            {displayPan && (
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-[#232B3D] text-slate-700 dark:text-slate-200">
                {displayPan}
              </span>
            )}
            {linkedClient && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
                <UserCheck className="w-3.5 h-3.5" />
                CRM Linked
              </span>
            )}
          </div>
        </div>

        {/* Read-Only Audit & Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {!isCrmSnapshot && linkedClient && !invite.syncedToCrm && onSyncAndComplete && (
            <button
              type="button"
              disabled={isSaving}
              onClick={onSyncAndComplete}
              className="px-4 py-2 rounded-md text-xs sm:text-sm font-semibold bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Database className="w-4 h-4" />
              {isSaving ? labels.saving : "Save to CRM & Mark Completed"}
            </button>
          )}

          {!isCrmSnapshot &&
            !invite.isReviewed &&
            (!linkedClient || invite.syncedToCrm) &&
            onMarkReviewed && (
              <button
                type="button"
                disabled={isSaving}
                onClick={onMarkReviewed}
                className="px-4 py-2 rounded-md text-xs sm:text-sm font-semibold bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                Mark Completed
              </button>
            )}

          <button
            type="button"
            onClick={onShareWhatsapp}
            className="px-3.5 py-2 rounded-md text-xs font-semibold bg-white hover:bg-sky-50 dark:bg-[#232B3D] dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            WhatsApp
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="px-3.5 py-2 rounded-md text-xs font-semibold bg-white hover:bg-sky-50 dark:bg-[#232B3D] dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            Print PDF
          </button>
        </div>
      </div>

      {/* Verdict Summary Band */}
      <div
        className={`py-6 sm:py-7 pl-4 sm:pl-6 border-l-4 ${tier.accentBorder} bg-slate-50/70 dark:bg-[#1B2230]`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pr-4 sm:pr-6">
          <div className="space-y-2 max-w-3xl">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold tabular-nums border ${tier.badgeClass}`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {labels.compositeScore}: {compositeScore}/100
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {tier.title[lang] || tier.title.en}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {tier.summary[lang] || tier.summary.en}
            </p>

            {!isCrmSnapshot && linkedClient?.riskProfile && (
              <div className="pt-1.5 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  CRM Profile Change:
                </span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {linkedClient.riskTier || linkedClient.riskProfile}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span className="font-bold text-slate-900 dark:text-white">
                  {tier.key} ({tier.baseRiskProfile})
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-1 gap-4 lg:border-l lg:border-slate-200 dark:lg:border-slate-700/80 lg:pl-6 shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-300/80 block">
                {labels.capacityLabel}
              </span>
              <span className="text-lg sm:text-xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                {capacityScore}%
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-300/80 block">
                {labels.toleranceLabel}
              </span>
              <span className="text-lg sm:text-xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                {toleranceScore}%
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-300/80 block">
                {labels.expectedReturnBand}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 hidden sm:block" />
                <span className="text-xs sm:text-sm font-extrabold tabular-nums text-sky-700 dark:text-sky-300">
                  {tier.expectedCagr}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guardrail Strip */}
      {overrideApplied && (
        <div className="py-4 px-4 bg-amber-50/80 dark:bg-amber-500/15 border-l-4 border-l-amber-500 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-300 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
              {labels.guardrailTriggered}
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-100/90 mt-0.5 leading-relaxed">
              {overrideReason}
            </p>
          </div>
        </div>
      )}

      {/* Recommended Allocation + Suitability */}
      <div className="py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-300/80">
            {labels.recommendedSplit}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            <div className="sm:col-span-5 h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val}%`, "Allocation"]}
                    contentStyle={{
                      borderRadius: "6px",
                      fontSize: "12px",
                      border: "1px solid #cbd5e1",
                      fontFamily: "'Sora', sans-serif"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="sm:col-span-7 space-y-3.5">
              {chartData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                      <span
                        className="w-2.5 h-2.5 rounded-xs shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </span>
                    <span className="font-bold tabular-nums text-sm text-slate-900 dark:text-white">
                      {item.value}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-xs overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 lg:border-l lg:border-slate-200 dark:lg:border-slate-700/80 lg:pl-8 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300">
            {labels.suitabilityTitle}
          </p>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {tier.suitabilityNote[lang] || tier.suitabilityNote.en}
          </p>
          {!linkedClient && (
            <p className="text-xs text-slate-500 dark:text-slate-300/80 pt-2">
              Walk-in prospect submission (not linked to an existing CRM client record).
            </p>
          )}
        </div>
      </div>

      {/* Recorded Questionnaire Disclosures (Read-Only Audit Table) */}
      <div className="py-6 sm:py-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Recorded Assessment Disclosures (Read-Only)
          </h3>
          <span className="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-300">
            10 / 10 Answered
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700/80 rounded-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#232B3D] border-b border-slate-200 dark:border-slate-700/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4">Assessment Question</th>
                <th className="py-3 px-4">Dimension</th>
                <th className="py-3 px-4">Recorded Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-700/80 text-xs bg-white dark:bg-[#1B2230]">
              {RISK_QUESTIONS.map((q, idx) => {
                const chosen = q.options.find((o) => o.value === submittedAnswers[q.id]);
                const isCapacity = q.dimension === "capacity";

                return (
                  <tr
                    key={q.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-[#232B3D]/70"
                  >
                    <td className="py-3.5 px-4 font-bold tabular-nums text-slate-400 dark:text-slate-400 align-top">
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-100 align-top">
                      {q.text[lang] || q.text.en}
                    </td>
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isCapacity
                            ? "text-sky-700 dark:text-sky-300"
                            : "text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {isCapacity ? labels.capacityLabel : labels.toleranceLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white align-top">
                      {chosen ? chosen.label[lang] || chosen.label.en : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Footer */}
      <div className="pt-4">
        <p className="text-xs text-slate-400 dark:text-slate-400 leading-relaxed">
          {labels.disclaimer}
        </p>
      </div>
    </div>
  );
};

export default RemoteSubmissionInspector;