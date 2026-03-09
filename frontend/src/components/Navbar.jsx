import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Shield, Sun, Moon, SettingsIcon, Menu, X } from 'lucide-react';
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

  // Sync theme remains in effect as it touches an external system (DOM)
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
    setIsMenuOpen(false); // Close menu first
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Directory', path: '/directory', icon: Users },
    { name: 'Settings', path: '/settings', icon: SettingsIcon }
  ];

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-[95%] mx-auto px-4 md:px-6 h-20">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 group shrink-0">
            <img src={Logo} alt="Logo" className="h-8 md:h-10 w-auto" />
            <div className="flex flex-col">
              <span className="block text-xs md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                Dalal Investment
              </span>
              <span className="text-[8px] md:text-[9px] font-bold text-amber-600 uppercase tracking-[0.2em] mt-0.5">
                Distributor Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                    isActive 
                      ? 'text-amber-600' 
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon size={16} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 md:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-600 transition-all border border-transparent dark:border-slate-700 shadow-sm"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="hidden lg:flex flex-col items-end border-l border-slate-100 dark:border-slate-800 pl-6">
              <span className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1">
                <Shield size={8} className="text-amber-500" /> Admin Session
              </span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="hidden md:block p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-600 rounded-xl transition-all border border-transparent dark:border-slate-700"
            >
              <LogOut size={18} />
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-6 gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)} // FIX: Close menu on click
                  className={`flex items-center gap-4 p-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    isActive 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 p-4 rounded-xl text-xs font-black uppercase tracking-widest bg-red-50 dark:bg-red-950/30 text-red-600"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;