import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, AlertCircle, Building, Shield } from 'lucide-react';
import { useSignupMutation } from '../features/auth/authApiSlice';
import { useAuth } from '../hooks/useAuth';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';

export const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<'B2C' | 'B2B'>('B2C');
  const [organization, setOrganization] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [signupApi, { isLoading }] = useSignupMutation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name || !email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      await signupApi({
        name,
        email,
        password,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        accountType: accountType as any,
        organization: accountType === 'B2B' ? organization : undefined,
        roles: ['ROLE_USER'],
      }).unwrap();

      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      if (error?.data?.message) {
        setErrorMessage(error.data.message);
      } else {
        setErrorMessage('Unable to register user. Email may already be taken.');
      }
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-5 text-left">
        <div className="space-y-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-zinc-900 border border-indigo-100 dark:border-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">Create an Account</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400">Select an account tier and start exploring RBAC</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 space-y-4 shadow-sm">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Social Sign-in */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.25 21.37 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.42l4.02-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.63 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>Sign up with Google</span>
          </button>

          <div className="relative my-3 text-center text-xs">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
            </div>
            <span className="relative bg-white dark:bg-zinc-950 px-2 text-[10px] uppercase font-mono text-slate-500 dark:text-zinc-500">
              or credentials
            </span>
          </div>

          {/* Account Tier Choice */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300">Account Tier</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setAccountType('B2C')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  accountType === 'B2C'
                    ? 'border-indigo-500/70 bg-indigo-50/50 text-indigo-950 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700'
                }`}
              >
                <div className="font-semibold text-xs text-slate-900 dark:text-zinc-200">B2C Customer</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-500">Individual portal</div>
              </button>

              <button
                type="button"
                onClick={() => setAccountType('B2B')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  accountType === 'B2B'
                    ? 'border-sky-500/80 bg-sky-50 text-sky-950 dark:border-sky-500/60 dark:bg-sky-950/30 dark:text-sky-300 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700'
                }`}
              >
                <div className="font-semibold text-xs text-sky-900 dark:text-sky-300">B2B Enterprise</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-500">Corporate portal</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <InputField
              id="name"
              type="text"
              label="Full Name"
              placeholder="e.g. Alex Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<UserIcon className="w-3.5 h-3.5" />}
              required
            />

            <InputField
              id="email"
              type="email"
              label="Email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-3.5 h-3.5" />}
              required
            />

            {accountType === 'B2B' && (
              <InputField
                id="organization"
                type="text"
                label="Company / Organization Name"
                placeholder="e.g. Acme Corp"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                icon={<Building className="w-3.5 h-3.5" />}
                required
              />
            )}

            <InputField
              id="password"
              type="password"
              label="Password (min 6 characters)"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-3.5 h-3.5" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-1"
            >
              Register Account
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-zinc-500">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
