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
      return <ArrowUpDown size={12} className="opacity-30 group-hover:opacity-70 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={13} className="text-emerald-500 stroke-[2.5]" /> 
      : <ChevronDown size={13} className="text-emerald-500 stroke-[2.5]" />;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SETTLED':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/10';
      case 'REJECTED':
        return 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/10';
      default:
        return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/10';
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40';
      case 'WAITING':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40';
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/5';
    }
  };

  return (
    <div className="hidden lg:block overflow-x-auto flex-1 w-full">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
            
            {/* 1. Client Column */}
            <th 
              onClick={() => onSort('client')} 
              className="group px-6 py-4 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-[22%] select-none"
            >
              <div className="flex items-center gap-2">
                <span>Client</span> 
                {renderSortIcon('client')}
              </div>
            </th>

            {/* 2. Transaction & Financial Column */}
            <th 
              onClick={() => onSort('date')} 
              className="group px-6 py-4 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-[26%] select-none"
            >
              <div className="flex items-center gap-2">
                <span>Scheme & Financials</span> 
                {renderSortIcon('date')}
              </div>
            </th>

            {/* 3. Execution & Logistics Column */}
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest w-[20%] select-none">
              Logistics
            </th>

            {/* 4. Metadata & Notes Column */}
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest w-[18%] select-none">
              Metadata & Notes
            </th>

            {/* 5. Status & Actions Column */}
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest w-[14%] text-right select-none pr-8">
              Status
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-[#0B1120]">
          {data.map((sub) => (
            <tr 
              key={sub._id} 
              onClick={() => onRowClick(sub._id)}
              className="group hover:bg-indigo-500/2 dark:hover:bg-white/2 transition-colors cursor-pointer"
            >
              {/* 1. CLIENT PROFILE */}
              <td className="px-6 py-4.5 align-top">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors shrink-0 mt-0.5 border border-slate-200/60 dark:border-white/5">
                    <User size={13} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-[1000] text-slate-900 dark:text-white uppercase tracking-tight truncate leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {sub.client?.name || 'Unnamed Client'}
                    </p>
                    
                    {sub.client?.pan ? (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10">
                          {sub.client.pan}
                        </span>
                        <CopyBtn text={sub.client.pan} />
                      </div>
                    ) : (
                      <p className="text-[10px] font-medium text-slate-400 mt-1 italic">No PAN assigned</p>
                    )}
                  </div>
                </div>
              </td>

              {/* 2. SCHEME & FINANCIALS */}
              <td className="px-6 py-4.5 align-top">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded border border-slate-200/70 dark:border-white/5">
                      <Clock size={10} className="text-slate-400" />
                      {formatDisplayDate(sub.creationDate)}
                    </span>
                  </div>

                  <p className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight line-clamp-1 leading-snug" title={sub.schemeName || sub.subType}>
                    {sub.schemeName || sub.subType?.replace(/_/g, ' ') || '—'}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {sub.type !== 'NON_FINANCIAL' ? (
                      <span className={`text-[13px] font-[1000] tabular-nums tracking-tight ${
                        sub.type === 'REDEMPTION' || sub.type === 'SWP' 
                          ? 'text-rose-600 dark:text-rose-400' 
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {formatCurrency(sub.amount)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 rounded">
                        <Activity size={10} /> Service
                      </span>
                    )}

                    {/* FOLIO BADGE */}
                    <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800/90 rounded border border-slate-200 dark:border-white/10 px-1.5 py-0.5">
                      <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        {sub.folioNumber ? `FOL: ${sub.folioNumber}` : 'FOL: NEW'}
                      </span>
                      {sub.folioNumber && <CopyBtn text={sub.folioNumber} />}
                    </div>
                  </div>
                </div>
              </td>

              {/* 3. EXECUTION & LOGISTICS */}
              <td className="px-6 py-4.5 align-top">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                      sub.submissionMode === 'PHYSICAL' 
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' 
                        : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20'
                    }`}>
                      {sub.submissionMode === 'PHYSICAL' ? <MapPin size={9} /> : <Fingerprint size={9} />}
                      {sub.submissionMode}
                    </span>

                    {sub.rtaReference && (
                      <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded px-1.5 py-0.5">
                        <span className="text-[9px] font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-0.5">
                          <Hash size={9} className="text-slate-400" /> {sub.rtaReference}
                        </span>
                        <CopyBtn text={sub.rtaReference} />
                      </div>
                    )}
                  </div>

                  {sub.paymentStatus && sub.paymentStatus !== 'NOT_APPLICABLE' && (
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPaymentStatusBadge(sub.paymentStatus)}`}>
                        <CreditCard size={9} />
                        <span>{sub.paymentStatus}</span>
                        {sub.paymentMode && (
                          <span className="opacity-70 font-mono text-[8px]">
                            • {sub.paymentMode.replace(/_/g, ' ')}
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </td>

              {/* 4. METADATA & NOTES */}
              <td className="px-6 py-4.5 align-top">
                <div className="space-y-1.5 max-w-55">
                  
                  {/* Notes & Attachments Indicators */}
                  {(sub.attachments?.length > 0 || sub.internalNotes) && (
                    <div className="flex items-center gap-2 pb-0.5">
                      {sub.attachments?.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10" title={`${sub.attachments.length} Document(s) attached`}>
                          <Paperclip size={10} className="text-indigo-500" />
                          <span>{sub.attachments.length}</span>
                        </span>
                      )}
                      {sub.internalNotes && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20" title="Internal notes recorded">
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
                        <div key={k} className="inline-flex items-center justify-between text-[9px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded border border-slate-200/60 dark:border-white/5 gap-1.5">
                          <span className="text-slate-400 shrink-0 truncate max-w-15">{k}:</span>
                          <div className="flex items-center gap-1 min-w-0 justify-end">
                            <span className="text-slate-700 dark:text-slate-300 truncate">{String(v)}</span>
                            <CopyBtn text={String(v)} />
                          </div>
                        </div>
                      ))}
                      {Object.keys(sub.metadata).length > 2 && (
                        <span className="text-[8px] font-black text-slate-400 tracking-wider pl-1">
                          +{Object.keys(sub.metadata).length - 2} more fields
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">—</span>
                  )}
                </div>
              </td>

              {/* 5. STATUS & INTERACTIVE ACTION */}
              <td className="px-6 py-4.5 align-top text-right pr-8">
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-[1000] uppercase tracking-widest border ${getStatusBadge(sub.status)}`}>
                      {sub.status}
                    </span>
                    <ArrowRight 
                      size={14} 
                      className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-200 shrink-0" 
                    />
                  </div>

                  {sub.status === 'REJECTED' && sub.rejectionReason && (
                    <span className="inline-flex items-center gap-1 text-[8px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-500/20 max-w-35 truncate" title={sub.rejectionReason.replace(/_/g, ' ')}>
                      <AlertOctagon size={9} className="shrink-0" />
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