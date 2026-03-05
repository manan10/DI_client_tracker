import React, { useEffect, useState } from 'react';
import { MessageSquare, Phone, User, Calendar, History } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const InteractionTimeline = () => {
  const [interactions, setInteractions] = useState([]);
  const { request, loading } = useApi();

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const data = await request('/interactions/recent');
        setInteractions(data);
      } catch { console.error("Timeline load failed"); }
    };
    fetchTimeline();
  }, [request]);

  const getTypeStyles = (type) => {
    switch (type) {
      case 'In-Person': return { 
        icon: <User size={12} />, 
        color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-500', 
        border: 'border-amber-100 dark:border-amber-900/30' 
      };
      case 'Call': return { 
        icon: <Phone size={12} />, 
        color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400', 
        border: 'border-blue-100 dark:border-blue-900/30' 
      };
      case 'WhatsApp': return { 
        icon: <MessageSquare size={12} />, 
        color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400', 
        border: 'border-emerald-100 dark:border-emerald-900/30' 
      };
      default: return { 
        icon: <MessageSquare size={12} />, 
        color: 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400', 
        border: 'border-slate-100 dark:border-slate-700' 
      };
    }
  };

  if (loading) return (
    <div className="p-6 animate-pulse space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
      {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800" />)}
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
      {/* Section Header */}
      <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-600 rounded-lg text-white shadow-md shadow-amber-100 dark:shadow-none">
            <History size={18} />
          </div>
          <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-tight">Recent Interactions</h3>
        </div>
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700">
          Last 5 Activities
        </span>
      </div>

      <div className="p-6">
        <div className="relative">
          {/* Subtle Vertical Thread */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-50 dark:bg-slate-800" />

          <div className="space-y-4">
            {interactions.length > 0 ? (
              interactions.map((item) => {
                const styles = getTypeStyles(item.type);
                return (
                  <div key={item._id} className="relative pl-10 group">
                    {/* Compact Node */}
                    <div className="absolute left-3.25 top-4 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm z-10 bg-amber-500" />
                    
                    <div className="p-4 rounded-xl border border-slate-50 dark:border-slate-800/50 hover:border-amber-200 dark:hover:border-amber-900/30 hover:bg-amber-50/20 dark:hover:bg-amber-900/10 transition-all duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${styles.color} border ${styles.border}`}>
                            {styles.icon} {item.type}
                          </span>
                          <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                            {item.client?.name}
                          </h4>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Calendar size={10} /> {new Date(item.date).toLocaleDateString('en-IN')}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-normal line-clamp-1 mb-2">
                        {item.summary}
                      </p>

                      <div className="flex gap-1.5">
                        {item.discussionPoints?.map(p => (
                          <span key={p} className="text-[8px] font-black px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700 uppercase">
                            #{p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center">
                <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">No activity found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractionTimeline;