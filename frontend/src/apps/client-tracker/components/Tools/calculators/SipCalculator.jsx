import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  TrendingUp,
  Sparkles,
  BarChart3,
  Table as TableIcon,
  Scale,
  ChevronDown,
  Check,
  Minus,
  Plus,
  Landmark,
  Wallet,
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

const TRANSLATIONS = {
  en: {
    sectionTitle: "1. Enter Your Savings Plan",
    sectionSub: "Adjust the sliders or type exact figures below to model your SIP.",
    monthlyLabel: "Monthly SIP Amount",
    monthlyDesc: "Fixed amount invested automatically every month.",
    stepUpLabel: "Yearly SIP Increase (%)",
    stepUpDesc: "Grow your SIP annually as income rises (0% = constant).",
    returnLabel: "Expected Return (p.a.)",
    returnDesc: "Long-term equity funds average 11%–13%.",
    yearsLabel: "Time Horizon",
    yearsDesc: "Longer duration unlocks exponential compounding.",
    yearsUnit: "Yrs",
    yrShort: "Yr",

    resultHeader: "2. Projected Wealth Summary",
    heroTitle: "Estimated Final Value",
    investedLabel: "Money Put In",
    investedSub: "Your out-of-pocket savings",
    profitLabel: "Profit Earned",
    profitSub: "Compounding wealth created",
    multiplierLabel: "Wealth Multiplier",
    multiplierSub: "Total growth multiple",
    stepUpNote: (start, end, yrs) =>
      `Your monthly SIP starts at ${start} in Year 1 and gradually reaches ${end} by Year ${yrs}.`,
    takeawaySentence: (invested, profit, total, yrs, mult) =>
      `By investing systematically over ${yrs} years, you contribute ${invested} from your pocket and generate ${profit} in compounding profit — growing your money ${mult}x to ${total}.`,

    compareToggle: "Compare vs. Bank FD & Inflation",
    compareDesc: "Check post-tax FD returns and today's purchasing power.",
    fdRateLabel: "Bank FD Rate (%)",
    taxSlabLabel: "Your Tax Slab",
    inflationLabel: "Yearly Inflation (%)",
    fdCardTitle: "Same Savings in Bank FD",
    fdCardSub: (rate, slab) => `${rate}% interest after ${slab}% yearly tax`,
    fdExtraEdge: (edge) => `+${edge} extra with SIP`,
    realValueTitle: "Today's Purchasing Power",
    realValueSub: (inf) => `Adjusted for ${inf}% yearly inflation`,

    growthChartTitle: "Year-by-Year Wealth Growth",
    growthChartSub: "Watch how compounding profit overtakes your principal over time",
    legendInvested: "Money Put In",
    legendTotal: "Total Fund Value",
    legendFd: "Bank FD (Post-Tax)",
    viewChart: "Growth Chart",
    viewTable: "Year-by-Year Table",
    colYear: "Year",
    colSip: "Monthly SIP",
    colInvested: "Total Put In",
    colProfit: "Profit Earned",
    colTotal: "Total Value",

    waGreeting: (name) => (name ? `Namaste *${name}*,` : `Namaste,`),
    waIntro: (isStepUp) =>
      `Here is your personalized *${isStepUp ? "Step-Up SIP" : "Monthly SIP"} Wealth Illustration* prepared by *Dalal Investments*:`,
    waPlanHeader: "1️⃣ *Investment Plan Details*",
    waSip: "Starting Monthly SIP",
    waStepUp: "Yearly SIP Step-Up",
    waDuration: "Investment Horizon",
    waReturn: "Assumed Return Rate",
    waOutcomeHeader: "2️⃣ *Projected Wealth Outcome*",
    waInvested: "Total Money You Put In",
    waProfit: "Compounding Profit Earned",
    waMultiplier: "Wealth Growth Multiple",
    waTotal: "Estimated Maturity Value",
    waFdBlock: (fdRate, slab, fdVal, edge) =>
      `\n3️⃣ *Bank FD vs. SIP Comparison*\n` +
      `• Same savings in Bank FD (${fdRate}% @ ${slab}% tax): *${fdVal}*\n` +
      `• *Additional Wealth Created by SIP: +${edge}*\n`,
    waRealLine: (inf, realVal) =>
      `• Value in Today's Purchasing Power (at ${inf}% inflation): *${realVal}*\n`,
    waTakeawayHeader: "💡 *Key Takeaway:*",
    waDisclaimer:
      "Disclaimer: Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Figures above are arithmetic illustrations for planning purposes.",
    pdfTitle: "Systematic Investment Plan (SIP) Illustration",
    pdfSubtitle: "Long-term wealth projection and compounding analysis",
  },
  hi: {
    sectionTitle: "1. अपनी बचत योजना दर्ज करें",
    sectionSub: "स्लाइडर खिसकाएं या नीचे सीधे सही राशि दर्ज करें।",
    monthlyLabel: "मासिक SIP राशि",
    monthlyDesc: "हर महीने बैंक से निवेश होने वाली राशि।",
    stepUpLabel: "सालाना SIP बढ़ोतरी (%)",
    stepUpDesc: "आय बढ़ने के साथ हर साल SIP बढ़ाएं (0% = समान राशि)।",
    returnLabel: "अनुमानित सालाना रिटर्न",
    returnDesc: "लंबे समय में इक्विटी फंड औसतन 11%–13% रिटर्न देते हैं।",
    yearsLabel: "निवेश की अवधि",
    yearsDesc: "लंबा समय कंपाउंडिंग का सबसे बड़ा लाभ देता है।",
    yearsUnit: "साल",
    yrShort: "वर्ष",

    resultHeader: "2. अनुमानित वेल्थ रिपोर्ट",
    heroTitle: "कुल अनुमानित फंड",
    investedLabel: "आपका निवेश",
    profitLabel: "अनुमानित लाभ",
    investedSub: "आपकी जेब से जमा राशि",
    profitSub: "कंपाउंडिंग से बना मुनाफा",
    multiplierLabel: "वेल्थ मल्टीप्लायर",
    multiplierSub: "आपके निवेश पर कुल गुना बढ़त",
    stepUpNote: (start, end, yrs) =>
      `आपकी मासिक SIP पहले साल ${start} से शुरू होकर ${yrs}वें साल में ${end} हो जाएगी।`,
    takeawaySentence: (invested, profit, total, yrs, mult) =>
      `${yrs} सालों तक नियमित निवेश करके आप अपनी जेब से ${invested} जमा करेंगे और कंपाउंडिंग से ${profit} का मुनाफा कमाएंगे — जिससे आपका पैसा ${mult} गुना बढ़कर ${total} हो जाएगा।`,

    compareToggle: "बैंक FD और महंगाई से तुलना करें",
    compareDesc: "टैक्स के बाद FD रिटर्न और आज की कीमत में वैल्यू देखें।",
    fdRateLabel: "बैंक FD दर (%)",
    taxSlabLabel: "टैक्स स्लैब",
    inflationLabel: "सालाना महंगाई (%)",
    fdCardTitle: "बैंक FD में इतनी ही बचत",
    fdCardSub: (rate, slab) => `${rate}% ब्याज, ${slab}% सालाना टैक्स के बाद`,
    fdExtraEdge: (edge) => `SIP से +${edge} ज्यादा लाभ`,
    realValueTitle: "आज की खरीदारी क्षमता",
    realValueSub: (inf) => `${inf}% सालाना महंगाई के बाद आज की वैल्यू`,

    growthChartTitle: "साल दर साल फंड की बढ़त",
    growthChartSub: "देखें कि कैसे मुनाफा आपके निवेश से आगे निकल जाता है",
    legendInvested: "आपका निवेश",
    legendTotal: "कुल फंड वैल्यू",
    legendFd: "बैंक FD (टैक्स के बाद)",
    viewChart: "ग्रोथ चार्ट",
    viewTable: "वार्षिक तालिका",
    colYear: "साल",
    colSip: "मासिक SIP",
    colInvested: "कुल जमा",
    colProfit: "मुनाफा",
    colTotal: "कुल फंड",

    waGreeting: (name) => (name ? `नमस्ते *${name}*,` : `नमस्ते,`),
    waIntro: (isStepUp) =>
      `*Dalal Investments* की ओर से आपकी *${isStepUp ? "स्टेप-अप SIP" : "मासिक SIP"} निवेश योजना* नीचे प्रस्तुत है:`,
    waPlanHeader: "1️⃣ *निवेश योजना का विवरण*",
    waSip: "शुरुआती मासिक SIP",
    waStepUp: "सालाना SIP बढ़ोतरी",
    waDuration: "निवेश की अवधि",
    waReturn: "अनुमानित सालाना रिटर्न",
    waOutcomeHeader: "2️⃣ *अनुमानित वेल्थ परिणाम*",
    waInvested: "आपका कुल निवेश",
    waProfit: "अनुमानित मुनाफा (लाभ)",
    waMultiplier: "कुल वेल्थ ग्रोथ",
    waTotal: "अनुमानित कुल फंड",
    waFdBlock: (fdRate, slab, fdVal, edge) =>
      `\n3️⃣ *बैंक FD बनाम SIP तुलना*\n` +
      `• बैंक FD में इतनी ही बचत (${fdRate}% @ ${slab}% टैक्स): *${fdVal}*\n` +
      `• *SIP से अतिरिक्त लाभ: +${edge}*\n`,
    waRealLine: (inf, realVal) =>
      `• आज की खरीदारी क्षमता के अनुसार (${inf}% महंगाई के बाद): *${realVal}*\n`,
    waTakeawayHeader: "💡 *मुख्य सारांश:*",
    waDisclaimer:
      "अस्वीकरण: म्यूचुअल फंड निवेश बाजार जोखिमों के अधीन हैं। यह गणना केवल योजना बनाने के उद्देश्य से है।",
    pdfTitle: "मासिक SIP निवेश योजना (Dalal Investments)",
    pdfSubtitle: "दीर्घकालिक वेल्थ निर्माण और कंपाउंडिंग विश्लेषण",
  },
  gu: {
    sectionTitle: "1. તમારી બચત યોજના દાખલ કરો",
    sectionSub: "સ્લાઇડર ખસેડો અથવા નીચે સીધી રકમ લખો.",
    monthlyLabel: "માસિક SIP રકમ",
    monthlyDesc: "દર મહિને આપમેળે રોકાણ થતી રકમ.",
    stepUpLabel: "વાર્ષિક SIP વધારો (%)",
    stepUpDesc: "આવક વધવાની સાથે દર વર્ષે SIP વધારો (0% = એકસરખી).",
    returnLabel: "અંદાજિત વાર્ષિક વળતર",
    returnDesc: "લાંબા ગાળે ઇક્વિટી ફંડ સરેરાશ 11%–13% વળતર આપે છે.",
    yearsLabel: "રોકાણનો સમયગાળો",
    yearsDesc: "લાંબો સમય કમ્પાઉન્ડિંગનો સૌથી મોટો ફાયદો આપે છે.",
    yearsUnit: "વર્ષ",
    yrShort: "વર્ષ",

    resultHeader: "2. અંદાજિત વેલ્થ રિપોર્ટ",
    heroTitle: "અંદાજિત કુલ ફંડ",
    investedLabel: "તમારું રોકાણ",
    profitLabel: "અંદાજિત નફો",
    investedSub: "તમારા ખિસ્સામાંથી જમા રકમ",
    profitSub: "કમ્પાઉન્ડિંગ દ્વારા મળેલો નફો",
    multiplierLabel: "વેલ્થ મલ્ટિપ્લાયર",
    multiplierSub: "તમારા રોકાણ પર કુલ ગણો વધારો",
    stepUpNote: (start, end, yrs) =>
      `તમારી માસિક SIP પ્રથમ વર્ષે ${start} થી શરૂ થઈને ${yrs}મા વર્ષે ${end} થશે.`,
    takeawaySentence: (invested, profit, total, yrs, mult) =>
      `${yrs} વર્ષ સુધી નિયમિત રોકાણ કરીને તમે તમારા ખિસ્સામાંથી ${invested} રોકશો અને કમ્પાઉન્ડિંગ દ્વારા ${profit} નો નફો મેળવશો — જેનાથી તમારા પૈસા ${mult} ગણા વધીને ${total} થશે.`,

    compareToggle: "બેંક FD અને મોંઘવારી સાથે સરખામણી",
    compareDesc: "ટેક્સ પછી FD વળતર અને આજની ખરીદશક્તિ જુઓ.",
    fdRateLabel: "બેંક FD દર (%)",
    taxSlabLabel: "ટેક્સ સ્લેબ",
    inflationLabel: "વાર્ષિક મોંઘવારી (%)",
    fdCardTitle: "બેંક FD માં આટલી જ બચત",
    fdCardSub: (rate, slab) => `${rate}% વ્યાજ, ${slab}% વાર્ષિક ટેક્સ પછી`,
    fdExtraEdge: (edge) => `SIP થી +${edge} વધુ ફાયદો`,
    realValueTitle: "આજની ખરીદશક્તિ",
    realValueSub: (inf) => `${inf}% વાર્ષિક મોંઘવારી પછી આજનું મૂલ્ય`,

    growthChartTitle: "દર વર્ષે ફંડની વૃદ્ધિ",
    growthChartSub: "જુઓ કે કેવી રીતે નફો તમારા રોકાણ કરતાં આગળ નીકળી જાય છે",
    legendInvested: "તમારું રોકાણ",
    legendTotal: "કુલ ફંડ મૂલ્ય",
    legendFd: "બેંક FD (ટેક્સ પછી)",
    viewChart: "ગ્રોથ ચાર્ટ",
    viewTable: "વાર્ષિક કોષ્ટક",
    colYear: "વર્ષ",
    colSip: "માસિક SIP",
    colInvested: "કુલ રોકાણ",
    colProfit: "નફો",
    colTotal: "કુલ ફંડ",

    waGreeting: (name) => (name ? `નમસ્તે *${name}*,` : `નમસ્તે,`),
    waIntro: (isStepUp) =>
      `*Dalal Investments* તરફથી તમારું *${isStepUp ? "સ્ટેપ-અપ SIP" : "માસિક SIP"} આયોજન* નીચે મુજબ છે:`,
    waPlanHeader: "1️⃣ *રોકાણ યોજનાની વિગતો*",
    waSip: "શરૂઆતની માસિક SIP",
    waStepUp: "વાર્ષિક SIP વધારો",
    waDuration: "રોકાણનો સમયગાળો",
    waReturn: "અંદાજિત વાર્ષિક વળતર",
    waOutcomeHeader: "2️⃣ *અંદાજિત વેલ્થ પરિણામ*",
    waInvested: "તમારું કુલ રોકાણ",
    waProfit: "અંદાજિત નફો (વળતર)",
    waMultiplier: "કુલ વેલ્થ ગ્રોથ",
    waTotal: "અંદાજિત કુલ ફંડ",
    waFdBlock: (fdRate, slab, fdVal, edge) =>
      `\n3️⃣ *બેંક FD વિ. SIP સરખામણી*\n` +
      `• બેંક FD માં આટલી જ બચત (${fdRate}% @ ${slab}% ટેક્સ): *${fdVal}*\n` +
      `• *SIP થી વધારાનો નફો: +${edge}*\n`,
    waRealLine: (inf, realVal) =>
      `• આજની ખરીદશક્તિ મુજબ (${inf}% મોંઘવારી પછી): *${realVal}*\n`,
    waTakeawayHeader: "💡 *મુખ્ય સારાંશ:*",
    waDisclaimer:
      "સૂચના: મ્યુચ્યુઅલ ફંડ રોકાણો બજારના જોખમોને આધીન છે. આ ગણતરી માત્ર સમજૂતી માટે છે.",
    pdfTitle: "માસિક SIP રોકાણ આયોજન (Dalal Investments)",
    pdfSubtitle: "લાંબા ગાળાની સંપત્તિ નિર્માણ અને કમ્પાઉન્ડિંગ વિશ્લેષણ",
  },
};

const TactileSliderInput = ({
  label,
  description,
  value,
  onChange,
  min,
  max,
  step,
  sliderMax,
  prefix,
  suffix,
  accent = "emerald",
  presets,
  ticks,
}) => {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const effectiveSliderMax = sliderMax ?? max;
  const clampedForBar = Math.min(effectiveSliderMax, Math.max(min, Number(value) || min));
  const fillPct =
    effectiveSliderMax > min
      ? ((clampedForBar - min) / (effectiveSliderMax - min)) * 100
      : 0;

  const commitDraft = () => {
    const parsed = parseFloat(draft);
    if (Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }
    const clamped = Math.min(max, Math.max(min, parsed));
    onChange(clamped);
    setDraft(String(clamped));
  };

  const handleStep = (delta) => {
    const next = Math.min(max, Math.max(min, Number((value + delta).toFixed(2))));
    onChange(next);
  };

  const accentStyles = {
    emerald: {
      bar: "bg-emerald-500",
      thumb: "border-emerald-600",
      ring: "focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15",
      presetActive: "bg-emerald-600 text-white border-emerald-600 shadow-2xs",
    },
    indigo: {
      bar: "bg-indigo-500",
      thumb: "border-indigo-600",
      ring: "focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/15",
      presetActive: "bg-indigo-600 text-white border-indigo-600 shadow-2xs",
    },
  }[accent] || {
    bar: "bg-emerald-500",
    thumb: "border-emerald-600",
    ring: "focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15",
    presetActive: "bg-emerald-600 text-white border-emerald-600",
  };

  return (
    <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/10 rounded-xl p-4 sm:p-5 space-y-3 shadow-2xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-[180px]">
          <label className="text-sm font-bold text-slate-900 dark:text-white block">
            {label}
          </label>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div
          className={`inline-flex items-center bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-white/15 rounded-xl overflow-hidden shadow-2xs transition-all shrink-0 ${accentStyles.ring}`}
        >
          <button
            type="button"
            onClick={() => handleStep(-step)}
            disabled={value <= min}
            aria-label="Decrease"
            className="px-2.5 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <Minus size={13} strokeWidth={2.5} />
          </button>

          <div className="flex items-center px-2 border-x border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02]">
            {prefix && (
              <span className="text-xs font-bold text-slate-400 mr-1 select-none">
                {prefix}
              </span>
            )}
            <input
              type="text"
              inputMode="decimal"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                const parsed = parseFloat(e.target.value);
                if (!Number.isNaN(parsed) && parsed >= min && parsed <= max) {
                  onChange(parsed);
                }
              }}
              onBlur={commitDraft}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              className="w-20 text-center text-sm font-extrabold text-slate-900 dark:text-white bg-transparent outline-none tabular-nums py-1.5"
            />
            {suffix && (
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 select-none">
                {suffix}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleStep(step)}
            disabled={value >= max}
            aria-label="Increase"
            className="px-2.5 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <Plus size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="relative h-6 flex items-center select-none group">
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
          <div
            style={{ width: `${fillPct}%` }}
            className={`h-full ${accentStyles.bar} transition-all duration-75`}
          />
        </div>

        <div
          style={{ left: `calc(${fillPct}% - 9px)` }}
          className={`pointer-events-none absolute w-[18px] h-[18px] rounded-full bg-white border-[3px] ${accentStyles.thumb} shadow-md transition-transform group-hover:scale-110`}
        />

        <input
          type="range"
          min={min}
          max={effectiveSliderMax}
          step={step}
          value={clampedForBar}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {presets ? (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {presets.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange(p.value)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer tabular-nums ${
                value === p.value
                  ? accentStyles.presetActive
                  : "bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      ) : (
        ticks && (
          <div className="flex justify-between text-[11px] font-medium text-slate-400 tabular-nums -mt-1">
            {ticks.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
        )
      )}
    </div>
  );
};

const CustomDropdown = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-white/15 hover:border-emerald-500 text-xs font-bold text-slate-900 dark:text-white transition-colors cursor-pointer"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          size={14}
          className={`text-slate-400 shrink-0 transition-transform duration-150 ${
            open ? "rotate-180 text-emerald-600" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1.5 rounded-xl bg-white dark:bg-[#131C31] border border-slate-200 dark:border-white/15 shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={13} className="text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CustomGrowthTooltip = ({ active, payload, t, showComparison }) => {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/15 rounded-xl p-3.5 shadow-xl space-y-2 min-w-[220px] font-sans text-xs z-50">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-1.5">
        <span className="font-bold text-slate-900 dark:text-white">
          {t.yrShort} {row.year}
        </span>
        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
          {t.colSip}: {formatINR(row.monthlySip)}
        </span>
      </div>
      <div className="space-y-1.5 tabular-nums">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">{t.legendInvested}:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {formatINRCompact(row.totalInvested)}
          </span>
        </div>
        {showComparison && (
          <div className="flex justify-between gap-4">
            <span className="text-amber-600 dark:text-amber-400">{t.legendFd}:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {formatINRCompact(row.fdBalance)}
            </span>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <span className="text-emerald-600 dark:text-emerald-400">{t.profitLabel}:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            +{formatINRCompact(row.wealthGained)}
          </span>
        </div>
        <div className="flex justify-between gap-4 pt-1.5 border-t border-slate-100 dark:border-white/10">
          <span className="font-bold text-slate-900 dark:text-white">{t.colTotal}:</span>
          <span className="font-extrabold text-slate-900 dark:text-white">
            {formatINRCompact(row.endBalance)}
          </span>
        </div>
      </div>
    </div>
  );
};

const TAX_SLAB_OPTIONS = [
  { value: 0, label: "0% (Nil Tax)" },
  { value: 10, label: "10% Slab" },
  { value: 20, label: "20% Slab" },
  { value: 30, label: "30% Slab" },
];

const SipCalculator = ({ clientName, lang = "en", onSummaryChange }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [monthlySip, setMonthlySip] = useState(15000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(15);
  const [stepUpPct, setStepUpPct] = useState(10);

  // Optional FD & Inflation Reality Check
  const [showComparison, setShowComparison] = useState(false);
  const [fdRate, setFdRate] = useState(7);
  const [taxSlab, setTaxSlab] = useState(30);
  const [inflationRate, setInflationRate] = useState(6);

  const [activeView, setActiveView] = useState("chart");

  const result = useMemo(() => {
    const sip = Number(monthlySip) || 0;
    const rate = Number(annualReturn) || 0;
    const yrs = Math.max(1, Number(years) || 1);
    const step = Number(stepUpPct) || 0;

    const monthlyMfRate = rate / 100 / 12;
    const postTaxFdAnnualRate =
      ((Number(fdRate) || 0) / 100) * (1 - (Number(taxSlab) || 0) / 100);
    const monthlyFdRate = postTaxFdAnnualRate / 12;

    let currentSip = sip;
    let mfCorpus = 0;
    let fdCorpus = 0;
    let totalInvested = 0;
    const yearlySchedule = [];

    for (let yr = 1; yr <= yrs; yr++) {
      for (let m = 1; m <= 12; m++) {
        totalInvested += currentSip;
        mfCorpus = (mfCorpus + currentSip) * (1 + monthlyMfRate);
        fdCorpus = (fdCorpus + currentSip) * (1 + monthlyFdRate);
      }

      yearlySchedule.push({
        year: yr,
        monthlySip: Math.round(currentSip),
        totalInvested: Math.round(totalInvested),
        wealthGained: Math.round(mfCorpus - totalInvested),
        endBalance: Math.round(mfCorpus),
        fdBalance: Math.round(fdCorpus),
      });

      currentSip = currentSip * (1 + step / 100);
    }

    const inflationFactor = Math.pow(1 + (Number(inflationRate) || 0) / 100, yrs);
    const inflationAdjustedValue = Math.round(mfCorpus / inflationFactor);
    const multiplier =
      totalInvested > 0 ? (mfCorpus / totalInvested).toFixed(2) : "1.00";

    return {
      totalInvested: Math.round(totalInvested),
      futureValue: Math.round(mfCorpus),
      wealthGained: Math.round(mfCorpus - totalInvested),
      fdFutureValue: Math.round(fdCorpus),
      sipOverFdEdge: Math.round(mfCorpus - fdCorpus),
      inflationAdjustedValue,
      multiplier,
      finalMonthlySip: Math.round(sip * Math.pow(1 + step / 100, Math.max(0, yrs - 1))),
      yearlySchedule,
    };
  }, [monthlySip, annualReturn, years, stepUpPct, fdRate, taxSlab, inflationRate]);

  const investedRatio =
    result.futureValue > 0
      ? Math.min(100, Math.round((result.totalInvested / result.futureValue) * 100))
      : 0;
  const profitRatio = 100 - investedRatio;

  useEffect(() => {
    const takeaway = t.takeawaySentence(
      formatINRCompact(result.totalInvested),
      formatINRCompact(result.wealthGained),
      formatINRCompact(result.futureValue),
      years,
      result.multiplier
    );

    const stepUpLine =
      stepUpPct > 0
        ? `• ${t.waStepUp}: *${stepUpPct}%* (Grows from ${formatINR(monthlySip)} to ${formatINR(result.finalMonthlySip)}/mo)\n`
        : `• ${t.waStepUp}: *0%* (Fixed monthly SIP)\n`;

    const extraCompareText = showComparison
      ? t.waFdBlock(
          fdRate,
          taxSlab,
          formatINRCompact(result.fdFutureValue),
          formatINRCompact(result.sipOverFdEdge)
        ) + t.waRealLine(inflationRate, formatINRCompact(result.inflationAdjustedValue))
      : "";

    const text =
      `${t.waGreeting(clientName?.trim())}\n\n` +
      `${t.waIntro(stepUpPct > 0)}\n\n` +
      `${t.waPlanHeader}\n` +
      `• ${t.waSip}: *${formatINR(monthlySip)}*\n` +
      stepUpLine +
      `• ${t.waDuration}: *${years} ${t.yearsUnit}*\n` +
      `• ${t.waReturn}: *${annualReturn}% p.a.*\n\n` +
      `${t.waOutcomeHeader}\n` +
      `• ${t.waInvested}: *${formatINRCompact(result.totalInvested)}* (${investedRatio}%)\n` +
      `• ${t.waProfit}: *+${formatINRCompact(result.wealthGained)}* (${profitRatio}%)\n` +
      `• ${t.waMultiplier}: *${result.multiplier}x*\n` +
      `• *${t.waTotal}: ${formatINRCompact(result.futureValue)}* (${formatINR(result.futureValue)})\n` +
      extraCompareText +
      `\n${t.waTakeawayHeader}\n${takeaway}\n\n` +
      `_${t.waDisclaimer}_\n` +
      `— *Dalal Investments | Private Wealth Desk*`;

    // Pick up to 5 clean milestone rows (e.g., every 3-5 years + final year) for the PDF sheet
    const milestoneStep = years <= 5 ? 1 : years <= 15 ? 3 : 5;
    const milestones = result.yearlySchedule
      .filter((r) => r.year === 1 || r.year % milestoneStep === 0 || r.year === years)
      .map((r) => ({
        year: r.year,
        sip: formatINR(r.monthlySip),
        invested: formatINRCompact(r.totalInvested),
        profit: formatINRCompact(r.wealthGained),
        total: formatINRCompact(r.endBalance),
      }));

    onSummaryChange({
      title: t.pdfTitle,
      subtitle: t.pdfSubtitle,
      takeaway,
      whatsappText: text,
      assumptions: [
        { label: t.waSip, value: formatINR(monthlySip) },
        { label: t.waStepUp, value: stepUpPct > 0 ? `${stepUpPct}% / yr` : "0% (Fixed)" },
        { label: t.waDuration, value: `${years} ${t.yearsUnit}` },
        { label: t.waReturn, value: `${annualReturn}% p.a.` },
      ],
      highlights: [
        {
          label: t.waInvested,
          sub: `${investedRatio}% of total corpus`,
          value: `${formatINRCompact(result.totalInvested)} (${formatINR(result.totalInvested)})`,
        },
        {
          label: t.waProfit,
          sub: `${profitRatio}% wealth created via compounding`,
          value: `+${formatINRCompact(result.wealthGained)} (${formatINR(result.wealthGained)})`,
        },
        {
          label: t.waMultiplier,
          sub: t.multiplierSub,
          value: `${result.multiplier}x`,
        },
        ...(showComparison
          ? [
              {
                label: t.fdCardTitle,
                sub: t.fdCardSub(fdRate, taxSlab),
                value: `${formatINRCompact(result.fdFutureValue)} (SIP Edge: +${formatINRCompact(result.sipOverFdEdge)})`,
              },
              {
                label: t.realValueTitle,
                sub: t.realValueSub(inflationRate),
                value: formatINRCompact(result.inflationAdjustedValue),
              },
            ]
          : []),
        {
          label: t.waTotal,
          sub: `Projected maturity fund at the end of ${years} ${t.yearsUnit}`,
          value: `${formatINRCompact(result.futureValue)} (${formatINR(result.futureValue)})`,
          isHero: true,
        },
      ],
      milestones,
      disclaimer: t.waDisclaimer,
    });
  }, [
    clientName,
    monthlySip,
    annualReturn,
    years,
    stepUpPct,
    showComparison,
    fdRate,
    taxSlab,
    inflationRate,
    result,
    investedRatio,
    profitRatio,
    t,
    onSummaryChange,
  ]);

  return (
    <div className="space-y-8 w-full font-sans">
      
      {/* ================================================================= */}
      {/* TOP SECTION: STEP 1 — SAVINGS PLAN FORM (2x2 Grid + Compare Bar)  */}
      {/* ================================================================= */}
      <section className="bg-slate-50/90 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/10 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-white/10">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {t.sectionTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.sectionSub}
            </p>
          </div>
        </div>

        {/* 2x2 Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <TactileSliderInput
            label={t.monthlyLabel}
            description={t.monthlyDesc}
            value={monthlySip}
            onChange={setMonthlySip}
            min={500}
            max={1000000}
            sliderMax={200000}
            step={500}
            prefix="₹"
            presets={[
              { label: "₹5,000", value: 5000 },
              { label: "₹15,000", value: 15000 },
              { label: "₹25,000", value: 25000 },
              { label: "₹50,000", value: 50000 },
            ]}
          />

          <TactileSliderInput
            label={t.stepUpLabel}
            description={t.stepUpDesc}
            value={stepUpPct}
            onChange={setStepUpPct}
            min={0}
            max={25}
            step={1}
            suffix="%"
            presets={[
              { label: "0% (Fixed)", value: 0 },
              { label: "5% / yr", value: 5 },
              { label: "10% / yr", value: 10 },
              { label: "15% / yr", value: 15 },
            ]}
          />

          <TactileSliderInput
            label={t.returnLabel}
            description={t.returnDesc}
            value={annualReturn}
            onChange={setAnnualReturn}
            min={6}
            max={22}
            step={0.5}
            suffix="%"
            presets={[
              { label: "8% (Debt)", value: 8 },
              { label: "12% (Equity)", value: 12 },
              { label: "15% (Aggressive)", value: 15 },
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
              { label: `5 ${t.yearsUnit}`, value: 5 },
              { label: `10 ${t.yearsUnit}`, value: 10 },
              { label: `15 ${t.yearsUnit}`, value: 15 },
              { label: `20 ${t.yearsUnit}`, value: 20 },
            ]}
          />
        </div>

        {/* Optional FD & Inflation Reality Check Accordion Bar */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <label className="flex items-start sm:items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showComparison}
                onChange={(e) => setShowComparison(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-600 cursor-pointer shrink-0 mt-0.5 sm:mt-0"
              />
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Scale size={16} />
              </div>
              <div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                  {t.compareToggle}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {t.compareDesc}
                </span>
              </div>
            </label>

            {showComparison && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:w-[460px] shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-white/10 animate-in fade-in duration-150">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {t.fdRateLabel}
                  </label>
                  <input
                    type="number"
                    step={0.25}
                    value={fdRate}
                    onChange={(e) => setFdRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-300 dark:border-white/15 focus:border-amber-500 text-xs font-bold text-slate-900 dark:text-white outline-none tabular-nums"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {t.taxSlabLabel}
                  </label>
                  <CustomDropdown
                    value={taxSlab}
                    options={TAX_SLAB_OPTIONS}
                    onChange={setTaxSlab}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {t.inflationLabel}
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    value={inflationRate}
                    onChange={(e) => setInflationRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-300 dark:border-white/15 focus:border-indigo-500 text-xs font-bold text-slate-900 dark:text-white outline-none tabular-nums"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* BOTTOM SECTION: STEP 2 — PROJECTED RESULTS, KPIs & CHARTS         */}
      {/* ================================================================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t.resultHeader}
          </h3>
        </div>

        {/* High-Contrast Hero Result Banner */}
        <div className="rounded-2xl bg-slate-900 dark:bg-[#0F172A] border border-slate-800 dark:border-emerald-500/30 text-white p-6 shadow-md space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                <TrendingUp size={13} />
                <span>
                  {t.heroTitle} ({years} {t.yearsUnit})
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-white tabular-nums">
                  {formatINRCompact(result.futureValue)}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-emerald-300 tabular-nums">
                  {formatINR(result.futureValue)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                  {t.investedLabel}
                </span>
                <span className="text-lg sm:text-xl font-black text-white tabular-nums mt-0.5 block">
                  {formatINRCompact(result.totalInvested)}
                </span>
                <span className="text-[11px] text-slate-400">
                  {investedRatio}% of corpus
                </span>
              </div>

              <div className="bg-slate-800/90 border border-emerald-500/30 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  {t.profitLabel}
                </span>
                <span className="text-lg sm:text-xl font-black text-emerald-400 tabular-nums mt-0.5 block">
                  +{formatINRCompact(result.wealthGained)}
                </span>
                <span className="text-[11px] text-slate-400">
                  {profitRatio}% compounding gain
                </span>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                  {t.multiplierLabel}
                </span>
                <span className="text-lg sm:text-xl font-black text-amber-400 tabular-nums mt-0.5 block">
                  {result.multiplier}x
                </span>
                <span className="text-[11px] text-slate-400">
                  {t.multiplierSub}
                </span>
              </div>
            </div>
          </div>

          {/* 2-Tone Split Bar */}
          <div className="space-y-2">
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex p-0.5 gap-0.5">
              <div
                style={{ width: `${investedRatio}%` }}
                className="h-full rounded-l-full bg-indigo-400 transition-all duration-300"
              />
              <div
                style={{ width: `${profitRatio}%` }}
                className="h-full rounded-r-full bg-emerald-400 transition-all duration-300"
              />
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-200 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                {t.investedLabel}:{" "}
                <strong className="text-white">{formatINRCompact(result.totalInvested)}</strong>{" "}
                <span className="text-slate-400">({investedRatio}%)</span>
              </span>

              <span className="inline-flex items-center gap-1.5 text-slate-200 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                {t.profitLabel}:{" "}
                <strong className="text-emerald-400">+{formatINRCompact(result.wealthGained)}</strong>{" "}
                <span className="text-slate-400">({profitRatio}%)</span>
              </span>
            </div>
          </div>

          {stepUpPct > 0 && (
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-amber-300 font-medium">
              <Sparkles size={14} className="text-amber-400 shrink-0" />
              <span>
                {t.stepUpNote(formatINR(monthlySip), formatINR(result.finalMonthlySip), years)}
              </span>
            </div>
          )}
        </div>

        {/* Optional FD & Inflation Comparison Cards */}
        {showComparison && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-150">
            <div className="p-5 rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                  {t.fdCardTitle}
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white block tabular-nums">
                  {formatINRCompact(result.fdFutureValue)}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 block">
                  {t.fdCardSub(fdRate, taxSlab)}
                </span>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  {t.fdExtraEdge(formatINRCompact(result.sipOverFdEdge))}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Landmark size={20} />
              </div>
            </div>

            <div className="p-5 rounded-xl bg-purple-50/60 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/25 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-purple-800 dark:text-purple-300 block">
                  {t.realValueTitle}
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white block tabular-nums">
                  {formatINRCompact(result.inflationAdjustedValue)}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 block leading-relaxed">
                  {t.realValueSub(inflationRate)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Wallet size={20} />
              </div>
            </div>
          </div>
        )}

        {/* Full-Width Chart & Year-by-Year Table Card */}
        <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0B1120] shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {activeView === "chart" ? t.growthChartTitle : t.viewTable}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.growthChartSub}
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
                <span className="inline-flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  {t.legendInvested}
                </span>
                <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  {t.legendTotal}
                </span>
                {showComparison && (
                  <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    {t.legendFd}
                  </span>
                )}
              </div>

              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart
                    data={result.yearlySchedule}
                    margin={{ top: 10, right: 16, left: 4, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="sipTotalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.32} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="sipInvestedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
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
                      content={<CustomGrowthTooltip t={t} showComparison={showComparison} />}
                    />
                    <Area
                      type="monotone"
                      dataKey="endBalance"
                      name={t.legendTotal}
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#sipTotalGrad)"
                    />
                    {showComparison && (
                      <Area
                        type="monotone"
                        dataKey="fdBalance"
                        name={t.legendFd}
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fillOpacity={0}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="totalInvested"
                      name={t.legendInvested}
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#sipInvestedGrad)"
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
                    <th className="py-3 px-4">{t.colSip}</th>
                    <th className="py-3 px-4">{t.colInvested}</th>
                    <th className="py-3 px-4">{t.colProfit}</th>
                    <th className="py-3 px-4 text-right">{t.colTotal}</th>
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
                      <td className="py-2.5 px-4 text-indigo-600 dark:text-indigo-400 font-semibold">
                        {formatINR(row.monthlySip)}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                        {formatINR(row.totalInvested)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        +{formatINR(row.wealthGained)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                        {formatINR(row.endBalance)}
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

export default SipCalculator;