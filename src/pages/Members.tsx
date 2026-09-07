import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TeamMember, MemberRole, MemberStatus } from '../types';
import { MemberModal } from '../components/MemberModal';
import { MemberDrawer } from '../components/MemberDrawer';
import { InvitationModal } from '../components/InvitationModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  Users,
  UserPlus,
  Share2,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Shield,
  Trash2,
  Edit3,
  KeyRound,
} from 'lucide-react';

export const Members: React.FC = () => {
  const { members, addMember, updateMember, deleteMember, credentials } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals & Drawer State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        (m.department && m.department.toLowerCase().includes(q));

      const matchesRole = roleFilter === 'All' || m.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [members, searchQuery, roleFilter, statusFilter]);

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(null);
    setMemberToEdit(member);
    setIsAddModalOpen(true);
  };

  const handleDelete = () => {
    if (memberToDelete) {
      deleteMember(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  return (
    <div id="members-page" className="p-3 sm:p-4 lg:p-5 max-w-7xl mx-auto space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Team Members
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage everyone in your workspace ({members.length} total).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Invite</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMemberToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-2.5 flex flex-col md:flex-row items-center gap-2.5">
        <div className="relative w-full md:flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, role..."
            className="w-full pl-8 pr-3 py-1 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Role:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2 py-1 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="All">All Roles</option>
            <option value="Owner">Owner</option>
            <option value="Admin">Admin</option>
            <option value="Lead">Lead</option>
            <option value="Member">Member</option>
            <option value="Guest">Guest</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Invited">Invited</option>
          </select>
        </div>
      </div>

      {/* Members Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-hidden shadow-2xs">
        {filteredMembers.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery || roleFilter !== 'All' || statusFilter !== 'All'
                ? 'No team members match the current search filters.'
                : 'No team members in this workspace yet.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('All');
                setStatusFilter('All');
                setIsAddModalOpen(true);
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              + Add first member
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/75 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Member</th>
                    <th className="py-2 px-3">Role</th>
                    <th className="py-2 px-3">Department</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Joined</th>
                    <th className="py-2 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredMembers.map((member) => {
                    const initials = member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2);

                    const joinedDate = new Date(member.joinedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });

                    return (
                      <tr
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                      >
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded bg-indigo-600/90 dark:bg-indigo-500/90 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                                {member.name}
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {member.role}
                          </span>
                          {member.position && (
                            <div className="text-[10px] text-slate-400 truncate">
                              {member.position}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                          {member.department || '—'}
                        </td>
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center gap-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                member.status === 'Active'
                                  ? 'bg-emerald-500'
                                  : member.status === 'Invited'
                                  ? 'bg-amber-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            <span className="text-slate-700 dark:text-slate-300">
                              {member.status}
                            </span>
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500 dark:text-slate-400">
                          {joinedDate}
                        </td>
                        <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => navigate('/passwords')}
                              className={`p-1 rounded transition-colors ${
                                credentials.some((c) => c.email.toLowerCase() === member.email.toLowerCase())
                                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100'
                                  : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                              title={
                                credentials.some((c) => c.email.toLowerCase() === member.email.toLowerCase())
                                  ? `Password encrypted in Vault for ${member.email}`
                                  : `Store encrypted password for ${member.email}`
                              }
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(member)}
                              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Edit Member"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setMemberToDelete(member)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              title="Delete Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMembers.map((member) => {
                const initials = member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .substring(0, 2);

                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className="p-3 flex items-center justify-between gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {member.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {member.role} • {member.department || 'Team'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          member.status === 'Active'
                            ? 'bg-emerald-500'
                            : member.status === 'Invited'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Member Details Side Drawer */}
      <MemberDrawer
        member={selectedMember}
        isOpen={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
        onEdit={handleEdit}
      />

      {/* Add / Edit Member Modal */}
      <MemberModal
        isOpen={isAddModalOpen}
        memberToEdit={memberToEdit}
        onClose={() => {
          setIsAddModalOpen(false);
          setMemberToEdit(null);
        }}
        onSubmit={(data) => {
          if (memberToEdit) {
            updateMember({ ...memberToEdit, ...data });
            return { success: true };
          } else {
            return addMember(data);
          }
        }}
      />

      {/* Local Invitation Modal */}
      <InvitationModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(memberToDelete)}
        title="Remove team member?"
        message={`Are you sure you want to remove ${memberToDelete?.name} from your local workspace?`}
        confirmLabel="Remove"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setMemberToDelete(null)}
      />
    </div>
  );
};
