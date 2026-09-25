import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Lock, KeyRound, Building, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';

export const Home: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24 space-y-16 text-left">
      {/* Hero Section */}
      <div className="space-y-5 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white/90 dark:border-zinc-800 dark:bg-zinc-900/80 text-[11px] font-mono text-slate-700 dark:text-zinc-300 shadow-xs">
          <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Spring Security 6 + React Redux Toolkit Architecture</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
          Stateless JWT, OAuth2, and Granular RBAC for B2B & B2C
        </h1>

        <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          Complete authentication engine featuring in-memory access tokens, HttpOnly refresh cookies with mutex rotation, Google OAuth2 social login, and multi-tier access control.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                  Go to Dashboard
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="secondary" size="lg">
                    Admin Console
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/signup">
                <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                  Create Account
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Test Accounts Bar */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Pre-Seeded Test Credentials
          </span>
          <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-500">Auto-populated in database</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-zinc-200">System Admin</span>
              <span className="text-[10px] font-mono font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-500/20">ADMIN</span>
            </div>
            <div className="font-mono text-slate-600 dark:text-zinc-400 text-[11px]">admin@example.com</div>
            <div className="font-mono text-slate-500 dark:text-zinc-500 text-[11px]">admin123</div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-zinc-200">B2B Enterprise Lead</span>
              <span className="text-[10px] font-mono font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-500/20">B2B USER</span>
            </div>
            <div className="font-mono text-slate-600 dark:text-zinc-400 text-[11px]">enterprise@acme.com</div>
            <div className="font-mono text-slate-500 dark:text-zinc-500 text-[11px]">b2b123</div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-zinc-200">Standard Customer</span>
              <span className="text-[10px] font-mono font-medium text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700">B2C USER</span>
            </div>
            <div className="font-mono text-slate-600 dark:text-zinc-400 text-[11px]">user@example.com</div>
            <div className="font-mono text-slate-500 dark:text-zinc-500 text-[11px]">user123</div>
          </div>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 space-y-2 shadow-xs">
          <div className="text-slate-900 dark:text-zinc-200 font-semibold text-xs flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Dual Authentication</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            Local database accounts authenticated via BCrypt hashing alongside direct Google OAuth2 social login with automated user provisioning.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 space-y-2 shadow-xs">
          <div className="text-slate-900 dark:text-zinc-200 font-semibold text-xs flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>B2B & B2C Account Tiers</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            Distinguish enterprise clients with dedicated quotas and SLAs from personal consumer accounts, managed via Spring Security method security.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 space-y-2 shadow-xs">
          <div className="text-slate-900 dark:text-zinc-200 font-semibold text-xs flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Granular RBAC Guarding</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            RoleRoute guards on React client and <code>@PreAuthorize</code> annotations on Spring controllers safeguard administrative and moderation actions.
          </p>
        </div>
      </div>
    </div>
  );
};
