import React, { type ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 rounded-lg gap-1.5',
    md: 'text-xs px-3.5 py-2 rounded-lg gap-2',
    lg: 'text-sm px-4 py-2.5 rounded-xl gap-2',
  };

  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.99]';

  const variantClasses = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm hover:shadow active:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:text-white dark:active:bg-indigo-600',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-xs dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-800',
    danger:
      'bg-red-50 hover:bg-red-100/80 text-red-600 border border-red-200/80 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 dark:border-red-500/20',
    outline:
      'bg-transparent hover:bg-slate-100/80 text-slate-700 border border-slate-200 dark:bg-transparent dark:hover:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-transparent dark:hover:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-1.5">
          <Spinner size="sm" className="border-current" />
          <span>Processing...</span>
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          {icon}
          {children}
        </span>
      )}
    </button>
  );
};
