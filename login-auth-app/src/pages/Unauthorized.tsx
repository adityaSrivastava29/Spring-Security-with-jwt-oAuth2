import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';

export const Unauthorized: React.FC = () => {
  const { user, roles } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400 shadow-lg shadow-rose-500/5">
          <ShieldX className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">
            403 • Access Denied
          </span>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Restricted Area</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Your authenticated account does not have sufficient role privileges to view this resource.
          </p>
        </div>

        {user && (
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-400 space-y-1 shadow-xs">
            <div>
              Signed in as: <span className="font-semibold text-slate-900 dark:text-slate-200">{user.email}</span>
            </div>
            <div>
              Assigned Roles:{' '}
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                {roles.join(', ') || 'NONE'}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <Link to="/dashboard">
            <Button variant="primary" icon={<LayoutDashboard className="w-4 h-4" />} className="text-xs">
              Go to Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} className="text-xs">
              Back Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
