import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  Menu,
  Bell,
  Activity,
  ShieldCheck,
  ArrowUpDown,
  Settings,
  Lock,
  X,
  LogOut,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { team, settings, lockWorkspace, clearWorkspace } = useApp();
  const navigate = useNavigate();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors ${
      isActive
        ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
    }`;

  return (
    <>
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 h-12 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-30 flex items-center justify-around px-2"
      >
        <NavLink to="/dashboard" className={navItemClass}>
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/members" className={navItemClass}>
          <Users className="w-4 h-4" />
          <span>Members</span>
        </NavLink>
        <NavLink to="/projects" className={navItemClass}>
          <FolderKanban className="w-4 h-4" />
          <span>Projects</span>
        </NavLink>
        <NavLink to="/tasks" className={navItemClass}>
          <CheckSquare className="w-4 h-4" />
          <span>Tasks</span>
        </NavLink>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-2 text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          <Menu className="w-4 h-4" />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div
          id="mobile-drawer-backdrop"
          className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex flex-col justify-end"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            id="mobile-drawer-sheet"
            className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-xl p-3.5 shadow-xl space-y-3 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {team?.name || 'Team Hub'}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {team?.id || 'Local Workspace'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate('/announcements');
                }}
                className="flex items-center gap-2 p-2 rounded bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-xs font-medium text-left hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Bell className="w-3.5 h-3.5 text-indigo-500" />
                <span>Announcements</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate('/activity');
                }}
                className="flex items-center gap-2 p-2 rounded bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-xs font-medium text-left hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                <span>Activity</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate('/security');
                }}
                className="flex items-center gap-2 p-2 rounded bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-xs font-medium text-left hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Security</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate('/import-export');
                }}
                className="flex items-center gap-2 p-2 rounded bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-xs font-medium text-left hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
                <span>Import / Export</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate('/settings');
                }}
                className="flex items-center gap-2 p-2 rounded bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-xs font-medium text-left hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Settings className="w-3.5 h-3.5 text-indigo-500" />
                <span>Settings</span>
              </button>

              {settings.pinEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    lockWorkspace();
                  }}
                  className="flex items-center gap-2 p-2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-medium text-left"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Lock Workspace</span>
                </button>
              )}
            </div>

            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  clearWorkspace();
                  navigate('/welcome');
                }}
                className="w-full flex items-center justify-center gap-1.5 p-2 rounded text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch / Reset Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
