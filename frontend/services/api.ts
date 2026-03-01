const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const PHP_API_BASE = import.meta.env.VITE_PHP_API_URL || API_BASE;

const TOKEN_KEY = 'ng_auth_token';
const USER_KEY = 'ng_auth_user';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user: unknown) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clearUser: () => localStorage.removeItem(USER_KEY)
};

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function apiFetchWithBase<T>(baseUrl: string, path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const isFormDataBody =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (!isFormDataBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (isFormDataBody && headers.has('Content-Type')) {
    headers.delete('Content-Type');
  }
  const token = authStorage.getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers
  });

  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Response is not valid JSON (e.g. rate-limit plain text)
    if (!response.ok) {
      throw new ApiError(text || 'Request failed', response.status, null);
    }
    throw new ApiError('Invalid server response', response.status, null);
  }

  if (!response.ok) {
    const message = data?.error || data?.message || 'Request failed';
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  return apiFetchWithBase<T>(API_BASE, path, options);
}

export async function apiFetchPhp<T>(path: string, options: RequestInit = {}): Promise<T> {
  return apiFetchWithBase<T>(PHP_API_BASE, path, options);
}
