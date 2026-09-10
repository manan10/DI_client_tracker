import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, Loader2, ChevronDown, Eye, EyeOff, User, 
  Check, Fingerprint, ArrowRight, Sun, Moon, 
  PieChart, Wallet, ShieldCheck 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { useApi } from '../../shared/hooks/useApi';
import Logo from '../../assets/logo_nobrand.png';
import { startAuthentication, browserSupportsWebAuthn } from '@simplewebauthn/browser';

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });

  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const dropdownRef = useRef(null);

  // Theme Management
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('app-theme', nextTheme);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Biometrics
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  const { login } = useAuth();
  const { request } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    setIsBiometricSupported(browserSupportsWebAuthn());

    const fetchUsers = async () => {
      try {
        const data = await request('/users', 'GET');
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
    if (apps.length === 1 && apps.includes('EXPENSE_TRACKER')) {
      navigate('/expenses');
    } else if (apps.length === 1 && apps.includes('CLIENT_TRACKER')) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username) return;
    setIsSubmitting(true);
    try {
      const data = await request('/auth/login', 'POST', {
        username: formData.username,
        password: formData.password
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
      const options = await request('/auth/webauthn/login-options', 'POST', { 
        username: selectedUser.username 
      });
      const authResp = await startAuthentication(options);
      const verificationRes = await request('/auth/webauthn/login-verify', 'POST', {
        username: selectedUser.username,
        response: authResp
      });

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

  const isDark = theme === 'dark';

  return (
    <div className={`h-[100dvh] lg:h-auto lg:min-h-screen w-full flex flex-col items-center justify-center overflow-hidden lg:overflow-x-hidden lg:overflow-y-auto py-0 lg:py-10 transition-colors duration-500 relative ${
      isDark ? 'bg-[#050505]' : 'bg-slate-50'
    }`}>
      
      {/* ========================================================================= */}
      {/* VIBRANT & COLORFUL BACKGROUND MESH                                        */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Light Mode Blobs */}
        {!isDark && (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-300/40 mix-blend-multiply blur-[120px] rounded-full animate-[pulse_6s_infinite]" />
            <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] bg-teal-300/40 mix-blend-multiply blur-[100px] rounded-full animate-[pulse_8s_infinite_alternate]" />
            <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-indigo-300/30 mix-blend-multiply blur-[130px] rounded-full animate-[pulse_10s_infinite]" />
          </>
        )}

        {/* Dark Mode Blobs */}
        {isDark && (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-violet-600/40 mix-blend-screen blur-[130px] rounded-full animate-[pulse_6s_infinite]" />
            <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] bg-emerald-500/30 mix-blend-screen blur-[120px] rounded-full animate-[pulse_8s_infinite_alternate]" />
            <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-blue-600/40 mix-blend-screen blur-[150px] rounded-full animate-[pulse_10s_infinite]" />
          </>
        )}

        <div className={`absolute inset-0 ${isDark ? 'bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-5' : 'bg-[radial-gradient(#000000_1px,transparent_1px)] opacity-[0.04]'} bg-[size:24px_24px]`} />
      </div>

      {/* THEME TOGGLE BUTTON */}
      <div className="absolute top-4 right-4 lg:top-8 lg:right-8 z-50">
        <button
          onClick={toggleTheme}
          className={`p-3.5 rounded-full shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
            isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
          }`}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER: Increased Width & Optimized Mobile Fit                    */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[1400px] 2xl:max-w-[1600px] h-full lg:h-auto mx-auto flex flex-col lg:flex-row items-center justify-between lg:justify-center gap-6 lg:gap-20 relative z-10 px-4 sm:px-6 py-6 lg:py-0">
        
        {/* LEFT COLUMN: BRANDING */}
        <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-start text-center lg:text-left mt-4 sm:mt-8 lg:mt-0 shrink-0">
          <div className="mb-4 lg:mb-10">
            <img 
              src={Logo} 
              alt="Dalal Investment" 
              className="h-20 sm:h-24 lg:h-44 w-auto object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105" 
            />
          </div>

          <h1 className={`text-4xl sm:text-5xl lg:text-7xl font-[1000] uppercase tracking-tighter leading-[0.9] mb-3 lg:mb-6 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Dalal <br className="hidden lg:block" />
            Investment
          </h1>

          <p className={`text-sm lg:text-xl font-bold max-w-md mb-2 lg:mb-10 leading-relaxed ${
            isDark ? 'text-white' : 'text-slate-700'
          }`}>
            Welcome to the family portal. Track your investments, manage daily expenses, and watch your portfolio grow all in one place.
          </p>

          <div className="hidden lg:flex flex-col gap-6 w-full">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl shadow-sm ${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>
                <PieChart size={24} strokeWidth={2.5} />
              </div>
              <h3 className={`font-black text-xl uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                View Portfolios
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl shadow-sm ${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>
                <Wallet size={24} strokeWidth={2.5} />
              </div>
              <h3 className={`font-black text-xl uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Track Expenses
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl shadow-sm ${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>
                <ShieldCheck size={24} strokeWidth={2.5} />
              </div>
              <h3 className={`font-black text-xl uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Safe & Secure
              </h3>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN FORM (Stuck to bottom on mobile) */}
        <div className="w-full max-w-[480px] xl:max-w-[520px] shrink-0 mt-auto lg:mt-0 mb-2 sm:mb-4 lg:mb-0">
          <div className={`w-full p-6 lg:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl transition-all border ${
            isDark ? 'bg-black/60 shadow-black/80 border-white/20' : 'bg-white shadow-slate-300/60 border-slate-200'
          }`}>
            
            <div className="mb-6 lg:mb-10 text-center lg:text-left">
              <h2 className={`text-2xl lg:text-4xl font-[1000] uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Sign In
              </h2>
              <p className={`text-xs lg:text-base font-bold mt-1.5 lg:mt-2 ${isDark ? 'text-white/70' : 'text-slate-500'}`}>
                Select your name to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
              
              {/* PROFILE SELECTOR */}
              <div className="relative" ref={dropdownRef}>
                <label className={`block text-[10px] lg:text-xs font-black uppercase tracking-widest mb-1.5 lg:mb-2 ml-1 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                  Your Name
                </label>

                <button
                  type="button"
                  onClick={() => !loadingUsers && setIsOpen(!isOpen)}
                  className={`w-full flex items-center justify-between p-3.5 lg:p-4 rounded-2xl transition-all outline-none border-2 ${
                    isOpen 
                      ? (isDark ? 'border-white ring-4 ring-white/20 bg-white/10' : 'border-emerald-500 ring-4 ring-emerald-500/20 bg-emerald-50') 
                      : (isDark ? 'border-white/20 bg-black/40 hover:border-white/40' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white')
                  }`}
                >
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className={`p-2 lg:p-3 rounded-xl transition-colors ${
                      selectedUser 
                        ? (isDark ? 'bg-white text-black' : 'bg-emerald-600 text-white shadow-md') 
                        : (isDark ? 'bg-white/10 text-white/50' : 'bg-slate-200 text-slate-500')
                    }`}>
                      <User size={20} className="lg:w-6 lg:h-6" strokeWidth={2.5} />
                    </div>
                    
                    <div className="flex flex-col text-left truncate">
                      {loadingUsers ? (
                        <span className={`text-xs lg:text-sm font-bold ${isDark ? 'text-white/50' : 'text-slate-400'}`}>Loading...</span>
                      ) : selectedUser ? (
                        <span className={`text-base lg:text-xl font-[1000] uppercase tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {selectedUser.name}
                        </span>
                      ) : (
                        <span className={`text-xs lg:text-sm font-bold ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Click to choose</span>
                      )}
                    </div>
                  </div>
                  <ChevronDown size={20} className={`lg:w-6 lg:h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-white' : 'text-slate-400'}`} />
                </button>

                {/* DROPDOWN MENU */}
                {isOpen && (
                  <div className={`absolute left-0 w-full rounded-2xl border shadow-2xl p-2 max-h-48 lg:max-h-56 overflow-y-auto z-50 bottom-[calc(100%+12px)] lg:bottom-auto lg:top-[calc(100%+12px)] backdrop-blur-3xl ${
                    isDark ? 'bg-black/90 border-white/20' : 'bg-white border-slate-200'
                  }`}>
                    {users.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => handleSelect(u)}
                        className={`w-full flex items-center justify-between p-3 lg:p-4 rounded-xl transition-all ${
                          selectedUser?._id === u._id 
                            ? (isDark ? 'bg-white text-black font-black' : 'bg-emerald-50 text-emerald-800 font-black')
                            : (isDark ? 'hover:bg-white/10 text-white font-bold' : 'hover:bg-slate-100 text-slate-800 font-bold')
                        }`}
                      >
                        <span className="text-sm lg:text-lg uppercase tracking-tight">{u.name}</span>
                        {selectedUser?._id === u._id && <Check size={18} className="lg:w-6 lg:h-6" strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* PASSWORD INPUT */}
              <div>
                <label className={`block text-[10px] lg:text-xs font-black uppercase tracking-widest mb-1.5 lg:mb-2 ml-1 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                  Password
                </label>

                <div className="relative flex items-center group">
                  <div className={`absolute left-4 transition-colors ${formData.password ? (isDark ? 'text-white' : 'text-emerald-600') : (isDark ? 'text-white/40' : 'text-slate-400')}`}>
                    <Lock size={20} className="lg:w-6 lg:h-6" strokeWidth={2.5} />
                  </div>

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    className={`w-full border-2 rounded-2xl py-4 lg:py-5 pl-12 lg:pl-14 pr-12 lg:pr-14 text-base lg:text-lg font-bold outline-none transition-all ${
                      isDark 
                        ? 'bg-black/40 border-white/20 placeholder:text-white/40 text-white focus:border-white focus:bg-white/10 focus:ring-4 focus:ring-white/20' 
                        : 'bg-slate-50 border-slate-200 placeholder:text-slate-400 text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/20'
                    }`}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  />

                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className={`absolute right-3 lg:right-4 p-2 transition-colors rounded-xl focus:outline-none ${
                      isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100'
                    }`}
                  >
                    {showPassword ? <EyeOff size={20} className="lg:w-6 lg:h-6" /> : <Eye size={20} className="lg:w-6 lg:h-6" />}
                  </button>
                </div>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting || !formData.username}
                className={`w-full rounded-2xl py-4 lg:py-5 font-[1000] text-sm lg:text-base uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed mt-4 lg:mt-8 shadow-2xl active:scale-[0.98] ${
                  isDark 
                    ? 'bg-white hover:bg-gray-200 text-black shadow-white/20' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                }`}
              >
                {isSubmitting ? (
                  <Loader2 size={22} className="lg:w-6 lg:h-6 animate-spin" />
                ) : (
                  <>
                    <span>Login Now</span>
                    <ArrowRight size={20} className="lg:w-6 lg:h-6" strokeWidth={3} />
                  </>
                )}
              </button>

              {/* BIOMETRIC FAST PASS */}
              {isBiometricSupported && selectedUser?.credentials?.length > 0 && (
                <div className="pt-2 lg:pt-4">
                  <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6 opacity-60">
                    <div className={`h-1 flex-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
                    <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-500'}`}>Or</span>
                    <div className={`h-1 flex-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
                  </div>

                  <button
                    type="button"
                    onClick={handleBiometricLogin}
                    disabled={isBiometricLoading || isSubmitting}
                    className={`w-full flex items-center justify-center gap-3 border-2 rounded-2xl py-3.5 lg:py-4.5 transition-all text-xs lg:text-sm font-black uppercase tracking-wider active:scale-[0.98] disabled:opacity-30 ${
                      isDark 
                        ? 'bg-black/50 hover:bg-white/10 text-white border-white/30 hover:border-white' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isBiometricLoading ? (
                      <Loader2 size={20} className="lg:w-6 lg:h-6 animate-spin" />
                    ) : (
                      <>
                        <Fingerprint size={20} className={`lg:w-6 lg:h-6 ${isDark ? "text-white" : "text-emerald-600"}`} strokeWidth={2.5} />
                        <span>Use Face ID / Fingerprint</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;