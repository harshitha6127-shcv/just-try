import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  Settings as SettingsIcon,
  User,
  Users,
  Shield,
  Palette,
  HardDrive,
  Info,
  Sun,
  Moon,
  Laptop,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Check,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, setUser, team, setTeam, settings, updateSettings, clearWorkspace, loadDemoWorkspace, addToast } = useApp();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<'profile' | 'team' | 'appearance' | 'data' | 'about'>('profile');

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || '');

  // Team Form
  const [teamName, setTeamName] = useState(team?.name || '');
  const [teamDesc, setTeamDesc] = useState(team?.description || '');

  // Clear dialog
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUser({
      ...user,
      name: name.trim() || user.name,
      email: email.trim() || user.email,
      role: role.trim() || user.role,
    });
    addToast('Profile updated successfully!', 'success');
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    setTeam({
      ...team,
      name: teamName.trim() || team.name,
      description: teamDesc.trim() || team.description,
    });
    addToast('Workspace details saved!', 'success');
  };

  const handleClearAll = () => {
    clearWorkspace();
    setShowClearConfirm(false);
    navigate('/welcome');
  };

  const handleReloadDemo = () => {
    loadDemoWorkspace();
    addToast('Demo workspace reloaded with fresh sample data!', 'success');
    setName('Ambarish');
    setTeamName('Tech Innovators');
  };

  return (
    <div id="settings-page" className="p-3 sm:p-4 max-w-5xl mx-auto space-y-3">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure personal preferences, workspace metadata, and client-side storage.
        </p>
      </div>

      {/* Main Settings Layout (Desktop Left Nav + Right Content) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
        {/* Left Nav Menu */}
        <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-1.5 shadow-2xs space-y-0.5">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'team', label: 'Workspace Details', icon: Users },
            { id: 'appearance', label: 'Appearance & Theme', icon: Palette },
            { id: 'data', label: 'Storage & Reset', icon: HardDrive },
            { id: 'about', label: 'About & Privacy', icon: Info },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/security')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                <span>Security & PIN</span>
              </div>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </button>
          </div>
        </div>

        {/* Right Settings Content */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3 shadow-2xs">
          {/* SECTION 1: PROFILE */}
          {activeSection === 'profile' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Profile Information
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Update your display name and role inside this workspace.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-2.5 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SECTION 2: TEAM */}
          {activeSection === 'team' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Workspace Details
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Update local team metadata and view the unique identifier.
                </p>
              </div>

              <form onSubmit={handleSaveTeam} className="space-y-2.5 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Team Description
                  </label>
                  <textarea
                    rows={2}
                    value={teamDesc}
                    onChange={(e) => setTeamDesc(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-0.5">
                  <div className="text-[10px] font-semibold text-slate-500">Team Workspace ID:</div>
                  <div className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 select-all">
                    {team?.id || 'NO-TEAM'}
                  </div>
                  <div className="text-[10px] text-slate-400 pt-0.5">
                    Created on {team?.createdAt ? new Date(team.createdAt).toLocaleDateString() : '—'} by {team?.creatorName || 'Local User'}
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs"
                  >
                    Save Workspace
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SECTION 3: APPEARANCE */}
          {activeSection === 'appearance' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Appearance & Theme
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Select your interface theme preference.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'light', label: 'Light', icon: Sun, desc: 'Clean high contrast off-white layout' },
                  { id: 'dark', label: 'Dark', icon: Moon, desc: 'Eye-safe deep slate dark mode' },
                  { id: 'system', label: 'System', icon: Laptop, desc: 'Follows operating system settings' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = settings.theme === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateSettings({ theme: item.id as any })}
                      className={`p-2.5 rounded border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {item.label}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: STORAGE & DATA */}
          {activeSection === 'data' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Data & Local Storage
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage browser state, backups, and reset options.
                </p>
              </div>

              <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Quick Actions
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => navigate('/import-export')}
                    className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs shadow-2xs"
                  >
                    Encrypted Export / Import
                  </button>
                  <button
                    type="button"
                    onClick={handleReloadDemo}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-medium text-xs shadow-2xs"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reload Demo Team Data</span>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-3 rounded bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-2">
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Danger Zone: Clear Local Storage</span>
                </div>
                <p className="text-xs text-rose-700/80 dark:text-rose-300/80 leading-relaxed">
                  Permanently deletes all members, projects, tasks, announcements, PIN hashes, and team settings from this browser. This action cannot be reversed unless you have an exported backup.
                </p>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="py-1 px-2.5 rounded text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-2xs"
                >
                  Clear All Local Data & Reset
                </button>
              </div>
            </div>
          )}

          {/* SECTION 5: ABOUT */}
          {activeSection === 'about' && (
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  ◈
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Team Hub
                  </h3>
                  <p className="text-[10px] text-slate-400">Client-Side Team Workspace v1.0.0</p>
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <strong className="text-slate-900 dark:text-slate-100 block text-xs">
                  Core Architecture Guarantee
                </strong>
                <p className="text-[11px]">
                  Team Hub is a 100% client-side application. It does not use any cloud database, remote backend, server-side store, or external authentication providers.
                </p>
                <p className="text-[11px]">
                  All members, projects, tasks, announcements, and audit logs are stored securely inside your browser&apos;s <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded text-[10px]">localStorage</code>.
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <strong className="text-slate-900 dark:text-slate-100 block text-xs">
                  Privacy & Cryptography Notice
                </strong>
                <p className="text-[11px]">
                  Your data stays strictly on this device. Team Hub does not automatically synchronize across computers. When transferring workspaces, use the encrypted Export/Import engine powered by standard Web Crypto API (AES-GCM 256-bit with PBKDF2).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Reset and clear all data?"
        message="This will completely wipe your local Team Hub workspace from this browser, including members, tasks, and settings. Are you sure?"
        confirmLabel="Wipe Workspace"
        isDestructive={true}
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};
