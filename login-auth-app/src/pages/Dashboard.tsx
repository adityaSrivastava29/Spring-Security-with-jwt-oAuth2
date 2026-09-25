import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  useGetB2BDataQuery,
  useGetB2CDataQuery,
  useGetModeratorDataQuery,
} from '../features/users/userApiSlice';
import { useRefreshTokenMutation } from '../features/auth/authApiSlice';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import {
  Key,
  RefreshCw,
  CheckCircle,
  Building,
  ShoppingBag,
  Shield,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, token, isAdmin } = useAuth();
  const [refreshTokenMutation, { isLoading: isRefreshing }] = useRefreshTokenMutation();
  const [refreshSuccessMsg, setRefreshSuccessMsg] = useState<string | null>(null);

  const {
    data: b2bData,
    isLoading: isB2BLoading,
    refetch: refetchB2B,
  } = useGetB2BDataQuery();

  const {
    data: b2cData,
    isLoading: isB2CLoading,
    refetch: refetchB2C,
  } = useGetB2CDataQuery();

  const {
    data: modData,
    isLoading: isModLoading,
    error: modError,
    refetch: refetchMod,
  } = useGetModeratorDataQuery();

  const handleManualRefresh = async () => {
    try {
      setRefreshSuccessMsg(null);
      await refreshTokenMutation().unwrap();
      setRefreshSuccessMsg('Token successfully refreshed & rotated in HttpOnly cookie.');
      setTimeout(() => setRefreshSuccessMsg(null), 3000);
    } catch {
      // Handled in slice
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-left">
      {/* Account Header */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-zinc-800 border border-indigo-100 dark:border-zinc-700 flex items-center justify-center text-indigo-700 dark:text-zinc-100 font-mono text-base font-semibold shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-slate-900 dark:text-zinc-100">{user?.name}</h1>
              {user?.accountType && <StatusBadge value={user.accountType} type="tier" />}
              <StatusBadge value={user?.enabled ? 'Active' : 'Suspended'} type="status" />
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5">{user?.email}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            isLoading={isRefreshing}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Rotate Token
          </Button>

          {isAdmin && (
            <Link to="/admin">
              <Button variant="primary" size="sm" icon={<Layers className="w-3.5 h-3.5" />}>
                Admin Console
              </Button>
            </Link>
          )}
        </div>
      </div>

      {refreshSuccessMsg && (
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{refreshSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Data Tiers & In-Memory Token */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Memory Token Panel */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-300 text-xs font-semibold">
            <Key className="w-4 h-4 text-indigo-600 dark:text-zinc-400" />
            <span>In-Memory JWT Access Token</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            Stateless access token stored strictly in Redux memory. No access tokens reside in localStorage.
          </p>

          <div className="rounded-xl bg-slate-50 dark:bg-zinc-950 p-3 border border-slate-200 dark:border-zinc-800 font-mono text-[11px] text-slate-700 dark:text-zinc-300 break-all max-h-40 overflow-y-auto">
            {token ? (
              <span>{token}</span>
            ) : (
              <span className="text-slate-400 dark:text-zinc-500">No active token loaded</span>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-zinc-400">
              <span>Token Type:</span>
              <span className="font-mono text-slate-900 dark:text-zinc-200 font-medium">Bearer</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-zinc-400">
              <span>Lifespan:</span>
              <span className="font-mono text-slate-900 dark:text-zinc-200 font-medium">15 minutes</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-zinc-400">
              <span>Refresh Token:</span>
              <span className="font-mono text-slate-900 dark:text-zinc-200 font-medium">HttpOnly Cookie (7d)</span>
            </div>
          </div>
        </div>

        {/* Tier Protected Resources */}
        <div className="lg:col-span-2 space-y-4">
          {/* B2B Enterprise Portal Card */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                  Enterprise B2B Resource
                </h3>
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500">
                  GET /api/v1/users/b2b-data
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchB2B()}>
                Query
              </Button>
            </div>

            {isB2BLoading ? (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-zinc-500">
                <Spinner size="sm" className="mx-auto" />
              </div>
            ) : b2bData ? (
              <div className="rounded-xl border border-sky-200 dark:border-sky-500/20 bg-sky-50/60 dark:bg-sky-950/20 p-4 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sky-900 dark:text-sky-300">{b2bData.data?.company}</span>
                  <span className="text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">200 OK Authorized</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-slate-500 dark:text-zinc-500 block">SLA Tier:</span>
                    <span className="text-slate-800 dark:text-zinc-300 font-medium">{b2bData.data?.planTier}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-500 block">API Calls:</span>
                    <span className="text-slate-800 dark:text-zinc-300 font-medium">{b2bData.data?.apiQuotaUsage}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-3 text-xs text-slate-500 dark:text-zinc-500 flex items-center justify-between">
                <span>Requires B2B Enterprise account tier.</span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-600">Restricted</span>
              </div>
            )}
          </div>

          {/* B2C Consumer Card */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-600 dark:text-zinc-400" />
                <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                  Consumer B2C Resource
                </h3>
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500">
                  GET /api/v1/users/b2c-data
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchB2C()}>
                Query
              </Button>
            </div>

            {isB2CLoading ? (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-zinc-500">
                <Spinner size="sm" className="mx-auto" />
              </div>
            ) : b2cData ? (
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950 p-4 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-900 dark:text-zinc-200">
                    {b2cData.data?.loyaltyTier}
                  </span>
                  <span className="text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">200 OK</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-slate-500 dark:text-zinc-500 block">Reward Points:</span>
                    <span className="text-slate-800 dark:text-zinc-200 font-mono font-medium">
                      {b2cData.data?.rewardPoints}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-500 block">Active Orders:</span>
                    <span className="text-slate-800 dark:text-zinc-200 font-mono font-medium">
                      {b2cData.data?.pendingOrders}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-500 block">Promo Code:</span>
                    <span className="text-slate-800 dark:text-zinc-200 font-mono font-medium">
                      {b2cData.data?.discountCode}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Moderator Resource Card */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                  Moderator Queue Endpoint
                </h3>
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500">
                  @PreAuthorize(&quot;hasAnyRole(&apos;MODERATOR&apos;, &apos;ADMIN&apos;)&quot;)
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchMod()}>
                Test
              </Button>
            </div>

            {isModLoading ? (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-zinc-500">
                <Spinner size="sm" className="mx-auto" />
              </div>
            ) : modData ? (
              <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/60 dark:bg-amber-950/20 p-4 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-amber-900 dark:text-amber-300">{modData.data?.title}</span>
                  <span className="text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">200 OK Authorized</span>
                </div>
                <p className="text-slate-700 dark:text-zinc-300 text-[11px]">{modData.data?.message}</p>
              </div>
            ) : modError ? (
              <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-950/20 p-3.5 text-xs text-red-700 dark:text-red-400 flex items-center justify-between">
                <span>403 Forbidden: Requires ROLE_MODERATOR or ROLE_ADMIN</span>
                <span className="text-[10px] font-mono">Blocked</span>
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-zinc-500">
                Click &quot;Test&quot; to verify your role permissions against this endpoint.
              </div>
            )}
          </div>

          {/* Enterprise Security Vault Card (Visible to all users, but restricted) */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                  Enterprise Security & Audit Vault
                </h3>
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500">
                  @PreAuthorize(&quot;hasRole(&apos;ADMIN&apos;)&quot;)
                </span>
              </div>
              <Link to="/audit-vault">
                <Button variant="primary" size="sm">
                  Access Vault
                </Button>
              </Link>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Cryptographically sealed audit records, key rotation registries, and security telemetry. Visible in user navigation, but enforced strictly by backend method security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
