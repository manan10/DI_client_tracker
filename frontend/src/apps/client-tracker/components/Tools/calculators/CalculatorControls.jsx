import React, { useState, useEffect, useRef } from "react";
import { Minus, Plus, ChevronDown, Check } from "lucide-react";

/**
 * Custom Tactile Slider + Stepper Input Component
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
  accent = "emerald", // 'emerald' | 'indigo' | 'amber'
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

  const accentStyles = {
    emerald: {
      bar: "bg-emerald-500",
      thumb: "border-emerald-600",
      ring: "focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15",
      presetActive: "bg-emerald-600 text-white border-emerald-600 shadow-2xs",
    },
    indigo: {
      bar: "bg-indigo-500",
      thumb: "border-indigo-600",
      ring: "focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/15",
      presetActive: "bg-indigo-600 text-white border-indigo-600 shadow-2xs",
    },
    amber: {
      bar: "bg-amber-500",
      thumb: "border-amber-600",
      ring: "focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/15",
      presetActive: "bg-amber-600 text-white border-amber-600 shadow-2xs",
    },
  }[accent] || {
    bar: "bg-emerald-500",
    thumb: "border-emerald-600",
    ring: "focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15",
    presetActive: "bg-emerald-600 text-white border-emerald-600",
  };

  return (
    <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/10 rounded-xl p-4 sm:p-5 space-y-3 shadow-2xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-[180px]">
          <label className="text-sm font-bold text-slate-900 dark:text-white block">
            {label}
          </label>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div
          className={`inline-flex items-center bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-white/15 rounded-xl overflow-hidden shadow-2xs transition-all shrink-0 ${accentStyles.ring}`}
        >
          <button
            type="button"
            onClick={() => handleStep(-step)}
            disabled={value <= min}
            aria-label="Decrease"
            className="px-2.5 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <Minus size={13} strokeWidth={2.5} />
          </button>

          <div className="flex items-center px-2 border-x border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02]">
            {prefix && (
              <span className="text-xs font-bold text-slate-400 mr-1 select-none">
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
              className="w-24 text-center text-sm font-extrabold text-slate-900 dark:text-white bg-transparent outline-none tabular-nums py-1.5"
            />
            {suffix && (
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 select-none">
                {suffix}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleStep(step)}
            disabled={value >= max}
            aria-label="Increase"
            className="px-2.5 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <Plus size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="relative h-6 flex items-center select-none group">
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
          <div
            style={{ width: `${fillPct}%` }}
            className={`h-full ${accentStyles.bar} transition-all duration-75`}
          />
        </div>

        <div
          style={{ left: `calc(${fillPct}% - 9px)` }}
          className={`pointer-events-none absolute w-[18px] h-[18px] rounded-full bg-white border-[3px] ${accentStyles.thumb} shadow-md transition-transform group-hover:scale-110`}
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
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {presets.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange(p.value)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer tabular-nums ${
                value === p.value
                  ? accentStyles.presetActive
                  : "bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      ) : (
        ticks && (
          <div className="flex justify-between text-[11px] font-medium text-slate-400 tabular-nums -mt-1">
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
 * Custom Styled Dropdown (Zero Native <select> Styling)
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
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-white/15 hover:border-emerald-500 text-xs font-bold text-slate-900 dark:text-white transition-colors cursor-pointer"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          size={14}
          className={`text-slate-400 shrink-0 transition-transform duration-150 ${
            open ? "rotate-180 text-emerald-600" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1.5 rounded-xl bg-white dark:bg-[#131C31] border border-slate-200 dark:border-white/15 shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
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
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={13} className="text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};