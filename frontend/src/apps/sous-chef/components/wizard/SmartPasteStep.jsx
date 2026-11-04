// src/apps/recipes/components/wizard/SmartPasteStep.jsx
import React from "react";
import { Sparkles, ClipboardPaste, Wand2, Loader2, ArrowRight } from "lucide-react";

const SmartPasteStep = ({
  rawText,
  setRawText,
  isAiParsing,
  onAiParse,
  onSkipToManual,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* Intro Hero Capsule */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-xs">
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Sparkles size={14} />
          </div>
          <span>Choose how to create your recipe</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Paste cooking text from a blog, WhatsApp message, or video transcript to auto-fill quantities and directions. You can also skip directly to manual entry.
        </p>
      </div>

      {/* Input Box */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <ClipboardPaste size={12} className="text-amber-500" />
            <span>Recipe Transcript or Text</span>
          </label>
          {rawText && (
            <button
              type="button"
              onClick={() => setRawText("")}
              className="text-[10px] text-slate-400 hover:text-rose-500 font-semibold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <textarea
          rows={9}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={`Paste full recipe here, e.g.:

Restaurant Style Dal Khichdi
Prep: 15 mins, Cook: 20 mins, Servings: 3
Ingredients:
- 1/2 cup Toor dal
- 1/2 cup Rice
- 1 tbsp Ghee
- 1 tsp Cumin seeds
- 1/2 tsp Turmeric

Instructions:
1. Wash dal and rice thoroughly and soak for 20 minutes.
2. Heat ghee in a cooker and add cumin seeds.
3. Pressure cook with turmeric and 3 cups water for 4 whistles.`}
          className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 resize-none font-mono leading-relaxed shadow-xs"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
        <button
          type="button"
          disabled={isAiParsing || !rawText.trim()}
          onClick={onAiParse}
          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 shadow-xs cursor-pointer active:scale-[0.99]"
        >
          {isAiParsing ? (
            <>
              <Loader2 size={14} className="animate-spin text-slate-950" />
              <span>Analyzing Recipe with AI...</span>
            </>
          ) : (
            <>
              <Wand2 size={14} />
              <span>Auto-Fill from Text</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onSkipToManual}
          className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <span>Manual Entry</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default SmartPasteStep;