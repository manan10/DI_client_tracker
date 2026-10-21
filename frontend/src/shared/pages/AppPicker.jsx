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
    features: ["Client Folios", "Submissions", "Audit Registry"],
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
        "hover:shadow-[0_22px_45px_rgba(16,185,129,0.16)] dark:hover:shadow-[0_22px_45px_rgba(16,185,129,0.12)]",
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
    features: ["Daily Spending", "Category Breakdown", "Monthly History"],
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
        "hover:shadow-[0_22px_45px_rgba(99,102,241,0.16)] dark:hover:shadow-[0_22px_45px_rgba(99,102,241,0.12)]",
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
    title: "Show Rater",
    subtitle: "Personal Film & Series Vault",
    category: "Leisure",
    description:
      "Track, score out of 10, log rating revisions over time, and import your curated lists.",
    features: ["Rating Timeline", "Notes Importer", "Watchlist"],
    path: "/tv-rater",
    icon: Clapperboard,
    badge: "Leisure App",
    theme: {
      primary: "bg-rose-600 dark:bg-rose-500",
      text: "text-rose-800 dark:text-rose-300",
      accentBg:
        "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200/90 dark:border-rose-500/30",
      border:
        "border-2 border-rose-300/80 dark:border-rose-500/40 hover:border-rose-600 dark:hover:border-rose-400",
      cardHover:
        "hover:shadow-[0_22px_45px_rgba(244,63,94,0.16)] dark:hover:shadow-[0_22px_45px_rgba(244,63,94,0.12)]",
      badgeBg:
        "bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-300/90 dark:border-rose-500/30",
      pillBg:
        "bg-rose-50/90 dark:bg-rose-500/10 text-rose-900 dark:text-rose-200 border border-rose-200/90 dark:border-rose-500/25",
      glow: "from-rose-500/20 via-orange-500/10 to-transparent",
      btn: "bg-rose-700 hover:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-500 text-white shadow-rose-700/20 dark:shadow-rose-500/30",
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

  // Strict check: only render apps included in allowedApps, regardless of admin status
  const authorizedApps = useMemo(() => {
    const userPermissions = user?.allowedApps || [];
    return allApps.filter((app) => userPermissions.includes(app.id));
  }, [user]);

  const firstName = useMemo(() => {
    if (!user?.name) return "User";
    return user.name.trim().split(" ")[0];
  }, [user]);

  return (
    <div className="h-dvh w-screen bg-[#F8FAFC] dark:bg-[#060A14] text-slate-900 dark:text-slate-100 flex flex-col font-serif overflow-hidden relative selection:bg-emerald-800 selection:text-white transition-colors duration-300">
      {/* --- TOP FLOATING CONTROLS (SOFT TINTED GRADIENTS) --- */}
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
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10 min-h-0 py-4 sm:py-6 lg:py-8">
        {/* --- CLASSY BRANDING & WELCOME --- */}
        <div className="flex flex-col items-center text-center mb-5 sm:mb-7 lg:mb-9 shrink-0">
          <div className="mb-2.5 sm:mb-3 select-none transition-transform duration-300 hover:scale-105">
            <img
              src={Logo}
              alt="Dalal Central Logo"
              className="h-20 sm:h-22 lg:h-28 xl:h-32 w-auto object-contain drop-shadow-[0_8px_20px_rgba(16,185,129,0.22)] dark:drop-shadow-[0_10px_24px_rgba(16,185,129,0.3)]"
            />
          </div>

          <h1 className="text-5xl sm:text-4xl lg:text-7xl font-serif tracking-tight text-slate-900 dark:text-slate-100">
            Dalal{" "}
            <span className="italic font-normal text-emerald-800 dark:text-emerald-400">
              Central
            </span>
          </h1>

          <p className="font-serif text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 mt-2 sm:mt-3 max-w-xl leading-relaxed">
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
            {/* 📱 MOBILE VIEW: COMPACT ACTION PODS (< lg)              */}
            {/* ======================================================== */}
            <div className="flex lg:hidden flex-col gap-3 w-full max-w-md mx-auto overflow-y-auto no-scrollbar shrink">
              {authorizedApps.map((app) => (
                <div
                  key={`mob-${app.id}`}
                  onClick={() => navigate(app.path)}
                  className={`group relative flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900/90 ${app.theme.border} transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer overflow-hidden`}
                >
                  {/* Subtle Corner Glow */}
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-bl ${app.theme.glow} rounded-bl-full pointer-events-none opacity-80`}
                  />

                  <div className="flex items-center gap-3.5 min-w-0 relative z-10">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${app.theme.accentBg}`}
                    >
                      <app.icon size={22} strokeWidth={2.2} />
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
                      <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white tracking-tight truncate leading-tight">
                        {app.title}
                      </h3>
                      <p className="font-sans text-xs font-normal text-slate-600 dark:text-slate-300 truncate mt-0.5">
                        {app.subtitle}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${app.theme.accentBg} group-hover:translate-x-0.5 transition-transform relative z-10`}
                  >
                    <ArrowRight size={15} strokeWidth={2.2} />
                  </div>
                </div>
              ))}
            </div>

            {/* ======================================================== */}
            {/* 💻 DESKTOP VIEW: PROMINENT BORDER & GLOW GRID (>= lg)   */}
            {/* ======================================================== */}
            <div
              className={`hidden lg:grid gap-6 xl:gap-8 w-full max-w-6xl xl:max-w-7xl ${
                authorizedApps.length >= 3
                  ? "grid-cols-3"
                  : authorizedApps.length === 2
                  ? "grid-cols-2 max-w-4xl"
                  : "grid-cols-1 max-w-lg"
              }`}
            >
              {authorizedApps.map((app, idx) => (
                <div
                  key={`desk-${app.id}`}
                  onMouseEnter={() => setActiveId(app.id)}
                  onMouseLeave={() => setActiveId(null)}
                  onClick={() => navigate(app.path)}
                  className={`group relative flex flex-col justify-between p-7 xl:p-8 rounded-2xl bg-white dark:bg-slate-900/95 backdrop-blur-md ${app.theme.border} transition-all duration-300 ${app.theme.cardHover} cursor-pointer min-h-76 overflow-hidden shadow-xs hover:-translate-y-1`}
                >
                  {/* Internal Accent Glow */}
                  <div
                    className={`absolute top-0 right-0 w-48 h-48 bg-linear-to-bl ${app.theme.glow} rounded-bl-full pointer-events-none transition-opacity duration-500 opacity-60 group-hover:opacity-100`}
                  />

                  {/* Background Index Marker */}
                  <div className="absolute top-4 right-6 text-6xl font-serif italic leading-none pointer-events-none select-none text-slate-200/70 dark:text-slate-800/60 group-hover:text-slate-300/80 dark:group-hover:text-slate-700/70 transition-colors">
                    0{idx + 1}
                  </div>

                  {/* Card Top & Details */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-13 h-13 rounded-xl flex items-center justify-center ${app.theme.accentBg} group-hover:scale-105 transition-transform duration-300 shadow-2xs`}
                      >
                        <app.icon size={25} strokeWidth={2.2} />
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-sans font-semibold tracking-wide ${app.theme.badgeBg}`}
                      >
                        <Zap size={13} />
                        {app.badge}
                      </span>
                    </div>

                    <div className="text-left space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${app.theme.primary} opacity-90`}
                        />
                        <p
                          className={`font-serif italic text-xs font-semibold tracking-wide ${app.theme.text}`}
                        >
                          {app.subtitle}
                        </p>
                      </div>

                      <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-900 dark:group-hover:text-emerald-300 transition-colors">
                        {app.title}
                      </h3>

                      <p className="font-sans text-sm font-normal text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm pt-1 line-clamp-2">
                        {app.description}
                      </p>
                    </div>

                    {/* Feature Micro-Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-4">
                      {app.features.map((feat) => (
                        <span
                          key={feat}
                          className={`font-sans text-xs font-medium px-2.5 py-0.5 rounded ${app.theme.pillBg}`}
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer CTA Bar */}
                  <div className="relative z-10 pt-4 mt-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                    <span className="font-serif italic text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                      Open Application
                    </span>
                    <div
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-sans font-semibold transition-all duration-200 ${app.theme.btn} shadow-xs group-hover:shadow-md`}
                    >
                      <span>Open App</span>
                      <ArrowUpRight
                        size={15}
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