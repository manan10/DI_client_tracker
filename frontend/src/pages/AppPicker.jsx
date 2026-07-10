import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  ArrowRight,
  ShieldCheck,
  Users,
  ReceiptIndianRupee,
  Sparkles
} from 'lucide-react';
import { useAuth } from "../hooks/useAuth";
import Logo from '../assets/logo_nobrand.png';

const allApps = [
  {
    id: 'CLIENT_TRACKER',
    title: 'Client Tracker',
    subtitle: 'Business Engine',
    description: 'Comprehensive client management CRM engine designed for high-volume interactions and accounting sync.',
    path: '/dashboard',
    icon: Users,
    // Fully constructed Tailwind JIT classes to prevent the background purging bug
    theme: {
      primary: 'bg-emerald-500',
      text: 'text-emerald-600',
      lightBg: 'bg-emerald-50',
      border: 'border-emerald-100',
      hoverRing: 'group-hover:ring-emerald-500/30',
      shadowColor: 'shadow-emerald-500/15 group-hover:shadow-emerald-500/30',
      gradient: 'from-emerald-500/20 to-transparent',
      btnHover: 'group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 active:bg-emerald-600 active:text-white',
      arrowBase: 'text-emerald-500',
      arrowHover: 'group-hover:text-white active:text-white'
    }
  },
  {
    id: 'EXPENSE_TRACKER',
    title: 'Expense Logger',
    subtitle: 'Family Vault',
    description: 'Centralized household financial hub for tracking daily spending and managing family liquid cash vaults.',
    path: '/expenses',
    icon: ReceiptIndianRupee,
    theme: {
      primary: 'bg-blue-500',
      text: 'text-blue-600',
      lightBg: 'bg-blue-50',
      border: 'border-blue-100',
      hoverRing: 'group-hover:ring-blue-500/30',
      shadowColor: 'shadow-blue-500/15 group-hover:shadow-blue-500/30',
      gradient: 'from-blue-500/20 to-transparent',
      btnHover: 'group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 active:bg-blue-600 active:text-white',
      arrowBase: 'text-blue-500',
      arrowHover: 'group-hover:text-white active:text-white'
    }
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

  const activeApp = authorizedApps.find(a => a.id === activeId);

  return (
    <div className="min-h-dvh w-full bg-slate-50 flex flex-col font-sans overflow-x-hidden relative selection:bg-slate-200">
      
      {/* --- AMBIENT BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex justify-center items-center">
        {/* Soft, non-intrusive animated orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 blur-[100px] lg:blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 blur-[100px] lg:blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
      </div>

      {/* --- SHARPER EXECUTIVE NAVIGATION --- */}
      <nav className="fixed top-0 left-0 w-full z-50 px-5 lg:px-10 py-5 lg:py-6 pointer-events-none">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          
          {/* Logo Capsule (Less rounded) */}
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl p-1.5 pr-5 lg:p-2 lg:pr-6 rounded-xl border border-white/40 shadow-sm pointer-events-auto transition-all duration-500">
            <div className={`p-2 lg:p-2.5 rounded-lg transition-all duration-500 shadow-inner ${activeApp ? activeApp.theme.primary : 'bg-slate-900'}`}>
              <img src={Logo} alt="Logo" className="h-4 lg:h-5 w-auto brightness-0 invert drop-shadow-md" />
            </div>
            <div className="flex flex-col text-left">
              <span className={`text-[11px] lg:text-[13px] font-[1000] uppercase tracking-wider lg:tracking-[0.2em] transition-colors duration-500 ${activeApp ? activeApp.theme.text : 'text-slate-900'}`}>
                Dalal Central
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Sparkles size={8} className="text-slate-400" />
                <span className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">
                  App Hub
                </span>
              </div>
            </div>
          </div>

          {/* Sign Out Button (Sharper) */}
          <button 
            onClick={logout}
            className="group flex items-center gap-2 px-5 py-3 lg:py-3.5 bg-white/80 backdrop-blur-xl border border-white/40 text-slate-700 rounded-xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest active:scale-95 shadow-sm hover:shadow-md pointer-events-auto transition-all duration-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100"
          >
            <LogOut size={14} className="transition-transform duration-300 group-hover:-translate-x-1" /> 
            <span className="tracking-tighter lg:tracking-widest hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* --- INTERACTIVE CARD DASHBOARD --- */}
      {/* FIXED: Changed mobile justification to 'start' and reduced top padding slightly so it doesn't float awkwardly in the center */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-start lg:justify-center gap-4 lg:gap-8 w-full max-w-6xl mx-auto px-5 pt-28 pb-24 lg:pt-0 lg:pb-0 relative z-10 min-h-dvh">
        
        {authorizedApps.map((app, idx) => (
          <div
            key={app.id}
            onMouseEnter={() => setActiveId(app.id)}
            onMouseLeave={() => setActiveId(null)}
            onClick={() => navigate(app.path)}
            className="group w-full max-w-sm lg:max-w-md cursor-pointer animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            {/* The Card Envelope (Reduced padding on mobile) */}
            <div className={`relative flex flex-col bg-white/90 backdrop-blur-2xl rounded-3xl p-5 lg:p-10 border border-slate-100 transition-all duration-500 ease-out h-full overflow-hidden
              shadow-xl lg:shadow-md ${app.theme.shadowColor}
              lg:hover:-translate-y-1.5 lg:hover:shadow-2xl ring-1 ring-transparent ${app.theme.hoverRing}
            `}>
              
              {/* Internal Gradient Flare */}
              <div className={`absolute top-0 right-0 w-64 h-64 bg-linear-to-bl ${app.theme.gradient} opacity-40 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-bl-full pointer-events-none`} />

              {/* Background Index Number (Scaled down on mobile) */}
              <div className="absolute top-4 right-5 text-[50px] lg:top-6 lg:right-8 lg:text-[100px] font-[1000] italic leading-none pointer-events-none select-none text-slate-100/80 transition-transform duration-700 group-hover:scale-110 group-hover:-translate-y-2 group-hover:text-slate-200/50">
                0{idx + 1}
              </div>

              {/* FIXED: Flex Row on Mobile, Flex Col on Desktop */}
              <div className="relative z-10 flex flex-row lg:flex-col items-start gap-4 lg:gap-0 flex-1">
                
                {/* Icon Container (Smaller on mobile, margin adjusted) */}
                <div className={`shrink-0 w-14 h-14 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center lg:mb-10 transition-all duration-500 shadow-sm border
                  ${app.theme.lightBg} ${app.theme.border} ${app.theme.text}
                  group-hover:scale-110 lg:group-hover:-rotate-3 group-hover:shadow-md
                `}>
                  <app.icon className="w-6 h-6 lg:w-8 lg:h-8 transition-transform duration-500" strokeWidth={2.5} />
                </div>

                {/* Typography Structure */}
                <div className="flex-1 flex flex-col justify-start">
                  <div className="inline-flex items-center gap-2 mb-1.5 lg:mb-3">
                    <span className={`w-2 h-2 rounded-full ${app.theme.primary} animate-pulse`} />
                    <p className="text-[9px] lg:text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-slate-500 transition-colors">
                      {app.subtitle}
                    </p>
                  </div>
                  
                  <h2 className="text-2xl lg:text-4xl font-[1000] uppercase tracking-tighter italic text-slate-900 leading-none mb-2 lg:mb-4 group-hover:text-slate-950 transition-colors">
                    {app.title}
                  </h2>

                  {/* Description (Tighter margin on mobile) */}
                  <p className="text-[12px] lg:text-[14px] font-medium text-slate-500 leading-relaxed max-w-[18rem] mb-4 lg:mb-10 transition-colors group-hover:text-slate-600">
                    {app.description}
                  </p>
                </div>
              </div>

              {/* Dad-Proof Action Button (Tighter padding on mobile) */}
              <div className="relative z-10 mt-auto pt-2 lg:pt-4">
                <button className={`w-full py-3.5 lg:py-4 rounded-xl flex items-center justify-center gap-3 text-[11px] lg:text-xs font-[1000] uppercase tracking-[0.25em] transition-all duration-300 border focus:outline-none
                  bg-slate-50 text-slate-700 border-slate-200
                  ${app.theme.btnHover}
                `}>
                  Launch Application 
                  <ArrowRight size={16} strokeWidth={3} className={`lg:w-[18px] lg:h-[18px] transition-transform duration-300 group-hover:translate-x-1 ${app.theme.arrowBase} ${app.theme.arrowHover}`} />
                </button>
              </div>

            </div>
          </div>
        ))}

      </main>

      {/* --- DISCREET FOOTER --- */}
      <footer className="fixed bottom-0 left-0 w-full z-40 px-6 lg:px-10 py-6 flex justify-between items-center pointer-events-none opacity-50 mix-blend-multiply">
         <div className="flex items-center gap-2 bg-slate-100/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <ShieldCheck size={12} className="text-slate-600" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600">256-Bit Encrypted</span>
         </div>
         <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
           Welcome, {user?.name?.split(' ')[0] || 'User'}
         </p>
      </footer>
    </div>
  );
};

export default AppPicker;