export async function apiFetch(path: string, init: RequestInit = {}) {
  const key = localStorage.getItem('openai-api-key') ?? '';
  const headers: HeadersInit = key
    ? { ...(init.headers ?? {}), 'X-OPENAI-API-KEY': key }
    : init.headers ?? {};

  const baseUrl = import.meta.env.VITE_API_URL ?? '';
  return fetch(`${baseUrl}${path}`, { ...init, headers });
}
