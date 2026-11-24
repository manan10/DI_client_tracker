// src/apps/recipes/components/RecipeDetails/RecipeCommandBar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Share2, Flame, Wand2 } from "lucide-react";

const RecipeCommandBar = ({ onBack, onShare, onOpenImport, cookModeUrl }) => {
  return (
    <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-200 dark:border-stone-700/80">
      {/* Left: Compact Back Navigation */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-stone-700 hover:text-stone-950 dark:text-stone-200 dark:hover:text-white hover:bg-stone-200/70 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
      >
        <ArrowLeft size={15} />
        <span>Recipes</span>
      </button>

      {/* Right: Single-Row Action Cluster (Icon-Compact on Mobile, Labeled on Desktop) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onOpenImport}
          title="AI Extract from Link or Text"
          className="inline-flex items-center justify-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 transition-colors text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
        >
          <Wand2 size={14} className="shrink-0" />
          <span className="hidden md:inline">AI Extract</span>
        </button>

        <button
          type="button"
          onClick={onShare}
          title="Copy Recipe Link"
          className="inline-flex items-center justify-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-[#24201C] text-stone-800 dark:text-stone-100 hover:border-stone-400 dark:hover:border-stone-500 transition-colors text-xs font-mono font-bold uppercase tracking-wider shadow-2xs cursor-pointer"
        >
          <Share2 size={14} className="shrink-0" />
          <span className="hidden md:inline">Share</span>
        </button>

        <Link
          to={cookModeUrl}
          className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm shadow-amber-500/20 active:scale-95 shrink-0"
        >
          <Flame size={14} fill="currentColor" />
          <span>Cook</span>
          <span className="hidden sm:inline">Mode</span>
        </Link>
      </div>
    </div>
  );
};

export default RecipeCommandBar;