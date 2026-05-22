import React from 'react';

const ComplianceConfig = ({ compliance, setCompliance }) => (
  <div className="max-w-3xl mx-auto py-8 px-4 md:px-8 pb-64 md:pb-10">
    
    {/* HEADER */}
    <header className="mb-12 border-b border-slate-100 pb-8">
      <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900">Credentials</h3>
      <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.2em] mt-2">Legal Distributor Identity & Disclaimers</p>
    </header>

    <div className="space-y-12">
      {/* IDENTIFIERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <div className="relative flex flex-col">
          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-3">ARN Number</label>
          <input 
            type="text" 
            value={compliance.arn || ''}
            onChange={(e) => setCompliance({...compliance, arn: e.target.value})}
            className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-lg font-bold text-slate-900 outline-none focus:border-emerald-600 transition-colors"
            placeholder="Enter ARN"
          />
        </div>
        
        <div className="relative flex flex-col">
          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-3">EUIN Number</label>
          <input 
            type="text" 
            value={compliance.euin || ''}
            onChange={(e) => setCompliance({...compliance, euin: e.target.value})}
            className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-lg font-bold text-slate-900 outline-none focus:border-emerald-600 transition-colors"
            placeholder="Enter EUIN"
          />
        </div>
      </div>

      {/* DISCLAIMER */}
      <div className="relative flex flex-col pt-4">
        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-3">Global Disclaimer (Audit Trail)</label>
        <textarea 
          value={compliance.disclaimer || ''}
          onChange={(e) => setCompliance({...compliance, disclaimer: e.target.value})}
          className="w-full border-2 border-slate-100 rounded-xl p-5 text-[11px] font-medium text-slate-600 outline-none focus:border-emerald-600 focus:bg-emerald-50/20 transition-all h-40 resize-none leading-relaxed"
          placeholder="Enter legal disclaimer text..."
        />
      </div>
    </div>
  </div>
);

export default ComplianceConfig;