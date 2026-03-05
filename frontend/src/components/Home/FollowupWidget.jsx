import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const FollowUpWidget = () => {
  const [followUps, setFollowUps] = useState([]);
  const { request, loading } = useApi();

  useEffect(() => {
    const fetchFollowUps = async () => {
      try {
        const data = await request('/interactions/pending');
        setFollowUps(data.slice(0, 5));
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
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-amber-500 transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em] flex items-center gap-2">
            <AlertCircle size={14} className="text-amber-600" /> 
            Follow-up Reminders
          </h3>
          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">Pending Action Items</p>
        </div>
        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 text-[9px] font-black px-2 py-0.5 rounded-full">
          {followUps.length}
        </div>
      </div>

      <div className="space-y-3">
        {loading && followUps.length === 0 ? (
          <div className="py-4 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase animate-pulse">
            Syncing...
          </div>
        ) : followUps.length > 0 ? (
          followUps.map((task) => (
            <div key={task._id} className="group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent dark:border-slate-800/50 hover:border-amber-200 dark:hover:border-amber-900/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={10} className="text-amber-600" />
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">
                    Due: {new Date(task.followUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase truncate">
                  {task.client?.name || "Unknown Client"}
                </h4>
              </div>
              
              <button 
                onClick={(e) => handleComplete(e, task._id)}
                className="ml-4 p-2 text-slate-300 dark:text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-full transition-all group/btn"
                title="Mark as Completed"
              >
                <CheckCircle size={18} className="group-active/btn:scale-90 transition-transform" />
              </button>
            </div>
          ))
        ) : (
          <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <Clock size={20} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase">All caught up</p>
          </div>
        )}
      </div>

      <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-amber-600 dark:hover:text-amber-500 hover:border-amber-200 dark:hover:border-amber-900/50 transition-all">
        View Full Task List
      </button>
    </div>
  );
};

export default FollowUpWidget;