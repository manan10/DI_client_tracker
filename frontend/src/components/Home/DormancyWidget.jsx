import React, { useEffect, useState } from 'react';
import { AlertTriangle, Phone, Clock, ArrowRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const DormancyWidget = ({ onClientClick }) => {
  const [dormant, setDormant] = useState([]);
  const { request, loading } = useApi();

  useEffect(() => {
    const fetchDormant = async () => {
      const res = await request("/clients/dormant");
      if (Array.isArray(res)) {
        setDormant(res);
      } else {
        setDormant([]);
      }
    };
    fetchDormant();
  }, [request]);

  if (!loading && dormant.length === 0) return null;

  return (
    <div className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden flex flex-col">
      
      {/* WIDGET HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-rose-100 dark:border-rose-500/10 bg-rose-50/30 dark:bg-rose-500/5">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-rose-500" strokeWidth={2.5} />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-rose-800 dark:text-rose-400">
            Retention Risk
          </h3>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-md">
          {dormant.length} AT RISK
        </span>
      </div>

      {/* LIST CONTENT */}
      <div className="flex flex-col divide-y divide-slate-100 dark:divide-white/5">
        {loading ? (
          <div className="py-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            Scanning Vault...
          </div>
        ) : (
          dormant.map((client) => (
            <div 
              key={client._id} 
              onClick={() => onClientClick(client)}
              className="group flex items-center justify-between px-4 py-3 hover:bg-rose-50/50 dark:hover:bg-rose-500/5 transition-colors cursor-pointer min-w-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                
                {/* Avatar Initial */}
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500 transition-colors shrink-0">
                  {client.name.charAt(0)}
                </div>

                <div className="flex flex-col min-w-0">
                  <h4 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {client.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={10} className="text-slate-400" strokeWidth={2.5} />
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                      Last Touch: {client.lastMet ? new Date(client.lastMet).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Direct Call Action */}
              <a 
                href={`tel:${client.phone}`}
                onClick={(e) => e.stopPropagation()} 
                className="w-8 h-8 flex items-center justify-center shrink-0 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all outline-none"
                title="Call Client"
              >
                <Phone size={14} strokeWidth={2.5} />
              </a>
            </div>
          ))
        )}
      </div>

      {/* FOOTER ACTION */}
      <button className="group flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-white/2 border-t border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full">
        <span className="text-[10px] font-bold text-slate-500 group-hover:text-rose-600 dark:group-hover:text-rose-400 uppercase tracking-widest transition-colors mt-px">
          View All Risks
        </span>
        <ArrowRight size={14} strokeWidth={2.5} className="text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-transform group-hover:translate-x-1" />
      </button>
      
    </div>
  );
};

export default DormancyWidget;