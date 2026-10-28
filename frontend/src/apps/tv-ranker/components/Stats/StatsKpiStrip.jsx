import React from 'react';
import { 
  Tv, 
  Star, 
  Flame, 
  Sparkles, 
  Heart, 
  PlayCircle, 
  Clock, 
  XCircle 
} from 'lucide-react';

const StatsKpiStrip = ({ analytics = {} }) => {
  const cards = [
    { 
      label: 'Shows', 
      fullLabel: 'Total Shows',
      val: analytics.total ?? 0, 
      sub: 'In your list', 
      icon: Tv, 
      accentColor: 'text-[#40bcf4]',
      badgeBg: 'bg-[#40bcf4]/10 text-[#40bcf4] border-[#40bcf4]/30'
    },
    { 
      label: 'Average', 
      fullLabel: 'Average Score',
      val: analytics.avgScore || '0.00', 
      sub: 'Out of 10', 
      icon: Star, 
      accentColor: 'text-amber-500 dark:text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
    },
    { 
      label: 'Top Tier', 
      fullLabel: 'Top Tier (9+)',
      val: `${analytics.godTierRate ?? 0}%`, 
      sub: `${analytics.godTier ?? 0} rated 9+`, 
      icon: Flame, 
      accentColor: 'text-rose-500 dark:text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
    },
    { 
      label: 'Top Genre', 
      fullLabel: 'Best Genre',
      val: analytics.topGenreName || 'None', 
      sub: analytics.topGenreAvg ? `${analytics.topGenreAvg}★ avg` : 'No ratings', 
      icon: Sparkles, 
      accentColor: 'text-purple-600 dark:text-purple-300',
      badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30'
    },
    { 
      label: 'Loved', 
      fullLabel: 'Favorites',
      val: analytics.favorites ?? 0, 
      sub: `${analytics.favoritesRate ?? 0}% of all`, 
      icon: Heart, 
      accentColor: 'text-pink-500 dark:text-pink-400',
      badgeBg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30'
    },
    { 
      label: 'Watching', 
      fullLabel: 'In Progress',
      val: analytics.watching ?? 0, 
      sub: 'In progress', 
      icon: PlayCircle, 
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    },
    { 
      label: 'Queued', 
      fullLabel: 'Watch Later',
      val: analytics.planToWatch ?? 0, 
      sub: 'Plan to watch', 
      icon: Clock, 
      accentColor: 'text-sky-600 dark:text-[#40bcf4]',
      badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-[#40bcf4] border-sky-500/30'
    },
    { 
      label: 'Dropped', 
      fullLabel: 'Stopped Early',
      val: `${analytics.dropRate ?? 0}%`, 
      sub: `${analytics.dropped ?? 0} stopped`, 
      icon: XCircle, 
      accentColor: 'text-slate-600 dark:text-slate-300',
      badgeBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-400/30 dark:border-white/10'
    }
  ];

  return (
    <section className="grid grid-cols-4 xl:grid-cols-8 gap-1.5 sm:gap-2.5 lg:gap-3 w-full font-sans select-none">
      {cards.map((card, i) => (
        <div 
          key={i}
          className="relative group p-2 sm:p-3 rounded-sm bg-white dark:bg-[#161B22] border border-slate-200/90 dark:border-[#262E3B] hover:border-cyan-400/80 dark:hover:border-[#40bcf4] shadow-xs dark:shadow-[0_8px_20px_rgba(0,0,0,0.4)] flex flex-col justify-between gap-1.5 sm:gap-2.5 overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
        >
          {/* Cyan Horizon Edge Glow Accent */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#40bcf4] to-transparent opacity-80 group-hover:opacity-100 group-hover:shadow-[0_0_8px_rgba(64,188,244,0.7)] transition-all pointer-events-none" />

          {/* Top Row: Responsive layout prevents text from competing with icon on mobile */}
          <div className="flex items-start justify-between gap-1">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-stone-400 leading-tight">
              {/* Short label on mobile so words never truncate */}
              <span className="inline sm:hidden">{card.label}</span>
              {/* Full label on tablet and desktop */}
              <span className="hidden sm:inline">{card.fullLabel}</span>
            </span>

            <div className={`p-1 rounded-md border shrink-0 ${card.badgeBg}`}>
              <card.icon size={11} strokeWidth={2.5} />
            </div>
          </div>

          {/* Value Display */}
          <div className="min-w-0">
            <span className={`text-sm sm:text-lg lg:text-xl font-[1000] font-mono tracking-tight leading-none block truncate ${card.accentColor}`}>
              {card.val}
            </span>
            <p className="text-[8px] sm:text-[9px] font-medium text-slate-400 dark:text-stone-400 truncate mt-1 leading-none">
              {card.sub}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default StatsKpiStrip;