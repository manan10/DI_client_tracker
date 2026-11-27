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
    URGENT: 'bg-rose-500',
    HIGH: 'bg-amber-500',
    MEDIUM: 'bg-sky-500',
    LOW: 'bg-slate-400 dark:bg-slate-600',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onClick && onClick(task)}
      {...attributes}
      {...listeners}
      className={`
        relative p-4 rounded-lg transition-all duration-200 group cursor-grab active:cursor-grabbing border overflow-hidden
        ${isOverlay
          ? 'bg-white dark:bg-[#1C2230] border-sky-500/60 shadow-2xl scale-[1.03] rotate-1'
          : isStale
            ? 'bg-white dark:bg-[#161B26] border-rose-300 dark:border-rose-500/40'
            : 'bg-white dark:bg-[#161B26] border-slate-200 dark:border-slate-800/80 hover:border-sky-400/60 dark:hover:border-sky-500/50 hover:-translate-y-0.5'
        }
      `}
    >
      {/* Priority Indicator Pill Stripe on Left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${priorityColors[task.priority] || 'bg-slate-400'}`} />

      <div className="flex flex-col gap-3 pl-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 tracking-wider">
              #{(task._id || task.id).slice(-4).toUpperCase()}
            </span>
            {isStale && (
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-20"></span>
                <span className="relative flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 text-[10px] font-semibold border border-rose-200/80 dark:border-rose-500/25">
                  SLA At Risk
                </span>
              </div>
            )}
          </div>
          <div className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 px-2 py-0.5 bg-slate-50 dark:bg-[#1C2230] rounded-md border border-slate-200/70 dark:border-slate-700/70 uppercase tracking-wider">
            {task.category || 'GENERAL'}
          </div>
        </div>

        <h4 className="sora-font text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-white leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors line-clamp-2">
          {task.title}
        </h4>

        {/* Dynamic Progress Engine */}
        {totalSteps > 0 && (
          <div className="space-y-1.5 bg-slate-50 dark:bg-[#1C2230] p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-700/70">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <ListTodo size={11} className="text-sky-500 dark:text-sky-400" />
                <span>Workflow Readiness</span>
              </div>
              <span className="font-mono tabular-nums text-sky-600 dark:text-sky-300 font-semibold">{completedSteps}/{totalSteps}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-0.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-xs font-bold text-sky-600 dark:text-sky-300 border border-sky-200/70 dark:border-sky-500/25 shrink-0">
              {clientInitial}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="sora-font text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-32.5">
                {clientName}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <ShieldCheck size={10} className="text-sky-500 dark:text-sky-400" /> Verified Client
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {task.status === 'COMPLETED' ? (
              <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/25 text-emerald-600 dark:text-emerald-300">
                <CheckCircle2 size={14} />
              </div>
            ) : (
              <div className="p-1.5 rounded-md bg-slate-50 dark:bg-[#1C2230] border border-slate-200/70 dark:border-slate-700/70 text-slate-600 dark:text-slate-300">
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