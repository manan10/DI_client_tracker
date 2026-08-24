import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, Loader2, ChevronRight, Eye, EyeOff, User, 
  Check, Fingerprint, Monitor, Wallet, ArrowRight, ShieldCheck 
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
    <div className="h-dvh w-full flex flex-col lg:flex-row font-sans bg-slate-50 text-slate-900 overflow-hidden">
      
      {/* ========================================================================= */}
      {/* LEFT PANEL: MASSIVE BRANDING (Desktop Only)                               */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] bg-[#0B1120] flex-col justify-center items-center p-12 lg:p-20 shrink-0 relative overflow-hidden">
        
        {/* Subtle Ambient Emerald Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-emerald-500/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-teal-500/10 blur-[90px] rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col items-start w-full max-w-lg">
          {/* MASSIVE LOGO */}
          <div className="mb-10 drop-shadow-2xl">
            <img 
              src={Logo} 
              alt="Dalal Investment" 
              className="h-48 lg:h-64 w-auto object-contain drop-shadow-[0_0_40px_rgba(16,185,129,0.2)]" 
            />
          </div>

          <h1 className="text-5xl lg:text-7xl font-[1000] text-white tracking-tighter leading-none mb-5 uppercase">
            Dalal <br />
            <span className="text-emerald-500">Investment</span>
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="h-1 w-12 bg-emerald-500 rounded-full" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">
              Wealth • Heritage • Growth
            </p>
          </div>
        </div>

        <div className="absolute bottom-10 left-10 flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
          <ShieldCheck size={16} className="text-emerald-600" />
          Secure Enterprise Gateway
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: FULL-BLEED SEAMLESS FORM (Mobile First)                      */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full bg-white flex flex-col justify-center px-6 sm:px-12 lg:px-24 h-full relative overflow-y-auto no-scrollbar">
        
        <div className="w-full max-w-md mx-auto flex flex-col justify-center">
          
          {/* MOBILE HEADER (Visible only on small screens) */}
          <div className="lg:hidden flex flex-col items-center text-center mb-8 shrink-0">
            <img 
              src={Logo} 
              alt="Dalal Investment" 
              className="h-20 sm:h-24 w-auto object-contain mb-4 drop-shadow-md" 
            />
            <h1 className="text-3xl sm:text-4xl font-[1000] text-slate-900 tracking-tighter uppercase leading-none">
              Dalal <span className="text-emerald-600">Investment</span>
            </h1>
          </div>

          {/* DESKTOP WELCOME TEXT */}
          <div className="hidden lg:block mb-10 text-left">
            <h2 className="text-4xl font-[1000] text-slate-900 tracking-tight uppercase">Sign In</h2>
            <p className="text-sm font-medium text-slate-500 mt-2">Select your profile to securely access your apps.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 w-full shrink-0">

            {/* --- PROFILE SELECTOR --- */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 pl-2">
                Select Profile
              </label>
              
              <button
                type="button"
                onClick={() => !loadingUsers && setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-slate-50 border ${
                  isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
                } rounded-2xl p-4 sm:p-5 transition-all outline-none`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-2 rounded-xl shrink-0 transition-colors ${selectedUser ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    <User size={20} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col items-start truncate text-left">
                    {loadingUsers ? (
                      <span className="text-sm font-bold text-slate-400">Loading names...</span>
                    ) : selectedUser ? (
                      <>
                        <span className="text-base font-black text-slate-900 uppercase truncate">{selectedUser.name}</span>
                        <span className="text-xs font-bold text-slate-400">@{selectedUser.username}</span>
                      </>
                    ) : (
                      <span className="text-base font-bold text-slate-500">Choose your name</span>
                    )}
                  </div>
                </div>
                <ChevronRight size={20} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90 text-emerald-600' : ''}`} />
              </button>

              {/* DROPDOWN MENU LIST */}
              {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-1.5 max-h-56 overflow-y-auto z-50 animate-in fade-in zoom-in-95">
                  {users.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => handleSelect(u)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${
                        selectedUser?._id === u._id 
                          ? 'bg-emerald-50 text-emerald-900' 
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm font-black uppercase tracking-tight">{u.name}</span>
                        <span className="text-[10px] font-bold text-slate-400">@{u.username}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* App Access Badges */}
                        <div className="flex gap-2 text-slate-400 mr-2">
                          {u.allowedApps?.includes('CLIENT_TRACKER') && <Monitor size={15} title="Client App" />}
                          {u.allowedApps?.includes('EXPENSE_TRACKER') && <Wallet size={15} title="Expense App" />}
                        </div>
                        {selectedUser?._id === u._id && (
                          <Check size={18} className="text-emerald-600" strokeWidth={3} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* --- PASSWORD FIELD --- */}
            <div className="relative">
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 pl-2">
                Password
              </label>
              <div className="relative flex items-center">
                <div className={`absolute left-4 transition-colors ${formData.password ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <Lock size={20} strokeWidth={2.5} />
                </div>
                
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter Password"
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl py-4 sm:py-5 pl-12 pr-12 text-sm sm:text-base font-black text-slate-900 outline-none transition-all placeholder:font-bold placeholder:text-slate-400 tracking-widest placeholder:tracking-normal"
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

            {/* --- PRIMARY LOGIN BUTTON --- */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.username}
              className="w-full flex items-center justify-center gap-2 bg-[#0B1120] hover:bg-slate-800 text-white rounded-2xl py-4 sm:py-5 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <Loader2 size={20} className="animate-spin text-emerald-400" />
              ) : (
                <>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-widest">Sign In</span>
                  <ArrowRight size={18} className="text-emerald-400" strokeWidth={3} />
                </>
              )}
            </button>

            {/* --- BIOMETRIC LOGIN --- */}
            {isBiometricSupported && selectedUser?.credentials?.length > 0 && (
              <div className="pt-2 sm:pt-3">
                <div className="flex items-center gap-3 mb-3 opacity-60">
                  <div className="h-px bg-slate-300 flex-1" />
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Or use</span>
                  <div className="h-px bg-slate-300 flex-1" />
                </div>

                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={isBiometricLoading || isSubmitting}
                  className="w-full flex items-center justify-center gap-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl py-3.5 sm:py-4 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isBiometricLoading ? (
                    <Loader2 size={20} className="animate-spin text-emerald-600" />
                  ) : (
                    <>
                      <Fingerprint size={20} strokeWidth={2.5} className="text-emerald-600" />
                      <span className="text-xs font-black uppercase tracking-widest">Touch ID / Face ID</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
};

export default Auth;