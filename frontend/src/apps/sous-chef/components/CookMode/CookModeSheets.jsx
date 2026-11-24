// src/apps/recipes/components/CookMode/CookModeSheets.jsx
import React from "react";
import {
  X,
  Minus,
  Plus,
  Check,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import MiseEnPlaceList from "./MiseEnPlaceList";
import { formatTimer } from "./cookModeUtils";

const CookModeSheets = ({
  activeSheet,
  onClose,
  recipe,
  allRecipes,
  onSelectRecipe,
  servings,
  onChangeServings,
  groupedIngredients,
  checkedIngredients,
  checkedIngredientsCount,
  totalIngredientsCount,
  onToggleIngredient,
  formatScaledQty,
  currentStepIndex,
  completedSteps,
  onSelectStep,
  onToggleStepDone,
  timers,
  onAddCustomTimer,
  onToggleTimerById,
  onAddMinuteToTimer,
  onRemoveTimerById,
  notifPermission,
  onRequestNotifPermission,
  soundEnabled,
  onToggleSound,
  onResetSession,
}) => {
  if (!activeSheet) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[82dvh] rounded-t-2xl bg-[#FAF9F6] dark:bg-[#14110E] border-t-4 border-t-amber-500 text-stone-900 dark:text-stone-100 flex flex-col shadow-2xl overflow-hidden pb-[env(safe-area-inset-bottom)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sheet Grabber */}
        <div className="flex justify-center pt-2 pb-1 shrink-0">
          <span className="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />
        </div>

        {/* SHEET: INGREDIENTS CHECKLIST & SCALER */}
        {activeSheet === "ingredients" && (
          <>
            <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2 shrink-0">
              <div>
                <h3 className="font-sans font-[1000] uppercase tracking-tight text-lg leading-none">
                  Mise-en-Place
                </h3>
                <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                  {checkedIngredientsCount} of {totalIngredientsCount} ready
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex items-center rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1E1915]">
                  <button
                    type="button"
                    onClick={() => onChangeServings((s) => Math.max(1, s - 1))}
                    className="w-8 h-8 flex items-center justify-center cursor-pointer"
                  >
                    <Minus size={12} strokeWidth={3} />
                  </button>
                  <span className="px-2 text-xs font-mono font-extrabold text-amber-600 dark:text-amber-300">
                    {servings}p
                  </span>
                  <button
                    type="button"
                    onClick={() => onChangeServings((s) => s + 1)}
                    className="w-8 h-8 flex items-center justify-center cursor-pointer"
                  >
                    <Plus size={12} strokeWidth={3} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg border border-stone-300 dark:border-stone-700 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
              <MiseEnPlaceList
                groupedIngredients={groupedIngredients}
                checkedIngredients={checkedIngredients}
                onToggleIngredient={onToggleIngredient}
                formatScaledQty={formatScaledQty}
              />
            </div>
          </>
        )}

        {/* SHEET: STEP JUMPER */}
        {activeSheet === "steps" && (
          <>
            <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-sans font-[1000] uppercase tracking-tight text-lg leading-none">
                  All Cooking Steps
                </h3>
                <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                  Tap badge to mark done • Tap row to jump
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-stone-300 dark:border-stone-700 flex items-center justify-center cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
              {recipe.instructions.map((s, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isDone = Boolean(completedSteps[idx]);
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-start gap-3 ${
                      isCurrent
                        ? "bg-amber-500/15 border-amber-500 text-stone-950 dark:text-white"
                        : "bg-white dark:bg-[#1B1714] border-stone-200 dark:border-stone-800"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onToggleStepDone(idx)}
                      title={isDone ? "Mark incomplete" : "Mark done"}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-extrabold shrink-0 cursor-pointer ${
                        isDone
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                          ? "bg-amber-500 text-stone-950"
                          : "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                      }`}
                    >
                      {isDone ? <Check size={13} strokeWidth={3} /> : idx + 1}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectStep(idx);
                        onClose();
                      }}
                      className="min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <div className="font-sans font-bold text-sm truncate">
                        {s.title || `Step ${idx + 1}`}
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                        {s.instruction}
                      </p>
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* SHEET: KITCHEN TIMERS, PHONE NOTIFICATIONS & SESSION CONTROLS */}
        {activeSheet === "timer" && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-sans font-[1000] uppercase tracking-tight text-lg">
                Timers & Alerts
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onRequestNotifPermission}
                  className={`h-8 px-2.5 rounded-lg border text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                    notifPermission === "granted"
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                      : "border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300"
                  }`}
                >
                  {notifPermission === "granted" ? (
                    <>
                      <Bell size={13} />
                      <span>Alerts On</span>
                    </>
                  ) : (
                    <>
                      <BellOff size={13} />
                      <span>Enable Alerts</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onToggleSound}
                  className="h-8 px-2.5 rounded-lg border border-stone-300 dark:border-stone-700 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                >
                  {soundEnabled ? (
                    <Volume2 size={14} className="text-amber-500" />
                  ) : (
                    <VolumeX size={14} className="text-stone-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg border border-stone-300 dark:border-stone-700 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[2, 5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => onAddCustomTimer(mins)}
                  className="py-3 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono font-extrabold text-xs uppercase cursor-pointer"
                >
                  +{mins}m
                </button>
              ))}
            </div>

            {timers.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {timers.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#1B1714] border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="text-xs font-bold block">{t.label}</span>
                      <span className="text-lg font-mono font-black text-amber-600 dark:text-amber-400 tabular-nums">
                        {formatTimer(t.remainingSeconds)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onToggleTimerById(t.id)}
                        className="p-2 rounded-lg bg-amber-500 text-stone-950 cursor-pointer"
                      >
                        {t.isRunning ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => onAddMinuteToTimer(t.id)}
                        className="px-2 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-bold cursor-pointer"
                      >
                        +1m
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveTimerById(t.id)}
                        className="p-2 rounded-lg text-stone-400 hover:text-rose-500 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] font-mono text-stone-500">
              <span>Auto-saved locally</span>
              <button
                type="button"
                onClick={onResetSession}
                className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
              >
                <RotateCcw size={11} />
                <span>Reset Session</span>
              </button>
            </div>
          </div>
        )}

        {/* SHEET: SWITCH RECIPE */}
        {activeSheet === "recipes" && (
          <>
            <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
              <h3 className="font-sans font-[1000] uppercase tracking-tight text-lg">
                Switch Dish
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-stone-300 dark:border-stone-700 flex items-center justify-center cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
              {allRecipes.map((r) => (
                <button
                  key={r._id}
                  type="button"
                  onClick={() => onSelectRecipe(r._id)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 cursor-pointer ${
                    r._id === recipe._id
                      ? "bg-amber-500/15 border-amber-500 font-bold"
                      : "bg-white dark:bg-[#1B1714] border-stone-200 dark:border-stone-800"
                  }`}
                >
                  <span className="font-sans font-bold text-sm truncate">
                    {r.title}
                  </span>
                  {r._id === recipe._id && (
                    <Check
                      size={15}
                      className="text-amber-600 dark:text-amber-400 shrink-0"
                    />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CookModeSheets;