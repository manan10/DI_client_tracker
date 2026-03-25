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
        icon: <User size={12} strokeWidth={3} />, 
        color: 'text-amber-800 dark:text-amber-400', 
        bg: 'bg-amber-100 dark:bg-amber-500/10',
        border: 'border-amber-200 dark:border-amber-500/20'
      };
      case 'Call': return { 
        icon: <Phone size={12} strokeWidth={3} />, 
        color: 'text-blue-800 dark:text-blue-400', 
        bg: 'bg-blue-100 dark:bg-blue-500/10',
        border: 'border-blue-200 dark:border-blue-500/20'
      };
      case 'WhatsApp': return { 
        icon: <MessageSquare size={12} strokeWidth={3} />, 
        color: 'text-emerald-900 dark:text-emerald-400', 
        bg: 'bg-emerald-100 dark:bg-emerald-500/10',
        border: 'border-emerald-200 dark:border-emerald-500/20'
      };
      default: return { 
        icon: <Clock size={12} strokeWidth={3} />, 
        color: 'text-slate-800 dark:text-slate-400', 
        bg: 'bg-slate-100 dark:bg-white/5',
        border: 'border-slate-300 dark:border-white/10'
      };
    }
  };

  if (loading) return (
    <div className="space-y-10 animate-pulse px-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-6">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-1/3 bg-slate-200 dark:bg-white/5 rounded" />
            <div className="h-4 w-full bg-slate-100 dark:bg-white/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative px-2">
      {/* 1. THE POWER LINE: Changed from Blue to Emerald/Green */}
      <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-1 bg-linear-to-b from-emerald-600 via-emerald-400 to-transparent dark:from-emerald-500 dark:via-emerald-900 dark:to-transparent rounded-full opacity-20 dark:opacity-10" />

      <div className="space-y-12">
        {interactions.length > 0 ? (
          interactions.map((item) => {
            const styles = getTypeStyles(item.type);
            return (
              <div key={item._id} className="relative pl-14 sm:pl-16 group">
                
                <div className={`absolute left-4 sm:left-6 top-1 w-5 h-5 rounded-full border-4 border-brand-beige dark:border-slate-900 z-10 shadow-lg transition-transform group-hover:scale-125 
                                ${styles.color.split(' ')[0].replace('text', 'bg')} `} />
                
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Hover text changed to emerald */}
                      <h4 className="text-[15px] font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.client?.name}
                      </h4>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 ${styles.bg} ${styles.color} ${styles.border}`}>
                        {styles.icon} {item.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] bg-white/50 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 shadow-sm">
                      <Calendar size={12} strokeWidth={3} />
                      {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>

                  <div className="relative p-4 bg-white/80 dark:bg-slate-800 border-2 border-slate-200/60 dark:border-white/5 rounded-2xl shadow-sm group-hover:border-emerald-500/30 transition-all">
                    <p className="text-[14px] text-slate-900 dark:text-slate-300 font-medium leading-relaxed">
                      {item.summary}
                    </p>

                    {item.discussionPoints?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        {item.discussionPoints.map(p => (
                          <span key={p} className="text-[9px] font-black px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 uppercase tracking-widest">
                            #{p}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Icon hover changed to emerald */}
                    <ArrowUpRight size={14} className="absolute top-4 right-4 text-slate-300 dark:text-slate-700 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-24 text-center">
             <div className="w-20 h-20 bg-white/50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <History size={32} className="text-slate-300 dark:text-slate-700" />
             </div>
             <p className="text-[12px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.3em]">System Log Empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractionTimeline;