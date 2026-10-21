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

  // Dark / Light Mode Sync
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
    { name: "History", path: "/expenses/history", icon: History },
    { name: "Analytics", path: "/expenses/analytics", icon: PieChart },
    { name: "Settings", path: "/expenses/settings", icon: SettingsIcon },
  ];

  const userInitials = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <>
      {/* ========================================= */}
      {/* TOP NAVIGATION BAR                        */}
      {/* ========================================= */}
      <nav className="sticky top-0 z-40 bg-[#232730]/95 dark:bg-[#16181D]/95 backdrop-blur-2xl border-b border-stone-400/20 dark:border-white/10 text-white shadow-md dark:shadow-[0_10px_35px_rgba(0,0,0,0.5)] transition-all duration-300 font-sans">
        {/* Subtle horizon line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-transparent via-stone-400/40 to-transparent pointer-events-none" />

        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
          <div className="relative flex justify-between items-center h-[72px]">
            
            {/* --- LEFT: LOGO & BRAND TITLE --- */}
            <div className="flex items-center shrink-0 min-w-0 z-20">
              <Link to="/expenses" className="group outline-none min-w-0">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <img
                    src={Logo}
                    alt="Dalal Investments"
                    className="h-8 sm:h-8.5 w-auto transition-transform duration-300 group-hover:scale-105 shrink-0"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2.5">
                    <span className="text-[13px] sm:text-base font-serif font-bold text-white tracking-tight leading-tight sm:leading-none">
                      Dalal Investments
                    </span>
                    <span className="hidden sm:inline text-stone-500 font-light select-none text-xs">
                      |
                    </span>
                    <span className="text-[10px] sm:text-xs font-sans font-medium text-stone-400 leading-tight sm:leading-none tracking-wide sm:tracking-normal">
                      Expense Hub
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* --- CENTER: FIXED TACTILE DECK RAIL (NO BEAD) --- */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center rounded-xl p-1 shadow-inner z-10 bg-black/45 border border-white/10 backdrop-blur-md">
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
                  <Grid size={16} strokeWidth={2.2} />
                </Link>

                <div className="w-px h-4 bg-white/10 mx-0.5" />

                <button
                  type="button"
                  onClick={() => setIsDark(!isDark)}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-all outline-none cursor-pointer"
                  aria-label="Toggle Theme"
                  title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDark ? <Sun size={16} strokeWidth={2.2} /> : <Moon size={16} strokeWidth={2.2} />}
                </button>
              </div>

              {/* Hardware Vertical Divider */}
              <div className="hidden sm:block w-px h-6 bg-white/15 mx-0.5" />

              {/* User Profile Glyph & Logout */}
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full bg-white/15 text-white border border-white/30 flex items-center justify-center font-bold text-xs select-none shadow-xs"
                  title={user?.name || "User"}
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
      <div className="md:hidden fixed bottom-0 left-0 w-full z-40 pb-[env(safe-area-inset-bottom)] font-sans border-t border-stone-400/20 dark:border-white/10 bg-[#232730]/95 dark:bg-[#16181D]/95 backdrop-blur-2xl transition-all">
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
        </div>
      </div>
    </>
  );
};

export default ExpenseNavbar;