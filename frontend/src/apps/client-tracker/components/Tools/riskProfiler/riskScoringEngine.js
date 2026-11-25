import { RISK_QUESTIONS, RISK_TIERS } from "./riskQuestions";

/**
 * Evaluates investor answers across two SEBI dimensions (total weight = 100):
 * 1. Risk Capacity (60 pts max -> normalized to 100%)
 * 2. Risk Tolerance (40 pts max -> normalized to 100%)
 * Applies regulatory safety guardrails when short horizons, missing emergency funds,
 * or over-concentration in liquid net worth conflict with high risk appetite.
 */
export function calculateRiskAssessment(answers = {}, lang = "en") {
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = RISK_QUESTIONS.length;
  const isComplete = answeredCount === totalQuestions;

  let capacityRaw = 0;
  let capacityMax = 0;
  let toleranceRaw = 0;
  let toleranceMax = 0;

  RISK_QUESTIONS.forEach((q) => {
    const selectedVal = answers[q.id];
    const matchedOpt = q.options.find((o) => o.value === selectedVal);
    const pts = matchedOpt ? matchedOpt.points : 0;

    if (q.dimension === "capacity") {
      capacityRaw += pts;
      capacityMax += q.weight;
    } else {
      toleranceRaw += pts;
      toleranceMax += q.weight;
    }
  });

  const totalRaw = capacityRaw + toleranceRaw; // out of 100
  const capacityScore = capacityMax > 0 ? Math.round((capacityRaw / capacityMax) * 100) : 0;
  const toleranceScore = toleranceMax > 0 ? Math.round((toleranceRaw / toleranceMax) * 100) : 0;

  // Determine raw tier before safety guardrails
  let rawTierKey = "Conservative";
  if (totalRaw >= 84) rawTierKey = "Aggressive";
  else if (totalRaw >= 67) rawTierKey = "Growth";
  else if (totalRaw >= 49) rawTierKey = "Moderate";
  else if (totalRaw >= 31) rawTierKey = "Moderately Conservative";

  // SEBI Suitability Guardrail Overrides
  let finalTierKey = rawTierKey;
  let overrideApplied = false;
  let overrideReason = "";

  const horizon = answers.horizon;
  const emergencyFund = answers.emergencyFund;
  const liquidityRatio = answers.liquidityRatio;
  const drawdownReaction = answers.drawdownReaction;

  const overrideMessages = {
    horizonUnder1Yr: {
      en: "Horizon is under 1 year: Capped at Conservative to protect principal from short-term equity volatility.",
      hi: "निवेश अवधि 1 वर्ष से कम है: अल्पकालिक अस्थिरता से मूलधन की सुरक्षा के लिए कंजर्वेटिव तक सीमित।",
      gu: "રોકાણ સમયગાળો 1 વર્ષથી ઓછો છે: ટૂંકા ગાળાની વધઘટ સામે મૂડી બચાવવા કન્ઝર્વેટિવ સુધી મર્યાદિત."
    },
    horizon1To3Yrs: {
      en: "Horizon is 1–3 years: Capped at Moderately Conservative as pure equity requires 5+ years.",
      hi: "निवेश अवधि 1-3 वर्ष है: शुद्ध इक्विटी के लिए 5+ वर्ष आवश्यक होने के कारण मध्यम रूढ़िवादी तक सीमित।",
      gu: "રોકાણ સમયગાળો 1-3 વર્ષ છે: શુદ્ધ ઇક્વિટી માટે 5+ વર્ષ જરૂરી હોવાથી મધ્યમ સુરક્ષિત સુધી મર્યાદિત."
    },
    noEmergencyFund: {
      en: "Emergency fund is under 2 months: Capped at Moderate until at least 6 months of liquid reserves are built.",
      hi: "आपातकालीन निधि 2 महीने से कम है: 6 महीने का लिक्विड फंड बनने तक मॉडरेट तक सीमित।",
      gu: "કટોકટી ભંડોળ 2 મહિનાથી ઓછું છે: 6 મહિનાનું લિક્વિડ ફંડ બને ત્યાં સુધી મોડરેટ સુધી મર્યાદિત."
    },
    highConcentration: {
      en: "Deploying >75% of total liquid net worth: Capped at Moderate to avoid over-concentration risk.",
      hi: "कुल तरल संपत्ति का 75% से अधिक निवेश: अत्यधिक जोखिम से बचने के लिए मॉडरेट तक सीमित।",
      gu: "કુલ લિક્વિડ નેટવર્થના 75% થી વધુ રોકાણ: વધુ પડતા જોખમથી બચવા મોડરેટ સુધી મર્યાદિત."
    },
    panicSeller: {
      en: "Selected 'Redeem everything' on a 20% dip: Capped at Moderately Conservative to prevent panic-selling losses.",
      hi: "20% गिरावट पर 'सब बेचने' का विकल्प चुना गया: घबराहट में बिक्री से बचाने के लिए मध्यम रूढ़िवादी तक सीमित।",
      gu: "20% ઘટાડા પર 'બધું વેચવાનો' વિકલ્પ પસંદ કર્યો: ગભરાટમાં વેચાણ અટકાવવા મધ્યમ સુરક્ષિત સુધી મર્યાદિત."
    }
  };

  if (horizon === "<1y" && finalTierKey !== "Conservative") {
    finalTierKey = "Conservative";
    overrideApplied = true;
    overrideReason = overrideMessages.horizonUnder1Yr[lang] || overrideMessages.horizonUnder1Yr.en;
  } else if (
    horizon === "1-3y" &&
    ["Moderate", "Growth", "Aggressive"].includes(finalTierKey)
  ) {
    finalTierKey = "Moderately Conservative";
    overrideApplied = true;
    overrideReason = overrideMessages.horizon1To3Yrs[lang] || overrideMessages.horizon1To3Yrs.en;
  } else if (
    emergencyFund === "none" &&
    ["Growth", "Aggressive"].includes(finalTierKey)
  ) {
    finalTierKey = "Moderate";
    overrideApplied = true;
    overrideReason = overrideMessages.noEmergencyFund[lang] || overrideMessages.noEmergencyFund.en;
  } else if (
    liquidityRatio === ">75%" &&
    ["Growth", "Aggressive"].includes(finalTierKey)
  ) {
    finalTierKey = "Moderate";
    overrideApplied = true;
    overrideReason = overrideMessages.highConcentration[lang] || overrideMessages.highConcentration.en;
  } else if (
    drawdownReaction === "sellAll" &&
    ["Moderate", "Growth", "Aggressive"].includes(finalTierKey)
  ) {
    finalTierKey = "Moderately Conservative";
    overrideApplied = true;
    overrideReason = overrideMessages.panicSeller[lang] || overrideMessages.panicSeller.en;
  }

  const tier = RISK_TIERS[finalTierKey];

  return {
    answeredCount,
    totalQuestions,
    isComplete,
    compositeScore: totalRaw,
    capacityScore,
    toleranceScore,
    tier,
    overrideApplied,
    overrideReason
  };
}