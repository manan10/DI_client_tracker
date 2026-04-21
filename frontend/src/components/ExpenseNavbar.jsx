import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Wallet, History, PieChart, Settings as SettingsIcon, 
  LogOut, Sun, Moon, Menu, X, Grid, Shield 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from '../assets/logo_nobrand.png';

const ExpenseNavbar = () => {
  const { user, logout } = useAuth(); // Now used in handleLogout
  const location = useLocation();
  const navigate = useNavigate(); // Now used in handleLogout
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [isDark, setIsDark] = useState(() => {
    return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
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

  // FIX: Added the missing handler logic to use logout and navigate
  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Wallets', path: '/expenses', icon: Wallet },
    { name: 'Analytics', path: '/expenses/analytics', icon: PieChart },
    { name: 'History', path: '/expenses/history', icon: History },
    { name: 'Settings', path: '/expenses/settings', icon: SettingsIcon }
  ];

  return (
    <nav className="bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 h-20">
      <div className="max-w-[98%] mx-auto px-4 md:px-6 h-full flex justify-between items-center">
        
        {/* Logo & Hub Switcher */}
        <div className="flex items-center gap-6">
          <Link to="/expenses" className="flex items-center gap-3">
            <img src={Logo} alt="Logo" className="h-10 w-auto" />
            <div className="flex flex-col text-left">
              <span className="text-sm md:text-base font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Dalal Family</span>
              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em] mt-1 leading-none">Finance Hub</span>
            </div>
          </Link>
          <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <Link to="/app-picker" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-emerald-500 transition-colors">
            <Grid size={16} /> <span className="hidden lg:block">Hub</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.name} to={item.path} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                isActive ? 'bg-white dark:bg-[#1E293B] text-emerald-600 dark:text-emerald-500 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600'
              }`}>
                <item.icon size={16} strokeWidth={isActive ? 3 : 2} /> {item.name}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <div className="hidden lg:flex flex-col items-end border-l border-slate-200 dark:border-slate-800 pl-4">
            <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{user?.name || 'User'}</span>
            <div className="bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20 mt-1">
              <span className="text-[8px] font-black text-emerald-700 dark:text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                <Shield size={8} fill="currentColor" /> Admin
              </span>
            </div>
          </div>

          <button onClick={handleLogout} className="hidden md:flex p-2.5 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl border border-red-100 dark:border-red-900/20 transition-all active:scale-90 ml-2">
            <LogOut size={19} />
          </button>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 ml-2">
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-black border-b border-emerald-500/50 p-6 flex flex-col gap-4 animate-in slide-in-from-top-5 duration-300 z-50">
          <Link to="/app-picker" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-5 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-widest">
            <Grid size={20} /> Exit Hub
          </Link>
          {navItems.map((item) => (
            <Link key={item.name} to={item.path} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest border border-slate-200 dark:border-white/5">
              <item.icon size={20} /> {item.name}
            </Link>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-4 p-5 rounded-3xl bg-red-50 dark:bg-red-950/20 text-red-500 text-xs font-black uppercase tracking-widest border border-red-100 dark:border-red-900/20">
             <LogOut size={20} /> Logout Session
          </button>
        </div>
      )}
    </nav>
  );
};

export default ExpenseNavbar;