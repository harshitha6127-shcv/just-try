import React, { useState, useRef, useEffect } from 'react';
import { Shield, KeyRound, Lock, Eye, EyeOff, AlertCircle, X, Check } from 'lucide-react';

interface PinPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  title?: string;
  subtitle?: string;
  emailId?: string;
  verifyPinFn?: (pin: string) => Promise<boolean>;
}

export const PinPromptModal: React.FC<PinPromptModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Security PIN Required',
  subtitle,
  emailId,
  verifyPinFn,
}) => {
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [shake, setShake] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isOpen) {
      setPinDigits(['', '', '', '']);
      setError(null);
      setIsVerifying(false);
      setShake(false);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleDigitChange = async (index: number, val: string) => {
    // Only accept numeric digit
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      const nextDigits = [...pinDigits];
      nextDigits[index] = '';
      setPinDigits(nextDigits);
      return;
    }

    const digit = cleaned.slice(-1);
    const nextDigits = [...pinDigits];
    nextDigits[index] = digit;
    setPinDigits(nextDigits);
    setError(null);

    // Auto-advance to next input
    if (index < 3) {
      inputRefs[index + 1].current?.focus();
    } else {
      // 4th digit entered - automatically submit & verify
      const fullPin = nextDigits.join('');
      if (fullPin.length === 4) {
        await handleVerifyPin(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (pinDigits[index] === '' && index > 0) {
        inputRefs[index - 1].current?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs[index + 1].current?.focus();
    } else if (e.key === 'Enter') {
      const fullPin = pinDigits.join('');
      if (fullPin.length === 4) {
        handleVerifyPin(fullPin);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;

    const nextDigits = ['', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      nextDigits[i] = pasted[i];
    }
    setPinDigits(nextDigits);

    if (pasted.length === 4) {
      handleVerifyPin(pasted);
    } else {
      inputRefs[Math.min(pasted.length, 3)].current?.focus();
    }
  };

  const handleVerifyPin = async (candidatePin: string) => {
    if (candidatePin.length !== 4) {
      setError('Please enter all 4 digits of your PIN');
      triggerShake();
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      if (verifyPinFn) {
        const isValid = await verifyPinFn(candidatePin);
        if (!isValid) {
          setError('Incorrect PIN. Settled PIN does not match. Password remains hidden.');
          triggerShake();
          setPinDigits(['', '', '', '']);
          inputRefs[0].current?.focus();
          setIsVerifying(false);
          return;
        }
      }

      // Passed verification
      onSuccess(candidatePin);
      onClose();
    } catch {
      setError('Incorrect PIN. Decryption rejected.');
      triggerShake();
      setPinDigits(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const fullPin = pinDigits.join('');

  return (
    <div
      id="pin-prompt-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div
        id="pin-prompt-modal-container"
        className={`w-full max-w-sm bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-transform duration-200 ${
          shake ? 'animate-bounce text-red-500 ring-2 ring-red-500/50' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Security PIN Authorization</p>
            </div>
          </div>
          <button
            id="pin-prompt-close-btn"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div className="text-center space-y-1">
            {emailId ? (
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Enter your 4-digit PIN to view the password for:
                <span className="block font-mono font-semibold text-slate-900 dark:text-slate-100 mt-0.5 px-2 py-1 bg-slate-100 dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-700">
                  {emailId}
                </span>
              </p>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {subtitle || 'Enter your 4-digit PIN to unlock and view the password.'}
              </p>
            )}
          </div>

          {/* 4 Digit Boxes */}
          <div className="flex justify-center items-center gap-2.5 py-1" onPaste={handlePaste}>
            {pinDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                id={`pin-input-box-${idx}`}
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={isVerifying}
                className={`w-12 h-12 text-center text-lg font-mono font-bold rounded border transition-all ${
                  error
                    ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                    : digit
                    ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/20'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30'
                } focus:outline-hidden`}
              />
            ))}
          </div>

          {/* Mask toggle */}
          <div className="flex items-center justify-between text-[11px] px-1 text-slate-500 dark:text-slate-400">
            <button
              type="button"
              id="pin-toggle-visibility-btn"
              onClick={() => setShowPin(!showPin)}
              className="flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPin ? 'Hide PIN digits' : 'Show PIN digits'}</span>
            </button>
            <span className="text-[10px] text-slate-400">Checked against settled PIN</span>
          </div>

          {/* Error Message */}
          {error && (
            <div
              id="pin-prompt-error-banner"
              className="flex items-start gap-2 p-2.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-[11px]">{error}</p>
                <p className="text-[10px] opacity-80 mt-0.5">
                  Password remains strictly hidden from the screen.
                </p>
              </div>
            </div>
          )}

          {/* Numeric keypad for easy touch / mouse clicking */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                id={`pin-numpad-${num}`}
                onClick={() => {
                  const emptyIdx = pinDigits.findIndex((d) => d === '');
                  if (emptyIdx !== -1) {
                    handleDigitChange(emptyIdx, num.toString());
                  }
                }}
                className="py-2 text-xs font-mono font-medium rounded bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              id="pin-numpad-clear"
              onClick={() => {
                setPinDigits(['', '', '', '']);
                setError(null);
                inputRefs[0].current?.focus();
              }}
              className="py-2 text-[10px] font-medium rounded bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              id="pin-numpad-0"
              onClick={() => {
                const emptyIdx = pinDigits.findIndex((d) => d === '');
                if (emptyIdx !== -1) {
                  handleDigitChange(emptyIdx, '0');
                }
              }}
              className="py-2 text-xs font-mono font-medium rounded bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              0
            </button>
            <button
              type="button"
              id="pin-numpad-backspace"
              onClick={() => {
                const lastFilledIdx = pinDigits.reduce(
                  (acc, curr, idx) => (curr !== '' ? idx : acc),
                  -1
                );
                if (lastFilledIdx !== -1) {
                  const nextDigits = [...pinDigits];
                  nextDigits[lastFilledIdx] = '';
                  setPinDigits(nextDigits);
                  inputRefs[lastFilledIdx].current?.focus();
                }
              }}
              className="py-2 text-[10px] font-medium rounded bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
              ⌫
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            id="pin-prompt-cancel-btn"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="pin-prompt-submit-btn"
            disabled={fullPin.length !== 4 || isVerifying}
            onClick={() => handleVerifyPin(fullPin)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors"
          >
            {isVerifying ? (
              <span className="flex items-center gap-1">Verifying...</span>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Verify & View</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
