import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, Users, AlertCircle, Trophy, SlidersHorizontal } from "lucide-react";

const DirectoryFilters = ({ onSearchChange, onTierChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState("All Tiers");
  const dropdownRef = useRef(null);

  const options = [
    { label: "All Tiers", value: "All", icon: <Users size={15} strokeWidth={2.5} />, color: "text-slate-500 dark:text-slate-400" },
    { label: "Needs Attention", value: "Attention", icon: <AlertCircle size={15} strokeWidth={2.5} />, color: "text-rose-500 dark:text-rose-400" },
    { label: "Diamond", value: "Diamond", icon: <Trophy size={15} strokeWidth={2.5} />, color: "text-cyan-500 dark:text-cyan-400" },
    { label: "Gold", value: "Gold", icon: <Trophy size={15} strokeWidth={2.5} />, color: "text-amber-500 dark:text-amber-400" },
    { label: "Silver", value: "Silver", icon: <Trophy size={15} strokeWidth={2.5} />, color: "text-slate-400 dark:text-slate-400" },
    { label: "Bronze", value: "Bronze", icon: <Trophy size={15} strokeWidth={2.5} />, color: "text-orange-500 dark:text-orange-400" },
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

  const currentOption = options.find(opt => opt.label === selectedTier) || options[0];

  return (
    <div className="flex flex-col sm:flex-row gap-3.5 w-full lg:w-auto items-center">
      
      {/* Search Input Box */}
      <div className="relative flex-1 lg:w-85 w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <Search size={16} strokeWidth={2.5} />
        </div>
        <input
          type="text"
          placeholder="SEARCH CLIENT NAME OR PAN..."
          className="w-full pl-10 pr-4 h-11 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 shadow-sm transition-all uppercase placeholder:normal-case tracking-wider"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Tier Filter Dropdown */}
      <div className="relative w-full sm:w-60" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between px-4 h-11 
            bg-white dark:bg-[#0B1120] border rounded-lg text-xs font-bold
            transition-all duration-200 shadow-sm outline-none cursor-pointer
            ${isOpen 
              ? 'border-emerald-500 ring-2 ring-emerald-500/15' 
              : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}
            text-slate-800 dark:text-slate-200
          `}
        >
          <span className="flex items-center gap-2.5 uppercase tracking-wider text-[11px] truncate min-w-0">
            <span className={`${currentOption.color} shrink-0`}>
              {currentOption.icon}
            </span>
            <span className="truncate">{selectedTier}</span>
          </span>
          <ChevronDown 
            size={16} 
            strokeWidth={2.5}
            className={`transition-transform duration-300 text-slate-400 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} 
          />
        </button>

        {/* Dropdown Menu Overlay */}
        {isOpen && (
          <div className="absolute right-0 sm:left-0 z-50 w-full mt-2 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-1.5 flex flex-col gap-1">
              {options.map((option) => {
                const isSelected = selectedTier === option.label;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full flex items-center justify-between px-3.5 py-3 rounded-md text-xs
                      transition-colors cursor-pointer outline-none group
                      ${isSelected 
                        ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold' 
                        : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`${option.color} shrink-0 group-hover:scale-110 transition-transform`}>
                        {option.icon}
                      </span>
                      <span className={`uppercase tracking-wider text-[11px] truncate ${isSelected ? 'font-black text-emerald-600 dark:text-emerald-400' : 'font-semibold'}`}>
                        {option.label}
                      </span>
                    </div>
                    {isSelected && (
                      <Check size={15} strokeWidth={3} className="text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default DirectoryFilters;