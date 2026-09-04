// src/components/Operations/Submissions/MobileCards.jsx
import React from 'react';
import { ChevronRight, AlertOctagon, MapPin, Fingerprint, Hash, CreditCard } from 'lucide-react';
import CopyBtn from './CopyBtn';

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
};

const MobileCards = ({ data, onRowClick }) => {
  return (
    <div className="lg:hidden divide-y divide-slate-200 dark:divide-white/10 flex-1 bg-white dark:bg-[#0B1120]">
      {data.map((sub) => (
        <div 
          key={sub._id} 
          onClick={() => onRowClick(sub._id)}
          className="p-4 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors flex flex-col gap-3 cursor-pointer relative overflow-hidden"
        >
          {/* Status color bar indicator */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${
            sub.status === 'SETTLED' ? 'bg-emerald-500' : sub.status === 'REJECTED' ? 'bg-rose-500' : 'bg-indigo-500'
          }`} />

          {/* TOP ROW: Client & Date */}
          <div className="flex items-start justify-between w-full gap-2 pl-2">
             <div className="flex flex-col min-w-0">
               <p className="text-[12px] font-[1000] text-slate-900 dark:text-white uppercase truncate tracking-tight">
                 {sub.client?.name}
               </p>
               {sub.client?.pan && (
                 <div className="flex items-center mt-1">
                   <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm border border-slate-200 dark:border-white/5">
                     {sub.client.pan}
                   </span>
                   <CopyBtn text={sub.client.pan} />
                 </div>
               )}
             </div>
             <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest shrink-0 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-2 py-1 rounded-sm shadow-sm">
                {formatDisplayDate(sub.creationDate)}
             </span>
          </div>
          
          {/* SECOND ROW: Scheme & Amount */}
          <div className="flex justify-between items-end gap-2 pl-2">
             <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase truncate">
                  {sub.schemeName || sub.subType?.replace(/_/g, ' ')}
                </p>
                <div className="flex flex-col items-start gap-1.5 mt-1.5">
                  {sub.type !== 'NON_FINANCIAL' ? (
                    <p className="text-[14px] font-[1000] text-emerald-700 dark:text-emerald-400 tabular-nums tracking-tighter truncate">
                       {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(sub.amount)}
                    </p>
                  ) : (
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1 border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-sm">Service Request</p>
                  )}
                  
                  <div className="flex items-center">
                    <span className="text-[10px] font-mono font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm border border-slate-200 dark:border-slate-700">
                      FOLIO: {sub.folioNumber || 'NEW'}
                    </span>
                    {sub.folioNumber && <CopyBtn text={sub.folioNumber} />}
                  </div>
                </div>
             </div>
             
             <div className="flex flex-col items-end gap-1 shrink-0">
               <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 mb-1" />
               <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border shadow-sm ${
                 sub.status === 'SETTLED' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 
                 sub.status === 'REJECTED' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' : 
                 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20'
               }`}>
                 {sub.status}
               </span>
             </div>
          </div>

          {/* METADATA LIST (Mobile layout vertically stacked for reading) */}
          {sub.metadata && Object.keys(sub.metadata).length > 0 && (
            <div className="flex flex-col gap-1.5 pt-3 mt-1 pl-2 border-t border-dashed border-slate-200 dark:border-white/10">
              {Object.entries(sub.metadata).map(([k, v]) => (
                <div key={k} className="flex items-start justify-between bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-sm border border-slate-100 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500 shrink-0 w-1/3 truncate mt-0.5">{k}:</span>
                  <div className="flex items-start gap-1 justify-end w-2/3">
                    <span className="text-slate-900 dark:text-slate-100 text-right break-all mt-0.5">{String(v)}</span>
                    <CopyBtn text={String(v)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* HORIZONTAL LOGISTICS TAGS */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 pl-2 pb-1">
            {sub.status === 'REJECTED' && sub.rejectionReason && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-black text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-2 py-1 rounded-sm uppercase tracking-widest shadow-sm">
                <AlertOctagon size={10} /> {sub.rejectionReason.replace(/_/g, ' ')}
              </span>
            )}
            <span className={`shrink-0 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm border shadow-sm ${
              sub.submissionMode === 'PHYSICAL' 
              ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' 
              : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20'
            }`}>
              {sub.submissionMode === 'PHYSICAL' ? <MapPin size={10} /> : <Fingerprint size={10} />}
              {sub.submissionMode}
            </span>
            {sub.rtaReference && (
              <div className="shrink-0 flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-sm pr-1 shadow-sm">
                <span className="inline-flex items-center gap-1 text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest px-2 py-1">
                  <Hash size={10} /> RTA: {sub.rtaReference}
                </span>
                <CopyBtn text={sub.rtaReference} />
              </div>
            )}
            {sub.paymentStatus !== 'NOT_APPLICABLE' && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-2 py-1 rounded-sm shadow-sm">
                <CreditCard size={10} /> {sub.paymentStatus}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MobileCards;