// src/pages/AppPicker.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  ArrowRight,
  Users,
  ReceiptIndianRupee,
  Zap,
  ArrowUpRight,
  Sun,
  Moon,
  Clapperboard,
  Settings,
  UtensilsCrossed,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Logo from "../../assets/logo_nobrand.png";

const allApps = [
  {
    id: "CLIENT_TRACKER",
    title: "Dalal Investments Co-Pilot",
    subtitle: "Mutual Fund & Client CRM",
    category: "Business",
    description:
      "Manage your mutual fund clients, track portfolios, handle daily tasks, and sync transactions.",
    features: ["Folios", "Submissions", "Registry"],
    path: "/dashboard",
    icon: Users,
    badge: "Business App",
    theme: {
      primary: "bg-emerald-600 dark:bg-emerald-500",
      text: "text-emerald-800 dark:text-emerald-300",
      accentBg:
        "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/90 dark:border-emerald-500/30",
      border:
        "border-2 border-emerald-300/80 dark:border-emerald-500/40 hover:border-emerald-600 dark:hover:border-emerald-400",
      cardHover:
        "hover:shadow-[0_18px_40px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_18px_40px_rgba(16,185,129,0.12)]",
      badgeBg:
        "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-300/90 dark:border-emerald-500/30",
      pillBg:
        "bg-emerald-50/90 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 border border-emerald-200/90 dark:border-emerald-500/25",
      glow: "from-emerald-500/20 via-teal-500/10 to-transparent",
      arrowHover:
        "group-hover:bg-emerald-700 group-hover:text-white group-hover:border-emerald-700 dark:group-hover:bg-emerald-500 dark:group-hover:text-slate-950 dark:group-hover:border-emerald-500",
    },
  },
  {
    id: "EXPENSE_TRACKER",
    title: "Kha₹cha Paani",
    subtitle: "Household & Daily Accounts",
    category: "Personal",
    description:
      "Track everyday home expenses, view monthly category totals, and manage family accounts.",
    features: ["Spending", "Categories", "Ledger"],
    path: "/expenses",
    icon: ReceiptIndianRupee,
    badge: "Personal App",
    theme: {
      primary: "bg-indigo-600 dark:bg-indigo-500",
      text: "text-indigo-800 dark:text-indigo-300",
      accentBg:
        "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200/90 dark:border-indigo-500/30",
      border:
        "border-2 border-indigo-300/80 dark:border-indigo-500/40 hover:border-indigo-600 dark:hover:border-indigo-400",
      cardHover:
        "hover:shadow-[0_18px_40px_rgba(99,102,241,0.15)] dark:hover:shadow-[0_18px_40px_rgba(99,102,241,0.12)]",
      badgeBg:
        "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border border-indigo-300/90 dark:border-indigo-500/30",
      pillBg:
        "bg-indigo-50/90 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-200 border border-indigo-200/90 dark:border-indigo-500/25",
      glow: "from-indigo-500/20 via-blue-500/10 to-transparent",
      arrowHover:
        "group-hover:bg-indigo-700 group-hover:text-white group-hover:border-indigo-700 dark:group-hover:bg-indigo-500 dark:group-hover:text-slate-950 dark:group-hover:border-indigo-500",
    },
  },
  {
    id: "SHOW_RATER",
    title: "plot twist",
    subtitle: "Screen Vault",
    category: "Cinema",
    description:
      "Rate movies and TV shows, rank your favorites, and keep a clean personal watchlist.",
    features: ["Ratings", "Watchlists", "Timeline"],
    path: "/tv-rater",
    icon: Clapperboard,
    badge: "Cinema Vault",
    theme: {
      primary: "bg-[#40bcf4]",
      text: "text-sky-700 dark:text-[#40bcf4]",
      accentBg:
        "bg-sky-50 dark:bg-[#1F242B] text-sky-600 dark:text-[#40bcf4] border border-sky-200/90 dark:border-[#2C3440]",
      border:
        "border-2 border-sky-300/80 dark:border-[#2C3440] hover:border-[#40bcf4] dark:hover:border-[#40bcf4]",
      cardHover:
        "hover:shadow-[0_18px_40px_rgba(64,188,244,0.17)] dark:hover:shadow-[0_18px_40px_rgba(64,188,244,0.14)]",
      badgeBg:
        "bg-sky-50 dark:bg-[#1F242B] text-sky-800 dark:text-stone-300 border border-sky-200 dark:border-[#2C3440]",
      pillBg:
        "bg-sky-50/90 dark:bg-[#14181C] text-sky-900 dark:text-stone-300 border border-sky-200/90 dark:border-[#2C3440]",
      glow: "from-[#40bcf4]/20 via-[#00e054]/10 to-transparent",
      arrowHover:
        "group-hover:bg-[#00e054] group-hover:text-[#14181C] group-hover:border-[#00e054]",
    },
  },
  {
    id: "SOUS_CHEF",
    title: "Sous Chef",
    subtitle: "Culinary & Recipe Vault",
    category: "Kitchen",
    description:
      "Curate family recipes, scale portions dynamically, match pantry items, and cook hands-free.",
    features: ["Smart Suggester", "Portion Scaler", "Cook Mode"],
    path: "/sous-chef/recipes",
    icon: UtensilsCrossed,
    badge: "Culinary App",
    theme: {
      primary: "bg-amber-600 dark:bg-amber-500",
      text: "text-amber-800 dark:text-amber-300",
      accentBg:
        "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/90 dark:border-amber-500/30",
      border:
        "border-2 border-amber-300/80 dark:border-amber-500/40 hover:border-amber-600 dark:hover:border-amber-400",
      cardHover:
        "hover:shadow-[0_18px_40px_rgba(217,119,6,0.17)] dark:hover:shadow-[0_18px_40px_rgba(217,119,6,0.14)]",
      badgeBg:
        "bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-300/90 dark:border-amber-500/30",
      pillBg:
        "bg-amber-50/90 dark:bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-200/90 dark:border-amber-500/25",
      glow: "from-amber-500/20 via-orange-500/10 to-transparent",
      arrowHover:
        "group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 dark:group-hover:bg-amber-500 dark:group-hover:text-slate-950 dark:group-hover:border-amber-500",
    },
  },
];

// Single-line Navbar Title Lockups for uniform, sleek card heights
const renderAppTitle = (app, variant = "desktop") => {
  const isMobile = variant === "mobile";

  switch (app.id) {
    case "CLIENT_TRACKER":
      return (
        <div className="flex items-center gap-1.5 flex-nowrap select-none min-w-0">
          <span
            className={`font-serif font-bold tracking-tight text-slate-900 dark:text-white leading-none truncate ${
              isMobile ? "text-[15px]" : "text-lg xl:text-[21px]"
            }`}
          >
            Dalal Investments
          </span>

          <div className="relative px-1.5 py-0.5 flex items-center gap-1 bg-emerald-500/[0.08] shrink-0">
            <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-amber-500 dark:border-amber-400" />
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-emerald-600 dark:border-emerald-400" />
            <span className="w-1 h-1 rounded-full bg-amber-500 dark:bg-amber-400" />
            <span className="font-sans font-extrabold text-[9.5px] xl:text-[10.5px] tracking-wide text-emerald-700 dark:text-emerald-300">
              Co-Pilot
            </span>
          </div>
        </div>
      );

    case "EXPENSE_TRACKER":
      return (
        <div className="flex items-baseline leading-none select-none">
          <span
            className={`font-serif font-bold tracking-tight inline-flex items-baseline text-indigo-950 dark:text-indigo-100 ${
              isMobile ? "text-[17px]" : "text-xl xl:text-2xl"
            }`}
          >
            <span>Kha</span>
            <span
              className={`font-sans font-black text-indigo-600 dark:text-indigo-400 mx-[1px] ${
                isMobile ? "text-[15px]" : "text-lg xl:text-xl"
              }`}
            >
              ₹
            </span>
            <span>cha</span>
          </span>
          <span
            className={`ml-1.5 font-serif italic font-normal bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-300 dark:to-sky-300 bg-clip-text text-transparent tracking-tight pr-0.5 ${
              isMobile ? "text-[17px]" : "text-xl xl:text-2xl"
            }`}
          >
            Paani
          </span>
        </div>
      );

    case "SHOW_RATER":
      return (
        <div className="flex items-center gap-1.5 select-none">
          <div className="flex items-baseline leading-none">
            <span
              className={`font-[1000] tracking-[-0.03em] text-slate-900 dark:text-white font-sans ${
                isMobile ? "text-[18px]" : "text-2xl xl:text-[26px]"
              }`}
            >
              plot
            </span>
            <span
              className={`font-[1000] tracking-[-0.03em] text-[#40bcf4] font-sans ${
                isMobile ? "text-[18px]" : "text-2xl xl:text-[26px]"
              }`}
            >
              twist
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 pb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff8000]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e054]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#40bcf4]" />
          </div>
        </div>
      );

    case "SOUS_CHEF":
      return (
        <div className="flex items-center gap-1.5 leading-none select-none">
          <span
            className={`font-sans font-black tracking-[0.12em] uppercase bg-gradient-to-r from-amber-700 via-amber-500 to-amber-600 dark:from-amber-100 dark:via-amber-300 dark:to-amber-500 bg-clip-text text-transparent ${
              isMobile ? "text-[16px]" : "text-xl xl:text-2xl"
            }`}
          >
            SOUS CHEF
          </span>
          <span className="text-amber-500 dark:text-amber-400 text-xs">✦</span>
        </div>
      );

    default:
      return (
        <h3 className="text-xl xl:text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
          {app.title}
        </h3>
      );
  }
};

const AppPicker = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [_, setActiveId] = useState(null);

  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.theme === "dark" ||
      localStorage.getItem("app-theme") === "dark" ||
      (!("theme" in localStorage) &&
        !("app-theme" in localStorage) &&
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

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Strict check: only render apps included in allowedApps
  const authorizedApps = useMemo(() => {
    const userPermissions = user?.allowedApps || [];
    return allApps.filter((app) => userPermissions.includes(app.id));
  }, [user]);

  const firstName = useMemo(() => {
    if (!user?.name) return "User";
    return user.name.trim().split(" ")[0];
  }, [user]);

  // Adaptive Wide Desktop Grid (1 to 4+ cards)
  const desktopGridClass = useMemo(() => {
    const count = authorizedApps.length;
    if (count === 1) return "grid-cols-1 max-w-md";
    if (count === 2) return "grid-cols-2 max-w-3xl";
    if (count === 3) return "grid-cols-3 max-w-6xl";
    return "grid-cols-2 lg:grid-cols-4 w-full";
  }, [authorizedApps.length]);

  return (
    <div className="h-dvh w-screen bg-[#F8FAFC] dark:bg-[#060A14] text-slate-900 dark:text-slate-100 flex flex-col font-serif overflow-hidden relative selection:bg-emerald-800 selection:text-white transition-colors duration-300">
      {/* --- AMBIENT HALO + VIGNETTE DOT LATTICE --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] left-1/4 w-[48vw] h-[48vw] max-w-[540px] max-h-[540px] rounded-full bg-emerald-400/12 dark:bg-emerald-500/10 blur-[110px]" />
        <div className="absolute -bottom-[20%] right-1/4 w-[48vw] h-[48vw] max-w-[540px] max-h-[540px] rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1.1px,transparent_1.1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.07)_1.1px,transparent_1.1px)] [background-size:24px_24px] opacity-35 dark:opacity-35 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_65%,transparent_100%)]" />
      </div>

      {/* --- TOP FLOATING CONTROLS --- */}
      <div className="absolute top-4 sm:top-6 lg:top-7 right-4 sm:right-8 lg:right-10 z-50 flex items-center gap-2 sm:gap-2.5">
        {/* Settings Button */}
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="group h-9 sm:h-10 px-2.5 sm:px-3.5 flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-gradient-to-br from-slate-500/15 via-slate-500/10 to-slate-500/5 dark:from-slate-400/20 dark:via-slate-400/10 dark:to-slate-500/5 hover:from-slate-500/25 hover:to-slate-500/15 text-slate-800 dark:text-slate-200 border border-slate-300/60 dark:border-slate-500/30 shadow-xs active:scale-95 transition-all duration-200 outline-none cursor-pointer shrink-0 backdrop-blur-sm"
          title="Settings"
          aria-label="Settings"
        >
          <Settings
            size={17}
            className="transition-transform group-hover:rotate-45 text-slate-600 dark:text-slate-300"
          />
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-emerald-500/5 dark:from-emerald-400/20 dark:via-teal-400/10 dark:to-emerald-500/5 hover:from-emerald-500/25 hover:to-teal-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-500/30 shadow-xs active:scale-95 transition-all duration-200 cursor-pointer outline-none shrink-0 backdrop-blur-sm"
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <Sun size={17} className="text-amber-400" />
          ) : (
            <Moon size={17} className="text-emerald-700" />
          )}
        </button>

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className="group h-9 sm:h-10 px-2.5 sm:px-3.5 flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-gradient-to-br from-rose-500/15 via-pink-500/10 to-rose-500/5 dark:from-rose-400/20 dark:via-pink-400/10 dark:to-rose-500/5 hover:from-rose-500/25 hover:to-pink-500/15 text-rose-800 dark:text-rose-300 border border-rose-300/60 dark:border-rose-500/30 shadow-xs active:scale-95 transition-all duration-200 outline-none cursor-pointer shrink-0 backdrop-blur-sm"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut
            size={15}
            className="transition-transform group-hover:-translate-x-0.5 text-rose-600 dark:text-rose-400"
          />
          <span className="hidden sm:inline font-sans text-xs sm:text-sm font-semibold tracking-wide">
            Sign Out
          </span>
        </button>
      </div>

      {/* --- CENTRAL PORTAL WORKSPACE --- */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10 min-h-0 py-3 sm:py-5 lg:py-7">
        {/* --- WIDE ARCHITECTURAL BRANDING & PRIVATE DESK COORDINATE GREETING (OPTION #6) --- */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8 lg:mb-11 shrink-0 w-full">
          <div className="mb-2.5 sm:mb-3.5 select-none transition-transform duration-300 hover:scale-105">
            <img
              src={Logo}
              alt="Dalal Studio Logo"
              className="h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32 2xl:h-36 w-auto object-contain drop-shadow-[0_10px_24px_rgba(16,185,129,0.22)] dark:drop-shadow-[0_12px_28px_rgba(16,185,129,0.3)]"
            />
          </div>

          <div className="inline-flex flex-col items-center">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-[64px] font-serif font-semibold uppercase tracking-[0.42em] sm:tracking-[0.55em] lg:tracking-[0.65em] text-slate-900 dark:text-slate-100 leading-none pl-[0.42em] sm:pl-[0.55em] lg:pl-[0.65em]">
              Dalal
            </h1>
            <div className="flex items-center gap-4 sm:gap-6 mt-3 sm:mt-3.5">
              <span className="h-px w-14 sm:w-28 lg:w-36 bg-gradient-to-r from-transparent to-amber-500/80 dark:to-amber-400/80" />
              <span className="font-mono text-sm sm:text-base lg:text-lg xl:text-xl font-bold uppercase tracking-[0.48em] text-emerald-800 dark:text-emerald-400 pl-[0.48em]">
                Studio
              </span>
              <span className="h-px w-14 sm:w-28 lg:w-36 bg-gradient-to-l from-transparent to-amber-500/80 dark:to-amber-400/80" />
            </div>
          </div>

          {/* Private Desk Coordinate Greeting (Option #6) */}
          <div className="mt-4 sm:mt-5 flex flex-col items-center gap-1">
            <span className="font-mono text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">
              ACTIVE SESSION •{" "}
              <span className="text-emerald-800 dark:text-emerald-400">
                {firstName}
              </span>
            </span>
            <span className="font-sans text-xs sm:text-[13px] text-slate-500 dark:text-slate-400">
              Select an application
            </span>
          </div>
        </div>

        {/* Empty State Fallback */}
        {authorizedApps.length === 0 ? (
          <div className="p-8 text-center bg-white/90 dark:bg-slate-900/90 border-2 border-slate-300 dark:border-white/20 rounded-2xl backdrop-blur-md shadow-sm max-w-md mx-auto">
            <p className="text-base font-serif font-semibold text-slate-800 dark:text-slate-200">
              No Assigned Applications
            </p>
            <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              Please contact an administrator to grant access permissions for your profile.
            </p>
          </div>
        ) : (
          <>
            {/* ======================================================== */}
            {/* 📱 MOBILE VIEW: SCROLL-SAFE ACTION PODS (< lg)           */}
            {/* ======================================================== */}
            <div className="flex lg:hidden flex-col gap-2.5 w-full max-w-md mx-auto overflow-y-auto no-scrollbar max-h-[54dvh] py-1 px-1">
              {authorizedApps.map((app) => (
                <div
                  key={`mob-${app.id}`}
                  onClick={() => navigate(app.path)}
                  className={`group relative flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900/90 ${app.theme.border} transition-all duration-200 active:scale-[0.98] shadow-xs hover:shadow-md cursor-pointer overflow-hidden shrink-0`}
                >
                  <div
                    className={`absolute top-0 right-0 w-28 h-28 bg-linear-to-bl ${app.theme.glow} rounded-bl-full pointer-events-none opacity-80`}
                  />

                  <div className="flex items-center gap-3.5 min-w-0 relative z-10">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${app.theme.accentBg}`}
                    >
                      <app.icon size={20} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`font-serif italic text-xs font-semibold ${app.theme.text}`}
                        >
                          {app.category}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="font-sans text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {app.badge}
                        </span>
                      </div>

                      {renderAppTitle(app, "mobile")}
                    </div>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${app.theme.accentBg} group-hover:translate-x-0.5 transition-transform relative z-10 ml-2`}
                  >
                    <ArrowRight size={14} strokeWidth={2.2} />
                  </div>
                </div>
              ))}
            </div>

            {/* ======================================================== */}
            {/* 💻 DESKTOP VIEW: SLEEK LANDSCAPE-PROPORTIONED CARDS      */}
            {/* ======================================================== */}
            <div
              className={`hidden lg:grid gap-5 xl:gap-6 2xl:gap-7 mx-auto py-1 px-1 ${desktopGridClass}`}
            >
              {authorizedApps.map((app, idx) => (
                <div
                  key={`desk-${app.id}`}
                  role="button"
                  tabIndex={0}
                  onMouseEnter={() => setActiveId(app.id)}
                  onMouseLeave={() => setActiveId(null)}
                  onClick={() => navigate(app.path)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(app.path);
                    }
                  }}
                  className={`group relative flex flex-col justify-between p-4 xl:p-5 rounded-2xl bg-white dark:bg-slate-900/95 backdrop-blur-md ${app.theme.border} transition-all duration-300 ${app.theme.cardHover} cursor-pointer overflow-hidden shadow-xs hover:-translate-y-1 active:scale-[0.99] outline-none`}
                >
                  {/* Internal Glow */}
                  <div
                    className={`absolute top-0 right-0 w-36 h-36 bg-linear-to-bl ${app.theme.glow} rounded-bl-full pointer-events-none transition-opacity duration-300 opacity-65 group-hover:opacity-100`}
                  />

                  {/* Background Index Marker */}
                  <div className="absolute bottom-2.5 right-4 text-3xl xl:text-4xl font-serif italic leading-none pointer-events-none select-none text-slate-200/55 dark:text-slate-800/45 group-hover:text-slate-300/80 dark:group-hover:text-slate-700/60 transition-colors">
                    0{idx + 1}
                  </div>

                  {/* Top Header Row: Icon + Badge + Launch Arrow */}
                  <div className="relative z-10 flex items-center justify-between mb-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${app.theme.accentBg} group-hover:scale-105 transition-transform duration-200`}
                    >
                      <app.icon size={20} strokeWidth={2.2} />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-sans font-semibold tracking-wide ${app.theme.badgeBg}`}
                      >
                        <Zap size={11} />
                        {app.badge}
                      </span>

                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${app.theme.accentBg} ${app.theme.arrowHover}`}
                      >
                        <ArrowUpRight
                          size={15}
                          strokeWidth={2.4}
                          className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Main Body: Category, Single-Line Navbar Title & Description */}
                  <div className="relative z-10 text-left space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${app.theme.primary} opacity-90`}
                      />
                      <p
                        className={`font-serif italic text-xs font-semibold tracking-wide ${app.theme.text}`}
                      >
                        {app.category}
                      </p>
                    </div>

                    <div className="min-h-[28px] flex items-center">
                      {renderAppTitle(app, "desktop")}
                    </div>

                    <p className="font-sans text-xs xl:text-[13px] font-normal text-slate-600 dark:text-slate-300 leading-snug pt-0.5 line-clamp-2">
                      {app.description}
                    </p>
                  </div>

                  {/* Compact Bottom Micro-Pills */}
                  <div className="relative z-10 flex flex-wrap gap-1.5 pt-3">
                    {app.features.map((feat) => (
                      <span
                        key={feat}
                        className={`font-sans text-[10.5px] font-medium px-2 py-0.5 rounded ${app.theme.pillBg}`}
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AppPicker;