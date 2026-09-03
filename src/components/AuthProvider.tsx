'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { endSession, onSessionExpired, tokenStore, type AuthUser } from '@/lib/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

const PUBLIC_ROUTES = ['/login'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Restore the session on first paint, then confirm it against the API.
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const cached = tokenStore.user;
      if (cached) setUser(cached);

      if (!tokenStore.access && !tokenStore.refresh) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const me = await api.auth.me();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) {
          tokenStore.clear();
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  // The API client ends the session when a refresh fails.
  useEffect(() => onSessionExpired(() => setUser(null)), []);

  // Keep the route and the session in sync.
  useEffect(() => {
    if (loading) return;

    if (!user && !isPublicRoute) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (user && isPublicRoute) {
      // Honour the destination the guard captured, but only same-origin paths.
      const next = new URLSearchParams(window.location.search).get('next');
      const safeNext = next && /^\/(?!\/)/.test(next) ? next : '/';
      router.replace(safeNext);
    }
  }, [user, loading, isPublicRoute, pathname, router]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await api.auth.login(email, password);
    tokenStore.save(session);
    setUser(session.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      /* revoke locally even if the call fails */
    }
    endSession();
    setUser(null);
    router.replace('/login');
  }, [router]);

  if (loading || (!user && !isPublicRoute)) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-7 w-7 animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
