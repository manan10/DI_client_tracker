import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Database, ArrowRight } from 'lucide-react';

const DirectoryBlock = ({ clientCount }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate('/directory')}
      className="group bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-8 cursor-pointer hover:border-amber-300 dark:hover:border-amber-500/50 transition-all relative overflow-hidden group duration-300"
    >
      {/* Background Icon - Shifted to deep slate for dark mode texture */}
      <div className="absolute -right-4 -bottom-4 text-slate-50 dark:text-slate-800/50 group-hover:text-amber-50 dark:group-hover:text-amber-900/10 transition-colors duration-500">
        <Database size={160} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          {/* Main Icon Container */}
          <div className="p-3 bg-amber-600 rounded-xl text-white shadow-lg shadow-amber-200 dark:shadow-none">
            <Users size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight text-xl leading-none">
              Client Directory
            </h3>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em] mt-1">
              Centralized Database
            </p>
          </div>
        </div>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md leading-relaxed mb-8 font-medium">
          Access your full database of {clientCount}+ wealth elite clients. Filter by Tier, search by PAN, and manage contact details in one centralized view.
        </p>
        
        {/* Call to Action */}
        <div className="flex items-center text-amber-700 dark:text-amber-500 font-black text-xs uppercase tracking-widest group-hover:gap-3 transition-all duration-300">
          Open Full Directory <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default DirectoryBlock;