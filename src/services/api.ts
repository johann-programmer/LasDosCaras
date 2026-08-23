const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) throw new Error("Error en la API");

  return res.json();
}