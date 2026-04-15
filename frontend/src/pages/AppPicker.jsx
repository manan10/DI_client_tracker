import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  LayoutDashboard,
  ReceiptIndianRupee,
  LogOut,
  ArrowRight,
  Heart
} from 'lucide-react';
import { useAuth } from "../hooks/useAuth";
import Logo from '../assets/logo_nobrand.png';

const AppPicker = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const apps = [
    {
      id: 'client-tracker',
      title: 'Business Manager',
      subtitle: 'Manage clients and portfolios',
      path: '/dashboard',
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      iconBg: 'bg-emerald-50',
      borderColor: 'group-hover:border-emerald-500/50',
      tag: 'Work'
    },
    {
      id: 'expense-tracker',
      title: 'Family Expenses',
      subtitle: 'Track our daily home spending',
      path: '/expenses',
      icon: <ReceiptIndianRupee className="w-6 h-6 text-amber-600" />,
      iconBg: 'bg-amber-50',
      borderColor: 'group-hover:border-amber-500/50',
      tag: 'Home'
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-x-hidden flex flex-col items-center justify-center px-4 py-12">
      
      {/* --- SOFT BACKGROUND GLOW --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl shadow-slate-200/50 mb-6 border border-slate-100">
            <img src={Logo} alt="Logo" className="h-12 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-[1000] text-slate-900 tracking-tighter uppercase sm:text-4xl leading-none">
            Welcome <span className="text-emerald-600">Home</span>
          </h1>
          <p className="text-slate-500 mt-3 font-medium text-sm italic">
            Where would you like to go today?
          </p>
        </div>

        {/* App Selection Cards */}
        <div className="grid gap-5">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => navigate(app.path)}
              className={`group relative flex items-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60 active:scale-[0.98] ${app.borderColor}`}
            >
              {/* Icon Container */}
              <div className={`flex-shrink-0 w-14 h-14 ${app.iconBg} rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110`}>
                {app.icon}
              </div>

              {/* Text Content */}
              <div className="ml-5 text-left flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm bg-slate-50 text-slate-400 border border-slate-200/50">
                    {app.tag}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none mb-1">
                  {app.title}
                </h2>
                <p className="text-xs font-medium text-slate-400">
                  {app.subtitle}
                </p>
              </div>

              {/* Arrow Indicator */}
              <div className="ml-4 w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:border-slate-900 transition-all duration-300">
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold text-xs tracking-widest uppercase transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          
          <div className="flex items-center gap-2.5 px-4 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm opacity-50">
            <Heart size={10} className="text-emerald-500 fill-emerald-500/20" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
              Dalal Family Hub • 2026
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AppPicker;