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
  Lock,
  Grid, 
  ListTodo,
  TestTubeIcon
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

  // Lock body scroll when mobile bottom sheet is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/login');
  };

  // --- DYNAMIC NAVIGATION LOGIC ---
  const navItems = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Directory', path: '/directory', icon: Users },
    { name: 'Ops', path: '/tasks', icon: ListTodo },
    { name: 'Docs', path: '/documents', icon: Files, isLocked: true },
    ...(user?.isAdmin ? [{ name: 'Accounts', path: '/accounts', icon: BarChart3 }] : []),
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
    { name: 'Test', path: '/tally-test', icon: TestTubeIcon, isLocked: false },
  ];

  // Split items for Mobile Bottom Nav
  const mainMobileItems = navItems.slice(0, 3); // First 3 go on the bottom bar
  const moreMobileItems = navItems.slice(3);    // The rest go in the "More" bottom sheet

  return (
    <>
      {/* --- TOP NAVIGATION BAR (EXACT ORIGINAL DESKTOP STRUCTURE RESTORED) --- */}
      <nav className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-all duration-300 shadow-sm">
        <div className="max-w-[98%] mx-auto px-4 md:px-6 h-20">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo & Switcher Section */}
            <div className="flex items-center gap-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 group shrink-0 transition-transform active:scale-95">
                <div className="relative">
                  <img src={Logo} alt="Logo" className="h-9 md:h-11 w-auto drop-shadow-md" />
                  <div className="absolute -inset-1 bg-emerald-500/10 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {/* LINTER FIX: Removed conflicting 'flex' alongside 'hidden' */}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="block text-sm md:text-base font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                    Dalal Investment
                  </span>
                  <span className="text-[9px] md:text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em] mt-1 italic">
                    Distributor Portal
                  </span>
                </div>
              </Link>

              <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
              
              <Link 
                to="/app-picker" 
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600 transition-all group"
                title="Switch Workspace"
              >
                <Grid size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">Hub</span>
              </Link>
            </div>

            {/* Desktop Navigation - Exact Original */}
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

            {/* Actions Section */}
            <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 md:p-2.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-500/50 transition-all border border-slate-200 dark:border-slate-700 shadow-sm active:scale-90"
              >
                {/* LINTER FIX: md:w-4.75 and md:h-4.75 replace md:w-[19px] and md:h-[19px] */}
                {isDark ? <Sun size={16} className="md:w-4.75 md:h-4.75" strokeWidth={2.5} /> : <Moon size={16} className="md:w-4.75 md:h-4.75" strokeWidth={2.5} />}
              </button>

              {/* Profile Section with Dynamic Badge */}
              <div className="flex flex-col items-end border-l border-slate-200 dark:border-slate-800 pl-2 md:pl-6 space-y-0.5 text-right">
                {/* LINTER FIX: max-w-15 replaces max-w-[60px] */}
                <span className="text-[10px] md:text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight max-w-15 md:max-w-none truncate">
                  {user?.name || 'User'}
                </span>
                <div className={`px-1 md:px-2 py-0.5 rounded-sm border ${user?.isAdmin ? 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10'}`}>
                  <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest flex items-center gap-1 md:gap-1.5 ${user?.isAdmin ? 'text-emerald-700 dark:text-emerald-500' : 'text-slate-500'}`}>
                    {user?.isAdmin ? (
                      <><Shield size={8} className="md:w-2.5 md:h-2.5" fill="currentColor" fillOpacity={0.2} /> <span className="hidden sm:inline">Admin Session</span><span className="sm:hidden">Admin</span></>
                    ) : (
                      <><Users size={8} className="md:w-2.5 md:h-2.5" /> <span className="hidden sm:inline">Staff Session</span><span className="sm:hidden">Staff</span></>
                    )}
                  </span>
                </div>
              </div>
              
              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="flex p-2 md:p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-all border border-slate-200 dark:border-slate-700 shadow-sm group active:scale-95"
              >
                {/* LINTER FIX: md:w-4.75 and md:h-4.75 replace md:w-[19px] and md:h-[19px] */}
                <LogOut size={16} className="md:w-4.75 md:h-4.75 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE BOTTOM NAVIGATION TABS --- */}
      {/* LINTER FIX: h-18 replaces h-[4.5rem] */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-18 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 z-40 flex items-center justify-around px-2 pb-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        {mainMobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform outline-none"
            >
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-500'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
        
        {/* The "More" Trigger */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform outline-none"
        >
          <div className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
            <Menu size={20} strokeWidth={2.5} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500">
            More
          </span>
        </button>
      </div>

      {/* --- NATIVE "MORE" BOTTOM SHEET --- */}
      {isMenuOpen && (
        <>
          {/* Dark Backdrop Over Entire Screen */}
          {/* LINTER FIX: z-60 replaces z-[60] */}
          <div 
            className="md:hidden fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm z-60 animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Bottom Sheet Drawer */}
          {/* LINTER FIX: rounded-t-4xl replaces rounded-t-[2rem] AND z-70 replaces z-[70] */}
          <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-950 rounded-t-4xl border-t border-slate-200 dark:border-slate-800 z-70 shadow-[0_-20px_60px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom-full duration-300 ease-out pb-6">
            
            {/* Drag Handle Indicator */}
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-4 mb-3" />
            
            {/* Sheet Header */}
            <div className="flex items-center justify-between px-6 py-2 mb-2">
              <span className="text-[11px] font-[1000] uppercase text-slate-400 dark:text-slate-500 tracking-widest">More Options</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors active:scale-90">
                <X size={16} strokeWidth={3} />
              </button>
            </div>
            
            {/* Scrollable Actions Container */}
            <div className="px-5 overflow-y-auto max-h-[60vh] no-scrollbar flex flex-col gap-3">
              
              {/* Workspace Switcher inside More Menu */}
              <Link
                to="/app-picker"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 active:scale-[0.98] transition-transform shadow-lg"
              >
                <div className="p-1.5 bg-white/20 dark:bg-slate-900/10 rounded-[10px]">
                  <Grid size={20} strokeWidth={2.5} />
                </div>
                <span className="text-[13px] font-black uppercase tracking-widest">Switch Workspace</span>
              </Link>

              {/* Grouped Additional Nav Links */}
              <div className="flex flex-col bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800/80 overflow-hidden mt-1">
                {moreMobileItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const isLast = index === moreMobileItems.length - 1;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center justify-between p-4.5 transition-colors active:bg-slate-200 dark:active:bg-slate-800 ${
                        !isLast ? 'border-b border-slate-200 dark:border-slate-800' : ''
                      } ${isActive ? 'bg-white dark:bg-slate-800' : 'bg-transparent'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${isActive ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 shadow-sm'}`}>
                          <Icon size={18} strokeWidth={2.5} />
                        </div>
                        <span className={`text-[13px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {item.name}
                        </span>
                      </div>
                      {item.isLocked && <Lock size={14} className="text-slate-400 dark:text-slate-500" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;