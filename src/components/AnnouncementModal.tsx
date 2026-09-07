import React, { useState, useEffect } from 'react';
import { Announcement, PriorityLevel } from '../types';
import { X, Bell, Pin, AlertCircle } from 'lucide-react';

interface AnnouncementModalProps {
  isOpen: boolean;
  announcementToEdit?: Announcement | null;
  onClose: () => void;
  onSubmit: (data: Omit<Announcement, 'id' | 'createdAt'>) => void;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen,
  announcementToEdit,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [pinned, setPinned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (announcementToEdit) {
      setTitle(announcementToEdit.title);
      setMessage(announcementToEdit.message);
      setPriority(announcementToEdit.priority);
      setPinned(announcementToEdit.pinned);
    } else {
      setTitle('');
      setMessage('');
      setPriority('Medium');
      setPinned(false);
    }
    setError(null);
  }, [announcementToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Announcement title is required.');
      return;
    }
    if (!message.trim()) {
      setError('Announcement message is required.');
      return;
    }

    onSubmit({
      title: title.trim(),
      message: message.trim(),
      priority,
      pinned,
    });
    onClose();
  };

  return (
    <div
      id="announcement-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-2xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="announcement-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-modal-title"
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-lg p-3.5 sm:p-4 transition-all my-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 id="announcement-modal-title" className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {announcementToEdit ? 'Edit announcement' : 'New announcement'}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Broadcast updates across your local workspace.
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

        {error && (
          <div className="mb-3 p-2 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1.5 border border-rose-100 dark:border-rose-900/40">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hackathon Demo Meeting"
              className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5">
              Message *
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Announcement details, schedule, or links..."
              className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Urgent / Critical</option>
              </select>
            </div>

            <div className="flex items-center pt-3 sm:pt-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span className="flex items-center gap-1 text-[11px]">
                  <Pin className="w-3 h-3 text-slate-400" />
                  Pin to top of feed
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-xs transition-colors"
            >
              {announcementToEdit ? 'Save Changes' : 'Post Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
