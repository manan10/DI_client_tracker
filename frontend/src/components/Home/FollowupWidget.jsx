import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react';
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
    <div className="space-y-6">
      {/* 1. WIDGET HEADER - High Visibility */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 text-white rounded-lg shadow-lg shadow-amber-500/20">
            <AlertCircle size={14} strokeWidth={3} />
          </div>
          <h3 className="text-[11px] font-[1000] text-slate-900 dark:text-white uppercase tracking-[0.2em]">
            Pending Follow-ups
          </h3>
        </div>
        <span className="text-[10px] font-black px-2.5 py-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 rounded-lg text-slate-500 dark:text-slate-400">
          {followUps.length}
        </span>
      </div>

      {/* 2. INTERACTIVE LIST - Tactile Items */}
      <div className="space-y-4">
        {loading && followUps.length === 0 ? (
          <div className="py-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
            Establishing Link...
          </div>
        ) : followUps.length > 0 ? (
          followUps.map((task) => (
            <div 
              key={task._id} 
              className="group flex items-center justify-between p-4 
                         bg-white dark:bg-slate-800 
                         border-2 border-slate-200 dark:border-white/5 
                         border-b-4 border-b-slate-300 dark:border-b-black/60
                         rounded-2xl hover:-translate-y-1 active:translate-y-0.5 
                         transition-all duration-200 shadow-md hover:shadow-xl cursor-default"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Visual Anchor: Date Well */}
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 shrink-0 group-hover:border-amber-500/30 transition-colors">
                  <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase">
                    {new Date(task.followUpDate).toLocaleDateString('en-IN', { month: 'short' })}
                  </span>
                  <span className="text-sm font-[1000] text-slate-900 dark:text-white leading-none">
                    {new Date(task.followUpDate).toLocaleDateString('en-IN', { day: '2-digit' })}
                  </span>
                </div>

                <div className="min-w-0">
                  <h4 className="text-[13px] font-[1000] text-slate-900 dark:text-white uppercase tracking-tight truncate group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                    {task.client?.name || "Unknown Client"}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={10} className="text-amber-500" />
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Action Required</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={(e) => handleComplete(e, task._id)}
                className="p-3 bg-slate-50 dark:bg-white/5 text-slate-300 dark:text-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border-2 border-slate-200 dark:border-white/10 rounded-xl transition-all active:scale-90 shadow-sm"
                title="Mark as Completed"
              >
                <CheckCircle size={20} strokeWidth={3} />
              </button>
            </div>
          ))
        ) : (
          <div className="py-12 text-center rounded-4xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/2">
            <CheckCircle size={24} className="mx-auto text-emerald-500/30 mb-3" />
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">All Systems Clear</p>
          </div>
        )}
      </div>

      {/* 3. TACTILE FOOTER ACTION */}
      {/* <button className="w-full flex items-center justify-center gap-3 py-4 bg-white dark:bg-white/5 hover:bg-slate-900 dark:hover:bg-orange-600 text-slate-500 dark:text-slate-400 hover:text-white rounded-2xl border-2 border-slate-200 dark:border-white/10 border-b-4 border-b-slate-300 dark:border-b-black/40 shadow-md transition-all text-[10px] font-black uppercase tracking-widest active:scale-[0.98] group">
        Master Task List
        <ArrowRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
      </button> */}
    </div>
  );
};

export default FollowUpWidget;