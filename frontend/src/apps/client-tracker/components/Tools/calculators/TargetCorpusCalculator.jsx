import React, { useState, useMemo, useEffect } from "react";
import {
  Target,
  Sparkles,
  BarChart3,
  Table as TableIcon,
  TrendingUp,
  Wallet,
  BadgeIndianRupee,
  CheckCircle2,
  Layers,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { calculateStepUpSip, formatINR, formatINRCompact } from "./mathUtils";
import { TactileSliderInput } from "./CalculatorControls";

const TRANSLATIONS = {
  en: {
    sectionTitle: "1. Define Your Target Corpus & Current Head-Start",
    sectionSub:
      "Set the final fund amount you want to achieve, any existing savings you can allocate today, and your timeline.",
    targetLabel: "Target Wealth Goal (Future Value)",
    targetDesc: "The exact corpus you want ready at the end of your horizon.",
    existingLabel: "Existing Savings Allocated Today (Optional)",
    existingDesc:
      "Any existing mutual fund balance or lumpsum you are dedicating toward this goal.",
    yearsLabel: "Time to Reach Goal",
    yearsDesc: "More years significantly lowers the monthly SIP needed.",
    returnLabel: "Expected Annual Return (p.a.)",
    returnDesc: "Equity mutual funds historically average 11%–13% over long periods.",
    stepUpLabel: "Yearly SIP Step-Up (%)",
    stepUpDesc:
      "Start with a smaller, comfortable SIP today and increase it annually as income rises (0% = fixed).",
    yearsUnit: "Yrs",
    yrShort: "Yr",

    resultHeader: "2. Reverse-Calculated Action Plan",
    heroTitle: "Required Starting Monthly SIP",
    heroSubFixed: "Fixed monthly investment needed to reach your goal",
    heroSubStepUp: (pct, finalSip) =>
      `Starts here in Year 1 and steps up ${pct}%/yr (reaching ${finalSip}/mo in the final year)`,
    goalAchievedTitle: "Your Existing Savings Already Cover This Goal!",
    goalAchievedDesc: (fv) =>
      `Your existing lumpsum alone is projected to grow to ${fv} — no additional monthly SIP is required.`,

    existingGrowthLabel: "Existing Savings Will Grow To",
    existingGrowthSub: "Compounded value of your head-start",
    sipOutflowLabel: "Total New SIP Money Put In",
    sipOutflowSub: "Your out-of-pocket monthly contributions",
    profitShareLabel: "Total Wealth Gained (Profit)",
    profitShareSub: "Earned through compounding",

    takeawaySentence: (target, yrs, startSip, stepUp, totalOutflow, existing) =>
      existing > 0
        ? `With ${formatINRCompact(existing)} already invested today, you only need a monthly SIP of ${startSip}${stepUp > 0 ? ` (increasing ${stepUp}% yearly)` : ""} for ${yrs} years to reach your ${target} target.`
        : `To build a target fund of ${target} in ${yrs} years, start with a monthly SIP of ${startSip}${stepUp > 0 ? ` (increasing ${stepUp}% yearly)` : ""} — investing ${totalOutflow} from your pocket while compounding generates the rest.`,

    chartTitle: "Path to Your Target Corpus",
    chartSub: "See how your existing savings and monthly SIPs combine to cross the target line",
    legendTotal: "Total Projected Fund",
    legendInvested: "Total Money Put In",
    targetLineLabel: "Target Goal",
    viewChart: "Progress Chart",
    viewTable: "Year-by-Year Table",

    colYear: "Year",
    colSip: "Monthly SIP",
    colTotalIn: "Total Put In",
    colProfit: "Wealth Gained",
    colBalance: "Year-End Fund",
    colProgress: "Goal %",

    waGreeting: (name) => (name ? `Namaste *${name}*,` : `Namaste,`),
    waIntro: (targetStr) =>
      `Here is your personalized *Target Corpus Action Plan (${targetStr})* prepared by *Dalal Investments*:`,
    waGoalHeader: "1️⃣ *Goal Parameters*",
    waTarget: "Target Wealth Goal",
    waExisting: "Existing Savings Allocated",
    waDuration: "Time Horizon",
    waReturn: "Assumed Return Rate",
    waStepUp: "Yearly SIP Step-Up",
    waActionHeader: "2️⃣ *Required Investment Plan*",
    waReqSip: "Required Starting Monthly SIP",
    waFinalSip: "Final Year Monthly SIP",
    waTotalOutflow: "Total New SIP Outflow",
    waExistingGrowth: "Growth from Existing Savings",
    waProjectedFinal: "Projected Final Corpus",
    waTakeawayHeader: "💡 *Key Takeaway:*",
    waDisclaimer:
      "Disclaimer: Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Figures above are arithmetic illustrations for planning purposes.",
    pdfTitle: "Target Corpus Action Plan",
    pdfSubtitle: "Reverse-engineered SIP roadmap to achieve your financial milestone",
  },
  hi: {
    sectionTitle: "1. अपना लक्ष्य (Target Corpus) और शुरुआती बचत दर्ज करें",
    sectionSub:
      "तय करें कि आपको कुल कितना फंड चाहिए, आज कितनी बचत उपलब्ध है, और आपके पास कितने साल हैं।",
    targetLabel: "लक्ष्य राशि (Target Wealth Goal)",
    targetDesc: "अवधि पूरी होने पर आपको कुल कितना फंड चाहिए।",
    existingLabel: "आज उपलब्ध मौजूदा बचत (वैकल्पिक)",
    existingDesc:
      "कोई पुरानी म्यूचुअल फंड बचत या एकमुश्त राशि जो आप इस लक्ष्य के लिए रख रहे हैं।",
    yearsLabel: "लक्ष्य पूरा करने का समय",
    yearsDesc: "ज्यादा समय होने से मासिक SIP की राशि काफी कम हो जाती है।",
    returnLabel: "अनुमानित सालाना रिटर्न (%)",
    returnDesc: "लंबे समय में इक्विटी फंड औसतन 11%–13% रिटर्न देते हैं।",
    stepUpLabel: "सालाना SIP बढ़ोतरी (%)",
    stepUpDesc:
      "आज कम SIP से शुरुआत करें और आय बढ़ने के साथ हर साल थोड़ा बढ़ाएं (0% = समान)।",
    yearsUnit: "साल",
    yrShort: "वर्ष",

    resultHeader: "2. लक्ष्य प्राप्त करने की कार्ययोजना (Action Plan)",
    heroTitle: "आवश्यक शुरुआती मासिक SIP",
    heroSubFixed: "लक्ष्य तक पहुँचने के लिए हर महीने आवश्यक निश्चित निवेश",
    heroSubStepUp: (pct, finalSip) =>
      `पहले साल इस राशि से शुरू करें और हर साल ${pct}% बढ़ाएं (अंतिम वर्ष में ${finalSip}/माह)`,
    goalAchievedTitle: "आपकी मौजूदा बचत ही इस लक्ष्य के लिए पर्याप्त है!",
    goalAchievedDesc: (fv) =>
      `आपकी मौजूदा एकमुश्त राशि ही बढ़कर ${fv} हो जाएगी — किसी अतिरिक्त मासिक SIP की आवश्यकता नहीं है।`,

    existingGrowthLabel: "मौजूदा बचत की भविष्य की वैल्यू",
    existingGrowthSub: "आपकी शुरुआती बचत पर कंपाउंडिंग ग्रोथ",
    sipOutflowLabel: "कुल नया SIP निवेश",
    sipOutflowSub: "आपकी जेब से जमा होने वाली कुल राशि",
    profitShareLabel: "कुल अर्जित मुनाफा (लाभ)",
    profitShareSub: "कंपाउंडिंग से बना अतिरिक्त फंड",

    takeawaySentence: (target, yrs, startSip, stepUp, totalOutflow, existing) =>
      existing > 0
        ? `आज ${formatINRCompact(existing)} के शुरुआती निवेश के साथ, ${yrs} साल में ${target} का लक्ष्य पाने के लिए आपको केवल ${startSip}/माह की SIP${stepUp > 0 ? ` (हर साल ${stepUp}% बढ़ोतरी के साथ)` : ""} करनी होगी।`
        : `${yrs} साल में ${target} का लक्ष्य हासिल करने के लिए ${startSip}/माह की SIP${stepUp > 0 ? ` (हर साल ${stepUp}% बढ़ोतरी के साथ)` : ""} शुरू करें — जिसमें आप अपनी जेब से ${totalOutflow} जमा करेंगे और बाकी मुनाफा कंपाउंडिंग से बनेगा।`,

    chartTitle: "लक्ष्य तक पहुँचने का सफर",
    chartSub: "देखें कि आपकी बचत और SIP मिलकर कैसे लक्ष्य रेखा को पार करते हैं",
    legendTotal: "कुल अनुमानित फंड",
    legendInvested: "कुल जमा पूंजी",
    targetLineLabel: "लक्ष्य राशि",
    viewChart: "प्रोग्रेस चार्ट",
    viewTable: "वार्षिक तालिका",

    colYear: "साल",
    colSip: "मासिक SIP",
    colTotalIn: "कुल जमा",
    colProfit: "मुनाफा",
    colBalance: "वर्ष-अंत फंड",
    colProgress: "लक्ष्य %",

    waGreeting: (name) => (name ? `नमस्ते *${name}*,` : `नमस्ते,`),
    waIntro: (targetStr) =>
      `*Dalal Investments* की ओर से आपकी *लक्ष्य फंड कार्ययोजना (${targetStr})* नीचे प्रस्तुत है:`,
    waGoalHeader: "1️⃣ *लक्ष्य का विवरण*",
    waTarget: "लक्ष्य राशि (Target)",
    waExisting: "मौजूदा शुरुआती बचत",
    waDuration: "समय अवधि",
    waReturn: "अनुमानित सालाना रिटर्न",
    waStepUp: "सालाना SIP बढ़ोतरी",
    waActionHeader: "2️⃣ *आवश्यक निवेश योजना*",
    waReqSip: "आवश्यक शुरुआती मासिक SIP",
    waFinalSip: "अंतिम वर्ष की मासिक SIP",
    waTotalOutflow: "कुल नया SIP निवेश",
    waExistingGrowth: "मौजूदा बचत की ग्रोथ",
    waProjectedFinal: "अनुमानित अंतिम फंड",
    waTakeawayHeader: "💡 *मुख्य सारांश:*",
    waDisclaimer:
      "अस्वीकरण: म्यूचुअल फंड निवेश बाजार जोखिमों के अधीन हैं। यह गणना केवल योजना बनाने के उद्देश्य से है।",
    pdfTitle: "लक्ष्य फंड कार्ययोजना (Target Corpus Plan)",
    pdfSubtitle: "आपके वित्तीय लक्ष्य को प्राप्त करने के लिए रिवर्स-SIP रोडमैप",
  },
  gu: {
    sectionTitle: "1. તમારું લક્ષ્ય (Target Corpus) અને શરૂઆતની બચત દાખલ કરો",
    sectionSub:
      "નક્કી કરો કે તમારે કુલ કેટલું ફંડ જોઈએ છે, આજે કેટલી બચત ઉપલબ્ધ છે, અને તમારી પાસે કેટલા વર્ષ છે.",
    targetLabel: "લક્ષ્ય રકમ (Target Wealth Goal)",
    targetDesc: "સમયગાળો પૂરો થયે તમારે કુલ કેટલું ફંડ જોઈએ છે.",
    existingLabel: "આજે ઉપલબ્ધ હાલની બચત (વૈકલ્પિક)",
    existingDesc:
      "કોઈ જૂનું મ્યુચ્યુઅલ ફંડ રોકાણ અથવા એકસાથે રકમ જે તમે આ લક્ષ્ય માટે ફાળવો છો.",
    yearsLabel: "લક્ષ્ય પૂરું કરવાનો સમય",
    yearsDesc: "વધુ વર્ષ હોવાથી માસિક SIP ની રકમ ઘણી ઓછી થઈ જાય છે.",
    returnLabel: "અંદાજિત વાર્ષિક વળતર (%)",
    returnDesc: "લાંબા ગાળે ઇક્વિટી ફંડ સરેરાશ 11%–13% વળતર આપે છે.",
    stepUpLabel: "વાર્ષિક SIP વધારો (%)",
    stepUpDesc:
      "આજે ઓછી SIP થી શરૂઆત કરો અને આવક વધવાની સાથે દર વર્ષે થોડી વધારો (0% = એકસરખી).",
    yearsUnit: "વર્ષ",
    yrShort: "વર્ષ",

    resultHeader: "2. લક્ષ્ય હાંસલ કરવાની કાર્યયોજના (Action Plan)",
    heroTitle: "જરૂરી શરૂઆતની માસિક SIP",
    heroSubFixed: "લક્ષ્ય સુધી પહોંચવા માટે દર મહિને જરૂરી નિશ્ચિત રોકાણ",
    heroSubStepUp: (pct, finalSip) =>
      `પ્રથમ વર્ષે આ રકમથી શરૂ કરો અને દર વર્ષે ${pct}% વધારો (અંતિમ વર્ષમાં ${finalSip}/માસ)`,
    goalAchievedTitle: "તમારી હાલની બચત જ આ લક્ષ્ય માટે પૂરતી છે!",
    goalAchievedDesc: (fv) =>
      `તમારી હાલની એકસાથે રકમ જ વધીને ${fv} થઈ જશે — કોઈ વધારાની માસિક SIP ની જરૂર નથી.`,

    existingGrowthLabel: "હાલની બચતનું ભવિષ્યનું મૂલ્ય",
    existingGrowthSub: "તમારી શરૂઆતની બચત પર કમ્પાઉન્ડિંગ વૃદ્ધિ",
    sipOutflowLabel: "કુલ નવું SIP રોકાણ",
    sipOutflowSub: "તમારા ખિસ્સામાંથી જમા થનારી કુલ રકમ",
    profitShareLabel: "કુલ મળેલો નફો (વળતર)",
    profitShareSub: "કમ્પાઉન્ડિંગ દ્વારા બનેલું વધારાનું ફંડ",

    takeawaySentence: (target, yrs, startSip, stepUp, totalOutflow, existing) =>
      existing > 0
        ? `આજે ${formatINRCompact(existing)} ના શરૂઆતના રોકાણ સાથે, ${yrs} વર્ષમાં ${target} નું લક્ષ્ય મેળવવા માટે તમારે ફક્ત ${startSip}/માસ ની SIP${stepUp > 0 ? ` (દર વર્ષે ${stepUp}% વધારા સાથે)` : ""} કરવી પડશે.`
        : `${yrs} વર્ષમાં ${target} નું લક્ષ્ય હાંસલ કરવા માટે ${startSip}/માસ ની SIP${stepUp > 0 ? ` (દર વર્ષે ${stepUp}% વધારા સાથે)` : ""} શરૂ કરો — જેમાં તમે તમારા ખિસ્સામાંથી ${totalOutflow} રોકશો અને બાકીનો નફો કમ્પાઉન્ડિંગથી બનશે.`,

    chartTitle: "લક્ષ્ય સુધી પહોંચવાની સફર",
    chartSub: "જુઓ કે તમારી બચત અને SIP મળીને કેવી રીતે લક્ષ્ય રેખાને પાર કરે છે",
    legendTotal: "કુલ અંદાજિત ફંડ",
    legendInvested: "કુલ જમા મૂડી",
    targetLineLabel: "લક્ષ્ય રકમ",
    viewChart: "પ્રોગ્રેસ ચાર્ટ",
    viewTable: "વાર્ષિક કોષ્ટક",

    colYear: "વર્ષ",
    colSip: "માસિક SIP",
    colTotalIn: "કુલ જમા",
    colProfit: "નફો",
    colBalance: "વર્ષ-અંત ફંડ",
    colProgress: "લક્ષ્ય %",

    waGreeting: (name) => (name ? `નમસ્તે *${name}*,` : `નમસ્તે,`),
    waIntro: (targetStr) =>
      `*Dalal Investments* તરફથી તમારી *લક્ષ્ય ફંડ કાર્યયોજના (${targetStr})* નીચે મુજબ છે:`,
    waGoalHeader: "1️⃣ *લક્ષ્યની વિગતો*",
    waTarget: "લક્ષ્ય રકમ (Target)",
    waExisting: "હાલની શરૂઆતની બચત",
    waDuration: "સમયગાળો",
    waReturn: "અંદાજિત વાર્ષિક વળતર",
    waStepUp: "વાર્ષિક SIP વધારો",
    waActionHeader: "2️⃣ *જરૂરી રોકાણ યોજના*",
    waReqSip: "જરૂરી શરૂઆતની માસિક SIP",
    waFinalSip: "અંતિમ વર્ષની માસિક SIP",
    waTotalOutflow: "કુલ નવું SIP રોકાણ",
    waExistingGrowth: "હાલની બચતની વૃદ્ધિ",
    waProjectedFinal: "અંદાજિત અંતિમ ફંડ",
    waTakeawayHeader: "💡 *મુખ્ય સારાંશ:*",
    waDisclaimer:
      "સૂચના: મ્યુચ્યુઅલ ફંડ રોકાણો બજારના જોખમોને આધીન છે. આ ગણતરી માત્ર સમજૂતી માટે છે.",
    pdfTitle: "લક્ષ્ય ફંડ કાર્યયોજના (Target Corpus Plan)",
    pdfSubtitle: "તમારા નાણાકીય લક્ષ્યને હાંસલ કરવા માટે રિવર્સ-SIP રોડમેપ",
  },
};

const CustomTargetTooltip = ({ active, payload, t }) => {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/15 rounded-xl p-3.5 shadow-xl space-y-2 min-w-[225px] font-sans text-xs z-50">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-1.5">
        <span className="font-bold text-slate-900 dark:text-white">
          {t.yrShort} {row.year}
        </span>
        <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
          {row.progressPct}% {t.targetLineLabel}
        </span>
      </div>
      <div className="space-y-1.5 tabular-nums">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">{t.colSip}:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {formatINR(row.monthlySip)}/mo
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">{t.colTotalIn}:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {formatINRCompact(row.totalPrincipalIn)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-emerald-600 dark:text-emerald-400">{t.colProfit}:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            +{formatINRCompact(row.wealthGained)}
          </span>
        </div>
        <div className="flex justify-between gap-4 pt-1.5 border-t border-slate-100 dark:border-white/10">
          <span className="font-bold text-slate-900 dark:text-white">{t.colBalance}:</span>
          <span className="font-extrabold text-slate-900 dark:text-white">
            {formatINRCompact(row.endBalance)}
          </span>
        </div>
      </div>
    </div>
  );
};

const TargetCorpusCalculator = ({ clientName, lang = "en", onSummaryChange }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [targetCorpus, setTargetCorpus] = useState(10000000); // ₹1 Cr default
  const [existingSavings, setExistingSavings] = useState(0);
  const [years, setYears] = useState(15);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [stepUpPct, setStepUpPct] = useState(0);

  const [activeView, setActiveView] = useState("chart");

  const result = useMemo(() => {
    const goal = Math.max(100000, Number(targetCorpus) || 10000000);
    const existing = Math.max(0, Number(existingSavings) || 0);
    const yrs = Math.max(1, Number(years) || 15);
    const rate = Number(annualReturn) || 12;
    const step = Number(stepUpPct) || 0;

    const futureValueOfExisting = existing * Math.pow(1 + rate / 100, yrs);
    const remainingTarget = Math.max(0, goal - futureValueOfExisting);

    let requiredMonthlySip = 0;

    if (remainingTarget > 0) {
      let low = 0;
      let high = remainingTarget;
      for (let i = 0; i < 65; i++) {
        const mid = (low + high) / 2;
        const sim = calculateStepUpSip({
          monthlySip: mid,
          annualReturnPct: rate,
          years: yrs,
          stepUpPct: step,
        });
        if (sim.futureValue < remainingTarget) {
          low = mid;
        } else {
          high = mid;
        }
      }
      requiredMonthlySip = Math.ceil(high / 100) * 100; // Clean ₹100 rounding
    }

    // Build unified year-by-year schedule combining existing savings + required SIP
    const monthlyRate = rate / 100 / 12;
    let corpus = existing;
    let totalSipInvested = 0;
    let currentSip = requiredMonthlySip;
    const yearlySchedule = [];

    for (let yr = 1; yr <= yrs; yr++) {
      for (let m = 1; m <= 12; m++) {
        totalSipInvested += currentSip;
        corpus = (corpus + currentSip) * (1 + monthlyRate);
      }

      const totalPrincipalIn = existing + totalSipInvested;
      yearlySchedule.push({
        year: yr,
        monthlySip: Math.round(currentSip),
        totalSipInvested: Math.round(totalSipInvested),
        totalPrincipalIn: Math.round(totalPrincipalIn),
        wealthGained: Math.round(Math.max(0, corpus - totalPrincipalIn)),
        endBalance: Math.round(corpus),
        progressPct: Math.min(100, Math.round((corpus / goal) * 100)),
      });

      currentSip = currentSip * (1 + step / 100);
    }

    const finalMonthlySip =
      requiredMonthlySip > 0
        ? Math.round(requiredMonthlySip * Math.pow(1 + step / 100, Math.max(0, yrs - 1)))
        : 0;

    const totalPrincipalIn = existing + totalSipInvested;

    return {
      goal,
      existing,
      requiredMonthlySip,
      finalMonthlySip,
      futureValueOfExisting: Math.round(futureValueOfExisting),
      totalSipInvested: Math.round(totalSipInvested),
      totalPrincipalIn: Math.round(totalPrincipalIn),
      projectedFinalCorpus: Math.round(corpus),
      totalWealthGained: Math.round(Math.max(0, corpus - totalPrincipalIn)),
      yearlySchedule,
    };
  }, [targetCorpus, existingSavings, years, annualReturn, stepUpPct]);

  const existingSharePct =
    result.projectedFinalCorpus > 0
      ? Math.min(
          100,
          Math.round((result.futureValueOfExisting / result.projectedFinalCorpus) * 100)
        )
      : 0;
  const sipPrincipalPct =
    result.projectedFinalCorpus > 0
      ? Math.min(
          100 - existingSharePct,
          Math.round((result.totalSipInvested / result.projectedFinalCorpus) * 100)
        )
      : 0;
  const sipProfitPct = Math.max(0, 100 - existingSharePct - sipPrincipalPct);

  useEffect(() => {
    const targetCompact = formatINRCompact(result.goal);
    const takeaway = t.takeawaySentence(
      targetCompact,
      years,
      formatINR(result.requiredMonthlySip),
      stepUpPct,
      formatINRCompact(result.totalSipInvested),
      result.existing
    );

    const stepUpLine =
      stepUpPct > 0 && result.requiredMonthlySip > 0
        ? `• ${t.waStepUp}: *${stepUpPct}%* (${t.waFinalSip}: ${formatINR(result.finalMonthlySip)}/mo)\n`
        : "";

    const existingLine =
      result.existing > 0
        ? `• ${t.waExisting}: *${formatINRCompact(result.existing)}* (Grows to *${formatINRCompact(result.futureValueOfExisting)}*)\n`
        : "";

    const text =
      `${t.waGreeting(clientName?.trim())}\n\n` +
      `${t.waIntro(targetCompact)}\n\n` +
      `${t.waGoalHeader}\n` +
      `• ${t.waTarget}: *${targetCompact}* (${formatINR(result.goal)})\n` +
      existingLine +
      `• ${t.waDuration}: *${years} ${t.yearsUnit}*\n` +
      `• ${t.waReturn}: *${annualReturn}% p.a.*\n\n` +
      `${t.waActionHeader}\n` +
      `• *${t.waReqSip}: ${formatINR(result.requiredMonthlySip)}/month*\n` +
      stepUpLine +
      `• ${t.waTotalOutflow}: *${formatINRCompact(result.totalSipInvested)}*\n` +
      `• ${t.waProjectedFinal}: *${formatINRCompact(result.projectedFinalCorpus)}*\n\n` +
      `${t.waTakeawayHeader}\n${takeaway}\n\n` +
      `_${t.waDisclaimer}_\n` +
      `— *Dalal Investments | Private Wealth Desk*`;

    const milestoneStep = years <= 5 ? 1 : years <= 15 ? 3 : 5;
    const milestones = result.yearlySchedule
      .filter((r) => r.year === 1 || r.year % milestoneStep === 0 || r.year === years)
      .map((r) => ({
        year: r.year,
        sip: `${formatINR(r.monthlySip)}/mo`,
        invested: formatINRCompact(r.totalPrincipalIn),
        profit: `+${formatINRCompact(r.wealthGained)}`,
        total: `${formatINRCompact(r.endBalance)} (${r.progressPct}%)`,
      }));

    onSummaryChange({
      title: `${t.pdfTitle} (${targetCompact})`,
      subtitle: t.pdfSubtitle,
      takeaway,
      whatsappText: text,
      assumptions: [
        { label: t.waTarget, value: targetCompact },
        { label: t.waExisting, value: result.existing > 0 ? formatINRCompact(result.existing) : "₹0" },
        { label: t.waDuration, value: `${years} ${t.yearsUnit}` },
        { label: t.waReturn, value: `${annualReturn}% (${stepUpPct}% Step-Up)` },
      ],
      highlights: [
        ...(result.existing > 0
          ? [
              {
                label: t.existingGrowthLabel,
                sub: `From ${formatINRCompact(result.existing)} allocated today`,
                value: formatINRCompact(result.futureValueOfExisting),
              },
            ]
          : []),
        {
          label: t.sipOutflowLabel,
          sub: `Total monthly SIP contributions over ${years} ${t.yearsUnit}`,
          value: formatINRCompact(result.totalSipInvested),
        },
        {
          label: t.profitShareLabel,
          sub: "Total wealth created via compounding",
          value: `+${formatINRCompact(result.totalWealthGained)}`,
        },
        {
          label: t.waProjectedFinal,
          sub: `Achieves 100% of your ${targetCompact} target goal`,
          value: formatINRCompact(result.projectedFinalCorpus),
        },
        {
          label: t.waReqSip,
          sub:
            stepUpPct > 0
              ? `Starting Year 1 SIP (grows ${stepUpPct}%/yr to ${formatINR(result.finalMonthlySip)}/mo)`
              : `Fixed monthly SIP required for ${years} ${t.yearsUnit}`,
          value: `${formatINR(result.requiredMonthlySip)} / month`,
          isHero: true,
        },
      ],
      milestones,
      disclaimer: t.waDisclaimer,
    });
  }, [clientName, years, annualReturn, stepUpPct, result, t, onSummaryChange]);

  return (
    <div className="space-y-8 w-full font-sans">
      
      {/* ================================================================= */}
      {/* TOP SECTION: TARGET GOAL & HEAD-START FORM                        */}
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

        {/* Row 1: Target Corpus & Existing Savings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <TactileSliderInput
            label={t.targetLabel}
            description={t.targetDesc}
            value={targetCorpus}
            onChange={setTargetCorpus}
            min={500000}
            max={250000000}
            sliderMax={100000000}
            step={500000}
            prefix="₹"
            presets={[
              { label: "₹50 L", value: 5000000 },
              { label: "₹1 Cr", value: 10000000 },
              { label: "₹2 Cr", value: 20000000 },
              { label: "₹5 Cr", value: 50000000 },
              { label: "₹10 Cr", value: 100000000 },
            ]}
          />

          <TactileSliderInput
            label={t.existingLabel}
            description={t.existingDesc}
            value={existingSavings}
            onChange={setExistingSavings}
            min={0}
            max={50000000}
            sliderMax={10000000}
            step={50000}
            prefix="₹"
            accent="indigo"
            presets={[
              { label: "₹0 (Fresh)", value: 0 },
              { label: "₹2 L", value: 200000 },
              { label: "₹5 L", value: 500000 },
              { label: "₹15 L", value: 1500000 },
              { label: "₹25 L", value: 2500000 },
            ]}
          />
        </div>

        {/* Row 2: Years, Expected Return, Annual Step-Up */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <TactileSliderInput
            label={t.yearsLabel}
            description={t.yearsDesc}
            value={years}
            onChange={setYears}
            min={1}
            max={35}
            step={1}
            suffix={t.yearsUnit}
            accent="indigo"
            presets={[
              { label: `7 ${t.yearsUnit}`, value: 7 },
              { label: `10 ${t.yearsUnit}`, value: 10 },
              { label: `15 ${t.yearsUnit}`, value: 15 },
              { label: `20 ${t.yearsUnit}`, value: 20 },
            ]}
          />

          <TactileSliderInput
            label={t.returnLabel}
            description={t.returnDesc}
            value={annualReturn}
            onChange={setAnnualReturn}
            min={6}
            max={20}
            step={0.5}
            suffix="%"
            presets={[
              { label: "10%", value: 10 },
              { label: "12%", value: 12 },
              { label: "14%", value: 14 },
            ]}
          />

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
              { label: "0% (Fixed)", value: 0 },
              { label: "5% / yr", value: 5 },
              { label: "10% / yr", value: 10 },
            ]}
          />
        </div>
      </section>

      {/* ================================================================= */}
      {/* BOTTOM SECTION: REVERSE-CALCULATED ACTION PLAN & VISUALS          */}
      {/* ================================================================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t.resultHeader}
          </h3>
        </div>

        {/* High-Contrast Hero Action Banner */}
        <div className="rounded-2xl bg-slate-900 dark:bg-[#0F172A] border border-slate-800 dark:border-emerald-500/30 text-white p-6 shadow-md space-y-5">
          {result.requiredMonthlySip === 0 ? (
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg sm:text-xl font-black text-emerald-300">
                  {t.goalAchievedTitle}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {t.goalAchievedDesc(formatINRCompact(result.futureValueOfExisting))}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                  <Target size={13} />
                  <span>
                    {t.heroTitle} • {formatINRCompact(result.goal)} in {years} {t.yearsUnit}
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap items-baseline gap-2.5">
                  <span className="text-3xl sm:text-5xl font-black tracking-tight text-white tabular-nums">
                    {formatINR(result.requiredMonthlySip)}
                  </span>
                  <span className="text-sm font-bold text-emerald-300">/ month</span>
                </div>

                <p className="mt-2 text-xs text-slate-300">
                  {stepUpPct > 0
                    ? t.heroSubStepUp(stepUpPct, formatINR(result.finalMonthlySip))
                    : t.heroSubFixed}
                </p>
              </div>

              {/* 3-Card Contribution Breakdown inside Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
                {result.existing > 0 && (
                  <div className="bg-slate-800/90 border border-indigo-500/30 rounded-xl px-4 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                      {t.existingGrowthLabel}
                    </span>
                    <span className="text-lg font-black text-white tabular-nums mt-0.5 block">
                      {formatINRCompact(result.futureValueOfExisting)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {existingSharePct}% of goal
                    </span>
                  </div>
                )}

                <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                    {t.sipOutflowLabel}
                  </span>
                  <span className="text-lg font-black text-white tabular-nums mt-0.5 block">
                    {formatINRCompact(result.totalSipInvested)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {sipPrincipalPct}% of goal
                  </span>
                </div>

                <div className="bg-slate-800/90 border border-emerald-500/30 rounded-xl px-4 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                    {t.profitShareLabel}
                  </span>
                  <span className="text-lg font-black text-emerald-400 tabular-nums mt-0.5 block">
                    +{formatINRCompact(result.totalWealthGained)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {sipProfitPct}% compounding
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Stacked Funding Composition Bar */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex p-0.5 gap-0.5">
              {existingSharePct > 0 && (
                <div
                  style={{ width: `${existingSharePct}%` }}
                  className="h-full rounded-l-full bg-purple-400 transition-all duration-300"
                />
              )}
              <div
                style={{ width: `${sipPrincipalPct}%` }}
                className={`h-full bg-indigo-400 transition-all duration-300 ${
                  existingSharePct === 0 ? "rounded-l-full" : ""
                }`}
              />
              <div
                style={{ width: `${sipProfitPct}%` }}
                className="h-full rounded-r-full bg-emerald-400 transition-all duration-300"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              {existingSharePct > 0 && (
                <span className="inline-flex items-center gap-1.5 text-slate-200 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  {t.existingGrowthLabel}:{" "}
                  <strong className="text-purple-300">
                    {formatINRCompact(result.futureValueOfExisting)}
                  </strong>{" "}
                  ({existingSharePct}%)
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-slate-200 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                {t.sipOutflowLabel}:{" "}
                <strong className="text-white">
                  {formatINRCompact(result.totalSipInvested)}
                </strong>{" "}
                ({sipPrincipalPct}%)
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-200 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                {t.profitShareLabel}:{" "}
                <strong className="text-emerald-400">
                  +{formatINRCompact(result.totalWealthGained)}
                </strong>{" "}
                ({sipProfitPct}%)
              </span>
            </div>
          </div>
        </div>

        {/* Plain-Language Summary Callout */}
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          <Sparkles size={17} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">
            {t.takeawaySentence(
              formatINRCompact(result.goal),
              years,
              formatINR(result.requiredMonthlySip),
              stepUpPct,
              formatINRCompact(result.totalSipInvested),
              result.existing
            )}
          </p>
        </div>

        {/* Full-Width Progress Chart & Year-by-Year Table */}
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
                  {t.legendTotal}
                </span>
                <span className="inline-flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  {t.legendInvested}
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                  <span className="w-2.5 h-0.5 bg-amber-500" />
                  {t.targetLineLabel} ({formatINRCompact(result.goal)})
                </span>
              </div>

              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart
                    data={result.yearlySchedule}
                    margin={{ top: 14, right: 16, left: 4, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="targetTotalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.32} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="targetPrinGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
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
                    <Tooltip content={<CustomTargetTooltip t={t} />} />
                    <ReferenceLine
                      y={result.goal}
                      stroke="#f59e0b"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="endBalance"
                      name={t.legendTotal}
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#targetTotalGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="totalPrincipalIn"
                      name={t.legendInvested}
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#targetPrinGrad)"
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
                    <th className="py-3 px-4">{t.colSip}</th>
                    <th className="py-3 px-4">{t.colTotalIn}</th>
                    <th className="py-3 px-4">{t.colProfit}</th>
                    <th className="py-3 px-4">{t.colProgress}</th>
                    <th className="py-3 px-4 text-right">{t.colBalance}</th>
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
                        {formatINR(row.monthlySip)}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                        {formatINRCompact(row.totalPrincipalIn)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        +{formatINRCompact(row.wealthGained)}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {row.progressPct}%
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                        {formatINRCompact(row.endBalance)}
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

export default TargetCorpusCalculator;