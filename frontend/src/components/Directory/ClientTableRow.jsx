import React from 'react';

const ClientTableRow = ({ client }) => {
  // Helper to compact large AUM numbers into Indian Word Format
  const formatAUM = (value) => {
    if (!value || value === 0) return "₹ 0";
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Tier-based styling for quick visual identification
  const getCategoryStyles = (cat) => {
    switch (cat) {
      case 'Diamond': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'Gold': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Silver': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-orange-50 text-orange-700 border-orange-100';
    }
  };

  return (
    <tr className="hover:bg-slate-50/80 transition-all group border-b border-slate-50 last:border-0">
      {/* Reduced py-3 for a more compact vertical feel */}
      <td className="px-8 py-3">
        <p className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-amber-600 transition-colors">
          {client.name}
        </p>
        <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter uppercase">
          {client.pan}
        </p>
      </td>
      
      <td className="px-8 py-3">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border shadow-sm ${getCategoryStyles(client.category)}`}>
            {client.category}
          </span>
          <span className="text-xs font-bold text-slate-700 tracking-tight">
            {formatAUM(client.aum)}
          </span>
        </div>
      </td>

      <td className="px-8 py-3">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-slate-600 tabular-nums">
            {client.contactDetails?.phoneNo || "N/A"}
          </span>
          <span className="text-[10px] text-slate-400 truncate max-w-45">
            {client.contactDetails?.email || "No Email"}
          </span>
        </div>
      </td>

      <td className="px-8 py-3 text-right">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter tabular-nums">
          {client.updatedAt ? new Date(client.updatedAt).toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          }) : "--"}
        </p>
      </td>
    </tr>
  );
};

export default ClientTableRow;