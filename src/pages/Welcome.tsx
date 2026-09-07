import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateId } from '../utils/idGenerator';
import { isValidEmail } from '../utils/validators';
import { UserProfile, Team } from '../types';
import { Users, Shield, HardDrive, Sparkles, ArrowRight, Upload, PlusCircle, CheckCircle2 } from 'lucide-react';

export const Welcome: React.FC = () => {
  const { user, setUser, setTeam, addMember, loadDemoWorkspace, addToast } = useApp();
  const navigate = useNavigate();

  // Step 1: User Profile
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('Team Owner');
  const [profileError, setProfileError] = useState<string | null>(null);

  // Step 2: Create Team
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [teamName, setTeamName] = useState('Tech Innovators');
  const [teamDesc, setTeamDesc] = useState('Building local-first developer productivity tools and real-time telemetry.');
  const [teamError, setTeamError] = useState<string | null>(null);

  const previewTeamId = React.useMemo(() => generateId('TEAM'), []);

  // Handle Profile Creation
  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    if (!userName.trim()) {
      setProfileError('Please enter your name.');
      return;
    }

    if (!isValidEmail(userEmail)) {
      setProfileError('Please enter a valid email address (used only as your local identifier).');
      return;
    }

    const newUser: UserProfile = {
      id: generateId('USR'),
      name: userName.trim(),
      email: userEmail.trim().toLowerCase(),
      role: userRole,
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    addToast(`Welcome to Team Hub, ${newUser.name}!`, 'success');
  };

  // Handle Team Creation
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    setTeamError(null);

    if (!teamName.trim()) {
      setTeamError('Please enter a team name.');
      return;
    }

    const newTeam: Team = {
      id: previewTeamId,
      name: teamName.trim(),
      description: teamDesc.trim(),
      creatorName: user?.name || 'Local User',
      creatorEmail: user?.email || 'user@local',
      createdAt: new Date().toISOString(),
    };

    setTeam(newTeam);

    // Also register user as first team member
    if (user) {
      addMember({
        name: user.name,
        email: user.email,
        phone: '',
        role: user.role || 'Team Owner',
        department: 'Leadership',
        position: 'Founder & Lead',
        status: 'Active',
        notes: 'Workspace creator',
      });
    }

    addToast(`Workspace "${newTeam.name}" created!`, 'success');
    navigate('/dashboard');
  };

  const handleDemoLoad = () => {
    loadDemoWorkspace();
    navigate('/dashboard');
  };

  return (
    <div
      id="welcome-page"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between text-slate-900 dark:text-slate-100 p-3 sm:p-6 font-sans text-xs"
    >
      {/* Top Brand Bar */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight">
          <span className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-2xs">
            ◈
          </span>
          <span>Team Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded">
            100% Client-Side
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md w-full mx-auto my-auto py-4">
        {!user ? (
          /* STEP 1: CREATE LOCAL PROFILE */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-4 shadow-2xs animate-in fade-in duration-150">
            <div className="w-8 h-8 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 border border-indigo-100 dark:border-indigo-900/40">
              <Users className="w-4 h-4" />
            </div>

            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-0.5">
              Welcome to Team Hub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Create your local workspace profile. All team data is saved directly in your browser&apos;s localStorage with zero cloud databases.
            </p>

            {profileError && (
              <div className="mb-3 p-2 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs border border-rose-100 dark:border-rose-900/40">
                {profileError}
              </div>
            )}

            <form onSubmit={handleCreateProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Ambarish"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address <span className="font-normal text-slate-400">(Local identifier)</span>
                </label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="ambarish@example.com"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Role
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Team Owner">Team Owner</option>
                  <option value="Lead Engineer">Lead Engineer</option>
                  <option value="Product Designer">Product Designer</option>
                  <option value="Team Member">Team Member</option>
                </select>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={handleDemoLoad}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                <Sparkles className="w-3 h-3" />
                <span>Or load Demo Team (Tech Innovators) with sample projects</span>
              </button>
            </div>
          </div>
        ) : !isCreatingTeam ? (
          /* STEP 2: ONBOARDING CHOICES */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-4 shadow-2xs text-center animate-in fade-in duration-150">
            <div className="w-10 h-10 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-100 dark:border-indigo-900/40">
              <HardDrive className="w-5 h-5" />
            </div>

            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-1">
              Welcome to Team Hub, {user.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs mx-auto leading-relaxed">
              Organize your team, projects and tasks in one secure, local-first workspace.
            </p>

            {/* Visual Geometric Workspace Representation */}
            <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-100 dark:border-slate-800 mb-4 max-w-xs mx-auto">
              <div className="h-10 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-1">
                <span className="text-[9px] font-semibold text-slate-400">PROJECTS</span>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">Track Work</span>
              </div>
              <div className="h-10 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-1">
                <span className="text-[9px] font-semibold text-slate-400">TASKS</span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Kanban</span>
              </div>
              <div className="h-10 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-1">
                <span className="text-[9px] font-semibold text-slate-400">CRYPTO</span>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">AES-GCM</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsCreatingTeam(true)}
                className="w-full py-2 px-3 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create New Team</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/import-export')}
                className="w-full py-2 px-3 rounded text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Import Existing Team (.teamhub)</span>
              </button>

              <button
                type="button"
                onClick={handleDemoLoad}
                className="w-full py-1.5 px-3 rounded text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Load Demo Team (Tech Innovators)</span>
              </button>
            </div>
          </div>
        ) : (
          /* STEP 3: CREATE TEAM SCREEN */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-4 shadow-2xs animate-in fade-in duration-150">
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-0.5">
              Create your workspace
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Set up your team identifier and metadata. Everything stays on this machine.
            </p>

            {teamError && (
              <div className="mb-3 p-2 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs border border-rose-100 dark:border-rose-900/40">
                {teamError}
              </div>
            )}

            <form onSubmit={handleCreateTeam} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Tech Innovators"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Team Description
                </label>
                <textarea
                  rows={2}
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  placeholder="What is your team building?"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Workspace Preview</span>
                  <span className="text-indigo-600 dark:text-indigo-400">Team Hub</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {teamName || 'Your Team Name'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {previewTeamId}
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                  Created by <span className="font-semibold text-slate-700 dark:text-slate-300">{user.name}</span> ({user.email})
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingTeam(false)}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 px-3 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-2xs"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="max-w-2xl w-full mx-auto text-center py-2 text-[10px] text-slate-400">
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <Shield className="w-3 h-3 text-indigo-500" />
          <span>No cloud databases • Web Crypto API • Local browser storage only</span>
        </div>
      </footer>
    </div>
  );
};
