import React, { useState, useMemo, useEffect } from "react";
import {
  Clock,
  Sparkles,
  BarChart3,
  Table as TableIcon,
  AlertTriangle,
  TrendingUp,
  Zap,
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
import { calculateStepUpSip, formatINR, formatINRCompact } from "./mathUtils";
import { TactileSliderInput } from "./CalculatorControls";

const TRANSLATIONS = {
  en: {
    sectionTitle: "1. Compare Starting Today vs. Waiting",
    sectionSub:
      "See how delaying your investment by even a few years shrinks your final corpus—or forces a much higher monthly SIP later.",
    monthlyLabel: "Planned Monthly SIP",
    monthlyDesc: "The monthly amount you intend to invest.",
    totalYearsLabel: "Total Years Until Your Goal",
    totalYearsDesc: "Your target milestone timeline (e.g., retirement or child's college).",
    delayYearsLabel: "Delay in Starting (Years)",
    delayYearsDesc: "How many years you wait before starting your first SIP.",
    returnLabel: "Expected Annual Return (p.a.)",
    returnDesc: "Equity mutual funds historically average 11%–13% over long periods.",
    stepUpLabel: "Yearly SIP Step-Up (%)",
    stepUpDesc: "Optional annual percentage increase in your SIP (0% = fixed).",
    yearsUnit: "Yrs",
    yrShort: "Yr",

    resultHeader: "2. The True Cost of Waiting",
    heroTitle: "Wealth Lost Due to Waiting",
    startTodayLabel: "If You Start Today",
    startTodaySub: (yrs) => `Full ${yrs} years of compounding`,
    startDelayedLabel: (d) => `If You Wait ${d} ${d === 1 ? "Year" : "Years"}`,
    startDelayedSub: (rem) => `Only ${rem} years left to compound`,
    catchUpLabel: "Catch-Up SIP Required Later",
    catchUpSub: (extra) => `You'd need +${extra}/mo extra just to reach the same goal`,

    takeawaySentence: (sip, delay, totalYrs, todayCorpus, delayedCorpus, loss, catchUpSip) =>
      `Waiting just ${delay} ${delay === 1 ? "year" : "years"} to start a ${sip}/mo SIP shrinks your ${totalYrs}-year corpus from ${todayCorpus} down to ${delayedCorpus} — costing you ${loss} in lost compounding (or forcing you to invest ${catchUpSip}/mo later to catch up).`,

    chartTitle: "Start Today vs. Delayed Start Growth Curve",
    chartSub: "The gap between the green and amber curves is pure wealth lost to procrastination",
    legendToday: "Start Today",
    legendDelayed: (d) => `Wait ${d} ${d === 1 ? "Yr" : "Yrs"}`,
    viewChart: "Comparison Chart",
    viewTable: "Year-by-Year Table",

    colYear: "Year",
    colTodayBal: "Start Today Corpus",
    colDelayedBal: "Delayed Start Corpus",
    colGap: "Wealth Lost (Gap)",

    waGreeting: (name) => (name ? `Namaste *${name}*,` : `Namaste,`),
    waIntro: (delay) =>
      `Here is a *Cost of Delay Analysis (Waiting ${delay} ${delay === 1 ? "Year" : "Years"})* prepared by *Dalal Investments*:`,
    waPlanHeader: "1️⃣ *Assumptions*",
    waSip: "Planned Monthly SIP",
    waHorizon: "Total Goal Timeline",
    waDelay: "Delay in Starting",
    waReturn: "Assumed Return Rate",
    waOutcomeHeader: "2️⃣ *Impact of Delay*",
    waStartToday: "Corpus If You Start Today",
    waStartLater: "Corpus If You Wait",
    waLoss: "Permanent Wealth Lost (Cost of Delay)",
    waCatchUp: "Catch-Up Monthly SIP Needed Later",
    waTakeawayHeader: "💡 *Key Takeaway:*",
    waDisclaimer:
      "Disclaimer: Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Figures above are arithmetic illustrations for planning purposes.",
    pdfTitle: "Cost of Delay in Investing — Wealth Impact Report",
    pdfSubtitle: "Comparison between starting immediately vs. postponing your SIP",
  },
  hi: {
    sectionTitle: "1. आज शुरुआत करने बनाम देरी करने की तुलना करें",
    sectionSub:
      "देखें कि निवेश शुरू करने में कुछ साल की देरी आपके अंतिम फंड को कितना कम कर देती है।",
    monthlyLabel: "मासिक SIP राशि",
    monthlyDesc: "वह मासिक राशि जो आप निवेश करने की योजना बना रहे हैं।",
    totalYearsLabel: "लक्ष्य तक कुल समय (साल)",
    totalYearsDesc: "आपका कुल निवेश समय (जैसे रिटायरमेंट या बच्चों की पढ़ाई)।",
    delayYearsLabel: "शुरुआत करने में देरी (साल)",
    delayYearsDesc: "पहली SIP शुरू करने से पहले आप कितने साल इंतजार करते हैं।",
    returnLabel: "अनुमानित सालाना रिटर्न (%)",
    returnDesc: "लंबे समय में इक्विटी फंड औसतन 11%–13% रिटर्न देते हैं।",
    stepUpLabel: "सालाना SIP बढ़ोतरी (%)",
    stepUpDesc: "हर साल SIP में वैकल्पिक बढ़ोतरी (0% = समान)।",
    yearsUnit: "साल",
    yrShort: "वर्ष",

    resultHeader: "2. इंतजार करने की असली कीमत (Cost of Delay)",
    heroTitle: "देरी के कारण हुआ कुल नुकसान",
    startTodayLabel: "यदि आप आज शुरू करें",
    startTodaySub: (yrs) => `पूरे ${yrs} साल की कंपाउंडिंग`,
    startDelayedLabel: (d) => `यदि आप ${d} साल इंतजार करें`,
    startDelayedSub: (rem) => `सिर्फ ${rem} साल की कंपाउंडिंग बचेगी`,
    catchUpLabel: "बाद में आवश्यक कैच-अप SIP",
    catchUpSub: (extra) => `उसी लक्ष्य तक पहुँचने के लिए +${extra}/माह अतिरिक्त लगेंगे`,

    takeawaySentence: (sip, delay, totalYrs, todayCorpus, delayedCorpus, loss, catchUpSip) =>
      `${sip}/माह की SIP शुरू करने में सिर्फ ${delay} साल की देरी करने से आपका ${totalYrs} साल का फंड ${todayCorpus} से घटकर ${delayedCorpus} रह जाता है — यानी आपको सीधे ${loss} का नुकसान होता है (या बाद में बराबरी करने के लिए ${catchUpSip}/माह निवेश करना होगा)।`,

    chartTitle: "आज शुरुआत बनाम देरी से शुरुआत ग्रोथ ग्राफ",
    chartSub: "हरी और पीली रेखा के बीच का अंतर ही देरी से होने वाला नुकसान है",
    legendToday: "आज शुरुआत करें",
    legendDelayed: (d) => `${d} साल बाद शुरू करें`,
    viewChart: "तुलना चार्ट",
    viewTable: "वार्षिक तालिका",

    colYear: "साल",
    colTodayBal: "आज शुरू करने पर फंड",
    colDelayedBal: "देरी से शुरू करने पर फंड",
    colGap: "कुल नुकसान (अंतर)",

    waGreeting: (name) => (name ? `नमस्ते *${name}*,` : `नमस्ते,`),
    waIntro: (delay) =>
      `*Dalal Investments* की ओर से *निवेश में देरी की लागत (${delay} साल इंतजार)* का विश्लेषण नीचे प्रस्तुत है:`,
    waPlanHeader: "1️⃣ *निवेश विवरण*",
    waSip: "मासिक SIP राशि",
    waHorizon: "लक्ष्य तक कुल समय",
    waDelay: "शुरुआत में देरी",
    waReturn: "अनुमानित सालाना रिटर्न",
    waOutcomeHeader: "2️⃣ *देरी का प्रभाव*",
    waStartToday: "आज शुरू करने पर कुल फंड",
    waStartLater: "देरी से शुरू करने पर फंड",
    waLoss: "देरी के कारण हुआ सीधा नुकसान",
    waCatchUp: "बाद में बराबरी के लिए आवश्यक SIP",
    waTakeawayHeader: "💡 *मुख्य सारांश:*",
    waDisclaimer:
      "अस्वीकरण: म्यूचुअल फंड निवेश बाजार जोखिमों के अधीन हैं। यह गणना केवल योजना बनाने के उद्देश्य से है।",
    pdfTitle: "निवेश में देरी की लागत (Cost of Delay) रिपोर्ट",
    pdfSubtitle: "तुरंत शुरुआत करने बनाम निवेश टालने का तुलनात्मक विश्लेषण",
  },
  gu: {
    sectionTitle: "1. આજે શરૂઆત કરવા વિ. રાહ જોવાની સરખામણી કરો",
    sectionSub:
      "જુઓ કે રોકાણ શરૂ કરવામાં થોડા વર્ષનો વિલંબ તમારા અંતિમ ફંડને કેટલું ઘટાડી દે છે.",
    monthlyLabel: "માસિક SIP રકમ",
    monthlyDesc: "તમે દર મહિને જે રકમ રોકવાનું વિચારી રહ્યા છો.",
    totalYearsLabel: "લક્ષ્ય સુધીનો કુલ સમય (વર્ષ)",
    totalYearsDesc: "તમારો કુલ રોકાણ સમયગાળો (જેમ કે નિવૃત્તિ કે બાળકોનું શિક્ષણ).",
    delayYearsLabel: "શરૂઆત કરવામાં વિલંબ (વર્ષ)",
    delayYearsDesc: "પ્રથમ SIP શરૂ કરતા પહેલા તમે કેટલા વર્ષ રાહ જુઓ છો.",
    returnLabel: "અંદાજિત વાર્ષિક વળતર (%)",
    returnDesc: "લાંબા ગાળે ઇક્વિટી ફંડ સરેરાશ 11%–13% વળતર આપે છે.",
    stepUpLabel: "વાર્ષિક SIP વધારો (%)",
    stepUpDesc: "દર વર્ષે SIP માં વૈકલ્પિક વધારો (0% = એકસરખી).",
    yearsUnit: "વર્ષ",
    yrShort: "વર્ષ",

    resultHeader: "2. રાહ જોવાની અસલી કિંમત (Cost of Delay)",
    heroTitle: "વિલંબને કારણે થયેલું કુલ નુકસાન",
    startTodayLabel: "જો તમે આજે શરૂ કરો",
    startTodaySub: (yrs) => `પૂરા ${yrs} વર્ષનું કમ્પાઉન્ડિંગ`,
    startDelayedLabel: (d) => `જો તમે ${d} વર્ષ રાહ જુઓ`,
    startDelayedSub: (rem) => `ફક્ત ${rem} વર્ષનું કમ્પાઉન્ડિંગ બાકી રહેશે`,
    catchUpLabel: "પછીથી જરૂરી કેચ-અપ SIP",
    catchUpSub: (extra) => `તે જ લક્ષ્ય સુધી પહોંચવા +${extra}/માસ વધારાના લાગશે`,

    takeawaySentence: (sip, delay, totalYrs, todayCorpus, delayedCorpus, loss, catchUpSip) =>
      `${sip}/માસ ની SIP શરૂ કરવામાં ફક્ત ${delay} વર્ષનો વિલંબ કરવાથી તમારું ${totalYrs} વર્ષનું ફંડ ${todayCorpus} થી ઘટીને ${delayedCorpus} રહી જાય છે — એટલે કે તમને સીધું ${loss} નું નુકસાન થાય છે (અથવા પછી બરાબરી કરવા ${catchUpSip}/માસ રોકવા પડશે).`,

    chartTitle: "આજે શરૂઆત વિ. વિલંબથી શરૂઆત ગ્રોથ ગ્રાફ",
    chartSub: "લીલી અને પીળી રેખા વચ્ચેનો તફાવત એ વિલંબથી થતું નુકસાન છે",
    legendToday: "આજે શરૂ કરો",
    legendDelayed: (d) => `${d} વર્ષ પછી શરૂ કરો`,
    viewChart: "સરખામણી ચાર્ટ",
    viewTable: "વાર્ષિક કોષ્ટક",

    colYear: "વર્ષ",
    colTodayBal: "આજે શરૂ કરતા ફંડ",
    colDelayedBal: "વિલંબથી શરૂ કરતા ફંડ",
    colGap: "કુલ નુકસાન (તફાવત)",

    waGreeting: (name) => (name ? `નમસ્તે *${name}*,` : `નમસ્તે,`),
    waIntro: (delay) =>
      `*Dalal Investments* તરફથી *રોકાણમાં વિલંબની કિંમત (${delay} વર્ષ રાહ જોવી)* નું વિશ્લેષણ નીચે મુજબ છે:`,
    waPlanHeader: "1️⃣ *રોકાણની વિગતો*",
    waSip: "માસિક SIP રકમ",
    waHorizon: "લક્ષ્ય સુધીનો કુલ સમય",
    waDelay: "શરૂઆતમાં વિલંબ",
    waReturn: "અંદાજિત વાર્ષિક વળતર",
    waOutcomeHeader: "2️⃣ *વિલંબની અસર*",
    waStartToday: "આજે શરૂ કરતા કુલ ફંડ",
    waStartLater: "વિલંબથી શરૂ કરતા ફંડ",
    waLoss: "વિલંબને કારણે થયેલું સીધું નુકસાન",
    waCatchUp: "પછી બરાબરી કરવા જરૂરી SIP",
    waTakeawayHeader: "💡 *મુખ્ય સારાંશ:*",
    waDisclaimer:
      "સૂચના: મ્યુચ્યુઅલ ફંડ રોકાણો બજારના જોખમોને આધીન છે. આ ગણતરી માત્ર સમજૂતી માટે છે.",
    pdfTitle: "રોકાણમાં વિલંબની કિંમત (Cost of Delay) રિપોર્ટ",
    pdfSubtitle: "તાત્કાલિક શરૂઆત કરવા વિ. રોકાણ પાછળ ઠેલવાનું તુલનાત્મક વિશ્લેષણ",
  },
};

const CustomDelayTooltip = ({ active, payload, t, delayYears }) => {
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
          <span className="text-emerald-600 dark:text-emerald-400">{t.legendToday}:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {formatINRCompact(row.todayBalance)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-amber-600 dark:text-amber-400">
            {t.legendDelayed(delayYears)}:
          </span>
          <span className="font-bold text-amber-600 dark:text-amber-400">
            {formatINRCompact(row.delayedBalance)}
          </span>
        </div>
        <div className="flex justify-between gap-4 pt-1.5 border-t border-slate-100 dark:border-white/10">
          <span className="font-bold text-rose-600 dark:text-rose-400">{t.colGap}:</span>
          <span className="font-extrabold text-rose-600 dark:text-rose-400">
            -{formatINRCompact(row.wealthGap)}
          </span>
        </div>
      </div>
    </div>
  );
};

const DelayCostCalculator = ({ clientName, lang = "en", onSummaryChange }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [monthlySip, setMonthlySip] = useState(15000);
  const [totalYears, setTotalYears] = useState(20);
  const [delayYears, setDelayYears] = useState(3);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [stepUpPct, setStepUpPct] = useState(0);

  const [activeView, setActiveView] = useState("chart");

  // Keep delay strictly less than totalYears
  const effectiveDelay = Math.min(Math.max(1, delayYears), Math.max(1, totalYears - 1));

  const result = useMemo(() => {
    const sip = Math.max(500, Number(monthlySip) || 15000);
    const yrs = Math.max(2, Number(totalYears) || 20);
    const delay = Math.min(Math.max(1, Number(delayYears) || 1), yrs - 1);
    const remainingYrs = yrs - delay;
    const rate = Number(annualReturn) || 12;
    const step = Number(stepUpPct) || 0;

    const todaySim = calculateStepUpSip({
      monthlySip: sip,
      annualReturnPct: rate,
      years: yrs,
      stepUpPct: step,
    });

    const delayedSim = calculateStepUpSip({
      monthlySip: sip,
      annualReturnPct: rate,
      years: remainingYrs,
      stepUpPct: step,
    });

    const costOfDelay = Math.max(0, todaySim.futureValue - delayedSim.futureValue);

    // Reverse calculate Catch-Up SIP needed in remainingYrs to reach todaySim.futureValue
    let low = sip;
    let high = todaySim.futureValue;
    for (let i = 0; i < 60; i++) {
      const mid = (low + high) / 2;
      const test = calculateStepUpSip({
        monthlySip: mid,
        annualReturnPct: rate,
        years: remainingYrs,
        stepUpPct: step,
      });
      if (test.futureValue < todaySim.futureValue) {
        low = mid;
      } else {
        high = mid;
      }
    }
    const catchUpMonthlySip = Math.ceil(high / 100) * 100;
    const extraSipNeeded = Math.max(0, catchUpMonthlySip - sip);

    // Build aligned year-by-year timeline
    const yearlySchedule = [];
    for (let yr = 1; yr <= yrs; yr++) {
      const todayRow = todaySim.yearlySchedule[yr - 1];
      const delayedIdx = yr - delay - 1;
      const delayedBal =
        delayedIdx >= 0 ? delayedSim.yearlySchedule[delayedIdx]?.endBalance || 0 : 0;

      yearlySchedule.push({
        year: yr,
        todayBalance: todayRow.endBalance,
        delayedBalance: delayedBal,
        wealthGap: Math.max(0, todayRow.endBalance - delayedBal),
      });
    }

    return {
      todayCorpus: todaySim.futureValue,
      delayedCorpus: delayedSim.futureValue,
      remainingYrs,
      effectiveDelay: delay,
      costOfDelay,
      catchUpMonthlySip,
      extraSipNeeded,
      yearlySchedule,
    };
  }, [monthlySip, totalYears, delayYears, annualReturn, stepUpPct]);

  useEffect(() => {
    const takeaway = t.takeawaySentence(
      formatINR(monthlySip),
      result.effectiveDelay,
      totalYears,
      formatINRCompact(result.todayCorpus),
      formatINRCompact(result.delayedCorpus),
      formatINRCompact(result.costOfDelay),
      formatINR(result.catchUpMonthlySip)
    );

    const text =
      `${t.waGreeting(clientName?.trim())}\n\n` +
      `${t.waIntro(result.effectiveDelay)}\n\n` +
      `${t.waPlanHeader}\n` +
      `• ${t.waSip}: *${formatINR(monthlySip)}/month*${stepUpPct > 0 ? ` (+${stepUpPct}%/yr)` : ""}\n` +
      `• ${t.waHorizon}: *${totalYears} ${t.yearsUnit}*\n` +
      `• ${t.waDelay}: *${result.effectiveDelay} ${t.yearsUnit}*\n` +
      `• ${t.waReturn}: *${annualReturn}% p.a.*\n\n` +
      `${t.waOutcomeHeader}\n` +
      `• ${t.waStartToday} (${totalYears}y): *${formatINRCompact(result.todayCorpus)}*\n` +
      `• ${t.waStartLater} (${result.remainingYrs}y): *${formatINRCompact(result.delayedCorpus)}*\n` +
      `• *${t.waLoss}: -${formatINRCompact(result.costOfDelay)}*\n` +
      `• ${t.waCatchUp}: *${formatINR(result.catchUpMonthlySip)}/mo*\n\n` +
      `${t.waTakeawayHeader}\n${takeaway}\n\n` +
      `_${t.waDisclaimer}_\n` +
      `— *Dalal Investments | Private Wealth Desk*`;

    const step = totalYears <= 5 ? 1 : totalYears <= 15 ? 3 : 5;
    const milestones = result.yearlySchedule
      .filter((r) => r.year === 1 || r.year % step === 0 || r.year === totalYears)
      .map((r) => ({
        year: r.year,
        sip: `${formatINR(monthlySip)}/mo`,
        invested: formatINRCompact(r.todayBalance),
        profit: `-${formatINRCompact(r.wealthGap)}`,
        total: formatINRCompact(r.delayedBalance),
      }));

    onSummaryChange({
      title: t.pdfTitle,
      subtitle: t.pdfSubtitle,
      takeaway,
      whatsappText: text,
      assumptions: [
        { label: t.waSip, value: `${formatINR(monthlySip)}/mo` },
        { label: t.waHorizon, value: `${totalYears} ${t.yearsUnit}` },
        { label: t.waDelay, value: `${result.effectiveDelay} ${t.yearsUnit}` },
        { label: t.waReturn, value: `${annualReturn}% p.a.` },
      ],
      highlights: [
        {
          label: t.startTodayLabel,
          sub: t.startTodaySub(totalYears),
          value: formatINRCompact(result.todayCorpus),
        },
        {
          label: t.startDelayedLabel(result.effectiveDelay),
          sub: t.startDelayedSub(result.remainingYrs),
          value: formatINRCompact(result.delayedCorpus),
        },
        {
          label: t.catchUpLabel,
          sub: t.catchUpSub(formatINR(result.extraSipNeeded)),
          value: `${formatINR(result.catchUpMonthlySip)} / month`,
        },
        {
          label: t.heroTitle,
          sub: `Permanent compounding wealth lost by waiting ${result.effectiveDelay} ${t.yearsUnit}`,
          value: `-${formatINRCompact(result.costOfDelay)}`,
          isHero: true,
        },
      ],
      milestones,
      disclaimer: t.waDisclaimer,
    });
  }, [
    clientName,
    monthlySip,
    totalYears,
    annualReturn,
    stepUpPct,
    result,
    t,
    onSummaryChange,
  ]);

  return (
    <div className="space-y-8 w-full font-sans">
      
      {/* ================================================================= */}
      {/* TOP SECTION: DELAY COMPARISON FORM                                */}
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

        {/* Row 1: Monthly SIP & Delay Years */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <TactileSliderInput
            label={t.monthlyLabel}
            description={t.monthlyDesc}
            value={monthlySip}
            onChange={setMonthlySip}
            min={1000}
            max={500000}
            sliderMax={150000}
            step={1000}
            prefix="₹"
            presets={[
              { label: "₹10,000", value: 10000 },
              { label: "₹15,000", value: 15000 },
              { label: "₹25,000", value: 25000 },
              { label: "₹50,000", value: 50000 },
            ]}
          />

          <TactileSliderInput
            label={t.delayYearsLabel}
            description={t.delayYearsDesc}
            value={effectiveDelay}
            onChange={(val) => setDelayYears(Math.min(val, totalYears - 1))}
            min={1}
            max={Math.max(1, totalYears - 1)}
            step={1}
            suffix={t.yearsUnit}
            accent="amber"
            presets={[
              { label: `1 ${t.yrShort}`, value: 1 },
              { label: `2 ${t.yearsUnit}`, value: 2 },
              { label: `3 ${t.yearsUnit}`, value: 3 },
              { label: `5 ${t.yearsUnit}`, value: 5 },
            ]}
          />
        </div>

        {/* Row 2: Total Horizon, Expected Return, Step-Up */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <TactileSliderInput
            label={t.totalYearsLabel}
            value={totalYears}
            onChange={(val) => {
              setTotalYears(val);
              if (delayYears >= val) setDelayYears(Math.max(1, val - 1));
            }}
            min={5}
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

      {/* ================================================================= */}
      {/* BOTTOM SECTION: COST OF DELAY IMPACT & COMPARISON CHART           */}
      {/* ================================================================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t.resultHeader}
          </h3>
        </div>

        {/* High-Contrast Hero Banner */}
        <div className="rounded-2xl bg-slate-900 dark:bg-[#0F172A] border border-slate-800 dark:border-rose-500/30 text-white p-6 shadow-md space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/20 border border-rose-400/30 text-rose-300 text-[11px] font-bold uppercase tracking-wider">
                <AlertTriangle size={13} />
                <span>
                  {t.heroTitle} ({result.effectiveDelay} {t.yearsUnit})
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-rose-400 tabular-nums">
                  -{formatINRCompact(result.costOfDelay)}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-slate-300 tabular-nums">
                  {formatINR(result.costOfDelay)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
              <div className="bg-slate-800/90 border border-emerald-500/30 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  {t.startTodayLabel}
                </span>
                <span className="text-lg font-black text-emerald-400 tabular-nums mt-0.5 block">
                  {formatINRCompact(result.todayCorpus)}
                </span>
                <span className="text-[11px] text-slate-400">
                  {t.startTodaySub(totalYears)}
                </span>
              </div>

              <div className="bg-slate-800/90 border border-amber-500/30 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                  {t.startDelayedLabel(result.effectiveDelay)}
                </span>
                <span className="text-lg font-black text-amber-400 tabular-nums mt-0.5 block">
                  {formatINRCompact(result.delayedCorpus)}
                </span>
                <span className="text-[11px] text-slate-400">
                  {t.startDelayedSub(result.remainingYrs)}
                </span>
              </div>

              <div className="bg-slate-800/90 border border-indigo-500/30 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                  {t.catchUpLabel}
                </span>
                <span className="text-lg font-black text-white tabular-nums mt-0.5 block">
                  {formatINR(result.catchUpMonthlySip)}/mo
                </span>
                <span className="text-[11px] text-slate-400">
                  +{formatINR(result.extraSipNeeded)}/mo extra
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plain-Language Summary Callout */}
        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          <Zap size={17} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">
            {t.takeawaySentence(
              formatINR(monthlySip),
              result.effectiveDelay,
              totalYears,
              formatINRCompact(result.todayCorpus),
              formatINRCompact(result.delayedCorpus),
              formatINRCompact(result.costOfDelay),
              formatINR(result.catchUpMonthlySip)
            )}
          </p>
        </div>

        {/* Comparison Chart & Year-by-Year Table Card */}
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
                  {t.legendToday}
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  {t.legendDelayed(result.effectiveDelay)}
                </span>
              </div>

              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart
                    data={result.yearlySchedule}
                    margin={{ top: 10, right: 16, left: 4, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="delayTodayGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.32} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="delayLaterGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
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
                    <Tooltip
                      content={
                        <CustomDelayTooltip t={t} delayYears={result.effectiveDelay} />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="todayBalance"
                      name={t.legendToday}
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#delayTodayGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="delayedBalance"
                      name={t.legendDelayed(result.effectiveDelay)}
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      fill="url(#delayLaterGrad)"
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
                    <th className="py-3 px-4">{t.colTodayBal}</th>
                    <th className="py-3 px-4">{t.colDelayedBal}</th>
                    <th className="py-3 px-4 text-right">{t.colGap}</th>
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
                      <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {formatINRCompact(row.todayBalance)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-amber-600 dark:text-amber-400">
                        {row.delayedBalance > 0
                          ? formatINRCompact(row.delayedBalance)
                          : "— (Waiting)"}
                      </td>
                      <td className="py-2.5 px-4 text-right font-extrabold text-rose-600 dark:text-rose-400">
                        -{formatINRCompact(row.wealthGap)}
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

export default DelayCostCalculator;