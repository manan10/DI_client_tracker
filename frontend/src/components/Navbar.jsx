import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, LogOut, Shield, Sun, Moon, 
  SettingsIcon, Menu, X, Files, BarChart3, Lock, Grid, ListTodo, TestTubeIcon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from '../assets/logo_nobrand.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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
    setIsMenuOpen(false);
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Directory', path: '/directory', icon: Users },
    { name: 'Ops', path: '/tasks', icon: ListTodo },
    { name: 'Docs', path: '/documents', icon: Files, isLocked: true },
    ...(user?.isAdmin ? [{ name: 'Accounts', path: '/accounts', icon: BarChart3 }] : []),
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const mainMobileItems = navItems.slice(0, 5);
  const moreMobileItems = navItems.slice(5);

  return (
    <>
      {/* ========================================= */}
      {/* TOP NAVIGATION BAR (Desktop & Mobile Top)   */}
      {/* ========================================= */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
          <div className="relative flex justify-between items-center h-18">
            
            {/* --- LEFT: BRANDING & LOGO --- */}
            <div className="flex items-center shrink-0 min-w-0 z-20">
              <Link to="/dashboard" className="flex items-center gap-3 group outline-none">
                <img src={Logo} alt="Logo" className="h-8 sm:h-9 w-auto group-hover:scale-105 transition-transform duration-300" />
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[14px] sm:text-[16px] font-[1000] text-slate-900 dark:text-white uppercase tracking-tight leading-none truncate">
                    Dalal Investment
                  </span>
                  <div className="flex items-center mt-1">
                    <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 uppercase tracking-widest leading-none border border-emerald-100 dark:border-emerald-500/20">
                      Distributor Portal
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* --- CENTER: ABSOLUTE NAVIGATION (Desktop Only) --- */}
            {/* This stays perfectly centered regardless of screen width */}
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 p-1 bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/5 rounded-lg z-10">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-md text-[13px] font-semibold transition-all duration-200 outline-none select-none ${
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

            {/* --- RIGHT: CONTROL PANEL & USER IDENTITY --- */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 z-20">
              
              {/* Hardware Actions */}
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

              {/* Vertical Divider */}
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
                    {user?.name || 'Authorized User'}
                  </span>
                  <span className={`text-[10px] font-medium tracking-wide mt-1 leading-none ${user?.isAdmin ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                    {user?.isAdmin ? 'Administrator' : 'Staff Member'}
                  </span>
                </div>
                
                {/* Logout Button */}
                <button 
                  onClick={handleLogout} 
                  className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors outline-none shrink-0"
                  title="Sign Out"
                >
                  <LogOut size={16} strokeWidth={2.5} />
                </button>

              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ========================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR                */}
      {/* ========================================= */}
      {/* pb-[env(safe-area-inset-bottom)] ensures it doesn't clash with iOS swipe bar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 z-40 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-17 px-2 max-w-md mx-auto">
          {mainMobileItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className="relative flex flex-col items-center justify-center w-full h-full gap-1.5 outline-none group"
              >
                {/* Active Top Bar Indicator */}
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
          
          <button 
            onClick={() => setIsMenuOpen(true)} 
            className="relative flex flex-col items-center justify-center w-full h-full gap-1.5 outline-none text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <div className="mt-1">
              <Menu size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-semibold tracking-wide">More</span>
          </button>
        </div>
      </div>

      {/* ========================================= */}
      {/* MOBILE "MORE" BOTTOM SHEET                  */}
      {/* ========================================= */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-100 flex justify-center items-end">
          {/* Blur Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setIsMenuOpen(false)} 
          />
          
          {/* Sheet Container */}
          <div className="relative w-full max-w-md bg-white dark:bg-[#0B1120] rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-white/10 p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom-full duration-300 ease-out">
            
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mx-auto mb-8" />
            
            {/* User Meta (Mobile) */}
            <div className="flex items-center gap-4 mb-6 px-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-lg flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {user?.name || 'Authorized User'}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {user?.isAdmin ? 'Administrator Account' : 'Staff Member'}
                </span>
              </div>
            </div>

            <hr className="mb-6 border-slate-100 dark:border-white/5" />

            {/* Navigation List */}
            <div className="flex flex-col gap-2">
              {moreMobileItems.map(item => (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  onClick={() => setIsMenuOpen(false)} 
                  className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors group outline-none"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-colors shrink-0">
                    <item.icon size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    {item.name}
                  </span>
                </Link>
              ))}

              <hr className="my-2 border-slate-100 dark:border-white/5" />

              {/* Action Buttons */}
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors group outline-none w-full text-left"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 group-hover:text-rose-600 dark:group-hover:text-rose-400 group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 transition-colors shrink-0">
                  <LogOut size={20} strokeWidth={2.5} />
                </div>
                <span className="text-base font-semibold">
                  Sign Out Securely
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;