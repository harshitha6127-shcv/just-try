import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  Team,
  TeamMember,
  Project,
  Task,
  Announcement,
  ActivityItem,
  AppSettings,
  ThemeMode,
  EncryptedCredential,
} from '../types';
import {
  STORAGE_KEYS,
  loadData,
  saveData,
  logActivity,
  clearTeamData,
  clearAllLocalData,
  loadDemoData,
} from '../services/storage';
import {
  hashPin,
  verifyPin,
  encryptCredentialPassword,
  decryptCredentialPassword,
} from '../services/encryption';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AppContextType {
  user: UserProfile | null;
  team: Team | null;
  members: TeamMember[];
  projects: Project[];
  tasks: Task[];
  announcements: Announcement[];
  activity: ActivityItem[];
  credentials: EncryptedCredential[];
  settings: AppSettings;
  isLocked: boolean;
  isSearchOpen: boolean;
  toasts: ToastItem[];
  hasSettledPin: boolean;
  // Actions
  setUser: (user: UserProfile | null) => void;
  setTeam: (team: Team | null) => void;
  addToast: (message: string, type?: ToastItem['type']) => void;
  removeToast: (id: string) => void;
  setIsSearchOpen: (open: boolean) => void;
  // Members
  addMember: (member: Omit<TeamMember, 'id' | 'joinedAt'>) => { success: boolean; error?: string; member?: TeamMember };
  updateMember: (member: TeamMember) => void;
  deleteMember: (memberId: string) => void;
  // Projects
  addProject: (project: Omit<Project, 'id'>) => Project;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  // Announcements
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => Announcement;
  updateAnnouncement: (announcement: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
  togglePinAnnouncement: (id: string) => void;
  markAnnouncementRead: (id: string) => void;
  // Settings & Security
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  lockWorkspace: () => void;
  unlockWorkspace: () => void;
  setupPin: (pin: string) => Promise<void>;
  removePin: () => void;
  setSettledPin: (pin: string) => Promise<void>;
  verifySettledPin: (pin: string) => Promise<boolean>;
  // Password Vault & Credentials
  addCredential: (data: { email: string; password: string; label?: string; notes?: string; pin: string }) => Promise<{ success: boolean; error?: string; credential?: EncryptedCredential }>;
  updateCredential: (id: string, updates: { email?: string; password?: string; label?: string; notes?: string; pin?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteCredential: (id: string) => void;
  decryptCredentialPasswordForEmail: (id: string, enteredPin: string) => Promise<{ success: boolean; password?: string; error?: string }>;
  // Global actions
  reloadAllData: () => void;
  loadDemoWorkspace: () => void;
  clearWorkspace: () => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile | null>(() =>
    loadData<UserProfile | null>(STORAGE_KEYS.USER, null)
  );
  const [team, setTeamState] = useState<Team | null>(() =>
    loadData<Team | null>(STORAGE_KEYS.TEAM, null)
  );
  const [members, setMembers] = useState<TeamMember[]>(() =>
    loadData<TeamMember[]>(STORAGE_KEYS.MEMBERS, [])
  );
  const [projects, setProjects] = useState<Project[]>(() =>
    loadData<Project[]>(STORAGE_KEYS.PROJECTS, [])
  );
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadData<Task[]>(STORAGE_KEYS.TASKS, [])
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    loadData<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, [])
  );
  const [activity, setActivity] = useState<ActivityItem[]>(() =>
    loadData<ActivityItem[]>(STORAGE_KEYS.ACTIVITY, [])
  );
  const [credentials, setCredentials] = useState<EncryptedCredential[]>(() =>
    loadData<EncryptedCredential[]>(STORAGE_KEYS.CREDENTIALS, [])
  );
  const [settings, setSettingsState] = useState<AppSettings>(() =>
    loadData<AppSettings>(STORAGE_KEYS.SETTINGS, {
      theme: 'system',
      pinEnabled: false,
      biometricEnabled: false,
    })
  );

  const hasSettledPin = Boolean(
    settings.hasSettledPin ||
    (settings.settledPinHash && settings.settledPinSalt) ||
    (settings.pinEnabled && settings.pinHash && settings.pinSalt)
  );

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const saved = loadData<AppSettings>(STORAGE_KEYS.SETTINGS, {
      theme: 'system',
      pinEnabled: false,
      biometricEnabled: false,
    });
    // If PIN is enabled, lock on initial app launch
    return Boolean(saved.pinEnabled && saved.pinHash);
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Theme synchronization
  useEffect(() => {
    const applyTheme = (theme: ThemeMode) => {
      const root = document.documentElement;
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(settings.theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (settings.theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  // Global Ctrl+K handler for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToast = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setUser = useCallback((newUser: UserProfile | null) => {
    setUserState(newUser);
    if (newUser) {
      saveData(STORAGE_KEYS.USER, newUser);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, []);

  const setTeam = useCallback((newTeam: Team | null) => {
    setTeamState(newTeam);
    if (newTeam) {
      saveData(STORAGE_KEYS.TEAM, newTeam);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TEAM);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      saveData(STORAGE_KEYS.SETTINGS, updated);
      return updated;
    });
  }, []);

  const lockWorkspace = useCallback(() => {
    setIsLocked(true);
  }, []);

  const unlockWorkspace = useCallback(() => {
    setIsLocked(false);
  }, []);

  const setupPin = useCallback(
    async (pin: string) => {
      const { salt, hash } = await hashPin(pin);
      updateSettings({
        pinEnabled: true,
        pinSalt: salt,
        pinHash: hash,
        settledPinSalt: salt,
        settledPinHash: hash,
        hasSettledPin: true,
      });
      logActivity(
        'security',
        'Workspace security PIN was updated',
        user?.name || 'User',
        user?.id || 'USR-001'
      );
    },
    [updateSettings, user]
  );

  const removePin = useCallback(() => {
    updateSettings({
      pinEnabled: false,
      pinSalt: undefined,
      pinHash: undefined,
    });
    logActivity(
      'security',
      'Workspace security PIN was disabled',
      user?.name || 'User',
      user?.id || 'USR-001'
    );
  }, [updateSettings, user]);

  const setSettledPin = useCallback(
    async (pin: string) => {
      const { salt, hash } = await hashPin(pin);
      updateSettings({
        settledPinSalt: salt,
        settledPinHash: hash,
        hasSettledPin: true,
      });
      addToast('4-digit PIN configured successfully', 'success');
      logActivity(
        'security',
        '4-digit Vault security PIN was configured',
        user?.name || 'User',
        user?.id || 'USR-001'
      );
    },
    [updateSettings, user, addToast]
  );

  const verifySettledPin = useCallback(
    async (pin: string) => {
      const salt = settings.settledPinSalt || settings.pinSalt;
      const hash = settings.settledPinHash || settings.pinHash;
      if (!salt || !hash) return false;
      return await verifyPin(pin, salt, hash);
    },
    [settings.settledPinSalt, settings.settledPinHash, settings.pinSalt, settings.pinHash]
  );

  const reloadAllData = useCallback(() => {
    setUserState(loadData<UserProfile | null>(STORAGE_KEYS.USER, null));
    setTeamState(loadData<Team | null>(STORAGE_KEYS.TEAM, null));
    setMembers(loadData<TeamMember[]>(STORAGE_KEYS.MEMBERS, []));
    setProjects(loadData<Project[]>(STORAGE_KEYS.PROJECTS, []));
    setTasks(loadData<Task[]>(STORAGE_KEYS.TASKS, []));
    setAnnouncements(loadData<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []));
    setActivity(loadData<ActivityItem[]>(STORAGE_KEYS.ACTIVITY, []));
    setCredentials(loadData<EncryptedCredential[]>(STORAGE_KEYS.CREDENTIALS, []));
    setSettingsState(
      loadData<AppSettings>(STORAGE_KEYS.SETTINGS, {
        theme: 'system',
        pinEnabled: false,
        biometricEnabled: false,
      })
    );
  }, []);

  // Members
  const addMember = useCallback(
    (memberData: Omit<TeamMember, 'id' | 'joinedAt'>) => {
      // Check duplicate email
      const exists = members.some(
        (m) => m.email.toLowerCase() === memberData.email.trim().toLowerCase()
      );
      if (exists) {
        return { success: false, error: 'A member with this email address already exists.' };
      }

      const id = `MEM-${String(members.length + 1).padStart(3, '0')}`;
      const newMember: TeamMember = {
        ...memberData,
        id,
        joinedAt: new Date().toISOString(),
      };

      const updated = [...members, newMember];
      setMembers(updated);
      saveData(STORAGE_KEYS.MEMBERS, updated);

      const actor = user?.name || 'Admin';
      const actorId = user?.id || 'USR-001';
      logActivity(
        'member',
        `${newMember.name} joined the workspace as ${newMember.role}`,
        actor,
        actorId,
        newMember.id,
        'member'
      );
      setActivity(loadData<ActivityItem[]>(STORAGE_KEYS.ACTIVITY, []));

      addToast(`Member ${newMember.name} added successfully`, 'success');
      return { success: true, member: newMember };
    },
    [members, user, addToast]
  );

  const updateMember = useCallback(
    (updatedMember: TeamMember) => {
      const updated = members.map((m) => (m.id === updatedMember.id ? updatedMember : m));
      setMembers(updated);
      saveData(STORAGE_KEYS.MEMBERS, updated);
      addToast(`Updated member ${updatedMember.name}`, 'success');
    },
    [members, addToast]
  );

  const deleteMember = useCallback(
    (memberId: string) => {
      const memberToDelete = members.find((m) => m.id === memberId);
      const updated = members.filter((m) => m.id !== memberId);
      setMembers(updated);
      saveData(STORAGE_KEYS.MEMBERS, updated);

      if (memberToDelete) {
        const actor = user?.name || 'Admin';
        const actorId = user?.id || 'USR-001';
        logActivity(
          'member',
          `${memberToDelete.name} was removed from the team`,
          actor,
          actorId,
          memberId,
          'member'
        );
        setActivity(loadData<ActivityItem[]>(STORAGE_KEYS.ACTIVITY, []));
      }

      addToast('Member removed', 'info');
    },
    [members, user, addToast]
  );

  // Projects
  const addProject = useCallback(
    (projectData: Omit<Project, 'id'>) => {
      const id = `PRJ-${String(projects.length + 101)}`;
      const newProject: Project = {
        ...projectData,
        id,
      };

      const updated = [...projects, newProject];
      setProjects(updated);
      saveData(STORAGE_KEYS.PROJECTS, updated);

      const actor = user?.name || 'Admin';
      const actorId = user?.id || 'USR-001';
      logActivity(
        'project',
        `Project "${newProject.name}" was created`,
        actor,
        actorId,
        newProject.id,
        'project'
      );
      setActivity(loadData<ActivityItem[]>(STORAGE_KEYS.ACTIVITY, []));

      addToast(`Project "${newProject.name}" created`, 'success');
      return newProject;
    },
    [projects, user, addToast]
  );

  const updateProject = useCallback(
    (updatedProject: Project) => {
      const updated = projects.map((p) => (p.id === updatedProject.id ? updatedProject : p));
      setProjects(updated);
      saveData(STORAGE_KEYS.PROJECTS, updated);

      const actor = user?.name || 'Admin';
      const actorId = user?.id || 'USR-001';
      logActivity(
        'project',
        `Updated project "${updatedProject.name}" (${updatedProject.progress}%)`,
        actor,
        actorId,
        updatedProject.id,
        'project'
      );
      setActivity(loadData<ActivityItem[]>(STORAGE_KEYS.ACTIVITY, []));

      addToast(`Project "${updatedProject.name}" updated`, 'success');
    },
    [projects, user, addToast]
  );

  const deleteProject = useCallback(
    (projectId: string) => {
      const projectToDelete = projects.find((p) => p.id === projectId);
      const updated = projects.filter((p) => p.id !== projectId);
      setProjects(updated);
      saveData(STORAGE_KEYS.PROJECTS, updated);

      if (projectToDelete) {
        const actor = user?.name || 'Admin';
        const actorId = user?.id || 'USR-001';
        logActivity(
          'project',
          `Project "${projectToDelete.name}" was deleted`,
          actor,
          actorId,
          projectId,
          'project'
        );
        setActivity(loadData<ActivityItem[]>(STORAGE_KEYS.ACTIVITY, []));
      }

      addToast('Project deleted', 'info');
    },
    [projects, user, addToast]
  );

  // Tasks
  const addTask = useCallback(
    (taskData: Omit<Task, 'id' | 'createdAt'>) => {
      const id = `TSK-${String(tasks.length + 201)}`;
      const newTask: Task = {
        ...taskData,
        id,
        createdAt: new Date().toISOString(),
      };

      const updated = [...tasks, newTask];
      setTasks(updated);
      saveData(STORAGE_KEYS.TASKS, updated);

      const actor = user?.name || 'Admin';
      const actorId = user?.id || 'USR-001';
      logActivity(
        'task',
        `Task "${newTask.title}" was created`,
        actor,
        actorId,
        newTask.id,
        'task'
      );
      setActivity(loadData<ActivityItem[]>(STORAGE_KEYS.ACTIVITY, []));

      addToast(`Task "${newTask.title}" created`, 'success');
      return newTask;
    },
    [tasks, user, addToast]
  );

  const updateTask = useCallback(
    (updatedTask: Task) => {
      const prevTask = tasks.find((t) => t.id === updatedTask.id);
      const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      setTasks(updated);
      saveData(STORAGE_KEYS.TASKS, updated);

      const actor = user?.name || 'Admin';
      const actorId = user?.id || 'USR-001';
      if (prevTask && prevTask.status !== 'COMPLETED' && updatedTask.status === 'COMPLETED') {
        logActivity(
          'task',
          `${actor} completed "${updatedTask.title}"`,
          actor,
          actorId,
          updatedTask.id,
          'task'
        );
        setActivity(loadData<ActivityItem[]>(STORAGE_KEYS.ACTIVITY, []));
      }

      addToast(`Task "${updatedTask.title}" updated`, 'success');
    },
    [tasks, user, addToast]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      const taskToDelete = tasks.find((t) => t.id === taskId);
      const updated = tasks.filter((t) => t.id !== taskId);
      setTasks(updated);
      saveData(STORAGE_KEYS.TASKS, updated);

      if (taskToDelete) {
        const actor = user?.name || 'Admin';
        const actorId = user?.id || 'USR-001';
        logActivity(
          'task',
          `Task "${taskToDelete.title}" was deleted`,
          actor,
          actorId,
          taskId,
          'task'
        );
        setActivity(loadData<ActivityItem[]>(STORAGE_KEYS.ACTIVITY, []));
      }

      addToast('Task removed', 'info');
    },
    [tasks, user, addToast]
  );

  // Announcements
  const addAnnouncement = useCallback(
    (announcementData: Omit<Announcement, 'id' | 'createdAt'>) => {
      const id = `ANN-${String(announcements.length + 301)}`;
      const newAnn: Announcement = {
        ...announcementData,
        id,
        createdAt: new Date().toISOString(),
        authorName: user?.name || 'Admin',
      };

      const updated = [newAnn, ...announcements];
      setAnnouncements(updated);
      saveData(STORAGE_KEYS.ANNOUNCEMENTS, updated);

      const actor = user?.name || 'Admin';
      const actorId = user?.id || 'USR-001';
      logActivity(
        'announcement',
        `Announcement posted: "${newAnn.title}"`,
        actor,
        actorId,
        newAnn.id,
        'announcement'
      );
      setActivity(loadData<ActivityItem[]>(STORAGE_KEYS.ACTIVITY, []));

      addToast('Announcement posted', 'success');
      return newAnn;
    },
    [announcements, user, addToast]
  );

  const updateAnnouncement = useCallback(
    (updatedAnn: Announcement) => {
      const updated = announcements.map((a) => (a.id === updatedAnn.id ? updatedAnn : a));
      setAnnouncements(updated);
      saveData(STORAGE_KEYS.ANNOUNCEMENTS, updated);
      addToast('Announcement updated', 'success');
    },
    [announcements, addToast]
  );

  const deleteAnnouncement = useCallback(
    (id: string) => {
      const updated = announcements.filter((a) => a.id !== id);
      setAnnouncements(updated);
      saveData(STORAGE_KEYS.ANNOUNCEMENTS, updated);
      addToast('Announcement deleted', 'info');
    },
    [announcements, addToast]
  );

  const togglePinAnnouncement = useCallback(
    (id: string) => {
      const updated = announcements.map((a) =>
        a.id === id ? { ...a, pinned: !a.pinned } : a
      );
      setAnnouncements(updated);
      saveData(STORAGE_KEYS.ANNOUNCEMENTS, updated);
    },
    [announcements]
  );

  const markAnnouncementRead = useCallback(
    (id: string) => {
      const userId = user?.id || 'current_user';
      const updated = announcements.map((a) => {
        if (a.id === id) {
          const reads = a.readBy || [];
          if (!reads.includes(userId)) {
            return { ...a, readBy: [...reads, userId] };
          }
        }
        return a;
      });
      setAnnouncements(updated);
      saveData(STORAGE_KEYS.ANNOUNCEMENTS, updated);
    },
    [announcements, user]
  );

  // Password Vault & Credentials
  const addCredential = useCallback(
    async (data: {
      email: string;
      password: string;
      label?: string;
      notes?: string;
      pin: string;
    }) => {
      const trimmedEmail = data.email.trim();
      if (!trimmedEmail) {
        return { success: false, error: 'Email address is required' };
      }
      if (!data.password) {
        return { success: false, error: 'Password cannot be empty' };
      }
      if (!data.pin || data.pin.length !== 4) {
        return { success: false, error: 'A 4-digit PIN is required' };
      }

      // Check settled pin if one exists
      const salt = settings.settledPinSalt || settings.pinSalt;
      const hash = settings.settledPinHash || settings.pinHash;
      if (salt && hash) {
        const isPinMatch = await verifyPin(data.pin, salt, hash);
        if (!isPinMatch) {
          return {
            success: false,
            error: 'Incorrect PIN. Does not match settled PIN.',
          };
        }
      } else {
        // Settle this pin if none settled yet!
        const { salt: newSalt, hash: newHash } = await hashPin(data.pin);
        updateSettings({
          settledPinSalt: newSalt,
          settledPinHash: newHash,
          hasSettledPin: true,
        });
      }

      try {
        const encrypted = await encryptCredentialPassword(data.password, data.pin);
        const newCred: EncryptedCredential = {
          id: `CRD-${Date.now().toString(36).toUpperCase()}`,
          email: trimmedEmail,
          label: data.label?.trim() || undefined,
          notes: data.notes?.trim() || undefined,
          encryptedPassword: encrypted.encrypted,
          iv: encrypted.iv,
          salt: encrypted.salt,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updated = [newCred, ...credentials];
        setCredentials(updated);
        saveData(STORAGE_KEYS.CREDENTIALS, updated);

        logActivity(
          'security',
          `Stored encrypted password for ${trimmedEmail}`,
          user?.name || 'User',
          user?.id || 'USR-001',
          newCred.id,
          'credential'
        );
        addToast(`Password encrypted & stored for ${trimmedEmail}`, 'success');
        return { success: true, credential: newCred };
      } catch (err: any) {
        return { success: false, error: err.message || 'Encryption failed' };
      }
    },
    [credentials, settings, updateSettings, user, addToast]
  );

  const updateCredential = useCallback(
    async (
      id: string,
      updates: {
        email?: string;
        password?: string;
        label?: string;
        notes?: string;
        pin?: string;
      }
    ) => {
      const existing = credentials.find((c) => c.id === id);
      if (!existing) return { success: false, error: 'Credential not found' };

      let encryptedPassword = existing.encryptedPassword;
      let iv = existing.iv;
      let salt = existing.salt;

      if (updates.password) {
        if (!updates.pin || updates.pin.length !== 4) {
          return { success: false, error: '4-digit PIN is required to update password' };
        }
        const currentSalt = settings.settledPinSalt || settings.pinSalt;
        const currentHash = settings.settledPinHash || settings.pinHash;
        if (currentSalt && currentHash) {
          const isPinMatch = await verifyPin(updates.pin, currentSalt, currentHash);
          if (!isPinMatch) {
            return { success: false, error: 'Incorrect PIN. Does not match settled PIN.' };
          }
        }
        const encrypted = await encryptCredentialPassword(updates.password, updates.pin);
        encryptedPassword = encrypted.encrypted;
        iv = encrypted.iv;
        salt = encrypted.salt;
      }

      const updatedCred: EncryptedCredential = {
        ...existing,
        email: updates.email?.trim() || existing.email,
        label: updates.label !== undefined ? updates.label.trim() : existing.label,
        notes: updates.notes !== undefined ? updates.notes.trim() : existing.notes,
        encryptedPassword,
        iv,
        salt,
        updatedAt: new Date().toISOString(),
      };

      const updatedList = credentials.map((c) => (c.id === id ? updatedCred : c));
      setCredentials(updatedList);
      saveData(STORAGE_KEYS.CREDENTIALS, updatedList);
      addToast(`Credential for ${updatedCred.email} updated`, 'success');
      return { success: true };
    },
    [credentials, settings, addToast]
  );

  const deleteCredential = useCallback(
    (id: string) => {
      const cred = credentials.find((c) => c.id === id);
      const updated = credentials.filter((c) => c.id !== id);
      setCredentials(updated);
      saveData(STORAGE_KEYS.CREDENTIALS, updated);
      if (cred) {
        logActivity(
          'security',
          `Deleted stored credential for ${cred.email}`,
          user?.name || 'User',
          user?.id || 'USR-001'
        );
      }
      addToast('Stored credential deleted', 'info');
    },
    [credentials, user, addToast]
  );

  const decryptCredentialPasswordForEmail = useCallback(
    async (id: string, enteredPin: string) => {
      if (!enteredPin || enteredPin.length !== 4) {
        return { success: false, error: 'Please enter a valid 4-digit PIN' };
      }

      const cred = credentials.find((c) => c.id === id);
      if (!cred) {
        return { success: false, error: 'Credential not found' };
      }

      // 1. Check if the entered PIN equals the settled PIN
      const settledSalt = settings.settledPinSalt || settings.pinSalt;
      const settledHash = settings.settledPinHash || settings.pinHash;

      if (settledSalt && settledHash) {
        const isPinMatch = await verifyPin(enteredPin, settledSalt, settledHash);
        if (!isPinMatch) {
          return { success: false, error: 'Incorrect PIN' };
        }
      }

      // 2. Attempt AES-GCM decryption using the entered PIN
      try {
        const plaintext = await decryptCredentialPassword(
          {
            encrypted: cred.encryptedPassword,
            iv: cred.iv,
            salt: cred.salt,
          },
          enteredPin
        );
        return { success: true, password: plaintext };
      } catch {
        return { success: false, error: 'Incorrect PIN' };
      }
    },
    [credentials, settings]
  );

  // Global actions
  const loadDemoWorkspace = useCallback(() => {
    const { user: demoUser, team: demoTeam } = loadDemoData();
    setUserState(demoUser);
    setTeamState(demoTeam);
    setMembers(loadData<TeamMember[]>(STORAGE_KEYS.MEMBERS, []));
    setProjects(loadData<Project[]>(STORAGE_KEYS.PROJECTS, []));
    setTasks(loadData<Task[]>(STORAGE_KEYS.TASKS, []));
    setAnnouncements(loadData<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []));
    setActivity(loadData<ActivityItem[]>(STORAGE_KEYS.ACTIVITY, []));
    setCredentials(loadData<EncryptedCredential[]>(STORAGE_KEYS.CREDENTIALS, []));
    addToast('Demo Team "Tech Innovators" loaded', 'success');
  }, [addToast]);

  const clearWorkspace = useCallback(() => {
    clearTeamData();
    setTeamState(null);
    setMembers([]);
    setProjects([]);
    setTasks([]);
    setAnnouncements([]);
    setActivity([]);
    setCredentials([]);
    addToast('Workspace data cleared', 'info');
  }, [addToast]);

  const resetAll = useCallback(() => {
    clearAllLocalData();
    setUserState(null);
    setTeamState(null);
    setMembers([]);
    setProjects([]);
    setTasks([]);
    setAnnouncements([]);
    setActivity([]);
    setCredentials([]);
    setSettingsState({
      theme: 'system',
      pinEnabled: false,
      biometricEnabled: false,
    });
    setIsLocked(false);
    addToast('All local data permanently wiped', 'warning');
  }, [addToast]);

  return (
    <AppContext.Provider
      value={{
        user,
        team,
        members,
        projects,
        tasks,
        announcements,
        activity,
        credentials,
        settings,
        isLocked,
        isSearchOpen,
        toasts,
        hasSettledPin,
        setUser,
        setTeam,
        addToast,
        removeToast,
        setIsSearchOpen,
        addMember,
        updateMember,
        deleteMember,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        togglePinAnnouncement,
        markAnnouncementRead,
        updateSettings,
        lockWorkspace,
        unlockWorkspace,
        setupPin,
        removePin,
        setSettledPin,
        verifySettledPin,
        addCredential,
        updateCredential,
        deleteCredential,
        decryptCredentialPasswordForEmail,
        reloadAllData,
        loadDemoWorkspace,
        clearWorkspace,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
