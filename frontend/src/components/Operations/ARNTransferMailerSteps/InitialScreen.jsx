import React from "react";
import { Mail, Info, ArrowRight } from "lucide-react";

const InitialScreen = ({ setCurrentStep }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 flex flex-col items-center text-center max-w-5xl mx-auto mt-8 animate-in zoom-in-95 duration-500 w-full">
      <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
        <Mail className="text-emerald-500" size={48} strokeWidth={1.5} />
      </div>
      <h2 className="text-3xl md:text-4xl font-[1000] text-slate-900 uppercase tracking-tight italic mb-4">
        Bulk ARN Transfer Mailer
      </h2>
      <p className="text-slate-600 mb-8 max-w-2xl text-base leading-relaxed">
        This automated system helps you notify your clients regarding the change of distributor code (ARN) for their mutual fund folios. 
        The system complies with the standard 15-day objection period guidelines.
      </p>
      
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 mb-8 w-full max-w-4xl text-left shadow-inner">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Info size={14} /> Process Overview
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <li className="flex items-start gap-4 text-sm text-slate-700 font-medium">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-xs font-black shrink-0 shadow-sm">1</div>
            <span className="mt-1.5">Provide current and new distributor details.</span>
          </li>
          <li className="flex items-start gap-4 text-sm text-slate-700 font-medium">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-xs font-black shrink-0 shadow-sm">2</div>
            <span className="mt-1.5">Select the clients you wish to notify.</span>
          </li>
          <li className="flex items-start gap-4 text-sm text-slate-700 font-medium">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-xs font-black shrink-0 shadow-sm">3</div>
            <span className="mt-1.5">Review the email template and merge variables.</span>
          </li>
          <li className="flex items-start gap-4 text-sm text-slate-700 font-medium">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-xs font-black shrink-0 shadow-sm">4</div>
            <span className="mt-1.5">Dispatch emails and track live delivery status.</span>
          </li>
        </ul>
      </div>

      <button 
        onClick={() => setCurrentStep(1)}
        className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center gap-3"
      >
        Start New Bulk Mailer <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default InitialScreen;