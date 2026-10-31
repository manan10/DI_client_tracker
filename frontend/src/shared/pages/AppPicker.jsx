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
    title: "Client Tracker",
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
        "hover:shadow-[0_20px_45px_rgba(16,185,129,0.16)] dark:hover:shadow-[0_20px_45px_rgba(16,185,129,0.12)]",
      badgeBg:
        "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-300/90 dark:border-emerald-500/30",
      pillBg:
        "bg-emerald-50/90 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 border border-emerald-200/90 dark:border-emerald-500/25",
      glow: "from-emerald-500/20 via-teal-500/10 to-transparent",
      btn: "bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-emerald-700/20 dark:shadow-emerald-500/30",
    },
  },
  {
    id: "EXPENSE_TRACKER",
    title: "Expense Logger",
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
        "hover:shadow-[0_20px_45px_rgba(99,102,241,0.16)] dark:hover:shadow-[0_20px_45px_rgba(99,102,241,0.12)]",
      badgeBg:
        "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border border-indigo-300/90 dark:border-indigo-500/30",
      pillBg:
        "bg-indigo-50/90 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-200 border border-indigo-200/90 dark:border-indigo-500/25",
      glow: "from-indigo-500/20 via-blue-500/10 to-transparent",
      btn: "bg-indigo-700 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-indigo-700/20 dark:shadow-indigo-500/30",
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
        "hover:shadow-[0_20px_45px_rgba(64,188,244,0.18)] dark:hover:shadow-[0_20px_45px_rgba(64,188,244,0.14)]",
      badgeBg:
        "bg-sky-50 dark:bg-[#1F242B] text-sky-800 dark:text-stone-300 border border-sky-200 dark:border-[#2C3440]",
      pillBg:
        "bg-sky-50/90 dark:bg-[#14181C] text-sky-900 dark:text-stone-300 border border-sky-200/90 dark:border-[#2C3440]",
      glow: "from-[#40bcf4]/20 via-[#00e054]/10 to-transparent",
      btn: "bg-[#00e054] hover:bg-[#00c94b] text-[#14181C] font-bold shadow-[0_2px_12px_rgba(0,224,84,0.3)]",
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
        "hover:shadow-[0_20px_45px_rgba(217,119,6,0.18)] dark:hover:shadow-[0_20px_45px_rgba(217,119,6,0.14)]",
      badgeBg:
        "bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-300/90 dark:border-amber-500/30",
      pillBg:
        "bg-amber-50/90 dark:bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-200/90 dark:border-amber-500/25",
      glow: "from-amber-500/20 via-orange-500/10 to-transparent",
      btn: "bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white shadow-amber-600/20 dark:shadow-amber-500/30",
    },
  },
];

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

  // Adaptive Desktop Grid
  const desktopGridClass = useMemo(() => {
    const count = authorizedApps.length;
    if (count === 1) return "grid-cols-1 max-w-sm";
    if (count === 2) return "grid-cols-2 max-w-2xl";
    if (count === 3) return "grid-cols-3 max-w-5xl";
    return "grid-cols-2 lg:grid-cols-4 max-w-6xl xl:max-w-7xl";
  }, [authorizedApps.length]);

  return (
    <div className="h-dvh w-screen bg-[#F8FAFC] dark:bg-[#060A14] text-slate-900 dark:text-slate-100 flex flex-col font-serif overflow-hidden relative selection:bg-emerald-800 selection:text-white transition-colors duration-300">
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
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 min-h-0 py-3 sm:py-5 lg:py-7">
        
        {/* --- PROMINENT BRANDING & WELCOME (SCALED UP FOR DESKTOP) --- */}
        <div className="flex flex-col items-center text-center mb-4 sm:mb-6 lg:mb-8 shrink-0">
          <div className="mb-2 sm:mb-3 select-none transition-transform duration-300 hover:scale-105">
            <img
              src={Logo}
              alt="Dalal Central Logo"
              className="h-16 sm:h-20 md:h-24 lg:h-28 xl:h-36 2xl:h-40 w-auto object-contain drop-shadow-[0_10px_24px_rgba(16,185,129,0.22)] dark:drop-shadow-[0_12px_28px_rgba(16,185,129,0.3)]"
            />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif tracking-tight text-slate-900 dark:text-slate-100 leading-none">
            Dalal{" "}
            <span className="italic font-normal text-emerald-800 dark:text-emerald-400">
              Central
            </span>
          </h1>

          <p className="font-serif text-sm sm:text-base lg:text-lg xl:text-xl text-slate-600 dark:text-slate-300 mt-2 sm:mt-3 max-w-2xl leading-relaxed">
            Hello,{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {firstName}
            </span>
            . Welcome to{" "}
            <span className="italic font-normal text-emerald-800 dark:text-emerald-400">
              Dalal Central
            </span>
            . Choose your application below.
          </p>
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
            <div className="flex lg:hidden flex-col gap-2.5 w-full max-w-md mx-auto overflow-y-auto no-scrollbar max-h-[52dvh] py-1 px-1">
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

                      {app.id === "SHOW_RATER" ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-baseline leading-none">
                            <span className="text-[18px] font-[1000] tracking-[-0.03em] text-slate-900 dark:text-white font-sans">
                              plot
                            </span>
                            <span className="text-[18px] font-[1000] tracking-[-0.03em] text-[#40bcf4] font-sans">
                              twist
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 pb-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff8000]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00e054]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#40bcf4]" />
                          </div>
                        </div>
                      ) : (
                        <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white tracking-tight truncate leading-tight">
                          {app.title}
                        </h3>
                      )}

                      <p className="font-sans text-xs font-normal text-slate-600 dark:text-slate-300 truncate mt-0.5">
                        {app.subtitle}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${app.theme.accentBg} group-hover:translate-x-0.5 transition-transform relative z-10`}
                  >
                    <ArrowRight size={14} strokeWidth={2.2} />
                  </div>
                </div>
              ))}
            </div>

            {/* ======================================================== */}
            {/* 💻 DESKTOP VIEW: PROPORTIONATE RESPONSIVE CARDS (>= lg)  */}
            {/* ======================================================== */}
            <div
              className={`hidden lg:grid gap-5 xl:gap-6 2xl:gap-7 w-full mx-auto py-1 px-1 ${desktopGridClass}`}
            >
              {authorizedApps.map((app, idx) => (
                <div
                  key={`desk-${app.id}`}
                  onMouseEnter={() => setActiveId(app.id)}
                  onMouseLeave={() => setActiveId(null)}
                  onClick={() => navigate(app.path)}
                  className={`group relative flex flex-col justify-between p-5 xl:p-6 2xl:p-7 rounded-2xl bg-white dark:bg-slate-900/95 backdrop-blur-md ${app.theme.border} transition-all duration-300 ${app.theme.cardHover} cursor-pointer overflow-hidden shadow-xs hover:-translate-y-1`}
                >
                  {/* Internal Glow */}
                  <div
                    className={`absolute top-0 right-0 w-36 h-36 bg-linear-to-bl ${app.theme.glow} rounded-bl-full pointer-events-none transition-opacity duration-300 opacity-60 group-hover:opacity-100`}
                  />

                  {/* Background Index Marker */}
                  <div className="absolute top-3 right-5 text-4xl xl:text-5xl font-serif italic leading-none pointer-events-none select-none text-slate-200/60 dark:text-slate-800/50 group-hover:text-slate-300/80 dark:group-hover:text-slate-700/60 transition-colors">
                    0{idx + 1}
                  </div>

                  {/* Top Header & App Category */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3.5">
                      <div
                        className={`w-11 h-11 xl:w-12 xl:h-12 rounded-xl flex items-center justify-center ${app.theme.accentBg} group-hover:scale-105 transition-transform duration-200`}
                      >
                        <app.icon size={22} strokeWidth={2.2} />
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-sans font-semibold tracking-wide ${app.theme.badgeBg}`}
                      >
                        <Zap size={12} />
                        {app.badge}
                      </span>
                    </div>

                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${app.theme.primary} opacity-90`}
                        />
                        <p
                          className={`font-serif italic text-xs font-semibold tracking-wide ${app.theme.text}`}
                        >
                          {app.subtitle}
                        </p>
                      </div>

                      {/* Title Lockup */}
                      {app.id === "SHOW_RATER" ? (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <div className="flex items-baseline leading-none">
                            <span className="text-2xl xl:text-3xl font-[1000] tracking-[-0.03em] text-slate-900 dark:text-white font-sans">
                              plot
                            </span>
                            <span className="text-2xl xl:text-3xl font-[1000] tracking-[-0.03em] text-[#40bcf4] font-sans">
                              twist
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 pb-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff8000]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00e054]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#40bcf4]" />
                          </div>
                        </div>
                      ) : (
                        <h3 className="text-xl xl:text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                          {app.title}
                        </h3>
                      )}

                      <p className="font-sans text-xs xl:text-sm font-normal text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5 line-clamp-2">
                        {app.description}
                      </p>
                    </div>

                    {/* Micro-Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-3.5">
                      {app.features.map((feat) => (
                        <span
                          key={feat}
                          className={`font-sans text-[11px] font-medium px-2.5 py-0.5 rounded ${app.theme.pillBg}`}
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer CTA */}
                  <div className="relative z-10 pt-3.5 mt-4 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between">
                    <span className="font-serif italic text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                      Open Application
                    </span>
                    <div
                      className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-sans font-semibold transition-all duration-200 ${app.theme.btn} shadow-xs group-hover:shadow-sm`}
                    >
                      <span>Open App</span>
                      <ArrowUpRight
                        size={14}
                        strokeWidth={2.4}
                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>
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