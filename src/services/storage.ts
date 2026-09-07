import {
  UserProfile,
  Team,
  TeamMember,
  Project,
  Task,
  Announcement,
  ActivityItem,
  AppSettings,
  TeamHubBackupPayload,
  EncryptedCredential,
} from '../types';
import { generateId, generateMemberId } from '../utils/idGenerator';

export const STORAGE_KEYS = {
  USER: 'teamhub_user',
  TEAM: 'teamhub_team',
  MEMBERS: 'teamhub_members',
  PROJECTS: 'teamhub_projects',
  TASKS: 'teamhub_tasks',
  ANNOUNCEMENTS: 'teamhub_announcements',
  ACTIVITY: 'teamhub_activity',
  SETTINGS: 'teamhub_settings',
  CREDENTIALS: 'teamhub_credentials',
} as const;

export function loadData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Failed to load data for key ${key}:`, err);
    return defaultValue;
  }
}

export function saveData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save data for key ${key}:`, err);
  }
}

export function deleteData(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`Failed to delete data for key ${key}:`, err);
  }
}

export function logActivity(
  type: ActivityItem['type'],
  description: string,
  actorName: string,
  actorId: string,
  targetId?: string,
  targetType?: string
): ActivityItem {
  const currentActivities = loadData<ActivityItem[]>(STORAGE_KEYS.ACTIVITY, []);
  const newActivity: ActivityItem = {
    id: generateId('ACT'),
    type,
    description,
    actorName,
    actorId,
    timestamp: new Date().toISOString(),
    targetId,
    targetType,
  };

  // Keep latest 100 activities
  const updated = [newActivity, ...currentActivities].slice(0, 100);
  saveData(STORAGE_KEYS.ACTIVITY, updated);
  return newActivity;
}

export function clearTeamData(): void {
  // Preserve user and settings, clear workspace data
  deleteData(STORAGE_KEYS.TEAM);
  deleteData(STORAGE_KEYS.MEMBERS);
  deleteData(STORAGE_KEYS.PROJECTS);
  deleteData(STORAGE_KEYS.TASKS);
  deleteData(STORAGE_KEYS.ANNOUNCEMENTS);
  deleteData(STORAGE_KEYS.ACTIVITY);
}

export function clearAllLocalData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    deleteData(key);
  });
}

export function exportAllData(): TeamHubBackupPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: 'Team Hub',
    user: loadData<UserProfile | null>(STORAGE_KEYS.USER, null),
    team: loadData<Team | null>(STORAGE_KEYS.TEAM, null),
    members: loadData<TeamMember[]>(STORAGE_KEYS.MEMBERS, []),
    projects: loadData<Project[]>(STORAGE_KEYS.PROJECTS, []),
    tasks: loadData<Task[]>(STORAGE_KEYS.TASKS, []),
    announcements: loadData<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []),
    activity: loadData<ActivityItem[]>(STORAGE_KEYS.ACTIVITY, []),
    credentials: loadData<EncryptedCredential[]>(STORAGE_KEYS.CREDENTIALS, []),
    settings: loadData<AppSettings>(STORAGE_KEYS.SETTINGS, {
      theme: 'system',
      pinEnabled: false,
      biometricEnabled: false,
    }),
  };
}

export function importAllData(payload: any): boolean {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid backup structure');
  }

  if (payload.app !== 'Team Hub' && !payload.team) {
    throw new Error('Not a valid Team Hub backup payload');
  }

  if (payload.user) saveData(STORAGE_KEYS.USER, payload.user);
  if (payload.team) saveData(STORAGE_KEYS.TEAM, payload.team);
  if (Array.isArray(payload.members)) saveData(STORAGE_KEYS.MEMBERS, payload.members);
  if (Array.isArray(payload.projects)) saveData(STORAGE_KEYS.PROJECTS, payload.projects);
  if (Array.isArray(payload.tasks)) saveData(STORAGE_KEYS.TASKS, payload.tasks);
  if (Array.isArray(payload.announcements)) saveData(STORAGE_KEYS.ANNOUNCEMENTS, payload.announcements);
  if (Array.isArray(payload.activity)) saveData(STORAGE_KEYS.ACTIVITY, payload.activity);
  if (Array.isArray(payload.credentials)) saveData(STORAGE_KEYS.CREDENTIALS, payload.credentials);

  if (payload.settings) {
    const existingSettings = loadData<AppSettings>(STORAGE_KEYS.SETTINGS, {
      theme: 'system',
      pinEnabled: false,
      biometricEnabled: false,
    });
    // Merge theme and non-sensitive preferences
    saveData(STORAGE_KEYS.SETTINGS, {
      ...existingSettings,
      theme: payload.settings.theme || existingSettings.theme,
    });
  }

  return true;
}

export function loadDemoData(): { user: UserProfile; team: Team } {
  const user: UserProfile = {
    id: 'USR-7F29K1',
    name: 'Ambarish',
    email: 'ambarish@techinnovators.io',
    role: 'Team Owner',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  };

  const team: Team = {
    id: 'TEAM-8F42K1',
    name: 'Tech Innovators',
    description: 'Autonomous engineering studio building local-first productivity tools and AI telemetry systems.',
    creatorName: 'Ambarish',
    creatorEmail: 'ambarish@techinnovators.io',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  };

  const members: TeamMember[] = [
    {
      id: generateMemberId(1),
      name: 'Ambarish',
      email: 'ambarish@techinnovators.io',
      phone: '+1 555-0192',
      role: 'Team Owner',
      department: 'Engineering',
      position: 'Founder & Lead Architect',
      status: 'Active',
      joinedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      notes: 'Workspace creator and primary system architect.',
    },
    {
      id: generateMemberId(2),
      name: 'Sarah Chen',
      email: 'sarah.c@techinnovators.io',
      phone: '+1 555-0144',
      role: 'Frontend Developer',
      department: 'Engineering',
      position: 'Senior UI Engineer',
      status: 'Active',
      joinedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      notes: 'Leading component architecture and accessibility compliance.',
    },
    {
      id: generateMemberId(3),
      name: 'Alex Rivera',
      email: 'alex.r@techinnovators.io',
      phone: '+1 555-0178',
      role: 'Backend Developer',
      department: 'Systems',
      position: 'Distributed Systems Engineer',
      status: 'Active',
      joinedAt: new Date(Date.now() - 22 * 86400000).toISOString(),
      notes: 'Specializing in Web Crypto benchmarks and serialization algorithms.',
    },
    {
      id: generateMemberId(4),
      name: 'Maya Lin',
      email: 'maya.l@techinnovators.io',
      phone: '+1 555-0182',
      role: 'UI/UX Designer',
      department: 'Product',
      position: 'Lead Product Designer',
      status: 'Active',
      joinedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      notes: 'Maintains typography standards and micro-interaction guidelines.',
    },
    {
      id: generateMemberId(5),
      name: 'David Park',
      email: 'david.p@techinnovators.io',
      phone: '+1 555-0190',
      role: 'AI Developer',
      department: 'Research',
      position: 'Machine Learning Researcher',
      status: 'Active',
      joinedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      notes: 'Developing client-side vector search and semantic heuristics.',
    },
  ];

  const now = Date.now();
  const projects: Project[] = [
    {
      id: 'PRJ-101',
      name: 'Team Hub',
      description: 'Build the modern, local-first Team Hub platform with zero external databases.',
      ownerId: members[0].id,
      memberIds: [members[0].id, members[1].id, members[3].id],
      startDate: new Date(now - 14 * 86400000).toISOString().split('T')[0],
      deadline: '2026-09-24',
      priority: 'High',
      status: 'Active',
      progress: 82,
    },
    {
      id: 'PRJ-102',
      name: 'Smart Bend',
      description: 'IoT telemetry firmware and ergonomic sensor diagnostics interface.',
      ownerId: members[2].id,
      memberIds: [members[2].id, members[4].id],
      startDate: new Date(now - 10 * 86400000).toISOString().split('T')[0],
      deadline: '2026-10-15',
      priority: 'Medium',
      status: 'Active',
      progress: 64,
    },
    {
      id: 'PRJ-103',
      name: 'ARPIT AI',
      description: 'Autonomous research paper indexer and taxonomy synthesis engine.',
      ownerId: members[4].id,
      memberIds: [members[4].id, members[0].id, members[1].id],
      startDate: new Date(now - 20 * 86400000).toISOString().split('T')[0],
      deadline: '2026-09-18',
      priority: 'Critical',
      status: 'Active',
      progress: 91,
    },
  ];

  const tasks: Task[] = [
    {
      id: 'TSK-201',
      title: 'Design dashboard',
      description: 'Draft typography hierarchy and compact metric cards for main workspace view.',
      assignedTo: members[3].id,
      projectId: 'PRJ-101',
      priority: 'High',
      status: 'COMPLETED',
      dueDate: new Date(now - 1 * 86400000).toISOString().split('T')[0],
      createdAt: new Date(now - 5 * 86400000).toISOString(),
    },
    {
      id: 'TSK-202',
      title: 'Create login & welcome page',
      description: 'Implement local workspace onboarding and initial profile generator.',
      assignedTo: members[1].id,
      projectId: 'PRJ-101',
      priority: 'High',
      status: 'COMPLETED',
      dueDate: new Date(now).toISOString().split('T')[0],
      createdAt: new Date(now - 4 * 86400000).toISOString(),
    },
    {
      id: 'TSK-203',
      title: 'Test authentication & security',
      description: 'Verify Web Crypto PBKDF2 key derivation and AES-GCM 256-bit backup integrity.',
      assignedTo: members[0].id,
      projectId: 'PRJ-101',
      priority: 'Critical',
      status: 'IN_PROGRESS',
      dueDate: new Date(now + 2 * 86400000).toISOString().split('T')[0],
      createdAt: new Date(now - 2 * 86400000).toISOString(),
    },
    {
      id: 'TSK-204',
      title: 'Build project management',
      description: 'Create responsive grid/list switcher, member tags, and progress tracker.',
      assignedTo: members[1].id,
      projectId: 'PRJ-101',
      priority: 'High',
      status: 'IN_PROGRESS',
      dueDate: new Date(now + 4 * 86400000).toISOString().split('T')[0],
      createdAt: new Date(now - 3 * 86400000).toISOString(),
    },
    {
      id: 'TSK-205',
      title: 'Ergonomic sensor calibration',
      description: 'Verify Bluetooth LE streaming packets with gyro delta corrections.',
      assignedTo: members[2].id,
      projectId: 'PRJ-102',
      priority: 'Medium',
      status: 'TODO',
      dueDate: new Date(now + 6 * 86400000).toISOString().split('T')[0],
      createdAt: new Date(now - 1 * 86400000).toISOString(),
    },
    {
      id: 'TSK-206',
      title: 'Taxonomy embedding verification',
      description: 'Audit clustering quality across 5,000 preprint documents.',
      assignedTo: members[4].id,
      projectId: 'PRJ-103',
      priority: 'Critical',
      status: 'REVIEW',
      dueDate: new Date(now + 3 * 86400000).toISOString().split('T')[0],
      createdAt: new Date(now - 2 * 86400000).toISOString(),
    },
  ];

  const announcements: Announcement[] = [
    {
      id: 'ANN-301',
      title: 'Important Update',
      message: 'Hackathon meeting tomorrow at 10 AM. Please prepare your progress summaries.',
      priority: 'High',
      createdAt: new Date(now - 2 * 3600000).toISOString(),
      pinned: true,
      authorName: 'Ambarish',
    },
    {
      id: 'ANN-302',
      title: 'Local-First Encryption Release',
      message: 'Team Hub backup encryption with AES-GCM and PBKDF2 is active on this device. Back up your .teamhub files regularly.',
      priority: 'Medium',
      createdAt: new Date(now - 24 * 3600000).toISOString(),
      pinned: false,
      authorName: 'Ambarish',
    },
  ];

  const activity: ActivityItem[] = [
    {
      id: generateId('ACT'),
      type: 'task',
      description: 'Ambarish completed "Design dashboard"',
      actorName: 'Ambarish',
      actorId: members[0].id,
      timestamp: new Date(now - 5 * 60000).toISOString(),
    },
    {
      id: generateId('ACT'),
      type: 'member',
      description: 'David Park joined the team as AI Developer',
      actorName: 'Ambarish',
      actorId: members[0].id,
      timestamp: new Date(now - 24 * 60000).toISOString(),
    },
    {
      id: generateId('ACT'),
      type: 'project',
      description: 'Ambarish updated progress on Team Hub to 82%',
      actorName: 'Ambarish',
      actorId: members[0].id,
      timestamp: new Date(now - 60 * 60000).toISOString(),
    },
    {
      id: generateId('ACT'),
      type: 'project',
      description: 'Smart Bend was created by Alex Rivera',
      actorName: 'Alex Rivera',
      actorId: members[2].id,
      timestamp: new Date(now - 3 * 3600000).toISOString(),
    },
    {
      id: generateId('ACT'),
      type: 'team',
      description: 'Ambarish created Team Hub workspace (Tech Innovators)',
      actorName: 'Ambarish',
      actorId: members[0].id,
      timestamp: new Date(now - 5 * 3600000).toISOString(),
    },
  ];

  saveData(STORAGE_KEYS.USER, user);
  saveData(STORAGE_KEYS.TEAM, team);
  saveData(STORAGE_KEYS.MEMBERS, members);
  saveData(STORAGE_KEYS.PROJECTS, projects);
  saveData(STORAGE_KEYS.TASKS, tasks);
  saveData(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
  saveData(STORAGE_KEYS.ACTIVITY, activity);

  return { user, team };
}
