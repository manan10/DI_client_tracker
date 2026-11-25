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
    sectionTitle: "1. Configure Systematic Transfer Plan (STP)",
    sectionSub:
      "Park your lumpsum in a safe Source Fund (Liquid/Arbitrage) and transfer fixed or rising amounts monthly into Equity.",
    lumpsumLabel: "Initial Lumpsum Parked (Source Fund)",
    lumpsumDesc: "Total amount invested upfront in the source debt/liquid scheme.",
    transferLabel: "Starting Monthly Transfer (STP)",
    transferDesc: "Amount shifted every month from Source Fund to Target Equity Fund.",
    stepUpLabel: "Yearly STP Increase (%)",
    stepUpDesc: "Increase your monthly transfer amount every year (0% = fixed STP).",
    tenureLabel: "STP Transfer Duration",
    tenureDesc: "Number of years over which funds systematically shift into equity.",
    sourceReturnLabel: "Source Fund Return (Liquid/Debt %)",
    targetReturnLabel: "Target Fund Return (Equity %)",
    resultHeader: "2. Projected STP Wealth Summary",
    heroTitle: "Combined Final Portfolio Value",
    sourceLeftLabel: "Remaining in Source",
    targetFinalLabel: "Target Equity Value",
    totalGainLabel: "Total Gain",
    depletionNote: (yr) =>
      `Source fund finishes transferring completely in Year ${yr}; equity corpus continues compounding thereafter.`,
    takeawaySentence: (lumpsum, monthly, yrs, targetVal, sourceVal, totalVal, gain) =>
      `By parking ${lumpsum} in a liquid/debt fund and transferring ${monthly}/mo into equity over ${yrs} years, your equity fund grows to ${targetVal} (plus ${sourceVal} left in source) — creating ${totalVal} total (${gain} profit).`,
    chartTitle: "Source vs. Target Fund Balance Over Time",
    chartSub:
      "Watch money steadily move out of the Source Fund while the Target Equity Fund compounds",
    legendCombined: "Combined Total Value",
    legendTarget: "Target Fund (Equity)",
    legendSource: "Source Fund (Liquid/Debt)",
    viewChart: "Transfer Chart",
    colMonthlyStp: "Monthly STP",
    colTransferred: "Total Shifted",
    colSourceBal: "Source Balance",
    colTargetBal: "Target Equity",
    colCombined: "Combined Total",
    waIntro: (isStepUp) =>
      `Here is your personalized *${isStepUp ? "Step-Up STP" : "Systematic Transfer Plan (STP)"} Illustration* prepared by *Dalal Investments*:`,
    waPlanHeader: "1️⃣ *STP Plan Parameters*",
    waLumpsum: "Initial Lumpsum Parked",
    waMonthlyStp: "Starting Monthly Transfer",
    waStepUp: "Yearly STP Step-Up",
    waDuration: "Transfer Horizon",
    waRates: "Assumed Returns (Source / Target)",
    waOutcomeHeader: "2️⃣ *Projected Portfolio Outcome*",
    waShifted: "Total Amount Transferred to Equity",
    waTargetVal: "Target Equity Fund Value",
    waSourceVal: "Remaining Source Fund Balance",
    waTotalGain: "Total Wealth Gained",
    waTotal: "Combined Portfolio Value",
    pdfTitle: "Systematic Transfer Plan (STP) Illustration",
    pdfSubtitle: "Phased lumpsum deployment from debt/liquid into equity compounding",
  },
  hi: {
    ...COMMON_TRANSLATIONS.hi,
    sectionTitle: "1. सिस्टमैटिक ट्रांसफर प्लान (STP) विवरण दर्ज करें",
    sectionSub:
      "अपनी एकमुश्त राशि सुरक्षित लिक्विड/डेट फंड में रखें और हर महीने तय राशि इक्विटी फंड में ट्रांसफर करें।",
    lumpsumLabel: "शुरुआती एकमुश्त राशि (Source Fund)",
    lumpsumDesc: "लिक्विड या आर्बिट्राज फंड में जमा कुल शुरुआती पूंजी।",
    transferLabel: "शुरुआती मासिक ट्रांसफर (STP)",
    transferDesc: "हर महीने सोर्स फंड से इक्विटी फंड में जाने वाली राशि।",
    stepUpLabel: "सालाना STP बढ़ोतरी (%)",
    stepUpDesc: "हर साल मासिक ट्रांसफर राशि बढ़ाएं (0% = समान ट्रांसफर)।",
    tenureLabel: "STP ट्रांसफर की अवधि",
    tenureDesc: "कितने सालों तक पैसा धीरे-धीरे इक्विटी में ट्रांसफर होगा।",
    sourceReturnLabel: "सोर्स फंड रिटर्न (लिक्विड/डेट %)",
    targetReturnLabel: "टारगेट फंड रिटर्न (इक्विटी %)",
    resultHeader: "2. अनुमानित STP पोर्टफोलियो रिपोर्ट",
    heroTitle: "कुल संयुक्त पोर्टफोलियो वैल्यू",
    sourceLeftLabel: "सोर्स फंड में शेष",
    targetFinalLabel: "टारगेट इक्विटी वैल्यू",
    totalGainLabel: "कुल लाभ",
    depletionNote: (yr) =>
      `सोर्स फंड की पूरी राशि ${yr}वें साल में ट्रांसफर हो जाएगी; इसके बाद इक्विटी फंड लगातार बढ़ता रहेगा।`,
    takeawaySentence: (lumpsum, monthly, yrs, targetVal, sourceVal, totalVal, gain) =>
      `${lumpsum} को लिक्विड फंड में रखकर ${yrs} साल तक हर महीने ${monthly} इक्विटी में ट्रांसफर करने से आपका इक्विटी फंड ${targetVal} हो जाता है (और ${sourceVal} सोर्स फंड में बचता है) — कुल ${totalVal} (${gain} मुनाफा)।`,
    chartTitle: "समय के साथ सोर्स बनाम टारगेट फंड बैलेंस",
    chartSub: "देखें कि कैसे पैसा सोर्स फंड से निकलकर इक्विटी फंड में तेजी से बढ़ता है",
    legendCombined: "कुल संयुक्त वैल्यू",
    legendTarget: "टारगेट फंड (इक्विटी)",
    legendSource: "सोर्स फंड (लिक्विड/डेट)",
    viewChart: "ट्रांसफर चार्ट",
    colMonthlyStp: "मासिक STP",
    colTransferred: "कुल ट्रांसफर",
    colSourceBal: "सोर्स बैलेंस",
    colTargetBal: "टारगेट इक्विटी",
    colCombined: "कुल पोर्टफोलियो",
    waIntro: (isStepUp) =>
      `*Dalal Investments* की ओर से आपकी *${isStepUp ? "स्टेप-अप STP" : "सिस्टमैटिक ट्रांसफर प्लान (STP)"}* नीचे प्रस्तुत है:`,
    waPlanHeader: "1️⃣ *STP योजना का विवरण*",
    waLumpsum: "शुरुआती एकमुश्त राशि",
    waMonthlyStp: "शुरुआती मासिक ट्रांसफर",
    waStepUp: "सालाना STP बढ़ोतरी",
    waDuration: "ट्रांसफर अवधि",
    waRates: "अनुमानित रिटर्न (सोर्स / टारगेट)",
    waOutcomeHeader: "2️⃣ *अनुमानित पोर्टफोलियो परिणाम*",
    waShifted: "इक्विटी में कुल ट्रांसफर राशि",
    waTargetVal: "टारगेट इक्विटी फंड वैल्यू",
    waSourceVal: "शेष सोर्स फंड बैलेंस",
    waTotalGain: "कुल अर्जित मुनाफा",
    waTotal: "कुल संयुक्त पोर्टफोलियो वैल्यू",
    pdfTitle: "सिस्टमैटिक ट्रांसफर प्लान (STP) रिपोर्ट (Dalal Investments)",
    pdfSubtitle: "लिक्विड/डेट फंड से इक्विटी में चरणबद्ध निवेश विश्लेषण",
  },
  gu: {
    ...COMMON_TRANSLATIONS.gu,
    sectionTitle: "1. સિસ્ટમેટિક ટ્રાન્સફર પ્લાન (STP) વિગતો દાખલ કરો",
    sectionSub:
      "તમારી એકસાથે રકમ સુરક્ષિત લિક્વિડ/ડેટ ફંડમાં રાખો અને દર મહિને નિશ્ચિત રકમ ઇક્વિટી ફંડમાં ટ્રાન્સફર કરો.",
    lumpsumLabel: "શરૂઆતની એકસાથે રકમ (Source Fund)",
    lumpsumDesc: "લિક્વિડ અથવા આર્બિટ્રાજ ફંડમાં જમા કુલ શરૂઆતની મૂડી.",
    transferLabel: "શરૂઆતનું માસિક ટ્રાન્સફર (STP)",
    transferDesc: "દર મહિને સોર્સ ફંડમાંથી ઇક્વિટી ફંડમાં જતી રકમ.",
    stepUpLabel: "વાર્ષિક STP વધારો (%)",
    stepUpDesc: "દર વર્ષે માસિક ટ્રાન્સફર રકમ વધારો (0% = એકસરખું).",
    tenureLabel: "STP ટ્રાન્સફરનો સમયગાળો",
    tenureDesc: "કેટલા વર્ષ સુધી પૈસા ધીમે-ધીમે ઇક્વિટીમાં ટ્રાન્સફર થશે.",
    sourceReturnLabel: "સોર્સ ફંડ વળતર (લિક્વિડ/ડેટ %)",
    targetReturnLabel: "ટાર્ગેટ ફંડ વળતર (ઇક્વિટી %)",
    resultHeader: "2. અંદાજિત STP પોર્ટફોલિયો રિપોર્ટ",
    heroTitle: "કુલ સંયુક્ત પોર્ટફોલિયો મૂલ્ય",
    sourceLeftLabel: "સોર્સ ફંડમાં બાકી",
    targetFinalLabel: "ટાર્ગેટ ઇક્વિટી મૂલ્ય",
    totalGainLabel: "કુલ નફો",
    depletionNote: (yr) =>
      `સોર્સ ફંડની પૂરી રકમ ${yr}મા વર્ષે ટ્રાન્સફર થઈ જશે; ત્યારબાદ ઇક્વિટી ફંડ સતત વધતું રહેશે.`,
    takeawaySentence: (lumpsum, monthly, yrs, targetVal, sourceVal, totalVal, gain) =>
      `${lumpsum} ને લિક્વિડ ફંડમાં રાખીને ${yrs} વર્ષ સુધી દર મહિને ${monthly} ઇક્વિટીમાં ટ્રાન્સફર કરવાથી તમારું ઇક્વિટી ફંડ ${targetVal} થાય છે (અને ${sourceVal} સોર્સ ફંડમાં બચે છે) — કુલ ${totalVal} (${gain} નફો).`,
    chartTitle: "સમય સાથે સોર્સ વિ. ટાર્ગેટ ફંડ બેલેન્સ",
    chartSub: "જુઓ કે કેવી રીતે પૈસા સોર્સ ફંડમાંથી નીકળીને ઇક્વિટી ફંડમાં ઝડપથી વધે છે",
    legendCombined: "કુલ સંયુક્ત મૂલ્ય",
    legendTarget: "ટાર્ગેટ ફંડ (ઇક્વિટી)",
    legendSource: "સોર્સ ફંડ (લિક્વિડ/ડેટ)",
    viewChart: "ટ્રાન્સફર ચાર્ટ",
    colMonthlyStp: "માસિક STP",
    colTransferred: "કુલ ટ્રાન્સફર",
    colSourceBal: "સોર્સ બેલેન્સ",
    colTargetBal: "ટાર્ગેટ ઇક્વિટી",
    colCombined: "કુલ પોર્ટફોલિયો",
    waIntro: (isStepUp) =>
      `*Dalal Investments* તરફથી તમારો *${isStepUp ? "સ્ટેપ-અપ STP" : "સિસ્ટમેટિક ટ્રાન્સફર પ્લાન (STP)"}* નીચે મુજબ છે:`,
    waPlanHeader: "1️⃣ *STP યોજનાની વિગતો*",
    waLumpsum: "શરૂઆતની એકસાથે રકમ",
    waMonthlyStp: "શરૂઆતનું માસિક ટ્રાન્સફર",
    waStepUp: "વાર્ષિક STP વધારો",
    waDuration: "ટ્રાન્સફર સમયગાળો",
    waRates: "અંદાજિત વળતર (સોર્સ / ટાર્ગેટ)",
    waOutcomeHeader: "2️⃣ *અંદાજિત પોર્ટફોલિયો પરિણામ*",
    waShifted: "ઇક્વિટીમાં કુલ ટ્રાન્સફર રકમ",
    waTargetVal: "ટાર્ગેટ ઇક્વિટી ફંડ મૂલ્ય",
    waSourceVal: "બાકી સોર્સ ફંડ બેલેન્સ",
    waTotalGain: "કુલ મળેલો નફો",
    waTotal: "કુલ સંયુક્ત પોર્ટફોલિયો મૂલ્ય",
    pdfTitle: "સિસ્ટમેટિક ટ્રાન્સફર પ્લાન (STP) રિપોર્ટ (Dalal Investments)",
    pdfSubtitle: "લિક્વિડ/ડેટ ફંડમાંથી ઇક્વિટીમાં તબક્કાવાર રોકાણ વિશ્લેષણ",
  },
};

const CustomStpTooltip = ({ active, payload, t }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-white/15 rounded-xl p-3 shadow-xl space-y-1.5 min-w-[210px] sm:min-w-[230px] font-sans text-xs z-50">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/15 pb-1.5">
        <span className="font-bold text-slate-900 dark:text-white">
          {t.yrShort} {row.year}
        </span>
        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
          {t.colMonthlyStp}: {formatINR(row.monthlyStp)}
        </span>
      </div>
      <div className="space-y-1.5 tabular-nums">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500 dark:text-slate-400">{t.legendSource}:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">
            {formatINRCompact(row.sourceBalance)}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500 dark:text-slate-400">{t.legendTarget}:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {formatINRCompact(row.targetBalance)}
          </span>
        </div>
        <div className="flex justify-between gap-3 pt-1.5 border-t border-slate-200 dark:border-white/15">
          <span className="font-bold text-slate-900 dark:text-white">{t.legendCombined}:</span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatINRCompact(row.combinedBalance)}
          </span>
        </div>
      </div>
    </div>
  );
};

const StpCalculator = ({ clientName, lang = "en", onSummaryChange }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [initialLumpsum, setInitialLumpsum] = useState(1000000);
  const [monthlyTransfer, setMonthlyTransfer] = useState(25000);
  const [stepUpPct, setStepUpPct] = useState(0);
  const [years, setYears] = useState(5);
  const [sourceReturn, setSourceReturn] = useState(6.5);
  const [targetReturn, setTargetReturn] = useState(12);

  const result = useMemo(() => {
    const startCap = Math.max(0, Number(initialLumpsum) || 0);
    const startStp = Math.max(0, Number(monthlyTransfer) || 0);
    const step = Number(stepUpPct) || 0;
    const yrs = Math.max(1, Number(years) || 1);
    const rSource = (Number(sourceReturn) || 0) / 100 / 12;
    const rTarget = (Number(targetReturn) || 0) / 100 / 12;

    let sourceBal = startCap;
    let targetBal = 0;
    let totalTransferred = 0;
    let currentStp = startStp;
    let depletedYear = null;
    const yearlySchedule = [];

    for (let yr = 1; yr <= yrs; yr++) {
      for (let m = 1; m <= 12; m++) {
        sourceBal = sourceBal * (1 + rSource);
        const actualTransfer = Math.min(sourceBal, currentStp);
        sourceBal -= actualTransfer;
        totalTransferred += actualTransfer;

        targetBal = (targetBal + actualTransfer) * (1 + rTarget);

        if (sourceBal <= 1 && depletedYear === null) {
          depletedYear = yr;
        }
      }

      const combined = sourceBal + targetBal;
      yearlySchedule.push({
        year: yr,
        monthlyStp: Math.round(currentStp),
        totalTransferred: Math.round(totalTransferred),
        sourceBalance: Math.round(sourceBal),
        targetBalance: Math.round(targetBal),
        combinedBalance: Math.round(combined),
      });

      currentStp = currentStp * (1 + step / 100);
    }

    const combinedFinal = Math.round(sourceBal + targetBal);
    const totalGain = Math.round(Math.max(0, combinedFinal - startCap));

    return {
      initialLumpsum: Math.round(startCap),
      totalTransferred: Math.round(totalTransferred),
      finalSourceBalance: Math.round(sourceBal),
      finalTargetBalance: Math.round(targetBal),
      combinedFinal,
      totalGain,
      depletedYear,
      yearlySchedule,
    };
  }, [initialLumpsum, monthlyTransfer, stepUpPct, years, sourceReturn, targetReturn]);

  useEffect(() => {
    const takeaway = t.takeawaySentence(
      formatINRCompact(result.initialLumpsum),
      formatINR(monthlyTransfer),
      years,
      formatINRCompact(result.finalTargetBalance),
      formatINRCompact(result.finalSourceBalance),
      formatINRCompact(result.combinedFinal),
      formatINRCompact(result.totalGain)
    );

    const text =
      `${t.waGreeting(clientName?.trim())}\n\n` +
      `${t.waIntro(stepUpPct > 0)}\n\n` +
      `${t.waPlanHeader}\n` +
      `• ${t.waLumpsum}: *${formatINRCompact(result.initialLumpsum)}* (${formatINR(result.initialLumpsum)})\n` +
      `• ${t.waMonthlyStp}: *${formatINR(monthlyTransfer)}/month*\n` +
      `• ${t.waStepUp}: *${stepUpPct}% / yr*\n` +
      `• ${t.waDuration}: *${years} ${t.yearsUnit}*\n` +
      `• ${t.waRates}: *${sourceReturn}%* → *${targetReturn}% p.a.*\n\n` +
      `${t.waOutcomeHeader}\n` +
      `• ${t.waShifted}: *${formatINRCompact(result.totalTransferred)}*\n` +
      `• ${t.waTargetVal}: *${formatINRCompact(result.finalTargetBalance)}*\n` +
      `• ${t.waSourceVal}: *${formatINRCompact(result.finalSourceBalance)}*\n` +
      `• ${t.waTotalGain}: *+${formatINRCompact(result.totalGain)}*\n` +
      `• *${t.waTotal}: ${formatINRCompact(result.combinedFinal)}*\n\n` +
      `${t.waTakeawayHeader}\n${takeaway}\n\n` +
      `_${t.waDisclaimer}_\n` +
      `— *Dalal Investments | Private Wealth Desk*`;

    const milestones = result.yearlySchedule.map((r) => ({
      year: r.year,
      sip: `${formatINR(r.monthlyStp)}/mo`,
      invested: `Source: ${formatINRCompact(r.sourceBalance)}`,
      profit: `Equity: ${formatINRCompact(r.targetBalance)}`,
      total: formatINRCompact(r.combinedBalance),
    }));

    onSummaryChange({
      title: t.pdfTitle,
      subtitle: t.pdfSubtitle,
      takeaway,
      whatsappText: text,
      assumptions: [
        { label: t.waLumpsum, value: formatINRCompact(result.initialLumpsum) },
        { label: t.waMonthlyStp, value: `${formatINR(monthlyTransfer)} (+${stepUpPct}%)` },
        { label: t.waDuration, value: `${years} ${t.yearsUnit}` },
        { label: "Source / Target", value: `${sourceReturn}% / ${targetReturn}%` },
      ],
      highlights: [
        {
          label: t.waShifted,
          sub: `Total capital systematically moved into Target Equity Fund`,
          value: formatINRCompact(result.totalTransferred),
        },
        {
          label: t.waTargetVal,
          sub: `Compounded equity corpus at end of Year ${years}`,
          value: formatINRCompact(result.finalTargetBalance),
        },
        {
          label: t.waSourceVal,
          sub: `Unallocated balance remaining in Source Debt/Liquid Fund`,
          value: formatINRCompact(result.finalSourceBalance),
        },
        {
          label: t.waTotalGain,
          sub: `Combined wealth gained over initial ${formatINRCompact(result.initialLumpsum)}`,
          value: `+${formatINRCompact(result.totalGain)}`,
        },
        {
          label: t.waTotal,
          sub: `Combined Source + Target Portfolio Value`,
          value: `${formatINRCompact(result.combinedFinal)} (${formatINR(result.combinedFinal)})`,
          isHero: true,
        },
      ],
      milestones,
      disclaimer: t.waDisclaimer,
    });
  }, [clientName, monthlyTransfer, stepUpPct, years, sourceReturn, targetReturn, result, t, onSummaryChange]);

  const chartLegends = [
    { label: t.legendCombined, textClass: "text-emerald-700 dark:text-emerald-300", dotClass: "bg-emerald-500" },
    { label: t.legendTarget, textClass: "text-indigo-700 dark:text-indigo-300", dotClass: "bg-indigo-500" },
    { label: t.legendSource, textClass: "text-amber-700 dark:text-amber-300", dotClass: "bg-amber-500" },
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
            min={50000}
            max={50000000}
            sliderMax={10000000}
            step={50000}
            prefix="₹"
            accent="amber"
            presets={[
              { label: "₹5 L", value: 500000 },
              { label: "₹10 L", value: 1000000 },
              { label: "₹25 L", value: 2500000 },
              { label: "₹50 L", value: 5000000 },
              { label: "₹1 Cr", value: 10000000 },
            ]}
          />

          <TactileSliderInput
            label={t.transferLabel}
            description={t.transferDesc}
            value={monthlyTransfer}
            onChange={setMonthlyTransfer}
            min={1000}
            max={1000000}
            sliderMax={250000}
            step={1000}
            prefix="₹"
            presets={[
              { label: "₹15,000", value: 15000 },
              { label: "₹25,000", value: 25000 },
              { label: "₹50,000", value: 50000 },
              { label: "₹1,00,000", value: 100000 },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
          <TactileSliderInput
            label={t.stepUpLabel}
            value={stepUpPct}
            onChange={setStepUpPct}
            min={0}
            max={25}
            step={1}
            suffix="%"
            presets={[
              { label: "0%", value: 0 },
              { label: "5%", value: 5 },
              { label: "10%", value: 10 },
            ]}
          />

          <TactileSliderInput
            label={t.tenureLabel}
            value={years}
            onChange={setYears}
            min={1}
            max={20}
            step={1}
            suffix={t.yearsUnit}
            accent="indigo"
            presets={[
              { label: `3 ${t.yearsUnit}`, value: 3 },
              { label: `5 ${t.yearsUnit}`, value: 5 },
              { label: `10 ${t.yearsUnit}`, value: 10 },
            ]}
          />

          <TactileSliderInput
            label={t.sourceReturnLabel}
            value={sourceReturn}
            onChange={setSourceReturn}
            min={4}
            max={10}
            step={0.5}
            suffix="%"
            accent="amber"
            presets={[
              { label: "6%", value: 6 },
              { label: "6.5%", value: 6.5 },
              { label: "7.5%", value: 7.5 },
            ]}
          />

          <TactileSliderInput
            label={t.targetReturnLabel}
            value={targetReturn}
            onChange={setTargetReturn}
            min={8}
            max={20}
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

      {/* SECTION 2: COMBINED PORTFOLIO RESULTS & CHART */}
      <section className="space-y-4 sm:space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-0.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            {t.resultHeader}
          </h3>

          {result.depletedYear !== null && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-slate-300 dark:border-white/15 text-amber-800 dark:text-amber-300 text-[11px] sm:text-xs font-bold">
              <Sparkles size={13} className="shrink-0" />
              <span>{t.depletionNote(result.depletedYear)}</span>
            </div>
          )}
        </div>

        <HeroResultBanner
          badgeIcon={Repeat}
          badgeText={`${t.heroTitle} (${years} ${t.yearsUnit})`}
          futureValue={result.combinedFinal}
          kpis={[
            {
              label: t.targetFinalLabel,
              labelColor: "text-indigo-300",
              value: formatINRCompact(result.finalTargetBalance),
              valueColor: "text-white",
              sub: `Shifted: ${formatINRCompact(result.totalTransferred)}`,
            },
            {
              label: t.sourceLeftLabel,
              labelColor: "text-amber-300",
              value: formatINRCompact(result.finalSourceBalance),
              valueColor: "text-amber-400",
              sub: "In Liquid/Debt",
            },
            {
              label: t.totalGainLabel,
              labelColor: "text-emerald-300",
              value: `+${formatINRCompact(result.totalGain)}`,
              valueColor: "text-emerald-400",
              sub: `On ${formatINRCompact(result.initialLumpsum)}`,
              highlight: true,
            },
          ]}
        />

        {/* Plain-Language Summary Callout */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-300 dark:border-white/15 shadow-xs flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">
            {t.takeawaySentence(
              formatINRCompact(result.initialLumpsum),
              formatINR(monthlyTransfer),
              years,
              formatINRCompact(result.finalTargetBalance),
              formatINRCompact(result.finalSourceBalance),
              formatINRCompact(result.combinedFinal),
              formatINRCompact(result.totalGain)
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
                    <linearGradient id="stpCombinedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
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
                  <Tooltip content={<CustomStpTooltip t={t} />} />
                  <Area
                    type="monotone"
                    dataKey="combinedBalance"
                    name={t.legendCombined}
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#stpCombinedGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="targetBalance"
                    name={t.legendTarget}
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={0}
                  />
                  <Area
                    type="monotone"
                    dataKey="sourceBalance"
                    name={t.legendSource}
                    stroke="#f59e0b"
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
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colMonthlyStp}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colTransferred}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colSourceBal}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colTargetBal}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 text-right whitespace-nowrap">{t.colCombined}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {result.yearlySchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {t.yrShort} {row.year}
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-indigo-600 dark:text-indigo-400 font-semibold whitespace-nowrap">
                      {formatINR(row.monthlyStp)}/mo
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatINRCompact(row.totalTransferred)}
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-amber-600 dark:text-amber-400 font-semibold whitespace-nowrap">
                      {formatINRCompact(row.sourceBalance)}
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-indigo-600 dark:text-indigo-400 font-semibold whitespace-nowrap">
                      {formatINRCompact(row.targetBalance)}
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-right font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatINRCompact(row.combinedBalance)}
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

export default StpCalculator;