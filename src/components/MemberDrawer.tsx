import React, { useState } from 'react';
import { TeamMember } from '../types';
import { useApp } from '../context/AppContext';
import { ConfirmDialog } from './ConfirmDialog';
import { X, Mail, Phone, Building, Briefcase, Calendar, Shield, Edit3, Trash2, UserCheck, UserX } from 'lucide-react';

interface MemberDrawerProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (member: TeamMember) => void;
}

export const MemberDrawer: React.FC<MemberDrawerProps> = ({
  member,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { deleteMember, updateMember } = useApp();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !member) return null;

  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const formattedDate = new Date(member.joinedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleToggleStatus = () => {
    const newStatus = member.status === 'Active' ? 'Inactive' : 'Active';
    updateMember({ ...member, status: newStatus });
  };

  const handleDelete = () => {
    deleteMember(member.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <div
        id="member-drawer-backdrop"
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex justify-end transition-opacity duration-200"
        onClick={onClose}
      >
        <div
          id="member-drawer-panel"
          className="w-full max-w-sm bg-white dark:bg-slate-900 h-full border-l border-slate-200 dark:border-slate-800 shadow-xl p-4 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header & Avatar */}
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 mb-4">
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                {member.id}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-2xs">
                {initials}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                  {member.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {member.position || member.role}
                </p>
                <div className="mt-1 inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      member.status === 'Active'
                        ? 'bg-emerald-500'
                        : member.status === 'Invited'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span className="text-slate-700 dark:text-slate-300">{member.status}</span>
                </div>
              </div>
            </div>

            {/* Profile fields */}
            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium truncate text-xs">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs">{member.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs">Role: <strong className="text-slate-800 dark:text-slate-200">{member.role}</strong></span>
                </div>
                {member.department && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs">Department: {member.department}</span>
                  </div>
                )}
                {member.position && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs">Position: {member.position}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs">Joined: {formattedDate}</span>
                </div>
              </div>

              {member.notes && (
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5 text-[11px]">
                    Notes
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
                    {member.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onEdit(member)}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={handleToggleStatus}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {member.status === 'Active' ? (
                  <>
                    <UserX className="w-3 h-3 text-amber-500" />
                    <span>Deactivate</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3 h-3 text-emerald-500" />
                    <span>Activate</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove Member</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete member?"
        message={`Are you sure you want to remove ${member.name} from this local Team Hub workspace? This action cannot be undone.`}
        confirmLabel="Remove Member"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
