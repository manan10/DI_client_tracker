import React, { useState, useMemo, useEffect } from "react";
import { ArrowDownCircle, Sparkles, ShieldCheck, AlertTriangle } from "lucide-react";
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
    resultHeader: "2. Projected Cashflow & Corpus Longevity",
    heroTitle: "Remaining Final Corpus",
    totalWithdrawnLabel: "Total Withdrawn",
    totalBenefitLabel: "Total Value",
    withdrawalRateLabel: "Withdrawal Rate",
    safeRateNote: "≤ 6–7% p.a. sustainable",
    depletionAlert: (yr) =>
      `Corpus runs out in Year ${yr}. Reduce monthly SWP or lower annual step-up.`,
    sustainableBadge: (yrs) =>
      `Sustainable! Corpus lasts all ${yrs} years with surplus left.`,
    takeawaySentence: (corpus, monthly, yrs, totalWithdrawn, finalBal, stepUp) =>
      `From a starting corpus of ${corpus}, you can draw ${monthly}/mo${stepUp > 0 ? ` (growing ${stepUp}% yearly)` : ""} for ${yrs} years — receiving ${totalWithdrawn} in total cashflow while still retaining ${finalBal}.`,
    chartTitle: "Remaining Corpus vs. Cumulative Cash Withdrawn",
    chartSub:
      "See how investment returns replenish your fund even as you withdraw monthly income",
    legendBalance: "Remaining Fund Balance",
    legendWithdrawn: "Cumulative Cash Withdrawn",
    viewChart: "Cashflow Chart",
    colMonthlySwp: "Monthly Payout",
    colYearOutflow: "Annual Cashflow",
    colCumWithdrawn: "Total Withdrawn",
    colEndBalance: "Year-End Corpus",
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
    pdfTitle: "Systematic Withdrawal Plan (SWP) Illustration",
    pdfSubtitle: "Regular monthly cashflow & corpus sustainability projection",
  },
  hi: {
    ...COMMON_TRANSLATIONS.hi,
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
    resultHeader: "2. अनुमानित कैशफ्लो और फंड सुरक्षा रिपोर्ट",
    heroTitle: "अंत में बचा हुआ शेष फंड",
    totalWithdrawnLabel: "कुल निकासी",
    totalBenefitLabel: "कुल लाभ",
    withdrawalRateLabel: "निकासी दर",
    safeRateNote: "6%–7% सालाना सुरक्षित दर",
    depletionAlert: (yr) =>
      `फंड ${yr}वें साल में समाप्त हो जाएगा। मासिक SWP या सालाना बढ़ोतरी कम करें।`,
    sustainableBadge: (yrs) =>
      `सुरक्षित योजना! आपका फंड पूरे ${yrs} साल तक चलेगा।`,
    takeawaySentence: (corpus, monthly, yrs, totalWithdrawn, finalBal, stepUp) =>
      `${corpus} के शुरुआती फंड से आप ${yrs} साल तक हर महीने ${monthly}${stepUp > 0 ? ` (हर साल ${stepUp}% बढ़ोतरी के साथ)` : ""} निकाल सकते हैं — जिससे आपको कुल ${totalWithdrawn} नकद मिलेंगे और अंत में ${finalBal} शेष भी रहेंगे।`,
    chartTitle: "शेष फंड बैलेंस बनाम कुल निकाली गई राशि",
    chartSub: "देखें कि हर महीने निकासी के बावजूद रिटर्न आपके फंड को कैसे संभाले रखता है",
    legendBalance: "शेष फंड बैलेंस",
    legendWithdrawn: "कुल निकाली गई राशि",
    viewChart: "कैशफ्लो चार्ट",
    colMonthlySwp: "मासिक इनकम",
    colYearOutflow: "वार्षिक निकासी",
    colCumWithdrawn: "कुल निकासी",
    colEndBalance: "वर्ष-अंत फंड",
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
    pdfTitle: "सिस्टमैटिक विड्रॉल प्लान (SWP) रिपोर्ट (Dalal Investments)",
    pdfSubtitle: "नियमित मासिक कैशफ्लो और फंड स्थिरता विश्लेषण",
  },
  gu: {
    ...COMMON_TRANSLATIONS.gu,
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
    resultHeader: "2. અંદાજિત કેશફ્લો અને ફંડ સુરક્ષા રિપોર્ટ",
    heroTitle: "અંતે બચેલું શેષ ફંડ",
    totalWithdrawnLabel: "કુલ ઉપાડ",
    totalBenefitLabel: "કુલ મૂલ્ય",
    withdrawalRateLabel: "ઉપાડ દર",
    safeRateNote: "6%–7% વાર્ષિક સુરક્ષિત દર",
    depletionAlert: (yr) =>
      `ફંડ ${yr}મા વર્ષે પૂરું થઈ જશે. માસિક SWP અથવા વાર્ષિક વધારો ઘટાડો.`,
    sustainableBadge: (yrs) =>
      `સુરક્ષિત યોજના! તમારું ફંડ પૂરા ${yrs} વર્ષ સુધી ચાલશે.`,
    takeawaySentence: (corpus, monthly, yrs, totalWithdrawn, finalBal, stepUp) =>
      `${corpus} ના શરૂઆતના ફંડમાંથી તમે ${yrs} વર્ષ સુધી દર મહિને ${monthly}${stepUp > 0 ? ` (દર વર્ષે ${stepUp}% વધારા સાથે)` : ""} ઉપાડી શકો છો — જેનાથી તમને કુલ ${totalWithdrawn} રોકડ મળશે અને અંતે ${finalBal} બાકી પણ રહેશે.`,
    chartTitle: "બાકી ફંડ બેલેન્સ વિ. કુલ ઉપાડેલી રકમ",
    chartSub: "જુઓ કે દર મહિને ઉપાડ છતાં વળતર તમારા ફંડને કેવી રીતે જાળવી રાખે છે",
    legendBalance: "બાકી ફંડ બેલેન્સ",
    legendWithdrawn: "કુલ ઉપાડેલી રકમ",
    viewChart: "કેશફ્લો ચાર્ટ",
    colMonthlySwp: "માસિક આવક",
    colYearOutflow: "વાર્ષિક ઉપાડ",
    colCumWithdrawn: "કુલ ઉપાડ",
    colEndBalance: "વર્ષ-અંત ફંડ",
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
    pdfTitle: "સિસ્ટમેટિક વિડ્રોઅલ પ્લાન (SWP) રિપોર્ટ (Dalal Investments)",
    pdfSubtitle: "નિયમિત માસિક કેશફ્લો અને ફંડ સ્થિરતા વિશ્લેષણ",
  },
};

const CustomSwpTooltip = ({ active, payload, t }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-white/15 rounded-xl p-3 shadow-xl space-y-1.5 min-w-[210px] sm:min-w-[225px] font-sans text-xs z-50">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/15 pb-1.5">
        <span className="font-bold text-slate-900 dark:text-white">
          {t.yrShort} {row.year}
        </span>
        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          {t.colMonthlySwp}: {formatINR(row.monthlySwp)}
        </span>
      </div>
      <div className="space-y-1.5 tabular-nums">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500 dark:text-slate-400">{t.legendWithdrawn}:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">
            {formatINRCompact(row.cumWithdrawn)}
          </span>
        </div>
        <div className="flex justify-between gap-3 pt-1.5 border-t border-slate-200 dark:border-white/15">
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

  const [initialCorpus, setInitialCorpus] = useState(5000000);
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(30000);
  const [stepUpPct, setStepUpPct] = useState(5);
  const [annualReturn, setAnnualReturn] = useState(9);
  const [years, setYears] = useState(20);

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
  }, [clientName, monthlyWithdrawal, stepUpPct, annualReturn, years, result, t, onSummaryChange]);

  const chartLegends = [
    { label: t.legendBalance, textClass: "text-emerald-700 dark:text-emerald-300", dotClass: "bg-emerald-500" },
    { label: t.legendWithdrawn, textClass: "text-amber-700 dark:text-amber-300", dotClass: "bg-amber-500" },
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
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

      {/* SECTION 2: CASHFLOW & LONGEVITY RESULTS */}
      <section className="space-y-4 sm:space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-0.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            {t.resultHeader}
          </h3>

          {result.depletedAtYear !== null ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-slate-300 dark:border-white/15 text-rose-700 dark:text-rose-300 text-[11px] sm:text-xs font-bold">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{t.depletionAlert(result.depletedAtYear)}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-slate-300 dark:border-white/15 text-emerald-700 dark:text-emerald-300 text-[11px] sm:text-xs font-bold">
              <ShieldCheck size={14} className="shrink-0" />
              <span>{t.sustainableBadge(years)}</span>
            </div>
          )}
        </div>

        <HeroResultBanner
          badgeIcon={ArrowDownCircle}
          badgeText={`${t.heroTitle} (${t.yrShort} ${years})`}
          futureValue={result.finalBalance}
          kpis={[
            {
              label: t.totalWithdrawnLabel,
              labelColor: "text-amber-300",
              value: formatINRCompact(result.totalWithdrawn),
              valueColor: "text-amber-400",
              sub: `Over ${years} ${t.yearsUnit}`,
            },
            {
              label: t.totalBenefitLabel,
              labelColor: "text-emerald-300",
              value: formatINRCompact(result.totalValueCreated),
              valueColor: "text-white",
              sub: `From ${formatINRCompact(result.initialCorpus)}`,
              highlight: true,
            },
            {
              label: t.withdrawalRateLabel,
              labelColor: "text-indigo-300",
              value: `${result.initialAnnualRatePct}%`,
              valueColor: "text-indigo-300",
              sub: t.safeRateNote,
            },
          ]}
        />

        {/* Plain-Language Summary Callout */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-300 dark:border-white/15 shadow-xs flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
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
                    <linearGradient id="swpBalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="swpOutGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
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
          )}
          renderTable={() => (
            <table className="w-full text-left border-collapse text-[11px] sm:text-sm tabular-nums">
              <thead className="sticky top-0 bg-slate-100 dark:bg-[#131C31] border-b border-slate-300 dark:border-white/15 text-[11px] sm:text-xs font-extrabold text-slate-800 dark:text-slate-200">
                <tr>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colYear}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colMonthlySwp}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colYearOutflow}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colCumWithdrawn}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 text-right whitespace-nowrap">{t.colEndBalance}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {result.yearlySchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {t.yrShort} {row.year}
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-amber-600 dark:text-amber-400 font-semibold whitespace-nowrap">
                      {formatINR(row.monthlySwp)}/mo
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatINRCompact(row.yearOutflow)}
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 font-semibold text-amber-700 dark:text-amber-300 whitespace-nowrap">
                      {formatINRCompact(row.cumWithdrawn)}
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

export default SwpCalculator;