import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Tv, 
  Grid, 
  Sun, 
  Moon, 
  LogOut, 
  Plus, 
  Flame,
  Ticket,
  MoreVertical,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../../shared/hooks/useAuth';

const ShowNavbar = ({ onOpenImport, onOpenAddShow }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.theme === 'dark' ||
      localStorage.getItem('app-theme') === 'dark' ||
      (!('theme' in localStorage) &&
        !('app-theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('app-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      localStorage.setItem('app-theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const handleSignOut = () => {
    setIsMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'TV';

  return (
    <>
      <header className="sticky top-0 z-50 w-full transition-all duration-300 bg-linear-to-r from-rose-950 via-slate-900 to-[#0F1424] border-b border-rose-500/30 shadow-[0_4px_30px_rgba(0,0,0,0.4)] select-none font-sans">
        
        {/* Ambient Subtle Horizon Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute -top-12 left-1/4 w-72 h-32 bg-rose-500/30 blur-[60px] rounded-full" />
          <div className="absolute -bottom-10 right-1/4 w-80 h-32 bg-amber-400/20 blur-[50px] rounded-full" />
        </div>

        {/* Laser-sharp neon marquee bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-amber-400 via-rose-500 to-cyan-400 opacity-80 pointer-events-none" />

        {/* Top Navbar Row */}
        <div className="w-full px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3 relative z-10">
          <div className="flex items-center justify-between gap-2.5 min-h-12">
            
            {/* ========================================================================= */}
            {/* LEFT: BRANDING LOCKUP                                                     */}
            {/* ========================================================================= */}
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
              {/* App Switcher Button */}
              <Link
                to="/app-picker"
                className="group relative p-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/15 hover:border-rose-400/40 text-slate-300 hover:text-white transition-all active:scale-95 shrink-0 shadow-xs outline-none"
                title="Switch Workspace"
              >
                <Grid size={16} strokeWidth={2.4} className="group-hover:rotate-90 transition-transform duration-300" />
              </Link>

              {/* Brand Title & Logo */}
              <div 
                className="flex items-center gap-2.5 sm:gap-3 min-w-0 group cursor-pointer" 
                onClick={() => navigate('/shows')}
              >
                {/* Media Icon Block */}
                <div className="relative shrink-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-linear-to-tr from-rose-600 via-pink-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-600/30 border border-rose-400/40 transform -rotate-1 group-hover:rotate-0 transition-transform">
                    <Tv size={16} strokeWidth={2.4} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </div>
                </div>

                {/* Typography (Never collapses into nothing on mobile) */}
                <div className="flex flex-col text-left min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h1 className="text-sm sm:text-lg font-serif font-bold tracking-[0.14em] uppercase leading-none text-white drop-shadow-sm truncate">
                      Over <span className="bg-linear-to-r from-amber-300 via-rose-300 to-fuchsia-300 bg-clip-text text-transparent font-black tracking-normal">Rated</span>
                    </h1>
                    
                    {/* Status Badge */}
                    <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs text-[8px] font-mono font-bold tracking-widest uppercase bg-amber-400 text-slate-950 shadow-xs">
                      <Flame size={10} className="fill-slate-950" />
                      ON AIR
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.9)] shrink-0" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-rose-300/80 truncate max-w-35 xs:max-w-[200px] sm:max-w-none">
                      <span className="hidden sm:inline">No show left unjudged • </span>Curated by {user?.name || 'Curator'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* RIGHT: DESKTOP ACTIONS (Hidden on mobile)                                 */}
            {/* ========================================================================= */}
            <div className="hidden sm:flex items-center gap-2.5 lg:gap-3 shrink-0">
              {/* Import Archive Button */}
              <button
                type="button"
                onClick={onOpenImport}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/15 hover:border-amber-400/40 text-slate-200 hover:text-white text-[11px] font-serif font-bold uppercase tracking-[0.12em] transition-all active:scale-95 cursor-pointer backdrop-blur-md shadow-xs outline-none"
              >
                <Ticket size={13} strokeWidth={2.4} className="text-amber-300 -rotate-12" />
                <span>Import Notes</span>
              </button>

              {/* Rate New Show Hero Button */}
              <button
                type="button"
                onClick={onOpenAddShow}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-linear-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-[11px] font-serif font-bold uppercase tracking-[0.14em] shadow-md shadow-rose-600/25 active:scale-95 transition-all cursor-pointer outline-none"
              >
                <Plus size={14} strokeWidth={3} className="shrink-0 text-white" />
                <span>Rate New</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-8.5 h-8.5 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer shadow-xs outline-none"
                aria-label="Toggle Theme"
              >
                {isDark ? (
                  <Sun size={15} strokeWidth={2.4} className="text-amber-300" />
                ) : (
                  <Moon size={15} strokeWidth={2.4} className="text-cyan-300 -rotate-12" />
                )}
              </button>

              {/* User Profile Chip */}
              <div className="flex items-center gap-2 pl-2 border-l border-white/15">
                <div className="flex items-center gap-2 p-1 pr-2 rounded-md bg-white/5 border border-white/10 shadow-xs">
                  <div className="w-6 h-6 rounded-sm bg-linear-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center font-mono font-bold text-[10px] shadow-xs">
                    {userInitials}
                  </div>

                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-[11px] font-bold text-white uppercase tracking-tight leading-none truncate max-w-24">
                      {user?.name || 'Curator'}
                    </span>
                    <span className="text-[8px] font-mono font-bold tracking-wider text-rose-300/80 uppercase mt-0.5 leading-none">
                      {user?.isAdmin ? 'Critic' : 'Viewer'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="p-1 rounded-sm text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-all active:scale-90 cursor-pointer outline-none ml-0.5"
                    title="Sign Out"
                  >
                    <LogOut size={13} strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* RIGHT: MOBILE STREAMLINED ACTIONS (Clean & Functional)                     */}
            {/* ========================================================================= */}
            <div className="flex sm:hidden items-center gap-1.5 shrink-0">
              {/* Primary Rate New Action */}
              <button
                type="button"
                onClick={onOpenAddShow}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-linear-to-r from-rose-600 to-amber-500 text-white text-[10px] font-serif font-bold uppercase tracking-wider shadow-sm active:scale-95"
              >
                <Plus size={13} strokeWidth={3} />
                <span>Rate</span>
              </button>

              {/* Compact Menu Trigger */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1.5 rounded-md bg-white/5 border border-white/15 text-slate-300 active:scale-95"
                aria-label="Open Actions Menu"
              >
                <MoreVertical size={16} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE ACTION BOTTOM SHEET                                                */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-100 flex items-end justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />

          {/* Sheet */}
          <div className="relative w-full bg-[#0A0E18] border-t border-rose-500/30 rounded-t-2xl shadow-2xl p-5 pb-8 animate-in slide-in-from-bottom-full duration-300 text-white">
            
            {/* Grab Handle */}
            <div className="w-10 h-1 bg-rose-400/40 rounded-full mx-auto mb-4" />

            {/* User Meta Row */}
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-linear-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center font-mono font-bold text-xs shadow-md">
                  {userInitials}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-white leading-none">
                    {user?.name || 'Curator'}
                  </p>
                  <p className="text-[9px] font-mono text-rose-300/80 uppercase tracking-widest mt-1">
                    {user?.isAdmin ? '★ Lead Critic' : 'Standard Watcher'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-md bg-white/5 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Menu Action List */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenImport();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left text-xs font-serif font-bold uppercase tracking-wider text-slate-200"
              >
                <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Ticket size={16} className="-rotate-12" />
                </div>
                <span>Import Notes Archive</span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left text-xs font-serif font-bold uppercase tracking-wider text-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  </div>
                  <span>Appearance: {isDark ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-400 uppercase">Toggle</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-left text-xs font-serif font-bold uppercase tracking-wider text-rose-300"
              >
                <div className="p-1.5 rounded-md bg-rose-500/20 text-rose-400">
                  <LogOut size={16} />
                </div>
                <span>Sign Out Securely</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default ShowNavbar;