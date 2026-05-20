import React, { useState, useEffect, useRef } from 'react';
import { Lock, Loader2, ChevronRight, Eye, EyeOff, User, Check, Monitor, Wallet, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-dvh w-full flex flex-col lg:flex-row bg-slate-50 font-sans overflow-x-hidden overflow-y-auto lg:overflow-hidden">
      
      {/* --- DESKTOP LEFT PANEL: REFINED EXECUTIVE --- */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col items-center justify-center p-12 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1611974714013-3c8b06032a7e?q=80&w=2070&auto=format&fit=crop" 
            alt="Market" 
            className="w-full h-full object-cover opacity-[0.15] mix-blend-luminosity" 
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/80 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-slate-900/40 to-transparent" />
        </div>
        <div className="relative z-10 text-center flex flex-col items-center">
          <img src={Logo} alt="Logo" className="h-44 w-auto mb-10 drop-shadow-2xl" />
          <h1 className="text-6xl font-[1000] text-white uppercase tracking-tighter leading-none mb-5">
            Dalal <br /> <span className="text-emerald-400 text-7xl">Investment Central</span>
          </h1>
          <p className="text-slate-400 text-[13px] font-black uppercase tracking-[0.4em]">
            Wealth • Heritage • Growth
          </p>
        </div>
      </div>

      {/* --- RIGHT PANEL (Mobile + Desktop Form) --- */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 sm:p-12 relative min-h-dvh lg:min-h-0 bg-white lg:bg-slate-50">
        
        {/* Subtle Background Glows (Elegant, not funky) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-100 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-100 flex flex-col relative z-10">
          
          {/* MOBILE BRANDING */}
          <div className="lg:hidden flex flex-col items-center mb-10 text-center">
             <img src={Logo} alt="Logo" className="h-24 w-auto mb-5 drop-shadow-xl" />
             <h2 className="text-3xl font-[1000] text-slate-900 uppercase tracking-tighter leading-none">
               Dalal <span className="text-emerald-600">Central</span>
             </h2>
             <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-[0.3em] mt-2">
               Secure Dashboard
             </p>
          </div>

          {/* DESKTOP HEADER */}
          <div className="hidden lg:block mb-10 text-left">
            <h3 className="text-3xl font-[1000] tracking-tight text-slate-900">Welcome Back</h3>
            <p className="text-slate-500 mt-2 text-sm font-medium">Sign in to access the secure family dashboard.</p>
          </div>

          {/* FORM CONTAINER */}
          <form onSubmit={handleSubmit} className="space-y-6 text-left w-full">
            
            {/* Member Selector */}
            <div className="relative" ref={dropdownRef}>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2.5 block pl-1">
                Who is logging in?
              </label>
              <button
                type="button"
                onClick={() => !loadingUsers && setIsOpen(!isOpen)}
                className={`w-full flex items-center bg-white border ${isOpen ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-200 hover:border-slate-300'} rounded-xl py-3.5 px-4 text-sm font-bold text-slate-900 transition-all text-left relative shadow-sm`}
              >
                <div className={`mr-3 p-1.5 rounded-lg transition-colors ${selectedUser ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <User size={18} strokeWidth={2.5} />
                </div>
                <span className={`flex-1 truncate ${!selectedUser ? 'text-slate-400 font-medium' : 'font-black uppercase tracking-tight'}`}>
                  {loadingUsers ? "Locating profiles..." : selectedUser ? selectedUser.name : "Select your profile"}
                </span>
                <ChevronRight size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? '-rotate-90 text-emerald-500' : 'rotate-90'}`} />
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95">
                  <div className="p-1.5">
                    {users.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => handleSelect(u)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors mb-0.5 last:mb-0 ${selectedUser?._id === u._id ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-slate-50 text-slate-700'}`}
                      >
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-[1000] uppercase tracking-tight truncate">{u.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 opacity-70">
                            <p className="text-[10px] font-bold lowercase">@{u.username}</p>
                            <div className="flex gap-1.5 ml-1">
                              {u.allowedApps?.includes('CLIENT_TRACKER') && <Monitor size={10} />}
                              {u.allowedApps?.includes('EXPENSE_TRACKER') && <Wallet size={10} />}
                            </div>
                          </div>
                        </div>
                        {selectedUser?._id === u._id && <Check size={18} className="text-emerald-600" strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="group relative">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2.5 block pl-1">
                 Enter your password
              </label>
              <div className="relative flex items-center">
                <div className={`absolute left-4 transition-colors ${formData.password ? 'text-emerald-500' : 'text-slate-400'}`}>
                  <Lock size={18} strokeWidth={2.5} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-sm font-black text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm tracking-widest placeholder:tracking-normal placeholder:font-medium"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 p-1 text-slate-400 hover:text-emerald-500 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={isSubmitting || !formData.username}
              className="w-full mt-4 bg-slate-900 text-white rounded-xl py-4 font-[1000] text-[11px] uppercase tracking-[0.3em] shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-slate-900 transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin text-emerald-400" />
              ) : (
                <>
                  <span>Secure Login</span>
                  <ChevronRight size={16} className="text-emerald-400" strokeWidth={3} />
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-12 flex flex-col items-center gap-4 opacity-60">
             <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Encrypted Session</span>
             </div>
             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">© 2026 Dalal Investment</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Auth;