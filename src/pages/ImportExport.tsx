import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { encryptBackup, decryptBackup } from '../services/encryption';
import { InvitationModal } from '../components/InvitationModal';
import { TeamHubExportPayload } from '../types';
import {
  ArrowUpDown,
  Download,
  Upload,
  Shield,
  FileCheck,
  AlertCircle,
  Share2,
  Lock,
  Unlock,
  CheckCircle2,
} from 'lucide-react';

export const ImportExport: React.FC = () => {
  const { team, members, projects, tasks, announcements, activity, settings, importWorkspaceData, addToast } = useApp();
  const navigate = useNavigate();

  // Export state
  const [encryptExport, setEncryptExport] = useState(true);
  const [exportPassword, setExportPassword] = useState('');
  const [exportConfirmPassword, setExportConfirmPassword] = useState('');
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPassword, setImportPassword] = useState('');
  const [isEncryptedFile, setIsEncryptedFile] = useState(false);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Invitation Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // HANDLE EXPORT
  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setExportError(null);

    if (!team) {
      setExportError('No active workspace to export. Please load or create a team first.');
      return;
    }

    if (encryptExport) {
      if (!exportPassword) {
        setExportError('Please provide an encryption password for the backup file.');
        return;
      }
      if (exportPassword !== exportConfirmPassword) {
        setExportError('Export passwords do not match.');
        return;
      }
    }

    setIsExporting(true);
    try {
      const payload: TeamHubExportPayload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        isEncrypted: encryptExport,
        team,
        members,
        projects,
        tasks,
        announcements,
        activity,
      };

      let downloadContent: string;
      let filename = `${team.name.toLowerCase().replace(/\s+/g, '-')}-backup.teamhub`;

      if (encryptExport) {
        downloadContent = await encryptBackup(payload, exportPassword);
      } else {
        downloadContent = JSON.stringify(payload, null, 2);
      }

      const blob = new Blob([downloadContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      addToast('Backup exported and downloaded successfully!', 'success');
      setExportPassword('');
      setExportConfirmPassword('');
    } catch (err: any) {
      setExportError(err.message || 'Failed to generate backup.');
    } finally {
      setIsExporting(false);
    }
  };

  // HANDLE FILE SELECTION
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed.isEncrypted) {
        setIsEncryptedFile(true);
      } else {
        setIsEncryptedFile(false);
      }
    } catch {
      setImportError('Unable to read selected file as JSON.');
    }
  };

  // HANDLE IMPORT
  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);

    if (!importFile) {
      setImportError('Please select a backup file (.teamhub or .json).');
      return;
    }

    setIsImporting(true);
    try {
      const text = await importFile.text();
      let payload: TeamHubExportPayload;

      const raw = JSON.parse(text);
      if (raw.isEncrypted) {
        if (!importPassword) {
          setImportError('This backup is encrypted. Please enter the decryption password.');
          setIsImporting(false);
          return;
        }
        payload = await decryptBackup(raw, importPassword);
      } else {
        payload = raw;
      }

      // Validate payload structure
      if (!payload.team || !payload.members || !payload.projects) {
        throw new Error('Invalid Team Hub backup file format.');
      }

      importWorkspaceData(payload, importMode);
      addToast(`Workspace "${payload.team.name}" imported successfully!`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setImportError(err.message || 'Import failed. Check your password or file integrity.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div id="import-export-page" className="p-3 sm:p-4 max-w-5xl mx-auto space-y-3">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Import & Export Team Workspace
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Back up your workspace or restore data to another browser with client-side cryptography.
        </p>
      </div>

      {/* Privacy Notice Card */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded p-2.5 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">
            Your data stays on your device
          </strong>
          Team Hub does not automatically synchronize your team across devices or cloud servers.
          Export an encrypted <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">.teamhub</code> backup file to transfer data to another machine, or share via local invitation codes.
        </div>
      </div>

      {/* 2 Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* EXPORT CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3 shadow-2xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2.5">
              <div className="w-6 h-6 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Download className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Export Team Backup
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Package your local workspace into a portable file
                </p>
              </div>
            </div>

            {exportError && (
              <div className="mb-2.5 p-2 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{exportError}</span>
              </div>
            )}

            <form id="export-form" onSubmit={handleExport} className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-0.5 text-[11px] text-slate-500">
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Backup includes:
                </div>
                <div>• Team: {team?.name || 'No team'}</div>
                <div>• {members.length} team members</div>
                <div>• {projects.length} projects & {tasks.length} tasks</div>
                <div>• {announcements.length} announcements & {activity.length} activity logs</div>
              </div>

              <div className="pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={encryptExport}
                    onChange={(e) => setEncryptExport(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span className="flex items-center gap-1.5 text-xs">
                    <Lock className="w-3 h-3 text-indigo-500" />
                    Encrypt file with AES-GCM 256-bit password
                  </span>
                </label>
              </div>

              {encryptExport && (
                <div className="space-y-2 pt-0.5 animate-in fade-in duration-150">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Encryption Password
                    </label>
                    <input
                      type="password"
                      required
                      value={exportPassword}
                      onChange={(e) => setExportPassword(e.target.value)}
                      placeholder="Choose a strong password..."
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={exportConfirmPassword}
                      onChange={(e) => setExportConfirmPassword(e.target.value)}
                      placeholder="Confirm password..."
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </form>
          </div>

          <button
            type="submit"
            form="export-form"
            disabled={isExporting}
            className="w-full py-1.5 px-2.5 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-2xs flex items-center justify-center gap-1.5 mt-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Encrypting & Packaging...' : 'Download .teamhub Backup'}</span>
          </button>
        </div>

        {/* IMPORT CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3 shadow-2xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2.5">
              <div className="w-6 h-6 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Upload className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Import Team Backup
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Restore or merge data from a .teamhub file
                </p>
              </div>
            </div>

            {importError && (
              <div className="mb-2.5 p-2 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <form id="import-form" onSubmit={handleImport} className="space-y-2.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Select Backup File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".teamhub,.json"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-2.5 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              {isEncryptedFile && (
                <div className="p-2.5 rounded bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1 text-indigo-700 dark:text-indigo-300 font-semibold">
                    <Lock className="w-3 h-3" />
                    <span className="text-xs">Encrypted File Detected</span>
                  </div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400">
                    Enter Decryption Password
                  </label>
                  <input
                    type="password"
                    required
                    value={importPassword}
                    onChange={(e) => setImportPassword(e.target.value)}
                    placeholder="Password used during export..."
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Import Action
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-1.5 p-1.5 rounded border border-slate-200 dark:border-slate-700 cursor-pointer bg-slate-50 dark:bg-slate-800/40">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Replace current</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-1.5 rounded border border-slate-200 dark:border-slate-700 cursor-pointer bg-slate-50 dark:bg-slate-800/40">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Merge items</span>
                  </label>
                </div>
              </div>
            </form>
          </div>

          <button
            type="submit"
            form="import-form"
            disabled={isImporting || !importFile}
            className="w-full py-1.5 px-2.5 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-colors shadow-2xs flex items-center justify-center gap-1.5 mt-2"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isImporting ? 'Decrypting & Importing...' : 'Import & Restore Team'}</span>
          </button>
        </div>
      </div>

      {/* Local Invitation Quick Link */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
            <Share2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Need to invite or transfer single members?
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Generate portable local invitation codes or accept member invitations.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="px-2.5 py-1 rounded text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shrink-0 shadow-2xs"
        >
          Open Invitation Center
        </button>
      </div>

      <InvitationModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </div>
  );
};
