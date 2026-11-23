// src/apps/recipes/components/Recipies/BookMenuView.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Play,
  BookOpen,
  List,
  ChevronsUpDown,
  Copy,
  Check,
  Printer,
} from "lucide-react";
import {
  formatDurationCompact,
  renderDietaryCodes,
  buildSubGroups,
} from "./recipeMenuUtils";
import { printRecipeMenu } from "./printMenuUtils";
import { toast } from "sonner";

const SINGLE_FLIP_MS = 320;
const MULTI_FLIP_STEP_MS = 150;

const BookMenuView = ({
  groupedSections,
  onOpenDetails,
  onOpenCookMode,
  groupBy,
}) => {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  // Mobile-only state: toggle between the Chapter Directory Cover ("INDEX") and the Open Page ("PAGE")
  const [mobileScreen, setMobileScreen] = useState("PAGE");
  const [copiedChapter, setCopiedChapter] = useState(false);

  // 3D Page-Flick Animation State
  const [flipState, setFlipState] = useState(null);
  const isAnimatingRef = useRef(false);
  const flipTimersRef = useRef([]);
  const lastWheelTurnRef = useRef(0);

  // Mobile Touch Flick Tracking Refs
  const touchStartYRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchStartScrollTopRef = useRef(0);
  const mobileScrollRef = useRef(null);

  const clearAllFlipTimers = useCallback(() => {
    flipTimersRef.current.forEach((id) => clearTimeout(id));
    flipTimersRef.current = [];
  }, []);

  useEffect(() => {
    clearAllFlipTimers();
    setActiveTabIdx(0);
    setFlipState(null);
    isAnimatingRef.current = false;
  }, [groupedSections.length, groupBy, clearAllFlipTimers]);

  useEffect(() => {
    return () => clearAllFlipTimers();
  }, [clearAllFlipTimers]);

  const totalTabs = Math.max(1, groupedSections.length);
  const safeIdx = Math.min(activeTabIdx, totalTabs - 1);
  const activeSection = groupedSections[safeIdx] || groupedSections[0];
  const progressPercent =
    totalTabs > 0 ? Math.round(((safeIdx + 1) / totalTabs) * 100) : 100;

  // Sequential Multi-Page Flick Trigger (e.g., Ch 1 -> Ch 4 flicks 3 pages: 1->2->3->4)
  const triggerPageTurn = useCallback(
    (targetIdx, explicitDirection = null, axis = "horizontal") => {
      if (totalTabs <= 1 || isAnimatingRef.current) return;

      const normalizedTarget = ((targetIdx % totalTabs) + totalTabs) % totalTabs;
      if (normalizedTarget === safeIdx) return;

      let direction = explicitDirection;
      let stepsCount = 1;

      if (direction === "next") {
        stepsCount = (normalizedTarget - safeIdx + totalTabs) % totalTabs;
      } else if (direction === "prev") {
        stepsCount = (safeIdx - normalizedTarget + totalTabs) % totalTabs;
      } else {
        const diff = normalizedTarget - safeIdx;
        direction = diff > 0 ? "next" : "prev";
        stepsCount = Math.abs(diff);
      }

      if (stepsCount <= 0) return;

      isAnimatingRef.current = true;
      clearAllFlipTimers();

      const stepDuration =
        stepsCount === 1 ? SINGLE_FLIP_MS : MULTI_FLIP_STEP_MS;
      const halfStep = Math.round(stepDuration / 2);

      const runStep = (currentStep, currentPage) => {
        if (currentStep >= stepsCount) {
          setFlipState(null);
          isAnimatingRef.current = false;
          return;
        }

        const nextPage =
          direction === "next"
            ? (currentPage + 1) % totalTabs
            : (currentPage - 1 + totalTabs) % totalTabs;

        setFlipState({ direction, axis, phase: "out", stepMs: halfStep });

        const t1 = setTimeout(() => {
          setActiveTabIdx(nextPage);
          if (mobileScrollRef.current) {
            mobileScrollRef.current.scrollTop = 0;
          }
          setFlipState({ direction, axis, phase: "in", stepMs: halfStep });

          const t2 = setTimeout(() => {
            runStep(currentStep + 1, nextPage);
          }, halfStep);
          flipTimersRef.current.push(t2);
        }, halfStep);

        flipTimersRef.current.push(t1);
      };

      runStep(0, safeIdx);
    },
    [totalTabs, safeIdx, clearAllFlipTimers]
  );

  // Keyboard Left/Right page turn on desktop
  useEffect(() => {
    const onKeyDown = (e) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        triggerPageTurn(safeIdx + 1, "next", "horizontal");
      } else if (e.key === "ArrowLeft") {
        triggerPageTurn(safeIdx - 1, "prev", "horizontal");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [safeIdx, triggerPageTurn]);

  // Desktop Trackpad Horizontal Swipe Support
  const handleDesktopWheel = (e) => {
    if (totalTabs <= 1) return;
    if (Math.abs(e.deltaX) > 36 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.4) {
      const now = Date.now();
      if (now - lastWheelTurnRef.current < 420) return;
      lastWheelTurnRef.current = now;
      if (e.deltaX > 0) {
        triggerPageTurn(safeIdx + 1, "next", "horizontal");
      } else {
        triggerPageTurn(safeIdx - 1, "prev", "horizontal");
      }
    }
  };

  const handleSelectChapter = (idx) => {
    if (window.innerWidth < 768) {
      setActiveTabIdx(idx);
      setMobileScreen("PAGE");
      return;
    }
    triggerPageTurn(idx, null, "horizontal");
  };

  // Copy & Print Active Chapter
  const handleCopyChapter = async () => {
    if (!activeSection) return;
    const subGroups = buildSubGroups(
      activeSection.items,
      groupBy,
      activeSection.groupName
    );
    const hasSubGroups = subGroups.some((sg) => sg.subGroupName);

    let bodyText = "";
    if (!hasSubGroups) {
      bodyText = activeSection.items.map((item) => `- ${item.title}`).join("\n");
    } else {
      bodyText = subGroups
        .map(({ subGroupName, items: subItems }) => {
          const titles = subItems.map((item) => `  - ${item.title}`).join("\n");
          return subGroupName ? `  [${subGroupName}]\n${titles}` : titles;
        })
        .join("\n");
    }

    try {
      await navigator.clipboard.writeText(`${activeSection.groupName}\n${bodyText}`);
      setCopiedChapter(true);
      toast.success(`Copied "${activeSection.groupName}" to clipboard`);
      setTimeout(() => setCopiedChapter(false), 2000);
    } catch {
      toast.error("Failed to copy chapter");
    }
  };

  const handlePrintChapter = () => {
    if (!activeSection) return;
    const ok = printRecipeMenu({
      mode: "CARTE",
      groupedSections: [activeSection],
      groupBy,
      activeFiltersLabel: `Chapter ${String(safeIdx + 1).padStart(2, "0")} • ${activeSection.groupName}`,
    });
    if (!ok) {
      toast.error("Please allow popups to open the print preview.");
    }
  };

  // Mobile Vertical Flick Handlers (Flick Up -> Next Page, Flick Down -> Prev Page)
  const handleMobileTouchStart = (e) => {
    if (mobileScreen !== "PAGE" || totalTabs <= 1) return;
    const touch = e.touches[0];
    touchStartYRef.current = touch.clientY;
    touchStartXRef.current = touch.clientX;
    touchStartScrollTopRef.current = mobileScrollRef.current?.scrollTop || 0;
  };

  const handleMobileTouchEnd = (e) => {
    if (
      mobileScreen !== "PAGE" ||
      touchStartYRef.current === null ||
      touchStartXRef.current === null ||
      totalTabs <= 1
    ) {
      return;
    }

    const touch = e.changedTouches[0];
    const deltaY = touchStartYRef.current - touch.clientY; // positive = flicked UP
    const deltaX = Math.abs(touchStartXRef.current - touch.clientX);

    touchStartYRef.current = null;
    touchStartXRef.current = null;

    if (Math.abs(deltaY) < 52 || deltaX > Math.abs(deltaY) * 0.85) return;

    const el = mobileScrollRef.current;
    const isScrollable = el ? el.scrollHeight > el.clientHeight + 4 : false;
    const atTop = !el || el.scrollTop <= 2;
    const atBottom =
      !el || el.scrollTop + el.clientHeight >= el.scrollHeight - 4;

    if (deltaY > 0) {
      if (!isScrollable || atBottom) {
        triggerPageTurn(safeIdx + 1, "next", "vertical");
      }
    } else {
      if (!isScrollable || (atTop && touchStartScrollTopRef.current <= 2)) {
        triggerPageTurn(safeIdx - 1, "prev", "vertical");
      }
    }
  };

  // Compute 3D CSS transform for the active leaf during page turn
  const getPageFlipStyle = (axis) => {
    if (!flipState || flipState.axis !== axis) {
      return {
        transform:
          axis === "horizontal"
            ? "perspective(1800px) rotateY(0deg)"
            : "perspective(1400px) rotateX(0deg)",
        opacity: 1,
        transition: `transform 160ms cubic-bezier(0.22, 1, 0.36, 1), opacity 160ms ease`,
      };
    }

    const { direction, phase, stepMs } = flipState;

    if (axis === "horizontal") {
      const angle =
        phase === "out"
          ? direction === "next"
            ? -28
            : 24
          : direction === "next"
          ? 24
          : -28;
      return {
        transform: `perspective(1800px) rotateY(${angle}deg)`,
        opacity: phase === "out" ? 0.14 : 0.32,
        transition: `transform ${stepMs}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${stepMs}ms ease`,
      };
    }

    const angleX =
      phase === "out"
        ? direction === "next"
          ? 28
          : -24
        : direction === "next"
        ? -24
        : 28;
    return {
      transform: `perspective(1400px) rotateX(${angleX}deg)`,
      opacity: phase === "out" ? 0.14 : 0.32,
      transition: `transform ${stepMs}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${stepMs}ms ease`,
    };
  };

  const renderDishRow = (item) => (
    <div
      key={item._id}
      onClick={() => onOpenDetails(item._id)}
      className="group flex items-start sm:items-baseline justify-between gap-2.5 py-2.5 border-b border-stone-200/85 dark:border-stone-800/80 last:border-b-0 hover:bg-amber-500/[0.06] px-1.5 -mx-1.5 transition-colors cursor-pointer"
    >
      <div className="min-w-0 flex-1">
        <span className="font-sans font-semibold sm:font-medium uppercase tracking-[0.04em] sm:tracking-[0.06em] text-[13px] text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-snug">
          {item.title}
        </span>
        <span className="shrink-0">{renderDietaryCodes(item)}</span>
        {item.video?.embedUrl && (
          <Play
            size={8}
            fill="currentColor"
            className="inline text-rose-500 ml-1.5 align-middle"
          />
        )}

        {/* Mobile-only subtle course/cuisine line */}
        <div className="sm:hidden mt-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          {groupBy !== "CUISINE" && item.cuisine ? `${item.cuisine} · ` : ""}
          {item.courseType || "Main"}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] pt-0.5 sm:pt-0">
        <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          {groupBy !== "CUISINE" && item.cuisine ? `${item.cuisine} · ` : ""}
          {item.courseType || "Main"}
        </span>

        <span className="font-semibold text-stone-600 dark:text-stone-400 tabular-nums">
          {formatDurationCompact(item)}
        </span>

        <button
          type="button"
          onClick={(e) => onOpenCookMode(e, item._id)}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 border border-amber-600/40 dark:border-amber-400/40 bg-amber-500/10 text-[9px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-amber-500 hover:text-stone-950 cursor-pointer"
          title="Launch Cook Mode"
        >
          <Flame size={8} />
          <span>Cook</span>
        </button>
      </div>
    </div>
  );

  const renderChapterDishes = (section, isCompactShortChapter = false) => {
    if (!section) return null;
    const subGroups = buildSubGroups(section.items, groupBy, section.groupName);

    return (
      <div className="space-y-5">
        {subGroups.map(({ subGroupName, items: subItems }, idx) => (
          <div key={subGroupName || idx}>
            {subGroupName && (
              <div className="flex items-center justify-between gap-2 pb-1 mb-1.5 border-b border-dashed border-amber-700/45 dark:border-amber-400/35 font-mono">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-800 dark:text-amber-400">
                  {subGroupName}
                </span>
                <span className="text-[9px] font-bold text-stone-400 dark:text-stone-500 tabular-nums">
                  {String(subItems.length).padStart(2, "0")}
                </span>
              </div>
            )}

            <div
              className={
                isCompactShortChapter
                  ? "max-w-2xl divide-y divide-stone-200/80 dark:divide-stone-800/80"
                  : "grid grid-cols-1 md:grid-cols-2 gap-x-8 xl:gap-x-12"
              }
            >
              {subItems.map((item) => renderDishRow(item))}
            </div>
          </div>
        ))}

        {/* Editorial End-of-Chapter Colophon for short chapters */}
        {isCompactShortChapter && section.items.length > 0 && (
          <div className="max-w-2xl pt-6 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.25em] text-stone-400 dark:text-stone-600">
            <span className="h-px flex-1 bg-stone-300/70 dark:bg-stone-800" />
            <span>おまかせ • Finis</span>
            <span className="h-px flex-1 bg-stone-300/70 dark:bg-stone-800" />
          </div>
        )}
      </div>
    );
  };

  const prevChapterName =
    groupedSections[(safeIdx - 1 + totalTabs) % totalTabs]?.groupName;
  const nextChapterName =
    groupedSections[(safeIdx + 1) % totalTabs]?.groupName;
  const isShortChapter = (activeSection?.items?.length || 0) <= 5;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `,
        }}
      />

      <div className="w-full">
        {/* ===================================================================== */}
        {/* MOBILE TOP-BOUND POCKET BOOK (< md) — ARCHITECTURAL PAGE INTEGRATION   */}
        {/* ===================================================================== */}
        <div className="md:hidden">
          <div
            onTouchStart={handleMobileTouchStart}
            onTouchEnd={handleMobileTouchEnd}
            className="border-2 border-stone-900 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#120F0C] select-none relative"
          >
            {/* Top-Edge Chapter Progress Hairline */}
            <div className="h-[2px] w-full bg-stone-200 dark:bg-stone-800">
              <div
                className="h-full bg-amber-600 dark:bg-amber-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Top Stab-Stitched Silk Binding Strip */}
            <div className="flex items-center justify-around px-6 py-1.5 bg-[#F2EFE7] dark:bg-[#17130F] border-b border-stone-900/25 dark:border-stone-700 relative">
              <div
                aria-hidden="true"
                className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-[1.5px] bg-amber-700/75 dark:bg-amber-400/75"
              />
              {[0, 1, 2, 3].map((knot) => (
                <span
                  key={knot}
                  className="relative z-10 w-[3px] h-3.5 bg-amber-700 dark:bg-amber-400"
                />
              ))}
            </div>

            {/* Mobile Page Body */}
            <div className="overflow-hidden">
              {mobileScreen === "INDEX" ? (
                /* MOBILE SCREEN A: CHAPTER TABLE OF CONTENTS */
                <div className="p-4 space-y-3 h-[540px] flex flex-col">
                  <div className="flex items-center justify-between pb-2.5 border-b-2 border-stone-900 dark:border-stone-200 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-amber-700 dark:text-amber-400">
                        おまかせ
                      </span>
                      <h2 className="font-sans font-bold uppercase tracking-[0.14em] text-sm text-stone-900 dark:text-white">
                        Book Chapters
                      </h2>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-stone-500">
                      {totalTabs} CHAPTERS
                    </span>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar divide-y divide-stone-200/80 dark:divide-stone-800/80">
                    {groupedSections.map((sec, idx) => {
                      const isCurrent = idx === safeIdx;
                      return (
                        <button
                          key={sec.groupName}
                          type="button"
                          onClick={() => handleSelectChapter(idx)}
                          className={`w-full py-3 px-2 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                            isCurrent
                              ? "bg-amber-500/15 text-amber-900 dark:text-amber-300"
                              : "hover:bg-stone-200/50 dark:hover:bg-white/5 text-stone-800 dark:text-stone-200"
                          }`}
                        >
                          <div className="flex items-baseline gap-2.5 min-w-0">
                            <span className="font-mono text-[11px] font-extrabold text-amber-700 dark:text-amber-400 shrink-0">
                              {String(idx + 1).padStart(2, "0")}.
                            </span>
                            <span className="font-sans font-bold uppercase tracking-wide text-xs truncate">
                              {sec.groupName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] text-stone-500">
                            <span className="tabular-nums">
                              {sec.items.length} dishes
                            </span>
                            <ChevronRight size={13} className="text-amber-600" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* MOBILE SCREEN B: FIXED-HEIGHT FLICKABLE PAGE */
                <div
                  style={{
                    ...getPageFlipStyle("vertical"),
                    transformOrigin: "top center",
                  }}
                  className="p-4 h-[540px] flex flex-col justify-between bg-gradient-to-b from-stone-900/[0.03] via-transparent to-stone-900/[0.02] dark:from-black/35"
                >
                  {/* Chapter Header with One-Tap "Chapters" TOC Toggle */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b-2 border-stone-900 dark:border-stone-200 shrink-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                        <span>おまかせ</span>
                        <span>•</span>
                        <span>
                          PAGE {String(safeIdx + 1).padStart(2, "0")} OF{" "}
                          {String(totalTabs).padStart(2, "0")}
                        </span>
                      </div>
                      <h2 className="font-sans font-bold uppercase tracking-[0.06em] text-base text-stone-900 dark:text-white truncate mt-0.5">
                        {activeSection?.groupName}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMobileScreen("INDEX")}
                      className="h-8 px-2.5 border border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#1A1612] text-stone-800 dark:text-stone-200 text-[10px] font-mono font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition-transform"
                    >
                      <List
                        size={12}
                        className="text-amber-700 dark:text-amber-400"
                      />
                      <span>Chapters</span>
                    </button>
                  </div>

                  {/* Scrollable Dish List (Scrollbar Invisible) */}
                  <div
                    ref={mobileScrollRef}
                    className="flex-1 min-h-0 overflow-y-auto no-scrollbar pr-0.5"
                  >
                    {renderChapterDishes(activeSection, false)}
                  </div>

                  {/* Minimalist Gesture Cue Strip */}
                  {totalTabs > 1 && (
                    <div className="pt-2.5 mt-2 border-t border-stone-300/75 dark:border-stone-800 flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500 shrink-0">
                      <span className="truncate max-w-[36%]">
                        ↓ {prevChapterName}
                      </span>

                      <span className="inline-flex items-center gap-1 font-bold text-amber-800/80 dark:text-amber-400/80 shrink-0">
                        <ChevronsUpDown size={10} />
                        <span>Flick</span>
                      </span>

                      <span className="truncate max-w-[36%] text-right">
                        {nextChapterName} ↑
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stacked Bottom Paper Leaves */}
          <div
            aria-hidden="true"
            className="mx-1.5 flex flex-col border-x border-b border-stone-900/35 dark:border-stone-700"
          >
            <div className="h-[3px] w-full bg-[#F2EFE7] dark:bg-[#16120F] border-b border-stone-300 dark:border-stone-800" />
            <div className="h-[3px] w-full bg-[#E8E3D7] dark:bg-[#110E0B]" />
          </div>
        </div>

        {/* ===================================================================== */}
        {/* DESKTOP & TABLET: INTEGRATED ARCHITECTURAL STAB-BOUND BOOK (md+)      */}
        {/* ===================================================================== */}
        <div className="hidden md:block">
          <div
            onWheel={handleDesktopWheel}
            className="relative h-[660px] border-2 border-stone-900 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#120F0C] flex overflow-hidden"
          >
            {/* Clickable Left 4-Hole Silk Stab-Binding Spine -> Previous Page */}
            <button
              type="button"
              onClick={() => triggerPageTurn(safeIdx - 1, "prev", "horizontal")}
              disabled={totalTabs <= 1}
              title={`Previous Chapter: ${prevChapterName || ""}`}
              aria-label="Previous Chapter"
              className="w-10 shrink-0 bg-[#F2EFE7] dark:bg-[#16130F] hover:bg-amber-500/15 dark:hover:bg-amber-500/10 border-r border-stone-900/30 dark:border-stone-800 flex flex-col justify-between py-11 items-center relative transition-colors cursor-pointer disabled:cursor-default group"
            >
              <div
                aria-hidden="true"
                className="absolute inset-y-9 left-1/2 -translate-x-1/2 w-[2px] bg-amber-700/80 dark:bg-amber-400/80 group-hover:bg-amber-600 dark:group-hover:bg-amber-300 transition-colors"
              />
              {[0, 1, 2, 3].map((hole) => (
                <div
                  key={hole}
                  className="relative z-10 w-6 h-[3px] bg-amber-700 dark:bg-amber-400 group-hover:scale-x-110 transition-transform"
                />
              ))}
            </button>

            {/* Left Chapter Index Rail (Scrollbar Invisible) */}
            <aside className="flex flex-col overflow-y-auto no-scrollbar w-64 shrink-0 bg-gradient-to-r from-[#F5F2EA] via-[#F2EFE7] to-[#EAE5D9] dark:from-[#15120E] dark:via-[#120F0C] dark:to-[#0C0A08] p-2.5 gap-1">
              <div className="flex items-center justify-between px-2.5 py-2 mb-1 border-b border-stone-900/20 dark:border-stone-800 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400 shrink-0">
                <span className="flex items-center gap-1.5">
                  <BookOpen size={11} />
                  <span>おまかせ • Chapters</span>
                </span>
                <span>{String(totalTabs).padStart(2, "0")}</span>
              </div>

              {groupedSections.map((sec, idx) => {
                const active = idx === safeIdx;
                return (
                  <button
                    key={sec.groupName}
                    type="button"
                    onClick={() => handleSelectChapter(idx)}
                    className={`px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center justify-between gap-2 ${
                      active
                        ? "bg-white dark:bg-[#1D1814] border-l-3 border-amber-600 dark:border-amber-400 text-stone-950 dark:text-white font-extrabold shadow-2xs"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5 font-semibold"
                    }`}
                  >
                    <span className="truncate">{sec.groupName}</span>
                    <span className="tabular-nums text-[9px] opacity-75 shrink-0">
                      {String(sec.items.length).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </aside>

            {/* Center Book Binding Gutter Shadow */}
            <div
              aria-hidden="true"
              className="w-7 shrink-0 bg-gradient-to-r from-stone-900/[0.12] via-stone-900/[0.03] to-transparent dark:from-black/75 dark:via-black/25 dark:to-transparent border-l border-stone-900/25 dark:border-stone-800"
            />

            {/* Right Curved Paper Leaf with Left-Hinged Sequential 3D Page Turn */}
            <div className="flex-1 min-w-0 flex flex-col relative">
              {/* Top-Edge Chapter Progress Hairline */}
              <div className="h-[2px] w-full bg-stone-200/80 dark:bg-stone-800/80 shrink-0">
                <div
                  className="h-full bg-amber-600 dark:bg-amber-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div
                style={{
                  ...getPageFlipStyle("horizontal"),
                  transformOrigin: "left center",
                }}
                className="flex-1 min-h-0 p-7 pl-3 flex flex-col bg-gradient-to-r from-stone-900/[0.015] via-transparent to-stone-900/[0.025] dark:from-black/20 dark:via-transparent dark:to-black/30"
              >
                {/* Chapter Header with Copy, Print, and Prev / Next Steppers */}
                <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b-2 border-stone-900 dark:border-stone-200 shrink-0">
                  <div className="flex items-baseline gap-3 min-w-0">
                    <h2 className="font-sans font-light uppercase tracking-[0.22em] text-xl text-stone-900 dark:text-white truncate">
                      {activeSection?.groupName}
                    </h2>
                    <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400 font-bold shrink-0">
                      {String(activeSection?.items.length || 0).padStart(2, "0")}{" "}
                      SELECTIONS
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyChapter}
                      className="h-7 px-2 border border-stone-900/35 dark:border-stone-700 bg-white dark:bg-[#1A1612] hover:border-amber-600 dark:hover:border-amber-400 text-stone-800 dark:text-stone-200 text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copy Chapter Dishes"
                    >
                      {copiedChapter ? (
                        <>
                          <Check
                            size={11}
                            className="text-emerald-600 dark:text-emerald-400"
                          />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy
                            size={11}
                            className="text-amber-700 dark:text-amber-400"
                          />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintChapter}
                      className="h-7 px-2 border border-stone-900/35 dark:border-stone-700 bg-white dark:bg-[#1A1612] hover:border-amber-600 dark:hover:border-amber-400 text-stone-800 dark:text-stone-200 text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer transition-colors"
                      title="Print Chapter Sheet"
                    >
                      <Printer
                        size={11}
                        className="text-amber-700 dark:text-amber-400"
                      />
                      <span>Print</span>
                    </button>

                    {totalTabs > 1 && (
                      <>
                        <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 tabular-nums mx-1.5">
                          PAGE {String(safeIdx + 1).padStart(2, "0")} /{" "}
                          {String(totalTabs).padStart(2, "0")}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            triggerPageTurn(safeIdx - 1, "prev", "horizontal")
                          }
                          className="h-7 px-2.5 border border-stone-900/35 dark:border-stone-700 bg-white dark:bg-[#1A1612] hover:border-amber-600 dark:hover:border-amber-400 text-stone-800 dark:text-stone-200 text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer transition-colors"
                          title="Previous Chapter (Left Arrow)"
                        >
                          <ChevronLeft size={12} />
                          <span>Prev</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            triggerPageTurn(safeIdx + 1, "next", "horizontal")
                          }
                          className="h-7 px-2.5 border border-stone-900/35 dark:border-stone-700 bg-white dark:bg-[#1A1612] hover:border-amber-600 dark:hover:border-amber-400 text-stone-800 dark:text-stone-200 text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer transition-colors"
                          title="Next Chapter (Right Arrow)"
                        >
                          <span>Next</span>
                          <ChevronRight size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Scrollable Dish List (Scrollbar Invisible) */}
                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pr-1">
                  {renderChapterDishes(activeSection, isShortChapter)}
                </div>

                {/* Clean Minimalist Bottom Folio Stamp */}
                <div className="pt-3 mt-3 border-t border-stone-300/80 dark:border-stone-800 flex items-center justify-between gap-2 font-mono shrink-0 text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  <span>おまかせ • Yamato-Toji Tasting Volume</span>
                  <span>
                    Click Page Edges • Trackpad Swipe • ← / → Keys
                  </span>
                </div>
              </div>
            </div>

            {/* Clickable Layered Right Outer Paper Edges -> Next Page */}
            <button
              type="button"
              onClick={() => triggerPageTurn(safeIdx + 1, "next", "horizontal")}
              disabled={totalTabs <= 1}
              title={`Next Chapter: ${nextChapterName || ""}`}
              aria-label="Next Chapter"
              className="flex shrink-0 border-l border-stone-900/25 dark:border-stone-800 hover:brightness-95 dark:hover:brightness-125 transition-all cursor-pointer disabled:cursor-default group"
            >
              <div className="w-[3.5px] h-full bg-[#F5F2EA] dark:bg-[#1A1612] border-r border-stone-300/90 dark:border-stone-800 group-hover:bg-amber-100/80 dark:group-hover:bg-amber-900/30 transition-colors" />
              <div className="w-[3.5px] h-full bg-[#EFECE3] dark:bg-[#16120F] border-r border-stone-300/90 dark:border-stone-800 group-hover:bg-amber-100/60 dark:group-hover:bg-amber-900/20 transition-colors" />
              <div className="w-[3.5px] h-full bg-[#E8E4D9] dark:bg-[#120F0C] border-r border-stone-300/90 dark:border-stone-800" />
              <div className="w-[3.5px] h-full bg-[#E0DBD0] dark:bg-[#0E0B09]" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookMenuView;