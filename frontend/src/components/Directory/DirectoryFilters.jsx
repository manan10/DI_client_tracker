import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, Users, AlertCircle, Trophy } from "lucide-react";

const DirectoryFilters = ({ onSearchChange, onTierChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState("All Tiers");
  const dropdownRef = useRef(null);

  const options = [
    { label: "All Tiers", value: "All", icon: <Users size={14} /> },
    { label: "Needs Attention", value: "Attention", icon: <AlertCircle size={14} />, color: "text-red-500" },
    { label: "Diamond", value: "Diamond", icon: <Trophy size={14} />, color: "text-cyan-500" },
    { label: "Gold", value: "Gold", icon: <Trophy size={14} />, color: "text-emerald-500" },
    { label: "Silver", value: "Silver", icon: <Trophy size={14} />, color: "text-slate-400" },
    { label: "Bronze", value: "Bronze", icon: <Trophy size={14} />, color: "text-orange-400" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setSelectedTier(option.label);
    onTierChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
      {/* Search Input */}
      <div className="relative flex-1 md:w-80 w-full">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          size={16}
        />
        <input
          type="text"
          placeholder="Search Name or PAN..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all uppercase placeholder:normal-case font-medium"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Custom Styled Dropdown */}
      <div className="relative w-full sm:w-56" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between px-4 py-2.5 
            bg-white dark:bg-slate-900 border rounded-lg text-sm font-bold
            transition-all duration-200 shadow-sm
            ${isOpen 
              ? 'border-emerald-500 ring-2 ring-emerald-500/10' 
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}
            text-slate-700 dark:text-slate-200
          `}
        >
          <span className="flex items-center gap-2 uppercase tracking-wider text-[11px]">
            {selectedTier}
          </span>
          <ChevronDown 
            size={16} 
            className={`transition-transform duration-200 text-slate-400 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} 
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full flex items-center justify-between px-4 py-2.5 text-sm
                    hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors
                    ${selectedTier === option.label ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className={option.color || "text-slate-400"}>
                      {option.icon}
                    </span>
                    <span className={`font-bold uppercase tracking-widest text-[10px] ${selectedTier === option.label ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {option.label}
                    </span>
                  </div>
                  {selectedTier === option.label && (
                    <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectoryFilters;