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
      // Crisp Architectural Slate + Sky Blue
      cardBg:
        "bg-[#F0F7FF] dark:bg-[#1E2738] dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)]",
      primary: "bg-sky-600 dark:bg-sky-400",
      text: "text-sky-700 dark:text-sky-300",
      descText: "text-slate-600 dark:text-slate-300",
      indexText:
        "text-sky-900/[0.06] dark:text-sky-300/[0.07] group-hover:text-sky-600/[0.12] dark:group-hover:text-sky-300/[0.14]",
      accentBg:
        "bg-sky-600/10 dark:bg-sky-400/15 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-400/35",
      border:
        "border-2 border-sky-300 dark:border-sky-500/40 hover:border-sky-600 dark:hover:border-sky-400",
      cardHover:
        "hover:shadow-[0_18px_40px_rgba(2,132,199,0.16)] dark:hover:shadow-[0_18px_40px_rgba(56,189,248,0.14)]",
      badgeBg:
        "bg-white/90 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300/90 dark:border-sky-400/35",
      pillBg:
        "bg-white/85 dark:bg-sky-950/70 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-500/30",
      arrowHover:
        "group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600 dark:group-hover:bg-sky-400 dark:group-hover:text-slate-950 dark:group-hover:border-sky-400",
    },
  },
  {
    id: "EXPENSE_TRACKER",
    title: "Kha₹cha Paani",
    subtitle: "Household & Daily Accounts",
    category: "Household",
    description:
      "Cash reserves, active accounts, and monthly household spending in one editorial ledger.",
    features: ["Wallets", "Categories", "Ledger"],
    path: "/expenses",
    icon: ReceiptIndianRupee,
    badge: "Expense Tracker",
    theme: {
      // Warm Parchment Ledger + Sage Emerald
      cardBg:
        "bg-[#F3F5EE] dark:bg-[#212622] dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)]",
      primary: "bg-emerald-700 dark:bg-[#4EA885]",
      text: "text-emerald-800 dark:text-[#68C19D]",
      descText: "text-stone-700 dark:text-stone-300",
      indexText:
        "text-stone-900/[0.06] dark:text-emerald-200/[0.06] group-hover:text-emerald-800/[0.13] dark:group-hover:text-[#4EA885]/[0.15]",
      accentBg:
        "bg-emerald-700/10 dark:bg-[#4EA885]/15 text-emerald-800 dark:text-[#68C19D] border border-emerald-700/25 dark:border-[#4EA885]/35",
      border:
        "border-2 border-stone-300 dark:border-[#2E3530] hover:border-emerald-700 dark:hover:border-[#4EA885]",
      cardHover:
        "hover:shadow-[0_18px_40px_rgba(4,120,87,0.14)] dark:hover:shadow-[0_18px_40px_rgba(78,168,133,0.14)]",
      badgeBg:
        "bg-[#FAF9F6] dark:bg-[#222724] text-emerald-800 dark:text-[#86D4B4] border border-emerald-700/25 dark:border-[#4EA885]/35",
      pillBg:
        "bg-[#FAF9F6] dark:bg-[#222724] text-stone-800 dark:text-stone-200 border border-stone-300/90 dark:border-white/10",
      arrowHover:
        "group-hover:bg-emerald-700 group-hover:text-white group-hover:border-emerald-700 dark:group-hover:bg-[#4EA885] dark:group-hover:text-[#121315] dark:group-hover:border-[#4EA885]",
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
      // Screening-Room Cinema Surface + Electric Rose/Pink
      cardBg:
        "bg-[#FDF2F8] dark:bg-[#1E222E] dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)]",
      primary: "bg-pink-600 dark:bg-pink-400",
      text: "text-pink-700 dark:text-pink-400",
      descText: "text-slate-700 dark:text-stone-300",
      indexText:
        "text-pink-600/[0.08] dark:text-pink-400/[0.09] group-hover:text-pink-600/[0.16] dark:group-hover:text-pink-400/[0.18]",
      accentBg:
        "bg-pink-500/10 dark:bg-[#1C2230] text-pink-600 dark:text-pink-400 border border-pink-300 dark:border-[#2E384D]",
      border:
        "border-2 border-pink-300 dark:border-[#2A3346] hover:border-pink-600 dark:hover:border-pink-400",
      cardHover:
        "hover:shadow-[0_18px_40px_rgba(236,72,153,0.16)] dark:hover:shadow-[0_18px_40px_rgba(236,72,153,0.16)]",
      badgeBg:
        "bg-white/90 dark:bg-[#1C2230] text-pink-700 dark:text-pink-400 border border-pink-200 dark:border-[#2E384D]",
      pillBg:
        "bg-white/90 dark:bg-[#1C2230] text-pink-950 dark:text-stone-200 border border-pink-200 dark:border-[#2E384D]",
      arrowHover:
        "group-hover:bg-pink-600 group-hover:text-white group-hover:border-pink-600 dark:group-hover:bg-pink-500 dark:group-hover:text-white dark:group-hover:border-pink-500",
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
      // Warm Saffron / Shahi Rasoi Amber
      cardBg:
        "bg-[#FFF9EB] dark:bg-[#28221A] dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)]",
      primary: "bg-amber-600 dark:bg-amber-400",
      text: "text-amber-800 dark:text-amber-300",
      descText: "text-stone-700 dark:text-amber-100/75",
      indexText:
        "text-amber-700/[0.08] dark:text-amber-400/[0.08] group-hover:text-amber-700/[0.15] dark:group-hover:text-amber-400/[0.16]",
      accentBg:
        "bg-amber-500/12 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/35",
      border:
        "border-2 border-amber-300 dark:border-amber-500/40 hover:border-amber-600 dark:hover:border-amber-400",
      cardHover:
        "hover:shadow-[0_18px_40px_rgba(217,119,6,0.17)] dark:hover:shadow-[0_18px_40px_rgba(245,158,11,0.15)]",
      badgeBg:
        "bg-white/90 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/35",
      pillBg:
        "bg-white/90 dark:bg-amber-950/60 text-amber-950 dark:text-amber-100 border border-amber-200 dark:border-amber-500/30",
      arrowHover:
        "group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 dark:group-hover:bg-amber-400 dark:group-hover:text-slate-950 dark:group-hover:border-amber-400",
    },
  },
];

// Single-line Navbar Title Lockups tailored to each app's native typography
const renderAppTitle = (app, variant = "desktop") => {
  const isMobile = variant === "mobile";

  switch (app.id) {
    case "CLIENT_TRACKER":
      return (
        <div
          style={{ fontFamily: "'Sora', sans-serif" }}
          className="flex items-center gap-1.5 flex-nowrap select-none min-w-0"
        >
          <span
            className={`font-bold tracking-tight text-slate-900 dark:text-white leading-none truncate ${
              isMobile ? "text-[15px]" : "text-lg xl:text-[19px]"
            }`}
          >
            Dalal Investments
          </span>

          <div className="relative px-1.5 py-0.5 flex items-center gap-1 bg-sky-500/10 dark:bg-sky-400/15 shrink-0">
            <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-sky-600 dark:border-sky-400" />
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-sky-600 dark:border-sky-400" />
            <span className="w-1 h-1 rounded-full bg-sky-600 dark:bg-sky-400" />
            <span className="font-bold text-[9.5px] xl:text-[10.5px] tracking-wide text-sky-700 dark:text-sky-300">
              Co-Pilot
            </span>
          </div>
        </div>
      );

    case "EXPENSE_TRACKER":
      return (
        <div
          style={{ fontFamily: "'Lora', serif" }}
          className="flex items-baseline leading-none select-none font-bold tracking-tight"
        >
          <span
            className={`inline-flex items-baseline text-stone-950 dark:text-stone-50 ${
              isMobile ? "text-[17px]" : "text-xl xl:text-2xl"
            }`}
          >
            <span>Kha</span>
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className={`font-bold text-emerald-700 dark:text-[#68C19D] mx-[1px] ${
                isMobile ? "text-[15px]" : "text-lg xl:text-xl"
              }`}
            >
              ₹
            </span>
            <span>cha</span>
          </span>
          <span
            className={`ml-1.5 text-emerald-700 dark:text-[#68C19D] ${
              isMobile ? "text-[17px]" : "text-xl xl:text-2xl"
            }`}
          >
            Paani
          </span>
        </div>
      );

    case "SHOW_RATER":
      return (
        <div className="flex items-center gap-2 select-none">
          <div
            style={{ fontFamily: "'Bungee', sans-serif" }}
            className={`flex items-baseline leading-none font-normal tracking-[0.02em] ${
              isMobile ? "text-[17px]" : "text-xl xl:text-[23px]"
            }`}
          >
            <span className="text-slate-950 dark:text-white">plot</span>
            <span className="text-pink-600 dark:text-pink-400">twist</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 pb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
          </div>
        </div>
      );

    case "SOUS_CHEF":
      return (
        <div
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="flex items-center gap-1.5 leading-none select-none"
        >
          <span
            className={`font-bold tracking-[0.08em] uppercase bg-gradient-to-r from-amber-800 via-amber-600 to-amber-700 dark:from-amber-100 dark:via-amber-300 dark:to-amber-500 bg-clip-text text-transparent ${
              isMobile ? "text-[16px]" : "text-xl xl:text-[22px]"
            }`}
          >
            SOUS CHEF
          </span>
          <span className="text-amber-600 dark:text-amber-400 text-xs">✦</span>
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

  // Load app-authentic fonts:
  // - Sora (Dalal Investments Co-Pilot)
  // - Lora, Nunito Sans & IBM Plex Mono (Kha₹cha Paani)
  // - Bungee, Space Grotesk & Space Mono (plot twist)
  // - Playfair Display & Plus Jakarta Sans (Sous Chef)
  useEffect(() => {
    const fonts = [
      {
        id: "dalal-copilot-sora-font",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&display=swap",
      },
      {
        id: "plottwist-locked-fonts",
        href: "https://fonts.googleapis.com/css2?family=Bungee&family=Space+Grotesk:wght@600;700&family=Space+Mono:wght@400;700&display=swap",
      },
      {
        id: "kharcha-paani-sage-fonts",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600;700&family=Lora:wght@600;700&family=Nunito+Sans:wght@400;500;600;700&display=swap",
      },
      {
        id: "sous-chef-culinary-fonts",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
    ];

    fonts.forEach(({ id, href }) => {
      const existing = document.getElementById(id);
      if (!existing) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      } else if (existing.href !== href) {
        existing.href = href;
      }
    });
  }, []);

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

  // App-authentic font family & corner geometry helper
  const getAppStyleMeta = (appId) => {
    switch (appId) {
      case "CLIENT_TRACKER":
        return {
          fontStyle: { fontFamily: "'Sora', sans-serif" },
          radiusDesktop: "rounded-xl",
          radiusMobile: "rounded-lg",
          metaClass: "font-semibold uppercase tracking-wider text-[10px]",
          descClass: "font-normal text-xs xl:text-[13px]",
          pillClass: "font-medium text-[10.5px] px-2 py-0.5 rounded-md",
        };
      case "EXPENSE_TRACKER":
        return {
          fontStyle: { fontFamily: "'Nunito Sans', sans-serif" },
          radiusDesktop: "rounded-2xl",
          radiusMobile: "rounded-xl",
          metaClass: "font-bold uppercase tracking-[0.14em] text-[10px]",
          descClass: "font-normal text-xs xl:text-[13px]",
          pillClass: "font-semibold text-[10.5px] px-2 py-0.5 rounded-md",
        };
      case "SHOW_RATER":
        return {
          fontStyle: {
            "--font-sans": "'Space Grotesk', sans-serif",
            "--font-mono": "'Space Mono', monospace",
            fontFamily: "'Space Grotesk', sans-serif",
          },
          radiusDesktop: "rounded-lg",
          radiusMobile: "rounded-lg",
          metaClass: "font-mono font-bold uppercase tracking-wider text-[10px]",
          descClass: "font-mono font-normal text-[11px] xl:text-xs",
          pillClass:
            "font-mono font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-sm",
        };
      case "SOUS_CHEF":
      default:
        return {
          fontStyle: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
          radiusDesktop: "rounded-2xl",
          radiusMobile: "rounded-xl",
          metaClass: "font-semibold uppercase tracking-[0.12em] text-[10px]",
          descClass: "font-normal text-xs xl:text-[13px]",
          pillClass: "font-semibold text-[10.5px] px-2.5 py-0.5 rounded-full",
        };
    }
  };

  return (
    <div className="h-dvh w-screen bg-[#F5F2EB] dark:bg-[#191C22] text-slate-900 dark:text-slate-100 flex flex-col font-serif overflow-hidden relative selection:bg-emerald-800 selection:text-white transition-colors duration-300">
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
        {/* --- WIDE ARCHITECTURAL BRANDING & PRIVATE DESK COORDINATE GREETING --- */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8 lg:mb-11 shrink-0 w-full">
          <div className="mb-2.5 sm:mb-3.5 select-none transition-transform duration-300 hover:scale-105">
            <img
              src={Logo}
              alt="Dalal Studio Logo"
              className="h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32 2xl:h-36 w-auto object-contain"
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
          <div className="p-8 text-center bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-white/20 rounded-2xl shadow-sm max-w-md mx-auto">
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
            {/* 📱 MOBILE VIEW: SOLID APP-STYLED ACTION PODS (< lg)       */}
            {/* ======================================================== */}
            <div className="flex lg:hidden flex-col gap-2.5 w-full max-w-md mx-auto overflow-y-auto no-scrollbar max-h-[54dvh] py-1 px-1">
              {authorizedApps.map((app) => {
                const meta = getAppStyleMeta(app.id);
                return (
                  <div
                    key={`mob-${app.id}`}
                    onClick={() => navigate(app.path)}
                    style={meta.fontStyle}
                    className={`group relative flex items-center justify-between p-3.5 ${meta.radiusMobile} ${app.theme.cardBg} ${app.theme.border} transition-all duration-200 active:scale-[0.98] shadow-xs hover:shadow-md cursor-pointer overflow-hidden shrink-0`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 relative z-10">
                      <div
                        className={`w-11 h-11 ${meta.radiusMobile} flex items-center justify-center shrink-0 ${app.theme.accentBg}`}
                      >
                        <app.icon size={20} strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`${meta.metaClass} ${app.theme.text}`}>
                            {app.category}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-400/50 dark:bg-slate-600" />
                          <span className="text-[10.5px] font-semibold text-slate-500 dark:text-stone-400">
                            {app.badge}
                          </span>
                        </div>

                        {renderAppTitle(app, "mobile")}
                      </div>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${app.theme.accentBg} ${app.theme.arrowHover} group-hover:translate-x-0.5 transition-all relative z-10 ml-2`}
                    >
                      <ArrowRight size={14} strokeWidth={2.2} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ======================================================== */}
            {/* 💻 DESKTOP VIEW: SOLID APP-AUTHENTIC CARDS               */}
            {/* ======================================================== */}
            <div
              className={`hidden lg:grid gap-5 xl:gap-6 2xl:gap-7 mx-auto py-1 px-1 ${desktopGridClass}`}
            >
              {authorizedApps.map((app, idx) => {
                const meta = getAppStyleMeta(app.id);
                const isKharchaPaani = app.id === "EXPENSE_TRACKER";

                return (
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
                    style={meta.fontStyle}
                    className={`group relative flex flex-col justify-between p-4 xl:p-5 ${meta.radiusDesktop} ${app.theme.cardBg} ${app.theme.border} transition-all duration-300 ${app.theme.cardHover} cursor-pointer overflow-hidden shadow-xs hover:-translate-y-1 active:scale-[0.99] outline-none`}
                  >
                    {/* Solid Top Accent Datum Bar */}
                    <div
                      className={`absolute top-0 inset-x-0 h-[3px] ${app.theme.primary} opacity-80 group-hover:opacity-100 transition-opacity`}
                    />

                    {/* Background Index Marker */}
                    <div
                      style={
                        isKharchaPaani
                          ? { fontFamily: "'IBM Plex Mono', monospace" }
                          : undefined
                      }
                      className={`absolute bottom-2.5 right-4 text-3xl xl:text-4xl font-bold leading-none pointer-events-none select-none transition-colors ${app.theme.indexText}`}
                    >
                      0{idx + 1}
                    </div>

                    {/* Top Header Row: Icon + Badge + Launch Arrow */}
                    <div className="relative z-10 flex items-center justify-between mb-2.5 pt-0.5">
                      <div
                        className={`w-10 h-10 ${meta.radiusMobile} flex items-center justify-center ${app.theme.accentBg} group-hover:scale-105 transition-transform duration-200`}
                      >
                        <app.icon size={20} strokeWidth={2.2} />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${meta.metaClass} ${app.theme.badgeBg}`}
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
                          className={`w-1.5 h-1.5 rounded-full ${app.theme.primary}`}
                        />
                        <p className={`${meta.metaClass} ${app.theme.text}`}>
                          {app.category}
                        </p>
                      </div>

                      <div className="min-h-[28px] flex items-center">
                        {renderAppTitle(app, "desktop")}
                      </div>

                      <p
                        className={`${meta.descClass} ${app.theme.descText} leading-snug pt-0.5 line-clamp-2`}
                      >
                        {app.description}
                      </p>
                    </div>

                    {/* Solid Bottom Micro-Pills */}
                    <div className="relative z-10 flex flex-wrap gap-1.5 pt-3">
                      {app.features.map((feat) => (
                        <span
                          key={feat}
                          style={
                            isKharchaPaani
                              ? { fontFamily: "'IBM Plex Mono', monospace" }
                              : undefined
                          }
                          className={`${meta.pillClass} ${app.theme.pillBg}`}
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AppPicker;