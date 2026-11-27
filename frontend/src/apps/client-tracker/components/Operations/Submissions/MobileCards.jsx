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
    <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800/60 flex-1 bg-white dark:bg-[#161B26]">
      {data.map((sub) => (
        <div
          key={sub._id}
          onClick={() => onRowClick(sub._id)}
          className="p-4 active:bg-slate-50 dark:active:bg-[#1C2230]/60 transition-colors flex flex-col gap-3 cursor-pointer relative overflow-hidden"
        >
          {/* Status color bar indicator */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${
            sub.status === 'SETTLED' ? 'bg-emerald-500' : sub.status === 'REJECTED' ? 'bg-rose-500' : 'bg-sky-500'
          }`} />

          {/* TOP ROW: Client & Date */}
          <div className="flex items-start justify-between w-full gap-2 pl-2">
            <div className="flex flex-col min-w-0">
              <p className="sora-font text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                {sub.client?.name}
              </p>
              {sub.client?.pan && (
                <div className="flex items-center mt-1">
                  <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider bg-slate-50 dark:bg-[#1C2230] px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-slate-700/70">
                    {sub.client.pan}
                  </span>
                  <CopyBtn text={sub.client.pan} />
                </div>
              )}
            </div>
            <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 shrink-0 bg-slate-50 dark:bg-[#1C2230] border border-slate-200/70 dark:border-slate-700/70 px-2 py-0.5 rounded-md">
              {formatDisplayDate(sub.creationDate)}
            </span>
          </div>

          {/* SECOND ROW: Scheme & Amount */}
          <div className="flex justify-between items-end gap-2 pl-2">
            <div className="min-w-0">
              <p className="sora-font text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                {sub.schemeName || sub.subType?.replace(/_/g, ' ')}
              </p>
              <div className="flex flex-col items-start gap-1.5 mt-1.5">
                {sub.type !== 'NON_FINANCIAL' ? (
                  <p className={`sora-font text-sm font-bold tabular-nums tracking-tight truncate ${
                    sub.type === 'REDEMPTION' || sub.type === 'SWP'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-sky-600 dark:text-sky-300'
                  }`}>
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(sub.amount)}
                  </p>
                ) : (
                  <p className="text-[11px] font-semibold text-sky-700 dark:text-sky-300 mt-1 border border-sky-200/80 dark:border-sky-500/25 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-md">
                    Service Request
                  </p>
                )}

                <div className="flex items-center">
                  <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider bg-slate-50 dark:bg-[#1C2230] px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-slate-700/70">
                    FOLIO: {sub.folioNumber || 'NEW'}
                  </span>
                  {sub.folioNumber && <CopyBtn text={sub.folioNumber} />}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <ChevronRight size={15} className="text-slate-400 dark:text-slate-500 mb-1" />
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                sub.status === 'SETTLED'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-500/25'
                  : sub.status === 'REJECTED'
                    ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-500/25'
                    : 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-500/25'
              }`}>
                {sub.status}
              </span>
            </div>
          </div>

          {/* METADATA LIST (Mobile layout vertically stacked for reading) */}
          {sub.metadata && Object.keys(sub.metadata).length > 0 && (
            <div className="flex flex-col gap-1.5 pt-3 mt-1 pl-2 border-t border-slate-100 dark:border-slate-800/80">
              {Object.entries(sub.metadata).map(([k, v]) => (
                <div key={k} className="flex items-start justify-between bg-slate-50 dark:bg-[#1C2230] px-2.5 py-1.5 rounded-md border border-slate-200/70 dark:border-slate-700/70 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 shrink-0 w-1/3 truncate uppercase">{k}:</span>
                  <div className="flex items-start gap-1 justify-end w-2/3">
                    <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-right break-all">{String(v)}</span>
                    <CopyBtn text={String(v)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* HORIZONTAL LOGISTICS TAGS */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 pl-2 pb-1">
            {sub.status === 'REJECTED' && sub.rejectionReason && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border border-rose-200/80 dark:border-rose-500/25 px-2 py-0.5 rounded-md uppercase tracking-wider">
                <AlertOctagon size={10} /> {sub.rejectionReason.replace(/_/g, ' ')}
              </span>
            )}
            <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
              sub.submissionMode === 'PHYSICAL'
                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-500/25'
                : 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-500/25'
            }`}>
              {sub.submissionMode === 'PHYSICAL' ? <MapPin size={10} /> : <Fingerprint size={10} />}
              {sub.submissionMode}
            </span>
            {sub.rtaReference && (
              <div className="shrink-0 flex items-center bg-slate-50 dark:bg-[#1C2230] border border-slate-200/70 dark:border-slate-700/70 rounded-md pr-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider px-2 py-0.5">
                  <Hash size={10} /> RTA: {sub.rtaReference}
                </span>
                <CopyBtn text={sub.rtaReference} />
              </div>
            )}
            {sub.paymentStatus !== 'NOT_APPLICABLE' && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider bg-slate-50 dark:bg-[#1C2230] border border-slate-200/70 dark:border-slate-700/70 px-2 py-0.5 rounded-md">
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