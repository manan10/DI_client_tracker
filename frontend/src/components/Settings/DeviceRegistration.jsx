import React, { useState } from 'react';
import { Fingerprint, Loader2 } from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';
import { useApi } from '../../hooks/useApi';

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
    <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-lg">
          <Fingerprint size={20} strokeWidth={2.5} />
        </div>
        <h4 className="text-sm font-[1000] text-slate-900 dark:text-white uppercase tracking-wider">
          Biometric Login
        </h4>
      </div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
        Register this device to login quickly using Face ID, Touch ID, or your device PIN.
      </p>

      <button
        onClick={handleRegisterDevice}
        disabled={isRegistering || success}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-black text-[11px] uppercase tracking-widest transition-all bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {isRegistering ? (
          <Loader2 size={16} className="animate-spin" />
        ) : success ? (
          "Device Paired Successfully!"
        ) : (
          "Register This Device"
        )}
      </button>
    </div>
  );
};

export default DeviceRegistration;