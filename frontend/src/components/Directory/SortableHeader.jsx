import React from 'react';
import { ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";

const SortableHeader = ({ label, sortKey, sortConfig, requestSort, align = "left" }) => {
  const isActive = sortConfig.key === sortKey;
  
  return (
    <th 
      className={`
        px-8 py-5 cursor-pointer select-none transition-all 
        hover:bg-slate-50 dark:hover:bg-slate-800/50 group
        ${align === 'right' ? 'text-right' : 'text-left'}
      `}
      onClick={() => requestSort(sortKey)}
    >
      <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        <span className={`
          transition-colors uppercase tracking-widest text-[10px]
          ${isActive 
            ? 'text-emerald-600 dark:text-emerald-500 font-black' 
            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-200'}
        `}>
          {label}
        </span>
        
        <div className="flex items-center min-w-3.5">
          {isActive ? (
            sortConfig.direction === 'asc' 
              ? <ChevronUp size={14} className="text-emerald-600 dark:text-emerald-500 animate-in fade-in slide-in-from-bottom-1" /> 
              : <ChevronDown size={14} className="text-emerald-600 dark:text-emerald-500 animate-in fade-in slide-in-from-top-1" />
          ) : (
            <ArrowUpDown 
              size={12} 
              className="text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 transition-all" 
            />
          )}
        </div>
      </div>
    </th>
  );
};

export default SortableHeader;