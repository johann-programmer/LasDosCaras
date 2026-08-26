const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      body?.error ||
      body?.message ||
      body?.details?.[0]?.message ||
      'Error en la API';
    throw new Error(message);
  }

  return body as T;
}
