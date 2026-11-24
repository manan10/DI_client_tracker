import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowDownCircle,
  Sparkles,
  BarChart3,
  Table as TableIcon,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  TrendingUp,
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
    sectionTitle: "1. Configure Systematic Withdrawal Plan (SWP)",
    sectionSub:
      "Set your starting lumpsum corpus, desired monthly income, and optional yearly inflation step-up.",
    corpusLabel: "Total Corpus Invested Today",
    corpusDesc: "Starting lumpsum from which monthly payouts will be drawn.",
    withdrawalLabel: "Starting Monthly Withdrawal",
    withdrawalDesc: "Regular monthly income credited to your bank account.",
    stepUpLabel: "Yearly Withdrawal Increase (%)",
    stepUpDesc:
      "Increase your monthly payout every year to keep up with rising living costs (0% = fixed).",
    returnLabel: "Expected Annual Return (p.a.)",
    returnDesc: "Hybrid / Balanced Advantage funds typically aim for 8%–10% p.a.",
    yearsLabel: "Withdrawal Duration",
    yearsDesc: "Number of years you want this monthly income to continue.",
    yearsUnit: "Yrs",
    yrShort: "Yr",

    resultHeader: "2. Projected Cashflow & Corpus Longevity",
    heroTitle: "Remaining Final Corpus",
    totalWithdrawnLabel: "Total Cash Withdrawn",
    totalWithdrawnSub: "Cumulative monthly payouts received",
    totalBenefitLabel: "Total Value Created (Withdrawn + Left)",
    withdrawalRateLabel: "Initial Withdrawal Rate",
    safeRateNote: "≤ 6–7% p.a. is generally sustainable long-term",
    depletionAlert: (yr) =>
      `Corpus runs out in Year ${yr}. Reduce monthly SWP or lower annual step-up.`,
    sustainableBadge: (rate) =>
      `Sustainable! Corpus lasts all ${rate} years with surplus left.`,
    takeawaySentence: (
      corpus,
      monthly,
      yrs,
      totalWithdrawn,
      finalBal,
      stepUp
    ) =>
      `From a starting corpus of ${corpus}, you can draw ${monthly}/mo${stepUp > 0 ? ` (growing ${stepUp}% yearly)` : ""} for ${yrs} years — receiving ${totalWithdrawn} in total cashflow while still retaining ${finalBal}.`,

    chartTitle: "Remaining Corpus vs. Cumulative Cash Withdrawn",
    chartSub:
      "See how investment returns replenish your fund even as you withdraw monthly income",
    legendBalance: "Remaining Fund Balance",
    legendWithdrawn: "Cumulative Cash Withdrawn",
    viewChart: "Cashflow Chart",
    viewTable: "Year-by-Year Table",

    colYear: "Year",
    colMonthlySwp: "Monthly Payout",
    colYearOutflow: "Annual Cashflow",
    colCumWithdrawn: "Total Withdrawn",
    colEndBalance: "Year-End Corpus",

    waGreeting: (name) => (name ? `Namaste *${name}*,` : `Namaste,`),
    waIntro: (isStepUp) =>
      `Here is your personalized *${isStepUp ? "Inflation-Adjusted Step-Up SWP" : "Systematic Withdrawal Plan (SWP)"} Illustration* prepared by *Dalal Investments*:`,
    waPlanHeader: "1️⃣ *SWP Plan Parameters*",
    waCorpus: "Starting Corpus Invested",
    waMonthlySwp: "Starting Monthly Income",
    waStepUp: "Yearly Payout Step-Up",
    waDuration: "Withdrawal Horizon",
    waReturn: "Assumed Return Rate",
    waOutcomeHeader: "2️⃣ *Projected Income & Balance*",
    waTotalWithdrawn: "Total Monthly Income Received",
    waFinalCorpus: "Remaining Final Corpus",
    waTotalValue: "Total Benefit (Income + Balance)",
    waTakeawayHeader: "💡 *Key Takeaway:*",
    waDisclaimer:
      "Disclaimer: Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Figures above are arithmetic illustrations for planning purposes.",
    pdfTitle: "Systematic Withdrawal Plan (SWP) Illustration",
    pdfSubtitle: "Regular monthly cashflow & corpus sustainability projection",
  },
  hi: {
    sectionTitle: "1. सिस्टमैटिक विड्रॉल प्लान (SWP) विवरण दर्ज करें",
    sectionSub:
      "अपना शुरुआती फंड, हर महीने मिलने वाली पेंशन/इनकम और सालाना बढ़ोतरी चुनें।",
    corpusLabel: "आज निवेशित कुल फंड (Corpus)",
    corpusDesc: "वह शुरुआती पूंजी जिससे हर महीने आपको इनकम मिलेगी।",
    withdrawalLabel: "शुरुआती मासिक निकासी (SWP)",
    withdrawalDesc: "हर महीने आपके बैंक खाते में आने वाली नियमित राशि।",
    stepUpLabel: "सालाना निकासी बढ़ोतरी (%)",
    stepUpDesc:
      "महंगाई के साथ खर्च बढ़ने पर हर साल मासिक राशि बढ़ाएं (0% = समान)।",
    returnLabel: "अनुमानित सालाना रिटर्न (%)",
    returnDesc: "हाइब्रिड / बैलेंस्ड फंड आमतौर पर 8%–10% रिटर्न देते हैं।",
    yearsLabel: "निकासी की अवधि",
    yearsDesc: "आप कितने सालों तक यह मासिक इनकम चाहते हैं।",
    yearsUnit: "साल",
    yrShort: "वर्ष",

    resultHeader: "2. अनुमानित कैशफ्लो और फंड सुरक्षा रिपोर्ट",
    heroTitle: "अंत में बचा हुआ शेष फंड",
    totalWithdrawnLabel: "कुल निकाली गई नकद राशि",
    totalWithdrawnSub: "पूरी अवधि में प्राप्त कुल मासिक इनकम",
    totalBenefitLabel: "कुल लाभ (निकासी + शेष फंड)",
    withdrawalRateLabel: "शुरुआती वार्षिक निकासी दर",
    safeRateNote: "6%–7% सालाना निकासी दर लंबे समय तक सुरक्षित मानी जाती है",
    depletionAlert: (yr) =>
      `फंड ${yr}वें साल में समाप्त हो जाएगा। मासिक SWP या सालाना बढ़ोतरी कम करें।`,
    sustainableBadge: (yrs) =>
      `सुरक्षित योजना! आपका फंड पूरे ${yrs} साल तक चलेगा।`,
    takeawaySentence: (
      corpus,
      monthly,
      yrs,
      totalWithdrawn,
      finalBal,
      stepUp
    ) =>
      `${corpus} के शुरुआती फंड से आप ${yrs} साल तक हर महीने ${monthly}${stepUp > 0 ? ` (हर साल ${stepUp}% बढ़ोतरी के साथ)` : ""} निकाल सकते हैं — जिससे आपको कुल ${totalWithdrawn} नकद मिलेंगे और अंत में ${finalBal} शेष भी रहेंगे।`,

    chartTitle: "शेष फंड बैलेंस बनाम कुल निकाली गई राशि",
    chartSub: "देखें कि हर महीने निकासी के बावजूद रिटर्न आपके फंड को कैसे संभाले रखता है",
    legendBalance: "शेष फंड बैलेंस",
    legendWithdrawn: "कुल निकाली गई राशि",
    viewChart: "कैशफ्लो चार्ट",
    viewTable: "वार्षिक तालिका",

    colYear: "साल",
    colMonthlySwp: "मासिक इनकम",
    colYearOutflow: "वार्षिक निकासी",
    colCumWithdrawn: "कुल निकासी",
    colEndBalance: "वर्ष-अंत फंड",

    waGreeting: (name) => (name ? `नमस्ते *${name}*,` : `नमस्ते,`),
    waIntro: (isStepUp) =>
      `*Dalal Investments* की ओर से आपका *${isStepUp ? "स्टेप-अप SWP (मासिक इनकम)" : "सिस्टमैटिक विड्रॉल प्लान (SWP)"}* नीचे प्रस्तुत है:`,
    waPlanHeader: "1️⃣ *SWP योजना का विवरण*",
    waCorpus: "शुरुआती कुल फंड",
    waMonthlySwp: "शुरुआती मासिक इनकम",
    waStepUp: "सालाना इनकम बढ़ोतरी",
    waDuration: "निकासी अवधि",
    waReturn: "अनुमानित सालाना रिटर्न",
    waOutcomeHeader: "2️⃣ *अनुमानित इनकम और शेष बैलेंस*",
    waTotalWithdrawn: "कुल प्राप्त मासिक इनकम",
    waFinalCorpus: "अंत में बचा हुआ शेष फंड",
    waTotalValue: "कुल लाभ (प्राप्त इनकम + शेष फंड)",
    waTakeawayHeader: "💡 *मुख्य सारांश:*",
    waDisclaimer:
      "अस्वीकरण: म्यूचुअल फंड निवेश बाजार जोखिमों के अधीन हैं। यह गणना केवल योजना बनाने के उद्देश्य से है।",
    pdfTitle: "सिस्टमैटिक विड्रॉल प्लान (SWP) रिपोर्ट (Dalal Investments)",
    pdfSubtitle: "नियमित मासिक कैशफ्लो और फंड स्थिरता विश्लेषण",
  },
  gu: {
    sectionTitle: "1. સિસ્ટમેટિક વિડ્રોઅલ પ્લાન (SWP) વિગતો દાખલ કરો",
    sectionSub:
      "તમારું શરૂઆતનું ફંડ, દર મહિને મળતી નિયમિત આવક અને વાર્ષિક વધારો પસંદ કરો.",
    corpusLabel: "આજે રોકેલું કુલ ફંડ (Corpus)",
    corpusDesc: "તે શરૂઆતની મૂડી જેમાંથી દર મહિને તમને આવક મળશે.",
    withdrawalLabel: "શરૂઆતનો માસિક ઉપાડ (SWP)",
    withdrawalDesc: "દર મહિને તમારા બેંક ખાતામાં જમા થતી નિયમિત રકમ.",
    stepUpLabel: "વાર્ષિક ઉપાડ વધારો (%)",
    stepUpDesc:
      "મોંઘવારી મુજબ દર વર્ષે માસિક રકમ વધારો (0% = એકસરખી).",
    returnLabel: "અંદાજિત વાર્ષિક વળતર (%)",
    returnDesc: "હાઇબ્રિડ / બેલેન્સ્ડ ફંડ સામાન્ય રીતે 8%–10% વળતર આપે છે.",
    yearsLabel: "ઉપાડનો સમયગાળો",
    yearsDesc: "તમે કેટલા વર્ષ સુધી આ માસિક આવક ઈચ્છો છો.",
    yearsUnit: "વર્ષ",
    yrShort: "વર્ષ",

    resultHeader: "2. અંદાજિત કેશફ્લો અને ફંડ સુરક્ષા રિપોર્ટ",
    heroTitle: "અંતે બચેલું શેષ ફંડ",
    totalWithdrawnLabel: "કુલ ઉપાડેલી રોકડ રકમ",
    totalWithdrawnSub: "સમગ્ર સમયગાળામાં મળેલી કુલ માસિક આવક",
    totalBenefitLabel: "કુલ મૂલ્ય (ઉપાડ + બાકી ફંડ)",
    withdrawalRateLabel: "શરૂઆતનો વાર્ષિક ઉપાડ દર",
    safeRateNote: "6%–7% વાર્ષિક ઉપાડ દર લાંબા ગાળે સુરક્ષિત ગણાય છે",
    depletionAlert: (yr) =>
      `ફંડ ${yr}મા વર્ષે પૂરું થઈ જશે. માસિક SWP અથવા વાર્ષિક વધારો ઘટાડો.`,
    sustainableBadge: (yrs) =>
      `સુરક્ષિત યોજના! તમારું ફંડ પૂરા ${yrs} વર્ષ સુધી ચાલશે.`,
    takeawaySentence: (
      corpus,
      monthly,
      yrs,
      totalWithdrawn,
      finalBal,
      stepUp
    ) =>
      `${corpus} ના શરૂઆતના ફંડમાંથી તમે ${yrs} વર્ષ સુધી દર મહિને ${monthly}${stepUp > 0 ? ` (દર વર્ષે ${stepUp}% વધારા સાથે)` : ""} ઉપાડી શકો છો — જેનાથી તમને કુલ ${totalWithdrawn} રોકડ મળશે અને અંતે ${finalBal} બાકી પણ રહેશે.`,

    chartTitle: "બાકી ફંડ બેલેન્સ વિ. કુલ ઉપાડેલી રકમ",
    chartSub: "જુઓ કે દર મહિને ઉપાડ છતાં વળતર તમારા ફંડને કેવી રીતે જાળવી રાખે છે",
    legendBalance: "બાકી ફંડ બેલેન્સ",
    legendWithdrawn: "કુલ ઉપાડેલી રકમ",
    viewChart: "કેશફ્લો ચાર્ટ",
    viewTable: "વાર્ષિક કોષ્ટક",

    colYear: "વર્ષ",
    colMonthlySwp: "માસિક આવક",
    colYearOutflow: "વાર્ષિક ઉપાડ",
    colCumWithdrawn: "કુલ ઉપાડ",
    colEndBalance: "વર્ષ-અંત ફંડ",

    waGreeting: (name) => (name ? `નમસ્તે *${name}*,` : `નમસ્તે,`),
    waIntro: (isStepUp) =>
      `*Dalal Investments* તરફથી તમારો *${isStepUp ? "સ્ટેપ-અપ SWP (માસિક આવક)" : "સિસ્ટમેટિક વિડ્રોઅલ પ્લાન (SWP)"}* નીચે મુજબ છે:`,
    waPlanHeader: "1️⃣ *SWP યોજનાની વિગતો*",
    waCorpus: "શરૂઆતનું કુલ ફંડ",
    waMonthlySwp: "શરૂઆતની માસિક આવક",
    waStepUp: "વાર્ષિક આવક વધારો",
    waDuration: "ઉપાડ સમયગાળો",
    waReturn: "અંદાજિત વાર્ષિક વળતર",
    waOutcomeHeader: "2️⃣ *અંદાજિત આવક અને બાકી બેલેન્સ*",
    waTotalWithdrawn: "કુલ મળેલી માસિક આવક",
    waFinalCorpus: "અંતે બચેલું શેષ ફંડ",
    waTotalValue: "કુલ લાભ (મળેલી આવક + બાકી ફંડ)",
    waTakeawayHeader: "💡 *મુખ્ય સારાંશ:*",
    waDisclaimer:
      "સૂચના: મ્યુચ્યુઅલ ફંડ રોકાણો બજારના જોખમોને આધીન છે. આ ગણતરી માત્ર સમજૂતી માટે છે.",
    pdfTitle: "સિસ્ટમેટિક વિડ્રોઅલ પ્લાન (SWP) રિપોર્ટ (Dalal Investments)",
    pdfSubtitle: "નિયમિત માસિક કેશફ્લો અને ફંડ સ્થિરતા વિશ્લેષણ",
  },
};

const CustomSwpTooltip = ({ active, payload, t }) => {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/15 rounded-xl p-3.5 shadow-xl space-y-2 min-w-[225px] font-sans text-xs z-50">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-1.5">
        <span className="font-bold text-slate-900 dark:text-white">
          {t.yrShort} {row.year}
        </span>
        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          {t.colMonthlySwp}: {formatINR(row.monthlySwp)}
        </span>
      </div>
      <div className="space-y-1.5 tabular-nums">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">{t.legendWithdrawn}:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">
            {formatINRCompact(row.cumWithdrawn)}
          </span>
        </div>
        <div className="flex justify-between gap-4 pt-1.5 border-t border-slate-100 dark:border-white/10">
          <span className="font-bold text-slate-900 dark:text-white">{t.colEndBalance}:</span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatINRCompact(row.endBalance)}
          </span>
        </div>
      </div>
    </div>
  );
};

const SwpCalculator = ({ clientName, lang = "en", onSummaryChange }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [initialCorpus, setInitialCorpus] = useState(5000000); // ₹50L
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(30000);
  const [stepUpPct, setStepUpPct] = useState(5);
  const [annualReturn, setAnnualReturn] = useState(9);
  const [years, setYears] = useState(20);

  const [activeView, setActiveView] = useState("chart");

  const result = useMemo(() => {
    const startCap = Math.max(0, Number(initialCorpus) || 0);
    const startSwp = Math.max(0, Number(monthlyWithdrawal) || 0);
    const step = Number(stepUpPct) || 0;
    const rate = (Number(annualReturn) || 0) / 100 / 12;
    const yrs = Math.max(1, Number(years) || 1);

    let balance = startCap;
    let cumWithdrawn = 0;
    let currentSwp = startSwp;
    let depletedAtYear = null;
    const yearlySchedule = [];

    for (let yr = 1; yr <= yrs; yr++) {
      let yearOutflow = 0;
      for (let m = 1; m <= 12; m++) {
        if (balance <= 0) {
          balance = 0;
          continue;
        }
        balance = balance * (1 + rate);
        const actualDraw = Math.min(balance, currentSwp);
        balance -= actualDraw;
        cumWithdrawn += actualDraw;
        yearOutflow += actualDraw;

        if (balance <= 0 && depletedAtYear === null) {
          depletedAtYear = yr;
        }
      }

      yearlySchedule.push({
        year: yr,
        monthlySwp: Math.round(currentSwp),
        yearOutflow: Math.round(yearOutflow),
        cumWithdrawn: Math.round(cumWithdrawn),
        endBalance: Math.round(balance),
      });

      currentSwp = currentSwp * (1 + step / 100);
    }

    const initialAnnualRatePct =
      startCap > 0 ? (((startSwp * 12) / startCap) * 100).toFixed(1) : "0.0";

    const finalMonthlySwp = Math.round(
      startSwp * Math.pow(1 + step / 100, Math.max(0, yrs - 1))
    );

    return {
      initialCorpus: Math.round(startCap),
      totalWithdrawn: Math.round(cumWithdrawn),
      finalBalance: Math.round(balance),
      totalValueCreated: Math.round(cumWithdrawn + balance),
      initialAnnualRatePct,
      finalMonthlySwp,
      depletedAtYear,
      yearlySchedule,
    };
  }, [initialCorpus, monthlyWithdrawal, stepUpPct, annualReturn, years]);

  useEffect(() => {
    const takeaway = t.takeawaySentence(
      formatINRCompact(result.initialCorpus),
      formatINR(monthlyWithdrawal),
      years,
      formatINRCompact(result.totalWithdrawn),
      formatINRCompact(result.finalBalance),
      stepUpPct
    );

    const stepUpLine =
      stepUpPct > 0
        ? `• ${t.waStepUp}: *${stepUpPct}%* (Grows from ${formatINR(monthlyWithdrawal)} to ${formatINR(result.finalMonthlySwp)}/mo)\n`
        : `• ${t.waStepUp}: *0%* (Fixed monthly payout)\n`;

    const text =
      `${t.waGreeting(clientName?.trim())}\n\n` +
      `${t.waIntro(stepUpPct > 0)}\n\n` +
      `${t.waPlanHeader}\n` +
      `• ${t.waCorpus}: *${formatINRCompact(result.initialCorpus)}* (${formatINR(result.initialCorpus)})\n` +
      `• ${t.waMonthlySwp}: *${formatINR(monthlyWithdrawal)}/month*\n` +
      stepUpLine +
      `• ${t.waDuration}: *${years} ${t.yearsUnit}*\n` +
      `• ${t.waReturn}: *${annualReturn}% p.a.*\n\n` +
      `${t.waOutcomeHeader}\n` +
      `• ${t.waTotalWithdrawn}: *${formatINRCompact(result.totalWithdrawn)}*\n` +
      `• ${t.waFinalCorpus}: *${formatINRCompact(result.finalBalance)}*\n` +
      `• *${t.waTotalValue}: ${formatINRCompact(result.totalValueCreated)}*\n\n` +
      `${t.waTakeawayHeader}\n${takeaway}\n\n` +
      `_${t.waDisclaimer}_\n` +
      `— *Dalal Investments | Private Wealth Desk*`;

    const milestoneStep = years <= 5 ? 1 : years <= 15 ? 3 : 5;
    const milestones = result.yearlySchedule
      .filter((r) => r.year === 1 || r.year % milestoneStep === 0 || r.year === years)
      .map((r) => ({
        year: r.year,
        sip: `${formatINR(r.monthlySwp)}/mo`,
        invested: formatINRCompact(result.initialCorpus),
        profit: `Out: ${formatINRCompact(r.cumWithdrawn)}`,
        total: formatINRCompact(r.endBalance),
      }));

    onSummaryChange({
      title: t.pdfTitle,
      subtitle: t.pdfSubtitle,
      takeaway,
      whatsappText: text,
      assumptions: [
        { label: t.waCorpus, value: formatINRCompact(result.initialCorpus) },
        { label: t.waMonthlySwp, value: `${formatINR(monthlyWithdrawal)} (+${stepUpPct}%)` },
        { label: t.waDuration, value: `${years} ${t.yearsUnit}` },
        { label: t.waReturn, value: `${annualReturn}% p.a.` },
      ],
      highlights: [
        {
          label: t.waTotalWithdrawn,
          sub: `Total monthly payouts received over ${years} ${t.yearsUnit}`,
          value: formatINRCompact(result.totalWithdrawn),
        },
        {
          label: t.waTotalValue,
          sub: "Total cash withdrawn + remaining final corpus",
          value: formatINRCompact(result.totalValueCreated),
        },
        {
          label: t.waFinalCorpus,
          sub: `Remaining corpus balance at end of Year ${years}`,
          value: `${formatINRCompact(result.finalBalance)} (${formatINR(result.finalBalance)})`,
          isHero: true,
        },
      ],
      milestones,
      disclaimer: t.waDisclaimer,
    });
  }, [
    clientName,
    monthlyWithdrawal,
    stepUpPct,
    annualReturn,
    years,
    result,
    t,
    onSummaryChange,
  ]);

  return (
    <div className="space-y-8 w-full font-sans">
      
      {/* ================================================================= */}
      {/* TOP SECTION: SWP CONFIGURATION FORM                               */}
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

        {/* Row 1: Starting Corpus & Monthly Withdrawal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <TactileSliderInput
            label={t.corpusLabel}
            description={t.corpusDesc}
            value={initialCorpus}
            onChange={setInitialCorpus}
            min={100000}
            max={100000000}
            sliderMax={25000000}
            step={100000}
            prefix="₹"
            accent="indigo"
            presets={[
              { label: "₹25 L", value: 2500000 },
              { label: "₹50 L", value: 5000000 },
              { label: "₹1 Cr", value: 10000000 },
              { label: "₹2 Cr", value: 20000000 },
            ]}
          />

          <TactileSliderInput
            label={t.withdrawalLabel}
            description={t.withdrawalDesc}
            value={monthlyWithdrawal}
            onChange={setMonthlyWithdrawal}
            min={2000}
            max={1000000}
            sliderMax={200000}
            step={1000}
            prefix="₹"
            accent="amber"
            presets={[
              { label: "₹20,000", value: 20000 },
              { label: "₹30,000", value: 30000 },
              { label: "₹50,000", value: 50000 },
              { label: "₹1,00,000", value: 100000 },
            ]}
          />
        </div>

        {/* Row 2: Step-Up %, Expected Return, Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <TactileSliderInput
            label={t.stepUpLabel}
            description={t.stepUpDesc}
            value={stepUpPct}
            onChange={setStepUpPct}
            min={0}
            max={15}
            step={1}
            suffix="%"
            accent="amber"
            presets={[
              { label: "0% (Fixed)", value: 0 },
              { label: "5% (Inflation)", value: 5 },
              { label: "7% / yr", value: 7 },
            ]}
          />

          <TactileSliderInput
            label={t.returnLabel}
            description={t.returnDesc}
            value={annualReturn}
            onChange={setAnnualReturn}
            min={5}
            max={16}
            step={0.5}
            suffix="%"
            presets={[
              { label: "7.5% (Debt)", value: 7.5 },
              { label: "9% (Hybrid)", value: 9 },
              { label: "11% (Equity)", value: 11 },
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
              { label: `10 ${t.yearsUnit}`, value: 10 },
              { label: `15 ${t.yearsUnit}`, value: 15 },
              { label: `20 ${t.yearsUnit}`, value: 20 },
              { label: `25 ${t.yearsUnit}`, value: 25 },
            ]}
          />
        </div>
      </section>

      {/* ================================================================= */}
      {/* BOTTOM SECTION: CASHFLOW & LONGEVITY RESULTS                      */}
      {/* ================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t.resultHeader}
          </h3>

          {result.depletedAtYear !== null ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{t.depletionAlert(result.depletedAtYear)}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <ShieldCheck size={14} className="shrink-0" />
              <span>{t.sustainableBadge(years)}</span>
            </div>
          )}
        </div>

        {/* High-Contrast Hero Banner */}
        <div className="rounded-2xl bg-slate-900 dark:bg-[#0F172A] border border-slate-800 dark:border-emerald-500/30 text-white p-6 shadow-md space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                <ArrowDownCircle size={13} />
                <span>
                  {t.heroTitle} (Yr {years})
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-white tabular-nums">
                  {formatINRCompact(result.finalBalance)}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-emerald-300 tabular-nums">
                  {formatINR(result.finalBalance)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
              <div className="bg-slate-800/90 border border-amber-500/30 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                  {t.totalWithdrawnLabel}
                </span>
                <span className="text-lg font-black text-amber-400 tabular-nums mt-0.5 block">
                  {formatINRCompact(result.totalWithdrawn)}
                </span>
                <span className="text-[11px] text-slate-400">
                  Over {years} {t.yearsUnit}
                </span>
              </div>

              <div className="bg-slate-800/90 border border-emerald-500/30 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  {t.totalBenefitLabel}
                </span>
                <span className="text-lg font-black text-white tabular-nums mt-0.5 block">
                  {formatINRCompact(result.totalValueCreated)}
                </span>
                <span className="text-[11px] text-slate-400">
                  From {formatINRCompact(result.initialCorpus)}
                </span>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                  {t.withdrawalRateLabel}
                </span>
                <span className="text-lg font-black text-indigo-300 tabular-nums mt-0.5 block">
                  {result.initialAnnualRatePct}% p.a.
                </span>
                <span className="text-[11px] text-slate-400">
                  {t.safeRateNote}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plain-Language Summary Callout */}
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          <Sparkles size={17} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">
            {t.takeawaySentence(
              formatINRCompact(result.initialCorpus),
              formatINR(monthlyWithdrawal),
              years,
              formatINRCompact(result.totalWithdrawn),
              formatINRCompact(result.finalBalance),
              stepUpPct
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
                  {t.legendBalance}
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  {t.legendWithdrawn}
                </span>
              </div>

              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart
                    data={result.yearlySchedule}
                    margin={{ top: 10, right: 16, left: 4, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="swpBalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="swpOutGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
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
                    <Tooltip content={<CustomSwpTooltip t={t} />} />
                    <Area
                      type="monotone"
                      dataKey="endBalance"
                      name={t.legendBalance}
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#swpBalGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="cumWithdrawn"
                      name={t.legendWithdrawn}
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="url(#swpOutGrad)"
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
                    <th className="py-3 px-4">{t.colMonthlySwp}</th>
                    <th className="py-3 px-4">{t.colYearOutflow}</th>
                    <th className="py-3 px-4">{t.colCumWithdrawn}</th>
                    <th className="py-3 px-4 text-right">{t.colEndBalance}</th>
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
                      <td className="py-2.5 px-4 text-amber-600 dark:text-amber-400 font-semibold">
                        {formatINR(row.monthlySwp)}/mo
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                        {formatINRCompact(row.yearOutflow)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-amber-700 dark:text-amber-300">
                        {formatINRCompact(row.cumWithdrawn)}
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

export default SwpCalculator;