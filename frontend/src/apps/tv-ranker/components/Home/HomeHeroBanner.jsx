import React from 'react';
import { Flame } from 'lucide-react';

const HomeHeroBanner = ({ stats }) => {
  return (
    <header className="p-5 sm:p-7 rounded-lg bg-linear-to-r from-rose-950 via-slate-900 to-[#0F1424] border border-rose-500/30 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-full bg-linear-to-l from-rose-500/15 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-2xl space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-white/10 border border-white/15 text-rose-300 text-[9px] font-mono font-bold uppercase tracking-[0.2em]">
          <Flame size={12} className="text-amber-400" />
          <span>Unapologetic Binge Critic</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold uppercase tracking-[0.14em] leading-tight text-white">
          The Couch <span className="bg-linear-to-r from-amber-300 via-rose-300 to-fuchsia-300 bg-clip-text text-transparent not-italic">Verdict</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
          No director spared, no season finale forgiven. Welcome to the official family ledger where 8.5 means something and scores change whenever a rewatch demands it.
        </p>
      </div>

      {/* Quick Telemetry Hub */}
      <div className="relative z-10 grid grid-cols-4 gap-2.5 sm:gap-3 bg-black/40 backdrop-blur-md p-3 sm:p-4 rounded-md border border-white/10 shrink-0 self-start lg:self-auto">
        <div className="flex flex-col text-center px-1">
          <span className="text-xl sm:text-2xl font-mono font-black text-white leading-none">
            {stats.total}
          </span>
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 mt-1">
            Titles
          </span>
        </div>

        <div className="flex flex-col text-center px-1 border-l border-white/10">
          <span className="text-xl sm:text-2xl font-mono font-black text-amber-400 leading-none">
            {stats.avgScore}
          </span>
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 mt-1">
            Mean Score
          </span>
        </div>

        <div className="flex flex-col text-center px-1 border-l border-white/10">
          <span className="text-xl sm:text-2xl font-mono font-black text-rose-400 leading-none">
            {stats.godTierCount}
          </span>
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 mt-1">
            9.0+ Elite
          </span>
        </div>

        <div className="flex flex-col text-center px-1 border-l border-white/10">
          <span className="text-xl sm:text-2xl font-mono font-black text-cyan-400 leading-none">
            {stats.completed}
          </span>
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 mt-1">
            Binge Done
          </span>
        </div>
      </div>
    </header>
  );
};

export default HomeHeroBanner;