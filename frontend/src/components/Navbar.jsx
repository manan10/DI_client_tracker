import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Shield, 
  Sun, 
  Moon, 
  SettingsIcon, 
  Menu, 
  X, 
  Files,
  BarChart3,
  Lock
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
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Directory', path: '/directory', icon: Users },
    { name: 'Documents', path: '/documents', icon: Files, isLocked: true },
    { name: 'Accounts', path: '/accounts', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: SettingsIcon }
  ];

  return (
    <nav className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-all duration-300 shadow-sm">
      <div className="max-w-[98%] mx-auto px-4 md:px-6 h-20">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 group shrink-0 transition-transform active:scale-95">
            <div className="relative">
              <img src={Logo} alt="Logo" className="h-9 md:h-11 w-auto drop-shadow-md" />
              <div className="absolute -inset-1 bg-emerald-500/10 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="block text-sm md:text-base font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                Dalal Investment
              </span>
              <span className="text-[9px] md:text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em] mt-1 italic">
                Distributor Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-5 py-2 rounded-sm text-[11px] font-black uppercase tracking-wider transition-all duration-300 relative group/item ${
                    isActive 
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={16} strokeWidth={isActive ? 3 : 2} />
                  {item.name}
                  {item.isLocked && (
                    <Lock size={10} className="ml-1 text-slate-400 group-hover/item:text-emerald-500 transition-colors" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-500/50 transition-all border border-slate-200 dark:border-slate-700 shadow-sm active:scale-90"
            >
              {isDark ? <Sun size={19} strokeWidth={2.5} /> : <Moon size={19} strokeWidth={2.5} />}
            </button>

            <div className="hidden lg:flex flex-col items-end border-l border-slate-200 dark:border-slate-800 pl-6 space-y-0.5">
              <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {user?.name || 'Administrator'}
              </span>
              <div className="bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-sm border border-emerald-200 dark:border-emerald-900/50">
                <span className="text-[8px] font-black text-emerald-700 dark:text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Shield size={10} fill="currentColor" fillOpacity={0.2} /> Admin Session
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="hidden md:flex p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-all border border-slate-200 dark:border-slate-700 shadow-sm group"
            >
              <LogOut size={19} className="group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg active:scale-95 transition-transform"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-slate-50 dark:bg-slate-900 border-b-2 border-emerald-500/50 animate-in slide-in-from-top-4 duration-300 z-50 shadow-2xl">
          <div className="flex flex-col p-6 gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between p-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 translate-x-2' 
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                    {item.name}
                  </div>
                  {item.isLocked && <Lock size={14} className="opacity-50" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;