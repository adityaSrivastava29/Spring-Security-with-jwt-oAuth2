import React, { useState } from 'react';
import { useGetRbacMatrixQuery } from '../../features/users/userApiSlice';
import { Spinner } from '../../components/Spinner';
import { Check, X, Shield, Lock } from 'lucide-react';

export const AdminRbacMatrix: React.FC = () => {
  const { data: matrixData, isLoading } = useGetRbacMatrixQuery();
  const matrix = matrixData?.data || [];

  const [selectedRole, setSelectedRole] = useState<'GUEST' | 'B2C' | 'B2B' | 'MODERATOR' | 'ADMIN'>('B2B');

  const checkAccess = (item: (typeof matrix)[0], role: typeof selectedRole) => {
    switch (role) {
      case 'GUEST':
        return item.guest;
      case 'B2C':
        return item.b2cUser;
      case 'B2B':
        return item.b2bUser;
      case 'MODERATOR':
        return item.moderator;
      case 'ADMIN':
        return item.admin;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-left">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-4">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">Granular RBAC Architecture Matrix</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Detailed mapping of resources, API endpoints, and authorization rules across B2B, B2C, Moderator, and Admin roles
        </p>
      </div>

      {/* Role Simulator Selector */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-zinc-200">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-zinc-400" />
            <span>Simulate Role Perspective</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">
            Active: {selectedRole}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['GUEST', 'B2C', 'B2B', 'MODERATOR', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all cursor-pointer ${
                selectedRole === r
                  ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 dark:border-zinc-800'
              }`}
            >
              {r === 'GUEST' ? 'Unauthenticated (Guest)' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Table */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-zinc-500">
            <Spinner size="md" className="mx-auto mb-2" />
            <span>Loading permission matrix...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50 dark:bg-zinc-950 text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3">Resource & Description</th>
                  <th className="px-5 py-3">Endpoint</th>
                  <th className="px-4 py-3 text-center">Guest</th>
                  <th className="px-4 py-3 text-center">B2C User</th>
                  <th className="px-4 py-3 text-center">B2B User</th>
                  <th className="px-4 py-3 text-center">Moderator</th>
                  <th className="px-4 py-3 text-center">Admin</th>
                  <th className="px-5 py-3 text-right">Simulation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {matrix.map((item, idx) => {
                  const hasCurrentAccess = checkAccess(item, selectedRole);

                  return (
                    <tr
                      key={idx}
                      className={`transition-colors ${
                        hasCurrentAccess
                          ? 'hover:bg-slate-50/70 dark:hover:bg-zinc-900/40'
                          : 'opacity-65 bg-slate-50/40 dark:bg-zinc-950/40'
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100">{item.resource}</div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">{item.description}</div>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                        {item.endpoint}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {item.guest ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600 mx-auto" />
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {item.b2cUser ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600 mx-auto" />
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {item.b2bUser ? (
                          <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 mx-auto" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600 mx-auto" />
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {item.moderator ? (
                          <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mx-auto" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600 mx-auto" />
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {item.admin ? (
                          <Check className="w-3.5 h-3.5 text-red-600 dark:text-red-400 mx-auto" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600 mx-auto" />
                        )}
                      </td>

                      {/* Simulation result for active role */}
                      <td className="px-5 py-3.5 text-right">
                        {hasCurrentAccess ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20 px-2 py-0.5 rounded">
                            <Check className="w-3 h-3" /> ALLOWED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-100 border border-slate-200 dark:text-zinc-500 dark:bg-zinc-900 dark:border-zinc-800 px-2 py-0.5 rounded">
                            <Lock className="w-3 h-3" /> 403 DENIED
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
