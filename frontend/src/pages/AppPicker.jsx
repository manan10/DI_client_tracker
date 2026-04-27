import React, { useMemo } from 'react'; // Added useMemo
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ReceiptIndianRupee,
  LogOut, 
  ArrowRight,
  ShieldCheck,
  Activity,
  Lock // Added Lock icon
} from 'lucide-react';
import { useAuth } from "../hooks/useAuth";
import Logo from '../assets/logo_nobrand.png';

const AppPicker = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Define all possible apps
  const allApps = [
    {
      id: 'CLIENT_TRACKER', // Matched to Backend Enum
      title: 'Business',
      subtitle: 'Client Tracker',
      description: 'Comprehensive client management CRM engine designed for high-volume client interactions, automated bank statement extraction, and seamless accounting synchronization.',
      path: '/dashboard',
      icon: <Users size={28} strokeWidth={2.5} />,
      color: 'from-emerald-500 to-teal-600',
      accent: 'text-emerald-500',
    },
    {
      id: 'EXPENSE_TRACKER', // Matched to Backend Enum
      title: 'Family',
      subtitle: 'Expense Tracker',
      description: 'Centralized household financial hub for tracking daily spending across multiple members, managing liquid cash vaults, and analyzing digital asset flow in real-time.',
      path: '/expenses',
      icon: <ReceiptIndianRupee size={28} strokeWidth={2.5} />,
      color: 'from-indigo-500 to-blue-600',
      accent: 'text-indigo-500',
    }
  ];

  // --- FAIL-SAFE FILTER ---
  // Only show apps that exist in the user's allowedApps array
  const authorizedApps = useMemo(() => {
    const userPermissions = user?.allowedApps || [];
    return allApps.filter(app => userPermissions.includes(app.id));
  }, [user]);

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] flex flex-col overflow-hidden font-sans">
      
      {/* --- BACKGROUND DECOR --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-100 h-100 bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-100 h-100 bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full p-5 sm:p-10 lg:p-16">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 sm:mb-10">
          <div className="flex items-center gap-4 text-left">
            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
              <img src={Logo} alt="Logo" className="h-6 w-auto grayscale contrast-125" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Security Node</p>
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mt-1">Authorized Session</p>
            </div>
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:border-red-100 transition-all active:scale-95 shadow-sm"
          >
            <LogOut size={14} /> <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* WELCOME HUD */}
        <div className="mb-8 sm:mb-12 text-left">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-[1000] text-slate-900 tracking-tighter uppercase italic leading-[0.9]">
            Welcome <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-indigo-600">{user?.name?.split(' ')[0] || 'Member'}.</span>
          </h1>
          <div className="flex items-center gap-2 mt-4 opacity-50">
             <ShieldCheck size={12} className="text-emerald-500" />
             <span className="text-[9px] font-black uppercase tracking-widest">
               {authorizedApps.length > 0 ? "System Protocols Active" : "Access Restricted"}
             </span>
          </div>
        </div>

        {/* INTERACTIVE CARDS */}
        <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:gap-6 min-h-0 mb-4">
          {authorizedApps.length > 0 ? (
            authorizedApps.map((app, idx) => (
              <button
                key={app.id}
                onClick={() => navigate(app.path)}
                className="group relative flex-1 flex flex-col justify-between p-6 sm:p-10 bg-white border border-slate-100 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200 active:scale-[0.98] text-left overflow-hidden cursor-pointer"
              >
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-linear-to-r ${app.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                
                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                  <div className="flex justify-between items-start">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-br ${app.color} flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                      {app.icon}
                    </div>
                    <div className="p-3 rounded-full bg-slate-50 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                      <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${app.accent}`}>{app.subtitle}</p>
                      <h2 className="text-3xl sm:text-5xl font-[1000] text-slate-900 tracking-tighter uppercase italic leading-none">
                        {app.title}
                      </h2>
                    </div>
                    <p className="text-xs sm:text-[13px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors leading-relaxed sm:max-w-[90%]">
                      {app.description}
                    </p>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-2 text-8xl font-black text-slate-50 italic pointer-events-none leading-none select-none transition-transform group-hover:scale-110 duration-700 uppercase">
                  {idx + 1}
                </div>
              </button>
            ))
          ) : (
            /* FAIL-SAFE EMPTY STATE */
            <div className="flex-1 flex flex-col items-center justify-center bg-white border border-dashed border-slate-200 rounded-[2.5rem] p-10 text-center animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
                <Lock size={40} />
              </div>
              <h2 className="text-2xl font-[1000] text-slate-900 uppercase tracking-tighter italic">Access Locked</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 leading-relaxed max-w-62.5">
                Your account profile has not been assigned to any functional applications. Please contact the administrator.
              </p>
              <button 
                onClick={logout}
                className="mt-8 px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-xl shadow-slate-900/20"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center opacity-30 pt-2">
           <div className="flex items-center gap-4">
              <Activity size={10} className="text-emerald-500" />
              <p className="text-[8px] font-black text-slate-900 uppercase tracking-[0.5em]">Auth_Core_v5.0</p>
           </div>
           <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest italic">Dalal Family Central</p>
        </div>
      </div>
    </div>
  );
};

export default AppPicker;