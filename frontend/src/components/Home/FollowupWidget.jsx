import React, { useEffect, useState } from 'react';
import { Calendar, Check, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const FollowUpWidget = () => {
  const [followUps, setFollowUps] = useState([]);
  const { request, loading } = useApi();

  useEffect(() => {
    const fetchFollowUps = async () => {
      try {
        const data = await request('/interactions/pending');
        setFollowUps(data.slice(0, 5) || []);
      } catch (err) {
        console.error("Follow-up fetch failed", err);
      }
    };
    fetchFollowUps();
  }, [request]);

  const handleComplete = async (e, id) => {
    e.stopPropagation();
    try {
      await request(`/interactions/${id}/status`, 'PATCH', { status: 'Completed' });
      setFollowUps(prev => prev.filter(item => item._id !== id));
    } catch {
      alert("Failed to update status.");
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden flex flex-col">
      
      {/* WIDGET HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/2">
        <div className="flex items-center gap-2">
          <AlertCircle size={14} className="text-amber-500" strokeWidth={2.5} />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
            Pending Follow-ups
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md border border-amber-200 dark:border-amber-500/20">
          {followUps.length}
        </span>
      </div>

      {/* LIST CONTENT */}
      <div className="flex flex-col divide-y divide-slate-100 dark:divide-white/5">
        {loading && followUps.length === 0 ? (
          <div className="py-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            Establishing Link...
          </div>
        ) : followUps.length > 0 ? (
          followUps.map((task) => (
            <div 
              key={task._id} 
              className="group flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/2 transition-colors min-w-0"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Micro Calendar Block */}
                <div className="flex flex-col items-center justify-center w-9 h-9 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 shrink-0 group-hover:bg-amber-50 group-hover:border-amber-200 dark:group-hover:bg-amber-500/10 dark:group-hover:border-amber-500/30 transition-colors">
                  <span className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase leading-none mb-0.5">
                    {new Date(task.followUpDate).toLocaleDateString('en-IN', { month: 'short' })}
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white leading-none group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    {new Date(task.followUpDate).toLocaleDateString('en-IN', { day: '2-digit' })}
                  </span>
                </div>

                <div className="flex flex-col min-w-0">
                  <h4 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {task.client?.name || "Unknown Client"}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={10} className="text-amber-500" strokeWidth={2.5} />
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate mt-px">
                      Action Required
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Check Action */}
              <button 
                onClick={(e) => handleComplete(e, task._id)}
                className="w-7 h-7 flex items-center justify-center shrink-0 rounded text-slate-300 dark:text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition-colors outline-none"
                title="Mark as Completed"
              >
                <Check size={16} strokeWidth={3} />
              </button>
            </div>
          ))
        ) : (
          <div className="py-10 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-white/2">
            <Check size={20} className="text-emerald-500/50 mb-2" strokeWidth={3} />
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Queue is Empty
            </p>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default FollowUpWidget;