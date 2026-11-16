// src/apps/recipes/components/RecipeDetails/RecipeCommandBar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Share2, Flame } from "lucide-react";

const RecipeCommandBar = ({ onBack, onShare, cookModeUrl }) => {
  return (
    <div className="flex items-center justify-between gap-4 pb-3.5 sm:pb-4 border-b border-stone-200 dark:border-stone-700/80 mb-4 sm:mb-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-stone-700 hover:text-stone-950 dark:text-stone-200 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-all cursor-pointer"
      >
        <ArrowLeft size={15} />
        <span>Back</span>
      </button>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-[#24201C] text-stone-800 dark:text-stone-100 hover:border-stone-400 dark:hover:border-stone-500 hover:text-stone-950 dark:hover:text-white transition-all text-xs font-mono font-bold uppercase tracking-wider shadow-xs cursor-pointer"
        >
          <Share2 size={13} />
          <span>Share</span>
        </button>

        <Link
          to={cookModeUrl}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wide transition-all shadow-md shadow-amber-500/20 active:scale-95 font-mono"
        >
          <Flame size={14} fill="currentColor" />
          <span>Start Cooking</span>
        </Link>
      </div>
    </div>
  );
};

export default RecipeCommandBar;