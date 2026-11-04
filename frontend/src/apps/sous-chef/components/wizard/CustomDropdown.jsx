// src/apps/recipes/components/wizard/CustomDropdown.jsx
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

const CustomDropdown = ({ label, value, options, onChange, placeholder = "Select option" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const selectedItem = typeof options[0] === "string" 
    ? options.find((opt) => opt === value) 
    : options.find((opt) => opt.label === value);

  const displayLabel = typeof selectedItem === "string" 
    ? selectedItem 
    : selectedItem?.label || value || placeholder;

  return (
    <div className="relative w-full space-y-1.5" ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer outline-none shadow-xs ${
          isOpen
            ? "bg-white dark:bg-[#1E2533] border-amber-500 ring-2 ring-amber-500/20 text-slate-900 dark:text-slate-100"
            : "bg-white dark:bg-[#161B26] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          size={14}
          strokeWidth={2.5}
          className={`shrink-0 ml-2 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-amber-500" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-[#1A202C] border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-xl shadow-slate-900/10 dark:shadow-black/60 overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-56 overflow-y-auto no-scrollbar p-1.5">
          {options.map((opt) => {
            const optVal = typeof opt === "string" ? opt : opt.label;
            const optDesc = typeof opt === "string" ? null : opt.desc;
            const isSelected = value === optVal;

            return (
              <button
                key={optVal}
                type="button"
                onClick={() => {
                  onChange(optVal);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer mb-0.5 last:mb-0 ${
                  isSelected
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium"
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="truncate">{optVal}</span>
                  {optDesc && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                      {optDesc}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check size={14} strokeWidth={2.5} className="shrink-0 text-amber-600 dark:text-amber-400 ml-1.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;