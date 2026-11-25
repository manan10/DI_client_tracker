import React, { useState, useMemo, useEffect } from "react";
import {
  Compass,
  GraduationCap,
  Heart,
  Home,
  Car,
  Plane,
  Umbrella,
  Sparkles,
  CheckCircle2,
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
import { COMMON_TRANSLATIONS, ScheduleViewerCard } from "./CalculatorShared";

const GOAL_PRESETS = [
  {
    id: "retirement",
    icon: Umbrella,
    defaultCost: 15000000,
    defaultYears: 20,
    defaultInflation: 7,
    defaultReturn: 12,
    names: { en: "Retirement Fund", hi: "रिटायरमेंट फंड", gu: "નિવૃત્તિ ફંડ" },
  },
  {
    id: "education",
    icon: GraduationCap,
    defaultCost: 2500000,
    defaultYears: 15,
    defaultInflation: 10,
    defaultReturn: 12,
    names: { en: "Child Education", hi: "बच्चों की उच्च शिक्षा", gu: "બાળકોનું ઉચ્ચ શિક્ષણ" },
  },
  {
    id: "marriage",
    icon: Heart,
    defaultCost: 3000000,
    defaultYears: 18,
    defaultInflation: 8,
    defaultReturn: 12,
    names: { en: "Child Marriage", hi: "बच्चों की शादी", gu: "બાળકોના લગ્ન" },
  },
  {
    id: "home",
    icon: Home,
    defaultCost: 5000000,
    defaultYears: 7,
    defaultInflation: 7,
    defaultReturn: 11,
    names: { en: "Dream Home", hi: "सपनों का घर", gu: "સપનાનું ઘર" },
  },
  {
    id: "car",
    icon: Car,
    defaultCost: 1500000,
    defaultYears: 5,
    defaultInflation: 6,
    defaultReturn: 10,
    names: { en: "Car Purchase", hi: "नई कार खरीदना", gu: "નવી કાર ખરીદવી" },
  },
  {
    id: "vacation",
    icon: Plane,
    defaultCost: 500000,
    defaultYears: 3,
    defaultInflation: 7,
    defaultReturn: 9.5,
    names: { en: "Family Vacation", hi: "फैमिली वेकेशन", gu: "ફેમિલી વેકેશન" },
  },
];

const TRANSLATIONS = {
  en: {
    ...COMMON_TRANSLATIONS.en,
    chooseGoalLabel: "Select Life Goal Category",
    sectionTitle: "1. Enter Your Goal & Inflation Details",
    sectionSub:
      "Enter what this goal costs in today's prices—we automatically adjust for future inflation.",
    todayCostLabel: "Goal Cost in Today's Prices",
    todayCostDesc: "What this goal would cost if you had to pay for it today.",
    yearsLabel: "Years Until Goal",
    yearsDesc: "How many years from now you will need this fund.",
    inflationLabel: "Expected Yearly Inflation (%)",
    inflationDesc: "Education typically inflates at ~10%, general lifestyle at ~6%–7%.",
    existingLabel: "Existing Savings Allocated (Optional)",
    existingDesc: "Any current investment already earmarked for this specific goal.",
    returnLabel: "Expected Portfolio Return (p.a.)",
    returnDesc: "Assumed annual return on your goal-linked mutual fund portfolio.",
    stepUpLabel: "Yearly SIP Step-Up (%)",
    stepUpDesc: "Increase monthly SIP annually as income grows (0% = fixed).",
    resultHeader: "2. Inflation-Adjusted Goal Action Plan",
    heroTitle: "Required Starting Monthly SIP",
    heroSubFixed: "Fixed monthly SIP required to fully fund your future goal",
    goalCoveredTitle: "Your Existing Savings Already Fund This Goal!",
    goalCoveredDesc: (fv) =>
      `Your allocated savings will grow to ${fv}, covering the inflation-adjusted future cost with zero extra SIP needed.`,
    todayCostCard: "Today's Cost",
    futureCostCard: "Future Cost",
    futureCostSub: (inf, yrs) => `At ${inf}% inflation over ${yrs} yrs`,
    inflationImpactCard: "Inflation Impact",
    existingGrowthCard: "Existing Savings Growth",
    takeawaySentence: (goalName, todayCost, yrs, inf, futureCost, reqSip, stepUp) =>
      `Your ${goalName} goal costing ${todayCost} today will grow to ${futureCost} in ${yrs} years (at ${inf}% inflation). Starting a monthly SIP of ${reqSip}${stepUp > 0 ? ` with a ${stepUp}% annual step-up` : ""} puts you on track to achieve 100% of this milestone.`,
    chartTitle: "Goal Funding Progress Over Time",
    chartSub: "See how your SIP & savings compound to meet the inflation-adjusted target",
    legendFund: "Projected Goal Fund",
    legendInvested: "Total Money Put In",
    targetMarker: "Future Goal Cost",
    viewChart: "Progress Chart",
    colSip: "Monthly SIP",
    colInvested: "Total Put In",
    colProfit: "Wealth Gained",
    colBalance: "Year-End Fund",
    colPct: "Goal %",
    waIntro: (goalName) =>
      `Here is your personalized *${goalName} Financial Plan* prepared by *Dalal Investments*:`,
    waGoalHeader: "1️⃣ *Goal & Inflation Reality Check*",
    waTodayCost: "Cost in Today's Prices",
    waHorizon: "Time Horizon",
    waInflation: "Assumed Inflation Rate",
    waFutureCost: "Inflation-Adjusted Target Cost",
    waExisting: "Existing Savings Allocated",
    waActionHeader: "2️⃣ *Required SIP Action Plan*",
    waReturn: "Assumed Portfolio Return",
    waReqSip: "Required Starting Monthly SIP",
    waStepUp: "Yearly SIP Step-Up",
    waTotalOutflow: "Total New SIP Outflow",
    pdfTitle: (goalName) => `${goalName} — Goal Financial Plan`,
    pdfSubtitle: "Inflation-adjusted future cost projection & systematic SIP roadmap",
  },
  hi: {
    ...COMMON_TRANSLATIONS.hi,
    chooseGoalLabel: "जीवन का लक्ष्य चुनें (Life Goal)",
    sectionTitle: "1. अपने लक्ष्य और महंगाई का विवरण दर्ज करें",
    sectionSub:
      "आज की कीमत के अनुसार लक्ष्य की लागत दर्ज करें—हम भविष्य की महंगाई अपने आप जोड़ देंगे।",
    todayCostLabel: "आज के हिसाब से लक्ष्य की लागत",
    todayCostDesc: "यदि आपको आज यह लक्ष्य पूरा करना हो तो कितना खर्च आएगा।",
    yearsLabel: "लक्ष्य तक कुल समय (साल)",
    yearsDesc: "अब से कितने साल बाद आपको इस फंड की जरूरत होगी।",
    inflationLabel: "अनुमानित सालाना महंगाई (%)",
    inflationDesc: "उच्च शिक्षा की महंगाई ~10% और सामान्य खर्च ~6%–7% की दर से बढ़ते हैं।",
    existingLabel: "आज उपलब्ध मौजूदा बचत (वैकल्पिक)",
    existingDesc: "इस लक्ष्य के लिए पहले से रखी गई कोई बचत या एकमुश्त निवेश।",
    returnLabel: "अनुमानित सालाना रिटर्न (%)",
    returnDesc: "आपके लक्ष्य-आधारित म्यूचुअल फंड पोर्टफोलियो का अनुमानित रिटर्न।",
    stepUpLabel: "सालाना SIP बढ़ोतरी (%)",
    stepUpDesc: "आय बढ़ने के साथ हर साल मासिक SIP बढ़ाएं (0% = समान)।",
    resultHeader: "2. महंगाई-समायोजित लक्ष्य कार्ययोजना",
    heroTitle: "आवश्यक शुरुआती मासिक SIP",
    heroSubFixed: "भविष्य के लक्ष्य को पूरा करने के लिए आवश्यक निश्चित मासिक SIP",
    goalCoveredTitle: "आपकी मौजूदा बचत ही इस लक्ष्य के लिए पर्याप्त है!",
    goalCoveredDesc: (fv) =>
      `आपकी मौजूदा बचत बढ़कर ${fv} हो जाएगी, जिससे बिना किसी अतिरिक्त SIP के लक्ष्य पूरा हो जाएगा।`,
    todayCostCard: "आज की लागत",
    futureCostCard: "भविष्य की लागत",
    futureCostSub: (inf, yrs) => `${yrs} साल में ${inf}% महंगाई के अनुसार`,
    inflationImpactCard: "महंगाई का असर",
    existingGrowthCard: "मौजूदा बचत की ग्रोथ",
    takeawaySentence: (goalName, todayCost, yrs, inf, futureCost, reqSip, stepUp) =>
      `आज ${todayCost} की लागत वाला आपका '${goalName}' लक्ष्य ${yrs} साल बाद (${inf}% महंगाई के साथ) ${futureCost} का हो जाएगा। इसके लिए आज ${reqSip}/माह की SIP${stepUp > 0 ? ` (${stepUp}% सालाना बढ़ोतरी के साथ)` : ""} शुरू करना आपको 100% तैयार रखेगा।`,
    chartTitle: "लक्ष्य फंड निर्माण का ग्राफ",
    chartSub: "देखें कि आपकी SIP और बचत मिलकर कैसे महंगाई-समायोजित लक्ष्य तक पहुँचते हैं",
    legendFund: "अनुमानित लक्ष्य फंड",
    legendInvested: "आपका कुल निवेश",
    targetMarker: "भविष्य की कुल लागत",
    viewChart: "प्रोग्रेस चार्ट",
    colSip: "मासिक SIP",
    colInvested: "कुल जमा",
    colProfit: "मुनाफा",
    colBalance: "वर्ष-अंत फंड",
    colPct: "लक्ष्य %",
    waIntro: (goalName) =>
      `*Dalal Investments* की ओर से आपकी *${goalName} वित्तीय योजना* नीचे प्रस्तुत है:`,
    waGoalHeader: "1️⃣ *लक्ष्य और महंगाई का आकलन*",
    waTodayCost: "आज की कीमत में लागत",
    waHorizon: "समय अवधि",
    waInflation: "अनुमानित महंगाई दर",
    waFutureCost: "महंगाई के बाद भविष्य की लागत",
    waExisting: "मौजूदा शुरुआती बचत",
    waActionHeader: "2️⃣ *आवश्यक SIP कार्ययोजना*",
    waReturn: "अनुमानित पोर्टफोलियो रिटर्न",
    waReqSip: "आवश्यक शुरुआती मासिक SIP",
    waStepUp: "सालाना SIP बढ़ोतरी",
    waTotalOutflow: "कुल नया SIP निवेश",
    pdfTitle: (goalName) => `${goalName} — लक्ष्य वित्तीय योजना`,
    pdfSubtitle: "महंगाई-समायोजित भविष्य की लागत और नियमित SIP रोडमैप",
  },
  gu: {
    ...COMMON_TRANSLATIONS.gu,
    chooseGoalLabel: "જીવનનું લક્ષ્ય પસંદ કરો (Life Goal)",
    sectionTitle: "1. તમારા લક્ષ્ય અને મોંઘવારીની વિગતો દાખલ કરો",
    sectionSub:
      "આજના ભાવ મુજબ લક્ષ્યનો ખર્ચ લખો—અમે ભવિષ્યની મોંઘવારી આપમેળે ગણી લઈશું.",
    todayCostLabel: "આજના ભાવ મુજબ લક્ષ્યનો ખર્ચ",
    todayCostDesc: "જો તમારે આજે આ લક્ષ્ય પૂરું કરવું હોય તો કેટલો ખર્ચ થાય.",
    yearsLabel: "લક્ષ્ય સુધીનો સમય (વર્ષ)",
    yearsDesc: "હવેથી કેટલા વર્ષ પછી તમારે આ ફંડની જરૂર પડશે.",
    inflationLabel: "અંદાજિત વાર્ષિક મોંઘવારી (%)",
    inflationDesc: "ઉચ્ચ શિક્ષણની મોંઘવારી ~10% અને સામાન્ય ખર્ચ ~6%–7% ના દરે વધે છે.",
    existingLabel: "આજે ઉપલબ્ધ હાલની બચત (વૈકલ્પિક)",
    existingDesc: "આ લક્ષ્ય માટે પહેલેથી ફાળવેલી કોઈ બચત અથવા એકસાથે રોકાણ.",
    returnLabel: "અંદાજિત વાર્ષિક વળતર (%)",
    returnDesc: "તમારા લક્ષ્ય-આધારિત મ્યુચ્યુઅલ ફંડ પોર્ટફોલિયોનું અંદાજિત વળતર.",
    stepUpLabel: "વાર્ષિક SIP વધારો (%)",
    stepUpDesc: "આવક વધવાની સાથે દર વર્ષે માસિક SIP વધારો (0% = એકસરખી).",
    resultHeader: "2. મોંઘવારી-સમાયોજિત લક્ષ્ય કાર્યયોજના",
    heroTitle: "જરૂરી શરૂઆતની માસિક SIP",
    heroSubFixed: "ભવિષ્યના લક્ષ્યને પૂરું કરવા માટે જરૂરી નિશ્ચિત માસિક SIP",
    goalCoveredTitle: "તમારી હાલની બચત જ આ લક્ષ્ય માટે પૂરતી છે!",
    goalCoveredDesc: (fv) =>
      `તમારી હાલની બચત વધીને ${fv} થઈ જશે, જેથી કોઈ વધારાની SIP વગર લક્ષ્ય પૂરું થઈ જશે.`,
    todayCostCard: "આજનો ખર્ચ",
    futureCostCard: "ભવિષ્યનો ખર્ચ",
    futureCostSub: (inf, yrs) => `${yrs} વર્ષમાં ${inf}% મોંઘવારી મુજબ`,
    inflationImpactCard: "મોંઘવારીની અસર",
    existingGrowthCard: "હાલની બચતની વૃદ્ધિ",
    takeawaySentence: (goalName, todayCost, yrs, inf, futureCost, reqSip, stepUp) =>
      `આજે ${todayCost} ની કિંમત ધરાવતું તમારું '${goalName}' લક્ષ્ય ${yrs} વર્ષ પછી (${inf}% મોંઘવારી સાથે) ${futureCost} નું થઈ જશે. આ માટે આજે ${reqSip}/માસ ની SIP${stepUp > 0 ? ` (${stepUp}% વાર્ષિક વધારા સાથે)` : ""} શરૂ કરવી તમને 100% તૈયાર રાખશે.`,
    chartTitle: "લક્ષ્ય ફંડ નિર્માણનો ગ્રાફ",
    chartSub: "જુઓ કે તમારી SIP અને બચત મળીને કેવી રીતે મોંઘવારી-સમાયોજિત લક્ષ્ય સુધી પહોંચે છે",
    legendFund: "અંદાજિત લક્ષ્ય ફંડ",
    legendInvested: "તમારું કુલ રોકાણ",
    targetMarker: "ભવિષ્યનો કુલ ખર્ચ",
    viewChart: "પ્રોગ્રેસ ચાર્ટ",
    colSip: "માસિક SIP",
    colInvested: "કુલ રોકાણ",
    colProfit: "નફો",
    colBalance: "વર્ષ-અંત ફંડ",
    colPct: "લક્ષ્ય %",
    waIntro: (goalName) =>
      `*Dalal Investments* તરફથી તમારી *${goalName} નાણાકીય યોજના* નીચે મુજબ છે:`,
    waGoalHeader: "1️⃣ *લક્ષ્ય અને મોંઘવારીનું આકલન*",
    waTodayCost: "આજના ભાવ મુજબ ખર્ચ",
    waHorizon: "સમયગાળો",
    waInflation: "અંદાજિત મોંઘવારી દર",
    waFutureCost: "મોંઘવારી પછી ભવિષ્યનો ખર્ચ",
    waExisting: "હાલની શરૂઆતની બચત",
    waActionHeader: "2️⃣ *જરૂરી SIP કાર્યયોજના*",
    waReturn: "અંદાજિત પોર્ટફોલિયો વળતર",
    waReqSip: "જરૂરી શરૂઆતની માસિક SIP",
    waStepUp: "વાર્ષિક SIP વધારો",
    waTotalOutflow: "કુલ નવું SIP રોકાણ",
    pdfTitle: (goalName) => `${goalName} — લક્ષ્ય નાણાકીય યોજના`,
    pdfSubtitle: "મોંઘવારી-સમાયોજિત ભવિષ્યનો ખર્ચ અને નિયમિત SIP રોડમેપ",
  },
};

const CustomGoalTooltip = ({ active, payload, t }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-white/15 rounded-xl p-3 shadow-xl space-y-1.5 min-w-[210px] sm:min-w-[225px] font-sans text-xs z-50">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/15 pb-1.5">
        <span className="font-bold text-slate-900 dark:text-white">
          {t.yrShort} {row.year}
        </span>
        <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
          {row.progressPct}% {t.targetMarker}
        </span>
      </div>
      <div className="space-y-1.5 tabular-nums">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500 dark:text-slate-400">{t.colSip}:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {formatINR(row.monthlySip)}/mo
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500 dark:text-slate-400">{t.colInvested}:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {formatINRCompact(row.totalPrincipalIn)}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-emerald-600 dark:text-emerald-400">{t.colProfit}:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            +{formatINRCompact(row.wealthGained)}
          </span>
        </div>
        <div className="flex justify-between gap-3 pt-1.5 border-t border-slate-200 dark:border-white/15">
          <span className="font-bold text-slate-900 dark:text-white">{t.colBalance}:</span>
          <span className="font-extrabold text-slate-900 dark:text-white">
            {formatINRCompact(row.endBalance)}
          </span>
        </div>
      </div>
    </div>
  );
};

const GoalPlannerCalculator = ({ clientName, lang = "en", onSummaryChange }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [selectedGoalId, setSelectedGoalId] = useState("education");
  const [todayCost, setTodayCost] = useState(2500000);
  const [years, setYears] = useState(15);
  const [inflationRate, setInflationRate] = useState(10);
  const [existingSavings, setExistingSavings] = useState(0);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [stepUpPct, setStepUpPct] = useState(5);

  const activeGoalObj =
    GOAL_PRESETS.find((g) => g.id === selectedGoalId) || GOAL_PRESETS[0];
  const localizedGoalName = activeGoalObj.names[lang] || activeGoalObj.names.en;

  const handleSelectGoalPreset = (preset) => {
    setSelectedGoalId(preset.id);
    setTodayCost(preset.defaultCost);
    setYears(preset.defaultYears);
    setInflationRate(preset.defaultInflation);
    setAnnualReturn(preset.defaultReturn);
  };

  const result = useMemo(() => {
    const baseCost = Math.max(50000, Number(todayCost) || 500000);
    const yrs = Math.max(1, Number(years) || 10);
    const inf = Math.max(0, Number(inflationRate) || 0);
    const existing = Math.max(0, Number(existingSavings) || 0);
    const rate = Number(annualReturn) || 12;
    const step = Number(stepUpPct) || 0;

    const futureGoalCost = Math.round(baseCost * Math.pow(1 + inf / 100, yrs));
    const inflationAddedCost = Math.max(0, futureGoalCost - baseCost);

    const futureValueOfExisting = existing * Math.pow(1 + rate / 100, yrs);
    const remainingTarget = Math.max(0, futureGoalCost - futureValueOfExisting);

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
      requiredMonthlySip = Math.ceil(high / 100) * 100;
    }

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
        totalPrincipalIn: Math.round(totalPrincipalIn),
        wealthGained: Math.round(Math.max(0, corpus - totalPrincipalIn)),
        endBalance: Math.round(corpus),
        progressPct: Math.min(100, Math.round((corpus / futureGoalCost) * 100)),
      });

      currentSip = currentSip * (1 + step / 100);
    }

    const finalMonthlySip =
      requiredMonthlySip > 0
        ? Math.round(requiredMonthlySip * Math.pow(1 + step / 100, Math.max(0, yrs - 1)))
        : 0;

    return {
      todayCost: Math.round(baseCost),
      futureGoalCost,
      inflationAddedCost,
      existing: Math.round(existing),
      futureValueOfExisting: Math.round(futureValueOfExisting),
      requiredMonthlySip,
      finalMonthlySip,
      totalSipInvested: Math.round(totalSipInvested),
      projectedFinalCorpus: Math.round(corpus),
      yearlySchedule,
    };
  }, [todayCost, years, inflationRate, existingSavings, annualReturn, stepUpPct]);

  useEffect(() => {
    const takeaway = t.takeawaySentence(
      localizedGoalName,
      formatINRCompact(result.todayCost),
      years,
      inflationRate,
      formatINRCompact(result.futureGoalCost),
      formatINR(result.requiredMonthlySip),
      stepUpPct
    );

    const stepUpLine =
      stepUpPct > 0 && result.requiredMonthlySip > 0
        ? `• ${t.waStepUp}: *${stepUpPct}%* (Final yr SIP: ${formatINR(result.finalMonthlySip)}/mo)\n`
        : "";

    const existingLine =
      result.existing > 0
        ? `• ${t.waExisting}: *${formatINRCompact(result.existing)}* (Grows to *${formatINRCompact(result.futureValueOfExisting)}*)\n`
        : "";

    const text =
      `${t.waGreeting(clientName?.trim())}\n\n` +
      `${t.waIntro(localizedGoalName)}\n\n` +
      `${t.waGoalHeader}\n` +
      `• ${t.waTodayCost}: *${formatINRCompact(result.todayCost)}*\n` +
      `• ${t.waHorizon}: *${years} ${t.yearsUnit}*\n` +
      `• ${t.waInflation}: *${inflationRate}% p.a.*\n` +
      `• *${t.waFutureCost}: ${formatINRCompact(result.futureGoalCost)}*\n` +
      existingLine +
      `\n${t.waActionHeader}\n` +
      `• ${t.waReturn}: *${annualReturn}% p.a.*\n` +
      `• *${t.waReqSip}: ${formatINR(result.requiredMonthlySip)}/month*\n` +
      stepUpLine +
      `• ${t.waTotalOutflow}: *${formatINRCompact(result.totalSipInvested)}*\n\n` +
      `${t.waTakeawayHeader}\n${takeaway}\n\n` +
      `_${t.waDisclaimer}_\n` +
      `— *Dalal Investments | Private Wealth Desk*`;

    const step = years <= 5 ? 1 : years <= 15 ? 3 : 5;
    const milestones = result.yearlySchedule
      .filter((r) => r.year === 1 || r.year % step === 0 || r.year === years)
      .map((r) => ({
        year: r.year,
        sip: `${formatINR(r.monthlySip)}/mo`,
        invested: formatINRCompact(r.totalPrincipalIn),
        profit: `+${formatINRCompact(r.wealthGained)}`,
        total: `${formatINRCompact(r.endBalance)} (${r.progressPct}%)`,
      }));

    onSummaryChange({
      title: t.pdfTitle(localizedGoalName),
      subtitle: t.pdfSubtitle,
      takeaway,
      whatsappText: text,
      assumptions: [
        { label: t.waTodayCost, value: formatINRCompact(result.todayCost) },
        { label: `${t.waHorizon} & Inf.`, value: `${years}y @ ${inflationRate}%` },
        { label: t.waFutureCost, value: formatINRCompact(result.futureGoalCost) },
        { label: t.waReturn, value: `${annualReturn}% (${stepUpPct}% Step-Up)` },
      ],
      highlights: [
        {
          label: t.todayCostCard,
          sub: `Current cost of ${localizedGoalName}`,
          value: formatINRCompact(result.todayCost),
        },
        {
          label: t.futureCostCard,
          sub: t.futureCostSub(inflationRate, years),
          value: formatINRCompact(result.futureGoalCost),
        },
        ...(result.existing > 0
          ? [
              {
                label: t.existingGrowthCard,
                sub: `From ${formatINRCompact(result.existing)} allocated today`,
                value: formatINRCompact(result.futureValueOfExisting),
              },
            ]
          : []),
        {
          label: t.waTotalOutflow,
          sub: `Total out-of-pocket monthly SIP contributions`,
          value: formatINRCompact(result.totalSipInvested),
        },
        {
          label: t.waReqSip,
          sub:
            stepUpPct > 0
              ? `Year 1 starting SIP (grows ${stepUpPct}%/yr to ${formatINR(result.finalMonthlySip)}/mo)`
              : `Fixed monthly SIP needed for ${years} ${t.yearsUnit}`,
          value: `${formatINR(result.requiredMonthlySip)} / month`,
          isHero: true,
        },
      ],
      milestones,
      disclaimer: t.waDisclaimer,
    });
  }, [clientName, localizedGoalName, years, inflationRate, annualReturn, stepUpPct, result, t, onSummaryChange]);

  const chartLegends = [
    { label: t.legendFund, textClass: "text-emerald-700 dark:text-emerald-300", dotClass: "bg-emerald-500" },
    { label: t.legendInvested, textClass: "text-indigo-700 dark:text-indigo-300", dotClass: "bg-indigo-500" },
    {
      label: `${t.targetMarker} (${formatINRCompact(result.futureGoalCost)})`,
      textClass: "text-amber-700 dark:text-amber-300",
      dotClass: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-7 w-full font-sans">
      {/* GOAL CATEGORY SELECTOR STRIP */}
      <div className="space-y-2">
        <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 block px-0.5">
          {t.chooseGoalLabel}
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-2.5">
          {GOAL_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedGoalId === preset.id;
            const label = preset.names[lang] || preset.names.en;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectGoalPreset(preset)}
                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 sm:gap-2.5 shadow-2xs ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 border-slate-300 dark:border-white/15 hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  <Icon size={15} />
                </div>
                <span className="text-xs font-bold leading-tight truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

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
            label={t.todayCostLabel}
            description={t.todayCostDesc}
            value={todayCost}
            onChange={setTodayCost}
            min={100000}
            max={100000000}
            sliderMax={25000000}
            step={100000}
            prefix="₹"
            presets={[
              { label: "₹5 L", value: 500000 },
              { label: "₹15 L", value: 1500000 },
              { label: "₹25 L", value: 2500000 },
              { label: "₹50 L", value: 5000000 },
              { label: "₹1.5 Cr", value: 15000000 },
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
              { label: "₹0", value: 0 },
              { label: "₹2 L", value: 200000 },
              { label: "₹5 L", value: 500000 },
              { label: "₹15 L", value: 1500000 },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
          <TactileSliderInput
            label={t.yearsLabel}
            value={years}
            onChange={setYears}
            min={1}
            max={35}
            step={1}
            suffix={t.yearsUnit}
            accent="indigo"
            presets={[
              { label: `5 ${t.yearsUnit}`, value: 5 },
              { label: `10 ${t.yearsUnit}`, value: 10 },
              { label: `15 ${t.yearsUnit}`, value: 15 },
              { label: `20 ${t.yearsUnit}`, value: 20 },
            ]}
          />

          <TactileSliderInput
            label={t.inflationLabel}
            value={inflationRate}
            onChange={setInflationRate}
            min={4}
            max={14}
            step={0.5}
            suffix="%"
            accent="amber"
            presets={[
              { label: "6% (Gen)", value: 6 },
              { label: "8% (Wed)", value: 8 },
              { label: "10% (Edu)", value: 10 },
            ]}
          />

          <TactileSliderInput
            label={t.returnLabel}
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
            value={stepUpPct}
            onChange={setStepUpPct}
            min={0}
            max={20}
            step={1}
            suffix="%"
            presets={[
              { label: "0%", value: 0 },
              { label: "5%", value: 5 },
              { label: "10%", value: 10 },
            ]}
          />
        </div>
      </section>

      {/* SECTION 2: INFLATION-ADJUSTED GOAL SUMMARY & CHART */}
      <section className="space-y-4 sm:space-y-5">
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white px-0.5">
          {t.resultHeader}
        </h3>

        {/* High-Contrast Hero Action Banner */}
        <div className="rounded-2xl bg-slate-900 dark:bg-[#0F172A] border border-slate-800 dark:border-white/15 text-white p-4 sm:p-6 shadow-md space-y-4 sm:space-y-5">
          {result.requiredMonthlySip === 0 ? (
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-xl font-black text-emerald-300">
                  {t.goalCoveredTitle}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {t.goalCoveredDesc(formatINRCompact(result.futureValueOfExisting))}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                  <Compass size={13} />
                  <span>
                    {localizedGoalName} • {t.heroTitle}
                  </span>
                </div>

                <div className="mt-2 sm:mt-2.5 flex flex-wrap items-baseline gap-2 sm:gap-2.5">
                  <span className="text-2xl sm:text-5xl font-black tracking-tight text-white tabular-nums">
                    {formatINR(result.requiredMonthlySip)}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-300">/ month</span>
                </div>

                <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-slate-300">
                  {stepUpPct > 0
                    ? `Starts at ${formatINR(result.requiredMonthlySip)}/mo in Yr 1 & grows ${stepUpPct}%/yr to ${formatINR(result.finalMonthlySip)}/mo`
                    : t.heroSubFixed}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
                <div className="bg-slate-800/95 border border-slate-700 rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-300 block truncate">
                    {t.todayCostCard}
                  </span>
                  <span className="text-sm sm:text-lg font-black text-white tabular-nums mt-0.5 block truncate">
                    {formatINRCompact(result.todayCost)}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">
                    Current price
                  </span>
                </div>

                <div className="bg-slate-800/95 border border-slate-700 rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-300 block truncate">
                    {t.inflationImpactCard}
                  </span>
                  <span className="text-sm sm:text-lg font-black text-amber-400 tabular-nums mt-0.5 block truncate">
                    +{formatINRCompact(result.inflationAddedCost)}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">
                    At {inflationRate}% / yr
                  </span>
                </div>

                <div className="bg-slate-800/95 border border-slate-700 rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-300 block truncate">
                    {t.futureCostCard}
                  </span>
                  <span className="text-sm sm:text-lg font-black text-emerald-400 tabular-nums mt-0.5 block truncate">
                    {formatINRCompact(result.futureGoalCost)}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">
                    In {years} {t.yearsUnit}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Plain-Language Summary Callout */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-300 dark:border-white/15 shadow-xs flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">
            {t.takeawaySentence(
              localizedGoalName,
              formatINRCompact(result.todayCost),
              years,
              inflationRate,
              formatINRCompact(result.futureGoalCost),
              formatINR(result.requiredMonthlySip),
              stepUpPct
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
                    <linearGradient id="goalFundGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="goalPrinGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
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
                  <Tooltip content={<CustomGoalTooltip t={t} />} />
                  <ReferenceLine
                    y={result.futureGoalCost}
                    stroke="#f59e0b"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="endBalance"
                    name={t.legendFund}
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#goalFundGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="totalPrincipalIn"
                    name={t.legendInvested}
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#goalPrinGrad)"
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
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colSip}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colInvested}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colProfit}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colPct}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 text-right whitespace-nowrap">{t.colBalance}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {result.yearlySchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {t.yrShort} {row.year}
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-indigo-600 dark:text-indigo-400 font-semibold whitespace-nowrap">
                      {formatINR(row.monthlySip)}/mo
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatINRCompact(row.totalPrincipalIn)}
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      +{formatINRCompact(row.wealthGained)}
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {row.progressPct}%
                      </span>
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-right font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatINRCompact(row.endBalance)}
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

export default GoalPlannerCalculator;