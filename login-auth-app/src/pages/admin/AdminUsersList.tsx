import React, { useState, useMemo } from 'react';
import {
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useToggleUserStatusMutation,
  useUpdateUserAccountTypeMutation,
  useDeleteUserMutation,
} from '../../features/users/userApiSlice';
import type { User } from '../../features/auth/authSlice';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Spinner } from '../../components/Spinner';
import {
  Search,
  Trash2,
  Building,
  UserCheck,
  UserX,
  AlertCircle,
  Check,
  RefreshCw,
} from 'lucide-react';

export const AdminUsersList: React.FC = () => {
  const { data: usersData, isLoading, refetch } = useGetAllUsersQuery();
  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();
  const [toggleStatus, { isLoading: isTogglingStatus }] = useToggleUserStatusMutation();
  const [updateAccountType, { isLoading: isUpdatingTier }] = useUpdateUserAccountTypeMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'B2B' | 'B2C' | 'ADMIN' | 'SUSPENDED'>('ALL');

  // Modal State for Role Management
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const users = usersData?.data || [];

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Tab filter
      if (activeTab === 'B2B' && u.accountType !== 'B2B') return false;
      if (activeTab === 'B2C' && u.accountType !== 'B2C') return false;
      if (activeTab === 'ADMIN' && !u.roles.includes('ROLE_ADMIN')) return false;
      if (activeTab === 'SUSPENDED' && u.enabled) return false;

      // Text search
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.organization && u.organization.toLowerCase().includes(q))
      );
    });
  }, [users, activeTab, searchQuery]);

  const handleOpenEditModal = (u: User) => {
    setSelectedUser(u);
    setSelectedRoles([...u.roles]);
    setStatusMsg(null);
  };

  const handleToggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length === 1) {
        setStatusMsg({ type: 'error', text: 'A user must retain at least one role.' });
        return;
      }
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
    setStatusMsg(null);
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;
    try {
      await updateUserRole({ id: selectedUser.id, roles: selectedRoles }).unwrap();
      setStatusMsg({ type: 'success', text: `Roles updated for ${selectedUser.name}.` });
      setTimeout(() => setSelectedUser(null), 1200);
      refetch();
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      setStatusMsg({ type: 'error', text: error?.data?.message || 'Failed to update roles.' });
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await toggleStatus(user.id).unwrap();
      refetch();
    } catch {
      // Handled
    }
  };

  const handleSwitchTier = async (user: User) => {
    const nextTier = user.accountType === 'B2B' ? 'B2C' : 'B2B';
    try {
      await updateAccountType({ id: user.id, accountType: nextTier }).unwrap();
      refetch();
    } catch {
      // Handled
    }
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete user ${user.email}? This action is irreversible.`)) {
      try {
        await deleteUser(user.id).unwrap();
        refetch();
      } catch {
        // Handled
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-left">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">User Directory</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Admin management view: toggle roles, switch B2B/B2C accounts, and manage account statuses
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} icon={<RefreshCw className="w-3 h-3" />}>
          Refresh
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 border border-slate-200 dark:border-zinc-800 rounded-xl p-1 bg-white/80 dark:bg-zinc-900/50 shadow-xs">
          {(['ALL', 'B2B', 'B2C', 'ADMIN', 'SUSPENDED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-zinc-100 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {tab === 'ALL' ? 'All Accounts' : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search name, email, org..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-zinc-500">
            <Spinner size="md" className="mx-auto mb-2" />
            <span>Loading user registry...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-zinc-500">
            No accounts match the current filter or search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50 dark:bg-zinc-950 text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3">Account</th>
                  <th className="px-5 py-3">Tier</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Roles</th>
                  <th className="px-5 py-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-normal">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-zinc-800 border border-indigo-100 dark:border-zinc-700 flex items-center justify-center font-mono text-[11px] font-semibold text-indigo-700 dark:text-zinc-200 shadow-xs">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-zinc-100">{u.name}</div>
                          <div className="font-mono text-slate-500 dark:text-zinc-500 text-[11px]">{u.email}</div>
                          {u.organization && (
                            <div className="text-[10px] text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                              <span>{u.organization}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge value={u.accountType} type="tier" />
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge value={u.enabled ? 'Active' : 'Suspended'} type="status" />
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <StatusBadge key={r} role={r} />
                        ))}
                      </div>
                    </td>

                    {/* Admin Actions Toolbar - Exclusive to Admin View */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          title="Edit Roles"
                          className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-700 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Roles
                        </button>

                        <button
                          onClick={() => handleSwitchTier(u)}
                          disabled={isUpdatingTier}
                          title="Switch B2B / B2C"
                          className="px-2 py-1 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-sky-400 dark:border-zinc-700 text-[11px] font-mono transition-colors cursor-pointer"
                        >
                          {u.accountType === 'B2B' ? '-> B2C' : '-> B2B'}
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isTogglingStatus}
                          title={u.enabled ? 'Suspend Account' : 'Activate Account'}
                          className={`p-1 rounded-md border transition-colors cursor-pointer ${
                            u.enabled
                              ? 'bg-slate-100 border-slate-200 text-slate-500 hover:text-red-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-red-400'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                          }`}
                        >
                          {u.enabled ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleDelete(u)}
                          disabled={isDeleting}
                          title="Delete Account"
                          className="p-1 rounded-md bg-slate-100 border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Edit Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={`Edit Roles for ${selectedUser?.name}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-zinc-400">
            Configure assigned RBAC authorities for{' '}
            <span className="font-mono text-slate-900 dark:text-zinc-200 font-semibold">{selectedUser?.email}</span>.
          </p>

          {statusMsg && (
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400'
                  : 'border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="space-y-2 pt-1">
            {[
              {
                id: 'ROLE_USER',
                title: 'ROLE_USER',
                desc: 'Standard member portal, personal dashboard, B2B/B2C data access.',
              },
              {
                id: 'ROLE_MODERATOR',
                title: 'ROLE_MODERATOR',
                desc: 'Review queue, community audit logs, and moderator metrics.',
              },
              {
                id: 'ROLE_ADMIN',
                title: 'ROLE_ADMIN',
                desc: 'Full administrative powers, user directory, status toggle, role modification.',
              },
            ].map((roleOpt) => {
              const isChecked = selectedRoles.includes(roleOpt.id);
              return (
                <div
                  key={roleOpt.id}
                  onClick={() => handleToggleRole(roleOpt.id)}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-start gap-3 ${
                    isChecked
                      ? 'border-indigo-400 bg-indigo-50/50 text-indigo-950 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-0.5 rounded border-slate-300 dark:border-zinc-700 text-indigo-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-mono font-semibold text-slate-900 dark:text-zinc-200 block text-xs">
                      {roleOpt.title}
                    </span>
                    <span className="text-slate-500 dark:text-zinc-500 text-[11px] block mt-0.5">
                      {roleOpt.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveRoles} isLoading={isUpdatingRole}>
              Save Roles
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
