import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { MoreHorizontal, Plus, CornerDownLeft, Sparkles } from 'lucide-react';

const Column = ({ id, title, tasks, onTaskClick, onQuickAdd }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [quickAddText, setQuickAddText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // FEATURE 6: Quick Add Handler
  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickAddText.trim()) {
        setIsAdding(false);
        return;
    }
    onQuickAdd(id, quickAddText);
    setQuickAddText("");
    setIsAdding(false);
  };

  // Status-specific color accents
  const columnAccents = {
    BACKLOG: "border-t-amber-500",
    IN_PROGRESS: "border-t-sky-500",
    PENDING_CLIENT: "border-t-indigo-500",
    COMPLETED: "border-t-emerald-500",
  };

  const badgeAccents = {
    BACKLOG: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-200/80 dark:border-amber-500/25",
    IN_PROGRESS: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300 border-sky-200/80 dark:border-sky-500/25",
    PENDING_CLIENT: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-500/25",
    COMPLETED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-500/25",
  };

  return (
    <div className={`flex flex-col w-full h-full bg-white dark:bg-[#161B26] rounded-lg transition-colors border border-slate-200 dark:border-slate-800/80 border-t-4 ${columnAccents[id] || 'border-t-slate-500'}`}>

      {/* COLUMN HEADER */}
      <div className="px-4 py-3.5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 shrink-0 bg-slate-50/90 dark:bg-[#1C2230] rounded-t-lg">
        <div className="flex items-center gap-2.5">
          <h3 className="sora-font text-xs font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <span className={`py-0.5 px-2 rounded-md text-[11px] font-mono tabular-nums font-semibold border ${badgeAccents[id] || 'bg-slate-100 text-slate-600'}`}>
            {tasks.length}
          </span>
        </div>
        <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md transition-colors outline-none cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-800">
          <MoreHorizontal size={15} />
        </button>
      </div>

      {/* DROP ZONE CONTAINER */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col p-3.5 min-h-105 transition-colors rounded-b-lg relative
          ${isOver ? 'bg-sky-50/60 dark:bg-sky-500/10 ring-2 ring-sky-500/40 ring-inset' : ''}`}
      >
        <div className="flex-1 space-y-3 pb-2">
          <SortableContext items={tasks.map(t => t.id || t._id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard key={task.id || task._id} task={task} onClick={onTaskClick} />
            ))}
          </SortableContext>

          {tasks.length === 0 && !isAdding && (
            <div className="h-32 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-[#1C2230]/40">
              <span className="sora-font text-xs font-semibold text-slate-500 dark:text-slate-400">No tickets here</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Drag tickets or add one below</span>
            </div>
          )}
        </div>

        {/* QUICK ADD ACTION POD */}
        {id === 'BACKLOG' && (
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80">
            {isAdding ? (
              <form onSubmit={handleQuickSubmit} className="bg-white dark:bg-[#1C2230] p-3.5 rounded-lg border border-sky-500 shadow-lg animate-in fade-in zoom-in-95 duration-150 space-y-3">
                <textarea
                  autoFocus
                  value={quickAddText}
                  onChange={(e) => setQuickAddText(e.target.value)}
                  onBlur={() => !quickAddText && setIsAdding(false)}
                  placeholder="What task needs fulfillment?"
                  className="w-full bg-transparent border-none outline-none text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none leading-relaxed"
                  rows={2}
                />
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500">Hit Enter ↵</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
                      <span>Save</span>
                      <CornerDownLeft size={11} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full py-2.5 px-4 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-sky-50/50 dark:hover:bg-[#1C2230] rounded-lg transition-colors group border border-dashed border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                <Plus size={14} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300 text-sky-500 dark:text-sky-400" />
                <span className="text-xs font-semibold">Quick Add Ticket</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;