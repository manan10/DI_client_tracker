import React, { useState, useEffect, useRef } from "react";
import { Minus, Plus, ChevronDown, Check } from "lucide-react";

/**
 * Custom Tactile Slider + Stepper Input Component (Sora Architectural & Sky Blue Edition)
 */
export const TactileSliderInput = ({
  label,
  description,
  value,
  onChange,
  min,
  max,
  step,
  sliderMax,
  prefix,
  suffix,
  accent = "sky", // 'sky' | 'emerald' (mapped to sky) | 'indigo' | 'amber'
  presets,
  ticks,
}) => {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const effectiveSliderMax = sliderMax ?? max;
  const clampedForBar = Math.min(effectiveSliderMax, Math.max(min, Number(value) || min));
  const fillPct =
    effectiveSliderMax > min
      ? ((clampedForBar - min) / (effectiveSliderMax - min)) * 100
      : 0;

  const commitDraft = () => {
    const parsed = parseFloat(draft);
    if (Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }
    const clamped = Math.min(max, Math.max(min, parsed));
    onChange(clamped);
    setDraft(String(clamped));
  };

  const handleStep = (delta) => {
    const next = Math.min(max, Math.max(min, Number((value + delta).toFixed(2))));
    onChange(next);
  };

  const skyTheme = {
    bar: "bg-sky-600 dark:bg-sky-500",
    thumb: "border-sky-600 dark:border-sky-400",
    presetActive: "bg-sky-600 dark:bg-sky-500 text-white border-sky-600 dark:border-sky-400 shadow-2xs",
  };

  const accentStyles = {
    sky: skyTheme,
    emerald: skyTheme,
    indigo: {
      bar: "bg-indigo-600 dark:bg-indigo-500",
      thumb: "border-indigo-600 dark:border-indigo-400",
      presetActive: "bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-400 shadow-2xs",
    },
    amber: {
      bar: "bg-amber-600 dark:bg-amber-500",
      thumb: "border-amber-600 dark:border-amber-400",
      presetActive: "bg-amber-600 dark:bg-amber-500 text-white border-amber-600 dark:border-amber-400 shadow-2xs",
    },
  }[accent] || skyTheme;

  return (
    <div className="bg-white dark:bg-[#1B2230] border border-slate-300 dark:border-slate-700/80 rounded-lg p-3.5 sm:p-4.5 space-y-3 shadow-2xs">
      {/* Header + Tactile Stepper */}
      <div className="flex items-center sm:items-start justify-between gap-2.5 sm:gap-3">
        <div className="flex-1 min-w-0">
          <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block leading-snug">
            {label}
          </label>
          {description && (
            <p className="text-[11px] sm:text-xs font-normal text-slate-500 dark:text-slate-300/80 mt-0.5 leading-snug line-clamp-1 sm:line-clamp-none">
              {description}
            </p>
          )}
        </div>

        <div className="inline-flex items-center bg-white dark:bg-[#232B3D] border border-slate-300 dark:border-slate-600 focus-within:border-sky-600 dark:focus-within:border-sky-400 rounded-md overflow-hidden shadow-2xs transition-colors shrink-0">
          <button
            type="button"
            onClick={() => handleStep(-step)}
            disabled={value <= min}
            aria-label="Decrease"
            className="px-2.5 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 disabled:opacity-35 transition-colors cursor-pointer"
          >
            <Minus size={13} strokeWidth={2.5} />
          </button>

          <div className="flex items-center justify-center px-2 sm:px-2.5 border-x border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#1B2230]/60">
            {prefix && (
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-300 mr-1 select-none">
                {prefix}
              </span>
            )}
            <input
              type="text"
              inputMode="decimal"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                const parsed = parseFloat(e.target.value);
                if (!Number.isNaN(parsed) && parsed >= min && parsed <= max) {
                  onChange(parsed);
                }
              }}
              onBlur={commitDraft}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              className="w-16 sm:w-24 text-center text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white bg-transparent outline-none tabular-nums py-1.5"
            />
            {suffix && (
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-300 ml-1 select-none">
                {suffix}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleStep(step)}
            disabled={value >= max}
            aria-label="Increase"
            className="px-2.5 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 disabled:opacity-35 transition-colors cursor-pointer"
          >
            <Plus size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Slider Track & Thumb */}
      <div className="relative h-6 flex items-center select-none group touch-pan-y">
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700/80 border border-slate-300/70 dark:border-slate-600/80 overflow-hidden">
          <div
            style={{ width: `${fillPct}%` }}
            className={`h-full ${accentStyles.bar} transition-all duration-75`}
          />
        </div>

        <div
          style={{ left: `calc(${fillPct}% - 9px)` }}
          className={`pointer-events-none absolute w-[18px] h-[18px] rounded-full bg-white dark:bg-slate-100 border-[3px] ${accentStyles.thumb} shadow-md transition-transform group-hover:scale-110`}
        />

        <input
          type="range"
          min={min}
          max={effectiveSliderMax}
          step={step}
          value={clampedForBar}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {presets ? (
        <div className="flex items-center sm:flex-wrap gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          {presets.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange(p.value)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer tabular-nums shrink-0 active:scale-95 ${
                value === p.value
                  ? accentStyles.presetActive
                  : "bg-slate-50 dark:bg-[#232B3D] text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600/80 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      ) : (
        ticks && (
          <div className="flex justify-between text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums -mt-1">
            {ticks.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
        )
      )}
    </div>
  );
};

/**
 * Custom Styled Dropdown (Sora Architectural & Sky Blue Edition)
 */
export const CustomDropdown = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
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

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-slate-50 dark:bg-[#232B3D] border border-slate-300 dark:border-slate-600 hover:border-sky-600 dark:hover:border-sky-400 text-xs font-bold text-slate-900 dark:text-white transition-colors cursor-pointer"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          size={14}
          className={`text-slate-500 dark:text-slate-300 shrink-0 transition-transform duration-150 ${
            open ? "rotate-180 text-sky-600 dark:text-sky-400" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1 rounded-md bg-white dark:bg-[#232B3D] border border-slate-300 dark:border-slate-600 shadow-xl p-1 z-50 max-h-60 overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs font-semibold text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-sky-50 dark:bg-sky-500/20 text-sky-800 dark:text-sky-200 font-bold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70"
                }`}
              >
                <span className="truncate pr-2">{opt.label}</span>
                {isSelected && <Check size={13} className="text-sky-600 dark:text-sky-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};