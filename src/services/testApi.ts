import { apiFetch } from './api';

export const testConnection = async () => {
  try {
    // Probamos con la ruta común /api/categories
    const data = await apiFetch('/api/categories');
    console.log('✅ Conexión exitosa con la API:', data);
    return data;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
};