import React from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableSubChip = ({ sub, parent, onEdit, onDelete, isOverlay }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sub._id,
    data: { type: 'sub', parentId: parent._id, sub }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0.3 : 1,
    borderLeftColor: parent.color,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex items-start gap-2 pl-2 pr-1 py-2 bg-white dark:bg-slate-800 border-y border-r border-l-4 border-slate-200 dark:border-slate-700 rounded-md group shadow-sm transition-all w-full ${isOverlay ? 'shadow-xl scale-105 border-indigo-500 ring-2 ring-indigo-500/20' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded shrink-0 pt-0.5">
        <GripVertical size={12} className="text-slate-400" />
      </div>

      <span 
        className="text-[10px] font-bold uppercase tracking-tight flex-1 select-none cursor-pointer break-words whitespace-normal leading-tight pt-1"
        onClick={() => onEdit(parent._id, sub)}
      >
        {sub.label}
      </span>

      {!isOverlay && (
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevents triggering edit or drag
            onDelete(parent._id, sub); // Passes the sub object so modal gets the label
          }} 
          className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0 pt-0.5"
        >
          <Trash2 size={10} />
        </button>
      )}
    </div>
  );
};

export default SortableSubChip;