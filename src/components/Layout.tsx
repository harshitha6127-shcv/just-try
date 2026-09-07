import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { ToastContainer } from './Toast';
import { PinLock } from './PinLock';
import { SearchCommand } from './SearchCommand';

export const Layout: React.FC = () => {
  const { user, team, isLocked } = useApp();
  const location = useLocation();

  // If no user profile or no team, redirect to welcome (unless already on /welcome or /import-export)
  if (!user && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F9FAFB] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans text-xs">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden bg-white dark:bg-slate-900">
        <Navbar />

        <main className="flex-1 overflow-y-auto pb-16 md:pb-6 bg-[#F9FAFB] dark:bg-slate-950">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Security Pin Lock Screen */}
      <PinLock />

      {/* Global Command Palette (Ctrl+K) */}
      <SearchCommand />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};
