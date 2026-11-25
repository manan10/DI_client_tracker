import React, { useState, useMemo, useEffect } from "react";
import { Repeat, Sparkles } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatINR, formatINRCompact } from "./mathUtils";
import { TactileSliderInput } from "./CalculatorControls";
import {
  COMMON_TRANSLATIONS,
  HeroResultBanner,
  ScheduleViewerCard,
} from "./CalculatorShared";

const TRANSLATIONS = {
  en: {
    ...COMMON_TRANSLATIONS.en,
    sectionTitle: "1. Compare Regular STP vs. Step-Up STP",
    sectionSub:
      "See how increasing your monthly systematic transfer amount (STP) every year builds significantly more equity units during market cycles.",
    lumpsumLabel: "Initial Lumpsum Parked (Source Debt Fund)",
    lumpsumDesc: "Upfront capital parked in liquid/debt scheme.",
    transferLabel: "Starting Monthly Transfer (STP)",
    transferDesc: "Initial amount moved monthly into equity target fund.",
    stepUpLabel: "Yearly Step-Up on STP (%)",
    stepUpDesc: "Annual percentage increase in transfer amount (0% for Regular STP).",
    tenureLabel: "STP Duration (Years)",
    tenureDesc: "Time horizon over which capital shifts into equity.",
    sourceReturnLabel: "Source Fund Return (%)",
    targetReturnLabel: "Target Equity Fund Return (%)",
    resultHeader: "2. Regular STP vs. Step-Up STP Comparison",
    heroTitle: "Step-Up STP Final Value",
    regularFinalLabel: "Regular STP Final Value (0% Step-Up)",
    regularShortLabel: "Regular STP",
    stepUpFinalLabel: (pct) => `Step-Up STP Final Value (${pct}% Step-Up)`,
    extraGainLabel: "Extra Wealth Created by Step-Up",
    extraShortLabel: "Extra Gain",
    takeawaySentence: (regularVal, stepUpVal, extra, stepUpPct, yrs) =>
      extra > 0
        ? `By stepping up your monthly STP by ${stepUpPct}% every year over ${yrs} years, you generate ${stepUpVal} in target equity value — outperforming a regular fixed STP by an extra ${extra}.`
        : `At 0% step-up, both Regular and Step-Up STP yield the same target equity value of ${regularVal}.`,
    chartTitle: "Regular STP vs. Step-Up STP Growth Comparison",
    chartSub: "Visual comparison of target equity accumulation between fixed and growing transfers",
    legendRegular: "Regular STP (Fixed)",
    legendStepUp: "Step-Up STP (Growing)",
    viewChart: "Comparison Chart",
    colRegStp: "Regular STP",
    colStepStp: "Step-Up STP",
    colRegBal: "Regular Equity Val.",
    colStepBal: "Step-Up Equity Val.",
    waIntro:
      "Here is your personalized *Step-Up STP vs. Regular STP Comparison* prepared by *Dalal Investments*:",
    waPlanHeader: "1️⃣ *STP Comparison Parameters*",
    waLumpsum: "Initial Lumpsum Parked",
    waRegTransfer: "Regular Monthly Transfer",
    waStepTransfer: "Step-Up Transfer (Starting)",
    waStepUpPct: "Annual Step-Up Rate",
    waDuration: "Transfer Horizon",
    waOutcomeHeader: "2️⃣ *Projected Equity Outcomes*",
    waRegVal: "Regular STP Final Value",
    waStepVal: "Step-Up STP Final Value",
    waExtraGain: "Extra Wealth with Step-Up",
    pdfTitle: "Regular STP vs. Step-Up STP Comparison Report",
    pdfSubtitle: "Systematic transfer optimization & equity accumulation analysis",
  },
  hi: {
    ...COMMON_TRANSLATIONS.hi,
    sectionTitle: "1. रेगुलर STP बनाम स्टेप-अप STP की तुलना करें",
    sectionSub:
      "देखें कि हर साल मासिक ट्रांसफर राशि (STP) बढ़ाने से इक्विटी फंड में कितनी अधिक यूनिट्स जमा होती हैं।",
    lumpsumLabel: "शुरुआती एकमुश्त राशि (Source Debt Fund)",
    lumpsumDesc: "लिक्विड/डेट फंड में जमा शुरुआती पूंजी।",
    transferLabel: "शुरुआती मासिक ट्रांसफर (STP)",
    transferDesc: "इक्विटी फंड में जाने वाली शुरुआती मासिक राशि।",
    stepUpLabel: "सालाना STP बढ़ोतरी (%)",
    stepUpDesc: "हर साल ट्रांसफर राशि में प्रतिशत वृद्धि (Regular STP के लिए 0%)।",
    tenureLabel: "STP अवधि (साल)",
    tenureDesc: "कितने सालों तक पैसा इक्विटी में शिफ्ट होगा।",
    sourceReturnLabel: "सोर्स फंड रिटर्न (%)",
    targetReturnLabel: "टारगेट इक्विटी फंड रिटर्न (%)",
    resultHeader: "2. रेगुलर STP बनाम स्टेप-अप STP तुलना रिपोर्ट",
    heroTitle: "स्टेप-अप STP अंतिम वैल्यू",
    regularFinalLabel: "रेगुलर STP अंतिम वैल्यू (0% Step-Up)",
    regularShortLabel: "रेगुलर STP",
    stepUpFinalLabel: (pct) => `स्टेप-अप STP अंतिम वैल्यू (${pct}% Step-Up)`,
    extraGainLabel: "स्टेप-अप द्वारा बनाया गया अतिरिक्त मुनाफा",
    extraShortLabel: "अतिरिक्त लाभ",
    takeawaySentence: (regularVal, stepUpVal, extra, stepUpPct, yrs) =>
      extra > 0
        ? `${yrs} साल तक हर साल ${stepUpPct}% STP बढ़ाकर आप ${stepUpVal} का इक्विटी फंड बनाते हैं — जो रेगुलर फिक्स STP से ${extra} अधिक है।`
        : `0% स्टेप-अप पर रेगुलर और स्टेप-अप STP दोनों की वैल्यू ${regularVal} है।`,
    chartTitle: "रेगुलर STP बनाम स्टेप-अप STP ग्रोथ तुलना",
    chartSub: "निश्चित और बढ़ती हुई ट्रांसफर राशि के बीच इक्विटी संचय की तुलना",
    legendRegular: "रेगुलर STP (फिक्स)",
    legendStepUp: "स्टेप-अप STP (बढ़ती हुई)",
    viewChart: "तुलना चार्ट",
    colRegStp: "रेगुलर STP",
    colStepStp: "स्टेप-अप STP",
    colRegBal: "रेगुलर इक्विटी",
    colStepBal: "स्टेप-अप इक्विटी",
    waIntro:
      "*Dalal Investments* की ओर से आपकी *स्टेप-अप STP बनाम रेगुलर STP तुलना* नीचे प्रस्तुत है:",
    waPlanHeader: "1️⃣ *STP तुलना विवरण*",
    waLumpsum: "शुरुआती एकमुश्त राशि",
    waRegTransfer: "रेगुलर मासिक ट्रांसफर",
    waStepTransfer: "स्टेप-अप ट्रांसफर (शुरुआती)",
    waStepUpPct: "वार्षिक बढ़ोतरी दर",
    waDuration: "ट्रांसफर अवधि",
    waOutcomeHeader: "2️⃣ *अनुमानित परिणाम*",
    waRegVal: "रेगुलर STP अंतिम वैल्यू",
    waStepVal: "स्टेप-अप STP अंतिम वैल्यू",
    waExtraGain: "स्टेप-अप से अतिरिक्त लाभ",
    pdfTitle: "रेगुलर STP बनाम स्टेप-अप STP तुलना रिपोर्ट",
    pdfSubtitle: "सिस्टमैटिक ट्रांसफर ऑप्टिमाइज़ेशन विश्लेषण (Dalal Investments)",
  },
  gu: {
    ...COMMON_TRANSLATIONS.gu,
    sectionTitle: "1. રેગ્યુલર STP વિ. સ્ટેપ-અપ STP ની સરખામણી કરો",
    sectionSub:
      "જુઓ કે દર વર્ષે માસિક ટ્રાન્સફર રકમ (STP) વધારવાથી ઇક્વિટી ફંડમાં કેટલી વધુ યુનિટ્સ જમા થાય છે.",
    lumpsumLabel: "શરૂઆતની એકસાથે રકમ (Source Debt Fund)",
    lumpsumDesc: "લિક્વિડ/ડેટ ફંડમાં જમા શરૂઆતની મૂડી.",
    transferLabel: "શરૂઆતનું માસિક ટ્રાન્સફર (STP)",
    transferDesc: "ઇક્વિટી ફંડમાં જતી શરૂઆતની માસિક રકમ.",
    stepUpLabel: "વાર્ષિક STP વધારો (%)",
    stepUpDesc: "દર વર્ષે ટ્રાન્સફર રકમમાં ટકાવારી વધારો (Regular STP માટે 0%).",
    tenureLabel: "STP સમયગાળો (વર્ષ)",
    tenureDesc: "કેટલા વર્ષ સુધી પૈસા ઇક્વિટીમાં શિફ્ટ થશે.",
    sourceReturnLabel: "સોર્સ ફંડ વળતર (%)",
    targetReturnLabel: "ટાર્ગેટ ઇક્વિટી ફંડ વળતર (%)",
    resultHeader: "2. રેગ્યુલર STP વિ. સ્ટેપ-અપ STP સરખામણી રિપોર્ટ",
    heroTitle: "સ્ટેપ-અપ STP અંતિમ મૂલ્ય",
    regularFinalLabel: "રેગ્યુલર STP અંતિમ મૂલ્ય (0% Step-Up)",
    regularShortLabel: "રેગ્યુલર STP",
    stepUpFinalLabel: (pct) => `સ્ટેપ-અપ STP અંતિમ મૂલ્ય (${pct}% Step-Up)`,
    extraGainLabel: "સ્ટેપ-અપ દ્વારા બનેલો વધારાનો નફો",
    extraShortLabel: "વધારાનો ફાયદો",
    takeawaySentence: (regularVal, stepUpVal, extra, stepUpPct, yrs) =>
      extra > 0
        ? `${yrs} વર્ષ સુધી દર વર્ષે ${stepUpPct}% STP વધારીને તમે ${stepUpVal} નું ઇક્વિટી ફંડ બનાવો છો — જે રેગ્યુલર ફિક્સ STP કરતાં ${extra} વધુ છે.`
        : `0% સ્ટેપ-અપ પર રેગ્યુલર અને સ્ટેપ-અપ STP બંનેનું મૂલ્ય ${regularVal} છે.`,
    chartTitle: "રેગ્યુલર STP વિ. સ્ટેપ-અપ STP વૃદ્ધિ સરખામણી",
    chartSub: "નિશ્ચિત અને વધતી જતી ટ્રાન્સફર રકમ વચ્ચે ઇક્વિટી સંચયની સરખામણી",
    legendRegular: "રેગ્યુલર STP (ફિક્સ)",
    legendStepUp: "સ્ટેપ-અપ STP (વધતી)",
    viewChart: "સરખામણી ચાર્ટ",
    colRegStp: "રેગ્યુલર STP",
    colStepStp: "સ્ટેપ-અપ STP",
    colRegBal: "રેગ્યુલર ઇક્વિટી",
    colStepBal: "સ્ટેપ-અપ ઇક્વિટી",
    waIntro:
      "*Dalal Investments* તરફથી તમારી *સ્ટેપ-અપ STP વિ. રેગ્યુલર STP સરખામણી* નીચે મુજબ છે:",
    waPlanHeader: "1️⃣ *STP સરખામણી વિગત*",
    waLumpsum: "શરૂઆતની એકસાથે રકમ",
    waRegTransfer: "રેગ્યુલર માસિક ટ્રાન્સફર",
    waStepTransfer: "સ્ટેપ-અપ ટ્રાન્સફર (શરૂઆતની)",
    waStepUpPct: "વાર્ષિક વધારા દર",
    waDuration: "ટ્રાન્સફર સમયગાળો",
    waOutcomeHeader: "2️⃣ *અંદાજિત પરિણામ*",
    waRegVal: "રેગ્યુલર STP અંતિમ મૂલ્ય",
    waStepVal: "સ્ટેપ-અપ STP અંતિમ મૂલ્ય",
    waExtraGain: "સ્ટેપ-અપથી વધારાનો ફાયદો",
    pdfTitle: "રેગ્યુલર STP વિ. સ્ટેપ-અપ STP સરખામણી રિપોર્ટ",
    pdfSubtitle: "સિસ્ટમેટિક ટ્રાન્સફર ઓપ્ટિમાઇઝેશન વિશ્લેષણ (Dalal Investments)",
  },
};

const CustomStepUpStpTooltip = ({ active, payload, t }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-white/15 rounded-xl p-3 shadow-xl space-y-1.5 min-w-[210px] sm:min-w-[230px] font-sans text-xs z-50">
      <div className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/15 pb-1.5">
        {t.yrShort} {row.year}
      </div>
      <div className="space-y-1.5 tabular-nums">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500 dark:text-slate-400">{t.legendRegular}:</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {formatINRCompact(row.regularEquity)}
          </span>
        </div>
        <div className="flex justify-between gap-3 pt-1.5 border-t border-slate-200 dark:border-white/15">
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{t.legendStepUp}:</span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatINRCompact(row.stepUpEquity)}
          </span>
        </div>
      </div>
    </div>
  );
};

const StepUpStpCalculator = ({ clientName, lang = "en", onSummaryChange }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [initialLumpsum, setInitialLumpsum] = useState(1500000);
  const [monthlyTransfer, setMonthlyTransfer] = useState(30000);
  const [stepUpPct, setStepUpPct] = useState(10);
  const [years, setYears] = useState(4);
  const [sourceReturn, setSourceReturn] = useState(6.5);
  const [targetReturn, setTargetReturn] = useState(12);

  const result = useMemo(() => {
    const startCap = Math.max(0, Number(initialLumpsum) || 0);
    const startStp = Math.max(0, Number(monthlyTransfer) || 0);
    const step = Number(stepUpPct) || 0;
    const yrs = Math.max(1, Number(years) || 1);
    const rSource = (Number(sourceReturn) || 0) / 100 / 12;
    const rTarget = (Number(targetReturn) || 0) / 100 / 12;

    let srcReg = startCap;
    let tgtReg = 0;

    let srcStep = startCap;
    let tgtStep = 0;
    let stepTransferred = 0;
    let curStepStp = startStp;

    const yearlySchedule = [];

    for (let yr = 1; yr <= yrs; yr++) {
      for (let m = 1; m <= 12; m++) {
        srcReg = srcReg * (1 + rSource);
        const drawReg = Math.min(srcReg, startStp);
        srcReg -= drawReg;
        tgtReg = (tgtReg + drawReg) * (1 + rTarget);

        srcStep = srcStep * (1 + rSource);
        const drawStep = Math.min(srcStep, curStepStp);
        srcStep -= drawStep;
        stepTransferred += drawStep;
        tgtStep = (tgtStep + drawStep) * (1 + rTarget);
      }

      yearlySchedule.push({
        year: yr,
        regularStpMonthly: startStp,
        stepUpStpMonthly: Math.round(curStepStp),
        regularEquity: Math.round(tgtReg),
        stepUpEquity: Math.round(tgtStep),
      });

      curStepStp = curStepStp * (1 + step / 100);
    }

    const regFinal = Math.round(srcReg + tgtReg);
    const stepFinal = Math.round(srcStep + tgtStep);
    const extraWealth = Math.max(0, stepFinal - regFinal);

    return {
      initialLumpsum: Math.round(startCap),
      regularFinal: Math.round(tgtReg),
      stepUpFinal: Math.round(tgtStep),
      extraWealth,
      totalShifted: Math.round(stepTransferred),
      yearlySchedule,
    };
  }, [initialLumpsum, monthlyTransfer, stepUpPct, years, sourceReturn, targetReturn]);

  useEffect(() => {
    const takeaway = t.takeawaySentence(
      formatINRCompact(result.regularFinal),
      formatINRCompact(result.stepUpFinal),
      formatINRCompact(result.extraWealth),
      stepUpPct,
      years
    );

    const text =
      `${t.waGreeting(clientName?.trim())}\n\n` +
      `${t.waIntro}\n\n` +
      `${t.waPlanHeader}\n` +
      `• ${t.waLumpsum}: *${formatINRCompact(result.initialLumpsum)}*\n` +
      `• ${t.waRegTransfer}: *${formatINR(monthlyTransfer)}/mo*\n` +
      `• ${t.waStepTransfer}: *${formatINR(monthlyTransfer)}/mo* (${t.waStepUpPct}: *+${stepUpPct}%/yr*)\n` +
      `• ${t.waDuration}: *${years} ${t.yearsUnit}*\n\n` +
      `${t.waOutcomeHeader}\n` +
      `• ${t.waRegVal}: *${formatINRCompact(result.regularFinal)}*\n` +
      `• ${t.waStepVal}: *${formatINRCompact(result.stepUpFinal)}*\n` +
      `• *${t.waExtraGain}: +${formatINRCompact(result.extraWealth)}*\n\n` +
      `${t.waTakeawayHeader}\n${takeaway}\n\n` +
      `_${t.waDisclaimer}_\n` +
      `— *Dalal Investments | Private Wealth Desk*`;

    const milestones = result.yearlySchedule.map((r) => ({
      year: r.year,
      sip: `${formatINR(r.stepUpStpMonthly)}/mo`,
      invested: formatINRCompact(r.regularEquity),
      profit: `+${formatINRCompact(r.stepUpEquity - r.regularEquity)}`,
      total: formatINRCompact(r.stepUpEquity),
    }));

    onSummaryChange({
      title: t.pdfTitle,
      subtitle: t.pdfSubtitle,
      takeaway,
      whatsappText: text,
      assumptions: [
        { label: t.waLumpsum, value: formatINRCompact(result.initialLumpsum) },
        { label: t.waRegTransfer, value: `${formatINR(monthlyTransfer)}/mo` },
        { label: t.waStepUpPct, value: `${stepUpPct}% / yr` },
        { label: t.waDuration, value: `${years} ${t.yearsUnit}` },
      ],
      highlights: [
        {
          label: t.regularFinalLabel,
          sub: "Fixed monthly transfer amount over entire tenure",
          value: formatINRCompact(result.regularFinal),
        },
        {
          label: t.stepUpFinalLabel(stepUpPct),
          sub: `Transfer amount increases by ${stepUpPct}% annually`,
          value: formatINRCompact(result.stepUpFinal),
        },
        {
          label: t.extraGainLabel,
          sub: "Additional equity compounding benefit from Step-Up STP",
          value: `+${formatINRCompact(result.extraWealth)}`,
          isHero: true,
        },
      ],
      milestones,
      disclaimer: t.waDisclaimer,
    });
  }, [clientName, monthlyTransfer, stepUpPct, years, result, t, onSummaryChange]);

  const chartLegends = [
    { label: t.legendStepUp, textClass: "text-emerald-700 dark:text-emerald-300", dotClass: "bg-emerald-500" },
    { label: t.legendRegular, textClass: "text-slate-600 dark:text-slate-300", dotClass: "bg-slate-500" },
  ];

  return (
    <div className="space-y-5 sm:space-y-7 w-full font-sans">
      {/* SECTION 1: BORDERLESS INPUT GRID */}
      <section className="space-y-3.5 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 px-0.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            {t.sectionTitle}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            {t.sectionSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          <TactileSliderInput
            label={t.lumpsumLabel}
            description={t.lumpsumDesc}
            value={initialLumpsum}
            onChange={setInitialLumpsum}
            min={100000}
            max={50000000}
            sliderMax={10000000}
            step={50000}
            prefix="₹"
            accent="amber"
            presets={[
              { label: "₹10 L", value: 1000000 },
              { label: "₹15 L", value: 1500000 },
              { label: "₹25 L", value: 2500000 },
              { label: "₹50 L", value: 5000000 },
            ]}
          />

          <TactileSliderInput
            label={t.transferLabel}
            description={t.transferDesc}
            value={monthlyTransfer}
            onChange={setMonthlyTransfer}
            min={5000}
            max={500000}
            sliderMax={150000}
            step={2500}
            prefix="₹"
            presets={[
              { label: "₹20,000", value: 20000 },
              { label: "₹30,000", value: 30000 },
              { label: "₹50,000", value: 50000 },
              { label: "₹1,00,000", value: 100000 },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
          <TactileSliderInput
            label={t.stepUpLabel}
            description={t.stepUpDesc}
            value={stepUpPct}
            onChange={setStepUpPct}
            min={0}
            max={20}
            step={1}
            suffix="%"
            presets={[
              { label: "0% (Regular)", value: 0 },
              { label: "5% / yr", value: 5 },
              { label: "10% / yr", value: 10 },
              { label: "15% / yr", value: 15 },
            ]}
          />

          <TactileSliderInput
            label={t.tenureLabel}
            description={t.tenureDesc}
            value={years}
            onChange={setYears}
            min={1}
            max={15}
            step={1}
            suffix={t.yearsUnit}
            accent="indigo"
            presets={[
              { label: `3 ${t.yearsUnit}`, value: 3 },
              { label: `4 ${t.yearsUnit}`, value: 4 },
              { label: `5 ${t.yearsUnit}`, value: 5 },
              { label: `7 ${t.yearsUnit}`, value: 7 },
            ]}
          />

          <TactileSliderInput
            label={t.sourceReturnLabel}
            value={sourceReturn}
            onChange={setSourceReturn}
            min={4}
            max={9}
            step={0.5}
            suffix="%"
            accent="amber"
            presets={[
              { label: "6%", value: 6 },
              { label: "6.5%", value: 6.5 },
            ]}
          />

          <TactileSliderInput
            label={t.targetReturnLabel}
            value={targetReturn}
            onChange={setTargetReturn}
            min={8}
            max={18}
            step={0.5}
            suffix="%"
            presets={[
              { label: "11%", value: 11 },
              { label: "12%", value: 12 },
              { label: "14%", value: 14 },
            ]}
          />
        </div>
      </section>

      {/* SECTION 2: COMPARISON RESULTS & CHART */}
      <section className="space-y-4 sm:space-y-5">
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white px-0.5">
          {t.resultHeader}
        </h3>

        <HeroResultBanner
          badgeIcon={Repeat}
          badgeText={`${t.heroTitle} (${years} ${t.yearsUnit})`}
          futureValue={result.stepUpFinal}
          kpis={[
            {
              label: t.regularShortLabel,
              labelColor: "text-slate-300",
              value: formatINRCompact(result.regularFinal),
              valueColor: "text-white",
              sub: "Fixed transfer",
            },
            {
              label: t.extraShortLabel,
              labelColor: "text-emerald-300",
              value: `+${formatINRCompact(result.extraWealth)}`,
              valueColor: "text-emerald-400",
              sub: "Step-Up edge",
              highlight: true,
            },
            {
              label: t.waStepUpPct,
              labelColor: "text-amber-300",
              value: `+${stepUpPct}%/yr`,
              valueColor: "text-amber-400",
              sub: `${years} ${t.yearsUnit} horizon`,
            },
          ]}
        />

        {/* Plain-Language Summary Callout */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-300 dark:border-white/15 shadow-xs flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">
            {t.takeawaySentence(
              formatINRCompact(result.regularFinal),
              formatINRCompact(result.stepUpFinal),
              formatINRCompact(result.extraWealth),
              stepUpPct,
              years
            )}
          </p>
        </div>

        <ScheduleViewerCard
          chartTitle={t.chartTitle}
          tableTitle={t.viewTable}
          subtitle={t.chartSub}
          viewChartLabel={t.viewChart}
          viewTableLabel={t.viewTable}
          legends={chartLegends}
          renderChart={() => (
            <div className="w-full h-[230px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.yearlySchedule} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="stepUpEquityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.25)" />
                  <XAxis
                    dataKey="year"
                    tickFormatter={(v) => `${t.yrShort} ${v}`}
                    tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => formatINRCompact(v)}
                    tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    width={68}
                  />
                  <Tooltip content={<CustomStepUpStpTooltip t={t} />} />
                  <Area
                    type="monotone"
                    dataKey="stepUpEquity"
                    name={t.legendStepUp}
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#stepUpEquityGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="regularEquity"
                    name={t.legendRegular}
                    stroke="#64748b"
                    strokeWidth={2}
                    fillOpacity={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          renderTable={() => (
            <table className="w-full text-left border-collapse text-[11px] sm:text-sm tabular-nums">
              <thead className="sticky top-0 bg-slate-100 dark:bg-[#131C31] border-b border-slate-300 dark:border-white/15 text-[11px] sm:text-xs font-extrabold text-slate-800 dark:text-slate-200">
                <tr>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colYear}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colRegStp}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colStepStp}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colRegBal}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 text-right whitespace-nowrap">{t.colStepBal}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {result.yearlySchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {t.yrShort} {row.year}
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatINR(row.regularStpMonthly)}/mo
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {formatINR(row.stepUpStpMonthly)}/mo
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatINRCompact(row.regularEquity)}
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {formatINRCompact(row.stepUpEquity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        />
      </section>
    </div>
  );
};

export default StepUpStpCalculator;