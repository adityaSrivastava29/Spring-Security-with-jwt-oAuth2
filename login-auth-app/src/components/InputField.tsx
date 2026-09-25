import React, { type InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  icon,
  id,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5 text-left">
      <label htmlFor={id} className="block text-xs font-medium text-slate-700 dark:text-zinc-300">
        {label}
      </label>
      <div className="relative rounded-lg">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-zinc-500">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`block w-full rounded-lg border bg-white dark:bg-zinc-900/90 px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 shadow-xs transition-colors focus:outline-none focus:ring-2 ${
            icon ? 'pl-9' : ''
          } ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 text-red-900 dark:text-red-300'
              : 'border-slate-300 dark:border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500/15 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
};
