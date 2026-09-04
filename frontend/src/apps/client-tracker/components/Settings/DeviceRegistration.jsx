import React, { useState } from 'react';
import { Fingerprint, Loader2, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';
import { useApi } from '../../../../shared/hooks/useApi';

const DeviceRegistration = () => {
  const { request } = useApi();
  const [isRegistering, setIsRegistering] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegisterDevice = async () => {
    setIsRegistering(true);
    setSuccess(false);

    try {
      // 1. Get configuration from your Express Backend
      const options = await request('/auth/webauthn/register-options', 'POST');

      // 2. Invoke the phone's native Fingerprint / FaceID setup prompt
      const attestationResp = await startRegistration(options);

      // 3. Send public key back to MongoDB
      const verification = await request('/auth/webauthn/register-verify', 'POST', attestationResp);

      if (verification && verification.verified) {
        setSuccess(true);
      }
    } catch (err) {
      console.error("Failed to pair device:", err);
      // Inform user error occurred (e.g. they canceled the native prompt)
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="w-full max-w-4xl pb-32 space-y-6 animate-in fade-in duration-300">
      
      {/* Mobile-Only Header */}
      <div className="lg:hidden border-b border-slate-200 dark:border-white/5 pb-4">
        <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">Biometric Login</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage trusted authentication devices.</p>
      </div>

      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-md shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Visual Context Panel */}
        <div className="md:w-2/5 bg-slate-50 dark:bg-slate-900/50 p-8 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
               <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <Smartphone size={32} className="text-indigo-600 dark:text-indigo-400" />
               </div>
               <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 border-4 border-slate-50 dark:border-[#0F172A] rounded-full flex items-center justify-center">
                  <Fingerprint size={16} className="text-emerald-600 dark:text-emerald-400" />
               </div>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Passwordless Entry</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-62.5">
               Link your hardware securely to bypass passwords using native Touch ID, Face ID, or Windows Hello.
            </p>
        </div>

        {/* Action Panel */}
        <div className="md:w-3/5 p-8 flex flex-col justify-center">
            
            <div className="space-y-4 mb-8">
               <div className="flex items-start gap-3">
                  <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                     <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">End-to-End Encrypted</p>
                     <p className="text-[10px] text-slate-500 mt-1">Biometric templates never leave your device enclave.</p>
                  </div>
               </div>
            </div>

            <button
              onClick={handleRegisterDevice}
              disabled={isRegistering || success}
              className={`w-full py-3.5 rounded-md font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm
                 ${success 
                   ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 cursor-default' 
                   : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                 }`}
            >
              {isRegistering ? (
                <><Loader2 size={16} className="animate-spin" /> Pairing Device...</>
              ) : success ? (
                <><CheckCircle2 size={16} /> Device Paired Successfully</>
              ) : (
                <><Fingerprint size={16} /> Register This Device</>
              )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceRegistration;