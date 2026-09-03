export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'editor';
}

const ACCESS_KEY = 'wasel.accessToken';
const REFRESH_KEY = 'wasel.refreshToken';
const USER_KEY = 'wasel.user';

/** Tokens live in localStorage; the access token is short-lived and rotated. */
export const tokenStore = {
  get access(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(ACCESS_KEY);
    } catch {
      return null;
    }
  },

  get refresh(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },

  get user(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },

  save(session: { accessToken: string; refreshToken: string; user: AuthUser }) {
    try {
      window.localStorage.setItem(ACCESS_KEY, session.accessToken);
      window.localStorage.setItem(REFRESH_KEY, session.refreshToken);
      window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    } catch {
      /* storage unavailable — session lasts for this page only */
    }
  },

  clear() {
    try {
      window.localStorage.removeItem(ACCESS_KEY);
      window.localStorage.removeItem(REFRESH_KEY);
      window.localStorage.removeItem(USER_KEY);
    } catch {
      /* nothing to clear */
    }
  },
};

/** Notifies the app when the session ends so it can bounce to /login. */
type Listener = () => void;
const listeners = new Set<Listener>();

export function onSessionExpired(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function endSession() {
  tokenStore.clear();
  listeners.forEach((listener) => listener());
}
