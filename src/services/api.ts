const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const apiFetch = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  // 1. Obtener JWT almacenado
  const authData = localStorage.getItem('lasdoscaras_auth');
  const token = authData ? JSON.parse(authData).token : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 2. Manejar token expirado / no autorizado
    if (response.status === 401) {
      localStorage.removeItem('lasdoscaras_auth');
      window.location.href = '/login';
      throw new Error('Su sesión ha expirado.');
    }

    // 3. Manejar errores HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        data: errorData,
        message: errorData.message || 'Ocurrió un error en la solicitud.',
      };
    }

    return await response.json();
  } catch (error: any) {
    if (error.name === 'TypeError') {
      throw new Error('No fue posible conectar con el servidor. Verifique su conexión e intente de nuevo.');
    }
    throw error;
  }
};