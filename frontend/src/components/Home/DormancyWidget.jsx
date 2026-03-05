import React, { useEffect, useState } from 'react';
import { AlertTriangle, Phone, UserX, Clock } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const DormancyWidget = ({ onClientClick }) => {
  const [dormant, setDormant] = useState([]);
  const { request, loading } = useApi();

  useEffect(() => {
    const fetchDormant = async () => {
      try {
        const data = await request('/clients/dormant');
        setDormant(data);
      } catch (err) {
        console.error("Dormancy fetch error:", err);
      }
    };
    fetchDormant();
  }, [request]);

  if (!loading && dormant.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-red-100 dark:border-red-900/20 shadow-sm border-t-4 border-t-red-400 dark:border-t-red-500 transition-all hover:shadow-md duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em] flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500" /> 
            Retention Risk
          </h3>
          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">Clients drifting away (6+ Months)</p>
        </div>
        <span className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full">
          {dormant.length}
        </span>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-4 text-center text-[10px] font-black text-slate-300 dark:text-slate-600 animate-pulse uppercase">Analyzing activity...</div>
        ) : (
          dormant.map((client) => (
            <div 
              key={client._id} 
              className="flex items-center justify-between group p-2 rounded-xl hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors cursor-pointer"
              onClick={() => onClientClick(client)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/30 text-red-500 dark:text-red-400 rounded-xl flex items-center justify-center font-black text-xs shadow-sm transition-colors">
                  {client.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase truncate w-28 md:w-36 transition-colors">
                    {client.name}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1">
                    <Clock size={10} /> {client.lastMet ? new Date(client.lastMet).toLocaleDateString('en-IN') : 'Never'}
                  </p>
                </div>
              </div>
              
              <a 
                href={`tel:${client.phone}`}
                onClick={(e) => e.stopPropagation()} 
                className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl hover:bg-red-500 dark:hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-100 dark:hover:shadow-none transition-all"
                title="Call Client"
              >
                <Phone size={14} />
              </a>
            </div>
          ))
        )}
      </div>

      <button className="w-full mt-6 py-3 border-2 border-dashed border-red-50 dark:border-red-900/20 rounded-xl text-[9px] font-black text-red-300 dark:text-red-800 uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
        View All Dormant
      </button>
    </div>
  );
};

export default DormancyWidget;