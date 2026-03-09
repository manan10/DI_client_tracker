import React, { useState } from 'react';
import { Mail, Lock, Loader2, ChevronRight, Eye, EyeOff, ShieldCheck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import Logo from '../assets/logo_nobrand.png'; 

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  
  const { login } = useAuth();
  const { request } = useApi();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      console.error("Authentication failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      <div className="w-full lg:w-[55%] bg-[#0F172A] relative flex flex-col justify-between p-12 lg:p-24 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-200 h-200 bg-amber-500/10 rounded-full blur-[150px]"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-0.5 w-12 bg-amber-500"></div>
          <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.5em]">Distributor Access Only</span>
        </div>

        <div className="relative z-10">
          <div className="mb-1 inline-block">
            <img src={Logo} alt="Logo" className="h-48 w-auto object-contain drop-shadow-[0_10px_20px_rgba(245,158,11,0.2)]" />
          </div>
          <h1 className="text-7xl lg:text-8xl font-[1000] text-white leading-[0.85] tracking-tighter uppercase mb-6">
            DALAL <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-600">INVESTMENT</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-md leading-relaxed tracking-tight">
            Private terminal for comprehensive client wealth management and strategic interaction tracking.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-10">
          <div>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Secure Protocol</p>
            <p className="text-white text-[11px] font-bold uppercase tracking-wider">TLS 1.3 ENCRYPTED</p>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">System Status</p>
            <p className="text-emerald-500 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Operational
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: THE FORM */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-100">
          <div className="mb-12">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-3">Admin Login</h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck size={14} className="text-amber-500" /> Secure Handshake Required
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Distributor ID</label>
              <div className="relative">
                <User className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
                <input
                  type="text"
                  required
                  placeholder="USERNAME"
                  className="w-full pl-10 pr-4 py-4 bg-transparent border-b-2 border-slate-100 text-[13px] font-black text-slate-800 outline-none focus:border-amber-500 transition-all uppercase tracking-widest"
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Security Key</label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-600 transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-12 py-4 bg-transparent border-b-2 border-slate-100 text-[13px] font-black text-slate-800 outline-none focus:border-amber-500 transition-all tracking-widest"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 hover:text-amber-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button disabled={isSubmitting} className="w-full mt-10 bg-slate-900 text-white py-6 text-xs font-black uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:bg-slate-200">
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Authenticating...</> : <>Enter Terminal <ChevronRight size={18} className="text-amber-500" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;