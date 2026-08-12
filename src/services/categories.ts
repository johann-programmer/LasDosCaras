// src/services/categories.ts
import { apiFetch } from './api';

export interface Category {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export const getCategories = (): Promise<Category[]> => {
  return apiFetch<Category[]>('/categories');
};