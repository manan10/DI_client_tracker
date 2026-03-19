import React, { useEffect, useState } from 'react';
import { AlertTriangle, Phone, UserX, Clock, ArrowRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const DormancyWidget = ({ onClientClick }) => {
  const [dormant, setDormant] = useState([]);
  const { request, loading } = useApi();

  useEffect(() => {
    const fetchDormant = async () => {
      try {
        const data = await request('/clients/dormant');
        setDormant(data || []);
      } catch (err) {
        console.error("Dormancy fetch error:", err);
      }
    };
    fetchDormant();
  }, [request]);

  if (!loading && dormant.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* 1. SECTION HEADER - High Contrast Alert */}
      <div className="flex justify-between items-center px-1 mt-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 text-white rounded-lg shadow-lg shadow-red-500/20">
            <AlertTriangle size={14} strokeWidth={3} />
          </div>
          <h3 className="text-[11px] font-[1000] text-slate-900 dark:text-white uppercase tracking-[0.2em]">
            Retention Risk
          </h3>
        </div>
        <span className="text-[10px] font-black px-2.5 py-1 bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-500 shadow-sm">
          {dormant.length} AT RISK
        </span>
      </div>

      {/* 2. TACTILE LIST - Solid Containers */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
            Scanning Activity Vault...
          </div>
        ) : (
          dormant.map((client) => (
            <div 
              key={client._id} 
              onClick={() => onClientClick(client)}
              className="group flex items-center justify-between p-4 
                         bg-white dark:bg-[#0a0c10] 
                         border-2 border-slate-200 dark:border-white/5 
                         border-b-4 border-b-slate-300 dark:border-b-black/60
                         rounded-2xl hover:-translate-y-1 active:translate-y-0.5 
                         transition-all duration-200 shadow-md hover:shadow-xl cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Avatar Well: Red focus anchor */}
                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 flex items-center justify-center font-[1000] text-red-600 dark:text-red-500 shadow-inner group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                  {client.name.charAt(0)}
                </div>

                <div className="min-w-0">
                  <h4 className="text-[13px] font-[1000] text-slate-900 dark:text-white uppercase tracking-tight truncate group-hover:text-red-700 dark:group-hover:text-red-500 transition-colors">
                    {client.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={10} className="text-slate-400 dark:text-slate-600" />
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                      Last Touch: {client.lastMet ? new Date(client.lastMet).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
              
              <a 
                href={`tel:${client.phone}`}
                onClick={(e) => e.stopPropagation()} 
                className="p-3 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-600 hover:text-white hover:bg-red-600 dark:hover:bg-red-600 border-2 border-slate-200 dark:border-white/10 rounded-xl transition-all active:scale-90 shadow-sm"
                title="Call Client"
              >
                <Phone size={18} strokeWidth={3} />
              </a>
            </div>
          ))
        )}
      </div>

      {/* 3. TACTILE FOOTER */}
      <button className="w-full flex items-center justify-center gap-3 py-4 bg-white dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-500 rounded-2xl border-2 border-slate-200 dark:border-white/10 border-b-4 border-b-slate-300 dark:border-b-black/40 shadow-md transition-all text-[10px] font-black uppercase tracking-widest active:scale-[0.98] group">
        View Full Retention List
        <ArrowRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default DormancyWidget;