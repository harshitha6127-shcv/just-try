import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateInvitationCode } from '../utils/idGenerator';
import { LocalInvitationPayload } from '../types';
import { X, Share2, Copy, Check, Info, Download, Upload, AlertCircle } from 'lucide-react';

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvitationModal: React.FC<InvitationModalProps> = ({ isOpen, onClose }) => {
  const { team, user, addMember, addToast } = useApp();
  const [tab, setTab] = useState<'create' | 'import'>('create');
  const [role, setRole] = useState('Member');
  const [department, setDepartment] = useState('Engineering');
  const [copied, setCopied] = useState(false);
  const [invitationCode, setInvitationCode] = useState(() =>
    generateInvitationCode(team?.id || 'TEAM-LOCAL')
  );

  // Import state
  const [importPayloadText, setImportPayloadText] = useState('');
  const [importName, setImportName] = useState('');
  const [importEmail, setImportEmail] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPayload: LocalInvitationPayload = {
    version: 1,
    invitationCode,
    teamId: team?.id || 'TEAM-LOCAL',
    teamName: team?.name || 'Local Workspace',
    inviterName: user?.name || 'Workspace Owner',
    role,
    department,
    generatedAt: new Date().toISOString(),
  };

  const payloadString = JSON.stringify(currentPayload, null, 2);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(invitationCode);
      setCopied(true);
      addToast('Invitation code copied', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleCopyPayload = async () => {
    try {
      await navigator.clipboard.writeText(payloadString);
      setCopied(true);
      addToast('Full invitation payload copied', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleDownloadPayload = () => {
    const blob = new Blob([payloadString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invitation-${invitationCode}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Invitation file downloaded', 'info');
  };

  const handleImportAccept = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);

    if (!importName.trim() || !importEmail.trim()) {
      setImportError('Please enter your name and email to accept.');
      return;
    }

    try {
      let parsed: LocalInvitationPayload;
      if (importPayloadText.trim().startsWith('{')) {
        parsed = JSON.parse(importPayloadText);
      } else {
        // Simple code fallback
        parsed = {
          version: 1,
          invitationCode: importPayloadText.trim(),
          teamId: team?.id || 'TEAM-LOCAL',
          teamName: team?.name || 'Workspace',
          inviterName: 'Admin',
          role: 'Member',
          department: 'General',
          generatedAt: new Date().toISOString(),
        };
      }

      const res = addMember({
        name: importName.trim(),
        email: importEmail.trim().toLowerCase(),
        phone: '',
        role: parsed.role || 'Member',
        department: parsed.department || 'General',
        position: 'Invited Member',
        status: 'Active',
        notes: `Accepted invitation ${parsed.invitationCode}`,
      });

      if (res.success) {
        addToast('Invitation accepted and member added locally!', 'success');
        onClose();
      } else {
        setImportError(res.error || 'Failed to add member.');
      }
    } catch {
      setImportError('Invalid invitation format. Please paste valid invitation JSON or code.');
    }
  };

  return (
    <div
      id="invitation-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-2xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="invitation-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invitation-modal-title"
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-lg p-3.5 sm:p-4 transition-all my-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Share2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 id="invitation-modal-title" className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Workspace Invitation
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Local-first member invitation generator
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Local-first honest disclaimer */}
        <div className="mb-3 p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Local Workspace Notice:</strong> Team Hub does not use a server to synchronize invitations. The recipient must manually import or accept the invitation on their device.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded bg-slate-100 dark:bg-slate-800 p-0.5 mb-3 text-xs font-medium">
          <button
            type="button"
            onClick={() => setTab('create')}
            className={`flex-1 py-1 rounded transition-colors ${
              tab === 'create'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Generate Invitation
          </button>
          <button
            type="button"
            onClick={() => setTab('import')}
            className={`flex-1 py-1 rounded transition-colors ${
              tab === 'import'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Accept / Import
          </button>
        </div>

        {tab === 'create' ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                  Invited Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="Member">Team Member</option>
                  <option value="Lead">Lead Engineer</option>
                  <option value="Admin">Administrator</option>
                  <option value="Guest">Guest</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Generated Code Box */}
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-0.5">
                Invitation Code
              </span>
              <div className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 select-all">
                {invitationCode}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-medium rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>Copy Code</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPayload}
                className="flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-medium rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Share2 className="w-3 h-3" />
                <span>Copy JSON</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPayload}
                className="flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-medium rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleImportAccept} className="space-y-2.5">
            {importError && (
              <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={importName}
                onChange={(e) => setImportName(e.target.value)}
                placeholder="e.g. Jordan Miller"
                className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                Your Email *
              </label>
              <input
                type="email"
                required
                value={importEmail}
                onChange={(e) => setImportEmail(e.target.value)}
                placeholder="jordan@example.com"
                className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                Invitation Code or JSON Payload *
              </label>
              <textarea
                rows={2}
                required
                value={importPayloadText}
                onChange={(e) => setImportPayloadText(e.target.value)}
                placeholder="Paste code (e.g. TEAM-8F42K1-INV-29X8) or exported JSON..."
                className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-1.5 px-3 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Accept & Join Local Workspace</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
