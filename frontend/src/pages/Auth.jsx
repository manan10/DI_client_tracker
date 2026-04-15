import React, { useState, useEffect, useRef } from 'react';
import { Lock, Loader2, ChevronRight, Eye, EyeOff, User, Check, ShieldCheck } from 'lucide-react';
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
        console.error("Failed to load users:", err);
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
        navigate('/');
      }
    } catch (err) {
      console.error("Auth Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans overflow-hidden">
      
      {/* --- LEFT PANEL: IMAGE & BRANDING (Visible on Laptop/Desktop) --- */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[60%] relative flex-col items-center justify-center p-12 overflow-hidden bg-[#0F172A]">
        {/* High-end Financial Operations Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1611974714013-3c8b06032a7e?q=80&w=2070&auto=format&fit=crop" 
            alt="Market Operations" 
            className="w-full h-full object-cover opacity-20 brightness-50"
          />
          <div className="absolute inset-0 bg-linear-to-tr from-[#0F172A] via-[#0F172A]/40 to-transparent" />
        </div>

        <div className="relative z-10 text-center flex flex-col items-center">
          <img src={Logo} alt="Logo" className="h-40 w-auto mb-8 drop-shadow-2xl" />
          <h1 className="text-6xl font-[1000] text-white uppercase tracking-tighter leading-none mb-4">
            Dalal <br /> <span className="text-emerald-500 text-7xl">Family Central</span>
          </h1>
          <p className="text-slate-400 text-lg font-bold uppercase tracking-[0.4em] opacity-80">
            Wealth • Heritage • Growth
          </p>
        </div>
      </div>

      {/* --- RIGHT PANEL: THE LOGIN FORM (Highly Optimized for Mobile) --- */}
      <div className="w-full lg:w-[50%] xl:w-[40%] flex flex-col justify-center items-center p-6 sm:p-12 bg-slate-50 relative min-h-screen lg:min-h-0">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden w-full max-w-sm mb-8 text-center flex flex-col items-center">
           <img src={Logo} alt="Logo" className="h-14 w-auto mb-4" />
           <h2 className="text-2xl font-[1000] text-slate-900 uppercase tracking-tighter leading-tight">
             Dalal <span className="text-emerald-600">Family Central</span>
           </h2>
        </div>

        <div className="w-full max-w-sm flex flex-col justify-center">
          <div className="mb-8 text-center lg:text-left">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h3>
            <p className="text-slate-500 mt-1.5 font-medium">Sign in to access your family dashboard.</p>
          </div>

          {/* Form Container with White background for contrast */}
          <div className="bg-white p-6 sm:p-0 rounded-2xl shadow-xl shadow-slate-200/50 sm:shadow-none border border-slate-100 sm:border-0">
            <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
              
              {/* Member Selector */}
              <div className="relative group" ref={dropdownRef}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Member Profile</label>
                <button
                  type="button"
                  onClick={() => !loadingUsers && setIsOpen(!isOpen)}
                  className={`w-full flex items-center bg-slate-50 border-2 ${isOpen ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-slate-100'} rounded-xl py-4 px-5 text-sm font-bold text-slate-900 transition-all text-left relative`}
                >
                  <User size={18} className={`mr-3 ${selectedUser ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span className={`flex-1 truncate ${!selectedUser ? 'text-slate-400 italic font-medium' : ''}`}>
                    {loadingUsers ? "Locating members..." : selectedUser ? selectedUser.name : "Choose profile"}
                  </span>
                  <ChevronRight size={16} className={`text-slate-300 transition-transform duration-300 ${isOpen ? '-rotate-90' : 'rotate-90'}`} />
                </button>

                {isOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto animate-in fade-in zoom-in-95">
                    {users.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => handleSelect(u)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-left"
                      >
                        <div>
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{u.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold lowercase">@{u.username}</p>
                        </div>
                        {selectedUser?.username === u.username && <Check size={18} className="text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Password/PIN Field */}
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Access PIN</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-4 pl-12 pr-12 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-inner"
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-emerald-600 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                disabled={isSubmitting || !formData.username}
                className="w-full bg-slate-900 text-white rounded-xl py-5 font-black text-xs uppercase tracking-[0.4em] shadow-lg hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>Sign In <ChevronRight size={16} className="text-emerald-500" /></>}
              </button>
            </form>
          </div>

          {/* Footer Info */}
          <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 opacity-40">
             <div className="flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Authorized Session</span>
             </div>
             <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">© 2026 Dalal Dev</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;