import React, { useState, useMemo, useEffect } from "react";
import { CreditCard, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";
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
import { COMMON_TRANSLATIONS, ScheduleViewerCard } from "./CalculatorShared";

const TRANSLATIONS = {
  en: {
    ...COMMON_TRANSLATIONS.en,
    sectionTitle: "1. Enter Loan Details & Interest-Recovery SIP",
    sectionSub:
      "Calculate your monthly EMI, total bank interest, and see how a small parallel SIP recovers 100% of that interest.",
    loanAmountLabel: "Loan Amount",
    loanAmountDesc: "Total Home, Car, or Business loan principal borrowed.",
    interestRateLabel: "Bank Interest Rate (% p.a.)",
    interestRateDesc: "Annual interest rate charged by your bank or NBFC.",
    tenureLabel: "Loan Tenure (Years)",
    tenureDesc: "Total repayment duration in years.",
    sipOffsetToggle: "Enable 'Interest-Free Loan' Parallel SIP Pitch",
    sipOffsetDesc:
      "Start a parallel Equity SIP alongside your EMI so compounding profit covers your entire bank interest cost.",
    sipPctOfEmiLabel: "Parallel Monthly SIP (% of EMI)",
    sipReturnLabel: "Expected SIP Return (% p.a.)",
    resultHeader: "2. Loan EMI & Interest Recovery Summary",
    heroTitle: "Monthly Loan EMI",
    principalLabel: "Loan Principal",
    interestLabel: "Total Interest",
    totalPayableLabel: "Total Payable",
    sipProfitLabel: "SIP Profit",
    interestRecoveredBadge: (pct) =>
      pct >= 100
        ? `100%+ of Bank Interest Recovered (${pct}%) — Effectively Interest-Free!`
        : `${pct}% of Bank Interest Recovered via Parallel SIP`,
    takeawaySentence: (loanAmt, rate, yrs, emi, totalInterest, showSip, parallelSip, sipGain) =>
      showSip
        ? `On a ${loanAmt} loan at ${rate}% for ${yrs} years, your EMI is ${emi}/mo and total interest is ${totalInterest}. By running a parallel SIP of ${parallelSip}/mo alongside your EMI, you earn ${sipGain} in profit — recovering your bank interest cost!`
        : `On a ${loanAmt} loan at ${rate}% for ${yrs} years, your monthly EMI is ${emi}/mo. Over ${yrs} years, you repay ${totalInterest} in interest on top of the ${loanAmt} principal.`,
    chartTitle: "Loan Balance Paydown vs. Parallel SIP Wealth",
    chartSub: "Watch your loan balance drop to zero while your parallel SIP builds net wealth",
    legendLoanBal: "Remaining Loan Balance",
    legendSipVal: "Parallel SIP Corpus",
    viewChart: "Paydown Chart",
    viewTable: "Amortization Schedule",
    colPrincipalPaid: "Principal Paid",
    colInterestPaid: "Interest Paid",
    colLoanBal: "Ending Loan Bal.",
    colSipBal: "Parallel SIP Value",
    waIntro:
      "Here is your personalized *Loan EMI & Interest-Recovery Plan* prepared by *Dalal Investments*:",
    waLoanHeader: "1️⃣ *Loan Repayment Summary*",
    waLoanAmt: "Loan Principal",
    waRate: "Interest Rate & Tenure",
    waEmi: "Monthly EMI",
    waTotalInt: "Total Bank Interest Payable",
    waTotalPay: "Total Amount Payable (Principal + Interest)",
    waSipBlock: (sipAmt, sipRet, sipGain, sipTotal) =>
      `\n2️⃣ *'Interest-Free Loan' Parallel SIP Strategy*\n` +
      `• Parallel Monthly SIP: *${sipAmt}/month* (@ ${sipRet}% p.a.)\n` +
      `• Profit Earned from SIP: *+${sipGain}*\n` +
      `• *Final SIP Corpus at Loan Closure: ${sipTotal}*\n`,
    waTakeawayHeader: "💡 *Advisor Insight:*",
    waDisclaimer:
      "Disclaimer: EMI is calculated on a monthly reducing balance basis. Mutual Fund investments are subject to market risks.",
    pdfTitle: "Loan EMI & Parallel SIP Interest-Recovery Plan",
    pdfSubtitle: "Amortization breakdown & wealth-offset strategy",
  },
  hi: {
    ...COMMON_TRANSLATIONS.hi,
    sectionTitle: "1. लोन विवरण और ब्याज-रिकवरी SIP दर्ज करें",
    sectionSub:
      "अपनी मासिक EMI, कुल बैंक ब्याज जानें और देखें कि एक छोटी समानांतर SIP कैसे आपका पूरा ब्याज वापस दिला सकती है।",
    loanAmountLabel: "लोन राशि (Loan Amount)",
    loanAmountDesc: "होम लोन, कार लोन या बिजनेस लोन की कुल मूल राशि।",
    interestRateLabel: "बैंक ब्याज दर (% सालाना)",
    interestRateDesc: "बैंक द्वारा ली जाने वाली वार्षिक ब्याज दर।",
    tenureLabel: "लोन की अवधि (साल)",
    tenureDesc: "लोन चुकाने की कुल अवधि।",
    sipOffsetToggle: "'ब्याज-मुक्त लोन' समानांतर SIP रणनीति जोड़ें",
    sipOffsetDesc:
      "EMI के साथ एक छोटी इक्विटी SIP शुरू करें ताकि उसका मुनाफा आपके पूरे बैंक ब्याज की भरपाई कर दे।",
    sipPctOfEmiLabel: "मासिक SIP (EMI का % हिस्सा)",
    sipReturnLabel: "अनुमानित SIP रिटर्न (% सालाना)",
    resultHeader: "2. लोन EMI और ब्याज रिकवरी रिपोर्ट",
    heroTitle: "मासिक लोन EMI",
    principalLabel: "मूल लोन राशि",
    interestLabel: "कुल ब्याज",
    totalPayableLabel: "कुल भुगतान",
    sipProfitLabel: "SIP मुनाफा",
    interestRecoveredBadge: (pct) =>
      pct >= 100
        ? `100%+ बैंक ब्याज की रिकवरी (${pct}%) — प्रभावी रूप से ब्याज-मुक्त लोन!`
        : `समानांतर SIP से ${pct}% बैंक ब्याज की रिकवरी`,
    takeawaySentence: (loanAmt, rate, yrs, emi, totalInterest, showSip, parallelSip, sipGain) =>
      showSip
        ? `${rate}% ब्याज पर ${yrs} साल के ${loanAmt} लोन की EMI ${emi}/माह है और कुल ब्याज ${totalInterest} है। EMI के साथ ${parallelSip}/माह की SIP चलाकर आप ${sipGain} का मुनाफा कमाते हैं — जिससे आपका बैंक ब्याज वसूल हो जाता है!`
        : `${rate}% ब्याज पर ${yrs} साल के ${loanAmt} लोन की मासिक EMI ${emi}/माह है। पूरी अवधि में आप ${loanAmt} मूलधन के अलावा ${totalInterest} ब्याज चुकाते हैं।`,
    chartTitle: "लोन भुगतान बनाम समानांतर SIP वेल्थ ग्रोथ",
    chartSub: "देखें कि लोन घटकर शून्य होता है जबकि आपकी SIP बड़ा फंड तैयार करती है",
    legendLoanBal: "शेष लोन बैलेंस",
    legendSipVal: "समानांतर SIP फंड",
    viewChart: "तुलना चार्ट",
    viewTable: "वार्षिक तालिका",
    colPrincipalPaid: "मूलधन भुगतान",
    colInterestPaid: "ब्याज भुगतान",
    colLoanBal: "शेष लोन",
    colSipBal: "समानांतर SIP वैल्यू",
    waIntro:
      "*Dalal Investments* की ओर से आपकी *लोन EMI और ब्याज-रिकवरी योजना* नीचे प्रस्तुत है:",
    waLoanHeader: "1️⃣ *लोन भुगतान सारांश*",
    waLoanAmt: "मूल लोन राशि",
    waRate: "ब्याज दर और अवधि",
    waEmi: "मासिक EMI",
    waTotalInt: "कुल देय बैंक ब्याज",
    waTotalPay: "कुल भुगतान (मूलधन + ब्याज)",
    waSipBlock: (sipAmt, sipRet, sipGain, sipTotal) =>
      `\n2️⃣ *'ब्याज-मुक्त लोन' समानांतर SIP रणनीति*\n` +
      `• समानांतर मासिक SIP: *${sipAmt}/माह* (@ ${sipRet}% सालाना)\n` +
      `• SIP से अर्जित कुल मुनाफा: *+${sipGain}*\n` +
      `• *लोन समाप्ति पर कुल SIP फंड: ${sipTotal}*\n`,
    waTakeawayHeader: "💡 *सलाहकार नोट:*",
    waDisclaimer:
      "अस्वीकरण: EMI की गणना मासिक घटते बैलेंस (reducing balance) के आधार पर की गई है। म्यूचुअल फंड निवेश बाजार जोखिमों के अधीन हैं।",
    pdfTitle: "लोन EMI और समानांतर SIP ब्याज-रिकवरी योजना",
    pdfSubtitle: "लोन भुगतान विवरण और वेल्थ-ऑफसेट रणनीति (Dalal Investments)",
  },
  gu: {
    ...COMMON_TRANSLATIONS.gu,
    sectionTitle: "1. લોનની વિગતો અને વ્યાજ-રિકવરી SIP દાખલ કરો",
    sectionSub:
      "તમારી માસિક EMI, કુલ બેંક વ્યાજ જાણો અને જુઓ કે એક નાની સમાંતર SIP કેવી રીતે તમારું પૂરું વ્યાજ પાછું અપાવી શકે છે.",
    loanAmountLabel: "લોન રકમ (Loan Amount)",
    loanAmountDesc: "હોમ લોન, કાર લોન અથવા બિઝનેસ લોનની કુલ મૂળ રકમ.",
    interestRateLabel: "બેંક વ્યાજ દર (% વાર્ષિક)",
    interestRateDesc: "બેંક દ્વારા લેવામાં આવતો વાર્ષિક વ્યાજ દર.",
    tenureLabel: "લોનનો સમયગાળો (વર્ષ)",
    tenureDesc: "લોન ચૂકવવાનો કુલ સમયગાળો.",
    sipOffsetToggle: "'વ્યાજ-મુક્ત લોન' સમાંતર SIP વ્યૂહરચના ઉમેરો",
    sipOffsetDesc:
      "EMI સાથે એક નાની ઇક્વિટી SIP શરૂ કરો જેથી તેનો નફો તમારા સમગ્ર બેંક વ્યાજની ભરપાઈ કરી દે.",
    sipPctOfEmiLabel: "માસિક SIP (EMI નો % ભાગ)",
    sipReturnLabel: "અંદાજિત SIP વળતર (% વાર્ષિક)",
    resultHeader: "2. લોન EMI અને વ્યાજ રિકવરી રિપોર્ટ",
    heroTitle: "માસિક લોન EMI",
    principalLabel: "મૂળ લોન રકમ",
    interestLabel: "કુલ વ્યાજ",
    totalPayableLabel: "કુલ ચુકવણી",
    sipProfitLabel: "SIP નફો",
    interestRecoveredBadge: (pct) =>
      pct >= 100
        ? `100%+ બેંક વ્યાજની રિકવરી (${pct}%) — અસરકારક રીતે વ્યાજ-મુક્ત લોન!`
        : `સમાંતર SIP થી ${pct}% બેંક વ્યાજની રિકવરી`,
    takeawaySentence: (loanAmt, rate, yrs, emi, totalInterest, showSip, parallelSip, sipGain) =>
      showSip
        ? `${rate}% વ્યાજે ${yrs} વર્ષની ${loanAmt} લોનની EMI ${emi}/માસ છે અને કુલ વ્યાજ ${totalInterest} છે. EMI સાથે ${parallelSip}/માસ ની SIP ચલાવીને તમે ${sipGain} નો નફો મેળવો છો — જેનાથી તમારું બેંક વ્યાજ વસૂલ થઈ જાય છે!`
        : `${rate}% વ્યાજે ${yrs} વર્ષની ${loanAmt} લોનની માસિક EMI ${emi}/માસ છે. સમગ્ર સમયગાળામાં તમે ${loanAmt} મૂળધન ઉપરાંત ${totalInterest} વ્યાજ ચૂકવો છો.`,
    chartTitle: "લોન ચુકવણી વિ. સમાંતર SIP વેલ્થ ગ્રોથ",
    chartSub: "જુઓ કે લોન ઘટીને શૂન્ય થાય છે જ્યારે તમારી SIP મોટું ફંડ બનાવે છે",
    legendLoanBal: "બાકી લોન બેલેન્સ",
    legendSipVal: "સમાંતર SIP ફંડ",
    viewChart: "સરખામણી ચાર્ટ",
    viewTable: "વાર્ષિક કોષ્ટક",
    colPrincipalPaid: "મૂળધન ચુકવણી",
    colInterestPaid: "વ્યાજ ચુકવણી",
    colLoanBal: "બાકી લોન",
    colSipBal: "સમાંતર SIP મૂલ્ય",
    waIntro:
      "*Dalal Investments* તરફથી તમારી *લોન EMI અને વ્યાજ-રિકવરી યોજના* નીચે મુજબ છે:",
    waLoanHeader: "1️⃣ *લોન ચુકવણી સારાંશ*",
    waLoanAmt: "મૂળ લોન રકમ",
    waRate: "વ્યાજ દર અને સમયગાળો",
    waEmi: "માસિક EMI",
    waTotalInt: "કુલ ભરવાપાત્ર બેંક વ્યાજ",
    waTotalPay: "કુલ ચુકવણી (મૂળધન + વ્યાજ)",
    waSipBlock: (sipAmt, sipRet, sipGain, sipTotal) =>
      `\n2️⃣ *'વ્યાજ-મુક્ત લોન' સમાંતર SIP વ્યૂહરચના*\n` +
      `• સમાંતર માસિક SIP: *${sipAmt}/માસ* (@ ${sipRet}% વાર્ષિક)\n` +
      `• SIP થી મળેલો કુલ નફો: *+${sipGain}*\n` +
      `• *લોન પૂર્ણ થયે કુલ SIP ફંડ: ${sipTotal}*\n`,
    waTakeawayHeader: "💡 *સલાહકાર નોંધ:*",
    waDisclaimer:
      "સૂચના: EMI ની ગણતરી માસિક ઘટતા બેલેન્સ (reducing balance) ના આધારે કરવામાં આવી છે. મ્યુચ્યુઅલ ફંડ રોકાણો બજારના જોખમોને આધીન છે.",
    pdfTitle: "લોન EMI અને સમાંતર SIP વ્યાજ-રિકવરી યોજના",
    pdfSubtitle: "લોન ચુકવણી વિગત અને વેલ્થ-ઓફસેટ વ્યૂહરચના (Dalal Investments)",
  },
};

const CustomEmiTooltip = ({ active, payload, t, showSipOffset }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-white/15 rounded-xl p-3 shadow-xl space-y-1.5 min-w-[210px] sm:min-w-[225px] font-sans text-xs z-50">
      <div className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/15 pb-1.5">
        {t.yrShort} {row.year}
      </div>
      <div className="space-y-1.5 tabular-nums">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500 dark:text-slate-400">{t.legendLoanBal}:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">
            {formatINRCompact(row.endingLoanBalance)}
          </span>
        </div>
        {showSipOffset && (
          <div className="flex justify-between gap-3">
            <span className="text-emerald-600 dark:text-emerald-400">{t.legendSipVal}:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatINRCompact(row.sipCorpus)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const EmiCalculator = ({ clientName, lang = "en", onSummaryChange }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.75);
  const [tenureYears, setTenureYears] = useState(20);

  const [showSipOffset, setShowSipOffset] = useState(true);
  const [sipPctOfEmi, setSipPctOfEmi] = useState(20);
  const [sipReturnPct, setSipReturnPct] = useState(12);

  const result = useMemo(() => {
    const P = Math.max(50000, Number(loanAmount) || 500000);
    const annualR = Math.max(0.1, Number(interestRate) || 8.5);
    const r = annualR / 100 / 12;
    const yrs = Math.max(1, Number(tenureYears) || 1);
    const n = yrs * 12;

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayable = emi * n;
    const totalInterest = Math.max(0, totalPayable - P);

    const parallelMonthlySip = Math.round((emi * (Number(sipPctOfEmi) || 0)) / 100 / 100) * 100;
    const sipSim = calculateStepUpSip({
      monthlySip: parallelMonthlySip,
      annualReturnPct: Number(sipReturnPct) || 12,
      years: yrs,
      stepUpPct: 0,
    });

    const interestRecoveredPct =
      totalInterest > 0 ? Math.round((sipSim.wealthGained / totalInterest) * 100) : 100;

    let remainingBal = P;
    const yearlySchedule = [];

    for (let yr = 1; yr <= yrs; yr++) {
      let yrPrincipal = 0;
      let yrInterest = 0;

      for (let m = 1; m <= 12; m++) {
        const interestForMonth = remainingBal * r;
        const principalForMonth = Math.min(remainingBal, emi - interestForMonth);
        remainingBal = Math.max(0, remainingBal - principalForMonth);
        yrPrincipal += principalForMonth;
        yrInterest += interestForMonth;
      }

      const sipRow = sipSim.yearlySchedule[yr - 1];

      yearlySchedule.push({
        year: yr,
        principalPaid: Math.round(yrPrincipal),
        interestPaid: Math.round(yrInterest),
        endingLoanBalance: Math.round(remainingBal),
        sipCorpus: sipRow ? sipRow.endBalance : 0,
      });
    }

    return {
      loanAmount: Math.round(P),
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayable: Math.round(totalPayable),
      parallelMonthlySip,
      sipTotalInvested: sipSim.totalInvested,
      sipProfitGained: sipSim.wealthGained,
      sipFinalCorpus: sipSim.futureValue,
      interestRecoveredPct,
      yearlySchedule,
    };
  }, [loanAmount, interestRate, tenureYears, sipPctOfEmi, sipReturnPct]);

  useEffect(() => {
    const takeaway = t.takeawaySentence(
      formatINRCompact(result.loanAmount),
      interestRate,
      tenureYears,
      formatINR(result.emi),
      formatINRCompact(result.totalInterest),
      showSipOffset,
      formatINR(result.parallelMonthlySip),
      formatINRCompact(result.sipProfitGained)
    );

    const sipTextBlock = showSipOffset
      ? t.waSipBlock(
          formatINR(result.parallelMonthlySip),
          sipReturnPct,
          formatINRCompact(result.sipProfitGained),
          formatINRCompact(result.sipFinalCorpus)
        )
      : "";

    const text =
      `${t.waGreeting(clientName?.trim())}\n\n` +
      `${t.waIntro}\n\n` +
      `${t.waLoanHeader}\n` +
      `• ${t.waLoanAmt}: *${formatINRCompact(result.loanAmount)}*\n` +
      `• ${t.waRate}: *${interestRate}% p.a.* for *${tenureYears} ${t.yearsUnit}*\n` +
      `• *${t.waEmi}: ${formatINR(result.emi)}/month*\n` +
      `• ${t.waTotalInt}: *${formatINRCompact(result.totalInterest)}*\n` +
      `• ${t.waTotalPay}: *${formatINRCompact(result.totalPayable)}*\n` +
      sipTextBlock +
      `\n${t.waTakeawayHeader}\n${takeaway}\n\n` +
      `_${t.waDisclaimer}_\n` +
      `— *Dalal Investments | Private Wealth Desk*`;

    const step = tenureYears <= 5 ? 1 : tenureYears <= 15 ? 3 : 5;
    const milestones = result.yearlySchedule
      .filter((r) => r.year === 1 || r.year % step === 0 || r.year === tenureYears)
      .map((r) => ({
        year: r.year,
        sip: `${formatINR(result.emi)}/mo`,
        invested: formatINRCompact(r.endingLoanBalance),
        profit: showSipOffset ? formatINRCompact(r.sipCorpus) : formatINRCompact(r.interestPaid),
        total: formatINRCompact(r.endingLoanBalance),
      }));

    onSummaryChange({
      title: t.pdfTitle,
      subtitle: t.pdfSubtitle,
      takeaway,
      whatsappText: text,
      assumptions: [
        { label: t.waLoanAmt, value: formatINRCompact(result.loanAmount) },
        { label: "Rate & Tenure", value: `${interestRate}% • ${tenureYears}y` },
        { label: t.waEmi, value: `${formatINR(result.emi)}/mo` },
        {
          label: "Parallel SIP",
          value: showSipOffset ? `${formatINR(result.parallelMonthlySip)}/mo` : "Disabled",
        },
      ],
      highlights: [
        {
          label: t.principalLabel,
          sub: "Original borrowed amount",
          value: formatINRCompact(result.loanAmount),
        },
        {
          label: t.interestLabel,
          sub: `Total interest paid to bank over ${tenureYears} ${t.yearsUnit}`,
          value: formatINRCompact(result.totalInterest),
        },
        {
          label: t.totalPayableLabel,
          sub: "Principal + Total Interest",
          value: formatINRCompact(result.totalPayable),
        },
        ...(showSipOffset
          ? [
              {
                label: t.sipProfitLabel,
                sub: `From ${formatINR(result.parallelMonthlySip)}/mo SIP @ ${sipReturnPct}% (${result.interestRecoveredPct}% interest recovered)`,
                value: `+${formatINRCompact(result.sipProfitGained)}`,
              },
            ]
          : []),
        {
          label: t.heroTitle,
          sub: `Fixed monthly installment for ${tenureYears * 12} months`,
          value: `${formatINR(result.emi)} / month`,
          isHero: true,
        },
      ],
      milestones,
      disclaimer: t.waDisclaimer,
    });
  }, [clientName, interestRate, tenureYears, showSipOffset, sipReturnPct, result, t, onSummaryChange]);

  const chartLegends = [
    { label: t.legendLoanBal, textClass: "text-amber-700 dark:text-amber-300", dotClass: "bg-amber-500" },
    ...(showSipOffset
      ? [{ label: t.legendSipVal, textClass: "text-emerald-700 dark:text-emerald-300", dotClass: "bg-emerald-500" }]
      : []),
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

        <TactileSliderInput
          label={t.loanAmountLabel}
          description={t.loanAmountDesc}
          value={loanAmount}
          onChange={setLoanAmount}
          min={100000}
          max={100000000}
          sliderMax={25000000}
          step={100000}
          prefix="₹"
          accent="amber"
          presets={[
            { label: "₹10 L (Car)", value: 1000000 },
            { label: "₹30 L", value: 3000000 },
            { label: "₹50 L (Home)", value: 5000000 },
            { label: "₹1 Cr", value: 10000000 },
            { label: "₹2 Cr", value: 20000000 },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          <TactileSliderInput
            label={t.interestRateLabel}
            description={t.interestRateDesc}
            value={interestRate}
            onChange={setInterestRate}
            min={6}
            max={18}
            step={0.25}
            suffix="%"
            accent="amber"
            presets={[
              { label: "8.5% (Home)", value: 8.5 },
              { label: "9.25% (Car)", value: 9.25 },
              { label: "11% (Personal)", value: 11 },
            ]}
          />

          <TactileSliderInput
            label={t.tenureLabel}
            description={t.tenureDesc}
            value={tenureYears}
            onChange={setTenureYears}
            min={1}
            max={30}
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
        </div>

        {/* Parallel SIP Interest-Recovery Toggle Card */}
        <div className="bg-white dark:bg-[#111827] border border-slate-300 dark:border-white/15 rounded-xl p-3.5 sm:p-4 shadow-xs space-y-3.5 sm:space-y-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showSipOffset}
              onChange={(e) => setShowSipOffset(e.target.checked)}
              className="w-4 h-4 rounded border-slate-400 accent-emerald-600 cursor-pointer shrink-0"
            />
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-300/80 dark:border-white/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp size={15} />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                {t.sipOffsetToggle}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-snug">
                {t.sipOffsetDesc}
              </span>
            </div>
          </label>

          {showSipOffset && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 pt-3 border-t border-slate-200 dark:border-white/15 animate-in fade-in duration-150">
              <TactileSliderInput
                label={t.sipPctOfEmiLabel}
                value={sipPctOfEmi}
                onChange={setSipPctOfEmi}
                min={5}
                max={50}
                step={5}
                suffix="%"
                presets={[
                  { label: "10% of EMI", value: 10 },
                  { label: "15% of EMI", value: 15 },
                  { label: "20% of EMI", value: 20 },
                  { label: "25% of EMI", value: 25 },
                ]}
              />

              <TactileSliderInput
                label={t.sipReturnLabel}
                value={sipReturnPct}
                onChange={setSipReturnPct}
                min={8}
                max={18}
                step={0.5}
                suffix="%"
                presets={[
                  { label: "11%", value: 11 },
                  { label: "12%", value: 12 },
                  { label: "14%", value: 14 },
                ]}
              />
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: EMI SUMMARY, RECOVERY BADGE & PAYDOWN CHART */}
      <section className="space-y-4 sm:space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-0.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            {t.resultHeader}
          </h3>

          {showSipOffset && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-slate-300 dark:border-white/15 text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs font-extrabold">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{t.interestRecoveredBadge(result.interestRecoveredPct)}</span>
            </div>
          )}
        </div>

        {/* High-Contrast Hero Banner */}
        <div className="rounded-2xl bg-slate-900 dark:bg-[#0F172A] border border-slate-800 dark:border-white/15 text-white p-4 sm:p-6 shadow-md space-y-4 sm:space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                <CreditCard size={13} />
                <span>
                  {t.heroTitle} ({tenureYears} {t.yearsUnit})
                </span>
              </div>

              <div className="mt-2 sm:mt-2.5 flex flex-wrap items-baseline gap-2 sm:gap-2.5">
                <span className="text-2xl sm:text-5xl font-black tracking-tight text-white tabular-nums">
                  {formatINR(result.emi)}
                </span>
                <span className="text-xs sm:text-sm font-bold text-amber-300">/ month</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
              <div className="bg-slate-800/95 border border-slate-700 rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-300 block truncate">
                  {t.principalLabel}
                </span>
                <span className="text-sm sm:text-lg font-black text-white tabular-nums mt-0.5 block truncate">
                  {formatINRCompact(result.loanAmount)}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">
                  Borrowed
                </span>
              </div>

              <div className="bg-slate-800/95 border border-slate-700 rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-300 block truncate">
                  {t.interestLabel}
                </span>
                <span className="text-sm sm:text-lg font-black text-amber-400 tabular-nums mt-0.5 block truncate">
                  {formatINRCompact(result.totalInterest)}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">
                  @ {interestRate}% p.a.
                </span>
              </div>

              {showSipOffset ? (
                <div className="bg-slate-800/95 border border-slate-700 rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-300 block truncate">
                    {t.sipProfitLabel}
                  </span>
                  <span className="text-sm sm:text-lg font-black text-emerald-400 tabular-nums mt-0.5 block truncate">
                    +{formatINRCompact(result.sipProfitGained)}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">
                    {formatINR(result.parallelMonthlySip)}/mo
                  </span>
                </div>
              ) : (
                <div className="bg-slate-800/95 border border-slate-700 rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-indigo-300 block truncate">
                    {t.totalPayableLabel}
                  </span>
                  <span className="text-sm sm:text-lg font-black text-indigo-300 tabular-nums mt-0.5 block truncate">
                    {formatINRCompact(result.totalPayable)}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">
                    Prin. + Int.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plain-Language Summary Callout */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-300 dark:border-white/15 shadow-xs flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">
            {t.takeawaySentence(
              formatINRCompact(result.loanAmount),
              interestRate,
              tenureYears,
              formatINR(result.emi),
              formatINRCompact(result.totalInterest),
              showSipOffset,
              formatINR(result.parallelMonthlySip),
              formatINRCompact(result.sipProfitGained)
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
                    <linearGradient id="emiLoanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="emiSipGrad" x1="0" y1="0" x2="0" y2="1">
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
                  <Tooltip content={<CustomEmiTooltip t={t} showSipOffset={showSipOffset} />} />
                  <Area
                    type="monotone"
                    dataKey="endingLoanBalance"
                    name={t.legendLoanBal}
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fill="url(#emiLoanGrad)"
                  />
                  {showSipOffset && (
                    <Area
                      type="monotone"
                      dataKey="sipCorpus"
                      name={t.legendSipVal}
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#emiSipGrad)"
                    />
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
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colPrincipalPaid}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colInterestPaid}</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap">{t.colLoanBal}</th>
                  {showSipOffset && (
                    <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 text-right whitespace-nowrap">{t.colSipBal}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {result.yearlySchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {t.yrShort} {row.year}
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatINRCompact(row.principalPaid)}
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      {formatINRCompact(row.interestPaid)}
                    </td>
                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatINRCompact(row.endingLoanBalance)}
                    </td>
                    {showSipOffset && (
                      <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatINRCompact(row.sipCorpus)}
                      </td>
                    )}
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

export default EmiCalculator;