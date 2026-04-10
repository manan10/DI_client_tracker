import React from 'react';
import { History, Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';

const LandingView = ({ onLaunch }) => (
  <div className="max-w-4xl mx-auto pt-24 px-6 animate-in fade-in duration-700">
    <div className="border-l-4 border-emerald-500 pl-8 mb-12">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 uppercase">Audit Workbench</h1>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Master Ledger Matching & XML Export</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
      {[
        { icon: <History size={18} />, title: "Source", desc: "PDF/CSV Statement parsing" },
        { icon: <Sparkles size={18} />, title: "Map", desc: "AI-Powered ledger suggestions" },
        { icon: <CheckCircle2 size={18} />, title: "Verify", desc: "Registry integrity checklist" }
      ].map((card, i) => (
        <div key={i} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-sm shadow-sm">
          <div className="text-emerald-600 mb-3">{card.icon}</div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider mb-1">{card.title}</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed uppercase">{card.desc}</p>
        </div>
      ))}
    </div>

    <button onClick={onLaunch} className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-600/20">
      Launch Workbench <ArrowUpRight size={16} />
    </button>
  </div>
);

export default LandingView;