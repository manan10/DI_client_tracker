// src/apps/recipes/components/wizard/SmartPasteStep.jsx
import React, { useState } from "react";
import {
  Wand2,
  Sparkles,
  ArrowRight,
  ClipboardPaste,
  Link2,
  Loader2,
  Youtube,
  Instagram,
} from "lucide-react";

const SmartPasteStep = ({
  rawText,
  setRawText,
  isAiParsing,
  onAiParse,
  onUrlParse,
  onSkipToManual,
}) => {
  const [importMode, setImportMode] = useState("url"); // "url" | "text"
  const [videoUrl, setVideoUrl] = useState("");

  const handleLinkSubmit = (e) => {
    e.preventDefault();
    if (!videoUrl.trim() || !onUrlParse) return;
    onUrlParse(videoUrl.trim());
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
          <Sparkles size={18} />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Smart AI Recipe Importer
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Import directly from YouTube or Instagram, paste a raw description/transcript, or skip directly to manual entry.
          </p>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setImportMode("url")}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            importMode === "url"
              ? "bg-white dark:bg-[#131924] text-slate-900 dark:text-white shadow-xs"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Link2 size={13} className="text-amber-500" />
          <span>YouTube / Reel Link</span>
        </button>

        <button
          type="button"
          onClick={() => setImportMode("text")}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            importMode === "text"
              ? "bg-white dark:bg-[#131924] text-slate-900 dark:text-white shadow-xs"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <ClipboardPaste size={13} className="text-amber-500" />
          <span>Paste Recipe Text</span>
        </button>
      </div>

      {/* MODE 1: Direct Link Import */}
      {importMode === "url" && (
        <form onSubmit={handleLinkSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Link2 size={13} className="text-amber-500" />
                Paste Video / Reel Link
              </span>
              <div className="flex items-center gap-2 text-slate-400">
                <Youtube size={14} className="hover:text-red-500 transition-colors" />
                <Instagram size={13} className="hover:text-pink-500 transition-colors" />
              </div>
            </label>

            <input
              type="url"
              disabled={isAiParsing}
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://instagram.com/reel/..."
              className="w-full bg-white dark:bg-[#131924] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 font-mono shadow-xs"
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Captions and subtitles will be retrieved and parsed by Gemini automatically.
            </p>
          </div>

          <button
            type="submit"
            disabled={isAiParsing || !videoUrl.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
          >
            {isAiParsing ? (
              <>
                <Loader2 size={14} className="animate-spin text-slate-950" />
                <span>Reading link & parsing recipe...</span>
              </>
            ) : (
              <>
                <Wand2 size={14} />
                <span>Extract from Link</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>
      )}

      {/* MODE 2: Raw Text Paste */}
      {importMode === "text" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ClipboardPaste size={13} className="text-amber-500" />
                <span>Raw Recipe Text or Transcript</span>
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
              rows={8}
              disabled={isAiParsing}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Paste recipe description, WhatsApp message, or video transcript...

e.g.
Dal Khichdi (Serves 3)
Prep: 15 mins, Cook: 20 mins
Ingredients:
- 1/2 cup Toor dal
- 1/2 cup Rice
- 1 tsp Ghee
- 1/2 tsp Jeera

Instructions:
1. Wash dal and rice twice.
2. Heat ghee, splutter cumin.
3. Pressure cook for 4 whistles.`}
              className="w-full bg-white dark:bg-[#131924] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 leading-relaxed resize-none shadow-xs"
            />
          </div>

          <button
            type="button"
            disabled={isAiParsing || !rawText.trim()}
            onClick={onAiParse}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
          >
            {isAiParsing ? (
              <>
                <Loader2 size={14} className="animate-spin text-slate-950" />
                <span>Parsing with Gemini...</span>
              </>
            ) : (
              <>
                <Wand2 size={14} />
                <span>Parse Text with AI</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </div>
      )}

      {/* Manual Fallback */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onSkipToManual}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 underline underline-offset-4 cursor-pointer transition-colors"
        >
          Skip and enter recipe manually &rarr;
        </button>
      </div>
    </div>
  );
};

export default SmartPasteStep;