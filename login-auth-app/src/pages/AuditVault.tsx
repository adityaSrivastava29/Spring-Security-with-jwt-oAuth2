import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAuditVaultQuery } from '../features/users/userApiSlice';
import { useAuth } from '../hooks/useAuth';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import {
  Lock,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  KeyRound,
  FileCheck,
  AlertTriangle,
  Server,
} from 'lucide-react';

export const AuditVault: React.FC = () => {
  const { user, roles } = useAuth();
  const { data: vaultData, isLoading, error, refetch, isFetching } = useGetAuditVaultQuery();
  const [requestSent, setRequestSent] = useState(false);

  const vault = vaultData?.data;

  // Check if error is 403 Forbidden
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errObj = error as any;
  const isForbidden = errObj?.status === 403 || (!vault && !isLoading);

  const handleRequestAccess = () => {
    setRequestSent(true);
    setTimeout(() => setRequestSent(false), 5000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 text-left">
      {/* Breadcrumb & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-zinc-500 mb-1">
            <Link to="/dashboard" className="hover:text-slate-800 dark:hover:text-zinc-300">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-zinc-200 font-semibold">Security & Audit Vault</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Enterprise Security Vault</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Cryptographically sealed system audit records and key rotation monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Re-verify Access
          </Button>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-12 text-center space-y-3 shadow-xs">
          <Spinner size="md" className="mx-auto" />
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono tracking-wider">
            AUTHENTICATING SPRING METHOD SECURITY CONTEXT...
          </p>
        </div>
      ) : isForbidden ? (
        /* NO ACCESS / ACCESS DENIED STATE FOR NORMAL USERS */
        <div className="space-y-6">
          <div className="rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6 opacity-5 pointer-events-none">
              <ShieldAlert className="w-48 h-48 text-rose-500" />
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0 shadow-xs">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-500/20">
                    403 Forbidden • Clearance Required
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                    Endpoint: GET /api/v1/users/audit-vault
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                  Access Denied: Enterprise Security Vault
                </h2>

                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                  You have successfully navigated to the Security & Audit Vault, but your current account clearance does not have permission to decrypt or inspect these audit logs. This route enforces Spring Security method security via <code className="bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800 dark:text-zinc-200">@PreAuthorize(&quot;hasRole(&apos;ADMIN&apos;)&quot;)</code>.
                </p>
              </div>
            </div>

            {/* Diagnostic Breakdown Matrix */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-zinc-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 space-y-2.5 text-xs">
                <div className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-slate-500" />
                  <span>Your Current Identity & Authorities</span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Account:</span>
                    <span className="font-mono text-slate-800 dark:text-zinc-200 font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Classification:</span>
                    <StatusBadge value={user?.accountType} type="tier" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-zinc-400">Granted Roles:</span>
                    <div className="flex gap-1">
                      {roles.map((r) => (
                        <StatusBadge key={r} role={r} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-rose-200/80 dark:border-rose-500/20 bg-rose-50/40 dark:bg-rose-950/10 space-y-2.5 text-xs">
                <div className="font-semibold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Authorization Policy Requirements</span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Required Role:</span>
                    <StatusBadge role="ROLE_ADMIN" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Security Gate:</span>
                    <span className="font-mono text-slate-700 dark:text-zinc-300">MethodSecurityInterceptor</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">HTTP Status:</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">403 FORBIDDEN</span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Action Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRequestAccess}
                  disabled={requestSent}
                >
                  {requestSent ? 'Elevation Request Dispatched' : 'Request Role Elevation'}
                </Button>
                <Link to="/dashboard">
                  <Button variant="secondary" size="sm">
                    Return to Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            {requestSent && (
              <div className="mt-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 text-xs flex items-center gap-2">
                <FileCheck className="w-4 h-4 flex-shrink-0" />
                <span>Simulated elevation ticket dispatched to security administrator.</span>
              </div>
            )}
          </div>
        </div>
      ) : vault ? (
        /* GRANTED / ADMIN STATE */
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-zinc-900/40 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                      Vault Status: {vault.vaultStatus}
                    </h2>
                    <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20 px-2 py-0.5 rounded">
                      200 OK GRANTED
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Authenticated Auditor: <span className="font-mono text-slate-700 dark:text-zinc-300 font-semibold">{vault.activeAuditor}</span>
                  </p>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="text-slate-500 dark:text-zinc-400 block">Encryption Standard:</span>
                <span className="font-mono text-slate-800 dark:text-zinc-200 font-medium">{vault.encryptionStandard}</span>
              </div>
            </div>
          </div>

          {/* Audit Records Table */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Privileged Security Audit Events</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                {vault.accessRecords?.length || 0} events logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                <thead className="bg-slate-50 dark:bg-zinc-950 text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-5 py-3">Audit ID</th>
                    <th className="px-5 py-3">Event Action</th>
                    <th className="px-5 py-3">Severity</th>
                    <th className="px-5 py-3">Origin IP</th>
                    <th className="px-5 py-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-normal">
                  {vault.accessRecords?.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-[11px] font-semibold text-slate-900 dark:text-zinc-200">
                        {record.id}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-800 dark:text-zinc-200 font-medium">
                        {record.event}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                            record.severity === 'HIGH'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                              : record.severity === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                              : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                          }`}
                        >
                          {record.severity}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                        {record.ip}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500 dark:text-zinc-500 text-right">
                        {record.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
