import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Phone, User, Mail, Calendar, History, Clock, ArrowRight } from 'lucide-react';
import { useApi } from '../../../../shared/hooks/useApi';

const FILTER_TYPES = ['All', 'In-Person', 'Call', 'WhatsApp', 'Email'];

const InteractionTimeline = ({ refreshKey = 0 }) => {
  const [interactions, setInteractions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const { request, loading } = useApi();
  const navigate = useNavigate();

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
  }, [request, refreshKey]);

  const filteredInteractions = useMemo(() => {
    if (activeFilter === 'All') return interactions;
    return interactions.filter((item) => item.type === activeFilter);
  }, [interactions, activeFilter]);

  const getTypeConfig = (type) => {
    switch (type) {
      case 'In-Person': 
        return { icon: <User size={11} strokeWidth={2.5} />, color: 'bg-sky-500', text: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-500/10 border border-sky-500/20' };
      case 'Call': 
        return { icon: <Phone size={11} strokeWidth={2.5} />, color: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-500/10 border border-amber-500/20' };
      case 'WhatsApp': 
        return { icon: <MessageSquare size={11} strokeWidth={2.5} />, color: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-500/10 border border-emerald-500/20' };
      case 'Email':
        return { icon: <Mail size={11} strokeWidth={2.5} />, color: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-500/10 border border-indigo-500/20' };
      default: 
        return { icon: <Clock size={11} strokeWidth={2.5} />, color: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700' };
    }
  };

  if (loading && interactions.length === 0) return (
    <div className="space-y-6 animate-pulse p-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-4">
          <div className="w-2 h-2 mt-2 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-12 w-full bg-slate-50 dark:bg-[#131720] rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full space-y-4">
      {/* Channel Filter Pills */}
      <div className="flex items-center gap-1.5 flex-wrap pb-3 border-b border-slate-200/80 dark:border-slate-800">
        {FILTER_TYPES.map((type) => {
          const isActive = activeFilter === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setActiveFilter(type)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                isActive
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-[#131720] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-sky-400/50 hover:text-sky-600 dark:hover:text-sky-400'
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>

      {filteredInteractions.length > 0 ? (
        <div className="flex flex-col">
          {filteredInteractions.map((item, index) => {
            const config = getTypeConfig(item.type);
            const isLast = index === filteredInteractions.length - 1;
            const clientId = item.client?._id || (typeof item.client === 'string' ? item.client : null);

            return (
              <div
                key={item._id}
                onClick={() => clientId && navigate(`/client/${clientId}`)}
                className={`group relative flex gap-4 sm:gap-5 w-full p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1C2230]/70 transition-colors min-w-0 ${
                  clientId ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                
                {/* TIMELINE TRACK & NODE */}
                <div className="relative flex flex-col items-center shrink-0 w-4 mt-1.5">
                  {/* The Node */}
                  <div className={`absolute z-10 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-[#161B26] group-hover:scale-125 transition-transform duration-200 ${config.color}`} />
                  {/* The Line */}
                  {!isLast && (
                    <div className="absolute top-3 w-px h-[calc(100%+1.25rem)] bg-slate-200 dark:bg-slate-800" />
                  )}
                </div>

                {/* CONTENT PAYLOAD */}
                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1.5">
                    
                    {/* Header Stack */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <h4 className="text-[14px] font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {item.client?.name || "Unknown Client"}
                      </h4>
                      <span className={`shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
                        {config.icon}
                        {item.type}
                      </span>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 text-[11px] font-mono font-medium text-slate-400 shrink-0">
                      <Calendar size={12} strokeWidth={2.25} />
                      <time dateTime={item.date}>
                        {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </time>
                    </div>
                  </div>

                  {/* Summary Text */}
                  <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed pr-8 line-clamp-2">
                    {item.summary}
                  </p>

                  {/* Discussion Tags */}
                  {item.discussionPoints?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {item.discussionPoints.map((p, idx) => (
                        <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#131720] text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hover Arrow (Right Edge) */}
                {clientId && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200">
                    <ArrowRight size={15} strokeWidth={2.25} className="text-sky-500" />
                  </div>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-14 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
          <div className="w-10 h-10 bg-slate-50 dark:bg-[#131720] rounded-full flex items-center justify-center mb-3">
            <History size={18} className="text-slate-400" strokeWidth={2.25} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {activeFilter === 'All' ? 'System Log Empty' : `No ${activeFilter} Logs`}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            {activeFilter === 'All' ? 'No recent interactions recorded.' : 'Try selecting a different channel filter.'}
          </span>
        </div>
      )}
    </div>
  );
};

export default InteractionTimeline;