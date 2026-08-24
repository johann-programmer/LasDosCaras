// src/services/cacheService.ts

const HISTORY_KEY = 'lasdoscaras_history';
const MAX_HISTORY = 20;

interface CacheItem<T> {
  value: T;
  expiry: number;
}

export const cacheService = {
  setWithExpiry: <T>(key: string, value: T, ttlMs: number): void => {
    const item: CacheItem<T> = {
      value,
      expiry: Date.now() + ttlMs,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  getWithExpiry: <T>(key: string): T | null => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item: CacheItem<T> = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch {
      return null;
    }
  },

  addToHistory: (viewId: string): void => {
    try {
      const historyStr = localStorage.getItem(HISTORY_KEY);
      let history: string[] = historyStr ? JSON.parse(historyStr) : [];

      history = history.filter((id) => id !== viewId);
      history.unshift(viewId);

      if (history.length > MAX_HISTORY) {
        history = history.slice(0, MAX_HISTORY);
      }

      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error al actualizar el historial local', error);
    }
  },

  getHistory: (): string[] => {
    try {
      const historyStr = localStorage.getItem(HISTORY_KEY);
      return historyStr ? JSON.parse(historyStr) : [];
    } catch {
      return [];
    }
  },
};