import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  id: string;
  title: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  icon: LucideIcon;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  id,
  title,
  value,
  subtext,
  trend,
  icon: Icon,
}) => {
  return (
    <div
      id={id}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3 sm:p-3.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {title}
        </span>
        <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {value}
        </div>
        {trend && (
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
          {subtext}
        </p>
      )}
    </div>
  );
};
