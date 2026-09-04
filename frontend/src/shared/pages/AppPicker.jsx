// src/pages/AppPicker.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  ArrowRight,
  ShieldCheck,
  Users,
  ReceiptIndianRupee,
  Sparkles,
  Zap,
  ArrowUpRight,
  Sun,
  Moon,
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
      text: "text-emerald-700 dark:text-emerald-400",
      accentBg:
        "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-500/20",
      border:
        "border-emerald-200/80 dark:border-emerald-500/20 hover:border-emerald-500/60 dark:hover:border-emerald-500/50",
      cardHover:
        "hover:shadow-[0_20px_40px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_20px_40px_rgba(16,185,129,0.08)]",
      badgeBg:
        "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-500/30",
      pillBg:
        "bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-100 dark:border-emerald-500/20",
      glow: "from-emerald-500/15 dark:from-emerald-500/20 via-teal-500/5 to-transparent",
      btn: "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-emerald-600/20 dark:shadow-emerald-500/30",
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
      text: "text-indigo-700 dark:text-indigo-400",
      accentBg:
        "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/80 dark:border-indigo-500/20",
      border:
        "border-indigo-200/80 dark:border-indigo-500/20 hover:border-indigo-500/60 dark:hover:border-indigo-500/50",
      cardHover:
        "hover:shadow-[0_20px_40px_rgba(99,102,241,0.12)] dark:hover:shadow-[0_20px_40px_rgba(99,102,241,0.08)]",
      badgeBg:
        "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-500/30",
      pillBg:
        "bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-100 dark:border-indigo-500/20",
      glow: "from-indigo-500/15 dark:from-indigo-500/20 via-blue-500/5 to-transparent",
      btn: "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-indigo-600/20 dark:shadow-indigo-500/30",
    },
  },
];

const AppPicker = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [_, setActiveId] = useState(null);

  // Theme state synced with local storage & document element
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

  const authorizedApps = useMemo(() => {
    const userPermissions = user?.allowedApps || [];
    return allApps.filter((app) => userPermissions.includes(app.id));
  }, [user]);

  const userInitials = useMemo(() => {
    if (!user?.name) return "DM";
    const parts = user.name.split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : user.name.slice(0, 2).toUpperCase();
  }, [user]);

  return (
    <div className="h-dvh w-screen bg-[#F8FAFC] dark:bg-[#060A14] text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-hidden relative selection:bg-emerald-600 selection:text-white transition-colors duration-300">
      {/* --- AMBIENT LUXURY LIGHTING EFFECTS --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft Radial Ambient Lights */}
        <div className="absolute -top-[25%] left-1/4 w-[55vw] h-[55vw] max-w-150 max-h-150 rounded-full bg-emerald-400/15 dark:bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-[25%] right-1/4 w-[55vw] h-[55vw] max-w-150 max-h-150 rounded-full bg-indigo-400/15 dark:bg-indigo-500/10 blur-[120px] pointer-events-none" />
        {/* Micro-dot SaaS Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[24px_24px] opacity-35 dark:opacity-30 mask-[radial-gradient(ellipse_70%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* --- TOP EXECUTIVE COMMAND BAR --- */}
      <header className="relative z-50 w-full px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center shrink-0 border-b border-slate-200/70 dark:border-white/10 bg-white/75 dark:bg-[#0B1120]/80 backdrop-blur-xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] dark:shadow-none transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-900 dark:bg-slate-800 shadow-sm flex items-center justify-center border border-slate-800 dark:border-slate-700">
            <img
              src={Logo}
              alt="Logo"
              className="h-5 sm:h-6 w-auto object-contain drop-shadow-[0_4px_12px_rgba(16,185,129,0.25)]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-[1000] text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                Dalal{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  Central
                </span>
              </h1>
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </div>
            </div>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
              Select an App
            </p>
          </div>
        </div>

        {/* User Pill, Theme Switcher & Sign Out Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all duration-200 shadow-2xs active:scale-95 cursor-pointer outline-none"
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun size={15} className="text-amber-400" />
            ) : (
              <Moon size={15} className="text-emerald-600" />
            )}
          </button>

          {/* User Profile Pill */}
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 dark:bg-white/3 border border-slate-200/80 dark:border-white/10 rounded-lg shadow-2xs">
            <div className="w-6 h-6 rounded bg-emerald-600 dark:bg-emerald-500 text-white font-black text-[10px] flex items-center justify-center">
              {userInitials}
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight leading-none truncate max-w-30">
                {user?.name || "User"}
              </p>
              <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {user?.role || "Admin"}
              </p>
            </div>
          </div>

          {/* Sign Out Action */}
          <button
            onClick={logout}
            className="group flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-white/10 hover:border-rose-200 dark:hover:border-rose-500/30 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 shadow-2xs outline-none active:scale-95 cursor-pointer"
            title="Sign Out"
          >
            <LogOut
              size={13}
              className="transition-transform group-hover:-translate-x-0.5 text-slate-400 dark:text-slate-500 group-hover:text-rose-600 dark:group-hover:text-rose-400"
            />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* --- CENTRAL PORTAL WORKSPACE (Strict Zero Scroll) --- */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 sm:px-6 relative z-10 min-h-0 py-2 sm:py-6">
        {/* Header Hero Capsule */}
        <div className="text-center space-y-1 sm:space-y-2 mb-4 sm:mb-8 shrink-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shadow-2xs backdrop-blur-md">
            <Sparkles
              size={12}
              className="text-emerald-600 dark:text-emerald-400 animate-spin"
              style={{ animationDuration: "6s" }}
            />
            <span>Choose App</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight">
            Select Your{" "}
            <span className="bg-linear-to-r from-emerald-600 via-teal-500 to-indigo-600 dark:from-emerald-400 dark:via-teal-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Workspace
            </span>
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden sm:block">
            Click on an application below to start
          </p>
        </div>

        {/* ======================================================== */}
        {/* 📱 MOBILE VIEW: COMPACT ACTION PODS (< lg)              */}
        {/* ======================================================== */}
        <div className="flex lg:hidden flex-col gap-3 w-full max-w-md mx-auto overflow-y-auto no-scrollbar shrink">
          {authorizedApps.map((app) => (
            <div
              key={`mob-${app.id}`}
              onClick={() => navigate(app.path)}
              className={`group relative flex items-center justify-between p-4 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border ${app.theme.border} transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer overflow-hidden`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${app.theme.accentBg}`}
                >
                  <app.icon size={22} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`text-[8px] font-black uppercase tracking-widest ${app.theme.text}`}
                    >
                      {app.category}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {app.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-[1000] text-slate-900 dark:text-white uppercase tracking-tight truncate leading-tight">
                    {app.title}
                  </h3>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate mt-0.5">
                    {app.subtitle}
                  </p>
                </div>
              </div>

              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${app.theme.accentBg} group-hover:translate-x-0.5 transition-transform`}
              >
                <ArrowRight size={15} strokeWidth={2.5} />
              </div>
            </div>
          ))}
        </div>

        {/* ======================================================== */}
        {/* 💻 DESKTOP VIEW: LUXURY FINTECH HUBS (>= lg)             */}
        {/* ======================================================== */}
        <div className="hidden lg:grid grid-cols-2 gap-7 w-full max-w-5xl">
          {authorizedApps.map((app, idx) => (
            <div
              key={`desk-${app.id}`}
              onMouseEnter={() => setActiveId(app.id)}
              onMouseLeave={() => setActiveId(null)}
              onClick={() => navigate(app.path)}
              className={`group relative flex flex-col justify-between p-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border ${app.theme.border} transition-all duration-300 ${app.theme.cardHover} cursor-pointer min-h-80 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none`}
            >
              {/* Internal Accent Glow */}
              <div
                className={`absolute top-0 right-0 w-48 h-48 bg-linear-to-bl ${app.theme.glow} rounded-bl-full pointer-events-none transition-opacity duration-500 opacity-60 group-hover:opacity-100`}
              />

              {/* Background Index Marker */}
              <div className="absolute top-4 right-6 text-6xl font-[1000] italic leading-none pointer-events-none select-none text-slate-100 dark:text-slate-800/60 group-hover:text-slate-200/80 dark:group-hover:text-slate-700/60 transition-colors">
                0{idx + 1}
              </div>

              {/* Card Top & Details */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center border ${app.theme.accentBg} group-hover:scale-105 transition-transform duration-300 shadow-2xs`}
                  >
                    <app.icon size={26} strokeWidth={2.5} />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border shadow-2xs ${app.theme.badgeBg}`}
                  >
                    <Zap size={11} />
                    {app.badge}
                  </span>
                </div>

                <div className="text-left space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${app.theme.primary} animate-pulse`}
                    />
                    <p
                      className={`text-[10px] font-black uppercase tracking-[0.2em] ${app.theme.text}`}
                    >
                      {app.category} • {app.subtitle}
                    </p>
                  </div>
                  <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-slate-950 dark:group-hover:text-emerald-300 transition-colors">
                    {app.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm pt-1">
                    {app.description}
                  </p>
                </div>

                {/* Feature Micro-Pills */}
                <div className="flex flex-wrap gap-1.5 pt-4">
                  {app.features.map((feat) => (
                    <span
                      key={feat}
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${app.theme.pillBg}`}
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer CTA Bar */}
              <div className="relative z-10 pt-5 mt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                  Open Application
                </span>
                <div
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-[1000] uppercase tracking-wider transition-all duration-200 ${app.theme.btn} shadow-sm group-hover:shadow-md`}
                >
                  <span>Open App</span>
                  <ArrowUpRight
                    size={14}
                    strokeWidth={3}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- SYSTEM FOOTER --- */}
      <footer className="relative z-50 w-full px-4 sm:px-8 py-2.5 sm:py-3 flex justify-between items-center shrink-0 border-t border-slate-200/70 dark:border-white/10 bg-white/75 dark:bg-[#0B1120]/80 backdrop-blur-xl text-slate-500 dark:text-slate-400 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <ShieldCheck
            size={14}
            className="text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
            Secure Encrypted Session
          </span>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <span>Logged in as:</span>
          <span className="text-slate-700 dark:text-slate-200 font-black">
            {user?.name || "User"}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default AppPicker;
