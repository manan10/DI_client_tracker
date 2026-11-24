import React, { useState, useMemo, useEffect } from "react";
import {
  Repeat,
  Sparkles,
  BarChart3,
  Table as TableIcon,
} from "lucide-react";
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

const TRANSLATIONS = {
  en: {
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
    yearsUnit: "Yrs",
    yrShort: "Yr",

    resultHeader: "2. Regular STP vs. Step-Up STP Comparison",
    heroTitle: "Step-Up STP Final Value",
    regularFinalLabel: "Regular STP Final Value (0% Step-Up)",
    stepUpFinalLabel: (pct) => `Step-Up STP Final Value (${pct}% Step-Up)`,
    extraGainLabel: "Extra Wealth Created by Step-Up",
    totalShiftedLabel: "Total Capital Shifted to Equity",

    takeawaySentence: (regularVal, stepUpVal, extra, stepUpPct, yrs) =>
      extra > 0
        ? `By stepping up your monthly STP by ${stepUpPct}% every year over ${yrs} years, you generate ${stepUpVal} in target equity value — outperforming a regular fixed STP by an extra ${extra}.`
        : `At 0% step-up, both Regular and Step-Up STP yield the same target equity value of ${regularVal}.`,

    chartTitle: "Regular STP vs. Step-Up STP Growth Comparison",
    chartSub: "Visual comparison of target equity accumulation between fixed and growing transfers",
    legendRegular: "Regular STP (Fixed)",
    legendStepUp: "Step-Up STP (Growing)",
    viewChart: "Comparison Chart",
    viewTable: "Year-by-Year Table",

    colYear: "Year",
    colRegStp: "Regular STP",
    colStepStp: "Step-Up STP",
    colRegBal: "Regular Equity Val.",
    colStepBal: "Step-Up Equity Val.",

    waGreeting: (name) => (name ? `Namaste *${name}*,` : `Namaste,`),
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
    waTakeawayHeader: "💡 *Key Takeaway:*",
    waDisclaimer:
      "Disclaimer: Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Figures above are arithmetic illustrations for planning purposes.",
    pdfTitle: "Regular STP vs. Step-Up STP Comparison Report",
    pdfSubtitle: "Systematic transfer optimization & equity accumulation analysis",
  },
  hi: {
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
    yearsUnit: "साल",
    yrShort: "वर्ष",

    resultHeader: "2. रेगुलर STP बनाम स्टेप-अप STP तुलना रिपोर्ट",
    heroTitle: "स्टेप-अप STP अंतिम वैल्यू",
    regularFinalLabel: "रेगुलर STP अंतिम वैल्यू (0% Step-Up)",
    stepUpFinalLabel: (pct) => `स्टेप-अप STP अंतिम वैल्यू (${pct}% Step-Up)`,
    extraGainLabel: "स्टेप-अप द्वारा बनाया गया अतिरिक्त मुनाफा",
    totalShiftedLabel: "इक्विटी में कुल ट्रांसफर",

    takeawaySentence: (regularVal, stepUpVal, extra, stepUpPct, yrs) =>
      extra > 0
        ? `${yrs} साल तक हर साल ${stepUpPct}% STP बढ़ाकर आप ${stepUpVal} का इक्विटी फंड बनाते हैं — जो रेगुलर फिक्स STP से ${extra} अधिक है।`
        : `0% स्टेप-अप पर रेगुलर और स्टेप-अप STP दोनों की वैल्यू ${regularVal} है।`,

    chartTitle: "रेगुलर STP बनाम स्टेप-अप STP ग्रोथ तुलना",
    chartSub: "निश्चित और बढ़ती हुई ट्रांसफर राशि के बीच इक्विटी संचय की तुलना",
    legendRegular: "रेगुलर STP (फिक्स)",
    legendStepUp: "स्टेप-अप STP (बढ़ती हुई)",
    viewChart: "तुलना चार्ट",
    viewTable: "वार्षिक तालिका",

    colYear: "साल",
    colRegStp: "रेगुलर STP",
    colStepStp: "स्टेप-अप STP",
    colRegBal: "रेगुलर इक्विटी",
    colStepBal: "स्टेप-अप इक्विटी",

    waGreeting: (name) => (name ? `नमस्ते *${name}*,` : `नमस्ते,`),
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
    waTakeawayHeader: "💡 *मुख्य सारांश:*",
    waDisclaimer:
      "अस्वीकरण: म्यूचुअल फंड निवेश बाजार जोखिमों के अधीन हैं। यह गणना केवल योजना बनाने के उद्देश्य से है।",
    pdfTitle: "रेगुलर STP बनाम स्टेप-अप STP तुलना रिपोर्ट",
    pdfSubtitle: "सिस्टमैटिक ट्रांसफर ऑप्टिमाइज़ेशन विश्लेषण (Dalal Investments)",
  },
  gu: {
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
    yearsUnit: "વર્ષ",
    yrShort: "વર્ષ",

    resultHeader: "2. રેગ્યુલર STP વિ. સ્ટેપ-અપ STP સરખામણી રિપોર્ટ",
    heroTitle: "સ્ટેપ-અપ STP અંતિમ મૂલ્ય",
    regularFinalLabel: "રેગ્યુલર STP અંતિમ મૂલ્ય (0% Step-Up)",
    stepUpFinalLabel: (pct) => `સ્ટેપ-અપ STP અંતિમ મૂલ્ય (${pct}% Step-Up)`,
    extraGainLabel: "સ્ટેપ-અપ દ્વારા બનેલો વધારાનો નફો",
    totalShiftedLabel: "ઇક્વિટીમાં કુલ ટ્રાન્સફર",

    takeawaySentence: (regularVal, stepUpVal, extra, stepUpPct, yrs) =>
      extra > 0
        ? `${yrs} વર્ષ સુધી દર વર્ષે ${stepUpPct}% STP વધારીને તમે ${stepUpVal} નું ઇક્વિટી ફંડ બનાવો છો — જે રેગ્યુલર ફિક્સ STP કરતાં ${extra} વધુ છે.`
        : `0% સ્ટેપ-અપ પર રેગ્યુલર અને સ્ટેપ-અપ STP બંનેનું મૂલ્ય ${regularVal} છે.`,

    chartTitle: "રેગ્યુલર STP વિ. સ્ટેપ-અપ STP વૃદ્ધિ સરખામણી",
    chartSub: "નિશ્ચિત અને વધતી જતી ટ્રાન્સફર રકમ વચ્ચે ઇક્વિટી સંચયની સરખામણી",
    legendRegular: "રેગ્યુલર STP (ફિક્સ)",
    legendStepUp: "સ્ટેપ-અપ STP (વધતી)",
    viewChart: "સરખામણી ચાર્ટ",
    viewTable: "વાર્ષિક કોષ્ટક",

    colYear: "વર્ષ",
    colRegStp: "રેગ્યુલર STP",
    colStepStp: "સ્ટેપ-અપ STP",
    colRegBal: "રેગ્યુલર ઇક્વિટી",
    colStepBal: "સ્ટેપ-અપ ઇક્વિટી",

    waGreeting: (name) => (name ? `નમસ્તે *${name}*,` : `નમસ્તે,`),
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
    waTakeawayHeader: "💡 *મુખ્ય સારાંશ:*",
    waDisclaimer:
      "સૂચના: મ્યુચ્યુઅલ ફંડ રોકાણો બજારના જોખમોને આધીન છે. આ ગણતરી માત્ર સમજૂતી માટે છે.",
    pdfTitle: "રેગ્યુલર STP વિ. સ્ટેપ-અપ STP સરખામણી રિપોર્ટ",
    pdfSubtitle: "સિસ્ટમેટિક ટ્રાન્સફર ઓપ્ટિમાઇઝેશન વિશ્લેષણ (Dalal Investments)",
  },
};

const CustomStepUpStpTooltip = ({ active, payload, t }) => {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/15 rounded-xl p-3.5 shadow-xl space-y-2 min-w-[230px] font-sans text-xs z-50">
      <div className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-1.5">
        {t.yrShort} {row.year}
      </div>
      <div className="space-y-1.5 tabular-nums">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">{t.legendRegular}:</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {formatINRCompact(row.regularEquity)}
          </span>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-slate-100 dark:border-white/10">
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

  const [initialLumpsum, setInitialLumpsum] = useState(1500000); // ₹15L
  const [monthlyTransfer, setMonthlyTransfer] = useState(30000);
  const [stepUpPct, setStepUpPct] = useState(10);
  const [years, setYears] = useState(4);
  const [sourceReturn, setSourceReturn] = useState(6.5);
  const [targetReturn, setTargetReturn] = useState(12);

  const [activeView, setActiveView] = useState("chart");

  const result = useMemo(() => {
    const startCap = Math.max(0, Number(initialLumpsum) || 0);
    const startStp = Math.max(0, Number(monthlyTransfer) || 0);
    const step = Number(stepUpPct) || 0;
    const yrs = Math.max(1, Number(years) || 1);
    const rSource = (Number(sourceReturn) || 0) / 100 / 12;
    const rTarget = (Number(targetReturn) || 0) / 100 / 12;

    // Simulation A: Regular STP (0% Step-Up)
    let srcReg = startCap;
    let tgtReg = 0;

    // Simulation B: Step-Up STP
    let srcStep = startCap;
    let tgtStep = 0;
    let stepTransferred = 0;
    let curStepStp = startStp;

    const yearlySchedule = [];

    for (let yr = 1; yr <= yrs; yr++) {
      for (let m = 1; m <= 12; m++) {
        // Regular STP
        srcReg = srcReg * (1 + rSource);
        const drawReg = Math.min(srcReg, startStp);
        srcReg -= drawReg;
        tgtReg = (tgtReg + drawReg) * (1 + rTarget);

        // Step-Up STP
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
  }, [
    clientName,
    monthlyTransfer,
    stepUpPct,
    years,
    result,
    t,
    onSummaryChange,
  ]);

  return (
    <div className="space-y-8 w-full font-sans">
      
      {/* TOP SECTION: CONFIGURATION FORM */}
      <section className="bg-slate-50/90 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="pb-3 border-b border-slate-200/80 dark:border-white/10">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t.sectionTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.sectionSub}
          </p>
        </div>

        {/* Row 1: Initial Lumpsum & Monthly Transfer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
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

        {/* Row 2: Step-Up %, Tenure, Source Return, Target Return */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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

      {/* BOTTOM SECTION: COMPARISON RESULTS & CHART */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t.resultHeader}
          </h3>
        </div>

        {/* High-Contrast Hero Banner */}
        <div className="rounded-2xl bg-slate-900 dark:bg-[#0F172A] border border-slate-800 dark:border-emerald-500/30 text-white p-6 shadow-md space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                <Repeat size={13} />
                <span>
                  {t.heroTitle} ({years} {t.yearsUnit})
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-white tabular-nums">
                  {formatINRCompact(result.stepUpFinal)}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-emerald-300 tabular-nums">
                  +{formatINRCompact(result.extraWealth)} extra vs regular
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                  {t.regularFinalLabel}
                </span>
                <span className="text-lg font-black text-white tabular-nums mt-0.5 block">
                  {formatINRCompact(result.regularFinal)}
                </span>
                <span className="text-[11px] text-slate-400">Fixed monthly transfer</span>
              </div>

              <div className="bg-slate-800/90 border border-emerald-500/30 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  {t.extraGainLabel}
                </span>
                <span className="text-lg font-black text-emerald-400 tabular-nums mt-0.5 block">
                  +{formatINRCompact(result.extraWealth)}
                </span>
                <span className="text-[11px] text-slate-400">Step-Up Advantage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plain-Language Summary Callout */}
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          <Sparkles size={17} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
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

        {/* Chart & Table Card */}
        <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0B1120] shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {activeView === "chart" ? t.chartTitle : t.viewTable}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.chartSub}
              </p>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setActiveView("chart")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === "chart"
                    ? "bg-white dark:bg-[#0B1120] text-emerald-700 dark:text-emerald-400 shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                }`}
              >
                <BarChart3 size={14} />
                <span>{t.viewChart}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView("table")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === "table"
                    ? "bg-white dark:bg-[#0B1120] text-emerald-700 dark:text-emerald-400 shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                }`}
              >
                <TableIcon size={14} />
                <span>{t.viewTable}</span>
              </button>
            </div>
          </div>

          {activeView === "chart" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-5 text-xs font-bold">
                <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  {t.legendStepUp}
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  {t.legendRegular}
                </span>
              </div>

              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart
                    data={result.yearlySchedule}
                    margin={{ top: 10, right: 16, left: 4, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="stepUpEquityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.32} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(148, 163, 184, 0.18)"
                    />
                    <XAxis
                      dataKey="year"
                      tickFormatter={(v) => `${t.yrShort} ${v}`}
                      tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => formatINRCompact(v)}
                      tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      width={76}
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
            </div>
          ) : (
            <div className="max-h-[340px] overflow-y-auto overflow-x-auto border border-slate-200 dark:border-white/10 rounded-xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm tabular-nums">
                <thead className="sticky top-0 bg-slate-50 dark:bg-[#131C31] border-b border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <tr>
                    <th className="py-3 px-4">{t.colYear}</th>
                    <th className="py-3 px-4">{t.colRegStp}</th>
                    <th className="py-3 px-4">{t.colStepStp}</th>
                    <th className="py-3 px-4">{t.colRegBal}</th>
                    <th className="py-3 px-4 text-right">{t.colStepBal}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {result.yearlySchedule.map((row) => (
                    <tr
                      key={row.year}
                      className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {t.yrShort} {row.year}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                        {formatINR(row.regularStpMonthly)}/mo
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatINR(row.stepUpStpMonthly)}/mo
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                        {formatINRCompact(row.regularEquity)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatINRCompact(row.stepUpEquity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default StepUpStpCalculator;