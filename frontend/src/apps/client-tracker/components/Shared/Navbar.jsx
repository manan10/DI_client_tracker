import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  TestTubeIcon,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../../../shared/hooks/useAuth";
import Logo from "../../../../assets/logo_nobrand.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Home", path: "/dashboard", icon: LayoutDashboard },
    { name: "Directory", path: "/directory", icon: Users },
    { name: "Ops", path: "/tasks", icon: ListTodo },
    // { name: 'Docs', path: '/documents', icon: Files, isLocked: true },
    ...(user?.isAdmin
      ? [{ name: "Accounts", path: "/accounts", icon: BarChart3 }]
      : []),
    { name: "Settings", path: "/settings", icon: SettingsIcon },
    // { name: 'Tally Test', path: '/tally-debtor-test', icon: TestTubeIcon },
  ];

  const mainMobileItems = navItems.slice(0, 5);
  const moreMobileItems = navItems.slice(5);

  return (
    <>
      {/* ========================================= */}
      {/* TOP NAVIGATION BAR (Desktop & Mobile Top)   */}
      {/* ========================================= */}
      <nav className="sticky top-0 z-50 bg-slate-900/95 dark:bg-[#0E1626]/95 backdrop-blur-2xl border-b border-slate-800 dark:border-white/10 shadow-lg dark:shadow-2xl transition-all duration-300">
        {/* Subtle Horizon Glow Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-transparent via-emerald-500/40 to-transparent pointer-events-none" />

        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
          <div className="relative flex justify-between items-center h-18">
            {/* --- LEFT: BRANDING & LOGO --- */}
            <div className="flex items-center shrink-0 min-w-0 z-20">
              <Link
                to="/dashboard"
                className="flex items-center gap-3.5 group outline-none"
              >
                <div className="p-1 rounded-xl bg-white/5 border border-white/10 group-hover:border-emerald-500/40 transition-all duration-300 shadow-2xs">
                  <img
                    src={Logo}
                    alt="Logo"
                    className="h-8 sm:h-8.5 w-auto group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[14px] sm:text-[16px] font-[1000] text-white uppercase tracking-tight leading-none truncate">
                    Dalal Investment
                  </span>
                  <div className="flex items-center mt-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 uppercase tracking-widest leading-none border border-emerald-500/20">
                      Distributor Portal
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* --- CENTER: ABSOLUTE NAVIGATION (Desktop Only) --- */}
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1.5 p-1.5 bg-black/40 dark:bg-black/30 border border-white/10 dark:border-white/5 rounded-xl shadow-inner z-10">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-2 px-3.5 xl:px-4.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 outline-none select-none ${
                      isActive
                        ? "bg-emerald-500 text-slate-950 shadow-md font-black ring-1 ring-emerald-400"
                        : "text-slate-400 hover:text-white hover:bg-white/10 dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* --- RIGHT: CONTROL PANEL & USER IDENTITY --- */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 z-20">
              {/* Hardware Actions */}
              <div className="flex items-center gap-1.5">
                <Link
                  to="/app-picker"
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-white/10 transition-all outline-none"
                  aria-label="App Picker"
                >
                  <Grid size={17} strokeWidth={2.2} />
                </Link>

                <button
                  onClick={() => setIsDark(!isDark)}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-white/10 transition-all outline-none cursor-pointer"
                  aria-label="Toggle Theme"
                >
                  {isDark ? (
                    <Sun size={17} strokeWidth={2.2} />
                  ) : (
                    <Moon size={17} strokeWidth={2.2} />
                  )}
                </button>
              </div>

              {/* Vertical Divider */}
              <div className="hidden sm:block w-px h-6 bg-white/15 mx-1" />

              {/* User Profile Chip */}
              <div className="hidden sm:flex items-center gap-3 pl-1.5 p-1.5 pr-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-default shadow-xs">
                {/* Avatar */}
                <div className="flex items-center justify-center w-7.5 h-7.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs shrink-0 border border-emerald-500/40 shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>

                {/* Identity */}
                <div className="flex flex-col text-left min-w-0 pr-1">
                  <span className="text-xs font-bold text-white leading-none truncate max-w-32">
                    {user?.name || "Authorized User"}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold tracking-wider mt-1 leading-none uppercase ${user?.isAdmin ? "text-emerald-400" : "text-slate-400"}`}
                  >
                    {user?.isAdmin ? "Administrator" : "Staff"}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-7 h-7 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors outline-none shrink-0 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={15} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ========================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR                */}
      {/* ========================================= */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-slate-900/95 dark:bg-[#0E1626]/95 backdrop-blur-2xl border-t border-slate-800 dark:border-white/10 z-40 pb-[env(safe-area-inset-bottom)] shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-transparent via-emerald-500/40 to-transparent pointer-events-none" />

        <div className="flex items-center justify-around h-17 px-2 max-w-md mx-auto">
          {mainMobileItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className="relative flex flex-col items-center justify-center w-full h-full gap-1 outline-none group"
              >
                {/* Active Top Bar Indicator */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[2.5px] bg-emerald-400 rounded-b-full shadow-[0_2px_10px_rgba(16,185,129,0.8)]" />
                )}

                <div
                  className={`mt-0.5 transition-colors duration-200 ${isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white"}`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={`text-[10px] font-bold tracking-wide uppercase ${isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white"}`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}

          <button
            onClick={() => setIsMenuOpen(true)}
            className="relative flex flex-col items-center justify-center w-full h-full gap-1 outline-none text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <div className="mt-0.5">
              <Menu size={20} strokeWidth={2.2} />
            </div>
            <span className="text-[10px] font-bold tracking-wide uppercase">
              More
            </span>
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
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Sheet Container */}
          <div className="relative w-full max-w-md bg-slate-900 dark:bg-[#0B1120] rounded-t-3xl shadow-2xl border-t border-slate-800 dark:border-white/10 p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom-full duration-300 ease-out">
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />

            {/* User Meta (Mobile) */}
            <div className="flex items-center gap-4 mb-6 px-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-lg flex items-center justify-center border border-emerald-500/30">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white leading-tight">
                  {user?.name || "Authorized User"}
                </span>
                <span className="text-xs font-mono font-medium text-slate-400 mt-0.5">
                  {user?.isAdmin ? "Administrator Account" : "Staff Member"}
                </span>
              </div>
            </div>

            <hr className="mb-6 border-white/10" />

            {/* Navigation List */}
            <div className="flex flex-col gap-2">
              {moreMobileItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors group outline-none"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors shrink-0 border border-white/5">
                    <item.icon size={18} strokeWidth={2.2} />
                  </div>
                  <span className="text-sm font-bold text-slate-200">
                    {item.name}
                  </span>
                </Link>
              ))}

              <hr className="my-2 border-white/10" />

              {/* Action Buttons */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors group outline-none w-full text-left cursor-pointer"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 text-slate-400 group-hover:text-rose-400 group-hover:bg-rose-500/20 transition-colors shrink-0 border border-white/5">
                  <LogOut size={18} strokeWidth={2.2} />
                </div>
                <span className="text-sm font-bold">Sign Out Securely</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
