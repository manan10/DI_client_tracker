import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  PieChart,
  History,
  Settings as SettingsIcon,
  LogOut,
  Sun,
  Moon,
  Grid,
} from "lucide-react";
import { useAuth } from "../../../shared/hooks/useAuth";
import Logo from "../../../assets/logo_nobrand.png";

const ExpenseNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Home", path: "/expenses", icon: HomeIcon },
    { name: "Analytics", path: "/expenses/analytics", icon: PieChart },
    { name: "History", path: "/expenses/history", icon: History },
    { name: "Settings", path: "/expenses/settings", icon: SettingsIcon },
  ];

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
            {/* --- LEFT: LOGO & BRANDING --- */}
            <div className="flex items-center shrink-0 min-w-0 z-20">
              <Link
                to="/expenses"
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
                    Dalal Family
                  </span>
                  <div className="flex items-center mt-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 uppercase tracking-widest leading-none border border-emerald-500/20">
                      Finance Hub
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* --- CENTER: ABSOLUTE NAVIGATION (Desktop Only) --- */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1.5 p-1.5 bg-black/40 dark:bg-black/30 border border-white/10 dark:border-white/5 rounded-xl shadow-inner z-10">
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

            {/* --- RIGHT: ACTIONS & USER IDENTITY --- */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 z-20">
              {/* App Picker & Theme Toggle */}
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

              {/* Hardware Divider */}
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
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-7 h-7 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors outline-none shrink-0 cursor-pointer ml-1"
                  title="Sign Out"
                >
                  <LogOut size={15} strokeWidth={2.2} />
                </button>
              </div>

              {/* Mobile Logout Quick Icon */}
              <button
                onClick={handleLogout}
                className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-all outline-none"
                aria-label="Sign Out"
              >
                <LogOut size={17} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ========================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR                */}
      {/* ========================================= */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900/95 dark:bg-[#0E1626]/95 backdrop-blur-2xl border-t border-slate-800 dark:border-white/10 z-40 pb-[env(safe-area-inset-bottom)] shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-transparent via-emerald-500/40 to-transparent pointer-events-none" />

        <div className="flex items-center justify-around h-17 px-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className="relative flex flex-col items-center justify-center w-full h-full gap-1 outline-none group"
              >
                {/* Active Indicator Top Bar */}
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
        </div>
      </div>
    </>
  );
};

export default ExpenseNavbar;
