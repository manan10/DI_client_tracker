// src/apps/recipes/components/Recipies/BistroMenuView.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Clock,
  Flame,
  Play,
  ChevronDown,
  ChevronUp,
  Printer,
} from "lucide-react";
import {
  slugifySection,
  getDishSubtext,
  formatDurationCompact,
  renderDietaryCodes,
  buildSubGroups,
} from "./recipeMenuUtils";
import { printRecipeMenu } from "./printMenuUtils";
import { toast } from "sonner";

const getColumnCount = (width) => {
  if (width >= 1536) return 4; // 2xl
  if (width >= 1280) return 3; // xl
  if (width >= 768) return 2; // md
  return 1;
};

const BistroMenuView = ({
  groupedSections,
  collapsedSections,
  onToggleSection,
  onOpenDetails,
  onOpenCookMode,
  groupBy,
  activeFiltersLabel,
}) => {
  const [columnCount, setColumnCount] = useState(() =>
    typeof window !== "undefined" ? getColumnCount(window.innerWidth) : 3
  );

  useEffect(() => {
    const handleResize = () => {
      setColumnCount(getColumnCount(window.innerWidth));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Balanced Left-to-Right Masonry Distribution
  const masonryColumns = useMemo(() => {
    if (groupedSections.length <= 1) return [groupedSections];

    const effectiveCols = Math.min(columnCount, groupedSections.length);
    const cols = Array.from({ length: effectiveCols }, () => []);
    const colWeights = new Array(effectiveCols).fill(0);

    groupedSections.forEach((sec) => {
      const isCollapsed = Boolean(collapsedSections[sec.groupName]);
      const subGroups = buildSubGroups(sec.items, groupBy);
      const subHeaderCount = subGroups.filter((sg) => sg.subGroupName).length;
      const weight = isCollapsed
        ? 2
        : 3 + sec.items.length * 2.2 + subHeaderCount * 1.1;

      let shortestColIdx = 0;
      for (let i = 1; i < effectiveCols; i++) {
        if (colWeights[i] < colWeights[shortestColIdx]) {
          shortestColIdx = i;
        }
      }

      cols[shortestColIdx].push(sec);
      colWeights[shortestColIdx] += weight;
    });

    return cols;
  }, [groupedSections, collapsedSections, columnCount, groupBy]);

  const handlePrintBistro = () => {
    const ok = printRecipeMenu({
      mode: "BISTRO",
      groupedSections,
      groupBy,
      activeFiltersLabel,
    });
    if (!ok) {
      toast.error("Please allow popups to open the print preview.");
    }
  };

  const renderDishCard = (item, isSingleSection) => (
    <article
      key={item._id}
      onClick={() => onOpenDetails(item._id)}
      className={`group cursor-pointer ${
        isSingleSection
          ? "pb-2.5 border-b border-stone-200/80 dark:border-stone-800/80"
          : "py-2.5 first:pt-0 last:pb-0"
      }`}
    >
      {/* Line 1: Full Wrapping Title + Dietary + Video | Time + Cook */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <h3 className="font-sans font-[1000] uppercase tracking-tighter text-[13px] sm:text-sm text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-[#f59e0b] transition-colors leading-snug inline">
            {item.title}
          </h3>
          {renderDietaryCodes(item)}
          {item.video?.embedUrl && (
            <Play
              size={9}
              fill="currentColor"
              className="inline text-rose-500 ml-1 align-middle"
            />
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 font-mono pt-0.5">
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 dark:border-amber-400/40 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] tabular-nums">
            <Clock
              size={9}
              className="text-amber-600 dark:text-amber-400 shrink-0"
            />
            <span>{formatDurationCompact(item)}</span>
          </span>

          <button
            type="button"
            onClick={(e) => onOpenCookMode(e, item._id)}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 border border-stone-900/25 dark:border-stone-700 hover:border-amber-600 dark:hover:border-amber-400 text-[9px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
            title="Launch Cook Mode"
          >
            <Flame size={9} />
            <span>Cook</span>
          </button>
        </div>
      </div>

      {/* Line 2: Single-Line Description + Course/Cuisine Tag */}
      <div className="flex items-center justify-between gap-2 mt-1 font-mono text-[11px] text-stone-500 dark:text-stone-400">
        <p className="truncate leading-snug">{getDishSubtext(item)}</p>
        <span className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500 shrink-0">
          {groupBy !== "CUISINE" && item.cuisine ? `${item.cuisine} · ` : ""}
          {item.courseType || "Main"}
        </span>
      </div>
    </article>
  );

  const renderSectionCard = ({ groupName, items }) => {
    const isCollapsed = Boolean(collapsedSections[groupName]);
    const subGroups = buildSubGroups(items, groupBy);
    const hasMultipleSubGroups = subGroups.some((sg) => sg.subGroupName);
    const isSingleSection = groupedSections.length === 1;

    return (
      <section
        id={slugifySection(groupName)}
        key={groupName}
        className="scroll-mt-14 border-2 border-stone-900 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#14110E] p-3.5 sm:p-4 shadow-xs"
      >
        {/* Compact Boxed Bistro Course Header */}
        <button
          type="button"
          onClick={() => onToggleSection(groupName)}
          className={`w-full text-left flex items-center justify-between gap-2 cursor-pointer group ${
            isCollapsed
              ? ""
              : "border-b-2 border-stone-900 dark:border-stone-700 pb-2 mb-3"
          }`}
        >
          <h2 className="font-sans font-[1000] uppercase tracking-tighter text-lg sm:text-xl text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-[#f59e0b] transition-colors leading-none">
            {groupName}
          </h2>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-mono font-bold text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider tabular-nums">
              {items.length}
            </span>
            <span className="w-5 h-5 border border-stone-900/30 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 group-hover:border-amber-600 dark:group-hover:border-amber-400">
              {isCollapsed ? (
                <ChevronDown size={11} />
              ) : (
                <ChevronUp size={11} />
              )}
            </span>
          </div>
        </button>

        {/* Dense Dish List (with Automatic Sub-Groups for large sections) */}
        {!isCollapsed && (
          <div className={hasMultipleSubGroups ? "space-y-4" : ""}>
            {subGroups.map(({ subGroupName, items: subItems }, idx) => (
              <div key={subGroupName || idx}>
                {subGroupName && (
                  <div className="flex items-center justify-between gap-2 pb-1 mb-2 border-b border-dashed border-stone-300 dark:border-stone-700 font-mono">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                      {subGroupName}
                    </span>
                    <span className="text-[9px] font-bold text-stone-400 dark:text-stone-500 tabular-nums">
                      {subItems.length}
                    </span>
                  </div>
                )}

                <div
                  className={
                    isSingleSection
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-2.5"
                      : "divide-y divide-stone-200/80 dark:divide-stone-800/80"
                  }
                >
                  {subItems.map((item) =>
                    renderDishCard(item, isSingleSection)
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="space-y-3">
      {/* Subtle Edition Action Strip with Clean Print Trigger */}
      <div className="flex items-center justify-between gap-2 font-mono">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
          Bistro Edition • {groupedSections.length}{" "}
          {groupedSections.length === 1 ? "Course Box" : "Course Boxes"}
        </span>

        <button
          type="button"
          onClick={handlePrintBistro}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-stone-900/35 dark:border-stone-700 bg-white dark:bg-[#14110E] hover:border-stone-900 dark:hover:border-amber-400 text-stone-800 dark:text-stone-200 hover:text-amber-700 dark:hover:text-amber-300 text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
          title="Print Bistro Menu Sheet"
        >
          <Printer size={14} className="text-amber-700 dark:text-amber-400" />
        </button>
      </div>

      {/* Balanced Multi-Column Masonry Grid */}
      {groupedSections.length === 1 ? (
        <div className="w-full">{renderSectionCard(groupedSections[0])}</div>
      ) : (
        <div className="flex items-start gap-4 sm:gap-5">
          {masonryColumns.map((colSections, colIdx) => (
            <div
              key={colIdx}
              className="flex-1 min-w-0 flex flex-col gap-4 sm:gap-5"
            >
              {colSections.map((sec) => renderSectionCard(sec))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BistroMenuView;