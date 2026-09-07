import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed bottom-4 right-4 sm:right-6 sm:bottom-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let iconColor = 'text-emerald-500 dark:text-emerald-400';
        let borderColor = 'border-emerald-200 dark:border-emerald-800/40';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'text-rose-500 dark:text-rose-400';
          borderColor = 'border-rose-200 dark:border-rose-800/40';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = 'text-amber-500 dark:text-amber-400';
          borderColor = 'border-amber-200 dark:border-amber-800/40';
        } else if (toast.type === 'info') {
          Icon = Info;
          iconColor = 'text-indigo-500 dark:text-indigo-400';
          borderColor = 'border-indigo-200 dark:border-indigo-800/40';
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-center justify-between gap-2.5 p-2.5 bg-white dark:bg-slate-900 border ${borderColor} rounded shadow-md text-xs transition-all duration-200 animate-in fade-in slide-in-from-bottom-2`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Icon className={`w-3.5 h-3.5 shrink-0 ${iconColor}`} />
              <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
                {toast.message}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
