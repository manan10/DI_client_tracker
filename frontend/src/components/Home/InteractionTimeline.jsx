import React, { useEffect, useState } from 'react';
import { MessageSquare, Phone, User, Calendar, History, Clock, ArrowUpRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const InteractionTimeline = () => {
  const [interactions, setInteractions] = useState([]);
  const { request, loading } = useApi();

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const data = await request('/interactions/recent');
        setInteractions(data || []);
      } catch { console.error("Timeline load failed"); }
    };
    fetchTimeline();
  }, [request]);

  const getTypeStyles = (type) => {
    switch (type) {
      case 'In-Person': return { 
        icon: <User size={10} strokeWidth={3} />, 
        color: 'text-amber-800 dark:text-amber-400', 
        bg: 'bg-amber-100 dark:bg-amber-500/10',
        border: 'border-amber-200 dark:border-amber-500/20'
      };
      case 'Call': return { 
        icon: <Phone size={10} strokeWidth={3} />, 
        color: 'text-blue-800 dark:text-blue-400', 
        bg: 'bg-blue-100 dark:bg-blue-500/10',
        border: 'border-blue-200 dark:border-blue-500/20'
      };
      case 'WhatsApp': return { 
        icon: <MessageSquare size={10} strokeWidth={3} />, 
        color: 'text-emerald-900 dark:text-emerald-400', 
        bg: 'bg-emerald-100 dark:bg-emerald-500/10',
        border: 'border-emerald-200 dark:border-emerald-500/20'
      };
      default: return { 
        icon: <Clock size={10} strokeWidth={3} />, 
        color: 'text-slate-800 dark:text-slate-400', 
        bg: 'bg-slate-100 dark:bg-white/5',
        border: 'border-slate-300 dark:border-white/10'
      };
    }
  };

  if (loading) return (
    <div className="space-y-8 animate-pulse px-2 sm:px-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-4">
          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 bg-slate-200 dark:bg-white/5 rounded" />
            <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative px-1 sm:px-2">
      {/* POWER LINE */}
      <div className="absolute left-5 sm:left-8 top-0 bottom-0 w-0.5 bg-linear-to-b from-emerald-600 via-emerald-400 to-transparent dark:from-emerald-500 dark:via-emerald-900 dark:to-transparent rounded-full opacity-20 dark:opacity-10" />

      <div className="space-y-8 sm:space-y-12">
        {interactions.length > 0 ? (
          interactions.map((item) => {
            const styles = getTypeStyles(item.type);
            return (
              <div key={item._id} className="relative pl-12 sm:pl-16 group">
                {/* Timeline Dot */}
                <div className={`absolute left-3.5 sm:left-6 top-1 w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full border-2 sm:border-4 border-brand-beige dark:border-slate-900 z-10 shadow-lg transition-transform group-hover:scale-125 ${styles.color.split(' ')[0].replace('text', 'bg')}`} />
                
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[13px] sm:text-[15px] font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.client?.name}
                      </h4>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${styles.bg} ${styles.color} ${styles.border}`}>
                        {styles.icon} {item.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest bg-white/50 dark:bg-white/5 px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10">
                      <Calendar size={10} strokeWidth={3} />
                      {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>

                  <div className="relative p-3 sm:p-4 bg-white/80 dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 rounded-xl shadow-sm group-hover:border-emerald-500/30 transition-all">
                    <p className="text-[13px] sm:text-[14px] text-slate-900 dark:text-slate-300 font-medium leading-relaxed">
                      {item.summary}
                    </p>

                    {item.discussionPoints?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                        {item.discussionPoints.map(p => (
                          <span key={p} className="text-[8px] font-black px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 uppercase tracking-widest">
                            #{p}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <ArrowUpRight size={12} className="absolute top-3 right-3 text-slate-300 dark:text-slate-700 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center">
             <div className="w-16 h-16 bg-white/50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <History size={24} className="text-slate-300 dark:text-slate-700" />
             </div>
             <p className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.2em]">System Log Empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractionTimeline;