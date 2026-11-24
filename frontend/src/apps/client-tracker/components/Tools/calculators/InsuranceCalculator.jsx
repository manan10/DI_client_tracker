import React, { useState, useMemo, useEffect } from "react";
import {
  Shield,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  CreditCard,
  Target,
  HeartHandshake,
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
import { TactileSliderInput } from "./CalculatorControls";

const TRANSLATIONS = {
  en: {
    sectionTitle: "1. Enter Family Income, Liabilities & Existing Cover",
    sectionSub:
      "Calculate the exact Term Life Insurance cover needed so your family's lifestyle and goals remain 100% protected.",
    annualIncomeLabel: "Annual Income / Family Expenses to Replace",
    annualIncomeDesc: "Yearly income your family relies on to maintain their lifestyle.",
    yearsToCoverLabel: "Years of Income Protection Needed",
    yearsToCoverDesc: "Typically years remaining until your planned retirement age.",
    loansLabel: "Outstanding Loans & Liabilities",
    loansDesc: "Total Home Loan, Car Loan, or Business Debt that must be cleared.",
    futureGoalsLabel: "Future Family Goals (Education / Marriage)",
    futureGoalsDesc: "Lumpsum needed for children's major milestones.",
    existingCoverLabel: "Existing Term Life Insurance Cover",
    existingCoverDesc: "Current pure term policy sum assured (excluding small endowment plans).",
    existingAssetsLabel: "Existing Liquid Savings / Investments",
    existingAssetsDesc: "Mutual funds, FDs, or PF available to support the family.",
    yearsUnit: "Yrs",

    resultHeader: "2. Human Life Value (HLV) & Protection Gap Report",
    heroTitle: "Additional Term Cover Needed (Protection Gap)",
    totalNeedLabel: "Total Protection Required",
    totalNeedSub: "Income replacement + Loans + Goals",
    existingOffsetLabel: "Existing Cover + Assets",
    existingOffsetSub: "Already available safety net",
    incomeMultiplierLabel: "Recommended Income Multiple",
    coveredTitle: "Your Family is Fully Protected!",
    coveredDesc: (total) =>
      `Your existing life cover and liquid assets (${total}) already meet or exceed your family's total financial protection requirement.`,
    gapAlert: (gap) =>
      `Protection Shortfall of ${gap} detected — recommended to bridge via a pure Term Plan.`,

    takeawaySentence: (totalNeed, existingTotal, gap, yrs) =>
      gap > 0
        ? `To protect ${yrs} years of family income, clear all loans, and fund future goals, your family needs ${totalNeed} in total cover. After accounting for ${existingTotal} in existing cover and assets, you need an additional ${gap} pure Term Insurance policy.`
        : `Your family's total protection requirement of ${totalNeed} is completely covered by your existing insurance and savings of ${existingTotal}.`,

    chartTitle: "Protection Requirement vs. Current Safety Net",
    chartSub: "Visual breakdown of total family need, existing cover, and shortfall",
    tableTitle: "Step-by-Step HLV Calculation Breakdown",
    colItem: "Protection Component",
    colAmount: "Amount",
    rowIncomePv: "Present Value of Future Family Income (Inflation-Adjusted)",
    rowLoans: "(+) Outstanding Loans & Liabilities",
    rowGoals: "(+) Future Family Goals (Education / Marriage)",
    rowGrossNeed: "Total Gross Protection Required",
    rowLessCover: "(-) Existing Term Life Insurance Cover",
    rowLessAssets: "(-) Existing Liquid Savings & Investments",
    rowNetGap: "Net Additional Term Cover Recommended",

    waGreeting: (name) => (name ? `Namaste *${name}*,` : `Namaste,`),
    waIntro:
      "Here is your personalized *Life Insurance (Human Life Value) Assessment* prepared by *Dalal Investments*:",
    waNeedHeader: "1️⃣ *Family Protection Needs*",
    waIncome: "Annual Income Protected",
    waYears: "Protection Horizon",
    waIncomePv: "Income Replacement Corpus",
    waLoans: "Outstanding Loans",
    waGoals: "Future Family Goals",
    waTotalNeed: "Total Protection Needed",
    waGapHeader: "2️⃣ *Current Cover & Shortfall*",
    waExisting: "Existing Cover + Liquid Assets",
    waGap: "Recommended Additional Term Cover",
    waTakeawayHeader: "💡 *Advisor Note:*",
    waDisclaimer:
      "Disclaimer: Human Life Value is an advisory estimate based on 8% safe reinvestment yield and 6% inflation. Pure term insurance is recommended strictly for risk protection.",
    pdfTitle: "Life Insurance & Human Life Value (HLV) Report",
    pdfSubtitle: "Scientific family income replacement & liability protection assessment",
  },
  hi: {
    sectionTitle: "1. पारिवारिक आय, लोन और मौजूदा बीमा विवरण दर्ज करें",
    sectionSub:
      "जानें कि आपके परिवार की जीवनशैली और लक्ष्यों को 100% सुरक्षित रखने के लिए कितने टर्म इंश्योरेंस की आवश्यकता है।",
    annualIncomeLabel: "सालाना आय / पारिवारिक खर्च",
    annualIncomeDesc: "वह वार्षिक आय जिस पर आपका परिवार जीवनयापन के लिए निर्भर है।",
    yearsToCoverLabel: "कितने सालों तक आय सुरक्षा चाहिए",
    yearsToCoverDesc: "आमतौर पर रिटायरमेंट तक बचे हुए वर्ष।",
    loansLabel: "बकाया लोन और देनदारियां",
    loansDesc: "कुल होम लोन, कार लोन या व्यावसायिक कर्ज जो चुकाना जरूरी है।",
    futureGoalsLabel: "भविष्य के पारिवारिक लक्ष्य (शिक्षा / विवाह)",
    futureGoalsDesc: "बच्चों की उच्च शिक्षा और शादी के लिए आवश्यक एकमुश्त राशि।",
    existingCoverLabel: "मौजूदा टर्म लाइफ इंश्योरेंस कवर",
    existingCoverDesc: "वर्तमान शुद्ध टर्म पॉलिसी की बीमा राशि।",
    existingAssetsLabel: "मौजूदा बचत और निवेश (MF / FD / PF)",
    existingAssetsDesc: "परिवार के पास पहले से उपलब्ध वित्तीय संपत्ति।",
    yearsUnit: "साल",

    resultHeader: "2. ह्यूमन लाइफ वैल्यू (HLV) और बीमा सुरक्षा रिपोर्ट",
    heroTitle: "अतिरिक्त आवश्यक टर्म कवर (Protection Gap)",
    totalNeedLabel: "कुल आवश्यक सुरक्षा कवर",
    totalNeedSub: "आय सुरक्षा + बकाया लोन + भविष्य के लक्ष्य",
    existingOffsetLabel: "मौजूदा बीमा + बचत",
    existingOffsetSub: "पहले से उपलब्ध सुरक्षा कवच",
    incomeMultiplierLabel: "सालाना आय का गुणांक",
    coveredTitle: "आपका परिवार पूरी तरह सुरक्षित है!",
    coveredDesc: (total) =>
      `आपका मौजूदा बीमा कवर और बचत (${total}) आपके परिवार की कुल वित्तीय सुरक्षा आवश्यकता को पूरा करते हैं।`,
    gapAlert: (gap) =>
      `${gap} की बीमा सुरक्षा कमी पाई गई है — इसे शुद्ध टर्म प्लान से पूरा करने की सलाह दी जाती है।`,

    takeawaySentence: (totalNeed, existingTotal, gap, yrs) =>
      gap > 0
        ? `${yrs} साल की पारिवारिक आय सुरक्षित रखने, सभी लोन चुकाने और भविष्य के लक्ष्यों के लिए कुल ${totalNeed} कवर की जरूरत है। आपकी मौजूदा बचत और बीमा (${existingTotal}) घटाने के बाद, आपको ${gap} का अतिरिक्त शुद्ध टर्म इंश्योरेंस लेना चाहिए।`
        : `आपके परिवार की कुल ${totalNeed} की सुरक्षा आवश्यकता आपके मौजूदा बीमा और बचत (${existingTotal}) से पूरी तरह सुरक्षित है।`,

    chartTitle: "आवश्यक सुरक्षा कवर बनाम मौजूदा सुरक्षा",
    chartSub: "कुल पारिवारिक जरूरत, मौजूदा कवर और कमी का तुलनात्मक दृश्य",
    tableTitle: "HLV गणना का पूरा विवरण",
    colItem: "सुरक्षा घटक",
    colAmount: "राशि",
    rowIncomePv: "भविष्य की पारिवारिक आय का वर्तमान मूल्य (महंगाई समायोजित)",
    rowLoans: "(+) बकाया लोन और देनदारियां",
    rowGoals: "(+) भविष्य के पारिवारिक लक्ष्य (शिक्षा / विवाह)",
    rowGrossNeed: "कुल आवश्यक सुरक्षा कवर",
    rowLessCover: "(-) मौजूदा टर्म लाइफ इंश्योरेंस",
    rowLessAssets: "(-) मौजूदा बचत और निवेश",
    rowNetGap: "अनुशंसित अतिरिक्त टर्म कवर",

    waGreeting: (name) => (name ? `नमस्ते *${name}*,` : `नमस्ते,`),
    waIntro:
      "*Dalal Investments* की ओर से आपका *लाइफ इंश्योरेंस (Human Life Value) आकलन* नीचे प्रस्तुत है:",
    waNeedHeader: "1️⃣ *परिवार की सुरक्षा आवश्यकता*",
    waIncome: "सालाना आय सुरक्षा",
    waYears: "सुरक्षा अवधि",
    waIncomePv: "आय प्रतिस्थापन फंड",
    waLoans: "बकाया लोन",
    waGoals: "भविष्य के लक्ष्य",
    waTotalNeed: "कुल आवश्यक सुरक्षा कवर",
    waGapHeader: "2️⃣ *मौजूदा कवर और कमी*",
    waExisting: "मौजूदा बीमा + बचत",
    waGap: "आवश्यक अतिरिक्त टर्म कवर",
    waTakeawayHeader: "💡 *सलाहकार नोट:*",
    waDisclaimer:
      "अस्वीकरण: यह गणना 8% सुरक्षित रिटर्न और 6% महंगाई दर के आधार पर एक सलाहकार आकलन है। शुद्ध टर्म बीमा केवल परिवार की सुरक्षा के लिए अनुशंसित है।",
    pdfTitle: "लाइफ इंश्योरेंस और ह्यूमन लाइफ वैल्यू (HLV) रिपोर्ट",
    pdfSubtitle: "पारिवारिक आय सुरक्षा और देनदारी आकलन (Dalal Investments)",
  },
  gu: {
    sectionTitle: "1. પારિવારિક આવક, લોન અને હાલના વીમાની વિગતો દાખલ કરો",
    sectionSub:
      "જાણો કે તમારા પરિવારની જીવનશૈલી અને લક્ષ્યોને 100% સુરક્ષિત રાખવા માટે કેટલા ટર્મ ઇન્શ્યોરન્સની જરૂર છે.",
    annualIncomeLabel: "વાર્ષિક આવક / પારિવારિક ખર્ચ",
    annualIncomeDesc: "તે વાર્ષિક આવક જેના પર તમારો પરિવાર જીવનનિર્વાહ માટે નિર્ભર છે.",
    yearsToCoverLabel: "કેટલા વર્ષ સુધી આવક સુરક્ષા જોઈએ",
    yearsToCoverDesc: "સામાન્ય રીતે નિવૃત્તિ સુધી બાકી રહેલા વર્ષ.",
    loansLabel: "બાકી લોન અને જવાબદારીઓ",
    loansDesc: "કુલ હોમ લોન, કાર લોન અથવા વ્યવસાયિક દેવું જે ચૂકવવું જરૂરી છે.",
    futureGoalsLabel: "ભવિષ્યના પારિવારિક લક્ષ્યો (શિક્ષણ / લગ્ન)",
    futureGoalsDesc: "બાળકોના ઉચ્ચ શિક્ષણ અને લગ્ન માટે જરૂરી એકસાથે રકમ.",
    existingCoverLabel: "હાલનું ટર્મ લાઇફ ઇન્શ્યોરન્સ કવર",
    existingCoverDesc: "વર્તમાન શુદ્ધ ટર્મ પોલિસીની વીમા રકમ.",
    existingAssetsLabel: "હાલની બચત અને રોકાણ (MF / FD / PF)",
    existingAssetsDesc: "પરિવાર પાસે પહેલેથી ઉપલબ્ધ નાણાકીય સંપત્તિ.",
    yearsUnit: "વર્ષ",

    resultHeader: "2. હ્યુમન લાઇફ વેલ્યુ (HLV) અને વીમા સુરક્ષા રિપોર્ટ",
    heroTitle: "વધારાનું જરૂરી ટર્મ કવર (Protection Gap)",
    totalNeedLabel: "કુલ જરૂરી સુરક્ષા કવર",
    totalNeedSub: "આવક સુરક્ષા + બાકી લોન + ભવિષ્યના લક્ષ્યો",
    existingOffsetLabel: "હાલનો વીમો + બચત",
    existingOffsetSub: "પહેલેથી ઉપલબ્ધ સુરક્ષા કવચ",
    incomeMultiplierLabel: "વાર્ષિક આવકનો ગુણાંક",
    coveredTitle: "તમારો પરિવાર સંપૂર્ણપણે સુરક્ષિત છે!",
    coveredDesc: (total) =>
      `તમારું હાલનું વીમા કવર અને બચત (${total}) તમારા પરિવારની કુલ નાણાકીય સુરક્ષા જરૂરિયાતને પૂર્ણ કરે છે.`,
    gapAlert: (gap) =>
      `${gap} ની વીમા સુરક્ષા ઘટ જોવા મળી છે — તેને શુદ્ધ ટર્મ પ્લાન દ્વારા પૂરી કરવાની ભલામણ છે.`,

    takeawaySentence: (totalNeed, existingTotal, gap, yrs) =>
      gap > 0
        ? `${yrs} વર્ષની પારિવારિક આવક સુરક્ષિત રાખવા, તમામ લોન ચૂકવવા અને ભવિષ્યના લક્ષ્યો માટે કુલ ${totalNeed} કવરની જરૂર છે. તમારી હાલની બચત અને વીમો (${existingTotal}) બાદ કર્યા પછી, તમારે ${gap} નું વધારાનું શુદ્ધ ટર્મ ઇન્શ્યોરન્સ લેવું જોઈએ.`
        : `તમારા પરિવારની કુલ ${totalNeed} ની સુરક્ષા જરૂરિયાત તમારા હાલના વીમા અને બચત (${existingTotal}) થી સંપૂર્ણપણે સુરક્ષિત છે.`,

    chartTitle: "જરૂરી સુરક્ષા કવર વિ. હાલની સુરક્ષા",
    chartSub: "કુલ પારિવારિક જરૂરિયાત, હાલનું કવર અને ઘટનું તુલનાત્મક દ્રશ્ય",
    tableTitle: "HLV ગણતરીની સંપૂર્ણ વિગત",
    colItem: "સુરક્ષા ઘટક",
    colAmount: "રકમ",
    rowIncomePv: "ભવિષ્યની પારિવારિક આવકનું વર્તમાન મૂલ્ય (મોંઘવારી સમાયોજિત)",
    rowLoans: "(+) બાકી લોન અને જવાબદારીઓ",
    rowGoals: "(+) ભવિષ્યના પારિવારિક લક્ષ્યો (શિક્ષણ / લગ્ન)",
    rowGrossNeed: "કુલ જરૂરી સુરક્ષા કવર",
    rowLessCover: "(-) હાલનું ટર્મ લાઇફ ઇન્શ્યોરન્સ",
    rowLessAssets: "(-) હાલની બચત અને રોકાણ",
    rowNetGap: "ભલામણ કરાયેલ વધારાનું ટર્મ કવર",

    waGreeting: (name) => (name ? `નમસ્તે *${name}*,` : `નમસ્તે,`),
    waIntro:
      "*Dalal Investments* તરફથી તમારું *લાઇફ ઇન્શ્યોરન્સ (Human Life Value) આકલન* નીચે મુજબ છે:",
    waNeedHeader: "1️⃣ *પરિવારની સુરક્ષા જરૂરિયાત*",
    waIncome: "વાર્ષિક આવક સુરક્ષા",
    waYears: "સુરક્ષા સમયગાળો",
    waIncomePv: "આવક રિપ્લેસમેન્ટ ફંડ",
    waLoans: "બાકી લોન",
    waGoals: "ભવિષ્યના લક્ષ્યો",
    waTotalNeed: "કુલ જરૂરી સુરક્ષા કવર",
    waGapHeader: "2️⃣ *હાલનું કવર અને ઘટ*",
    waExisting: "હાલનો વીમો + બચત",
    waGap: "જરૂરી વધારાનું ટર્મ કવર",
    waTakeawayHeader: "💡 *સલાહકાર નોંધ:*",
    waDisclaimer:
      "સૂચના: આ ગણતરી 8% સુરક્ષિત વળતર અને 6% મોંઘવારી દરના આધારે એક સલાહકાર આકલન છે. શુદ્ધ ટર્મ વીમો ફક્ત પરિવારની સુરક્ષા માટે ભલામણ કરવામાં આવે છે.",
    pdfTitle: "લાઇફ ઇન્શ્યોરન્સ અને હ્યુમન લાઇફ વેલ્યુ (HLV) રિપોર્ટ",
    pdfSubtitle: "પારિવારિક આવક સુરક્ષા અને જવાબદારી આકલન (Dalal Investments)",
  },
};

const InsuranceCalculator = ({ clientName, lang = "en", onSummaryChange }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [annualIncome, setAnnualIncome] = useState(1200000); // ₹12L/yr
  const [yearsToCover, setYearsToCover] = useState(20);
  const [outstandingLoans, setOutstandingLoans] = useState(3500000); // ₹35L
  const [futureGoals, setFutureGoals] = useState(2500000); // ₹25L
  const [existingCover, setExistingCover] = useState(2500000); // ₹25L
  const [existingAssets, setExistingAssets] = useState(1000000); // ₹10L

  const result = useMemo(() => {
    const inc = Math.max(0, Number(annualIncome) || 0);
    const yrs = Math.max(1, Number(yearsToCover) || 1);
    const loans = Math.max(0, Number(outstandingLoans) || 0);
    const goals = Math.max(0, Number(futureGoals) || 0);
    const cover = Math.max(0, Number(existingCover) || 0);
    const assets = Math.max(0, Number(existingAssets) || 0);

    // Present value of inflation-adjusted income stream (assuming 8% safe reinvestment yield vs 6% inflation -> ~1.8868% real rate)
    const realRate = (1.08 / 1.06) - 1;
    const incomeReplacementPv =
      realRate > 0
        ? inc * ((1 - Math.pow(1 + realRate, -yrs)) / realRate)
        : inc * yrs;

    const totalGrossNeed = Math.round(incomeReplacementPv + loans + goals);
    const existingOffset = Math.round(cover + assets);
    const protectionGap = Math.max(0, totalGrossNeed - existingOffset);

    // Round recommended cover up to nearest ₹5 Lakhs for clean policy sizing
    const recommendedNewCover =
      protectionGap > 0 ? Math.ceil(protectionGap / 500000) * 500000 : 0;

    const incomeMultiple =
      inc > 0 ? (totalGrossNeed / inc).toFixed(1) : "0.0";

    return {
      incomeReplacementPv: Math.round(incomeReplacementPv),
      loans,
      goals,
      totalGrossNeed,
      cover,
      assets,
      existingOffset,
      protectionGap,
      recommendedNewCover,
      incomeMultiple,
      chartData: [
        { name: "Total Need", amount: totalGrossNeed, fill: "#6366f1" },
        { name: "Existing Safety Net", amount: existingOffset, fill: "#10b981" },
        { name: "Additional Cover", amount: recommendedNewCover, fill: "#f59e0b" },
      ],
    };
  }, [
    annualIncome,
    yearsToCover,
    outstandingLoans,
    futureGoals,
    existingCover,
    existingAssets,
  ]);

  useEffect(() => {
    const takeaway = t.takeawaySentence(
      formatINRCompact(result.totalGrossNeed),
      formatINRCompact(result.existingOffset),
      formatINRCompact(result.recommendedNewCover),
      yearsToCover
    );

    const text =
      `${t.waGreeting(clientName?.trim())}\n\n` +
      `${t.waIntro}\n\n` +
      `${t.waNeedHeader}\n` +
      `• ${t.waIncome}: *${formatINRCompact(annualIncome)}/yr* (${yearsToCover} ${t.yearsUnit})\n` +
      `• ${t.waIncomePv}: *${formatINRCompact(result.incomeReplacementPv)}*\n` +
      `• ${t.waLoans}: *${formatINRCompact(result.loans)}*\n` +
      `• ${t.waGoals}: *${formatINRCompact(result.goals)}*\n` +
      `• *${t.waTotalNeed}: ${formatINRCompact(result.totalGrossNeed)}*\n\n` +
      `${t.waGapHeader}\n` +
      `• ${t.waExisting}: *${formatINRCompact(result.existingOffset)}*\n` +
      `• *${t.waGap}: ${formatINRCompact(result.recommendedNewCover)}*\n\n` +
      `${t.waTakeawayHeader}\n${takeaway}\n\n` +
      `_${t.waDisclaimer}_\n` +
      `— *Dalal Investments | Private Wealth Desk*`;

    onSummaryChange({
      title: t.pdfTitle,
      subtitle: t.pdfSubtitle,
      takeaway,
      whatsappText: text,
      assumptions: [
        { label: t.waIncome, value: `${formatINRCompact(annualIncome)}/yr` },
        { label: t.waYears, value: `${yearsToCover} ${t.yearsUnit}` },
        { label: t.waLoans, value: formatINRCompact(result.loans) },
        { label: t.waGoals, value: formatINRCompact(result.goals) },
      ],
      highlights: [
        {
          label: t.rowIncomePv,
          sub: `Protects ${formatINRCompact(annualIncome)}/yr family lifestyle for ${yearsToCover} ${t.yearsUnit}`,
          value: formatINRCompact(result.incomeReplacementPv),
        },
        {
          label: t.rowGrossNeed,
          sub: `Income Replacement + Loans (${formatINRCompact(result.loans)}) + Goals (${formatINRCompact(result.goals)})`,
          value: formatINRCompact(result.totalGrossNeed),
        },
        {
          label: t.existingOffsetLabel,
          sub: `Existing Term Cover (${formatINRCompact(result.cover)}) + Savings (${formatINRCompact(result.assets)})`,
          value: `-${formatINRCompact(result.existingOffset)}`,
        },
        {
          label: t.heroTitle,
          sub:
            result.recommendedNewCover > 0
              ? "Recommended pure Term Insurance sum assured to close the gap"
              : "Family is already 100% protected",
          value:
            result.recommendedNewCover > 0
              ? `${formatINRCompact(result.recommendedNewCover)} (${formatINR(result.recommendedNewCover)})`
              : "₹0 (Fully Covered)",
          isHero: true,
        },
      ],
      milestones: [],
      disclaimer: t.waDisclaimer,
    });
  }, [clientName, annualIncome, yearsToCover, result, t, onSummaryChange]);

  return (
    <div className="space-y-8 w-full font-sans">
      
      {/* ================================================================= */}
      {/* TOP SECTION: HLV INPUT FORM                                       */}
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

        {/* Row 1: Annual Income & Years to Cover */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <TactileSliderInput
            label={t.annualIncomeLabel}
            description={t.annualIncomeDesc}
            value={annualIncome}
            onChange={setAnnualIncome}
            min={300000}
            max={20000000}
            sliderMax={5000000}
            step={100000}
            prefix="₹"
            accent="indigo"
            presets={[
              { label: "₹6 L", value: 600000 },
              { label: "₹12 L", value: 1200000 },
              { label: "₹20 L", value: 2000000 },
              { label: "₹35 L", value: 3500000 },
            ]}
          />

          <TactileSliderInput
            label={t.yearsToCoverLabel}
            description={t.yearsToCoverDesc}
            value={yearsToCover}
            onChange={setYearsToCover}
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
        </div>

        {/* Row 2: Liabilities & Future Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <TactileSliderInput
            label={t.loansLabel}
            description={t.loansDesc}
            value={outstandingLoans}
            onChange={setOutstandingLoans}
            min={0}
            max={50000000}
            sliderMax={15000000}
            step={100000}
            prefix="₹"
            accent="amber"
            presets={[
              { label: "₹0", value: 0 },
              { label: "₹20 L", value: 2000000 },
              { label: "₹35 L", value: 3500000 },
              { label: "₹75 L", value: 7500000 },
            ]}
          />

          <TactileSliderInput
            label={t.futureGoalsLabel}
            description={t.futureGoalsDesc}
            value={futureGoals}
            onChange={setFutureGoals}
            min={0}
            max={50000000}
            sliderMax={15000000}
            step={100000}
            prefix="₹"
            accent="amber"
            presets={[
              { label: "₹0", value: 0 },
              { label: "₹25 L", value: 2500000 },
              { label: "₹50 L", value: 5000000 },
              { label: "₹1 Cr", value: 10000000 },
            ]}
          />
        </div>

        {/* Row 3: Existing Cover & Liquid Savings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <TactileSliderInput
            label={t.existingCoverLabel}
            description={t.existingCoverDesc}
            value={existingCover}
            onChange={setExistingCover}
            min={0}
            max={50000000}
            sliderMax={20000000}
            step={250000}
            prefix="₹"
            presets={[
              { label: "₹0", value: 0 },
              { label: "₹25 L", value: 2500000 },
              { label: "₹50 L", value: 5000000 },
              { label: "₹1 Cr", value: 10000000 },
            ]}
          />

          <TactileSliderInput
            label={t.existingAssetsLabel}
            description={t.existingAssetsDesc}
            value={existingAssets}
            onChange={setExistingAssets}
            min={0}
            max={50000000}
            sliderMax={15000000}
            step={100000}
            prefix="₹"
            presets={[
              { label: "₹0", value: 0 },
              { label: "₹10 L", value: 1000000 },
              { label: "₹25 L", value: 2500000 },
              { label: "₹50 L", value: 5000000 },
            ]}
          />
        </div>
      </section>

      {/* ================================================================= */}
      {/* BOTTOM SECTION: HLV RESULTS, CHART & BREAKDOWN LEDGER             */}
      {/* ================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t.resultHeader}
          </h3>

          {result.recommendedNewCover > 0 ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-extrabold">
              <AlertTriangle size={14} />
              <span>{t.gapAlert(formatINRCompact(result.recommendedNewCover))}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold">
              <CheckCircle2 size={14} />
              <span>{t.coveredTitle}</span>
            </div>
          )}
        </div>

        {/* High-Contrast Hero Banner */}
        <div className="rounded-2xl bg-slate-900 dark:bg-[#0F172A] border border-slate-800 dark:border-emerald-500/30 text-white p-6 shadow-md space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                <Shield size={13} />
                <span>{t.heroTitle}</span>
              </div>

              <div className="mt-2.5 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-white tabular-nums">
                  {result.recommendedNewCover > 0
                    ? formatINRCompact(result.recommendedNewCover)
                    : "₹0 (Covered)"}
                </span>
                {result.recommendedNewCover > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-amber-300 tabular-nums">
                    {formatINR(result.recommendedNewCover)}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
              <div className="bg-slate-800/90 border border-indigo-500/30 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                  {t.totalNeedLabel}
                </span>
                <span className="text-lg font-black text-white tabular-nums mt-0.5 block">
                  {formatINRCompact(result.totalGrossNeed)}
                </span>
                <span className="text-[11px] text-slate-400">
                  {t.totalNeedSub}
                </span>
              </div>

              <div className="bg-slate-800/90 border border-emerald-500/30 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  {t.existingOffsetLabel}
                </span>
                <span className="text-lg font-black text-emerald-400 tabular-nums mt-0.5 block">
                  {formatINRCompact(result.existingOffset)}
                </span>
                <span className="text-[11px] text-slate-400">
                  {t.existingOffsetSub}
                </span>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                  {t.incomeMultiplierLabel}
                </span>
                <span className="text-lg font-black text-amber-400 tabular-nums mt-0.5 block">
                  {result.incomeMultiple}x
                </span>
                <span className="text-[11px] text-slate-400">
                  Annual income
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
              formatINRCompact(result.totalGrossNeed),
              formatINRCompact(result.existingOffset),
              formatINRCompact(result.recommendedNewCover),
              yearsToCover
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
                    formatter={(value) => formatINRCompact(value)}
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

          {/* Step-by-Step HLV Table (7 cols) */}
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
                    <th className="py-3 px-4">{t.colItem}</th>
                    <th className="py-3 px-4 text-right">{t.colAmount}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  <tr>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                      {t.rowIncomePv}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold">
                      {formatINRCompact(result.incomeReplacementPv)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                      {t.rowLoans}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold">
                      {formatINRCompact(result.loans)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                      {t.rowGoals}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold">
                      {formatINRCompact(result.goals)}
                    </td>
                  </tr>
                  <tr className="bg-indigo-50/50 dark:bg-indigo-500/10 font-bold">
                    <td className="py-2.5 px-4 text-indigo-900 dark:text-indigo-200">
                      {t.rowGrossNeed}
                    </td>
                    <td className="py-2.5 px-4 text-right text-indigo-700 dark:text-indigo-300">
                      {formatINRCompact(result.totalGrossNeed)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                      {t.rowLessCover}
                    </td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 font-semibold">
                      -{formatINRCompact(result.cover)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                      {t.rowLessAssets}
                    </td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 font-semibold">
                      -{formatINRCompact(result.assets)}
                    </td>
                  </tr>
                  <tr className="bg-slate-900 text-white font-extrabold">
                    <td className="py-3 px-4">{t.rowNetGap}</td>
                    <td className="py-3 px-4 text-right text-amber-400">
                      {formatINRCompact(result.recommendedNewCover)}
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

export default InsuranceCalculator;