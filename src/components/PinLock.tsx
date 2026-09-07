import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { verifyPin } from '../services/encryption';
import { verifyBiometricCredential, isWebAuthnSupported } from '../services/webauthn';
import { Lock, Fingerprint, Delete, AlertCircle } from 'lucide-react';

export const PinLock: React.FC = () => {
  const { isLocked, unlockWorkspace, settings, addToast } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    isWebAuthnSupported().then(setHasBiometrics);
  }, []);

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      setError(null);
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setError(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError(null);
    setPin('');
  };

  const attemptUnlockWithPin = useCallback(async (pinToTest: string) => {
    if (!settings.pinSalt || !settings.pinHash) {
      // Fallback if lock was somehow toggled without hash
      unlockWorkspace();
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const isValid = await verifyPin(pinToTest, settings.pinSalt, settings.pinHash);
      if (isValid) {
        unlockWorkspace();
        setPin('');
        addToast('Workspace unlocked', 'success');
      } else {
        setError('Incorrect PIN. Please try again.');
        setPin('');
      }
    } catch {
      setError('Verification error. Please retry.');
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  }, [settings.pinSalt, settings.pinHash, unlockWorkspace, addToast]);

  // Auto verify when length matches 4 or 6 (common PIN lengths)
  useEffect(() => {
    if (pin.length === 4 && (!settings.pinHash || settings.pinHash.length > 0)) {
      // Small debounce for user feedback
      const timer = setTimeout(() => {
        attemptUnlockWithPin(pin);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pin, attemptUnlockWithPin, settings.pinHash]);

  // Keyboard navigation
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, pin]);

  const handleBiometricUnlock = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      const result = await verifyBiometricCredential(settings.biometricCredentialId);
      if (result.success) {
        unlockWorkspace();
        addToast('Unlocked with Biometrics', 'success');
      } else {
        setError(result.error || 'Biometric verification was not completed.');
      }
    } catch {
      setError('Biometric verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isLocked) return null;

  return (
    <div
      id="pin-lock-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-2xs transition-all duration-300"
    >
      <div
        id="pin-lock-card"
        className="w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-4 shadow-xl text-center animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded flex items-center justify-center mx-auto mb-2 border border-indigo-100 dark:border-indigo-900/40 shadow-2xs">
          <Lock className="w-4 h-4" />
        </div>

        <div className="flex items-center justify-center gap-1 mb-0.5 text-[10px] font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
          <span>◈</span> Team Hub
        </div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Workspace locked
        </h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
          Enter your security PIN to resume
        </p>

        {/* Masked PIN Indicators */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-2.5 h-2.5 rounded-full border transition-all duration-150 ${
                  isFilled
                    ? 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500 scale-110'
                    : 'bg-transparent border-slate-300 dark:border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-rose-500 dark:text-rose-400 mb-2.5 bg-rose-50 dark:bg-rose-950/30 py-1 px-2 rounded">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={isVerifying}
              onClick={() => handleDigit(digit)}
              className="h-9 rounded text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700/80 transition-colors border border-slate-100 dark:border-slate-800/80"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            disabled={isVerifying}
            onClick={handleClear}
            className="h-9 rounded text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            disabled={isVerifying}
            onClick={() => handleDigit('0')}
            className="h-9 rounded text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700/80 transition-colors border border-slate-100 dark:border-slate-800/80"
          >
            0
          </button>
          <button
            type="button"
            disabled={isVerifying}
            onClick={handleBackspace}
            className="h-9 rounded flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Backspace"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {/* Biometric or Unlock Button */}
        <div className="flex flex-col gap-1.5">
          {settings.biometricEnabled && hasBiometrics && (
            <button
              type="button"
              onClick={handleBiometricUnlock}
              disabled={isVerifying}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors border border-indigo-100 dark:border-indigo-900/40"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              Unlock with Biometrics
            </button>
          )}

          <button
            type="button"
            disabled={pin.length < 4 || isVerifying}
            onClick={() => attemptUnlockWithPin(pin)}
            className="w-full py-1.5 px-3 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs"
          >
            {isVerifying ? 'Verifying...' : 'Unlock Workspace'}
          </button>
        </div>
      </div>
    </div>
  );
};
