import React, { useState, useMemo } from 'react';
import {
  KeyRound,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Trash2,
  Search,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Mail,
  Clock,
  Sparkles,
  Info,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PinPromptModal } from '../components/PinPromptModal';
import { SetPinModal } from '../components/SetPinModal';
import { AddCredentialModal } from '../components/AddCredentialModal';
import { EncryptedCredential } from '../types';

export const PasswordVault: React.FC = () => {
  const {
    credentials,
    deleteCredential,
    decryptCredentialPasswordForEmail,
    verifySettledPin,
    hasSettledPin,
    settings,
    addToast,
    addCredential,
  } = useApp();

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSetPinOpen, setIsSetPinOpen] = useState(false);

  // Per-credential unlock state: map of credId -> decrypted plaintext password
  const [unlockedPasswords, setUnlockedPasswords] = useState<Record<string, string>>({});
  // Per-credential incorrect PIN alert state: map of credId -> error message
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  // Active PIN prompt target
  const [pinPromptTarget, setPinPromptTarget] = useState<EncryptedCredential | null>(null);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered credentials list
  const filteredCredentials = useMemo(() => {
    if (!searchQuery.trim()) return credentials;
    const q = searchQuery.toLowerCase();
    return credentials.filter(
      (c) =>
        c.email.toLowerCase().includes(q) ||
        (c.label && c.label.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q))
    );
  }, [credentials, searchQuery]);

  // Handle clicking "View Password"
  const handleRequestView = (cred: EncryptedCredential) => {
    // If already unlocked, user can just see it or toggle hide
    if (unlockedPasswords[cred.id]) {
      // Re-hide
      const next = { ...unlockedPasswords };
      delete next[cred.id];
      setUnlockedPasswords(next);
      return;
    }

    if (!hasSettledPin) {
      // User must first settle a 4-digit PIN
      setIsSetPinOpen(true);
      return;
    }

    // Clear previous row error
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[cred.id];
      return next;
    });

    // Open PIN prompt
    setPinPromptTarget(cred);
  };

  // Called after entering 4-digit PIN in modal
  const handlePinSubmitted = async (enteredPin: string) => {
    if (!pinPromptTarget) return;

    const targetCred = pinPromptTarget;

    // Check if the entered PIN equals the settled PIN and decrypts password
    const result = await decryptCredentialPasswordForEmail(targetCred.id, enteredPin);

    if (result.success && result.password) {
      // EQUAL: Reveal the entered password for respective email ID
      setUnlockedPasswords((prev) => ({
        ...prev,
        [targetCred.id]: result.password!,
      }));
      setRowErrors((prev) => {
        const next = { ...prev };
        delete next[targetCred.id];
        return next;
      });
      addToast(`Password unlocked for ${targetCred.email}`, 'success');
    } else {
      // NOT EQUAL: Show incorrect pin and keep entered password hidden from UI
      const errorMsg = result.error || 'Incorrect PIN. Password remains hidden.';
      setRowErrors((prev) => ({
        ...prev,
        [targetCred.id]: errorMsg,
      }));
      // Ensure password is not unlocked
      setUnlockedPasswords((prev) => {
        const next = { ...prev };
        delete next[targetCred.id];
        return next;
      });
      addToast(`Incorrect PIN! Password kept hidden for ${targetCred.email}`, 'error');
    }

    setPinPromptTarget(null);
  };

  // Copy password to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('Password copied to clipboard', 'info');
    setTimeout(() => {
      setCopiedId((curr) => (curr === id ? null : curr));
    }, 2000);
  };

  // Lock all currently unlocked passwords
  const handleLockAll = () => {
    setUnlockedPasswords({});
    setRowErrors({});
    addToast('All revealed passwords masked and locked', 'info');
  };

  // Seed sample demo credentials if empty for instant testing
  const handleSeedDemoCredentials = async () => {
    const demoPin = '1234';
    await addCredential({
      email: 'ambarish@techinnovators.io',
      password: 'Secr3t!Studio#2026',
      label: 'Workspace Founder Email',
      notes: 'Primary Google Workspace and cloud access account',
      pin: demoPin,
    });
    await addCredential({
      email: 'sarah.c@techinnovators.io',
      password: 'UI-Engine@Pass_889!',
      label: 'Frontend Systems & GitHub',
      notes: 'Organization SSO credentials',
      pin: demoPin,
    });
    addToast('Demo credentials stored with PIN 1234', 'success');
  };

  return (
    <div id="password-vault-page" className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Encrypted Password Vault
              </h1>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                AES-GCM 256-Bit
              </span>
              {hasSettledPin ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  <span>PIN Settled</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-3 h-3" />
                  <span>No PIN Settled</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Store encrypted passwords for respective email IDs protected by your 4-digit PIN.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="configure-pin-btn"
            onClick={() => setIsSetPinOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
            <span>{hasSettledPin ? 'Change 4-Digit PIN' : 'Set 4-Digit PIN'}</span>
          </button>

          <button
            id="add-credential-btn"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Store Password</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
            Stored Credentials
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-base font-semibold text-slate-800 dark:text-slate-200">
              {credentials.length}
            </span>
            <span className="text-[10px] text-slate-400">Email IDs</span>
          </div>
        </div>

        <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
            Settled 4-Digit PIN
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {hasSettledPin ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Enforced & Active
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Pending Setup
                </span>
              </>
            )}
          </div>
        </div>

        <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
            Session Unlocked
          </span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-base font-semibold text-slate-800 dark:text-slate-200">
              {Object.keys(unlockedPasswords).length}
            </span>
            {Object.keys(unlockedPasswords).length > 0 && (
              <button
                type="button"
                id="lock-all-revealed-btn"
                onClick={handleLockAll}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                <Lock className="w-3 h-3" />
                <span>Lock All</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
            Cryptographic Cipher
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
              AES-GCM-256
            </span>
            <span className="text-[10px] text-slate-400">100k PBKDF2</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            id="search-credentials-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by email or service..."
            className="w-full pl-8 pr-3 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Showing {filteredCredentials.length} of {credentials.length} credentials
          </span>
          {credentials.length === 0 && (
            <button
              type="button"
              id="seed-demo-credentials-btn"
              onClick={handleSeedDemoCredentials}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Load Sample Demo (PIN: 1234)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Credentials Table */}
      <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        {filteredCredentials.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {credentials.length === 0
                  ? 'No Passwords Stored Yet'
                  : 'No credentials match your filter'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-0.5">
                {credentials.length === 0
                  ? 'Store passwords for respective email IDs. Each password is encrypted with AES-256 and revealed only when the entered PIN matches the settled PIN.'
                  : 'Try adjusting your search query.'}
              </p>
            </div>
            {credentials.length === 0 && (
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  id="empty-state-store-btn"
                  onClick={() => setIsAddOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Store First Password</span>
                </button>
                <button
                  type="button"
                  id="empty-state-demo-btn"
                  onClick={handleSeedDemoCredentials}
                  className="px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Load Demo Accounts
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Email ID</th>
                  <th className="py-2.5 px-3">Service / Label</th>
                  <th className="py-2.5 px-3">Encryption Status</th>
                  <th className="py-2.5 px-3 min-w-[220px]">Stored Password</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCredentials.map((cred) => {
                  const isUnlocked = Boolean(unlockedPasswords[cred.id]);
                  const plaintextPassword = unlockedPasswords[cred.id];
                  const hasError = Boolean(rowErrors[cred.id]);
                  const errorMessage = rowErrors[cred.id];

                  return (
                    <tr
                      key={cred.id}
                      id={`credential-row-${cred.id}`}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Email ID */}
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-mono">{cred.email}</span>
                        </div>
                        {cred.notes && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs">
                            {cred.notes}
                          </p>
                        )}
                      </td>

                      {/* Service / Label */}
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {cred.label || 'Email Account'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        {isUnlocked ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <Unlock className="w-3 h-3" />
                            <span>Revealed via PIN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Encrypted & Locked</span>
                          </span>
                        )}
                      </td>

                      {/* Stored Password Column with PIN Gate */}
                      <td className="py-2.5 px-3">
                        <div className="space-y-1">
                          {isUnlocked ? (
                            /* Plaintext password revealed because entered PIN equaled settled PIN */
                            <div className="flex items-center gap-1.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded px-2 py-1">
                              <span className="font-mono text-xs font-semibold text-emerald-900 dark:text-emerald-200 select-all">
                                {plaintextPassword}
                              </span>
                              <div className="flex items-center gap-1 ml-auto shrink-0">
                                <button
                                  type="button"
                                  id={`copy-pw-${cred.id}`}
                                  onClick={() => handleCopy(cred.id, plaintextPassword)}
                                  className="p-1 rounded text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                                  title="Copy Password"
                                >
                                  {copiedId === cred.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  id={`hide-pw-${cred.id}`}
                                  onClick={() => handleRequestView(cred)}
                                  className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800"
                                  title="Hide Password"
                                >
                                  <EyeOff className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Hidden Password representation */
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs tracking-widest text-slate-500 select-none">
                                <Lock className="w-3 h-3 text-slate-400" />
                                <span>••••••••••••</span>
                              </div>
                              <button
                                type="button"
                                id={`view-pw-btn-${cred.id}`}
                                onClick={() => handleRequestView(cred)}
                                className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View Password</span>
                              </button>
                            </div>
                          )}

                          {/* If entered PIN was not equal to settled PIN: Show incorrect PIN error and keep hidden */}
                          {hasError && !isUnlocked && (
                            <div
                              id={`error-banner-${cred.id}`}
                              className="flex items-center gap-1.5 text-[10px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/60 animate-in fade-in"
                            >
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span className="font-semibold">{errorMessage}</span>
                              <span className="opacity-80">
                                — Password hidden from UI
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          id={`delete-cred-${cred.id}`}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Are you sure you want to delete stored password for ${cred.email}?`
                              )
                            ) {
                              deleteCredential(cred.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete Stored Password"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security Architecture Explainer Banner */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-800 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Cryptographic Guarantees & 4-Digit PIN Gate</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          1. <strong>Strict PIN Verification</strong>: When attempting to view any stored password,
          the system checks whether the <strong>entered PIN is equal to the settled PIN</strong>.
          <br />
          2. <strong>Protection against Incorrect PIN</strong>: If the entered PIN does not match the
          settled PIN, the application displays an <strong>Incorrect PIN</strong> notification,
          aborts decryption, and keeps the entered password completely hidden from the UI.
          <br />
          3. <strong>Zero Plaintext Storage</strong>: Passwords are encrypted client-side using
          authenticated AES-GCM 256-bit with unique 16-byte cryptographic salts and 12-byte initialization
          vectors (IVs).
        </p>
      </div>

      {/* PIN Prompt Modal */}
      <PinPromptModal
        isOpen={Boolean(pinPromptTarget)}
        onClose={() => setPinPromptTarget(null)}
        onSuccess={handlePinSubmitted}
        emailId={pinPromptTarget?.email}
        verifyPinFn={verifySettledPin}
      />

      {/* Set PIN Modal */}
      <SetPinModal
        isOpen={isSetPinOpen}
        onClose={() => setIsSetPinOpen(false)}
      />

      {/* Add Credential Modal */}
      <AddCredentialModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
    </div>
  );
};
