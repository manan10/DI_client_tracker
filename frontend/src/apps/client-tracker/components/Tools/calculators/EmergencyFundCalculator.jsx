import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldAlert,
  Sparkles,
  BarChart3,
  Table as TableIcon,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  Landmark,
  BadgeIndianRupee,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatINR, formatINRCompact } from "./mathUtils";
import { TactileSliderInput, CustomDropdown } from "./CalculatorControls";

const TRANSLATIONS = {
  en: {
    sectionTitle: "1. Enter Monthly Expenses & Liquid Assets",
    sectionSub:
      "Calculate your family's safety net and verify if your emergency cash reserve is sufficient.",
    monthlyExpenseLabel: "Monthly Household Living Expenses",
    monthlyExpenseDesc: "Essential monthly living costs (groceries, utilities, rent, medical).",
    monthlyEmiLabel: "Monthly Debt EMIs",
    monthlyEmiDesc: "Mandatory monthly loan installments (Home, Car, Personal loans).",
    annualCommitmentsLabel: "Annual Commitments (Insurance, School Fees)",
    annualCommitmentsDesc: "Yearly fixed outflows divided across months.",
    targetBufferLabel: "Target Emergency Safety Buffer",
    targetBufferDesc: "Recommended buffer: 6 months of fixed expenses.",
    liquidAssetsLabel: "Current Liquid Assets Available",
    liquidAssetsDesc: "Savings accounts, FDs, or Liquid Mutual Funds instantly accessible.",

    resultHeader: "2. Emergency Fund Health & Liquidity Report",
    heroTitle: "Target Emergency Reserve Needed",
    monthlyBurnLabel: "Total Monthly Burn Rate",
    monthlyBurnSub: "Expenses + EMIs + Annual commitments prorated",
    currentLiquidLabel: "Current Liquid Assets",
    currentLiquidSub: "Instantly accessible cash buffer",
    healthStatusLabel: "Emergency Readiness Score",
    deficitAlert: (shortfall, months) =>
      `Cash Shortfall of ${shortfall} detected (${months} months reserve vs target). Build liquidity immediately.`,
    surplusBadge: (months) =>
      `Strong Safety Net! You have ${months} months of emergency cash buffer.`,

    takeawaySentence: (burn, targetMonths, targetFund, liquid, shortfall) =>
      shortfall > 0
        ? `With a total monthly burn rate of ${burn}/mo, your ${targetMonths}-month emergency fund target is ${targetFund}. After accounting for ${liquid} in current liquid assets, you need an extra ${shortfall} in safe, accessible reserves.`
        : `With a total monthly burn rate of ${burn}/mo, your emergency fund target of ${targetFund} is fully met by your current liquid assets of ${liquid}.`,

    chartTitle: "Required Emergency Fund vs. Current Liquid Cash",
    chartSub: "Visual comparison of your safety net buffer",
    tableTitle: "Monthly Cashflow & Safety Net Breakdown",
    colMetric: "Financial Metric",
    colAmount: "Amount",
    rowLiving: "Monthly Household Living Expenses",
    rowEmi: "Monthly Debt EMIs",
    rowAnnual: "Annual Commitments (Prorated Monthly)",
    rowTotalBurn: "Total Monthly Burn Rate",
    rowTargetFund: "Target Emergency Corpus",
    rowCurrentLiquid: "Current Liquid Assets",
    rowNetStatus: "Net Emergency Surplus / (Shortfall)",

    waGreeting: (name) => (name ? `Namaste *${name}*,` : `Namaste,`),
    waIntro:
      "Here is your personalized *Emergency Fund & Cash Reserve Assessment* prepared by *Dalal Investments*:",
    waBurnHeader: "1️⃣ *Monthly Burn Rate Breakdown*",
    waLiving: "Monthly Living Expenses",
    waEmi: "Monthly Debt EMIs",
    waAnnual: "Annual Commitments (Prorated)",
    waTotalBurn: "Total Monthly Burn Rate",
    waHealthHeader: "2️⃣ *Emergency Reserve Health*",
    waTargetMonths: "Target Safety Buffer",
    waTargetFund: "Target Emergency Corpus",
    waLiquid: "Current Liquid Assets",
    waStatus: "Net Surplus / (Shortfall)",
    waTakeawayHeader: "💡 *Advisor Recommendation:*",
    waDisclaimer:
      "Disclaimer: Financial planning standards recommend maintaining 6 months of fixed expenses in liquid instruments (Liquid Mutual Funds or sweep-in FDs) before committing surplus to equity.",
    pdfTitle: "Emergency Fund & Cash Reserve Health Report",
    pdfSubtitle: "Scientific liquidity buffer & family safety net assessment",
  },
  hi: {
    sectionTitle: "1. मासिक खर्च और तरल संपत्ति (Liquid Assets) दर्ज करें",
    sectionSub:
      "अपने परिवार का सेफ्टी नेट कैलकुलेट करें और जांचें कि आपका आपातकालीन कैश रिजर्व पर्याप्त है या नहीं।",
    monthlyExpenseLabel: "मासिक घरेलू जीवनयापन खर्च",
    monthlyExpenseDesc: "आवश्यक मासिक खर्च (राशन, बिजली, किराया, चिकित्सा)।",
    monthlyEmiLabel: "मासिक लोन EMI",
    monthlyEmiDesc: "अनिवार्य मासिक लोन किश्तें (होम लोन, कार लोन)।",
    annualCommitmentsLabel: "वार्षिक खर्चे (बीमा, स्कूल फीस)",
    annualCommitmentsDesc: "सालाना फिक्स खर्चे जिन्हें महीनों में आंका गया है।",
    targetBufferLabel: "लक्ष्य आपातकालीन बफर अवधि",
    targetBufferDesc: "अनुशंसित बफर: 6 महीने के फिक्स खर्चे।",
    liquidAssetsLabel: "वर्तमान उपलब्ध तरल संपत्ति",
    liquidAssetsDesc: "सेविंग्स अकाउंट, FD या लिक्विड म्यूचुअल फंड जो तुरंत निकाले जा सकें।",

    resultHeader: "2. इमरजेंसी फंड स्वास्थ्य और तरलता रिपोर्ट",
    heroTitle: "आवश्यक आपातकालीन फंड",
    monthlyBurnLabel: "कुल मासिक खर्च (Burn Rate)",
    monthlyBurnSub: "खर्च + EMI + वार्षिक खर्चे (मासिक)",
    currentLiquidLabel: "वर्तमान तरल संपत्ति",
    currentLiquidSub: "तुरंत उपलब्ध कैश बफर",
    healthStatusLabel: "इमरजेंसी तैयारी स्कोर",
    deficitAlert: (shortfall, months) =>
      `${shortfall} की कैश कमी पाई गई है (लक्ष्य के मुकाबले ${months} महीने का रिजर्व)। तुरंत लिक्विडिटी बढ़ाएं।`,
    surplusBadge: (months) =>
      `मजबूत सेफ्टी नेट! आपके पास ${months} महीने का इमरजेंसी कैश बफर है।`,

    takeawaySentence: (burn, targetMonths, targetFund, liquid, shortfall) =>
      shortfall > 0
        ? `${burn}/माह के कुल खर्च के साथ, आपका ${targetMonths}-महीने का इमरजेंसी फंड लक्ष्य ${targetFund} है। मौजूदा ${liquid} की तरल संपत्ति के बाद, आपको ${extra}/माह अतिरिक्त सुरक्षित रिजर्व की जरूरत है।`
        : `${burn}/माह के कुल खर्च के साथ, आपका ${targetFund} का इमरजेंसी फंड लक्ष्य आपकी मौजूदा ${liquid} की तरल संपत्ति से पूरी तरह सुरक्षित है।`,

    chartTitle: "आवश्यक इमरजेंसी फंड बनाम वर्तमान तरल कैश",
    chartSub: "आपके सेफ्टी नेट बफर की आमने-सामने तुलना",
    tableTitle: "मासिक कैशफ्लो और सेफ्टी नेट विवरण",
    colMetric: "वित्तीय घटक",
    colAmount: "राशि",
    rowLiving: "मासिक घरेलू जीवनयापन खर्च",
    rowEmi: "मासिक लोन EMI",
    rowAnnual: "वार्षिक खर्चे (मासिक आनुपातिक)",
    rowTotalBurn: "कुल मासिक खर्च (Burn Rate)",
    rowTargetFund: "लक्ष्य आपातकालीन फंड",
    rowCurrentLiquid: "वर्तमान तरल संपत्ति",
    rowNetStatus: "शुद्ध सरप्लस / (कमी)",

    waGreeting: (name) => (name ? `नमस्ते *${name}*,` : `नमस्ते,`),
    waIntro:
      "*Dalal Investments* की ओर से आपका *इमरजेंसी फंड और कैश रिजर्व आकलन* नीचे प्रस्तुत है:",
    waBurnHeader: "1️⃣ *मासिक खर्च का विवरण*",
    waLiving: "मासिक जीवनयापन खर्च",
    waEmi: "मासिक लोन EMI",
    waAnnual: "वार्षिक खर्चे (मासिक)",
    waTotalBurn: "कुल मासिक बर्न रेट",
    waHealthHeader: "2️⃣ *इमरजेंसी रिजर्व स्वास्थ्य*",
    waTargetMonths: "लक्ष्य सेफ्टी बफर",
    waTargetFund: "लक्ष्य इमरजेंसी फंड",
    waLiquid: "वर्तमान तरल संपत्ति",
    waStatus: "शुद्ध सरप्लस / (कमी)",
    waTakeawayHeader: "💡 *सलाहकार नोट:*",
    waDisclaimer:
      "अस्वीकरण: वित्तीय नियोजन मानकों के अनुसार इक्विटी में निवेश करने से पहले लिक्विड इंस्ट्रूमेंट्स में 6 महीने के खर्चे का रिजर्व रखना आवश्यक है।",
    pdfTitle: "इमरजेंसी फंड और कैश रिजर्व हेल्थ रिपोर्ट",
    pdfSubtitle: "वैज्ञानिक लिक्विडिटी बफर और पारिवारिक सुरक्षा आकलन (Dalal Investments)",
  },
  gu: {
    sectionTitle: "1. માસિક ખર્ચ અને લિક્વિડ એસેટ્સ દાખલ કરો",
    sectionSub:
      "તમારા પરિવારનું સેફ્ટી નેટ કેલ્ક્યુલેટ કરો અને ચકાસો કે તમારું ઇમરજન્સી કેશ રિઝર્વ પૂરતું છે કે નહીં.",
    monthlyExpenseLabel: "માસિક પારિવારિક જીવનનિર્વાહ ખર્ચ",
    monthlyExpenseDesc: "જરૂરી માસિક ખર્ચ (કિરાणा, વીજળી, ભાડું, તબીબી).",
    monthlyEmiLabel: "માસિક લોન EMI",
    monthlyEmiDesc: "ફરજિયાત માસિક લોન હપ્તાઓ (હોમ લોન, કાર લોન).",
    annualCommitmentsLabel: "વાર્ષિક ખર્ચા (વીમો, સ્કૂલ ફી)",
    annualCommitmentsDesc: "વાર્ષિક ફિક્સ ખર્ચા જે મહિનાઓમાં વહેંચાયેલા છે.",
    targetBufferLabel: "લક્ષ્ય ઇમરજન્સી બફર સમયગાળો",
    targetBufferDesc: "ભલામણ કરેલ બફર: 6 મહિનાના ફિક્સ ખર્ચા.",
    liquidAssetsLabel: "હાલ ઉપલબ્ધ લિક્વિડ એસેટ્સ",
    liquidAssetsDesc: "સેવિંગ્સ અકાઉન્ટ, FD અથવા લિક્વિડ મ્યુચ્યુઅલ ફંડ જે તુરંત ઉપાડી શકાય.",

    resultHeader: "2. ઇમરજન્સી ફંડ સ્વાસ્થ્ય અને લિક્વિડિટી રિપોર્ટ",
    heroTitle: "જરૂરી ઇમરજન્સી ફંડ",
    monthlyBurnLabel: "કુલ માસિક ખર્ચ (Burn Rate)",
    monthlyBurnSub: "ખર્ચ + EMI + વાર્ષિક ખર્ચા (માસિક)",
    currentLiquidLabel: "હાલની લિક્વિડ એસેટ્સ",
    currentLiquidSub: "તુરંત ઉપલબ્ધ કેશ બફર",
    healthStatusLabel: "ઇમરજન્સી તૈયારી સ્કોર",
    deficitAlert: (shortfall, months) =>
      `${shortfall} ની કેશ ઘટ જોવા મળી છે (લક્ષ્ય સામે ${months} મહિનાનું રિઝર્વ). તુરંત લિક્વિડિટી વધારો.`,
    surplusBadge: (months) =>
      `મજબૂત સેફ્ટી નેટ! તમારી પાસે ${months} મહિનાનું ઇમરજન્સી કેશ બફર છે.`,

    takeawaySentence: (burn, targetMonths, targetFund, liquid, shortfall) =>
      shortfall > 0
        ? `${burn}/માસના કુલ ખર્ચ સાથે, તમારું ${targetMonths}-મહિનાનું ઇમરજન્સી ફંડ લક્ષ્ય ${targetFund} છે. હાલની ${liquid} ની લિક્વિડ એસેટ્સ બાદ કર્યા પછી, તમારે ${shortfall} વધારાના સુરક્ષિત રિઝર્વની જરૂર છે.`
        : `${burn}/માસના કુલ ખર્ચ સાથે, તમારું ${targetFund} નું ઇમરજન્સી ફંડ લક્ષ્ય તમારી હાલની ${liquid} ની લિક્વિડ એસેટ્સથી સંપૂર્ણપણે સુરક્ષિત છે.`,

    chartTitle: "જરૂરી ઇમરજન્સી ફંડ વિ. હાલની લિક્વિડ કેશ",
    chartSub: "તમારા સેફ્ટી નેટ બફરની સામસામે સરખામણી",
    tableTitle: "માસિક કેશફ્લો અને સેફ્ટી નેટ વિગત",
    colMetric: "નાણાકીય ઘટક",
    colAmount: "રકમ",
    rowLiving: "માસિક પારિવારિક જીવનનિર્વાહ ખર્ચ",
    rowEmi: "માસિક લોન EMI",
    rowAnnual: "વાર્ષિક ખર્ચા (માસિક)",
    rowTotalBurn: "કુલ માસિક બર્ન રેટ",
    rowTargetFund: "લક્ષ્ય ઇમરજન્સી ફંડ",
    rowCurrentLiquid: "હાલની લિક્વિડ એસેટ્સ",
    rowNetStatus: "ચોખ્ખો સરપ્લસ / (ઘટ)",

    waGreeting: (name) => (name ? `નમસ્તે *${name}*,` : `નમસ્તે,`),
    waIntro:
      "*Dalal Investments* તરફથી તમારું *ઇમરજન્સી ફંડ અને કેશ રિઝર્વ આકલન* નીચે મુજબ છે:",
    waBurnHeader: "1️⃣ *માસિક ખર્ચની વિગત*",
    waLiving: "માસિક જીવનનિર્વાહ ખર્ચ",
    waEmi: "માસિક લોન EMI",
    waAnnual: "વાર્ષિક ખર્ચા (માસિક)",
    waTotalBurn: "કુલ માસિક બર્ન રેટ",
    waHealthHeader: "2️⃣ *ઇમરજન્સી રિઝર્વ સ્વાસ્થ્ય*",
    waTargetMonths: "લક્ષ્ય સેફ્ટી બફર",
    waTargetFund: "લક્ષ્ય ઇમરજન્સી ફંડ",
    waLiquid: "હાલની લિક્વિડ એસેટ્સ",
    waStatus: "ચોખ્ખો સરપ્લસ / (ઘટ)",
    waTakeawayHeader: "💡 *સલાહકાર નોંધ:*",
    waDisclaimer:
      "સૂચના: નાણાકીય આયોજન ધોરણો મુજબ ઇક્વિટીમાં રોકાણ કરતા પહેલા લિક્વિડ ઇન્સ્ટ્રુમેન્ટ્સમાં 6 મહિનાના ખર્ચનું રિઝર્વ રાખવું આવશ્યક છે.",
    pdfTitle: "ઇમરજન્સી ફંડ અને કેશ રિઝર્વ હેલ્થ રિપોર્ટ",
    pdfSubtitle: "વૈજ્ઞાનિક લિક્વિડિટી બફર અને પારિવારિક સુરક્ષા આકલન (Dalal Investments)",
  },
};

const BUFFER_OPTIONS = [
  { value: 3, label: "3 Months (Minimum)" },
  { value: 6, label: "6 Months (Recommended)" },
  { value: 12, label: "12 Months (Conservative)" },
];

const EmergencyFundCalculator = ({ clientName, lang = "en", onSummaryChange }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [monthlyExpense, setMonthlyExpense] = useState(60000); // ₹60k/mo
  const [monthlyEmi, setMonthlyEmi] = useState(25000); // ₹25k/mo
  const [annualCommitments, setAnnualCommitments] = useState(120000); // ₹1.2L/yr (₹10k/mo prorated)
  const [targetBufferMonths, setTargetBufferMonths] = useState(6);
  const [liquidAssets, setLiquidAssets] = useState(300000); // ₹3L

  const [activeView, setActiveView] = useState("chart");

  const result = useMemo(() => {
    const exp = Math.max(0, Number(monthlyExpense) || 0);
    const emi = Math.max(0, Number(monthlyEmi) || 0);
    const ann = Math.max(0, Number(annualCommitments) || 0);
    const proratedAnnual = ann / 12;

    const totalMonthlyBurn = Math.round(exp + emi + proratedAnnual);
    const targetMonths = Number(targetBufferMonths) || 6;
    const targetEmergencyCorpus = Math.round(totalMonthlyBurn * targetMonths);
    const currentLiquid = Math.max(0, Number(liquidAssets) || 0);

    const netSurplusOrDeficit = currentLiquid - targetEmergencyCorpus;
    const shortfall = Math.max(0, targetEmergencyCorpus - currentLiquid);

    const currentBufferMonths =
      totalMonthlyBurn > 0 ? (currentLiquid / totalMonthlyBurn).toFixed(1) : "0.0";

    return {
      monthlyExpense: Math.round(exp),
      monthlyEmi: Math.round(emi),
      proratedAnnual: Math.round(proratedAnnual),
      totalMonthlyBurn,
      targetMonths,
      targetEmergencyCorpus,
      currentLiquid,
      netSurplusOrDeficit,
      shortfall,
      currentBufferMonths,
      chartData: [
        { name: "Target Reserve", amount: targetEmergencyCorpus, fill: "#6366f1" },
        { name: "Current Liquid Cash", amount: currentLiquid, fill: "#10b981" },
      ],
    };
  }, [monthlyExpense, monthlyEmi, annualCommitments, targetBufferMonths, liquidAssets]);

  useEffect(() => {
    const takeaway = t.takeawaySentence(
      formatINR(result.totalMonthlyBurn),
      result.targetMonths,
      formatINRCompact(result.targetEmergencyCorpus),
      formatINRCompact(result.currentLiquid),
      formatINRCompact(result.shortfall)
    );

    const text =
      `${t.waGreeting(clientName?.trim())}\n\n` +
      `${t.waIntro}\n\n` +
      `${t.waBurnHeader}\n` +
      `• ${t.monthlyExpenseLabel}: *${formatINR(result.monthlyExpense)}/mo*\n` +
      `• ${t.monthlyEmiLabel}: *${formatINR(result.monthlyEmi)}/mo*\n` +
      `• ${t.waAnnual}: *${formatINR(result.proratedAnnual)}/mo* (${formatINR(annualCommitments)}/yr)\n` +
      `• *${t.waTotalBurn}: ${formatINR(result.totalMonthlyBurn)}/month*\n\n` +
      `${t.waHealthHeader}\n` +
      `• ${t.waTargetMonths}: *${result.targetMonths} Months*\n` +
      `• ${t.waTargetFund}: *${formatINRCompact(result.targetEmergencyCorpus)}*\n` +
      `• ${t.waLiquid}: *${formatINRCompact(result.currentLiquid)}*\n` +
      (result.shortfall > 0
        ? `• *⚠️ ${t.waStatus}: (${formatINRCompact(result.shortfall)} Shortfall)*\n`
        : `• *✅ ${t.waStatus}: Surplus Buffer (${currentBufferMonths} mos)*\n`) +
      `\n${t.waTakeawayHeader}\n${takeaway}\n\n` +
      `_${t.waDisclaimer}_\n` +
      `— *Dalal Investments | Private Wealth Desk*`;

    onSummaryChange({
      title: t.pdfTitle,
      subtitle: t.pdfSubtitle,
      takeaway,
      whatsappText: text,
      assumptions: [
        { label: t.monthlyExpenseLabel, value: `${formatINR(result.monthlyExpense)}/mo` },
        { label: t.monthlyEmiLabel, value: `${formatINR(result.monthlyEmi)}/mo` },
        { label: "Target Buffer", value: `${result.targetMonths} Months` },
        { label: t.currentLiquidLabel, value: formatINRCompact(result.currentLiquid) },
      ],
      highlights: [
        {
          label: t.monthlyBurnLabel,
          sub: t.monthlyBurnSub,
          value: `${formatINR(result.totalMonthlyBurn)} / month`,
        },
        {
          label: t.heroTitle,
          sub: `Based on ${result.targetMonths}-month safety buffer requirement`,
          value: formatINRCompact(result.targetEmergencyCorpus),
        },
        {
          label: t.currentLiquidLabel,
          sub: `Provides ${result.currentBufferMonths} months of expense coverage`,
          value: formatINRCompact(result.currentLiquid),
        },
        {
          label: result.shortfall > 0 ? "Emergency Cash Shortfall" : "Liquidity Surplus",
          sub: result.shortfall > 0 ? "Recommended to bridge via Liquid Funds" : "Fully funded safety net",
          value: result.shortfall > 0 ? `-${formatINRCompact(result.shortfall)}` : `+${formatINRCompact(Math.abs(result.netSurplusOrDeficit))}`,
          isHero: true,
        },
      ],
      milestones: [],
      disclaimer: t.waDisclaimer,
    });
  }, [clientName, annualCommitments, result, t, onSummaryChange]);

  return (
    <div className="space-y-8 w-full font-sans">
      
      {/* ================================================================= */}
      {/* TOP SECTION: EXPENSE & LIQUID ASSETS FORM                         */}
      {/* ================================================================= */}
      <section className="bg-slate-50/90 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {t.sectionTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.sectionSub}
            </p>
          </div>

          <div className="lg:w-[280px] shrink-0">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
              {t.targetBufferLabel}
            </label>
            <CustomDropdown
              value={targetBufferMonths}
              options={BUFFER_OPTIONS}
              onChange={setTargetBufferMonths}
            />
          </div>
        </div>

        {/* Row 1: Living Expenses & Debt EMIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <TactileSliderInput
            label={t.monthlyExpenseLabel}
            description={t.monthlyExpenseDesc}
            value={monthlyExpense}
            onChange={setMonthlyExpense}
            min={10000}
            max={500000}
            sliderMax={150000}
            step={2500}
            prefix="₹"
            accent="indigo"
            presets={[
              { label: "₹40,000", value: 40000 },
              { label: "₹60,000", value: 60000 },
              { label: "₹1,00,000", value: 100000 },
              { label: "₹1,50,000", value: 150000 },
            ]}
          />

          <TactileSliderInput
            label={t.monthlyEmiLabel}
            description={t.monthlyEmiDesc}
            value={monthlyEmi}
            onChange={setMonthlyEmi}
            min={0}
            max={300000}
            sliderMax={100000}
            step={1000}
            prefix="₹"
            accent="amber"
            presets={[
              { label: "₹0", value: 0 },
              { label: "₹15,000", value: 15000 },
              { label: "₹25,000", value: 25000 },
              { label: "₹50,000", value: 50000 },
            ]}
          />
        </div>

        {/* Row 2: Annual Commitments & Current Liquid Assets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <TactileSliderInput
            label={t.annualCommitmentsLabel}
            description={t.annualCommitmentsDesc}
            value={annualCommitments}
            onChange={setAnnualCommitments}
            min={0}
            max={1000000}
            sliderMax={300000}
            step={10000}
            prefix="₹"
            presets={[
              { label: "₹50,000", value: 50000 },
              { label: "₹1,20,000", value: 120000 },
              { label: "₹2,50,000", value: 250000 },
            ]}
          />

          <TactileSliderInput
            label={t.liquidAssetsLabel}
            description={t.liquidAssetsDesc}
            value={liquidAssets}
            onChange={setLiquidAssets}
            min={0}
            max={10000000}
            sliderMax={3000000}
            step={25000}
            prefix="₹"
            accent="emerald"
            presets={[
              { label: "₹1 Lakh", value: 100000 },
              { label: "₹3 Lakhs", value: 300000 },
              { label: "₹6 Lakhs", value: 600000 },
              { label: "₹15 Lakhs", value: 1500000 },
            ]}
          />
        </div>
      </section>

      {/* ================================================================= */}
      {/* BOTTOM SECTION: HEALTH REPORT, CHART & BREAKDOWN TABLE            */}
      {/* ================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t.resultHeader}
          </h3>

          {result.shortfall > 0 ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-extrabold">
              <AlertTriangle size={15} />
              <span>{t.deficitAlert(formatINRCompact(result.shortfall), result.currentBufferMonths)}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold">
              <ShieldCheck size={15} />
              <span>{t.surplusBadge(result.currentBufferMonths)}</span>
            </div>
          )}
        </div>

        {/* High-Contrast Hero Banner */}
        <div className="rounded-2xl bg-slate-900 dark:bg-[#0F172A] border border-slate-800 dark:border-emerald-500/30 text-white p-6 shadow-md space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                <ShieldAlert size={13} />
                <span>
                  {t.heroTitle} ({result.targetMonths} Mos Buffer)
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-white tabular-nums">
                  {formatINRCompact(result.targetEmergencyCorpus)}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-emerald-300 tabular-nums">
                  {formatINR(result.targetEmergencyCorpus)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
              <div className="bg-slate-800/90 border border-indigo-500/30 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                  {t.monthlyBurnLabel}
                </span>
                <span className="text-lg font-black text-white tabular-nums mt-0.5 block">
                  {formatINR(result.totalMonthlyBurn)}
                </span>
                <span className="text-[11px] text-slate-400">
                  {t.monthlyBurnSub}
                </span>
              </div>

              <div className="bg-slate-800/90 border border-emerald-500/30 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  {t.currentLiquidLabel}
                </span>
                <span className="text-lg font-black text-emerald-400 tabular-nums mt-0.5 block">
                  {formatINRCompact(result.currentLiquid)}
                </span>
                <span className="text-[11px] text-slate-400">
                  {result.currentBufferMonths} mos coverage
                </span>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                  {result.shortfall > 0 ? "Cash Shortfall" : "Buffer Surplus"}
                </span>
                <span
                  className={`text-lg font-black tabular-nums mt-0.5 block ${
                    result.shortfall > 0 ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {result.shortfall > 0
                    ? `-${formatINRCompact(result.shortfall)}`
                    : `+${formatINRCompact(Math.abs(result.netSurplusOrDeficit))}`}
                </span>
                <span className="text-[11px] text-slate-400">
                  {result.shortfall > 0 ? "Needs funding" : "Fully secure"}
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
              formatINR(result.totalMonthlyBurn),
              result.targetMonths,
              formatINRCompact(result.targetEmergencyCorpus),
              formatINRCompact(result.currentLiquid),
              formatINRCompact(result.shortfall)
            )}
          </p>
        </div>

        {/* Chart + Breakdown Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Bar Chart (5 cols) */}
          <div className="lg:col-span-5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 bg-white dark:bg-[#0B1120] shadow-xs space-y-3">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {t.chartTitle}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.chartSub}
              </p>
            </div>

            <div className="w-full h-[230px]">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart
                  data={result.chartData}
                  margin={{ top: 14, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(148, 163, 184, 0.18)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#64748b", fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => formatINRCompact(v)}
                    tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    width={72}
                  />
                  <Tooltip
                    formatter={(value) => formatINR(value)}
                    contentStyle={{
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={48}>
                    {result.chartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Table (7 cols) */}
          <div className="lg:col-span-7 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#0B1120] shadow-xs">
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/10">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {t.tableTitle}
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4">{t.colMetric}</th>
                    <th className="py-3 px-4 text-right">{t.colAmount}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  <tr>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                      {t.rowLiving}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold">
                      {formatINR(result.monthlyExpense)}/mo
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                      {t.rowEmi}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold text-amber-600">
                      {formatINR(result.monthlyEmi)}/mo
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                      {t.rowAnnual}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold">
                      {formatINR(result.proratedAnnual)}/mo
                    </td>
                  </tr>
                  <tr className="bg-indigo-50/50 dark:bg-indigo-500/10 font-bold">
                    <td className="py-2.5 px-4 text-indigo-900 dark:text-indigo-200">
                      {t.rowTotalBurn}
                    </td>
                    <td className="py-2.5 px-4 text-right text-indigo-700 dark:text-indigo-300">
                      {formatINR(result.totalMonthlyBurn)} / mo
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                      {t.rowTargetFund} ({result.targetMonths} Months)
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold">
                      {formatINR(result.targetEmergencyCorpus)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                      {t.rowCurrentLiquid}
                    </td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 font-semibold">
                      {formatINR(result.currentLiquid)}
                    </td>
                  </tr>
                  <tr
                    className={`font-extrabold text-white ${
                      result.shortfall > 0 ? "bg-rose-950" : "bg-slate-900"
                    }`}
                  >
                    <td className="py-3 px-4">{t.rowNetStatus}</td>
                    <td
                      className={`py-3 px-4 text-right ${
                        result.shortfall > 0 ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {result.shortfall > 0
                        ? `-${formatINR(result.shortfall)} (Shortfall)`
                        : `+${formatINR(Math.abs(result.netSurplusOrDeficit))} (Surplus)`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default EmergencyFundCalculator;