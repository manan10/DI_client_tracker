import React, { useState } from 'react';
import { Sparkles, Loader2, RotateCcw } from 'lucide-react';

const AiNoteRefiner = ({ value, onChange, placeholder }) => {
  const [isRefining, setIsRefining] = useState(false);
  const [originalText, setOriginalText] = useState('');

  const handleRefine = async () => {
    if (!value || value.trim().length < 3) return;
    
    setIsRefining(true);
    setOriginalText(value); // Save in case the user wants to undo

    try {
      // This calls YOUR backend route that talks to Gemini
      const response = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: value }),
      });

      const result = await response.json();
      if (result.refinedText) {
        onChange(result.refinedText);
      }
    } catch (error) {
      console.error("AI Refinement failed", error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleUndo = () => {
    onChange(originalText);
    setOriginalText('');
  };

  return (
    <div className="relative w-full group">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-25 p-4 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all resize-none"
      />
      
      <div className="absolute bottom-3 right-3 flex gap-2">
        {originalText && !isRefining && (
          <button
            onClick={handleUndo}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            <RotateCcw size={12} /> Undo
          </button>
        )}
        
        <button
          onClick={handleRefine}
          disabled={isRefining || !value}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-900/20"
        >
          {isRefining ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Sparkles size={12} />
          )}
          {isRefining ? "Refining..." : "Refine with AI"}
        </button>
      </div>
    </div>
  );
};

export default AiNoteRefiner;