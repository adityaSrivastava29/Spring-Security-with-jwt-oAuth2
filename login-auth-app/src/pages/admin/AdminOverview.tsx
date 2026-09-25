import React from 'react';
import { Link } from 'react-router-dom';
import {
  useGetAdminDashboardQuery,
  useGetAllUsersQuery,
} from '../../features/users/userApiSlice';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';
import {
  Users,
  ShieldAlert,
  Building,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const { data: metricsData, isLoading: isMetricsLoading } = useGetAdminDashboardQuery();
  const { data: usersData, isLoading: isUsersLoading } = useGetAllUsersQuery();

  const metrics = metricsData?.data;
  const recentUsers = (usersData?.data || []).slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">Administrator Console</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            System overview, account classifications (B2B / B2C), and RBAC management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/users">
            <Button variant="secondary" size="sm" icon={<Users className="w-3.5 h-3.5" />}>
              Manage All Users
            </Button>
          </Link>
          <Link to="/admin/rbac">
            <Button variant="primary" size="sm" icon={<Layers className="w-3.5 h-3.5" />}>
              RBAC Matrix
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-medium">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mt-2">
            {isMetricsLoading ? <Spinner size="sm" /> : metrics?.totalUsers ?? 0}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 block">Database records</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-medium">
            <span>Enterprise B2B</span>
            <Building className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-2">
            {isMetricsLoading ? <Spinner size="sm" /> : metrics?.b2bUsers ?? 0}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 block">Corporate accounts</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-medium">
            <span>Consumer B2C</span>
            <Users className="w-4 h-4 text-indigo-600 dark:text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-zinc-200 mt-2">
            {isMetricsLoading ? <Spinner size="sm" /> : metrics?.b2cUsers ?? 0}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 block">Individual customers</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-medium">
            <span>Admins / Mods</span>
            <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
            {isMetricsLoading ? (
              <Spinner size="sm" />
            ) : (
              `${metrics?.adminUsers ?? 0} / ${metrics?.moderatorUsers ?? 0}`
            )}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 block">Privileged staff</span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 dark:text-zinc-200 font-semibold text-sm">
              <Users className="w-4 h-4 text-indigo-600 dark:text-zinc-400" />
              <span>User Directory & Status Control</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Inspect user records, switch tiers between B2B and B2C, toggle account active/suspended status, and modify assigned roles.
            </p>
          </div>
          <Link to="/admin/users">
            <Button variant="outline" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open Directory
            </Button>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 dark:text-zinc-200 font-semibold text-sm">
              <Shield className="w-4 h-4 text-indigo-600 dark:text-zinc-400" />
              <span>Granular RBAC Permission Matrix</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Explore the exact endpoint permissions assigned to Guest, B2C User, B2B Enterprise Client, Moderator, and Administrator tiers.
            </p>
          </div>
          <Link to="/admin/rbac">
            <Button variant="outline" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
              Inspect RBAC Matrix
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Users Snapshot */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900 dark:text-zinc-200 uppercase tracking-wider">
            Recent Accounts
          </span>
          <Link to="/admin/users" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-zinc-400 dark:hover:text-zinc-200">
            View all &rarr;
          </Link>
        </div>

        {isUsersLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-500">
            <Spinner size="sm" className="mx-auto" />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
            {recentUsers.map((u) => (
              <div key={u.id} className="px-5 py-3 flex items-center justify-between text-xs hover:bg-slate-50/60 dark:hover:bg-zinc-850/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-zinc-800 border border-indigo-100 dark:border-zinc-700 flex items-center justify-center font-mono text-[11px] font-medium text-indigo-700 dark:text-zinc-300">
                    {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900 dark:text-zinc-200 block">{u.name}</span>
                    <span className="font-mono text-slate-500 dark:text-zinc-500 text-[11px]">{u.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge value={u.accountType} type="tier" />
                  <StatusBadge value={u.enabled ? 'Active' : 'Suspended'} type="status" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
