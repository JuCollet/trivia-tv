// Minimal HTTP client for request/response data.
// Real-time game state goes through Socket.IO, not here.

// Without a configured URL, calls fall back to the mock data.
export const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') ?? null;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  if (!API_URL) throw new Error('EXPO_PUBLIC_API_URL non défini');

  const response = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) throw new ApiError(response.status, `GET ${path} : ${response.status}`);
  return response.json() as Promise<T>;
}
