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
  ListTodo,
  Calculator,
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
    title: "CRM Portal",
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
    title: "Plot Twist",
    path: "/tv-rater",
    icon: Clapperboard,
  },
  {
    id: "SOUS_CHEF",
    title: "Sous Chef",
    path: "/sous-chef/recipes",
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
    if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
      return true;
    }
    return (
      localStorage.theme === "dark" ||
      localStorage.getItem("app-theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      localStorage.setItem("app-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      localStorage.setItem("app-theme", "light");
    }
  }, [isDark]);

  // Keep Navbar theme icon synced if toggled elsewhere (e.g. Settings page)
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      const domIsDark = root.classList.contains("dark");
      setIsDark((prev) => (prev !== domIsDark ? domIsDark : prev));
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

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
    { name: "Tools", path: "/tools", icon: Calculator },
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
      {/* Enforce Sora Architectural font across Navbar & Mobile Sheets */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .navbar-sora,
        .navbar-sora *:not(.font-serif):not(.font-mono) {
          font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

      {/* ========================================= */}
      {/* TOP NAVIGATION BAR (Desktop & Mobile Top) */}
      {/* ========================================= */}
      <nav className="navbar-sora sticky top-0 z-40 w-full bg-[#1B202C]/95 dark:bg-[#131720]/95 backdrop-blur-2xl border-b border-white/[0.08] text-slate-100 shadow-md dark:shadow-[0_10px_35px_rgba(0,0,0,0.45)] transition-all duration-300">
        {/* Subtle Sky Horizon Line matching WorkspaceShell */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-500/50 to-transparent pointer-events-none" />

        <div className="w-full max-w-[1840px] mx-auto px-3 sm:px-6 lg:px-8 2xl:px-14">
          <div className="relative flex justify-between items-center h-[72px] gap-2">
            {/* --- LEFT: LOGO, BRAND WORDMARK & CRM PORTAL SWITCHER --- */}
            <div className="flex items-center min-w-0 z-20">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Link to="/dashboard" className="group outline-none shrink-0">
                  <img
                    src={Logo}
                    alt="Dalal Investments Co-Pilot"
                    className="h-7.5 sm:h-9 w-auto transition-transform duration-300 group-hover:scale-105 shrink-0"
                  />
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2.5 items-start min-w-0">
                  <Link
                    to="/dashboard"
                    className="outline-none hover:opacity-95 transition-opacity max-w-full"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2.5 leading-none select-none">
                      <div className="flex flex-col text-left min-w-0">
                        <span className="font-serif font-bold text-[13px] sm:text-base text-white tracking-tight leading-tight sm:leading-none truncate">
                          Dalal Investments
                        </span>
                        <div className="hidden sm:flex items-center gap-1.5 mt-1">
                          <div className="h-[1.5px] w-8 bg-gradient-to-r from-amber-400 to-sky-400" />
                          <span className="text-[7.5px] font-mono font-bold tracking-[0.2em] text-slate-400 uppercase">
                            PRIVATE WEALTH DESK
                          </span>
                        </div>
                      </div>

                      {/* Bridge + Caliper Pill in Sky/Azure Blue */}
                      <div className="relative px-1.5 py-0.5 sm:px-2.5 sm:py-1.5 flex items-center gap-1 sm:gap-1.5 bg-sky-500/[0.08] shrink-0">
                        <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-amber-400" />
                        <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-sky-400" />
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-400" />
                        <span className="hidden sm:inline-block w-2 h-[1px] bg-sky-400/70" />
                        <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-sky-400" />
                        <span className="font-semibold text-[10px] sm:text-[12px] tracking-wide text-sky-300">
                          Co-Pilot
                        </span>
                      </div>
                    </div>
                  </Link>

                  <span className="hidden sm:inline text-slate-600 font-light select-none text-xs">
                    |
                  </span>

                  {/* QUICK APP SWITCHER DROPDOWN TRIGGER */}
                  <div className="relative mt-0.5 sm:mt-0" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsAppDropdownOpen((prev) => !prev)}
                      className="group/switcher inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-slate-400 hover:text-white leading-tight sm:leading-none tracking-wide sm:tracking-normal px-1.5 py-0.5 -mx-1.5 rounded-md hover:bg-white/[0.06] transition-all cursor-pointer outline-none"
                      title="Switch Application"
                      aria-haspopup="true"
                      aria-expanded={isAppDropdownOpen}
                    >
                      <span>CRM Portal</span>
                      <ChevronDown
                        size={11}
                        className={`text-slate-400 group-hover/switcher:text-sky-300 transition-transform duration-200 ${
                          isAppDropdownOpen ? "rotate-180 text-sky-300" : ""
                        }`}
                      />
                    </button>

                    {/* MINIMAL APP DROPDOWN MENU */}
                    {isAppDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-52 rounded-xl bg-[#1B202C]/98 backdrop-blur-xl border border-white/[0.1] shadow-[0_12px_36px_rgba(0,0,0,0.55)] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-2.5 py-1.5 text-[9px] font-mono tracking-wider uppercase text-slate-400 select-none">
                          Switch Workspace
                        </div>

                        <div className="flex flex-col gap-0.5">
                          {authorizedApps.length === 0 ? (
                            <div className="px-3 py-2 text-center text-xs text-slate-400">
                              No accessible apps
                            </div>
                          ) : (
                            authorizedApps.map((app) => {
                              const AppIcon = app.icon;
                              const isCurrent =
                                (app.id === "CLIENT_TRACKER" &&
                                  (location.pathname.startsWith("/dashboard") ||
                                    location.pathname.startsWith("/directory") ||
                                    location.pathname.startsWith("/tasks") ||
                                    location.pathname.startsWith("/tools") ||
                                    location.pathname.startsWith("/accounts") ||
                                    location.pathname.startsWith("/client"))) ||
                                (app.id === "EXPENSE_TRACKER" &&
                                  location.pathname.startsWith("/expenses")) ||
                                (app.id === "SHOW_RATER" &&
                                  location.pathname.startsWith("/tv-rater")) ||
                                (app.id === "SOUS_CHEF" &&
                                  location.pathname.startsWith("/sous-chef"));

                              return (
                                <button
                                  key={app.id}
                                  type="button"
                                  onClick={() => handleAppSelect(app.path)}
                                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer outline-none text-left border ${
                                    isCurrent
                                      ? "bg-[#232A3B] border-sky-400/35 text-white font-semibold"
                                      : "border-transparent text-slate-300 hover:text-white hover:bg-white/[0.05] font-normal"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <AppIcon
                                      size={14}
                                      className={
                                        isCurrent
                                          ? "text-sky-400"
                                          : "text-slate-400"
                                      }
                                      strokeWidth={isCurrent ? 2.4 : 2}
                                    />
                                    <span className="truncate">{app.title}</span>
                                  </div>

                                  {isCurrent && (
                                    <Check
                                      size={13}
                                      strokeWidth={2.5}
                                      className="text-sky-400 shrink-0 ml-1.5"
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
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center rounded-xl p-1 shadow-inner z-10 bg-[#151923]/90 border border-white/[0.08] backdrop-blur-md">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-3.5 xl:px-4 py-2 rounded-lg text-xs tracking-tight transition-all outline-none select-none border ${
                      isActive
                        ? "bg-[#232A3B] text-white border-sky-400/40 shadow-[0_4px_14px_-4px_rgba(14,165,233,0.25)] font-semibold"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04] border-transparent font-normal"
                    }`}
                  >
                    <Icon
                      size={15}
                      className={isActive ? "text-sky-400" : "text-slate-400"}
                      strokeWidth={isActive ? 2.4 : 2}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* --- RIGHT: ACTIONS & DISCRETE GLYPH USER PROFILE --- */}
            <div className="flex items-center gap-1.5 sm:gap-3.5 shrink-0 z-20">
              {/* Utility Dock (App Switcher & Theme Toggle) */}
              <div className="flex items-center p-0.5 rounded-lg bg-[#151923]/80 border border-white/[0.08]">
                <Link
                  to="/app-picker"
                  className="flex items-center justify-center w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-md text-slate-300 hover:text-sky-300 hover:bg-white/[0.06] transition-all outline-none"
                  aria-label="App Switcher"
                  title="App Switcher"
                >
                  <Home size={15} strokeWidth={2.2} />
                </Link>

                <div className="w-px h-4 bg-white/[0.08] mx-0.5" />

                <button
                  type="button"
                  onClick={() => setIsDark(!isDark)}
                  className="flex items-center justify-center w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-md text-slate-300 hover:text-sky-300 hover:bg-white/[0.06] transition-all outline-none cursor-pointer"
                  aria-label="Toggle Theme"
                  title={
                    isDark ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
                >
                  {isDark ? (
                    <Sun size={15} strokeWidth={2.2} className="text-amber-400" />
                  ) : (
                    <Moon size={15} strokeWidth={2.2} className="text-sky-300" />
                  )}
                </button>
              </div>

              {/* Hardware Vertical Divider */}
              <div className="hidden sm:block w-px h-6 bg-white/10 mx-0.5" />

              {/* User Profile Glyph & Logout */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div
                  className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30 flex items-center justify-center font-semibold text-xs select-none shadow-xs"
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
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ========================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR              */}
      {/* ========================================= */}
      <div className="navbar-sora lg:hidden fixed bottom-0 left-0 w-full z-40 pb-[env(safe-area-inset-bottom)] border-t border-white/[0.08] bg-[#1B202C]/95 dark:bg-[#131720]/95 backdrop-blur-2xl transition-all">
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
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-b-full bg-sky-400 shadow-[0_2px_8px_rgba(56,189,248,0.65)]" />
                )}
                <div
                  className={`mt-0.5 transition-colors ${
                    isActive
                      ? "text-sky-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                </div>
                <span
                  className={`text-[10px] tracking-tight ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-slate-400 font-normal"
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
              <span className="text-[10px] font-normal tracking-tight">
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
        <div className="navbar-sora lg:hidden fixed inset-0 z-100 flex justify-center items-end">
          {/* Blur Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Sheet Container */}
          <div className="relative w-full max-w-md bg-[#1B202C] text-slate-100 rounded-t-3xl shadow-2xl border-t border-white/10 p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom-full duration-300 ease-out">
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />

            {/* User Meta (Mobile) */}
            <div className="flex items-center gap-3.5 mb-6 px-1">
              <div className="w-10 h-10 rounded-full bg-sky-500/15 text-sky-300 font-mono font-bold text-sm flex items-center justify-center border border-sky-400/30">
                {userInitials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white leading-tight">
                  {user?.name || "Authorized User"}
                </span>
                <span className="text-xs font-mono font-medium text-slate-400 mt-0.5">
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
                  className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-sky-400/20 transition-colors group outline-none"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#151923] text-slate-400 group-hover:text-sky-400 transition-colors shrink-0 border border-white/[0.07]">
                    <item.icon size={17} strokeWidth={2.2} />
                  </div>
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white">
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
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#151923] text-slate-400 group-hover:text-rose-400 group-hover:bg-rose-500/20 transition-colors shrink-0 border border-white/[0.07]">
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