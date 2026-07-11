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
    // FIXED: h-dvh and overflow-hidden guarantees NO scrolling on any device
    <div className="h-dvh w-screen bg-slate-50 flex flex-col font-sans overflow-hidden relative selection:bg-slate-200">
      
      {/* --- AMBIENT BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center items-center">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 blur-[100px] lg:blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 blur-[100px] lg:blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
      </div>

      {/* --- SHARPER EXECUTIVE NAVIGATION --- */}
      <nav className="absolute top-0 left-0 w-full z-50 px-4 lg:px-10 py-4 lg:py-6 pointer-events-none">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          
          {/* Logo Capsule */}
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl p-1.5 pr-4 lg:p-2 lg:pr-6 rounded-xl border border-white/40 shadow-sm pointer-events-auto transition-all duration-500">
            <div className={`p-2 lg:p-2.5 rounded-lg transition-all duration-500 shadow-inner ${activeApp ? activeApp.theme.primary : 'bg-slate-900'}`}>
              <img src={Logo} alt="Logo" className="h-4 lg:h-5 w-auto brightness-0 invert drop-shadow-md" />
            </div>
            <div className="flex flex-col text-left">
              <span className={`text-[11px] lg:text-[13px] font-[1000] uppercase tracking-wider lg:tracking-[0.2em] transition-colors duration-500 ${activeApp ? activeApp.theme.text : 'text-slate-900'}`}>
                Dalal Central
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Sparkles size={8} className="text-slate-400" />
                <span className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">
                  App Hub
                </span>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button 
            onClick={logout}
            className="group flex items-center gap-2 px-4 lg:px-5 py-3 bg-white/80 backdrop-blur-xl border border-white/40 text-slate-700 rounded-xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest active:scale-95 shadow-sm hover:shadow-md pointer-events-auto transition-all duration-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100"
          >
            <LogOut size={14} className="transition-transform duration-300 group-hover:-translate-x-1" /> 
            <span className="tracking-widest hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* --- MASTER CONTENT AREA (Vertically Centered) --- */}
      <main className="flex-1 flex flex-col items-center justify-center w-full relative z-10 px-4">
        
        {/* ========================================== */}
        {/* 📱 MOBILE VIEW (Strictly No-Scroll List)   */}
        {/* ========================================== */}
        <div className="flex lg:hidden flex-col gap-4 w-full max-w-sm mx-auto">
          {authorizedApps.map((app, idx) => (
            <button
              key={`mobile-${app.id}`}
              onClick={() => navigate(app.path)}
              className={`group w-full relative flex items-center gap-4 p-4 rounded-3xl bg-white/90 backdrop-blur-2xl border border-slate-100 transition-all duration-300 active:scale-95 focus:outline-none shadow-xl ${app.theme.shadowColor} animate-in fade-in slide-in-from-bottom-8 fill-mode-both`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              {/* Internal Mobile Flare */}
              <div className={`absolute inset-0 bg-linear-to-r ${app.theme.gradient} opacity-20 rounded-3xl pointer-events-none`} />

              {/* Icon Block */}
              <div className={`relative z-10 shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm ${app.theme.lightBg} ${app.theme.border} ${app.theme.text}`}>
                <app.icon size={28} strokeWidth={2.5} />
              </div>

              {/* Text Block (No Description on Mobile to save vertical space) */}
              <div className="relative z-10 flex-1 flex flex-col items-start text-left">
                <span className={`text-[9px] font-black uppercase tracking-[0.25em] mb-0.5 ${app.theme.text}`}>
                  {app.subtitle}
                </span>
                <span className="text-xl font-[1000] text-slate-900 tracking-tighter uppercase italic leading-none">
                  {app.title}
                </span>
              </div>

              {/* Action Arrow */}
              <div className={`relative z-10 shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100 shadow-sm ${app.theme.text}`}>
                <ArrowRight size={18} strokeWidth={3} />
              </div>
            </button>
          ))}
        </div>

        {/* ========================================== */}
        {/* 💻 DESKTOP VIEW (Original Large Cards)     */}
        {/* ========================================== */}
        <div className="hidden lg:flex flex-row items-center justify-center gap-8 w-full max-w-6xl mx-auto px-10">
          {authorizedApps.map((app, idx) => (
            <div
              key={`desktop-${app.id}`}
              onMouseEnter={() => setActiveId(app.id)}
              onMouseLeave={() => setActiveId(null)}
              onClick={() => navigate(app.path)}
              className="group w-full max-w-md cursor-pointer animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              {/* Desktop Card Envelope */}
              <div className={`relative flex flex-col bg-white/90 backdrop-blur-2xl rounded-3xl p-10 border border-slate-100 transition-all duration-500 ease-out h-105 overflow-hidden
                shadow-md hover:-translate-y-1.5 hover:shadow-2xl ring-1 ring-transparent ${app.theme.shadowColor} ${app.theme.hoverRing}
              `}>
                
                {/* Desktop Internal Gradient Flare */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-linear-to-bl ${app.theme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-bl-full pointer-events-none`} />

                {/* Desktop Background Index Number */}
                <div className="absolute top-6 right-8 text-[100px] font-[1000] italic leading-none pointer-events-none select-none text-slate-100/80 transition-transform duration-700 group-hover:scale-110 group-hover:-translate-y-2 group-hover:text-slate-200/50">
                  0{idx + 1}
                </div>

                {/* Desktop Icon Container */}
                <div className={`relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center mb-10 transition-all duration-500 shadow-sm border
                  ${app.theme.lightBg} ${app.theme.border} ${app.theme.text}
                  group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-md
                `}>
                  <app.icon size={32} strokeWidth={2.5} className="transition-transform duration-500" />
                </div>

                {/* Desktop Typography */}
                <div className="relative z-10 flex-1 flex flex-col justify-start">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <span className={`w-2 h-2 rounded-full ${app.theme.primary} animate-pulse`} />
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-slate-500 transition-colors">
                      {app.subtitle}
                    </p>
                  </div>
                  
                  <h2 className="text-4xl font-[1000] uppercase tracking-tighter italic text-slate-900 leading-none mb-4 group-hover:text-slate-950 transition-colors">
                    {app.title}
                  </h2>

                  <p className="text-[14px] font-medium text-slate-500 leading-relaxed max-w-[18rem] transition-colors group-hover:text-slate-600">
                    {app.description}
                  </p>
                </div>

                {/* Desktop Action Button */}
                <div className="relative z-10 mt-auto pt-4">
                  <button className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-xs font-[1000] uppercase tracking-[0.25em] transition-all duration-300 border focus:outline-none
                    bg-slate-50 text-slate-700 border-slate-200
                    ${app.theme.btnHover}
                  `}>
                    Launch Application 
                    <ArrowRight size={18} strokeWidth={3} className={`transition-transform duration-300 group-hover:translate-x-1 ${app.theme.arrowBase} ${app.theme.arrowHover}`} />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- DISCREET FOOTER --- */}
      <footer className="absolute bottom-0 left-0 w-full z-40 px-4 lg:px-10 py-4 lg:py-6 flex justify-between items-center pointer-events-none opacity-50 mix-blend-multiply">
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