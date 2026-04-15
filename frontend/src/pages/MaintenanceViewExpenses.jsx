import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Hammer, 
  ArrowLeft, 
  LogOut, 
  Construction, 
  LayoutGrid 
} from 'lucide-react';
import { useAuth } from "../hooks/useAuth";

const MaintenanceViewExpenses = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden flex flex-col items-center justify-center px-4">
      
      {/* --- SHARED BACKGROUND DECORATION --- */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-200/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 w-full max-w-md">
        
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/60 text-center">
          
          {/* Animated Icon Header */}
          <div className="relative inline-flex mb-8">
            <div className="absolute inset-0 bg-amber-100 rounded-3xl blur-xl opacity-50 animate-pulse" />
            <div className="relative w-20 h-20 bg-amber-50 rounded-3xl border border-amber-100 flex items-center justify-center">
              <Construction className="w-10 h-10 text-amber-600 animate-bounce" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center">
              <Hammer className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Text Content */}
          <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
            Work in Progress
          </h1>
          <p className="text-slate-500 leading-relaxed mb-8">
            The <span className="font-bold text-slate-700">Home Expense Tracker</span> is currently being optimized for the Dalal family. Check back shortly!
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white p-4 rounded-2xl font-bold transition-all hover:bg-slate-800 active:scale-[0.98] shadow-lg shadow-slate-200"
            >
              <LayoutGrid className="w-5 h-5" />
              Back to App Picker
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-600 border border-slate-200 p-4 rounded-2xl font-bold transition-all hover:bg-slate-50 active:scale-[0.98]"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>

        {/* Quick Logout */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold text-xs tracking-widest uppercase transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Secure Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default MaintenanceViewExpenses;