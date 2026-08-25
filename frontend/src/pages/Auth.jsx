import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, Loader2, ChevronRight, Eye, EyeOff, User, 
  Check, Fingerprint, Monitor, Wallet, ArrowRight, 
  Sparkles, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import Logo from '../assets/logo_nobrand.png';
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (user) => {
    setSelectedUser(user);
    setFormData({ ...formData, username: user.username });
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

  return (
    <div className="h-dvh w-full overflow-hidden font-sans select-none bg-slate-950">

      {/* ========================================================================= */}
      {/* 1. MOBILE NATIVE VIEW (< lg)                                              */}
      {/* ========================================================================= */}
      <div className="lg:hidden relative flex flex-col justify-between h-dvh w-full p-2 sm:p-8 bg-linear-to-b from-slate-900 via-slate-950 to-slate-950 overflow-y-auto">
        
        {/* Background Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-emerald-500/15 blur-[80px] rounded-full" />
          <div className="absolute top-1/2 -right-20 w-64 h-64 bg-emerald-600/10 blur-[90px] rounded-full" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[20px_20px]" />
        </div>

        {/* Top Header & Branding */}
        <div className="relative z-10 flex flex-col items-center text-center shrink-0">
          <div className="h-32 flex items-center justify-center shadow-xl">
            <img src={Logo} alt="Logo" className="h-full w-auto object-contain drop-shadow" />
          </div>
          
          {/* <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">
            <Sparkles size={10} className="animate-pulse" />
            Private Ecosystem
          </div> */}

          <h1 className="text-5xl mb-4 sm:text-4xl font-[1000] text-white tracking-tight uppercase leading-none">
            Dalal <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-emerald-300">Investment</span>
          </h1>
        </div>

        {/* Form Console for Mobile */}
        <div className="relative z-10 w-full max-w-sm mx-auto my-auto py-2">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* User Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => !loadingUsers && setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all outline-none ${
                  isOpen 
                    ? 'border-emerald-500 bg-slate-900/90 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50' 
                    : 'border-white/10 bg-slate-900/60 active:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    selectedUser ? 'bg-emerald-500 text-white shadow-md' : 'bg-white/10 text-slate-400'
                  }`}>
                    <User size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col items-start text-left truncate">
                    {loadingUsers ? (
                      <span className="text-xs font-bold text-slate-400">Loading directory...</span>
                    ) : selectedUser ? (
                      <>
                        <span className="text-sm font-[1000] text-white uppercase truncate tracking-tight">{selectedUser.name}</span>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">@{selectedUser.username}</span>
                      </>
                    ) : (
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">Choose Profile</span>
                    )}
                  </div>
                </div>
                <ChevronRight size={18} className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-90 text-emerald-400' : ''}`} />
              </button>

              {/* Mobile Dropdown Menu */}
              {isOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-1.5 max-h-52 overflow-y-auto z-50 animate-in fade-in zoom-in-95">
                  {users.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => handleSelect(u)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                        selectedUser?._id === u._id 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'active:bg-white/5 text-slate-200'
                      }`}
                    >
                      <div className="flex flex-col items-start text-left">
                        <span className="text-xs font-black uppercase tracking-tight">{u.name}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">@{u.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5 text-slate-400 mr-1">
                          {u.allowedApps?.includes('CLIENT_TRACKER') && <Monitor size={13} title="Client App" />}
                          {u.allowedApps?.includes('EXPENSE_TRACKER') && <Wallet size={13} title="Expense App" />}
                        </div>
                        {selectedUser?._id === u._id && <Check size={16} className="text-emerald-400" strokeWidth={3} />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className="relative flex items-center">
              <div className={`absolute left-4 transition-colors ${formData.password ? 'text-emerald-400' : 'text-slate-500'}`}>
                <Lock size={18} strokeWidth={2.5} />
              </div>
              
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                className="w-full bg-slate-900/60 border border-white/10 focus:border-emerald-500 focus:bg-slate-900 rounded-2xl py-3.5 pl-12 pr-12 text-sm font-black text-white outline-none transition-all placeholder:font-bold placeholder:text-slate-500 tracking-widest placeholder:tracking-normal"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 p-1.5 text-slate-400 active:text-emerald-400 rounded-xl transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.username}
              className="w-full flex items-center justify-center gap-2.5 bg-linear-to-r from-emerald-600 to-emerald-700 active:from-emerald-500 active:to-emerald-600 text-white rounded-2xl py-4 transition-all shadow-[0_8px_20px_rgba(16,185,129,0.25)] active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin text-white" />
              ) : (
                <>
                  <span className="text-xs font-[1000] uppercase tracking-widest">Sign In</span>
                  <ArrowRight size={16} strokeWidth={3} />
                </>
              )}
            </button>

            {/* Biometric Button */}
            {isBiometricSupported && selectedUser?.credentials?.length > 0 && (
              <button
                type="button"
                onClick={handleBiometricLogin}
                disabled={isBiometricLoading || isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 active:bg-white/10 text-white rounded-2xl py-3 transition-all active:scale-[0.98] disabled:opacity-40 mt-2"
              >
                {isBiometricLoading ? (
                  <Loader2 size={18} className="animate-spin text-white" />
                ) : (
                  <>
                    <Fingerprint size={18} strokeWidth={2.5} className="text-emerald-400" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Touch ID / Face ID</span>
                  </>
                )}
              </button>
            )}
          </form>
        </div>

        {/* Bottom Secure Badge */}
        <div className="relative z-10 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-500 shrink-0 pb-1">
          <ShieldCheck size={12} className="text-emerald-500" />
          End-to-End Encrypted Gateway
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP FULL-SCREEN VIEW (>= lg)                                       */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex h-full w-full bg-white font-sans text-slate-900">
        
        {/* Left Side: Brand Showcase Canvas */}
        <div className="relative flex flex-col justify-between flex-1 bg-slate-950 overflow-hidden p-16">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 opacity-90" />
            <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-emerald-500/20 blur-[100px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute top-[30%] -right-[10%] w-[60%] h-[60%] bg-emerald-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute -bottom-[20%] left-[20%] w-[70%] h-[70%] bg-emerald-400/15 blur-[100px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-size-[24px_24px] opacity-20" />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex flex-col items-start text-left">
              <div className="h-64 w-64 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 flex items-center justify-center mb-8 shadow-2xl">
                <img src={Logo} alt="Logo" className="h-full w-auto object-contain drop-shadow-md" />
              </div>
              
              {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-emerald-400 uppercase tracking-widest backdrop-blur-md mb-4">
                <Sparkles size={12} className="animate-pulse" />
                Private Ecosystem
              </div> */}

              <h1 className="text-6xl xl:text-7xl font-[1000] text-white tracking-tighter uppercase leading-[1.05]">
                Dalal <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-emerald-300">
                  Investment
                </span>
              </h1>
              
              <p className="text-slate-300 font-medium text-lg max-w-md mt-6 leading-relaxed">
                An institutional-grade command center unifying family wealth, active client portfolios, and live treasury operations.
              </p>
            </div>

            <div className="flex items-center gap-8 border-t border-white/10 pt-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Monitor size={20} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm uppercase tracking-wider">Client Terminal</span>
                  <span className="text-slate-400 text-xs">Portfolio Analytics</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Wallet size={20} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm uppercase tracking-wider">Expense Hub</span>
                  <span className="text-slate-400 text-xs">Live Treasury Ledger</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Desktop Login Console */}
        <div className="w-120 xl:w-140 flex flex-col justify-center px-12 xl:px-16 bg-white z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.05)]">
          <div className="w-full max-w-sm mx-auto">
            <div className="mb-10 text-left">
              <h2 className="text-3xl font-[1000] text-slate-900 tracking-tighter uppercase mb-1">Sign In</h2>
              <p className="text-sm font-bold text-slate-400">Select your profile to authenticate.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Dropdown Profile Picker */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => !loadingUsers && setIsOpen(!isOpen)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all outline-none ${
                    isOpen 
                      ? 'border-emerald-500 bg-emerald-50/30 shadow-[0_8px_30px_rgba(16,185,129,0.1)]' 
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      selectedUser ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'
                    }`}>
                      <User size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col items-start text-left truncate">
                      {loadingUsers ? (
                        <span className="text-sm font-bold text-slate-400">Loading directory...</span>
                      ) : selectedUser ? (
                        <>
                          <span className="text-base font-[1000] text-slate-900 uppercase truncate tracking-tight">{selectedUser.name}</span>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">@{selectedUser.username}</span>
                        </>
                      ) : (
                        <span className="text-sm font-black uppercase tracking-wider text-slate-400">Choose Profile</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={20} className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-90 text-emerald-600' : ''}`} />
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] p-2 max-h-60 overflow-y-auto z-50 animate-in fade-in zoom-in-95">
                    {users.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => handleSelect(u)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                          selectedUser?._id === u._id 
                            ? 'bg-emerald-50 text-emerald-900' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex flex-col items-start text-left">
                          <span className="text-sm font-black uppercase tracking-tight">{u.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">@{u.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-2 text-slate-400 mr-2">
                            {u.allowedApps?.includes('CLIENT_TRACKER') && <Monitor size={14} title="Client App" />}
                            {u.allowedApps?.includes('EXPENSE_TRACKER') && <Wallet size={14} title="Expense App" />}
                          </div>
                          {selectedUser?._id === u._id && <Check size={18} className="text-emerald-600" strokeWidth={3} />}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <div className="relative flex items-center">
                  <div className={`absolute left-5 transition-colors ${formData.password ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <Lock size={20} strokeWidth={2.5} />
                  </div>
                  
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter Password"
                    className="w-full bg-slate-50 border-2 border-slate-100 hover:border-slate-200 focus:bg-white focus:border-emerald-500 rounded-2xl py-5 pl-14 pr-14 text-base font-black text-slate-900 outline-none transition-all placeholder:font-bold placeholder:text-slate-400 tracking-widest placeholder:tracking-normal"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 p-2 text-slate-400 hover:text-emerald-600 rounded-xl transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Primary Login Button */}
              <button
                type="submit"
                disabled={isSubmitting || !formData.username}
                className="w-full flex items-center justify-center gap-3 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-2xl py-5 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <Loader2 size={22} className="animate-spin text-white" />
                ) : (
                  <>
                    <span className="text-sm font-[1000] uppercase tracking-widest">Sign In Securely</span>
                    <ArrowRight size={18} strokeWidth={3} />
                  </>
                )}
              </button>

              {/* Biometrics for Desktop */}
              {isBiometricSupported && selectedUser?.credentials?.length > 0 && (
                <div className="pt-4">
                  <div className="flex items-center gap-3 mb-4 opacity-60">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Or Access With</span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>

                  <button
                    type="button"
                    onClick={handleBiometricLogin}
                    disabled={isBiometricLoading || isSubmitting}
                    className="w-full flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-4 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isBiometricLoading ? (
                      <Loader2 size={20} className="animate-spin text-white" />
                    ) : (
                      <>
                        <Fingerprint size={20} strokeWidth={2.5} className="text-emerald-400" />
                        <span className="text-xs font-black uppercase tracking-widest">Touch ID / Face ID</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <ShieldCheck size={14} className="text-emerald-500" />
              End-to-End Encrypted Session
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;