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

  // Status-specific color accents for elite SaaS look
  const columnAccents = {
    BACKLOG: "from-amber-500/20 via-amber-500/5 to-transparent border-t-amber-500",
    IN_PROGRESS: "from-blue-500/20 via-blue-500/5 to-transparent border-t-blue-500",
    PENDING_CLIENT: "from-purple-500/20 via-purple-500/5 to-transparent border-t-purple-500",
    COMPLETED: "from-emerald-500/20 via-emerald-500/5 to-transparent border-t-emerald-500",
  };

  const badgeAccents = {
    BACKLOG: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20",
    IN_PROGRESS: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200/60 dark:border-blue-500/20",
    PENDING_CLIENT: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200/60 dark:border-purple-500/20",
    COMPLETED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20",
  };

  return (
    <div className={`flex flex-col w-full h-full bg-white dark:bg-slate-900 rounded-xl transition-all duration-300 border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-lg border-t-4 ${columnAccents[id] || 'border-t-slate-500'}`}>
      
      {/* COLUMN HEADER */}
      <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-white/5 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
        <div className="flex items-center gap-2.5">
          <h3 className="text-xs font-[1000] text-slate-900 dark:text-white uppercase tracking-wider">
            {title}
          </h3>
          <span className={`py-0.5 px-2 rounded-md text-[10px] tabular-nums font-black border shadow-2xs ${badgeAccents[id] || 'bg-slate-100 text-slate-600'}`}>
            {tasks.length}
          </span>
        </div>
        <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors outline-none cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-800">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* DROP ZONE CONTAINER */}
      <div 
        ref={setNodeRef}
        className={`flex-1 flex flex-col p-3.5 min-h-105 transition-all rounded-b-xl relative
          ${isOver ? 'bg-emerald-50/60 dark:bg-emerald-500/5 ring-2 ring-emerald-500/40 ring-inset' : ''}`}
      >
        <div className="flex-1 space-y-3 pb-2">
          <SortableContext items={tasks.map(t => t.id || t._id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard key={task.id || task._id} task={task} onClick={onTaskClick} />
            ))}
          </SortableContext>

          {tasks.length === 0 && !isAdding && (
            <div className="h-32 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl bg-slate-50/30 dark:bg-white/1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">No Tickets Here</span>
              <span className="text-[9px] font-semibold text-slate-300 dark:text-slate-600 mt-0.5">Drag tickets or add one below</span>
            </div>
          )}
        </div>

        {/* QUICK ADD ACTION POD */}
        {id === 'BACKLOG' && (
            <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/5">
                {isAdding ? (
                    <form onSubmit={handleQuickSubmit} className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border-2 border-emerald-500 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-3">
                        <textarea
                            autoFocus
                            value={quickAddText}
                            onChange={(e) => setQuickAddText(e.target.value)}
                            onBlur={() => !quickAddText && setIsAdding(false)}
                            placeholder="What task needs fulfillment?"
                            className="w-full bg-transparent border-none outline-none text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 resize-none leading-relaxed"
                            rows={2}
                        />
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Hit Enter ↵</span>
                            <div className="flex items-center gap-1.5">
                              <button 
                                type="button" 
                                onClick={() => setIsAdding(false)}
                                className="px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button type="submit" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer">
                                  <span>Save</span>
                                  <CornerDownLeft size={11} strokeWidth={3}/>
                              </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="w-full py-3 px-4 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-slate-800/80 rounded-xl transition-all group border border-dashed border-slate-200 dark:border-white/10 cursor-pointer shadow-2xs"
                    >
                        <Plus size={15} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300 text-emerald-500"/>
                        <span className="text-[10px] font-black uppercase tracking-widest">Quick Add Ticket</span>
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Column;