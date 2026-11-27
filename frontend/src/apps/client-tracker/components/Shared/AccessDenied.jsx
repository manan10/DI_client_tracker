import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="relative w-full max-w-lg">
        {/* Background Glow */}
        <div className="absolute -inset-4 bg-rose-500/10 blur-3xl rounded-full opacity-50 dark:opacity-20" />
        
        <div className="relative bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg p-12 shadow-2xl text-center">
          <div className="w-24 h-24 bg-rose-500/10 rounded-md flex items-center justify-center text-rose-500 mx-auto mb-8 animate-pulse">
            <ShieldAlert size={48} strokeWidth={1.5} />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold sora-font text-slate-900 dark:text-white tracking-tight leading-none mb-4">
            Access <span className="text-rose-500">Restricted</span>
          </h1>
          
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide mb-10 leading-relaxed">
            Administrative privileges required <br/> to view Treasury & Performance data
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="group flex items-center justify-center gap-3 bg-sky-600 hover:bg-sky-500 text-white py-3.5 rounded-lg text-xs font-semibold tracking-wide transition-all active:scale-[0.98] cursor-pointer"
            >
              <ArrowLeft size={16} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
              Return to Dashboard
            </button>
            
            <div className="flex items-center justify-center gap-2 py-4 opacity-50">
              <Lock size={12} className="text-slate-400" />
              <span className="text-[10px] font-medium font-mono text-slate-400 uppercase tracking-widest">
                Security Protocol 403-A
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;