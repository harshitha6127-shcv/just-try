import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Announcement } from '../types';
import { AnnouncementModal } from '../components/AnnouncementModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatRelativeTime } from '../utils/validators';
import {
  Bell,
  Plus,
  Pin,
  Clock,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
  PinOff,
} from 'lucide-react';

export const Announcements: React.FC = () => {
  const { announcements, user, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState<Announcement | null>(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);

  // Sort pinned first, then by date descending
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleEdit = (ann: Announcement) => {
    setAnnouncementToEdit(ann);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (announcementToDelete) {
      deleteAnnouncement(announcementToDelete.id);
      setAnnouncementToDelete(null);
    }
  };

  const handleTogglePin = (ann: Announcement) => {
    updateAnnouncement({ ...ann, pinned: !ann.pinned });
  };

  const handleToggleRead = (ann: Announcement) => {
    const currentUserId = user?.id || 'current_user';
    const isRead = ann.readBy?.includes(currentUserId);
    const readBy = isRead
      ? (ann.readBy || []).filter((id) => id !== currentUserId)
      : [...(ann.readBy || []), currentUserId];
    updateAnnouncement({ ...ann, readBy });
  };

  return (
    <div id="announcements-page" className="p-3 sm:p-4 max-w-5xl mx-auto space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Announcements
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Broadcast updates, milestones, and notes across your workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setAnnouncementToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Feed List */}
      {sortedAnnouncements.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-10 text-center text-xs text-slate-400 space-y-2">
          <Bell className="w-7 h-7 text-slate-300 dark:text-slate-700 mx-auto" />
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            No announcements broadcast in this workspace yet.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-xs"
          >
            + Post your first announcement
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedAnnouncements.map((ann) => {
            const isRead = ann.readBy?.includes(user?.id || 'current_user');

            return (
              <div
                key={ann.id}
                className={`bg-white dark:bg-slate-900 border rounded p-3 shadow-2xs transition-colors ${
                  ann.pinned
                    ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ann.pinned && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                        <Pin className="w-2.5 h-2.5" />
                        Pinned
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                        ann.priority === 'Critical'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40'
                          : ann.priority === 'High'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {ann.priority} Priority
                    </span>

                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatRelativeTime(ann.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 text-slate-400 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTogglePin(ann)}
                      className="p-1 rounded hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title={ann.pinned ? 'Unpin' : 'Pin to top'}
                    >
                      {ann.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(ann)}
                      className="p-1 rounded hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnnouncementToDelete(ann)}
                      className="p-1 rounded hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Title & Message */}
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {ann.message}
                </p>

                {/* Footer read toggle */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-[10px] font-mono">{ann.id}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleRead(ann)}
                    className={`inline-flex items-center gap-1 text-[11px] font-medium transition-colors ${
                      isRead
                        ? 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        : 'text-indigo-600 dark:text-indigo-400 hover:underline'
                    }`}
                  >
                    <CheckCircle className={`w-3 h-3 ${isRead ? 'text-emerald-500' : ''}`} />
                    <span>{isRead ? 'Marked as read' : 'Mark as read'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Announcement Modal */}
      <AnnouncementModal
        isOpen={isModalOpen}
        announcementToEdit={announcementToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setAnnouncementToEdit(null);
        }}
        onSubmit={(data) => {
          if (announcementToEdit) {
            updateAnnouncement({ ...announcementToEdit, ...data });
          } else {
            addAnnouncement(data);
          }
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(announcementToDelete)}
        title="Delete announcement?"
        message={`Are you sure you want to delete "${announcementToDelete?.title}"?`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setAnnouncementToDelete(null)}
      />
    </div>
  );
};
