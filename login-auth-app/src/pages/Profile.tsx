import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUpdateProfileMutation } from '../features/users/userApiSlice';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { Shield, Building, User as UserIcon, Check, Key, AlertCircle } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, token, roles } = useAuth();
  const [updateProfileApi, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [name, setName] = useState(user?.name || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    try {
      await updateProfileApi({ name, organization }).unwrap();
      setStatusMsg({ type: 'success', text: 'Profile details saved successfully.' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      setStatusMsg({
        type: 'error',
        text: error?.data?.message || 'Failed to update profile.',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-left">
      {/* Page Title */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-4">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">Account Profile</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Manage your personal details, inspect assigned RBAC roles, and review session security
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400'
              : 'border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <Check className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Account Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Identity Card */}
        <div className="md:col-span-1 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-zinc-800 border border-indigo-100 dark:border-zinc-700 flex items-center justify-center text-indigo-700 dark:text-zinc-200 font-mono text-base font-semibold shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{user?.name}</div>
            <div className="text-xs font-mono text-slate-500 dark:text-zinc-400 break-all">{user?.email}</div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
              <span>Account Type:</span>
              <StatusBadge value={user?.accountType} type="tier" />
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
              <span>Status:</span>
              <StatusBadge value={user?.enabled ? 'Active' : 'Suspended'} type="status" />
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
              <span>Provider:</span>
              <span className="font-mono text-slate-700 dark:text-zinc-300 text-[11px] font-medium">{user?.provider}</span>
            </div>

            {user?.organization && (
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <span>Org:</span>
                <span className="text-slate-800 dark:text-zinc-300 text-[11px] font-medium truncate max-w-[120px]">
                  {user.organization}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-4 shadow-xs">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Personal Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              id="name"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<UserIcon className="w-4 h-4" />}
              required
            />

            <InputField
              id="organization"
              label={user?.accountType === 'B2B' ? 'Organization / Company Name (B2B)' : 'Organization (Optional)'}
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. Acme Corporation"
              icon={<Building className="w-4 h-4" />}
            />

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="sm" isLoading={isUpdating}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* RBAC Roles & Session State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Roles */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 dark:text-zinc-300 text-xs font-semibold">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-zinc-400" />
            <span>Assigned Authorization Roles</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            Your account grants you access to protected routes and backend APIs based on these authorities:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {roles.map((r) => (
              <StatusBadge key={r} role={r} />
            ))}
          </div>
        </div>

        {/* Security / Token Details */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 dark:text-zinc-300 text-xs font-semibold">
            <Key className="w-4 h-4 text-indigo-600 dark:text-zinc-400" />
            <span>Security & Token Architecture</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            Authentication is handled via an ephemeral Bearer token kept strictly in memory, while sessions are maintained by an HttpOnly Strict cookie.
          </p>
          <div className="rounded-xl bg-slate-50 dark:bg-zinc-950 p-2.5 border border-slate-200 dark:border-zinc-800 font-mono text-[10px] text-slate-600 dark:text-zinc-400 truncate">
            {token ? `Active Token: ${token.substring(0, 32)}...` : 'No active token'}
          </div>
        </div>
      </div>
    </div>
  );
};
