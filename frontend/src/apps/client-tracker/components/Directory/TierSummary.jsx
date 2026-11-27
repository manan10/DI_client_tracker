import React from "react";
import { X, TrendingUp } from "lucide-react";

const TierSummary = ({ families, activeTier, thresholds, onTierSelect }) => {
  if (!thresholds || !families || families.length === 0) return null;

  const totalAum = families.reduce((acc, f) => acc + (f.familyAum || 0), 0);
  const totalAumCr = (totalAum / 10000000).toFixed(2);
  const totalFamilies = families.length;
  const totalIndividuals = families.reduce(
    (acc, f) => acc + (f.members?.length || 1),
    0
  );

  const stats = families.reduce((acc, f) => {
    const cat = f.category || "Bronze";
    if (!acc[cat]) acc[cat] = { count: 0, aum: 0 };
    acc[cat].count += 1;
    acc[cat].aum += f.familyAum || 0;
    return acc;
  }, {});

  const formatLimit = (val) => {
    if (val === undefined || val === null) return "0";
    return val < 1 ? `${Math.round(val * 100)}L` : `${val}Cr`;
  };

  const tiers = [
    {
      label: "Diamond",
      barColor: "bg-cyan-500",
      dotColor: "bg-cyan-500",
      text: "text-cyan-600 dark:text-cyan-400",
      activeBg:
        "bg-cyan-50/90 dark:bg-cyan-500/15 border-cyan-400 dark:border-cyan-500/50",
      range: `> ${formatLimit(thresholds.diamond)}`,
    },
    {
      label: "Gold",
      barColor: "bg-amber-500",
      dotColor: "bg-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      activeBg:
        "bg-amber-50/90 dark:bg-amber-500/15 border-amber-400 dark:border-amber-500/50",
      range: `${formatLimit(thresholds.gold)}–${formatLimit(thresholds.diamond)}`,
    },
    {
      label: "Silver",
      barColor: "bg-slate-400",
      dotColor: "bg-slate-400",
      text: "text-slate-600 dark:text-slate-300",
      activeBg:
        "bg-slate-100 dark:bg-slate-700/40 border-slate-400 dark:border-slate-500",
      range: `${formatLimit(thresholds.silver)}–${formatLimit(thresholds.gold)}`,
    },
    {
      label: "Bronze",
      barColor: "bg-orange-500",
      dotColor: "bg-orange-500",
      text: "text-orange-600 dark:text-orange-400",
      activeBg:
        "bg-orange-50/90 dark:bg-orange-500/15 border-orange-400 dark:border-orange-500/50",
      range: `< ${formatLimit(thresholds.silver)}`,
    },
  ].map((t) => {
    const tierStat = stats[t.label] || { count: 0, aum: 0 };
    const aumPct = totalAum > 0 ? (tierStat.aum / totalAum) * 100 : 0;
    return {
      ...t,
      count: tierStat.count,
      aumCr: (tierStat.aum / 10000000).toFixed(2),
      percentage: aumPct.toFixed(1),
      rawPct: aumPct,
      isActive: activeTier === t.label,
    };
  });

  const handleToggleTier = (label, isActive) => {
    onTierSelect?.(isActive ? "All" : label);
  };

  return (
    <div className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg p-3 sm:p-4 shadow-2xs">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 xl:gap-6">
        {/* LEFT: Compact Hero AUM + Segmented Distribution Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between xl:justify-start gap-2.5 sm:gap-5 xl:min-w-[340px]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:flex w-9 h-9 rounded-md bg-sky-50 dark:bg-sky-500/10 border border-sky-200/70 dark:border-sky-500/20 items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
              <TrendingUp size={17} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Managed Book
                </span>
                {activeTier && activeTier !== "All" && (
                  <button
                    type="button"
                    onClick={() => onTierSelect?.("All")}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/30 cursor-pointer"
                  >
                    <span>{activeTier}</span>
                    <X size={10} />
                  </button>
                )}
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
                <span className="sora-font text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900 dark:text-white tabular-nums leading-none">
                  ₹{totalAumCr}
                </span>
                <span className="sora-font text-xs font-semibold text-sky-600 dark:text-sky-400">
                  Cr
                </span>
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 ml-1">
                  • {totalFamilies} fam ({totalIndividuals} PANs)
                </span>
              </div>
            </div>
          </div>

          {/* Slim Segmented Bar */}
          <div className="w-full sm:w-44 xl:w-48 flex flex-col gap-1">
            <div className="flex h-2 w-full rounded-md overflow-hidden bg-slate-100 dark:bg-[#1C2230] gap-0.5">
              {tiers.map((tier) =>
                tier.rawPct > 0 ? (
                  <button
                    type="button"
                    key={`bar-${tier.label}`}
                    onClick={() => handleToggleTier(tier.label, tier.isActive)}
                    style={{ width: `${Math.max(tier.rawPct, 4)}%` }}
                    className={`${tier.barColor} transition-all duration-300 cursor-pointer ${
                      tier.isActive
                        ? "opacity-100 ring-1 ring-sky-600 dark:ring-sky-400"
                        : activeTier !== "All"
                        ? "opacity-30 hover:opacity-80"
                        : "opacity-95 hover:opacity-100"
                    }`}
                    title={`${tier.label}: ₹${tier.aumCr}Cr (${tier.percentage}%)`}
                  />
                ) : null
              )}
            </div>
            <div className="hidden sm:flex justify-between text-[9px] font-mono text-slate-400 dark:text-slate-500">
              <span>Concentration</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* RIGHT: 2x2 Grid on Mobile (Zero Horizontal Scroll) / 4-Col Grid on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 flex-1 w-full">
          {tiers.map((tier) => (
            <button
              type="button"
              key={tier.label}
              onClick={() => handleToggleTier(tier.label, tier.isActive)}
              className={`w-full min-w-0 px-2.5 sm:px-3 py-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                activeTier !== "All" && !tier.isActive
                  ? "opacity-45 hover:opacity-85"
                  : "opacity-100"
              } ${
                tier.isActive
                  ? tier.activeBg
                  : "bg-slate-50/70 hover:bg-slate-100/70 dark:bg-[#1C2230]/70 dark:hover:bg-[#1C2230] border-slate-200/80 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 w-full">
                <span className="sora-font flex items-center gap-1.5 text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${tier.dotColor}`} />
                  <span className="truncate">{tier.label}</span>
                </span>
                <span className={`text-[10px] font-mono font-bold shrink-0 ${tier.text}`}>
                  {tier.percentage}%
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-1.5 w-full">
                <span className="sora-font text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white tabular-nums shrink-0">
                  ₹{tier.aumCr}Cr
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  {tier.count} • {tier.range}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TierSummary;