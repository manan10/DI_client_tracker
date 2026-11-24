import React, { useState, useMemo, useEffect } from "react";
import {
  Repeat,
  Sparkles,
  BarChart3,
  Table as TableIcon,
  TrendingUp,
  ArrowRightLeft,
  Layers,
  Wallet,
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
    sourceReturnDesc: "Typically 6%–7% p.a. while money waits to be transferred.",
    targetReturnLabel: "Target Fund Return (Equity %)",
    targetReturnDesc: "Expected long-term equity growth rate (typically 11%–13%).",
    yearsUnit: "Yrs",
    yrShort: "Yr",

    resultHeader: "2. Projected STP Wealth Summary",
    heroTitle: "Combined Final Portfolio Value",
    totalTransferredLabel: "Total Shifted to Equity",
    sourceLeftLabel: "Remaining in Source Fund",
    targetFinalLabel: "Target Equity Fund Value",
    totalGainLabel: "Total Wealth Gained",
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
    viewTable: "Year-by-Year Table",

    colYear: "Year",
    colMonthlyStp: "Monthly STP",
    colTransferred: "Total Shifted",
    colSourceBal: "Source Balance",
    colTargetBal: "Target Equity",
    colCombined: "Combined Total",

    waGreeting: (name) => (name ? `Namaste *${name}*,` : `Namaste,`),
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
    waTakeawayHeader: "💡 *Key Takeaway:*",
    waDisclaimer:
      "Disclaimer: Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Figures above are arithmetic illustrations for planning purposes.",
    pdfTitle: "Systematic Transfer Plan (STP) Illustration",
    pdfSubtitle: "Phased lumpsum deployment from debt/liquid into equity compounding",
  },
  hi: {
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
    sourceReturnDesc: "आमतौर पर 6%–7% सालाना।",
    targetReturnLabel: "टारगेट फंड रिटर्न (इक्विटी %)",
    targetReturnDesc: "इक्विटी फंड में अनुमानित सालाना ग्रोथ (11%–13%)।",
    yearsUnit: "साल",
    yrShort: "वर्ष",

    resultHeader: "2. अनुमानित STP पोर्टफोलियो रिपोर्ट",
    heroTitle: "कुल संयुक्त पोर्टफोलियो वैल्यू",
    totalTransferredLabel: "इक्विटी में कुल ट्रांसफर",
    sourceLeftLabel: "सोर्स फंड में शेष राशि",
    targetFinalLabel: "टारगेट इक्विटी फंड वैल्यू",
    totalGainLabel: "कुल अर्जित लाभ",
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
    viewTable: "वार्षिक तालिका",

    colYear: "साल",
    colMonthlyStp: "मासिक STP",
    colTransferred: "कुल ट्रांसफर",
    colSourceBal: "सोर्स बैलेंस",
    colTargetBal: "टारगेट इक्विटी",
    colCombined: "कुल पोर्टफोलियो",

    waGreeting: (name) => (name ? `नमस्ते *${name}*,` : `नमस्ते,`),
    waIntro: (isStepUp) =>
      `*Dalal Investments* की ओर से आपका *${isStepUp ? "स्टेप-अप STP" : "सिस्टमैटिक ट्रांसफर प्लान (STP)"}* नीचे प्रस्तुत है:`,
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
    waTakeawayHeader: "💡 *मुख्य सारांश:*",
    waDisclaimer:
      "अस्वीकरण: म्यूचुअल फंड निवेश बाजार जोखिमों के अधीन हैं। यह गणना केवल योजना बनाने के उद्देश्य से है।",
    pdfTitle: "सिस्टमैटिक ट्रांसफर प्लान (STP) रिपोर्ट (Dalal Investments)",
    pdfSubtitle: "लिक्विड/डेट फंड से इक्विटी में चरणबद्ध निवेश विश्लेषण",
  },
  gu: {
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
    sourceReturnDesc: "સામાન્ય રીતે 6%–7% વાર્ષિક.",
    targetReturnLabel: "ટાર્ગેટ ફંડ વળતર (ઇક્વિટી %)",
    targetReturnDesc: "ઇક્વિટી ફંડમાં અંદાજિત વાર્ષિક વૃદ્ધિ (11%–13%).",
    yearsUnit: "વર્ષ",
    yrShort: "વર્ષ",

    resultHeader: "2. અંદાજિત STP પોર્ટફોલિયો રિપોર્ટ",
    heroTitle: "કુલ સંયુક્ત પોર્ટફોલિયો મૂલ્ય",
    totalTransferredLabel: "ઇક્વિટીમાં કુલ ટ્રાન્સફર",
    sourceLeftLabel: "સોર્સ ફંડમાં બાકી રકમ",
    targetFinalLabel: "ટાર્ગેટ ઇક્વિટી ફંડ મૂલ્ય",
    totalGainLabel: "કુલ મળેલો નફો",
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
    viewTable: "વાર્ષિક કોષ્ટક",

    colYear: "વર્ષ",
    colMonthlyStp: "માસિક STP",
    colTransferred: "કુલ ટ્રાન્સફર",
    colSourceBal: "સોર્સ બેલેન્સ",
    colTargetBal: "ટાર્ગેટ ઇક્વિટી",
    colCombined: "કુલ પોર્ટફોલિયો",

    waGreeting: (name) => (name ? `નમસ્તે *${name}*,` : `નમસ્તે,`),
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
    waTakeawayHeader: "💡 *મુખ્ય સારાંશ:*",
    waDisclaimer:
      "સૂચના: મ્યુચ્યુઅલ ફંડ રોકાણો બજારના જોખમોને આધીન છે. આ ગણતરી માત્ર સમજૂતી માટે છે.",
    pdfTitle: "સિસ્ટમેટિક ટ્રાન્સફર પ્લાન (STP) રિપોર્ટ (Dalal Investments)",
    pdfSubtitle: "લિક્વિડ/ડેટ ફંડમાંથી ઇક્વિટીમાં તબક્કાવાર રોકાણ વિશ્લેષણ",
  },
};

const CustomStpTooltip = ({ active, payload, t }) => {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/15 rounded-xl p-3.5 shadow-xl space-y-2 min-w-[230px] font-sans text-xs z-50">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-1.5">
        <span className="font-bold text-slate-900 dark:text-white">
          {t.yrShort} {row.year}
        </span>
        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
          {t.colMonthlyStp}: {formatINR(row.monthlyStp)}
        </span>
      </div>
      <div className="space-y-1.5 tabular-nums">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">{t.legendSource}:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">
            {formatINRCompact(row.sourceBalance)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">{t.legendTarget}:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {formatINRCompact(row.targetBalance)}
          </span>
        </div>
        <div className="flex justify-between gap-4 pt-1.5 border-t border-slate-100 dark:border-white/10">
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

  const [initialLumpsum, setInitialLumpsum] = useState(1000000); // ₹10L
  const [monthlyTransfer, setMonthlyTransfer] = useState(25000);
  const [stepUpPct, setStepUpPct] = useState(0);
  const [years, setYears] = useState(5);
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

    let sourceBal = startCap;
    let targetBal = 0;
    let totalTransferred = 0;
    let currentStp = startStp;
    let depletedYear = null;
    const yearlySchedule = [];

    for (let yr = 1; yr <= yrs; yr++) {
      for (let m = 1; m <= 12; m++) {
        // Source fund grows for the month
        sourceBal = sourceBal * (1 + rSource);
        // Transfer out up to available source balance
        const actualTransfer = Math.min(sourceBal, currentStp);
        sourceBal -= actualTransfer;
        totalTransferred += actualTransfer;

        // Target equity fund receives transfer and compounds
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
  }, [
    clientName,
    monthlyTransfer,
    stepUpPct,
    years,
    sourceReturn,
    targetReturn,
    result,
    t,
    onSummaryChange,
  ]);

  return (
    <div className="space-y-8 w-full font-sans">
      
      {/* ================================================================= */}
      {/* TOP SECTION: STP CONFIGURATION FORM                               */}
      {/* ================================================================= */}
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

        {/* Row 2: Step-Up %, Tenure, Source Return, Target Return */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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

      {/* ================================================================= */}
      {/* BOTTOM SECTION: COMBINED PORTFOLIO RESULTS & CHART                */}
      {/* ================================================================= */}
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
                  {formatINRCompact(result.combinedFinal)}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-emerald-300 tabular-nums">
                  +{formatINRCompact(result.totalGain)} gain
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
              <div className="bg-slate-800/90 border border-indigo-500/30 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                  {t.targetFinalLabel}
                </span>
                <span className="text-lg font-black text-white tabular-nums mt-0.5 block">
                  {formatINRCompact(result.finalTargetBalance)}
                </span>
                <span className="text-[11px] text-slate-400">
                  Shifted: {formatINRCompact(result.totalTransferred)}
                </span>
              </div>

              <div className="bg-slate-800/90 border border-amber-500/30 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                  {t.sourceLeftLabel}
                </span>
                <span className="text-lg font-black text-amber-400 tabular-nums mt-0.5 block">
                  {formatINRCompact(result.finalSourceBalance)}
                </span>
                <span className="text-[11px] text-slate-400">
                  In Liquid/Debt
                </span>
              </div>

              <div className="bg-slate-800/90 border border-emerald-500/30 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  {t.totalGainLabel}
                </span>
                <span className="text-lg font-black text-emerald-400 tabular-nums mt-0.5 block">
                  +{formatINRCompact(result.totalGain)}
                </span>
                <span className="text-[11px] text-slate-400">
                  On {formatINRCompact(result.initialLumpsum)}
                </span>
              </div>
            </div>
          </div>

          {result.depletedYear !== null && (
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-amber-300 font-medium">
              <Sparkles size={14} className="text-amber-400 shrink-0" />
              <span>{t.depletionNote(result.depletedYear)}</span>
            </div>
          )}
        </div>

        {/* Plain-Language Summary Callout */}
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          <Sparkles size={17} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
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

        {/* Chart & Year-by-Year Table Card */}
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
                  {t.legendCombined}
                </span>
                <span className="inline-flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  {t.legendTarget}
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  {t.legendSource}
                </span>
              </div>

              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart
                    data={result.yearlySchedule}
                    margin={{ top: 10, right: 16, left: 4, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="stpCombinedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
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
            </div>
          ) : (
            <div className="max-h-[340px] overflow-y-auto overflow-x-auto border border-slate-200 dark:border-white/10 rounded-xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm tabular-nums">
                <thead className="sticky top-0 bg-slate-50 dark:bg-[#131C31] border-b border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <tr>
                    <th className="py-3 px-4">{t.colYear}</th>
                    <th className="py-3 px-4">{t.colMonthlyStp}</th>
                    <th className="py-3 px-4">{t.colTransferred}</th>
                    <th className="py-3 px-4">{t.colSourceBal}</th>
                    <th className="py-3 px-4">{t.colTargetBal}</th>
                    <th className="py-3 px-4 text-right">{t.colCombined}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {result.yearlySchedule.map((row) => (
                    <tr
                      key={row.year}
                      className="hover:bg-emerald-50/40 dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {t.yrShort} {row.year}
                      </td>
                      <td className="py-2.5 px-4 text-indigo-600 dark:text-indigo-400 font-semibold">
                        {formatINR(row.monthlyStp)}/mo
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                        {formatINRCompact(row.totalTransferred)}
                      </td>
                      <td className="py-2.5 px-4 text-amber-600 dark:text-amber-400 font-semibold">
                        {formatINRCompact(row.sourceBalance)}
                      </td>
                      <td className="py-2.5 px-4 text-indigo-600 dark:text-indigo-400 font-semibold">
                        {formatINRCompact(row.targetBalance)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                        {formatINRCompact(row.combinedBalance)}
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

export default StpCalculator;