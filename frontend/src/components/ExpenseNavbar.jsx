import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, PieChart, History, Settings as SettingsIcon, 
  LogOut, Sun, Moon, Grid 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from '../assets/logo_nobrand.png';

const ExpenseNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isDark, setIsDark] = useState(() => {
    return localStorage.theme === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/expenses', icon: HomeIcon },
    { name: 'Analytics', path: '/expenses/analytics', icon: PieChart },
    { name: 'History', path: '/expenses/history', icon: History },
    { name: 'Settings', path: '/expenses/settings', icon: SettingsIcon }
  ];

  return (
    <>
      <nav className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-all duration-300">
        <div className="max-w-[98%] mx-auto px-4 md:px-6 h-20">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo & Branding */}
            <div className="flex items-center gap-3">
              <Link to="/expenses" className="flex items-center gap-3 shrink-0 active:scale-95 transition-transform">
                <img src={Logo} alt="Logo" className="h-9 md:h-11 w-auto" />
                <div className="flex flex-col text-left">
                  <span className="block text-sm md:text-base font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Dalal Family</span>
                  <span className="text-[9px] md:text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em] mt-1 italic">Finance Hub</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.name} to={item.path} className={`flex items-center gap-2.5 px-5 py-2 rounded-sm text-[11px] font-black uppercase tracking-wider transition-all ${isActive ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'}`}>
                    <Icon size={16} strokeWidth={isActive ? 3 : 2} /> {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-2 md:gap-4">
              <Link to="/app-picker" className="p-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <Grid size={20} />
              </Link>
              <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700">
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              
              <div className="hidden sm:flex flex-col items-end border-l border-slate-200 dark:border-slate-800 pl-4">
                <span className="text-[10px] font-black uppercase truncate max-w-20">{user?.name || 'User'}</span>
              </div>
              <button onClick={handleLogout} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-md text-slate-400 hover:text-red-600 border border-slate-200 dark:border-slate-700">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-18 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 z-40 flex items-center justify-around px-2 pb-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.name} to={item.path} className="flex flex-col items-center justify-center w-full h-full gap-1">
              <div className={`p-1.5 rounded-xl ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                <Icon size={20} />
              </div>
              <span className={`text-[9px] font-black uppercase ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default ExpenseNavbar;