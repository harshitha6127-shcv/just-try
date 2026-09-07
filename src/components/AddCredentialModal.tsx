import React, { useState, useEffect } from 'react';
import { Lock, Mail, Key, ShieldCheck, X, RefreshCw, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AddCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  defaultLabel?: string;
}

export const AddCredentialModal: React.FC<AddCredentialModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
  defaultLabel = '',
}) => {
  const { members, addCredential, hasSettledPin, verifySettledPin } = useApp();

  const [email, setEmail] = useState('');
  const [label, setLabel] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [notes, setNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(defaultEmail);
      setLabel(defaultLabel || 'Email Account');
      setPassword('');
      setPin('');
      setNotes('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, defaultEmail, defaultLabel]);

  if (!isOpen) return null;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let res = '';
    const array = new Uint32Array(16);
    crypto.getRandomValues(array);
    for (let i = 0; i < 16; i++) {
      res += chars[array[i] % chars.length];
    }
    setPassword(res);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password) {
      setError('Password cannot be empty.');
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('A 4-digit PIN is required for encryption.');
      return;
    }

    if (hasSettledPin) {
      const isValid = await verifySettledPin(pin);
      if (!isValid) {
        setError('Incorrect PIN. The entered PIN does not match your settled 4-digit PIN.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await addCredential({
        email: trimmedEmail,
        password,
        label: label.trim() || undefined,
        notes: notes.trim() || undefined,
        pin,
      });

      if (!res.success) {
        setError(res.error || 'Failed to encrypt and store password.');
        setIsSubmitting(false);
        return;
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Encryption error');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="add-credential-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div
        id="add-credential-modal-container"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Store Encrypted Password
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                AES-GCM 256-bit encrypted with your 4-digit PIN
              </p>
            </div>
          </div>
          <button
            id="add-cred-close-btn"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {/* Email input with quick pick from team */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="credential-email-input"
                className="block text-[11px] font-medium text-slate-700 dark:text-slate-300"
              >
                Email ID *
              </label>
              <span className="text-[10px] text-slate-400">Target account</span>
            </div>
            <div className="relative">
              <input
                id="credential-email-input"
                type="email"
                required
                list="member-emails-list"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. member@company.com"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 font-mono"
              />
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
            <datalist id="member-emails-list">
              {members.map((m) => (
                <option key={m.id} value={m.email}>
                  {m.name} ({m.role})
                </option>
              ))}
            </datalist>

            {/* Quick badges for team member emails */}
            {members.length > 0 && !email && (
              <div className="flex flex-wrap items-center gap-1 pt-1">
                <span className="text-[10px] text-slate-400">Quick select:</span>
                {members.slice(0, 3).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setEmail(m.email);
                      setLabel(`${m.name}'s Email`);
                    }}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 truncate max-w-[140px]"
                  >
                    {m.email}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Service / Label */}
          <div className="space-y-1">
            <label
              htmlFor="credential-label-input"
              className="block text-[11px] font-medium text-slate-700 dark:text-slate-300"
            >
              Service / Account Label
            </label>
            <input
              id="credential-label-input"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Google Workspace, Work Email, GitHub, Internal VPN"
              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="credential-password-input"
                className="block text-[11px] font-medium text-slate-700 dark:text-slate-300"
              >
                Password to Encrypt *
              </label>
              <button
                type="button"
                id="generate-password-btn"
                onClick={generateRandomPassword}
                className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Generate Strong</span>
              </button>
            </div>
            <div className="relative">
              <input
                id="credential-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-8 pr-9 py-1.5 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              />
              <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <button
                type="button"
                id="toggle-credential-pw-visibility"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 4-Digit PIN */}
          <div className="space-y-1 p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label
                htmlFor="credential-pin-input"
                className="block text-[11px] font-medium text-slate-800 dark:text-slate-200"
              >
                {hasSettledPin ? 'Enter Settled 4-Digit PIN *' : 'Set Your 4-Digit Security PIN *'}
              </label>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
              >
                {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPin ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {hasSettledPin
                ? 'Enter your settled 4-digit PIN to encrypt this password.'
                : 'Choose a 4-digit PIN. This will become your settled PIN to view all stored passwords.'}
            </p>
            <input
              id="credential-pin-input"
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              required
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="4 digits (e.g. 1234)"
              className="w-full px-3 py-1.5 text-xs font-mono font-bold tracking-widest rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
            />
          </div>

          {/* Optional Notes */}
          <div className="space-y-1">
            <label
              htmlFor="credential-notes-input"
              className="block text-[11px] font-medium text-slate-700 dark:text-slate-300"
            >
              Notes (Optional)
            </label>
            <input
              id="credential-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 2FA recovery keys stored in manager, password rotated quarterly"
              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
            />
          </div>

          {/* Error message */}
          {error && (
            <div
              id="add-credential-error-alert"
              className="flex items-center gap-2 p-2 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              id="add-cred-cancel-btn"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="add-cred-submit-btn"
              disabled={isSubmitting || !email || !password || pin.length !== 4}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Encrypting...' : 'Encrypt & Store'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
