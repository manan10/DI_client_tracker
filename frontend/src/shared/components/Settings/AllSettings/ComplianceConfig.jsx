import React from 'react';
import { ShieldCheck, FileSignature, CheckCircle2 } from 'lucide-react';

const ComplianceConfig = ({ compliance, setCompliance }) => (
  <div className="w-full max-w-[100rem] pb-32 space-y-6 animate-in fade-in duration-300">
    
    {/* Mobile-Only Header */}
    <div className="lg:hidden border-b border-slate-200 dark:border-slate-800/80 pb-4">
      <h1 className="sora-font text-xl font-bold tracking-tight text-slate-900 dark:text-white">Compliance</h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Legal Distributor Identity & Disclaimers.</p>
    </div>

    <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg shadow-sm overflow-hidden">
      
      {/* Section Header */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#1C2230] flex items-center gap-3">
         <ShieldCheck size={18} className="text-sky-600 dark:text-sky-400" />
         <div>
           <h3 className="sora-font text-sm font-bold text-slate-900 dark:text-white tracking-tight">Distributor Credentials</h3>
           <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Official AMFI registration details for client communications.</p>
         </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ARN Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Primary ARN Number
          </label>
          <div className="relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-sky-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={10} className="text-white" strokeWidth={4} />
             </div>
             <input 
               type="text" 
               value={compliance.arn || ''}
               onChange={(e) => setCompliance({...compliance, arn: e.target.value.toUpperCase()})}
               className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg pl-10 pr-4 py-2.5 text-sm font-mono font-semibold text-slate-900 dark:text-white uppercase outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors shadow-sm"
               placeholder="ARN-XXXXX"
             />
          </div>
        </div>

        {/* EUIN Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Default EUIN Number
          </label>
          <div className="relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">E</span>
             </div>
             <input 
               type="text" 
               value={compliance.euin || ''}
               onChange={(e) => setCompliance({...compliance, euin: e.target.value.toUpperCase()})}
               className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg pl-10 pr-4 py-2.5 text-sm font-mono font-semibold text-slate-900 dark:text-white uppercase outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors shadow-sm"
               placeholder="E-XXXXXX"
             />
          </div>
        </div>
      </div>
    </div>

    {/* Disclaimer Section */}
    <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#1C2230] flex items-center gap-3">
         <FileSignature size={18} className="text-amber-600 dark:text-amber-400" />
         <div>
           <h3 className="sora-font text-sm font-bold text-slate-900 dark:text-white tracking-tight">Global Disclaimer</h3>
           <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Attached to audit trails and systemic client reports.</p>
         </div>
      </div>

      <div className="p-6">
        <textarea 
          value={compliance.disclaimer || ''}
          onChange={(e) => setCompliance({...compliance, disclaimer: e.target.value})}
          className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg p-4 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors h-48 resize-none leading-relaxed shadow-inner placeholder:text-slate-400"
          placeholder="Enter legal disclaimer text here..."
        />
        
        <div className="mt-3 flex justify-between items-center text-[10px] font-semibold uppercase tracking-widest text-slate-400">
           <span>Markdown not supported</span>
           <span className={`font-mono ${compliance.disclaimer?.length > 500 ? 'text-amber-500' : ''}`}>
             {compliance.disclaimer?.length || 0} Characters
           </span>
        </div>
      </div>
    </div>
    
  </div>
);

export default ComplianceConfig;