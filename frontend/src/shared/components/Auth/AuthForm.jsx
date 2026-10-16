// src/components/Auth/AuthForm.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Lock,
  Loader2,
  ChevronDown,
  Eye,
  EyeOff,
  User,
  Check,
  Fingerprint,
  ArrowRight,
  ShieldCheck,
  Users,
  ReceiptIndianRupee,
  Clapperboard,
  Sparkles,
} from "lucide-react";
import { startAuthentication } from "@simplewebauthn/browser";

const appIcons = {
  CLIENT_TRACKER: {
    icon: Users,
    label: "Clients",
    style:
      "bg-teal-50 dark:bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-500/30",
  },
  EXPENSE_TRACKER: {
    icon: ReceiptIndianRupee,
    label: "Expenses",
    style:
      "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30",
  },
  SHOW_RATER: {
    icon: Clapperboard,
    label: "Shows",
    style:
      "bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
  },
};

const AuthForm = ({
  users = [],
  loadingUsers = false,
  isBiometricSupported = false,
  onSubmit,
  onBiometricSuccess,
  request,
}) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (user) => {
    setSelectedUser(user);
    setFormData((prev) => ({ ...prev, username: user.username }));
    setIsOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (!selectedUser || isBiometricLoading || !request) return;
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
        }
      );

      if (verificationRes && verificationRes.token) {
        onBiometricSuccess(verificationRes);
      }
    } catch (err) {
      console.error("Biometric login failed:", err);
    } finally {
      setIsBiometricLoading(false);
    }
  };

  return (
    <div
      className="relative w-full font-sans transition-all duration-300
      /* Mobile: Raised bottom sheet attached to viewport edge */
      rounded-t-[2.5rem] rounded-b-none border-t-2 border-x-0 border-b-0 px-6 pt-5 pb-8
      /* Desktop: Asymmetric architectural shell with sculpted facets */
      lg:rounded-tl-[3.5rem] lg:rounded-tr-2xl lg:rounded-br-[3.5rem] lg:rounded-bl-2xl lg:border-2 lg:p-10
      border-indigo-400/50 dark:border-indigo-500/40
      bg-gradient-to-b from-white via-indigo-50/30 to-slate-50/80
      dark:from-slate-900/95 dark:via-[#0D1527]/95 dark:to-[#080D1A]/95
      backdrop-blur-2xl
      shadow-[0_-15px_40px_rgba(15,23,42,0.1)] lg:shadow-[0_25px_60px_-15px_rgba(79,70,229,0.22)]"
    >
      {/* Mobile Top Grab Indicator */}
      <div className="lg:hidden w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-5" />

      {/* --- FINE SVG ARCHITECTURAL LINE ART & AMBIENT DEPTH --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] z-0">
        <svg
          className="absolute -top-12 -right-12 w-80 h-80 opacity-[0.07] dark:opacity-[0.14] text-indigo-500"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1.5" />
          <polygon points="100,20 180,140 20,140" stroke="currentColor" strokeWidth="1" />
          <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.75" />
          <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.75" />
        </svg>

        {/* Top luminous gradient rail */}
        <div className="absolute top-0 left-12 right-12 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/80 dark:via-indigo-400/70 to-transparent" />
      </div>

      {/* --- FORM HEADER --- */}
      <div className="relative z-10 mb-6 lg:mb-8 text-left">
        {/* <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
          <span className="font-serif italic text-xs lg:text-sm font-semibold text-indigo-800 dark:text-indigo-300">
            Dalal Investment Internal Portal
          </span>
        </div> */}

        <h3 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome
        </h3>
        <p className="font-sans text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 mt-1">
          Select your account and authenticate to continue.
        </p>
      </div>

      {/* --- FORM BODY --- */}
      <form onSubmit={handleFormSubmit} className="relative z-10 space-y-5 lg:space-y-6">
        
        {/* 1. PROFILE SELECTOR */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center justify-between mb-2 px-0.5">
            <label className="text-xs lg:text-sm font-bold text-slate-700 dark:text-slate-300">
              Select Your Name
            </label>
            {selectedUser && (
              <span className="text-[10px] lg:text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/30">
                Verified Profile
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => !loadingUsers && setIsOpen(!isOpen)}
            className={`w-full h-14 lg:h-16 flex items-center justify-between px-4 rounded-2xl border-2 transition-all outline-none cursor-pointer bg-white/90 dark:bg-slate-950/70 ${
              isOpen
                ? "border-indigo-600 dark:border-indigo-400 ring-4 ring-indigo-500/20 shadow-md"
                : "border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                  selectedUser
                    ? "bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-500 shadow-sm"
                    : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30"
                }`}
              >
                <User size={20} className="lg:w-5 lg:h-5" strokeWidth={2.4} />
              </div>

              <div className="flex flex-col text-left truncate">
                {loadingUsers ? (
                  <span className="text-xs lg:text-sm text-slate-400 animate-pulse">
                    Loading directory...
                  </span>
                ) : selectedUser ? (
                  <>
                    <span className="font-serif font-bold text-slate-900 dark:text-white text-sm lg:text-lg leading-tight truncate">
                      {selectedUser.name}
                    </span>
                    <span className="text-[11px] lg:text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400">
                      @{selectedUser.username}
                    </span>
                  </>
                ) : (
                  <span className="text-xs lg:text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Click to choose your profile
                  </span>
                )}
              </div>
            </div>

            <ChevronDown
              size={20}
              strokeWidth={2.5}
              className={`transition-transform duration-300 text-slate-400 shrink-0 ml-2 ${
                isOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
              }`}
            />
          </button>

          {/* SOLID ELEVATED DROPDOWN MENU */}
          {isOpen && (
            <>
              {/* Invisible touch backdrop catcher */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsOpen(false)} 
              />
              
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl border-2 border-indigo-300 dark:border-indigo-500/50 bg-white dark:bg-[#0B1120] shadow-[0_22px_50px_rgba(0,0,0,0.3)] p-2 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                {users.map((u) => {
                  const isSelected = selectedUser?._id === u._id;
                  const userApps = u.allowedApps || [];

                  return (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => handleSelect(u)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mb-1 last:mb-0 cursor-pointer text-left ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-950 dark:text-indigo-200 font-bold border border-indigo-200 dark:border-indigo-500/40"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-transparent"
                      }`}
                    >
                      <div className="flex flex-col text-left truncate min-w-0 pr-3">
                        <span className="font-serif text-sm lg:text-base font-semibold truncate text-slate-900 dark:text-white">
                          {u.name}
                        </span>
                        <span className="text-[11px] lg:text-xs font-mono text-slate-400">
                          @{u.username}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center gap-1">
                          {userApps.map((appKey) => {
                            const config = appIcons[appKey];
                            if (!config) return null;
                            const IconComp = config.icon;
                            return (
                              <span
                                key={appKey}
                                title={config.label}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] lg:text-xs font-semibold ${config.style}`}
                              >
                                <IconComp size={12} strokeWidth={2.4} />
                                <span className="hidden sm:inline">{config.label}</span>
                              </span>
                            );
                          })}
                        </div>

                        {isSelected && (
                          <Check
                            size={18}
                            className="text-indigo-600 dark:text-indigo-400 ml-1.5 shrink-0"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 2. PASSWORD FIELD */}
        <div>
          <label className="block text-xs lg:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 px-0.5">
            Password
          </label>

          <div className="relative flex items-center">
            <div className="absolute left-4 text-slate-400 pointer-events-none">
              <Lock size={19} className="lg:w-5 lg:h-5" strokeWidth={2.2} />
            </div>

            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Enter your security password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              className="w-full h-13 lg:h-15 text-sm lg:text-base font-semibold border-2 rounded-2xl pl-12 pr-12 outline-none transition-all
                border-slate-300 dark:border-slate-800 bg-white/90 dark:bg-slate-950/70
                text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal
                focus:border-indigo-600 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 outline-none cursor-pointer rounded-lg"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </div>

        {/* 3. SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting || !formData.username || !formData.password}
          className="w-full h-13 lg:h-15 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-xs lg:text-sm text-white uppercase tracking-wider
            bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500
            shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-[0.99]
            disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <span>Log In</span>
              <ArrowRight size={17} strokeWidth={2.6} />
            </>
          )}
        </button>

        {/* 4. BIOMETRICS FAST-PASS */}
        {isBiometricSupported && selectedUser?.credentials?.length > 0 && (
          <div className="pt-2">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
              <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                or
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            </div>

            <button
              type="button"
              onClick={handleBiometricAuth}
              disabled={isBiometricLoading || isSubmitting}
              className="w-full h-12 lg:h-13 rounded-2xl flex items-center justify-center gap-2.5 text-xs lg:text-sm font-semibold
                border-2 border-indigo-300 dark:border-indigo-500/40
                bg-indigo-50/70 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-200
                hover:bg-indigo-100/70 dark:hover:bg-indigo-500/20 transition-all duration-200
                active:scale-[0.99] disabled:opacity-40 cursor-pointer"
            >
              {isBiometricLoading ? (
                <Loader2 size={18} className="animate-spin text-indigo-600" />
              ) : (
                <>
                  <Fingerprint size={19} strokeWidth={2.4} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Use Face ID / Passkey</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default AuthForm;