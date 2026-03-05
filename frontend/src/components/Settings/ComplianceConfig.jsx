import React from 'react';

const ComplianceConfig = ({ compliance, setCompliance }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
    <header className="mb-12">
      <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Credentials</h3>
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">Legal Distributor Identity & Disclaimers</p>
    </header>

    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ARN Number</label>
          <input 
            type="text" 
            value={compliance.arn}
            onChange={(e) => setCompliance({...compliance, arn: e.target.value})}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold dark:text-slate-100 outline-none focus:border-amber-600 transition-all"
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">EUIN Number</label>
          <input 
            type="text" 
            value={compliance.euin}
            onChange={(e) => setCompliance({...compliance, euin: e.target.value})}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold dark:text-slate-100 outline-none focus:border-amber-600 transition-all"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Global Disclaimer (Audit Trail)</label>
        <textarea 
          value={compliance.disclaimer}
          onChange={(e) => setCompliance({...compliance, disclaimer: e.target.value})}
          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl px-6 py-5 text-sm font-medium dark:text-slate-100 outline-none focus:border-amber-600 h-40 resize-none leading-relaxed"
        />
      </div>
    </div>
  </div>
);

export default ComplianceConfig;