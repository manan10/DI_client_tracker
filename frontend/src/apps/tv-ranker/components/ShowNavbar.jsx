import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home,
  List,
  BarChart3,
  Plus, 
  Sun, 
  Moon, 
  LogOut, 
  ChevronDown,
  Users,
  ReceiptIndianRupee,
  Clapperboard,
  Check,
  Tv,
  UtensilsCrossed
} from 'lucide-react';
import { useAuth } from '../../../shared/hooks/useAuth';

// Application registry matching Dalal Central / AppPicker
const allApps = [
  {
    id: 'CLIENT_TRACKER',
    title: 'Distributor Portal',
    path: '/dashboard',
    icon: Users,
  },
  {
    id: 'EXPENSE_TRACKER',
    title: 'Expense Hub',
    path: '/expenses',
    icon: ReceiptIndianRupee,
  },
  {
    id: 'SHOW_RATER',
    title: 'Show Rater',
    path: '/tv-rater',
    icon: Clapperboard,
  },
    {
    id: 'SOUS_CHEF',
    title: 'Sous Chef',
    path: '/sous-chef/recipes',
    icon: UtensilsCrossed,
  },
];

const ShowNavbar = ({ onOpenAddShow }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isAppDropdownOpen, setIsAppDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Load Bungee, Space Grotesk & Space Mono fonts
  useEffect(() => {
    const fontLinkId = 'plottwist-locked-fonts';
    const fontHref =
      'https://fonts.googleapis.com/css2?family=Bungee&family=Space+Grotesk:wght@600;700&family=Space+Mono:wght@400;700&display=swap';
    const existing = document.getElementById(fontLinkId);
    if (!existing) {
      const link = document.createElement('link');
      link.id = fontLinkId;
      link.rel = 'stylesheet';
      link.href = fontHref;
      document.head.appendChild(link);
    } else if (existing.href !== fontHref) {
      existing.href = fontHref;
    }
  }, []);

  // Filter apps strictly based on user.allowedApps permissions
  const authorizedApps = useMemo(() => {
    const userPermissions = user?.allowedApps || [];
    return allApps.filter((app) => userPermissions.includes(app.id));
  }, [user]);

  // Close app dropdown on outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAppDropdownOpen(false);
      }
    };

    if (isAppDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isAppDropdownOpen]);

  // Dark / Light Mode Sync
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.theme === 'dark' ||
      localStorage.getItem('app-theme') === 'dark' ||
      (!('theme' in localStorage) &&
        !('app-theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('app-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      localStorage.setItem('app-theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const handleLogout = () => {
    setIsAppDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const handleAppSelect = (path) => {
    setIsAppDropdownOpen(false);
    navigate(path);
  };

  // Navigation Links including Catalog & Stats
  const navItems = [
    { name: 'Home', path: '/tv-rater', icon: Home },
    { name: 'Lists', path: '/tv-rater/lists', icon: List },
    { name: 'Catalog', path: '/tv-rater/catalog', icon: List },
    { name: 'Stats', path: '/tv-rater/stats', icon: BarChart3 },
  ];

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'PT';

  return (
    <>
      {/* ========================================================================= */}
      {/* TOP NAVIGATION BAR                                                        */}
      {/* ========================================================================= */}
      <header
        style={{
          '--font-sans': "'Space Grotesk', sans-serif",
          '--font-mono': "'Space Mono', monospace",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
        className="sticky top-0 z-40 w-full transition-colors duration-300 bg-[#12171F] border-b border-[#2C3545] shadow-[0_4px_25px_rgba(0,0,0,0.5)] select-none font-sans"
      >
        
        {/* Fine Pink Horizon Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-pink-500/60 to-transparent pointer-events-none" />

        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 relative z-10">
          <div className="relative flex justify-between items-center h-[72px]">
            
            {/* ========================================================================= */}
            {/* LEFT: TV GLYPH & HYBRID PLOT TWIST LOGO LOCKUP                            */}
            {/* ========================================================================= */}
            <div className="flex items-center shrink-0 min-w-0 z-20">
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                {/* TV Glyph Container */}
                <Link
                  to="/tv-rater"
                  className="group flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xs bg-[#161B22] border border-[#2C3545] hover:border-pink-400/60 hover:bg-[#1B2230] text-stone-300 hover:text-pink-400 shadow-inner transition-all duration-200 outline-none shrink-0"
                  title="Plot Twist Home"
                >
                  <Clapperboard size={18} strokeWidth={2.3} className="text-pink-400 group-hover:scale-105 transition-transform" />
                </Link>

                {/* Responsive Container: Stacks vertically on mobile, horizontal row on sm+ */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 items-start justify-center">
                  
                  {/* Brand Lockup */}
                  <Link
                    to="/tv-rater"
                    className="group/brand flex items-center gap-2 outline-none py-0.5"
                    title="Plot Twist — Screen Vault"
                  >
                    <div
                      style={{ fontFamily: "'Bungee', sans-serif" }}
                      className="flex items-baseline leading-none text-base sm:text-lg font-normal tracking-[0.02em]"
                    >
                      <span className="text-white">
                        plot
                      </span>
                      <span className="text-pink-400">
                        twist
                      </span>
                    </div>

                    {/* Tri-Dot Trio */}
                    <div className="flex items-center gap-1 shrink-0 pb-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_6px_rgba(236,72,153,0.6)]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_6px_rgba(232,121,249,0.6)]" />
                    </div>
                  </Link>

                  {/* Divider visible only on sm+ screens */}
                  <span className="hidden sm:inline text-stone-600 font-light select-none text-xs">
                    |
                  </span>

                  {/* QUICK APP SWITCHER DROPDOWN TRIGGER */}
                  <div className="relative mt-0.5 sm:mt-0" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsAppDropdownOpen((prev) => !prev)}
                      className="group/switcher inline-flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold text-stone-400 hover:text-white leading-tight px-1.5 sm:px-2 py-0.5 -mx-1.5 sm:-mx-2 rounded-xs hover:bg-white/5 transition-all cursor-pointer outline-none"
                      title="Switch Workspace Application"
                      aria-haspopup="true"
                      aria-expanded={isAppDropdownOpen}
                    >
                      <span className="text-stone-300 group-hover/switcher:text-white">
                        Show Rater
                      </span>
                      <ChevronDown
                        size={11}
                        className={`text-stone-500 group-hover/switcher:text-white transition-transform duration-200 ${
                          isAppDropdownOpen ? 'rotate-180 text-pink-400' : ''
                        }`}
                      />
                    </button>

                    {/* APP DROPDOWN MENU */}
                    {isAppDropdownOpen && (
                      <div className="absolute left-0 mt-1.5 w-56 rounded-xs bg-[#161B22]/98 backdrop-blur-xl border-2 border-[#2C3545] shadow-[0_12px_36px_rgba(0,0,0,0.8)] p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-2.5 py-1.5 text-[9px] font-mono tracking-wider uppercase text-stone-400 select-none">
                          Switch Workspace
                        </div>

                        <div className="flex flex-col gap-0.5">
                          {authorizedApps.length === 0 ? (
                            <div className="px-3 py-2 text-center text-xs font-mono text-stone-400">
                              No accessible apps
                            </div>
                          ) : (
                            authorizedApps.map((app) => {
                              const AppIcon = app.icon;
                              const isCurrent =
                                (app.id === 'SHOW_RATER' &&
                                  (location.pathname.startsWith('/tv-rater') || location.pathname.startsWith('/shows'))) ||
                                (app.id === 'EXPENSE_TRACKER' &&
                                  location.pathname.startsWith('/expenses')) ||
                                (app.id === 'CLIENT_TRACKER' &&
                                  location.pathname.startsWith('/dashboard'));

                              return (
                                <button
                                  key={app.id}
                                  type="button"
                                  onClick={() => handleAppSelect(app.path)}
                                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-2xs text-xs font-mono transition-colors cursor-pointer outline-none text-left ${
                                    isCurrent
                                      ? 'bg-pink-500/15 text-pink-400 font-bold'
                                      : 'text-stone-300 hover:text-white hover:bg-white/5 font-normal'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <AppIcon
                                      size={14}
                                      className={isCurrent ? 'text-pink-400' : 'text-stone-400'}
                                      strokeWidth={isCurrent ? 2.5 : 2}
                                    />
                                    <span className="truncate">{app.title}</span>
                                  </div>

                                  {isCurrent && (
                                    <Check
                                      size={13}
                                      strokeWidth={2.5}
                                      className="text-pink-400 shrink-0 ml-1.5"
                                    />
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* CENTER: DESKTOP TACTILE DECK RAIL (Home, Lists, Stats, Catalog)           */}
            {/* ========================================================================= */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center rounded-xs p-1 shadow-inner z-10 bg-[#161B22]/90 border border-[#2C3545] backdrop-blur-md">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xs text-xs font-mono tracking-wide transition-all outline-none select-none ${
                      isActive
                        ? 'bg-[#1B2230] text-white border border-pink-400/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] font-bold'
                        : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent font-normal'
                    }`}
                  >
                    <Icon
                      size={15}
                      className={isActive ? 'text-pink-400' : 'text-stone-400'}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* ========================================================================= */}
            {/* RIGHT: ACTIONS                                                            */}
            {/* ========================================================================= */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 z-20 font-sans">
              
              {/* Rate New Show Button (Hidden on mobile view) */}
              {onOpenAddShow && (
                <button
                  type="button"
                  onClick={onOpenAddShow}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xs bg-pink-500 hover:bg-pink-600 text-white font-mono font-bold border border-pink-400/60 text-[11px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer outline-none shadow-xs shrink-0"
                >
                  <Plus size={14} strokeWidth={3} className="shrink-0 text-white" />
                  <span>Add Rating</span>
                </button>
              )}

              {/* Utility Dock (App Picker & Theme Toggle) */}
              <div className="flex items-center p-0.5 rounded-xs bg-[#161B22] border border-[#2C3545] shrink-0">
                <Link
                  to="/app-picker"
                  className="flex items-center justify-center w-8 h-8 rounded-2xs text-stone-400 hover:text-white hover:bg-white/10 transition-all outline-none"
                  aria-label="App Switcher"
                  title="App Switcher"
                >
                  <Home size={16} strokeWidth={2.2} />
                </Link>

                <div className="w-px h-4 bg-[#2C3545] mx-0.5" />

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center justify-center w-8 h-8 rounded-2xs text-stone-400 hover:text-white hover:bg-white/10 transition-all outline-none cursor-pointer"
                  aria-label="Toggle Theme"
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDark ? (
                    <Sun size={16} strokeWidth={2.2} className="text-amber-400" />
                  ) : (
                    <Moon size={16} strokeWidth={2.2} className="text-pink-400" />
                  )}
                </button>
              </div>

              {/* Hardware Vertical Divider */}
              <div className="hidden sm:block w-px h-6 bg-[#2C3545] mx-0.5 shrink-0" />

              {/* User Profile Glyph & Logout */}
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className="w-8 h-8 rounded-full bg-[#161B22] text-stone-200 border border-[#2C3545] flex items-center justify-center font-mono font-bold text-xs select-none shadow-xs"
                  title={user?.name || 'User'}
                >
                  {userInitials}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-xs text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer outline-none"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Home, Lists, Stats, Catalog, Rate New)      */}
      {/* ========================================================================= */}
      <div
        style={{
          '--font-sans': "'Space Grotesk', sans-serif",
          '--font-mono': "'Space Mono', monospace",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
        className="md:hidden fixed bottom-0 left-0 w-full z-40 pb-[env(safe-area-inset-bottom)] font-sans border-t bg-[#12171F]/95 border-[#2C3545] backdrop-blur-2xl transition-all shadow-[0_-8px_30px_rgba(0,0,0,0.7)]"
      >
        <div className="flex items-center justify-around h-16 px-3 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className="relative flex flex-col items-center justify-center w-full h-full gap-1 outline-none select-none"
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-b-full bg-pink-400 shadow-[0_2px_8px_rgba(244,114,182,0.7)]" />
                )}
                <div
                  className={`mt-0.5 transition-colors ${
                    isActive ? 'text-pink-400' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={`text-[10px] font-mono tracking-wide ${
                    isActive ? 'text-white font-bold' : 'text-stone-400'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* Quick Mobile Action for "Add Rating" */}
          {onOpenAddShow && (
            <button
              type="button"
              onClick={onOpenAddShow}
              className="relative flex flex-col items-center justify-center w-full h-full gap-1 outline-none select-none text-stone-300 hover:text-white cursor-pointer"
            >
              <div className="mt-0.5 p-1 rounded-xs bg-pink-500 text-white shadow-xs">
                <Plus size={15} strokeWidth={3} />
              </div>
              <span className="text-[10px] font-mono tracking-wide text-stone-300">
                Add Rating
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ShowNavbar;