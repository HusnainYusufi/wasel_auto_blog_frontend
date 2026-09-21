import { endSession, tokenStore, type AuthUser } from './auth';
import type {
  BlogDetail,
  BlogSummary,
  GenerateRequest,
  GeneratorOptions,
  KnowledgeList,
  KnowledgeProfile,
  AuditEntry,
  KeywordSet,
  KeywordSetInput,
} from './types';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4100/api';

/**
 * Refreshing is shared: if several requests 401 at once they all await the same
 * refresh call instead of each rotating the token and invalidating the others.
 */
let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return false;

  refreshInFlight ??= (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;

      const session = await res.json();
      tokenStore.save(session);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/** Routes that must never trigger a refresh-and-retry, to avoid a loop. */
const NO_REFRESH_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout'];

async function request<T>(path: string, init?: RequestInit, retry = true): Promise<T> {
  const accessToken = tokenStore.access;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  // One transparent refresh-and-retry before giving up on the session.
  if (res.status === 401 && retry && !NO_REFRESH_PATHS.some((p) => path.startsWith(p))) {
    if (await refreshSession()) {
      return request<T>(path, init, false);
    }
    endSession();
    throw new Error('Your session has expired. Please sign in again.');
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = Array.isArray(body?.message)
        ? body.message.join(', ')
        : (body?.message ?? message);
    } catch {
      /* keep the generic message */
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: AuthUser;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    me: () => request<AuthUser & { lastLoginAt: string | null }>('/auth/me'),

    logout: () =>
      request<{ success: boolean }>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: tokenStore.refresh ?? '' }),
      }),

    changePassword: (currentPassword: string, newPassword: string) =>
      request<{ success: boolean }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  },

  options: () => request<GeneratorOptions>('/blogs/options'),

  generate: (payload: GenerateRequest) =>
    request<{ id: string; status: string }>('/blogs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  list: (
    params: {
      search?: string;
      status?: string;
      reviewStatus?: string;
      take?: number;
    } = {},
  ) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.reviewStatus) query.set('reviewStatus', params.reviewStatus);
    if (params.take) query.set('take', String(params.take));
    const qs = query.toString();
    return request<{
      total: number;
      reviewCounts: { pending: number; approved: number; rejected: number };
      items: BlogSummary[];
    }>(`/blogs${qs ? `?${qs}` : ''}`);
  },

  approve: (id: string, note?: string) =>
    request<{ reviewStatus: string; reviewNote: string | null }>(
      `/blogs/${id}/approve`,
      { method: 'POST', body: JSON.stringify({ note }) },
    ),

  reject: (id: string, note?: string) =>
    request<{ reviewStatus: string; reviewNote: string | null }>(
      `/blogs/${id}/reject`,
      { method: 'POST', body: JSON.stringify({ note }) },
    ),

  reopen: (id: string) =>
    request<{ reviewStatus: string }>(`/blogs/${id}/reopen`, { method: 'POST' }),

  history: (id: string) => request<AuditEntry[]>(`/blogs/${id}/history`),

  get: (id: string) => request<BlogDetail>(`/blogs/${id}`),

  remove: (id: string) =>
    request<{ id: string; deleted: boolean }>(`/blogs/${id}`, { method: 'DELETE' }),

  regenerateImage: (id: string, imageId: string) =>
    request<{ id: string; url: string }>(`/blogs/${id}/images/${imageId}/regenerate`, {
      method: 'POST',
    }),

  exportUrl: (id: string, format: 'md' | 'html' | 'json') =>
    `${API_URL}/blogs/${id}/export?format=${format}`,

  streamUrl: (id: string) => `${API_URL}/blogs/${id}/stream`,

  keywordSets: {
    list: () => request<{ total: number; items: KeywordSet[] }>('/keyword-sets'),

    create: (payload: KeywordSetInput) =>
      request<KeywordSet>('/keyword-sets', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    update: (id: string, payload: Partial<KeywordSetInput>) =>
      request<KeywordSet>(`/keyword-sets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),

    remove: (id: string) =>
      request<{ id: string; deleted: boolean }>(`/keyword-sets/${id}`, {
        method: 'DELETE',
      }),
  },

  knowledge: {
    list: () => request<KnowledgeList>('/knowledge'),

    add: (payload: { urls: string[]; discoverLinks: boolean; maxPages: number }) =>
      request<{ queued: number; created: number }>('/knowledge', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    profile: () => request<KnowledgeProfile>('/knowledge/profile'),

    rebuildProfile: () =>
      request<KnowledgeProfile>('/knowledge/profile/rebuild', { method: 'POST' }),

    recrawl: (id: string) =>
      request<unknown>(`/knowledge/${id}/recrawl`, { method: 'POST' }),

    remove: (id: string) =>
      request<{ id: string; deleted: boolean }>(`/knowledge/${id}`, {
        method: 'DELETE',
      }),

    clear: () => request<{ deleted: number }>('/knowledge/all', { method: 'DELETE' }),
  },
};
