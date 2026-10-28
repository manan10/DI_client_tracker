import React from 'react';
import { 
  Tv, 
  Heart, 
  Calendar, 
  Scale 
} from 'lucide-react';

const StatsAnalyticsRow = ({ analytics = {} }) => {
  const {
    typeScorecard = [],
    genreAffinity = [],
    timelineActivity = [],
    scoringPersonality = {}
  } = analytics;

  const maxTimelineCount = Math.max(...timelineActivity.map((t) => t.count), 1);

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5 lg:gap-4 w-full font-sans select-none">
      
      {/* ========================================================================= */}
      {/* 1. FORMAT SCORES                                                          */}
      {/* ========================================================================= */}
      <div className="relative w-full h-[190px] sm:h-[220px] p-2.5 sm:p-4 rounded-sm bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-[#262E3B] shadow-xs flex flex-col justify-between overflow-hidden">
        {/* Top Cyan Accent */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#40bcf4] to-transparent opacity-80" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-1.5 sm:pb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="p-0.5 sm:p-1 rounded bg-[#40bcf4]/10 text-[#40bcf4] shrink-0">
              <Tv size={11} className="sm:w-3 sm:h-3" strokeWidth={2.4} />
            </div>
            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">
              Format
            </h4>
          </div>
          <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase shrink-0">
            Avg / 10
          </span>
        </div>

        {/* Rows */}
        <div className="flex-1 min-h-0 divide-y divide-slate-100 dark:divide-white/5 flex flex-col justify-center py-0.5">
          {typeScorecard.map((item, idx) => (
            <div key={idx} className="py-1 sm:py-1.5 flex items-center justify-between text-[11px] sm:text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full ${item.dot} shrink-0`} />
                <span className="font-bold text-slate-900 dark:text-white truncate">
                  {item.label}
                </span>
                <span className="text-[9px] font-mono text-slate-400 hidden xs:inline">
                  ({item.count})
                </span>
              </div>
              <span className={`font-mono font-black tabular-nums shrink-0 ${item.color}`}>
                {item.avgScore}★
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-1.5 sm:pt-2 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-slate-400">
          <span className="truncate">Top: {typeScorecard[0]?.label || 'None'}</span>
          <span className="text-[#40bcf4] font-bold shrink-0">{typeScorecard[0]?.avgScore}★</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LOVED GENRES                                                           */}
      {/* ========================================================================= */}
      <div className="relative w-full h-[190px] sm:h-[220px] p-2.5 sm:p-4 rounded-sm bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-[#262E3B] shadow-xs flex flex-col justify-between overflow-hidden">
        {/* Top Cyan Accent */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#40bcf4] to-transparent opacity-80" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-1.5 sm:pb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="p-0.5 sm:p-1 rounded bg-rose-500/10 text-rose-500 shrink-0">
              <Heart size={11} className="sm:w-3 sm:h-3" strokeWidth={2.4} />
            </div>
            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">
              Loved
            </h4>
          </div>
          <span className="text-[8px] sm:text-[9px] font-mono font-bold text-rose-500 uppercase shrink-0">
            % Fav
          </span>
        </div>

        {/* Rows */}
        <div className="flex-1 min-h-0 divide-y divide-slate-100 dark:divide-white/5 flex flex-col justify-center py-0.5">
          {genreAffinity.length === 0 ? (
            <div className="text-[10px] text-slate-400 font-mono text-center py-2">
              No genre logs
            </div>
          ) : (
            genreAffinity.slice(0, 3).map((g, idx) => (
              <div key={idx} className="py-1 sm:py-1.5 flex items-center justify-between text-[11px] sm:text-xs gap-1.5">
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {g.name}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 leading-none">
                    {g.favCount}/{g.count}
                  </span>
                </div>
                <span className="font-mono font-black text-rose-500 shrink-0 tabular-nums">
                  {g.favRate}%
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-1.5 sm:pt-2 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-slate-400">
          <span className="truncate">Top: {genreAffinity[0]?.name || 'None'}</span>
          <span className="text-rose-500 font-bold shrink-0">{genreAffinity[0]?.favRate || 0}%</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RECENT LOGS (MONTHLY TIMELINE)                                         */}
      {/* ========================================================================= */}
      <div className="relative w-full h-[190px] sm:h-[220px] p-2.5 sm:p-4 rounded-sm bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-[#262E3B] shadow-xs flex flex-col justify-between overflow-hidden">
        {/* Top Cyan Accent */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#40bcf4] to-transparent opacity-80" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-1.5 sm:pb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="p-0.5 sm:p-1 rounded bg-amber-400/10 text-amber-400 shrink-0">
              <Calendar size={11} className="sm:w-3 sm:h-3" strokeWidth={2.4} />
            </div>
            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">
              Logs
            </h4>
          </div>
          <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase shrink-0">
            6 Mo
          </span>
        </div>

        {/* Stepped Micro Bars */}
        <div className="flex-1 min-h-0 w-full flex items-end justify-between gap-1 px-0.5 pt-2 pb-1">
          {timelineActivity.map((point, idx) => {
            const hPct = Math.max(Math.round((point.count / maxTimelineCount) * 100), 10);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[8px] sm:text-[9px] font-mono font-bold text-slate-700 dark:text-stone-300 tabular-nums">
                  {point.count}
                </span>
                <div className="w-full bg-slate-100 dark:bg-[#11161D] rounded-2xs flex flex-col justify-end h-full">
                  <div 
                    style={{ height: `${hPct}%` }} 
                    className="w-full bg-[#40bcf4] rounded-2xs transition-all duration-300" 
                  />
                </div>
                <span className="text-[7px] sm:text-[8px] font-mono font-bold text-slate-500 dark:text-stone-400 truncate">
                  {point.label.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-1.5 sm:pt-2 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-slate-400">
          <span>Cadence</span>
          <span className="text-amber-400 font-bold">Past 6M</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. RATING STYLE                                                           */}
      {/* ========================================================================= */}
      <div className="relative w-full h-[190px] sm:h-[220px] p-2.5 sm:p-4 rounded-sm bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-[#262E3B] shadow-xs flex flex-col justify-between overflow-hidden">
        {/* Top Cyan Accent */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#40bcf4] to-transparent opacity-80" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-1.5 sm:pb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="p-0.5 sm:p-1 rounded bg-purple-500/10 text-purple-400 shrink-0">
              <Scale size={11} className="sm:w-3 sm:h-3" strokeWidth={2.4} />
            </div>
            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">
              Style
            </h4>
          </div>
          <span className="text-[8px] sm:text-[9px] font-mono font-bold text-purple-400 uppercase truncate max-w-[70px] text-right">
            {scoringPersonality.ratingStyle}
          </span>
        </div>

        {/* Metrics Rows */}
        <div className="flex-1 min-h-0 divide-y divide-slate-100 dark:divide-white/5 flex flex-col justify-center py-0.5">
          <div className="py-1.5 sm:py-2 flex items-center justify-between text-[11px] sm:text-xs">
            <div className="min-w-0">
              <span className="font-bold text-slate-900 dark:text-white block truncate">
                Median
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 leading-none">
                Avg {scoringPersonality.avg}★
              </span>
            </div>
            <span className="font-mono font-black text-purple-400 tabular-nums shrink-0">
              {scoringPersonality.median}★
            </span>
          </div>

          <div className="py-1.5 sm:py-2 flex items-center justify-between text-[11px] sm:text-xs">
            <div className="min-w-0">
              <span className="font-bold text-slate-900 dark:text-white block truncate">
                Sub-8.0
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 leading-none">
                {scoringPersonality.subEightCount} casual
              </span>
            </div>
            <span className="font-mono font-black text-slate-900 dark:text-white tabular-nums shrink-0">
              {scoringPersonality.subEightRate}%
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-1.5 sm:pt-2 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-slate-400">
          <span>Critique</span>
          <span className="text-purple-400 font-bold truncate max-w-[80px]">
            {scoringPersonality.ratingStyle}
          </span>
        </div>
      </div>

    </section>
  );
};

export default StatsAnalyticsRow;