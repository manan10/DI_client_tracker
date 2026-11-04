// src/apps/recipes/components/Recipies/CustomSelect.jsx
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

const CustomSelect = ({
  value,
  onChange,
  options,
  icon: Icon,
  label,
  className = "",
}) => {
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

  const currentOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 sm:py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none shadow-2xs ${
          isOpen
            ? "bg-white dark:bg-[#1E1915] border-amber-500 ring-2 ring-amber-500/20 text-stone-900 dark:text-stone-100"
            : "bg-white dark:bg-[#151311] border-stone-200 dark:border-[#2C241E] text-stone-700 dark:text-stone-200 hover:border-amber-400 dark:hover:border-stone-700"
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {Icon && <Icon size={14} className="text-amber-600 dark:text-[#f59e0b] shrink-0" />}
          {label && (
            <span className="text-stone-400 dark:text-stone-500 font-medium shrink-0">
              {label}:
            </span>
          )}
          <span className="truncate font-bold text-stone-900 dark:text-stone-100">
            {currentOption?.label || value}
          </span>
        </div>

        <ChevronDown
          size={14}
          strokeWidth={2.5}
          className={`shrink-0 text-stone-400 dark:text-stone-500 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-amber-500" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 w-48 sm:w-56 bg-white dark:bg-[#181512] border border-stone-200 dark:border-[#2C241E] rounded-xl shadow-xl shadow-stone-900/10 dark:shadow-black/60 overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-[#f59e0b] font-bold"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check size={14} strokeWidth={2.5} className="shrink-0 text-amber-600 dark:text-[#f59e0b] ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;