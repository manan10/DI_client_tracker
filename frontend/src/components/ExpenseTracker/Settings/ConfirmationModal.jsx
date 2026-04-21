import React from "react";
import { X, AlertTriangle, ShieldAlert, ArrowRight } from "lucide-react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, type = "danger" }) => {
  if (!isOpen) return null;

  const themes = {
    danger: "bg-red-500 shadow-red-500/20 text-red-500 border-red-500/20",
    warning: "bg-orange-500 shadow-orange-500/20 text-orange-500 border-orange-500/20",
  };

  const theme = themes[type] || themes.danger;

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white dark:bg-[#0B1120] rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        
        <div className="flex flex-col items-center text-center">
          {/* Icon Header */}
          <div className={`p-4 rounded-3xl mb-6 ${theme.split(' ')[0]} bg-opacity-10 border ${theme.split(' ')[2]}`}>
            {type === "danger" ? <ShieldAlert size={32} className={theme.split(' ')[2].replace('border-', 'text-').replace('/20', '')} /> : <AlertTriangle size={32} className={theme.split(' ')[2].replace('border-', 'text-').replace('/20', '')} />}
          </div>

          <h3 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic mb-3">
            {title}
          </h3>
          
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={onConfirm}
              className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all active:scale-95 shadow-xl ${theme.split(' ')[0]}`}
            >
              {confirmText || "Confirm Action"}
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Cancel Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;