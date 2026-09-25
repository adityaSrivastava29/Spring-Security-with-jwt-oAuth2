import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AppRoutes } from './routes/AppRoutes';
import { useRefreshTokenMutation } from './features/auth/authApiSlice';
import { useAppDispatch, useAppSelector } from './hooks/reduxHooks';
import { selectIsInitialized, setInitialized } from './features/auth/authSlice';
import { Spinner } from './components/Spinner';
import { ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectIsInitialized);
  const [refreshTokenMutation] = useRefreshTokenMutation();

  useEffect(() => {
    // Attempt bootstrap silent refresh using HttpOnly cookie if present
    const bootstrapAuth = async () => {
      try {
        await refreshTokenMutation().unwrap();
      } catch {
        // No active refresh token cookie found; user will remain in guest state
      } finally {
        dispatch(setInitialized(true));
      }
    };

    bootstrapAuth();
  }, [dispatch, refreshTokenMutation]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center space-y-4 transition-colors">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
          <ShieldCheck className="w-8 h-8 animate-pulse" />
        </div>
        <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono tracking-wider">
          INITIALIZING SPRING SECURITY CONTEXT...
        </p>
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#030712] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-200">
        <Navbar />
        <main className="flex-1">
          <AppRoutes />
        </main>
        <footer className="border-t border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 py-6 text-center text-xs text-slate-500 dark:text-zinc-500 transition-colors backdrop-blur-xs">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">AuthShield</span>
              <span>— Spring Security 6 & React RBAC Architecture</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">REST API: :8080</span>
              <span className="text-slate-500 dark:text-zinc-400">Vite Client: :5174</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
