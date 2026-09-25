import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { useRefreshTokenMutation } from '../features/auth/authApiSlice';
import { Spinner } from '../components/Spinner';
import { Button } from '../components/Button';

export const OAuth2Redirect: React.FC = () => {
  const [refreshTokenApi] = useRefreshTokenMutation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const exchangeToken = async () => {
      try {
        // Triggers /api/v1/auth/refresh with credentials: 'include', sending the cookie set by Spring Boot
        await refreshTokenApi().unwrap();
        if (isMounted) {
          navigate('/dashboard', { replace: true });
        }
      } catch (err: unknown) {
        if (isMounted) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const e = err as any;
          setError(
            e?.data?.message ||
              'Failed to complete Google OAuth2 authentication. Please try logging in again.'
          );
        }
      }
    };

    exchangeToken();

    return () => {
      isMounted = false;
    };
  }, [navigate, refreshTokenApi]);

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">OAuth2 Authentication Failed</h2>
          <p className="text-xs text-rose-300">{error}</p>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
          <ShieldCheck className="w-8 h-8 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-white">Securing Session with Spring Boot</h2>
        <p className="text-xs text-slate-400">
          Exchanging Google OAuth2 credentials for stateless JWT access token...
        </p>
        <Spinner size="lg" className="mx-auto" />
      </div>
    </div>
  );
};
