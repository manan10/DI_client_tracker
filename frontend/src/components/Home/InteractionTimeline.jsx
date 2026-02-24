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
      case 'In-Person': return { icon: <User size={12} />, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' };
      case 'Call': return { icon: <Phone size={12} />, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' };
      case 'WhatsApp': return { icon: <MessageSquare size={12} />, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' };
      default: return { icon: <MessageSquare size={12} />, color: 'bg-slate-50 text-slate-500', border: 'border-slate-100' };
    }
  };

  if (loading) return <div className="p-6 animate-pulse space-y-3">
    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl border border-slate-100" />)}
  </div>;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Section Header */}
      <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-600 rounded-lg text-white shadow-md shadow-amber-100">
            <History size={18} />
          </div>
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">Recent Interactions</h3>
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-slate-100">
          Last 5 Activities
        </span>
      </div>

      <div className="p-6">
        <div className="relative">
          {/* Subtle Vertical Thread */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-50" />

          <div className="space-y-4">
            {interactions.length > 0 ? (
              interactions.map((item) => {
                const styles = getTypeStyles(item.type);
                return (
                  <div key={item._id} className="relative pl-10 group">
                    {/* Compact Node */}
                    <div className="absolute left-3.25 top-4 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10 bg-amber-500" />
                    
                    <div className="p-4 rounded-xl border border-slate-50 hover:border-amber-200 hover:bg-amber-50/20 transition-all duration-200 group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${styles.color} border ${styles.border}`}>
                            {styles.icon} {item.type}
                          </span>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                            {item.client?.name}
                          </h4>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                          <Calendar size={10} /> {new Date(item.date).toLocaleDateString('en-IN')}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 font-medium leading-normal line-clamp-1 mb-2">
                        {item.summary}
                      </p>

                      <div className="flex gap-1.5">
                        {item.discussionPoints?.map(p => (
                          <span key={p} className="text-[8px] font-black px-1.5 py-0.5 rounded bg-white text-slate-400 border border-slate-100 uppercase">
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
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No activity found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractionTimeline;