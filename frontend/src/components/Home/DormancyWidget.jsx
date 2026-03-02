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
    <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm border-t-4 border-t-red-400 transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500" /> 
            Retention Risk
          </h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Clients drifting away (6+ Months)</p>
        </div>
        <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">
          {dormant.length}
        </span>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-4 text-center text-[10px] font-black text-slate-300 animate-pulse uppercase">Analyzing activity...</div>
        ) : (
          dormant.map((client) => (
            <div 
              key={client._id} 
              className="flex items-center justify-between group p-2 rounded-xl hover:bg-red-50/30 transition-colors cursor-pointer"
              onClick={() => onClientClick(client)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white border border-red-100 text-red-500 rounded-xl flex items-center justify-center font-black text-xs shadow-sm">
                  {client.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-800 uppercase truncate w-28 md:w-36">
                    {client.name}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Clock size={10} /> {client.lastMet ? new Date(client.lastMet).toLocaleDateString('en-IN') : 'Never'}
                  </p>
                </div>
              </div>
              
              {/* Quick Call Action */}
              <a 
                href={`tel:${client.phone}`}
                onClick={(e) => e.stopPropagation()} // Don't open drawer when clicking call
                className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-100 transition-all"
                title="Call Client"
              >
                <Phone size={14} />
              </a>
            </div>
          ))
        )}
      </div>

      <button className="w-full mt-6 py-3 border-2 border-dashed border-red-50 rounded-xl text-[9px] font-black text-red-300 uppercase tracking-widest hover:bg-red-50 transition-all">
        View All Dormant
      </button>
    </div>
  );
};

export default DormancyWidget;