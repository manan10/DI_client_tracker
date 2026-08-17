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
      {/* ========================================= */}
      {/* TOP NAVIGATION BAR (Desktop & Mobile Top)   */}
      {/* ========================================= */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
          <div className="relative flex justify-between items-center h-18">
            
            {/* --- LEFT: LOGO & BRANDING --- */}
            <div className="flex items-center shrink-0 min-w-0 z-20">
              <Link to="/expenses" className="flex items-center gap-3 group outline-none">
                <img src={Logo} alt="Logo" className="h-8 sm:h-9 w-auto group-hover:scale-105 transition-transform duration-300" />
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[14px] sm:text-[16px] font-[1000] text-slate-900 dark:text-white uppercase tracking-tight leading-none truncate">
                    Dalal Family
                  </span>
                  <div className="flex items-center mt-1">
                    <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 uppercase tracking-widest leading-none border border-emerald-100 dark:border-emerald-500/20">
                      Finance Hub
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* --- CENTER: ABSOLUTE NAVIGATION (Desktop Only) --- */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 p-1 bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/5 rounded-lg z-10">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-semibold transition-all duration-200 outline-none select-none ${
                      isActive 
                      ? 'bg-white dark:bg-[#151e2e] text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-slate-200 dark:ring-white/10' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} /> 
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* --- RIGHT: ACTIONS & USER IDENTITY --- */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 z-20">
              
              {/* App Picker & Theme Toggle */}
              <div className="flex items-center gap-1">
                <Link 
                  to="/app-picker" 
                  className="flex items-center justify-center w-9 h-9 rounded-md text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors outline-none"
                  aria-label="App Picker"
                >
                  <Grid size={18} strokeWidth={2.5} />
                </Link>
                
                <button 
                  onClick={() => setIsDark(!isDark)} 
                  className="flex items-center justify-center w-9 h-9 rounded-md text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors outline-none"
                  aria-label="Toggle Theme"
                >
                  {isDark ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
                </button>
              </div>

              {/* Hardware Divider */}
              <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-white/10 mx-1" />

              {/* User Profile Chip */}
              <div className="hidden sm:flex items-center gap-3 pl-1 p-1 pr-3 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors cursor-default">
                
                {/* Avatar */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-sm shrink-0 border border-emerald-200 dark:border-emerald-500/30 shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                
                {/* Identity */}
                <div className="flex flex-col text-left min-w-0 pr-2">
                  <span className="text-[13px] font-bold text-slate-900 dark:text-white leading-none truncate max-w-30">
                    {user?.name || 'User'}
                  </span>
                </div>
                
                {/* Logout Button */}
                <button 
                  onClick={handleLogout} 
                  className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors outline-none shrink-0 ml-1"
                  title="Sign Out"
                >
                  <LogOut size={16} strokeWidth={2.5} />
                </button>

              </div>

              {/* Mobile Logout Quick Icon */}
              <button 
                onClick={handleLogout} 
                className="sm:hidden flex items-center justify-center w-9 h-9 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors outline-none"
                aria-label="Sign Out"
              >
                <LogOut size={18} strokeWidth={2.5} />
              </button>

            </div>
          </div>
        </div>
      </nav>

      {/* ========================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR                */}
      {/* ========================================= */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 z-40 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-17 px-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className="relative flex flex-col items-center justify-center w-full h-full gap-1.5 outline-none group"
              >
                {/* Active Indicator Top Bar */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.75 bg-emerald-500 rounded-b-full shadow-[0_2px_8px_rgba(16,185,129,0.5)]" />
                )}
                
                <div className={`mt-1 transition-colors duration-200 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ExpenseNavbar;