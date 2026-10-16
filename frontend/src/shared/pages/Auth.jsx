// src/pages/Auth.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Sun, Moon, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";
import Logo from "../../assets/logo_nobrand.png";
import { browserSupportsWebAuthn } from "@simplewebauthn/browser";
import AuthForm from "../components/Auth/AuthForm";

const Auth = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  // Theme Management aligned with AppPicker & LocalStorage
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.theme === "dark" ||
      localStorage.getItem("app-theme") === "dark" ||
      (!("theme" in localStorage) &&
        !("app-theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  const toggleTheme = () => setIsDark((prev) => !prev);

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

  const { login } = useAuth();
  const { request } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    setIsBiometricSupported(browserSupportsWebAuthn());

    let isMounted = true;
    const fetchUsers = async () => {
      try {
        const data = await request("/users", "GET");
        if (isMounted && data) {
          setUsers(data);
        }
      } catch (err) {
        console.error("User list error:", err);
      } finally {
        if (isMounted) setLoadingUsers(false);
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, [request]);

  const handleNavigation = useCallback(
    (apps = []) => {
      if (apps.length === 1 && apps.includes("EXPENSE_TRACKER")) {
        navigate("/expenses");
      } else if (apps.length === 1 && apps.includes("CLIENT_TRACKER")) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    },
    [navigate]
  );

  const handlePasswordLogin = async (formData) => {
    try {
      const data = await request("/auth/login", "POST", {
        username: formData.username,
        password: formData.password,
      });

      if (data && data.token) {
        login(data.user, data.token);
        handleNavigation(data.user?.allowedApps || []);
      }
    } catch (err) {
      console.error("Password login failed:", err);
    }
  };

  const handleBiometricSuccess = (verificationRes) => {
    if (verificationRes && verificationRes.token) {
      login(verificationRes.user, verificationRes.token);
      handleNavigation(verificationRes.user?.allowedApps || []);
    }
  };

  return (
    <div className="h-[100dvh] w-screen bg-[#FDFBF7] dark:bg-[#080C16] text-slate-900 dark:text-slate-100 flex flex-col font-serif overflow-hidden relative selection:bg-indigo-600 selection:text-white transition-colors duration-300">
      
      {/* ========================================================================= */}
      {/* 1. ARTISTIC INVESTMENT & FINANCIAL GEOMETRIC VECTOR BACKDROP             */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <svg
          className="w-full h-full opacity-[0.24] dark:opacity-[0.16] stroke-slate-500 dark:stroke-indigo-300"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="fin-coord-grid"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="4 6"
              />
              <circle cx="0" cy="0" r="1.5" fill="currentColor" />
            </pattern>
          </defs>

          {/* Coordinate financial graph mesh */}
          <rect width="100%" height="100%" fill="url(#fin-coord-grid)" />

          {/* Upward Compounding Yield Curve (Geometric vector) */}
          <path
            d="M 0 520 C 300 510, 500 460, 750 330 C 950 220, 1150 160, 1500 40"
            fill="none"
            strokeWidth="1.4"
            className="stroke-indigo-600/70 dark:stroke-indigo-400/60"
          />
          <path
            d="M 0 560 C 350 550, 600 490, 850 380 C 1050 290, 1300 240, 1600 120"
            fill="none"
            strokeWidth="0.8"
            strokeDasharray="6 8"
          />

          {/* Precision Asset Growth Candlestick / Bar Linework (Bottom Left) */}
          <g className="hidden lg:block opacity-60">
            <line x1="80" y1="620" x2="80" y2="700" strokeWidth="0.8" />
            <rect x="74" y="640" width="12" height="40" fill="none" strokeWidth="0.8" />

            <line x1="120" y1="590" x2="120" y2="680" strokeWidth="0.8" />
            <rect x="114" y="610" width="12" height="50" fill="none" strokeWidth="0.8" />

            <line x1="160" y1="560" x2="160" y2="650" strokeWidth="0.8" />
            <rect x="154" y="580" width="12" height="45" fill="none" strokeWidth="0.8" />

            <line x1="200" y1="520" x2="200" y2="620" strokeWidth="0.8" />
            <rect x="194" y="540" width="12" height="60" fill="none" strokeWidth="0.8" />

            <line x1="240" y1="480" x2="240" y2="580" strokeWidth="0.8" />
            <rect x="234" y="500" width="12" height="60" fill="none" strokeWidth="0.8" />
          </g>

          {/* Concentric Portfolio Diversification Compass Rings */}
          <circle cx="24%" cy="46%" r="220" fill="none" strokeWidth="0.75" />
          <circle cx="24%" cy="46%" r="360" fill="none" strokeWidth="0.75" strokeDasharray="3 6" />
          <circle cx="24%" cy="46%" r="500" fill="none" strokeWidth="0.75" />

          {/* Micro Coordinate Financial Data Labels */}
          <text x="30" y="80" className="text-[10px] font-mono fill-current opacity-50">PORTFOLIO // YIELD-INDEX</text>
          <text x="30" y="100" className="text-[9px] font-mono fill-current opacity-40">MUTUAL FUNDS • ASSETS • EQUITY</text>
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 2. THEME SWITCHER                                                         */}
      {/* ========================================================================= */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 lg:top-8 lg:right-10 z-50">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-indigo-300/80 dark:border-indigo-500/40 bg-white/90 dark:bg-slate-900/90 text-indigo-900 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-600 dark:hover:border-indigo-400 transition-all duration-200 cursor-pointer shadow-xs active:scale-95 outline-none"
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} className="text-indigo-700" />
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE (RESPONSIVE ZERO-SCROLL)                                */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between lg:justify-center px-4 sm:px-8 lg:px-12 py-3 lg:py-6 gap-3 lg:gap-16 min-h-0">
        
        {/* --- LEFT: PROMINENT BRANDING & PURPOSE-DRIVEN TEXT --- */}
        <div className="w-full lg:w-[50%] flex flex-col items-center lg:items-start text-center lg:text-left shrink-0 mt-1 sm:mt-3 lg:mt-0">
          
          {/* Large containerless blended logo */}
          <div className="mb-2 sm:mb-4 lg:mb-8 select-none transition-transform duration-300 hover:scale-105">
            <img
              src={Logo}
              alt="Dalal Central Logo"
              className="h-16 sm:h-24 lg:h-56 xl:h-64 2xl:h-72 w-auto object-contain drop-shadow-[0_14px_30px_rgba(79,70,229,0.18)] dark:drop-shadow-[0_14px_30px_rgba(79,70,229,0.28)]"
            />
          </div>

          {/* Signature Brand Badge */}
          <div className="flex items-center gap-2 lg:gap-3 mb-2 sm:mb-3 lg:mb-4">
            <div className="h-0.5 sm:h-1 w-5 sm:w-8 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            <p className="text-[10px] sm:text-xs lg:text-sm font-sans font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
              Wealth • Heritage • Growth
            </p>
          </div>

          {/* Large title typography */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-serif tracking-tight text-slate-900 dark:text-slate-100 leading-[0.98] mb-2 sm:mb-4">
            Dalal{" "}
            <span className="italic font-normal text-indigo-800 dark:text-indigo-400">
              Central
            </span>
          </h1>

          {/* Refined Filler Text for Family Business */}
          <p className="font-serif text-xs sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-md lg:max-w-lg leading-relaxed mb-4">
            Welcome to the centralized family portal. Track client folios, monitor mutual fund distributions, and manage daily accounts all in one secure space.
          </p>

          {/* Desktop Mini App Indicators */}
          <div className="hidden lg:flex items-center gap-3 w-full max-w-md pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 text-xs font-sans font-medium text-slate-700 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span>Mutual Fund CRM</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 text-xs font-sans font-medium text-slate-700 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>Daily Accounts</span>
            </div>
          </div>
        </div>

        {/* --- RIGHT: FORM CONTAINER --- */}
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-[480px] shrink-0 mt-auto lg:mt-0">
          <AuthForm
            users={users}
            loadingUsers={loadingUsers}
            isBiometricSupported={isBiometricSupported}
            onSubmit={handlePasswordLogin}
            onBiometricSuccess={handleBiometricSuccess}
            request={request}
          />
        </div>

      </main>

      {/* ========================================================================= */}
      {/* 4. CLEAN MINIMAL FOOTER                                                   */}
      {/* ========================================================================= */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-2 flex items-center justify-center text-xs font-sans text-slate-400 dark:text-slate-500 shrink-0">
        <p>© 2026 Dalal Investment. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default Auth;