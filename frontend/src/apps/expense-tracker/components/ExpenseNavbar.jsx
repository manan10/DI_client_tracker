import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  PieChart,
  History,
  Settings as SettingsIcon,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  Users,
  ReceiptIndianRupee,
  Clapperboard,
  Check,
  Home,
  UtensilsCrossed,
} from "lucide-react";
import { useAuth } from "../../../shared/hooks/useAuth";

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
    title: "Expense Hub",
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

const ExpenseNavbar = () => {
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
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isAppDropdownOpen]);

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
    setIsAppDropdownOpen(false);
    logout();
    navigate("/login");
  };

  const handleAppSelect = (path) => {
    setIsAppDropdownOpen(false);
    navigate(path);
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
      {/* TOP NAVIGATION BAR (Background #6)        */}
      {/* ========================================= */}
      <nav className="sticky top-0 z-40 w-full bg-[#171C2E]/95 dark:bg-[#0E121E]/95 backdrop-blur-2xl border-b border-indigo-400/20 text-white shadow-lg transition-all duration-300 font-sans">
        {/* Subtle horizon line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-transparent via-indigo-400/50 to-transparent pointer-events-none" />

        <div className="w-full mx-auto px-3 sm:px-6 lg:px-8 2xl:px-16">
          <div className="relative flex justify-between items-center h-[72px] gap-2">
            {/* --- LEFT: LOGO #3 (STAMPED ₹ POCKET), WORDMARK & SWITCHER --- */}
            <div className="flex items-center min-w-0 z-20">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                {/* Logo #3: Stamped ₹ Pocket Emblem */}
                <Link
                  to="/expenses"
                  className="group outline-none shrink-0"
                  aria-label="Kharcha Paani Home"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 28 28"
                    fill="none"
                    className="h-8 sm:h-9 w-auto transition-transform duration-300 group-hover:scale-105 shrink-0"
                  >
                    <path
                      d="M7 9L17 4.5L21 11"
                      fill="#065F46"
                      stroke="#34D399"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 10H23V18.5C23 21.5 19.5 23.5 14 25C8.5 23.5 5 21.5 5 18.5V10Z"
                      fill="#181C24"
                      stroke="#FBBF24"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <text
                      x="14"
                      y="19.5"
                      textAnchor="middle"
                      fill="#FDE68A"
                      fontSize="9"
                      fontWeight="900"
                      fontFamily="sans-serif"
                    >
                      ₹
                    </text>
                  </svg>
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2.5 items-start min-w-0">
                  {/* Finalized Wordmark: Kha₹cha Paani */}
                  <Link
                    to="/expenses"
                    className="outline-none hover:opacity-95 transition-opacity max-w-full"
                  >
                    <div className="flex flex-col text-left leading-none select-none">
                      <div className="flex items-baseline">
                        <span className="font-serif font-bold text-[17px] sm:text-[21px] text-amber-100 tracking-tight inline-flex items-baseline">
                          <span>Kha</span>
                          <span className="font-sans font-black text-[15px] sm:text-[18.5px] text-amber-400 mx-[1px] drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]">
                            ₹
                          </span>
                          <span>cha</span>
                        </span>
                        <span className="ml-1.5 font-serif italic font-normal text-[17px] sm:text-[21px] bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent tracking-tight pr-0.5">
                          Paani
                        </span>
                      </div>

                      <div className="hidden sm:flex items-center gap-1.5 mt-1">
                        <div className="h-[1px] w-8 bg-gradient-to-r from-emerald-400 to-amber-400" />
                        <span className="text-[7.5px] font-mono font-bold tracking-[0.22em] text-stone-400 uppercase">
                          CASH &amp; UPI RUNWAY
                        </span>
                      </div>
                    </div>
                  </Link>

                  <span className="hidden sm:inline text-stone-500 font-light select-none text-xs">
                    |
                  </span>

                  {/* QUICK APP SWITCHER DROPDOWN TRIGGER */}
                  <div className="relative mt-0.5 sm:mt-0" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsAppDropdownOpen((prev) => !prev)}
                      className="group/switcher inline-flex items-center gap-1 text-[10px] sm:text-xs font-sans font-medium text-stone-400 hover:text-white leading-tight sm:leading-none tracking-wide sm:tracking-normal px-1.5 py-0.5 -mx-1.5 rounded-md hover:bg-white/5 transition-all cursor-pointer outline-none"
                      title="Switch Workspace Application"
                      aria-haspopup="true"
                      aria-expanded={isAppDropdownOpen}
                    >
                      <span>Expense Hub</span>
                      <ChevronDown
                        size={11}
                        className={`text-stone-400 group-hover/switcher:text-white transition-transform duration-200 ${
                          isAppDropdownOpen ? "rotate-180 text-white" : ""
                        }`}
                      />
                    </button>

                    {/* MINIMAL APP DROPDOWN MENU */}
                    {isAppDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-52 rounded-xl bg-[#131829]/98 backdrop-blur-xl border border-indigo-400/20 shadow-[0_12px_36px_rgba(0,0,0,0.65)] p-1 z-50 animate-in fade-in zoom-in-95 duration-150 text-white">
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
                                (app.id === "EXPENSE_TRACKER" &&
                                  location.pathname.startsWith("/expenses")) ||
                                (app.id === "CLIENT_TRACKER" &&
                                  location.pathname.startsWith("/dashboard")) ||
                                (app.id === "SHOW_RATER" &&
                                  location.pathname.startsWith("/tv-rater")) ||
                                (app.id === "SOUS_CHEF" &&
                                  location.pathname.startsWith("/sous-chef"));

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
                                        isCurrent
                                          ? "text-white"
                                          : "text-stone-400"
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
            <div className="flex items-center gap-1.5 sm:gap-3.5 shrink-0 z-20 font-sans">
              {/* Utility Dock (App Switcher & Theme Toggle) */}
              <div className="flex items-center p-0.5 rounded-lg bg-black/25 border border-white/10">
                <Link
                  to="/app-picker"
                  className="flex items-center justify-center w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-all outline-none"
                  aria-label="App Switcher"
                  title="App Switcher"
                >
                  <Home size={15} strokeWidth={2.2} />
                </Link>

                <div className="w-px h-4 bg-white/10 mx-0.5" />

                <button
                  type="button"
                  onClick={() => setIsDark(!isDark)}
                  className="flex items-center justify-center w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-all outline-none cursor-pointer"
                  aria-label="Toggle Theme"
                  title={
                    isDark ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
                >
                  {isDark ? (
                    <Sun size={15} strokeWidth={2.2} />
                  ) : (
                    <Moon size={15} strokeWidth={2.2} />
                  )}
                </button>
              </div>

              {/* Hardware Vertical Divider */}
              <div className="hidden sm:block w-px h-6 bg-white/15 mx-0.5" />

              {/* User Profile Glyph & Logout */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div
                  className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-white/15 text-white border border-white/30 flex items-center justify-center font-bold text-xs select-none shadow-xs"
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
      <div className="lg:hidden fixed bottom-0 left-0 w-full z-40 pb-[env(safe-area-inset-bottom)] font-sans border-t border-indigo-400/20 bg-[#171C2E]/95 dark:bg-[#0E121E]/95 backdrop-blur-2xl transition-all">
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