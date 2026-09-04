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
        
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-12 shadow-2xl text-center">
          <div className="w-24 h-24 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center text-rose-500 mx-auto mb-8 animate-pulse">
            <ShieldAlert size={48} strokeWidth={1.5} />
          </div>

          <h1 className="text-4xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none mb-4">
            Access <span className="text-rose-500">Restricted</span>
          </h1>
          
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 leading-relaxed">
            Administrative privileges required <br/> to view Treasury & Performance data
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="group flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-5 rounded-2xl text-[10px] font-[1000] uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95"
            >
              <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
              Return to Dashboard
            </button>
            
            <div className="flex items-center justify-center gap-2 py-4 opacity-40">
              <Lock size={12} className="text-slate-400" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
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