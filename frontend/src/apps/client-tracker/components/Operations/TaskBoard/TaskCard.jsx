import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, AlertTriangle, CheckCircle2, ListTodo, ShieldCheck } from 'lucide-react';

const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'URGENT':
      return <AlertTriangle size={13} className="text-rose-500 fill-rose-500/20 animate-pulse" />;
    case 'HIGH':
      return (
        <div className="flex gap-0.5 items-center">
          <div className="w-1.5 h-3 bg-amber-500 rounded-full" />
          <div className="w-1.5 h-3 bg-amber-500 rounded-full" />
        </div>
      );
    case 'MEDIUM':
      return <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />;
    default:
      return <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />;
  }
};

const TaskCard = ({ task, isOverlay, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task._id || task.id 
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0.3 : 1,
    zIndex: isOverlay ? 1000 : 1
  };

  // --- DATA DEFENSE LAYER ---
  const clientName = task.client?.name || (typeof task.client === 'string' ? task.client : "Standard Account");
  const clientInitial = clientName ? clientName.charAt(0).toUpperCase() : "?";
  
  const isStale = task.status === 'PENDING_CLIENT' && (task.daysActive >= 3);
  const completedSteps = task.checklist?.filter(i => i.isCompleted).length || 0;
  const totalSteps = task.checklist?.length || 0;
  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const priorityColors = {
    URGENT: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]',
    HIGH: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]',
    MEDIUM: 'bg-blue-500',
    LOW: 'bg-slate-400',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onClick && onClick(task)}
      {...attributes}
      {...listeners}
      className={`
        relative p-4 rounded-xl transition-all duration-300 group cursor-grab active:cursor-grabbing border overflow-hidden
        ${isOverlay 
          ? 'bg-white dark:bg-slate-900 border-emerald-500/60 shadow-[0_30px_90px_rgba(0,0,0,0.6)] scale-[1.03] rotate-1' 
          : isStale 
            ? 'bg-white dark:bg-slate-900/95 border-rose-500/50 shadow-sm'
            : 'bg-white dark:bg-slate-900/90 backdrop-blur-md border-slate-200/80 dark:border-white/10 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-0.5'
        }
      `}
    >
      {/* Priority Indicator Pill Stripe on Left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${priorityColors[task.priority] || 'bg-slate-500'}`} />

      <div className="flex flex-col gap-3 pl-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              #{(task._id || task.id).slice(-4).toUpperCase()}
            </span>
            {isStale && (
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-20"></span>
                <span className="relative flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[9px] font-black uppercase tracking-wider border border-rose-200 dark:border-rose-500/30">
                  SLA At Risk
                </span>
              </div>
            )}
          </div>
          <div className="text-[9px] font-bold text-slate-600 dark:text-slate-300 px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md border border-slate-200/80 dark:border-white/10 uppercase tracking-wider">
            {task.category || 'GENERAL'}
          </div>
        </div>

        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
          {task.title}
        </h4>

        {/* Dynamic Progress Engine */}
        {totalSteps > 0 && (
          <div className="space-y-1.5 py-1 bg-slate-50/80 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
               <div className="flex items-center gap-1.5">
                 <ListTodo size={11} className="text-emerald-500" />
                 <span>Workflow Readiness</span>
               </div>
               <span className="tabular-nums text-emerald-600 dark:text-emerald-400 font-black">{completedSteps}/{totalSteps}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all duration-700 ease-out rounded-full" 
                 style={{ width: `${progressPercent}%` }}
               />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-xs font-black text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-white/10 shadow-xs">
              {clientInitial}
            </div>
            <div className="flex flex-col">
               <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight truncate max-w-32.5">
                {clientName}
               </span>
               <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                 <ShieldCheck size={10} className="text-emerald-500" /> Verified Client
               </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {task.status === 'COMPLETED' ? (
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-2xs">
                <CheckCircle2 size={14} />
              </div>
            ) : (
              <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-2xs">
                {getPriorityIcon(task.priority)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;