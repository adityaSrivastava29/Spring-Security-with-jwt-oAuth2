import React from 'react';

interface StatusBadgeProps {
  role?: string;
  type?: 'role' | 'tier' | 'status';
  value?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ role, type = 'role', value }) => {
  const target = value || role || '';

  const getStyle = () => {
    switch (target) {
      case 'ROLE_ADMIN':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
      case 'ROLE_MODERATOR':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      case 'ROLE_USER':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
      case 'B2B':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20';
      case 'B2C':
        return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800/80 dark:text-zinc-400 dark:border-zinc-700/70';
      case 'Active':
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'Suspended':
      case 'SUSPENDED':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };

  const formatText = () => {
    return target.replace('ROLE_', '');
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${getStyle()}`}
    >
      {type === 'status' && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            target.toUpperCase() === 'ACTIVE'
              ? 'bg-emerald-500 dark:bg-emerald-400'
              : 'bg-rose-500 dark:bg-rose-400'
          }`}
        />
      )}
      {formatText()}
    </span>
  );
};
