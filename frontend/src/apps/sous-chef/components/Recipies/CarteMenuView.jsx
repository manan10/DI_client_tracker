// src/apps/recipes/components/Recipies/CarteMenuView.jsx
import React, { useState } from "react";
import {
  Flame,
  Play,
  ChevronDown,
  ChevronUp,
  Printer,
  Copy,
  Check,
} from "lucide-react";
import {
  slugifySection,
  formatDurationCompact,
  renderDietaryCodes,
  buildSubGroups,
} from "./recipeMenuUtils";
import { printRecipeMenu } from "./printMenuUtils";
import { toast } from "sonner";

const CarteMenuView = ({
  groupedSections,
  collapsedSections,
  onToggleSection,
  onOpenDetails,
  onOpenCookMode,
  groupBy,
  activeFiltersLabel,
}) => {
  const [copied, setCopied] = useState(false);

  const handlePrintCarte = () => {
    const ok = printRecipeMenu({
      mode: "CARTE",
      groupedSections,
      groupBy,
      activeFiltersLabel,
    });
    if (!ok) {
      toast.error("Please allow popups to open the print preview.");
    }
  };

  const handleCopyMenuText = async () => {
    const formattedText = groupedSections
      .map(({ groupName, items }) => {
        const subGroups = buildSubGroups(items, groupBy, groupName);
        const hasSubGroups = subGroups.some((sg) => sg.subGroupName);

        if (!hasSubGroups) {
          const titles = items.map((item) => `- ${item.title}`).join("\n");
          return `${groupName}\n${titles}`;
        }

        const subBlocks = subGroups
          .map(({ subGroupName, items: subItems }) => {
            const titles = subItems
              .map((item) => `  - ${item.title}`)
              .join("\n");
            return subGroupName ? `  [${subGroupName}]\n${titles}` : titles;
          })
          .join("\n");

        return `${groupName}\n${subBlocks}`;
      })
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      toast.success("Menu copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy menu to clipboard");
    }
  };

  const renderDishRow = (item) => (
    <article
      key={item._id}
      onClick={() => onOpenDetails(item._id)}
      className="group cursor-pointer py-2.5 sm:py-3 px-2 -mx-2 sm:px-2.5 sm:-mx-2.5 border-b border-stone-200/75 dark:border-stone-800/75 last:border-b-0 hover:bg-stone-900/[0.03] dark:hover:bg-white/[0.03] transition-colors"
    >
      <div className="flex items-start sm:items-baseline justify-between gap-2.5 sm:gap-4">
        {/* Left: Full Wrapping Dish Title + Dietary Flags + Video Indicator */}
        <div className="min-w-0 flex-1">
          <h3 className="font-sans font-semibold sm:font-medium uppercase tracking-[0.04em] sm:tracking-[0.08em] text-[13px] sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug inline">
            {item.title}
          </h3>

          <span className="shrink-0">{renderDietaryCodes(item)}</span>

          {item.video?.embedUrl && (
            <Play
              size={9}
              fill="currentColor"
              className="inline text-rose-500 ml-1.5 shrink-0 align-middle"
            />
          )}

          {/* Subtle Mobile-Only Course/Cuisine Micro-Tag */}
          <div className="sm:hidden mt-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {groupBy !== "CUISINE" && item.cuisine ? `${item.cuisine} · ` : ""}
            {item.courseType || "Main"}
          </div>
        </div>

        {/* Right: Desktop Course/Cuisine Tag + Duration + Cook Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 font-mono text-[10px] sm:text-[11px] pt-0.5 sm:pt-0">
          <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {groupBy !== "CUISINE" && item.cuisine ? `${item.cuisine} · ` : ""}
            {item.courseType || "Main"}
          </span>

          <span className="font-semibold sm:font-normal text-stone-600 dark:text-stone-400 tabular-nums">
            {formatDurationCompact(item)}
          </span>

          <button
            type="button"
            onClick={(e) => onOpenCookMode(e, item._id)}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 sm:py-0.2 border border-amber-600/40 dark:border-amber-400/40 bg-amber-500/10 text-[9px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-amber-500 hover:text-stone-950 cursor-pointer"
            title="Launch Cook Mode"
          >
            <Flame size={9} />
            <span>Cook</span>
          </button>
        </div>
      </div>
    </article>
  );

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Compact Single-Line Edition Action Strip with Copy & Print Triggers */}
      <div className="flex items-center justify-between gap-2 font-mono">
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest text-stone-400 dark:text-stone-500 truncate">
          <span className="hidden xs:inline">Chef&apos;s Tasting </span>Carte •{" "}
          {groupedSections.length}{" "}
          {groupedSections.length === 1 ? "Chapter" : "Chapters"}
        </span>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyMenuText}
            className="h-7 px-2 sm:px-2.5 border border-stone-900/35 dark:border-stone-700 bg-white dark:bg-[#14110E] hover:border-stone-900 dark:hover:border-amber-400 text-stone-800 dark:text-stone-200 hover:text-amber-700 dark:hover:text-amber-300 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
            title="Copy Group Names and Dish Titles"
          >
            {copied ? (
              <>
                <Check
                  size={10}
                  className="text-emerald-600 dark:text-emerald-400 shrink-0"
                />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy
                  size={10}
                  className="text-amber-700 dark:text-amber-400 shrink-0"
                />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrintCarte}
            className="h-7 px-2 sm:px-2.5 border border-stone-900/35 dark:border-stone-700 bg-white dark:bg-[#14110E] hover:border-stone-900 dark:hover:border-amber-400 text-stone-800 dark:text-stone-200 hover:text-amber-700 dark:hover:text-amber-300 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
            title="Print Chef's Tasting Carte"
          >
            <Printer
              size={10}
              className="text-amber-700 dark:text-amber-400 shrink-0"
            />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Wide 2-Column Omakase Layout */}
      <div
        className={
          groupedSections.length === 1
            ? "w-full"
            : "columns-1 lg:columns-2 gap-x-14 xl:gap-x-20"
        }
      >
        {groupedSections.map(({ groupName, items }) => {
          const isCollapsed = Boolean(collapsedSections[groupName]);
          const subGroups = buildSubGroups(items, groupBy, groupName);
          const hasMultipleSubGroups = subGroups.some((sg) => sg.subGroupName);

          return (
            <section
              id={slugifySection(groupName)}
              key={groupName}
              className="break-inside-avoid-column mb-6 sm:mb-11 last:mb-0 scroll-mt-14"
            >
              <button
                type="button"
                onClick={() => onToggleSection(groupName)}
                className="w-full flex items-center justify-between gap-2 pb-2 sm:pb-2.5 mb-1.5 sm:mb-2 border-b-2 border-stone-900 dark:border-stone-200 text-left cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                  <span className="text-amber-700 dark:text-amber-400 font-mono text-[11px] sm:text-xs shrink-0">
                    おまかせ
                  </span>
                  <span className="text-stone-300 dark:text-stone-700 shrink-0">
                    •
                  </span>
                  <h2 className="font-sans font-semibold sm:font-light uppercase tracking-[0.12em] sm:tracking-[0.25em] text-xs sm:text-base text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors truncate">
                    {groupName}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[10px] font-bold text-stone-500 dark:text-stone-400 shrink-0">
                  <span className="tabular-nums">
                    {String(items.length).padStart(2, "0")}
                  </span>
                  {isCollapsed ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronUp size={12} />
                  )}
                </div>
              </button>

              {!isCollapsed && (
                <div
                  className={
                    hasMultipleSubGroups
                      ? "space-y-3.5 sm:space-y-5 pt-1"
                      : ""
                  }
                >
                  {subGroups.map(({ subGroupName, items: subItems }, idx) => (
                    <div key={subGroupName || idx}>
                      {subGroupName && (
                        <div className="flex items-center justify-between gap-2 pb-1 mb-0.5 sm:mb-1 border-b border-dashed border-stone-300 dark:border-stone-700 font-mono">
                          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.14em] sm:tracking-[0.18em] text-amber-700 dark:text-amber-400">
                            {subGroupName}
                          </span>
                          <span className="text-[9px] font-bold text-stone-400 dark:text-stone-500 tabular-nums">
                            {String(subItems.length).padStart(2, "0")}
                          </span>
                        </div>
                      )}

                      <div
                        className={
                          groupedSections.length === 1
                            ? "grid grid-cols-1 lg:grid-cols-2 gap-x-14 xl:gap-x-20"
                            : "divide-y divide-stone-200/75 dark:divide-stone-800/75"
                        }
                      >
                        {subItems.map((item) => renderDishRow(item))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default CarteMenuView;