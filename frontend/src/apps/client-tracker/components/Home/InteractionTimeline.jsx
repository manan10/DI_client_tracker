import React, { useEffect, useState } from 'react';
import { MessageSquare, Phone, User, Calendar, History, Clock, ArrowRight } from 'lucide-react';
import { useApi } from '../../../../shared/hooks/useApi';

const InteractionTimeline = () => {
  const [interactions, setInteractions] = useState([]);
  const { request, loading } = useApi();

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const data = await request('/interactions/recent');
        setInteractions(data || []);
      } catch { 
        console.error("Timeline load failed"); 
      }
    };
    fetchTimeline();
  }, [request]);

  const getTypeConfig = (type) => {
    switch (type) {
      case 'In-Person': 
        return { icon: <User size={12} strokeWidth={2.5} />, color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' };
      case 'Call': 
        return { icon: <Phone size={12} strokeWidth={2.5} />, color: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' };
      case 'WhatsApp': 
        return { icon: <MessageSquare size={12} strokeWidth={2.5} />, color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' };
      default: 
        return { icon: <Clock size={12} strokeWidth={2.5} />, color: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-white/5' };
    }
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse p-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-4">
          <div className="w-2 h-2 mt-2 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-12 w-full bg-slate-50 dark:bg-white/5 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      {interactions.length > 0 ? (
        <div className="flex flex-col">
          {interactions.map((item, index) => {
            const config = getTypeConfig(item.type);
            const isLast = index === interactions.length - 1;

            return (
              <div key={item._id} className="group relative flex gap-4 sm:gap-6 w-full -ml-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/2 transition-colors cursor-pointer min-w-0">
                
                {/* TIMELINE TRACK & NODE */}
                <div className="relative flex flex-col items-center shrink-0 w-4 mt-1.5">
                  {/* The Node */}
                  <div className={`absolute z-10 w-2 h-2 rounded-full ring-4 ring-white dark:ring-[#0B1120] group-hover:scale-150 transition-transform duration-300 ${config.color}`} />
                  {/* The Line */}
                  {!isLast && (
                    <div className="absolute top-2 w-px h-[calc(100%+2rem)] bg-slate-200 dark:bg-white/10" />
                  )}
                </div>

                {/* CONTENT PAYLOAD */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-2">
                    
                    {/* Header Stack */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <h4 className="text-[14px] font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.client?.name || "Unknown Client"}
                      </h4>
                      <span className={`shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${config.bg} ${config.text}`}>
                        {config.icon}
                        {item.type}
                      </span>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 shrink-0">
                      <Calendar size={12} strokeWidth={2.5} />
                      <time dateTime={item.date}>
                        {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </time>
                    </div>
                  </div>

                  {/* Summary Text */}
                  <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed pr-8 line-clamp-2 sm:line-clamp-none">
                    {item.summary}
                  </p>

                  {/* Discussion Tags */}
                  {item.discussionPoints?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.discussionPoints.map((p, idx) => (
                        <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent text-[10px] font-mono font-medium text-slate-500">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hover Arrow (Right Edge) */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <ArrowRight size={16} strokeWidth={2.5} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500" />
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
          <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
            <History size={18} className="text-slate-400" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            System Log Empty
          </span>
          <span className="text-xs text-slate-400 mt-1">
            No recent interactions recorded.
          </span>
        </div>
      )}
    </div>
  );
};

export default InteractionTimeline;