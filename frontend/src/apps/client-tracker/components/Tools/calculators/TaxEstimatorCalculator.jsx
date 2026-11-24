import React, { useState, useMemo, useEffect } from "react";
import {
  Landmark,
  CheckCircle2,
  Sparkles,
  Scale,
  BadgeIndianRupee,
  ShieldCheck,
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
    sectionTitle: "1. Enter FY 2026–27 (AY 2027–28) Income & Deductions",
    sectionSub:
      "Compare your total tax liability under the Default New Tax Regime vs. Old Tax Regime.",
    incomeLabel: "Gross Annual Income",
    incomeDesc: "Total yearly salary or business/professional income before deductions.",
    taxpayerTypeLabel: "Taxpayer Profile",
    ageGroupLabel: "Age Category",
    deductionsHeader: "Old Regime Deductions (Only applies if you opt for Old Regime)",
    sec80cLabel: "Section 80C (ELSS, PPF, EPF, Life Ins.)",
    sec80cDesc: "Maximum deduction capped at ₹1,50,000 per year.",
    sec80dLabel: "Section 80D (Health Insurance)",
    sec80dDesc: "Up to ₹25,000 (self/family) + ₹50,000 (senior parents).",
    hraHomeLabel: "HRA / Home Loan Interest (Sec 24b)",
    hraHomeDesc: "Combined annual HRA exemption & self-occupied home loan interest.",
    nps80ccdLabel: "NPS Contribution (Sec 80CCD 1B)",
    nps80ccdDesc: "Additional deduction up to ₹50,000 in Old Regime.",

    resultHeader: "2. FY 2026–27 Tax Regime Comparison",
    recommendedBadge: (winner) => `${winner} Saves You More!`,
    equalBadge: "Both Regimes Result in Equal Tax",
    newRegimeTitle: "New Tax Regime (Default)",
    newRegimeSub: "Tax-free up to ₹12L taxable income (₹12.75L for salaried)",
    oldRegimeTitle: "Old Tax Regime (With Deductions)",
    oldRegimeSub: "Includes 80C, 80D, HRA, Home Loan & NPS deductions",
    taxableIncomeLabel: "Net Taxable Income",
    totalTaxLabel: "Total Tax Payable (incl. 4% Cess)",
    effectiveRateLabel: "Effective Tax Rate",
    netSavingsLabel: "Annual Tax Saved",

    takeawaySentence: (gross, newTax, oldTax, savings, winner) =>
      savings > 0
        ? `On an annual income of ${gross}, the ${winner} reduces your tax to ${winner === "New Regime" ? newTax : oldTax} — saving you ${savings} every year compared to the alternative regime.`
        : `On an annual income of ${gross}, both the New Regime and Old Regime result in zero or identical tax liability (${newTax}).`,

    chartTitle: "Visual Tax Comparison (New vs. Old Regime)",
    chartSub: "Side-by-side comparison of Net Taxable Income and Final Tax Payable",
    tableTitle: "Slab-by-Slab & Deduction Breakdown",
    colMetric: "Tax Component",
    colNew: "New Regime (FY 26–27)",
    colOld: "Old Regime (FY 26–27)",
    rowGross: "Gross Annual Income",
    rowStdDed: "Standard Deduction (Salaried)",
    rowChapter6: "Chapter VI-A & HRA/Home Loan Deductions",
    rowTaxable: "Net Taxable Income",
    rowBaseTax: "Slab Tax (Before Rebate)",
    rowRebate: "Section 87A Tax Rebate",
    rowCess: "Health & Education Cess (4%)",
    rowFinalTax: "Final Tax Payable",

    waGreeting: (name) => (name ? `Namaste *${name}*,` : `Namaste,`),
    waIntro:
      "Here is your *FY 2026–27 (AY 2027–28) Income Tax Comparison* prepared by *Dalal Investments*:",
    waSummaryHeader: "📊 *Tax Summary (New vs. Old Regime)*",
    waGross: "Gross Annual Income",
    waNewTax: "New Tax Regime (Default)",
    waOldTax: "Old Tax Regime (With Deductions)",
    waSavings: "Annual Tax Savings",
    waTakeawayHeader: "💡 *Recommendation:*",
    waDisclaimer:
      "Disclaimer: Computed per FY 2026–27 (AY 2027–28) income tax slabs including 4% Health & Education Cess (excluding surcharge above ₹50L). Please consult your CA before filing.",
    pdfTitle: "FY 2026–27 Income Tax Comparison (New vs. Old Regime)",
    pdfSubtitle: "Assessment Year 2027–28 tax liability & ELSS/80C deduction estimator",
  },
  hi: {
    sectionTitle: "1. वित्त वर्ष 2026–27 की आय और कटौती (Deductions) दर्ज करें",
    sectionSub:
      "डिफ़ॉल्ट नई टैक्स व्यवस्था (New Regime) बनाम पुरानी टैक्स व्यवस्था (Old Regime) की तुलना करें।",
    incomeLabel: "सालाना कुल आय (Gross Income)",
    incomeDesc: "कटौती से पहले आपकी कुल वार्षिक सैलरी या व्यावसायिक आय।",
    taxpayerTypeLabel: "करदाता श्रेणी",
    ageGroupLabel: "आयु वर्ग",
    deductionsHeader: "पुरानी टैक्स व्यवस्था की छूट (केवल Old Regime चुनने पर लागू)",
    sec80cLabel: "धारा 80C (ELSS, PPF, EPF, बीमा)",
    sec80cDesc: "अधिकतम ₹1,50,000 प्रति वर्ष तक की छूट।",
    sec80dLabel: "धारा 80D (स्वास्थ्य बीमा)",
    sec80dDesc: "स्वयं के लिए ₹25,000 + वरिष्ठ माता-पिता के लिए ₹50,000 तक।",
    hraHomeLabel: "HRA / होम लोन ब्याज (धारा 24b)",
    hraHomeDesc: "वार्षिक HRA छूट और होम लोन ब्याज की कुल राशि।",
    nps80ccdLabel: "NPS निवेश (धारा 80CCD 1B)",
    nps80ccdDesc: "पुरानी व्यवस्था में ₹50,000 तक की अतिरिक्त छूट।",

    resultHeader: "2. वित्त वर्ष 2026–27 टैक्स तुलना रिपोर्ट",
    recommendedBadge: (winner) => `${winner} में ज्यादा बचत!`,
    equalBadge: "दोनों व्यवस्थाओं में टैक्स समान है",
    newRegimeTitle: "नई टैक्स व्यवस्था (New Regime - Default)",
    newRegimeSub: "₹12 लाख तक कर योग्य आय टैक्स-फ्री (सैलरी वालों के लिए ₹12.75L)",
    oldRegimeTitle: "पुरानी टैक्स व्यवस्था (Old Regime)",
    oldRegimeSub: "80C, 80D, HRA, होम लोन और NPS छूट सहित",
    taxableIncomeLabel: "शुद्ध कर योग्य आय",
    totalTaxLabel: "कुल देय टैक्स (4% सेस सहित)",
    effectiveRateLabel: "प्रभावी टैक्स दर",
    netSavingsLabel: "सालाना टैक्स बचत",

    takeawaySentence: (gross, newTax, oldTax, savings, winner) =>
      savings > 0
        ? `${gross} की वार्षिक आय पर, ${winner} आपका टैक्स घटाकर ${winner === "New Regime" ? newTax : oldTax} कर देती है — जिससे हर साल ${savings} की सीधा बचत होती है।`
        : `${gross} की वार्षिक आय पर दोनों टैक्स व्यवस्थाओं में टैक्स देनदारी शून्य या समान (${newTax}) है।`,

    chartTitle: "टैक्स तुलना चार्ट (New vs. Old Regime)",
    chartSub: "कर योग्य आय और कुल देय टैक्स की आमने-सामने तुलना",
    tableTitle: "टैक्स गणना का पूरा विवरण",
    colMetric: "विवरण",
    colNew: "नई व्यवस्था (FY 26–27)",
    colOld: "पुरानी व्यवस्था (FY 26–27)",
    rowGross: "सालाना कुल आय",
    rowStdDed: "स्टैंडर्ड डिडक्शन (सैलरी)",
    rowChapter6: "80C, 80D, HRA और होम लोन छूट",
    rowTaxable: "शुद्ध कर योग्य आय",
    rowBaseTax: "स्लैब टैक्स (रिबेट से पहले)",
    rowRebate: "धारा 87A टैक्स छूट (Rebate)",
    rowCess: "स्वास्थ्य एवं शिक्षा सेस (4%)",
    rowFinalTax: "कुल देय टैक्स",

    waGreeting: (name) => (name ? `नमस्ते *${name}*,` : `नमस्ते,`),
    waIntro:
      "*Dalal Investments* की ओर से आपकी *वित्त वर्ष 2026–27 इनकम टैक्स तुलना* नीचे प्रस्तुत है:",
    waSummaryHeader: "📊 *टैक्स सारांश (New vs. Old Regime)*",
    waGross: "सालाना कुल आय",
    waNewTax: "नई टैक्स व्यवस्था (Default)",
    waOldTax: "पुरानी टैक्स व्यवस्था",
    waSavings: "सालाना टैक्स बचत",
    waTakeawayHeader: "💡 *सुझाव:*",
    waDisclaimer:
      "अस्वीकरण: यह गणना वित्त वर्ष 2026–27 के टैक्स स्लैब और 4% सेस के आधार पर है। रिटर्न दाखिल करने से पहले अपने CA से सलाह लें।",
    pdfTitle: "वित्त वर्ष 2026–27 इनकम टैक्स तुलना (Dalal Investments)",
    pdfSubtitle: "New Regime बनाम Old Regime कर देनदारी और बचत विश्लेषण",
  },
  gu: {
    sectionTitle: "1. નાણાકીય વર્ષ 2026–27 ની આવક અને કપાત (Deductions) દાખલ કરો",
    sectionSub:
      "ડિફોલ્ટ નવી ટેક્સ વ્યવસ્થા (New Regime) વિ. જૂની ટેક્સ વ્યવસ્થા (Old Regime) ની સરખામણી કરો.",
    incomeLabel: "વાર્ષિક કુલ આવક (Gross Income)",
    incomeDesc: "કપાત પહેલા તમારો કુલ વાર્ષિક પગાર અથવા વ્યવસાયિક આવક.",
    taxpayerTypeLabel: "કરદાતા પ્રકાર",
    ageGroupLabel: "ઉંમર વર્ગ",
    deductionsHeader: "જૂની ટેક્સ વ્યવસ્થાની છૂટ (ફક્ત Old Regime પસંદ કરવા પર લાગુ)",
    sec80cLabel: "કલમ 80C (ELSS, PPF, EPF, વીમો)",
    sec80cDesc: "મહત્તમ ₹1,50,000 પ્રતિ વર્ષ સુધીની છૂટ.",
    sec80dLabel: "કલમ 80D (હેલ્થ ઇન્શ્યોરન્સ)",
    sec80dDesc: "પોતાના માટે ₹25,000 + વરિષ્ઠ માતા-પિતા માટે ₹50,000 સુધી.",
    hraHomeLabel: "HRA / હોમ લોન વ્યાજ (કલમ 24b)",
    hraHomeDesc: "વાર્ષિક HRA મુક્તિ અને હોમ લોન વ્યાજની કુલ રકમ.",
    nps80ccdLabel: "NPS રોકાણ (કલમ 80CCD 1B)",
    nps80ccdDesc: "જૂની વ્યવસ્થામાં ₹50,000 સુધીની વધારાની છૂટ.",

    resultHeader: "2. નાણાકીય વર્ષ 2026–27 ટેક્સ સરખામણી રિપોર્ટ",
    recommendedBadge: (winner) => `${winner} માં વધુ બચત!`,
    equalBadge: "બંને વ્યવસ્થામાં ટેક્સ સમાન છે",
    newRegimeTitle: "નવી ટેક્સ વ્યવસ્થા (New Regime - Default)",
    newRegimeSub: "₹12 લાખ સુધી કરપાત્ર આવક ટેક્સ-ફ્રી (પગારદાર માટે ₹12.75L)",
    oldRegimeTitle: "જૂની ટેક્સ વ્યવસ્થા (Old Regime)",
    oldRegimeSub: "80C, 80D, HRA, હોમ લોન અને NPS છૂટ સહિત",
    taxableIncomeLabel: "ચોખ્ખી કરપાત્ર આવક",
    totalTaxLabel: "કુલ ભરવાપાત્ર ટેક્સ (4% સેસ સહિત)",
    effectiveRateLabel: "અસરકારક ટેક્સ દર",
    netSavingsLabel: "વાર્ષિક ટેક્સ બચત",

    takeawaySentence: (gross, newTax, oldTax, savings, winner) =>
      savings > 0
        ? `${gross} ની વાર્ષિક આવક પર, ${winner} તમારો ટેક્સ ઘટાડીને ${winner === "New Regime" ? newTax : oldTax} કરે છે — જેનાથી દર વર્ષે ${savings} ની સીધી બચત થાય છે.`
        : `${gross} ની વાર્ષિક આવક પર બંને ટેક્સ વ્યવસ્થામાં ટેક્સ જવાબદારી શૂન્ય અથવા સમાન (${newTax}) છે.`,

    chartTitle: "ટેક્સ સરખામણી ચાર્ટ (New vs. Old Regime)",
    chartSub: "કરપાત્ર આવક અને કુલ ભરવાપાત્ર ટેક્સની સામસામે સરખામણી",
    tableTitle: "ટેક્સ ગણતરીની સંપૂર્ણ વિગત",
    colMetric: "વિગત",
    colNew: "નવી વ્યવસ્થા (FY 26–27)",
    colOld: "જૂની વ્યવસ્થા (FY 26–27)",
    rowGross: "વાર્ષિક કુલ આવક",
    rowStdDed: "સ્ટાન્ડર્ડ ડિડક્શન (પગારદાર)",
    rowChapter6: "80C, 80D, HRA અને હોમ લોન છૂટ",
    rowTaxable: "ચોખ્ખી કરપાત્ર આવક",
    rowBaseTax: "સ્લેબ ટેક્સ (રિબેટ પહેલા)",
    rowRebate: "કલમ 87A ટેક્સ રિબેટ",
    rowCess: "હેલ્થ અને એજ્યુકેશન સેસ (4%)",
    rowFinalTax: "કુલ ભરવાપાત્ર ટેક્સ",

    waGreeting: (name) => (name ? `નમસ્તે *${name}*,` : `નમસ્તે,`),
    waIntro:
      "*Dalal Investments* તરફથી તમારી *નાણાકીય વર્ષ 2026–27 ઇન્કમ ટેક્સ સરખામણી* નીચે મુજબ છે:",
    waSummaryHeader: "📊 *ટેક્સ સારાંશ (New vs. Old Regime)*",
    waGross: "વાર્ષિક કુલ આવક",
    waNewTax: "નવી ટેક્સ વ્યવસ્થા (Default)",
    waOldTax: "જૂની ટેક્સ વ્યવસ્થા",
    waSavings: "વાર્ષિક ટેક્સ બચત",
    waTakeawayHeader: "💡 *ભલામણ:*",
    waDisclaimer:
      "સૂચના: આ ગણતરી નાણાકીય વર્ષ 2026–27 ના ટેક્સ સ્લેબ અને 4% સેસ મુજબ છે. રિટર્ન ફાઇલ કરતા પહેલા તમારા CA ની સલાહ લો.",
    pdfTitle: "નાણાકીય વર્ષ 2026–27 ઇન્કમ ટેક્સ સરખામણી (Dalal Investments)",
    pdfSubtitle: "New Regime વિ. Old Regime કર જવાબદારી અને બચત વિશ્લેષણ",
  },
};

const TAXPAYER_OPTIONS = [
  { value: "salaried", label: "Salaried / Pensioner" },
  { value: "business", label: "Business / Self-Employed" },
];

const AGE_OPTIONS = [
  { value: "below60", label: "Below 60 Years" },
  { value: "senior", label: "Senior Citizen (60–79)" },
  { value: "supersenior", label: "Super Senior (80+)" },
];

/**
 * FY 2026–27 (AY 2027–28) New Tax Regime Slab Calculation
 */
const computeNewRegimeTax = (taxable) => {
  if (taxable <= 400000) return 0;

  let tax = 0;
  if (taxable > 2400000) tax += (taxable - 2400000) * 0.3;
  if (taxable > 2000000) tax += (Math.min(taxable, 2400000) - 2000000) * 0.25;
  if (taxable > 1600000) tax += (Math.min(taxable, 2000000) - 1600000) * 0.2;
  if (taxable > 1200000) tax += (Math.min(taxable, 1600000) - 1200000) * 0.15;
  if (taxable > 800000) tax += (Math.min(taxable, 1200000) - 800000) * 0.1;
  if (taxable > 400000) tax += (Math.min(taxable, 800000) - 400000) * 0.05;

  // Section 87A Rebate up to ₹12,00,000 taxable income (max ₹60,000) + Marginal Relief
  if (taxable <= 1200000) {
    return 0;
  }
  const excessOver12L = taxable - 1200000;
  if (tax > excessOver12L) {
    tax = excessOver12L;
  }

  return Math.round(tax);
};

/**
 * FY 2026–27 (AY 2027–28) Old Tax Regime Slab Calculation
 */
const computeOldRegimeTax = (taxable, ageGroup) => {
  const basicExempt =
    ageGroup === "supersenior" ? 500000 : ageGroup === "senior" ? 300000 : 250000;

  if (taxable <= basicExempt) return 0;

  let tax = 0;
  if (taxable > 1000000) tax += (taxable - 1000000) * 0.3;
  if (taxable > 500000) tax += (Math.min(taxable, 1000000) - 500000) * 0.2;
  if (taxable > basicExempt) tax += (Math.min(taxable, 500000) - basicExempt) * 0.05;

  // Section 87A Rebate up to ₹5,00,000 taxable income (max ₹12,500)
  if (taxable <= 500000) {
    return 0;
  }

  return Math.round(tax);
};

const TaxEstimatorCalculator = ({ clientName, lang = "en", onSummaryChange }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [grossIncome, setGrossIncome] = useState(1500000); // ₹15L
  const [taxpayerType, setTaxpayerType] = useState("salaried");
  const [ageGroup, setAgeGroup] = useState("below60");

  // Old Regime Deductions
  const [sec80C, setSec80C] = useState(150000);
  const [sec80D, setSec80D] = useState(25000);
  const [hraAndHomeLoan, setHraAndHomeLoan] = useState(0);
  const [nps80CCD, setNps80CCD] = useState(0);

  const result = useMemo(() => {
    const gross = Math.max(0, Number(grossIncome) || 0);

    // 1. New Regime (FY 2026-27)
    const newStdDed = taxpayerType === "salaried" ? Math.min(75000, gross) : 0;
    const newTaxable = Math.max(0, gross - newStdDed);
    const newBaseTax = computeNewRegimeTax(newTaxable);
    const newCess = Math.round(newBaseTax * 0.04);
    const newTotalTax = newBaseTax + newCess;

    // 2. Old Regime (FY 2026-27)
    const oldStdDed = taxpayerType === "salaried" ? Math.min(50000, gross) : 0;
    const capped80C = Math.min(150000, Math.max(0, Number(sec80C) || 0));
    const capped80D = Math.min(100000, Math.max(0, Number(sec80D) || 0));
    const cappedHraHome = Math.max(0, Number(hraAndHomeLoan) || 0);
    const cappedNps = Math.min(50000, Math.max(0, Number(nps80CCD) || 0));
    const totalOldDeductions = capped80C + capped80D + cappedHraHome + cappedNps;

    const oldTaxable = Math.max(0, gross - oldStdDed - totalOldDeductions);
    const oldBaseTax = computeOldRegimeTax(oldTaxable, ageGroup);
    const oldCess = Math.round(oldBaseTax * 0.04);
    const oldTotalTax = oldBaseTax + oldCess;

    const diff = oldTotalTax - newTotalTax;
    const winner =
      diff > 0 ? "New Regime" : diff < 0 ? "Old Regime" : "Equal";
    const netSavings = Math.abs(diff);

    const newEffectivePct = gross > 0 ? ((newTotalTax / gross) * 100).toFixed(1) : "0.0";
    const oldEffectivePct = gross > 0 ? ((oldTotalTax / gross) * 100).toFixed(1) : "0.0";

    return {
      gross,
      newStdDed,
      newTaxable,
      newBaseTax,
      newCess,
      newTotalTax,
      newEffectivePct,
      oldStdDed,
      totalOldDeductions,
      oldTaxable,
      oldBaseTax,
      oldCess,
      oldTotalTax,
      oldEffectivePct,
      winner,
      netSavings,
      chartData: [
        {
          name: "New Regime",
          taxable: newTaxable,
          tax: newTotalTax,
          fill: "#10b981",
        },
        {
          name: "Old Regime",
          taxable: oldTaxable,
          tax: oldTotalTax,
          fill: "#6366f1",
        },
      ],
    };
  }, [grossIncome, taxpayerType, ageGroup, sec80C, sec80D, hraAndHomeLoan, nps80CCD]);

  useEffect(() => {
    const takeaway = t.takeawaySentence(
      formatINRCompact(result.gross),
      formatINR(result.newTotalTax),
      formatINR(result.oldTotalTax),
      formatINR(result.netSavings),
      result.winner
    );

    const text =
      `${t.waGreeting(clientName?.trim())}\n\n` +
      `${t.waIntro}\n\n` +
      `${t.waSummaryHeader}\n` +
      `• ${t.waGross}: *${formatINRCompact(result.gross)}* (${formatINR(result.gross)})\n` +
      `• ${t.waNewTax}: *${formatINR(result.newTotalTax)}* (${result.newEffectivePct}% effective)\n` +
      `• ${t.waOldTax}: *${formatINR(result.oldTotalTax)}* (${result.oldEffectivePct}% effective)\n` +
      (result.netSavings > 0
        ? `• *${t.waSavings} (${result.winner}): ${formatINR(result.netSavings)}/yr*\n`
        : "") +
      `\n${t.waTakeawayHeader}\n${takeaway}\n\n` +
      `_${t.waDisclaimer}_\n` +
      `— *Dalal Investments | Private Wealth Desk*`;

    onSummaryChange({
      title: t.pdfTitle,
      subtitle: t.pdfSubtitle,
      takeaway,
      whatsappText: text,
      assumptions: [
        { label: t.waGross, value: formatINRCompact(result.gross) },
        {
          label: t.taxpayerTypeLabel,
          value: taxpayerType === "salaried" ? "Salaried" : "Business",
        },
        {
          label: "New Std. Ded.",
          value: formatINR(result.newStdDed),
        },
        {
          label: "Old Deductions",
          value: formatINR(result.totalOldDeductions + result.oldStdDed),
        },
      ],
      highlights: [
        {
          label: t.newRegimeTitle,
          sub: `${t.taxableIncomeLabel}: ${formatINR(result.newTaxable)} • Effective Rate: ${result.newEffectivePct}%`,
          value: formatINR(result.newTotalTax),
        },
        {
          label: t.oldRegimeTitle,
          sub: `${t.taxableIncomeLabel}: ${formatINR(result.oldTaxable)} • Effective Rate: ${result.oldEffectivePct}%`,
          value: formatINR(result.oldTotalTax),
        },
        {
          label:
            result.netSavings > 0
              ? `${t.waSavings} (${result.winner})`
              : t.equalBadge,
          sub: "Annual income tax saved by choosing the optimal regime",
          value: result.netSavings > 0 ? `${formatINR(result.netSavings)} / yr` : "₹0",
          isHero: true,
        },
      ],
      milestones: [],
      disclaimer: t.waDisclaimer,
    });
  }, [clientName, taxpayerType, result, t, onSummaryChange]);

  return (
    <div className="space-y-8 w-full font-sans">
      
      {/* ================================================================= */}
      {/* TOP SECTION: INCOME & DEDUCTION INPUTS                            */}
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

          {/* Profile & Age Custom Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:w-[410px] shrink-0">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {t.taxpayerTypeLabel}
              </label>
              <CustomDropdown
                value={taxpayerType}
                options={TAXPAYER_OPTIONS}
                onChange={setTaxpayerType}
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {t.ageGroupLabel}
              </label>
              <CustomDropdown
                value={ageGroup}
                options={AGE_OPTIONS}
                onChange={setAgeGroup}
              />
            </div>
          </div>
        </div>

        {/* Gross Annual Income */}
        <TactileSliderInput
          label={t.incomeLabel}
          description={t.incomeDesc}
          value={grossIncome}
          onChange={setGrossIncome}
          min={300000}
          max={10000000}
          sliderMax={5000000}
          step={25000}
          prefix="₹"
          presets={[
            { label: "₹10 L", value: 1000000 },
            { label: "₹12.75 L", value: 1275000 },
            { label: "₹15 L", value: 1500000 },
            { label: "₹20 L", value: 2000000 },
            { label: "₹30 L", value: 3000000 },
            { label: "₹50 L", value: 5000000 },
          ]}
        />

        {/* Old Regime Deductions Grid */}
        <div className="space-y-3 pt-1">
          <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
            {t.deductionsHeader}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TactileSliderInput
              label={t.sec80cLabel}
              description={t.sec80cDesc}
              value={sec80C}
              onChange={setSec80C}
              min={0}
              max={150000}
              step={10000}
              prefix="₹"
              accent="indigo"
              presets={[
                { label: "₹0", value: 0 },
                { label: "₹75,000", value: 75000 },
                { label: "₹1,50,000 (Max)", value: 150000 },
              ]}
            />

            <TactileSliderInput
              label={t.sec80dLabel}
              description={t.sec80dDesc}
              value={sec80D}
              onChange={setSec80D}
              min={0}
              max={100000}
              step={5000}
              prefix="₹"
              accent="indigo"
              presets={[
                { label: "₹0", value: 0 },
                { label: "₹25,000", value: 25000 },
                { label: "₹50,000", value: 50000 },
                { label: "₹75,000", value: 75000 },
              ]}
            />

            <TactileSliderInput
              label={t.hraHomeLabel}
              description={t.hraHomeDesc}
              value={hraAndHomeLoan}
              onChange={setHraAndHomeLoan}
              min={0}
              max={600000}
              step={10000}
              prefix="₹"
              accent="indigo"
              presets={[
                { label: "₹0", value: 0 },
                { label: "₹1.5 L", value: 150000 },
                { label: "₹2 L", value: 200000 },
                { label: "₹3.5 L", value: 350000 },
              ]}
            />

            <TactileSliderInput
              label={t.nps80ccdLabel}
              description={t.nps80ccdDesc}
              value={nps80CCD}
              onChange={setNps80CCD}
              min={0}
              max={50000}
              step={5000}
              prefix="₹"
              accent="indigo"
              presets={[
                { label: "₹0", value: 0 },
                { label: "₹25,000", value: 25000 },
                { label: "₹50,000 (Max)", value: 50000 },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* BOTTOM SECTION: REGIME COMPARISON CARDS, CHART & BREAKDOWN TABLE  */}
      {/* ================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t.resultHeader}
          </h3>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold">
            <CheckCircle2 size={15} />
            <span>
              {result.netSavings > 0
                ? `${t.recommendedBadge(result.winner)} (${formatINR(result.netSavings)}/yr)`
                : t.equalBadge}
            </span>
          </div>
        </div>

        {/* 2-Regime Side-by-Side Comparison Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* New Regime Card */}
          <div
            className={`rounded-2xl p-6 border transition-all space-y-4 ${
              result.winner === "New Regime"
                ? "bg-slate-900 dark:bg-[#0F172A] border-emerald-500 text-white shadow-md"
                : "bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className={`text-xs font-extrabold uppercase tracking-wider block ${
                    result.winner === "New Regime"
                      ? "text-emerald-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {t.newRegimeTitle}
                </span>
                <span
                  className={`text-xs block mt-0.5 ${
                    result.winner === "New Regime" ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {t.newRegimeSub}
                </span>
              </div>

              {result.winner === "New Regime" && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-extrabold uppercase">
                  Optimal
                </span>
              )}
            </div>

            <div className="pt-2">
              <span
                className={`text-[11px] font-bold uppercase block ${
                  result.winner === "New Regime" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {t.totalTaxLabel}
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl sm:text-4xl font-black tabular-nums">
                  {formatINR(result.newTotalTax)}
                </span>
                <span
                  className={`text-xs font-bold ${
                    result.winner === "New Regime" ? "text-emerald-300" : "text-slate-500"
                  }`}
                >
                  ({result.newEffectivePct}% effective)
                </span>
              </div>
            </div>

            <div
              className={`pt-3 border-t flex justify-between text-xs ${
                result.winner === "New Regime"
                  ? "border-slate-800 text-slate-300"
                  : "border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-400"
              }`}
            >
              <span>{t.taxableIncomeLabel}:</span>
              <strong
                className={
                  result.winner === "New Regime" ? "text-white" : "text-slate-900 dark:text-white"
                }
              >
                {formatINR(result.newTaxable)}
              </strong>
            </div>
          </div>

          {/* Old Regime Card */}
          <div
            className={`rounded-2xl p-6 border transition-all space-y-4 ${
              result.winner === "Old Regime"
                ? "bg-slate-900 dark:bg-[#0F172A] border-indigo-500 text-white shadow-md"
                : "bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className={`text-xs font-extrabold uppercase tracking-wider block ${
                    result.winner === "Old Regime"
                      ? "text-indigo-300"
                      : "text-indigo-600 dark:text-indigo-400"
                  }`}
                >
                  {t.oldRegimeTitle}
                </span>
                <span
                  className={`text-xs block mt-0.5 ${
                    result.winner === "Old Regime" ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {t.oldRegimeSub}
                </span>
              </div>

              {result.winner === "Old Regime" && (
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-extrabold uppercase">
                  Optimal
                </span>
              )}
            </div>

            <div className="pt-2">
              <span
                className={`text-[11px] font-bold uppercase block ${
                  result.winner === "Old Regime" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {t.totalTaxLabel}
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl sm:text-4xl font-black tabular-nums">
                  {formatINR(result.oldTotalTax)}
                </span>
                <span
                  className={`text-xs font-bold ${
                    result.winner === "Old Regime" ? "text-indigo-300" : "text-slate-500"
                  }`}
                >
                  ({result.oldEffectivePct}% effective)
                </span>
              </div>
            </div>

            <div
              className={`pt-3 border-t flex justify-between text-xs ${
                result.winner === "Old Regime"
                  ? "border-slate-800 text-slate-300"
                  : "border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-400"
              }`}
            >
              <span>{t.taxableIncomeLabel}:</span>
              <strong
                className={
                  result.winner === "Old Regime" ? "text-white" : "text-slate-900 dark:text-white"
                }
              >
                {formatINR(result.oldTaxable)}
              </strong>
            </div>
          </div>
        </div>

        {/* Plain-Language Summary Callout */}
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          <Sparkles size={17} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">
            {t.takeawaySentence(
              formatINRCompact(result.gross),
              formatINR(result.newTotalTax),
              formatINR(result.oldTotalTax),
              formatINR(result.netSavings),
              result.winner
            )}
          </p>
        </div>

        {/* Bar Chart + Detailed Breakdown Table */}
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
                    tick={{ fontSize: 12, fill: "#64748b", fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => formatINRCompact(v)}
                    tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip
                    formatter={(value) => formatINR(value)}
                    contentStyle={{
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  />
                  <Bar dataKey="tax" name={t.totalTaxLabel} radius={[8, 8, 0, 0]} barSize={56}>
                    {result.chartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Step-by-Step Comparison Table (7 cols) */}
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
                    <th className="py-3 px-4 text-right text-emerald-700 dark:text-emerald-400">
                      {t.colNew}
                    </th>
                    <th className="py-3 px-4 text-right text-indigo-700 dark:text-indigo-400">
                      {t.colOld}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  <tr>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                      {t.rowGross}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold">
                      {formatINR(result.gross)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold">
                      {formatINR(result.gross)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                      {t.rowStdDed}
                    </td>
                    <td className="py-2.5 px-4 text-right text-emerald-600">
                      -{formatINR(result.newStdDed)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-indigo-600">
                      -{formatINR(result.oldStdDed)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                      {t.rowChapter6}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400">₹0 (Not Applicable)</td>
                    <td className="py-2.5 px-4 text-right text-indigo-600">
                      -{formatINR(result.totalOldDeductions)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/70 dark:bg-white/[0.02] font-bold">
                    <td className="py-2.5 px-4 text-slate-900 dark:text-white">
                      {t.rowTaxable}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-900 dark:text-white">
                      {formatINR(result.newTaxable)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-900 dark:text-white">
                      {formatINR(result.oldTaxable)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                      {t.rowBaseTax}
                    </td>
                    <td className="py-2.5 px-4 text-right">{formatINR(result.newBaseTax)}</td>
                    <td className="py-2.5 px-4 text-right">{formatINR(result.oldBaseTax)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                      {t.rowCess}
                    </td>
                    <td className="py-2.5 px-4 text-right">{formatINR(result.newCess)}</td>
                    <td className="py-2.5 px-4 text-right">{formatINR(result.oldCess)}</td>
                  </tr>
                  <tr className="bg-slate-900 text-white font-extrabold">
                    <td className="py-3 px-4">{t.rowFinalTax}</td>
                    <td className="py-3 px-4 text-right text-emerald-400">
                      {formatINR(result.newTotalTax)}
                    </td>
                    <td className="py-3 px-4 text-right text-indigo-300">
                      {formatINR(result.oldTotalTax)}
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

export default TaxEstimatorCalculator;