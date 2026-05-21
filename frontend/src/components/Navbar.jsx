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
    { name: 'Test', path: '/tally-test', icon: TestTubeIcon, isLocked: false },
  ];

  const mainMobileItems = navItems.slice(0, 3);
  const moreMobileItems = navItems.slice(3);

  return (
    <>
      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-all duration-300">
        <div className="max-w-[98%] mx-auto px-3 md:px-6 h-20">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo & Branding (Visible on all screens) */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 group shrink-0">
                <img src={Logo} alt="Logo" className="h-9 md:h-11 w-auto" />
                <div className="flex flex-col text-left">
                  <span className="block text-[13px] sm:text-base font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                    Dalal Investment
                  </span>
                  <span className="text-[8px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em] mt-1 italic">
                    Distributor Portal
                  </span>
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
              {/* Hub Icon (Mobile + Desktop) */}
              <Link to="/app-picker" className="p-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600 transition-all">
                <Grid size={20} />
              </Link>

              <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-600 hover:text-emerald-600 border border-slate-200 dark:border-slate-700">
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* User Info & Logout (Responsive) */}
              <div className="flex items-center gap-2 md:gap-4 border-l border-slate-200 dark:border-slate-800 pl-2 md:pl-6">
                <div className="hidden sm:flex flex-col items-end space-y-0.5 text-right">
                  <span className="text-[10px] font-black uppercase">{user?.name || 'User'}</span>
                  <span className={`text-[8px] font-black uppercase ${user?.isAdmin ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {user?.isAdmin ? 'Admin' : 'Staff'}
                  </span>
                </div>
                <button onClick={handleLogout} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-md text-slate-400 hover:text-red-600 border border-slate-200 dark:border-slate-700">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-18 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 z-40 flex items-center justify-around px-2 pb-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {mainMobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.name} to={item.path} className="flex flex-col items-center justify-center w-full h-full gap-1">
              <div className={`p-1.5 rounded-xl ${isActive ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] font-black uppercase ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>{item.name}</span>
            </Link>
          );
        })}
        <button onClick={() => setIsMenuOpen(true)} className="flex flex-col items-center justify-center w-full h-full gap-1 text-slate-500">
          <Menu size={20} />
          <span className="text-[9px] font-black uppercase">More</span>
        </button>
      </div>

      {/* --- MORE BOTTOM SHEET --- */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-100">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute bottom-0 w-full bg-white dark:bg-slate-950 rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />
            <div className="flex flex-col gap-2">
              {moreMobileItems.map(item => (
                <Link key={item.name} to={item.path} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900">
                  <item.icon size={20} className="text-emerald-600" />
                  <span className="text-sm font-black uppercase">{item.name}</span>
                </Link>
              ))}
              <button onClick={handleLogout} className="flex items-center gap-4 p-4 text-red-500 font-black uppercase text-sm">
                <LogOut size={20} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;