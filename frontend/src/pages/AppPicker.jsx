import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  ArrowRight,
  ShieldCheck,
  Users,
  ReceiptIndianRupee,
  Activity
} from 'lucide-react';
import { useAuth } from "../hooks/useAuth";
import Logo from '../assets/logo_nobrand.png';

const allApps = [
  {
    id: 'CLIENT_TRACKER',
    title: 'Client Tracker',
    subtitle: 'Business',
    description: 'Comprehensive client management CRM engine designed for high-volume interactions and accounting sync.',
    path: '/dashboard',
    icon: Users,
    bgColor: 'bg-emerald-500',
    accentColor: 'text-emerald-500',
    shadowColor: 'shadow-emerald-500/20'
  },
  {
    id: 'EXPENSE_TRACKER',
    title: 'Expense Logger',
    subtitle: 'Family',
    description: 'Centralized household financial hub for tracking daily spending and managing family liquid cash vaults.',
    path: '/expenses',
    icon: ReceiptIndianRupee,
    bgColor: 'bg-blue-500',
    accentColor: 'text-blue-500',
    shadowColor: 'shadow-blue-500/20'
  }
];

const AppPicker = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeId, setActiveId] = useState(null);

  const authorizedApps = useMemo(() => {
    const userPermissions = user?.allowedApps || [];
    return allApps.filter(app => userPermissions.includes(app.id));
  }, [user]);

  // Find the current active app object
  const activeApp = authorizedApps.find(a => a.id === activeId);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans overflow-hidden select-none">
      
      {/* --- INTEGRATED PREMIUM NAVIGATION (FULL WIDTH EDGE-TO-EDGE) --- */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 lg:px-12 py-6 lg:py-10 pointer-events-none">
        <div className="flex items-center justify-between w-full mx-auto">
          
          {/* Logo Capsule */}
          <div className={`flex items-center gap-2.5 lg:gap-4 bg-white/90 backdrop-blur-xl p-1.5 pr-4 lg:p-2 lg:pr-6 rounded-2xl border transition-all duration-500 shadow-xl pointer-events-auto
            ${activeApp 
                ? `border-${activeApp.bgColor?.replace('bg-', '')}/30 ${activeApp.shadowColor}` 
                : 'border-slate-100 shadow-slate-200/50'}`}>
            
            <div className={`p-1.5 lg:p-3 rounded-xl transition-all duration-500 ${activeApp ? activeApp.bgColor : 'bg-slate-900'}`}>
              <img src={Logo} alt="Logo" className="h-5 lg:h-9 w-auto brightness-0 invert" />
            </div>

            <div className="flex flex-col text-left">
              <span className={`text-[10px] lg:text-[14px] font-[1000] uppercase tracking-wider lg:tracking-[0.3em] transition-colors duration-500 ${activeApp ? activeApp.accentColor : 'text-slate-900'}`}>
                Dalal Central
              </span>
              <span className="text-[7px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Application Hub
              </span>
            </div>
          </div>

          {/* Sign Out */}
          <button 
            onClick={logout}
            className="group flex items-center gap-2 px-4 lg:px-8 py-3 lg:py-4 bg-slate-950/90 backdrop-blur-md text-white rounded-2xl text-[9px] lg:text-[11px] font-black uppercase tracking-widest active:scale-95 shadow-2xl pointer-events-auto transition-all hover:bg-rose-600"
          >
            <LogOut size={12} className="lg:w-4 lg:h-4 transition-transform group-hover:-translate-x-1" /> 
            <span className="tracking-tighter lg:tracking-widest">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* --- FULL SCREEN INTERACTIVE STRIPS --- */}
      <main className="flex-1 flex flex-col lg:flex-row h-full">
        {authorizedApps.map((app, idx) => (
          <div
            key={app.id}
            onMouseEnter={() => setActiveId(app.id)}
            onMouseLeave={() => setActiveId(null)}
            onClick={() => {
              if (activeId === app.id) {
                navigate(app.path);
              } else {
                setActiveId(app.id);
              }
            }}
            className={`group relative flex-1 flex flex-col justify-center items-center p-6 transition-all duration-700 cursor-pointer overflow-hidden border-b lg:border-b-0 lg:border-r last:border-0 border-slate-50
              ${activeId === app.id ? app.bgColor : 'bg-white'}`}
          >
            {/* Background Number Accent */}
            <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[45vw] lg:text-[22vw] font-[1000] uppercase transition-colors duration-700 pointer-events-none italic
              ${activeId === app.id ? 'text-white/10' : 'text-slate-50'}`}>
              {idx + 1}
            </span>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full space-y-4 lg:space-y-10">
              
              <div className={`w-24 h-24 lg:w-32 lg:h-32 rounded-full flex items-center justify-center transition-all duration-700 border-2 
                ${activeId === app.id ? 'bg-white border-white scale-110 shadow-2xl' : 'bg-white border-slate-100 shadow-lg'}`}>
                <app.icon 
                  size={activeId === app.id ? 44 : 32} 
                  className={`transition-colors duration-700 ${activeId === app.id ? app.accentColor : 'text-slate-300'}`} 
                  strokeWidth={2.5} 
                />
              </div>

              <div className="space-y-1 lg:space-y-3">
                <p className={`text-[11px] lg:text-[14px] font-black uppercase tracking-[0.5em] transition-colors duration-700 
                  ${activeId === app.id ? 'text-white/80' : 'text-slate-400'}`}>
                  {app.subtitle}
                </p>
                <h2 className={`text-4xl lg:text-9xl font-[1000] uppercase tracking-tighter italic leading-none transition-colors duration-700 
                  ${activeId === app.id ? 'text-white' : 'text-slate-900'}`}>
                  {app.title}
                </h2>
              </div>

              <div className={`transition-all duration-700 overflow-hidden px-6 
                ${activeId === app.id ? 'max-h-80 opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}>
                <p className="text-white text-[12px] lg:text-lg font-bold uppercase tracking-tight leading-relaxed max-w-xs lg:max-w-md mx-auto italic">
                  {app.description}
                </p>
                <div className="mt-8 lg:mt-12 inline-flex items-center gap-4 px-10 lg:px-12 py-4 lg:py-5 bg-white text-slate-900 rounded-full text-[10px] lg:text-xs font-[1000] uppercase tracking-[0.3em] shadow-2xl transition-transform">
                  {window.innerWidth < 1024 ? 'Tap to Launch' : 'Go to Application'} <ArrowRight size={18} strokeWidth={3} className={app.accentColor} />
                </div>
              </div>
            </div>

            <div className="absolute bottom-12 lg:hidden flex flex-col items-center gap-3">
               <div className={`h-1.5 rounded-full transition-all duration-700 
                ${activeId === app.id ? 'bg-white w-24' : 'bg-slate-200 w-12'}`} />
            </div>
          </div>
        ))}
      </main>

      <footer className="fixed bottom-0 left-0 w-full z-40 px-6 lg:px-12 py-6 lg:py-8 flex justify-between items-center pointer-events-none opacity-30">
         <div className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-slate-900" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-900">Secure Access</span>
         </div>
         <p className="text-[8px] font-black uppercase tracking-widest text-slate-900 italic">{user?.name?.split(' ')[0]}</p>
      </footer>
    </div>
  );
};

export default AppPicker;