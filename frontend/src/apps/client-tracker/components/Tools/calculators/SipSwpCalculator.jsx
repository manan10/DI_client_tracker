import React, { useState, useMemo, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  ArrowDownCircle,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  CalendarClock,
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
import { calculateSipSwp, formatINR, formatINRCompact } from "./mathUtils";
import { TactileSliderInput } from "./CalculatorControls";
import { COMMON_TRANSLATIONS, ScheduleViewerCard } from "./CalculatorShared";

const TRANSLATIONS = {
  en: {
    ...COMMON_TRANSLATIONS.en,
    phase1Title: "Phase 1: Wealth Accumulation (SIP)",
    phase1Sub: "How much you save each month before starting withdrawals.",
    sipAmountLabel: "Monthly SIP Amount",
    sipAmountDesc: "Monthly investment during your earning years.",
    sipStepUpLabel: "Yearly SIP Step-Up (%)",
    sipStepUpDesc: "Increase SIP annually as income grows (0% = fixed).",
    sipYearsLabel: "SIP Investing Years",
    sipReturnLabel: "Growth Rate During SIP (%)",
    phase2Title: "Phase 2: Monthly Income (SWP)",
    phase2Sub: "How much monthly income you withdraw once your SIP phase ends.",
    swpAmountLabel: "Starting Monthly Withdrawal",
    swpAmountDesc: "Monthly pension/cashflow you want to receive.",
    swpStepUpLabel: "Yearly Withdrawal Increase (%)",
    swpStepUpDesc: "Increase monthly payout yearly to beat inflation (0% = fixed).",
    swpYearsLabel: "Withdrawal Duration (Years)",
    swpReturnLabel: "Return During SWP (%)",
    resultHeader: "Projected Build & Withdraw Summary",
    corpusAtSwitchTitle: "Corpus Built After SIP Phase",
    totalWithdrawnTitle: "Total Cash Withdrawn (SWP)",
    finalLegacyTitle: "Remaining Legacy Corpus",
    totalPocketInvested: "Total Put In (SIP)",
    depletionAlert: (yr) =>
      `Corpus runs out in Year ${yr} of withdrawal. Reduce monthly SWP or extend SIP years.`,
    sustainableBadge: "Corpus Sustains Full Tenure!",
    takeawaySentence: (sipAmt, sipYrs, builtCorpus, swpAmt, swpYrs, totalWithdrawn, finalCorpus) =>
      `Invest ${sipAmt}/mo for ${sipYrs} yrs to build ${builtCorpus}, then withdraw ${swpAmt}/mo for ${swpYrs} yrs (receiving ${totalWithdrawn} total) and still leave behind ${finalCorpus}.`,
    chartTitle: "Complete 2-Phase Wealth Journey (SIP → SWP)",
    chartSub: "Watch your fund grow during SIP years and sustain monthly payouts during SWP years",
    legendBalance: "Fund Balance",
    legendInvested: "Cumulative SIP Invested",
    legendWithdrawn: "Cumulative SWP Withdrawn",
    switchMarker: "SWP Starts",
    viewChart: "Journey Chart",
    colPhase: "Phase",
    phaseSipTag: "SIP Build",
    phaseSwpTag: "SWP Income",
    colMonthlyFlow: "Monthly Cashflow",
    colCumInvested: "Total SIP In",
    colCumWithdrawn: "Total SWP Out",
    colEndBalance: "Year-End Fund",
    waIntro: "Here is your personalized *SIP + SWP (Build & Withdraw) Wealth Plan* prepared by *Dalal Investments*:",
    waPhase1Header: "1️⃣ *Phase 1 — Wealth Creation (SIP)*",
    waSip: "Monthly SIP",
    waSipStepUp: "Yearly SIP Step-Up",
    waSipDuration: "SIP Tenure",
    waSipReturn: "Assumed Return (SIP)",
    waTotalInvested: "Total Amount You Put In",
    waCorpusBuilt: "Corpus Built at Switch",
    waPhase2Header: "2️⃣ *Phase 2 — Monthly Income (SWP)*",
    waSwp: "Starting Monthly Withdrawal",
    waSwpStepUp: "Yearly Withdrawal Increase",
    waSwpDuration: "Withdrawal Tenure",
    waSwpReturn: "Assumed Return (SWP)",
    waTotalWithdrawn: "Total Cash Withdrawn",
    waFinalCorpus: "Remaining Legacy Corpus",
    pdfTitle: "SIP + SWP Build & Withdraw Wealth Plan",
    pdfSubtitle: "Two-stage wealth accumulation and systematic retirement cashflow illustration",
  },
  hi: {
    ...COMMON_TRANSLATIONS.hi,
    phase1Title: "चरण 1: वेल्थ निर्माण (SIP)",
    phase1Sub: "निकासी शुरू करने से पहले आप हर महीने कितना निवेश करेंगे।",
    sipAmountLabel: "मासिक SIP राशि",
    sipAmountDesc: "कमाई के वर्षों के दौरान मासिक निवेश।",
    sipStepUpLabel: "सालाना SIP बढ़ोतरी (%)",
    sipStepUpDesc: "आय बढ़ने के साथ हर साल SIP बढ़ाएं (0% = समान)।",
    sipYearsLabel: "SIP निवेश के साल",
    sipReturnLabel: "SIP के दौरान रिटर्न (%)",
    phase2Title: "चरण 2: मासिक इनकम (SWP)",
    phase2Sub: "SIP पूरा होने के बाद आप हर महीने कितनी पेंशन/इनकम निकालेंगे।",
    swpAmountLabel: "शुरुआती मासिक निकासी (SWP)",
    swpAmountDesc: "हर महीने मिलने वाली नियमित राशि।",
    swpStepUpLabel: "सालाना निकासी बढ़ोतरी (%)",
    swpStepUpDesc: "महंगाई के हिसाब से हर साल मासिक राशि बढ़ाएं (0% = समान)।",
    swpYearsLabel: "निकासी की अवधि (साल)",
    swpReturnLabel: "SWP के दौरान रिटर्न (%)",
    resultHeader: "अनुमानित निवेश और मासिक इनकम रिपोर्ट",
    corpusAtSwitchTitle: "SIP के बाद तैयार कुल फंड",
    totalWithdrawnTitle: "कुल निकाली गई नकद राशि (SWP)",
    finalLegacyTitle: "अंत में बचा हुआ शेष फंड",
    totalPocketInvested: "आपका कुल निवेश (SIP)",
    depletionAlert: (yr) =>
      `निकासी के ${yr}वें साल में फंड समाप्त हो जाएगा। मासिक SWP कम करें या SIP के साल बढ़ाएं।`,
    sustainableBadge: "फंड पूरी अवधि तक सुरक्षित रहेगा!",
    takeawaySentence: (sipAmt, sipYrs, builtCorpus, swpAmt, swpYrs, totalWithdrawn, finalCorpus) =>
      `${sipYrs} साल तक ${sipAmt}/माह SIP करके ${builtCorpus} का फंड बनाएं, फिर अगले ${swpYrs} साल तक ${swpAmt}/माह निकालें (कुल ${totalWithdrawn} प्राप्त करें) और अंत में ${finalCorpus} शेष रखें।`,
    chartTitle: "संपूर्ण वेल्थ यात्रा (SIP → SWP)",
    chartSub: "देखें कि पहले चरण में फंड कैसे बढ़ता है और दूसरे चरण में नियमित इनकम देता है",
    legendBalance: "कुल फंड बैलेंस",
    legendInvested: "कुल SIP निवेश",
    legendWithdrawn: "कुल SWP निकासी",
    switchMarker: "SWP शुरू",
    viewChart: "यात्रा चार्ट",
    colPhase: "चरण",
    phaseSipTag: "SIP निवेश",
    phaseSwpTag: "SWP इनकम",
    colMonthlyFlow: "मासिक कैशफ्लो",
    colCumInvested: "कुल SIP जमा",
    colCumWithdrawn: "कुल SWP निकासी",
    colEndBalance: "वर्ष-अंत फंड",
    waIntro: "*Dalal Investments* की ओर से आपकी *SIP + SWP (निवेश और मासिक इनकम) योजना* नीचे प्रस्तुत है:",
    waPhase1Header: "1️⃣ *चरण 1 — फंड निर्माण (SIP)*",
    waSip: "मासिक SIP",
    waSipStepUp: "सालाना SIP बढ़ोतरी",
    waSipDuration: "SIP अवधि",
    waSipReturn: "अनुमानित रिटर्न (SIP)",
    waTotalInvested: "आपका कुल निवेश",
    waCorpusBuilt: "SIP के बाद तैयार फंड",
    waPhase2Header: "2️⃣ *चरण 2 — नियमित मासिक इनकम (SWP)*",
    waSwp: "शुरुआती मासिक निकासी",
    waSwpStepUp: "सालाना निकासी बढ़ोतरी",
    waSwpDuration: "निकासी अवधि",
    waSwpReturn: "अनुमानित रिटर्न (SWP)",
    waTotalWithdrawn: "कुल निकाली गई राशि",
    waFinalCorpus: "अंत में बचा हुआ शेष फंड",
    pdfTitle: "SIP + SWP वेल्थ और मासिक इनकम योजना (Dalal Investments)",
    pdfSubtitle: "दो-चरणीय पूंजी निर्माण और नियमित कैशफ्लो विश्लेषण",
  },
  gu: {
    ...COMMON_TRANSLATIONS.gu,
    phase1Title: "તબક્કો 1: ફંડ નિર્માણ (SIP)",
    phase1Sub: "ઉપાડ શરૂ કરતા પહેલા તમે દર મહિને કેટલું રોકાણ કરશો.",
    sipAmountLabel: "માસિક SIP રકમ",
    sipAmountDesc: "કમાણીના વર્ષો દરમિયાન માસિક રોકાણ.",
    sipStepUpLabel: "વાર્ષિક SIP વધારો (%)",
    sipStepUpDesc: "આવક વધવાની સાથે દર વર્ષે SIP વધારો (0% = એકસરખી).",
    sipYearsLabel: "SIP રોકાણના વર્ષ",
    sipReturnLabel: "SIP દરમિયાન વળતર (%)",
    phase2Title: "તબક્કો 2: માસિક આવક (SWP)",
    phase2Sub: "SIP પૂર્ણ થયા પછી તમે દર મહિને કેટલી આવક ઉપાડશો.",
    swpAmountLabel: "શરૂઆતનો માસિક ઉપાડ (SWP)",
    swpAmountDesc: "દર મહિને મળતી નિયમિત રકમ.",
    swpStepUpLabel: "વાર્ષિક ઉપાડ વધારો (%)",
    swpStepUpDesc: "મોંઘવારી મુજબ દર વર્ષે માસિક રકમ વધારો (0% = એકસરખી).",
    swpYearsLabel: "ઉપાડનો સમયગાળો (વર્ષ)",
    swpReturnLabel: "SWP દરમિયાન વળતર (%)",
    resultHeader: "અંદાજિત રોકાણ અને માસિક આવક રિપોર્ટ",
    corpusAtSwitchTitle: "SIP પછી તૈયાર કુલ ફંડ",
    totalWithdrawnTitle: "કુલ ઉપાડેલી રોકડ રકમ (SWP)",
    finalLegacyTitle: "અંતે બચેલું શેષ ફંડ",
    totalPocketInvested: "તમારું કુલ રોકાણ (SIP)",
    depletionAlert: (yr) =>
      `ઉપાડના ${yr}મા વર્ષે ફંડ પૂરું થઈ જશે. માસિક SWP ઘટાડો અથવા SIP ના વર્ષ વધારો.`,
    sustainableBadge: "ફંડ સમગ્ર સમયગાળા સુધી સુરક્ષિત રહેશે!",
    takeawaySentence: (sipAmt, sipYrs, builtCorpus, swpAmt, swpYrs, totalWithdrawn, finalCorpus) =>
      `${sipYrs} વર્ષ સુધી ${sipAmt}/માસ SIP કરીને ${builtCorpus} નું ફંડ બનાવો, પછી આગામી ${swpYrs} વર્ષ સુધી ${swpAmt}/માસ ઉપાડો (કુલ ${totalWithdrawn} મેળવો) અને અંતે ${finalCorpus} બાકી રાખો.`,
    chartTitle: "સંપૂર્ણ વેલ્થ સફર (SIP → SWP)",
    chartSub: "જુઓ કે પ્રથમ તબક્કામાં ફંડ કેવી રીતે વધે છે અને બીજા તબક્કામાં નિયમિત આવક આપે છે",
    legendBalance: "કુલ ફંડ બેલેન્સ",
    legendInvested: "કુલ SIP રોકાણ",
    legendWithdrawn: "કુલ SWP ઉપાડ",
    switchMarker: "SWP શરૂ",
    viewChart: "સફર ચાર્ટ",
    colPhase: "તબક્કો",
    phaseSipTag: "SIP રોકાણ",
    phaseSwpTag: "SWP આવક",
    colMonthlyFlow: "માસિક કેશફ્લો",
    colCumInvested: "કુલ SIP જમા",
    colCumWithdrawn: "કુલ SWP ઉપાડ",
    colEndBalance: "વર્ષ-અંત ફંડ",
    waIntro: "*Dalal Investments* તરફથી તમારું *SIP + SWP (રોકાણ અને માસિક આવક) આયોજન* નીચે મુજબ છે:",
    waPhase1Header: "1️⃣ *તબક્કો 1 — ફંડ નિર્માણ (SIP)*",
    waSip: "માસિક SIP",
    waSipStepUp: "વાર્ષિક SIP વધારો",
    waSipDuration: "SIP સમયગાળો",
    waSipReturn: "અંદાજિત વળતર (SIP)",
    waTotalInvested: "તમારું કુલ રોકાણ",
    waCorpusBuilt: "SIP પછી તૈયાર ફંડ",
    waPhase2Header: "2️⃣ *તબક્કો 2 — નિયમિત માસિક આવક (SWP)*",
    waSwp: "શરૂઆતનો માસિક ઉપાડ",
    waSwpStepUp: "વાર્ષિક ઉપાડ વધારો",
    waSwpDuration: "ઉપાડ સમયગાળો",
    waSwpReturn: "અંદાજિત વળતર (SWP)",
    waTotalWithdrawn: "કુલ ઉપાડેલી રકમ",
    waFinalCorpus: "અંતે બચેલું શેષ ફંડ",
    pdfTitle: "SIP + SWP વેલ્થ અને માસિક આવક આયોજન (Dalal Investments)",
    pdfSubtitle: "બે-તબક્કાનું મૂડી નિર્માણ અને નિયમિત કેશફ્લો વિશ્લેષણ",
  },
};

const CustomComboTooltip = ({ active, payload, t }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  const isSip = row.phase === "SIP";

  return (
    <div className="bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-white/15 rounded-xl p-3 shadow-xl space-y-1.5 min-w-[210px] sm:min-w-[230px] font-sans text-xs z-50">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/15 pb-1.5">
        <span className="font-bold text-slate-900 dark:text-white">
          {t.yrShort} {row.year}
        </span>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            isSip
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
              : "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
          }`}
        >
          {isSip ? t.phaseSipTag : t.phaseSwpTag} ({formatINR(row.monthlyFlow)}/mo)
        </span>
      </div>

      <div className="space-y-1.5 tabular-nums">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500 dark:text-slate-400">{t.legendInvested}:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {formatINRCompact(row.cumInvested)}
          </span>
        </div>
        {row.cumWithdrawn > 0 && (
          <div className="flex justify-between gap-3">
            <span className="text-slate-500 dark:text-slate-400">{t.legendWithdrawn}:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {formatINRCompact(row.cumWithdrawn)}
            </span>
          </div>
        )}
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

const SipSwpCalculator = ({ clientName, lang = "en", onSummaryChange }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [monthlySip, setMonthlySip] = useState(20000);
  const [sipStepUpPct, setSipStepUpPct] = useState(10);
  const [sipYears, setSipYears] = useState(15);
  const [sipReturnPct, setSipReturnPct] = useState(12);

  const [monthlySwp, setMonthlySwp] = useState(75000);
  const [swpStepUpPct, setSwpStepUpPct] = useState(5);
  const [swpYears, setSwpYears] = useState(15);
  const [swpReturnPct, setSwpReturnPct] = useState(9);

  const result = useMemo(
    () =>
      calculateSipSwp({
        monthlySip,
        sipStepUpPct,
        sipYears,
        sipReturnPct,
        monthlySwp,
        swpStepUpPct,
        swpYears,
        swpReturnPct,
      }),
    [monthlySip, sipStepUpPct, sipYears, sipReturnPct, monthlySwp, swpStepUpPct, swpYears, swpReturnPct]
  );

  useEffect(() => {
    const takeaway = t.takeawaySentence(
      formatINR(monthlySip),
      sipYears,
      formatINRCompact(result.corpusAtSwitch),
      formatINR(monthlySwp),
      swpYears,
      formatINRCompact(result.totalWithdrawn),
      formatINRCompact(result.finalLegacyCorpus)
    );

    const text =
      `${t.waGreeting(clientName?.trim())}\n\n` +
      `${t.waIntro}\n\n` +
      `${t.waPhase1Header}\n` +
      `• ${t.waSip}: *${formatINR(monthlySip)}/mo* (${t.waSipStepUp}: ${sipStepUpPct}%)\n` +
      `• ${t.waSipDuration}: *${sipYears} ${t.yearsUnit}* @ *${sipReturnPct}% p.a.*\n` +
      `• ${t.waTotalInvested}: *${formatINRCompact(result.totalInvested)}*\n` +
      `• *${t.waCorpusBuilt}: ${formatINRCompact(result.corpusAtSwitch)}*\n\n` +
      `${t.waPhase2Header}\n` +
      `• ${t.waSwp}: *${formatINR(monthlySwp)}/mo* (${t.waSwpStepUp}: ${swpStepUpPct}%)\n` +
      `• ${t.waSwpDuration}: *${swpYears} ${t.yearsUnit}* @ *${swpReturnPct}% p.a.*\n` +
      `• ${t.waTotalWithdrawn}: *${formatINRCompact(result.totalWithdrawn)}*\n` +
      `• *${t.waFinalCorpus}: ${formatINRCompact(result.finalLegacyCorpus)}*\n\n` +
      `${t.waTakeawayHeader}\n${takeaway}\n\n` +
      `_${t.waDisclaimer}_\n` +
      `— *Dalal Investments | Private Wealth Desk*`;

    const totalYears = sipYears + swpYears;
    const step = totalYears <= 10 ? 2 : 5;
    const milestones = result.schedule
      .filter((r) => r.year === 1 || r.year === sipYears || r.year % step === 0 || r.year === totalYears)
      .map((r) => ({
        year: `${r.year} (${r.phase})`,
        sip: `${formatINR(r.monthlyFlow)}/mo`,
        invested: formatINRCompact(r.cumInvested),
        profit:
          r.phase === "SIP"
            ? `+${formatINRCompact(Math.max(0, r.endBalance - r.cumInvested))}`
            : `Out: ${formatINRCompact(r.cumWithdrawn)}`,
        total: formatINRCompact(r.endBalance),
      }));

    onSummaryChange({
      title: t.pdfTitle,
      subtitle: t.pdfSubtitle,
      takeaway,
      whatsappText: text,
      assumptions: [
        { label: `${t.waSip} (${sipYears}y)`, value: `${formatINR(monthlySip)} (+${sipStepUpPct}%)` },
        { label: "SIP Growth Rate", value: `${sipReturnPct}% p.a.` },
        { label: `${t.waSwp} (${swpYears}y)`, value: `${formatINR(monthlySwp)} (+${swpStepUpPct}%)` },
        { label: "SWP Return Rate", value: `${swpReturnPct}% p.a.` },
      ],
      highlights: [
        {
          label: t.waTotalInvested,
          sub: `Total out-of-pocket SIP investment over ${sipYears} ${t.yearsUnit}`,
          value: formatINRCompact(result.totalInvested),
        },
        {
          label: t.waCorpusBuilt,
          sub: `Accumulated corpus at Year ${sipYears} before withdrawals begin`,
          value: formatINRCompact(result.corpusAtSwitch),
        },
        {
          label: t.waTotalWithdrawn,
          sub: `Cumulative monthly cashflow received over ${swpYears} ${t.yearsUnit}`,
          value: formatINRCompact(result.totalWithdrawn),
        },
        {
          label: t.waFinalCorpus,
          sub: `Remaining wealth at Year ${sipYears + swpYears}`,
          value: `${formatINRCompact(result.finalLegacyCorpus)} (${formatINR(result.finalLegacyCorpus)})`,
          isHero: true,
        },
      ],
      milestones,
      disclaimer: t.waDisclaimer,
    });
  }, [clientName, monthlySip, sipStepUpPct, sipYears, sipReturnPct, monthlySwp, swpStepUpPct, swpYears, swpReturnPct, result, t, onSummaryChange]);

  const tenurePresets = [
    { label: `10 ${t.yearsUnit}`, value: 10 },
    { label: `15 ${t.yearsUnit}`, value: 15 },
    { label: `20 ${t.yearsUnit}`, value: 20 },
  ];

  const chartLegends = [
    { label: t.legendBalance, textClass: "text-emerald-700 dark:text-emerald-300", dotClass: "bg-emerald-500" },
    { label: t.legendInvested, textClass: "text-indigo-700 dark:text-indigo-300", dotClass: "bg-indigo-500" },
    { label: t.legendWithdrawn, textClass: "text-amber-700 dark:text-amber-300", dotClass: "bg-amber-500" },
  ];

  return (
    <div className="space-y-5 sm:space-y-7 w-full font-sans">
      {/* SECTION 1: TWO-PHASE INPUT COLUMNS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6 items-start">
        {/* PHASE 1: ACCUMULATION (SIP) */}
        <section className="space-y-3.5 sm:space-y-4">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-300 dark:border-white/15">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <TrendingUp size={15} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                {t.phase1Title}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {t.phase1Sub}
              </p>
            </div>
          </div>

          <TactileSliderInput
            label={t.sipAmountLabel}
            description={t.sipAmountDesc}
            value={monthlySip}
            onChange={setMonthlySip}
            min={1000}
            max={500000}
            sliderMax={150000}
            step={1000}
            prefix="₹"
            accent="indigo"
            presets={[
              { label: "₹10,000", value: 10000 },
              { label: "₹20,000", value: 20000 },
              { label: "₹35,000", value: 35000 },
              { label: "₹50,000", value: 50000 },
            ]}
          />

          <TactileSliderInput
            label={t.sipStepUpLabel}
            description={t.sipStepUpDesc}
            value={sipStepUpPct}
            onChange={setSipStepUpPct}
            min={0}
            max={25}
            step={1}
            suffix="%"
            accent="indigo"
            presets={[
              { label: "0% (Fixed)", value: 0 },
              { label: "5% / yr", value: 5 },
              { label: "10% / yr", value: 10 },
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <TactileSliderInput
              label={t.sipYearsLabel}
              value={sipYears}
              onChange={setSipYears}
              min={1}
              max={30}
              step={1}
              suffix={t.yearsUnit}
              accent="indigo"
              presets={tenurePresets}
            />
            <TactileSliderInput
              label={t.sipReturnLabel}
              value={sipReturnPct}
              onChange={setSipReturnPct}
              min={6}
              max={20}
              step={0.5}
              suffix="%"
              accent="indigo"
              presets={[
                { label: "10%", value: 10 },
                { label: "12%", value: 12 },
                { label: "14%", value: 14 },
              ]}
            />
          </div>
        </section>

        {/* PHASE 2: DISTRIBUTION (SWP) */}
        <section className="space-y-3.5 sm:space-y-4">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-300 dark:border-white/15">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
              <ArrowDownCircle size={15} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                {t.phase2Title}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {t.phase2Sub}
              </p>
            </div>
          </div>

          <TactileSliderInput
            label={t.swpAmountLabel}
            description={t.swpAmountDesc}
            value={monthlySwp}
            onChange={setMonthlySwp}
            min={5000}
            max={1000000}
            sliderMax={300000}
            step={2500}
            prefix="₹"
            accent="amber"
            presets={[
              { label: "₹50,000", value: 50000 },
              { label: "₹75,000", value: 75000 },
              { label: "₹1,00,000", value: 100000 },
              { label: "₹1,50,000", value: 150000 },
            ]}
          />

          <TactileSliderInput
            label={t.swpStepUpLabel}
            description={t.swpStepUpDesc}
            value={swpStepUpPct}
            onChange={setSwpStepUpPct}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <TactileSliderInput
              label={t.swpYearsLabel}
              value={swpYears}
              onChange={setSwpYears}
              min={1}
              max={35}
              step={1}
              suffix={t.yearsUnit}
              accent="amber"
              presets={tenurePresets}
            />
            <TactileSliderInput
              label={t.swpReturnLabel}
              value={swpReturnPct}
              onChange={setSwpReturnPct}
              min={5}
              max={15}
              step={0.5}
              suffix="%"
              accent="amber"
              presets={[
                { label: "8%", value: 8 },
                { label: "9%", value: 9 },
                { label: "10%", value: 10 },
              ]}
            />
          </div>
        </section>
      </div>

      {/* SECTION 2: MILESTONE CARDS & JOURNEY CHART */}
      <section className="space-y-4 sm:space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-0.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            {t.resultHeader}
          </h3>

          {result.depletedAtSwpYear !== null ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-[11px] sm:text-xs font-bold">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{t.depletionAlert(result.depletedAtSwpYear)}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] sm:text-xs font-bold">
              <ShieldCheck size={14} className="shrink-0" />
              <span>{t.sustainableBadge}</span>
            </div>
          )}
        </div>

        {/* 4-Card Flow Strip (2x2 on Mobile, 4-Column on Desktop) */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-300 dark:border-white/15 shadow-xs space-y-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                {t.totalPocketInvested}
              </span>
              <Wallet size={14} className="text-slate-400 shrink-0" />
            </div>
            <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white block tabular-nums">
              {formatINRCompact(result.totalInvested)}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 block">
              Over {sipYears} {t.yearsUnit} SIP
            </span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-300 dark:border-white/15 shadow-xs space-y-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 truncate">
                {t.corpusAtSwitchTitle}
              </span>
              <TrendingUp size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
            </div>
            <span className="text-lg sm:text-2xl font-black text-indigo-700 dark:text-indigo-300 block tabular-nums">
              {formatINRCompact(result.corpusAtSwitch)}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 block">
              At end of Year {sipYears}
            </span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-300 dark:border-white/15 shadow-xs space-y-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 truncate">
                {t.totalWithdrawnTitle}
              </span>
              <ArrowDownCircle size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
            </div>
            <span className="text-lg sm:text-2xl font-black text-amber-700 dark:text-amber-300 block tabular-nums">
              {formatINRCompact(result.totalWithdrawn)}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 block">
              Received over {swpYears} {t.yearsUnit}
            </span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900 dark:bg-[#0F172A] border border-slate-800 dark:border-white/15 text-white space-y-1 shadow-md">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 truncate">
                {t.finalLegacyTitle}
              </span>
              <CalendarClock size={14} className="text-emerald-400 shrink-0" />
            </div>
            <span className="text-lg sm:text-2xl font-black text-white block tabular-nums">
              {formatINRCompact(result.finalLegacyCorpus)}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-300 block">
              At end of Year {sipYears + swpYears}
            </span>
          </div>
        </div>

        {/* Plain-Language Summary Callout */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-300 dark:border-white/15 shadow-xs flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">
            {t.takeawaySentence(
              formatINR(monthlySip),
              sipYears,
              formatINRCompact(result.corpusAtSwitch),
              formatINR(monthlySwp),
              swpYears,
              formatINRCompact(result.totalWithdrawn),
              formatINRCompact(result.finalLegacyCorpus)
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
            <div className="w-full h-[230px] sm:h-[290px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.schedule} margin={{ top: 14, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="comboBalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.32} />
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
                  <Tooltip content={<CustomComboTooltip t={t} />} />
                  <ReferenceLine
                    x={sipYears}
                    stroke="#6366f1"
                    strokeDasharray="4 4"
                    label={{ value: t.switchMarker, position: "top", fill: "#6366f1", fontSize: 10, fontWeight: 700 }}
                  />
                  <Area type="monotone" dataKey="endBalance" name={t.legendBalance} stroke="#10b981" strokeWidth={2.5} fill="url(#comboBalGrad)" />
                  <Area type="monotone" dataKey="cumInvested" name={t.legendInvested} stroke="#6366f1" strokeWidth={2} fillOpacity={0} />
                  <Area type="monotone" dataKey="cumWithdrawn" name={t.legendWithdrawn} stroke="#f59e0b" strokeWidth={2} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          renderTable={() => (
            <table className="w-full text-left border-collapse text-[11px] sm:text-sm tabular-nums">
              <thead className="sticky top-0 bg-slate-100 dark:bg-[#131C31] border-b border-slate-300 dark:border-white/15 text-[11px] sm:text-xs font-extrabold text-slate-800 dark:text-slate-200">
                <tr>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colYear}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colPhase}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colMonthlyFlow}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colCumInvested}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colCumWithdrawn}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 text-right whitespace-nowrap">{t.colEndBalance}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {result.schedule.map((row) => {
                  const isSip = row.phase === "SIP";
                  return (
                    <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
                      <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {t.yrShort} {row.year}
                      </td>
                      <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold ${
                            isSip
                              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                          }`}
                        >
                          {isSip ? t.phaseSipTag : t.phaseSwpTag}
                        </span>
                      </td>
                      <td
                        className={`py-2 px-2.5 sm:py-2.5 sm:px-4 font-semibold whitespace-nowrap ${
                          isSip ? "text-indigo-600 dark:text-indigo-400" : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isSip ? "+" : "-"}
                        {formatINR(row.monthlyFlow)}/mo
                      </td>
                      <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatINRCompact(row.cumInvested)}
                      </td>
                      <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {row.cumWithdrawn > 0 ? formatINRCompact(row.cumWithdrawn) : "—"}
                      </td>
                      <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-right font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                        {formatINRCompact(row.endBalance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        />
      </section>
    </div>
  );
};

export default SipSwpCalculator;