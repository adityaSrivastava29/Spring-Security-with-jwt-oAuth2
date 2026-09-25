import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Shield } from 'lucide-react';
import { useLoginMutation } from '../features/auth/authApiSlice';
import { useAuth } from '../hooks/useAuth';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [loginApi, { isLoading }] = useLoginMutation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('error')) {
      setErrorMessage('Google Authentication failed. Please verify credentials or try again.');
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    try {
      await loginApi({ email, password }).unwrap();
      navigate(from, { replace: true });
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      if (error?.data?.message) {
        setErrorMessage(error.data.message);
      } else if (error?.status === 401) {
        setErrorMessage('Invalid email or password.');
      } else {
        setErrorMessage('Unable to connect to authentication server.');
      }
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMessage('');
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-5 text-left">
        <div className="space-y-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-zinc-900 border border-indigo-100 dark:border-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">Sign in to AuthShield</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400">Use email credentials or Google OAuth2</p>
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
            <span>Continue with Google</span>
          </button>

          <div className="relative my-3 text-center text-xs">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
            </div>
            <span className="relative bg-white dark:bg-zinc-950 px-2 text-[10px] uppercase font-mono text-slate-500 dark:text-zinc-500">
              or email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <InputField
              id="email"
              type="email"
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-3.5 h-3.5" />}
              required
            />

            <InputField
              id="password"
              type="password"
              label="Password"
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
              Sign In
            </Button>
          </form>

          {/* Quick Demo Fills */}
          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800/80">
            <span className="text-[10px] text-slate-500 dark:text-zinc-500 block mb-1.5 uppercase font-mono">
              Quick Test Autofill:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => fillCredentials('admin@example.com', 'admin123')}
                className="p-1 rounded-md bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-red-600 dark:text-red-400 font-mono transition-colors cursor-pointer text-center border border-slate-200 dark:border-transparent"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('enterprise@acme.com', 'b2b123')}
                className="p-1 rounded-md bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-sky-600 dark:text-sky-400 font-mono transition-colors cursor-pointer text-center border border-slate-200 dark:border-transparent"
              >
                B2B Lead
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('user@example.com', 'user123')}
                className="p-1 rounded-md bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-mono transition-colors cursor-pointer text-center border border-slate-200 dark:border-transparent"
              >
                B2C User
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-zinc-500">
          Need an account?{' '}
          <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium underline underline-offset-4">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};
