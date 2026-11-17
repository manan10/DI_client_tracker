// src/apps/recipes/components/wizard/CustomDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

const CustomDropdown = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("touchstart", handleOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  const normalizedOptions = (options || []).map((opt) =>
    typeof opt === "string"
      ? { value: opt, label: opt, desc: null }
      : { value: opt.label, label: opt.label, desc: opt.desc }
  );

  const selected =
    normalizedOptions.find((o) => o.value === value) || normalizedOptions[0];

  return (
    <div className="space-y-1.5 relative font-mono" ref={dropdownRef}>
      {label && (
        <label className="block text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full h-10 px-3 border text-xs font-mono flex items-center justify-between gap-2 transition-colors cursor-pointer outline-none ${
          open
            ? "border-stone-900 dark:border-amber-400 bg-amber-500/10 dark:bg-amber-500/15 text-stone-900 dark:text-amber-300"
            : "border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#14110E] hover:border-stone-900 dark:hover:border-stone-500 text-stone-900 dark:text-white"
        }`}
      >
        <span className="font-extrabold uppercase tracking-wider truncate text-[11px]">
          {selected?.label || value}
        </span>
        <ChevronDown
          size={13}
          className={`text-stone-500 dark:text-stone-400 shrink-0 transition-transform duration-150 ${
            open ? "rotate-180 text-amber-700 dark:text-amber-400" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1 border-2 border-stone-900 dark:border-stone-600 bg-[#FAF9F6] dark:bg-[#14110E] shadow-lg divide-y divide-stone-200 dark:divide-stone-800 z-40 max-h-60 overflow-y-auto no-scrollbar">
          {normalizedOptions.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors cursor-pointer ${
                  active
                    ? "bg-stone-900 dark:bg-[#f59e0b] text-white dark:text-[#140F0A]"
                    : "text-stone-800 dark:text-stone-200 hover:bg-stone-200/70 dark:hover:bg-white/5"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="text-[11px] font-mono font-extrabold uppercase tracking-wider truncate">
                    {opt.label}
                  </div>
                  {opt.desc && (
                    <div
                      className={`text-[10px] font-mono truncate mt-0.5 ${
                        active
                          ? "text-stone-300 dark:text-stone-900"
                          : "text-stone-500 dark:text-stone-400"
                      }`}
                    >
                      {opt.desc}
                    </div>
                  )}
                </div>
                {active && <Check size={13} strokeWidth={2.8} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;