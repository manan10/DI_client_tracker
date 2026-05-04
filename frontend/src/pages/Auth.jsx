import React, { useState, useEffect, useRef } from 'react';
import { Lock, Loader2, ChevronRight, Eye, EyeOff, User, Check, Monitor, Wallet, Sparkles, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import Logo from '../assets/logo_nobrand.png';

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const dropdownRef = useRef(null);

  const { login } = useAuth();
  const { request } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
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
        const apps = data.user.allowedApps || [];
        if (apps.length === 1 && apps.includes('EXPENSE_TRACKER')) {
          navigate('/expenses');
        } else if (apps.length === 1 && apps.includes('CLIENT_TRACKER')) {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans overflow-hidden">
      
      {/* --- DESKTOP LEFT PANEL: EXACT ORIGINAL RESTORED --- */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[60%] relative flex-col items-center justify-center p-12 overflow-hidden bg-[#0F172A]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1611974714013-3c8b06032a7e?q=80&w=2070&auto=format&fit=crop" 
            alt="Market" 
            className="w-full h-full object-cover opacity-20 brightness-50" 
          />
          <div className="absolute inset-0 bg-linear-to-tr from-[#0F172A] via-[#0F172A]/40 to-transparent" />
        </div>
        <div className="relative z-10 text-center flex flex-col items-center">
          <img src={Logo} alt="Logo" className="h-40 w-auto mb-8 drop-shadow-2xl" />
          <h1 className="text-6xl font-[1000] text-white uppercase tracking-tighter leading-none mb-4">
            Dalal <br /> <span className="text-emerald-500 text-7xl">Investment Central</span>
          </h1>
          <p className="text-slate-400 text-lg font-bold uppercase tracking-[0.4em] opacity-80">
            Wealth • Heritage • Growth
          </p>
        </div>
      </div>

      {/* --- RIGHT PANEL (Desktop: Original Style | Mobile: Emerald Character) --- */}
      <div className="w-full lg:w-[50%] xl:w-[40%] flex flex-col justify-center items-center p-6 sm:p-12 relative min-h-screen lg:min-h-0 bg-slate-50 lg:bg-slate-50">
        
        {/* MOBILE CHARACTER: ONLY VISIBLE ON MOBILE */}
        <div className="lg:hidden absolute inset-0 z-0 bg-[#F8FAFC]">
           <div className="absolute -top-[10%] -left-[10%] w-[120%] h-[50%] bg-emerald-500/20 blur-[100px] rounded-full animate-pulse" />
           <div className="absolute top-[20%] -right-[20%] w-[80%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
           <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>

        {/* MOBILE BRANDING */}
        <div className="lg:hidden w-full max-w-sm mb-12 text-center flex flex-col items-center relative z-10">
           <div className="relative mb-6">
             <div className="absolute -inset-4 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
             <img src={Logo} alt="Logo" className="h-28 w-auto relative z-10 drop-shadow-[0_10px_20px_rgba(16,185,129,0.3)]" />
           </div>
           <h2 className="text-3xl font-[1000] text-slate-900 uppercase tracking-tighter italic leading-none">
             Dalal <span className="text-emerald-600">Central</span>
           </h2>
           <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.4em] mt-3">Dashboard</p>
        </div>

        <div className="w-full max-w-sm flex flex-col justify-center relative z-10">
          
          {/* DESKTOP HEADER: EXACT ORIGINAL RESTORED */}
          <div className="hidden lg:block mb-8 text-left text-slate-900">
            <h3 className="text-3xl font-black tracking-tight">Welcome Back</h3>
            <p className="text-slate-500 mt-1.5 font-medium">Sign in to access the dashboard.</p>
          </div>

          {/* FORM CONTAINER (Card style on mobile, invisible on desktop) */}
          <div className="bg-white lg:bg-transparent p-8 lg:p-0 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] lg:shadow-none border border-white lg:border-0 relative ring-1 ring-emerald-500/10 lg:ring-0">
            
            <form onSubmit={handleSubmit} className="space-y-7 lg:space-y-8 text-left">
              
              {/* Member Selector */}
              <div className="relative" ref={dropdownRef}>
                <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block ml-1">
                  <span className="lg:hidden text-slate-400">Who is logging in?</span>
                  <span className="hidden lg:inline text-slate-400">Who is logging in?</span>
                </label>
                <button
                  type="button"
                  onClick={() => !loadingUsers && setIsOpen(!isOpen)}
                  className={`w-full flex items-center bg-slate-50 border-2 ${isOpen ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-slate-100'} rounded-2xl py-4 lg:py-5 px-5 lg:px-6 text-sm font-bold text-slate-900 transition-all text-left relative`}
                >
                  <div className={`mr-3 lg:mr-4 p-1.5 lg:p-2 rounded-xl transition-colors ${selectedUser ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                    <User size={18} strokeWidth={2.5} />
                  </div>
                  <span className={`flex-1 truncate ${!selectedUser ? 'text-slate-400 font-medium italic' : 'font-black uppercase'}`}>
                    {loadingUsers ? "Finding family..." : selectedUser ? selectedUser.name : (window.innerWidth < 1024 ? "Select your profile" : "Choose profile")}
                  </span>
                  <ChevronRight size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? '-rotate-90 text-emerald-500' : 'rotate-90'}`} />
                </button>

                {isOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-[2.5rem] lg:rounded-2xl shadow-2xl max-h-64 overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95">
                    <div className="p-3 lg:p-1.5">
                      {users.map((u) => (
                        <button
                          key={u._id}
                          type="button"
                          onClick={() => handleSelect(u)}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl lg:rounded-xl transition-all mb-1 last:mb-0 ${selectedUser?._id === u._id ? 'bg-emerald-500 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-900'}`}
                        >
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-[1000] uppercase tracking-tight truncate">{u.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 opacity-60">
                              <p className="text-[9px] font-bold lowercase">@{u.username}</p>
                              <div className="flex gap-1.5 ml-1">
                                {u.allowedApps?.includes('CLIENT_TRACKER') && <Monitor size={8} />}
                                {u.allowedApps?.includes('EXPENSE_TRACKER') && <Wallet size={8} />}
                              </div>
                            </div>
                          </div>
                          {selectedUser?._id === u._id && <Check size={18} className="text-white" strokeWidth={4} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="group">
                <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block ml-1">
                   <span className="lg:hidden text-slate-400">Enter your password</span>
                   <span className="hidden lg:inline text-slate-400">Enter your password</span>
                </label>
                <div className="relative">
                  <div className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${formData.password ? 'text-emerald-500' : 'text-slate-300'}`}>
                    <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 lg:py-5 pl-14 pr-14 text-sm font-black text-slate-900 outline-none focus:border-emerald-500 transition-all shadow-inner tracking-widest placeholder:tracking-normal"
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-emerald-500 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                disabled={isSubmitting || !formData.username}
                className="w-full relative bg-slate-900 lg:bg-slate-900 text-white rounded-2xl py-5 lg:py-6 font-[1000] text-[11px] uppercase tracking-[0.3em] lg:tracking-[0.4em] shadow-xl hover:scale-[1.01] active:scale-95 disabled:opacity-30 transition-all flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <span className="lg:hidden text-emerald-500">LOGIN</span>
                    <span className="hidden lg:inline">LOGIN</span>
                    <ChevronRight size={18} className="text-emerald-500" strokeWidth={4} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Info */}
          <div className="mt-12 flex flex-col items-center gap-4 opacity-50 relative z-10">
             <div className="flex items-center gap-2 px-5 py-2 bg-white rounded-full shadow-sm border border-emerald-100">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Secure Hub</span>
             </div>
             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">© 2026 Dalal Investment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;