export const RISK_QUESTIONS = [
  {
    id: "ageBracket",
    dimension: "capacity",
    weight: 8,
    text: {
      en: "1. What is the investor's current age bracket?",
      hi: "1. निवेशक की वर्तमान आयु वर्ग क्या है?",
      gu: "1. રોકાણકારનું વર્તમાન વય જૂથ શું છે?"
    },
    options: [
      {
        value: "60+",
        points: 2,
        label: {
          en: "60 years or above (Retired / Nearing Retirement)",
          hi: "60 वर्ष या उससे अधिक (सेवानिवृत्त / सेवानिवृत्ति के करीब)",
          gu: "60 વર્ષ કે તેથી વધુ (નિવૃત્ત / નિવૃત્તિની નજીક)"
        }
      },
      {
        value: "46-59",
        points: 4,
        label: {
          en: "46 to 59 years (Peak Earning / Pre-Retirement)",
          hi: "46 से 59 वर्ष (उच्च आय / सेवानिवृत्ति पूर्व)",
          gu: "46 થી 59 વર્ષ (ઉચ્ચ આવક / નિવૃત્તિ પૂર્વે)"
        }
      },
      {
        value: "31-45",
        points: 6,
        label: {
          en: "31 to 45 years (Mid-Career Wealth Accumulation)",
          hi: "31 से 45 वर्ष (करियर के मध्य में संपत्ति निर्माण)",
          gu: "31 થી 45 વર્ષ (કારકિર્દીના મધ્યમાં સંપત્તિ સર્જન)"
        }
      },
      {
        value: "18-30",
        points: 8,
        label: {
          en: "18 to 30 years (Early Career / Long Earning Runway)",
          hi: "18 से 30 वर्ष (करियर की शुरुआत / लंबा समय)",
          gu: "18 થી 30 વર્ષ (કારકિર્દીની શરૂઆત / લાંબો સમયગાળો)"
        }
      }
    ]
  },
  {
    id: "horizon",
    dimension: "capacity",
    weight: 14,
    text: {
      en: "2. What is the primary investment time horizon for this goal?",
      hi: "2. इस लक्ष्य के लिए प्राथमिक निवेश समय सीमा क्या है?",
      gu: "2. આ ધ્યેય માટે પ્રાથમિક રોકાણ સમયગાળો શું છે?"
    },
    options: [
      {
        value: "<1y",
        points: 2,
        label: {
          en: "Less than 1 year (Immediate / Short-term liquidity)",
          hi: "1 वर्ष से कम (तत्काल / अल्पकालिक तरलता)",
          gu: "1 વર્ષથી ઓછો (તાત્કાલિક / ટૂંકા ગાળાની જરૂરિયાત)"
        }
      },
      {
        value: "1-3y",
        points: 5,
        label: {
          en: "1 to 3 years (Near-term milestone)",
          hi: "1 से 3 वर्ष (निकट अवधि का लक्ष्य)",
          gu: "1 થી 3 વર્ષ (નજીકના ગાળાનું લક્ષ્ય)"
        }
      },
      {
        value: "3-5y",
        points: 9,
        label: {
          en: "3 to 5 years (Medium-term wealth building)",
          hi: "3 से 5 वर्ष (मध्यम अवधि का संपत्ति निर्माण)",
          gu: "3 થી 5 વર્ષ (મધ્યમ ગાળાનું સંપત્તિ નિર્માણ)"
        }
      },
      {
        value: "5-10y",
        points: 12,
        label: {
          en: "5 to 10 years (Long-term compounding)",
          hi: "5 से 10 वर्ष (दीर्घकालिक कंपाउंडिंग)",
          gu: "5 થી 10 વર્ષ (લાંબા ગાળાનું કમ્પાઉન્ડિંગ)"
        }
      },
      {
        value: "10y+",
        points: 14,
        label: {
          en: "More than 10 years (Retirement / Generational wealth)",
          hi: "10 वर्ष से अधिक (सेवानिवृत्ति / दीर्घकालिक संपत्ति)",
          gu: "10 વર્ષથી વધુ (નિવૃત્તિ / લાંબા ગાળાની સંપત્તિ)"
        }
      }
    ]
  },
  {
    id: "incomeStability",
    dimension: "capacity",
    weight: 10,
    text: {
      en: "3. How stable and predictable is the primary household income?",
      hi: "3. परिवार की प्राथमिक आय कितनी स्थिर और नियमित है?",
      gu: "3. પરિવારની પ્રાથમિક આવક કેટલી સ્થિર અને નિયમિત છે?"
    },
    options: [
      {
        value: "irregular",
        points: 2,
        label: {
          en: "Irregular / Dependent on pension or investment payouts",
          hi: "अनियमित / पेंशन या निवेश रिटर्न पर निर्भर",
          gu: "અનિયમિત / પેન્શન અથવા રોકાણની આવક પર નિર્ભર"
        }
      },
      {
        value: "cyclical",
        points: 5,
        label: {
          en: "Variable / Cyclical business or commission income",
          hi: "परिवर्तनशील / चक्रीय व्यवसाय या कमीशन आय",
          gu: "વધઘટ થતી / ચક્રીય વ્યવસાય અથવા કમિશન આવક"
        }
      },
      {
        value: "steady",
        points: 8,
        label: {
          en: "Steady salaried or established professional income",
          hi: "स्थिर वेतनभोगी या स्थापित पेशेवर आय",
          gu: "સ્થિર પગારદાર અથવા સ્થાપિત વ્યવસાયિક આવક"
        }
      },
      {
        value: "dualStrong",
        points: 10,
        label: {
          en: "Dual-income household or high-surplus established business",
          hi: "दोहरी आय वाला परिवार या उच्च अधिशेष व्यवसाय",
          gu: "બેવડી આવક ધરાવતો પરિવાર અથવા ઉચ્ચ નફાકારક વ્યવસાય"
        }
      }
    ]
  },
  {
    id: "dependents",
    dimension: "capacity",
    weight: 8,
    text: {
      en: "4. How many family members are financially dependent on the investor's income?",
      hi: "4. निवेशक की आय पर आर्थिक रूप से कितने परिवार के सदस्य निर्भर हैं?",
      gu: "4. રોકાણકારની આવક પર પરિવારના કેટલા સભ્યો આર્થિક રીતે નિર્ભર છે?"
    },
    options: [
      {
        value: "4+",
        points: 2,
        label: {
          en: "4 or more dependents (Children, spouse & retired parents)",
          hi: "4 या अधिक आश्रित (बच्चे, जीवनसाथी और सेवानिवृत्त माता-पिता)",
          gu: "4 કે તેથી વધુ આશ્રિતો (બાળકો, જીવનસાથી અને નિવૃત્ત માતા-પિતા)"
        }
      },
      {
        value: "2-3",
        points: 4,
        label: {
          en: "2 to 3 dependents (Standard nuclear family obligations)",
          hi: "2 से 3 आश्रित (सामान्य परिवार की जिम्मेदारियां)",
          gu: "2 થી 3 આશ્રિતો (સામાન્ય પરિવારની જવાબદારીઓ)"
        }
      },
      {
        value: "1",
        points: 6,
        label: {
          en: "1 dependent (Spouse or single parent)",
          hi: "1 आश्रित (जीवनसाथी या माता-पिता)",
          gu: "1 આશ્રિત (જીવનસાથી અથવા માતા-પિતા)"
        }
      },
      {
        value: "0",
        points: 8,
        label: {
          en: "None — Financially independent household / earning spouse",
          hi: "कोई नहीं — आर्थिक रूप से स्वतंत्र परिवार / कमाऊ जीवनसाथी",
          gu: "કોઈ નહીં — આર્થિક રીતે સ્વતંત્ર પરિવાર / કમાતા જીવનસાથી"
        }
      }
    ]
  },
  {
    id: "emergencyFund",
    dimension: "capacity",
    weight: 10,
    text: {
      en: "5. How many months of household expenses are kept in liquid emergency reserves?",
      hi: "5. आपातकालीन निधि में कितने महीनों का घरेलू खर्च सुरक्षित रखा गया है?",
      gu: "5. કટોકટી ભંડોળમાં કેટલા મહિનાનો ઘરખર્ચ સુરક્ષિત રાખવામાં આવ્યો છે?"
    },
    options: [
      {
        value: "none",
        points: 2,
        label: {
          en: "Less than 2 months (No dedicated emergency corpus)",
          hi: "2 महीने से कम (कोई समर्पित आपातकालीन कोष नहीं)",
          gu: "2 મહિનાથી ઓછો (કોઈ અલગ કટોકટી ભંડોળ નથી)"
        }
      },
      {
        value: "3-5m",
        points: 5,
        label: {
          en: "3 to 5 months of essential living expenses",
          hi: "3 से 5 महीने का आवश्यक जीवन यापन खर्च",
          gu: "3 થી 5 મહિનાનો આવશ્યક જીવનનિર્વાહ ખર્ચ"
        }
      },
      {
        value: "6-12m",
        points: 8,
        label: {
          en: "6 to 12 months in Savings / Liquid / Arbitrage funds",
          hi: "बचत / लिक्विड / आर्बिट्राज फंड में 6 से 12 महीने",
          gu: "બચત / લિક્વિડ / આર્બિટ્રેજ ફંડમાં 6 થી 12 મહિના"
        }
      },
      {
        value: "12m+",
        points: 10,
        label: {
          en: "More than 12 months fully covered + adequate health/term insurance",
          hi: "12 महीने से अधिक पूर्ण सुरक्षा + पर्याप्त स्वास्थ्य/टर्म बीमा",
          gu: "12 મહિનાથી વધુ સંપૂર્ણ સુરક્ષા + પૂરતો હેલ્થ/ટર્મ વીમો"
        }
      }
    ]
  },
  {
    id: "liquidityRatio",
    dimension: "capacity",
    weight: 10,
    text: {
      en: "6. What share of the investor's total liquid net worth does this proposed investment represent?",
      hi: "6. यह प्रस्तावित निवेश निवेशक की कुल तरल संपत्ति का कितना हिस्सा है?",
      gu: "6. આ સૂચિત રોકાણ રોકાણકારની કુલ લિક્વિડ નેટવર્થનો કેટલો હિસ્સો છે?"
    },
    options: [
      {
        value: ">75%",
        points: 2,
        label: {
          en: "More than 75% (Almost entire life savings being deployed)",
          hi: "75% से अधिक (लगभग पूरी जीवन भर की बचत)",
          gu: "75% થી વધુ (લગભગ જીવનભરની સમગ્ર બચત)"
        }
      },
      {
        value: "50-75%",
        points: 5,
        label: {
          en: "50% to 75% (Major portion of financial assets)",
          hi: "50% से 75% (वित्तीय संपत्ति का बड़ा हिस्सा)",
          gu: "50% થી 75% (નાણાકીય સંપત્તિનો મોટો હિસ્સો)"
        }
      },
      {
        value: "25-50%",
        points: 8,
        label: {
          en: "25% to 50% (Balanced portion alongside other safe assets)",
          hi: "25% से 50% (अन्य सुरक्षित संपत्तियों के साथ संतुलित हिस्सा)",
          gu: "25% થી 50% (અન્ય સુરક્ષિત મિલકતો સાથે સંતુલિત હિસ્સો)"
        }
      },
      {
        value: "<25%",
        points: 10,
        label: {
          en: "Under 25% (Surplus capital backed by substantial FDs / Real Estate / Gold)",
          hi: "25% से कम (एफडी / रियल एस्टेट / सोने से समर्थित अतिरिक्त पूंजी)",
          gu: "25% થી ઓછું (FD / રિયલ એસ્ટેટ / સોનાથી સુરક્ષિત વધારાની મૂડી)"
        }
      }
    ]
  },
  {
    id: "debtBurden",
    dimension: "tolerance",
    weight: 8,
    text: {
      en: "7. What percentage of monthly income goes toward loan EMIs & fixed obligations?",
      hi: "7. मासिक आय का कितना प्रतिशत ऋण ईएमआई और निश्चित देनदारियों में जाता है?",
      gu: "7. માસિક આવકના કેટલા ટકા લોનના EMI અને નિશ્ચિત જવાબદારીઓમાં જાય છે?"
    },
    options: [
      {
        value: ">45%",
        points: 2,
        label: {
          en: "Above 45% (High debt servicing commitment)",
          hi: "45% से अधिक (उच्च ऋण भुगतान प्रतिबद्धता)",
          gu: "45% થી વધુ (ઉચ્ચ લોન ચૂકવણી જવાબદારી)"
        }
      },
      {
        value: "25-45%",
        points: 4,
        label: {
          en: "25% to 45% (Moderate home/business EMI load)",
          hi: "25% से 45% (मध्यम होम/बिजनेस ईएमआई भार)",
          gu: "25% થી 45% (મધ્યમ હોમ/બિઝનેસ EMI ભાર)"
        }
      },
      {
        value: "10-25%",
        points: 6,
        label: {
          en: "10% to 25% (Comfortable surplus after obligations)",
          hi: "10% से 25% (देनदारियों के बाद आरामदायक बचत)",
          gu: "10% થી 25% (જવાબદારીઓ પછી આરામદાયક બચત)"
        }
      },
      {
        value: "<10%",
        points: 8,
        label: {
          en: "Below 10% or Debt-Free (High investable surplus)",
          hi: "10% से कम या ऋण-मुक्त (उच्च निवेश योग्य अधिशेष)",
          gu: "10% થી ઓછું અથવા દેવામુક્ત (ઉચ્ચ રોકાણપાત્ર બચત)"
        }
      }
    ]
  },
  {
    id: "experience",
    dimension: "tolerance",
    weight: 10,
    text: {
      en: "8. What is the investor's prior experience with market-linked investments?",
      hi: "8. बाजार से जुड़े निवेशों में निवेशक का पिछला अनुभव क्या है?",
      gu: "8. બજાર સાથે જોડાયેલા રોકાણોમાં રોકાણકારનો અગાઉનો અનુભવ શું છે?"
    },
    options: [
      {
        value: "none",
        points: 2,
        label: {
          en: "None — Only Bank FDs, Post Office, or Physical Gold",
          hi: "कोई नहीं — केवल बैंक एफडी, डाकघर या सोना",
          gu: "કંઈ નહીં — માત્ર બેંક FD, પોસ્ટ ઓફિસ અથવા સોનું"
        }
      },
      {
        value: "beginner",
        points: 5,
        label: {
          en: "Beginner — Started Debt/Hybrid Mutual Funds recently (< 2 years)",
          hi: "शुरुआती — हाल ही में डेट/हाइब्रिड म्यूचुअल फंड शुरू किया (< 2 वर्ष)",
          gu: "શરૂઆતી — તાજેતરમાં ડેટ/હાઇબ્રિડ મ્યુચ્યુઅલ ફંડ શરૂ કર્યું (< 2 વર્ષ)"
        }
      },
      {
        value: "experienced",
        points: 8,
        label: {
          en: "Experienced — Invested in Equity Mutual Funds/SIPs for 3+ years",
          hi: "अनुभवी — 3+ वर्षों से इक्विटी म्यूचुअल फंड/एसआईपी में निवेशित",
          gu: "અનુભવી — 3+ વર્ષથી ઇક્વિટી મ્યુચ્યુઅલ ફંડ/SIP માં રોકાણ"
        }
      },
      {
        value: "seasoned",
        points: 10,
        label: {
          en: "Seasoned — Navigated full market cycles across Equity MFs & Direct Stocks",
          hi: "अनुभवी विशेषज्ञ — इक्विटी एमएफ और शेयरों में पूर्ण बाजार चक्र देखा है",
          gu: "નિષ્ણાત — ઇક્વિટી MF અને શેરબજારના સંપૂર્ણ ચક્રનો અનુભવ"
        }
      }
    ]
  },
  {
    id: "objective",
    dimension: "tolerance",
    weight: 10,
    text: {
      en: "9. Which portfolio return vs. stability profile best fits the investor's goal?",
      hi: "9. कौन सा पोर्टफोलियो रिटर्न बनाम स्थिरता प्रोफ़ाइल निवेशक के लक्ष्य के अनुकूल है?",
      gu: "9. કયો પોર્ટફોલિયો વળતર વિરુદ્ધ સ્થિરતા પ્રોફાઇલ રોકાણકારના ધ્યેયને અનુરૂપ છે?"
    },
    options: [
      {
        value: "preservation",
        points: 2,
        label: {
          en: "Capital Protection — Cannot tolerate any principal dip even temporarily",
          hi: "पूंजी सुरक्षा — अस्थायी रूप से भी मूलधन में गिरावट बर्दाश्त नहीं",
          gu: "મૂડી સુરક્ષા — અસ્થાયી રૂપે પણ મુદ્દલમાં ઘટાડો સહન કરી શકાય તેમ નથી"
        }
      },
      {
        value: "income",
        points: 5,
        label: {
          en: "Steady Income & Inflation Hedge — Low volatility with modest growth",
          hi: "स्थिर आय और मुद्रास्फीति सुरक्षा — मामूली वृद्धि के साथ कम उतार-चढ़ाव",
          gu: "સ્થિર આવક અને મોંઘવારી સામે રક્ષણ — ઓછી વધઘટ સાથે સાધારણ વૃદ્ધિ"
        }
      },
      {
        value: "balanced",
        points: 8,
        label: {
          en: "Balanced Growth — Willing to accept moderate swings to beat inflation",
          hi: "संतुलित विकास — मुद्रास्फीति को मात देने के लिए मध्यम उतार-चढ़ाव स्वीकार्य",
          gu: "સંતુલિત વૃદ્ધિ — મોંઘવારીને હરાવવા મધ્યમ વધઘટ સ્વીકાર્ય"
        }
      },
      {
        value: "wealth",
        points: 10,
        label: {
          en: "Aggressive Wealth Creation — Maximizing long-term alpha despite volatility",
          hi: "आक्रामक संपत्ति निर्माण — उतार-चढ़ाव के बावजूद दीर्घकालिक रिटर्न अधिकतम करना",
          gu: "આક્રમક સંપત્તિ સર્જન — વધઘટ છતાં લાંબા ગાળાનું મહત્તમ વળતર"
        }
      }
    ]
  },
  {
    id: "drawdownReaction",
    dimension: "tolerance",
    weight: 12,
    text: {
      en: "10. If a ₹10,00,000 portfolio temporarily drops to ₹8,00,000 (-20%) during a market correction, how would the investor react?",
      hi: "10. यदि बाजार में गिरावट के दौरान ₹10,00,000 का पोर्टफोलियो अस्थायी रूप से ₹8,00,000 (-20%) हो जाए, तो निवेशक की प्रतिक्रिया क्या होगी?",
      gu: "10. જો બજારના ઘટાડા દરમિયાન ₹10,00,000 નો પોર્ટફોલિયો અસ્થાયી રૂપે ₹8,00,000 (-20%) થઈ જાય, તો રોકાણકારની પ્રતિક્રિયા શું હશે?"
    },
    options: [
      {
        value: "sellAll",
        points: 2,
        label: {
          en: "Redeem everything immediately to prevent any further loss",
          hi: "आगे के नुकसान को रोकने के लिए तुरंत सब कुछ बेच देंगे",
          gu: "વધુ નુકસાન અટકાવવા તાત્કાલિક બધું વેચી દેશે"
        }
      },
      {
        value: "reduce",
        points: 5,
        label: {
          en: "Feel anxious and shift part of the portfolio into Fixed Deposits / Debt",
          hi: "चिंतित होंगे और पोर्टफोलियो का कुछ हिस्सा एफडी/डेट में स्थानांतरित करेंगे",
          gu: "ચિંતિત થશે અને પોર્ટફોલિયોનો અમુક ભાગ FD/ડેટમાં ફેરવશે"
        }
      },
      {
        value: "hold",
        points: 9,
        label: {
          en: "Stay calm, continue existing SIPs, and wait for market recovery",
          hi: "शांत रहेंगे, मौजूदा एसआईपी जारी रखेंगे और रिकवरी की प्रतीक्षा करेंगे",
          gu: "શાંત રહેશે, ચાલુ SIP ચાલુ રાખશે અને બજાર સુધરવાની રાહ જોશે"
        }
      },
      {
        value: "buyMore",
        points: 12,
        label: {
          en: "Treat the correction as an opportunity and deploy extra lumpsum capital",
          hi: "गिरावट को अवसर मानेंगे और अतिरिक्त एकमुश्त पूंजी निवेश करेंगे",
          gu: "ઘટાડાને તક ગણશે અને વધારાની એકસામટી મૂડી રોકાણ કરશે"
        }
      }
    ]
  }
];

export const RISK_TIERS = {
  Conservative: {
    key: "Conservative",
    baseRiskProfile: "Conservative",
    scoreRange: "0 – 30",
    expectedCagr: "6.5% – 7.5%",
    color: "#0284c7",
    accentBorder: "border-l-sky-600",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
    allocation: [
      { name: { en: "Equity", hi: "इक्विटी", gu: "ઇક્વિટી" }, value: 10, color: "#059669" },
      { name: { en: "Debt & Liquid", hi: "डेट और लिक्विड", gu: "ડેટ અને લિક્વિડ" }, value: 75, color: "#0284c7" },
      { name: { en: "Hybrid / Arbitrage", hi: "हाइब्रिड / आर्बिट्राज", gu: "હાઇબ્રિડ / આર્બિટ્રેજ" }, value: 10, color: "#475569" },
      { name: { en: "Gold / Sovereign", hi: "गोल्ड", gu: "ગોલ્ડ" }, value: 5, color: "#d97706" }
    ],
    title: {
      en: "Conservative Investor",
      hi: "रूढ़िवादी (कंजर्वेटिव) निवेशक",
      gu: "સુરક્ષિત (કન્ઝર્વેટિવ) રોકાણકાર"
    },
    summary: {
      en: "Prioritizes capital preservation and high liquidity over market-linked growth. Suited for short time horizons or low volatility tolerance.",
      hi: "बाजार से जुड़ी वृद्धि की तुलना में पूंजी सुरक्षा और उच्च तरलता को प्राथमिकता देता है। कम समय सीमा या कम जोखिम सहनशीलता के लिए उपयुक्त।",
      gu: "બજાર આધારિત વૃદ્ધિ કરતાં મૂડી સુરક્ષા અને ઊંચી તરલતાને પ્રાથમિકતા આપે છે. ટૂંકા સમયગાળા અથવા ઓછી જોખમ ક્ષમતા માટે યોગ્ય."
    },
    suitabilityNote: {
      en: "Recommended categories: Liquid Funds, Ultra-Short / Short Duration Debt, Arbitrage Funds, and Conservative Hybrid Funds.",
      hi: "अनुशंसित श्रेणियां: लिक्विड फंड, शॉर्ट ड्यूरेशन डेट, आर्बिट्राज फंड और कंजर्वेटिव हाइब्रिड फंड।",
      gu: "ભલામણ કરેલ શ્રેણીઓ: લિક્વિડ ફંડ, શોર્ટ ડ્યુરેશન ડેટ, આર્બિટ્રેજ ફંડ અને કન્ઝર્વેટિવ હાઇબ્રિડ ફંડ."
    }
  },
  "Moderately Conservative": {
    key: "Moderately Conservative",
    baseRiskProfile: "Conservative",
    scoreRange: "31 – 48",
    expectedCagr: "8.0% – 9.0%",
    color: "#0891b2",
    accentBorder: "border-l-cyan-600",
    badgeClass: "bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30",
    allocation: [
      { name: { en: "Equity", hi: "इक्विटी", gu: "ઇક્વિટી" }, value: 30, color: "#059669" },
      { name: { en: "Debt & Liquid", hi: "डेट और लिक्विड", gu: "ડેટ અને લિક્વિડ" }, value: 50, color: "#0284c7" },
      { name: { en: "Hybrid / BAF", hi: "हाइब्रिड / बीएएफ", gu: "હાઇબ્રિડ / BAF" }, value: 15, color: "#475569" },
      { name: { en: "Gold", hi: "गोल्ड", gu: "ગોલ્ડ" }, value: 5, color: "#d97706" }
    ],
    title: {
      en: "Moderately Conservative",
      hi: "मध्यम रूढ़िवादी निवेशक",
      gu: "મધ્યમ સુરક્ષિત રોકાણકાર"
    },
    summary: {
      en: "Seeks steady, inflation-beating income with cushioned downside protection through a core debt and hybrid allocation.",
      hi: "मुख्य डेट और हाइब्रिड आवंटन के माध्यम से सुरक्षित डाउनसाइड सुरक्षा के साथ स्थिर, मुद्रास्फीति-रोधी आय चाहता है।",
      gu: "મુખ્ય ડેટ અને હાઇબ્રિડ ફાળવણી દ્વારા સુરક્ષિત રક્ષણ સાથે સ્થિર, મોંઘવારી-વિરોધી આવક ઇચ્છે છે."
    },
    suitabilityNote: {
      en: "Recommended categories: Equity Savings Funds, Balanced Advantage Funds (BAF), Short-Term Debt, and Large-Cap Index exposure.",
      hi: "अनुशंसित श्रेणियां: इक्विटी सेविंग्स फंड, बैलेंस्ड एडवांटेज फंड (BAF), शॉर्ट-टर्म डेट और लार्ज-कैप इंडेक्स।",
      gu: "ભલામણ કરેલ શ્રેણીઓ: ઇક્વિટી સેવિંગ્સ ફંડ, બેલેન્સ્ડ એડવાન્ટેજ ફંડ (BAF), શોર્ટ-ટર્મ ડેટ અને લાર્જ-કેપ ઇન્ડેક્સ."
    }
  },
  Moderate: {
    key: "Moderate",
    baseRiskProfile: "Moderate",
    scoreRange: "49 – 66",
    expectedCagr: "9.5% – 11.0%",
    color: "#0f172a",
    accentBorder: "border-l-slate-800 dark:border-l-sky-400",
    badgeClass: "bg-slate-100 text-slate-900 border-slate-300 dark:bg-white/10 dark:text-white dark:border-white/20",
    allocation: [
      { name: { en: "Equity", hi: "इक्विटी", gu: "ઇક્વિટી" }, value: 50, color: "#059669" },
      { name: { en: "Debt & Liquid", hi: "डेट और लिक्विड", gu: "ડેટ અને લિક્વિડ" }, value: 30, color: "#0284c7" },
      { name: { en: "Hybrid / Multi-Asset", hi: "हाइब्रिड / मल्टी-एसेट", gu: "હાઇબ્રિડ / મલ્ટી-એસેટ" }, value: 15, color: "#475569" },
      { name: { en: "Gold", hi: "गोल्ड", gu: "ગોલ્ડ" }, value: 5, color: "#d97706" }
    ],
    title: {
      en: "Moderate / Balanced",
      hi: "मध्यम / संतुलित (मॉडरेट) निवेशक",
      gu: "મધ્યમ / સંતુલિત (મોડરેટ) રોકાણકાર"
    },
    summary: {
      en: "Balances long-term capital appreciation with portfolio stability. Comfortable with temporary market fluctuations over a 3–5+ year horizon.",
      hi: "पोर्टफोलियो स्थिरता के साथ दीर्घकालिक पूंजी वृद्धि को संतुलित करता है। 3-5+ वर्षों की अवधि में अस्थायी बाजार उतार-चढ़ाव के साथ सहज।",
      gu: "પોર્ટફોલિયો સ્થિરતા સાથે લાંબા ગાળાની મૂડી વૃદ્ધિને સંતુલિત કરે છે. 3-5+ વર્ષના સમયગાળામાં બજારની વધઘટ સાથે સહજ."
    },
    suitabilityNote: {
      en: "Recommended categories: Aggressive Hybrid Funds, Multi-Asset Allocation, Flexi-Cap / Large & Mid-Cap Funds, and Corporate Bond Funds.",
      hi: "अनुशंसित श्रेणियां: एग्रेसिव हाइब्रिड फंड, मल्टी-एसेट एलोकेशन, फ्लेक्सी-कैप और कॉर्पोरेट बॉन्ड फंड।",
      gu: "ભલામણ કરેલ શ્રેણીઓ: એગ્રેસિવ હાઇબ્રિડ ફંડ, મલ્ટી-એસેટ એલોકેશન, ફ્લેક્સી-કેપ અને કોર્પોરેટ બોન્ડ ફંડ."
    }
  },
  Growth: {
    key: "Growth",
    baseRiskProfile: "Aggressive",
    scoreRange: "67 – 83",
    expectedCagr: "11.5% – 13.0%",
    color: "#059669",
    accentBorder: "border-l-emerald-600",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
    allocation: [
      { name: { en: "Equity", hi: "इक्विटी", gu: "ઇક્વિટી" }, value: 70, color: "#059669" },
      { name: { en: "Debt & Liquid", hi: "डेट और लिक्विड", gu: "ડેટ અને લિક્વિડ" }, value: 15, color: "#0284c7" },
      { name: { en: "Hybrid / Multi-Asset", hi: "हाइब्रिड / मल्टी-एसेट", gu: "હાઇબ્રિડ / મલ્ટી-એસેટ" }, value: 10, color: "#475569" },
      { name: { en: "Gold", hi: "गोल्ड", gu: "ગોલ્ડ" }, value: 5, color: "#d97706" }
    ],
    title: {
      en: "Growth (Moderately Aggressive)",
      hi: "ग्रोथ (मध्यम आक्रामक) निवेशक",
      gu: "ગ્રોથ (મધ્યમ આક્રમક) રોકાણકાર"
    },
    summary: {
      en: "Focused on long-term wealth compounding across market cycles, backed by strong financial capacity and emotional discipline during drawdowns.",
      hi: "मजबूत वित्तीय क्षमता और बाजार गिरावट के दौरान धैर्य के साथ दीर्घकालिक संपत्ति निर्माण पर केंद्रित।",
      gu: "મજબૂત નાણાકીય ક્ષમતા અને બજારના ઘટાડા દરમિયાન ધીરજ સાથે લાંબા ગાળાની સંપત્તિ વૃદ્ધિ પર કેન્દ્રિત."
    },
    suitabilityNote: {
      en: "Recommended categories: Flexi-Cap, Large & Mid-Cap, Mid-Cap Funds, and Focused Equity Funds with 15% Debt/Liquid rebalancing buffer.",
      hi: "अनुशंसित श्रेणियां: फ्लेक्सी-कैप, लार्ज एंड मिड-कैप, मिड-कैप फंड और 15% डेट/लिक्विड बफर।",
      gu: "ભલામણ કરેલ શ્રેણીઓ: ફ્લેક્સી-કેપ, લાર્જ એન્ડ મિડ-કેપ, મિડ-કેપ ફંડ અને 15% ડેટ/લિક્વિડ બફર."
    }
  },
  Aggressive: {
    key: "Aggressive",
    baseRiskProfile: "Aggressive",
    scoreRange: "84 – 100",
    expectedCagr: "13.0% – 15.0%+",
    color: "#d97706",
    accentBorder: "border-l-amber-600",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    allocation: [
      { name: { en: "Equity", hi: "इक्विटी", gu: "ઇક્વિટી" }, value: 85, color: "#059669" },
      { name: { en: "Debt & Liquid", hi: "डेट और लिक्विड", gu: "ડેટ અને લિક્વિડ" }, value: 5, color: "#0284c7" },
      { name: { en: "Hybrid / Tactical", hi: "हाइब्रिड / टैक्टिकल", gu: "હાઇબ્રિડ / ટેક્ટિકલ" }, value: 5, color: "#475569" },
      { name: { en: "Gold", hi: "गोल्ड", gu: "ગોલ્ડ" }, value: 5, color: "#d97706" }
    ],
    title: {
      en: "Aggressive Wealth Builder",
      hi: "आक्रामक (एग्रेसिव) संपत्ति निर्माता",
      gu: "આક્રમક (એગ્રેસિવ) સંપત્તિ નિર્માતા"
    },
    summary: {
      en: "High risk capacity and high risk appetite over a 7–10+ year horizon. Designed to capture maximum equity alpha across Large, Mid, and Small Caps.",
      hi: "7-10+ वर्षों की अवधि में उच्च जोखिम क्षमता और उच्च जोखिम भूख। लार्ज, मिड और स्मॉल कैप में अधिकतम इक्विटी रिटर्न के लिए उपयुक्त।",
      gu: "7-10+ વર્ષના સમયગાળામાં ઊંચી જોખમ ક્ષમતા અને ઊંચી જોખમ ભૂખ. લાર્જ, મિડ અને સ્મોલ કેપમાં મહત્તમ ઇક્વિટી વળતર માટે યોગ્ય."
    },
    suitabilityNote: {
      en: "Recommended categories: Flexi-Cap, Mid-Cap, Small-Cap, and Thematic/Sectoral satellite allocations (capped at 15–20%).",
      hi: "अनुशंसित श्रेणियां: फ्लेक्सी-कैप, मिड-कैप, स्मॉल-कैप और थीमैटिक/सेक्टोरल आवंटन (15-20% तक सीमित)।",
      gu: "ભલામણ કરેલ શ્રેણીઓ: ફ્લેક્સી-કેપ, મિડ-કેપ, સ્મોલ-કેપ અને થીમેટિક/સેક્ટોરલ ફાળવણી (15-20% સુધી મર્યાદિત)."
    }
  }
};

export const UI_LABELS = {
  en: {
    step1Label: "Investor Details",
    step2Label: "10-Point Assessment",
    step3Label: "Suitability Report",
    investorFieldLabel: "Client or Prospect Name",
    investorPlaceholder: "Search CRM client by Name / PAN, or type a new investor name...",
    startProfilingBtn: "Start Risk Profiling",
    currentSavedProfile: "Saved CRM Profile",
    questionsAnswered: "Completed",
    resetQuiz: "Clear All",
    backToSetup: "Change Investor",
    viewResultsBtn: "Generate Suitability Report",
    editAnswersBtn: "Modify Answers",
    newAssessmentBtn: "New Assessment",
    capacityLabel: "Risk Capacity",
    toleranceLabel: "Risk Tolerance",
    compositeScore: "Composite Score",
    recommendedSplit: "Model Asset Allocation",
    expectedReturnBand: "Target Return Band",
    suitabilityTitle: "SEBI Product Suitability Guidance",
    guardrailTriggered: "Advisory Guardrail Applied",
    saveToClient: "Update Client Profile in CRM",
    saving: "Updating CRM...",
    savedSuccess: "Client Profile Updated",
    selectClientToSave: "Walk-in Prospect — Select a registered CRM client in Step 1 to sync directly to database",
    shareWhatsapp: "Send via WhatsApp",
    printReport: "Print / Save PDF",
    disclaimer: "Disclaimer: Mutual Fund investments are subject to market risks. This risk profile is generated based on investor disclosures and serves as a suitability guide under AMFI/SEBI best practices."
  },
  hi: {
    step1Label: "निवेशक विवरण",
    step2Label: "10-बिंदु प्रश्नावली",
    step3Label: "उपयुक्तता रिपोर्ट",
    investorFieldLabel: "क्लाइंट या नए निवेशक का नाम",
    investorPlaceholder: "नाम / पैन से CRM क्लाइंट खोजें, या नए निवेशक का नाम लिखें...",
    startProfilingBtn: "जोखिम प्रोफाइलिंग शुरू करें",
    currentSavedProfile: "सहेजी गई प्रोफ़ाइल",
    questionsAnswered: "पूर्ण",
    resetQuiz: "रीसेट करें",
    backToSetup: "निवेशक बदलें",
    viewResultsBtn: "उपयुक्तता रिपोर्ट देखें",
    editAnswersBtn: "उत्तर बदलें",
    newAssessmentBtn: "नया मूल्यांकन",
    capacityLabel: "जोखिम क्षमता",
    toleranceLabel: "जोखिम सहनशीलता",
    compositeScore: "कुल स्कोर",
    recommendedSplit: "मॉडल परिसंपत्ति आवंटन",
    expectedReturnBand: "अनुमानित रिटर्न बैंड",
    suitabilityTitle: "SEBI उत्पाद उपयुक्तता मार्गदर्शन",
    guardrailTriggered: "सलाहकार सुरक्षा नियम लागू",
    saveToClient: "CRM क्लाइंट प्रोफ़ाइल अपडेट करें",
    saving: "अपडेट हो रहा है...",
    savedSuccess: "क्लाइंट प्रोफ़ाइल अपडेट हो गई",
    selectClientToSave: "नए निवेशक की रिपोर्ट — CRM में सहेजने के लिए चरण 1 में पंजीकृत क्लाइंट चुनें",
    shareWhatsapp: "व्हाट्सएप पर भेजें",
    printReport: "प्रिंट / पीडीएफ सहेजें",
    disclaimer: "अस्वीकरण: म्यूचुअल फंड निवेश बाजार जोखिमों के अधीन हैं। यह जोखिम प्रोफ़ाइल निवेशक की जानकारी के आधार पर तैयार की गई है।"
  },
  gu: {
    step1Label: "રોકાણકારની વિગત",
    step2Label: "10-પોઇન્ટ પ્રશ્નાવલી",
    step3Label: "યોગ્યતા રિપોર્ટ",
    investorFieldLabel: "ક્લાયન્ટ અથવા નવા રોકાણકારનું નામ",
    investorPlaceholder: "નામ / PAN થી CRM ક્લાયન્ટ શોધો, અથવા નવા રોકાણકારનું નામ લખો...",
    startProfilingBtn: "જોખમ પ્રોફાઇલિંગ શરૂ કરો",
    currentSavedProfile: "સેવ કરેલ પ્રોફાઇલ",
    questionsAnswered: "પૂર્ણ",
    resetQuiz: "રીસેટ કરો",
    backToSetup: "રોકાણકાર બદલો",
    viewResultsBtn: "યોગ્યતા રિપોર્ટ જુઓ",
    editAnswersBtn: "જવાબો બદલો",
    newAssessmentBtn: "નવું મૂલ્યાંકન",
    capacityLabel: "જોખમ ક્ષમતા",
    toleranceLabel: "જોખમ સહનશીલતા",
    compositeScore: "કુલ સ્કોર",
    recommendedSplit: "મોડેલ એસેટ એલોકેશન",
    expectedReturnBand: "અંદાજિત વળતર બેન્ડ",
    suitabilityTitle: "SEBI પ્રોડક્ટ યોગ્યતા માર્ગદર્શન",
    guardrailTriggered: "સલાહકાર સુરક્ષા નિયમ લાગુ",
    saveToClient: "CRM ક્લાયન્ટ પ્રોફાઇલ અપડેટ કરો",
    saving: "અપડેટ થઈ રહ્યું છે...",
    savedSuccess: "ક્લાયન્ટ પ્રોફાઇલ અપડેટ થઈ ગઈ",
    selectClientToSave: "નવા રોકાણકારનો રિપોર્ટ — CRM માં સેવ કરવા પગલું 1 માં નોંધાયેલ ક્લાયન્ટ પસંદ કરો",
    shareWhatsapp: "વોટ્સએપ પર મોકલો",
    printReport: "પ્રિન્ટ / PDF સેવ કરો",
    disclaimer: "અસ્વીકરણ: મ્યુચ્યુઅલ ફંડ રોકાણો બજારના જોખમોને આધીન છે. આ જોખમ પ્રોફાઇલ રોકાણકારની માહિતીના આધારે તૈયાર કરવામાં આવી છે."
  }
};