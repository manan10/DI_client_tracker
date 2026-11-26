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
  ArrowLeft,
  RotateCcw,
  FileCheck2,
  CheckCheck
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";
import { UI_LABELS } from "./riskQuestions";

const RiskResultReport = ({
  assessment,
  lang,
  selectedClient,
  prospectName,
  activeInvite,
  onSaveToClient,
  onSyncAndCompleteInvite,
  onMarkInviteReviewed,
  isSaving,
  justSaved,
  onShareWhatsapp,
  onPrint,
  onEditAnswers,
  onStartNew
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

  const displayName = selectedClient?.name || prospectName?.trim() || "Valued Investor";

  const chartData = tier.allocation.map((item) => ({
    name: item.name[lang] || item.name.en,
    value: item.value,
    color: item.color
  }));

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-700/80 animate-in fade-in duration-300">
      {/* Remote Submission Read-Only Audit Banner */}
      {activeInvite && (
        <div className="py-3.5 px-4 mb-2 rounded-md bg-sky-50/90 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-sky-950 dark:text-sky-100">
            <FileCheck2 className="w-4 h-4 text-sky-600 dark:text-sky-300 shrink-0" />
            <span>
              <strong>Remote Client Submission</strong> • Submitted online by{" "}
              <strong>{activeInvite.investorName}</strong>
              {activeInvite.completedAt
                ? ` on ${new Date(activeInvite.completedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })}`
                : ""}
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {selectedClient && !activeInvite.syncedToCrm && onSyncAndCompleteInvite && (
              <button
                type="button"
                onClick={onSyncAndCompleteInvite}
                className="px-3 py-1.5 rounded text-xs font-semibold bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                Save to CRM & Complete
              </button>
            )}

            {!activeInvite.isReviewed && (!selectedClient || activeInvite.syncedToCrm) && onMarkInviteReviewed && (
              <button
                type="button"
                onClick={onMarkInviteReviewed}
                className="px-3 py-1.5 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark Reviewed
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Action Strip */}
      {(onEditAnswers || !activeInvite) && (
        <div className="py-4 flex flex-wrap items-center justify-between gap-3">
          {onEditAnswers ? (
            <button
              type="button"
              onClick={onEditAnswers}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#232B3D] dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              {labels.editAnswersBtn}
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onStartNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#232B3D] border border-slate-300 dark:border-slate-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {labels.newAssessmentBtn}
          </button>
        </div>
      )}

      {/* Verdict Executive Summary Band */}
      <div className={`py-6 sm:py-8 pl-4 sm:pl-6 border-l-4 ${tier.accentBorder} bg-slate-50/70 dark:bg-[#1B2230]`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pr-4 sm:pr-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {displayName}
              </span>
              {selectedClient?.pan && (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200/70 dark:bg-[#232B3D] text-slate-700 dark:text-slate-200">
                  {selectedClient.pan}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold tabular-nums border ${tier.badgeClass}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {labels.compositeScore}: {compositeScore}/100
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {tier.title[lang] || tier.title.en}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {tier.summary[lang] || tier.summary.en}
            </p>

            {selectedClient?.riskProfile && (
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  CRM Status:
                </span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {selectedClient.riskTier || selectedClient.riskProfile}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span className="font-bold text-slate-900 dark:text-white">
                  {tier.key} ({tier.baseRiskProfile})
                </span>
              </div>
            )}
          </div>

          {/* 3-Metric Key Readout */}
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

      {/* Guardrail Strip (if triggered) */}
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

      {/* Split Ledger: Asset Allocation & Actions */}
      <div className="py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: Model Asset Allocation */}
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

        {/* Right 5 Cols: Suitability Note & Export Hub */}
        <div className="lg:col-span-5 lg:border-l lg:border-slate-200 dark:lg:border-slate-700/80 lg:pl-8 space-y-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300">
              {labels.suitabilityTitle}
            </p>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 mt-1.5 leading-relaxed">
              {tier.suitabilityNote[lang] || tier.suitabilityNote.en}
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {selectedClient ? (
              <button
                type="button"
                onClick={onSaveToClient}
                disabled={isSaving}
                className={`w-full py-2.5 px-4 rounded-md text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  justSaved
                    ? "bg-cyan-600 dark:bg-cyan-500 text-white"
                    : "bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white"
                } disabled:opacity-60`}
              >
                {justSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {labels.savedSuccess}
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    {isSaving ? labels.saving : labels.saveToClient}
                  </>
                )}
              </button>
            ) : (
              <div className="p-2.5 rounded-md bg-slate-50 dark:bg-[#1B2230] border border-slate-200 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-300">
                {labels.selectClientToSave}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onShareWhatsapp}
                className="py-2.5 px-3.5 rounded-md text-xs font-semibold bg-white hover:bg-sky-50 dark:bg-[#232B3D] dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                {labels.shareWhatsapp}
              </button>

              <button
                type="button"
                onClick={onPrint}
                className="py-2.5 px-3.5 rounded-md text-xs font-semibold bg-white hover:bg-sky-50 dark:bg-[#232B3D] dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                {labels.printReport}
              </button>
            </div>
          </div>
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

export default RiskResultReport;