import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DashboardCard } from '../components/DashboardCard';
import { MemberModal } from '../components/MemberModal';
import { ProjectModal } from '../components/ProjectModal';
import { TaskModal } from '../components/TaskModal';
import { AnnouncementModal } from '../components/AnnouncementModal';
import { formatRelativeTime } from '../utils/validators';
import {
  Users,
  FolderKanban,
  CheckSquare,
  CheckCircle2,
  Plus,
  UserPlus,
  ArrowRight,
  Bell,
  ArrowUpDown,
  Pin,
  Clock,
  ChevronDown,
  KeyRound,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, team, members, projects, tasks, announcements, activity, addMember, addProject, addTask, addAnnouncement } = useApp();
  const navigate = useNavigate();

  // Modals state
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setNewMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Teammate';

  // Statistics
  const activeProjectsCount = projects.filter((p) => p.status === 'Active').length;
  const pendingTasksCount = tasks.filter((t) => t.status !== 'COMPLETED').length;
  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div id="dashboard-page" className="p-3 sm:p-4 lg:p-5 max-w-7xl mx-auto space-y-4">
      {/* Top Greeting & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {greeting}, {firstName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Here&apos;s what&apos;s happening with your team today.
          </p>
        </div>

        {/* + New Button Dropdown */}
        <div ref={menuRef} className="relative self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setNewMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {newMenuOpen && (
            <div
              id="new-action-menu"
              className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-1 z-40 animate-in fade-in zoom-in-95 duration-100 space-y-0.5 text-xs"
            >
              <button
                type="button"
                onClick={() => {
                  setNewMenuOpen(false);
                  setShowMemberModal(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-left"
              >
                <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
                <span>Add Member</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewMenuOpen(false);
                  setShowProjectModal(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-left"
              >
                <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
                <span>Create Project</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewMenuOpen(false);
                  setShowTaskModal(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-left"
              >
                <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                <span>Create Task</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewMenuOpen(false);
                  setShowAnnouncementModal(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-left"
              >
                <Bell className="w-3.5 h-3.5 text-indigo-500" />
                <span>Announcement</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewMenuOpen(false);
                  navigate('/passwords');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-left border-t border-slate-100 dark:border-slate-800"
              >
                <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                <span>Store Password</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4 Compact Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <DashboardCard
          id="stat-members"
          title="TEAM MEMBERS"
          value={members.length}
          trend={members.length > 0 ? `↑ ${Math.min(members.length, 2)} active` : undefined}
          subtext={`${team?.name || 'Local workspace'}`}
          icon={Users}
        />
        <DashboardCard
          id="stat-projects"
          title="ACTIVE PROJECTS"
          value={activeProjectsCount}
          trend={activeProjectsCount > 0 ? `${activeProjectsCount} in progress` : undefined}
          subtext={`${projects.length} total projects`}
          icon={FolderKanban}
        />
        <DashboardCard
          id="stat-tasks"
          title="PENDING TASKS"
          value={pendingTasksCount}
          subtext="Requires attention"
          icon={CheckSquare}
        />
        <DashboardCard
          id="stat-completed"
          title="COMPLETED"
          value={completedTasksCount}
          trend={tasks.length > 0 ? `↑ ${Math.round((completedTasksCount / tasks.length) * 100)}%` : undefined}
          subtext="Completed across projects"
          icon={CheckCircle2}
        />
      </div>

      {/* Quick Actions Bar */}
      <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
          Quick Actions
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowMemberModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
            <span>Add Member</span>
          </button>
          <button
            type="button"
            onClick={() => setShowProjectModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
            <span>New Project</span>
          </button>
          <button
            type="button"
            onClick={() => setShowTaskModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
            <span>New Task</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAnnouncementModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-indigo-500" />
            <span>Announcement</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/passwords')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
            <span>Password Vault</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/import-export')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
            <span>Export Backup</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Project Overview, Right = Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Project Overview (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Project Overview
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Tracking milestones and completion rates
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-1.5">
              <p>No projects created yet</p>
              <button
                type="button"
                onClick={() => setShowProjectModal(true)}
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline text-xs"
              >
                + Create your first project
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.slice(0, 4).map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => navigate('/projects')}
                  className="p-2.5 rounded bg-slate-50/75 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {proj.name}
                    </span>
                    <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                      {proj.progress}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                    <span>Due {proj.deadline}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      {proj.priority} Priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Timeline (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Recent Activity
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Latest updates across your workspace
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/activity')}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>History</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {activity.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No activity recorded yet
            </div>
          ) : (
            <div className="space-y-2.5">
              {activity.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-800 dark:text-slate-200 leading-snug">
                      {act.description}
                    </p>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {formatRelativeTime(act.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Announcements Feed Preview */}
      {announcements.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-indigo-500" />
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Announcements
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/announcements')}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {announcements.slice(0, 2).map((ann) => (
              <div
                key={ann.id}
                className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {ann.title}
                  </span>
                  {ann.pinned && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                      <Pin className="w-3 h-3" />
                      Pinned
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {ann.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <MemberModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        onSubmit={addMember}
      />
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSubmit={addProject}
      />
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={addTask}
      />
      <AnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        onSubmit={addAnnouncement}
      />
    </div>
  );
};
