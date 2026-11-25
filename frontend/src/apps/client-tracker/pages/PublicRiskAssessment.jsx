import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Check,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { useApi } from "../../../shared/hooks/useApi";
import Logo from "../../../assets/logo_nobrand.png";
import { RISK_QUESTIONS } from "../components/Tools/riskProfiler/riskQuestions";
import { calculateRiskAssessment } from "../components/Tools/riskProfiler/riskScoringEngine";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "gu", label: "ગુજરાતી" }
];

const PUBLIC_LABELS = {
  en: {
    subtitle: "AMFI Registered Mutual Fund Distributor • Client Risk Assessment",
    greeting: "Prepared for",
    instructions: "Please answer the 10 brief questions below so we can align your portfolio with your financial goals and comfort level.",
    completedCount: "Questions Answered",
    submitBtn: "Submit Risk Assessment",
    submittingBtn: "Submitting...",
    thankYouTitle: "Assessment Submitted Successfully",
    thankYouSub: "Thank you! Your responses have been securely recorded with Dalal Investments.",
    assignedProfile: "Your Assessed Risk Profile",
    allocationTitle: "Indicative Model Asset Allocation",
    disclaimer: "Mutual Fund investments are subject to market risks. This assessment serves as a suitability guide under AMFI/SEBI best practices."
  },
  hi: {
    subtitle: "AMFI पंजीकृत म्यूचुअल फंड वितरक • निवेशक जोखिम मूल्यांकन",
    greeting: "निवेशक",
    instructions: "कृपया नीचे दिए गए 10 संक्षिप्त प्रश्नों के उत्तर दें ताकि हम आपके पोर्टफोलियो को आपके लक्ष्यों के अनुरूप बना सकें।",
    completedCount: "उत्तर दिए गए प्रश्न",
    submitBtn: "जोखिम मूल्यांकन सबमिट करें",
    submittingBtn: "सबमिट हो रहा है...",
    thankYouTitle: "मूल्यांकन सफलतापूर्वक सबमिट हो गया",
    thankYouSub: "धन्यवाद! आपके उत्तर दलाल इन्वेस्टमेंट्स के पास सुरक्षित रूप से दर्ज कर लिए गए हैं।",
    assignedProfile: "आपकी निर्धारित जोखिम प्रोफ़ाइल",
    allocationTitle: "अनुमानित मॉडल परिसंपत्ति आवंटन",
    disclaimer: "म्यूचुअल फंड निवेश बाजार जोखिमों के अधीन हैं। यह मूल्यांकन AMFI/SEBI दिशानिर्देशों के तहत उपयुक्तता मार्गदर्शिका है।"
  },
  gu: {
    subtitle: "AMFI રજિસ્ટર્ડ મ્યુચ્યુઅલ ફંડ ડિસ્ટ્રિબ્યુટર • રોકાણકાર જોખમ મૂલ્યાંકન",
    greeting: "રોકાણકાર",
    instructions: "કૃપા કરીને નીચેના 10 સંક્ષિપ્ત પ્રશ્નોના જવાબ આપો જેથી અમે તમારા પોર્ટફોલિયોને તમારા લક્ષ્યો અનુસાર બનાવી શકીએ.",
    completedCount: "જવાબ આપેલ પ્રશ્નો",
    submitBtn: "જોખમ મૂલ્યાંકન સબમિટ કરો",
    submittingBtn: "સબમિટ થઈ રહ્યું છે...",
    thankYouTitle: "મૂલ્યાંકન સફળતાપૂર્વક સબમિટ થયું",
    thankYouSub: "આભાર! તમારા જવાબો દલાલ ઇન્વેસ્ટમેન્ટ્સ પાસે સુરક્ષિત રીતે નોંધાઈ ગયા છે.",
    assignedProfile: "તમારી નિર્ધારિત જોખમ પ્રોફાઇલ",
    allocationTitle: "અંદાજિત મોડેલ એસેટ એલોકેશન",
    disclaimer: "મ્યુચ્યુઅલ ફંડ રોકાણો બજારના જોખમોને આધીન છે. આ મૂલ્યાંકન AMFI/SEBI માર્ગદર્શિકા હેઠળ યોગ્યતા માર્ગદર્શિકા છે."
  }
};

const PublicRiskAssessment = () => {
  const { token } = useParams();
  const { request } = useApi();

  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState("");
  const [inviteData, setInviteData] = useState(null);

  const [lang, setLang] = useState("en");
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  const labels = PUBLIC_LABELS[lang] || PUBLIC_LABELS.en;

  useEffect(() => {
    let isMounted = true;
    const fetchInvite = async () => {
      try {
        const res = await request(`/risk-invites/public/${token}`, "GET");
        if (isMounted && res?.success) {
          setInviteData(res.data);
          if (res.data.lang) setLang(res.data.lang);
          if (res.data.status === "completed" && res.data.resultSnapshot) {
            setSubmittedResult(res.data.resultSnapshot);
            if (res.data.resultSnapshot.answers) {
              setAnswers(res.data.resultSnapshot.answers);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setInviteError(err.message || "Unable to load assessment form.");
        }
      } finally {
        if (isMounted) setLoadingInvite(false);
      }
    };
    fetchInvite();
    return () => {
      isMounted = false;
    };
  }, [token, request]);

  const assessment = useMemo(
    () => calculateRiskAssessment(answers, lang),
    [answers, lang]
  );

  const handleSelectOption = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!assessment.isComplete) {
      const rem = assessment.totalQuestions - assessment.answeredCount;
      toast.error(`Please answer ${rem} remaining question${rem > 1 ? "s" : ""}.`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        riskProfile: assessment.tier.baseRiskProfile,
        riskTier: assessment.tier.key,
        riskScore: assessment.compositeScore,
        capacityScore: assessment.capacityScore,
        toleranceScore: assessment.toleranceScore,
        overrideApplied: assessment.overrideApplied,
        overrideReason: assessment.overrideReason,
        answers
      };

      const res = await request(
        `/risk-invites/public/${token}/submit`,
        "POST",
        payload
      );

      if (res?.success) {
        setSubmittedResult(res.data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInvite) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-slate-900 animate-spin mb-3" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Loading Assessment...
        </p>
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-6 text-center space-y-3 shadow-xs">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h2 className="text-base font-extrabold text-slate-900">Link Unavailable</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{inviteError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Brand Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Dalal Investments" className="h-9 w-auto object-contain" />
            <div>
              <h1 className="text-base sm:text-lg font-serif font-bold tracking-tight leading-none">
                Dalal Investments
              </h1>
              <p className="text-[11px] text-slate-400 mt-1">{labels.subtitle}</p>
            </div>
          </div>

          <div className="inline-flex items-center self-start sm:self-auto rounded-md bg-slate-800 p-0.5 border border-slate-700">
            {LANGUAGES.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setLang(item.code)}
                className={`px-3 py-1 rounded-sm text-xs font-bold transition-colors cursor-pointer ${
                  lang === item.code
                    ? "bg-white text-slate-900"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* SUBMITTED CONFIRMATION VIEW */}
        {submittedResult ? (
          <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-start gap-3.5 pb-5 border-b border-slate-200">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {labels.thankYouTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {labels.thankYouSub}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  {labels.assignedProfile}
                </span>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-xl font-extrabold text-slate-900">
                    {assessment.tier.title[lang] || assessment.tier.title.en}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {assessment.tier.summary[lang] || assessment.tier.summary.en}
                </p>
              </div>

              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  {labels.allocationTitle}
                </span>
                <div className="space-y-2">
                  {assessment.tier.allocation.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-semibold text-slate-700">
                        <span
                          className="w-2.5 h-2.5 rounded-xs"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name[lang] || item.name.en}
                      </span>
                      <span className="font-mono font-extrabold text-slate-900">
                        {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 pt-4 border-t border-slate-100 leading-relaxed">
              {labels.disclaimer}
            </p>
          </div>
        ) : (
          /* QUESTIONNAIRE VIEW */
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            {/* Investor Banner */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 block">
                  {labels.greeting}
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold mt-0.5">
                  {inviteData?.investorName}
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  {labels.instructions}
                </p>
              </div>

              <div className="px-3 py-1.5 rounded bg-white/10 text-xs font-mono font-bold shrink-0 self-start sm:self-center">
                {assessment.answeredCount}/{assessment.totalQuestions} {labels.completedCount}
              </div>
            </div>

            {/* 10 Questions */}
            <div className="divide-y divide-slate-200 px-5 sm:px-6">
              {RISK_QUESTIONS.map((q) => {
                const selectedVal = answers[q.id];
                return (
                  <div key={q.id} className="py-5 sm:py-6">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-3.5 leading-snug">
                      {q.text[lang] || q.text.en}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {q.options.map((opt) => {
                        const isSelected = selectedVal === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelectOption(q.id, opt.value)}
                            className={`w-full text-left px-3.5 py-2.5 rounded-md border text-xs flex items-start justify-between gap-3 transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-slate-900 border-slate-900 text-white font-semibold"
                                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium"
                            }`}
                          >
                            <span className="leading-relaxed">
                              {opt.label[lang] || opt.label.en}
                            </span>
                            <span
                              className={`w-4 h-4 rounded-xs flex items-center justify-center shrink-0 mt-0.5 border ${
                                isSelected
                                  ? "border-white bg-white text-slate-900"
                                  : "border-slate-300"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit Footer */}
            <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs font-medium text-slate-600">
                {assessment.answeredCount} of {assessment.totalQuestions} questions completed
              </span>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !assessment.isComplete}
                className="w-full sm:w-auto px-6 py-3 rounded-md text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {submitting ? labels.submittingBtn : labels.submitBtn}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicRiskAssessment;