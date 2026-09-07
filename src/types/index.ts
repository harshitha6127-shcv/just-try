export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  creatorName: string;
  creatorEmail: string;
  createdAt: string;
}

export type MemberRole = 'Owner' | 'Admin' | 'Lead' | 'Member' | 'Guest';
export type MemberStatus = 'Active' | 'Inactive' | 'Invited';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department?: string;
  position?: string;
  status: MemberStatus;
  joinedAt: string;
  notes?: string;
  avatar?: string;
}

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed';

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  memberIds: string[];
  startDate: string;
  deadline: string;
  priority: PriorityLevel;
  status: ProjectStatus;
  progress: number; // 0 to 100
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  projectId: string;
  priority: PriorityLevel;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: PriorityLevel;
  createdAt: string;
  pinned: boolean;
  authorName?: string;
  readBy?: string[];
}

export type ActivityType =
  | 'member'
  | 'project'
  | 'task'
  | 'announcement'
  | 'security'
  | 'team'
  | string;

export interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  actorName: string;
  actorId: string;
  timestamp: string;
  targetId?: string;
  targetTitle?: string;
  targetType?: string;
}

export interface EncryptedCredential {
  id: string;
  email: string;
  label?: string;
  encryptedPassword: string; // base64 AES-GCM ciphertext
  iv: string; // base64 12-byte IV
  salt: string; // base64 16-byte PBKDF2 salt
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  pinEnabled: boolean;
  pinSalt?: string;
  pinHash?: string;
  settledPinSalt?: string;
  settledPinHash?: string;
  hasSettledPin?: boolean;
  biometricEnabled: boolean;
  biometricCredentialId?: string;
  webAuthnCredentialId?: string;
  autoLockTimeout?: number;
}

export interface TeamHubBackupPayload {
  version: 1;
  exportedAt: string;
  app?: 'Team Hub';
  isEncrypted?: boolean;
  user?: UserProfile | null;
  team: Team | null;
  members: TeamMember[];
  projects: Project[];
  tasks: Task[];
  announcements: Announcement[];
  activity: ActivityItem[];
  credentials?: EncryptedCredential[];
  settings?: Partial<AppSettings>;
}

export type TeamHubExportPayload = TeamHubBackupPayload;

export interface LocalInvitationPayload {
  version: 1;
  invitationCode: string;
  teamId: string;
  teamName: string;
  inviterName: string;
  role: string;
  department?: string;
  generatedAt: string;
}
