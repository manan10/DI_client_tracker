import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Database, ArrowRight, ShieldCheck } from 'lucide-react';

const DirectoryBlock = () => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate('/directory')}
      className="group relative overflow-hidden cursor-pointer transition-all duration-300
                 /* TACTILE SURFACE */
                 bg-white dark:bg-slate-800 
                 border-2 border-slate-200 dark:border-white/5 
                 border-b-4 border-b-slate-300 dark:border-b-black/60
                 rounded-[2.5rem] p-8 lg:p-12
                 hover:-translate-y-1 active:translate-y-0.5
                 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-none"
    >
      {/* Background Texture - Visual anchor for depth */}
      <div className="absolute -right-8 -bottom-8 text-slate-100 dark:text-white/2 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12">
        <Database size={240} strokeWidth={1} />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* ICON WELL: Emerald/Slate for high-end database feel */}
          <div className="w-16 h-16 bg-emerald-600 dark:bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
            <Users size={32} strokeWidth={2.5} />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl lg:text-3xl font-[1000] text-slate-950 dark:text-white uppercase tracking-tighter leading-none">
                Master Directory
              </h3>
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-md">
                <ShieldCheck size={10} className="text-emerald-600" />
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Verified</span>
              </div>
            </div>
            <p className="text-xs lg:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Access your full intelligence vault of all wealth elite clients. 
              Search by PAN, manage families, and analyze portfolio ties in one unified terminal.
            </p>
          </div>
        </div>
        
        {/* CALL TO ACTION: Large touch target */}
        <div className="flex items-center gap-4 py-4 px-6 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-2xl 
                        text-slate-900 dark:text-white font-[1000] text-[11px] uppercase tracking-[0.2em] 
                        group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-emerald-600 transition-all duration-300">
          Open Registry 
          <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default DirectoryBlock;