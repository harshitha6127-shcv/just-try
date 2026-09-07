import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ActivityItem, ActivityType } from '../types';
import { formatRelativeTime } from '../utils/validators';
import {
  Activity as ActivityIcon,
  Filter,
  Clock,
  User,
  FolderKanban,
  CheckSquare,
  Bell,
  Shield,
  Trash2,
} from 'lucide-react';

export const Activity: React.FC = () => {
  const { activity } = useApp();
  const [filterType, setFilterType] = useState<string>('All');

  const filteredActivity = useMemo(() => {
    if (filterType === 'All') return activity;
    return activity.filter((item) => {
      switch (filterType) {
        case 'Members':
          return item.type === 'MEMBER_ADDED' || item.type === 'MEMBER_UPDATED' || item.type === 'MEMBER_DELETED';
        case 'Projects':
          return item.type === 'PROJECT_CREATED' || item.type === 'PROJECT_UPDATED' || item.type === 'PROJECT_DELETED';
        case 'Tasks':
          return item.type === 'TASK_CREATED' || item.type === 'TASK_UPDATED' || item.type === 'TASK_STATUS_CHANGED';
        case 'Announcements':
          return item.type === 'ANNOUNCEMENT_POSTED';
        case 'Security':
          return item.type === 'SECURITY_PIN_CHANGED' || item.type === 'WORKSPACE_LOCKED' || item.type === 'BACKUP_EXPORTED' || item.type === 'BACKUP_IMPORTED';
        default:
          return true;
      }
    });
  }, [activity, filterType]);

  const getActivityIcon = (type: ActivityType) => {
    if (type.startsWith('MEMBER')) return User;
    if (type.startsWith('PROJECT')) return FolderKanban;
    if (type.startsWith('TASK')) return CheckSquare;
    if (type.startsWith('ANNOUNCEMENT')) return Bell;
    if (type.startsWith('SECURITY') || type.startsWith('WORKSPACE') || type.startsWith('BACKUP')) return Shield;
    return ActivityIcon;
  };

  return (
    <div id="activity-page" className="p-3 sm:p-4 max-w-4xl mx-auto space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Activity Log
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit trail of actions taken in your local workspace.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Members', 'Projects', 'Tasks', 'Announcements', 'Security'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterType(f)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors shrink-0 ${
                filterType === f
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-4 shadow-2xs">
        {filteredActivity.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 space-y-2">
            <ActivityIcon className="w-7 h-7 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              No activity matching &ldquo;{filterType}&rdquo; recorded yet.
            </p>
          </div>
        ) : (
          <div className="relative pl-5 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {filteredActivity.map((item, index) => {
              const Icon = getActivityIcon(item.type);
              const formattedDate = new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={item.id || index} className="relative group">
                  {/* Bullet Node */}
                  <div className="absolute -left-5 top-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-400 flex items-center justify-center text-indigo-600 dark:text-indigo-400 -translate-x-1/2 shadow-2xs">
                    <Icon className="w-2.5 h-2.5" />
                  </div>

                  {/* Content Box */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {item.description}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(item.timestamp)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>Action by: <strong className="text-slate-700 dark:text-slate-300">{item.actorName}</strong></span>
                      {item.targetTitle && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-xs">{item.targetTitle}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
