import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, AlertTriangle, CheckCircle2, ListTodo, User } from 'lucide-react';

const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'URGENT':
      return <AlertTriangle size={13} className="text-rose-500 fill-rose-500/20 animate-pulse" />;
    case 'HIGH':
      return (
        <div className="flex gap-0.5 items-center">
          <div className="w-1 h-3 bg-amber-500 rounded-full" />
          <div className="w-1 h-3 bg-amber-500 rounded-full" />
        </div>
      );
    case 'MEDIUM':
      return <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />;
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
    URGENT: 'bg-rose-500 shadow-[4px_0_12px_rgba(244,63,94,0.4)]',
    HIGH: 'bg-amber-500 shadow-[4px_0_12px_rgba(245,158,11,0.3)]',
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
        relative p-4 rounded-sm transition-all duration-300 group cursor-grab active:cursor-grabbing border
        ${isOverlay 
          ? 'bg-white dark:bg-[#1E2023] border-emerald-500/50 shadow-[0_30px_90px_rgba(0,0,0,0.6)] scale-[1.03] rotate-1' 
          : isStale 
            ? 'bg-white dark:bg-[#121417] border-rose-500/30 shadow-[inset_0_0_20px_rgba(244,63,94,0.03)]'
            : 'bg-white dark:bg-[#0E1012] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-emerald-500/30 hover:shadow-xl hover:shadow-black/20'
        }
      `}
    >
      {/* Priority Indicator Line */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${priorityColors[task.priority] || 'bg-slate-600'}`} />

      <div className="flex flex-col gap-3.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black text-slate-400 dark:text-slate-600 tracking-[0.2em]">
              {(task._id || task.id).slice(-4).toUpperCase()}
            </span>
            {isStale && (
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-20"></span>
                <span className="relative flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[7px] font-black uppercase border border-rose-500/20">
                  SLA AT RISK
                </span>
              </div>
            )}
          </div>
          <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 px-1.5 py-0.5 bg-slate-100 dark:bg-white/[0.03] rounded-sm border border-slate-200 dark:border-white/[0.05]">
            {task.category || 'GENERAL'}
          </div>
        </div>

        <h4 className="text-[12px] font-bold text-slate-800 dark:text-slate-200 leading-tight tracking-tight group-hover:text-emerald-500 transition-colors">
          {task.title}
        </h4>

        {/* Dynamic Progress Engine */}
        {totalSteps > 0 && (
          <div className="space-y-2 py-1">
            <div className="flex items-center justify-between text-[7px] font-black uppercase tracking-widest text-slate-500">
               <div className="flex items-center gap-1.5">
                 <ListTodo size={9} className="text-emerald-500" />
                 <span>Workflow Readiness</span>
               </div>
               <span className="tabular-nums text-emerald-500">{completedSteps}/{totalSteps}</span>
            </div>
            <div className="w-full h-[3px] bg-slate-100 dark:bg-white/[0.03] rounded-full overflow-hidden">
               <div 
                 className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all duration-700 ease-out" 
                 style={{ width: `${progressPercent}%` }}
               />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-sm bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/[0.05] dark:to-white/[0.01] flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-emerald-500 border border-slate-200 dark:border-white/[0.05]">
              {clientInitial}
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight truncate max-w-[100px]">
                {clientName}
               </span>
               <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Verified Client</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {task.status === 'COMPLETED' ? (
              <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 size={12} className="text-emerald-500" />
              </div>
            ) : (
              <div className="p-1 rounded bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05]">
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