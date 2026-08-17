import React, { useState } from 'react';
import { ChevronRight, ChevronDown, User, Star, Phone, Mail, AlertTriangle } from "lucide-react";

// CRITICAL FIX: Destructure 'index' from props
const ClientTableRow = ({ client, onClick, index }) => {
  const [isManuallyToggled, setIsManuallyToggled] = useState(false);
  const isExpanded = client.shouldAutoExpand ? !isManuallyToggled : isManuallyToggled;

  const formatAUM = (value) => {
    if (!value || value === 0) return "₹ 0";
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat('en-IN').format(value);
  };

  const getCategoryStyles = (cat) => {
    switch (cat) {
      case 'Diamond': return 'bg-cyan-50 text-cyan-700 border-cyan-200/80 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30';
      case 'Gold': return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
      case 'Silver': return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30';
      default: return 'bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30';
    }
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsManuallyToggled(!isManuallyToggled);
  };

  const formattedDate = client.updatedAt 
    ? new Date(client.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    : "--";

  // --- ZEBRA STRIPING LOGIC ---
  const isEven = index % 2 === 0;
  const baseBg = isEven ? 'bg-white dark:bg-[#0B1120]' : 'bg-slate-50/40 dark:bg-white/[0.015]';

  return (
    <>
      {/* ========================================== */}
      {/* MAIN FAMILY ROW                            */}
      {/* ========================================== */}
      <tr className={`block md:table-row transition-colors group border-b border-slate-200/80 dark:border-white/5 cursor-pointer w-full hover:bg-emerald-50/50 dark:hover:bg-emerald-500/3 ${baseBg}`}>
        
        {/* --- MOBILE VIEW CARD --- */}
        <td className="block md:hidden px-4 py-4 w-full">
          <div className="flex flex-col w-full gap-3.5">
            
            <div className="flex justify-between items-start gap-3">
              <div className="flex flex-col gap-1 flex-1" onClick={() => onClick(client)}>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-snug wrap-break-word group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {client.name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {client.members?.length > 1 ? (
                    <span className="text-[9px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold border border-slate-200 dark:border-white/10 tracking-widest">FAMILY</span>
                  ) : (
                    <span className="text-[9px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold border border-slate-200 dark:border-white/10 tracking-widest">INDIV</span>
                  )}
                  <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                    {client.pan}
                  </span>
                </div>
              </div>
              
              {client.members?.length > 1 && (
                <button 
                  onClick={handleToggle} 
                  className="p-2 bg-white dark:bg-white/5 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors border border-slate-200 dark:border-white/10 outline-none shrink-0 shadow-2xs"
                >
                  {isExpanded ? <ChevronDown size={16} strokeWidth={2.5} /> : <ChevronRight size={16} strokeWidth={2.5} />}
                </button>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-3" onClick={() => onClick(client)}>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border shadow-2xs ${getCategoryStyles(client.category)}`}>
                  {client.category}
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight font-mono whitespace-nowrap">
                  {formatAUM(client.familyAum)}
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wider font-mono">
                {formattedDate}
              </span>
            </div>

            <div className="flex flex-col gap-1 pt-1" onClick={() => onClick(client)}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums flex items-center gap-1.5">
                  <Phone size={12} className="text-slate-400" /> {client.contactDetails?.phoneNo || "N/A"}
                </span>
                {client.isQuiet && (
                  <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-500/20 flex items-center gap-1">
                    <AlertTriangle size={10} strokeWidth={2.5} /> Action Needed
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-medium tracking-tight truncate w-full flex items-center gap-1.5 ${client.isQuiet ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
                <Mail size={12} className={client.isQuiet ? 'text-rose-500' : 'text-slate-400'} /> 
                {client.isQuiet ? "No Interaction > 90 Days" : (client.contactDetails?.email || "No Email")}
              </span>
            </div>
          </div>
        </td>

        {/* --- DESKTOP VIEW ROW --- */}
        <td className="hidden md:table-cell px-6 py-4 align-middle">
          <div className="flex items-center gap-3">
            {client.members?.length > 1 ? (
              <button onClick={handleToggle} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-md text-emerald-600 dark:text-emerald-400 transition-colors outline-none shrink-0 cursor-pointer">
                {isExpanded ? <ChevronDown size={16} strokeWidth={2.5} /> : <ChevronRight size={16} strokeWidth={2.5} />}
              </button>
            ) : (
              <div className="w-6" /> // Placeholder spacing for alignment
            )}
            <div onClick={() => onClick(client)} className="flex flex-col w-full cursor-pointer">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {client.name}
                </span>
                {client.members?.length > 1 ? (
                  <span className="text-[9px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold border border-slate-200 dark:border-white/10 tracking-widest">FAMILY</span>
                ) : (
                  <span className="text-[9px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold border border-slate-200 dark:border-white/10 tracking-widest">INDIV</span>
                )}
              </div>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 font-mono tracking-wider uppercase mt-0.5">
                {client.pan}
              </span>
            </div>
          </div>
        </td>
        
        <td className="hidden md:table-cell px-6 py-4 align-middle cursor-pointer" onClick={() => onClick(client)}>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border shadow-2xs ${getCategoryStyles(client.category)}`}>
              {client.category}
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight font-mono whitespace-nowrap">
              {formatAUM(client.familyAum)}
            </span>
          </div>
        </td>

        <td className="hidden md:table-cell px-6 py-4 align-middle cursor-pointer" onClick={() => onClick(client)}>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums font-mono">
                {client.contactDetails?.phoneNo || "N/A"}
              </span>
              {client.isQuiet && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium tracking-tight truncate max-w-55 ${client.isQuiet ? 'text-rose-500 dark:text-rose-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
              {client.isQuiet ? "⚠️ No Interaction > 90 Days" : client.contactDetails?.email || "No Email"}
            </span>
          </div>
        </td>

        <td className="hidden md:table-cell px-6 py-4 text-right align-middle cursor-pointer" onClick={() => onClick(client)}>
          <p className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
            {formattedDate}
          </p>
        </td>
      </tr>

      {/* ========================================== */}
      {/* EXPANDED MEMBER ROWS                       */}
      {/* ========================================== */}
      {isExpanded && client.members.map((member) => {
        const isActuallyHead = member.isFamilyHead || (member.pan === client.pan);
        
        const expandedBg = isActuallyHead 
          ? (isEven ? 'bg-slate-50/90 dark:bg-slate-800/40' : 'bg-slate-100/60 dark:bg-slate-800/60')
          : (isEven ? 'bg-slate-50/40 dark:bg-slate-800/20' : 'bg-slate-100/30 dark:bg-slate-800/30');

        return (
          <tr 
            key={member._id} 
            onClick={() => onClick(member)} 
            className={`block md:table-row transition-colors border-b border-slate-200/60 dark:border-white/5 cursor-pointer w-full hover:bg-emerald-50/50 dark:hover:bg-emerald-500/3 ${expandedBg}`}
          >
            {/* --- MOBILE VIEW MEMBER CARD --- */}
            <td className="block md:hidden px-4 py-3 pl-8 relative w-full border-l-2 border-l-emerald-500/50">
              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {isActuallyHead ? <Star size={12} className="text-emerald-500 fill-emerald-500" /> : <User size={12} className="text-slate-400 dark:text-slate-500" />}
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase leading-snug">
                      {member.name}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-white dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10">
                    {isActuallyHead ? 'Head' : 'Member'}
                  </span>
                </div>
                
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 font-mono uppercase pl-5 mt-0.5">
                  {member.pan || "NO PAN"}
                </p>

                <div className="flex justify-between items-center pl-5 mt-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
                  <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 whitespace-nowrap">{formatAUM(member.aum)}</span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums flex items-center gap-1 font-mono"><Phone size={10}/> {member.contactDetails?.phoneNo || "N/A"}</span>
                </div>
              </div>
            </td>

            {/* --- DESKTOP VIEW MEMBER ROW --- */}
            <td className="hidden md:table-cell px-6 py-3 pl-16 relative align-middle">
              <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-emerald-500/40" />
              <div className="flex items-center gap-2">
                {isActuallyHead ? <Star size={13} className="text-emerald-500 fill-emerald-500" /> : <User size={13} className="text-slate-400 dark:text-slate-500" />}
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  {member.name}
                  {isActuallyHead && <span className="ml-2 text-[8px] text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-0.5 rounded uppercase bg-white dark:bg-slate-900 tracking-wider">Self</span>}
                </p>
              </div>
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 font-mono uppercase pl-5 mt-0.5">
                {member.pan || "NO PAN"}
              </p>
            </td>
            
            <td className="hidden md:table-cell px-6 py-3 align-middle">
              <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 whitespace-nowrap">{formatAUM(member.aum)}</span>
            </td>
            <td className="hidden md:table-cell px-6 py-3 align-middle">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 tabular-nums font-mono">{member.contactDetails?.phoneNo || "N/A"}</span>
            </td>
            <td className="hidden md:table-cell px-6 py-3 text-right align-middle">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{isActuallyHead ? 'Head' : 'Member'}</span>
            </td>
          </tr>
        );
      })}
    </>
  );
};

export default ClientTableRow;