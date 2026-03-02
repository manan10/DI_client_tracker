import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const FollowUpWidget = () => {
  const [followUps, setFollowUps] = useState([]);
  const { request, loading } = useApi();

  useEffect(() => {
    // Define the function inside the effect to avoid cascading render warnings
    const fetchFollowUps = async () => {
      try {
        const data = await request('/interactions/pending');
        // We only show the top 5 to keep the dashboard clean
        setFollowUps(data.slice(0, 5));
      } catch (err) {
        console.error("Follow-up fetch failed", err);
      }
    };

    fetchFollowUps();
  }, [request]); // The linter is happy because request is a stable dependency from your hook

  const handleComplete = async (e, id) => {
    e.stopPropagation();
    try {
      // API call to update the status in the DB
      await request(`/interactions/${id}/status`, 'PATCH', { status: 'Completed' });
      
      // Optimistic UI update: remove it from the list immediately for a snappy feel
      setFollowUps(prev => prev.filter(item => item._id !== id));
    } catch {
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm border-t-4 border-t-amber-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
            <AlertCircle size={14} className="text-amber-600" /> 
            Follow-up Reminders
          </h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Pending Action Items</p>
        </div>
        <div className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full">
          {followUps.length}
        </div>
      </div>

      <div className="space-y-3">
        {loading && followUps.length === 0 ? (
          <div className="py-4 text-center text-[10px] font-bold text-slate-400 uppercase animate-pulse">
            Syncing...
          </div>
        ) : followUps.length > 0 ? (
          followUps.map((task) => (
            <div key={task._id} className="group p-4 bg-slate-50 rounded-xl border border-transparent hover:border-amber-200 hover:bg-white hover:shadow-md transition-all flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={10} className="text-amber-600" />
                  <span className="text-[9px] font-black text-slate-400 uppercase">
                    Due: {new Date(task.followUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase truncate">
                  {task.client?.name || "Unknown Client"}
                </h4>
              </div>
              
              <button 
                onClick={(e) => handleComplete(e, task._id)}
                className="ml-4 p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-all group/btn"
                title="Mark as Completed"
              >
                <CheckCircle size={18} className="group-active/btn:scale-90 transition-transform" />
              </button>
            </div>
          ))
        ) : (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Clock size={20} className="mx-auto text-slate-300 mb-2" />
            <p className="text-[9px] font-bold text-slate-400 uppercase">All caught up</p>
          </div>
        )}
      </div>

      <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-100 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:text-amber-600 hover:border-amber-200 transition-all">
        View Full Task List
      </button>
    </div>
  );
};

export default FollowUpWidget;