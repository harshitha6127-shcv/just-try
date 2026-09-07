import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, Bell, Sun, Moon, Laptop, Sparkles, Check, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, announcements, settings, updateSettings, setIsSearchOpen, loadDemoWorkspace, team } = useApp();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/members')) return 'Team Members';
    if (path.startsWith('/projects')) return 'Projects';
    if (path.startsWith('/tasks')) return 'Tasks';
    if (path.startsWith('/announcements')) return 'Announcements';
    if (path.startsWith('/activity')) return 'Activity';
    if (path.startsWith('/security')) return 'Security';
    if (path.startsWith('/import-export')) return 'Import / Export';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Team Hub';
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'TH';

  const unreadAnnouncements = announcements.filter(
    (a) => !a.readBy?.includes(user?.id || 'current_user')
  );

  return (
    <header
      id="top-header"
      className="h-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-4 flex items-center justify-between sticky top-0 z-20 shrink-0"
    >
      {/* Page Title / Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
          {getPageTitle()}
        </span>
        {team && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="truncate max-w-[160px] font-medium">{team.name}</span>
          </span>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* If no team loaded, offer quick demo button */}
        {!team && (
          <button
            type="button"
            onClick={loadDemoWorkspace}
            className="hidden sm:flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span>Load Demo</span>
          </button>
        )}

        {/* Global Search Button */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-colors text-xs"
          aria-label="Search Team Hub"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden lg:inline text-slate-400 dark:text-slate-500 text-[11px]">Search...</span>
          <span className="hidden sm:inline font-mono text-[9px] text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1 py-0.2 rounded">
            Ctrl+K
          </span>
        </button>

        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="relative p-1.5 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Announcements & Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAnnouncements.length > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {notificationsOpen && (
            <div
              id="notifications-popover"
              className="absolute right-0 mt-1.5 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-2.5 z-40 animate-in fade-in zoom-in-95 duration-100 text-xs"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Announcements
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate('/announcements');
                  }}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {announcements.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No announcements yet
                </div>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {announcements.slice(0, 4).map((ann) => (
                    <div
                      key={ann.id}
                      className="p-2 rounded bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate('/announcements');
                      }}
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {ann.title}
                        </span>
                        {ann.pinned && (
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
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
              )}
            </div>
          )}
        </div>

        {/* Theme Switcher Dropdown */}
        <div ref={themeRef} className="relative">
          <button
            type="button"
            onClick={() => setThemeDropdownOpen((prev) => !prev)}
            className="p-1.5 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {settings.theme === 'light' ? (
              <Sun className="w-4 h-4" />
            ) : settings.theme === 'dark' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Laptop className="w-4 h-4" />
            )}
          </button>

          {themeDropdownOpen && (
            <div
              id="theme-popover"
              className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-1 z-40 animate-in fade-in zoom-in-95 duration-100 space-y-0.5 text-xs"
            >
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Laptop },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = settings.theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      updateSettings({ theme: item.id as any });
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </div>
                    {isSelected && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User Avatar */}
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="w-6 h-6 rounded bg-indigo-600 dark:bg-indigo-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs hover:opacity-90 transition-opacity"
          aria-label="View user profile"
        >
          {userInitials}
        </button>
      </div>
    </header>
  );
};
