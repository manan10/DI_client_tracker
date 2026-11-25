import React, { useState } from "react";
import { BarChart3, Table as TableIcon, Scale, TrendingUp } from "lucide-react";
import { formatINR, formatINRCompact } from "./mathUtils";
import { CustomDropdown } from "./CalculatorControls";

export const TAX_SLAB_OPTIONS = [
  { value: 0, label: "0% (Nil Tax)" },
  { value: 10, label: "10% Slab" },
  { value: 20, label: "20% Slab" },
  { value: 30, label: "30% Slab" },
];

export const COMMON_TRANSLATIONS = {
  en: {
    yearsUnit: "Yrs",
    yrShort: "Yr",
    fdRateLabel: "Bank FD Rate (%)",
    taxSlabLabel: "Your Tax Slab",
    inflationLabel: "Yearly Inflation (%)",
    viewChart: "Growth Chart",
    viewTable: "Year-by-Year Table",
    colYear: "Year",
    waGreeting: (name) => (name ? `Namaste *${name}*,` : `Namaste,`),
    waTakeawayHeader: "💡 *Key Takeaway:*",
    waDisclaimer:
      "Disclaimer: Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Figures above are arithmetic illustrations for planning purposes.",
  },
  hi: {
    yearsUnit: "साल",
    yrShort: "वर्ष",
    fdRateLabel: "बैंक FD दर (%)",
    taxSlabLabel: "आपका टैक्स स्लैब",
    inflationLabel: "सालाना महंगाई (%)",
    viewChart: "ग्रोथ चार्ट",
    viewTable: "वार्षिक तालिका",
    colYear: "साल",
    waGreeting: (name) => (name ? `नमस्ते *${name}*,` : `नमस्ते,`),
    waTakeawayHeader: "💡 *मुख्य सारांश:*",
    waDisclaimer:
      "अस्वीकरण: म्यूचुअल फंड निवेश बाजार जोखिमों के अधीन हैं। यह गणना केवल योजना बनाने के उद्देश्य से है।",
  },
  gu: {
    yearsUnit: "વર્ષ",
    yrShort: "વર્ષ",
    fdRateLabel: "બેંક FD દર (%)",
    taxSlabLabel: "ટેક્સ સ્લેબ",
    inflationLabel: "વાર્ષિક મોંઘવારી (%)",
    viewChart: "ગ્રોથ ચાર્ટ",
    viewTable: "વાર્ષિક કોષ્ટક",
    colYear: "વર્ષ",
    waGreeting: (name) => (name ? `નમસ્તે *${name}*,` : `નમસ્તે,`),
    waTakeawayHeader: "💡 *મુખ્ય સારાંશ:*",
    waDisclaimer:
      "સૂચના: મ્યુચ્યુઅલ ફંડ રોકાણો બજારના જોખમોને આધીન છે. આ ગણતરી માત્ર સમજૂતી માટે છે.",
  },
};

export const ComparisonBar = ({
  t,
  showComparison,
  setShowComparison,
  fdRate,
  setFdRate,
  taxSlab,
  setTaxSlab,
  inflationRate,
  setInflationRate,
}) => (
  <div className="bg-white dark:bg-[#111827] border border-slate-300 dark:border-white/15 rounded-xl p-3.5 sm:p-4 shadow-xs">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showComparison}
          onChange={(e) => setShowComparison(e.target.checked)}
          className="w-4 h-4 rounded border-slate-400 accent-emerald-600 cursor-pointer shrink-0"
        />
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-300/80 dark:border-white/15 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
          <Scale size={15} />
        </div>
        <div className="min-w-0">
          <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
            {t.compareToggle}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-snug">
            {t.compareDesc}
          </span>
        </div>
      </label>

      {showComparison && (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:w-[460px] shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-white/15 animate-in fade-in duration-150">
          <div>
            <label className="text-[10px] sm:text-[11px] font-extrabold text-slate-700 dark:text-slate-300 block mb-1 truncate">
              {t.fdRateLabel}
            </label>
            <input
              type="number"
              inputMode="decimal"
              step={0.25}
              value={fdRate}
              onChange={(e) => setFdRate(Number(e.target.value))}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-50 dark:bg-[#0B1120] border border-slate-300 dark:border-white/20 focus:border-slate-900 dark:focus:border-white/50 text-xs font-extrabold text-slate-900 dark:text-white outline-none tabular-nums"
            />
          </div>

          <div>
            <label className="text-[10px] sm:text-[11px] font-extrabold text-slate-700 dark:text-slate-300 block mb-1 truncate">
              {t.taxSlabLabel}
            </label>
            <CustomDropdown
              value={taxSlab}
              options={TAX_SLAB_OPTIONS}
              onChange={setTaxSlab}
            />
          </div>

          <div>
            <label className="text-[10px] sm:text-[11px] font-extrabold text-slate-700 dark:text-slate-300 block mb-1 truncate">
              {t.inflationLabel}
            </label>
            <input
              type="number"
              inputMode="decimal"
              step={0.5}
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-50 dark:bg-[#0B1120] border border-slate-300 dark:border-white/20 focus:border-slate-900 dark:focus:border-white/50 text-xs font-extrabold text-slate-900 dark:text-white outline-none tabular-nums"
            />
          </div>
        </div>
      )}
    </div>
  </div>
);

export const HeroResultBanner = ({
  badgeIcon: BadgeIcon = TrendingUp,
  badgeText,
  futureValue,
  kpis = [],
  splitBar,
}) => (
  <div className="rounded-2xl bg-slate-900 dark:bg-[#0F172A] border border-slate-800 dark:border-white/15 text-white p-4 sm:p-6 shadow-md space-y-4 sm:space-y-5">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
          <BadgeIcon size={13} />
          <span>{badgeText}</span>
        </div>

        <div className="mt-2 sm:mt-2.5 flex flex-wrap items-baseline gap-2 sm:gap-3">
          <span className="text-2xl sm:text-5xl font-black tracking-tight text-white tabular-nums">
            {formatINRCompact(futureValue)}
          </span>
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] sm:text-xs font-mono font-semibold text-emerald-300 tabular-nums">
            {formatINR(futureValue)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-slate-800/95 border border-slate-700 rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 min-w-0"
          >
            <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider block truncate ${kpi.labelColor}`}>
              {kpi.label}
            </span>
            <span className={`text-sm sm:text-xl font-black tabular-nums mt-0.5 block truncate ${kpi.valueColor}`}>
              {kpi.value}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">{kpi.sub}</span>
          </div>
        ))}
      </div>
    </div>

    {splitBar && (
      <div className="space-y-2">
        <div className="w-full h-2.5 sm:h-3 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex p-0.5 gap-0.5">
          <div
            style={{ width: `${splitBar.leftPct}%` }}
            className="h-full rounded-l-full bg-indigo-400 transition-all duration-300"
          />
          <div
            style={{ width: `${splitBar.rightPct}%` }}
            className="h-full rounded-r-full bg-emerald-400 transition-all duration-300"
          />
        </div>

        <div className="flex flex-wrap justify-between items-center gap-2 text-[11px] sm:text-xs">
          <span className="inline-flex items-center gap-1.5 text-slate-200 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0" />
            {splitBar.leftLabel}: <strong className="text-white">{splitBar.leftValue}</strong>{" "}
            <span className="text-slate-400">({splitBar.leftPct}%)</span>
          </span>

          <span className="inline-flex items-center gap-1.5 text-slate-200 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
            {splitBar.rightLabel}: <strong className="text-emerald-400">{splitBar.rightValue}</strong>{" "}
            <span className="text-slate-400">({splitBar.rightPct}%)</span>
          </span>
        </div>
      </div>
    )}
  </div>
);

export const ScheduleViewerCard = ({
  chartTitle,
  tableTitle,
  subtitle,
  viewChartLabel,
  viewTableLabel,
  legends = [],
  renderChart,
  renderTable,
}) => {
  const [activeView, setActiveView] = useState("chart");

  return (
    <div className="border border-slate-300 dark:border-white/15 rounded-2xl p-3.5 sm:p-6 bg-white dark:bg-[#111827] shadow-xs space-y-3.5 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <div>
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
            {activeView === "chart" ? chartTitle : tableTitle}
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center w-full sm:w-auto bg-slate-100 dark:bg-[#0B1120] p-1 rounded-xl border border-slate-300 dark:border-white/15">
          <button
            type="button"
            onClick={() => setActiveView("chart")}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === "chart"
                ? "bg-white dark:bg-[#111827] text-slate-900 dark:text-white border border-slate-300 dark:border-white/20 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <BarChart3 size={14} />
            <span>{viewChartLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("table")}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === "table"
                ? "bg-white dark:bg-[#111827] text-slate-900 dark:text-white border border-slate-300 dark:border-white/20 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <TableIcon size={14} />
            <span>{viewTableLabel}</span>
          </button>
        </div>
      </div>

      {activeView === "chart" ? (
        <div className="space-y-2.5 sm:space-y-3">
          {legends.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-[11px] sm:text-xs font-bold">
              {legends.map((item, i) => (
                <span key={i} className={`inline-flex items-center gap-1.5 ${item.textClass}`}>
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dotClass}`} />
                  {item.label}
                </span>
              ))}
            </div>
          )}
          {renderChart()}
        </div>
      ) : (
        <div className="max-h-[340px] overflow-y-auto overflow-x-auto no-scrollbar border border-slate-300 dark:border-white/15 rounded-xl">
          {renderTable()}
        </div>
      )}
    </div>
  );
};