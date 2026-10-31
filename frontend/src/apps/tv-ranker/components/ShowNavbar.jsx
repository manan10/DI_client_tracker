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
  Grid,
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
      {/* TOP NAVIGATION BAR (Letterboxd Smoked Onyx)                                */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full transition-colors duration-300 bg-[#14181C] border-b border-[#2C3440] shadow-[0_4px_25px_rgba(0,0,0,0.5)] select-none font-sans">
        
        {/* Fine Cyan Horizon Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#40bcf4]/50 to-transparent pointer-events-none" />

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
                  className="group flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1F242B] border border-[#2C3440] hover:border-[#40bcf4]/50 hover:bg-[#252C35] text-stone-300 hover:text-[#40bcf4] shadow-inner transition-all duration-200 outline-none shrink-0"
                  title="Plot Twist Home"
                >
                  <Clapperboard size={18} strokeWidth={2.3} className="text-[#40bcf4] group-hover:scale-105 transition-transform" />
                </Link>

                {/* Responsive Container: Stacks vertically on mobile, horizontal row on sm+ */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 items-start justify-center">
                  
                  {/* Brand Lockup */}
                  <Link
                    to="/tv-rater"
                    className="group/brand flex items-center gap-2 outline-none py-0.5"
                    title="Plot Twist — Screen Vault"
                  >
                    <div className="flex items-baseline leading-none">
                      <span className="text-[17px] sm:text-[20px] font-[1000] tracking-[-0.03em] text-white">
                        plot
                      </span>
                      <span className="text-[17px] sm:text-[20px] font-[1000] tracking-[-0.03em] text-[#40bcf4]">
                        twist
                      </span>
                    </div>

                    {/* Letterboxd Cinephile Tri-Dot Trio */}
                    <div className="flex items-center gap-1 shrink-0 pb-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff8000] shadow-[0_0_6px_rgba(255,128,0,0.6)]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e054] shadow-[0_0_6px_rgba(0,224,84,0.6)]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#40bcf4] shadow-[0_0_6px_rgba(64,188,244,0.6)]" />
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
                      className="group/switcher inline-flex items-center gap-1 text-[10px] sm:text-xs font-sans font-medium text-stone-400 hover:text-white leading-tight px-1.5 sm:px-2 py-0.5 -mx-1.5 sm:-mx-2 rounded-md hover:bg-white/5 transition-all cursor-pointer outline-none"
                      title="Switch Workspace Application"
                      aria-haspopup="true"
                      aria-expanded={isAppDropdownOpen}
                    >
                      <span className="font-semibold text-stone-300 group-hover/switcher:text-white">
                        Show Rater
                      </span>
                      <ChevronDown
                        size={11}
                        className={`text-stone-500 group-hover/switcher:text-white transition-transform duration-200 ${
                          isAppDropdownOpen ? 'rotate-180 text-white' : ''
                        }`}
                      />
                    </button>

                    {/* APP DROPDOWN MENU */}
                    {isAppDropdownOpen && (
                      <div className="absolute left-0 mt-1.5 w-56 rounded-xl bg-[#14181C]/98 backdrop-blur-xl border border-[#2C3440] shadow-[0_12px_36px_rgba(0,0,0,0.8)] p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-2.5 py-1.5 text-[9px] font-mono tracking-wider uppercase text-stone-400 select-none">
                          Switch Workspace
                        </div>

                        <div className="flex flex-col gap-0.5">
                          {authorizedApps.length === 0 ? (
                            <div className="px-3 py-2 text-center text-xs text-stone-400">
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
                                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer outline-none text-left ${
                                    isCurrent
                                      ? 'bg-[#2C3440] text-white font-semibold'
                                      : 'text-stone-300 hover:text-white hover:bg-white/5 font-normal'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <AppIcon
                                      size={14}
                                      className={isCurrent ? 'text-[#40bcf4]' : 'text-stone-400'}
                                      strokeWidth={isCurrent ? 2.5 : 2}
                                    />
                                    <span className="truncate">{app.title}</span>
                                  </div>

                                  {isCurrent && (
                                    <Check
                                      size={13}
                                      strokeWidth={2.5}
                                      className="text-[#40bcf4] shrink-0 ml-1.5"
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
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center rounded-xl p-1 shadow-inner z-10 bg-black/45 border border-[#2C3440] backdrop-blur-md">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs tracking-wide transition-all outline-none select-none ${
                      isActive
                        ? 'bg-[#2C3440] text-white border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] font-bold'
                        : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent font-medium'
                    }`}
                  >
                    <Icon
                      size={15}
                      className={isActive ? 'text-[#40bcf4]' : 'text-stone-400'}
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
              
              {/* Rate New Show Button (Letterboxd Green - Hidden on mobile view) */}
              {onOpenAddShow && (
                <button
                  type="button"
                  onClick={onOpenAddShow}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-md bg-[#00e054] hover:bg-[#00c94b] text-[#14181C] font-bold border border-[#00e054] text-[11px] font-sans tracking-wide active:scale-95 transition-all cursor-pointer outline-none shadow-xs shrink-0"
                >
                  <Plus size={14} strokeWidth={3} className="shrink-0 text-[#14181C]" />
                  <span>Add Rating</span>
                </button>
              )}

              {/* Utility Dock (App Picker & Theme Toggle) */}
              <div className="flex items-center p-0.5 rounded-lg bg-black/40 border border-[#2C3440] shrink-0">
                <Link
                  to="/app-picker"
                  className="flex items-center justify-center w-8 h-8 rounded-md text-stone-400 hover:text-white hover:bg-white/10 transition-all outline-none"
                  aria-label="App Switcher"
                  title="App Switcher"
                >
                  <Grid size={16} strokeWidth={2.2} />
                </Link>

                <div className="w-px h-4 bg-[#2C3440] mx-0.5" />

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-stone-400 hover:text-white hover:bg-white/10 transition-all outline-none cursor-pointer"
                  aria-label="Toggle Theme"
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDark ? (
                    <Sun size={16} strokeWidth={2.2} className="text-amber-400" />
                  ) : (
                    <Moon size={16} strokeWidth={2.2} className="text-sky-300" />
                  )}
                </button>
              </div>

              {/* Hardware Vertical Divider */}
              <div className="hidden sm:block w-px h-6 bg-[#2C3440] mx-0.5 shrink-0" />

              {/* User Profile Glyph & Logout */}
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className="w-8 h-8 rounded-full bg-[#1F242B] text-stone-200 border border-[#2C3440] flex items-center justify-center font-bold text-xs select-none shadow-xs"
                  title={user?.name || 'User'}
                >
                  {userInitials}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer outline-none"
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
      <div className="md:hidden fixed bottom-0 left-0 w-full z-40 pb-[env(safe-area-inset-bottom)] font-sans border-t bg-[#14181C]/95 border-[#2C3440] backdrop-blur-2xl transition-all shadow-[0_-8px_30px_rgba(0,0,0,0.7)]">
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
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-b-full bg-[#40bcf4] shadow-[0_2px_8px_rgba(64,188,244,0.8)]" />
                )}
                <div
                  className={`mt-0.5 transition-colors ${
                    isActive ? 'text-[#40bcf4]' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={`text-[10px] font-medium tracking-wide ${
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
              <div className="mt-0.5 p-1 rounded-md bg-[#00e054] text-[#14181C] shadow-xs">
                <Plus size={15} strokeWidth={3} />
              </div>
              <span className="text-[10px] font-medium tracking-wide text-stone-300">
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