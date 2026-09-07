import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Welcome } from './pages/Welcome';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { Projects } from './pages/Projects';
import { Tasks } from './pages/Tasks';
import { Announcements } from './pages/Announcements';
import { Activity } from './pages/Activity';
import { Security } from './pages/Security';
import { PasswordVault } from './pages/PasswordVault';
import { ImportExport } from './pages/ImportExport';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="projects" element={<Projects />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="activity" element={<Activity />} />
            <Route path="passwords" element={<PasswordVault />} />
            <Route path="vault" element={<PasswordVault />} />
            <Route path="security" element={<Security />} />
            <Route path="import-export" element={<ImportExport />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
