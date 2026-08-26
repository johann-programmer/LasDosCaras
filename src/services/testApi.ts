import { apiFetch } from './api';

export const testConnection = async () => {
  try {
    const data = await apiFetch('/categories');
    console.log('✅ Conexión exitosa con la API:', data);
    return data;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
};