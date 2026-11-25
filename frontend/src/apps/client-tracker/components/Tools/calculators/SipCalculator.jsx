import React, { useState, useMemo, useEffect } from "react";
import { TrendingUp, Activity, History, Zap, Landmark, Wallet } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  calculateStepUpSip,
  runMonteCarloSimulation,
  runHistoricalBacktest,
  formatINR,
  formatINRCompact,
} from "./mathUtils";
import { TactileSliderInput, CustomDropdown } from "./CalculatorControls";
import {
  COMMON_TRANSLATIONS,
  ComparisonBar,
  HeroResultBanner,
  ScheduleViewerCard,
} from "./CalculatorShared";

const TRANSLATIONS = {
  en: {
    ...COMMON_TRANSLATIONS.en,
    sectionTitle: "1. Monthly SIP & Market Simulation Engine",
    sectionSub: "Choose between standard compounding, Monte Carlo volatility probability paths, or historical index backtesting.",
    modeStandard: "Standard Growth",
    modeStandardShort: "Standard",
    modeMonteCarlo: "Monte Carlo Volatility",
    modeMonteCarloShort: "Monte Carlo",
    modeHistorical: "Historical Backtest",
    modeHistoricalShort: "Historical",
    monthlyLabel: "Monthly SIP Amount",
    monthlyDesc: "Fixed amount invested automatically every month.",
    stepUpLabel: "Yearly SIP Increase (%)",
    stepUpDesc: "Grow your SIP annually as income rises (0% = constant).",
    returnLabel: "Expected Return (p.a.)",
    returnDesc: "Long-term equity funds average 11%–13%.",
    volatilityLabel: "Market Volatility (±% Std Dev)",
    volatilityDesc: "Simulates annual market fluctuation range.",
    historicalCycleLabel: "Historical Market Cycle",
    historicalCycleDesc: "Test portfolio performance across past Nifty 50 cycles.",
    yearsLabel: "Time Horizon",
    yearsDesc: "Longer duration unlocks exponential compounding.",
    resultHeader: "2. Projected Wealth & Simulation Results",
    heroTitle: "Estimated Final Value",
    investedLabel: "Money Put In",
    profitLabel: "Profit Earned",
    multiplierLabel: "Wealth Multiplier",
    takeawaySentence: (invested, profit, total, yrs, mult) =>
      `By investing systematically over ${yrs} years, you contribute ${invested} from your pocket and generate ${profit} in compounding profit — growing your money ${mult}x to ${total}.`,
    mcOptimistic: "Optimistic Path (P75)",
    mcExpected: "Expected Path (P50)",
    mcPessimistic: "Pessimistic Path (P25)",
    compareToggle: "Compare vs. Bank FD & Inflation",
    compareDesc: "Check post-tax FD returns and today's purchasing power.",
    fdCardTitle: "Same Savings in Bank FD",
    fdCardSub: (rate, slab) => `${rate}% interest after ${slab}% yearly tax`,
    fdExtraEdge: (edge) => `+${edge} extra with SIP`,
    realValueTitle: "Today's Purchasing Power",
    realValueSub: (inf) => `Adjusted for ${inf}% yearly inflation`,
    growthChartTitle: "Year-by-Year Wealth Growth",
    growthChartSub: "Watch how compounding profit overtakes your principal over time",
    legendInvested: "Money Put In",
    legendTotal: "Total Fund Value",
    colSip: "Monthly SIP",
    colInvested: "Total Put In",
    colProfit: "Profit Earned",
    colTotal: "Total Value",
    waIntro: (isStepUp) =>
      `Here is your personalized *${isStepUp ? "Step-Up SIP" : "Monthly SIP"} Wealth Illustration* prepared by *Dalal Investments*:`,
    waSip: "Starting Monthly SIP",
    waStepUp: "Yearly SIP Step-Up",
    waDuration: "Investment Horizon",
    waOutcomeHeader: "2️⃣ *Projected Wealth Outcome*",
    waInvested: "Total Money You Put In",
    waProfit: "Compounding Profit Earned",
    waMultiplier: "Wealth Growth Multiple",
    waTotal: "Estimated Maturity Value",
    waFdBlock: (fdRate, slab, fdVal, edge) =>
      `\n3️⃣ *Bank FD vs. SIP Comparison*\n` +
      `• Same savings in Bank FD (${fdRate}% @ ${slab}% tax): *${fdVal}*\n` +
      `• *Additional Wealth Created by SIP: +${edge}*\n`,
    waRealLine: (inf, realVal) =>
      `• Value in Today's Purchasing Power (at ${inf}% inflation): *${realVal}*\n`,
    pdfTitle: "Systematic Investment Plan (SIP) Illustration",
  },
  hi: {
    ...COMMON_TRANSLATIONS.hi,
    sectionTitle: "1. मासिक SIP और मार्केट सिमुलेशन इंजन",
    sectionSub: "स्टैंडर्ड ग्रोथ, मोंटे कार्लो वोलेटिलिटी या ऐतिहासिक बैकटेस्ट में से चुनें।",
    modeStandard: "स्टैंडर्ड ग्रोथ",
    modeStandardShort: "स्टैंडर्ड",
    modeMonteCarlo: "मोंटे कार्लो वोलेटिलिटी",
    modeMonteCarloShort: "मोंटे कार्लो",
    modeHistorical: "ऐतिहासिक बैकटेस्ट",
    modeHistoricalShort: "ऐतिहासिक",
    monthlyLabel: "मासिक SIP राशि",
    monthlyDesc: "हर महीने बैंक से निवेश होने वाली राशि।",
    stepUpLabel: "सालाना SIP बढ़ोतरी (%)",
    stepUpDesc: "आय बढ़ने के साथ हर साल SIP बढ़ाएं (0% = समान राशि)।",
    returnLabel: "अनुमानित सालाना रिटर्न",
    returnDesc: "लंबे समय में इक्विटी फंड औसतन 11%–13% रिटर्न देते हैं।",
    volatilityLabel: "बाजार उतार-चढ़ाव (±% Volatility)",
    volatilityDesc: "वार्षिक बाजार उतार-चढ़ाव सीमा सिमुलेट करता है।",
    historicalCycleLabel: "ऐतिहासिक बाजार चक्र",
    historicalCycleDesc: "पिछले निफ्टी 50 चक्रों के आधार पर प्रदर्शन जांचें।",
    yearsLabel: "निवेश की अवधि",
    yearsDesc: "लंबा समय कंपाउंडिंग का सबसे बड़ा लाभ देता है।",
    resultHeader: "2. अनुमानित वेल्थ रिपोर्ट",
    heroTitle: "कुल अनुमानित फंड",
    investedLabel: "आपका निवेश",
    profitLabel: "अनुमानित लाभ",
    multiplierLabel: "वेल्थ मल्टीप्लायर",
    takeawaySentence: (invested, profit, total, yrs, mult) =>
      `${yrs} सालों तक नियमित निवेश करके आप अपनी जेब से ${invested} जमा करेंगे और कंपाउंडिंग से ${profit} का मुनाफा कमाएंगे — जिससे आपका पैसा ${mult} गुना बढ़कर ${total} हो जाएगा।`,
    mcOptimistic: "बेहतर संभावना (P75)",
    mcExpected: "संभावित पाथ (P50)",
    mcPessimistic: "कमजोर संभावना (P25)",
    compareToggle: "बैंक FD और महंगाई से तुलना करें",
    compareDesc: "टैक्स के बाद FD रिटर्न और आज की कीमत में वैल्यू देखें।",
    fdCardTitle: "बैंक FD में इतनी ही बचत",
    fdCardSub: (rate, slab) => `${rate}% ब्याज, ${slab}% सालाना टैक्स के बाद`,
    fdExtraEdge: (edge) => `SIP से +${edge} ज्यादा लाभ`,
    realValueTitle: "आज की खरीदारी क्षमता",
    realValueSub: (inf) => `${inf}% सालाना महंगाई के बाद आज की वैल्यू`,
    growthChartTitle: "साल दर साल फंड की बढ़त",
    growthChartSub: "देखें कि कैसे मुनाफा आपके निवेश से आगे निकल जाता है",
    legendInvested: "आपका निवेश",
    legendTotal: "कुल फंड वैल्यू",
    colSip: "मासिक SIP",
    colInvested: "कुल जमा",
    colProfit: "मुनाफा",
    colTotal: "कुल फंड",
    waIntro: (isStepUp) =>
      `*Dalal Investments* की ओर से आपकी *${isStepUp ? "स्टेप-अप SIP" : "मासिक SIP"} निवेश योजना* नीचे प्रस्तुत है:`,
    waSip: "शुरुआती मासिक SIP",
    waStepUp: "सालाना SIP बढ़ोतरी",
    waDuration: "निवेश की अवधि",
    waOutcomeHeader: "2️⃣ *अनुमानित वेल्थ परिणाम*",
    waInvested: "आपका कुल निवेश",
    waProfit: "अनुमानित मुनाफा (लाभ)",
    waMultiplier: "कुल वेल्थ ग्रोथ",
    waTotal: "अनुमानित कुल फंड",
    waFdBlock: (fdRate, slab, fdVal, edge) =>
      `\n3️⃣ *बैंक FD बनाम SIP तुलना*\n` +
      `• बैंक FD में इतनी ही बचत (${fdRate}% @ ${slab}% टैक्स): *${fdVal}*\n` +
      `• *SIP से अतिरिक्त लाभ: +${edge}*\n`,
    waRealLine: (inf, realVal) =>
      `• आज की खरीदारी क्षमता के अनुसार (${inf}% महंगाई के बाद): *${realVal}*\n`,
    pdfTitle: "मासिक SIP निवेश योजना (Dalal Investments)",
  },
  gu: {
    ...COMMON_TRANSLATIONS.gu,
    sectionTitle: "1. માસિક SIP અને માર્કેટ સિમ્યુલેશન એન્જિન",
    sectionSub: "સ્ટાન્ડર્ડ ગ્રોથ, મોન્ટે કાર્લો વોલેટિલિટી અથવા હિસ્ટેરિકલ બેકટેસ્ટ પસંદ કરો.",
    modeStandard: "સ્ટાન્ડર્ડ ગ્રોથ",
    modeStandardShort: "સ્ટાન્ડર્ડ",
    modeMonteCarlo: "મોન્ટે કાર્લો વોલેટિલિટી",
    modeMonteCarloShort: "મોન્ટે કાર્લો",
    modeHistorical: "હિસ્ટેરિકલ બેકટેસ્ટ",
    modeHistoricalShort: "હિસ્ટેરિકલ",
    monthlyLabel: "માસિક SIP રકમ",
    monthlyDesc: "દર મહિને આપમેળે રોકાણ થતી રકમ.",
    stepUpLabel: "વાર્ષિક SIP વધારો (%)",
    stepUpDesc: "આવક વધવાની સાથે દર વર્ષે SIP વધારો (0% = એકસરખી).",
    returnLabel: "અંદાજિત વાર્ષિક વળતર",
    returnDesc: "લાંબા ગાળે ઇક્વિટી ફંડ સરેરાશ 11%–13% વળતર આપે છે.",
    volatilityLabel: "બજાર અસ્થિરતા (±% Volatility)",
    volatilityDesc: "વાર્ષિક બજાર ઉતાર-ચઢાવ મર્યાદા દર્શાવે છે.",
    historicalCycleLabel: "ઐતિહાસિક બજાર ચક્ર",
    historicalCycleDesc: "પાછલા નિફ્ટી 50 ચક્ર મુજબ પ્રદર્શન ચકાસો.",
    yearsLabel: "રોકાણનો સમયગાળો",
    yearsDesc: "લાંબો સમય કમ્પાઉન્ડિંગનો સૌથી મોટો ફાયદો આપે છે.",
    resultHeader: "2. અંદાજિત વેલ્થ રિપોર્ટ",
    heroTitle: "અંદાજિત કુલ ફંડ",
    investedLabel: "તમારું રોકાણ",
    profitLabel: "અંદાજિત નફો",
    multiplierLabel: "વેલ્થ મલ્ટિપ્લાયર",
    takeawaySentence: (invested, profit, total, yrs, mult) =>
      `${yrs} વર્ષ સુધી નિયમિત રોકાણ કરીને તમે તમારા ખિસ્સામાંથી ${invested} રોકશો અને કમ્પાઉન્ડિંગ દ્વારા ${profit} નો નફો મેળવશો — જેનાથી તમારા પૈસા ${mult} ગણા વધીને ${total} થશે.`,
    mcOptimistic: "શ્રેષ્ઠ શક્યતા (P75)",
    mcExpected: "સંભવિત પાથ (P50)",
    mcPessimistic: "નબળી શક્યતા (P25)",
    compareToggle: "બેંક FD અને મોંઘવારી સાથે સરખામણી",
    compareDesc: "ટેક્સ પછી FD વળતર અને આજની ખરીદશક્તિ જુઓ.",
    fdCardTitle: "બેંક FD માં આટલી જ બચત",
    fdCardSub: (rate, slab) => `${rate}% વ્યાજ, ${slab}% વાર્ષિક ટેક્સ પછી`,
    fdExtraEdge: (edge) => `SIP થી +${edge} વધુ ફાયદો`,
    realValueTitle: "આજની ખરીદશક્તિ",
    realValueSub: (inf) => `${inf}% વાર્ષિક મોંઘવારી પછી આજનું મૂલ્ય`,
    growthChartTitle: "દર વર્ષે ફંડની વૃદ્ધિ",
    growthChartSub: "જુઓ કે કેવી રીતે નફો તમારા રોકાણ કરતાં આગળ નીકળી જાય છે",
    legendInvested: "તમારું રોકાણ",
    legendTotal: "કુલ ફંડ મૂલ્ય",
    colSip: "માસિક SIP",
    colInvested: "કુલ રોકાણ",
    colProfit: "નફો",
    colTotal: "કુલ ફંડ",
    waIntro: (isStepUp) =>
      `*Dalal Investments* તરફથી તમારું *${isStepUp ? "સ્ટેપ-અપ SIP" : "માસિક SIP"} આયોજન* નીચે મુજબ છે:`,
    waSip: "શરૂઆતની માસિક SIP",
    waStepUp: "વાર્ષિક SIP વધારો",
    waDuration: "રોકાણનો સમયગાળો",
    waOutcomeHeader: "2️⃣ *અંદાજિત વેલ્થ પરિણામ*",
    waInvested: "તમારું કુલ રોકાણ",
    waProfit: "અંદાજિત નફો (વળતર)",
    waMultiplier: "કુલ વેલ્થ ગ્રોથ",
    waTotal: "અંદાજિત કુલ ફંડ",
    waFdBlock: (fdRate, slab, fdVal, edge) =>
      `\n3️⃣ *બેંક FD વિ. SIP સરખામણી*\n` +
      `• બેંક FD માં આટલી જ બચત (${fdRate}% @ ${slab}% ટેક્સ): *${fdVal}*\n` +
      `• *SIP થી વધારાનો નફો: +${edge}*\n`,
    waRealLine: (inf, realVal) =>
      `• આજની ખરીદશક્તિ મુજબ (${inf}% મોંઘવારી પછી): *${realVal}*\n`,
    pdfTitle: "માસિક SIP રોકાણ આયોજન (Dalal Investments)",
  },
};

const HISTORICAL_CYCLE_OPTIONS = [
  { value: "bull2014", label: "2014 Structural Bull Run Cycle" },
  { value: "crash2008", label: "2008 Global Financial Crisis Cycle" },
  { value: "covid2020", label: "2020 Post-COVID Recovery Cycle" },
];

const CustomSimulationTooltip = ({ active, payload, t, simMode }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-white/15 rounded-xl p-3 shadow-xl space-y-1.5 min-w-[200px] sm:min-w-[220px] font-sans text-xs z-50">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/15 pb-1.5">
        <span className="font-bold text-slate-900 dark:text-white">
          {t.yrShort} {row.year}
        </span>
        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
          {t.colSip}: {formatINR(row.monthlySip)}
        </span>
      </div>
      <div className="space-y-1.5 tabular-nums">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500 dark:text-slate-400">{t.legendInvested}:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {formatINRCompact(row.totalInvested)}
          </span>
        </div>
        {simMode === "montecarlo" ? (
          <>
            <div className="flex justify-between gap-3">
              <span className="text-emerald-600">{t.mcOptimistic}:</span>
              <span className="font-bold text-emerald-600">{formatINRCompact(row.optimistic)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-indigo-600">{t.mcExpected}:</span>
              <span className="font-bold text-indigo-600">{formatINRCompact(row.expected)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-amber-600">{t.mcPessimistic}:</span>
              <span className="font-bold text-amber-600">{formatINRCompact(row.pessimistic)}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between gap-3 pt-1.5 border-t border-slate-200 dark:border-white/15">
            <span className="font-bold text-slate-900 dark:text-white">{t.colTotal}:</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatINRCompact(row.endBalance)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const SipCalculator = ({ clientName, lang = "en", onSummaryChange }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [simMode, setSimMode] = useState("standard");
  const [monthlySip, setMonthlySip] = useState(15000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(15);
  const [stepUpPct, setStepUpPct] = useState(10);
  const [volatility, setVolatility] = useState(15);
  const [historicalCycle, setHistoricalCycle] = useState("bull2014");

  const [showComparison, setShowComparison] = useState(false);
  const [fdRate, setFdRate] = useState(7);
  const [taxSlab, setTaxSlab] = useState(30);
  const [inflationRate, setInflationRate] = useState(6);

  const result = useMemo(() => {
    const sip = Number(monthlySip) || 0;
    const yrs = Math.max(1, Number(years) || 1);
    const step = Number(stepUpPct) || 0;

    let base;
    if (simMode === "montecarlo") {
      const mc = runMonteCarloSimulation({
        monthlySip: sip,
        meanReturnPct: Number(annualReturn) || 12,
        volatilityPct: Number(volatility) || 15,
        years: yrs,
        stepUpPct: step,
      });
      base = {
        totalInvested: mc.totalInvested,
        futureValue: mc.expectedFinal,
        wealthGained: Math.max(0, mc.expectedFinal - mc.totalInvested),
        yearlySchedule: mc.yearlySchedule,
      };
    } else if (simMode === "historical") {
      const hist = runHistoricalBacktest({
        monthlySip: sip,
        cycleKey: historicalCycle,
        years: Math.min(yrs, 35),
        stepUpPct: step,
      });
      base = {
        totalInvested: hist.totalInvested,
        futureValue: hist.futureValue,
        wealthGained: hist.wealthGained,
        yearlySchedule: hist.yearlySchedule,
      };
    } else {
      base = calculateStepUpSip({
        monthlySip: sip,
        annualReturnPct: Number(annualReturn) || 0,
        years: yrs,
        stepUpPct: step,
      });
    }

    const monthlyFdRate = (((Number(fdRate) || 0) / 100) * (1 - (Number(taxSlab) || 0) / 100)) / 12;
    let fdCorpus = 0;
    let curSip = sip;
    for (let y = 1; y <= yrs; y++) {
      for (let m = 1; m <= 12; m++) fdCorpus = (fdCorpus + curSip) * (1 + monthlyFdRate);
      curSip *= 1 + step / 100;
    }

    const inflationFactor = Math.pow(1 + (Number(inflationRate) || 0) / 100, yrs);
    const multiplier = base.totalInvested > 0 ? (base.futureValue / base.totalInvested).toFixed(2) : "1.00";

    return {
      ...base,
      multiplier,
      finalMonthlySip: Math.round(sip * Math.pow(1 + step / 100, Math.max(0, yrs - 1))),
      fdFutureValue: Math.round(fdCorpus),
      sipOverFdEdge: Math.round(base.futureValue - fdCorpus),
      inflationAdjustedValue: Math.round(base.futureValue / inflationFactor),
    };
  }, [simMode, monthlySip, annualReturn, years, stepUpPct, volatility, historicalCycle, fdRate, taxSlab, inflationRate]);

  const investedRatio =
    result.futureValue > 0
      ? Math.min(100, Math.round((result.totalInvested / result.futureValue) * 100))
      : 0;
  const profitRatio = 100 - investedRatio;

  useEffect(() => {
    const modeLabel =
      simMode === "montecarlo"
        ? t.modeMonteCarlo
        : simMode === "historical"
        ? t.modeHistorical
        : t.modeStandard;

    const takeaway = t.takeawaySentence(
      formatINRCompact(result.totalInvested),
      formatINRCompact(result.wealthGained),
      formatINRCompact(result.futureValue),
      years,
      result.multiplier
    );

    const stepUpLine =
      stepUpPct > 0
        ? `• ${t.waStepUp}: *${stepUpPct}%* (Grows from ${formatINR(monthlySip)} to ${formatINR(result.finalMonthlySip)}/mo)\n`
        : `• ${t.waStepUp}: *0%* (Fixed monthly SIP)\n`;

    const extraCompareText = showComparison
      ? t.waFdBlock(fdRate, taxSlab, formatINRCompact(result.fdFutureValue), formatINRCompact(result.sipOverFdEdge)) +
        t.waRealLine(inflationRate, formatINRCompact(result.inflationAdjustedValue))
      : "";

    const text =
      `${t.waGreeting(clientName?.trim())}\n\n` +
      `${t.waIntro(stepUpPct > 0)}\n\n` +
      `• Mode: *${modeLabel}*\n` +
      `• ${t.waSip}: *${formatINR(monthlySip)}*\n` +
      stepUpLine +
      `• ${t.waDuration}: *${years} ${t.yearsUnit}*\n\n` +
      `📊 *${t.waOutcomeHeader}*\n` +
      `• ${t.waInvested}: *${formatINRCompact(result.totalInvested)}* (${investedRatio}%)\n` +
      `• ${t.waProfit}: *+${formatINRCompact(result.wealthGained)}* (${profitRatio}%)\n` +
      `• ${t.waMultiplier}: *${result.multiplier}x*\n` +
      `• *${t.waTotal}: ${formatINRCompact(result.futureValue)}* (${formatINR(result.futureValue)})\n` +
      extraCompareText +
      `\n${t.waTakeawayHeader}\n${takeaway}\n\n` +
      `_${t.waDisclaimer}_\n` +
      `— *Dalal Investments | Private Wealth Desk*`;

    const milestoneStep = years <= 5 ? 1 : years <= 15 ? 3 : 5;
    const milestones = result.yearlySchedule
      .filter((r) => r.year === 1 || r.year % milestoneStep === 0 || r.year === years)
      .map((r) => ({
        year: r.year,
        sip: formatINR(r.monthlySip),
        invested: formatINRCompact(r.totalInvested),
        profit: formatINRCompact(r.wealthGained),
        total: formatINRCompact(r.endBalance || r.expected),
      }));

    onSummaryChange({
      title: `${t.pdfTitle} (${modeLabel})`,
      subtitle: `Simulation Mode: ${modeLabel}`,
      takeaway,
      whatsappText: text,
      assumptions: [
        { label: t.waSip, value: formatINR(monthlySip) },
        { label: "Simulation Mode", value: modeLabel },
        { label: t.waDuration, value: `${years} ${t.yearsUnit}` },
      ],
      highlights: [
        {
          label: t.investedLabel,
          sub: `${investedRatio}% of corpus`,
          value: `${formatINRCompact(result.totalInvested)} (${formatINR(result.totalInvested)})`,
        },
        {
          label: t.profitLabel,
          sub: `${profitRatio}% compounding gain`,
          value: `+${formatINRCompact(result.wealthGained)}`,
        },
        {
          label: t.heroTitle,
          sub: `Projected corpus under ${modeLabel}`,
          value: `${formatINRCompact(result.futureValue)} (${formatINR(result.futureValue)})`,
          isHero: true,
        },
      ],
      milestones,
      disclaimer: t.waDisclaimer,
    });
  }, [clientName, monthlySip, years, stepUpPct, simMode, showComparison, fdRate, taxSlab, inflationRate, result, investedRatio, profitRatio, t, onSummaryChange]);

  const yearPresets = [
    { label: `5 ${t.yearsUnit}`, value: 5 },
    { label: `10 ${t.yearsUnit}`, value: 10 },
    { label: `15 ${t.yearsUnit}`, value: 15 },
    { label: `20 ${t.yearsUnit}`, value: 20 },
  ];

  const chartLegends =
    simMode === "montecarlo"
      ? [
          { label: t.mcOptimistic, textClass: "text-emerald-600", dotClass: "bg-emerald-500" },
          { label: t.mcExpected, textClass: "text-indigo-600", dotClass: "bg-indigo-500" },
          { label: t.mcPessimistic, textClass: "text-amber-600", dotClass: "bg-amber-500" },
        ]
      : [
          { label: t.legendTotal, textClass: "text-emerald-700 dark:text-emerald-300", dotClass: "bg-emerald-500" },
          { label: t.legendInvested, textClass: "text-indigo-700 dark:text-indigo-300", dotClass: "bg-indigo-500" },
        ];

  return (
    <div className="space-y-5 sm:space-y-7 w-full font-sans">
      {/* HORIZONTAL EQUAL-WIDTH SIMULATION MODE TABS */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 bg-slate-200/80 dark:bg-[#0B1120] p-1 sm:p-1.5 rounded-xl border border-slate-300 dark:border-white/15">
        {[
          {
            id: "standard",
            fullLabel: t.modeStandard,
            shortLabel: t.modeStandardShort,
            Icon: TrendingUp,
            activeClass: "text-emerald-700 dark:text-emerald-400",
          },
          {
            id: "montecarlo",
            fullLabel: t.modeMonteCarlo,
            shortLabel: t.modeMonteCarloShort,
            Icon: Activity,
            activeClass: "text-indigo-700 dark:text-indigo-400",
          },
          {
            id: "historical",
            fullLabel: t.modeHistorical,
            shortLabel: t.modeHistoricalShort,
            Icon: History,
            activeClass: "text-amber-700 dark:text-amber-400",
          },
        ].map(({ id, fullLabel, shortLabel, Icon, activeClass }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSimMode(id)}
            className={`py-2 px-1.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-0 border ${
              simMode === id
                ? `bg-white dark:bg-[#111827] ${activeClass} border-slate-300 dark:border-white/20 shadow-2xs`
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Icon size={13} className="shrink-0" />
            <span className="sm:hidden truncate">{shortLabel}</span>
            <span className="hidden sm:inline truncate">{fullLabel}</span>
          </button>
        ))}
      </div>

      {/* SECTION 1: TACTILE INPUT GRID */}
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
            label={t.monthlyLabel}
            description={t.monthlyDesc}
            value={monthlySip}
            onChange={setMonthlySip}
            min={500}
            max={1000000}
            sliderMax={200000}
            step={500}
            prefix="₹"
            presets={[
              { label: "₹5,000", value: 5000 },
              { label: "₹15,000", value: 15000 },
              { label: "₹25,000", value: 25000 },
              { label: "₹50,000", value: 50000 },
            ]}
          />

          <TactileSliderInput
            label={t.stepUpLabel}
            description={t.stepUpDesc}
            value={stepUpPct}
            onChange={setStepUpPct}
            min={0}
            max={25}
            step={1}
            suffix="%"
            presets={[
              { label: "0% (Fixed)", value: 0 },
              { label: "5% / yr", value: 5 },
              { label: "10% / yr", value: 10 },
            ]}
          />
        </div>

        {simMode === "montecarlo" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            <TactileSliderInput
              label={t.returnLabel}
              description={t.returnDesc}
              value={annualReturn}
              onChange={setAnnualReturn}
              min={8}
              max={18}
              step={0.5}
              suffix="%"
              accent="indigo"
              presets={[
                { label: "10% (Expected)", value: 10 },
                { label: "12% (Expected)", value: 12 },
              ]}
            />
            <TactileSliderInput
              label={t.volatilityLabel}
              description={t.volatilityDesc}
              value={volatility}
              onChange={setVolatility}
              min={5}
              max={30}
              step={1}
              suffix="%"
              accent="amber"
              presets={[
                { label: "±10% (Low)", value: 10 },
                { label: "±15% (Normal)", value: 15 },
                { label: "±25% (High)", value: 25 },
              ]}
            />
          </div>
        ) : simMode === "historical" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="bg-white dark:bg-[#111827] border border-slate-300 dark:border-white/15 rounded-xl p-3.5 sm:p-5 space-y-2 shadow-xs">
              <label className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block">
                {t.historicalCycleLabel}
              </label>
              <CustomDropdown
                value={historicalCycle}
                options={HISTORICAL_CYCLE_OPTIONS}
                onChange={setHistoricalCycle}
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.historicalCycleDesc}
              </p>
            </div>
            <TactileSliderInput
              label={t.yearsLabel}
              value={Math.min(years, 35)}
              onChange={setYears}
              min={1}
              max={35}
              step={1}
              suffix={t.yearsUnit}
              accent="indigo"
              presets={yearPresets}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            <TactileSliderInput
              label={t.returnLabel}
              description={t.returnDesc}
              value={annualReturn}
              onChange={setAnnualReturn}
              min={6}
              max={22}
              step={0.5}
              suffix="%"
              presets={[
                { label: "10%", value: 10 },
                { label: "12%", value: 12 },
                { label: "15%", value: 15 },
              ]}
            />
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
              presets={yearPresets}
            />
          </div>
        )}

        <ComparisonBar
          t={t}
          showComparison={showComparison}
          setShowComparison={setShowComparison}
          fdRate={fdRate}
          setFdRate={setFdRate}
          taxSlab={taxSlab}
          setTaxSlab={setTaxSlab}
          inflationRate={inflationRate}
          setInflationRate={setInflationRate}
        />
      </section>

      {/* SECTION 2: RESULTS & VISUALS */}
      <section className="space-y-4 sm:space-y-5">
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white px-0.5">
          {t.resultHeader}
        </h3>

        <HeroResultBanner
          badgeIcon={Zap}
          badgeText={`${t.heroTitle} (${years} ${t.yearsUnit})`}
          futureValue={result.futureValue}
          kpis={[
            {
              label: t.investedLabel,
              labelColor: "text-indigo-300",
              value: formatINRCompact(result.totalInvested),
              valueColor: "text-white",
              sub: `${investedRatio}% of corpus`,
            },
            {
              label: t.profitLabel,
              labelColor: "text-emerald-300",
              value: `+${formatINRCompact(result.wealthGained)}`,
              valueColor: "text-emerald-400",
              sub: `${profitRatio}% gain`,
              highlight: true,
            },
            {
              label: t.multiplierLabel,
              labelColor: "text-amber-300",
              value: `${result.multiplier}x`,
              valueColor: "text-amber-400",
              sub: "Growth multiple",
            },
          ]}
        />

        {showComparison && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 animate-in fade-in duration-150">
            <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-300 dark:border-white/15 shadow-xs flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300 block">{t.fdCardTitle}</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block tabular-nums">
                  {formatINRCompact(result.fdFutureValue)}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 block">
                  {t.fdCardSub(fdRate, taxSlab)}
                </span>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs font-bold">
                  {t.fdExtraEdge(formatINRCompact(result.sipOverFdEdge))}
                </span>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-slate-200 dark:border-white/10 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Landmark size={18} />
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-300 dark:border-white/15 shadow-xs flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <span className="text-xs font-extrabold text-purple-800 dark:text-purple-300 block">{t.realValueTitle}</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block tabular-nums">
                  {formatINRCompact(result.inflationAdjustedValue)}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 block leading-relaxed">
                  {t.realValueSub(inflationRate)}
                </span>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 dark:bg-purple-500/15 border border-slate-200 dark:border-white/10 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Wallet size={18} />
              </div>
            </div>
          </div>
        )}

        <ScheduleViewerCard
          chartTitle={t.growthChartTitle}
          tableTitle={t.viewTable}
          subtitle={t.growthChartSub}
          viewChartLabel={t.viewChart}
          viewTableLabel={t.viewTable}
          legends={chartLegends}
          renderChart={() => (
            <div className="w-full h-[230px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.yearlySchedule} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
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
                  <Tooltip content={<CustomSimulationTooltip t={t} simMode={simMode} />} />
                  {simMode === "montecarlo" ? (
                    <>
                      <Area type="monotone" dataKey="optimistic" stroke="#10b981" strokeWidth={2} fillOpacity={0.12} fill="#10b981" />
                      <Area type="monotone" dataKey="expected" stroke="#6366f1" strokeWidth={2.5} fillOpacity={0.22} fill="#6366f1" />
                      <Area type="monotone" dataKey="pessimistic" stroke="#f59e0b" strokeWidth={2} fillOpacity={0.12} fill="#f59e0b" />
                    </>
                  ) : (
                    <>
                      <Area type="monotone" dataKey="endBalance" stroke="#10b981" strokeWidth={2.5} fill="#10b981" fillOpacity={0.22} />
                      <Area type="monotone" dataKey="totalInvested" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.12} />
                    </>
                  )}
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
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 text-right whitespace-nowrap">{t.colTotal}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {result.yearlySchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {t.yrShort} {row.year}
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatINR(row.monthlySip)}
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatINRCompact(row.totalInvested)}
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      +{formatINRCompact(row.wealthGained)}
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-right font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatINRCompact(row.endBalance || row.expected)}
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

export default SipCalculator;