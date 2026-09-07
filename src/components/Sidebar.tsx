import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  Bell,
  Activity,
  ShieldCheck,
  KeyRound,
  ArrowUpDown,
  Settings,
  Lock,
  LogOut,
  ChevronDown,
  User,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, team, lockWorkspace, clearWorkspace, loadDemoWorkspace, settings, members, tasks, announcements, credentials } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors select-none ${
      isActive
        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
    }`;

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'TH';

  const pendingTasksCount = tasks.filter((t) => t.status !== 'COMPLETED').length;
  const unreadAnnouncementsCount = announcements.filter(
    (a) => !a.readBy?.includes(user?.id || 'current_user')
  ).length;

  return (
    <aside
      id="app-sidebar"
      className="hidden md:flex flex-col w-56 h-screen shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 select-none z-30 justify-between text-xs"
    >
      <div className="flex flex-col min-h-0 flex-1">
        {/* Workspace Header */}
        <div className="h-12 border-b border-slate-100 dark:border-slate-800 flex items-center px-3 gap-2.5 shrink-0">
          <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-[11px] shadow-xs shrink-0">
            ◈
          </div>
          <div className="flex flex-col flex-1 min-w-0 leading-tight">
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-xs">
              {team?.name || 'Team Hub'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
              {team ? 'Local Workspace' : 'No Workspace'}
            </span>
          </div>
          <span className="text-[9px] uppercase font-mono tracking-wider px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            LOCAL
          </span>
        </div>

        {/* Quick Workspace state banner if no team */}
        {!team && (
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={loadDemoWorkspace}
              className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100/70 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Load Demo Data</span>
            </button>
          </div>
        )}

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          <div>
            <div className="px-2 mb-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Workspace
            </div>
            <nav className="space-y-0.5">
              <NavLink to="/dashboard" className={navItemClass}>
                <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-500" />
                <span className="flex-1">Dashboard</span>
              </NavLink>
              <NavLink to="/members" className={navItemClass}>
                <Users className="w-4 h-4 shrink-0 text-slate-500" />
                <span className="flex-1">Team Members</span>
                {members.length > 0 && (
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded-full font-semibold">
                    {members.length}
                  </span>
                )}
              </NavLink>
              <NavLink to="/projects" className={navItemClass}>
                <FolderKanban className="w-4 h-4 shrink-0 text-slate-500" />
                <span className="flex-1">Projects</span>
              </NavLink>
              <NavLink to="/tasks" className={navItemClass}>
                <CheckSquare className="w-4 h-4 shrink-0 text-slate-500" />
                <span className="flex-1">Tasks</span>
                {pendingTasksCount > 0 && (
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.2 rounded-full font-semibold">
                    {pendingTasksCount}
                  </span>
                )}
              </NavLink>
              <NavLink to="/announcements" className={navItemClass}>
                <Bell className="w-4 h-4 shrink-0 text-slate-500" />
                <span className="flex-1">Announcements</span>
                {unreadAnnouncementsCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                )}
              </NavLink>
              <NavLink to="/activity" className={navItemClass}>
                <Activity className="w-4 h-4 shrink-0 text-slate-500" />
                <span className="flex-1">Activity</span>
              </NavLink>
            </nav>
          </div>

          <div>
            <div className="px-2 mb-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Management
            </div>
            <nav className="space-y-0.5">
              <NavLink to="/passwords" className={navItemClass}>
                <KeyRound className="w-4 h-4 shrink-0 text-slate-500" />
                <span className="flex-1">Password Vault</span>
                {credentials.length > 0 && (
                  <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded-full font-semibold border border-indigo-200 dark:border-indigo-800">
                    {credentials.length}
                  </span>
                )}
              </NavLink>
              <NavLink to="/security" className={navItemClass}>
                <ShieldCheck className="w-4 h-4 shrink-0 text-slate-500" />
                <span className="flex-1">Security</span>
                {settings.pinEnabled && (
                  <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                )}
              </NavLink>
              <NavLink to="/import-export" className={navItemClass}>
                <ArrowUpDown className="w-4 h-4 shrink-0 text-slate-500" />
                <span className="flex-1">Import / Export</span>
              </NavLink>
              <NavLink to="/settings" className={navItemClass}>
                <Settings className="w-4 h-4 shrink-0 text-slate-500" />
                <span className="flex-1">Settings</span>
              </NavLink>
            </nav>
          </div>
        </div>
      </div>

      {/* User Profile Footer with Dropdown */}
      <div
        ref={dropdownRef}
        className="relative p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0"
      >
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="w-full flex items-center justify-between gap-2 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs">
              {userInitials}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                {user?.name || 'Local User'}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {user?.role || 'Team Member'}
              </div>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div
            id="sidebar-user-dropdown"
            className="absolute bottom-full left-2 right-2 mb-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg p-1 z-40 animate-in fade-in zoom-in-95 duration-100 space-y-0.5 text-xs"
          >
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                navigate('/settings');
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Profile Details</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                navigate('/settings');
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Workspace Settings</span>
            </button>
            {settings.pinEnabled && (
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  lockWorkspace();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Lock Workspace</span>
              </button>
            )}
            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                clearWorkspace();
                navigate('/welcome');
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch / Reset Team</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
