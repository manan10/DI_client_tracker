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

// Application registry matching Dalal Studio / AppPicker
const allApps = [
  {
    id: "CLIENT_TRACKER",
    title: "DI Co-Pilot",
    path: "/dashboard",
    icon: Users,
  },
  {
    id: "EXPENSE_TRACKER",
    title: "Kharcha Paani",
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

  // Ensure Lora, Nunito Sans & IBM Plex Mono are loaded even on standalone routes
  useEffect(() => {
    const linkId = "kharcha-paani-sage-fonts";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600;700&family=Lora:wght@600;700&family=Nunito+Sans:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
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
      {/* TOP NAVIGATION BAR (WARM STONE & SAGE)    */}
      {/* ========================================= */}
      <nav
        style={{ fontFamily: "'Nunito Sans', sans-serif" }}
        className="sticky top-0 z-40 w-full bg-[#FAF9F6]/95 dark:bg-[#16181C]/95 backdrop-blur-xl border-b border-stone-200/90 dark:border-white/[0.08] text-stone-900 dark:text-stone-100 shadow-[0_1px_3px_rgba(28,25,23,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-colors duration-200"
      >
        {/* Subtle botanical emerald horizon line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-transparent via-emerald-700/25 dark:via-[#4EA885]/40 to-transparent pointer-events-none" />

        <div className="w-full max-w-[1680px] mx-auto px-3 sm:px-6 md:px-8 lg:px-10 2xl:px-14">
          <div className="relative flex justify-between items-center h-[64px] sm:h-[68px] gap-2">
            {/* --- LEFT: STAMPED ₹ POCKET EMBLEM, WORDMARK & SWITCHER --- */}
            <div className="flex items-center min-w-0 z-20">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                {/* Stamped ₹ Pocket Emblem */}
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
                    className="h-8 sm:h-8.5 w-auto transition-transform duration-300 group-hover:scale-105 shrink-0"
                  >
                    <path
                      d="M7 9L17 4.5L21 11"
                      className="fill-emerald-700/15 stroke-emerald-700 dark:fill-[#4EA885]/20 dark:stroke-[#68C19D]"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 10H23V18.5C23 21.5 19.5 23.5 14 25C8.5 23.5 5 21.5 5 18.5V10Z"
                      className="fill-white stroke-emerald-700 dark:fill-[#1A1C20] dark:stroke-[#68C19D]"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <text
                      x="14"
                      y="19.5"
                      textAnchor="middle"
                      className="fill-emerald-700 dark:fill-[#68C19D]"
                      fontSize="9.5"
                      fontWeight="700"
                      fontFamily="'IBM Plex Mono', monospace"
                    >
                      ₹
                    </text>
                  </svg>
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2.5 items-start min-w-0">
                  {/* Upright Lora Wordmark: Kha₹cha Paani */}
                  <Link
                    to="/expenses"
                    className="outline-none hover:opacity-90 transition-opacity max-w-full"
                  >
                    <div className="flex flex-col text-left leading-none select-none">
                      <div
                        style={{ fontFamily: "'Lora', serif" }}
                        className="flex items-baseline text-[17px] sm:text-[20px] font-bold tracking-tight"
                      >
                        <span className="text-stone-950 dark:text-stone-50 inline-flex items-baseline">
                          <span>Kha</span>
                          <span
                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                            className="font-bold text-[15px] sm:text-[18px] text-emerald-700 dark:text-[#68C19D] mx-[1px]"
                          >
                            ₹
                          </span>
                          <span>cha</span>
                        </span>
                        <span className="ml-1.5 text-emerald-700 dark:text-[#68C19D]">
                          Paani
                        </span>
                      </div>

                      <div className="hidden sm:flex items-center gap-1.5 mt-1">
                        <div className="h-[1.5px] w-7 rounded-full bg-emerald-700/50 dark:bg-[#4EA885]/60" />
                        <span
                          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                          className="text-[8px] font-semibold tracking-[0.2em] text-stone-500 dark:text-stone-400 uppercase"
                        >
                          Expense Tracker
                        </span>
                      </div>
                    </div>
                  </Link>

                  <span className="hidden sm:inline text-stone-300 dark:text-stone-700 font-light select-none text-xs">
                    |
                  </span>

                  {/* QUICK APP SWITCHER DROPDOWN TRIGGER */}
                  <div className="relative mt-0.5 sm:mt-0" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsAppDropdownOpen((prev) => !prev)}
                      className="group/switcher inline-flex items-center gap-1 text-[10.5px] sm:text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 leading-tight sm:leading-none px-2 py-1 -mx-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-white/[0.06] transition-all cursor-pointer outline-none"
                      title="Switch Workspace Application"
                      aria-haspopup="true"
                      aria-expanded={isAppDropdownOpen}
                    >
                      <span>Kharcha Paani</span>
                      <ChevronDown
                        size={11}
                        className={`text-stone-400 group-hover/switcher:text-emerald-700 dark:group-hover/switcher:text-[#68C19D] transition-transform duration-200 ${
                          isAppDropdownOpen
                            ? "rotate-180 text-emerald-700 dark:text-[#68C19D]"
                            : ""
                        }`}
                      />
                    </button>

                    {/* MINIMAL APP DROPDOWN MENU */}
                    {isAppDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-white dark:bg-[#1A1C20] border border-stone-200/90 dark:border-white/[0.09] shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-stone-900 dark:text-stone-100">
                        <div className="px-2.5 py-1.5 text-[9.5px] font-bold tracking-[0.12em] uppercase text-stone-400 dark:text-stone-500 select-none">
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
                                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer outline-none text-left ${
                                    isCurrent
                                      ? "bg-emerald-700/10 dark:bg-[#4EA885]/18 text-emerald-800 dark:text-[#86D4B4] font-bold"
                                      : "text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100/80 dark:hover:bg-white/[0.05] font-medium"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <AppIcon
                                      size={14}
                                      className={
                                        isCurrent
                                          ? "text-emerald-700 dark:text-[#68C19D]"
                                          : "text-stone-400"
                                      }
                                      strokeWidth={isCurrent ? 2.4 : 2}
                                    />
                                    <span className="truncate">{app.title}</span>
                                  </div>

                                  {isCurrent && (
                                    <Check
                                      size={13}
                                      strokeWidth={2.5}
                                      className="text-emerald-700 dark:text-[#68C19D] shrink-0 ml-1.5"
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
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center rounded-xl p-1 z-10 bg-stone-200/70 dark:bg-[#121315]/85 border border-stone-200/90 dark:border-white/[0.07]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs tracking-wide transition-all outline-none select-none ${
                      isActive
                        ? "bg-white dark:bg-[#22252A] text-emerald-800 dark:text-[#86D4B4] font-bold shadow-2xs"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-white/50 dark:hover:bg-white/[0.04] font-semibold"
                    }`}
                  >
                    <Icon
                      size={15}
                      className={
                        isActive
                          ? "text-emerald-700 dark:text-[#68C19D]"
                          : "text-stone-500 dark:text-stone-400"
                      }
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
              <div className="flex items-center p-0.5 rounded-lg bg-stone-200/70 dark:bg-[#121315]/85 border border-stone-200/90 dark:border-white/[0.07]">
                <Link
                  to="/app-picker"
                  className="flex items-center justify-center w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-md text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-[#68C19D] hover:bg-white/80 dark:hover:bg-white/[0.06] transition-all outline-none"
                  aria-label="App Switcher"
                  title="App Switcher"
                >
                  <Home size={15} strokeWidth={2.2} />
                </Link>

                <div className="w-px h-4 bg-stone-300/80 dark:bg-white/[0.08] mx-0.5" />

                <button
                  type="button"
                  onClick={() => setIsDark(!isDark)}
                  className="flex items-center justify-center w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-md text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-[#68C19D] hover:bg-white/80 dark:hover:bg-white/[0.06] transition-all outline-none cursor-pointer"
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
              <div className="hidden sm:block w-px h-6 bg-stone-200 dark:bg-white/[0.08] mx-0.5" />

              {/* User Profile Glyph & Logout */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div
                  style={{ fontFamily: "'Lora', serif" }}
                  className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-emerald-700/12 dark:bg-[#4EA885]/18 text-emerald-800 dark:text-[#86D4B4] border border-emerald-700/25 dark:border-[#4EA885]/35 flex items-center justify-center font-bold text-xs select-none shadow-2xs"
                  title={user?.name || "User"}
                >
                  {userInitials}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-rose-700 dark:hover:text-[#F09BA3] hover:bg-rose-700/10 dark:hover:bg-[#E88D96]/15 transition-colors cursor-pointer outline-none"
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
      <div
        style={{ fontFamily: "'Nunito Sans', sans-serif" }}
        className="lg:hidden fixed bottom-0 left-0 w-full z-40 pb-[env(safe-area-inset-bottom)] border-t border-stone-200/90 dark:border-white/[0.08] bg-[#FAF9F6]/95 dark:bg-[#16181C]/95 backdrop-blur-xl transition-all"
      >
        <div className="flex items-center justify-around h-16 px-3 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className="relative flex flex-col items-center justify-center w-full h-full gap-1 outline-none select-none touch-manipulation"
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-b-full bg-emerald-700 dark:bg-[#4EA885]" />
                )}
                <div
                  className={`mt-0.5 transition-colors ${
                    isActive
                      ? "text-emerald-700 dark:text-[#68C19D]"
                      : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                  }`}
                >
                  <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                </div>
                <span
                  className={`text-[10px] tracking-wide ${
                    isActive
                      ? "text-emerald-800 dark:text-[#86D4B4] font-bold"
                      : "text-stone-500 dark:text-stone-400 font-semibold"
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