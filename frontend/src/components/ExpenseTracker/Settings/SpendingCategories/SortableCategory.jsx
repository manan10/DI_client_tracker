import React from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableCategory = ({ parent, children, onEdit, onDelete, onAddSub, isOverlay }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: parent._id,
    data: { type: 'parent', parent }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0.3 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden h-full ${isOverlay ? 'shadow-2xl ring-2 ring-indigo-500/50 scale-[1.02]' : ''}`}
    >
      <div 
        className="h-2 w-full cursor-grab active:cursor-grabbing hover:brightness-110 transition-all flex items-center justify-center shrink-0" 
        style={{ backgroundColor: parent.color }} 
        {...attributes} {...listeners}
      >
        <div className="w-12 h-1 bg-white/20 rounded-full" />
      </div>
      
      <div className="px-4 py-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
        <span className="text-[11px] font-[1000] uppercase tracking-widest italic dark:text-white leading-tight block">
          {parent.label}
        </span>
      </div>

      <div className="p-4 flex flex-wrap gap-2 items-start content-start flex-1 min-h-20">
        {children}
        {!isOverlay && (
          <button 
            onClick={() => onAddSub(parent._id)} 
            className="h-8.5 w-8.5 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 rounded-md text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all shrink-0 cursor-pointer"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {!isOverlay && (
        <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
           <button onClick={() => onEdit(parent)} className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold uppercase text-slate-400 hover:text-emerald-500 hover:bg-white dark:hover:bg-slate-800 rounded transition-all cursor-pointer">
             <Edit3 size={11} /> Edit
           </button>
           <button onClick={() => onDelete(parent)} className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold uppercase text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-all cursor-pointer">
             <Trash2 size={11} /> Delete
           </button>
        </div>
      )}
    </div>
  );
};

export default SortableCategory;