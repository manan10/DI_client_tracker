import React, { useState, useMemo, useEffect } from "react";
import {
  Coins,
  Sparkles,
  BarChart3,
  Table as TableIcon,
  Landmark,
  ShieldCheck,
  Calculator,
  Percent,
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

const ASSET_TYPES = [
  { value: "equity", label: "Equity Mutual Funds / Stocks" },
  { value: "debt", label: "Debt Mutual Funds / Non-Equity" },
];

const TRANSLATIONS = {
  en: {
    sectionTitle: "1. Enter Capital Gains & Holding Details",
    sectionSub:
      "Calculate your tax liability on mutual fund redemptions and check tax-free profit harvesting capacity.",
    assetTypeLabel: "Asset Class",
    buyPriceLabel: "Total Purchase Cost (Invested Amount)",
    buyPriceDesc: "Original capital deployed into the scheme.",
    sellPriceLabel: "Current Market Value / Sale Value",
    sellPriceDesc: "Expected or actual redemption value.",
    holdingYearsLabel: "Holding Period (Years)",
    holdingYearsDesc: "Duration between purchase and sale date.",
    taxSlabLabel: "Your Income Tax Slab (for Debt STCG)",
    taxSlabDesc: "Applicable slab rate if holding is under 24 months for debt funds.",

    resultHeader: "2. Capital Gains & Tax Harvesting Report",
    heroTitle: "Estimated Tax Payable",
    grossGainLabel: "Total Gross Capital Gain",
    exemptGainLabel: "Tax-Exempt Gain (LTCG Exemption)",
    taxableGainLabel: "Net Taxable Capital Gains",
    holdingTypeLabel: "Holding Classification",

    stcgLabel: "Short-Term Capital Gains (STCG)",
    ltcgLabel: "Long-Term Capital Gains (LTCG)",
    harvestingHint:
      "💡 Tax Harvesting Tip: You can redeem equity gains up to ₹1.25 Lakhs every financial year completely tax-free and reinvest.",

    takeawaySentence: (asset, gain, tax, status, rate) =>
      `Your ${asset} redemption yields a gross gain of ${gain} classified as ${status}. After applicable exemptions, your estimated tax payable is ${tax} at a ${rate} tax rate.`,

    chartTitle: "Capital Gains Breakdown",
    chartSub: "Visual summary of invested cost, gross gain, and tax liability",
    colComponent: "Component",
    colValue: "Amount",

    waGreeting: (name) => (name ? `Namaste *${name}*,` : `Namaste,`),
    waIntro:
      "Here is your *Capital Gains & Tax Harvesting Assessment* prepared by *Dalal Investments*:",
    waHeader: "1️⃣ *Redemption & Gains Summary*",
    waAsset: "Asset Class",
    waInvested: "Purchase Cost",
    waSale: "Sale Value",
    waGain: "Gross Capital Gain",
    waClassification: "Holding Status",
    waTaxPayable: "Estimated Tax Payable",
    waTakeawayHeader: "💡 *Advisor Note:*",
    waDisclaimer:
      "Disclaimer: Computed based on prevailing income tax regulations (Equity LTCG @ 12.5% above ₹1.25L, STCG @ 20%). Please verify with your CA before filing returns.",
    pdfTitle: "Capital Gains & Tax Harvesting Report",
    pdfSubtitle: "Mutual fund redemption tax liability & exemption analysis",
  },
  hi: {
    sectionTitle: "1. कैपिटल गेंस और होल्डिंग विवरण दर्ज करें",
    sectionSub: "म्यूचुअल फंड रिडेम्पशन पर टैक्स देयता और टैक्स-फ्री प्रॉफिट हार्वेस्टिंग चेक करें।",
    assetTypeLabel: "एसेट क्लास",
    buyPriceLabel: "कुल खरीद लागत (निवेश राशि)",
    buyPriceDesc: "स्कीम में लगाई गई मूल पूंजी।",
    sellPriceLabel: "वर्तमान बाजार मूल्य / बिक्री मूल्य",
    sellPriceDesc: "संभावित या वास्तविक रिडेम्पशन वैल्यू।",
    holdingYearsLabel: "होल्डिंग अवधि (साल)",
    holdingYearsDesc: "खरीद और बिक्री की तारीख के बीच का समय।",
    taxSlabLabel: "आपका इनकम टैक्स स्लैब",
    taxSlabDesc: "डेट फंड्स के लिए लागू स्लैब दर।",

    resultHeader: "2. कैपिटल गेंस और टैक्स रिपोर्ट",
    heroTitle: "अनुमानित देय टैक्स",
    grossGainLabel: "कुल सकल कैपिटल गेन",
    exemptGainLabel: "कर-मुक्त लाभ (LTCG छूट)",
    taxableGainLabel: "शुद्ध कर योग्य कैपिटल गेन",
    holdingTypeLabel: "होल्डिंग वर्गीकरण",

    stcgLabel: "शॉर्ट-टर्म कैपिटल गेन (STCG)",
    ltcgLabel: "लॉन्ग-टर्म कैपिटल गेन (LTCG)",
    harvestingHint:
      "💡 टैक्स हार्वेस्टिंग टिप: आप हर वित्तीय वर्ष में ₹1.25 लाख तक के इक्विटी लाभ पूरी तरह कर-मुक्त निकाल सकते हैं।",

    takeawaySentence: (asset, gain, tax, status, rate) =>
      `आपके ${asset} रिडेम्पशन पर ${gain} का सकल लाभ हुआ है जो ${status} के रूप में वर्गीकृत है। छूट के बाद, ${rate} की दर से आपका अनुमानित टैक्स ${tax} है।`,

    chartTitle: "कैपिटल गेंस विवरण",
    chartSub: "मूल लागत, सकल लाभ और टैक्स देयता का दृश्य",
    colComponent: "घटक",
    colValue: "राशि",

    waGreeting: (name) => (name ? `नमस्ते *${name}*,` : `नमस्ते,`),
    waIntro:
      "*Dalal Investments* की ओर से आपका *कैपिटल गेंस और टैक्स आकलन* नीचे प्रस्तुत है:",
    waHeader: "1️⃣ *रिडेम्पशन और गेन सारांश*",
    waAsset: "एसेट क्लास",
    waInvested: "खरीद लागत",
    waSale: "बिक्री मूल्य",
    waGain: "सकल कैपिटल गेन",
    waClassification: "होल्डिंग स्थिति",
    waTaxPayable: "अनुमानित देय टैक्स",
    waTakeawayHeader: "💡 *सलाहकार नोट:*",
    waDisclaimer:
      "अस्वीकरण: गणना प्रचलित टैक्स नियमों के आधार पर है। रिटर्न दाखिल करने से पहले अपने CA से जांच करवा लें।",
    pdfTitle: "कैपिटल गेंस और टैक्स रिपोर्ट (Dalal Investments)",
    pdfSubtitle: "म्यूचुअल फंड रिडेम्पशन टैक्स और छूट विश्लेषण",
  },
  gu: {
    sectionTitle: "1. કેપિટલ ગેન્સ અને હોલ્ડિંગ વિગતો દાખલ કરો",
    sectionSub: "મ્યુચ્યુઅલ ફંડ રિડેમ્પશન પર ટેક્સ જવાબદારી અને ટેક્સ-ફ્રી પ્રોફિટ હાર્વેસ્ટીંગ તપાસો.",
    assetTypeLabel: "એસેટ ક્લાસ",
    buyPriceLabel: "કુલ ખરીદ પડતર (રોકાણ રકમ)",
    buyPriceDesc: "સ્કીમમાં રોકાયેલી મૂળ મૂડી.",
    sellPriceLabel: "વર્તમાન બજાર મૂલ્ય / વેચાણ મૂલ્ય",
    sellPriceDesc: "અપેક્ષિત અથવા વાસ્તવિક રિડેમ્પશન વેલ્યુ.",
    holdingYearsLabel: "હોલ્ડિંગ સમયગાળો (વર્ષ)",
    holdingYearsDesc: "ખરીદી અને વેચાણ તારીખ વચ્ચેનો સમય.",
    taxSlabLabel: "તમારો ઇન્કમ ટેક્સ સ્લેબ",
    taxSlabDesc: "ડેબ્ટ ફંડ માટે લાગુ પડતો સ્લેબ દર.",

    resultHeader: "2. કેપિટલ ગેન્સ અને ટેક્સ રિપોર્ટ",
    heroTitle: "અંદાજિત ભરવાપાત્ર ટેક્સ",
    grossGainLabel: "કુલ ગ્રોસ કેપિટલ ગેઈન",
    exemptGainLabel: "ટેક્સ-ફ્રી નફો (LTCG મુક્તિ)",
    taxableGainLabel: "ચોખ્ખો કરપાત્ર કેપિટલ ગેઈન",
    holdingTypeLabel: "હોલ્ડિંગ વર્ગીકરણ",

    stcgLabel: "શોર્ટ-ટર્મ કેપિટલ ગેઈન (STCG)",
    ltcgLabel: "લોંગ-ટર્મ કેપિટલ ગેઈન (LTCG)",
    harvestingHint:
      "💡 ટેક્સ હાર્વેસ્ટીંગ ટિપ: તમે દર નાણાકીય વર્ષમાં ₹1.25 લાખ સુધીનો ઇક્વિટી નફો સંપૂર્ણપણે ટેક્સ-ફ્રી ઉપાડી શકો છો.",

    takeawaySentence: (asset, gain, tax, status, rate) =>
      `તમારા ${asset} રિડેમ્પશન પર ${gain} નો ગ્રોસ નફો થયો છે જે ${status} તરીકે વર્ગીકૃત છે. છૂટ બાદ, ${rate} ના દરે તમારો અંદાજિત ટેક્સ ${tax} છે.`,

    chartTitle: "કેપિટલ ગેન્સ વિગત",
    chartSub: "મૂળ પડતર, ગ્રોસ નફો અને ટેક્સ જવાબદારીનું દ્રશ્ય",
    colComponent: "ઘટક",
    colValue: "રકમ",

    waGreeting: (name) => (name ? `નમસ્તે *${name}*,` : `નમસ્તે,`),
    waIntro:
      "*Dalal Investments* તરફથી તમારું *કેપિટલ ગેન્સ અને ટેક્સ આકલન* નીચે મુજબ છે:",
    waHeader: "1️⃣ *રિડેમ્પશન અને ગેઈન સારાંશ*",
    waAsset: "એસેટ ક્લાસ",
    waInvested: "ખરીદ પડતર",
    waSale: "વેચાણ મૂલ્ય",
    waGain: "ગ્રોસ કેપિટલ ગેઈन",
    waClassification: "હોલ્ડિંગ સ્થિતિ",
    waTaxPayable: "અંદાજિત ભરવાપાત્ર ટેક્સ",
    waTakeawayHeader: "💡 *સલાહકાર નોંધ:*",
    waDisclaimer:
      "સૂચના: ગણતરી પ્રચલિત ટેક્સ નિયમોના આધારે છે. રિટર્ન ફાઇલ કરતા પહેલા તમારા CA ની સલાહ લો.",
    pdfTitle: "કેપિટલ ગેન્સ અને ટેક્સ રિપોર્ટ (Dalal Investments)",
    pdfSubtitle: "મ્યુચ્યુઅલ ફંડ રિડેમ્પશન ટેક્સ અને મુક્તિ વિશ્લેષણ",
  },
};

const CapitalGainsCalculator = ({ clientName, lang = "en", onSummaryChange }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [assetClass, setAssetClass] = useState("equity");
  const [purchaseCost, setPurchaseCost] = useState(500000); // ₹5L
  const [saleValue, setSaleValue] = useState(850000); // ₹8.5L
  const [holdingYears, setHoldingYears] = useState(2); // 2 years
  const [taxSlab, setTaxSlab] = useState(30);

  const result = useMemo(() => {
    const cost = Math.max(0, Number(purchaseCost) || 0);
    const sale = Math.max(0, Number(saleValue) || 0);
    const yrs = Math.max(0.1, Number(holdingYears) || 1);
    const slab = Number(taxSlab) || 30;

    const grossGain = Math.max(0, sale - cost);
    const isEquity = assetClass === "equity";

    // LTCG threshold: Equity > 1 year, Debt > 2 years (Budget 2024 rules)
    const isLtcg = isEquity ? yrs > 1 : yrs > 2;
    const classification = isLtcg ? t.ltcgLabel : t.stcgLabel;

    let exemptGain = 0;
    let taxableGain = 0;
    let taxRateStr = "";
    let estimatedTax = 0;

    if (isEquity) {
      if (isLtcg) {
        exemptGain = Math.min(grossGain, 125000);
        taxableGain = Math.max(0, grossGain - 125000);
        taxRateStr = "12.5% LTCG (above ₹1.25L)";
        estimatedTax = taxableGain * 0.125;
      } else {
        taxableGain = grossGain;
        taxRateStr = "20% STCG";
        estimatedTax = taxableGain * 0.2;
      }
    } else {
      // Debt / Non-equity funds (taxed at slab rate post-2023 budget)
      taxableGain = grossGain;
      taxRateStr = `${slab}% Slab Rate`;
      estimatedTax = taxableGain * (slab / 100);
    }

    const finalTax = Math.round(estimatedTax);

    return {
      cost,
      sale,
      grossGain: Math.round(grossGain),
      isLtcg,
      classification,
      exemptGain: Math.round(exemptGain),
      taxableGain: Math.round(taxableGain),
      taxRateStr,
      finalTax,
      chartData: [
        { name: "Invested Cost", amount: cost, fill: "#6366f1" },
        { name: "Gross Gain", amount: Math.round(grossGain), fill: "#10b981" },
        { name: "Est. Tax", amount: finalTax, fill: "#f59e0b" },
      ],
    };
  }, [assetClass, purchaseCost, saleValue, holdingYears, taxSlab, t]);

  useEffect(() => {
    const assetName = assetClass === "equity" ? "Equity Mutual Fund" : "Debt Mutual Fund";
    const takeaway = t.takeawaySentence(
      assetName,
      formatINRCompact(result.grossGain),
      formatINR(result.finalTax),
      result.classification,
      result.taxRateStr
    );

    const text =
      `${t.waGreeting(clientName?.trim())}\n\n` +
      `${t.waIntro}\n\n` +
      `${t.waHeader}\n` +
      `• ${t.waAsset}: *${assetName}*\n` +
      `• ${t.waInvested}: *${formatINRCompact(result.cost)}*\n` +
      `• ${t.waSale}: *${formatINRCompact(result.sale)}*\n` +
      `• ${t.waGain}: *+${formatINRCompact(result.grossGain)}* (${result.classification})\n` +
      (result.exemptGain > 0 ? `• ${t.exemptGainLabel}: *${formatINRCompact(result.exemptGain)}*\n` : "") +
      `• *${t.waTaxPayable}: ${formatINR(result.finalTax)}* (${result.taxRateStr})\n\n` +
      `${t.waTakeawayHeader}\n${takeaway}\n\n` +
      `_${t.waDisclaimer}_\n` +
      `— *Dalal Investments | Private Wealth Desk*`;

    onSummaryChange({
      title: t.pdfTitle,
      subtitle: t.pdfSubtitle,
      takeaway,
      whatsappText: text,
      assumptions: [
        { label: t.waAsset, value: assetName },
        { label: t.waInvested, value: formatINRCompact(result.cost) },
        { label: t.waSale, value: formatINRCompact(result.sale) },
        { label: "Holding Period", value: `${holdingYears} Yrs (${result.classification})` },
      ],
      highlights: [
        {
          label: t.grossGainLabel,
          sub: `Sale Value (${formatINRCompact(result.sale)}) minus Cost (${formatINRCompact(result.cost)})`,
          value: `+${formatINRCompact(result.grossGain)}`,
        },
        ...(result.exemptGain > 0
          ? [
              {
                label: t.exemptGainLabel,
                sub: "Annual equity LTCG tax-free exemption limit",
                value: formatINRCompact(result.exemptGain),
              },
            ]
          : []),
        {
          label: t.taxableGainLabel,
          sub: `Taxable profit subject to ${result.taxRateStr}`,
          value: formatINRCompact(result.taxableGain),
        },
        {
          label: t.heroTitle,
          sub: `Calculated at ${result.taxRateStr}`,
          value: `${formatINR(result.finalTax)}`,
          isHero: true,
        },
      ],
      milestones: [],
      disclaimer: t.waDisclaimer,
    });
  }, [clientName, assetClass, holdingYears, result, t, onSummaryChange]);

  return (
    <div className="space-y-8 w-full font-sans">
      
      {/* TOP SECTION: ASSET CLASS & NUMERIC FORM */}
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

          <div className="lg:w-[320px] shrink-0">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
              {t.assetTypeLabel}
            </label>
            <CustomDropdown
              value={assetClass}
              options={ASSET_TYPES}
              onChange={setAssetClass}
            />
          </div>
        </div>

        {/* Row 1: Purchase Cost & Sale Value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <TactileSliderInput
            label={t.buyPriceLabel}
            description={t.buyPriceDesc}
            value={purchaseCost}
            onChange={setPurchaseCost}
            min={10000}
            max={50000000}
            sliderMax={10000000}
            step={25000}
            prefix="₹"
            accent="indigo"
            presets={[
              { label: "₹1 Lakh", value: 100000 },
              { label: "₹5 Lakhs", value: 500000 },
              { label: "₹10 Lakhs", value: 1000000 },
              { label: "₹25 Lakhs", value: 2500000 },
            ]}
          />

          <TactileSliderInput
            label={t.sellPriceLabel}
            description={t.sellPriceDesc}
            value={saleValue}
            onChange={setSaleValue}
            min={10000}
            max={100000000}
            sliderMax={15000000}
            step={25000}
            prefix="₹"
            presets={[
              { label: "₹2 Lakhs", value: 200000 },
              { label: "₹8.5 Lakhs", value: 850000 },
              { label: "₹15 Lakhs", value: 1500000 },
              { label: "₹40 Lakhs", value: 4000000 },
            ]}
          />
        </div>

        {/* Row 2: Holding Years & Tax Slab */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <TactileSliderInput
            label={t.holdingYearsLabel}
            description={t.holdingYearsDesc}
            value={holdingYears}
            onChange={setHoldingYears}
            min={0.2}
            max={15}
            step={0.5}
            suffix={t.yearsUnit}
            accent="emerald"
            presets={[
              { label: `6 Mo`, value: 0.5 },
              { label: `1.5 Yrs`, value: 1.5 },
              { label: `3 Yrs`, value: 3 },
              { label: `5 Yrs`, value: 5 },
            ]}
          />

          {assetClass === "debt" && (
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {t.taxSlabLabel}
              </label>
              <CustomDropdown
                value={taxSlab}
                options={[
                  { value: 10, label: "10% Slab" },
                  { value: 20, label: "20% Slab" },
                  { value: 30, label: "30% Slab" },
                ]}
                onChange={setTaxSlab}
              />
              <p className="text-[11px] text-slate-400 mt-1">{t.taxSlabDesc}</p>
            </div>
          )}
        </div>
      </section>

      {/* BOTTOM SECTION: TAX REPORT & BREAKDOWN */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t.resultHeader}
          </h3>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold">
            <Calculator size={15} />
            <span>{result.classification} ({result.taxRateStr})</span>
          </div>
        </div>

        {/* High-Contrast Hero Banner */}
        <div className="rounded-2xl bg-slate-900 dark:bg-[#0F172A] border border-slate-800 dark:border-emerald-500/30 text-white p-6 shadow-md space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                <Landmark size={13} />
                <span>{t.heroTitle}</span>
              </div>

              <div className="mt-2.5 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-white tabular-nums">
                  {formatINR(result.finalTax)}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-emerald-300 tabular-nums">
                  {result.taxRateStr}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                  {t.grossGainLabel}
                </span>
                <span className="text-lg font-black text-white tabular-nums mt-0.5 block">
                  +{formatINRCompact(result.grossGain)}
                </span>
                <span className="text-[11px] text-slate-400">
                  Total profit
                </span>
              </div>

              {result.exemptGain > 0 && (
                <div className="bg-slate-800/90 border border-emerald-500/30 rounded-xl px-4 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                    {t.exemptGainLabel}
                  </span>
                  <span className="text-lg font-black text-emerald-400 tabular-nums mt-0.5 block">
                    {formatINRCompact(result.exemptGain)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Tax-free limit
                  </span>
                </div>
              )}

              <div className="bg-slate-800/90 border border-indigo-500/30 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                  {t.taxableGainLabel}
                </span>
                <span className="text-lg font-black text-indigo-300 tabular-nums mt-0.5 block">
                  {formatINRCompact(result.taxableGain)}
                </span>
                <span className="text-[11px] text-slate-400">
                  Subject to tax
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Harvesting Tip Callout */}
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          <Sparkles size={17} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">{t.harvestingHint}</p>
        </div>

        {/* Chart + Breakdown Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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

          <div className="lg:col-span-7 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#0B1120] shadow-xs">
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/10">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Capital Gains Ledger
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4">{t.colComponent}</th>
                    <th className="py-3 px-4 text-right">{t.colValue}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  <tr>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">Total Purchase Cost</td>
                    <td className="py-2.5 px-4 text-right font-semibold">{formatINR(result.cost)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">Sale / Current Value</td>
                    <td className="py-2.5 px-4 text-right font-semibold">{formatINR(result.sale)}</td>
                  </tr>
                  <tr className="bg-emerald-50/50 dark:bg-emerald-500/10 font-bold">
                    <td className="py-2.5 px-4 text-emerald-900 dark:text-emerald-200">{t.grossGainLabel}</td>
                    <td className="py-2.5 px-4 text-right text-emerald-700 dark:text-emerald-300">
                      +{formatINR(result.grossGain)}
                    </td>
                  </tr>
                  {result.exemptGain > 0 && (
                    <tr>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{t.exemptGainLabel}</td>
                      <td className="py-2.5 px-4 text-right text-emerald-600 font-semibold">
                        -{formatINR(result.exemptGain)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">{t.taxableGainLabel}</td>
                    <td className="py-2.5 px-4 text-right font-bold">{formatINR(result.taxableGain)}</td>
                  </tr>
                  <tr className="bg-slate-900 text-white font-extrabold">
                    <td className="py-3 px-4">{t.heroTitle} ({result.taxRateStr})</td>
                    <td className="py-3 px-4 text-right text-amber-400">{formatINR(result.finalTax)}</td>
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

export default CapitalGainsCalculator;