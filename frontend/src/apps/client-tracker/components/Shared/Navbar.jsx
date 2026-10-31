import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Sun,
  Moon,
  SettingsIcon,
  Menu,
  BarChart3,
  Grid,
  ListTodo,
  ChevronDown,
  ReceiptIndianRupee,
  Clapperboard,
  Check,
  Home,
  UtensilsCrossed,
} from "lucide-react";
import { useAuth } from "../../../../shared/hooks/useAuth";
import Logo from "../../../../assets/logo_nobrand.png";

// Application registry matching Dalal Central / AppPicker
const allApps = [
  {
    id: "CLIENT_TRACKER",
    title: "Distributor Portal",
    path: "/dashboard",
    icon: Users,
  },
  {
    id: "EXPENSE_TRACKER",
    title: "Expense Logger",
    path: "/expenses",
    icon: ReceiptIndianRupee,
  },
  {
    id: "SHOW_RATER",
    title: "Show Rater",
    path: "/tv-rater",
    icon: Clapperboard,
  },
    {
    id: 'SOUS_CHEF',
    title: 'Sous Chef',
    path: '/sous-chef/recipes',
    icon: UtensilsCrossed,
  },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAppDropdownOpen, setIsAppDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Strict check: only apps included in user.allowedApps
  const authorizedApps = useMemo(() => {
    const userPermissions = user?.allowedApps || [];
    return allApps.filter((app) => userPermissions.includes(app.id));
  }, [user]);

  // Close app dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAppDropdownOpen(false);
      }
    };

    if (isAppDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isAppDropdownOpen]);

  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const handleLogout = () => {
    setIsMenuOpen(false);
    setIsAppDropdownOpen(false);
    logout();
    navigate("/login");
  };

  const handleAppSelect = (path) => {
    setIsAppDropdownOpen(false);
    navigate(path);
  };

  const navItems = [
    { name: "Home", path: "/dashboard", icon: LayoutDashboard },
    { name: "Directory", path: "/directory", icon: Users },
    { name: "Ops", path: "/tasks", icon: ListTodo },
    ...(user?.isAdmin
      ? [{ name: "Accounts", path: "/accounts", icon: BarChart3 }]
      : []),
    { name: "Settings", path: "/client/settings", icon: SettingsIcon },
  ];

  const mainMobileItems = navItems.slice(0, 5);
  const moreMobileItems = navItems.slice(5);

  const userInitials = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <>
      {/* ========================================= */}
      {/* TOP NAVIGATION BAR (Desktop & Mobile Top)  */}
      {/* ========================================= */}
      <nav className="sticky top-0 z-40 bg-[#232730]/95 dark:bg-[#16181D]/95 backdrop-blur-2xl border-b border-stone-400/20 dark:border-white/10 text-white shadow-md dark:shadow-[0_10px_35px_rgba(0,0,0,0.5)] transition-all duration-300 font-sans">
        {/* Subtle horizon line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-transparent via-stone-400/40 to-transparent pointer-events-none" />

        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
          <div className="relative flex justify-between items-center h-[72px]">
            {/* --- LEFT: LOGO, BRAND TITLE & MINIMAL APP SWITCHER --- */}
            <div className="flex items-center shrink-0 min-w-0 z-20">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Link to="/dashboard" className="group outline-none shrink-0">
                  <img
                    src={Logo}
                    alt="Dalal Investments"
                    className="h-8 sm:h-8.5 w-auto transition-transform duration-300 group-hover:scale-105 shrink-0"
                  />
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2.5">
                  <Link
                    to="/dashboard"
                    className="text-[13px] sm:text-base font-serif font-bold text-white tracking-tight leading-tight sm:leading-none hover:text-stone-200 transition-colors"
                  >
                    Dalal Investments
                  </Link>

                  <span className="hidden sm:inline text-stone-500 font-light select-none text-xs">
                    |
                  </span>

                  {/* QUICK APP SWITCHER DROPDOWN TRIGGER */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsAppDropdownOpen((prev) => !prev)}
                      className="group/switcher inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-sans font-medium text-stone-400 hover:text-white leading-tight sm:leading-none tracking-wide sm:tracking-normal px-2 py-1 -mx-2 rounded-md hover:bg-white/5 transition-all cursor-pointer outline-none"
                      title="Switch Application"
                      aria-haspopup="true"
                      aria-expanded={isAppDropdownOpen}
                    >
                      <span>Distributor Portal</span>
                      <ChevronDown
                        size={11}
                        className={`text-stone-400 group-hover/switcher:text-white transition-transform duration-200 ${
                          isAppDropdownOpen ? "rotate-180 text-white" : ""
                        }`}
                      />
                    </button>

                    {/* MINIMAL APP DROPDOWN MENU */}
                    {isAppDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-52 rounded-xl bg-[#1c2027]/98 backdrop-blur-xl border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.6)] p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                                (app.id === "CLIENT_TRACKER" &&
                                  location.pathname.startsWith("/dashboard")) ||
                                (app.id === "EXPENSE_TRACKER" &&
                                  location.pathname.startsWith("/expenses")) ||
                                (app.id === "SHOW_RATER" &&
                                  location.pathname.startsWith("/shows"));

                              return (
                                <button
                                  key={app.id}
                                  type="button"
                                  onClick={() => handleAppSelect(app.path)}
                                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer outline-none text-left ${
                                    isCurrent
                                      ? "bg-white/10 text-white font-semibold"
                                      : "text-slate-300 hover:text-white hover:bg-white/5 font-normal"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <AppIcon
                                      size={14}
                                      className={
                                        isCurrent ? "text-white" : "text-stone-400"
                                      }
                                      strokeWidth={isCurrent ? 2.5 : 2}
                                    />
                                    <span className="truncate">{app.title}</span>
                                  </div>

                                  {isCurrent && (
                                    <Check
                                      size={13}
                                      strokeWidth={2.5}
                                      className="text-stone-300 shrink-0 ml-1.5"
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

            {/* --- CENTER: FIXED TACTILE DECK RAIL --- */}
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center rounded-xl p-1 shadow-inner z-10 bg-black/45 border border-white/10 backdrop-blur-md">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs tracking-wide transition-all outline-none select-none ${
                      isActive
                        ? "bg-white/[0.12] text-white border border-white/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)] font-bold"
                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent font-medium"
                    }`}
                  >
                    <Icon
                      size={15}
                      className={isActive ? "text-white" : "text-slate-400"}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* --- RIGHT: ACTIONS & DISCRETE GLYPH USER PROFILE --- */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 z-20 font-sans">
              {/* Utility Dock (App Switcher & Theme Toggle) */}
              <div className="flex items-center p-0.5 rounded-lg bg-black/25 border border-white/10">
                <Link
                  to="/app-picker"
                  className="flex items-center justify-center w-8 h-8 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-all outline-none"
                  aria-label="App Switcher"
                  title="App Switcher"
                >
                  <Home size={16} strokeWidth={2.2} />
                </Link>

                <div className="w-px h-4 bg-white/10 mx-0.5" />

                <button
                  type="button"
                  onClick={() => setIsDark(!isDark)}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-all outline-none cursor-pointer"
                  aria-label="Toggle Theme"
                  title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDark ? (
                    <Sun size={16} strokeWidth={2.2} />
                  ) : (
                    <Moon size={16} strokeWidth={2.2} />
                  )}
                </button>
              </div>

              {/* Hardware Vertical Divider */}
              <div className="hidden sm:block w-px h-6 bg-white/15 mx-0.5" />

              {/* User Profile Glyph & Logout */}
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full bg-white/15 text-white border border-white/30 flex items-center justify-center font-bold text-xs select-none shadow-xs"
                  title={
                    user?.name
                      ? `${user.name} (${user?.isAdmin ? "Admin" : "Staff"})`
                      : "User"
                  }
                >
                  {userInitials}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer outline-none"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ========================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR              */}
      {/* ========================================= */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full z-40 pb-[env(safe-area-inset-bottom)] font-sans border-t border-stone-400/20 dark:border-white/10 bg-[#232730]/95 dark:bg-[#16181D]/95 backdrop-blur-2xl transition-all">
        <div className="flex items-center justify-around h-16 px-3 max-w-md mx-auto">
          {mainMobileItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className="relative flex flex-col items-center justify-center w-full h-full gap-1 outline-none select-none"
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-b-full bg-white shadow-[0_2px_8px_rgba(255,255,255,0.8)]" />
                )}
                <div
                  className={`mt-0.5 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={`text-[10px] font-medium tracking-wide ${
                    isActive ? "text-white font-bold" : "text-slate-400"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}

          {moreMobileItems.length > 0 && (
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="relative flex flex-col items-center justify-center w-full h-full gap-1 outline-none text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <div className="mt-0.5">
                <Menu size={19} strokeWidth={2.2} />
              </div>
              <span className="text-[10px] font-medium tracking-wide">
                More
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* MOBILE "MORE" BOTTOM SHEET                */}
      {/* ========================================= */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-100 flex justify-center items-end">
          {/* Blur Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Sheet Container */}
          <div className="relative w-full max-w-md bg-[#16181D] text-white rounded-t-3xl shadow-2xl border-t border-white/10 p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom-full duration-300 ease-out font-sans">
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />

            {/* User Meta (Mobile) */}
            <div className="flex items-center gap-3.5 mb-6 px-1">
              <div className="w-10 h-10 rounded-full bg-white/10 text-white font-mono font-bold text-sm flex items-center justify-center border border-white/20">
                {userInitials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white leading-tight">
                  {user?.name || "Authorized User"}
                </span>
                <span className="text-xs font-mono font-medium text-stone-400 mt-0.5">
                  {user?.isAdmin ? "Administrator Account" : "Staff Member"}
                </span>
              </div>
            </div>

            <hr className="mb-4 border-white/10" />

            {/* Navigation List */}
            <div className="flex flex-col gap-1.5">
              {moreMobileItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors group outline-none"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 text-slate-400 group-hover:text-white transition-colors shrink-0 border border-white/5">
                    <item.icon size={17} strokeWidth={2.2} />
                  </div>
                  <span className="text-sm font-medium text-stone-200 group-hover:text-white">
                    {item.name}
                  </span>
                </Link>
              ))}

              <hr className="my-2 border-white/10" />

              {/* Action Buttons */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors group outline-none w-full text-left cursor-pointer"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 text-slate-400 group-hover:text-rose-400 group-hover:bg-rose-500/20 transition-colors shrink-0 border border-white/5">
                  <LogOut size={17} strokeWidth={2.2} />
                </div>
                <span className="text-sm font-semibold">Sign Out Securely</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;