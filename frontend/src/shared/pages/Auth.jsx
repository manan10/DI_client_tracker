import React, { useState, useEffect, useRef } from "react";
import {
  Lock,
  Loader2,
  ChevronRight,
  Eye,
  EyeOff,
  User,
  Check,
  Fingerprint,
  Monitor,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";
import Logo from "../../assets/logo_nobrand.png";
import {
  startAuthentication,
  browserSupportsWebAuthn,
} from "@simplewebauthn/browser";

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [formData, setFormData] = useState({ username: "", password: "" });

  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const dropdownRef = useRef(null);

  // Theme Management with Persistent Storage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app-theme") || "dark";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("app-theme", nextTheme);
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Biometrics States
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  const { login } = useAuth();
  const { request } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    setIsBiometricSupported(browserSupportsWebAuthn());

    const fetchUsers = async () => {
      try {
        const data = await request("/users", "GET");
        if (data) setUsers(data);
      } catch (err) {
        console.error("User list error:", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [request]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleSelect = (user) => {
    setSelectedUser(user);
    setFormData((prev) => ({ ...prev, username: user.username }));
    setIsOpen(false);
  };

  const handleNavigation = (apps) => {
    if (apps.length === 1 && apps.includes("EXPENSE_TRACKER")) {
      navigate("/expenses");
    } else if (apps.length === 1 && apps.includes("CLIENT_TRACKER")) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username) return;
    setIsSubmitting(true);
    try {
      const data = await request("/auth/login", "POST", {
        username: formData.username,
        password: formData.password,
      });

      if (data && data.token) {
        login(data.user, data.token);
        handleNavigation(data.user.allowedApps || []);
      }
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!selectedUser) return;
    setIsBiometricLoading(true);
    try {
      const options = await request("/auth/webauthn/login-options", "POST", {
        username: selectedUser.username,
      });
      const authResp = await startAuthentication(options);
      const verificationRes = await request(
        "/auth/webauthn/login-verify",
        "POST",
        {
          username: selectedUser.username,
          response: authResp,
        },
      );

      if (verificationRes && verificationRes.token) {
        login(verificationRes.user, verificationRes.token);
        handleNavigation(verificationRes.user.allowedApps || []);
      }
    } catch (err) {
      console.error("Biometric failed:", err);
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const isDark = theme === "dark";
  const hasBiometrics =
    isBiometricSupported && selectedUser?.credentials?.length > 0;

  return (
    <div
      className={`h-dvh w-full font-sans select-none overflow-hidden relative transition-colors duration-300 flex flex-col justify-between ${
        isDark
          ? "bg-[#060A14] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300"
          : "bg-[#F1F5F9] text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-900"
      }`}
    >
      {/* Atmospheric Background Ambient Grid & Soft Blooms */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[24px_24px] opacity-40"
              : "bg-[radial-gradient(#94a3b8_1px,transparent_1px)] bg-size-[24px_24px] opacity-30"
          }`}
        />
        <div
          className={`absolute -top-20 -left-20 w-100 lg:w-225 xl:w-275 h-100 lg:h-225 xl:h-275 rounded-full blur-[130px] lg:blur-[180px] ${
            isDark ? "bg-emerald-500/20" : "bg-emerald-400/25"
          }`}
        />
        <div
          className={`absolute -bottom-20 -right-20 w-87.5 lg:w-212.5 xl:w-250 h-87.5 lg:h-212.5 xl:h-250 rounded-full blur-[130px] lg:blur-[180px] ${
            isDark ? "bg-teal-600/15" : "bg-teal-300/25"
          }`}
        />
      </div>

      {/* Floating Theme Switcher */}
      <div className="absolute top-4 right-4 sm:top-5 sm:right-6 lg:top-8 lg:right-12 z-50">
        <button
          type="button"
          onClick={toggleTheme}
          className={`flex items-center gap-2 px-3.5 py-2 lg:px-4 lg:py-2 rounded-full border text-xs lg:text-sm font-bold transition-all duration-200 cursor-pointer shadow-xs active:scale-95 backdrop-blur-xl ${
            isDark
              ? "bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600"
              : "bg-white/90 border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400"
          }`}
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <>
              <Sun size={14} className="text-amber-400 lg:w-4 lg:h-4" />
              <span className="text-[10px] lg:text-xs font-mono uppercase tracking-wider hidden sm:inline">
                Light
              </span>
            </>
          ) : (
            <>
              <Moon size={14} className="text-emerald-600 lg:w-4 lg:h-4" />
              <span className="text-[10px] lg:text-xs font-mono uppercase tracking-wider hidden sm:inline">
                Dark
              </span>
            </>
          )}
        </button>
      </div>

      {/* Main Workspace Stage */}
      <main className="relative z-10 h-full w-full max-w-7xl 2xl:max-w-375 mx-auto flex flex-col justify-between lg:grid lg:grid-cols-12 lg:gap-14 xl:gap-20 lg:items-center px-4 sm:px-8 lg:px-12 xl:px-16 pt-8 sm:pt-10 lg:py-8 pb-0 sm:pb-6 min-h-0 overflow-y-auto lg:overflow-visible">
        {/* Brand Showcase Area */}
        <div className="w-full lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left shrink-0 my-auto lg:my-0 pb-6 lg:pb-0">
          <div className="relative mb-3.5 sm:mb-4 lg:mb-6 xl:mb-8 select-none">
            <div className="absolute -inset-6 lg:-inset-8 bg-linear-to-tr from-emerald-500/25 to-teal-400/20 blur-2xl lg:blur-3xl rounded-full scale-95 pointer-events-none" />
            <img
              src={Logo}
              alt="Dalal Investment"
              className="relative z-10 h-24 sm:h-28 lg:h-52 xl:h-64 2xl:h-72 w-auto object-contain drop-shadow-[0_16px_32px_rgba(16,185,129,0.25)]"
            />
          </div>

          <h1
            className={`text-3xl sm:text-4xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-[1000] tracking-tight leading-[0.98] uppercase mb-1.5 sm:mb-2 lg:mb-3 ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            Dalal <br className="hidden lg:inline" />
            <span className="bg-linear-to-r from-emerald-500 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Investment
            </span>
          </h1>

          <div className="flex items-center gap-2.5 lg:gap-3 mb-1 lg:mb-6 xl:mb-8">
            <div className="h-1 lg:h-1.5 w-6 sm:w-8 lg:w-12 bg-linear-to-r from-emerald-500 to-teal-500 rounded-full" />
            <p className="text-xs sm:text-sm lg:text-sm xl:text-base font-mono font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
              Wealth • Heritage • Growth
            </p>
          </div>

          {/* Desktop App Indicators */}
          <div className="hidden lg:grid grid-cols-2 gap-4 xl:gap-5 w-full max-w-lg xl:max-w-xl mt-4 xl:mt-6">
            <div
              className={`flex items-center gap-3.5 xl:gap-4 p-4 xl:p-5 rounded-2xl border transition-all ${
                isDark
                  ? "bg-slate-900/60 border-slate-800"
                  : "bg-white border-slate-200 shadow-xs"
              }`}
            >
              <div className="p-2.5 xl:p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                <Monitor
                  size={20}
                  className="xl:w-6 xl:h-6"
                  strokeWidth={2.4}
                />
              </div>
              <div className="text-left min-w-0">
                <h4
                  className={`text-xs xl:text-sm font-bold uppercase tracking-wider truncate ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  Client Tracker
                </h4>
                <p className="text-[11px] xl:text-xs text-slate-400 truncate">
                  Portfolios & Analytics
                </p>
              </div>
            </div>

            <div
              className={`flex items-center gap-3.5 xl:gap-4 p-4 xl:p-5 rounded-2xl border transition-all ${
                isDark
                  ? "bg-slate-900/60 border-slate-800"
                  : "bg-white border-slate-200 shadow-xs"
              }`}
            >
              <div className="p-2.5 xl:p-3 rounded-xl bg-teal-500/10 text-teal-500 border border-teal-500/20 shrink-0">
                <Wallet size={20} className="xl:w-6 xl:h-6" strokeWidth={2.4} />
              </div>
              <div className="text-left min-w-0">
                <h4
                  className={`text-xs xl:text-sm font-bold uppercase tracking-wider truncate ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  Expense Tracker
                </h4>
                <p className="text-[11px] xl:text-xs text-slate-400 truncate">
                  Treasury Ledger
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Distinct Form Card / Mobile Bottom Sheet */}
        <div className="w-full lg:col-span-6 max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto shrink-0 mt-auto lg:mt-0">
          <div
            className={`w-full rounded-t-3xl sm:rounded-2xl lg:rounded-3xl border-t-2 border-x-2 sm:border-2 lg:border-2 transition-all duration-300 shadow-2xl p-6 sm:p-8 lg:p-9 xl:p-11 ${
              isDark
                ? "bg-[#0E1626] border-emerald-500/30 text-white shadow-black/80"
                : "bg-white border-slate-300 text-slate-900 shadow-slate-900/15"
            }`}
          >
            {/* Form Top Header */}
            <div className="flex items-center justify-between pb-3.5 sm:pb-4 lg:pb-5 mb-4 sm:mb-5 lg:mb-6 border-b border-slate-200/80 dark:border-slate-800">
              <div className="text-left">
                <h2
                  className={`text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-[1000] uppercase tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}
                >
                  Sign In
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                  Choose your account to sign in
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <ShieldCheck
                  size={14}
                  className="lg:w-4 lg:h-4"
                  strokeWidth={2.4}
                />
                <span>Secure</span>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-5 lg:space-y-6 text-left w-full"
            >
              {/* Profile Selector */}
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center justify-between mb-1.5 lg:mb-2 px-0.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Profile
                  </label>
                  {hasBiometrics && (
                    <button
                      type="button"
                      onClick={handleBiometricLogin}
                      disabled={isBiometricLoading || isSubmitting}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      {isBiometricLoading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Fingerprint
                          size={15}
                          className="lg:w-4 lg:h-4"
                          strokeWidth={2.4}
                        />
                      )}
                      <span>Use Passkey</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => !loadingUsers && setIsOpen(!isOpen)}
                  className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl lg:rounded-2xl border text-left transition-all duration-150 outline-none cursor-pointer ${
                    isOpen
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 " +
                        (isDark ? "bg-slate-900" : "bg-emerald-50/20")
                      : isDark
                        ? "border-slate-700 bg-slate-900/90 hover:border-slate-600"
                        : "border-slate-300 bg-slate-50 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-3.5 lg:gap-4 min-w-0">
                    <div
                      className={`h-10 w-10 sm:h-11 sm:w-11 lg:h-11 lg:w-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        selectedUser
                          ? "bg-emerald-600 text-white shadow-xs"
                          : isDark
                            ? "bg-slate-800 text-slate-400 border border-slate-700"
                            : "bg-slate-200 text-slate-600 border border-slate-300"
                      }`}
                    >
                      <User
                        size={18}
                        className="lg:w-5 lg:h-5"
                        strokeWidth={2.4}
                      />
                    </div>
                    <div className="flex flex-col items-start truncate">
                      {loadingUsers ? (
                        <span className="text-sm text-slate-400 font-medium">
                          Loading...
                        </span>
                      ) : selectedUser ? (
                        <>
                          <span
                            className={`text-sm sm:text-base font-bold uppercase tracking-tight truncate ${isDark ? "text-white" : "text-slate-900"}`}
                          >
                            {selectedUser.name}
                          </span>
                          <span className="text-[11px] sm:text-xs font-mono text-emerald-500 uppercase tracking-wider">
                            @{selectedUser.username}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm sm:text-base font-bold text-slate-400">
                          Select Profile
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className={`text-slate-400 lg:w-5 lg:h-5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90 text-emerald-500" : ""}`}
                  />
                </button>

                {/* Dropdown Menu List: In-flow expansion on mobile */}
                {isOpen && (
                  <div
                    className={`mt-2 rounded-xl lg:rounded-2xl border shadow-2xl p-2 max-h-48 sm:max-h-56 lg:max-h-64 overflow-y-auto backdrop-blur-xl ${
                      isDark
                        ? "bg-slate-900/95 border-slate-700 text-white"
                        : "bg-white border-slate-200 text-slate-900"
                    } lg:absolute lg:top-[calc(100%+6px)] lg:left-0 lg:right-0 lg:z-50 lg:mt-0`}
                  >
                    {users.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => handleSelect(u)}
                        className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-lg lg:rounded-xl transition-all mb-1 last:mb-0 cursor-pointer ${
                          selectedUser?._id === u._id
                            ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                            : isDark
                              ? "hover:bg-slate-800 text-slate-200 border border-transparent"
                              : "hover:bg-slate-100 text-slate-800 border border-transparent"
                        }`}
                      >
                        <div className="flex flex-col items-start text-left truncate min-w-0 pr-2">
                          <span className="text-sm font-bold uppercase tracking-tight truncate">
                            {u.name}
                          </span>
                          <span className="text-[10px] sm:text-xs font-mono text-slate-400">
                            @{u.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex gap-1.5 text-slate-400 mr-0.5">
                            {u.allowedApps?.includes("CLIENT_TRACKER") && (
                              <Monitor
                                size={13}
                                className="lg:w-3.5 lg:h-3.5"
                                title="Client Tracker"
                              />
                            )}
                            {u.allowedApps?.includes("EXPENSE_TRACKER") && (
                              <Wallet
                                size={13}
                                className="lg:w-3.5 lg:h-3.5"
                                title="Expense Tracker"
                              />
                            )}
                          </div>
                          {selectedUser?._id === u._id && (
                            <Check
                              size={16}
                              className="lg:w-4 lg:h-4 text-emerald-500"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Password Field with Integrated Biometric Quick Action */}
              <div className="space-y-1.5 lg:space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-0.5 block">
                  Password
                </label>

                <div className="relative flex items-center">
                  <div
                    className={`absolute left-3.5 sm:left-4 transition-colors ${formData.password ? "text-emerald-500" : "text-slate-400"}`}
                  >
                    <Lock
                      size={16}
                      className="lg:w-5 lg:h-5"
                      strokeWidth={2.4}
                    />
                  </div>

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    className={`w-full border rounded-xl lg:rounded-2xl py-3 sm:py-3.5 pl-10 sm:pl-12 pr-18 lg:pr-20 text-sm sm:text-base font-mono outline-none transition-all tracking-wider placeholder:font-sans placeholder:tracking-normal focus:ring-2 focus:ring-emerald-500/20 ${
                      isDark
                        ? "bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-600 focus:border-emerald-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600"
                    }`}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                  />

                  {/* Actions inside password bar: Passkey (if supported) + Eye toggle */}
                  <div className="absolute right-3 sm:right-3.5 flex items-center gap-2">
                    {hasBiometrics && (
                      <button
                        type="button"
                        onClick={handleBiometricLogin}
                        disabled={isBiometricLoading || isSubmitting}
                        title="Sign in with Passkey / Face ID"
                        className="p-1.5 text-emerald-500 hover:text-emerald-400 transition-colors focus:outline-none cursor-pointer"
                        aria-label="Use Passkey"
                      >
                        {isBiometricLoading ? (
                          <Loader2
                            size={15}
                            className="lg:w-5 lg:h-5 animate-spin text-emerald-500"
                          />
                        ) : (
                          <Fingerprint
                            size={16}
                            className="lg:w-5 lg:h-5"
                            strokeWidth={2.4}
                          />
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors focus:outline-none cursor-pointer"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={16} className="lg:w-5 lg:h-5" />
                      ) : (
                        <Eye size={16} className="lg:w-5 lg:h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Login CTA */}
              <button
                type="submit"
                disabled={isSubmitting || !formData.username}
                className="w-full mt-2 lg:mt-3 bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl lg:rounded-2xl py-3.5 sm:py-4 font-bold text-sm sm:text-base uppercase tracking-wider shadow-md shadow-emerald-600/20 active:scale-[0.99] disabled:opacity-40 transition-all duration-150 flex items-center justify-center gap-2.5 lg:gap-3 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2
                    size={16}
                    className="lg:w-5 lg:h-5 animate-spin text-white"
                  />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight
                      size={16}
                      className="lg:w-5 lg:h-5"
                      strokeWidth={2.4}
                    />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Desktop-Only Footer */}
      <footer className="hidden lg:flex w-full max-w-7xl 2xl:max-w-375 mx-auto shrink-0 items-center justify-between text-xs lg:text-sm font-mono text-slate-400 dark:text-slate-500 px-4 sm:px-8 lg:px-12 xl:px-16 pb-3 lg:pb-4">
        <p>© 2026 Dalal Investment</p>
        <span className="text-emerald-500 font-bold">Gateway v2.6</span>
      </footer>
    </div>
  );
};

export default Auth;
