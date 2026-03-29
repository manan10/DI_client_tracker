import React from 'react';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientProfileHeader = ({ client }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-900 pt-8 pb-16 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-360 mx-auto px-6 lg:px-12 relative z-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Directory
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">
                {client.category || 'General'}
              </span>
              <span className="text-slate-400 text-xs font-mono tracking-wider">{client.pan}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              {client.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {client.contactDetails?.phoneNo && (
              <a href={`tel:${client.contactDetails.phoneNo}`} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all shadow-sm">
                <Phone size={18} />
              </a>
            )}
            {client.contactDetails?.email && (
              <a href={`mailto:${client.contactDetails.email}`} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all shadow-sm">
                <Mail size={18} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfileHeader;