import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, LogOut, ShieldAlert, Sun, Moon, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLogoutMutation } from '../features/auth/authApiSlice';
import { useTheme } from '../context/ThemeContext';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, isAdmin, roles } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // Ignored
    } finally {
      navigate('/login');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-zinc-900 border border-indigo-100 dark:border-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-all shadow-xs">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
                  AuthShield
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800">
                  RBAC
                </span>
              </div>
            </Link>

            {/* Main Nav Links */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-slate-100 text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/50'
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/profile"
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive('/profile')
                      ? 'bg-slate-100 text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/50'
                  }`}
                >
                  Profile
                </Link>

                {/* Audit Vault (Visible to all users, but restricted to ADMIN in backend) */}
                <Link
                  to="/audit-vault"
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/audit-vault')
                      ? 'bg-slate-100 text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/50'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  <span>Audit Vault</span>
                </Link>

                {/* Admin Only Navigation Links */}
                {isAdmin && (
                  <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-200 dark:border-zinc-800">
                    <Link
                      to="/admin"
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        isActive('/admin')
                          ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/50'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Admin Overview</span>
                    </Link>

                    <Link
                      to="/admin/users"
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive('/admin/users')
                          ? 'bg-slate-100 text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/50'
                      }`}
                    >
                      All Users
                    </Link>

                    <Link
                      to="/admin/rbac"
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive('/admin/rbac')
                          ? 'bg-slate-100 text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/50'
                      }`}
                    >
                      RBAC Matrix
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button (Default Light, switchable to Dark) */}
            <button
              onClick={toggleTheme}
              type="button"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100/80 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-800 dark:text-zinc-200 font-mono text-xs font-semibold shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-medium text-slate-900 dark:text-zinc-200">{user?.name}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {user?.accountType && <StatusBadge value={user.accountType} type="tier" />}
                      {roles.slice(0, 1).map((r) => (
                        <StatusBadge key={r} role={r} />
                      ))}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900 border border-transparent hover:border-slate-200 dark:hover:border-zinc-800 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
