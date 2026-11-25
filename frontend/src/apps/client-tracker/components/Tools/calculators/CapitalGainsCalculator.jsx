import React, { useState, useMemo, useEffect } from "react";
import { Sparkles, Landmark, Calculator } from "lucide-react";
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
import { COMMON_TRANSLATIONS, HeroResultBanner } from "./CalculatorShared";

const ASSET_TYPES = [
  { value: "equity", label: "Equity Mutual Funds / Stocks" },
  { value: "debt", label: "Debt Mutual Funds / Non-Equity" },
];

const DEBT_SLAB_OPTIONS = [
  { value: 10, label: "10% Slab" },
  { value: 20, label: "20% Slab" },
  { value: 30, label: "30% Slab" },
];

const TRANSLATIONS = {
  en: {
    ...COMMON_TRANSLATIONS.en,
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
    taxSlabDesc: "Applicable slab rate for debt / non-equity funds.",
    resultHeader: "2. Capital Gains & Tax Harvesting Report",
    heroTitle: "Estimated Tax Payable",
    grossGainLabel: "Gross Gain",
    exemptGainLabel: "LTCG Exempt",
    taxableGainLabel: "Taxable Gain",
    stcgLabel: "Short-Term Capital Gains (STCG)",
    ltcgLabel: "Long-Term Capital Gains (LTCG)",
    harvestingHint:
      "💡 Tax Harvesting Tip: You can redeem equity gains up to ₹1.25 Lakhs every financial year completely tax-free and reinvest.",
    takeawaySentence: (asset, gain, tax, status, rate) =>
      `Your ${asset} redemption yields a gross gain of ${gain} classified as ${status}. After applicable exemptions, your estimated tax payable is ${tax} at a ${rate} tax rate.`,
    chartTitle: "Capital Gains Breakdown",
    chartSub: "Visual summary of invested cost, gross gain, and tax liability",
    ledgerTitle: "Capital Gains Ledger",
    colComponent: "Component",
    colValue: "Amount",
    rowCost: "Total Purchase Cost",
    rowSale: "Sale / Current Value",
    waIntro:
      "Here is your *Capital Gains & Tax Harvesting Assessment* prepared by *Dalal Investments*:",
    waHeader: "1️⃣ *Redemption & Gains Summary*",
    waAsset: "Asset Class",
    waInvested: "Purchase Cost",
    waSale: "Sale Value",
    waGain: "Gross Capital Gain",
    waTaxPayable: "Estimated Tax Payable",
    waTakeawayHeader: "💡 *Advisor Note:*",
    waDisclaimer:
      "Disclaimer: Computed based on prevailing income tax regulations (Equity LTCG @ 12.5% above ₹1.25L, STCG @ 20%). Please verify with your CA before filing returns.",
    pdfTitle: "Capital Gains & Tax Harvesting Report",
    pdfSubtitle: "Mutual fund redemption tax liability & exemption analysis",
  },
  hi: {
    ...COMMON_TRANSLATIONS.hi,
    sectionTitle: "1. कैपिटल गेंस और होल्डिंग विवरण दर्ज करें",
    sectionSub: "म्यूचुअल फंड रिडेम्पशन पर टैक्स देयता और टैक्स-फ्री प्रॉफिट हार्वेस्टिंग चेक करें।",
    assetTypeLabel: "एसेट क्लास",
    buyPriceLabel: "कुल खरीद लागत (निवेश राशि)",
    buyPriceDesc: "स्कीम में लगाई गई मूल पूंजी।",
    sellPriceLabel: "वर्तमान बाजार मूल्य / बिक्री मूल्य",
    sellPriceDesc: "संभावित या वास्तविक रिडेम्पशन वैल्यू।",
    holdingYearsLabel: "होल्डिंग अवधि (साल)",
    holdingYearsDesc: "खरीद और बिक्री की तारीख के बीच का समय।",
    taxSlabDesc: "डेट फंड्स के लिए लागू स्लैब दर।",
    resultHeader: "2. कैपिटल गेंस और टैक्स रिपोर्ट",
    heroTitle: "अनुमानित देय टैक्स",
    grossGainLabel: "कुल लाभ",
    exemptGainLabel: "कर-मुक्त छूट",
    taxableGainLabel: "कर योग्य लाभ",
    stcgLabel: "शॉर्ट-टर्म कैपिटल गेन (STCG)",
    ltcgLabel: "लॉन्ग-टर्म कैपिटल गेन (LTCG)",
    harvestingHint:
      "💡 टैक्स हार्वेस्टिंग टिप: आप हर वित्तीय वर्ष में ₹1.25 लाख तक के इक्विटी लाभ पूरी तरह कर-मुक्त निकाल सकते हैं।",
    takeawaySentence: (asset, gain, tax, status, rate) =>
      `आपके ${asset} रिडेम्पशन पर ${gain} का सकल लाभ हुआ है जो ${status} के रूप में वर्गीकृत है। छूट के बाद, ${rate} की दर से आपका अनुमानित टैक्स ${tax} है।`,
    chartTitle: "कैपिटल गेंस विवरण",
    chartSub: "मूल लागत, सकल लाभ और टैक्स देयता का दृश्य",
    ledgerTitle: "कैपिटल गेंस लेजर",
    colComponent: "घटक",
    colValue: "राशि",
    rowCost: "कुल खरीद लागत",
    rowSale: "बिक्री / वर्तमान मूल्य",
    waIntro:
      "*Dalal Investments* की ओर से आपका *कैपिटल गेंस और टैक्स आकलन* नीचे प्रस्तुत है:",
    waHeader: "1️⃣ *रिडेम्पशन और गेन सारांश*",
    waAsset: "एसेट क्लास",
    waInvested: "खरीद लागत",
    waSale: "बिक्री मूल्य",
    waGain: "सकल कैपिटल गेन",
    waTaxPayable: "अनुमानित देय टैक्स",
    waTakeawayHeader: "💡 *सलाहकार नोट:*",
    waDisclaimer:
      "अस्वीकरण: गणना प्रचलित टैक्स नियमों के आधार पर है। रिटर्न दाखिल करने से पहले अपने CA से जांच करवा लें।",
    pdfTitle: "कैपिटल गेंस और टैक्स रिपोर्ट (Dalal Investments)",
    pdfSubtitle: "म्यूचुअल फंड रिडेम्पशन टैक्स और छूट विश्लेषण",
  },
  gu: {
    ...COMMON_TRANSLATIONS.gu,
    sectionTitle: "1. કેપિટલ ગેન્સ અને હોલ્ડિંગ વિગતો દાખલ કરો",
    sectionSub: "મ્યુચ્યુઅલ ફંડ રિડેમ્પશન પર ટેક્સ જવાબદારી અને ટેક્સ-ફ્રી પ્રોફિટ હાર્વેસ્ટીંગ તપાસો.",
    assetTypeLabel: "એસેટ ક્લાસ",
    buyPriceLabel: "કુલ ખરીદ પડતર (રોકાણ રકમ)",
    buyPriceDesc: "સ્કીમમાં રોકાયેલી મૂળ મૂડી.",
    sellPriceLabel: "વર્તમાન બજાર મૂલ્ય / વેચાણ મૂલ્ય",
    sellPriceDesc: "અપેક્ષિત અથવા વાસ્તવિક રિડેમ્પશન વેલ્યુ.",
    holdingYearsLabel: "હોલ્ડિંગ સમયગાળો (વર્ષ)",
    holdingYearsDesc: "ખરીદી અને વેચાણ તારીખ વચ્ચેનો સમય.",
    taxSlabDesc: "ડેબ્ટ ફંડ માટે લાગુ પડતો સ્લેબ દર.",
    resultHeader: "2. કેપિટલ ગેન્સ અને ટેક્સ રિપોર્ટ",
    heroTitle: "અંદાજિત ભરવાપાત્ર ટેક્સ",
    grossGainLabel: "કુલ નફો",
    exemptGainLabel: "ટેક્સ-ફ્રી મુક્તિ",
    taxableGainLabel: "કરપાત્ર નફો",
    stcgLabel: "શોર્ટ-ટર્મ કેપિટલ ગેઈન (STCG)",
    ltcgLabel: "લોંગ-ટર્મ કેપિટલ ગેઈન (LTCG)",
    harvestingHint:
      "💡 ટેક્સ હાર્વેસ્ટીંગ ટિપ: તમે દર નાણાકીય વર્ષમાં ₹1.25 લાખ સુધીનો ઇક્વિટી નફો સંપૂર્ણપણે ટેક્સ-ફ્રી ઉપાડી શકો છો.",
    takeawaySentence: (asset, gain, tax, status, rate) =>
      `તમારા ${asset} રિડેમ્પશન પર ${gain} નો ગ્રોસ નફો થયો છે જે ${status} તરીકે વર્ગીકૃત છે. છૂટ બાદ, ${rate} ના દરે તમારો અંદાજિત ટેક્સ ${tax} છે.`,
    chartTitle: "કેપિટલ ગેન્સ વિગત",
    chartSub: "મૂળ પડતર, ગ્રોસ નફો અને ટેક્સ જવાબદારીનું દ્રશ્ય",
    ledgerTitle: "કેપિટલ ગેન્સ લેજર",
    colComponent: "ઘટક",
    colValue: "રકમ",
    rowCost: "કુલ ખરીદ પડતર",
    rowSale: "વેચાણ / વર્તમાન મૂલ્ય",
    waIntro:
      "*Dalal Investments* તરફથી તમારું *કેપિટલ ગેન્સ અને ટેક્સ આકલન* નીચે મુજબ છે:",
    waHeader: "1️⃣ *રિડેમ્પશન અને ગેઈન સારાંશ*",
    waAsset: "એસેટ ક્લાસ",
    waInvested: "ખરીદ પડતર",
    waSale: "વેચાણ મૂલ્ય",
    waGain: "ગ્રોસ કેપિટલ ગેઈન",
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
  const [purchaseCost, setPurchaseCost] = useState(500000);
  const [saleValue, setSaleValue] = useState(850000);
  const [holdingYears, setHoldingYears] = useState(2);
  const [taxSlab, setTaxSlab] = useState(30);

  const result = useMemo(() => {
    const cost = Math.max(0, Number(purchaseCost) || 0);
    const sale = Math.max(0, Number(saleValue) || 0);
    const yrs = Math.max(0.1, Number(holdingYears) || 1);
    const slab = Number(taxSlab) || 30;

    const grossGain = Math.max(0, sale - cost);
    const isEquity = assetClass === "equity";

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
    <div className="space-y-5 sm:space-y-7 w-full font-sans">
      {/* SECTION 1: BORDERLESS ASSET CLASS & NUMERIC FORM */}
      <section className="space-y-3.5 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-300 dark:border-white/15">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              {t.sectionTitle}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.sectionSub}
            </p>
          </div>

          <div className="w-full sm:w-[280px] shrink-0">
            <label className="text-[10px] sm:text-[11px] font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
              {t.assetTypeLabel}
            </label>
            <CustomDropdown
              value={assetClass}
              options={ASSET_TYPES}
              onChange={setAssetClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
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
              { label: "6 Mo", value: 0.5 },
              { label: "1.5 Yrs", value: 1.5 },
              { label: "3 Yrs", value: 3 },
              { label: "5 Yrs", value: 5 },
            ]}
          />

          {assetClass === "debt" && (
            <div className="bg-white dark:bg-[#111827] border border-slate-300 dark:border-white/15 rounded-xl p-3.5 sm:p-5 space-y-2 shadow-xs">
              <label className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block">
                {t.taxSlabLabel}
              </label>
              <CustomDropdown
                value={taxSlab}
                options={DEBT_SLAB_OPTIONS}
                onChange={setTaxSlab}
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.taxSlabDesc}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: TAX REPORT & BREAKDOWN */}
      <section className="space-y-4 sm:space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-0.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            {t.resultHeader}
          </h3>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-slate-300 dark:border-white/15 text-indigo-700 dark:text-indigo-300 text-[11px] sm:text-xs font-extrabold">
            <Calculator size={14} className="shrink-0" />
            <span>{result.classification} ({result.taxRateStr})</span>
          </div>
        </div>

        <HeroResultBanner
          badgeIcon={Landmark}
          badgeText={t.heroTitle}
          futureValue={result.finalTax}
          kpis={[
            {
              label: t.grossGainLabel,
              labelColor: "text-slate-300",
              value: `+${formatINRCompact(result.grossGain)}`,
              valueColor: "text-white",
              sub: "Total profit",
            },
            ...(result.exemptGain > 0
              ? [
                  {
                    label: t.exemptGainLabel,
                    labelColor: "text-emerald-300",
                    value: formatINRCompact(result.exemptGain),
                    valueColor: "text-emerald-400",
                    sub: "Tax-free limit",
                    highlight: true,
                  },
                ]
              : []),
            {
              label: t.taxableGainLabel,
              labelColor: "text-indigo-300",
              value: formatINRCompact(result.taxableGain),
              valueColor: "text-indigo-300",
              sub: "Subject to tax",
            },
          ]}
        />

        {/* Tax Harvesting Tip Callout */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-300 dark:border-white/15 shadow-xs flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">{t.harvestingHint}</p>
        </div>

        {/* Chart + Breakdown Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          <div className="lg:col-span-5 border border-slate-300 dark:border-white/15 rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#111827] shadow-xs space-y-3">
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                {t.chartTitle}
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.chartSub}
              </p>
            </div>

            <div className="w-full h-[220px] sm:h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.chartData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.25)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#64748b", fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => formatINRCompact(v)}
                    tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    width={64}
                  />
                  <Tooltip
                    formatter={(value) => formatINR(value)}
                    contentStyle={{
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={44}>
                    {result.chartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-7 border border-slate-300 dark:border-white/15 rounded-2xl overflow-hidden bg-white dark:bg-[#111827] shadow-xs">
            <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-100 dark:bg-[#131C31] border-b border-slate-300 dark:border-white/15">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                {t.ledgerTitle}
              </h4>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-[11px] sm:text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-white/15 text-[11px] sm:text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    <th className="py-2.5 px-3 sm:py-3 sm:px-4">{t.colComponent}</th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-4 text-right whitespace-nowrap">{t.colValue}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  <tr>
                    <td className="py-2 px-3 sm:py-2.5 sm:px-4 text-slate-700 dark:text-slate-300">
                      {t.rowCost}
                    </td>
                    <td className="py-2 px-3 sm:py-2.5 sm:px-4 text-right font-semibold whitespace-nowrap">
                      {formatINR(result.cost)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 sm:py-2.5 sm:px-4 text-slate-700 dark:text-slate-300">
                      {t.rowSale}
                    </td>
                    <td className="py-2 px-3 sm:py-2.5 sm:px-4 text-right font-semibold whitespace-nowrap">
                      {formatINR(result.sale)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-white/[0.03] font-bold">
                    <td className="py-2 px-3 sm:py-2.5 sm:px-4 text-slate-900 dark:text-white">
                      {t.grossGainLabel}
                    </td>
                    <td className="py-2 px-3 sm:py-2.5 sm:px-4 text-right text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                      +{formatINR(result.grossGain)}
                    </td>
                  </tr>
                  {result.exemptGain > 0 && (
                    <tr>
                      <td className="py-2 px-3 sm:py-2.5 sm:px-4 text-slate-600 dark:text-slate-400">
                        {t.exemptGainLabel}
                      </td>
                      <td className="py-2 px-3 sm:py-2.5 sm:px-4 text-right text-emerald-600 font-semibold whitespace-nowrap">
                        -{formatINR(result.exemptGain)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2 px-3 sm:py-2.5 sm:px-4 text-slate-700 dark:text-slate-300">
                      {t.taxableGainLabel}
                    </td>
                    <td className="py-2 px-3 sm:py-2.5 sm:px-4 text-right font-bold whitespace-nowrap">
                      {formatINR(result.taxableGain)}
                    </td>
                  </tr>
                  <tr className="bg-slate-900 text-white font-extrabold">
                    <td className="py-2.5 px-3 sm:py-3 sm:px-4">
                      {t.heroTitle} ({result.taxRateStr})
                    </td>
                    <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-right text-amber-400 whitespace-nowrap">
                      {formatINR(result.finalTax)}
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

export default CapitalGainsCalculator;