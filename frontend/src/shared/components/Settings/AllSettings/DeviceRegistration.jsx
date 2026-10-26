import React, { useState } from 'react';
import { 
  Fingerprint, 
  Loader2, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Laptop
} from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';
import { useApi } from '../../../hooks/useApi';
import PageHeader from '../../../components/Auth/PageHeader';

const DeviceRegistration = () => {
  const { request } = useApi();
  const [isRegistering, setIsRegistering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleRegisterDevice = async () => {
    setIsRegistering(true);
    setSuccess(false);
    setErrorMessage(null);

    try {
      // 1. Get setup options from backend
      const options = await request('/auth/webauthn/register-options', 'POST');

      // 2. Open fingerprint / Face ID prompt on this phone or laptop
      const attestationResp = await startRegistration(options);

      // 3. Save device verification key to database
      const verification = await request('/auth/webauthn/register-verify', 'POST', attestationResp);

      if (verification && verification.verified) {
        setSuccess(true);
      } else {
        setErrorMessage(verification?.message || "Could not verify your device. Please try again.");
      }
    } catch (err) {
      console.error("Device pairing error:", err);
      if (err.name === 'NotAllowedError') {
        setErrorMessage("Setup was cancelled or timed out. Please try again.");
      } else {
        setErrorMessage(err.message || "Failed to pair this device.");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="w-full max-w-[100rem] mx-auto space-y-6 animate-in fade-in duration-300 min-w-0 pb-16">
      
      {/* Standard Header */}
      <PageHeader 
        title="Biometric"
        accent="Login"
        description="Connect your phone or computer to sign in faster with Face ID, fingerprint, or screen lock."
      />

      {/* Main Card */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl shadow-xs overflow-hidden flex flex-col md:flex-row min-w-0">
        
        {/* Left Side: Visual Overview */}
        <div className="md:w-5/12 bg-slate-50/70 dark:bg-slate-900/40 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 flex flex-col justify-center items-center text-center">
          <div className="relative mb-5">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Laptop size={34} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl flex items-center justify-center shadow-md">
              <Fingerprint size={18} />
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            One-Tap Sign In
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs">
            Skip typing your password every time. Use your device's built-in fingerprint reader or face scanner instead.
          </p>
        </div>

        {/* Right Side: Information & Action */}
        <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between min-w-0">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Current Device Setup
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Link This Phone or PC
              </h4>
            </div>

            {/* Explanation Points */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 flex items-start gap-3">
                <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Safe & Private
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                    Your fingerprint or face scan stays strictly on your device and is never shared or stored on the server.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 flex items-start gap-3">
                <Smartphone size={18} className="text-slate-700 dark:text-slate-300 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Works on Multiple Devices
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                    You can set up your phone, laptop, and work computer separately for effortless access everywhere.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-start gap-2.5 text-rose-700 dark:text-rose-400 text-xs">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={handleRegisterDevice}
              disabled={isRegistering || success}
              className={`w-full py-3.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-xs cursor-pointer active:scale-[0.99]
                ${success 
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 cursor-default' 
                  : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed shadow-md'
                }`}
            >
              {isRegistering ? (
                <>
                  <Loader2 size={16} className="animate-spin text-current" />
                  <span>Follow Device Prompts...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={17} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Device Connected Successfully</span>
                </>
              ) : (
                <>
                  <Fingerprint size={17} className="text-current" />
                  <span>Connect This Device</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DeviceRegistration;