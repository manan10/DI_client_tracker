import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Directory', path: '/directory', icon: Users },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src={Logo} alt="Logo" className="h-10 w-auto" />
            <div className="hidden md:block">
              <span className="block text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">Dalal Investment</span>
              <span className="text-[9px] font-bold text-amber-600 uppercase tracking-[0.2em]">Distributor Portal</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                    isActive ? 'text-amber-600' : 'text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Icon size={16} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-6 pl-6 border-l border-slate-100">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1">
                <Shield size={8} className="text-amber-500" /> Admin Session
              </span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-2.5 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group"
              title="Logout"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;