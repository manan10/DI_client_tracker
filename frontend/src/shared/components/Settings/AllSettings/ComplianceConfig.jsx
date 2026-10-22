import React from 'react';
import { ShieldCheck, FileSignature, CheckCircle2 } from 'lucide-react';

const ComplianceConfig = ({ compliance, setCompliance }) => (
  <div className="w-full max-w-4xl pb-32 space-y-6 animate-in fade-in duration-300">
    
    {/* Mobile-Only Header */}
    <div className="lg:hidden border-b border-slate-200 dark:border-white/5 pb-4">
      <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">Compliance</h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Legal Distributor Identity & Disclaimers.</p>
    </div>

    <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-md shadow-sm overflow-hidden">
      
      {/* Section Header */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
         <ShieldCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
         <div>
           <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Distributor Credentials</h3>
           <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Official AMFI registration details for client communications.</p>
         </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ARN Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Primary ARN Number
          </label>
          <div className="relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={10} className="text-white" strokeWidth={4} />
             </div>
             <input 
               type="text" 
               value={compliance.arn || ''}
               onChange={(e) => setCompliance({...compliance, arn: e.target.value.toUpperCase()})}
               className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md pl-10 pr-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white uppercase outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm"
               placeholder="ARN-XXXXX"
             />
          </div>
        </div>

        {/* EUIN Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Default EUIN Number
          </label>
          <div className="relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-[8px] font-black text-slate-500 dark:text-slate-400">E</span>
             </div>
             <input 
               type="text" 
               value={compliance.euin || ''}
               onChange={(e) => setCompliance({...compliance, euin: e.target.value.toUpperCase()})}
               className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md pl-10 pr-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white uppercase outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm"
               placeholder="E-XXXXXX"
             />
          </div>
        </div>
      </div>
    </div>

    {/* Disclaimer Section */}
    <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
         <FileSignature size={18} className="text-amber-600 dark:text-amber-400" />
         <div>
           <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Global Disclaimer</h3>
           <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Attached to audit trails and systemic client reports.</p>
         </div>
      </div>

      <div className="p-6">
        <textarea 
          value={compliance.disclaimer || ''}
          onChange={(e) => setCompliance({...compliance, disclaimer: e.target.value})}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md p-4 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors h-48 resize-none leading-relaxed shadow-inner placeholder:text-slate-400"
          placeholder="Enter legal disclaimer text here..."
        />
        
        <div className="mt-3 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
           <span>Markdown not supported</span>
           <span className={`${compliance.disclaimer?.length > 500 ? 'text-amber-500' : ''}`}>
             {compliance.disclaimer?.length || 0} Characters
           </span>
        </div>
      </div>
    </div>
    
  </div>
);

export default ComplianceConfig;