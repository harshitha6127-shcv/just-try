import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, User, FolderKanban, CheckSquare, Bell, ArrowRight, X, KeyRound } from 'lucide-react';

export const SearchCommand: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, members, projects, tasks, announcements, credentials } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        members: members.slice(0, 3),
        projects: projects.slice(0, 3),
        tasks: tasks.slice(0, 3),
        announcements: announcements.slice(0, 2),
        credentials: credentials.slice(0, 2),
      };
    }

    return {
      members: members.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          (m.department && m.department.toLowerCase().includes(q))
      ),
      projects: projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.status.toLowerCase().includes(q)
      ),
      tasks: tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.status.toLowerCase().includes(q) ||
          t.priority.toLowerCase().includes(q)
      ),
      announcements: announcements.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.message.toLowerCase().includes(q)
      ),
      credentials: credentials.filter(
        (c) =>
          c.email.toLowerCase().includes(q) ||
          (c.label && c.label.toLowerCase().includes(q)) ||
          (c.notes && c.notes.toLowerCase().includes(q))
      ),
    };
  }, [query, members, projects, tasks, announcements, credentials]);

  const flatItems = useMemo(() => {
    const list: { type: 'member' | 'project' | 'task' | 'announcement' | 'credential'; title: string; subtitle: string; path: string }[] = [];
    results.credentials?.forEach((c) => {
      list.push({
        type: 'credential',
        title: c.email,
        subtitle: `Password Vault • ${c.label || 'Email Account'} (PIN Protected)`,
        path: '/passwords',
      });
    });
    results.members.forEach((m) => {
      list.push({
        type: 'member',
        title: m.name,
        subtitle: `${m.role} • ${m.department || 'Workspace'}`,
        path: '/members',
      });
    });
    results.projects.forEach((p) => {
      list.push({
        type: 'project',
        title: p.name,
        subtitle: `${p.status} • ${p.progress}% completed`,
        path: '/projects',
      });
    });
    results.tasks.forEach((t) => {
      list.push({
        type: 'task',
        title: t.title,
        subtitle: `${t.status} • Priority: ${t.priority}`,
        path: '/tasks',
      });
    });
    results.announcements.forEach((a) => {
      list.push({
        type: 'announcement',
        title: a.title,
        subtitle: `Announcement • ${a.priority}`,
        path: '/announcements',
      });
    });
    return list;
  }, [results]);

  const handleSelect = (item: (typeof flatItems)[0]) => {
    setIsSearchOpen(false);
    navigate(item.path);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSearchOpen) return;

      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < flatItems.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : flatItems.length - 1));
      } else if (e.key === 'Enter' && flatItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(flatItems[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, flatItems, selectedIndex]);

  if (!isSearchOpen) return null;

  return (
    <div
      id="search-command-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-16 p-3 bg-black/40 backdrop-blur-2xs transition-all duration-150"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        id="search-command-panel"
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members, projects, tasks, announcements..."
            className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 border border-slate-200 dark:border-slate-700 px-1 py-0.2 rounded">
              ESC
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-1.5">
          {flatItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-0.5">
              {!query && (
                <div className="px-2 py-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Quick Access
                </div>
              )}
              {flatItems.map((item, idx) => {
                let Icon = FolderKanban;
                if (item.type === 'member') Icon = User;
                if (item.type === 'task') Icon = CheckSquare;
                if (item.type === 'announcement') Icon = Bell;
                if (item.type === 'credential') Icon = KeyRound;

                const isSelected = idx === selectedIndex;

                return (
                  <button
                    key={`${item.type}-${item.title}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded text-left transition-colors ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 shrink-0 transition-opacity ${isSelected ? 'opacity-100 text-indigo-600 dark:text-indigo-400' : 'opacity-0'}`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
          <div className="flex items-center gap-2.5">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>Local index • Zero network</span>
        </div>
      </div>
    </div>
  );
};
