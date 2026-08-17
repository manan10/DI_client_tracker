import React from 'react';
import { ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";

const SortableHeader = ({ label, sortKey, sortConfig, requestSort, align = "left", className = "" }) => {
  const isActive = sortConfig.key === sortKey;
  
  return (
    <th 
      className={`
        px-6 py-4 cursor-pointer select-none transition-all duration-200
        hover:bg-slate-100/60 dark:hover:bg-white/4 group
        ${align === 'right' ? 'text-right' : 'text-left'}
        ${className}
      `}
      onClick={() => requestSort(sortKey)}
    >
      <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        <span className={`
          uppercase tracking-widest text-[10px] transition-colors duration-200
          ${isActive 
            ? 'text-emerald-600 dark:text-emerald-400 font-black' 
            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-200 font-bold'}
        `}>
          {label}
        </span>
        
        <div className="flex items-center justify-center w-4 h-4 shrink-0">
          {isActive ? (
            sortConfig.direction === 'asc' 
              ? <ChevronUp size={14} strokeWidth={3} className="text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-200" /> 
              : <ChevronDown size={14} strokeWidth={3} className="text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-200" />
          ) : (
            <ArrowUpDown 
              size={12} 
              strokeWidth={2}
              className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
            />
          )}
        </div>
      </div>
    </th>
  );
};

export default SortableHeader;