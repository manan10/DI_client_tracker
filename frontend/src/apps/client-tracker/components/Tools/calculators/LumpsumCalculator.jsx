import React, { useState, useMemo, useEffect } from "react";
import {
  Wallet,
  BarChart3,
  Table as TableIcon,
  Scale,
  Landmark,
  TrendingUp,
  ShieldCheck,
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
import { TactileSliderInput, CustomDropdown } from "./CalculatorControls";

const TRANSLATIONS = {
  en: {
    sectionTitle: "1. Enter One-Time Investment Details",
    sectionSub: "Set your lumpsum capital, expected growth rate, and holding period.",
    principalLabel: "One-Time Investment Amount",
    principalDesc: "Total lumpsum capital you want to deploy today.",
    returnLabel: "Expected Annual Return (p.a.)",
    returnDesc: "Equity funds historically average 11%–13% over long horizons.",
    yearsLabel: "Investment Horizon",
    yearsDesc: "Uninterrupted compounding multiplies your capital over time.",
    yearsUnit: "Yrs",
    yrShort: "Yr",

    resultHeader: "2. Projected Lumpsum Wealth Summary",
    heroTitle: "Estimated Maturity Value",
    investedLabel: "Capital Invested",
    profitLabel: "Wealth Gained",
    multiplierLabel: "Capital Multiplier",
    multiplierSub: "Total growth multiple",
    takeawaySentence: (principal, profit, total, yrs, mult) =>
      `A one-time investment of ${principal} growing at ${yrs} years generates ${profit} in compounding profit — multiplying your capital ${mult}x to ${total}.`,

    compareToggle: "Compare vs. Bank FD (Post-Tax & Inflation)",
    compareDesc: "See how Mutual Fund LTCG tax efficiency beats annual FD slab taxation.",
    fdRateLabel: "Bank FD Rate (%)",
    taxSlabLabel: "Your Tax Slab",
    inflationLabel: "Yearly Inflation (%)",
    fdCardTitle: "Same Lumpsum in Bank FD (After Tax)",
    fdCardSub: (rate, slab) => `${rate}% interest taxed annually at ${slab}% slab`,
    mfPostTaxTitle: "Mutual Fund After 12.5% LTCG Tax",
    mfPostTaxSub: "Includes ₹1.25 Lakh annual tax-free LTCG exemption",
    fdExtraEdge: (edge) => `+${edge} extra post-tax wealth with MF`,
    realValueTitle: "Today's Purchasing Power",
    realValueSub: (inf, fdReal) =>
      `MF real value after ${inf}% inflation (FD real value: ${fdReal})`,

    growthChartTitle: "Year-by-Year Lumpsum Compounding",
    growthChartSub: "Compare your initial capital against compounding growth over time",
    legendPrincipal: "Initial Capital",
    legendMf: "Mutual Fund Value",
    legendFd: "Bank FD (Post-Tax)",
    viewChart: "Growth Chart",
    viewTable: "Year-by-Year Table",
    colYear: "Year",
    colPrincipal: "Capital Invested",
    colProfit: "Wealth Gained",
    colMfTotal: "MF Value",
    colFdTotal: "FD (Post-Tax)",

    waGreeting: (name) => (name ? `Namaste *${name}*,` : `Namaste,`),
    waIntro: () =>
      `Here is your personalized *Lumpsum Wealth Illustration* prepared by *Dalal Investments*:`,
    waPlanHeader: "1️⃣ *Investment Plan Details*",
    waPrincipal: "One-Time Investment",
    waDuration: "Investment Horizon",
    waReturn: "Assumed Return Rate",
    waOutcomeHeader: "2️⃣ *Projected Wealth Outcome*",
    waInvested: "Initial Capital Invested",
    waProfit: "Compounding Profit Earned",
    waMultiplier: "Capital Growth Multiple",
    waTotal: "Estimated Maturity Value",
    waFdBlock: (fdRate, slab, fdVal, mfNet, edge) =>
      `\n3️⃣ *Post-Tax Bank FD vs. Mutual Fund*\n` +
      `• Bank FD (${fdRate}% @ ${slab}% annual tax): *${fdVal}*\n` +
      `• Mutual Fund (Post 12.5% LTCG tax): *${mfNet}*\n` +
      `• *Extra Tax-Efficient Wealth with MF: +${edge}*\n`,
    waRealLine: (inf, mfReal, fdReal) =>
      `• Today's Purchasing Power (${inf}% inflation): MF *${mfReal}* vs. FD *${fdReal}*\n`,
    waTakeawayHeader: "💡 *Key Takeaway:*",
    waDisclaimer:
      "Disclaimer: Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Figures above are arithmetic illustrations for planning purposes.",
    pdfTitle: "Lumpsum Investment Wealth Illustration",
    pdfSubtitle: "One-time capital compounding & post-tax efficiency analysis",
  },
  hi: {
    sectionTitle: "1. एकमुश्त (Lumpsum) निवेश विवरण दर्ज करें",
    sectionSub: "अपनी निवेश राशि, अनुमानित रिटर्न और समय अवधि चुनें।",
    principalLabel: "एकमुश्त निवेश राशि",
    principalDesc: "आज आप एक बार में जो कुल राशि निवेश करना चाहते हैं।",
    returnLabel: "अनुमानित सालाना रिटर्न",
    returnDesc: "लंबे समय में इक्विटी फंड औसतन 11%–13% रिटर्न देते हैं।",
    yearsLabel: "निवेश की अवधि",
    yearsDesc: "बिना रुकावट कंपाउंडिंग आपके पैसे को कई गुना बढ़ाती है।",
    yearsUnit: "साल",
    yrShort: "वर्ष",

    resultHeader: "2. अनुमानित वेल्थ रिपोर्ट",
    heroTitle: "कुल अनुमानित फंड",
    investedLabel: "निवेशित पूंजी",
    profitLabel: "अनुमानित लाभ",
    multiplierLabel: "वेल्थ मल्टीप्लायर",
    multiplierSub: "आपकी पूंजी में कुल गुना बढ़त",
    takeawaySentence: (principal, profit, total, yrs, mult) =>
      `${principal} का एकमुश्त निवेश ${yrs} सालों में कंपाउंडिंग से ${profit} का लाभ देता है — जिससे आपकी पूंजी ${mult} गुना बढ़कर ${total} हो जाती है।`,

    compareToggle: "बैंक FD से तुलना करें (टैक्स और महंगाई के बाद)",
    compareDesc: "देखें कि म्यूचुअल फंड का LTCG टैक्स लाभ बैंक FD के मुकाबले कितना बेहतर है।",
    fdRateLabel: "बैंक FD दर (%)",
    taxSlabLabel: "टैक्स स्लैब",
    inflationLabel: "सालाना महंगाई (%)",
    fdCardTitle: "बैंक FD में यही राशि (टैक्स के बाद)",
    fdCardSub: (rate, slab) => `${rate}% ब्याज, हर साल ${slab}% टैक्स कटने के बाद`,
    mfPostTaxTitle: "12.5% LTCG टैक्स के बाद म्यूचुअल फंड",
    mfPostTaxSub: "₹1.25 लाख सालाना टैक्स-फ्री LTCG छूट सहित",
    fdExtraEdge: (edge) => `FD के मुकाबले MF से +${edge} ज्यादा लाभ`,
    realValueTitle: "आज की खरीदारी क्षमता",
    realValueSub: (inf, fdReal) =>
      `${inf}% महंगाई के बाद MF की आज की वैल्यू (FD वैल्यू: ${fdReal})`,

    growthChartTitle: "साल दर साल एकमुश्त निवेश की बढ़त",
    growthChartSub: "देखें कि समय के साथ कंपाउंडिंग आपकी मूल पूंजी को कैसे बढ़ाती है",
    legendPrincipal: "मूल पूंजी",
    legendMf: "म्यूचुअल फंड वैल्यू",
    legendFd: "बैंक FD (टैक्स के बाद)",
    viewChart: "ग्रोथ चार्ट",
    viewTable: "वार्षिक तालिका",
    colYear: "साल",
    colPrincipal: "निवेशित पूंजी",
    colProfit: "अनुमानित लाभ",
    colMfTotal: "MF वैल्यू",
    colFdTotal: "FD (टैक्स के बाद)",

    waGreeting: (name) => (name ? `नमस्ते *${name}*,` : `नमस्ते,`),
    waIntro: () =>
      `*Dalal Investments* की ओर से आपकी *एकमुश्त (Lumpsum) निवेश योजना* नीचे प्रस्तुत है:`,
    waPlanHeader: "1️⃣ *निवेश योजना का विवरण*",
    waPrincipal: "एकमुश्त निवेश राशि",
    waDuration: "निवेश की अवधि",
    waReturn: "अनुमानित सालाना रिटर्न",
    waOutcomeHeader: "2️⃣ *अनुमानित वेल्थ परिणाम*",
    waInvested: "कुल निवेशित पूंजी",
    waProfit: "कंपाउंडिंग से अर्जित लाभ",
    waMultiplier: "पूंजी ग्रोथ मल्टीप्लायर",
    waTotal: "अनुमानित कुल फंड",
    waFdBlock: (fdRate, slab, fdVal, mfNet, edge) =>
      `\n3️⃣ *टैक्स के बाद बैंक FD बनाम म्यूचुअल फंड*\n` +
      `• बैंक FD (${fdRate}% @ ${slab}% सालाना टैक्स): *${fdVal}*\n` +
      `• म्यूचुअल फंड (12.5% LTCG टैक्स के बाद): *${mfNet}*\n` +
      `• *म्यूचुअल फंड से अतिरिक्त टैक्स-बचत लाभ: +${edge}*\n`,
    waRealLine: (inf, mfReal, fdReal) =>
      `• आज की खरीदारी क्षमता (${inf}% महंगाई के बाद): MF *${mfReal}* बनाम FD *${fdReal}*\n`,
    waTakeawayHeader: "💡 *मुख्य सारांश:*",
    waDisclaimer:
      "अस्वीकरण: म्यूचुअल फंड निवेश बाजार जोखिमों के अधीन हैं। यह गणना केवल योजना बनाने के उद्देश्य से है।",
    pdfTitle: "एकमुश्त (Lumpsum) निवेश योजना (Dalal Investments)",
    pdfSubtitle: "दीर्घकालिक पूंजी वृद्धि और पोस्ट-टैक्स तुलना विश्लेषण",
  },
  gu: {
    sectionTitle: "1. એકસાથે (Lumpsum) રોકાણની વિગતો દાખલ કરો",
    sectionSub: "તમારી રોકાણ રકમ, અંદાજિત વળતર અને સમયગાળો પસંદ કરો.",
    principalLabel: "એકસાથે રોકાણ રકમ",
    principalDesc: "આજે તમે એકસાથે જે કુલ રકમ રોકવા માંગો છો.",
    returnLabel: "અંદાજિત વાર્ષિક વળતર",
    returnDesc: "લાંબા ગાળે ઇક્વિટી ફંડ સરેરાશ 11%–13% વળતર આપે છે.",
    yearsLabel: "રોકાણનો સમયગાળો",
    yearsDesc: "સતત કમ્પાઉન્ડિંગ તમારી મૂડીને અનેક ગણી વધારે છે.",
    yearsUnit: "વર્ષ",
    yrShort: "વર્ષ",

    resultHeader: "2. અંદાજિત વેલ્થ રિપોર્ટ",
    heroTitle: "અંદાજિત કુલ ફંડ",
    investedLabel: "રોકેલી મૂડી",
    profitLabel: "અંદાજિત નફો",
    multiplierLabel: "વેલ્થ મલ્ટિપ્લાયર",
    multiplierSub: "તમારી મૂડી પર કુલ ગણો વધારો",
    takeawaySentence: (principal, profit, total, yrs, mult) =>
      `${principal} નું એકસાથે રોકાણ ${yrs} વર્ષમાં કમ્પાઉન્ડિંગ દ્વારા ${profit} નો નફો આપે છે — જેનાથી તમારી મૂડી ${mult} ગણી વધીને ${total} થાય છે.`,

    compareToggle: "બેંક FD સાથે સરખામણી કરો (ટેક્સ અને મોંઘવારી પછી)",
    compareDesc: "જુઓ કે મ્યુચ્યુઅલ ફંડનો LTCG ટેક્સ ફાયદો બેંક FD કરતાં કેટલો શ્રેષ્ઠ છે.",
    fdRateLabel: "બેંક FD દર (%)",
    taxSlabLabel: "ટેક્સ સ્લેબ",
    inflationLabel: "વાર્ષિક મોંઘવારી (%)",
    fdCardTitle: "બેંક FD માં આટલી જ રકમ (ટેક્સ પછી)",
    fdCardSub: (rate, slab) => `${rate}% વ્યાજ, દર વર્ષે ${slab}% ટેક્સ બાદ કર્યા પછી`,
    mfPostTaxTitle: "12.5% LTCG ટેક્સ પછી મ્યુચ્યુઅલ ફંડ",
    mfPostTaxSub: "₹1.25 લાખ વાર્ષિક ટેક્સ-ફ્રી LTCG મુક્તિ સહિત",
    fdExtraEdge: (edge) => `FD કરતાં MF માં +${edge} વધુ ફાયદો`,
    realValueTitle: "આજની ખરીદશક્તિ",
    realValueSub: (inf, fdReal) =>
      `${inf}% મોંઘવારી પછી MF નું આજનું મૂલ્ય (FD મૂલ્ય: ${fdReal})`,

    growthChartTitle: "દર વર્ષે એકસાથે રોકાણની વૃદ્ધિ",
    growthChartSub: "જુઓ કે સમય જતાં કમ્પાઉન્ડિંગ તમારી મૂડીને કેવી રીતે વધારે છે",
    legendPrincipal: "મૂળ મૂડી",
    legendMf: "મ્યુચ્યુઅલ ફંડ મૂલ્ય",
    legendFd: "બેંક FD (ટેક્સ પછી)",
    viewChart: "ગ્રોથ ચાર્ટ",
    viewTable: "વાર્ષિક કોષ્ટક",
    colYear: "વર્ષ",
    colPrincipal: "રોકેલી મૂડી",
    colProfit: "અંદાજિત નફો",
    colMfTotal: "MF મૂલ્ય",
    colFdTotal: "FD (ટેક્સ પછી)",

    waGreeting: (name) => (name ? `નમસ્તે *${name}*,` : `નમસ્તે,`),
    waIntro: () =>
      `*Dalal Investments* તરફથી તમારું *એકસાથે (Lumpsum) રોકાણ આયોજન* નીચે મુજબ છે:`,
    waPlanHeader: "1️⃣ *રોકાણ યોજનાની વિગતો*",
    waPrincipal: "એકસાથે રોકાણ રકમ",
    waDuration: "રોકાણનો સમયગાળો",
    waReturn: "અંદાજિત વાર્ષિક વળતર",
    waOutcomeHeader: "2️⃣ *અંદાજિત વેલ્થ પરિણામ*",
    waInvested: "કુલ રોકેલી મૂડી",
    waProfit: "કમ્પાઉન્ડિંગ દ્વારા મળેલો નફો",
    waMultiplier: "મૂડી ગ્રોથ મલ્ટિપ્લાયર",
    waTotal: "અંદાજિત કુલ ફંડ",
    waFdBlock: (fdRate, slab, fdVal, mfNet, edge) =>
      `\n3️⃣ *ટેક્સ પછી બેંક FD વિ. મ્યુચ્યુઅલ ફંડ*\n` +
      `• બેંક FD (${fdRate}% @ ${slab}% વાર્ષિક ટેક્સ): *${fdVal}*\n` +
      `• મ્યુચ્યુઅલ ફંડ (12.5% LTCG ટેક્સ પછી): *${mfNet}*\n` +
      `• *મ્યુચ્યુઅલ ફંડથી વધારાનો ટેક્સ-બચત નફો: +${edge}*\n`,
    waRealLine: (inf, mfReal, fdReal) =>
      `• આજની ખરીદશક્તિ (${inf}% મોંઘવારી પછી): MF *${mfReal}* વિ. FD *${fdReal}*\n`,
    waTakeawayHeader: "💡 *મુખ્ય સારાંશ:*",
    waDisclaimer:
      "સૂચના: મ્યુચ્યુઅલ ફંડ રોકાણો બજારના જોખમોને આધીન છે. આ ગણતરી માત્ર સમજૂતી માટે છે.",
    pdfTitle: "એકસાથે (Lumpsum) રોકાણ આયોજન (Dalal Investments)",
    pdfSubtitle: "લાંબા ગાળાની મૂડી વૃદ્ધિ અને પોસ્ટ-ટેક્સ સરખામણી વિશ્લેષણ",
  },
};

const TAX_SLAB_OPTIONS = [
  { value: 0, label: "0% (Nil Tax)" },
  { value: 10, label: "10% Slab" },
  { value: 20, label: "20% Slab" },
  { value: 30, label: "30% Slab" },
];

const CustomLumpsumTooltip = ({ active, payload, t, showComparison }) => {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/15 rounded-xl p-3.5 shadow-xl space-y-2 min-w-[220px] font-sans text-xs z-50">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-1.5">
        <span className="font-bold text-slate-900 dark:text-white">
          {t.yrShort} {row.year}
        </span>
        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
          {t.legendPrincipal}: {formatINRCompact(row.principal)}
        </span>
      </div>
      <div className="space-y-1.5 tabular-nums">
        {showComparison && (
          <div className="flex justify-between gap-4">
            <span className="text-amber-600 dark:text-amber-400">{t.legendFd}:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {formatINRCompact(row.fdPostTaxValue)}
            </span>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <span className="text-emerald-600 dark:text-emerald-400">{t.profitLabel}:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            +{formatINRCompact(row.mfGain)}
          </span>
        </div>
        <div className="flex justify-between gap-4 pt-1.5 border-t border-slate-100 dark:border-white/10">
          <span className="font-bold text-slate-900 dark:text-white">{t.legendMf}:</span>
          <span className="font-extrabold text-slate-900 dark:text-white">
            {formatINRCompact(row.mfValue)}
          </span>
        </div>
      </div>
    </div>
  );
};

const LumpsumCalculator = ({ clientName, lang = "en", onSummaryChange }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [principal, setPrincipal] = useState(500000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(10);

  // Optional Post-Tax FD & Inflation Comparison
  const [showComparison, setShowComparison] = useState(true);
  const [fdRate, setFdRate] = useState(7);
  const [taxSlab, setTaxSlab] = useState(30);
  const [inflationRate, setInflationRate] = useState(6);

  const [activeView, setActiveView] = useState("chart");

  const result = useMemo(() => {
    const cap = Number(principal) || 0;
    const rate = Number(annualReturn) || 0;
    const yrs = Math.max(1, Number(years) || 1);

    const mfFutureValue = cap * Math.pow(1 + rate / 100, yrs);
    const mfGrossGain = Math.max(0, mfFutureValue - cap);

    // Equity MF LTCG: 12.5% above ₹1.25L annual exemption (for holding > 1 yr)
    const taxableMfGain = yrs > 1 ? Math.max(0, mfGrossGain - 125000) : mfGrossGain;
    const mfTaxRate = yrs > 1 ? 0.125 : 0.2;
    const mfPostTaxValue = mfFutureValue - taxableMfGain * mfTaxRate;

    // FD: Interest taxed annually at slab rate
    const fdPostTaxRate = ((Number(fdRate) || 0) / 100) * (1 - (Number(taxSlab) || 0) / 100);
    const fdPostTaxValue = cap * Math.pow(1 + fdPostTaxRate, yrs);

    // Inflation-adjusted purchasing power
    const inflationFactor = Math.pow(1 + (Number(inflationRate) || 0) / 100, yrs);
    const mfRealValue = mfPostTaxValue / inflationFactor;
    const fdRealValue = fdPostTaxValue / inflationFactor;

    const multiplier = cap > 0 ? (mfFutureValue / cap).toFixed(2) : "1.00";

    const yearlySchedule = [];
    for (let yr = 1; yr <= yrs; yr++) {
      const mfVal = cap * Math.pow(1 + rate / 100, yr);
      const fdVal = cap * Math.pow(1 + fdPostTaxRate, yr);
      yearlySchedule.push({
        year: yr,
        principal: Math.round(cap),
        mfGain: Math.round(mfVal - cap),
        mfValue: Math.round(mfVal),
        fdPostTaxValue: Math.round(fdVal),
      });
    }

    return {
      principal: Math.round(cap),
      mfFutureValue: Math.round(mfFutureValue),
      mfGrossGain: Math.round(mfGrossGain),
      mfPostTaxValue: Math.round(mfPostTaxValue),
      fdPostTaxValue: Math.round(fdPostTaxValue),
      postTaxAdvantage: Math.round(mfPostTaxValue - fdPostTaxValue),
      mfRealValue: Math.round(mfRealValue),
      fdRealValue: Math.round(fdRealValue),
      multiplier,
      yearlySchedule,
    };
  }, [principal, annualReturn, years, fdRate, taxSlab, inflationRate]);

  const principalRatio =
    result.mfFutureValue > 0
      ? Math.min(100, Math.round((result.principal / result.mfFutureValue) * 100))
      : 0;
  const profitRatio = 100 - principalRatio;

  useEffect(() => {
    const takeaway = t.takeawaySentence(
      formatINRCompact(result.principal),
      formatINRCompact(result.mfGrossGain),
      formatINRCompact(result.mfFutureValue),
      years,
      result.multiplier
    );

    const extraCompareText = showComparison
      ? t.waFdBlock(
          fdRate,
          taxSlab,
          formatINRCompact(result.fdPostTaxValue),
          formatINRCompact(result.mfPostTaxValue),
          formatINRCompact(result.postTaxAdvantage)
        ) +
        t.waRealLine(
          inflationRate,
          formatINRCompact(result.mfRealValue),
          formatINRCompact(result.fdRealValue)
        )
      : "";

    const text =
      `${t.waGreeting(clientName?.trim())}\n\n` +
      `${t.waIntro()}\n\n` +
      `${t.waPlanHeader}\n` +
      `• ${t.waPrincipal}: *${formatINR(principal)}*\n` +
      `• ${t.waDuration}: *${years} ${t.yearsUnit}*\n` +
      `• ${t.waReturn}: *${annualReturn}% p.a.*\n\n` +
      `${t.waOutcomeHeader}\n` +
      `• ${t.waInvested}: *${formatINRCompact(result.principal)}* (${principalRatio}%)\n` +
      `• ${t.waProfit}: *+${formatINRCompact(result.mfGrossGain)}* (${profitRatio}%)\n` +
      `• ${t.waMultiplier}: *${result.multiplier}x*\n` +
      `• *${t.waTotal}: ${formatINRCompact(result.mfFutureValue)}* (${formatINR(result.mfFutureValue)})\n` +
      extraCompareText +
      `\n${t.waTakeawayHeader}\n${takeaway}\n\n` +
      `_${t.waDisclaimer}_\n` +
      `— *Dalal Investments | Private Wealth Desk*`;

    const milestoneStep = years <= 5 ? 1 : years <= 15 ? 3 : 5;
    const milestones = result.yearlySchedule
      .filter((r) => r.year === 1 || r.year % milestoneStep === 0 || r.year === years)
      .map((r) => ({
        year: r.year,
        sip: "One-Time",
        invested: formatINRCompact(r.principal),
        profit: formatINRCompact(r.mfGain),
        total: formatINRCompact(r.mfValue),
      }));

    onSummaryChange({
      title: t.pdfTitle,
      subtitle: t.pdfSubtitle,
      takeaway,
      whatsappText: text,
      assumptions: [
        { label: t.waPrincipal, value: formatINRCompact(principal) },
        { label: t.waDuration, value: `${years} ${t.yearsUnit}` },
        { label: t.waReturn, value: `${annualReturn}% p.a.` },
        {
          label: "Benchmark",
          value: showComparison ? `FD ${fdRate}% (${taxSlab}% Tax)` : "Gross Compounding",
        },
      ],
      highlights: [
        {
          label: t.waInvested,
          sub: `${principalRatio}% of final value`,
          value: `${formatINRCompact(result.principal)} (${formatINR(result.principal)})`,
        },
        {
          label: t.waProfit,
          sub: `${profitRatio}% wealth gained via compounding`,
          value: `+${formatINRCompact(result.mfGrossGain)} (${formatINR(result.mfGrossGain)})`,
        },
        {
          label: t.waMultiplier,
          sub: t.multiplierSub,
          value: `${result.multiplier}x`,
        },
        ...(showComparison
          ? [
              {
                label: t.fdCardTitle,
                sub: t.fdCardSub(fdRate, taxSlab),
                value: formatINRCompact(result.fdPostTaxValue),
              },
              {
                label: t.mfPostTaxTitle,
                sub: t.mfPostTaxSub,
                value: `${formatINRCompact(result.mfPostTaxValue)} (Edge: +${formatINRCompact(result.postTaxAdvantage)})`,
              },
              {
                label: t.realValueTitle,
                sub: t.realValueSub(inflationRate, formatINRCompact(result.fdRealValue)),
                value: formatINRCompact(result.mfRealValue),
              },
            ]
          : []),
        {
          label: t.waTotal,
          sub: `Projected maturity value at the end of ${years} ${t.yearsUnit}`,
          value: `${formatINRCompact(result.mfFutureValue)} (${formatINR(result.mfFutureValue)})`,
          isHero: true,
        },
      ],
      milestones,
      disclaimer: t.waDisclaimer,
    });
  }, [
    clientName,
    principal,
    annualReturn,
    years,
    showComparison,
    fdRate,
    taxSlab,
    inflationRate,
    result,
    principalRatio,
    profitRatio,
    t,
    onSummaryChange,
  ]);

  return (
    <div className="space-y-8 w-full font-sans">
      
      {/* ================================================================= */}
      {/* TOP SECTION: STEP 1 — LUMPSUM PLAN FORM                           */}
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

        {/* Full-width Primary Amount Input */}
        <TactileSliderInput
          label={t.principalLabel}
          description={t.principalDesc}
          value={principal}
          onChange={setPrincipal}
          min={10000}
          max={50000000}
          sliderMax={10000000}
          step={25000}
          prefix="₹"
          presets={[
            { label: "₹1 Lakh", value: 100000 },
            { label: "₹5 Lakhs", value: 500000 },
            { label: "₹10 Lakhs", value: 1000000 },
            { label: "₹25 Lakhs", value: 2500000 },
            { label: "₹50 Lakhs", value: 5000000 },
            { label: "₹1 Crore", value: 10000000 },
          ]}
        />

        {/* 2-Column Return & Duration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
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
              { label: "7.5% (Arbitrage/Debt)", value: 7.5 },
              { label: "12% (Equity)", value: 12 },
              { label: "15% (Aggressive)", value: 15 },
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
            presets={[
              { label: `3 ${t.yearsUnit}`, value: 3 },
              { label: `5 ${t.yearsUnit}`, value: 5 },
              { label: `10 ${t.yearsUnit}`, value: 10 },
              { label: `15 ${t.yearsUnit}`, value: 15 },
            ]}
          />
        </div>

        {/* Post-Tax FD & Inflation Reality Check Bar */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <label className="flex items-start sm:items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showComparison}
                onChange={(e) => setShowComparison(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-600 cursor-pointer shrink-0 mt-0.5 sm:mt-0"
              />
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Scale size={16} />
              </div>
              <div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                  {t.compareToggle}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {t.compareDesc}
                </span>
              </div>
            </label>

            {showComparison && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:w-[460px] shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-white/10 animate-in fade-in duration-150">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {t.fdRateLabel}
                  </label>
                  <input
                    type="number"
                    step={0.25}
                    value={fdRate}
                    onChange={(e) => setFdRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-300 dark:border-white/15 focus:border-amber-500 text-xs font-bold text-slate-900 dark:text-white outline-none tabular-nums"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {t.taxSlabLabel}
                  </label>
                  <CustomDropdown
                    value={taxSlab}
                    options={TAX_SLAB_OPTIONS}
                    onChange={setTaxSlab}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {t.inflationLabel}
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    value={inflationRate}
                    onChange={(e) => setInflationRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-300 dark:border-white/15 focus:border-indigo-500 text-xs font-bold text-slate-900 dark:text-white outline-none tabular-nums"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* BOTTOM SECTION: STEP 2 — PROJECTED RESULTS & CHARTS               */}
      {/* ================================================================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t.resultHeader}
          </h3>
        </div>

        {/* High-Contrast Hero Result Banner */}
        <div className="rounded-2xl bg-slate-900 dark:bg-[#0F172A] border border-slate-800 dark:border-emerald-500/30 text-white p-6 shadow-md space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                <TrendingUp size={13} />
                <span>
                  {t.heroTitle} ({years} {t.yearsUnit})
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-white tabular-nums">
                  {formatINRCompact(result.mfFutureValue)}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-emerald-300 tabular-nums">
                  {formatINR(result.mfFutureValue)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                  {t.investedLabel}
                </span>
                <span className="text-lg sm:text-xl font-black text-white tabular-nums mt-0.5 block">
                  {formatINRCompact(result.principal)}
                </span>
                <span className="text-[11px] text-slate-400">
                  {principalRatio}% of final value
                </span>
              </div>

              <div className="bg-slate-800/90 border border-emerald-500/30 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  {t.profitLabel}
                </span>
                <span className="text-lg sm:text-xl font-black text-emerald-400 tabular-nums mt-0.5 block">
                  +{formatINRCompact(result.mfGrossGain)}
                </span>
                <span className="text-[11px] text-slate-400">
                  {profitRatio}% compounding gain
                </span>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                  {t.multiplierLabel}
                </span>
                <span className="text-lg sm:text-xl font-black text-amber-400 tabular-nums mt-0.5 block">
                  {result.multiplier}x
                </span>
                <span className="text-[11px] text-slate-400">
                  {t.multiplierSub}
                </span>
              </div>
            </div>
          </div>

          {/* 2-Tone Split Bar */}
          <div className="space-y-2">
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex p-0.5 gap-0.5">
              <div
                style={{ width: `${principalRatio}%` }}
                className="h-full rounded-l-full bg-indigo-400 transition-all duration-300"
              />
              <div
                style={{ width: `${profitRatio}%` }}
                className="h-full rounded-r-full bg-emerald-400 transition-all duration-300"
              />
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-200 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                {t.investedLabel}:{" "}
                <strong className="text-white">{formatINRCompact(result.principal)}</strong>{" "}
                <span className="text-slate-400">({principalRatio}%)</span>
              </span>

              <span className="inline-flex items-center gap-1.5 text-slate-200 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                {t.profitLabel}:{" "}
                <strong className="text-emerald-400">+{formatINRCompact(result.mfGrossGain)}</strong>{" "}
                <span className="text-slate-400">({profitRatio}%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Post-Tax FD vs MF & Purchasing Power Cards */}
        {showComparison && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-150">
            <div className="p-5 rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                  {t.fdCardTitle}
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white block tabular-nums">
                  {formatINRCompact(result.fdPostTaxValue)}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 block">
                  {t.fdCardSub(fdRate, taxSlab)}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Landmark size={18} />
              </div>
            </div>

            <div className="p-5 rounded-xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                  {t.mfPostTaxTitle}
                </span>
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 block tabular-nums">
                  {formatINRCompact(result.mfPostTaxValue)}
                </span>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                  {t.fdExtraEdge(formatINRCompact(result.postTaxAdvantage))}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
            </div>

            <div className="p-5 rounded-xl bg-purple-50/60 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/25 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-purple-800 dark:text-purple-300 block">
                  {t.realValueTitle}
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white block tabular-nums">
                  {formatINRCompact(result.mfRealValue)}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 block leading-relaxed">
                  {t.realValueSub(inflationRate, formatINRCompact(result.fdRealValue))}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Wallet size={18} />
              </div>
            </div>
          </div>
        )}

        {/* Full-Width Chart & Year-by-Year Table Card */}
        <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0B1120] shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {activeView === "chart" ? t.growthChartTitle : t.viewTable}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.growthChartSub}
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
                <span className="inline-flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  {t.legendPrincipal}
                </span>
                <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  {t.legendMf}
                </span>
                {showComparison && (
                  <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    {t.legendFd}
                  </span>
                )}
              </div>

              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart
                    data={result.yearlySchedule}
                    margin={{ top: 10, right: 16, left: 4, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="lumpMfGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.32} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="lumpCapGrad" x1="0" y1="0" x2="0" y2="1">
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
                    <Tooltip
                      content={
                        <CustomLumpsumTooltip t={t} showComparison={showComparison} />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="mfValue"
                      name={t.legendMf}
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#lumpMfGrad)"
                    />
                    {showComparison && (
                      <Area
                        type="monotone"
                        dataKey="fdPostTaxValue"
                        name={t.legendFd}
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fillOpacity={0}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="principal"
                      name={t.legendPrincipal}
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#lumpCapGrad)"
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
                    <th className="py-3 px-4">{t.colPrincipal}</th>
                    <th className="py-3 px-4">{t.colProfit}</th>
                    {showComparison && <th className="py-3 px-4">{t.colFdTotal}</th>}
                    <th className="py-3 px-4 text-right">{t.colMfTotal}</th>
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
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                        {formatINR(row.principal)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        +{formatINR(row.mfGain)}
                      </td>
                      {showComparison && (
                        <td className="py-2.5 px-4 font-semibold text-amber-600 dark:text-amber-400">
                          {formatINR(row.fdPostTaxValue)}
                        </td>
                      )}
                      <td className="py-2.5 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                        {formatINR(row.mfValue)}
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

export default LumpsumCalculator;