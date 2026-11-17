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
}) => {
  const [importMode, setImportMode] = useState("url"); // "url" | "text"
  const [videoUrl, setVideoUrl] = useState("");

  const handleLinkSubmit = (e) => {
    e.preventDefault();
    if (!videoUrl.trim() || !onUrlParse) return;
    onUrlParse(videoUrl.trim());
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Subtle Info Box */}
      <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14110E] p-3.5 flex items-start gap-3">
        <div className="w-7 h-7 border border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
          <Sparkles size={14} />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 dark:text-white">
            AI Recipe Importer
          </h3>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
            Paste a YouTube or Instagram link, or drop raw recipe text below. Once extracted, you'll return to Details with everything filled in.
          </p>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#14110E] divide-x divide-stone-300 dark:divide-stone-700">
        <button
          type="button"
          onClick={() => setImportMode("url")}
          className={`h-9 px-3 text-[11px] font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            importMode === "url"
              ? "bg-stone-900 dark:bg-[#f59e0b] text-white dark:text-[#140F0A] font-extrabold"
              : "text-stone-600 dark:text-stone-400 font-bold hover:text-stone-900 dark:hover:text-white"
          }`}
        >
          <Link2 size={13} />
          <span>YouTube / Reel Link</span>
        </button>

        <button
          type="button"
          onClick={() => setImportMode("text")}
          className={`h-9 px-3 text-[11px] font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            importMode === "text"
              ? "bg-stone-900 dark:bg-[#f59e0b] text-white dark:text-[#140F0A] font-extrabold"
              : "text-stone-600 dark:text-stone-400 font-bold hover:text-stone-900 dark:hover:text-white"
          }`}
        >
          <ClipboardPaste size={13} />
          <span>Paste Recipe Text</span>
        </button>
      </div>

      {/* MODE 1: Direct Link Import */}
      {importMode === "url" && (
        <form
          onSubmit={handleLinkSubmit}
          className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14110E] p-4 space-y-3.5"
        >
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Link2 size={12} className="text-amber-700 dark:text-amber-400" />
                Paste Video / Reel Link
              </span>
              <span className="flex items-center gap-2 text-stone-400 dark:text-stone-500">
                <Youtube size={14} />
                <Instagram size={13} />
              </span>
            </label>

            <input
              type="url"
              disabled={isAiParsing}
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://instagram.com/reel/..."
              className="w-full h-9 px-3 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-xs font-mono text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-stone-900 dark:focus:border-amber-400 transition-colors"
            />
            <p className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
              Captions and subtitles will be retrieved and parsed automatically.
            </p>
          </div>

          <button
            type="submit"
            disabled={isAiParsing || !videoUrl.trim()}
            className="w-full h-9 px-4 border border-stone-900 dark:border-[#f59e0b] bg-stone-900 hover:bg-stone-800 dark:bg-[#f59e0b] dark:hover:bg-amber-400 disabled:opacity-40 text-white dark:text-[#140F0A] font-mono font-extrabold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {isAiParsing ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Reading link & parsing recipe...</span>
              </>
            ) : (
              <>
                <Wand2 size={13} />
                <span>Extract & Return to Details</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>
      )}

      {/* MODE 2: Raw Text Paste */}
      {importMode === "text" && (
        <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14110E] p-4 space-y-3.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <ClipboardPaste size={12} className="text-amber-700 dark:text-amber-400" />
                <span>Raw Recipe Text or Transcript</span>
              </label>
              {rawText && (
                <button
                  type="button"
                  onClick={() => setRawText("")}
                  className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
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
              className="w-full p-3 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-xs font-mono text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-stone-900 dark:focus:border-amber-400 leading-relaxed resize-none transition-colors"
            />
          </div>

          <button
            type="button"
            disabled={isAiParsing || !rawText.trim()}
            onClick={onAiParse}
            className="w-full h-9 px-4 border border-stone-900 dark:border-[#f59e0b] bg-stone-900 hover:bg-stone-800 dark:bg-[#f59e0b] dark:hover:bg-amber-400 disabled:opacity-40 text-white dark:text-[#140F0A] font-mono font-extrabold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {isAiParsing ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Parsing with Gemini...</span>
              </>
            ) : (
              <>
                <Wand2 size={13} />
                <span>Parse Text & Return to Details</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartPasteStep;