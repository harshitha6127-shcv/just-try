import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { isWebAuthnSupported, registerPasskey, verifyPasskey } from '../services/webauthn';
import { ShieldCheck, Lock, KeyRound, Fingerprint, RefreshCw, CheckCircle2, AlertCircle, Eye, EyeOff, ExternalLink } from 'lucide-react';

export const Security: React.FC = () => {
  const { settings, updateSettings, setupPin, removePin, lockWorkspace, user, addToast, credentials, hasSettledPin } = useApp();

  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // WebAuthn state
  const [webAuthnSupported, setWebAuthnSupported] = useState(false);
  const [webAuthnLoading, setWebAuthnLoading] = useState(false);

  useEffect(() => {
    isWebAuthnSupported().then(setWebAuthnSupported);
  }, []);

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    if (!/^\d{4,6}$/.test(pinInput)) {
      setPinError('PIN must be 4 to 6 digits.');
      return;
    }

    if (pinInput !== confirmPinInput) {
      setPinError('PINs do not match.');
      return;
    }

    try {
      await setupPin(pinInput);
      setPinInput('');
      setConfirmPinInput('');
      addToast('Security PIN successfully enabled!', 'success');
    } catch {
      setPinError('Failed to hash and configure PIN.');
    }
  };

  const handleDisablePin = () => {
    removePin();
    addToast('Security PIN disabled.', 'info');
  };

  const handleRegisterBiometrics = async () => {
    if (!user) {
      addToast('Please set up your profile first.', 'error');
      return;
    }

    setWebAuthnLoading(true);
    try {
      const result = await registerPasskey(user.id, user.name);
      if (result.success && result.credentialId) {
        updateSettings({
          biometricEnabled: true,
          webAuthnCredentialId: result.credentialId,
        });
        addToast('Biometric passkey registered successfully!', 'success');
      } else {
        addToast(result.error || 'Biometric registration cancelled or failed.', 'error');
      }
    } catch {
      addToast('WebAuthn registration error.', 'error');
    } finally {
      setWebAuthnLoading(false);
    }
  };

  const handleTestBiometrics = async () => {
    if (!settings.webAuthnCredentialId) {
      addToast('No passkey registered yet.', 'error');
      return;
    }

    setWebAuthnLoading(true);
    try {
      const result = await verifyPasskey(settings.webAuthnCredentialId);
      if (result.success) {
        addToast('Biometric verification verified successfully!', 'success');
      } else {
        addToast(result.error || 'Biometric verification failed.', 'error');
      }
    } catch {
      addToast('WebAuthn authentication error.', 'error');
    } finally {
      setWebAuthnLoading(false);
    }
  };

  return (
    <div id="security-page" className="p-3 sm:p-4 max-w-4xl mx-auto space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Security & Cryptography
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Protect access to your local Team Hub workspace using browser cryptography.
          </p>
        </div>

        {settings.pinEnabled && (
          <button
            type="button"
            onClick={lockWorkspace}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 transition-colors self-start sm:self-auto shadow-2xs"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Workspace Now</span>
          </button>
        )}
      </div>

      {/* Security Status Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded flex items-center justify-center ${
              settings.pinEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Workspace Protection Status: {settings.pinEnabled ? 'Protected' : 'Unlocked'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {settings.pinEnabled
                ? 'PIN lock is active. PBKDF2 hash with random salt protects local storage.'
                : 'Workspace is accessible without a security prompt.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* PIN Security Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <KeyRound className="w-4 h-4 text-indigo-500" />
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Workspace PIN Lock
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Hashed with PBKDF2 (100,000 rounds)
              </p>
            </div>
          </div>

          {settings.pinEnabled ? (
            <div className="space-y-2.5">
              <div className="p-2.5 rounded bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">PIN Lock Active</span>
                  <span className="text-[11px]">A PIN is required whenever the workspace locks or reloads.</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Auto-Lock Inactivity Timeout
                </label>
                <select
                  value={settings.autoLockTimeout}
                  onChange={(e) => updateSettings({ autoLockTimeout: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value={0}>Immediately upon leaving tab</option>
                  <option value={5}>5 minutes of inactivity</option>
                  <option value={15}>15 minutes of inactivity</option>
                  <option value={30}>30 minutes of inactivity</option>
                  <option value={60}>1 hour of inactivity</option>
                </select>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleDisablePin}
                  className="w-full py-1.5 px-2.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded transition-colors"
                >
                  Remove PIN Protection
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSavePin} className="space-y-2.5">
              {pinError && (
                <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Enter New PIN (4-6 digits)
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full px-2.5 py-1.5 text-xs tracking-widest rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirm PIN
                </label>
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-2.5 py-1.5 text-xs tracking-widest rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-1.5 px-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-2xs transition-colors"
              >
                Enable PIN Protection
              </button>
            </form>
          )}
        </div>

        {/* Biometrics / Passkeys Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Fingerprint className="w-4 h-4 text-indigo-500" />
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Biometrics / WebAuthn
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Touch ID, Face ID, or Windows Hello
              </p>
            </div>
          </div>

          {!webAuthnSupported ? (
            <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 leading-relaxed">
              WebAuthn / Passkeys are not supported in this browser environment or iframe sandbox.
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                Register this device&apos;s biometric sensor (Face ID, Touch ID, or security key) for seamless local unlocking.
              </p>

              {settings.biometricEnabled ? (
                <div className="space-y-2">
                  <div className="p-2 rounded bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Passkey registered on this browser</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      disabled={webAuthnLoading}
                      onClick={handleTestBiometrics}
                      className="py-1.5 px-2.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors text-xs"
                    >
                      {webAuthnLoading ? 'Verifying...' : 'Test Sensor'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateSettings({ biometricEnabled: false, webAuthnCredentialId: undefined })
                      }
                      className="py-1.5 px-2.5 rounded border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium transition-colors text-xs"
                    >
                      Remove Passkey
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={webAuthnLoading}
                  onClick={handleRegisterBiometrics}
                  className="w-full py-1.5 px-2.5 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>{webAuthnLoading ? 'Registering...' : 'Register Passkey / Biometrics'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Encrypted Password Vault Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Encrypted Password Vault (Email Accounts)
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                AES-GCM encrypted passwords gated strictly by 4-digit PIN equality checks
              </p>
            </div>
          </div>
          <Link
            to="/passwords"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <span>Open Vault</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Stored Email Passwords</span>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5 font-mono">
              {credentials.length} Accounts
            </div>
          </div>

          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Settled 4-Digit PIN</span>
            <div className="text-xs font-semibold mt-0.5">
              {hasSettledPin ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Settled & Enforced
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Not Configured Yet
                </span>
              )}
            </div>
          </div>

          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">PIN Protection Rule</span>
            <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-0.5 leading-tight">
              Password viewed ONLY if entered PIN equals settled PIN; otherwise shows "Incorrect PIN" & stays hidden.
            </p>
          </div>
        </div>
      </div>

      {/* Web Crypto Architecture Explanation Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
          Cryptography & Architecture Guarantee
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-slate-100 block mb-0.5 text-xs">
              AES-GCM 256-Bit
            </strong>
            <p className="text-[11px] leading-relaxed">Encrypted backup files use authenticated Galois/Counter Mode encryption with random 96-bit initialization vectors.</p>
          </div>
          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-slate-100 block mb-0.5 text-xs">
              PBKDF2 Key Derivation
            </strong>
            <p className="text-[11px] leading-relaxed">100,000 iterations of SHA-256 with 128-bit cryptographically secure salt prevent brute-force and rainbow table attacks.</p>
          </div>
          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-slate-100 block mb-0.5 text-xs">
              Zero Server Transmission
            </strong>
            <p className="text-[11px] leading-relaxed">All keys, salts, and operations remain strictly within window.crypto in your browser. No network payloads ever leave.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
