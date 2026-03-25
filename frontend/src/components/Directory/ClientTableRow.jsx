import React, { useState } from 'react';
import { ChevronRight, ChevronDown, User, Star, AlertCircle } from "lucide-react";

const ClientTableRow = ({ client, onClick }) => {
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
      case 'Diamond': return 'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800/50';
      case 'Gold': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-500 dark:border-amber-800/50';
      case 'Silver': return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
      default: return 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50';
    }
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsManuallyToggled(!isManuallyToggled);
  };

  return (
    <>
      {/* MAIN FAMILY ROW */}
      <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-all group border-b border-slate-50 dark:border-slate-800 cursor-pointer bg-white dark:bg-slate-800">
        <td className="px-8 py-4 flex items-center gap-3">
          <button onClick={handleToggle} className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-md text-amber-600 dark:text-amber-500 transition-colors">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <div onClick={() => onClick(client)}>
            <div className="flex items-center gap-2">
              <p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                {client.name}
              </p>
              {client.members?.length > 1 ? (
                <span className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 px-1.5 py-0.5 rounded-full font-black border border-amber-200 dark:border-amber-800 tracking-widest">FAMILY</span>
              ) : (
                <span className="text-[9px] bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-black border border-blue-100 dark:border-blue-800 tracking-widest">INDIVIDUAL</span>
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono tracking-tighter uppercase">{client.pan}</p>
          </div>
        </td>
        
        <td className="px-8 py-4" onClick={() => onClick(client)}>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border shadow-sm ${getCategoryStyles(client.category)}`}>
              {client.category}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-tight">
              {formatAUM(client.familyAum)}
            </span>
          </div>
        </td>

        <td className="px-8 py-4" onClick={() => onClick(client)}>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 tabular-nums">
                {client.contactDetails?.phoneNo || "N/A"}
              </span>
              {client.isQuiet && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-tight truncate max-w-45 ${client.isQuiet ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
              {client.isQuiet ? "⚠️ No Interaction > 90 Days" : client.contactDetails?.email || "No Email"}
            </span>
          </div>
        </td>

        <td className="px-8 py-4 text-right" onClick={() => onClick(client)}>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter tabular-nums">
            {client.updatedAt ? new Date(client.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "--"}
          </p>
        </td>
      </tr>

      {/* EXPANDED MEMBER ROWS */}
      {isExpanded && client.members.map((member) => {
        const isActuallyHead = member.isFamilyHead || (member.pan === client.pan);
        return (
          <tr key={member._id} onClick={() => onClick(member)} className={`hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-all border-b border-slate-100 dark:border-slate-800 ${isActuallyHead ? 'bg-slate-50/60 dark:bg-slate-800/40' : 'bg-slate-50/20 dark:bg-slate-800/20'}`}>
            <td className="px-8 py-3 pl-20 relative">
              <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800"></div>
              <div className="flex items-center gap-2">
                {isActuallyHead ? <Star size={12} className="text-amber-500 fill-amber-500" /> : <User size={12} className="text-slate-400 dark:text-slate-600" />}
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                  {member.name}
                  {isActuallyHead && <span className="ml-2 text-[8px] text-amber-600 dark:text-amber-500 font-black border border-amber-200 dark:border-amber-800 px-1 rounded uppercase bg-white dark:bg-slate-900">Self</span>}
                </p>
              </div>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 font-mono uppercase pl-5">{member.pan || "NO PAN"}</p>
            </td>
            <td className="px-8 py-3"><span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">{formatAUM(member.aum)}</span></td>
            <td className="px-8 py-3"><span className="text-[10px] text-slate-400 dark:text-slate-600 tabular-nums">{member.contactDetails?.phoneNo || "N/A"}</span></td>
            <td className="px-8 py-3 text-right"><span className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">{isActuallyHead ? 'Head' : 'Member'}</span></td>
          </tr>
        );
      })}
    </>
  );
};

export default ClientTableRow;