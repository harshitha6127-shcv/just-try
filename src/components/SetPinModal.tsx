import React, { useState, useRef, useEffect } from 'react';
import { KeyRound, Check, X, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SetPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (pin: string) => void;
}

export const SetPinModal: React.FC<SetPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { settings, setSettledPin, verifySettledPin, addToast } = useApp();
  const hasExistingPin = Boolean(
    settings.hasSettledPin ||
    (settings.settledPinHash && settings.settledPinSalt) ||
    (settings.pinEnabled && settings.pinHash && settings.pinSalt)
  );

  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const newPinRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setError(null);
      setIsSubmitting(false);
      setTimeout(() => {
        newPinRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate old PIN if changing
    if (hasExistingPin && oldPin.length !== 4) {
      setError('Please enter your current 4-digit PIN to authorize this change.');
      return;
    }

    if (hasExistingPin) {
      const isOldCorrect = await verifySettledPin(oldPin);
      if (!isOldCorrect) {
        setError('Current PIN is incorrect. Settled PIN does not match.');
        return;
      }
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError('PIN must be exactly 4 numeric digits (0-9).');
      return;
    }

    if (newPin !== confirmPin) {
      setError('New PIN and Confirm PIN do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await setSettledPin(newPin);
      if (onSuccess) {
        onSuccess(newPin);
      }
      addToast(
        hasExistingPin
          ? '4-digit security PIN updated successfully'
          : '4-digit security PIN configured successfully',
        'success'
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to configure PIN');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="set-pin-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div
        id="set-pin-modal-container"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {hasExistingPin ? 'Change 4-Digit Security PIN' : 'Set Your 4-Digit Security PIN'}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Client-Side Encryption Master Passkey
              </p>
            </div>
          </div>
          <button
            id="set-pin-close-btn"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Your 4-digit PIN is your opinionated master key. It will be used to derive AES-256
              cryptographic keys to encrypt and decrypt passwords for each respective email ID.
            </p>
          </div>

          {hasExistingPin && (
            <div className="space-y-1">
              <label
                htmlFor="old-pin-input"
                className="block text-[11px] font-medium text-slate-700 dark:text-slate-300"
              >
                Current Settled PIN
              </label>
              <input
                id="old-pin-input"
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="4 digits"
                className="w-full px-3 py-1.5 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label
                htmlFor="new-pin-input"
                className="block text-[11px] font-medium text-slate-700 dark:text-slate-300"
              >
                {hasExistingPin ? 'New 4-Digit PIN' : 'Set 4-Digit PIN'}
              </label>
              <input
                ref={newPinRef}
                id="new-pin-input"
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="e.g. 1234"
                className="w-full px-3 py-1.5 text-xs font-mono font-bold tracking-widest rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="confirm-pin-input"
                className="block text-[11px] font-medium text-slate-700 dark:text-slate-300"
              >
                Confirm 4-Digit PIN
              </label>
              <input
                id="confirm-pin-input"
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="re-enter 4 digits"
                className="w-full px-3 py-1.5 text-xs font-mono font-bold tracking-widest rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
            <button
              type="button"
              id="set-pin-toggle-visibility"
              onClick={() => setShowPin(!showPin)}
              className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPin ? 'Mask digits' : 'Show digits'}</span>
            </button>
            <span className="text-[10px]">Must be exactly 4 digits</span>
          </div>

          {error && (
            <div
              id="set-pin-error-alert"
              className="flex items-center gap-2 p-2 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              id="set-pin-cancel-btn"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="set-pin-save-btn"
              disabled={isSubmitting || newPin.length !== 4 || confirmPin.length !== 4}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{hasExistingPin ? 'Update PIN' : 'Save PIN'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
