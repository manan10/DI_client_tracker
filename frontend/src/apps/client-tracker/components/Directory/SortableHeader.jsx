import React from 'react';
import { ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";

const SortableHeader = ({ label, sortKey, sortConfig, requestSort, align = "left", className = "" }) => {
  const isActive = sortConfig.key === sortKey;
  
  return (
    <th
      className={`
        px-5 py-3.5 cursor-pointer select-none transition-colors
        hover:bg-slate-100/80 dark:hover:bg-slate-800/60 group
        ${align === 'right' ? 'text-right' : 'text-left'}
        ${className}
      `}
      onClick={() => requestSort(sortKey)}
    >
      <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        <span className={`
          uppercase tracking-wider text-xs transition-colors
          ${isActive
            ? 'text-sky-600 dark:text-sky-300 font-bold'
            : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white font-semibold'}
        `}>
          {label}
        </span>

        <div className="flex items-center justify-center w-4 h-4 shrink-0">
          {isActive ? (
            sortConfig.direction === 'asc'
              ? <ChevronUp size={13} strokeWidth={2.5} className="text-sky-600 dark:text-sky-400" />
              : <ChevronDown size={13} strokeWidth={2.5} className="text-sky-600 dark:text-sky-400" />
          ) : (
            <ArrowUpDown
              size={12}
              strokeWidth={2}
              className="text-slate-400 dark:text-slate-500 opacity-35 group-hover:opacity-75 transition-opacity"
            />
          )}
        </div>
      </div>
    </th>
  );
};

export default SortableHeader;