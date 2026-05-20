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
      case 'Diamond': return 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30';
      case 'Gold': return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30';
      case 'Silver': return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30';
      default: return 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30';
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
  // White/Dark Slate for Even rows, Subtle Gray/Deeper Slate for Odd rows
  const baseBg = isEven ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/60 dark:bg-slate-800/20';

  return (
    <>
      {/* ========================================== */}
      {/* MAIN FAMILY ROW                  */}
      {/* ========================================== */}
      {/* Applied baseBg for Zebra striping, sharpened borders, and added emerald hover tint */}
      <tr className={`block md:table-row transition-colors group border-b border-slate-200 dark:border-slate-700/60 cursor-pointer w-full hover:bg-emerald-50/60 dark:hover:bg-emerald-900/10 ${baseBg}`}>
        
        {/* --- MOBILE VIEW CARD --- */}
        <td className="block md:hidden px-4 py-5 w-full">
          <div className="flex flex-col w-full gap-4">
            
            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col gap-1.5 flex-1" onClick={() => onClick(client)}>
                <h3 className="text-[14px] font-[1000] text-slate-900 dark:text-slate-100 uppercase tracking-tight leading-snug wrap-break-word group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {client.name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {client.members?.length > 1 ? (
                    <span className="text-[9px] bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-black border border-slate-200 dark:border-slate-700 tracking-widest">FAMILY</span>
                  ) : (
                    <span className="text-[9px] bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-black border border-slate-200 dark:border-slate-700 tracking-widest">INDIV</span>
                  )}
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono tracking-tighter uppercase">
                    {client.pan}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleToggle} 
                className="p-1.5 bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg text-slate-400 dark:text-slate-500 hover:text-emerald-600 transition-colors border border-slate-200 dark:border-slate-700 outline-none shrink-0 shadow-sm"
              >
                {isExpanded ? <ChevronDown size={18} strokeWidth={2.5} /> : <ChevronRight size={18} strokeWidth={2.5} />}
              </button>
            </div>

            <div className="flex justify-between items-end border-t border-slate-200/60 dark:border-slate-700/60 pt-3" onClick={() => onClick(client)}>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Business</span>
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getCategoryStyles(client.category)}`}>
                    {client.category}
                  </span>
                  <span className="text-[15px] font-[1000] text-slate-800 dark:text-slate-200 tracking-tight whitespace-nowrap">
                    {formatAUM(client.familyAum)}
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-widest">
                {formattedDate}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 pt-1" onClick={() => onClick(client)}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[1000] text-slate-600 dark:text-slate-300 tabular-nums flex items-center gap-1.5">
                  <Phone size={12} className="text-slate-400" /> {client.contactDetails?.phoneNo || "N/A"}
                </span>
                {client.isQuiet && (
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-widest bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-500/20 flex items-center gap-1">
                    <AlertTriangle size={10} strokeWidth={3} /> Action Needed
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold tracking-tight truncate w-full flex items-center gap-1.5 ${client.isQuiet ? 'text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <Mail size={12} className={client.isQuiet ? 'text-red-400' : 'text-slate-400'} /> 
                {client.isQuiet ? "No Interaction > 90 Days" : (client.contactDetails?.email || "No Email")}
              </span>
            </div>
          </div>
        </td>

        {/* --- DESKTOP VIEW ROW --- */}
        <td className="hidden md:table-cell px-8 py-5 align-middle">
          <div className="flex items-center gap-3">
            <button onClick={handleToggle} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-md text-emerald-600 dark:text-emerald-500 transition-colors outline-none shrink-0">
              {isExpanded ? <ChevronDown size={18} strokeWidth={2.5} /> : <ChevronRight size={18} strokeWidth={2.5} />}
            </button>
            <div onClick={() => onClick(client)} className="flex flex-col w-full cursor-pointer">
              <div className="flex items-center gap-2.5">
                <span className="text-[13px] font-[1000] text-slate-900 dark:text-slate-100 uppercase tracking-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {client.name}
                </span>
                {client.members?.length > 1 ? (
                  <span className="text-[8px] bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-black border border-slate-200 dark:border-slate-700 tracking-widest">FAMILY</span>
                ) : (
                  <span className="text-[8px] bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-black border border-slate-200 dark:border-slate-700 tracking-widest">INDIV</span>
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono tracking-tighter uppercase mt-0.5">
                {client.pan}
              </span>
            </div>
          </div>
        </td>
        
        <td className="hidden md:table-cell px-8 py-5 align-middle cursor-pointer" onClick={() => onClick(client)}>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border shadow-sm ${getCategoryStyles(client.category)}`}>
              {client.category}
            </span>
            <span className="text-[13px] font-[1000] text-slate-800 dark:text-slate-200 tracking-tight whitespace-nowrap">
              {formatAUM(client.familyAum)}
            </span>
          </div>
        </td>

        <td className="hidden md:table-cell px-8 py-5 align-middle cursor-pointer" onClick={() => onClick(client)}>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-[1000] text-slate-800 dark:text-slate-200 tabular-nums">
                {client.contactDetails?.phoneNo || "N/A"}
              </span>
              {client.isQuiet && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              )}
            </div>
            <span className={`text-[9px] uppercase font-bold tracking-tight truncate max-w-50 ${client.isQuiet ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
              {client.isQuiet ? "⚠️ No Interaction > 90 Days" : client.contactDetails?.email || "No Email"}
            </span>
          </div>
        </td>

        <td className="hidden md:table-cell px-8 py-5 text-right align-middle cursor-pointer" onClick={() => onClick(client)}>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest">
            {formattedDate}
          </p>
        </td>
      </tr>

      {/* ========================================== */}
      {/* EXPANDED MEMBER ROWS             */}
      {/* ========================================== */}
      {isExpanded && client.members.map((member) => {
        const isActuallyHead = member.isFamilyHead || (member.pan === client.pan);
        
        // Expanded rows tint slightly differently to visually "attach" to their parent row
        const expandedBg = isActuallyHead 
          ? (isEven ? 'bg-slate-50/80 dark:bg-slate-800/40' : 'bg-slate-100/50 dark:bg-slate-800/60')
          : (isEven ? 'bg-slate-50/40 dark:bg-slate-800/20' : 'bg-slate-100/30 dark:bg-slate-800/30');

        return (
          <tr 
            key={member._id} 
            onClick={() => onClick(member)} 
            className={`block md:table-row transition-colors border-b border-slate-200/60 dark:border-slate-700/40 cursor-pointer w-full hover:bg-emerald-50/60 dark:hover:bg-emerald-900/10 ${expandedBg}`}
          >
            {/* --- MOBILE VIEW MEMBER CARD --- */}
            <td className="block md:hidden px-4 py-3 pl-8 relative w-full border-l-[3px] border-l-slate-300 dark:border-l-slate-600">
              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {isActuallyHead ? <Star size={12} className="text-emerald-500 fill-emerald-500" /> : <User size={12} className="text-slate-400 dark:text-slate-500" />}
                    <p className="text-[12px] font-[1000] text-slate-700 dark:text-slate-300 uppercase leading-snug">
                      {member.name}
                    </p>
                  </div>
                  <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-sm border border-slate-200 dark:border-slate-700">
                    {isActuallyHead ? 'Head' : 'Member'}
                  </span>
                </div>
                
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 font-mono uppercase pl-5 mt-0.5">
                  {member.pan || "NO PAN"}
                </p>

                <div className="flex justify-between items-center pl-5 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/40">
                  <span className="text-[11px] font-[1000] text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">{formatAUM(member.aum)}</span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tabular-nums flex items-center gap-1"><Phone size={10}/> {member.contactDetails?.phoneNo || "N/A"}</span>
                </div>
              </div>
            </td>

            {/* --- DESKTOP VIEW MEMBER ROW --- */}
            <td className="hidden md:table-cell px-8 py-3 pl-20 relative align-middle">
              <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2">
                {isActuallyHead ? <Star size={12} className="text-emerald-500 fill-emerald-500" /> : <User size={12} className="text-slate-400 dark:text-slate-500" />}
                <p className="text-[11px] font-[1000] text-slate-700 dark:text-slate-300 uppercase">
                  {member.name}
                  {isActuallyHead && <span className="ml-2 text-[7px] text-emerald-600 dark:text-emerald-400 font-black border border-emerald-200/60 dark:border-emerald-500/30 px-1 rounded uppercase bg-white dark:bg-slate-900 tracking-widest">Self</span>}
                </p>
              </div>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 font-mono uppercase pl-5 mt-0.5">
                {member.pan || "NO PAN"}
              </p>
            </td>
            
            <td className="hidden md:table-cell px-8 py-3 align-middle">
              <span className="text-[11px] font-[1000] text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap">{formatAUM(member.aum)}</span>
            </td>
            <td className="hidden md:table-cell px-8 py-3 align-middle">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">{member.contactDetails?.phoneNo || "N/A"}</span>
            </td>
            <td className="hidden md:table-cell px-8 py-3 text-right align-middle">
              <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{isActuallyHead ? 'Head' : 'Member'}</span>
            </td>
          </tr>
        );
      })}
    </>
  );
};

export default ClientTableRow;