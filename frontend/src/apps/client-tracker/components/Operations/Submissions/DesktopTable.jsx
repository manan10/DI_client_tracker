// src/components/Operations/Submissions/DesktopTable.jsx
import React from 'react';
import { 
  ArrowUpDown, ChevronUp, ChevronDown, Clock, Activity, 
  MapPin, Fingerprint, Hash, Paperclip, MessageSquare, AlertOctagon,
  ArrowRight, CreditCard, User, Layers, Tag
} from 'lucide-react';
import CopyBtn from './CopyBtn';

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).toUpperCase();
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    maximumFractionDigits: 0 
  }).format(amount || 0);
};

const DesktopTable = ({ data, sortConfig, onSort, onRowClick }) => {
  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown size={12} className="opacity-35 group-hover:opacity-75 transition-opacity" />;
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp size={13} className="text-sky-600 dark:text-sky-400 stroke-[2.5]" />
      : <ChevronDown size={13} className="text-sky-600 dark:text-sky-400 stroke-[2.5]" />;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SETTLED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/25';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/25';
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/80 dark:border-emerald-500/25';
      case 'WAITING':
        return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border-amber-200/80 dark:border-amber-500/25';
      default:
        return 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#1C2230] border-slate-200/70 dark:border-slate-700/70';
    }
  };

  return (
    <div className="hidden lg:block overflow-x-auto flex-1 w-full">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-50/90 dark:bg-[#1C2230] border-b border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-300">
            
            {/* 1. Client Column */}
            <th
              onClick={() => onSort('client')}
              className="group px-5 py-3.5 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors w-[22%] select-none"
            >
              <div className="flex items-center gap-2">
                <span>Client</span>
                {renderSortIcon('client')}
              </div>
            </th>

            {/* 2. Transaction & Financial Column */}
            <th
              onClick={() => onSort('date')}
              className="group px-5 py-3.5 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors w-[26%] select-none"
            >
              <div className="flex items-center gap-2">
                <span>Scheme & Financials</span>
                {renderSortIcon('date')}
              </div>
            </th>

            {/* 3. Execution & Logistics Column */}
            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider w-[20%] select-none">
              Logistics
            </th>

            {/* 4. Metadata & Notes Column */}
            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider w-[18%] select-none">
              Metadata & Notes
            </th>

            {/* 5. Status & Actions Column */}
            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider w-[14%] text-right select-none pr-6">
              Status
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#161B26]">
          {data.map((sub) => (
            <tr
              key={sub._id}
              onClick={() => onRowClick(sub._id)}
              className="group hover:bg-slate-50/80 dark:hover:bg-[#1C2230]/60 transition-colors cursor-pointer"
            >
              {/* 1. CLIENT PROFILE */}
              <td className="px-5 py-4 align-top">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-md bg-slate-50 dark:bg-[#1C2230] text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-300 group-hover:bg-sky-50 dark:group-hover:bg-sky-500/10 transition-colors shrink-0 mt-0.5 border border-slate-200/70 dark:border-slate-700/70">
                    <User size={13} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="sora-font text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-white truncate leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                      {sub.client?.name || 'Unnamed Client'}
                    </p>

                    {sub.client?.pan ? (
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-slate-300 tracking-wider uppercase bg-slate-50 dark:bg-[#1C2230] px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-slate-700/70">
                          {sub.client.pan}
                        </span>
                        <CopyBtn text={sub.client.pan} />
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">No PAN assigned</p>
                    )}
                  </div>
                </div>
              </td>

              {/* 2. SCHEME & FINANCIALS */}
              <td className="px-5 py-4 align-top">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#1C2230] px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-slate-700/70">
                      <Clock size={10} className="text-slate-400" />
                      {formatDisplayDate(sub.creationDate)}
                    </span>
                  </div>

                  <p className="sora-font text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1 leading-snug" title={sub.schemeName || sub.subType}>
                    {sub.schemeName || sub.subType?.replace(/_/g, ' ') || '—'}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {sub.type !== 'NON_FINANCIAL' ? (
                      <span className={`sora-font text-sm font-bold tabular-nums tracking-tight ${
                        sub.type === 'REDEMPTION' || sub.type === 'SWP'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-sky-600 dark:text-sky-300'
                      }`}>
                        {formatCurrency(sub.amount)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 border border-sky-200/80 dark:border-sky-500/25 px-2 py-0.5 rounded-md">
                        <Activity size={10} /> Service
                      </span>
                    )}

                    {/* FOLIO BADGE */}
                    <div className="inline-flex items-center bg-slate-50 dark:bg-[#1C2230] rounded-md border border-slate-200/70 dark:border-slate-700/70 px-2 py-0.5">
                      <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        {sub.folioNumber ? `FOL: ${sub.folioNumber}` : 'FOL: NEW'}
                      </span>
                      {sub.folioNumber && <CopyBtn text={sub.folioNumber} />}
                    </div>
                  </div>
                </div>
              </td>

              {/* 3. EXECUTION & LOGISTICS */}
              <td className="px-5 py-4 align-top">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      sub.submissionMode === 'PHYSICAL'
                        ? 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25'
                        : 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/25'
                    }`}>
                      {sub.submissionMode === 'PHYSICAL' ? <MapPin size={10} /> : <Fingerprint size={10} />}
                      {sub.submissionMode}
                    </span>

                    {sub.rtaReference && (
                      <div className="inline-flex items-center bg-slate-50 dark:bg-[#1C2230] border border-slate-200/70 dark:border-slate-700/70 rounded-md px-2 py-0.5">
                        <span className="text-[10px] font-mono font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-0.5">
                          <Hash size={9} className="text-slate-400" /> {sub.rtaReference}
                        </span>
                        <CopyBtn text={sub.rtaReference} />
                      </div>
                    )}
                  </div>

                  {sub.paymentStatus && sub.paymentStatus !== 'NOT_APPLICABLE' && (
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getPaymentStatusBadge(sub.paymentStatus)}`}>
                        <CreditCard size={10} />
                        <span>{sub.paymentStatus}</span>
                        {sub.paymentMode && (
                          <span className="opacity-75 font-mono text-[9px]">
                            • {sub.paymentMode.replace(/_/g, ' ')}
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </td>

              {/* 4. METADATA & NOTES */}
              <td className="px-5 py-4 align-top">
                <div className="space-y-1.5 max-w-55">
                  
                  {/* Notes & Attachments Indicators */}
                  {(sub.attachments?.length > 0 || sub.internalNotes) && (
                    <div className="flex items-center gap-1.5 pb-0.5">
                      {sub.attachments?.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#1C2230] px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-slate-700/70" title={`${sub.attachments.length} Document(s) attached`}>
                          <Paperclip size={10} className="text-sky-500 dark:text-sky-400" />
                          <span>{sub.attachments.length}</span>
                        </span>
                      )}
                      {sub.internalNotes && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-200/80 dark:border-sky-500/25" title="Internal notes recorded">
                          <MessageSquare size={10} />
                          <span>Note</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metadata Key-Value Pill Stack */}
                  {sub.metadata && Object.keys(sub.metadata).length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {Object.entries(sub.metadata).slice(0, 2).map(([k, v]) => (
                        <div key={k} className="inline-flex items-center justify-between text-[10px] font-medium bg-slate-50 dark:bg-[#1C2230] px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-slate-700/70 gap-1.5">
                          <span className="text-slate-400 dark:text-slate-500 shrink-0 truncate max-w-16 uppercase">{k}:</span>
                          <div className="flex items-center gap-1 min-w-0 justify-end">
                            <span className="font-mono text-slate-700 dark:text-slate-200 truncate">{String(v)}</span>
                            <CopyBtn text={String(v)} />
                          </div>
                        </div>
                      ))}
                      {Object.keys(sub.metadata).length > 2 && (
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 pl-1">
                          +{Object.keys(sub.metadata).length - 2} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-600">—</span>
                  )}
                </div>
              </td>

              {/* 5. STATUS & INTERACTIVE ACTION */}
              <td className="px-5 py-4 align-top text-right pr-6">
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getStatusBadge(sub.status)}`}>
                      {sub.status}
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-slate-300 dark:text-slate-600 group-hover:text-sky-500 dark:group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all duration-200 shrink-0"
                    />
                  </div>

                  {sub.status === 'REJECTED' && sub.rejectionReason && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-200/80 dark:border-rose-500/25 max-w-35 truncate" title={sub.rejectionReason.replace(/_/g, ' ')}>
                      <AlertOctagon size={10} className="shrink-0" />
                      <span className="truncate">{sub.rejectionReason.replace(/_/g, ' ')}</span>
                    </span>
                  )}
                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DesktopTable;