import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { MoreHorizontal, Plus, CornerDownLeft } from 'lucide-react';

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

  return (
    <div className="flex flex-col w-full bg-[#EBECF0] dark:bg-slate-800 rounded-sm transition-colors duration-200 h-fit min-h-75 border border-transparent dark:border-white/5 shadow-sm">
      <div className="p-3 md:p-4 flex items-center justify-between">
        <h3 className="text-[10px] md:text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-widest flex items-center gap-2">
          {title} 
          <span className="py-0.5 px-2 bg-slate-200 dark:bg-white/5 rounded text-[10px] tabular-nums font-bold text-slate-500 italic">
            {tasks.length}
          </span>
        </h3>
        <MoreHorizontal size={14} className="text-slate-400 cursor-pointer" />
      </div>

      <div 
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2 p-2 min-h-37.5 transition-all
          ${isOver ? 'bg-slate-300/30 dark:bg-white/3' : ''}`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>

        {/* FEATURE 6: Quick Add UI */}
        {id === 'BACKLOG' && (
            <div className="mt-2">
                {isAdding ? (
                    <form onSubmit={handleQuickSubmit} className="bg-white dark:bg-[#1A1C1E] p-2 rounded border border-emerald-500 shadow-lg animate-in fade-in zoom-in-95 duration-200">
                        <textarea
                            autoFocus
                            value={quickAddText}
                            onChange={(e) => setQuickAddText(e.target.value)}
                            onBlur={() => !quickAddText && setIsAdding(false)}
                            placeholder="What needs to be done?"
                            className="w-full bg-transparent border-none outline-none text-[12px] font-bold dark:text-white resize-none"
                            rows={2}
                        />
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Press Enter to Save</span>
                            <button type="submit" className="p-1 bg-emerald-500 text-white rounded">
                                <CornerDownLeft size={10} strokeWidth={3}/>
                            </button>
                        </div>
                    </form>
                ) : (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="w-full py-2 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors group"
                    >
                        <Plus size={14} strokeWidth={3} className="group-hover:rotate-90 transition-transform"/>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Quick Add</span>
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Column;