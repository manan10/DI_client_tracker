import React from "react";
import { Search } from "lucide-react";

const DirectoryFilters = ({ onSearchChange, onTierChange }) => (
  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
    {/* Search Input */}
    <div className="relative flex-1 md:w-80">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors"
        size={16}
      />
      <input
        type="text"
        placeholder="Search Name or PAN..."
        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-slate-100 outline-none focus:border-amber-600 dark:focus:border-amber-500 shadow-sm transition-all uppercase placeholder:normal-case placeholder:text-slate-400 dark:placeholder:text-slate-600"
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>

    {/* Filter Select */}
    <div className="relative">
      <select
        className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-amber-600 dark:focus:border-amber-500 shadow-sm cursor-pointer appearance-none transition-all"
        onChange={(e) => onTierChange(e.target.value)}
      >
        <optgroup label="Relationship Status" className="bg-white dark:bg-slate-800 text-slate-400">
          <option value="All">All Tiers</option>
          <option value="Attention" className="text-red-600 dark:text-red-400">⚠️ Needs Attention</option>
        </optgroup>
        
        <optgroup label="Tier Filter" className="bg-white dark:bg-slate-800 text-slate-400">
          <option value="Diamond">Diamond</option>
          <option value="Gold">Gold</option>
          <option value="Silver">Silver</option>
          <option value="Bronze">Bronze</option>
        </optgroup>
      </select>
      
      {/* Custom Chevron */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-600">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  </div>
);

export default DirectoryFilters;